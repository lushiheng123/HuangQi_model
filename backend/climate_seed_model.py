# -*- coding: utf-8 -*-
"""
climate_seed_model.py
完整训练和预测实现（命令行版）
功能：
1. 训练模型并保存到.pkl文件
2. 加载模型进行预测
3. 保存和加载特征选择器及特征名称
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
import argparse
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 常量定义
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 当前脚本所在目录
MODEL_PATH = os.path.join(BASE_DIR, "climate_seed_model.pkl")  # 模型保存路径
SELECTOR_PATH = os.path.join(BASE_DIR, "climate_selector.pkl")  # 特征选择器保存路径
FEATURE_NAMES_PATH = os.path.join(BASE_DIR, "climate_features.json")  # 特征名称保存路径
DATA_PATH = os.path.join(BASE_DIR, "final.input.txt")  # 数据文件路径

class ClimateSeedModel:
    def __init__(self):
        """初始化模型和特征选择器"""
        self.model = None
        self.selector = None
        self.feature_names = None
        self.all_feature_names = None  # 保存所有特征名称
        self.is_loaded = False  # 添加 is_loaded 属性，与 AstragalusPredictor 保持一致

    def train(self):
        """完整训练流程"""
        # 加载数据
        data = pd.read_csv(DATA_PATH, sep='\t')
        climate_data = data.iloc[:, 4:23]  # bio1-bio19列
        target = data['source']
        print(f"数据加载成功，样本数: {data.shape[0]}")

        print("\n正在进行特征选择...")
        self.selector = SelectKBest(f_classif, k=5)
        X_selected = self.selector.fit_transform(climate_data, target)
        self.feature_names = climate_data.columns[self.selector.get_support()].tolist()
        self.all_feature_names = climate_data.columns.tolist()  # 保存所有特征名称

        # 划分数据集
        X_train, X_test, y_train, y_test = train_test_split(
            X_selected, target, test_size=0.2, random_state=42)

        print("\n训练模型中...")
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_split=3,
            random_state=42
        )
        self.model.fit(X_train, y_train)

        # 评估模型
        train_acc = accuracy_score(y_train, self.model.predict(X_train))
        test_acc = accuracy_score(y_test, self.model.predict(X_test))
        print(f"\n训练准确率: {train_acc:.2%}")
        print(f"测试准确率: {test_acc:.2%}")

        # 保存模型和选择器
        self._save_models()
        print(f"\n关键气候因子: {self.feature_names}")
        print(f"模型已保存至 {MODEL_PATH}")

    def predict(self, input_data):
        """预测种子编号"""
        if not self.is_loaded:
            return {"error": "模型未加载"}

        print(f"预期关键特征: {self.feature_names}")
        print(f"所有特征: {self.all_feature_names}")
        print(f"输入数据: {input_data}")

        try:
            # 构造完整的特征集，缺失的特征填充为0
            full_input = {feature: 0.0 for feature in self.all_feature_names}
            full_input.update(input_data)  # 用提供的特征值覆盖
            df = pd.DataFrame([full_input])
            print(f"输入DataFrame列: {df.columns.tolist()}")

            # 应用特征选择
            X = df[self.all_feature_names]  # 确保列顺序与训练时一致
            X_selected = self.selector.transform(X)
        except Exception as e:
            print(f"输入数据错误: {str(e)}")
            return {"error": f"预测失败: {str(e)}"}

        pred = int(self.model.predict(X_selected)[0])  # 转换为 Python int
        proba = float(self.model.predict_proba(X_selected).max())  # 转换为 Python float

        return {
            "seed_id": pred,
            "confidence": round(proba, 4),
            "key_factors": self.feature_names
        }

    def _save_models(self):
        """保存模型和选择器"""
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(self.model, f)
        with open(SELECTOR_PATH, 'wb') as f:
            pickle.dump(self.selector, f)
        with open(FEATURE_NAMES_PATH, 'w') as f:
            json.dump({
                "selected_features": self.feature_names,
                "all_features": self.all_feature_names
            }, f)
        print(f"特征选择器已保存至 {SELECTOR_PATH}")
        print(f"特征名称已保存至 {FEATURE_NAMES_PATH}")

    def _load_models(self):
        """加载模型和选择器"""
        try:
            with open(MODEL_PATH, 'rb') as f:
                self.model = pickle.load(f)
            with open(SELECTOR_PATH, 'rb') as f:
                self.selector = pickle.load(f)
            with open(FEATURE_NAMES_PATH, 'r') as f:
                data = json.load(f)
                self.feature_names = data["selected_features"]
                self.all_feature_names = data["all_features"]
            print(f"模型加载成功，特征: {self.feature_names}")
            self.is_loaded = True
            return True
        except FileNotFoundError as e:
            self.is_loaded = False
            print(f"警告: 未找到模型文件，请先训练模型: {str(e)}")
            return False

def load_feature_names():
    """加载保存的特征名称"""
    try:
        with open(FEATURE_NAMES_PATH, 'r') as f:
            data = json.load(f)
            return data["selected_features"]
    except FileNotFoundError:
        return None

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='气候因子-种子编号预测模型')
    parser.add_argument('--train', action='store_true', help="训练并保存模型")
    parser.add_argument('--predict', action='store_true', help="使用模型预测")
    
    # 在解析参数前加载特征名称
    feature_names = load_feature_names()
    if feature_names:
        for feature in feature_names:
            parser.add_argument(f'--{feature}', type=float, help=f'{feature} value')

    args = parser.parse_args()
    model = ClimateSeedModel()

    if args.train:
        model.train()
    elif args.predict:
        if not feature_names:
            print("错误: 请先运行 '--train' 命令以生成模型和特征文件")
            exit(1)

        # 构建输入数据
        input_data = {}
        for feature in feature_names:
            value = getattr(args, feature, None)
            if value is None:
                print(f"错误: 缺少特征 {feature} 的值，请使用 --{feature} 指定")
                exit(1)
            input_data[feature] = value

        # 加载模型并预测
        model._load_models()
        result = model.predict(input_data)
        if result and "error" not in result:
            print("\n预测结果:")
            print(f"种子编号: {result['seed_id']}")
            print(f"可信度: {result['confidence']:.2%}")
            print(f"关键气候因子: {result['key_factors']}")
        else:
            print(f"预测失败: {result.get('error', '未知错误')}")
    else:
        print("请指定运行模式：--train 或 --predict")
        parser.print_help()