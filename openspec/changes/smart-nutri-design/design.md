## Context

为了给久坐上班族和身材焦虑群体打造一个“智能营养管理专家”平台，我们需要重构当前的系统，新增饮食日记、运动追踪、AI 健康助手及全新时段推荐仪表盘。为了保证系统的可维护性，必须在代码层面解决以往的“高耦合”问题，制定明确的模块解耦与代码存放规范。
鉴于项目定位为 **PC 端后台管理/桌面网页端项目**，我们需要充分发挥 PC 宽屏的布局优势，设计卡片式、双栏式的扁平页面，并重点设计**“拖拽式饮食规划日历”**以极大地简化录入流程，增加 PC 端操作的趣味性与交互性。

## Goals / Non-Goals

**Goals:**
- 实现饮食、运动、AI助手、仪表盘模块的**高内聚低耦合**解耦设计，各个模块相互独立，状态不交叉污染。
- 制定**明确的代码分工与存放规则**，不同职能的代码按规范分开存放在 api、stores、types、components、views 中。
- 解决用户“懒于输入”的痛点：设计**拖拽食物到日历格子**的一键快速录入，配合 AI 智能语音/文本识别解析，以及 1 分钟办公室拉伸互动跟做。
- 在 PC 端进行页面设计时，保证信息密度和美学品质：使用网格布局、左右宽屏双栏布局、高亮拖动放置域效果，提升专业感和操作质感。
- 在前端使用 `localStorage` 模拟高保真的本地数据持久化，使得饮食日记（含拖拽日历中的每日历史）、运动历史、AI 会话历史在刷新页面后依然保存。

**Non-Goals:**
- 兼容移动端超窄屏幕的复杂拖拽手势（拖拽功能专为 PC 端鼠标操作设计，移动端退回到普通的点击添加方式）。
- 部署线上的真实高并发数据库（采用前端 Mock 数据 + `localStorage` 缓存）。

## Decisions

### 1. 拖拽式饮食日历实现方案（PC 宽屏专享）
我们将饮食日记页面（`/nutrition`）设计为 PC 双栏宽屏版面：
- **左侧为主体“饮食日历”网格 (Diet Calendar Grid)**：按月展示，每一格代表一天，展示当天的热量和营养配比进度条。
- **右侧为“时段智能推荐食物”面板 (Recommended Food Panel)**：根据当前时间段动态推荐健康食物，卡片上标记了每份热量。
- **拖拽机制实现 (HTML5 Drag & Drop API)**：
  - **拖动源 (Drag Source)**：右侧推荐卡片设置属性 `draggable="true"`。在 `@dragstart` 时，将该食物的 JSON 数据通过 `event.dataTransfer.setData('text/plain', JSON.stringify(food))` 进行存储。
  - **放置域 (Drop Zone)**：日历的每一个日期格子作为一个 Drop Zone，监听 `@dragover.prevent`、`@dragenter` 及 `@dragleave`。在 `dragenter` 时为该格子动态加上 `is-dragover` 类名，改变边框颜色和背景色以提示用户可放置。在 `dragleave` 时移除该类名。
  - **放置接收 (Drop Event)**：在日期格子的 `@drop` 事件中，读取 `dataTransfer` 中的食物信息，记录目标日期（Date）。
  - **餐次选择浮窗 (Meal Popover)**：落域成功后，在鼠标悬停位置弹出 Element Plus `el-popover` 悬浮菜单，让用户快速单选这顿饭记在“早餐/午餐/晚餐/加餐”，选中后自动调用 `nutritionStore` 的 `addLog`，更新日历该格子的统计数据，并伴随流畅的淡入淡出动画，降低输入阻力。

