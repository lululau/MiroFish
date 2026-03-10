# Graph API 文档

## 概述

Graph API 提供了知识图谱构建的核心功能，包括本体生成、图谱构建、项目管理和任务查询等功能。所有 Graph API 的基础路径为 `/api/graph`。

**主要功能模块：**
1. **本体生成**：分析文档内容，生成适合社会模拟的实体和关系类型定义
2. **图谱构建**：基于本体定义，使用 Zep API 构建知识图谱
3. **项目管理**：管理图谱项目的生命周期
4. **任务查询**：查询异步任务的执行状态
5. **图谱数据**：获取和删除图谱数据

---

## 1. 本体生成 API

### 1.1 生成本体定义

**接口地址：** `POST /api/graph/ontology/generate`

**功能描述：** 上传文档文件，分析内容并生成适合社交媒体舆论模拟的实体类型和关系类型定义。

**请求方式：** `multipart/form-data`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `files` | File | 是 | 上传的文档文件（支持 PDF、MD、TXT），可上传多个 |
| `simulation_requirement` | string | 是 | 模拟需求描述，用于指导本体设计 |
| `project_name` | string | 否 | 项目名称，默认为 "Unnamed Project" |
| `additional_context` | string | 否 | 额外说明信息 |

**请求示例：**

```bash
curl -X POST http://localhost:5001/api/graph/ontology/generate \
  -F "files=@document1.pdf" \
  -F "files=@document2.md" \
  -F "simulation_requirement=模拟学术不端事件在社交媒体上的舆论传播" \
  -F "project_name=学术事件舆论模拟" \
  -F "additional_context=重点关注学生、教授、大学等角色的互动"
```

**响应格式：**

```json
{
  "success": true,
  "data": {
    "project_id": "proj_a1b2c3d4e5f6",
    "project_name": "学术事件舆论模拟",
    "ontology": {
      "entity_types": [
        {
          "name": "Student",
          "description": "A student enrolled in an educational institution.",
          "attributes": [
            {
              "name": "full_name",
              "type": "text",
              "description": "Full name of the student"
            },
            {
              "name": "major",
              "type": "text",
              "description": "Field of study"
            }
          ],
          "examples": ["undergraduate student", "graduate student"]
        },
        {
          "name": "Professor",
          "description": "A faculty member at a university.",
          "attributes": [
            {
              "name": "full_name",
              "type": "text",
              "description": "Full name of the professor"
            },
            {
              "name": "department",
              "type": "text",
              "description": "Academic department"
            }
          ],
          "examples": ["tenured professor", "assistant professor"]
        }
      ],
      "edge_types": [
        {
          "name": "STUDIES_AT",
          "description": "Enrollment relationship between student and institution.",
          "source_targets": [
            {"source": "Student", "target": "University"}
          ],
          "attributes": []
        },
        {
          "name": "WORKS_FOR",
          "description": "Employment relationship.",
          "source_targets": [
            {"source": "Professor", "target": "University"}
          ],
          "attributes": []
        }
      ]
    },
    "analysis_summary": "文档主要涉及学术不端事件，识别出学生、教授、大学等关键角色...",
    "files": [
      {
        "filename": "document1.pdf",
        "size": 1024000
      },
      {
        "filename": "document2.md",
        "size": 512000
      }
    ],
    "total_text_length": 123456
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "error": "请提供模拟需求描述 (simulation_requirement)"
}
```

**状态码：**
- `200 OK`：成功
- `400 Bad Request`：请求参数错误
- `500 Internal Server Error`：服务器内部错误

**处理流程：**

1. **接收并验证请求**
   - 验证必填参数（files、simulation_requirement）
   - 检查文件格式（支持 PDF、MD、TXT）

2. **创建项目**
   - 生成唯一的 `project_id`
   - 保存项目元数据

3. **提取文本**
   - 从上传文件中提取文本内容
   - 进行文本预处理（清理、标准化）
   - 保存提取的文本到项目目录

