import pandas as pd

# 读取原始TXT文件
df = pd.read_csv("final.input.txt", sep='\t', encoding='utf-8')

# 保存为CSV文件
df.to_csv("final_input.csv", index=False, encoding='utf-8')