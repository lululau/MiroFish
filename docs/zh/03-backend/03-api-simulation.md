# 模拟 API 文档

本文档详细说明了 MiroFish 系统中与模拟运行相关的所有 API 接口。

## 目录

- [实体查询](#实体查询)
- [模拟管理](#模拟管理)
- [模拟准备](#模拟准备)
- [模拟运行控制](#模拟运行控制)
- [状态查询](#状态查询)
- [数据查询](#数据查询)
- [文件下载](#文件下载)
- [Interview 采访接口](#interview-采访接口)
- [环境管理](#环境管理)

---

## 实体查询

### 1. 获取图谱实体列表

从 Zep 图谱中获取所有实体（已过滤，只返回符合预定义实体类型的节点）。

**端点:** `GET /api/simulation/entities/<graph_id>`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| graph_id | string | 是 | 图谱ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| entity_types | string | 否 | 逗号分隔的实体类型列表，用于进一步过滤 |
| enrich | boolean | 否 | 是否获取相关边信息，默认true |

**请求示例:**

```bash
# 获取所有实体
curl -X GET http://localhost:5000/api/simulation/entities/mirofish_abc123

# 按类型过滤
curl -X GET "http://localhost:5000/api/simulation/entities/mirofish_abc123?entity_types=Student,Professor"
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "filtered_count": 68,
    "total_count": 150,
    "entity_types": ["Student", "Professor", "University"],
    "entities": [
      {
        "uuid": "entity_uuid_1",
        "name": "张三",
        "labels": ["Entity", "Student"],
        "summary": "武汉大学计算机系学生"
      }
    ]
  }
}
```

---

### 2. 获取单个实体详情

获取单个实体的详细信息和相关上下文。

**端点:** `GET /api/simulation/entities/<graph_id>/<entity_uuid>`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| graph_id | string | 是 | 图谱ID |
| entity_uuid | string | 是 | 实体UUID |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/entities/mirofish_abc123/entity_uuid_1
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "uuid": "entity_uuid_1",
    "name": "张三",
    "labels": ["Entity", "Student"],
    "summary": "武汉大学计算机系学生",
    "attributes": {
      "full_name": "张三",
      "major": "计算机科学"
    },
    "related_edges": [
      {
        "relation": "STUDIES_AT",
        "target": "武汉大学"
      }
    ]
  }
}
```

**错误响应:**

```json
{
  "success": false,
  "error": "实体不存在: entity_uuid_1"
}
```

---

### 3. 按类型获取实体

获取指定类型的所有实体。

**端点:** `GET /api/simulation/entities/<graph_id>/by-type/<entity_type>`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| graph_id | string | 是 | 图谱ID |
| entity_type | string | 是 | 实体类型 |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enrich | boolean | 否 | 是否获取相关边信息，默认true |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/entities/mirofish_abc123/by-type/Student
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "entity_type": "Student",
    "count": 25,
    "entities": [
      {
        "uuid": "entity_uuid_1",
        "name": "张三",
        "labels": ["Entity", "Student"],
        "summary": "武汉大学计算机系学生"
      }
    ]
  }
}
```

---

## 模拟管理

### 1. 创建模拟

创建一个新的模拟实例。

**端点:** `POST /api/simulation/create`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| project_id | string | 是 | 项目ID |
| graph_id | string | 否 | 图谱ID（如不提供则从项目获取） |
| enable_twitter | boolean | 否 | 是否启用Twitter模拟，默认true |
| enable_reddit | boolean | 否 | 是否启用Reddit模拟，默认true |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_abc123",
    "graph_id": "mirofish_xyz789",
    "enable_twitter": true,
    "enable_reddit": true
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "project_id": "proj_abc123",
    "graph_id": "mirofish_xyz789",
    "status": "created",
    "enable_twitter": true,
    "enable_reddit": true,
    "created_at": "2025-12-01T10:00:00"
  }
}
```

---

### 2. 获取模拟详情

获取指定模拟的详细信息。

**端点:** `GET /api/simulation/{simulation_id}`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "project_id": "proj_abc123",
    "graph_id": "mirofish_xyz789",
    "status": "ready",
    "entities_count": 68,
    "enable_twitter": true,
    "enable_reddit": true,
    "created_at": "2025-12-01T10:00:00",
    "updated_at": "2025-12-01T11:00:00",
    "run_instructions": {
      "command": "python run_parallel_simulation.py",
      "working_dir": "/path/to/simulation"
    }
  }
}
```

---

### 3. 列出所有模拟

获取所有模拟列表，支持按项目过滤。

**端点:** `GET /api/simulation/list`

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| project_id | string | 否 | 按项目ID过滤 |

**请求示例:**

```bash
# 获取所有模拟
curl -X GET http://localhost:5000/api/simulation/list

# 按项目过滤
curl -X GET http://localhost:5000/api/simulation/list?project_id=proj_abc123
```

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "simulation_id": "sim_def456",
      "project_id": "proj_abc123",
      "status": "ready",
      "entities_count": 68,
      "created_at": "2025-12-01T10:00:00"
    }
  ],
  "count": 1
}
```

---

### 4. 获取历史模拟列表

获取历史模拟列表（带项目详情），用于首页展示。

**端点:** `GET /api/simulation/history`

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | integer | 否 | 返回数量限制，默认20 |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/history?limit=10
```

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "simulation_id": "sim_def456",
      "project_id": "proj_abc123",
      "project_name": "武大舆情分析",
      "simulation_requirement": "如果武汉大学发布...",
      "status": "completed",
      "entities_count": 68,
      "profiles_count": 68,
      "entity_types": ["Student", "Professor"],
      "created_at": "2024-12-10",
      "updated_at": "2024-12-10",
      "total_rounds": 120,
      "current_round": 120,
      "report_id": "report_xyz789",
      "version": "v1.0.2"
    }
  ],
  "count": 1
}
```

---

## 模拟准备

### 5. 准备模拟环境

准备模拟环境（异步任务），包括生成Agent Profiles和模拟配置。

**端点:** `POST /api/simulation/prepare`

**特性:**
- 自动检测已完成的准备工作，避免重复生成
- 如果已准备完成，直接返回已有结果
- 支持强制重新生成（force_regenerate=true）

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |
| entity_types | array | 否 | 指定实体类型 |
| use_llm_for_profiles | boolean | 否 | 是否用LLM生成人设，默认true |
| parallel_profile_count | integer | 否 | 并行生成人设数量，默认5 |
| force_regenerate | boolean | 否 | 强制重新生成，默认false |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "entity_types": ["Student", "Professor"],
    "use_llm_for_profiles": true,
    "parallel_profile_count": 5,
    "force_regenerate": false
  }'
```

