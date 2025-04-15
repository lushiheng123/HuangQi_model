from flask import Flask, request, jsonify
from flask_cors import CORS
from astragalus_predictor import AstragalusPredictor
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
        result = astragalus_predictor.predict({
            'root_length': float(data['root_length']),
            'yield': float(data['yield']),
            'c7g_content': float(data['c7g_content'])
        })
        return jsonify(result)
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