# 常见问题排查

本章节汇总了 MiroFish 使用过程中最常见的错误及其解决方案，帮助您快速定位和解决问题。

---

## 目录

- [API 连接错误](#1-api-连接错误)
- [认证失败（API 密钥问题）](#2-认证失败api-密钥问题)
- [模拟运行卡住或失败](#3-模拟运行卡住或失败)
- [前端构建错误](#4-前端构建错误)
- [图谱构建失败](#5-图谱构建失败)
- [文件上传错误](#6-文件上传错误)
- [模拟结果异常](#7-模拟结果异常)

---

## 1. API 连接错误

### 问题描述

```
ConnectionError: Failed to establish a new connection
TimeoutError: Request timeout
URLError: <urlopen error [Errno 111] Connection refused>
```

### 可能原因

1. **LLM API 服务不可用**
   - API 服务器宕机或维护中
   - 网络连接问题

2. **Zep Cloud 服务连接失败**
   - Zep API 密钥无效
   - Zep 服务暂时不可用

3. **代理设置问题**
   - 企业网络环境需要配置代理
   - 防火墙阻止了连接

4. **Base URL 配置错误**
   - `LLM_BASE_URL` 配置不正确
   - URL 格式错误（缺少 `/v1` 后缀）

### 解决方案

#### 方案 1：检查网络连接

```bash
# 测试 LLM API 连通性
curl -I https://dashscope.aliyuncs.com

# 测试 Zep Cloud 连通性
curl -I https://api.getzep.com
```

#### 方案 2：验证环境变量配置

```bash
# 检查 .env 文件配置
cat .env | grep -E "LLM_|ZEP_"
```

确保配置如下：

```env
# LLM API 配置（阿里百炼示例）
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxx
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_NAME=qwen-plus

# Zep Cloud 配置
ZEP_API_KEY=your_zep_api_key
```

#### 方案 3：配置代理（如需要）

```bash
# 在 .env 中添加代理配置
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

#### 方案 4：检查 API 服务状态

访问相应服务控制台查看服务状态：
- 阿里云百炼：https://bailian.console.aliyun.com/
- Zep Cloud：https://app.getzep.com/

### 预防措施

1. 定期检查 API 密钥有效期
2. 使用前先测试 API 连通性
3. 配置重试机制（系统已内置）
4. 保留备用 API 密钥

---

## 2. 认证失败（API 密钥问题）

### 问题描述

```
AuthenticationError: Incorrect API key provided
PermissionDeniedError: 401 Unauthorized
ValueError: LLM_API_KEY 未配置
```

### 可能原因

1. **API 密钥未配置**
   - `.env` 文件不存在或未配置密钥
   - 环境变量未正确加载

2. **API 密钥无效**
   - 密钥已过期
   - 密钥被撤销
   - 复制密钥时包含额外空格

3. **权限不足**
   - API 密钥没有访问相应资源的权限
   - 账户余额不足

4. **配置文件位置错误**
   - 系统未正确加载 `.env` 文件

### 解决方案

#### 方案 1：重新配置环境变量

```bash
# 1. 复制示例配置文件
cp .env.example .env

# 2. 编辑配置文件
nano .env

# 3. 填入正确的 API 密钥（注意不要有多余空格）
```

#### 方案 2：验证配置加载

```bash
# 检查 Python 后端是否能正确读取配置
cd backend
python -c "from app.config import Config; print('LLM_API_KEY:', bool(Config.LLM_API_KEY)); print('ZEP_API_KEY:', bool(Config.ZEP_API_KEY))"
```

#### 方案 3：测试 API 密钥有效性

```bash
# 测试 LLM API
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"test"}]}'

# 测试 Zep API
curl -X GET https://api.getzep.com/api/v1/sessions \
  -H "Authorization: ApiKey YOUR_ZEP_API_KEY"
```

#### 方案 4：检查账户状态

- 登录相应服务控制台
- 检查账户余额和使用配额
- 确认 API 密钥状态为"启用"

### 预防措施

1. 将 API 密钥存储在安全的密钥管理系统中
2. 定期轮换 API 密钥
3. 设置 API 使用监控和告警
4. 使用环境变量而非硬编码密钥

---

## 3. 模拟运行卡住或失败

### 问题描述

```
模拟状态一直显示 "running" 但无进展
模拟突然停止并报错
Simulation failed with status: failed
```

### 可能原因

1. **LLM API 调用失败**
   - API 速率限制
   - Token 超限
   - 模型服务异常

2. **资源不足**
   - 内存不足
   - 磁盘空间不足
   - CPU 过载

3. **配置问题**
   - Agent 数量过多
   - 模拟轮次设置过大
   - 超时配置不合理

4. **OASIS 引擎问题**
   - OASIS 依赖未正确安装
   - Python 环境不兼容

### 解决方案

#### 方案 1：查看实时日志

```bash
# 查看后端日志
tail -f backend/logs/mirofish.log

# 查看模拟运行日志
tail -f backend/uploads/simulations/sim_xxxxxx/simulation.log
```

#### 方案 2：检查 API 配额

```bash
# 检查 LLM API 使用情况（阿里云示例）
# 登录控制台查看：https://bailian.console.aliyun.com/
```

#### 方案 3：调整模拟参数

修改 `.env` 文件中的配置：

```env
# 减少默认模拟轮次
OASIS_DEFAULT_MAX_ROUNDS=10

# 减少 Report Agent 工具调用次数
REPORT_AGENT_MAX_TOOL_CALLS=3
```

#### 方案 4：重启模拟服务

```bash
# 1. 停止当前运行的模拟
# 通过前端界面点击"停止模拟"按钮

# 2. 清理失败的模拟数据
rm -rf backend/uploads/simulations/sim_xxxxxx

# 3. 重新启动模拟
npm run dev
```

#### 方案 5：检查系统资源

```bash
# 检查内存使用
free -h

# 检查磁盘空间
df -h

# 检查 CPU 使用
top
```

### 预防措施

1. 首次使用时使用小规模数据测试
2. 控制单次模拟的 Agent 数量（建议 < 50）
3. 设置合理的模拟轮次（建议 10-40 轮）
4. 定期清理旧的模拟数据
5. 监控系统资源使用情况

---

## 4. 前端构建错误

### 问题描述

```
npm ERR! code ERESOLVE
Vite Error: Failed to resolve import
Module not found: Error: Can't resolve 'xxx'
```

### 可能原因

1. **依赖版本冲突**
   - Node.js 版本不兼容
   - npm 包版本冲突

2. **网络问题**
   - npm 镜像访问失败
   - 依赖下载超时

3. **缓存问题**
   - npm 缓存损坏
   - node_modules 不完整

4. **配置错误**
   - Vite 配置错误
   - 环境变量未设置

### 解决方案

#### 方案 1：清理并重新安装依赖

```bash
# 清理前端依赖
cd frontend
rm -rf node_modules package-lock.json

# 使用国内镜像安装
npm install --registry=https://registry.npmmirror.com
```

#### 方案 2：检查 Node.js 版本

```bash
# 检查当前版本
node -v

# 要求：Node.js 18+
# 如果版本过低，使用 nvm 升级
nvm install 18
nvm use 18
```

#### 方案 3：清理 npm 缓存

```bash
npm cache clean --force
```

#### 方案 4：使用项目提供的安装脚本

```bash
# 在项目根目录执行
npm run setup:all
```

#### 方案 5：检查 Vite 配置

确认 `frontend/vite.config.js` 配置正确：

```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
```

### 预防措施

1. 使用项目提供的安装脚本
2. 保持 Node.js 版本在推荐范围内
3. 定期更新依赖包
4. 使用国内 npm 镜像加速

---

## 5. 图谱构建失败

### 问题描述

```
图谱构建任务一直处于 "processing" 状态
图谱构建失败：Zep API error
GraphRAG 构建超时
```

### 可能原因

1. **Zep Cloud 问题**
   - API 密钥无效
   - Zep 服务异常
   - 图谱创建权限不足

2. **文本处理问题**
   - 文档过大（> 10MB）
   - 文本编码错误
   - 分块参数不合理

3. **网络问题**
   - 上传文本超时
   - 连接中断

4. **并发问题**
   - 同时构建多个图谱

### 解决方案

#### 方案 1：检查 Zep 配置

```bash
# 验证 Zep API 密钥
curl -X GET https://api.getzep.com/api/v1/sessions \
  -H "Authorization: ApiKey YOUR_ZEP_API_KEY"
```

#### 方案 2：调整分块参数

在图谱构建时使用较小的分块：

```json
{
  "project_id": "proj_xxxx",
  "chunk_size": 300,
  "chunk_overlap": 30
}
```

#### 方案 3：重置项目并重试

```bash
# 通过前端界面或 API 重置项目
POST /api/graph/project/{project_id}/reset
```

#### 方案 4：检查文档大小和格式

```bash
# 检查上传的文档大小
ls -lh backend/uploads/projects/proj_xxxxx/files/

# 建议单个文档小于 5MB
```

#### 方案 5：查看详细错误信息

```bash
# 查看图谱构建任务日志
curl http://localhost:5001/api/graph/task/{task_id}
```

### 预防措施

1. 控制单个文档大小（建议 < 5MB）
2. 使用合理的分块参数
3. 避免同时构建多个图谱
4. 定期清理不需要的图谱数据

---

## 6. 文件上传错误

### 问题描述

```
文件上传失败：File type not allowed
上传时页面无响应
413 Payload Too Large
```

### 可能原因

1. **文件格式不支持**
   - 文件扩展名不在允许列表中
   - 文件实际上是二进制文件

2. **文件过大**
   - 超过 50MB 限制

3. **网络问题**
   - 上传超时
   - 连接中断

4. **前端问题**
   - 浏览器兼容性
   - 前端配置错误

### 解决方案

#### 方案 1：检查文件格式

支持的文件格式：
- `.pdf` - PDF 文档
- `.md` - Markdown 文档
- `.txt` - 纯文本
- `.markdown` - Markdown 文档

#### 方案 2：压缩文件大小

```bash
# 如果 PDF 过大，尝试压缩
# 或转换为文本格式
pdftotext large.pdf output.txt
```

#### 方案 3：调整上传限制

编辑 `backend/app/config.py`：

```python
# 增加上传大小限制（谨慎使用）
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
```

#### 方案 4：检查前端配置

确认 `frontend/src/api` 中的上传配置正确：

```javascript
const uploadConfig = {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  timeout: 60000  // 60 秒超时
}
```

### 预防措施

1. 上传前检查文件格式和大小
2. 使用稳定的网络环境
3. 大文件建议先压缩
4. 分批上传多个小文件

---

## 7. 模拟结果异常

### 问题描述

```
生成的报告内容不连贯
Agent 行为不符合预期
预测结果质量差
```

### 可能原因

1. **输入质量问题**
   - 上传的文档内容质量差
   - 模拟需求描述不清楚

2. **配置不当**
   - LLM 模型选择不当
   - 温度参数设置不合理

3. **图谱构建不完整**
   - 实体关系抽取不完整
   - 本体定义不准确

4. **模拟轮次不足**
   - 模拟未充分展开就停止

### 解决方案

#### 方案 1：优化输入文档

```markdown
# 确保文档包含以下信息：
1. 完整的背景介绍
2. 清晰的人物/实体关系
3. 具体的时间线和事件
4. 明确的场景描述
```

#### 方案 2：完善模拟需求描述

```markdown
# 好的模拟需求示例：
"请基于提供的《红楼梦》前80回内容，
模拟后续10回可能的发展情节，重点关注：
1. 宝黛关系的走向
2. 贾府的命运转折
3. 各个人物的最终结局"
```

#### 方案 3：调整模型参数

编辑 `.env` 文件：

```env
# 使用更强大的模型
LLM_MODEL_NAME=qwen-max

# 调整 Report Agent 温度（更低 = 更确定性）
REPORT_AGENT_TEMPERATURE=0.3
```

#### 方案 4：增加模拟轮次

```bash
# 在启动模拟时增加轮次
OASIS_DEFAULT_MAX_ROUNDS=40
```

#### 方案 5：重新构建图谱

```bash
# 如果图谱质量不好，重新构建
# 1. 重置项目
# 2. 使用更好的本体定义
# 3. 调整分块参数重新构建
```

### 预防措施

1. 使用高质量、结构化的输入文档
2. 清晰描述模拟需求和期望
3. 选择合适的 LLM 模型
4. 设置足够的模拟轮次
5. 定期验证中间结果

---

## 获取帮助

如果以上方案都无法解决您的问题，请：

1. **查看日志**：收集详细的错误日志
2. **检查版本**：确认使用的是最新版本
3. **提交 Issue**：在 GitHub 仓库提交问题
   - 附上错误日志
   - 描述复现步骤
   - 提供系统环境信息

4. **加入社区**：通过 QQ 群或 Discord 获取实时帮助

---

## 相关文档

- [调试指南](./02-debugging.md) - 详细的调试方法和工具使用
- [API 文档](../05-api-reference/README.md) - 完整的 API 接口说明
- [配置说明](../03-installation/02-configuration.md) - 环境配置详解
