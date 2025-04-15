import pandas as pd
import pickle
import os
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.model_selection import cross_validate
from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.neural_network import MLPRegressor
from xgboost import XGBRegressor

# 常量定义
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
RESULTS_PATH = os.path.join(BASE_DIR, "model_comparison.csv")
DATA_PATH = os.path.join(BASE_DIR, "final_input.csv")

# 确保模型保存目录存在
os.makedirs(MODELS_DIR, exist_ok=True)

def train_and_compare_models():
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
    
    # 定义对比模型
    models = {
        "XGBoost": XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        ),
        "RandomForest": RandomForestRegressor(
            n_estimators=100,
            max_depth=3,
            min_samples_split=5,
            random_state=42
        ),
        "KNN": KNeighborsRegressor(
            n_neighbors=3,
            weights='distance'
        ),
        "ANN": MLPRegressor(
            hidden_layer_sizes=(10,),
            activation='relu',
            solver='adam',
            max_iter=1000,
            early_stopping=True,
            random_state=42
        )
    }

    # 结果存储
    results = []
    
    for model_name, estimator in models.items():
        print(f"\n=== 正在训练 {model_name} ===")
        
        # 构建管道
        pipe = Pipeline([
            ('poly', PolynomialFeatures(degree=2, include_bias=False)),
            ('scaler', StandardScaler()),
            ('model', estimator)
        ])
        
        # 交叉验证
        cv_results = cross_validate(
            pipe, X, y,
            cv=5,
            scoring=('r2', 'neg_root_mean_squared_error'),
            return_train_score=True,
            n_jobs=-1
        )
        
        # 记录结果
        model_results = {
            'Model': model_name,
            'Train_R2_mean': cv_results['train_r2'].mean(),
            'Test_R2_mean': cv_results['test_r2'].mean(),
            'Train_RMSE_mean': (-cv_results['train_neg_root_mean_squared_error']).mean(),
            'Test_RMSE_mean': (-cv_results['test_neg_root_mean_squared_error']).mean()
        }
        results.append(model_results)
        
        # 完整训练并保存
        print("训练最终模型...")
        pipe.fit(X, y)
        model_path = os.path.join(MODELS_DIR, f"{model_name}_model.pkl")
        with open(model_path, 'wb') as f:
            pickle.dump(pipe, f)
        print(f"模型已保存至 {model_path}")

    # 保存对比结果
    pd.DataFrame(results).to_csv(RESULTS_PATH, index=False)
    print(f"\n模型对比结果已保存至 {RESULTS_PATH}")

class AstragalusPredictor:
    def __init__(self, model_name="XGBoost"):
        self.model_name = model_name
        self.models = {}
        try:
            for name in ["XGBoost", "RandomForest", "KNN", "ANN"]:
                model_path = os.path.join(MODELS_DIR, f"{name}_model.pkl")
                with open(model_path, 'rb') as f:
                    self.models[name] = pickle.load(f)
            self.is_loaded = True
        except FileNotFoundError:
            self.is_loaded = False
            print("警告: 未找到模型文件，请先训练模型")

    def predict(self, input_data, model_name=None):
        if not self.is_loaded:
            return {"error": "模型未加载"}
        
        model_name = model_name or self.model_name
        if model_name not in self.models:
            return {"error": f"无效模型名称，可选: {list(self.models.keys())}"}
        
        try:
            input_df = pd.DataFrame([{
                '2022 Root length (cm)': input_data['root_length'],
                '2022 Root yields (kg/mu)': input_data['yield'],
                '2022 Calycosin-7-glucoside (C7G) content (%)': input_data['c7g_content']
            }])
            
            model = self.models[model_name]
            pred = float(model.predict(input_df)[0])
            
            return {
                "model_used": model_name,
                "seed_id": int(round(pred)),
                "confidence": 0.95,  # 可替换为实际置信度计算
            }
        except Exception as e:
            return {"error": f"预测失败: {str(e)}"}

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', action='store_true', help="训练并保存所有模型")
    parser.add_argument('--predict', nargs=4, metavar=('MODEL', 'ROOT_LEN', 'YIELD', 'C7G'), 
                       help="指定模型预测，参数: 模型名 根长 产量 C7G含量")
    args = parser.parse_args()

    if args.train:
        train_and_compare_models()
    elif args.predict:
        model_name, root_len, yield_, c7g = args.predict
        predictor = AstragalusPredictor()
        result = predictor.predict({
            'root_length': float(root_len),
            'yield': float(yield_),
            'c7g_content': float(c7g)
        }, model_name=model_name)
        print("预测结果:", result)
    else:
        print("请指定运行模式：")
        print("  --train              训练所有模型")
        print("  --predict MODEL_NAME ROOT_LEN YIELD C7G  使用指定模型预测")
