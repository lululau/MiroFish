# 配置说明

本文档详细说明 MiroFish 的环境变量配置、配置文件位置和 API 密钥设置。

## 目录

- [环境变量配置](#环境变量配置)
- [配置文件位置](#配置文件位置)
- [API 密钥获取指南](#api-密钥获取指南)
- [完整配置示例](#完整配置示例)

## 环境变量配置

MiroFish 使用 `.env` 文件来管理环境变量。项目根目录下提供了 `.env.example` 模板文件。

### 必需配置项

#### LLM API 配置

```env
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus
```

**说明：**
- `LLM_API_KEY`: LLM 服务的 API 密钥
- `LLM_BASE_URL`: LLM 服务的 API 基础 URL
- `LLM_MODEL_NAME`: 使用的模型名称

**推荐配置：**
- 阿里百炼平台的 `qwen-plus` 模型
- 注册地址：https://bailian.console.aliyun.com/
- 支持 OpenAI SDK 格式的任意 LLM API

#### Zep Cloud 配置

```env
ZEP_API_KEY=your_zep_api_key_here
```

**说明：**
- Zep Cloud 用于智能体记忆图谱管理
- 注册地址：https://app.getzep.com/
- 每月免费额度即可支撑简单使用

### 可选配置项

#### 加速 LLM 配置

如果不使用加速配置，请不要在 `.env` 文件中添加以下配置项：

```env
LLM_BOOST_API_KEY=your_api_key_here
LLM_BOOST_BASE_URL=your_base_url_here
LLM_BOOST_MODEL_NAME=your_model_name_here
```

**说明：**
- 用于配置额外的加速 LLM 服务
- 可以提升推理速度

#### Flask 服务配置

```env
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
FLASK_DEBUG=True
SECRET_KEY=mirofish-secret-key
```

**说明：**
- `FLASK_HOST`: 后端服务监听地址（默认：0.0.0.0）
- `FLASK_PORT`: 后端服务端口（默认：5001）
- `FLASK_DEBUG`: 调试模式（默认：True）
- `SECRET_KEY`: Flask 密钥（生产环境请修改）

#### OASIS 模拟配置

```env
OASIS_DEFAULT_MAX_ROUNDS=10
```

**说明：**
- 控制模拟的默认最大轮数
- 数值越大，模拟越精细，但消耗也越大
- 建议首次使用先设置为 10 以内

#### Report Agent 配置

```env
REPORT_AGENT_MAX_TOOL_CALLS=5
REPORT_AGENT_MAX_REFLECTION_ROUNDS=2
REPORT_AGENT_TEMPERATURE=0.5
```

**说明：**
- `REPORT_AGENT_MAX_TOOL_CALLS`: 报告生成时的最大工具调用次数
- `REPORT_AGENT_MAX_REFLECTION_ROUNDS`: 最大反思轮数
- `REPORT_AGENT_TEMPERATURE`: 生成温度（0-1，越低越确定性）

## 配置文件位置

### 项目结构

```
MiroFish/
├── .env                    # 主配置文件（需自行创建）
├── .env.example            # 配置模板
├── docker-compose.yml      # Docker 部署配置
├── Dockerfile              # Docker 镜像构建配置
├── backend/
│   ├── app/
│   │   └── config.py       # 后端配置加载逻辑
│   ├── pyproject.toml      # Python 依赖配置
│   └── requirements.txt    # Python 依赖列表
├── frontend/
│   ├── package.json        # 前端依赖配置
│   └── vite.config.js      # Vite 构建配置
└── package.json            # 根项目配置
```

### 配置文件说明

| 文件 | 用途 | 是否需要修改 |
|------|------|-------------|
| `.env` | 环境变量配置 | ✅ 需要创建并配置 |
| `.env.example` | 配置模板 | ❌ 仅作参考 |
| `docker-compose.yml` | Docker 容器配置 | ⚠️ 可选（端口映射等） |
| `backend/app/config.py` | 后端配置加载逻辑 | ❌ 一般不需要修改 |
| `frontend/vite.config.js` | 前端构建配置 | ❌ 一般不需要修改 |

## API 密钥获取指南

### 1. LLM API 密钥（阿里百炼平台）

**步骤：**

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通百炼服务
4. 在控制台获取 API Key
5. 选择模型（推荐 `qwen-plus`）

**注意事项：**
- 注意消耗较大，可先进行小于 40 轮的模拟尝试
- 支持其他兼容 OpenAI SDK 格式的 LLM API
- 如需使用其他服务，修改 `LLM_BASE_URL` 和 `LLM_MODEL_NAME` 即可

### 2. Zep Cloud API 密钥

**步骤：**

1. 访问 [Zep Cloud](https://app.getzep.com/)
2. 注册/登录账号
3. 创建新项目
4. 获取 API Key

**注意事项：**
- 每月免费额度即可支撑简单使用
- 用于存储智能体记忆和图谱数据

## 完整配置示例

### 开发环境配置

```env
# ===== LLM API 配置 =====
# 使用阿里百炼平台
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus

# ===== Zep Cloud 配置 =====
ZEP_API_KEY=zep-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===== Flask 服务配置（可选）=====
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# ===== OASIS 模拟配置（可选）=====
OASIS_DEFAULT_MAX_ROUNDS=10

# ===== Report Agent 配置（可选）=====
REPORT_AGENT_MAX_TOOL_CALLS=5
REPORT_AGENT_MAX_REFLECTION_ROUNDS=2
REPORT_AGENT_TEMPERATURE=0.5
```

### 生产环境配置

```env
# ===== LLM API 配置 =====
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus

# ===== Zep Cloud 配置 =====
ZEP_API_KEY=zep-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===== Flask 服务配置 =====
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
FLASK_DEBUG=False
SECRET_KEY=change-this-to-a-strong-random-string

# ===== OASIS 模拟配置 =====
OASIS_DEFAULT_MAX_ROUNDS=20

# ===== Report Agent 配置 =====
REPORT_AGENT_MAX_TOOL_CALLS=10
REPORT_AGENT_MAX_REFLECTION_ROUNDS=3
REPORT_AGENT_TEMPERATURE=0.7
```

## 配置验证

启动后端服务时，系统会自动验证必需的配置项：

```bash
cd backend && uv run python run.py
```

如果配置缺失，会看到类似以下的错误提示：

```
配置错误:
  - LLM_API_KEY 未配置
  - ZEP_API_KEY 未配置

请检查 .env 文件中的配置
```

## 安全建议

1. **不要提交 `.env` 文件到版本控制系统**
   - `.gitignore` 已默认忽略 `.env` 文件

2. **生产环境使用强密钥**
   - 修改 `SECRET_KEY` 为随机字符串
   - 使用环境变量管理工具（如 AWS Secrets Manager）

3. **定期轮换 API 密钥**
   - 定期更新 LLM 和 Zep 的 API 密钥

4. **限制 API 权限**
   - 为不同环境使用不同的 API 密钥
   - 设置合理的使用配额

## 常见问题

### Q: 修改配置后需要重启服务吗？

A: 是的，修改 `.env` 文件后需要重启后端服务才能生效。

### Q: 可以使用其他 LLM 服务吗？

A: 可以，只要该服务兼容 OpenAI SDK 格式，修改 `LLM_BASE_URL` 和 `LLM_MODEL_NAME` 即可。

### Q: 如何查看当前使用的配置？

A: 启动后端服务时，如果配置正确，会显示服务地址。也可以查看 `backend/app/config.py` 中的配置加载逻辑。

### Q: 免费额度够用吗？

A: 阿里百炼平台和 Zep Cloud 都提供免费额度，适合测试和小规模使用。大规模使用需要购买付费套餐。

## 相关文档

- [本地开发环境搭建](./02-local-setup.md)
- [Docker 部署指南](./03-docker.md)
- [项目主文档](../../README.md)
