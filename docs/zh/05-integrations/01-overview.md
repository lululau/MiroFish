# 外部依赖集成概述

MiroFish 系统集成了多个外部服务来实现完整的社交媒体舆论模拟功能。本文档介绍各个外部依赖的作用、配置方式和使用场景。

## 目录

- [Zep Cloud - 记忆图谱存储](#zep-cloud---记忆图谱存储)
- [LLM 服务 - AI 推理与生成](#llm-服务---ai-推理与生成)
- [CAMEL-OASIS - 社交媒体模拟](#camel-oasis---社交媒体模拟)
- [其他依赖](#其他依赖)

---

## Zep Cloud - 记忆图谱存储

### 用途

Zep Cloud 是 MiroFish 的核心记忆存储服务，用于：

1. **知识图谱构建**：存储从文档中提取的实体和关系
2. **语义检索**：支持基于自然语言的图谱搜索
3. **Agent 记忆管理**：保存模拟过程中 Agent 的行为记录
4. **报告生成数据源**：为 Report Agent 提供结构化数据访问

### 配置

**环境变量**：

```bash
# 必需配置
ZEP_API_KEY=your_zep_api_key_here
```

**获取 API Key**：
- 访问 [Zep Cloud](https://app.getzep.com/)
- 注册账号并创建 API Key
- 免费额度即可支撑简单使用

### 集成服务

以下服务使用 Zep Cloud：

| 服务 | 文件路径 | 用途 |
|------|----------|------|
| **GraphBuilderService** | `app/services/graph_builder.py` | 构建知识图谱 |
| **ZepEntityReader** | `app/services/zep_entity_reader.py` | 读取图谱实体 |
| **ZepGraphMemoryManager** | `app/services/zep_graph_memory_updater.py` | 更新 Agent 记忆 |
| **ZepToolsService** | `app/services/zep_tools.py` | 提供检索工具 |
| **OasisProfileGenerator** | `app/services/oasis_profile_generator.py` | 读取实体生成 Agent |
| **OntologyGenerator** | `app/services/ontology_generator.py` | 管理本体定义 |

### 核心功能

**1. 图谱操作**

```python
from zep_cloud.client import Zep

# 初始化客户端
client = Zep(api_key=Config.ZEP_API_KEY)

# 创建图谱
graph = client.graph.create(graph_name="MiroFish Graph")

# 添加节点和边
client.graph.add(
    graph_id=graph_id,
    episodes=[EpisodeData(...)]
)
```

**2. 语义检索**

```python
# 搜索相关实体
results = client.graph.search(
    graph_id=graph_id,
    query="查找所有支持方观点"
)
```

**3. 分页读取**

```python
# 获取所有节点
nodes = fetch_all_nodes(client, graph_id)

# 获取所有边
edges = fetch_all_edges(client, graph_id)
```

### API 限制

- **实体类型**：最多 10 个自定义类型
- **关系类型**：最多 10 个自定义类型
- **保留字段**：`name`, `uuid`, `group_id`, `created_at`, `summary`

---

## LLM 服务 - AI 推理与生成

### 用途

MiroFish 使用兼容 OpenAI SDK 格式的 LLM 服务实现：

1. **本体生成**：分析文档并生成实体/关系类型定义
2. **Agent 人设生成**：为 OASIS 创建详细的 Agent Profile
3. **模拟配置生成**：智能生成时间、事件、Agent 活动配置
4. **报告生成**：使用 ReACT 模式生成分析报告

### 配置

**环境变量**：

```bash
# 必需配置
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus

# 可选配置（加速 LLM）
LLM_BOOST_API_KEY=your_boost_api_key
LLM_BOOST_BASE_URL=your_boost_base_url
LLM_BOOST_MODEL_NAME=your_boost_model_name
```

**推荐服务**：

- **阿里云百炼**（推荐）：`qwen-plus` 模型，性价比高
  - 注册地址：https://bailian.console.aliyun.com/
  - 注意：模拟消耗较大，建议先进行小于 40 轮的测试

- **OpenAI**：`gpt-4o-mini` 模型
- **其他兼容服务**：任何支持 OpenAI SDK 格式的 API

### 集成服务

| 服务 | 文件路径 | 使用场景 |
|------|----------|----------|
| **LLMClient** | `app/utils/llm_client.py` | 统一 LLM 调用封装 |
| **OntologyGenerator** | `app/services/ontology_generator.py` | 生成本体定义 |
| **OasisProfileGenerator** | `app/services/oasis_profile_generator.py` | 生成 Agent 人设 |
| **SimulationConfigGenerator** | `app/services/simulation_config_generator.py` | 生成模拟配置 |
| **ReportAgent** | `app/services/report_agent.py` | 生成分析报告 |

### 使用示例

**基础调用**：

```python
from app.utils.llm_client import LLMClient

# 初始化客户端
client = LLMClient()

# 发送聊天请求
response = client.chat(
    messages=[
        {"role": "system", "content": "你是一个助手"},
        {"role": "user", "content": "分析这段文本"}
    ],
    temperature=0.7,
    max_tokens=4096
)
```

**JSON 模式**：

```python
# 请求结构化 JSON 响应
result = client.chat_json(
    messages=[
        {"role": "system", "content": "返回 JSON 格式"},
        {"role": "user", "content": "生成本体定义"}
    ],
    temperature=0.3
)
```

### 最佳实践

1. **温度参数设置**：
   - 分析任务：`temperature=0.3`（更确定性）
   - 生成任务：`temperature=0.7`（更多样性）

2. **Token 限制**：
   - 本体生成：`max_tokens=4096`
   - 报告生成：根据章节长度动态调整

3. **成本控制**：
   - 使用 `LLM_BOOST_*` 配置为非关键任务配置更便宜的模型
   - 分批生成避免超长上下文

---

## CAMEL-OASIS - 社交媒体模拟

### 用途

CAMEL-OASIS 是一个基于 Agent 的社交媒体模拟框架，MiroFish 使用它来：

1. **模拟真实社交平台**：支持 Twitter 和 Reddit 平台
2. **Agent 行为模拟**：每个实体都有独立的行为模式和决策逻辑
3. **舆论演化追踪**：记录每个轮次的帖子、评论、转发等行为
4. **事后采访**：在模拟结束后采访 Agent 了解其想法

### 配置

**依赖包**：

```bash
# 已包含在 requirements.txt 中
camel-oasis==0.2.5
camel-ai==0.2.78
```

**环境变量**：

```bash
# OASIS 使用 LLM_API_KEY（与系统共享）
LLM_API_KEY=your_api_key_here

# 可选配置
OASIS_DEFAULT_MAX_ROUNDS=10  # 默认最大轮数
```

### 集成服务

| 服务 | 文件路径 | 用途 |
|------|----------|------|
| **SimulationRunner** | `app/services/simulation_runner.py` | 运行和管理模拟 |
| **OasisProfileGenerator** | `app/services/oasis_profile_generator.py` | 生成 Agent Profile |
| **SimulationConfigGenerator** | `app/services/simulation_config_generator.py` | 生成模拟配置 |
| **SimulationIPCClient** | `app/services/simulation_ipc.py` | 进程间通信 |
| **ZepGraphMemoryManager** | `app/services/zep_graph_memory_updater.py` | 更新 Agent 记忆 |

### 支持的平台

**Twitter 平台**：

```python
# 可用动作
OASIS_TWITTER_ACTIONS = [
    'CREATE_POST',    # 发推文
    'LIKE_POST',      # 点赞
    'REPOST',         # 转发
    'FOLLOW',         # 关注
    'QUOTE_POST',     # 引用推文
    'DO_NOTHING'      # 不做任何事
]
```

**Reddit 平台**：

```python
# 可用动作
OASIS_REDDIT_ACTIONS = [
    'CREATE_POST',        # 发帖
    'CREATE_COMMENT',     # 评论
    'LIKE_POST',          # 点赞帖子
    'DISLIKE_POST',       # 踩帖子
    'LIKE_COMMENT',       # 点赞评论
    'DISLIKE_COMMENT',    # 踩评论
    'SEARCH_POSTS',       # 搜索帖子
    'SEARCH_USER',        # 搜索用户
    'TREND',              # 查看趋势
    'REFRESH',            # 刷新
    'FOLLOW',             # 关注
    'MUTE',               # 屏蔽
    'DO_NOTHING'          # 不做任何事
]
```

### 使用流程

**1. 生成 Agent Profile**：

```python
from app.services.oasis_profile_generator import OasisProfileGenerator

generator = OasisProfileGenerator()
profiles = generator.generate_profiles_from_graph(
    graph_id="graph-uuid",
    platform="twitter",
    agent_count=20
)
```

**2. 启动模拟**：

```python
from app.services.simulation_runner import SimulationRunner

runner = SimulationRunner()
task_id = runner.start_simulation(
    platform="twitter",
    agent_profiles=profiles,
    simulation_config=config,
    max_rounds=40
)
```

**3. 监控进度**：

```python
# 获取模拟状态
status = runner.get_status(task_id)

# 获取 Agent 动作记录
actions = runner.get_actions(task_id, round_num=5)
```

**4. 事后采访**：

```python
# 采访单个 Agent
response = runner.interview_agent(
    task_id=task_id,
    agent_id=1,
    question="你为什么支持这个观点？"
)

# 批量采访
responses = runner.batch_interview(
    task_id=task_id,
    agent_ids=[1, 2, 3, 4, 5],
    question="描述你的立场"
)
```

### 时间模拟配置

系统使用基于中国人作息的活跃度配置：

```python
# 深夜时段（几乎无人活动）
dead_hours = [0, 1, 2, 3, 4, 5]

# 早间时段（逐渐醒来）
morning_hours = [6, 7, 8]

# 工作时段
work_hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

# 晚间高峰（最活跃）
peak_hours = [19, 20, 21, 22]

# 夜间时段（活跃度下降）
night_hours = [23]
```

---

## 其他依赖

### 文件处理库

**PyMuPDF** (`fitz`)

```python
# 用于解析 PDF 文件
import fitz

def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text
```

**编码检测**

```python
# 自动检测文件编码
import charset_normalizer
import chardet

# 支持非 UTF-8 编码的文本文件
```

### Web 框架

**Flask** + **Flask-CORS**

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 启用跨域支持
```

### 数据验证

**Pydantic**

```python
from pydantic import BaseModel, Field

class TaskRequest(BaseModel):
    graph_id: str = Field(..., description="图谱 ID")
    simulation_requirement: str = Field(..., description="模拟需求")
```

### 环境管理

**python-dotenv**

```python
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()
```

---

## 集成架构图

```
┌─────────────────────────────────────────────────────────────┐
│                       MiroFish Backend                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │  Frontend    │◄────►│   Flask API  │                     │
│  └──────────────┘      └──────┬───────┘                     │
│                               │                               │
│         ┌─────────────────────┼─────────────────────┐        │
│         │                     │                     │        │
│         ▼                     ▼                     ▼        │
│  ┌──────────┐        ┌─────────────┐        ┌──────────┐   │
│  │Ontology  │        │Graph Builder│        │ Report   │   │
│  │Generator │        │   Service   │        │  Agent   │   │
│  └─────┬────┘        └──────┬──────┘        └─────┬────┘   │
│        │                    │                     │         │
│        │                    ▼                     │         │
│        │            ┌──────────────┐              │         │
│        │            │  Zep Cloud   │              │         │
│        │            │  (图谱存储)   │              │         │
│        │            └──────┬───────┘              │         │
│        │                   │                      │         │
│        ▼                   ▼                      ▼         │
│  ┌─────────────┐   ┌──────────────┐      ┌─────────────┐  │
│  │     LLM     │   │OASIS Profile │      │  Zep Tools  │  │
│  │   Service   │   │  Generator   │      │   Service   │  │
│  └─────────────┘   └──────┬───────┘      └─────────────┘  │
│                           │                               │
│                           ▼                               │
│                    ┌──────────────┐                       │
│                    │CAMEL-OASIS   │                       │
│                    │(社交媒体模拟) │                       │
│                    └──────────────┘                       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 配置检查清单

部署 MiroFish 前，请确保配置以下环境变量：

### 必需配置

```bash
# LLM 服务
LLM_API_KEY=sk-xxx                    # 必需
LLM_BASE_URL=https://api.xxx.com/v1  # 必需
LLM_MODEL_NAME=model-name             # 必需

# Zep Cloud
ZEP_API_KEY=zep-xxx                   # 必需
```

### 可选配置

```bash
# LLM 加速服务（用于非关键任务）
LLM_BOOST_API_KEY=sk-xxx
LLM_BOOST_BASE_URL=https://api.xxx.com/v1
LLM_BOOST_MODEL_NAME=cheaper-model

# Flask 配置
FLASK_DEBUG=True
SECRET_KEY=your-secret-key

# 模拟配置
OASIS_DEFAULT_MAX_ROUNDS=10
REPORT_AGENT_MAX_TOOL_CALLS=5
REPORT_AGENT_MAX_REFLECTION_ROUNDS=2
REPORT_AGENT_TEMPERATURE=0.5
```

### 验证配置

```python
from app.config import Config

errors = Config.validate()
if errors:
    print("配置错误：", errors)
```

---

## 故障排查

### Zep Cloud 连接失败

**错误信息**：`ZEP_API_KEY 未配置` 或 `Authentication failed`

**解决方案**：
1. 检查 `.env` 文件中的 `ZEP_API_KEY`
2. 确认 API Key 是否有效
3. 检查网络连接

### LLM 调用失败

**错误信息**：`LLM_API_KEY 未配置` 或 `Invalid API key`

**解决方案**：
1. 检查 `.env` 文件中的 `LLM_API_KEY`
2. 确认 `LLM_BASE_URL` 和 `LLM_MODEL_NAME` 正确
3. 测试 API Key 是否有余额

### OASIS 模拟启动失败

**错误信息**：`ModuleNotFoundError: No module named 'camel_oasis'`

**解决方案**：
```bash
cd backend
pip install -r requirements.txt
```

### 文件上传失败

**错误信息**：`File size exceeds limit`

**解决方案**：
1. 检查文件大小是否超过 50MB
2. 调整 `Config.MAX_CONTENT_LENGTH`

---

## 更多信息

- [Zep Cloud 官方文档](https://docs.getzep.com/)
- [CAMEL-OASIS 官方文档](https://www.camel-ai.org/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [阿里云百炼文档](https://bailian.console.aliyun.com/)