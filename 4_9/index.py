import pandas as pd
from sklearn.neural_network import MLPRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.feature_selection import SelectKBest, f_regression
import numpy as np

# 1. 数据准备与特征工程
def load_and_preprocess(file_path):
    """加载数据并进行预处理"""
    data = pd.read_csv(file_path, sep='\t')  # 假设是制表符分隔

    # 确认关键列存在
    required_cols = ['Lat', 'Lon'] + [f'bio{i}' for i in range(1, 20)]
    assert all(col in data.columns for col in required_cols), "缺少必需的气候因子列"

    return data

# 2. 特征选择
def select_features(X, y):
    """选择与目标变量最相关的环境因子"""
    selector = SelectKBest(f_regression, k=8)  # 选择前8个相关特征
    X_selected = selector.fit_transform(X, y)
    return X_selected, selector.get_support()

# 3. 构建并评估模型（含训练集和测试集指标）
def build_optimized_models(X, y):
    """构建三种优化后的预测模型，并评估训练集与测试集效果"""
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42)

    models = {
        'ANN': GridSearchCV(
            MLPRegressor(max_iter=2000, random_state=42),  # 增加最大迭代次数
            param_grid={'hidden_layer_sizes': [(50,), (100,), (50, 50)]},
            cv=5
        ),
        'KNN': GridSearchCV(
            KNeighborsRegressor(),
            param_grid={'n_neighbors': [3, 5, 7]},
            cv=5
        ),
        'RF': GridSearchCV(
            RandomForestRegressor(random_state=42),
            param_grid={'n_estimators': [100, 300], 'max_features': [5, 10]},
            cv=5
        )
    }

    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)

        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)

        # 修改RMSE的计算方式
        train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
        test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))

        results[name] = {
            'train_r2': r2_score(y_train, y_train_pred),
            'train_rmse': train_rmse,
            'test_r2': r2_score(y_test, y_test_pred),
            'test_rmse': test_rmse,
            'best_params': model.best_params_
        }

    return results

# 4. 主分析流程
def analyze_climate_impact(data_path):
    """分析气候因子对黄芪指标的影响"""
    data = load_and_preprocess(data_path)
    target_cols = [col for col in data.columns if col.startswith(('2022', '2023'))]

    final_results = {}
    for target in target_cols:
        print(f"\n=== 分析目标变量: {target} ===")

        X = data[['Lat', 'Lon'] + [f'bio{i}' for i in range(1, 20)]]
        y = data[target]

        # 特征选择
        X_selected, selected_mask = select_features(X, y)
        selected_features = X.columns[selected_mask]
        print(f"关键环境因子: {list(selected_features)}")

        # 模型训练与评估
        metrics = build_optimized_models(X_selected, y)

        # 存储结果
        final_results[target] = {
            'selected_features': selected_features.tolist(),
            'models': metrics
        }

        # 打印模型表现
        for model, res in metrics.items():
            print(f"\n{model}：")
            print(f"  训练集 -> R² = {res['train_r2']:.3f}, RMSE = {res['train_rmse']:.3f}")
            print(f"  测试集 -> R² = {res['test_r2']:.3f}, RMSE = {res['test_rmse']:.3f}")
            print(f"  最佳参数：{res['best_params']}")

    return final_results

# 5. 运行分析
if __name__ == "__main__":
    results = analyze_climate_impact("final.input.txt")