### 2. 代码分工与解耦规范（职能分开存放）
为了保持高内聚低耦合，我们要求每个模块的视图、状态、接口、类型均存放在专属的文件中，严禁混用。
- **页面视图 (Views)**：存放在 `src/views/<module>/` 下（如 `views/nutrition/index.vue`、`views/activity/index.vue`、`views/ai-assistant/index.vue`）。
- **组件 (Components)**：专属子组件存放在 `src/components/<module>/` 下（如拉伸引导组件 `components/activity/StretchDialog.vue`，食物搜索弹窗 `components/nutrition/FoodSearchDialog.vue`）。
- **状态管理 (Stores)**：每个模块拥有独立的 Pinia Store，互不调用（如 `stores/nutrition.ts` 只管饮食，`stores/activity.ts` 只管运动，仪表盘直接在视图层聚合计算）。
- **API 接口 (Api)**：每个模块专属的 API 分开存放（如 `api/nutrition.ts`、`api/activity.ts`、`api/ai.ts`）。
- **类型定义 (Types)**：专属接口与数据结构定义存放在 `src/types/<module>.ts` 中。

### 3. 状态依赖与数据联动解耦
饮食和运动模块会有数据变化（如新增饮食、新增运动），这些数据需要反馈在仪表盘上。我们选择**“视图层订阅/组合计算”**而非“Store 内部交叉调用”。
- `nutritionStore` 导出今日已摄入 `todayCalories`。
- `activityStore` 导出今日已消耗 `todayBurnedCalories`。
- `userStore` 导出基础代谢 BMR、日常目标 `targetCalories`。
- 在 `views/dashboard/index.vue` 中，通过 `computed` 将这三个 store 的数据聚合：
  `remainingCalories = userStore.targetCalories - nutritionStore.todayCalories + activityStore.todayBurnedCalories`。
- 当任一 store 的值发生变化，Vue 会自动追踪依赖并重绘仪表盘，各 store 之间完全解耦，可独立运行和测试。

### 4. AI 饮食快捷录入与 1 分钟拉伸交互设计
- **AI 饮食录入**：在 `api/nutrition.ts` 中实现一个轻量级的自然语言模糊解析引擎。用户输入“早饭吃了2个鸡蛋和一杯牛奶”，系统利用预设正则表达式及模糊关键词匹配内置食物库，智能组装为结构化数据，返回给前端确认，大大降低录入摩擦力。
- **1 分钟办公室拉伸**：在 `components/activity/StretchDialog.vue` 中利用 CSS3 的 `stroke-dasharray` 绘制倒计时环形进度动画。通过 `setInterval` 每秒更新进度，并提供动画演示。倒计时完成后自动向 `activityStore` 注入一条拉伸记录（消耗 15 kcal），用一键趣味跟做代替传统的打字输入。

### 5. 模拟 API 及持久化方案
由于目前是原有平台的前端改造，为了展示高保真的数据流动，我们将利用 `localStorage` 封装 API 层。
- 在 `api/request.ts` 中，拦截对应的模块请求。如果是饮食、运动、AI会话请求，优先从 `localStorage` 获取数据，操作成功后再写回 `localStorage`。
- 这样即使刷新浏览器，饮食日记、运动历史、AI 对话历史都能完美保留，确保体验真实连贯。

## Risks / Trade-offs

- **[Risk] HTML5 拖拽事件在跨组件传输复杂对象时可能丢失类型**
  - *Mitigation*: 统一将拖拽食物对象在 `dragstart` 时序列化为 JSON 字符串，在 `drop` 时进行反序列化，避免传输空对象。
- **[Risk] 浏览器本地存储上限** → LocalStorage 仅有 5MB 限制，若 AI 会话历史记录或月度饮食记录过多可能溢出。
  - *Mitigation*: 在 `stores/chat.ts` 中限制单个会话最多保存 50 条消息；在日记存储中，仅保留最近三个月的饮食记录，超出后自动清理历史数据。
- **[Risk] 内置食物库容量有限** → 前端 JSON 文件仅包含 60+ 种常用食物，用户可能搜不到冷门食物。
  - *Mitigation*: 允许用户在搜索无果时使用“自定义食物添加”卡片，输入名称和热量快速创建，保证灵活性。
