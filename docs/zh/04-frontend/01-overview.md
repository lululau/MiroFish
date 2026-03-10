# 前端架构总览

## 1. Vue 3 架构

### 1.1 Composition API 使用

项目全面采用 **Vue 3 Composition API** (`<script setup>`)，提供更简洁的语法和更好的类型推断。

**主要特点：**
- 使用 `<script setup>` 语法糖，代码更简洁
- 通过 `ref()` 和 `reactive()` 进行响应式状态管理
- 使用 `computed()` 创建计算属性
- 使用 `onMounted()`, `onUnmounted()` 等生命周期钩子
- 通过 `useRoute()` 和 `useRouter()` 进行路由操作

**示例：**
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentStep = ref(1)
const loading = ref(false)

const stepNames = ['图谱构建', '环境搭建', '开始模拟', '报告生成', '深度互动']

const currentStepName = computed(() => stepNames[currentStep.value - 1])

onMounted(() => {
  // 初始化逻辑
})
</script>
```

### 1.2 组件组织

项目采用**模块化组件组织**，按照功能划分为：
- **布局组件** (App.vue)
- **视图组件** (views/) - 页面级组件
- **业务组件** (components/) - 可复用的功能组件

### 1.3 状态管理

项目**未使用 Pinia/Vuex**，而是采用轻量级的本地状态管理方案：

**状态管理方案：**
1. **组件内部状态**：使用 `ref()` 和 `reactive()` 管理组件本地状态
2. **简单共享状态**：通过 `store/pendingUpload.js` 实现跨组件状态共享
3. **Props/Emit**：父子组件通信使用标准 Vue 3 方式
4. **路由参数**：通过路由传递项目 ID、模拟 ID 等参数

**pendingUpload.js 示例：**
```javascript
import { reactive } from 'vue'

const state = reactive({
  files: [],
  simulationRequirement: '',
  isPending: false
})

export function setPendingUpload(files, requirement) {
  state.files = files
  state.simulationRequirement = requirement
  state.isPending = true
}
```

---

## 2. 路由结构

### 2.1 路由配置

使用 **Vue Router 4**，采用 History 模式。

**主要路由：**

| 路径 | 名称 | 组件 | 用途 |
|------|------|------|------|
| `/` | Home | `Home.vue` | 首页，展示系统介绍和历史项目 |
| `/process/:projectId` | Process | `MainView.vue` | 主工作台，包含 5 个步骤的工作流 |
| `/simulation/:simulationId` | Simulation | `SimulationView.vue` | 模拟配置页面 |
| `/simulation/:simulationId/start` | SimulationRun | `SimulationRunView.vue` | 模拟运行实时监控 |
| `/report/:reportId` | Report | `ReportView.vue` | 报告生成与查看 |
| `/interaction/:reportId` | Interaction | `InteractionView.vue` | 与 Report Agent 深度互动 |

### 2.2 路由特性

**动态路由参数：**
- `projectId` - 项目 ID
- `simulationId` - 模拟 ID
- `reportId` - 报告 ID

**Props 传递：**
所有路由都启用 `props: true`，将路由参数作为组件 props 传递。

**路由导航：**
```javascript
// 编程式导航
router.push(`/process/${projectId}`)

// 获取路由参数
const projectId = route.params.projectId
```

### 2.3 路由守卫

项目**暂未实现全局路由守卫**，所有路由均可直接访问。
建议未来可添加：
- 权限验证
- 项目存在性检查
- 模拟状态验证

---

## 3. 组件层级

### 3.1 组件树结构

```
App.vue (根组件)
└── router-view
    ├── Home.vue (首页)
    │   ├── Hero Section
    │   ├── Dashboard Section
    │   └── HistoryDatabase (历史项目组件)
    │
    ├── MainView.vue (主工作台)
    │   ├── Header (顶部导航)
    │   ├── GraphPanel (左侧图谱面板)
    │   └── Step Components (右侧步骤面板)
    │       ├── Step1GraphBuild (图谱构建)
    │       ├── Step2EnvSetup (环境搭建)
    │       ├── Step3Simulation (开始模拟)
    │       ├── Step4Report (报告生成)
    │       └── Step5Interaction (深度互动)
    │
    ├── SimulationView.vue (模拟配置)
    ├── SimulationRunView.vue (模拟运行)
    ├── ReportView.vue (报告查看)
    └── InteractionView.vue (互动对话)