**响应示例 (新任务):**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "task_id": "task_abc123",
    "status": "preparing",
    "message": "准备任务已启动，请通过 /api/simulation/prepare/status 查询进度",
    "already_prepared": false,
    "expected_entities_count": 68,
    "entity_types": ["Student", "Professor"]
  }
}
```

**响应示例 (已完成):**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "status": "ready",
    "message": "已有完成的准备工作，无需重复生成",
    "already_prepared": true,
    "prepare_info": {
      "status": "ready",
      "entities_count": 68,
      "profiles_count": 68,
      "entity_types": ["Student", "Professor"],
      "config_generated": true,
      "created_at": "2025-12-01T10:00:00",
      "updated_at": "2025-12-01T11:00:00"
    }
  }
}
```

---

### 6. 查询准备任务进度

查询准备任务的进度状态。

**端点:** `POST /api/simulation/prepare/status`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| task_id | string | 否* | prepare返回的task_id |
| simulation_id | string | 否* | 模拟ID（用于检查已完成的准备） |

*至少提供其中一个参数

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/prepare/status \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task_abc123"
  }'
```

**响应示例 (进行中):**

```json
{
  "success": true,
  "data": {
    "task_id": "task_abc123",
    "status": "processing",
    "progress": 45,
    "message": "[2/4] 生成Agent人设: 30/68 - 正在生成学生实体人设",
    "progress_detail": {
      "current_stage": "generating_profiles",
      "current_stage_name": "生成Agent人设",
      "stage_index": 2,
      "total_stages": 4,
      "stage_progress": 44,
      "current_item": 30,
      "total_items": 68,
      "item_description": "正在生成学生实体人设"
    },
    "created_at": "2025-12-01T10:00:00",
    "updated_at": "2025-12-01T10:05:00"
  }
}
```

**响应示例 (已完成):**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "task_id": "task_abc123",
    "status": "completed",
    "progress": 100,
    "message": "准备工作已完成",
    "already_prepared": true,
    "prepare_info": {
      "status": "ready",
      "entities_count": 68,
      "profiles_count": 68
    }
  }
}
```

