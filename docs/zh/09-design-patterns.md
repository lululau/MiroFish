# 设计模式文档

本文档详细说明了 MiroFish 项目中使用的各种设计模式及其应用场景。

## 目录

- [后端设计模式](#后端设计模式)
  - [Service Layer 模式](#service-layer-模式)
  - [Singleton 模式](#singleton-模式)
  - [Dataclass 模式](#dataclass-模式)
  - [Strategy 模式](#strategy-模式)
- [前端设计模式](#前端设计模式)
  - [Composition API 模式](#composition-api-模式)
  - [Reactive Store 模式](#reactive-store-模式)
  - [Progressive Enhancement 模式](#progressive-enhancement-模式)
- [集成模式](#集成模式)
  - [API Client 模式](#api-client-模式)
  - [Retry 模式](#retry-模式)

---

## 后端设计模式

### Service Layer 模式

#### 应用场景

MiroFish 后端采用经典的三层架构，Service Layer 位于 API 层和数据层之间，负责封装业务逻辑。

#### 架构设计

```
API Layer (app/api/)
    ↓
Service Layer (app/services/)
    ↓
Utility/Model Layer (app/utils/, app/models/)
```

#### 为什么使用 Service Layer？

1. **关注点分离**: API 层只负责 HTTP 请求处理，Service 层负责业务逻辑
2. **代码复用**: Service 可以被多个 API 端点复用
3. **易于测试**: Service 层可以独立于 HTTP 层进行单元测试
4. **维护性**: 业务逻辑集中管理，便于修改和扩展

#### 实际应用示例

**SimulationManager** (`/backend/app/services/simulation_manager.py`):

```python
class SimulationManager:
    """
    模拟管理器

    核心功能：
    1. 从Zep图谱读取实体并过滤
    2. 生成OASIS Agent Profile
    3. 使用LLM智能生成模拟配置参数
    4. 准备预设脚本所需的所有文件
    """

    def prepare_simulation(
        self,
        simulation_id: str,
        simulation_requirement: str,
        document_text: str,
        defined_entity_types: Optional[List[str]] = None,
        use_llm_for_profiles: bool = True,
        progress_callback: Optional[callable] = None,
        parallel_profile_count: int = 3
    ) -> SimulationState:
        """准备模拟环境（全程自动化）"""
        # 业务逻辑实现...
```

**API 层调用** (`/backend/app/api/simulation.py`):

```python
@simulation_bp.route('/prepare', methods=['POST'])
def prepare_simulation():
    """API 端点：只负责请求解析和响应格式化"""
    data = request.json
    # 调用 Service 层
    state = simulation_manager.prepare_simulation(...)
    return jsonify({"success": True, "data": state.to_simple_dict()})
```

#### 主要 Service 类

| Service 类 | 职责 |
|-----------|------|
| `SimulationManager` | 模拟生命周期管理 |
| `GraphBuilderService` | Zep 图谱构建 |
| `OntologyGenerator` | 本体结构生成 |
| `OasisProfileGenerator` | Agent Profile 生成 |
| `SimulationConfigGenerator` | 模拟配置智能生成 |
| `ReportAgent` | 分析报告生成 |
| `ZepEntityReader` | Zep 图谱实体读取 |

---

### Singleton 模式

#### 应用场景

TaskManager 使用单例模式确保全局只有一个任务管理实例。

#### 为什么使用 Singleton？

1. **全局状态共享**: 多个 API 端点需要访问同一个任务状态
2. **线程安全**: 使用线程锁保证并发访问安全
3. **资源一致性**: 避免创建多个管理器导致状态不一致

#### 实际应用示例

**TaskManager** (`/backend/app/models/task.py`):

```python
class TaskManager:
    """任务管理器 - 线程安全的单例模式"""

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        """单例模式实现"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._tasks: Dict[str, Task] = {}
                    cls._instance._task_lock = threading.Lock()
        return cls._instance

    def create_task(self, task_type: str, metadata: Optional[Dict] = None) -> str:
        """创建新任务"""
        # 实现细节...
```

#### 双重检查锁定

使用双重检查锁定（Double-Checked Locking）确保单例创建的线程安全：

```python
if cls._instance is None:              # 第一次检查（无锁）
    with cls._lock:                     # 加锁
        if cls._instance is None:       # 第二次检查（有锁）
            cls._instance = super().__new__(cls)
```

---

### Dataclass 模式

#### 应用场景

使用 Python `@dataclass` 装饰器定义数据结构，替代传统的类定义。

#### 为什么使用 Dataclass？

1. **样板代码减少**: 自动生成 `__init__`, `__repr__`, `__eq__` 等方法
2. **类型安全**: 配合类型注解提供更好的类型检查
3. **不可变性**: 通过 `frozen=True` 实现不可变对象
4. **可读性**: 清晰的字段定义，易于理解数据结构

#### 实际应用示例

**SimulationState** (`/backend/app/services/simulation_manager.py`):

```python
@dataclass
class SimulationState:
    """模拟状态"""
    simulation_id: str
    project_id: str
    graph_id: str

    # 平台启用状态
    enable_twitter: bool = True
    enable_reddit: bool = True

    # 状态
    status: SimulationStatus = SimulationStatus.CREATED

    # 准备阶段数据
    entities_count: int = 0
    profiles_count: int = 0
    entity_types: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典（API 返回使用）"""
        return {
            "simulation_id": self.simulation_id,
            "status": self.status.value,
            # ...
        }
```

**SimulationParameters** (`/backend/app/services/simulation_config_generator.py`):

```python
@dataclass
class SimulationParameters:
    """完整的模拟参数配置"""
    simulation_id: str
    project_id: str
    graph_id: str

    # 时间配置
    time_config: TimeSimulationConfig = field(default_factory=TimeSimulationConfig)

    # 事件配置
    event_config: EventConfig = field(default_factory=EventConfig)

    # Agent 配置列表
    agent_configs: List[AgentActivityConfig] = field(default_factory=list)

    # 平台配置
    platform_configs: Dict[str, PlatformConfig] = field(default_factory=dict)
```

---

### Strategy 模式

#### 应用场景

不同平台的 Profile 生成使用策略模式，支持动态切换平台格式。

#### 为什么使用 Strategy？

1. **算法封装**: 将不同平台的格式转换逻辑封装为独立策略
2. **运行时切换**: 可以在运行时选择使用哪个策略
3. **扩展性**: 新增平台只需添加新策略，无需修改现有代码

#### 实际应用示例

**OasisAgentProfile** (`/backend/app/services/oasis_profile_generator.py`):

```python
@dataclass
class OasisAgentProfile:
    """OASIS Agent Profile 数据结构"""
    user_id: int
    user_name: str
    name: str
    bio: str
    persona: str

    # 平台特定字段
    karma: int = 100           # Reddit 风格
    friend_count: int = 100    # Twitter 风格

    def to_reddit_format(self) -> Dict[str, Any]:
        """转换为 Reddit 平台格式（策略 1）"""
        profile = {
            "user_id": self.user_id,
            "username": self.user_name,
            "name": self.name,
            "bio": self.bio,
            "persona": self.persona,
            "karma": self.karma,
            "created_at": self.created_at,
        }
        return profile

    def to_twitter_format(self) -> Dict[str, Any]:
        """转换为 Twitter 平台格式（策略 2）"""
        profile = {
            "user_id": self.user_id,
            "username": self.user_name,
            "name": self.name,
            "bio": self.bio,
            "persona": self.persona,
            "friend_count": self.friend_count,
            "follower_count": self.follower_count,
            "created_at": self.created_at,
        }
        return profile
```

**使用策略**:

```python
# 根据平台选择转换策略
if platform == "reddit":
    profile_data = profile.to_reddit_format()
elif platform == "twitter":
    profile_data = profile.to_twitter_format()
```

---

## 前端设计模式

### Composition API 模式

#### 应用场景

Vue 3 Composition API 是整个前端的核心模式，用于组织组件逻辑。

#### 为什么使用 Composition API？

1. **逻辑复用**: 可以将相关逻辑组合在一起，跨组件复用
2. **更好的类型推断**: 配合 TypeScript 提供更好的类型支持
3. **代码组织**: 按功能而非选项组织代码，更易维护
4. **性能优化**: 更精确的响应式追踪

#### 实际应用示例

**Step1GraphBuild.vue** (`/frontend/src/components/Step1GraphBuild.vue`):

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 响应式状态
const currentPhase = ref(0)
const ontologyProgress = ref(null)
const selectedOntologyItem = ref(null)
const projectData = ref(null)

// 计算属性
const statusClass = computed(() => {
  return {
    'status-active': currentPhase.value === 0,
    'status-completed': currentPhase.value > 0
  }
})

// 监听器
watch(currentPhase, (newPhase) => {
  if (newPhase === 1) {
    loadGraphStats()
  }
})

// 生命周期
onMounted(() => {
  loadProjectData()
})

// 方法
const selectOntologyItem = (item, type) => {
  selectedOntologyItem.value = {
    ...item,
    itemType: type
  }
}
</script>
```

#### Composition API 的优势

**传统 Options API**:
```javascript
export default {
  data() {
    return {
      currentPhase: 0,
      projectData: null
    }
  },
  computed: {
    statusClass() {
      return { /* ... */ }
    }
  },
  methods: {
    selectOntologyItem(item, type) {
      // ...
    }
  }
}
```

**Composition API**: 逻辑更集中，更易理解和维护

---

### Reactive Store 模式

#### 应用场景

使用 Vue 3 的 `reactive` 创建轻量级状态管理，避免引入 Vuex。

#### 为什么使用 Reactive Store？

1. **简单轻量**: 对于小型应用，无需引入重型状态管理库
2. **响应式自动更新**: 利用 Vue 的响应式系统
3. **跨组件共享**: 在不同组件间共享状态

#### 实际应用示例

**pendingUpload.js** (`/frontend/src/store/pendingUpload.js`):

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

export function getPendingUpload() {
  return {
    files: state.files,
    simulationRequirement: state.simulationRequirement,
    isPending: state.isPending
  }
}

export function clearPendingUpload() {
  state.files = []
  state.simulationRequirement = ''
  state.isPending = false
}

export default state
```

**使用方式**:

```javascript
// 在 Home.vue 中设置状态
import { setPendingUpload } from '@/store/pendingUpload'

const handleStart = () => {
  setPendingUpload(files.value, requirement.value)
  router.push('/process')
}

// 在 Process.vue 中读取状态
import { getPendingUpload, clearPendingUpload } from '@/store/pendingUpload'

const { files, simulationRequirement } = getPendingUpload()
```

---

### Progressive Enhancement 模式

#### 应用场景

组件设计采用渐进增强原则，从基础功能开始，逐步添加高级特性。

#### 为什么使用 Progressive Enhancement？

1. **降级友好**: 基础功能在所有情况下可用
2. **性能优化**: 按需加载高级功能
3. **用户体验**: 核心功能快速可用，增强功能逐步加载

#### 实际应用示例

**Step3Simulation.vue** (`/frontend/src/components/Step3Simulation.vue`):

```vue
<template>
  <div class="simulation-panel">
    <!-- 基础功能：状态显示 -->
    <div class="platform-status">
      <span class="platform-name">Info Plaza</span>
      <span class="stat-value">{{ runStatus.twitter_current_round }}</span>
    </div>

    <!-- 渐进增强：详细信息（仅在数据可用时显示） -->
    <div v-if="runStatus.twitter_current_round" class="platform-stats">
      <span class="stat">
        <span class="stat-label">ROUND</span>
        <span class="stat-value">{{ runStatus.twitter_current_round }}</span>
      </span>
    </div>

    <!-- 高级功能：时间线（在事件数据加载后显示） -->
    <div v-if="allActions.length > 0" class="timeline-feed">
      <div v-for="action in chronologicalActions" :key="action.id">
        <!-- 事件详情 -->
      </div>
    </div>
  </div>
</template>
```

---

## 集成模式

### API Client 模式

#### 应用场景

统一的后端 API 调用封装，提供一致的接口和错误处理。

#### 为什么使用 API Client？

1. **统一配置**: 集中管理 baseURL、timeout 等配置
2. **错误处理**: 统一的错误拦截和处理
3. **请求/响应拦截**: 添加认证、日志等横切关注点
4. **类型安全**: 配合 TypeScript 提供类型提示

#### 实际应用示例

**index.js** (`/frontend/src/api/index.js`):

```javascript
import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  timeout: 300000, // 5分钟超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 可以在这里添加认证 token
    // config.headers['Authorization'] = 'Bearer ' + token
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器（容错重试机制）
service.interceptors.response.use(
  response => {
    const res = response.data

    // 统一处理 API 错误格式
    if (!res.success && res.success !== undefined) {
      console.error('API Error:', res.error || res.message)
      return Promise.reject(new Error(res.error || res.message))
    }

    return res
  },
  error => {
    // 处理网络错误、超时等
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('Request timeout')
    }

    if (error.message === 'Network Error') {
      console.error('Network error - please check your connection')
    }

    return Promise.reject(error)
  }
)

export default service
```

**模块化 API 定义** (`/frontend/src/api/simulation.js`):

```javascript
import service, { requestWithRetry } from './index'

/**
 * 创建模拟
 * @param {Object} data - { project_id, graph_id?, enable_twitter?, enable_reddit? }
 */
export const createSimulation = (data) => {
  return requestWithRetry(() => service.post('/api/simulation/create', data), 3, 1000)
}

/**
 * 准备模拟环境（异步任务）
 */
export const prepareSimulation = (data) => {
  return requestWithRetry(() => service.post('/api/simulation/prepare', data), 3, 1000)
}

/**
 * 获取模拟状态
 */
export const getSimulation = (simulationId) => {
  return service.get(`/api/simulation/${simulationId}`)
}
```

---

### Retry 模式

#### 应用场景

对外部 API 调用（如 LLM API）进行自动重试，处理临时网络故障。

#### 为什么使用 Retry？

1. **容错性**: 自动处理临时性故障
2. **指数退避**: 避免频繁重试导致服务压力
3. **抖动**: 防止多个客户端同时重试造成"惊群效应"

#### 后端实现

**retry.py** (`/backend/app/utils/retry.py`):

```python
def retry_with_backoff(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    max_delay: float = 30.0,
    backoff_factor: float = 2.0,
    jitter: bool = True,
    exceptions: Tuple[Type[Exception], ...] = (Exception,),
    on_retry: Optional[Callable[[Exception, int], None]] = None
):
    """
    带指数退避的重试装饰器

    Args:
        max_retries: 最大重试次数
        initial_delay: 初始延迟（秒）
        max_delay: 最大延迟（秒）
        backoff_factor: 退避因子
        jitter: 是否添加随机抖动
        exceptions: 需要重试的异常类型
        on_retry: 重试时的回调函数
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            delay = initial_delay

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)

                except exceptions as e:
                    last_exception = e

                    if attempt == max_retries:
                        logger.error(f"函数 {func.__name__} 在 {max_retries} 次重试后仍失败")
                        raise

                    # 计算延迟（带指数退避和抖动）
                    current_delay = min(delay, max_delay)
                    if jitter:
                        current_delay = current_delay * (0.5 + random.random())

                    logger.warning(
                        f"函数 {func.__name__} 第 {attempt + 1} 次尝试失败: {str(e)}, "
                        f"{current_delay:.1f}秒后重试..."
                    )

                    if on_retry:
                        on_retry(e, attempt + 1)

                    time.sleep(current_delay)
                    delay *= backoff_factor

            raise last_exception

        return wrapper
    return decorator
```

**使用示例**:

```python
@retry_with_backoff(max_retries=3, initial_delay=1.0)
def call_llm_api(prompt: str) -> str:
    """调用 LLM API，失败时自动重试"""
    client = LLMClient()
    response = client.chat(messages=[{"role": "user", "content": prompt}])
    return response
```

#### 前端实现

**index.js** (`/frontend/src/api/index.js`):

```javascript
/**
 * 带重试的请求函数
 * @param {Function} requestFn - 请求函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 初始延迟（毫秒）
 */
export const requestWithRetry = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      if (i === maxRetries - 1) throw error

      console.warn(`Request failed, retrying (${i + 1}/${maxRetries})...`)
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}
```

#### 重试策略

| 参数 | 说明 | 默认值 |
|-----|------|--------|
| max_retries | 最大重试次数 | 3 |
| initial_delay | 初始延迟 | 1.0 秒 |
| backoff_factor | 退避因子 | 2.0（每次延迟翻倍） |
| jitter | 随机抖动 | true（±50% 随机） |
| max_delay | 最大延迟 | 30.0 秒 |

**重试时间线示例**:
- 第 1 次失败：等待 1.0s（抖动后 0.5-1.5s）
- 第 2 次失败：等待 2.0s（抖动后 1.0-3.0s）
- 第 3 次失败：等待 4.0s（抖动后 2.0-6.0s）
- 第 4 次失败：抛出异常

---

## 设计模式总结

### 模式选择原则

1. **Service Layer**: 业务逻辑复杂，需要跨多个端点复用
2. **Singleton**: 全局唯一资源，需要线程安全
3. **Dataclass**: 纯数据结构，需要减少样板代码
4. **Strategy**: 算法族需要运行时切换
5. **Composition API**: 复杂组件逻辑需要组织
6. **Reactive Store**: 跨组件状态共享
7. **API Client**: 统一的外部接口调用
8. **Retry**: 不稳定的外部依赖

### 最佳实践

1. **不要过度设计**: 只在实际需要时引入设计模式
2. **保持简单**: 优先选择简单的解决方案
3. **文档先行**: 为每个模式编写清晰的文档
4. **代码审查**: 确保模式使用正确，不增加复杂度
5. **性能考量**: 权衡模式的收益和性能开销

### 相关文档

- [架构概述](./01-architecture-overview.md)
- [API 文档](./02-api-reference.md)
- [数据流](./04-data-flow.md)