```

### 3.2 布局组件

**App.vue**
- 根组件，包含全局样式
- 使用 `<router-view>` 进行路由切换
- 全局样式重置和滚动条样式

**MainView.vue**
- 主工作台布局
- 顶部导航栏（品牌、视图切换、步骤指示器）
- 左右分栏布局（图谱面板 + 步骤面板）
- 支持三种视图模式：图谱模式、双栏模式、工作台模式

### 3.3 页面组件 (Views/)

**Home.vue** - 首页
- Hero 区域（品牌展示）
- Dashboard 区域（系统状态、历史项目）
- 文件上传和需求输入

**MainView.vue** - 主工作台
- 包含完整的 5 步工作流
- 状态管理和步骤导航
- 图谱数据展示

**SimulationView.vue** - 模拟配置
- Agent Profiles 配置
- 模拟参数设置

**SimulationRunView.vue** - 模拟运行
- 实时状态监控
- 帖子流展示
- 统计信息展示

**ReportView.vue** - 报告生成
- 报告生成进度
- Agent 日志和控制台日志
- 报告内容展示

**InteractionView.vue** - 深度互动
- 与 Report Agent 对话
- 聊天历史管理

### 3.4 可复用组件 (Components/)

**GraphPanel.vue**
- D3.js 力导向图可视化
- 图谱交互（缩放、拖拽、点击）
- 实体和关系展示

**Step1GraphBuild.vue** - Step 1: 图谱构建
- 本体生成进度
- 图谱构建进度
- 本体详情展示（实体类型、关系类型）

**Step2EnvSetup.vue** - Step 2: 环境搭建
- 模拟创建
- 环境准备进度
- Agent Profiles 生成

**Step3Simulation.vue** - Step 3: 开始模拟
- 模拟配置确认
- 启动模拟
- 模拟运行监控

**Step4Report.vue** - Step 4: 报告生成
- 报告生成进度
- 日志查看（Agent 日志、控制台日志）
- 报告内容展示

**Step5Interaction.vue** - Step 5: 深度互动
- 与 Report Agent 对话
- 多 Agent 批量采访
- 聊天历史管理

**HistoryDatabase.vue**
- 历史项目列表
- 项目状态展示
- 快速访问入口

---

## 4. API 集成

### 4.1 Axios 配置

使用 **Axios** 进行 HTTP 请求，配置位于 `api/index.js`。

**基础配置：**
```javascript
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  timeout: 300000, // 5分钟超时
  headers: {
    'Content-Type': 'application/json'
  }
})
```

**开发环境代理：**
通过 Vite 配置代理，将 `/api` 请求转发到后端服务：
```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

### 4.2 API 服务层

API 按功能模块划分为 4 个服务文件：

#### **graph.js** - 图谱相关 API
- `generateOntology()` - 生成本体
- `buildGraph()` - 构建图谱
- `getTaskStatus()` - 查询任务状态
- `getGraphData()` - 获取图谱数据
- `getProject()` - 获取项目信息

#### **simulation.js** - 模拟相关 API
- `createSimulation()` - 创建模拟
- `prepareSimulation()` - 准备模拟环境
- `getPrepareStatus()` - 查询准备进度
- `getSimulation()` - 获取模拟状态
- `getSimulationProfiles()` - 获取 Agent Profiles
- `getSimulationConfig()` - 获取模拟配置
- `startSimulation()` - 启动模拟
- `stopSimulation()` - 停止模拟
- `getRunStatus()` - 获取运行状态
- `getSimulationPosts()` - 获取模拟帖子
- `getSimulationTimeline()` - 获取时间线
- `getAgentStats()` - 获取 Agent 统计
- `closeSimulationEnv()` - 关闭模拟环境
- `interviewAgents()` - 批量采访 Agent
- `getSimulationHistory()` - 获取历史模拟

#### **report.js** - 报告相关 API
- `generateReport()` - 生成报告
- `getReportStatus()` - 获取报告状态
- `getAgentLog()` - 获取 Agent 日志
- `getConsoleLog()` - 获取控制台日志
- `getReport()` - 获取报告详情
- `chatWithReport()` - 与 Report Agent 对话

### 4.3 请求/响应拦截器

**请求拦截器：**
```javascript
service.interceptors.request.use(
  config => {
    // 可在此添加认证 token 等信息
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)
```

**响应拦截器：**
- 统一错误处理
- 超时检测
- 网络错误提示
- 状态码验证

```javascript
service.interceptors.response.use(
  response => {
    const res = response.data

    // 检查业务状态码
    if (!res.success && res.success !== undefined) {
      console.error('API Error:', res.error || res.message || 'Unknown error')
      return Promise.reject(new Error(res.error || res.message || 'Error'))
    }

    return res
  },
  error => {
    // 处理超时、网络错误等
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('Request timeout')
    }

    if (error.message === 'Network Error') {
      console.error('Network error - please check your connection')
    }

    return Promise.reject(error)
  }
)
```

### 4.4 重试机制

提供 `requestWithRetry` 函数，支持自动重试失败的请求：

```javascript
export const requestWithRetry = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      if (i === maxRetries - 1) throw error

      console.warn(`Request failed, retrying (${i + 1}/${maxRetries})...`)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}
```

