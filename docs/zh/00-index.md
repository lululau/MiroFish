# MiroFish 文档索引

欢迎使用 MiroFish 文档！本索引页面将帮助您快速找到所需的文档，并提供针对不同用户角色的阅读路径建议。

---

## 目录

- [文档导航](#文档导航)
- [阅读建议](#阅读建议)
- [文档索引](#文档索引)

---

## 文档导航

### 📚 快速入门路径

适合新用户快速了解和使用 MiroFish：

1. **[项目概览](README.md)** - 了解 MiroFish 是什么，核心功能和工作流程
2. **[本地开发环境搭建](06-deployment/02-local-setup.md)** - 安装依赖并启动系统
3. **[配置说明](06-deployment/01-configuration.md)** - 配置 API 密钥和环境变量
4. **[在线体验](README.md#在线体验)** - 访问 Demo 演示环境

### 🏗️ 深度学习路径

适合开发者深入理解系统架构和实现细节：

1. **[系统架构文档](02-architecture.md)** - 整体架构、数据流、模块依赖关系
2. **[后端架构概览](03-backend/01-overview.md)** - Flask 应用架构、服务层设计
3. **[前端架构总览](04-frontend/01-overview.md)** - Vue 3 架构、组件组织、路由结构
4. **[设计模式文档](08-design-patterns.md)** - 项目中使用的设计模式和最佳实践

### 🔌 API 参考路径

适合开发者查阅 API 接口和服务说明：

1. **[后端 API 文档](03-backend/)** - 图谱、模拟、报告相关 API
   - [图谱 API](03-backend/02-api-graph.md) - 项目和图谱管理接口
   - [模拟 API](03-backend/03-api-simulation.md) - 模拟运行和管理接口
   - [报告 API](03-backend/04-api-report.md) - 报告生成和查询接口
2. **[前端 API 集成](04-frontend/03-api-integration.md)** - 前端如何调用后端 API
3. **[数据模型](03-backend/05-data-models.md)** - 数据结构定义

### 🚀 运维部署路径

适合运维人员部署和维护系统：

1. **[配置说明](06-deployment/01-configuration.md)** - 环境变量配置详解
2. **[本地开发环境搭建](06-deployment/02-local-setup.md)** - 开发环境配置
3. **[Docker 部署指南](06-deployment/03-docker.md)** - 容器化部署方案
4. **[常见问题排查](07-troubleshooting/01-common-issues.md)** - 问题诊断和解决方案

---

## 阅读建议

### 👨‍💻 新手用户

如果您是第一次接触 MiroFish，建议按以下顺序阅读：

**第一阶段：了解系统（30 分钟）**
- 阅读 [项目概览](README.md)，了解 MiroFish 的核心功能
- 查看 [在线 Demo](https://666ghj.github.io/mirofish-demo/)，体验系统功能

**第二阶段：本地运行（1 小时）**
- 按照 [本地开发环境搭建](06-deployment/02-local-setup.md) 安装依赖
- 参考 [配置说明](06-deployment/01-configuration.md) 配置 API 密钥
- 启动系统并进行第一次模拟

**第三阶段：深入使用（持续学习）**
- 阅读 [常见问题排查](07-troubleshooting/01-common-issues.md) 了解常见问题
- 查看 [外部依赖集成](05-integrations/01-overview.md) 了解第三方服务

### 👨‍🔧 开发者

如果您是开发者，想要参与开发或二次开发，建议重点关注：

**必读文档：**
1. [系统架构文档](02-architecture.md) - 理解整体设计
2. [后端架构概览](03-backend/01-overview.md) - 理解后端实现
3. [前端架构总览](04-frontend/01-overview.md) - 理解前端实现
4. [设计模式文档](08-design-patterns.md) - 学习代码设计

**参考文档：**
- [后端服务详解](03-backend/06-services/) - 各个服务模块的实现细节
- [数据模型](03-backend/05-data-models.md) - 数据结构定义
- [API 集成](04-frontend/03-api-integration.md) - 前后端交互方式

**开发前准备：**
1. 克隆代码仓库
2. 搭建本地开发环境（参考 [本地开发环境搭建](06-deployment/02-local-setup.md)）
3. 阅读代码规范和架构设计
4. 运行系统并熟悉功能

### 👨‍💼 运维人员

如果您负责系统部署和维护，建议重点关注：

**部署相关：**
1. [配置说明](06-deployment/01-configuration.md) - 环境配置详解
2. [本地开发环境搭建](06-deployment/02-local-setup.md) - 开发环境配置
3. [Docker 部署指南](06-deployment/03-docker.md) - 生产环境部署

**运维相关：**
1. [外部依赖集成](05-integrations/01-overview.md) - 第三方服务配置
2. [常见问题排查](07-troubleshooting/01-common-issues.md) - 问题诊断
3. [调试指南](07-troubleshooting/02-debugging.md) - 调试方法

**监控和维护：**
- 定期检查 API 密钥使用情况
- 监控系统资源使用
- 清理旧的模拟数据
- 更新依赖版本

---

## 文档索引

### 📖 核心文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **项目概览** | [README.md](README.md) | 项目介绍、核心功能、快速开始指南 |
| **系统架构** | [02-architecture.md](02-architecture.md) | 整体架构图、数据流、模块依赖、技术栈 |
| **设计模式** | [08-design-patterns.md](08-design-patterns.md) | 项目中使用的设计模式和最佳实践 |

### 🔧 后端文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **后端架构概览** | [03-backend/01-overview.md](03-backend/01-overview.md) | Flask 应用架构、服务层设计、API 路由结构 |
| **图谱 API** | [03-backend/02-api-graph.md](03-backend/02-api-graph.md) | 项目管理、本体生成、图谱构建接口 |
| **模拟 API** | [03-backend/03-api-simulation.md](03-backend/03-api-simulation.md) | 模拟创建、配置、运行、监控接口 |
| **报告 API** | [03-backend/04-api-report.md](03-backend/04-api-report.md) | 报告生成、查询、对话接口 |
| **数据模型** | [03-backend/05-data-models.md](03-backend/05-data-models.md) | 项目、任务、模拟、报告数据结构 |

#### 后端服务详解

| 文档 | 路径 | 说明 |
|------|------|------|
| **本体生成服务** | [03-backend/06-services/01-ontology-generator.md](03-backend/06-services/01-ontology-generator.md) | 本体结构生成逻辑 |
| **图谱构建服务** | [03-backend/06-services/02-graph-builder.md](03-backend/06-services/02-graph-builder.md) | Zep 图谱构建流程 |
| **OASIS 人设生成** | [03-backend/06-services/03-oasis-profile-generator.md](03-backend/06-services/03-oasis-profile-generator.md) | Agent Profile 生成 |
| **报告 Agent** | [03-backend/06-services/04-report-agent.md](03-backend/06-services/04-report-agent.md) | 报告生成与对话逻辑 |
| **模拟管理器** | [03-backend/06-services/05-simulation-manager.md](03-backend/06-services/05-simulation-manager.md) | 模拟生命周期管理 |

### 🎨 前端文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **前端架构总览** | [04-frontend/01-overview.md](04-frontend/01-overview.md) | Vue 3 架构、组件组织、路由结构 |
| **组件说明** | [04-frontend/02-components.md](04-frontend/02-components.md) | Vue 组件列表和使用说明 |
| **API 集成** | [04-frontend/03-api-integration.md](04-frontend/03-api-integration.md) | 前端如何调用后端 API |

### 🔌 集成文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **外部依赖集成** | [05-integrations/01-overview.md](05-integrations/01-overview.md) | Zep Cloud、LLM 服务、CAMEL-OASIS 集成说明 |

### 🚀 部署文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **配置说明** | [06-deployment/01-configuration.md](06-deployment/01-configuration.md) | 环境变量配置、API 密钥设置 |
| **本地开发环境搭建** | [06-deployment/02-local-setup.md](06-deployment/02-local-setup.md) | 开发环境安装、依赖配置、服务启动 |
| **Docker 部署指南** | [06-deployment/03-docker.md](06-deployment/03-docker.md) | 容器化部署方案 |

### 🛠️ 故障排查

| 文档 | 路径 | 说明 |
|------|------|------|
| **常见问题排查** | [07-troubleshooting/01-common-issues.md](07-troubleshooting/01-common-issues.md) | 常见错误及解决方案 |
| **调试指南** | [07-troubleshooting/02-debugging.md](07-troubleshooting/02-debugging.md) | 调试方法和工具使用 |

---

## 文档结构图

```
docs/zh/
├── 00-index.md                 # 本文档 - 文档导航索引
├── README.md                   # 项目概览
├── 02-architecture.md          # 系统架构
├── 03-backend/                 # 后端文档
│   ├── 01-overview.md          # 后端架构概览
│   ├── 02-api-graph.md         # 图谱 API
│   ├── 03-api-simulation.md    # 模拟 API
│   ├── 04-api-report.md        # 报告 API
│   ├── 05-data-models.md       # 数据模型
│   └── 06-services/            # 服务详解
│       ├── 01-ontology-generator.md
│       ├── 02-graph-builder.md
│       ├── 03-oasis-profile-generator.md
│       ├── 04-report-agent.md
│       └── 05-simulation-manager.md
├── 04-frontend/                # 前端文档
│   ├── 01-overview.md          # 前端架构总览
│   ├── 02-components.md        # 组件说明
│   └── 03-api-integration.md   # API 集成
├── 05-integrations/            # 集成文档
│   └── 01-overview.md          # 外部依赖集成
├── 06-deployment/              # 部署文档
│   ├── 01-configuration.md     # 配置说明
│   ├── 02-local-setup.md       # 本地开发环境搭建
│   └── 03-docker.md            # Docker 部署
└── 07-troubleshooting/         # 故障排查
    ├── 01-common-issues.md     # 常见问题
    └── 02-debugging.md         # 调试指南
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

### 社区资源
- **项目主文档**: [README.md](../README.md)
- **英文文档**: [README-EN.md](../README-EN.md)
- **智能体说明**: [AGENTS.md](../AGENTS.md)

---

## 文档贡献

如果您发现文档有误或需要补充，欢迎提交 Pull Request 或 Issue！

**贡献方式：**
1. Fork 项目仓库
2. 修改或添加文档
3. 提交 Pull Request

**文档规范：**
- 使用 Markdown 格式
- 保持语言简洁准确
- 提供代码示例
- 更新相关交叉引用

---

**文档版本**: v1.0
**最后更新**: 2026-03-10
**维护者**: MiroFish Team

---

<div align="center">

**MiroFish** - 让未来在数字沙盘中预演

[GitHub](https://github.com/666ghj/MiroFish) | [在线演示](https://666ghj.github.io/mirofish-demo/) | [联系我们](mailto:mirofish@shanda.com)

</div>
