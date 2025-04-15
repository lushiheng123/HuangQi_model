import requests

def test_api():
    BASE_URL = "http://127.0.0.1:5000"
    
    print("=== 测试获取可用模型列表 ===")
    response = requests.get(f"{BASE_URL}/api/astragalus/models")
    print("可用模型:", response.json())
    print()

    print("=== 测试黄芪预测（默认模型）===")
    data = {
        "root_length": 10.5,
        "yield": 200.0,
        "c7g_content": 0.8
    }
    response = requests.post(f"{BASE_URL}/api/astragalus/predict", json=data)
    print("默认模型预测结果:", response.json())
    print()

    print("=== 测试黄芪预测（指定RandomForest模型）===")
    data["model_name"] = "RandomForest"
    response = requests.post(f"{BASE_URL}/api/astragalus/predict", json=data)
    print("RandomForest模型预测结果:", response.json())
    print()

    print("=== 测试气候预测 ===")
    climate_data = {
        "bio1": 15.0,
        "bio12": 1200.0,
        "bio3": 0.5,
        "bio5": 30.0,
        "bio7": 20.0
    }
    response = requests.post(f"{BASE_URL}/api/climate/predict", json=climate_data)
    print("气候预测结果:", response.json())

if __name__ == "__main__":
    test_api()