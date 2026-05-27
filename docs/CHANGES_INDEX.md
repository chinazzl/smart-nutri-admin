# MVP 任务拆解总览

## 项目：Smart Nutri Admin — 智能健康专家平台

> 所有变更文档位于 `docs/changes/` 目录下。

---

## 📋 当前变更列表

| 变更 ID | 功能模块 | 优先级 | 状态 | 预估工时 |
|--------|---------|--------|------|---------|
| `01-nutrition-diary` | 饮食日记 | P0 | 待启动 | ~9.5h |
| `02-activity-tracker` | 运动追踪 | P0 | 待启动 | ~7.5h |
| `03-ai-health-assistant` | AI 健康助手 | P0 | 待启动 | ~9.5h |
| `04-dashboard-home` | 健康仪表盘 | P0 | 待启动 | ~8.5h |

**MVP 总预估工时：~35h**

---

## 📁 目录结构

```
docs/
├── SPEC.md                    # 项目规范总览
├── CHANGES_INDEX.md          # 本文件
└── changes/
    ├── 01-nutrition-diary/
    │   ├── proposal.md       # 需求提案 & 技术设计
    │   └── tasks.md          # 详细任务清单
    ├── 02-activity-tracker/
    │   ├── proposal.md
    │   └── tasks.md
    ├── 03-ai-health-assistant/
    │   ├── proposal.md
    │   └── tasks.md
    └── 04-dashboard-home/
        ├── proposal.md
        └── tasks.md
```

---

## 🚀 推荐开发顺序

```
Week 1-2: 饮食日记 (01)
           └── 完成后仪表盘热量卡片才有真实数据

Week 2-3: 运动追踪 (02)
           └── 完成后仪表盘运动卡片才有真实数据

Week 3-4: AI 健康助手 (03)
           └── 完成后仪表盘 AI 提示才有真实数据
           └── 建议后端 AI 服务（Gemma/GPT）同步接入

Week 4-5: 健康仪表盘 (04) — 可与上述并行
           └── 前期 Mock 数据先行，最后接入各模块真实数据
```

---

## 📝 开发约定

- 所有页面放在 `src/views/` 下，按模块名创建子目录
- 所有 API 封装放在 `src/api/` 下，按模块名创建文件
- 所有类型定义放在 `src/types/` 下，按模块名创建文件
- 所有 Pinia store 放在 `src/stores/` 下，按模块名创建文件
- 组件按需放在 `src/components/` 下，模块专属组件放在 `src/components/<module>/` 子目录
- 每个任务的代码改动需通过 Git 提交，提交信息格式：`[<change-id>] <任务描述>`

---

## ✅ 验收流程

每个 Change 完成后：
1. 对照 `tasks.md` 逐项验收
2. 在本文件的变更列表中更新状态（待启动 → 开发中 → 已完成）
3. 合并到主分支

---

*最后更新：2026-05-27*
