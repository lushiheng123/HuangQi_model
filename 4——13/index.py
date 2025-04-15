import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# 读取数据
df = pd.read_csv("final_input.csv")

# 选择目标变量（修改此处更换指标）
target_column = "2023 Root length (cm)"  # 示例：2023年根长
year = target_column.split()[0]          # 提取年份
metric = " ".join(target_column.split()[1:])  # 提取指标名称

# 准备画布
plt.figure(figsize=(15, 6))
sns.set_style("whitegrid")

# 绘制箱型图
boxplot = sns.boxplot(
    x="source",
    y=target_column,
    data=df,
    color="skyblue",
    showmeans=True,            # 显示均值标记
    meanprops={"marker":"o", "markerfacecolor":"white", "markeredgecolor":"red"}
)

# 添加样本数标注
for i in df["source"].unique():
    sample_count = len(df[df["source"] == i])
    boxplot.text(
        i-1, 
        df[target_column].max()*1.03,
        f'n={sample_count}',
        ha='center'
    )

# 美化图表
plt.title(f"箱型图 - {year}年 {metric}", fontsize=14, pad=20)
plt.xlabel("样点编号", fontsize=12)
plt.ylabel(metric, fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()

plt.show()
