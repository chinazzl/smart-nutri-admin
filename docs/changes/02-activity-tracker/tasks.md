# 运动追踪（Activity Tracker）— 任务清单

## 所属 Change
`02-activity-tracker`

## 任务状态总览
| 任务 | 描述 | 状态 | 负责人 |
|-----|------|------|--------|
| T1 | 搭建运动模块架子 | ⬜ | |
| T2 | 运动类型数据层 | ⬜ | |
| T3 | 运动记录页面 UI | ⬜ | |
| T4 | 添加运动功能 | ⬜ | |
| T5 | 步数记录功能 | ⬜ | |
| T6 | 编辑/删除 | ⬜ | |
| T7 | 细节优化 | ⬜ | |

---

## T1: 搭建运动模块架子

**目标**：创建运动追踪的基础页面结构和路由

### 步骤
1. 创建 `src/views/activity/index.vue` 页面骨架
2. 创建 `src/router/activity.ts` 路由，路径 `/activity`，需登录权限
3. 在 `src/router/index.ts` 中导入并注册 activity 路由
4. 在 `src/components/Sidebar.vue` 中添加菜单项「运动追踪」
5. 创建 `src/api/activity.ts`，封装以下请求方法（Mock 数据）：
   - `getActivityLogs(date: string)`
   - `addActivityLog(data)`
   - `updateActivityLog(id, data)`
   - `deleteActivityLog(id)`
   - `getActivitySummary(date: string)`

### 验收
- [ ] 访问 `/activity` 能看到页面
- [ ] Sidebar 有「运动追踪」菜单入口

---

## T2: 运动类型数据层

**目标**：建立类型定义和消耗计算工具

### 步骤
1. 创建 `src/types/activity.ts`：
   - `ActivityType` 枚举（walking/jogging/running/cycling/swimming/strength/yoga/micro_workout/standing/steps）
   - `ActivityLog` 接口
2. 创建 `src/utils/calories.ts`：
   - `ACTIVITY_MET` 系数映射表
   - `calculateCalories(activityType, durationMinutes, weightKg)` 函数
   - `calculateStepsCalories(steps)` 函数
3. 创建 `src/data/activityTypes.json`（可选，存储运动类型元数据）

### 验收
- [ ] TypeScript 类型无报错
- [ ] 计算函数输出正确（验证：60kg用户慢跑30分钟 = 240kcal）

---

## T3: 运动记录页面 UI

**目标**：完成运动追踪主页面所有 UI 组件

### 步骤
1. **日期选择器**：同饮食日记，使用 Element Plus `el-date-picker`
2. **今日摘要卡片**：
   - 左侧：总消耗 kcal（大字号 + 火焰图标）
   - 右侧：总运动时长 min
3. **步数记录卡片**：
   - 顶部：今日步数（大字号）
   - 底部：步数消耗估算
   - 右上角 [+ 记录步数] 按钮
4. **运动列表（时间轴样式）**：
   - 使用 `el-timeline` 组件
   - 每条记录左侧显示运动类型图标（SVG 或 Element Plus 图标）
   - 内容：运动名称 + 时长 + 消耗
   - 右侧：编辑/删除按钮
5. **底部 [+ 添加运动] 按钮**（`el-button` type="primary"）

### 验收
- [ ] 日期切换后数据正确更新
- [ ] 摘要卡片数据与运动列表汇总一致
- [ ] 时间轴样式美观

---

## T4: 添加运动功能

**目标**：用户点击 [+ 添加运动] 完成运动记录

### 步骤
1. 创建 `src/components/activity/AddActivityDialog.vue` 弹窗组件
2. 弹窗 UI：
   - 运动类型下拉框（`el-select`），每个选项带图标和名称
   - 时长输入框（`el-input-number`，单位：分钟，默认 30）
   - 实时消耗预览区（根据体重计算，灰色只读文本）
   - 底部 [取消] [确认添加] 按钮
3. 体重从用户 Profile store 读取，未设置则用默认值 60kg
4. 在 `ActivityView` 中引用并触发弹窗
5. 提交后调用 API，成功后刷新列表并更新摘要卡片

### 验收
- [ ] 点击 [+ 添加运动] 弹出弹窗
- [ ] 选择不同运动类型，消耗计算正确
- [ ] 确认后运动出现在时间轴中

---

## T5: 步数记录功能

**目标**：用户记录每日步数

### 步骤
1. 创建 `src/components/activity/StepsDialog.vue` 弹窗
2. 弹窗 UI：
   - 步数输入框（`el-input-number`，单位：步）
   - 实时消耗预览（steps × 0.04 kcal）
   - [取消] [确认] 按钮
3. 在步数卡片右上角按钮触发该弹窗
4. 步数记录作为特殊的 ActivityLog 存入（type='steps'）

### 验收
- [ ] 可以输入步数并预览消耗
- [ ] 步数显示在步数卡片中
- [ ] 步数消耗计入当日总消耗

---

## T6: 编辑/删除

**目标**：修改和删除运动记录

### 步骤
1. **编辑**：在时间轴每条记录右侧添加 [✏️] 按钮，点击弹出编辑弹窗（复用 T4 组件，prefill 数据）
2. **删除**：在时间轴每条记录右侧添加 [🗑️] 按钮，点击弹出 `el-message-box` 确认

### 验收
- [ ] 编辑后数据更新，摘要同步
- [ ] 删除有二次确认

---

## T7: 细节优化

**目标**：提升用户体验

### 步骤
1. **空状态**：无运动记录时显示引导文案「还没有运动记录，开始运动吧！」
2. **Toast 反馈**：操作成功/失败后 `ElMessage`
3. **移动端适配**：使用 `el-row`/`el-col` 响应式布局
4. **边界处理**：时长输入最小值 1，步数最小值 1

### 验收
- [ ] 无记录时显示友好空状态
- [ ] 有 toast 操作反馈
- [ ] 手机屏幕布局正常
