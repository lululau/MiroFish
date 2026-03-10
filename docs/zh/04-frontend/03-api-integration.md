# 前端 API 集成文档

本文档详细介绍 MiroFish 前端的 API 集成架构，包括 Axios 配置、服务层组织和状态轮询机制。

## 目录

- [1. Axios 配置](#1-axios-配置)
- [2. API 服务层](#2-api-服务层)
- [3. 状态轮询机制](#3-状态轮询机制)
- [4. 使用示例](#4-使用示例)
- [5. 错误处理](#5-错误处理)

---

## 1. Axios 配置

### 1.1 基础配置

前端使用 Axios 作为 HTTP 客户端，配置文件位于 `/frontend/src/api/index.js`。

```javascript
// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  timeout: 300000, // 5分钟超时（本体生成可能需要较长时间）
  headers: {
    'Content-Type': 'application/json'
  }
})
```

**配置说明：**

- **baseURL**: 从环境变量 `VITE_API_BASE_URL` 读取，默认为 `http://localhost:5001`
- **timeout**: 5分钟（300000ms），考虑到本体生成等长时间操作
- **headers**: 默认 Content-Type 为 `application/json`

### 1.2 开发环境代理

在开发环境下，Vite 配置了 API 代理（`vite.config.js`）：

```javascript
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

**代理配置说明：**

- 前端开发服务器运行在端口 3000
- 所有 `/api` 请求被代理到后端 `http://localhost:5001`
- `changeOrigin: true` 确保正确的主机头

### 1.3 请求拦截器

```javascript
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)
```

当前请求拦截器主要用于：
- 统一的请求错误日志记录
- 未来可扩展添加认证 token

### 1.4 响应拦截器

```javascript
service.interceptors.response.use(
  response => {
    const res = response.data

    // 如果返回的状态码不是success，则抛出错误
    if (!res.success && res.success !== undefined) {
      console.error('API Error:', res.error || res.message || 'Unknown error')
      return Promise.reject(new Error(res.error || res.message || 'Error'))
    }

    return res
  },
  error => {
    console.error('Response error:', error)

    // 处理超时
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('Request timeout')
    }

    // 处理网络错误
    if (error.message === 'Network Error') {
      console.error('Network error - please check your connection')
    }

    return Promise.reject(error)
  }
)
```

**响应拦截器功能：**

1. **成功响应处理**：自动解包 `response.data`
2. **业务错误处理**：检查 `success` 字段，失败时抛出错误
3. **网络错误处理**：
   - 超时错误（ECONNABORTED）
   - 网络连接错误
4. **统一错误日志**：所有错误都会被记录到控制台

### 1.5 重试机制

```javascript
// 带重试的请求函数
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

**重试机制特点：**

- **最大重试次数**：默认 3 次
- **初始延迟**：1000ms（1秒）
- **指数退避**：每次重试延迟时间翻倍（1s → 2s → 4s）
- **使用场景**：用于关键 API 调用（如创建模拟、生成报告等）

---

## 2. API 服务层

### 2.1 服务层架构

API 服务层按功能模块组织，位于 `/frontend/src/api/` 目录：

```
frontend/src/api/
├── index.js          # Axios 实例和工具函数
├── graph.js          # 图谱相关 API
├── simulation.js     # 模拟相关 API
└── report.js         # 报告相关 API
```

### 2.2 图谱服务 (graph.js)

**功能函数：**

```javascript
// 生成本体（上传文档和模拟需求）
export function generateOntology(formData)

// 构建图谱
export function buildGraph(data)

// 查询任务状态
export function getTaskStatus(taskId)

// 获取图谱数据
export function getGraphData(graphId)

// 获取项目信息
export function getProject(projectId)
```

**函数签名说明：**

#### `generateOntology(formData)`

- **参数**: `FormData` 对象，包含：
  - `files`: 文档文件
  - `simulation_requirement`: 模拟需求描述
  - `project_name`: 项目名称
- **返回**: Promise
- **用途**: 上传文档并生成知识图谱本体

**使用示例：**

```javascript
import { generateOntology } from '@/api/graph'

const formData = new FormData()
formData.append('files', file)
formData.append('simulation_requirement', '模拟社交网络上的信息传播')
formData.append('project_name', '社交网络传播模拟')

const result = await generateOntology(formData)
if (result.success) {
  console.log('Task ID:', result.data.task_id)
}
```

#### `buildGraph(data)`

- **参数**: 对象 `{ project_id, graph_name }`
- **返回**: Promise
- **用途**: 基于本体构建图谱

#### `getTaskStatus(taskId)`

- **参数**: 任务 ID 字符串
- **返回**: Promise，包含任务状态信息
- **用途**: 轮询查询异步任务状态

### 2.3 模拟服务 (simulation.js)

**核心函数：**

```javascript
// 创建模拟实例
export const createSimulation = (data)

// 准备模拟环境
export const prepareSimulation = (data)

// 查询准备状态
export const getPrepareStatus = (data)

// 获取模拟信息
export const getSimulation = (simulationId)

// 获取 Agent Profiles
export const getSimulationProfiles = (simulationId, platform = 'reddit')

// 实时获取生成中的 Profiles
export const getSimulationProfilesRealtime = (simulationId, platform = 'reddit')

// 获取模拟配置
export const getSimulationConfig = (simulationId)

// 实时获取生成中的配置
export const getSimulationConfigRealtime = (simulationId)

// 列出所有模拟
export const listSimulations = (projectId)

// 启动模拟
export const startSimulation = (data)

// 停止模拟
export const stopSimulation = (data)

// 获取运行状态
export const getRunStatus = (simulationId)

// 获取运行详细状态
export const getRunStatusDetail = (simulationId)

// 获取模拟帖子
export const getSimulationPosts = (simulationId, platform, limit, offset)

// 获取模拟时间线
export const getSimulationTimeline = (simulationId, startRound, endRound)

// 获取 Agent 统计信息
export const getAgentStats = (simulationId)

// 获取模拟动作历史
export const getSimulationActions = (simulationId, params)

// 关闭模拟环境
export const closeSimulationEnv = (data)

// 获取环境状态
export const getEnvStatus = (data)

// 批量采访 Agent
export const interviewAgents = (data)

// 获取历史模拟列表
export const getSimulationHistory = (limit)
```

**使用示例：**

#### 创建并准备模拟

```javascript
import { createSimulation, prepareSimulation } from '@/api/simulation'

// 1. 创建模拟实例
const simResult = await createSimulation({
  project_id: 'proj_xxx',
  graph_id: 'graph_xxx',
  enable_twitter: true,
  enable_reddit: true
})

const simulationId = simResult.data.simulation_id

// 2. 准备模拟环境
const prepareResult = await prepareSimulation({
  simulation_id: simulationId,
  entity_types: ['person', 'organization'],
  use_llm_for_profiles: true,
  parallel_profile_count: 10
})

const taskId = prepareResult.data.task_id
```

#### 启动模拟

```javascript
import { startSimulation } from '@/api/simulation'

const result = await startSimulation({
  simulation_id: 'sim_xxx',
  platform: 'all', // 'twitter' | 'reddit' | 'all'
  max_rounds: 10,
  enable_graph_memory_update: true
})
```

### 2.4 报告服务 (report.js)

**函数列表：**

```javascript
// 生成报告
export const generateReport = (data)

// 获取报告生成状态
export const getReportStatus = (reportId)

// 获取 Agent 日志（增量）
export const getAgentLog = (reportId, fromLine)

// 获取控制台日志（增量）
export const getConsoleLog = (reportId, fromLine)

// 获取报告详情
export const getReport = (reportId)

// 与 Report Agent 对话
export const chatWithReport = (data)
```

**使用示例：**

```javascript
import { generateReport, getReportStatus } from '@/api/report'

// 1. 触发报告生成
const result = await generateReport({
  simulation_id: 'sim_xxx',
  force_regenerate: false
})

const reportId = result.data.report_id

// 2. 轮询报告状态
const checkStatus = async () => {
  const status = await getReportStatus(reportId)
  if (status.data.status === 'completed') {
    console.log('报告生成完成')
  }
}
```

---

## 3. 状态轮询机制

### 3.1 轮询场景

前端需要对以下异步操作进行状态轮询：

1. **环境准备状态** (Step2EnvSetup)
2. **模拟运行状态** (Step3Simulation)
3. **报告生成状态** (Step4Report)
4. **图谱刷新** (SimulationRunView)

### 3.2 轮询间隔

不同场景使用不同的轮询间隔：

| 场景 | 轮询间隔 | 说明 |
|------|----------|------|
| 环境准备状态 | 2000ms | Step2EnvSetup 组件 |
| Agent Profiles 生成 | 3000ms | 实时获取 profile |
| 模拟配置生成 | 2000ms | 实时获取配置 |
| 模拟运行状态 | 2000ms | Step3Simulation 基础状态 |
| 模拟详细状态 | 3000ms | Step3Simulation 详细动作 |
| Agent 日志 | 2000ms | Step4Report 实时日志 |
| 控制台日志 | 1500ms | Step4Report 控制台日志 |
| 图谱数据刷新 | 30000ms | SimulationRunView 自动刷新 |

### 3.3 环境准备轮询 (Step2EnvSetup)

**轮询实现：**

```javascript
let pollTimer = null
let profilesTimer = null
let configTimer = null

// 启动准备状态轮询
const startPolling = () => {
  pollTimer = setInterval(pollPrepareStatus, 2000)
}

// 启动 Profiles 轮询
const startProfilesPolling = () => {
  profilesTimer = setInterval(fetchProfilesRealtime, 3000)
}

// 启动配置轮询
const startConfigPolling = () => {
  configTimer = setInterval(fetchConfigRealtime, 2000)
}

// 停止所有轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (profilesTimer) {
    clearInterval(profilesTimer)
    profilesTimer = null
  }
  if (configTimer) {
    clearInterval(configTimer)
    configTimer = null
  }
}
```

**轮询逻辑：**

```javascript
const pollPrepareStatus = async () => {
  if (!taskId.value && !props.simulationId) return

  try {
    const res = await getPrepareStatus({
      task_id: taskId.value,
      simulation_id: props.simulationId
    })

    if (res.success && res.data) {
      const status = res.data.status

      if (status === 'completed') {
        addLog('✓ 环境准备完成')
        phase.value = 2
        stopPolling()
        emit('update-status', 'completed')
      } else if (status === 'failed') {
        addLog(`✗ 环境准备失败: ${res.data.error || '未知错误'}`)
        phase.value = -1
        stopPolling()
        emit('update-status', 'error')
      }
      // 'processing' 状态继续轮询
    }
  } catch (err) {
    console.warn('获取准备状态失败:', err)
  }
}
```

### 3.4 模拟运行轮询 (Step3Simulation)

**双重轮询机制：**

```javascript
let statusTimer = null
let detailTimer = null

// 基础状态轮询（每 2 秒）
statusTimer = setInterval(fetchRunStatus, 2000)

// 详细状态轮询（每 3 秒）
const startDetailPolling = () => {
  detailTimer = setInterval(fetchRunStatusDetail, 3000)
}

// 停止轮询
const stopPolling = () => {
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
  if (detailTimer) {
    clearInterval(detailTimer)
    detailTimer = null
  }
}
```

**状态检查逻辑：**

```javascript
const fetchRunStatus = async () => {
  try {
    const res = await getRunStatus(props.simulationId)

    if (res.success && res.data) {
      const data = res.data

      // 更新状态
      runStatus.value = {
        twitter_running: data.twitter_running,
        twitter_completed: data.twitter_completed,
        reddit_running: data.reddit_running,
        reddit_completed: data.reddit_completed,
        twitter_current_round: data.twitter_current_round,
        reddit_current_round: data.reddit_current_round,
        total_rounds: data.total_rounds,
        twitter_actions_count: data.twitter_actions_count,
        reddit_actions_count: data.reddit_actions_count
      }

      // 检查是否完成
      const twitterDone = data.twitter_completed || !data.twitter_running
      const redditDone = data.reddit_completed || !data.reddit_running
      const allCompleted = twitterDone && redditDone && (data.twitter_running || data.reddit_running)

      if (allCompleted && !isCompleted.value) {
        addLog('✓ 模拟已完成')
        phase.value = 2
        stopPolling()
        emit('update-status', 'completed')
      }
    }
  } catch (err) {
    console.warn('获取运行状态失败:', err)
  }
}
```

### 3.5 报告生成轮询 (Step4Report)

**日志轮询：**

```javascript
let agentLogTimer = null
let consoleLogTimer = null
let reportStatusTimer = null

// 启动日志轮询
const startLogPolling = () => {
  fetchAgentLog()    // 立即执行一次
  fetchConsoleLog()

  agentLogTimer = setInterval(fetchAgentLog, 2000)
  consoleLogTimer = setInterval(fetchConsoleLog, 1500)
}

// 停止轮询
const stopLogPolling = () => {
  if (agentLogTimer) {
    clearInterval(agentLogTimer)
    agentLogTimer = null
  }
  if (consoleLogTimer) {
    clearInterval(consoleLogTimer)
    consoleLogTimer = null
  }
  if (reportStatusTimer) {
    clearInterval(reportStatusTimer)
    reportStatusTimer = null
  }
}
```

**增量日志获取：**

```javascript
// Agent 日志增量获取
const fetchAgentLog = async () => {
  if (!reportId.value) return

  try {
    const res = await getAgentLog(reportId.value, agentLogLineCount.value)

    if (res.success && res.data) {
      const { lines, total_lines } = res.data

      if (lines && lines.length > 0) {
        agentLogs.value.push(...lines)
        agentLogLineCount.value = total_lines

        // 自动滚动到底部
        await nextTick()
        scrollToBottom('agentLogContent')
      }
    }
  } catch (err) {
    console.warn('获取 Agent 日志失败:', err)
  }
}

// 控制台日志增量获取
const fetchConsoleLog = async () => {
  if (!reportId.value) return

  try {
    const res = await getConsoleLog(reportId.value, consoleLogLineCount.value)

    if (res.success && res.data) {
      const { lines, total_lines } = res.data

      if (lines && lines.length > 0) {
        consoleLogs.value.push(...lines)
        consoleLogLineCount.value = total_lines

        await nextTick()
        scrollToBottom('consoleLogContent')
      }
    }
  } catch (err) {
    console.warn('获取控制台日志失败:', err)
  }
}
```

### 3.6 图谱自动刷新 (SimulationRunView)

**条件触发轮询：**

```javascript
let graphRefreshTimer = null

// 启动图谱刷新（仅在模拟运行时）
const startGraphRefresh = () => {
  if (graphRefreshTimer) return
  addLog('开启图谱实时刷新 (30s)')
  graphRefreshTimer = setInterval(refreshGraph, 30000)
}

// 停止刷新
const stopGraphRefresh = () => {
  if (graphRefreshTimer) {
    clearInterval(graphRefreshTimer)
    graphRefreshTimer = null
    addLog('停止图谱实时刷新')
  }
}

// 监听模拟状态，自动启动/停止轮询
watch(isSimulating, (newValue) => {
  if (newValue) {
    startGraphRefresh()
  } else {
    stopGraphRefresh()
  }
}, { immediate: true })
```

### 3.7 轮询清理

**组件卸载时清理：**

```javascript
onUnmounted(() => {
  stopPolling()        // 停止所有轮询
  stopLogPolling()     // 停止日志轮询
  stopGraphRefresh()   // 停止图谱刷新
})
```

**最佳实践：**

1. **始终清理**：在 `onUnmounted` 钩子中清理所有定时器
2. **条件启动**：只在需要时启动轮询
3. **避免重复**：启动前检查定时器是否已存在
4. **状态跟踪**：使用 ref 跟踪轮询状态，避免内存泄漏

---

## 4. 使用示例

### 4.1 完整工作流示例

```javascript
import { ref } from 'vue'
import {
  createSimulation,
  prepareSimulation,
  getPrepareStatus,
  startSimulation,
  getRunStatus
} from '@/api/simulation'

const simulationId = ref(null)
const taskId = ref(null)

// 步骤 1: 创建模拟
const createSim = async () => {
  const result = await createSimulation({
    project_id: 'proj_xxx',
    enable_twitter: true,
    enable_reddit: true
  })

  simulationId.value = result.data.simulation_id
  return simulationId.value
}

// 步骤 2: 准备环境（带轮询）
const prepareEnv = async () => {
  const result = await prepareSimulation({
    simulation_id: simulationId.value,
    entity_types: ['person', 'organization']
  })

  taskId.value = result.data.task_id

  // 轮询准备状态
  const pollInterval = setInterval(async () => {
    const status = await getPrepareStatus({
      task_id: taskId.value
    })

    if (status.data.status === 'completed') {
      clearInterval(pollInterval)
      console.log('环境准备完成')
      await startSim()
    }
  }, 2000)
}

// 步骤 3: 启动模拟
const startSim = async () => {
  const result = await startSimulation({
    simulation_id: simulationId.value,
    max_rounds: 10
  })

  // 轮询运行状态
  const pollInterval = setInterval(async () => {
    const status = await getRunStatus(simulationId.value)

    if (status.data.twitter_completed && status.data.reddit_completed) {
      clearInterval(pollInterval)
      console.log('模拟完成')
      await generateReport()
    }
  }, 2000)
}
```

### 4.2 错误处理示例

```javascript
import { requestWithRetry } from '@/api'
import { generateOntology } from '@/api/graph'

const uploadAndGenerate = async (file) => {
  const formData = new FormData()
  formData.append('files', file)
  formData.append('simulation_requirement', '模拟需求')
  formData.append('project_name', '项目名称')

  try {
    // 使用重试机制
    const result = await requestWithRetry(
      () => generateOntology(formData),
      3,  // 最大重试 3 次
      1000  // 初始延迟 1 秒
    )

    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error || '生成失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    // 显示用户友好的错误消息
    throw error
  }
}
```

### 4.3 组件中使用 API

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getSimulation, getRunStatus } from '@/api/simulation'

const simulationId = ref('sim_xxx')
const runStatus = ref(null)
let pollTimer = null

// 获取模拟信息
const loadSimulation = async () => {
  try {
    const res = await getSimulation(simulationId.value)
    if (res.success) {
      console.log('模拟信息:', res.data)
    }
  } catch (error) {
    console.error('加载失败:', error)
  }
}

// 轮询运行状态
const startPolling = () => {
  pollTimer = setInterval(async () => {
    try {
      const res = await getRunStatus(simulationId.value)
      if (res.success) {
        runStatus.value = res.data
      }
    } catch (error) {
      console.warn('状态更新失败:', error)
    }
  }, 2000)
}

onMounted(() => {
  loadSimulation()
  startPolling()
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>
```

---

## 5. 错误处理

### 5.1 错误类型

| 错误类型 | 触发条件 | 处理方式 |
|----------|----------|----------|
| **网络错误** | 无法连接到后端 | 检查网络，显示连接错误提示 |
| **超时错误** | 请求超过 5 分钟 | 显示超时提示，建议重试 |
| **业务错误** | `success: false` | 显示后端返回的错误信息 |
| **解析错误** | 响应数据格式错误 | 记录日志，显示通用错误提示 |

### 5.2 错误处理模式

**Try-Catch 模式：**

```javascript
const fetchData = async () => {
  try {
    const result = await apiCall()
    // 处理成功响应
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.error('请求超时')
    } else if (error.message === 'Network Error') {
      console.error('网络连接失败')
    } else {
      console.error('请求失败:', error.message)
    }
  }
}
```

**响应拦截器处理：**

```javascript
service.interceptors.response.use(
  response => response,
  error => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status
      switch (status) {
        case 401:
          console.error('未授权，请登录')
          break
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查连接')
    }
    return Promise.reject(error)
  }
)
```

### 5.3 用户友好的错误提示

```javascript
const showError = (error) => {
  let message = '操作失败，请重试'

  if (error.message.includes('timeout')) {
    message = '请求超时，请检查网络连接'
  } else if (error.message.includes('Network Error')) {
    message = '网络连接失败，请检查网络设置'
  } else if (error.message) {
    message = error.message
  }

  // 显示错误提示（可使用 Element Plus、Ant Design Vue 等）
  console.error(message)
  alert(message)
}
```

---

## 6. 最佳实践

### 6.1 API 调用规范

1. **使用服务层函数**：不要在组件中直接调用 axios
   ```javascript
   // ✅ 推荐
   import { getSimulation } from '@/api/simulation'
   const data = await getSimulation(simId)

   // ❌ 不推荐
   import axios from 'axios'
   const data = await axios.get(`/api/simulation/${simId}`)
   ```

2. **统一错误处理**：使用 try-catch 包裹异步调用
   ```javascript
   try {
     const result = await apiCall()
     // 处理结果
   } catch (error) {
     // 处理错误
   }
   ```

3. **合理使用重试**：关键操作使用 `requestWithRetry`
   ```javascript
   return requestWithRetry(() => service.post('/api/endpoint', data))
   ```

### 6.2 轮询最佳实践

1. **及时清理**：组件卸载时必须清理定时器
   ```javascript
   onUnmounted(() => {
     if (timer) clearInterval(timer)
   })
   ```

2. **条件启动**：只在需要时启动轮询
   ```javascript
   if (needsPolling) {
     startPolling()
   }
   ```

3. **避免重复**：启动前检查是否已存在定时器
   ```javascript
   if (!timer) {
     timer = setInterval(callback, interval)
   }
   ```

4. **合理间隔**：根据业务需求设置轮询间隔
   - 实时性要求高：1-2 秒
   - 一般状态：2-3 秒
   - 低频更新：10-30 秒

### 6.3 性能优化

1. **减少不必要的请求**：
   - 使用缓存避免重复请求
   - 合并多个请求
   - 使用防抖/节流

2. **优化轮询逻辑**：
   - 完成后立即停止轮询
   - 错误时增加重试间隔
   - 页面不可见时暂停轮询

3. **增量数据获取**：
   - 日志使用增量获取（`from_line` 参数）
   - 避免重复传输大量数据

---

## 7. 环境配置

### 7.1 环境变量

创建 `.env` 文件配置 API 基础 URL：

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:5001

# 生产环境
# VITE_API_BASE_URL=https://api.mirofish.com
```

### 7.2 代理配置

开发环境使用 Vite 代理避免 CORS 问题：

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
```

---

## 总结

本文档涵盖了 MiroFish 前端 API 集成的所有核心内容：

1. **Axios 配置**：实例创建、拦截器、重试机制
2. **服务层组织**：graph、simulation、report 三大模块
3. **状态轮询**：多种场景的轮询实现和清理机制
4. **使用示例**：完整工作流和组件集成示例
5. **错误处理**：错误类型、处理模式、用户提示
6. **最佳实践**：API 调用规范、轮询最佳实践、性能优化

遵循这些规范和模式，可以确保前端 API 调用的稳定性、可维护性和用户体验。
