# -*- coding: utf-8 -*-
"""
完整版代码：astragalus_predictor.py
功能：
1. 训练模型并保存到.pkl文件
2. 加载模型进行预测
3. 包含标准化器保存
"""

import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 常量定义
MODEL_PATH = "c:/Users/74721/Desktop/gitRepo/项目/backend/astragalus_model.pkl"  # 模型保存路径
SCALER_PATH = "c:/Users/74721/Desktop/gitRepo/项目/backend/scaler.pkl"           # 标准化器保存路径
DATA_PATH = "final.input.txt"        # 数据文件路径

def train_and_save_model():
    """训练模型并保存到文件"""
    # 加载数据（使用您原有的load_data函数）
    data = pd.read_csv(DATA_PATH, sep='\t')
    print(f"数据加载成功，样本数: {data.shape[0]}")
    
    # 准备特征（修改为使用您需要的特定特征）
    feature_columns = [
        '2022 Root length (cm)',
        '2022 Root yields (kg/mu)',
        '2022 Calycosin-7-glucoside (C7G) content (%)'
    ]
    X = data[feature_columns]
    y = data['source']
    
    # 数据标准化
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 划分数据集
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42)
    
    # 训练模型（优化参数版）
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=7,
        min_samples_split=5,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # 评估模型
    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc = accuracy_score(y_test, model.predict(X_test))
    print(f"训练准确率: {train_acc:.2%}")
    print(f"测试准确率: {test_acc:.2%}")
    
    # 保存模型和标准化器
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"模型已保存到 {MODEL_PATH}")
    print(f"标准化器已保存到 {SCALER_PATH}")

class AstragalusPredictor:
    """预测器类（可直接集成到您的后端）"""
    def __init__(self):
        try:
            # 加载模型和标准化器
            with open(MODEL_PATH, 'rb') as f:
                self.model = pickle.load(f)
            with open(SCALER_PATH, 'rb') as f:
                self.scaler = pickle.load(f)
            self.is_loaded = True
        except FileNotFoundError:
            self.is_loaded = False
            print("警告: 未找到模型文件，请先训练模型")
    
    def predict(self, input_data):
        """预测种子编号"""
        if not self.is_loaded:
            return {"error": "模型未加载"}
        
        try:
            # 转换输入数据
            features = pd.DataFrame([{
                '2022 Root length (cm)': input_data['root_length'],
                '2022 Root yields (kg/mu)': input_data['yield'],
                '2022 Calycosin-7-glucoside (C7G) content (%)': input_data['c7g_content']
            }])
            
            # 标准化
            scaled = self.scaler.transform(features)
            
            # 预测
            pred = int(self.model.predict(scaled)[0])  # 转换为 Python int
            proba = float(self.model.predict_proba(scaled).max())  # 转换为 Python float
            
            return {
                "seed_id": pred,
                "confidence": round(proba, 4)
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
