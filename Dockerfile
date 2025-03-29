# 使用官方 Python 基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制项目文件到容器中
COPY . /app

# 安装依赖库
RUN pip install --no-cache-dir -r requirements.txt

# 暴露 Flask 默认端口
EXPOSE 5000

# 启动 Flask 应用
CMD ["python", "api.py"]
