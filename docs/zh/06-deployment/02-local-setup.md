# 本地开发环境搭建

本文档详细介绍如何在本地搭建 MiroFish 的开发环境，包括前后端依赖安装和本地运行。

## 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [详细安装步骤](#详细安装步骤)
- [开发模式运行](#开发模式运行)
- [常见问题](#常见问题)

## 前置要求

在开始之前，请确保你的系统已安装以下工具：

| 工具 | 版本要求 | 说明 | 检查命令 |
|------|---------|------|---------|
| **Node.js** | 18+ | 前端运行环境，包含 npm | `node -v` |
| **Python** | ≥3.11, ≤3.12 | 后端运行环境 | `python --version` |
| **uv** | 最新版 | Python 包管理器（推荐） | `uv --version` |
| **Git** | 任意 | 版本控制 | `git --version` |

### 安装前置工具

#### Node.js

**推荐使用 nvm（Node Version Manager）安装：**

```bash
# 安装 nvm（如果尚未安装）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载终端配置
source ~/.bashrc  # 或 source ~/.zshrc

# 安装 Node.js 18
nvm install 18
nvm use 18
```

**或直接从官网下载：**
- 访问 [Node.js 官网](https://nodejs.org/)
- 下载并安装 LTS 版本（≥18）

#### Python

**Linux/macOS:**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv

# macOS（使用 Homebrew）
brew install python@3.11
```

**Windows:**
- 访问 [Python 官网](https://www.python.org/downloads/)
- 下载并安装 Python 3.11 或 3.12

#### uv（Python 包管理器）

**推荐使用 uv，速度比 pip 快很多：**

```bash
# Linux/macOS
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows（PowerShell）
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 或使用 pip 安装
pip install uv
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
nano .env  # 或使用其他编辑器
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

### 3. 安装依赖

**一键安装所有依赖（推荐）：**

```bash
npm run setup:all
```

这个命令会自动：
- 安装根目录的 Node 依赖
- 安装前端目录的 Node 依赖
- 创建 Python 虚拟环境并安装后端依赖

### 4. 启动服务

```bash
# 同时启动前后端
npm run dev
```

服务地址：
- **前端**: http://localhost:3000
- **后端 API**: http://localhost:5001

## 详细安装步骤

如果一键安装遇到问题，可以按照以下步骤手动安装：

### 后端安装

#### 1. 创建 Python 虚拟环境（可选）

使用 uv 自动创建虚拟环境：

```bash
cd backend
uv sync
```

或使用传统方式：

```bash
cd backend

# 创建虚拟环境
python3.11 -m venv venv

# 激活虚拟环境
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

#### 2. 后端依赖说明

主要依赖项（见 `backend/pyproject.toml`）：

```toml
# 核心框架
flask>=3.0.0
flask-cors>=6.0.0

# LLM 相关
openai>=1.0.0

# Zep Cloud
zep-cloud==3.13.0

# OASIS 社交媒体模拟
camel-oasis==0.2.5
camel-ai==0.2.78

# 文件处理
PyMuPDF>=1.24.0
charset-normalizer>=3.0.0
chardet>=5.0.0

# 工具库
python-dotenv>=1.0.0
pydantic>=2.0.0
```

#### 3. 验证后端安装

```bash
cd backend
uv run python run.py
```

看到以下输出表示启动成功：

```
 * Running on http://0.0.0.0:5001
 * Running on http://127.0.0.1:5001
```

### 前端安装

#### 1. 安装前端依赖

```bash
cd frontend
npm install
```

#### 2. 前端依赖说明

主要依赖项（见 `frontend/package.json`）：

```json
{
  "dependencies": {
    "axios": "^1.13.2",      // HTTP 客户端
    "d3": "^7.9.0",           // 数据可视化
    "vue": "^3.5.24",         // 前端框架
    "vue-router": "^4.6.3"    // 路由管理
  }
}
```

#### 3. 验证前端安装

```bash
cd frontend
npm run dev
```

看到以下输出表示启动成功：

```
  VITE v7.2.4  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

## 开发模式运行

### 同时运行前后端

在项目根目录执行：

```bash
npm run dev
```

这会使用 `concurrently` 同时启动前后端服务。

### 单独运行服务

**仅运行后端：**

```bash
npm run backend
```

**仅运行前端：**

```bash
npm run frontend
```

### 开发工具

推荐的开发工具：

1. **IDE 代码编辑器**
   - VS Code（推荐）
   - PyCharm（Python 开发）
   - WebStorm（前端开发）

2. **VS Code 推荐插件**
   - Vue - Official
   - Python
   - Pylance
   - ESLint
   - GitLens

3. **API 测试工具**
   - Postman
   - Insomnia
   - curl / httpie

## 项目结构说明

```
MiroFish/
├── backend/                 # 后端代码
│   ├── app/                # 应用主目录
│   │   ├── __init__.py     # 应用工厂
│   │   ├── config.py       # 配置管理
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── uploads/            # 上传文件目录（运行时创建）
│   ├── run.py              # 启动入口
│   ├── pyproject.toml      # Python 项目配置
│   └── requirements.txt    # Python 依赖列表
├── frontend/               # 前端代码
│   ├── src/                # 源代码
│   │   ├── components/     # Vue 组件
│   │   ├── router/         # 路由配置
│   │   └── main.js         # 入口文件
│   ├── public/             # 静态资源
│   ├── index.html          # HTML 模板
│   ├── package.json        # 前端依赖配置
│   └── vite.config.js      # Vite 配置
├── .env                    # 环境变量（需自行创建）
├── .env.example            # 环境变量模板
├── package.json            # 根项目配置
└── README.md               # 项目说明
```

## 开发工作流

### 1. 启动开发环境

```bash
# 终端 1: 启动前后端
npm run dev

# 或分别启动
# 终端 1: 后端
npm run backend

# 终端 2: 前端
npm run frontend
```

### 2. 访问应用

打开浏览器访问：http://localhost:3000

### 3. 开发调试

**后端调试：**
- 使用 Python 调试器（如 VS Code 的 Python Debugger）
- 在代码中添加断点
- 查看 Flask 日志输出

**前端调试：**
- 使用浏览器开发者工具（F12）
- Vue DevTools 浏览器插件
- 查看 Console 和 Network 标签

### 4. 代码修改

**前端热更新：**
- Vite 支持热模块替换（HMR）
- 修改代码后自动刷新浏览器

**后端热更新：**
- Flask 在 DEBUG 模式下支持自动重载
- 修改代码后自动重启服务

## 常见问题

### Q1: Node.js 版本不兼容

**问题：** `node -v` 显示版本低于 18

**解决方案：**
```bash
# 使用 nvm 安装 Node.js 18
nvm install 18
nvm use 18
```

### Q2: Python 版本不兼容

**问题：** `python --version` 显示版本不符合要求

**解决方案：**
```bash
# 安装 Python 3.11
# Ubuntu/Debian
sudo apt install python3.11 python3.11-venv

# 或使用 pyenv
pyenv install 3.11.0
pyenv global 3.11.0
```

### Q3: uv 安装失败

**问题：** `uv --version` 报错

**解决方案：**
```bash
# 使用 pip 安装
pip install uv

# 或使用传统方式（不使用 uv）
cd backend
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Q4: 端口被占用

**问题：** 启动时报错 `Address already in use`

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000  # 前端端口
lsof -i :5001  # 后端端口

# 杀死进程
kill -9 <PID>

# 或修改端口配置
# 修改 .env 文件中的 FLASK_PORT
# 修改 frontend/vite.config.js 中的端口
```

### Q5: 依赖安装失败

**问题：** `npm install` 或 `uv sync` 报错

**解决方案：**
```bash
# 清除缓存后重试
npm cache clean --force
npm install

# 或使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install

# Python 依赖问题
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### Q6: 配置文件未找到

**问题：** 启动后端时报错 `配置错误`

**解决方案：**
```bash
# 确保已创建 .env 文件
cp .env.example .env

# 编辑 .env 文件，填入必需的 API 密钥
nano .env
```

### Q7: 前后端连接失败

**问题：** 前端无法连接到后端 API

**解决方案：**
```bash
# 确认后端服务是否运行
curl http://localhost:5001/api/health

# 检查前端 API 配置
# 查看 frontend/src/ 中的 API 基础 URL 配置

# 检查 CORS 配置
# backend/app/__init__.py 中已配置 flask-cors
```

### Q8: 文件上传失败

**问题：** 上传文件时报错

**解决方案：**
```bash
# 确保 uploads 目录存在
mkdir -p backend/uploads
mkdir -p backend/uploads/simulations

# 检查文件大小限制
# 默认最大 50MB，可在 backend/app/config.py 中修改
```

## 性能优化建议

### 开发环境

1. **使用 uv 加速依赖安装**
   - 比 pip 快 10-100 倍

2. **启用热更新**
   - Flask DEBUG 模式
   - Vite HMR

3. **限制模拟轮数**
   - 设置 `OASIS_DEFAULT_MAX_ROUNDS=10`

### 生产环境

1. **构建前端资源**
   ```bash
   npm run build
   ```

2. **使用生产级 WSGI 服务器**
   - Gunicorn
   - uWSGI

3. **启用缓存**
   - Redis
   - Memcached

4. **使用 CDN**
   - 静态资源加速

## 相关文档

- [配置说明](./01-configuration.md)
- [Docker 部署指南](./03-docker.md)
- [项目主文档](../../README.md)
- [后端 API 文档](../../docs/zh/05-api/README.md)
