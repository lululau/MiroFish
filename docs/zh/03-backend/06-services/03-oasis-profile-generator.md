# OASIS Profile Generator 服务文档

## 目录

- [服务概述](#服务概述)
- [核心类和方法](#核心类和方法)
- [Agent Profile 结构](#agent-profile-结构)
- [OASIS 配置](#oasis-配置)
- [使用示例](#使用示例)
- [实体类型处理](#实体类型处理)
- [Zep 图谱集成](#zep-图谱集成)

---

## 服务概述

### 功能描述

OASIS Profile Generator 服务负责为社交模拟生成 Agent 人设（Profile）。该服务将 Zep 知识图谱中的实体节点转换为 OASIS 模拟平台所需的 Agent Profile 格式，支持多种社交平台（Reddit、Twitter）。

### CAMEL-OASIS 集成

OASIS（Open Agent Social Interaction Simulation）是 CAMEL 框架的一部分，用于模拟社交网络中的 Agent 交互行为。本服务通过以下方式与 CAMEL-OASIS 集成：

1. **Profile 格式兼容**：生成的 Profile 符合 OASIS 平台的数据格式要求
2. **平台支持**：支持 Reddit（JSON 格式）和 Twitter（CSV 格式）两种平台
3. **人设丰富性**：通过 LLM 生成详细的 Agent 人设，包括性格、背景、行为模式等
4. **实体映射**：将 Zep 图谱实体映射为社交平台用户

### 核心特性

- **智能人设生成**：使用 LLM 根据实体信息生成详细的 Agent 人设
- **Zep 图谱检索**：通过 Zep 混合搜索获取实体相关的丰富上下文信息
- **实体类型区分**：区分个人实体和群体/机构实体，生成不同风格的人设
- **并行处理**：支持批量并行生成多个 Agent Profile
- **实时输出**：生成过程中实时写入文件，便于大任务监控
- **容错机制**：LLM 生成失败时自动降级到规则生成

---

## 核心类和方法

### OasisAgentProfile 类

数据类，表示 OASIS Agent Profile 的完整信息结构。

#### 类定义

```python
@dataclass
class OasisAgentProfile:
    """OASIS Agent Profile数据结构"""
    # 通用字段
    user_id: int                      # 用户ID
    user_name: str                    # 用户名
    name: str                         # 真实姓名
    bio: str                          # 简介（200字）
    persona: str                      # 详细人设描述（2000字）

    # Reddit风格字段
    karma: int = 1000                 # Karma积分

    # Twitter风格字段
    friend_count: int = 100           # 好友数量
    follower_count: int = 150         # 粉丝数量
    statuses_count: int = 500         # 状态数量

    # 额外人设信息
    age: Optional[int] = None         # 年龄
    gender: Optional[str] = None      # 性别 (male/female/other)
    mbti: Optional[str] = None        # MBTI类型
    country: Optional[str] = None     # 国家
    profession: Optional[str] = None  # 职业
    interested_topics: List[str] = field(default_factory=list)  # 兴趣话题

    # 来源实体信息
    source_entity_uuid: Optional[str] = None    # 来源实体UUID
    source_entity_type: Optional[str] = None    # 来源实体类型

    created_at: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
```

#### 主要方法

##### `to_reddit_format() -> Dict[str, Any]`

转换为 Reddit 平台格式（JSON）。

```python
def to_reddit_format(self) -> Dict[str, Any]:
    """转换为Reddit平台格式"""
    profile = {
        "user_id": self.user_id,
        "username": self.user_name,  # OASIS 库要求字段名为 username（无下划线）
        "name": self.name,
        "bio": self.bio,
        "persona": self.persona,
        "karma": self.karma,
        "created_at": self.created_at,
    }

    # 添加额外人设信息（如果有）
    if self.age:
        profile["age"] = self.age
    if self.gender:
        profile["gender"] = self.gender
    if self.mbti:
        profile["mbti"] = self.mbti
    if self.country:
        profile["country"] = self.country
    if self.profession:
        profile["profession"] = self.profession
    if self.interested_topics:
        profile["interested_topics"] = self.interested_topics

    return profile
```

##### `to_twitter_format() -> Dict[str, Any]`

转换为 Twitter 平台格式（CSV）。

```python
def to_twitter_format(self) -> Dict[str, Any]:
    """转换为Twitter平台格式"""
    profile = {
        "user_id": self.user_id,
        "username": self.user_name,
        "name": self.name,
        "bio": self.bio,
        "persona": self.persona,
        "friend_count": self.friend_count,
        "follower_count": self.follower_count,
        "statuses_count": self.statuses_count,
        "created_at": self.created_at,
    }

    # 添加额外人设信息
    if self.age:
        profile["age"] = self.age
    if self.gender:
        profile["gender"] = self.gender
    if self.mbti:
        profile["mbti"] = self.mbti
    if self.country:
        profile["country"] = self.country
    if self.profession:
        profile["profession"] = self.profession
    if self.interested_topics:
        profile["interested_topics"] = self.interested_topics

    return profile
```

##### `to_dict() -> Dict[str, Any]`

转换为完整字典格式。

---

### OasisProfileGenerator 类

OASIS Profile 生成器主类，负责从 Zep 实体生成 Agent Profile。

#### 初始化参数

```python
def __init__(
    self,
    api_key: Optional[str] = None,           # LLM API密钥
    base_url: Optional[str] = None,          # LLM API地址
    model_name: Optional[str] = None,        # LLM模型名称
    zep_api_key: Optional[str] = None,       # Zep API密钥
    graph_id: Optional[str] = None           # Zep图谱ID
):
```

#### 主要方法

##### `generate_profile_from_entity()`

从单个 Zep 实体生成 Agent Profile。

```python
def generate_profile_from_entity(
    self,
    entity: EntityNode,      # Zep实体节点
    user_id: int,            # 用户ID
    use_llm: bool = True     # 是否使用LLM生成详细人设
) -> OasisAgentProfile:
    """
    从Zep实体生成OASIS Agent Profile

    Args:
        entity: Zep实体节点
        user_id: 用户ID（用于OASIS）
        use_llm: 是否使用LLM生成详细人设

    Returns:
        OasisAgentProfile
    """
```

**使用示例**：

```python
from backend.app.services.oasis_profile_generator import OasisProfileGenerator
from backend.app.services.zep_entity_reader import ZepEntityReader

# 初始化生成器
generator = OasisProfileGenerator(
    zep_api_key="your-zep-api-key",
    graph_id="your-graph-id"
)

# 读取Zep实体
reader = ZepEntityReader(api_key="your-zep-api-key")
entity = reader.get_entity(entity_uuid="entity-uuid")

# 生成Profile
profile = generator.generate_profile_from_entity(
    entity=entity,
    user_id=0,
    use_llm=True
)

# 转换为平台格式
reddit_profile = profile.to_reddit_format()
twitter_profile = profile.to_twitter_format()
```

##### `generate_profiles_from_entities()`

批量生成 Agent Profile（支持并行处理）。

```python
def generate_profiles_from_entities(
    self,
    entities: List[EntityNode],                   # 实体列表
    use_llm: bool = True,                         # 是否使用LLM
    progress_callback: Optional[callable] = None,  # 进度回调
    graph_id: Optional[str] = None,               # 图谱ID
    parallel_count: int = 5,                      # 并行数量
    realtime_output_path: Optional[str] = None,   # 实时输出路径
    output_platform: str = "reddit"               # 输出平台
) -> List[OasisAgentProfile]:
    """
    批量从实体生成Agent Profile（支持并行生成）

    Args:
        entities: 实体列表
        use_llm: 是否使用LLM生成详细人设
        progress_callback: 进度回调函数 (current, total, message)
        graph_id: 图谱ID，用于Zep检索获取更丰富上下文
        parallel_count: 并行生成数量，默认5
        realtime_output_path: 实时写入的文件路径
        output_platform: 输出平台格式 ("reddit" 或 "twitter")

    Returns:
        Agent Profile列表
    """
```

**使用示例**：

```python
# 批量生成Profile
def progress_callback(current, total, message):
    print(f"[{current}/{total}] {message}")

profiles = generator.generate_profiles_from_entities(
    entities=entities,
    use_llm=True,
    progress_callback=progress_callback,
    graph_id="your-graph-id",
    parallel_count=10,
    realtime_output_path="./output/profiles.json",
    output_platform="reddit"
)

# 保存到文件
generator.save_profiles(
    profiles=profiles,
    file_path="./output/final_profiles.json",
    platform="reddit"
)
```

##### `save_profiles()`

保存 Profile 到文件。

```python
def save_profiles(
    self,
    profiles: List[OasisAgentProfile],  # Profile列表
    file_path: str,                      # 文件路径
    platform: str = "reddit"             # 平台类型
):
    """
    保存Profile到文件

    OASIS平台格式要求：
    - Twitter: CSV格式
    - Reddit: JSON格式

    Args:
        profiles: Profile列表
        file_path: 文件路径
        platform: 平台类型 ("reddit" 或 "twitter")
    """
```

**使用示例**：

```python
# 保存为Reddit格式（JSON）
generator.save_profiles(
    profiles=profiles,
    file_path="./output/reddit_profiles.json",
    platform="reddit"
)

# 保存为Twitter格式（CSV）
generator.save_profiles(
    profiles=profiles,
    file_path="./output/twitter_profiles.csv",
    platform="twitter"
)
```

##### `set_graph_id()`

设置 Zep 图谱 ID 用于检索。

```python
def set_graph_id(self, graph_id: str):
    """设置图谱ID用于Zep检索"""
    self.graph_id = graph_id
```

---

## Agent Profile 结构

### Profile 属性详解

#### 1. 基础信息字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `user_id` | int | 是 | 用户唯一标识（从0开始递增） |
| `user_name` | str | 是 | 系统用户名（自动生成，格式：`name_random`） |
| `name` | str | 是 | 真实姓名（来自实体名称） |
| `bio` | str | 是 | 简短简介（约200字，公开显示） |
| `persona` | str | 是 | 详细人设（约2000字，LLM系统提示） |

#### 2. 平台特定字段

##### Reddit 字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `karma` | int | 1000 | Reddit Karma积分 |

##### Twitter 字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `friend_count` | int | 100 | 好友数量 |
| `follower_count` | int | 150 | 粉丝数量 |
| `statuses_count` | int | 500 | 发帖数量 |

#### 3. 人设扩展字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `age` | Optional[int] | None | 年龄（整数） |
| `gender` | Optional[str] | None | 性别：`male`/`female`/`other` |
| `mbti` | Optional[str] | None | MBTI类型（如INTJ、ENFP） |
| `country` | Optional[str] | None | 国家（中文，如"中国"） |
| `profession` | Optional[str] | None | 职业描述 |
| `interested_topics` | List[str] | [] | 兴趣话题列表 |

#### 4. 来源追踪字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source_entity_uuid` | Optional[str] | None | 来源实体UUID |
| `source_entity_type` | Optional[str] | None | 来源实体类型 |
| `created_at` | str | 当前日期 | 创建日期（YYYY-MM-DD） |

### Persona 内容结构

Persona（人设描述）是 Agent 行为的核心指导，包含以下维度：

#### 个人实体的 Persona 结构

```markdown
1. 基本信息
   - 年龄、职业、教育背景、所在地

2. 人物背景
   - 重要经历
   - 与事件的关联
   - 社会关系

3. 性格特征
   - MBTI类型
   - 核心性格
   - 情绪表达方式

4. 社交媒体行为
   - 发帖频率
   - 内容偏好
   - 互动风格
   - 语言特点

5. 立场观点
   - 对话题的态度
   - 可能被激怒/感动的内容

6. 独特特征
   - 口头禅
   - 特殊经历
   - 个人爱好

7. 个人记忆
   - 与事件的关联
   - 已有动作与反应
```

#### 机构实体的 Persona 结构

```markdown
1. 机构基本信息
   - 正式名称
   - 机构性质
   - 成立背景
   - 主要职能

2. 账号定位
   - 账号类型
   - 目标受众
   - 核心功能

3. 发言风格
   - 语言特点
   - 常用表达
   - 禁忌话题

4. 发布内容特点
   - 内容类型
   - 发布频率
   - 活跃时间段

5. 立场态度
   - 对核心话题的官方立场
   - 面对争议的处理方式

6. 特殊说明
   - 代表的群体画像
   - 运营习惯

7. 机构记忆
   - 与事件的关联
   - 已有动作与反应
```

---

## OASIS 配置

### 必需配置项

在项目根目录的 `.env` 文件中配置以下环境变量：

```bash
# LLM配置（用于生成人设）
LLM_API_KEY=your-llm-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL_NAME=gpt-4o-mini

# Zep配置（用于图谱检索）
ZEP_API_KEY=your-zep-api-key
```

### 配置说明

#### LLM 配置

- **LLM_API_KEY**：LLM 服务提供商的 API 密钥（必需）
- **LLM_BASE_URL**：LLM API 地址（可选，默认：`https://api.openai.com/v1`）
- **LLM_MODEL_NAME**：使用的 LLM 模型（可选，默认：`gpt-4o-mini`）

支持的 LLM 提供商：
- OpenAI（GPT-4、GPT-3.5）
- Azure OpenAI
- 其他兼容 OpenAI API 格式的服务

#### Zep 配置

- **ZEP_API_KEY**：Zep 云服务 API 密钥（必需）

### OASIS 平台配置

在 `backend/app/config.py` 中定义的平台特定配置：

```python
# OASIS平台可用动作配置
OASIS_TWITTER_ACTIONS = [
    'CREATE_POST', 'LIKE_POST', 'REPOST', 'FOLLOW', 'DO_NOTHING', 'QUOTE_POST'
]

OASIS_REDDIT_ACTIONS = [
    'LIKE_POST', 'DISLIKE_POST', 'CREATE_POST', 'CREATE_COMMENT',
    'LIKE_COMMENT', 'DISLIKE_COMMENT', 'SEARCH_POSTS', 'SEARCH_USER',
    'TREND', 'REFRESH', 'DO_NOTHING', 'FOLLOW', 'MUTE'
]

# OASIS模拟配置
OASIS_DEFAULT_MAX_ROUNDS = 10  # 默认模拟轮数
```

### 与 CAMEL-OASIS 的交互

#### 输出格式要求

OASIS 平台对 Profile 格式有严格要求：

##### Reddit 格式（JSON）

```json
[
  {
    "user_id": 0,
    "username": "john_doe_123",
    "name": "John Doe",
    "bio": "简短的个人简介",
    "persona": "详细的Agent人设描述",
    "karma": 1000,
    "age": 25,
    "gender": "male",
    "mbti": "INTJ",
    "country": "中国",
    "profession": "Engineer",
    "interested_topics": ["Technology", "Science"],
    "created_at": "2026-03-10"
  }
]
```

##### Twitter 格式（CSV）

```csv
user_id,name,username,user_char,description
0,John Doe,john_doe_123,"详细人设 bio + persona","简短简介"
1,Jane Smith,jane_smith_456,"详细人设 bio + persona","简短简介"
```

**注意**：Twitter CSV 格式中的字段映射：
- `user_char`：完整人设（`bio + persona`），用于 LLM 系统提示
- `description`：简短简介（`bio`），公开显示

#### Persona 注入机制

生成的 `persona` 字段将被注入到 LLM 的系统提示中，指导 Agent 的行为：

```
System: You are simulating a social media user. Your persona is:

{persona}

Based on this persona, decide your next action...
```

---

## 使用示例

### 示例 1：基础使用

```python
from backend.app.services.oasis_profile_generator import OasisProfileGenerator
from backend.app.services.zep_entity_reader import ZepEntityReader

# 初始化服务
generator = OasisProfileGenerator(
    api_key="sk-xxx",
    base_url="https://api.openai.com/v1",
    model_name="gpt-4o-mini",
    zep_api_key="zep-xxx",
    graph_id="your-graph-id"
)

# 读取实体
reader = ZepEntityReader(api_key="zep-xxx")
entity = reader.get_entity(entity_uuid="abc123")

# 生成单个Profile
profile = generator.generate_profile_from_entity(
    entity=entity,
    user_id=0,
    use_llm=True
)

# 查看生成的人设
print(f"用户名: {profile.user_name}")
print(f"简介: {profile.bio}")
print(f"人设: {profile.persona[:200]}...")  # 打印前200字符
```

### 示例 2：批量生成并实时保存

```python
from backend.app.services.oasis_profile_generator import OasisProfileGenerator
from backend.app.services.zep_entity_reader import ZepEntityReader

# 初始化
generator = OasisProfileGenerator()
reader = ZepEntityReader()

# 获取所有实体
entities = reader.get_all_entities(
    graph_id="your-graph-id",
    limit=100
)

# 定义进度回调
def on_progress(current, total, message):
    print(f"进度: {current}/{total} - {message}")

# 批量生成（并行处理）
profiles = generator.generate_profiles_from_entities(
    entities=entities,
    use_llm=True,
    progress_callback=on_progress,
    graph_id="your-graph-id",
    parallel_count=10,
    realtime_output_path="./output/profiles.json",
    output_platform="reddit"
)

# 保存最终结果
generator.save_profiles(
    profiles=profiles,
    file_path="./output/final_profiles.json",
    platform="reddit"
)

print(f"成功生成 {len(profiles)} 个Agent Profile")
```

### 示例 3：使用规则生成（快速模式）

```python
# 不使用LLM，使用规则快速生成基础人设
profiles = generator.generate_profiles_from_entities(
    entities=entities,
    use_llm=False,  # 使用规则生成
    progress_callback=on_progress
)

# 规则生成的人设较简单，但速度更快
```

### 示例 4：为不同平台生成

```python
# 生成Profile
profile = generator.generate_profile_from_entity(
    entity=entity,
    user_id=0,
    use_llm=True
)

# 转换为Reddit格式
reddit_data = profile.to_reddit_format()
print(reddit_data)

# 转换为Twitter格式
twitter_data = profile.to_twitter_format()
print(twitter_data)

# 直接保存为不同格式
generator.save_profiles(
    profiles=[profile],
    file_path="./output/reddit.json",
    platform="reddit"
)

generator.save_profiles(
    profiles=[profile],
    file_path="./output/twitter.csv",
    platform="twitter"
)
```

---

## 实体类型处理

### 个人实体类型

以下实体类型会被识别为个人，生成具体的人物设定：

```python
INDIVIDUAL_ENTITY_TYPES = [
    "student",      # 学生
    "alumni",       # 校友
    "professor",    # 教授
    "person",       # 个人
    "publicfigure", # 公众人物
    "expert",       # 专家
    "faculty",      # 教职员工
    "official",     # 官员
    "journalist",   # 记者
    "activist"      # 活动家
]
```

**生成特点**：
- 包含具体年龄、性别、MBTI
- 详细的人物背景和经历
- 个人化的社交媒体行为模式
- 情感和立场的个性化描述

### 群体/机构实体类型

以下实体类型会被识别为群体/机构，生成代表性账号设定：

```python
GROUP_ENTITY_TYPES = [
    "university",        # 大学
    "governmentagency",  # 政府机构
    "organization",      # 组织
    "ngo",              # 非政府组织
    "mediaoutlet",      # 媒体
    "company",          # 公司
    "institution",      # 机构
    "group",            # 群体
    "community"         # 社区
]
```

**生成特点**：
- 年龄固定为30（虚拟年龄）
- 性别为 `other`（非个人）
- 机构化的发言风格
- 官方立场和态度描述
- 代表性而非个人化

### 实体类型判断

```python
# 判断是否是个人实体
is_individual = generator._is_individual_entity(entity_type)

# 判断是否是机构实体
is_group = generator._is_group_entity(entity_type)
```

---

## Zep 图谱集成

### Zep 检索功能

OASIS Profile Generator 使用 Zep 图谱的混合搜索功能来丰富 Agent 人设的上下文信息。

#### 检索流程

1. **并行搜索**：同时搜索边（事实/关系）和节点（实体摘要）
2. **去重合并**：去除重复信息，合并搜索结果
3. **上下文构建**：将检索结果整合为丰富的人设生成上下文

#### 检索方法

```python
def _search_zep_for_entity(self, entity: EntityNode) -> Dict[str, Any]:
    """
    使用Zep图谱混合搜索功能获取实体相关的丰富信息

    Returns:
        {
            "facts": [],           # 事实列表
            "node_summaries": [],  # 相关节点摘要
            "context": ""          # 综合上下文
        }
    """
```

#### 检索内容

##### 边搜索（Edges）

检索与实体相关的事实和关系：

```python
edge_result = zep_client.graph.search(
    query=comprehensive_query,
    graph_id=self.graph_id,
    limit=30,
    scope="edges",      # 搜索边
    reranker="rrf"      # 使用RRF重排序
)
```

##### 节点搜索（Nodes）

检索与实体相关的其他节点：

```python
node_result = zep_client.graph.search(
    query=comprehensive_query,
    graph_id=self.graph_id,
    limit=20,
    scope="nodes",      # 搜索节点
    reranker="rrf"
)
```

### 上下文构建

检索到的信息被整合到人设生成的上下文中：

```python
def _build_entity_context(self, entity: EntityNode) -> str:
    """
    构建实体的完整上下文信息

    包括：
    1. 实体本身的边信息（事实）
    2. 关联节点的详细信息
    3. Zep混合检索到的丰富信息
    """
```

#### 上下文结构

```markdown
### 实体属性
- key1: value1
- key2: value2

### 相关事实和关系
- 事实1
- 事实2

### 关联实体信息
- **实体名**: 实体摘要

### Zep检索到的事实信息
- 检索到的事实1
- 检索到的事实2

### Zep检索到的相关节点
- 相关节点1
- 相关节点2
```

### 重试机制

Zep 检索包含重试机制，确保检索的稳定性：

```python
# 边搜索重试
for attempt in range(max_retries):
    try:
        return self.zep_client.graph.search(...)
    except Exception as e:
        if attempt < max_retries - 1:
            time.sleep(delay)
            delay *= 2  # 指数退避
```

### 性能优化

- **并行检索**：使用 `ThreadPoolExecutor` 同时搜索边和节点
- **超时控制**：设置30秒超时避免长时间等待
- **结果缓存**：检索结果在生成过程中被重复使用

---

## 容错机制

### LLM 生成失败处理

当 LLM 生成人设失败时，服务会自动降级到规则生成：

```python
# 尝试多次生成
for attempt in range(max_attempts):
    try:
        result = json.loads(content)
        return result
    except json.JSONDecodeError:
        # 尝试修复JSON
        result = self._try_fix_json(content, ...)
        if result.get("_fixed"):
            return result

# 所有尝试失败，使用规则生成
return self._generate_profile_rule_based(...)
```

### JSON 修复机制

服务包含多种 JSON 修复策略：

1. **截断修复**：修复被 `max_tokens` 截断的 JSON
2. **正则提取**：从损坏的内容中提取 JSON 部分
3. **换行符处理**：替换字符串中的未转义换行符
4. **部分提取**：至少提取 `bio` 和 `persona` 字段
5. **默认生成**：完全失败时返回基础结构

### 实时容错

在批量生成过程中，单个实体的失败不会影响整体进度：

```python
try:
    profile = self.generate_profile_from_entity(...)
    return idx, profile, None
except Exception as e:
    # 创建备用基础profile
    fallback_profile = OasisAgentProfile(...)
    return idx, fallback_profile, str(e)
```

---

## 最佳实践

### 1. 选择合适的生成模式

- **LLM 模式**（`use_llm=True`）：生成详细、丰富的人设，适合需要高质量模拟的场景
- **规则模式**（`use_llm=False`）：快速生成基础人设，适合测试或快速原型

### 2. 合理设置并行数

```python
# 根据API限制和机器性能调整
parallel_count = 5   # 默认，适合大多数情况
parallel_count = 10  # 高性能机器
parallel_count = 2   # API限制严格时
```

### 3. 使用实时输出

对于大规模生成任务，启用实时输出避免数据丢失：

```python
profiles = generator.generate_profiles_from_entities(
    entities=entities,
    realtime_output_path="./output/profiles.json",  # 实时保存
    output_platform="reddit"
)
```

### 4. 监控生成进度

使用进度回调实时了解生成状态：

```python
def on_progress(current, total, message):
    print(f"[{current}/{total}] {message}")
    # 可以发送到日志系统或UI显示

profiles = generator.generate_profiles_from_entities(
    entities=entities,
    progress_callback=on_progress
)
```

### 5. 验证配置

在开始生成前验证必需配置：

```python
from backend.app.config import Config

errors = Config.validate()
if errors:
    print(f"配置错误: {errors}")
    exit(1)
```

---

## 常见问题

### Q1: LLM 生成的人设为什么被截断？

**A**: 可能是 `max_tokens` 限制导致的。服务会自动尝试修复被截断的 JSON。如果频繁发生，考虑：
- 使用支持更长输出的模型
- 检查 API 的 `max_tokens` 限制

### Q2: 如何提高人设质量？

**A**:
1. 确保设置 `use_llm=True`
2. 提供 `graph_id` 启用 Zep 检索
3. 使用更强大的 LLM 模型（如 GPT-4）
4. 丰富 Zep 图谱中的实体信息

### Q3: 机构实体和人如何区分？

**A**: 服务根据实体的 `entity_type` 自动识别：
- 个人类型：student, professor, person, expert 等
- 机构类型：university, organization, mediaoutlet 等

### Q4: 生成的 Profile 可以直接用于 OASIS 吗？

**A**: 是的，生成的 Profile 完全符合 CAMEL-OASIS 的格式要求。可以直接用于模拟：

```python
from camel.messages import OASISMessage
from camel.oasis import OasisSocial

# 使用生成的Profile
social_platform = OasisSocial(platform_type="Reddit")
agent = social_platform.create_agent(profile=reddit_profile)
```

### Q5: 如何处理敏感内容？

**A**:
1. 在 LLM 系统提示中添加内容过滤规则
2. 对生成的人设进行后处理和审核
3. 使用支持内容安全过滤的 LLM API

---

## 相关文档

- [Zep Entity Reader 服务](./02-zep-entity-reader.md)
- [后端服务概述](./01-backend-services.md)
- [配置管理](../04-configuration.md)

---

## 更新日志

### v1.0.0 (2026-03-10)
- 初始版本
- 支持从 Zep 实体生成 Agent Profile
- 支持 Reddit 和 Twitter 平台
- 集成 Zep 图谱检索
- 支持并行批量生成
- 实时输出功能
- 完整的容错机制

---

**文档版本**: 1.0.0
**最后更新**: 2026-03-10
**维护者**: MiroFish Team