---

### 7. 获取模拟配置

获取LLM智能生成的完整模拟配置。

**端点:** `GET /api/simulation/{simulation_id}/config`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/config
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "time_config": {
      "total_simulation_hours": 72,
      "minutes_per_round": 30,
      "start_hour": 8,
      "end_hour": 23,
      "peak_hours": [9, 12, 18, 21],
      "low_activity_hours": [13, 14, 22]
    },
    "agent_configs": [
      {
        "agent_id": 0,
        "activity_level": "high",
        "posts_per_day_range": [5, 10],
        "stance": "supportive",
        "communication_style": "formal"
      }
    ],
    "event_config": {
      "initial_posts": [
        {
          "platform": "reddit",
          "agent_id": 0,
          "content": "武汉大学宣布新政策..."
        }
      ],
      "hot_topics": ["教育改革", "校园生活"]
    },
    "reddit_config": {
      "subreddit": "whu",
      "upvote_ratio_mean": 0.7,
      "upvote_ratio_std": 0.15
    },
    "twitter_config": {
      "hashtag": "#WHU",
      "retweet_probability": 0.3
    },
    "simulation_requirement": "如果武汉大学发布...",
    "generated_at": "2025-12-01T10:00:00",
    "llm_model": "gpt-4o-mini",
    "generation_reasoning": "基于模拟需求，配置了..."
  }
}
```

---

### 8. 获取Agent Profiles

获取模拟中的Agent Profile列表。

**端点:** `GET /api/simulation/{simulation_id}/profiles`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 平台类型（reddit/twitter），默认reddit |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/profiles?platform=reddit
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "platform": "reddit",
    "count": 68,
    "profiles": [
      {
        "agent_id": 0,
        "name": "张三",
        "age": 22,
        "gender": "male",
        "occupation": "student",
        "personality": "outgoing",
        "interests": ["科技", "音乐"],
        "bio": "武汉大学计算机系学生..."
      }
    ]
  }
}
```

---

### 9. 实时获取Agent Profiles

实时获取正在生成中的Agent Profile（用于进度展示）。

**端点:** `GET /api/simulation/{simulation_id}/profiles/realtime`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 平台类型（reddit/twitter），默认reddit |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/profiles/realtime?platform=reddit
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "platform": "reddit",
    "count": 15,
    "total_expected": 68,
    "is_generating": true,
    "file_exists": true,
    "file_modified_at": "2025-12-04T18:20:00",
    "profiles": [
      {
        "agent_id": 0,
        "name": "张三",
        "age": 22
      }
    ]
  }
}
```

---

### 10. 实时获取模拟配置

实时获取正在生成中的模拟配置。

**端点:** `GET /api/simulation/{simulation_id}/config/realtime`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/config/realtime
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "file_exists": true,
    "file_modified_at": "2025-12-04T18:20:00",
    "is_generating": true,
    "generation_stage": "generating_config",
    "config_generated": false,
    "config": {
      "time_config": {...},
      "agent_configs": [...]
    },
    "summary": {
      "total_agents": 68,
      "simulation_hours": 72,
      "initial_posts_count": 5,
      "hot_topics_count": 3,
      "has_twitter_config": true,
      "has_reddit_config": true
    }
  }
}
```

---

## 模拟运行控制

### 11. 启动模拟

开始运行模拟。

**端点:** `POST /api/simulation/start`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |
| platform | string | 否 | 平台类型（twitter/reddit/parallel），默认parallel |
| max_rounds | integer | 否 | 最大模拟轮数，用于截断过长的模拟 |
| enable_graph_memory_update | boolean | 否 | 是否将Agent活动动态更新到Zep图谱记忆，默认false |
| force | boolean | 否 | 强制重新开始（会停止运行中的模拟并清理日志），默认false |

**关于 force 参数:**
- 启用后，如果模拟正在运行或已完成，会先停止并清理运行日志
- 清理的内容包括：run_state.json, actions.jsonl, simulation.log 等
- 不会清理配置文件（simulation_config.json）和 profile 文件

