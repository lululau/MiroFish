# MiroFish 项目概览

<div align="center">

**简洁通用的群体智能引擎，预测万物**

</div>

## 项目简介

MiroFish 是一款基于多智能体技术的新一代 AI 预测引擎。通过提取现实世界的种子信息（如突发新闻、政策草案、金融信号、文学作品），自动构建出高保真的平行数字世界。在此空间内，成千上万个具备独立人格、长期记忆与行为逻辑的智能体进行自由交互与社会演化。

我们的核心使命是让未来在数字沙盘中预演，助决策在百战模拟后胜出。用户只需上传种子材料并用自然语言描述预测需求，MiroFish 将返回一份详尽的预测报告，以及一个可深度交互的高保真数字世界。

MiroFish 致力于打造映射现实的群体智能镜像，通过捕捉个体互动引发的群体涌现，突破传统预测的局限。从宏观的政策预演实验室到微观的创意沙盘，我们让每一个"如果"都能看见结果，让预测万物成为可能。

## 五步工作流程

MiroFish 的完整工作流程包含五个关键步骤，从项目创建到报告分析，形成闭环的预测生态系统。

```mermaid
flowgraph TD
    Start([开始]) --> Step1

    subgraph Step1[步骤 1: 创建项目/本体生成]
        A1[上传种子材料<br/>新闻/报告/小说] --> A2[自然语言描述<br/>预测需求]
        A2 --> A3[自动提取实体<br/>关系与背景]
    end

    Step1 --> Step2

    subgraph Step2[步骤 2: 图谱构建]
        B1[个体与群体<br/>记忆注入] --> B2[GraphRAG<br/>知识图谱构建]
        B2 --> B3[实体关系抽取<br/>与结构化]
    end

    Step2 --> Step3

    subgraph Step3[步骤 3: 模拟配置]
        C1[人设生成<br/>智能体角色创建] --> C2[环境配置<br/>仿真参数设定]
        C2 --> C3[Agent注入<br/>初始状态配置]
    end

    Step3 --> Step4

    subgraph Step4[步骤 4: 运行模拟]
        D1[双平台并行<br/>模拟执行] --> D2[自动解析<br/>预测需求]
        D2 --> D3[动态更新<br/>时序记忆]
    end

    Step4 --> Step5

    subgraph Step5[步骤 5: 报告分析]
        E1[ReportAgent<br/>深度分析] --> E2[生成预测报告<br/>与洞察]
        E2 --> E3[交互式对话<br/>与验证]
    end

    Step5 --> End([完成])

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style Step1 fill:#e3f2fd
    style Step2 fill:#f3e5f5
    style Step3 fill:#fff3e0
    style Step4 fill:#e8f5e9
    style Step5 fill:#fce4ec
```

### 步骤详解

1. **创建项目/本体生成**
   - 上传种子材料：支持数据分析报告、新闻文档、小说故事等多种格式
   - 自然语言描述：用通俗易懂的语言说明预测目标和需求
   - 自动提取：系统自动识别实体、关系和背景信息

2. **图谱构建**
   - 记忆注入：为个体和群体注入背景知识和上下文记忆
   - GraphRAG构建：使用检索增强生成技术构建高质量知识图谱
   - 结构化处理：将非结构化信息转化为结构化的实体关系网络

3. **模拟配置**
   - 人设生成：为每个智能体创建独特的性格、背景和行为模式
   - 环境配置：设定仿真世界的参数和规则
   - Agent注入：将配置好的智能体注入到仿真环境中

4. **运行模拟**
   - 双平台并行：利用多个平台并行执行仿真，提高效率
   - 需求解析：系统自动理解和解析预测需求
   - 动态更新：实时更新智能体的时序记忆和状态

5. **报告分析**
   - ReportAgent：配备丰富工具集的分析代理深入模拟环境
   - 深度交互：与模拟世界中的任意智能体进行对话
   - 报告生成：自动生成详尽的预测报告和洞察分析

## 目录结构

MiroFish 采用前后端分离的架构设计，目录结构清晰明了：

```
MiroFish/
├── backend/                # 后端服务（Flask + Python）
│   ├── app/               # 应用核心代码
│   │   ├── agents/        # 智能体实现
│   │   ├── api/           # API 路由
│   │   ├── services/      # 业务逻辑服务
│   │   └── utils/         # 工具函数
│   ├── scripts/           # 脚本和工具
│   ├── requirements.txt   # Python 依赖
│   ├── pyproject.toml     # 项目配置
│   └── run.py            # 后端启动入口
│
├── frontend/              # 前端应用（Vue.js）
│   ├── src/              # 源代码
│   │   ├── components/   # Vue 组件
│   │   ├── views/        # 页面视图
│   │   ├── services/     # API 服务
│   │   └── assets/       # 静态资源
│   ├── public/           # 公共资源
│   ├── package.json      # Node 依赖
│   ├── vite.config.js    # Vite 配置
│   └── index.html        # 入口 HTML
│
├── docs/                 # 文档目录
│   └── zh/              # 中文文档
│       └── README.md    # 项目概览（本文档）
│
├── static/              # 静态资源（图片、文档）
├── .env.example         # 环境变量示例
├── docker-compose.yml   # Docker 编排配置
├── Dockerfile          # Docker 镜像配置
├── package.json        # 根目录 npm 脚本
├── README.md           # 项目主文档
└── README-EN.md        # 英文文档
```