4. **生成本体**
   - 调用 LLM 分析文档内容和模拟需求
   - 生成实体类型定义（10个）
   - 生成关系类型定义（6-10个）
   - 验证并后处理结果

5. **保存本体**
   - 将本体定义保存到项目
   - 更新项目状态为 `ONTOLOGY_GENERATED`

6. **返回结果**

**本体设计规则：**

- **实体类型**：必须正好 10 个
  - 最后 2 个必须是兜底类型：`Person`（个人兜底）和 `Organization`（组织兜底）
  - 前 8 个是根据文本内容设计的具体类型
  - 所有实体类型必须是现实中可以发声的主体
  - 属性名不能使用保留字（name、uuid、group_id 等）

- **关系类型**：6-10 个
  - 反映社媒互动中的真实联系
  - 定义 source_targets 约束

---

## 2. 图谱构建 API

### 2.1 构建图谱

**接口地址：** `POST /api/graph/build`

**功能描述：** 基于已生成的本体定义，使用 Zep API 构建知识图谱。这是一个异步操作，返回任务 ID 用于查询进度。

**请求方式：** `application/json`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `project_id` | string | 是 | 项目 ID（来自本体生成接口） |
| `graph_name` | string | 否 | 图谱名称，默认为项目名称 |
| `chunk_size` | int | 否 | 文本块大小，默认 500 |
| `chunk_overlap` | int | 否 | 块重叠大小，默认 50 |
| `force` | boolean | 否 | 是否强制重新构建，默认 false |

**请求示例：**

```bash
curl -X POST http://localhost:5001/api/graph/build \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_a1b2c3d4e5f6",
    "graph_name": "学术事件舆论图谱",
    "chunk_size": 500,
    "chunk_overlap": 50
  }'
```

**响应格式：**

```json
{
  "success": true,
  "data": {
    "project_id": "proj_a1b2c3d4e5f6",
    "task_id": "task_x1y2z3a4b5c6",
    "message": "图谱构建任务已启动，请通过 /task/task_x1y2z3a4b5c6 查询进度"
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "error": "项目不存在: proj_invalid"
}
```

```json
{
  "success": false,
  "error": "图谱正在构建中，请勿重复提交。如需强制重建，请添加 force: true",
  "task_id": "task_existing"
}
```

**状态码：**
- `200 OK`：任务已启动
- `400 Bad Request`：请求参数错误或项目状态不正确
- `404 Not Found`：项目不存在
- `500 Internal Server Error`：服务器内部错误

**处理流程：**

1. **验证配置**
   - 检查 `ZEP_API_KEY` 是否配置

2. **验证项目**
   - 检查项目是否存在
   - 检查项目状态（必须已生成本体）
   - 检查是否正在构建中（除非强制重建）

3. **创建任务**
   - 生成唯一的 `task_id`
   - 更新项目状态为 `GRAPH_BUILDING`

4. **启动后台任务**
   - 在独立线程中执行图谱构建
   - 定期更新任务进度

5. **返回任务 ID**

**后台任务流程：**

1. **文本分块**（5-15%）
   - 根据配置将文本分割成重叠的块
   - 默认块大小：500 字符
   - 默认重叠：50 字符

2. **创建图谱**（15%）
   - 调用 Zep API 创建图谱
   - 生成唯一的 `graph_id`

3. **设置本体**（15%）
   - 将本体定义注册到 Zep 图谱
   - 动态创建实体和关系类型

4. **添加文本**（15-55%）
   - 分批发送文本块到 Zep（每批 3 块）
   - 收集返回的 episode UUID

5. **等待处理**（55-90%）
   - 轮询检查每个 episode 的处理状态
   - 等待 Zep 完成实体和关系提取
   - 默认超时：600 秒

6. **获取图谱数据**（90-95%）
   - 从 Zep 获取所有节点和边
   - 统计节点数和边数

7. **完成**（100%）
   - 更新项目状态为 `GRAPH_COMPLETED`
   - 保存图谱统计信息

---

## 3. 项目管理 API

### 3.1 获取项目详情

**接口地址：** `GET /api/graph/project/<project_id>`