**关于 enable_graph_memory_update:**
- 启用后，模拟中所有Agent的活动都会实时更新到Zep图谱
- 这可以让图谱"记住"模拟过程，用于后续分析或AI对话
- 需要模拟关联的项目有有效的 graph_id

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/start \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "platform": "parallel",
    "max_rounds": 100,
    "enable_graph_memory_update": false,
    "force": false
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "runner_status": "running",
    "process_pid": 12345,
    "current_round": 0,
    "total_rounds": 144,
    "twitter_running": true,
    "reddit_running": true,
    "started_at": "2025-12-01T10:00:00",
    "graph_memory_update_enabled": false,
    "force_restarted": false
  }
}
```

---

### 12. 停止模拟

停止正在运行的模拟。

**端点:** `POST /api/simulation/stop`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/stop \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456"
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "runner_status": "stopped",
    "current_round": 50,
    "total_rounds": 144,
    "completed_at": "2025-12-01T12:00:00"
  }
}
```

---

## 状态查询

### 13. 获取运行状态

获取模拟运行的实时状态（用于前端轮询）。

**端点:** `GET /api/simulation/{simulation_id}/run-status`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/run-status
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "runner_status": "running",
    "current_round": 5,
    "total_rounds": 144,
    "progress_percent": 3.5,
    "simulated_hours": 2,
    "total_simulation_hours": 72,
    "twitter_running": true,
    "reddit_running": true,
    "twitter_actions_count": 150,
    "reddit_actions_count": 200,
    "total_actions_count": 350,
    "started_at": "2025-12-01T10:00:00",
    "updated_at": "2025-12-01T10:30:00"
  }
}
```

**状态值说明:**
- `idle`: 未运行
- `running`: 运行中
- `paused`: 已暂停
- `completed`: 已完成
- `stopped`: 已停止
- `failed`: 运行失败

---

### 14. 获取详细运行状态

获取模拟运行的详细状态（包含所有动作记录）。

**端点:** `GET /api/simulation/{simulation_id}/run-status/detail`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 过滤平台（twitter/reddit） |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/run-status/detail
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "runner_status": "running",
    "current_round": 5,
    "total_rounds": 144,
    "progress_percent": 3.5,
    "all_actions": [
      {
        "round_num": 5,
        "timestamp": "2025-12-01T10:30:00",
        "platform": "twitter",
        "agent_id": 3,
        "agent_name": "Agent Name",
        "action_type": "CREATE_POST",
        "action_args": {
          "content": "今天天气不错"
        },
        "result": null,
        "success": true
      }
    ],
    "twitter_actions": [...],
    "reddit_actions": [...],
    "recent_actions": [...],
    "rounds_count": 5
  }
}
```

---

## 数据查询

### 15. 获取帖子列表

从模拟数据库中获取帖子列表。

**端点:** `GET /api/simulation/{simulation_id}/posts`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 平台类型（twitter/reddit），默认reddit |
| limit | integer | 否 | 返回数量，默认50 |
| offset | integer | 否 | 偏移量，默认0 |

**请求示例:**

```bash
curl -X GET "http://localhost:5000/api/simulation/sim_def456/posts?platform=reddit&limit=20&offset=0"
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "platform": "reddit",
    "total": 150,
    "count": 20,
    "posts": [
      {
        "id": "post_123",
        "agent_id": 3,
        "content": "这是帖子内容",
        "created_at": "2025-12-01T10:00:00",
        "upvotes": 15,
        "downvotes": 2
      }
    ]
  }
}
```

---

### 16. 获取评论列表

获取模拟中的评论列表（仅Reddit）。

**端点:** `GET /api/simulation/{simulation_id}/comments`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| post_id | string | 否 | 过滤帖子ID |
| limit | integer | 否 | 返回数量，默认50 |
| offset | integer | 否 | 偏移量，默认0 |

**请求示例:**

```bash
curl -X GET "http://localhost:5000/api/simulation/sim_def456/comments?post_id=post_123&limit=10"
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "count": 10,
    "comments": [
      {
        "id": "comment_456",
        "post_id": "post_123",
        "agent_id": 5,
        "content": "这是评论内容",
        "created_at": "2025-12-01T10:05:00",
        "upvotes": 8
      }
    ]
  }
}
```

---

### 17. 获取动作历史

