import requests

# 测试 /api/astragalus/predict
url = "http://127.0.0.1:5000/api/astragalus/predict"
data = {
    "root_length": 10.5,
    "yield": 200.0,
    "c7g_content": 0.8
}
response = requests.post(url, json=data)
print(response.json())

# 测试 /api/climate/predict
url = "http://127.0.0.1:5000/api/climate/predict"
data = {
    "bio1": 15.0,
    "bio12": 1200.0,
    "bio3": 0.5,
    "bio5": 30.0,
    "bio7": 20.0
}
response = requests.post(url, json=data)
print(response.json())