**功能描述：** 获取指定项目的详细信息。

**请求示例：**

```bash
curl http://localhost:5001/api/graph/project/proj_a1b2c3d4e5f6
```

**响应格式：**

```json
{
  "success": true,
  "data": {
    "project_id": "proj_a1b2c3d4e5f6",
    "name": "学术事件舆论模拟",
    "status": "GRAPH_COMPLETED",
    "simulation_requirement": "模拟学术不端事件在社交媒体上的舆论传播",
    "files": [
      {
        "filename": "document1.pdf",
        "size": 1024000
      }
    ],
    "total_text_length": 123456,
    "ontology": {
      "entity_types": [...],
      "edge_types": [...]
    },
    "analysis_summary": "文档主要涉及学术不端事件...",
    "graph_id": "mirofish_abc123def456",
    "graph_build_task_id": "task_x1y2z3a4b5c6",
    "chunk_size": 500,
    "chunk_overlap": 50,
    "error": null,
    "created_at": "2026-03-10T12:00:00Z",
    "updated_at": "2026-03-10T12:30:00Z"
  }
}
```

**项目状态：**

| 状态 | 说明 |
|-----|------|
| `CREATED` | 项目已创建，尚未生成本体 |
| `ONTOLOGY_GENERATED` | 本体已生成，等待构建图谱 |
| `GRAPH_BUILDING` | 图谱正在构建中 |
| `GRAPH_COMPLETED` | 图谱构建完成 |
| `FAILED` | 构建失败 |

### 3.2 列出所有项目

**接口地址：** `GET /api/graph/project/list`

**功能描述：** 列出所有项目，支持分页。

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `limit` | int | 否 | 返回数量限制，默认 50 |

**请求示例：**

```bash
curl http://localhost:5001/api/graph/project/list?limit=10
```

**响应格式：**

```json
{
  "success": true,
  "data": [
    {
      "project_id": "proj_a1b2c3d4e5f6",
      "name": "学术事件舆论模拟",
      "status": "GRAPH_COMPLETED",
      "created_at": "2026-03-10T12:00:00Z"
    }
  ],
  "count": 1
}
```

### 3.3 删除项目

**接口地址：** `DELETE /api/graph/project/<project_id>`

**功能描述：** 删除指定项目及其所有相关文件。注意：不会删除 Zep 中的图谱数据，需要单独调用图谱删除接口。

**请求示例：**

```bash
curl -X DELETE http://localhost:5001/api/graph/project/proj_a1b2c3d4e5f6
```

**响应格式：**

```json
{
  "success": true,
  "message": "项目已删除: proj_a1b2c3d4e5f6"
}
```

### 3.4 重置项目

**接口地址：** `POST /api/graph/project/<project_id>/reset`

**功能描述：** 重置项目状态，用于重新构建图谱。保留本体定义，但清除图谱构建相关信息。

**请求示例：**

```bash
curl -X POST http://localhost:5001/api/graph/project/proj_a1b2c3d4e5f6/reset
```

**响应格式：**

```json
{
  "success": true,
  "message": "项目已重置: proj_a1b2c3d4e5f6",
  "data": {
    "project_id": "proj_a1b2c3d4e5f6",
    "status": "ONTOLOGY_GENERATED",
    "graph_id": null,
    "graph_build_task_id": null,
    "error": null
  }
}
```

---

## 4. 任务查询 API

### 4.1 获取任务状态

**接口地址：** `GET /api/graph/task/<task_id>`

**功能描述：** 查询异步任务的执行状态和进度。

**请求示例：**

```bash
curl http://localhost:5001/api/graph/task/task_x1y2z3a4b5c6
```

**响应格式：**

```json
{
  "success": true,
  "data": {
    "task_id": "task_x1y2z3a4b5c6",
    "task_type": "graph_build",
    "status": "PROCESSING",
    "message": "Zep处理中... 45/50 完成, 5 待处理 (120秒)",
    "progress": 90,
    "result": null,
    "error": null,
    "created_at": "2026-03-10T12:00:00Z",
    "updated_at": "2026-03-10T12:15:00Z"
  }
}
```