获取模拟中的Agent动作历史记录。

**端点:** `GET /api/simulation/{simulation_id}/actions`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | integer | 否 | 返回数量，默认100 |
| offset | integer | 否 | 偏移量，默认0 |
| platform | string | 否 | 过滤平台（twitter/reddit） |
| agent_id | integer | 否 | 过滤Agent ID |
| round_num | integer | 否 | 过滤轮次 |

**请求示例:**

```bash
curl -X GET "http://localhost:5000/api/simulation/sim_def456/actions?agent_id=3&limit=50"
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "count": 50,
    "actions": [
      {
        "round_num": 5,
        "timestamp": "2025-12-01T10:30:00",
        "platform": "twitter",
        "agent_id": 3,
        "action_type": "CREATE_POST",
        "action_args": {...},
        "success": true
      }
    ]
  }
}
```

---

### 18. 获取时间线

获取模拟时间线（按轮次汇总）。

**端点:** `GET /api/simulation/{simulation_id}/timeline`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_round | integer | 否 | 起始轮次，默认0 |
| end_round | integer | 否 | 结束轮次，默认全部 |

**请求示例:**

```bash
curl -X GET "http://localhost:5000/api/simulation/sim_def456/timeline?start_round=0&end_round=10"
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "rounds_count": 11,
    "timeline": [
      {
        "round_num": 1,
        "timestamp": "2025-12-01T10:00:00",
        "total_actions": 50,
        "twitter_actions": 20,
        "reddit_actions": 30,
        "posts_created": 15,
        "comments_created": 35
      }
    ]
  }
}
```

---

### 19. 获取Agent统计信息

获取每个Agent的统计信息。

**端点:** `GET /api/simulation/{simulation_id}/agent-stats`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/agent-stats
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "agents_count": 68,
    "stats": [
      {
        "agent_id": 0,
        "total_actions": 150,
        "posts_created": 30,
        "comments_created": 120,
        "upvotes_given": 80,
        "downvotes_given": 5,
        "last_action_at": "2025-12-01T11:00:00"
      }
    ]
  }
}
```

---

## 文件下载

### 20. 下载模拟配置文件

下载模拟配置文件（simulation_config.json）。

**端点:** `GET /api/simulation/<simulation_id>/config/download`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X GET http://localhost:5000/api/simulation/sim_def456/config/download -o config.json
```

**响应:** 直接返回 JSON 配置文件

---

### 21. 下载模拟脚本

下载模拟运行脚本。

**端点:** `GET /api/simulation/script/<script_name>/download`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| script_name | string | 是 | 脚本名称（run_twitter_simulation, run_reddit_simulation, run_parallel_simulation） |

**请求示例:**

```bash
# 下载 Twitter 模拟脚本
curl -X GET http://localhost:5000/api/simulation/script/run_twitter_simulation/download -o run_twitter_simulation.py

# 下载并行模拟脚本
curl -X GET http://localhost:5000/api/simulation/script/run_parallel_simulation/download -o run_parallel_simulation.py
```

**响应:** 直接返回 Python 脚本文件

**支持的脚本名称:**
- `run_twitter_simulation` - Twitter 单平台模拟脚本
- `run_reddit_simulation` - Reddit 单平台模拟脚本
- `run_parallel_simulation` - Twitter/Reddit 双平台并行模拟脚本

---

## Interview 采访接口

Interview 功能允许在模拟完成后对 Agent 进行采访，获取其对特定问题的观点和看法。

### 22. 采访单个 Agent

对单个 Agent 进行采访。

**端点:** `POST /api/simulation/interview`

**注意:** 此功能需要模拟环境处于运行状态（完成模拟循环后进入等待命令模式）

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |
| agent_id | integer | 是 | Agent ID |
| prompt | string | 是 | 采访问题 |
| platform | string | 否 | 指定平台（twitter/reddit），不指定则双平台同时采访 |
| timeout | integer | 否 | 超时时间（秒），默认60 |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/interview \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "agent_id": 0,
    "prompt": "你对这件事有什么看法？",
    "platform": "twitter",
    "timeout": 60
  }'
