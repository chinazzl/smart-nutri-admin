# AI 健康助手（AI Health Assistant）— 任务清单

## 所属 Change
`03-ai-health-assistant`

## 任务状态总览
| 任务 | 描述 | 状态 | 负责人 |
|-----|------|------|--------|
| T1 | 搭建 AI 助手模块架子 | ⬜ | |
| T2 | 数据层 | ⬜ | |
| T3 | 对话 UI 界面 | ⬜ | |
| T4 | 发送消息功能 | ⬜ | |
| T5 | 用户健康上下文注入 | ⬜ | |
| T6 | 快捷问题卡片 | ⬜ | |
| T7 | 多会话管理 | ⬜ | |
| T8 | 细节优化 | ⬜ | |

---

## T1: 搭建 AI 助手模块架子

**目标**：创建 AI 健康助手的基础页面结构和路由

### 步骤
1. 创建 `src/views/ai-assistant/index.vue` 页面骨架（两栏布局：左侧会话列表 240px，右侧对话区 flex-1）
2. 创建 `src/router/ai-assistant.ts` 路由，路径 `/ai-assistant`，需登录权限
3. 在 `src/router/index.ts` 中导入并注册 ai-assistant 路由
4. 在 `src/components/Sidebar.vue` 中添加菜单项「AI 健康助手」（带 🤖 图标）
5. 创建 `src/api/ai.ts`，封装以下请求方法（Mock 实现）：
   - `getSessions()` — 获取会话列表
   - `createSession()` — 创建新会话
   - `deleteSession(id)` — 删除会话
   - `getMessages(sessionId)` — 获取会话消息
   - `chat(payload)` — 发送消息并获取 AI 回复
   - `getUserContext()` — 获取用户健康上下文

### 验收
- [ ] 访问 `/ai-assistant` 能看到页面框架（左右两栏）
- [ ] Sidebar 有「AI 健康助手」菜单入口

---

## T2: 数据层

**目标**：建立类型定义和会话状态管理

### 步骤
1. 创建 `src/types/ai.ts`：
   - `ChatMessage` — 消息接口（id, session_id, role, content, created_at）
   - `ChatSession` — 会话接口（id, title, messages, created_at, updated_at）
   - `AIChatRequest` — AI 请求接口
   - `UserHealthContext` — 用户健康上下文接口
2. 创建 `src/stores/chat.ts` Pinia store：
   - `sessions` — 会话列表
   - `currentSessionId` — 当前会话 ID
   - `messages` — 当前会话消息列表
   - `isLoading` — AI 是否正在回复
   - `sendMessage(content)` — 发送消息 action
   - `createSession()` — 新建会话 action
   - `switchSession(id)` — 切换会话 action
   - `deleteSession(id)` — 删除会话 action
   - `clearCurrentSession()` — 清空当前会话

### 验收
- [ ] TypeScript 类型无报错
- [ ] Pinia store 正确响应 sendMessage action

---

## T3: 对话 UI 界面

**目标**：完成消息区域的 UI 渲染

### 步骤
1. **消息区域**：
   - 使用 `<el-scrollbar>` 包裹消息列表
   - 初始化时自动滚动到底部（`scrollbar.setScrollTop(scrollHeight)`）
2. **用户消息气泡**：
   - 右对齐，蓝色背景（`#409EFF`），白色文字
   - 显示时间戳（`created_at` 格式化为 HH:mm）
3. **AI 消息气泡**：
   - 左对齐，绿色背景（`#67C23A`），白色文字
   - 显示 AI 头像（🤖 emoji 或小图标）
   - 支持 Markdown 渲染（安装并使用 `marked` 库）
4. **加载骨架屏**：
   - AI 回复生成中时，在底部显示 3 个灰色骨架气泡（`el-skeleton`）
   - 回复完成后骨架消失
5. **清空按钮**：
   - Header 右侧放置 [🗑️ 清空对话] 按钮
   - 点击后清空当前会话消息

### 验收
- [ ] 消息列表正确区分左右对齐
- [ ] Markdown 内容正确渲染（粗体/列表/代码块）
- [ ] AI 回复时骨架屏正常显示

---

## T4: 发送消息功能

**目标**：实现完整的消息发送流程

