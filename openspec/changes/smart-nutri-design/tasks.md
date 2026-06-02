## 1. 基础依赖与类型搭建

- [ ] 1.1 创建 `src/types/nutrition.ts` 定义食物、饮食记录及每日营养素目标的数据类型。
- [ ] 1.2 创建 `src/types/activity.ts` 定义运动记录、拉伸微任务及历史运动的数据类型。
- [ ] 1.3 创建 `src/types/ai.ts` 定义 AI 聊天消息、会话及接口请求的类型。
- [ ] 1.4 创建 `src/data/foods.json` 内置 50+ 种常见饮食数据库，包含热量、三大营养素等指标。

## 2. API 与 Mock 数据持久化层

- [ ] 2.1 创建 `src/api/nutrition.ts`，实现饮食记录的 CRUD，并通过 `localStorage` 进行高保真本地存储。
- [ ] 2.2 在 `src/api/nutrition.ts` 中实现 AI 自然语言智能饮食解析引擎，使用模糊匹配规则解析文本为结构化饮食记录。
- [ ] 2.3 创建 `src/api/activity.ts`，实现运动记录 CRUD，支持 MET 计算，并使用 `localStorage` 缓存数据。
- [ ] 2.4 创建 `src/api/ai.ts`，实现 AI 健康会话管理及消息发送 Mock，携带用户数据上下文，并使用 `localStorage` 存储聊天历史。

## 3. 状态管理层

- [ ] 3.1 创建独立的 `src/stores/nutrition.ts` Pinia Store，管理用户的饮食日志状态。
- [ ] 3.2 创建独立的 `src/stores/activity.ts` Pinia Store，管理用户运动日志状态，提供总消耗热量计算 Getters。
- [ ] 3.3 创建独立的 `src/stores/chat.ts` Pinia Store，管理 AI 助手的多会话及消息气泡列表状态。
- [ ] 3.4 修改 `src/stores/user.ts`，在 `login` 动作中增加对本地演示账号（admin/user）的拦截，自动生成 Mock Token 并注入对应的 `role`（管理员/普通用户），规避验证码和接口 502 报错。

## 4. 路由、菜单与权限守卫配置

- [ ] 4.1 修改 `src/router/index.ts`，配置注册 `/nutrition`（饮食日历）、`/activity`（运动追踪）、`/ai-assistant`（AI健康助手）及 `/user-management`（用户管理）页面路由。
- [ ] 4.2 修改 `src/router/permission.ts`，在路由全局前置守卫中根据登录的 `userInfo.role` 进行拦截，普通用户如果试图访问 `/user-management`，自动拦截并重定向到 `/dashboard` 仪表盘，弹出无权访问提示。
- [ ] 4.3 修改 `src/components/Sidebar.vue`，实现根据当前登录的 `userStore.userInfo.role` 动态过滤和渲染可见菜单项，实现不同角色展示不同的功能菜单。

## 5. 饮食日记与拖拽日历模块 UI

- [ ] 5.1 创建 `src/views/nutrition/index.vue` 并实现 PC 端宽屏月度日历网格展示框架。
- [ ] 5.2 在饮食日历主页实现“推荐干净饮食/时段健康餐”的卡片面板，并设置食物卡片为 HTML5 Draggable 可拖拽元素。
- [ ] 5.3 在日历格子中实现 HTML5 拖拽事件监听（dragover, dragenter, dragleave, drop），并编写落域高亮（is-dragover 类）的边框和背景样式。
- [ ] 5.4 编写拖放成功后的“餐次快捷选择浮窗/Popover”，在日期单元格位置唤起，选择早餐/午餐/晚餐/加餐。
- [ ] 5.5 联动 Pinia store 将拖拽放置的食物记录写入指定的日期和餐次中，即时刷新该日期单元格的总热量指标和进度条。
- [ ] 5.6 编写 `src/components/nutrition/FoodSearchDialog.vue` 食物手动搜索与精确份量添加弹窗，作为备用录入手段。
- [ ] 5.7 编写 `src/components/nutrition/AiInputDialog.vue` 智能 AI 一键文本录入弹窗与解析预览组件。
- [ ] 5.8 实现日历下方或选中日期单日详情列表中食物记录的编辑克数弹窗与删除确认流程。

## 6. 运动追踪与久坐拉伸 UI

- [ ] 6.1 创建 `src/views/activity/index.vue`，实现今日运动记录列表与卡路里消耗时间线。
- [ ] 6.2 在运动追踪页面中实现“手动录入运动”弹窗，根据运动类型及 MET 自适应折算卡路里。
- [ ] 6.3 编写 `src/components/activity/StretchDialog.vue`，实现 1 分钟办公室拉伸跟做与环形缩减倒计时交互。
- [ ] 6.4 实现拉伸结束后的“大勾打卡完成”微动画，并自动录入一条 15 kcal 运动消耗的静默打卡动作。

## 7. AI 健康对话助手 UI

- [ ] 7.1 创建 `src/views/ai-assistant/index.vue`，实现双栏式布局：左栏会话列表，右栏当前会话面板。
- [ ] 7.2 实现 AI 消息流的滚动渲染，包括用户消息蓝色气泡和 AI 消息绿色气泡。
- [ ] 7.3 在 AI 气泡中集成 Markdown 解析渲染器，支持折叠、粗体、列表和食谱表格。
- [ ] 7.4 编写 AI 智能数据分析的加载状态骨架屏，并注入今日饮食与运动上下文。
- [ ] 7.5 实现页面下方的常用提问快捷键卡片（如“我今天还能吃什么”），点击后自动填充并触发发送。

## 8. 管理员“用户管理”面板 UI

- [ ] 8.1 创建 `src/views/admin/user-management.vue` 页面视图，在 localStorage 中维护一个 mock 系统用户列表。
- [ ] 8.2 在页面中绘制宽屏表格展现用户列表，包含用户名、角色、电话、状态（启用/禁用）。
- [ ] 8.3 实现用户状态“启用/禁用”切换按钮及本地存储联动更新，并在登录层增加对禁用状态的拦截拦截。
- [ ] 8.4 实现角色（admin/user）修改下拉列表，支持管理员改变用户的权限身份。
- [ ] 8.5 编写“身体数据档案预览抽屉（Drawer）”，点击某行用户时拉出，读取并渲染该用户的身高、体重、BMI 及卡路里消耗统计大卡。

## 9. 现代感首页集成与优化

- [ ] 9.1 修改 `src/views/dashboard/index.vue` 仪表盘主页面。设计为极具现代感、扁平高科技感的界面，支持双角色视图自动渲染：
  - **普通用户视图**：展示热量差值环形卡片、最近 7 日体重趋势折线图、带有水滴交互的每日喝水快捷打卡组件、以及久坐拉伸打卡浮标。
  - **管理员视图**：展示平台关键运营指标（DAU、AI提问次数、拉伸率）、用户注册数趋势折线图（ECharts）、及 mock 服务器连接状态。
- [ ] 9.2 重构仪表盘“时段智能营养推荐能量盘”，根据当前小时数动态推荐干净早餐/抗疲劳下午茶/清洁晚餐，并支持一键吃它秒级录入。
- [ ] 9.3 适配宽屏 PC 布局与局部滚动体验，优化加载空状态，加入统一的 Element Plus 消息 Toast 吐司提示。
