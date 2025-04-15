import pandas as pd
import pickle
import os
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from xgboost import XGBRegressor
from sklearn.inspection import permutation_importance
from sklearn.model_selection import cross_validate

# 常量定义
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "astragalus_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
FEATURE_IMPORTANCE_PATH = os.path.join(BASE_DIR, "feature_importance.csv")
DATA_PATH = os.path.join(BASE_DIR, "final_input.csv")

def train_and_save_model():
    # 加载数据
    data = pd.read_csv(DATA_PATH)
    print(f"数据加载成功，样本数: {data.shape[0]}")
    
    # 定义特征和目标
    numeric_features = [
        '2022 Root length (cm)',
        '2022 Root yields (kg/mu)',
        '2022 Calycosin-7-glucoside (C7G) content (%)'
    ]
    X = data[numeric_features]
    y = data['source']
    
    # 构建预处理管道
    preprocessor = ColumnTransformer(
        transformers=[
            ('poly', PolynomialFeatures(degree=2, include_bias=False), numeric_features),
            ('scaler', StandardScaler(), numeric_features)
        ])
    
    # 构建完整管道
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', XGBRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=5,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        ))
    ])
    
    # 交叉验证评估
    print("\n正在进行交叉验证...")
    cv_results = cross_validate(
        model, X, y,
        cv=5,
        scoring=('r2', 'neg_root_mean_squared_error'),
        return_train_score=True
    )
    print(f"平均训练R²: {cv_results['train_r2'].mean():.3f}")
    print(f"平均测试R²: {cv_results['test_r2'].mean():.3f}")
    
    # 完整训练
    print("\n训练最终模型...")
    model.fit(X, y)
    
    # 特征重要性分析
    print("\n分析特征重要性...")
    perm_importance = permutation_importance(model, X, y, n_repeats=10, random_state=42)
    
    # 保存结果
    print("\n保存模型和结果...")
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    feature_importance = pd.DataFrame({
        'feature': numeric_features,
        'importance': perm_importance.importances_mean
    }).sort_values('importance', ascending=False)
    feature_importance.to_csv(FEATURE_IMPORTANCE_PATH, index=False)
    
    print(f"\n模型已保存到 {MODEL_PATH}")
    print(f"特征重要性已保存到 {FEATURE_IMPORTANCE_PATH}")

class AstragalusPredictor:
    def __init__(self):
        try:
            with open(MODEL_PATH, 'rb') as f:
                self.model = pickle.load(f)
            self.feature_importance = pd.read_csv(FEATURE_IMPORTANCE_PATH)
            self.is_loaded = True
        except FileNotFoundError:
            self.is_loaded = False
            print("警告: 未找到模型文件，请先训练模型")
    
    def predict(self, input_data):
        if not self.is_loaded:
            return {"error": "模型未加载"}
        
        try:
            # 准备输入数据
            input_df = pd.DataFrame([{
                '2022 Root length (cm)': input_data['root_length'],
                '2022 Root yields (kg/mu)': input_data['yield'],
                '2022 Calycosin-7-glucoside (C7G) content (%)': input_data['c7g_content']
            }])
            
            # 预测
            pred = float(self.model.predict(input_df)[0])
            
            return {
                "seed_id": int(round(pred)),  # 种子ID应为整数
                "confidence": 0.95,  # 示例值，实际可替换为模型预测概率
                "feature_importance": self.feature_importance.to_dict('records')
            }
        except Exception as e:
            return {"error": f"预测失败: {str(e)}"}

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', action='store_true', help="训练并保存模型")
    parser.add_argument('--predict', nargs=3, metavar=('ROOT_LEN', 'YIELD', 'C7G'), 
                       help="使用模型预测，参数: 根长 产量 C7G含量")
    args = parser.parse_args()

    if args.train:
        train_and_save_model()
    elif args.predict:
        predictor = AstragalusPredictor()
        result = predictor.predict({
            'root_length': float(args.predict[0]),
            'yield': float(args.predict[1]),
            'c7g_content': float(args.predict[2])
        })
        print("预测结果:", result)
    else:
        print("请指定运行模式：--train 或 --predict ROOT_LEN YIELD C7G")