### 核心目录说明

- **backend/**: Flask 后端服务，负责多智能体仿真引擎、API 接口、业务逻辑处理
- **frontend/**: Vue.js 前端应用，提供用户界面、交互式可视化和报告展示
- **docs/**: 项目文档，包括技术文档、使用指南和开发手册
- **static/**: 静态资源文件，包含 logo、截图、演示视频等

## 快速开始

### 环境要求

在开始使用 MiroFish 之前，请确保您的开发环境满足以下要求：

| 工具 | 版本要求 | 说明 | 检查命令 |
|------|---------|------|---------|
| **Node.js** | 18+ | 前端运行环境，包含 npm | `node -v` |
| **Python** | ≥3.11, ≤3.12 | 后端运行环境 | `python --version` |
| **uv** | 最新版 | Python 包管理器 | `uv --version` |

### 安装步骤

详细的安装和配置说明请参考项目主 README 文档。以下是快速概览：

1. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入 LLM 和 Zep API 密钥
   ```

2. **安装依赖**
   ```bash
   npm run setup:all  # 一键安装所有依赖
   ```

3. **启动服务**
   ```bash
   npm run dev  # 同时启动前后端
   ```

4. **访问应用**
   - 前端界面：http://localhost:3000
   - 后端 API：http://localhost:5001

### Docker 部署

如果您更喜欢使用 Docker，我们提供了完整的容器化部署方案：

```bash
# 配置环境变量
cp .env.example .env

# 启动容器
docker compose up -d
```

## 技术架构

MiroFish 采用现代化的技术栈，确保高性能和可扩展性：

### 后端技术
- **Flask**: 轻量级 Web 框架
- **Python 3.11+**: 现代特性与类型提示
- **GraphRAG**: 知识图谱构建与检索
- **Zep Cloud**: 长期记忆存储
- **OASIS**: 多智能体仿真引擎

### 前端技术
- **Vue.js 3**: 渐进式前端框架
- **Vite**: 高速构建工具
- **组件化架构**: 可复用的 UI 组件
- **响应式设计**: 支持多终端访问

## 在线体验

欢迎访问在线 Demo 演示环境，体验我们为您准备的热点舆情事件推演预测：

[MiroFish 在线演示](https://666ghj.github.io/mirofish-demo/)

---

## 文档导航

### 📚 按角色阅读

#### 👨‍💻 后端开发者

如果您是后端开发者，建议按以下顺序阅读：

1. **[系统架构文档](02-architecture.md)** - 了解整体架构和数据流
2. **[后端架构概览](03-backend/01-overview.md)** - 理解 Flask 应用结构
3. **[后端服务详解](03-backend/06-services/)** - 深入了解各服务模块
   - [本体生成服务](03-backend/06-services/01-ontology-generator.md)
   - [图谱构建服务](03-backend/06-services/02-graph-builder.md)
   - [OASIS 人设生成](03-backend/06-services/03-oasis-profile-generator.md)
   - [报告 Agent](03-backend/06-services/04-report-agent.md)
   - [模拟管理器](03-backend/06-services/05-simulation-manager.md)
4. **[API 参考文档](03-backend/)** - 查看接口定义
   - [图谱 API](03-backend/02-api-graph.md)
   - [模拟 API](03-backend/03-api-simulation.md)
   - [报告 API](03-backend/04-api-report.md)
5. **[数据模型](03-backend/05-data-models.md)** - 了解数据结构

#### 🎨 前端开发者

如果您是前端开发者，建议按以下顺序阅读：

1. **[系统架构文档](02-architecture.md)** - 了解前后端通信方式
2. **[前端架构总览](04-frontend/01-overview.md)** - 理解 Vue 3 架构
3. **[组件说明](04-frontend/02-components.md)** - 了解组件结构和交互
4. **[API 集成](04-frontend/03-api-integration.md)** - 学习如何调用后端 API

#### 👨‍💼 运维人员

如果您负责系统部署和维护，建议按以下顺序阅读：

1. **[配置说明](06-deployment/01-configuration.md)** - 配置环境变量和 API 密钥
2. **[本地开发环境搭建](06-deployment/02-local-setup.md)** - 搭建开发环境
3. **[Docker 部署指南](06-deployment/03-docker.md)** - 生产环境部署
4. **[外部依赖集成](05-integrations/01-overview.md)** - 了解第三方服务配置
5. **[常见问题排查](07-troubleshooting/01-common-issues.md)** - 解决常见问题
6. **[调试指南](07-troubleshooting/02-debugging.md)** - 学习调试方法

### 📖 完整文档索引

#### 核心文档

| 文档 | 说明 |
|------|------|
| [项目概览](README.md) | 项目介绍、核心功能、快速开始指南 |
| [系统架构](02-architecture.md) | 整体架构图、数据流、模块依赖、技术栈 |
| [设计模式](08-design-patterns.md) | 项目中使用的设计模式和最佳实践 |
| [文档索引](00-index.md) | 完整的文档导航和阅读路径 |

#### 后端文档

| 文档 | 说明 |
|------|------|
| [后端架构概览](03-backend/01-overview.md) | Flask 应用架构、服务层设计、API 路由结构 |
| [图谱 API](03-backend/02-api-graph.md) | 项目管理、本体生成、图谱构建接口 |
| [模拟 API](03-backend/03-api-simulation.md) | 模拟创建、配置、运行、监控接口 |
| [报告 API](03-backend/04-api-report.md) | 报告生成、查询、对话接口 |
| [数据模型](03-backend/05-data-models.md) | 项目、任务、模拟、报告数据结构 |

#### 前端文档

| 文档 | 说明 |
|------|------|
| [前端架构总览](04-frontend/01-overview.md) | Vue 3 架构、组件组织、路由结构 |
| [组件说明](04-frontend/02-components.md) | Vue 组件列表和使用说明 |
| [API 集成](04-frontend/03-api-integration.md) | 前端如何调用后端 API |

#### 集成文档

| 文档 | 说明 |
|------|------|
| [外部依赖集成](05-integrations/01-overview.md) | Zep Cloud、LLM 服务、CAMEL-OASIS 集成说明 |

#### 部署文档

| 文档 | 说明 |
|------|------|
| [配置说明](06-deployment/01-configuration.md) | 环境变量配置、API 密钥设置 |
| [本地开发环境搭建](06-deployment/02-local-setup.md) | 开发环境安装、依赖配置、服务启动 |
| [Docker 部署指南](06-deployment/03-docker.md) | 容器化部署方案 |

#### 故障排查

| 文档 | 说明 |
|------|------|
| [常见问题排查](07-troubleshooting/01-common-issues.md) | 常见错误及解决方案 |
| [调试指南](07-troubleshooting/02-debugging.md) | 调试方法和工具使用 |

---

## 文档贡献

我们欢迎任何形式的文档贡献！如果您发现文档有误、需要补充或有改进建议，请通过以下方式参与：

### 贡献方式

1. **报告问题**: 在 [GitHub Issues](https://github.com/666ghj/MiroFish/issues) 中提交问题
2. **改进文档**: 提交 Pull Request 修改或添加文档
3. **建议内容**: 提出您希望看到的文档主题

### 文档规范

- **格式**: 使用 Markdown 格式
- **语言**: 保持中文简洁准确，专业术语可保留英文
- **代码示例**: 提供可运行的代码示例
- **交叉引用**: 更新相关文档的交叉引用
- **结构**: 保持与现有文档一致的结构和风格

### 文档位置

所有文档存放在 `docs/zh/` 目录下，按照以下组织结构：

```
docs/zh/
├── README.md                   # 项目概览
├── 00-index.md                 # 文档导航索引
├── 02-architecture.md          # 系统架构
├── 03-backend/                 # 后端文档
├── 04-frontend/                # 前端文档
├── 05-integrations/            # 集成文档
├── 06-deployment/              # 部署文档
├── 07-troubleshooting/         # 故障排查
└── 08-design-patterns.md       # 设计模式
```

---

## 相关资源

### 官方资源
- **GitHub 仓库**: [666ghj/MiroFish](https://github.com/666ghj/MiroFish)
- **在线演示**: [mirofish-live-demo](https://666ghj.github.io/mirofish-demo/)
- **问题反馈**: [GitHub Issues](https://github.com/666ghj/MiroFish/issues)

### 技术文档
- [Zep Cloud 官方文档](https://docs.getzep.com/)
- [CAMEL-OASIS 官方文档](https://www.camel-ai.org/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [阿里云百炼文档](https://bailian.console.aliyun.com/)

### 项目文档
- **主文档**: [README.md](../../README.md)
- **英文文档**: [README-EN.md](../../README-EN.md)
- **智能体说明**: [AGENTS.md](../../AGENTS.md)

## 许可证

本项目采用开源许可证，详见 [LICENSE](../../LICENSE) 文件。

---

<div align="center">

**MiroFish** - 让未来在数字沙盘中预演

[GitHub](https://github.com/666ghj/MiroFish) | [在线演示](https://666ghj.github.io/mirofish-demo/) | [联系我们](mailto:mirofish@shanda.com)

</div>