**使用示例：**
```javascript
export const createSimulation = (data) => {
  return requestWithRetry(() => service.post('/api/simulation/create', data), 3, 1000)
}
```

### 4.5 API 调用示例

**在组件中使用：**
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { createSimulation, getSimulation } from '../api/simulation'

const simulation = ref(null)
const loading = ref(false)

// 创建模拟
const handleCreateSimulation = async () => {
  loading.value = true
  try {
    const result = await createSimulation({
      project_id: projectId.value,
      enable_twitter: true,
      enable_reddit: true
    })
    simulation.value = result.data
  } catch (error) {
    console.error('Failed to create simulation:', error)
  } finally {
    loading.value = false
  }
}

// 获取模拟状态
const fetchSimulation = async () => {
  try {
    const result = await getSimulation(simulationId.value)
    simulation.value = result.data
  } catch (error) {
    console.error('Failed to fetch simulation:', error)
  }
}

onMounted(() => {
  fetchSimulation()
})
</script>
```

---

## 5. 技术栈总结

### 5.1 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.24 | 渐进式 JavaScript 框架 |
| Vue Router | 4.6.3 | 官方路由管理器 |
| Axios | 1.13.2 | HTTP 客户端 |
| D3 | 7.9.0 | 数据可视化（力导向图） |

### 5.2 开发工具

| 依赖 | 版本 | 用途 |
|------|------|------|
| Vite | 7.2.4 | 构建工具和开发服务器 |
| @vitejs/plugin-vue | 6.0.1 | Vue 3 支持 |

### 5.3 项目特性

- **Composition API** - 使用 `<script setup>` 语法
- **模块化组织** - 按功能划分组件和 API
- **轻量级状态管理** - 无需 Pinia/Vuex
- **D3.js 可视化** - 力导向图展示知识图谱
- **实时更新** - 轮询 API 获取实时状态
- **错误处理** - 统一的错误处理和重试机制
- **响应式设计** - 支持多种视图模式

---

## 6. 开发建议

### 6.1 组件开发

1. **使用 Composition API**：优先使用 `<script setup>` 语法
2. **Props 验证**：定义清晰的 props 类型和默认值
3. **事件命名**：使用 kebab-case 命名自定义事件
4. **组件拆分**：复杂组件拆分为更小的子组件

### 6.2 状态管理

1. **本地状态优先**：优先使用组件内部状态
2. **避免过度共享**：只在必要时使用共享状态
3. **Props 下传，Events 上传**：遵循单向数据流

### 6.3 API 调用

1. **统一使用 API 服务层**：不要在组件中直接调用 axios
2. **错误处理**：始终使用 try-catch 包裹 API 调用
3. **加载状态**：提供 loading 状态反馈
4. **重试机制**：对关键 API 使用重试机制

### 6.4 性能优化

1. **懒加载**：对大型组件使用路由懒加载
2. **计算属性**：使用 `computed` 缓存计算结果
3. **防抖节流**：对频繁操作使用防抖/节流
4. **虚拟滚动**：对长列表使用虚拟滚动

---

## 7. 目录结构

```
frontend/
├── src/
│   ├── api/                    # API 服务层
│   │   ├── index.js           # Axios 配置
│   │   ├── graph.js           # 图谱 API
│   │   ├── simulation.js      # 模拟 API
│   │   └── report.js          # 报告 API
│   ├── assets/                # 静态资源
│   │   └── logo/              # Logo 图片
│   ├── components/            # 可复用组件
│   │   ├── GraphPanel.vue     # 图谱面板
│   │   ├── HistoryDatabase.vue # 历史数据库
│   │   ├── Step1GraphBuild.vue # Step 1 组件
│   │   ├── Step2EnvSetup.vue   # Step 2 组件
│   │   ├── Step3Simulation.vue  # Step 3 组件
│   │   ├── Step4Report.vue     # Step 4 组件
│   │   └── Step5Interaction.vue # Step 5 组件
│   ├── router/                # 路由配置
│   │   └── index.js           # 路由定义
│   ├── store/                 # 状态管理
│   │   └── pendingUpload.js   # 待上传状态
│   ├── views/                 # 页面组件
│   │   ├── Home.vue           # 首页
│   │   ├── MainView.vue       # 主工作台
│   │   ├── SimulationView.vue  # 模拟配置
│   │   ├── SimulationRunView.vue # 模拟运行
│   │   ├── ReportView.vue      # 报告查看
│   │   └── InteractionView.vue  # 深度互动
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── public/                    # 公共静态资源
├── index.html                 # HTML 模板
├── vite.config.js            # Vite 配置
└── package.json              # 项目配置
```

---

**文档版本**：v1.0
**最后更新**：2026-03-10
**维护者**：MiroFish Team