**任务状态：**

| 状态 | 说明 |
|-----|------|
| `PENDING` | 任务已创建，等待执行 |
| `PROCESSING` | 任务正在执行中 |
| `COMPLETED` | 任务已完成 |
| `FAILED` | 任务失败 |

**完成时的响应：**

```json
{
  "success": true,
  "data": {
    "task_id": "task_x1y2z3a4b5c6",
    "task_type": "graph_build",
    "status": "COMPLETED",
    "message": "图谱构建完成",
    "progress": 100,
    "result": {
      "project_id": "proj_a1b2c3d4e5f6",
      "graph_id": "mirofish_abc123def456",
      "node_count": 150,
      "edge_count": 280,
      "chunk_count": 50
    },
    "error": null
  }
}
```

### 4.2 列出所有任务

**接口地址：** `GET /api/graph/tasks`

**功能描述：** 列出所有任务。

**请求示例：**

```bash
curl http://localhost:5001/api/graph/tasks
```

**响应格式：**

```json
{
  "success": true,
  "data": [
    {
      "task_id": "task_x1y2z3a4b5c6",
      "task_type": "graph_build",
      "status": "COMPLETED",
      "progress": 100,
      "created_at": "2026-03-10T12:00:00Z"
    }
  ],
  "count": 1
}
```

---

## 5. 图谱数据 API

### 5.1 获取图谱数据

**接口地址：** `GET /api/graph/data/<graph_id>`

**功能描述：** 获取指定图谱的完整数据，包括所有节点和边。

**请求示例：**

```bash
curl http://localhost:5001/api/graph/data/mirofish_abc123def456
```

**响应格式：**

```json
{
  "success": true,
  "data": {
    "graph_id": "mirofish_abc123def456",
    "nodes": [
      {
        "uuid": "node_uuid_1",
        "name": "张三",
        "labels": ["Entity", "Student"],
        "summary": "某大学的学生",
        "attributes": {
          "full_name": "张三",
          "major": "计算机科学"
        },
        "created_at": "2026-03-10T12:05:00Z"
      }
    ],
    "edges": [
      {
        "uuid": "edge_uuid_1",
        "name": "STUDIES_AT",
        "fact": "张三就读于某大学",
        "fact_type": "STUDIES_AT",
        "source_node_uuid": "node_uuid_1",
        "target_node_uuid": "node_uuid_2",
        "source_node_name": "张三",
        "target_node_name": "某大学",
        "attributes": {},
        "created_at": "2026-03-10T12:05:00Z",
        "valid_at": "2026-03-10T12:05:00Z",
        "invalid_at": null,
        "expired_at": null,
        "episodes": ["episode_uuid_1"]
      }
    ],
    "node_count": 150,
    "edge_count": 280
  }
}
```

### 5.2 删除图谱

**接口地址：** `DELETE /api/graph/delete/<graph_id>`

**功能描述：** 从 Zep 中删除指定的图谱。

**请求示例：**

```bash
curl -X DELETE http://localhost:5001/api/graph/delete/mirofish_abc123def456
```

**响应格式：**

```json
{
  "success": true,
  "message": "图谱已删除: mirofish_abc123def456"
}
```

---

## 6. 错误处理

所有 API 在发生错误时都会返回统一的错误格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

对于服务器内部错误（500），还会包含详细的堆栈跟踪：

```json
{
  "success": false,
  "error": "错误描述信息",
  "traceback": "详细的堆栈跟踪信息..."
}
```

**常见错误码：**

| 状态码 | 说明 |
|-------|------|
| `400` | 请求参数错误或业务逻辑错误 |
| `404` | 资源不存在（项目、任务等） |
| `500` | 服务器内部错误 |

**常见错误场景：**

1. **本体生成失败**
   - 文件格式不支持
   - 文件内容无法解析
   - LLM 调用失败
   - 本体验证失败

2. **图谱构建失败**
   - ZEP_API_KEY 未配置
   - 项目不存在或状态不正确
   - Zep API 调用失败
   - 处理超时

