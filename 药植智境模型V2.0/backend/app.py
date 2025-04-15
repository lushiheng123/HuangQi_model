from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from astragalus_predictor import AstragalusPredictor, RESULTS_PATH
from climate_seed_model import ClimateSeedModel

app = Flask(__name__)
CORS(app)

# 初始化两个预测器
astragalus_predictor = AstragalusPredictor()
if not astragalus_predictor.is_loaded:
    raise RuntimeError("产量预测模型未加载，请先生成模型文件")

climate_predictor = ClimateSeedModel()
if not climate_predictor._load_models():
    raise RuntimeError("气象预测模型未加载，请先生成模型文件")

@app.route('/api/astragalus/predict', methods=['POST'])
def predict_astragalus():
    """处理根长、产量和C7G含量的预测请求"""
    data = request.json
    try:
        # 从请求中获取模型名称，如果没有提供则使用默认值
        model_name = data.get('model_name', 'XGBoost')
        
        result = astragalus_predictor.predict({
            'root_length': float(data['root_length']),
            'yield': float(data['yield']),
            'c7g_content': float(data['c7g_content'])
        }, model_name=model_name)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/astragalus/models', methods=['GET'])
def get_available_models():
    """获取可用模型列表"""
    try:
        available_models = ["XGBoost", "RandomForest", "KNN", "ANN"]
        return jsonify({
            "models": available_models,
            "default": "XGBoost"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/astragalus/model-metrics', methods=['GET'])
def get_model_metrics():
    """获取所有模型的训练和测试指标"""
    try:
        if not os.path.exists(RESULTS_PATH):
            return jsonify({"error": "模型指标文件不存在"}), 404
        
        # 读取模型比较结果
        df = pd.read_csv(RESULTS_PATH)
        
        # 转换为前端友好的格式
        metrics = []
        for _, row in df.iterrows():
            metrics.append({
                "name": row["Model"],
                "metrics": {
                    "train": {
                        "r2": round(row["Train_R2_mean"] * 100, 2),  # 转换为百分比
                        "rmse": round(row["Train_RMSE_mean"], 4)
                    },
                    "test": {
                        "r2": round(row["Test_R2_mean"] * 100, 2),  # 转换为百分比
                        "rmse": round(row["Test_RMSE_mean"], 4)
                    }
                }
            })
        
        return jsonify({
            "metrics": metrics,
            "description": {
                "r2": "R²得分（越高越好）",
                "rmse": "均方根误差（越低越好）"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/climate/predict', methods=['POST'])
def predict_climate():
    """处理气候因子的预测请求"""
    data = request.json
    try:
        result = climate_predictor.predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)