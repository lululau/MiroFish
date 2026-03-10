# 调试指南

本章节介绍如何系统地调试 MiroFish，包括日志查看、常用调试命令和工具使用，帮助您快速定位问题根源。

---

## 目录

- [日志系统](#日志系统)
- [调试命令](#调试命令)
- [常用调试工具](#常用调试工具)
- [性能分析](#性能分析)
- [远程调试](#远程调试)

---

## 日志系统

MiroFish 使用结构化日志系统，所有重要操作都会记录到日志文件中。

### 日志位置

```
MiroFish/
├── backend/
│   ├── logs/                    # 后端日志目录
│   │   ├── mirofish.log         # 主日志文件
│   │   ├── mirofish.api.log     # API 日志
│   │   ├── mirofish.build.log   # 图谱构建日志
│   │   └── mirofish.simulation.log  # 模拟运行日志
│   └── uploads/
│       └── simulations/
│           └── sim_xxxxxx/      # 特定模拟目录
│               ├── simulation.log     # 模拟详细日志
│               └── state.json         # 模拟状态
└── frontend/
    └── vite-dist/               # 前端构建输出
```

### 日志级别

```python
DEBUG    # 详细调试信息（开发环境）
INFO     # 一般信息（正常运行）
WARNING  # 警告信息（需要注意但不影响运行）
ERROR    # 错误信息（操作失败）
CRITICAL # 严重错误（系统无法继续运行）
```

### 配置日志级别

编辑 `backend/app/utils/logger.py` 或通过环境变量设置：

```bash
# 在 .env 中设置
export LOG_LEVEL=DEBUG
export LOG_FILE=True
export LOG_CONSOLE=True
```

### 查看日志

#### 实时查看日志

```bash
# 查看主日志
tail -f backend/logs/mirofish.log

# 查看特定模块日志
tail -f backend/logs/mirofish.api.log
tail -f backend/logs/mirofish.simulation.log

# 查看最后 100 行
tail -n 100 backend/logs/mirofish.log

# 查看并搜索错误
tail -f backend/logs/mirofish.log | grep -i "error"
```

#### 搜索特定内容

```bash
# 搜索特定项目
grep "proj_abc123" backend/logs/mirofish.log

# 搜索错误信息
grep -i "error\|exception\|failed" backend/logs/mirofish.log

# 搜索特定时间段
grep "2024-03-10 14:" backend/logs/mirofish.log

# 查看最近的错误
grep -i "error" backend/logs/mirofish.log | tail -20
```

#### 分析日志统计

```bash
# 统计错误数量
grep -c "ERROR" backend/logs/mirofish.log

# 统计 API 请求次数
grep -c "POST\|GET\|PUT\|DELETE" backend/logs/mirofish.api.log

# 查看最长的请求
awk '{print $0}' backend/logs/mirofish.api.log | sort -k4 -n | tail -10
```

---

## 调试命令

### 1. 系统健康检查

```bash
#!/bin/bash
# health-check.sh - MiroFish 系统健康检查脚本

echo "=== MiroFish 健康检查 ==="
echo ""

# 1. 检查后端服务
echo "1. 检查后端服务..."
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "   ✓ 后端服务正常"
else
    echo "   ✗ 后端服务异常"
fi

# 2. 检查前端服务
echo "2. 检查前端服务..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✓ 前端服务正常"
else
    echo "   ✗ 前端服务异常"
fi

# 3. 检查配置
echo "3. 检查配置文件..."
if [ -f .env ]; then
    echo "   ✓ .env 文件存在"
    if grep -q "LLM_API_KEY" .env && grep -q "ZEP_API_KEY" .env; then
        echo "   ✓ API 密钥已配置"
    else
        echo "   ✗ API 密钥未配置"
    fi
else
    echo "   ✗ .env 文件不存在"
fi

# 4. 检查依赖
echo "4. 检查依赖..."
if python -c "import openai" 2>/dev/null; then
    echo "   ✓ Python 依赖正常"
else
    echo "   ✗ Python 依赖缺失"
fi

if [ -d node_modules ]; then
    echo "   ✓ Node 依赖正常"
else
    echo "   ✗ Node 依赖缺失"
fi

# 5. 检查磁盘空间
echo "5. 检查磁盘空间..."
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo "   ✓ 磁盘空间充足 (已使用 ${DISK_USAGE}%)"
else
    echo "   ⚠ 磁盘空间不足 (已使用 ${DISK_USAGE}%)"
fi

# 6. 检查日志
echo "6. 检查最近的错误..."
ERROR_COUNT=$(grep -c "ERROR" backend/logs/mirofish.log 2>/dev/null || echo "0")
echo "   最近有 ${ERROR_COUNT} 个错误记录"

echo ""
echo "=== 检查完成 ==="
```

### 2. API 测试命令

```bash
# 测试图谱 API
curl -X GET http://localhost:5001/api/graph/project/list

# 测试模拟 API
curl -X GET http://localhost:5001/api/simulation/list

# 测试特定项目
curl -X GET http://localhost:5001/api/graph/project/proj_abc123

# 测试任务状态
curl -X GET http://localhost:5001/api/graph/task/task_xyz789

# 测试 Zep 连接
python -c "
from app.services.zep_tools import ZepTools
from app.config import Config
tools = ZepTools(api_key=Config.ZEP_API_KEY)
sessions = tools.list_sessions()
print(f'Zep 连接正常，当前有 {len(sessions)} 个会话')
"
```

### 3. 数据库清理命令

```bash
# 清理旧项目（保留最近 10 个）
find backend/uploads/projects -type d -name "proj_*" | \
  sort -r | tail -n +11 | \
  xargs -I {} rm -rf {}

# 清理旧模拟（保留最近 5 个）
find backend/uploads/simulations -type d -name "sim_*" | \
  sort -r | tail -n +6 | \
  xargs -I {} rm -rf {}

# 清理日志文件（保留最近 7 天）
find backend/logs -name "*.log" -mtime +7 -delete

# 清理临时文件
find backend/uploads -name "*.tmp" -delete
find backend/uploads -name "*.cache" -delete
```

### 4. 性能测试命令

```bash
# 测试 LLM API 响应时间
time python -c "
from app.utils.llm_client import LLMClient
client = LLMClient()
response = client.chat(messages=[{'role': 'user', 'content': 'test'}])
print('LLM API 响应正常')
"

# 测试 Zep API 响应时间
time python -c "
from app.services.zep_entity_reader import ZepEntityReader
reader = ZepEntityReader()
# 使用实际存在的 graph_id
entities = reader.filter_defined_entities('your_graph_id')
print(f'Zep API 响应正常，读取到 {len(entities.entities)} 个实体')
"

# 测试并发性能
ab -n 100 -c 10 http://localhost:5001/api/graph/project/list
```

### 5. 诊断信息收集

```bash
#!/bin/bash
# collect-diagnostic-info.sh - 收集诊断信息

OUTPUT_DIR="diagnostic_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "收集诊断信息到 $OUTPUT_DIR ..."

# 1. 系统信息
echo "=== 系统信息 ===" > "$OUTPUT_DIR/system.txt"
uname -a >> "$OUTPUT_DIR/system.txt"
python --version >> "$OUTPUT_DIR/system.txt"
node --version >> "$OUTPUT_DIR/system.txt"
npm --version >> "$OUTPUT_DIR/system.txt"

# 2. 配置信息
echo "=== 配置信息 ===" > "$OUTPUT_DIR/config.txt"
cat .env | sed 's/API_KEY=.*/API_KEY=***REJECTED***/' >> "$OUTPUT_DIR/config.txt"

# 3. 依赖信息
echo "=== Python 依赖 ===" > "$OUTPUT_DIR/python_deps.txt"
pip list >> "$OUTPUT_DIR/python_deps.txt"

echo "=== Node 依赖 ===" > "$OUTPUT_DIR/node_deps.txt"
npm list --depth=0 >> "$OUTPUT_DIR/node_deps.txt"

# 4. 日志文件
echo "=== 最近日志 ===" > "$OUTPUT_DIR/recent_logs.txt"
tail -n 500 backend/logs/mirofish.log >> "$OUTPUT_DIR/recent_logs.txt"

# 5. 项目状态
echo "=== 项目状态 ===" > "$OUTPUT_DIR/projects.txt"
curl -s http://localhost:5001/api/graph/project/list >> "$OUTPUT_DIR/projects.txt"

# 6. 模拟状态
echo "=== 模拟状态 ===" > "$OUTPUT_DIR/simulations.txt"
curl -s http://localhost:5001/api/simulation/list >> "$OUTPUT_DIR/simulations.txt"

# 7. 错误汇总
echo "=== 错误汇总 ===" > "$OUTPUT_DIR/errors.txt"
grep -i "error\|exception\|failed" backend/logs/*.log | \
  tail -n 100 >> "$OUTPUT_DIR/errors.txt"

echo "诊断信息收集完成！"
echo "位置: $OUTPUT_DIR"
```

---

## 常用调试工具

### 1. Python 调试器

```python
# 在代码中插入断点
import pdb; pdb.set_trace()

# 使用 ipdb（更友好的界面）
import ipdb; ipdb.set_trace()

# 条件断点
if some_condition:
    import pdb; pdb.set_trace()
```

### 2. Flask 调试

```bash
# 启动 Flask 调试模式
export FLASK_DEBUG=True
cd backend
python run.py

# 使用 Flask shell
cd backend
flask shell

# 在 shell 中
>>> from app.models.project import ProjectManager
>>> projects = ProjectManager.list_projects()
>>> print(projects)
```

### 3. 前端调试

```javascript
// 在浏览器控制台中
// 1. 查看 Vue 组件实例
const app = document.querySelector('#app').__vue_app__

// 2. 查看 Pinia store
const store = app.config.globalProperties.$pinia

// 3. 测试 API 调用
fetch('/api/graph/project/list')
  .then(r => r.json())
  .then(console.log)

// 4. 查看当前路由
console.log(window.location.pathname)

// 5. 清除本地存储
localStorage.clear()
```

### 4. 网络抓包

```bash
# 使用 tcpdump 抓取 API 请求
sudo tcpdump -i lo -s 0 -w api_traffic.pcap 'port 5001'

# 使用 Wireshark 分析
wireshark api_traffic.pcap

# 使用 mitmproxy 作为代理
mitmproxy -p 8080
# 然后设置 HTTP_PROXY=http://localhost:8080
```

### 5. 监控工具

```bash
# 使用 htop 监控资源
htop

# 使用 iotop 监控 I/O
sudo iotop

# 使用 netstat 监控网络连接
netstat -tulpn | grep 5001

# 使用 lsof 查看文件句柄
lsof -p $(pgrep -f "python run.py")
```

---

## 性能分析

### 1. Python 性能分析

```bash
# 使用 cProfile 分析性能
python -m cProfile -o profile.stats backend/run.py

# 查看分析结果
python -c "
import pstats
p = pstats.Stats('profile.stats')
p.sort_stats('cumulative')
p.print_stats(20)
"

# 生成可视化报告（需要安装 snakeviz）
pip install snakeviz
snakeviz profile.stats
```

### 2. API 响应时间分析

```python
# 添加性能监控装饰器
import time
from functools import wraps

def performance_monitor(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        duration = end_time - start_time
        print(f"{func.__name__} 执行时间: {duration:.2f}秒")
        return result
    return wrapper

# 使用示例
@performance_monitor
def build_graph(project_id):
    # ... 构建图谱逻辑
    pass
```

### 3. 内存分析

```bash
# 使用 memory_profiler
pip install memory_profiler

# 在代码中添加
from memory_profiler import profile

@profile
def memory_intensive_function():
    # ... 函数逻辑
    pass

# 运行分析
python -m memory_profiler backend/run.py
```

---

## 远程调试

### 1. 远程日志访问

```bash
# 使用 SSH 远程查看日志
ssh user@remote-server "tail -f /path/to/MiroFish/backend/logs/mirofish.log"

# 将远程日志同步到本地
rsync -avz user@remote-server:/path/to/MiroFish/backend/logs/ ./logs/
```

### 2. 远程 Python 调试

```python
# 使用 rpdb 进行远程调试
# 安装: pip install rpdb

# 在代码中
import rpdb
rpdb.set_trace(host='0.0.0.0', port=4444)

# 从本地连接
telnet remote-server 4444
```

### 3. Docker 容器调试

```bash
# 进入运行中的容器
docker exec -it mirofish-backend bash

# 查看容器日志
docker logs -f mirofish-backend
docker logs -f mirofish-frontend

# 在容器中执行命令
docker exec mirofish-backend python -c "
from app.config import Config
print('LLM_API_KEY:', bool(Config.LLM_API_KEY))
"

# 复制文件到容器
docker cp local_file.txt mirofish-backend:/app/

# 从容器复制文件
docker cp mirofish-backend:/app/logs/mirofish.log ./
```

---

## 调试最佳实践

### 1. 分层调试策略

```
1. 验证基础层
   ✓ 检查网络连接
   ✓ 验证 API 密钥
   ✓ 确认服务运行

2. 验证配置层
   ✓ 检查环境变量
   ✓ 验证依赖安装
   ✓ 确认文件权限

3. 验证逻辑层
   ✓ 检查日志输出
   ✓ 验证数据流程
   ✓ 测试 API 调用

4. 验证表现层
   ✓ 检查前端渲染
   ✓ 验证用户交互
   ✓ 确认错误提示
```

### 2. 调试检查清单

```markdown
## 问题发生时的检查清单

### 基础检查
- [ ] 服务是否正在运行？
- [ ] 端口是否被占用？
- [ ] 网络连接是否正常？
- [ ] API 密钥是否有效？

### 配置检查
- [ ] .env 文件是否存在？
- [ ] 环境变量是否正确加载？
- [ ] 配置参数是否合理？
- [ ] 路径配置是否正确？

### 数据检查
- [ ] 输入数据格式是否正确？
- [ ] 数据大小是否在限制内？
- [ ] 数据编码是否正确？
- [ ] 必填字段是否完整？

### 日志检查
- [ ] 有无 ERROR 级别日志？
- [ ] 异常堆栈是什么？
- [ ] 失败前的最后操作是什么？
- [ ] 相关操作是否都成功？

### 资源检查
- [ ] 磁盘空间是否充足？
- [ ] 内存使用是否正常？
- [ ] CPU 负载是否过高？
- [ ] 网络带宽是否足够？
```

### 3. 问题报告模板

```markdown
## 问题描述
简要描述遇到的问题

## 复现步骤
1. 步骤一
2. 步骤二
3. 步骤三

## 期望行为
描述应该发生的正确行为

## 实际行为
描述实际发生的错误行为

## 环境信息
- 操作系统: [如 Ubuntu 22.04]
- Python 版本: [如 3.11.0]
- Node.js 版本: [如 18.0.0]
- MiroFish 版本: [如 v1.0.0]

## 错误日志
\`\`\`
粘贴相关的错误日志
\`\`\`

## 附加信息
任何其他有助于解决问题的信息
```

---

## 获取技术支持

当需要技术支持时，请：

1. **收集诊断信息**
   ```bash
   bash collect-diagnostic-info.sh
   ```

2. **整理问题报告**
   - 使用上述问题报告模板
   - 附上完整的错误日志
   - 提供复现步骤

3. **提交 Issue**
   - GitHub: https://github.com/666ghj/MiroFish/issues
   - 或加入 QQ 群获取实时帮助

4. **联系支持**
   - 邮箱: mirofish@shanda.com
   - 提供诊断信息压缩包

---

## 相关文档

- [常见问题](./01-common-issues.md) - 常见错误的快速解决方案
- [API 参考](../05-api-reference/README.md) - 完整的 API 文档
- [配置指南](../03-installation/02-configuration.md) - 详细配置说明
