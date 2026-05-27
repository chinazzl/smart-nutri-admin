# Smart Nutri Admin - 项目规范

## 1. 项目概述

**项目名称**：Smart Nutri Admin  
**项目类型**：智能健康专家平台（Web 管理后台 + 用户端）  
**核心定位**：面向运动量少的上班族和健康饮食/健身用户群体的 AI 驱动健康管理工具  
**技术栈**：Vue 3 + TypeScript + Element Plus + Pinia + Vue Router + Vite + ECharts

---

## 2. 用户画像

| 用户群体 | 核心痛点 | 需求场景 |
|---------|---------|---------|
| 久坐上班族 | 工作繁忙没时间运动、饮食不规律 | 碎片化运动、快捷饮食记录、AI 健康建议 |
| 健康饮食用户 | 不知道如何搭配营养、难以坚持 | 饮食打卡、营养分析、食谱推荐 |
| 健身用户 | 难以追踪效果、缺少专业指导 | 运动记录、进度可视化、AI 营养师对话 |

---

## 3. 功能路线图

### MVP（第一阶段）✅ 启动
- [ ] `01-nutrition-diary` — 饮食日记
- [ ] `02-activity-tracker` — 运动追踪
- [ ] `03-ai-health-assistant` — AI 健康助手
- [ ] `04-dashboard-home` — 健康仪表盘

### 第二阶段
- [ ] `05-body-metrics` — 身体数据追踪（体重/体脂/BMI）
- [ ] `06-goal-setting` — 目标设定与进度追踪

### 第三阶段
- [ ] `07-habit-checkin` — 打卡挑战系统
- [ ] `08-achievement-system` — 成就/徽章系统
- [ ] `09-health-report` — AI 健康周报/月报

### 第四阶段
- [ ] `10-recipe-recommendation` — 智能食谱推荐
- [ ] `11-health-community` — 健康社区

---

## 4. 技术架构

```
src/
├── api/              # API 请求（auth, nutrition, activity, ai）
├── assets/           # 静态资源
├── components/       # 通用组件（Header, Sidebar）
├── layout/           # 布局组件
├── router/           # 路由配置 + 权限控制
├── stores/           # Pinia 状态管理（user, nutrition, activity）
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面视图
    ├── login/        # 登录/注册 ✅ 已完成
    ├── dashboard/    # 健康仪表盘
    ├── nutrition/    # 饮食日记
    ├── activity/     # 运动追踪
    ├── ai-assistant/ # AI 健康助手
    ├── profile/      # 个人中心 ✅ 已有
    └── ...
```

---

## 5. API 层规划

| 模块 | 接口前缀 | 说明 |
|-----|---------|------|
| 认证 | `/api/auth/*` | 登录/注册/Token 管理 ✅ |
| 用户 | `/api/user/*` | 个人信息管理 ✅ |
| 饮食 | `/api/nutrition/*` | 饮食记录 CRUD |
| 运动 | `/api/activity/*` | 运动记录 CRUD |
| AI | `/api/ai/*` | AI 健康助手对话 |

---

## 6. 设计规范

- **UI 框架**：Element Plus
- **图表库**：ECharts
- **色彩主题**：健康绿色系（主色 #4CAF50 / #2E7D32）
- **字体**：系统默认字体
- **图标**：Element Plus Icons Vue