### 步骤
1. **底部输入区**：
   - 使用 `el-input` 的 `textarea` 类型（可换行）
   - 绑定 `Enter` 事件发送（`@keyup.enter`），`Shift+Enter` 换行
   - 右侧放置发送按钮（`el-button` 带 ➡️ 图标）
2. **发送逻辑**：
   - 调用 `chatStore.sendMessage(content)`
   - 输入框清空
   - 禁用输入框和发送按钮（`isLoading` 时）
3. **Mock AI 回复**：
   - AI 接口未接入时，前端 Mock 实现：延迟 1.5s 返回预设回复
   - 回复示例：`"根据你今天的饮食记录，你已摄入 1500kcal，消耗 400kcal，当前热量缺口约 600kcal，继续保持！"`

### 验收
- [ ] 按 Enter 发送消息，Shift+Enter 换行
- [ ] 发送后输入框清空并禁用
- [ ] AI 回复出现后输入框恢复

---

## T5: 用户健康上下文注入

**目标**：让 AI 回答时了解用户个人健康数据

### 步骤
1. 在 `AIChatRequest` payload 中构造 `user_context` 对象
2. 从 Pinia user store 读取：体重、身高、年龄、性别、目标
3. 从 `01-nutrition-diary` store 读取：今日饮食记录汇总
4. 从 `02-activity-tracker` store 读取：今日运动消耗
5. 构造 system prompt 片段，注入到 AI 请求中：
   ```
   【用户健康档案】
   体重: XXkg | 身高: XXcm | 目标: XX
   今日已摄入: XXkcal (蛋白质: XXg | 碳水: XXg | 脂肪: XXg)
   今日已消耗: XXkcal
   ```
6. 在加载 AI 回复前，显示「正在分析你的健康数据...」提示

### 验收
- [ ] API 请求 payload 中包含完整 user_context
- [ ] AI 回复内容与用户数据相关（Mock 即可验证上下文注入）

---

## T6: 快捷问题卡片

**目标**：提供一键发送的预设问题

### 步骤
1. 在消息区域下方、输入框上方放置快捷问题区
2. 使用 `el-tag` 或 `el-button` 横向排列 4 个快捷问题：
   - "今天的饮食健康吗？"
   - "我今天还能吃什么？"
   - "适合上班族的运动有哪些？"
   - "如何改善久坐带来的健康问题？"
3. 点击后自动填充到输入框并触发发送

### 验收
- [ ] 4 个快捷问题按钮正常显示
- [ ] 点击后消息发送到对话中

---

## T7: 多会话管理

**目标**：支持会话列表的管理

### 步骤
1. **会话列表（左侧栏）**：
   - 顶部 [+ 新建会话] 按钮
   - 列表显示会话标题（取第一条用户消息前 20 字）+ 更新时间
   - 当前会话高亮（`is-active` 样式）
2. **新建会话**：
   - 点击 [+ 新建会话] 清空右侧对话区，重置 `currentSessionId`
3. **切换会话**：
   - 点击列表项加载该会话的所有消息
   - 右侧对话区刷新
4. **删除会话**：
   - 每条会话右侧显示 [×] 删除按钮
   - 点击后 `el-message-box` 确认
   - 删除后自动切换到下一个会话或空状态

### 验收
- [ ] 可以新建会话
- [ ] 可以切换历史会话，消息正确加载
- [ ] 可以删除会话

---

## T8: 细节优化

**目标**：提升用户体验

### 步骤
1. **空会话欢迎语**：
   - 无消息时显示欢迎卡片：
     ```
     🤖 您好！我是您的智能健康助手。
     
     我可以根据您的饮食记录、运动数据和健康目标，
     为您提供个性化的健康建议。
     
     您可以这样问我：
     • "今天的饮食健康吗？"
     • "我应该如何搭配晚餐？"
     • "有什么适合办公室的运动？"
     ```
2. **Markdown 支持**：
   - 安装 `marked` 库渲染 AI 回复中的 Markdown
   - 支持：粗体、斜体、列表、代码块
3. **打字机效果**（可选）：
   - AI 回复逐字显示，500ms/行
4. **移动端适配**：
   - 手机端隐藏左侧会话栏（汉堡菜单切换）
   - 输入框固定在底部

### 验收
- [ ] 空会话显示欢迎语
- [ ] Markdown 内容正确渲染
- [ ] 手机端布局正常