---

## 7. 使用示例

### 完整的图谱构建流程

```bash
# 1. 生成本体
curl -X POST http://localhost:5001/api/graph/ontology/generate \
  -F "files=@document.pdf" \
  -F "simulation_requirement=模拟学术不端事件的舆论传播" \
  -F "project_name=学术事件模拟"

# 响应：{"success": true, "data": {"project_id": "proj_xxx", ...}}

# 2. 构建图谱
curl -X POST http://localhost:5001/api/graph/build \
  -H "Content-Type: application/json" \
  -d '{"project_id": "proj_xxx", "graph_name": "学术事件图谱"}'

# 响应：{"success": true, "data": {"task_id": "task_xxx", ...}}

# 3. 查询任务进度
curl http://localhost:5001/api/graph/task/task_xxx

# 响应：{"success": true, "data": {"status": "PROCESSING", "progress": 45, ...}}

# 4. 获取图谱数据
curl http://localhost:5001/api/graph/data/mirofish_xxx

# 响应：{"success": true, "data": {"nodes": [...], "edges": [...], ...}}
```

### 错误处理示例

```bash
# 检查任务状态
curl http://localhost:5001/api/graph/task/task_xxx

# 如果失败
{
  "success": true,
  "data": {
    "status": "FAILED",
    "error": "Zep API 调用超时..."
  }
}

# 查看项目详情获取错误信息
curl http://localhost:5001/api/graph/project/proj_xxx

{
  "success": true,
  "data": {
    "status": "FAILED",
    "error": "构建失败: Zep API 调用超时..."
  }
}

# 重置项目并重新构建
curl -X POST http://localhost:5001/api/graph/project/proj_xxx/reset

curl -X POST http://localhost:5001/api/graph/build \
  -H "Content-Type: application/json" \
  -d '{"project_id": "proj_xxx", "force": true}'
```

---

## 8. 注意事项

### 8.1 文件上传限制

- 支持的文件格式：PDF、MD、TXT
- 建议单个文件不超过 10MB
- 本体生成时传给 LLM 的文本最大长度为 50,000 字符（超出部分会被截断）
- 但图谱构建时会使用完整的提取文本

### 8.2 异步任务

- 图谱构建是异步操作，通常需要几分钟到几十分钟
- 建议客户端轮询任务状态，间隔 3-5 秒
- 任务状态在服务器端持久化，重启后仍可查询

### 8.3 项目管理

- 项目文件存储在服务器本地目录
- 删除项目会删除本地文件，但不会删除 Zep 中的图谱
- 如需完全清理，先删除图谱，再删除项目

### 8.4 性能优化

- 文本分块大小（chunk_size）影响构建速度和图谱质量
  - 较小的块：处理更快，但可能丢失上下文
  - 较大的块：上下文更完整，但处理更慢
- 批次大小（batch_size）影响 API 调用频率
  - 默认每批 3 块，可根据网络情况调整
- Zep 处理时间取决于文本复杂度和长度

### 8.5 本体设计

- 本体定义直接影响图谱质量
- 建议提供清晰的模拟需求和额外说明
- 实体和关系类型会在后续模拟中使用，需仔细设计
- 系统会自动添加兜底类型（Person、Organization）

---

## 9. 相关服务

Graph API 依赖以下服务：

- **OntologyGenerator** (`app/services/ontology_generator.py`)
  - 本体生成服务
  - 调用 LLM 分析文档内容
  - 生成实体和关系类型定义

- **GraphBuilderService** (`app/services/graph_builder.py`)
  - 图谱构建服务
  - 调用 Zep API 构建图谱
  - 管理文本分块和批处理

- **TextProcessor** (`app/services/text_processor.py`)
  - 文本处理服务
  - 文本预处理和分块

- **ProjectManager** (`app/models/project.py`)
  - 项目管理模型
  - 项目持久化和状态管理

- **TaskManager** (`app/models/task.py`)
  - 任务管理模型
  - 异步任务状态跟踪