```

**响应示例 (指定platform):**

```json
{
  "success": true,
  "data": {
    "agent_id": 0,
    "prompt": "你对这件事有什么看法？",
    "result": {
      "agent_id": 0,
      "response": "我认为这个问题很复杂，需要从多个角度来考虑...",
      "platform": "twitter",
      "timestamp": "2025-12-08T10:00:00"
    },
    "timestamp": "2025-12-08T10:00:01"
  }
}
```

**响应示例 (不指定platform, 双平台):**

```json
{
  "success": true,
  "data": {
    "agent_id": 0,
    "prompt": "你对这件事有什么看法？",
    "result": {
      "agent_id": 0,
      "prompt": "...",
      "platforms": {
        "twitter": {
          "agent_id": 0,
          "response": "...",
          "platform": "twitter"
        },
        "reddit": {
          "agent_id": 0,
          "response": "...",
          "platform": "reddit"
        }
      }
    },
    "timestamp": "2025-12-08T10:00:01"
  }
}
```

---

### 23. 批量采访 Agent

批量采访多个 Agent。

**端点:** `POST /api/simulation/interview/batch`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |
| interviews | array | 是 | 采访列表，每项包含 agent_id 和 prompt |
| platform | string | 否 | 默认平台（twitter/reddit），不指定则双平台 |
| timeout | integer | 否 | 超时时间（秒），默认120 |

**interviews 数组项结构:**
```json
{
  "agent_id": 0,
  "prompt": "你对A有什么看法？",
  "platform": "twitter"  // 可选，指定该Agent的采访平台
}
```

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/interview/batch \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "interviews": [
      {
        "agent_id": 0,
        "prompt": "你对A有什么看法？",
        "platform": "twitter"
      },
      {
        "agent_id": 1,
        "prompt": "你对B有什么看法？"
      }
    ],
    "timeout": 120
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "interviews_count": 2,
    "result": {
      "interviews_count": 4,
      "results": {
        "twitter_0": {
          "agent_id": 0,
          "response": "...",
          "platform": "twitter"
        },
        "reddit_0": {
          "agent_id": 0,
          "response": "...",
          "platform": "reddit"
        },
        "twitter_1": {
          "agent_id": 1,
          "response": "...",
          "platform": "twitter"
        },
        "reddit_1": {
          "agent_id": 1,
          "response": "...",
          "platform": "reddit"
        }
      }
    },
    "timestamp": "2025-12-08T10:00:01"
  }
}
```

---

### 24. 全局采访

使用相同问题采访所有 Agent。

**端点:** `POST /api/simulation/interview/all`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |
| prompt | string | 是 | 采访问题（所有Agent使用相同问题） |
| platform | string | 否 | 指定平台（twitter/reddit），不指定则双平台 |
| timeout | integer | 否 | 超时时间（秒），默认180 |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/interview/all \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "prompt": "你对这件事整体有什么看法？",
    "platform": "reddit",
    "timeout": 180
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "interviews_count": 50,
    "result": {
      "interviews_count": 50,
      "results": {
        "reddit_0": {
          "agent_id": 0,
          "response": "...",
          "platform": "reddit"
        },
        "reddit_1": {
          "agent_id": 1,
          "response": "...",
          "platform": "reddit"
        }
      }
    },
    "timestamp": "2025-12-08T10:00:01"
  }
}
```

---

### 25. 获取 Interview 历史

从模拟数据库中读取所有 Interview 记录。

**端点:** `POST /api/simulation/interview/history`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |
| platform | string | 否 | 平台类型（reddit/twitter），不指定则返回两个平台 |
| agent_id | integer | 否 | 只获取该Agent的采访历史 |
| limit | integer | 否 | 返回数量，默认100 |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/interview/history \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "platform": "reddit",
    "agent_id": 0,
    "limit": 10
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "count": 10,
    "history": [
      {
        "agent_id": 0,
        "response": "我认为...",
        "prompt": "你对这件事有什么看法？",
        "timestamp": "2025-12-08T10:00:00",
        "platform": "reddit"
      }
    ]
  }
}
```

---

## 环境管理

### 26. 获取环境状态

检查模拟环境是否存活（可以接收 Interview 命令）。

