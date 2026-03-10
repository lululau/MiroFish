# 设计模式文档

本文档详细说明了 MiroFish 项目中使用的设计模式，特别关注 Flask 应用架构、API 组织和模拟系统中的核心模式。

## 目录

- [应用工厂模式](#应用工厂模式)
- [蓝图模式](#蓝图模式)
- [依赖注入模式](#依赖注入模式)
- [观察者模式](#观察者模式)
- [策略模式](#策略模式)

---

## 应用工厂模式

### 应用场景

MiroFish 后端使用 Flask 的**应用工厂模式**（Application Factory Pattern）来创建应用实例。这是 Flask 推荐的最佳实践。

### 架构设计

```
run.py (启动入口)
    ↓
app/__init__.py::create_app() (工厂函数)
    ↓
配置加载 → 蓝图注册 → 中间件注册 → 返回 app 实例
```

### 为什么使用应用工厂？

1. **测试隔离**: 可以为不同测试创建独立的应用实例
2. **配置灵活**: 可以传入不同的配置类创建不同环境的应用
3. **延迟初始化**: 避免在导入时就初始化应用，减少循环依赖
4. **多实例支持**: 理论上可以运行多个应用实例

### 实际应用示例

**工厂函数实现** (`/backend/app/__init__.py`):

```python
def create_app(config_class=Config):
    """Flask应用工厂函数"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 设置JSON编码：确保中文直接显示
    if hasattr(app, 'json') and hasattr(app.json, 'ensure_ascii'):
        app.json.ensure_ascii = False

    # 设置日志
    logger = setup_logger('mirofish')

    # 启用CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # 注册模拟进程清理函数
    from .services.simulation_runner import SimulationRunner
    SimulationRunner.register_cleanup()

    # 请求日志中间件
    @app.before_request
    def log_request():
        logger = get_logger('mirofish.request')
        logger.debug(f"请求: {request.method} {request.path}")

    @app.after_request
    def log_response(response):
        logger = get_logger('mirofish.request')
        logger.debug(f"响应: {response.status_code}")
        return response

    # 注册蓝图
    from .api import graph_bp, simulation_bp, report_bp
    app.register_blueprint(graph_bp, url_prefix='/api/graph')
    app.register_blueprint(simulation_bp, url_prefix='/api/simulation')
    app.register_blueprint(report_bp, url_prefix='/api/report')

    # 健康检查
    @app.route('/health')
    def health():
        return {'status': 'ok', 'service': 'MiroFish Backend'}

    return app
```

**使用工厂函数** (`/backend/run.py`):

```python
from app import create_app
from app.config import Config


def main():
    """主函数"""
    # 验证配置
    errors = Config.validate()
    if errors:
        print("配置错误:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    # 创建应用
    app = create_app()

    # 获取运行配置
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5001))
    debug = Config.DEBUG

    # 启动服务
    app.run(host=host, port=port, debug=debug, threaded=True)


if __name__ == '__main__':
    main()
```

### 工厂模式的优势

| 优势 | 说明 |
|------|------|
| **测试友好** | 可以为测试创建独立应用，不影响全局状态 |
| **配置分离** | 开发/测试/生产环境使用不同配置类 |
| **初始化控制** | 精确控制应用初始化顺序 |
| **避免循环导入** | 延迟导入蓝图，避免模块间循环依赖 |

---

## 蓝图模式

### 应用场景

Flask 的**蓝图模式**（Blueprint Pattern）用于组织 API 路由，将相关的路由分组到独立模块中。

### 架构设计

```
app/
├── __init__.py       # 工厂函数，注册蓝图
├── api/
│   ├── __init__.py   # 蓝图定义
│   ├── graph.py      # 图谱相关路由
│   ├── simulation.py # 模拟相关路由
│   └── report.py     # 报告相关路由
```

### 为什么使用蓝图？

1. **模块化**: 将相关路由组织到独立模块
2. **命名空间**: 为路由组提供 URL 前缀，避免冲突
3. **可维护性**: 大型应用中便于管理路由
4. **团队协作**: 不同开发者可以并行开发不同蓝图

### 实际应用示例

**蓝图定义** (`/backend/app/api/__init__.py`):

```python
"""
API路由模块
"""

from flask import Blueprint

# 定义三个蓝图
graph_bp = Blueprint('graph', __name__)
simulation_bp = Blueprint('simulation', __name__)
report_bp = Blueprint('report', __name__)

# 导入路由模块（必须在蓝图定义之后）
from . import graph  # noqa: E402, F401
from . import simulation  # noqa: E402, F401
from . import report  # noqa: E402, F401
```

**蓝图使用** (`/backend/app/__init__.py`):

```python
# 注册蓝图并设置 URL 前缀
from .api import graph_bp, simulation_bp, report_bp

app.register_blueprint(graph_bp, url_prefix='/api/graph')
app.register_blueprint(simulation_bp, url_prefix='/api/simulation')
app.register_blueprint(report_bp, url_prefix='/api/report')
```

**路由定义** (`/backend/app/api/simulation.py`):

```python
from . import simulation_bp
from ..services.simulation_manager import SimulationManager


@simulation_bp.route('/create', methods=['POST'])
def create_simulation():
    """创建模拟"""
    data = request.json
    state = simulation_manager.create_simulation(
        project_id=data.get('project_id'),
        graph_id=data.get('graph_id'),
        enable_twitter=data.get('enable_twitter', True),
        enable_reddit=data.get('enable_reddit', True),
    )
    return jsonify({"success": True, "data": state.to_simple_dict()})


@simulation_bp.route('/<simulation_id>/prepare', methods=['POST'])
def prepare_simulation(simulation_id: str):
    """准备模拟环境"""
    data = request.json
    # 业务逻辑...
```

### 蓝图 URL 结构

| 蓝图 | 前缀 | 示例路由 |
|------|------|----------|
| `graph_bp` | `/api/graph` | `/api/graph/create`, `/api/graph/<graph_id>` |
| `simulation_bp` | `/api/simulation` | `/api/simulation/create`, `/api/simulation/<id>/prepare` |
| `report_bp` | `/api/report` | `/api/report/create`, `/api/report/<report_id>` |

### 蓝图模式的最佳实践

1. **按功能划分**: 每个蓝图对应一个业务领域
2. **URL 前缀统一**: 所有 API 路由以 `/api/` 开头
3. **独立模块**: 每个蓝图文件独立，便于维护
4. **延迟导入**: 在 `__init__.py` 中先定义蓝图，再导入路由模块

---

## 依赖注入模式

### 应用场景

MiroFish 使用**依赖注入模式**（Dependency Injection）管理服务依赖，通过参数传递和全局单例实现松耦合。

### 架构设计

```
Config (配置类)
    ↓ 依赖注入
create_app(config_class=Config)
    ↓ 创建服务
SimulationManager, GraphBuilderService, etc.
    ↓ 注入到 API 路由
API endpoints use services
```

### 为什么使用依赖注入？

1. **松耦合**: 组件间通过接口通信，减少直接依赖
2. **可测试性**: 可以注入 Mock 对象进行单元测试
3. **灵活性**: 运行时可以替换不同实现
4. **配置管理**: 集中管理依赖项的配置

### 实际应用示例

**配置类注入** (`/backend/app/__init__.py`):

```python
def create_app(config_class=Config):
    """接受配置类作为参数，实现依赖注入"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    # ...
    return app
```

**服务层注入** (`/backend/app/api/simulation.py`):

```python
from ..services.simulation_manager import SimulationManager
from ..services.simulation_runner import SimulationRunner

# 全局单例服务实例
simulation_manager = SimulationManager()
simulation_runner = SimulationRunner()

@simulation_bp.route('/create', methods=['POST'])
def create_simulation():
    """API 端点使用注入的服务实例"""
    data = request.json
    # 使用服务实例处理业务逻辑
    state = simulation_manager.create_simulation(...)
    return jsonify({"success": True, "data": state.to_simple_dict()})
```

**进度回调注入** (`/backend/app/services/simulation_manager.py`):

```python
def prepare_simulation(
    self,
    simulation_id: str,
    simulation_requirement: str,
    document_text: str,
    defined_entity_types: Optional[List[str]] = None,
    use_llm_for_profiles: bool = True,
    progress_callback: Optional[callable] = None,  # 注入回调函数
    parallel_profile_count: int = 3
) -> SimulationState:
    """
    准备模拟环境

    Args:
        progress_callback: 进度回调函数 (stage, progress, message)
    """
    # 在关键步骤调用回调
    if progress_callback:
        progress_callback("reading", 30, "正在读取节点数据...")

    # 执行业务逻辑...

    if progress_callback:
        progress_callback("reading", 100, f"完成，共 {filtered.filtered_count} 个实体")
```

**API 层回调注入** (`/backend/app/api/simulation.py`):

```python
def _create_progress_callback(simulation_id: str):
    """创建进度回调函数（闭包）"""
    def callback(stage, progress, message, **kwargs):
        """更新模拟进度到状态文件"""
        state = simulation_manager.get_simulation(simulation_id)
        if state:
            state.current_stage = stage
            state.current_progress = progress
            state.current_message = message
            simulation_manager._save_simulation_state(state)
            logger.debug(f"[{simulation_id}] {stage}: {progress}% - {message}")

    return callback


@simulation_bp.route('/<simulation_id>/prepare', methods=['POST'])
def prepare_simulation_route(simulation_id: str):
    """准备模拟环境 - API 端点"""
    data = request.json

    # 注入进度回调
    progress_callback = _create_progress_callback(simulation_id)

    try:
        state = simulation_manager.prepare_simulation(
            simulation_id=simulation_id,
            simulation_requirement=data.get('simulation_requirement'),
            document_text=data.get('document_text'),
            defined_entity_types=data.get('entity_types'),
            use_llm_for_profiles=data.get('use_llm_for_profiles', True),
            progress_callback=progress_callback,  # 注入回调
        )
        return jsonify({"success": True, "data": state.to_simple_dict()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
```

### 依赖注入的类型

| 类型 | 示例 | 说明 |
|------|------|------|
| **构造函数注入** | `create_app(config_class=Config)` | 通过参数传入依赖 |
| **全局单例** | `simulation_manager = SimulationManager()` | 服务全局唯一实例 |
| **回调注入** | `progress_callback: Optional[callable]` | 注入回调函数实现观察者模式 |
| **配置注入** | `app.config.from_object(config_class)` | 通过配置对象注入配置 |

### 依赖注入最佳实践

1. **明确依赖**: 通过函数签名清晰声明依赖项
2. **可选依赖**: 使用 `Optional` 类型表示可选依赖
3. **接口隔离**: 只注入真正需要的依赖
4. **避免循环依赖**: 通过延迟导入解决循环依赖问题

---

## 观察者模式

### 应用场景

MiroFish 在模拟状态更新中使用**观察者模式**（Observer Pattern），通过回调函数实现实时进度通知。

### 架构设计

```
API Endpoint (观察者)
    ↓ 注册回调
SimulationManager.prepare_simulation(progress_callback)
    ↓ 状态变更
progress_callback(stage, progress, message)
    ↓ 通知观察者
更新状态文件 / 推送实时通知
```

### 为什么使用观察者模式？

1. **实时反馈**: 长时间运行的任务需要提供进度反馈
2. **解耦**: 被观察者不需要知道观察者的具体实现
3. **多观察者**: 可以注册多个观察者监听同一事件
4. **异步通知**: 观察者可以异步处理事件

### 实际应用示例

**进度回调定义** (`/backend/app/services/simulation_manager.py`):

```python
def prepare_simulation(
    self,
    simulation_id: str,
    simulation_requirement: str,
    document_text: str,
    defined_entity_types: Optional[List[str]] = None,
    use_llm_for_profiles: bool = True,
    progress_callback: Optional[callable] = None,  # 观察者回调
    parallel_profile_count: int = 3
) -> SimulationState:
    """
    准备模拟环境（全程自动化）

    Args:
        progress_callback: 进度回调函数
            参数: (stage: str, progress: int, message: str, **kwargs)
            stage: reading | generating_profiles | generating_config
            progress: 0-100
            message: 进度描述
    """
    state = self._load_simulation_state(simulation_id)
    if not state:
        raise ValueError(f"模拟不存在: {simulation_id}")

    try:
        state.status = SimulationStatus.PREPARING
        self._save_simulation_state(state)

        # ========== 阶段1: 读取并过滤实体 ==========
        if progress_callback:
            progress_callback("reading", 0, "正在连接Zep图谱...")

        reader = ZepEntityReader()

        if progress_callback:
            progress_callback("reading", 30, "正在读取节点数据...")

        filtered = reader.filter_defined_entities(
            graph_id=state.graph_id,
            defined_entity_types=defined_entity_types,
            enrich_with_edges=True
        )

        state.entities_count = filtered.filtered_count

        if progress_callback:
            progress_callback(
                "reading", 100,
                f"完成，共 {filtered.filtered_count} 个实体",
                current=filtered.filtered_count,
                total=filtered.filtered_count
            )

        # ========== 阶段2: 生成Agent Profile ==========
        total_entities = len(filtered.entities)

        def profile_progress(current, total, msg):
            """嵌套的进度回调（子观察者）"""
            if progress_callback:
                progress_callback(
                    "generating_profiles",
                    int(current / total * 100),
                    msg,
                    current=current,
                    total=total,
                    item_name=msg
                )

        profiles = generator.generate_profiles_from_entities(
            entities=filtered.entities,
            use_llm=use_llm_for_profiles,
            progress_callback=profile_progress,  # 传递子观察者
            # ...
        )

        # ... 其他阶段

    except Exception as e:
        if progress_callback:
            progress_callback("error", 0, f"准备失败: {str(e)}")
        raise
```

**观察者实现** (`/backend/app/api/simulation.py`):

```python
def _create_progress_callback(simulation_id: str):
    """
    创建进度回调函数（观察者工厂）

    该函数创建一个闭包，捕获 simulation_id 并提供
    状态更新逻辑
    """
    def callback(stage, progress, message, **kwargs):
        """
        观察者回调函数

        Args:
            stage: 当前阶段
            progress: 进度百分比 (0-100)
            message: 进度消息
            **kwargs: 额外信息（如 current, total, item_name）
        """
        # 更新模拟状态
        state = simulation_manager.get_simulation(simulation_id)
        if state:
            state.current_stage = stage
            state.current_progress = progress
            state.current_message = message
            simulation_manager._save_simulation_state(state)

            # 记录日志
            logger.debug(
                f"[{simulation_id}] {stage}: {progress}% - {message}"
            )

            # 额外信息处理
            if 'current' in kwargs and 'total' in kwargs:
                logger.info(
                    f"[{simulation_id}] 进度: {kwargs['current']}/{kwargs['total']}"
                )

    return callback


@simulation_bp.route('/<simulation_id>/prepare', methods=['POST'])
def prepare_simulation_route(simulation_id: str):
    """准备模拟环境 - 注册观察者"""
    data = request.json

    # 创建观察者（回调函数）
    progress_callback = _create_progress_callback(simulation_id)

    try:
        # 执行任务，观察者会接收进度更新
        state = simulation_manager.prepare_simulation(
            simulation_id=simulation_id,
            simulation_requirement=data.get('simulation_requirement'),
            document_text=data.get('document_text'),
            progress_callback=progress_callback,  # 注册观察者
        )
        return jsonify({"success": True, "data": state.to_simple_dict()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
```

### 观察者模式的阶段定义

| 阶段 | 说明 | 进度参数 |
|------|------|----------|
| `reading` | 读取 Zep 图谱实体 | `current`, `total` (实体数量) |
| `generating_profiles` | 生成 Agent Profile | `current`, `total`, `item_name` (当前实体名) |
| `generating_config` | LLM 生成模拟配置 | `current`, `total` (步骤数) |
| `error` | 发生错误 | 错误信息 |

### 观察者模式的优势

| 优势 | 说明 |
|------|------|
| **实时反馈** | 用户可以实时查看长时间运行任务的进度 |
| **解耦** | 模拟管理器不需要知道如何向客户端通知 |
| **可扩展** | 可以添加多个观察者（如日志、监控、通知） |
| **灵活性** | 观察者可以自定义处理逻辑 |

### 前端观察者实现

前端通过轮询 API 获取最新状态，实现观察者模式：

```javascript
// /frontend/src/api/simulation.js

/**
 * 轮询模拟准备进度
 */
export const pollPrepareProgress = async (simulationId, onUpdate) => {
  const maxAttempts = 200  // 最多轮询 200 次
  const interval = 1000    // 每秒轮询一次

  for (let i = 0; i < maxAttempts; i++) {
    const response = await getSimulation(simulationId)

    // 通知观察者
    if (onUpdate) {
      onUpdate(response.data)
    }

    // 检查是否完成
    if (response.data.status === 'ready') {
      return response.data
    }

    if (response.data.status === 'failed') {
      throw new Error(response.data.error || '准备失败')
    }

    // 等待下次轮询
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error('准备超时')
}
```

---

## 策略模式

### 应用场景

MiroFish 在 Agent Profile 生成和模拟配置中使用**策略模式**（Strategy Pattern），根据不同平台和类型选择不同的处理策略。

### 架构设计

```
OasisAgentProfile (策略上下文)
    ├── to_reddit_format()  (策略 1: Reddit)
    └── to_twitter_format() (策略 2: Twitter)

SimulationConfigGenerator
    ├── Twitter 策略
    └── Reddit 策略
```

### 为什么使用策略模式？

1. **算法封装**: 将不同平台的处理逻辑封装为独立策略
2. **运行时切换**: 根据配置动态选择策略
3. **扩展性**: 新增平台只需添加新策略
4. **消除条件语句**: 避免大量的 if-else 或 switch-case

### 实际应用示例

**平台策略** (`/backend/app/services/oasis_profile_generator.py`):

```python
@dataclass
class OasisAgentProfile:
    """OASIS Agent Profile 数据结构（策略上下文）"""
    user_id: int
    user_name: str
    name: str
    bio: str
    persona: str

    # 平台特定字段
    karma: int = 100           # Reddit 策略使用
    friend_count: int = 100    # Twitter 策略使用
    follower_count: int = 100  # Twitter 策略使用
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_reddit_format(self) -> Dict[str, Any]:
        """
        策略 1: 转换为 Reddit 平台格式

        Returns:
            Reddit 平台 Profile 字典
        """
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
        """
        策略 2: 转换为 Twitter 平台格式

        Returns:
            Twitter 平台 Profile 字典
        """
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

**策略选择** (`/backend/app/services/oasis_profile_generator.py`):

```python
def save_profiles(
    self,
    profiles: List[OasisAgentProfile],
    file_path: str,
    platform: str
):
    """
    保存 Profile 文件（策略分发）

    Args:
        profiles: Profile 列表
        file_path: 保存路径
        platform: 平台类型（决定使用哪个策略）
    """
    if platform == "reddit":
        # 使用 Reddit 策略
        profiles_data = [p.to_reddit_format() for p in profiles]
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(profiles_data, f, ensure_ascii=False, indent=2)

    elif platform == "twitter":
        # 使用 Twitter 策略
        # Twitter 使用 CSV 格式
        import csv
        with open(file_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'user_id', 'username', 'name', 'bio',
                'persona', 'friend_count', 'follower_count', 'created_at'
            ])
            for p in profiles:
                profile_data = p.to_twitter_format()
                writer.writerow([
                    profile_data['user_id'],
                    profile_data['username'],
                    profile_data['name'],
                    profile_data['bio'],
                    profile_data['persona'],
                    profile_data['friend_count'],
                    profile_data['follower_count'],
                    profile_data['created_at'],
                ])
    else:
        raise ValueError(f"不支持的平台: {platform}")
```

**Agent 类型策略** (`/backend/app/services/simulation_config_generator.py`):

```python
@dataclass
class AgentActivityConfig:
    """Agent 活动配置（策略上下文）"""
    agent_id: int
    agent_name: str
    platform: str  # twitter / reddit

    # 活动配置
    active_probability: float = 0.5
    post_probability: float = 0.3
    like_probability: float = 0.5
    comment_probability: float = 0.2

    # 立场（影响行为）
    stance: str = "neutral"  # supportive, opposing, neutral, observer

    def to_twitter_config(self) -> Dict[str, Any]:
        """策略: Twitter Agent 配置"""
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "active_probability": self.active_probability,
            "post_probability": self.post_probability,
            "like_probability": self.like_probability,
            "allowed_actions": [
                "CREATE_POST", "LIKE_POST", "REPOST",
                "FOLLOW", "DO_NOTHING", "QUOTE_POST"
            ],
            "stance": self.stance,
        }

    def to_reddit_config(self) -> Dict[str, Any]:
        """策略: Reddit Agent 配置"""
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "active_probability": self.active_probability,
            "post_probability": self.post_probability,
            "comment_probability": self.comment_probability,
            "allowed_actions": [
                "LIKE_POST", "DISLIKE_POST", "CREATE_POST",
                "CREATE_COMMENT", "LIKE_COMMENT", "DISLIKE_COMMENT",
                "SEARCH_POSTS", "SEARCH_USER", "TREND", "REFRESH",
                "DO_NOTHING", "FOLLOW", "MUTE"
            ],
            "stance": self.stance,
        }
```

### 策略对比

| 平台 | 格式 | 特有字段 | 允许的动作 |
|------|------|----------|-----------|
| **Reddit** | JSON | `karma` | LIKE_POST, DISLIKE_POST, CREATE_POST, CREATE_COMMENT, SEARCH_POSTS, TREND, etc. |
| **Twitter** | CSV | `friend_count`, `follower_count` | CREATE_POST, LIKE_POST, REPOST, FOLLOW, QUOTE_POST |

### 策略模式的扩展

添加新平台时，只需添加新策略方法：

```python
# 假设要添加 Mastodon 平台

@dataclass
class OasisAgentProfile:
    # ... 现有字段

    def to_mastodon_format(self) -> Dict[str, Any]:
        """新策略: Mastodon 平台"""
        profile = {
            "user_id": self.user_id,
            "username": self.user_name,
            "display_name": self.name,
            "note": self.bio,
            # ... Mastodon 特有字段
        }
        return profile
```

### 策略模式最佳实践

1. **策略接口**: 保持策略方法签名一致
2. **上下文独立**: 策略不应依赖其他策略
3. **策略选择**: 使用清晰的条件选择策略
4. **默认策略**: 提供合理的默认策略

---

## 设计模式总结

### 模式关系图

```
应用工厂模式
    ↓ 创建 Flask App
蓝图模式
    ↓ 注册 API 路由
依赖注入模式
    ↓ 注入服务实例
观察者模式
    ↓ 进度回调通知
策略模式
    ↓ 根据平台选择策略
```

### 模式选择指南

| 场景 | 推荐模式 | 原因 |
|------|----------|------|
| Flask 应用初始化 | 应用工厂模式 | 测试友好，配置灵活 |
| API 路由组织 | 蓝图模式 | 模块化，避免冲突 |
| 服务依赖管理 | 依赖注入模式 | 松耦合，易于测试 |
| 长时间任务进度 | 观察者模式 | 实时反馈，解耦 |
| 多平台适配 | 策略模式 | 运行时切换，易扩展 |

### 相关文档

- [后端架构概述](./03-backend/01-overview.md)
- [API 文档](./03-backend/02-api-graph.md)
- [服务层设计](./03-backend/06-services/01-ontology-generator.md)
- [前端组件模式](./04-frontend/02-components.md)
