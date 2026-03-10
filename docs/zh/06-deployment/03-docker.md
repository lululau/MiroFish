# Docker 部署指南

本文档详细介绍如何使用 Docker 和 Docker Compose 部署 MiroFish 应用。

## 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [部署步骤](#部署步骤)
- [容器管理](#容器管理)
- [常见问题](#常见问题)

## 前置要求

在开始之前，请确保你的系统已安装以下工具：

| 工具 | 版本要求 | 说明 | 检查命令 |
|------|---------|------|---------|
| **Docker** | 20.10+ | 容器运行时 | `docker --version` |
| **Docker Compose** | 2.0+ | 容器编排工具 | `docker compose version` |

### 安装 Docker

#### Linux（Ubuntu/Debian）

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install -y ca-certificates curl gnupg

# 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

#### macOS

```bash
# 使用 Homebrew 安装
brew install --cask docker

# 或下载 Docker Desktop
# 访问 https://www.docker.com/products/docker-desktop/
```

#### Windows

1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 运行安装程序
3. 重启计算机
4. 启动 Docker Desktop

### 配置 Docker 用户组（Linux）

```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或运行以下命令
newgrp docker

# 验证（不需要 sudo）
docker ps
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/666ghj/MiroFish.git
cd MiroFish
```

### 2. 配置环境变量

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env 文件，填入必要的 API 密钥
nano .env
```

**必需配置：**

```env
# LLM API（推荐使用阿里百炼平台）
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus

# Zep Cloud
ZEP_API_KEY=your_zep_api_key_here
```

### 3. 启动容器

```bash
# 拉取镜像并启动容器
docker compose up -d
```

### 4. 访问应用

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:5001

## 详细配置

### Dockerfile 解析

项目根目录的 `Dockerfile` 定义了应用的构建过程：

```dockerfile
# 基础镜像：Python 3.11
FROM python:3.11

# 安装 Node.js
RUN apt-get update \
  && apt-get install -y --no-install-recommends nodejs npm \
  && rm -rf /var/lib/apt/lists/*

# 安装 uv（Python 包管理器）
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /bin/

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY backend/pyproject.toml backend/uv.lock ./backend/

# 安装依赖
RUN npm ci \
  && npm ci --prefix frontend \
  && cd backend && uv sync --frozen

# 复制项目源码
COPY . .

# 暴露端口
EXPOSE 3000 5001

# 启动命令
CMD ["npm", "run", "dev"]
```

**说明：**
- 基于 Python 3.11 官方镜像
- 安装 Node.js 和 npm
- 使用 uv 安装 Python 依赖（速度快）
- 使用 npm 安装前端依赖
- 同时启动前后端服务

### docker-compose.yml 解析

项目根目录的 `docker-compose.yml` 定义了服务的运行配置：

```yaml
services:
  mirofish:
    image: ghcr.io/666ghj/mirofish:latest
    # 加速镜像（如拉取缓慢可替换上方地址）
    # image: ghcr.nju.edu.cn/666ghj/mirofish:latest
    container_name: mirofish
    env_file:
      - .env
    ports:
      - "3000:3000"
      - "5001:5001"
    restart: unless-stopped
    volumes:
      - ./backend/uploads:/app/backend/uploads
```

**配置说明：**

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `image` | Docker 镜像名称 | `ghcr.io/666ghj/mirofish:latest` |
| `container_name` | 容器名称 | `mirofish` |
| `env_file` | 环境变量文件 | `.env` |
| `ports` | 端口映射 | `3000:3000`, `5001:5001` |
| `restart` | 重启策略 | `unless-stopped` |
| `volumes` | 挂载卷 | `./backend/uploads:/app/backend/uploads` |

### 镜像加速

如果拉取镜像缓慢，可以使用以下加速镜像：

```yaml
# 南京大学镜像加速
image: ghcr.nju.edu.cn/666ghj/mirofish:latest

# 或使用阿里云镜像加速
# 需要配置 /etc/docker/daemon.json
```

## 部署步骤

### 方式一：使用预构建镜像（推荐）

**优点：**
- 无需构建，直接拉取镜像
- 部署速度快
- 适合生产环境

**步骤：**

```bash
# 1. 配置环境变量
cp .env.example .env
nano .env  # 填入 API 密钥

# 2. 拉取镜像并启动
docker compose up -d

# 3. 查看日志
docker compose logs -f

# 4. 查看运行状态
docker compose ps
```

### 方式二：本地构建镜像

**优点：**
- 使用最新代码
- 自定义修改
- 适合开发环境

**步骤：**

```bash
# 1. 配置环境变量
cp .env.example .env
nano .env  # 填入 API 密钥

# 2. 构建镜像
docker compose build

# 3. 启动容器
docker compose up -d

# 4. 查看日志
docker compose logs -f
```

### 自定义 docker-compose.yml

如果需要自定义配置，可以创建 `docker-compose.override.yml`：

```yaml
services:
  mirofish:
    # 自定义端口映射
    ports:
      - "8080:3000"
      - "8081:5001"
    # 自定义环境变量
    environment:
      - FLASK_DEBUG=False
    # 自定义资源限制
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## 容器管理

### 查看容器状态

```bash
# 查看运行状态
docker compose ps

# 查看资源使用
docker stats mirofish

# 查看容器详情
docker inspect mirofish
```

### 查看日志

```bash
# 查看所有日志
docker compose logs

# 实时跟踪日志
docker compose logs -f

# 查看最近 100 行日志
docker compose logs --tail 100

# 只查看后端日志
docker compose logs | grep backend
```

### 进入容器

```bash
# 进入容器 Shell
docker exec -it mirofish bash

# 查看容器内进程
docker exec mirofish ps aux

# 在容器内执行命令
docker exec mirofish npm --version
```

### 重启容器

```bash
# 重启服务
docker compose restart

# 重启并查看日志
docker compose restart && docker compose logs -f
```

### 停止容器

```bash
# 停止服务
docker compose stop

# 停止并删除容器
docker compose down

# 停止并删除容器、卷、镜像
docker compose down --volumes --rmi all
```

### 更新容器

```bash
# 拉取最新镜像
docker compose pull

# 重新构建镜像
docker compose build

# 重启服务
docker compose up -d
```

## 生产环境部署

### 使用 Nginx 反向代理

创建 `nginx.conf`：

```nginx
upstream mirofish_frontend {
    server localhost:3000;
}

upstream mirofish_backend {
    server localhost:5001;
}

server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://mirofish_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://mirofish_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 使用 HTTPS

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 数据持久化

确保重要数据持久化到宿主机：

```yaml
services:
  mirofish:
    volumes:
      # 上传文件
      - ./backend/uploads:/app/backend/uploads
      # 模拟数据
      - ./backend/uploads/simulations:/app/backend/uploads/simulations
      # 日志文件
      - ./logs:/app/logs
```

### 资源限制

```yaml
services:
  mirofish:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### 健康检查

```yaml
services:
  mirofish:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 多环境部署

### 开发环境

`docker-compose.dev.yml`:

```yaml
services:
  mirofish:
    environment:
      - FLASK_DEBUG=True
      - FLASK_HOST=0.0.0.0
    volumes:
      - ./backend:/app/backend
      - ./frontend:/app/frontend
```

启动：
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 生产环境

`docker-compose.prod.yml`:

```yaml
services:
  mirofish:
    environment:
      - FLASK_DEBUG=False
      - FLASK_HOST=0.0.0.0
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

启动：
```bash
docker compose -f docker-compose.prod.yml up -d
```

## 常见问题

### Q1: 容器启动失败

**问题：** `docker compose up -d` 后容器立即退出

**解决方案：**
```bash
# 查看详细日志
docker compose logs

# 检查配置文件
cat .env

# 检查端口占用
lsof -i :3000
lsof -i :5001

# 重新构建
docker compose build --no-cache
docker compose up -d
```

### Q2: 镜像拉取缓慢

**问题：** `docker compose pull` 速度很慢

**解决方案：**
```bash
# 使用加速镜像
# 编辑 docker-compose.yml，使用南京大学镜像
image: ghcr.nju.edu.cn/666ghj/mirofish:latest

# 或配置 Docker 镜像加速
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### Q3: 端口冲突

**问题：** 端口 3000 或 5001 已被占用

**解决方案：**
```bash
# 修改端口映射
# 编辑 docker-compose.yml
ports:
  - "8080:3000"  # 前端使用 8080
  - "8081:5001"  # 后端使用 8081
```

### Q4: 权限问题

**问题：** 容器内无法写入挂载目录

**解决方案：**
```bash
# 修改目录权限
sudo chown -R $USER:$USER ./backend/uploads
chmod -R 755 ./backend/uploads

# 或在 docker-compose.yml 中配置用户
services:
  mirofish:
    user: "${UID}:${GID}"
```

### Q5: 环境变量未生效

**问题：** 容器内读取不到环境变量

**解决方案：**
```bash
# 确保 .env 文件格式正确
cat .env

# 检查文件权限
ls -la .env

# 在 docker-compose.yml 中明确指定
services:
  mirofish:
    env_file:
      - .env
    environment:
      - LLM_API_KEY=${LLM_API_KEY}
```

### Q6: 内存不足

**问题：** 容器因内存不足被杀

**解决方案：**
```bash
# 增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 限制容器内存
services:
  mirofish:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Q7: 无法访问宿主机服务

**问题：** 容器内无法访问宿主机上的数据库等

**解决方案：**
```bash
# Linux: 使用 host.docker.internal
# 或使用宿主机 IP（通常是 172.17.0.1）

# Mac/Windows: 使用 host.docker.internal
```

### Q8: 日志文件过大

**问题：** Docker 日志占用过多磁盘空间

**解决方案：**
```yaml
services:
  mirofish:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

清理日志：
```bash
docker system prune -a
```

## 性能优化

### 1. 使用多阶段构建

优化 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 运行阶段
FROM python:3.11
# ... 其他配置
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
```

### 2. 缓存依赖

充分利用 Docker 构建缓存：

```dockerfile
# 先复制依赖文件
COPY package.json package-lock.json ./
RUN npm ci

# 再复制源码
COPY . .
```

### 3. 减小镜像大小

```dockerfile
# 清理缓存
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 使用 .dockerignore
echo "node_modules" >> .dockerignore
echo "__pycache__" >> .dockerignore
echo ".git" >> .dockerignore
```

## 监控和日志

### 查看资源使用

```bash
# 实时监控
docker stats mirofish

# 查看容器详情
docker inspect mirofish
```

### 日志管理

```bash
# 导出日志
docker compose logs > mirofish.log

# 只查看错误日志
docker compose logs | grep -i error

# 使用 ELK Stack 收集日志
# 或使用 Loki + Grafana
```

## 相关文档

- [配置说明](./01-configuration.md)
- [本地开发环境搭建](./02-local-setup.md)
- [项目主文档](../../README.md)
- [Docker 官方文档](https://docs.docker.com/)