**端点:** `POST /api/simulation/env-status`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/env-status \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456"
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_def456",
    "env_alive": true,
    "twitter_available": true,
    "reddit_available": true,
    "message": "环境正在运行，可以接收Interview命令"
  }
}
```

---

### 27. 关闭模拟环境

向模拟发送关闭环境命令，使其优雅退出等待命令模式。

**端点:** `POST /api/simulation/close-env`

**注意:** 这不同于 `/stop` 接口，`/stop` 会强制终止进程，而此接口会让模拟优雅地关闭环境并退出。

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| simulation_id | string | 是 | 模拟ID |
| timeout | integer | 否 | 超时时间（秒），默认30 |

**请求示例:**

```bash
curl -X POST http://localhost:5000/api/simulation/close-env \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "timeout": 30
  }'
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "message": "环境关闭命令已发送",
    "result": {
      "twitter_closed": true,
      "reddit_closed": true
    },
    "timestamp": "2025-12-08T10:00:01"
  }
}
```

---

## 错误响应

所有接口在发生错误时都会返回统一的错误格式：

```json
{
  "success": false,
  "error": "错误描述信息",
  "traceback": "详细错误堆栈（仅开发环境）"
}
```

常见 HTTP 状态码:
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误
- `504`: 请求超时（主要用于 Interview 接口）

---

## 附录

### 模拟状态值

| 状态 | 说明 |
|------|------|
| created | 已创建 |
| preparing | 准备中 |
| ready | 准备完成，可以运行 |
| running | 运行中 |
| paused | 已暂停 |
| completed | 已完成 |
| stopped | 已停止 |
| failed | 运行失败 |

### 运行状态值

| 状态 | 说明 |
|------|------|
| idle | 未运行 |
| running | 运行中 |
| paused | 已暂停 |
| completed | 已完成 |
| stopped | 已停止 |
| failed | 运行失败 |

### 准备任务阶段

| 阶段 | 说明 | 进度范围 |
|------|------|----------|
| reading | 读取图谱实体 | 0-20% |
| generating_profiles | 生成 Agent 人设 | 20-70% |
| generating_config | 生成模拟配置 | 70-90% |
| copying_scripts | 准备模拟脚本 | 90-100% |

### 动作类型

| 动作 | 说明 |
|------|------|
| CREATE_POST | 创建帖子 |
| CREATE_COMMENT | 创建评论 |
| UPVOTE | 点赞/投赞成票 |
| DOWNVOTE | 点踩/投反对票 |
| RETWEET | 转发（Twitter） |
| SHARE | 分享 |
| FOLLOW | 关注 |

---

## 使用示例

### 完整的模拟工作流

```bash
# 1. 创建模拟
curl -X POST http://localhost:5000/api/simulation/create \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_abc123"
  }'

# 2. 准备模拟环境
curl -X POST http://localhost:5000/api/simulation/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456"
  }'

# 3. 查询准备进度
curl -X POST http://localhost:5000/api/simulation/prepare/status \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task_abc123"
  }'

# 4. 启动模拟
curl -X POST http://localhost:5000/api/simulation/start \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "platform": "parallel"
  }'

# 5. 轮询运行状态
curl -X GET http://localhost:5000/api/simulation/sim_def456/run-status

# 6. 获取帖子列表
curl -X GET "http://localhost:5000/api/simulation/sim_def456/posts?platform=reddit&limit=20"

# 7. 停止模拟（可选）
curl -X POST http://localhost:5000/api/simulation/stop \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456"
  }'
```

### Interview 使用示例

```bash
# 1. 确保模拟已完成并进入等待命令模式
curl -X POST http://localhost:5000/api/simulation/env-status \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456"
  }'

# 2. 采访单个 Agent
curl -X POST http://localhost:5000/api/simulation/interview \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "agent_id": 0,
    "prompt": "你对这次事件的看法是什么？"
  }'

# 3. 批量采访多个 Agent
curl -X POST http://localhost:5000/api/simulation/interview/batch \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "interviews": [
      {"agent_id": 0, "prompt": "你对A有什么看法？"},
      {"agent_id": 1, "prompt": "你对B有什么看法？"}
    ]
  }'

# 4. 全局采访所有 Agent
curl -X POST http://localhost:5000/api/simulation/interview/all \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456",
    "prompt": "请总结一下大家对这件事的整体观点"
  }'

# 5. 关闭模拟环境
curl -X POST http://localhost:5000/api/simulation/close-env \
  -H "Content-Type: application/json" \
  -d '{
    "simulation_id": "sim_def456"
  }'
```
