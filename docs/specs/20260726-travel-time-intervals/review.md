# Review: 旅行时间区间模型

**Base:** `main@483e0a5`
**Head:** `main@483e0a5` + bulk commit 工作区
**Date:** 2026-07-26

> 本功能遵循 `key_info.md` 中用户确认的 bulk commit 模式。任务证据引用当前工作区文件及本轮新鲜验证输出，最终统一提交尚未创建。

## 🟢 Passing

### FR / SC coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| FR-1 | Covered | `src/data/travel.js:4-151` 使用 `phase/stay/visit + children`；`scripts/verify-travel-journey.mjs:169-175` 拒绝旧字段。 |
| FR-2 | Covered | `src/lib/travel-time.js:1-52,79-97` 校验部分 ISO、季节值、显式 `end` 与当前阶段 `null`；`scripts/verify-travel-time.mjs` 覆盖合法及非法边界。 |
| FR-3 | Covered | `src/lib/travel-time.js:87-89` 强制点状访问 `start = end`；`scripts/verify-travel-time.mjs:79-87,131-145` 覆盖月份和季节精度。 |
| FR-4 | Covered | `src/lib/travel-time.js:99-126` 校验父子半开区间和边界序号；同月边界回归位于 `scripts/verify-travel-time.mjs:89-118`。 |
| FR-5 | Covered | `src/lib/travel-time.js:170-199` 校验唯一开放阶段及阶段连续性；生产阶段位于 `src/data/travel.js`。 |
| FR-6 | Covered | `src/lib/travel-journey.js:40-75` 以递归容器维护当前基地；合成路线见 `scripts/verify-travel-journey.mjs:6-60`。 |
| FR-7 | Covered | `src/lib/travel-journey.js:46-75` 在 `stay` 内递归派生并返回当前驻留；嘉兴与南京夏令营回归见 `scripts/verify-travel-journey.mjs:195-205`。 |
| FR-8 | Covered | `src/lib/travel-journey.js:63-65` 为无行程标识的普通访问生成回程；合成断言见 `scripts/verify-travel-journey.mjs:51-58`。 |
| FR-9 | Covered | `src/lib/travel-journey.js:68-74` 为非终点 `stay` 生成回程；深圳场景见 `scripts/verify-travel-journey.mjs:19-31,51-58`。 |
| FR-10 | Covered | `src/lib/travel-journey.js:69-74` 比较结束边界后跳过阶段末回程；2020 回归见 `scripts/verify-travel-journey.mjs:189-193`。 |
| FR-11 | Covered | 普通访问分支始终执行回程；`scripts/verify-travel-journey.mjs:62-86` 覆盖阶段末点状访问。 |
| FR-12 | Covered | `src/lib/travel-time.js:15-20,49-70` 归一化日期并稳定排序；`scripts/verify-travel-time.mjs:71-118` 覆盖同月、同季和结束边界。 |
| FR-13 | Covered | `src/lib/travel-journey.js:7-37` 保留日期、标签、类型、动作及派生标识；路线断言覆盖真实和派生节点。 |
| FR-14 | Covered | `src/scripts/travel-map.js:548-632` 只为真实节点生成三类刻度；`scripts/verify-map-runtime.mjs:82-103` 端到端检查。 |
| FR-15 | Covered | 成都与 2020 阶段承接分别由 `scripts/verify-travel-journey.mjs:183-193` 固定；已撤销的杭州旧事实在 Spec 中保留更正记录。 |
| FR-16 | Covered | 播放、步进、点击、拖动、Home/End 由 `scripts/verify-map-runtime.mjs:49-139` 端到端覆盖。 |
| FR-17 | Covered | `src/lib/travel-journey.js:49-61` 按相邻 `journeyId` 生成一次最终回程；`scripts/verify-travel-journey.mjs:119-163` 验证完整华北行程。 |
| FR-18 | Covered | `src/data/travel.js:60-88` 删除杭州—庆阳并加入嘉兴、夏令营和华北分组；`scripts/verify-travel-journey.mjs:195-205` 固定完整顺序。 |
| FR-19 | Covered | `src/data/travel.js:67-74` 使用嘉兴城市节点且无乌镇显式坐标；`scripts/verify-travel-journey.mjs:207-209` 固定数据契约，`scripts/verify-map-runtime.mjs:144-147` 验证嘉兴时间轴节点及地图加载。 |
| FR-20 | Covered | `src/pages/map/index.astro:28,37` 与 `scripts/migrate-custom-pages.mjs:141,183` 统一使用“人生足迹”；运行时回归同时断言页面标题与主标题。 |
| FR-21 | Covered | `src/scripts/travel-map.js:555-568,1214-1253` 实现轨迹级前后步进和全局快捷键；`src/pages/map/index.astro:58,68-69` 暴露对应 `aria-keyshortcuts`。 |
| FR-22 | Covered | `src/data/travel.js:91-97` 为云南四站声明同一 `journeyId` 并在其后加入杭州比赛；`scripts/verify-travel-journey.mjs:211-221` 固定南京出发、昆明后一次返回南京、再往返杭州的路线。 |
| FR-23 | Covered | `src/scripts/travel-map.js:996-1000` 只切换状态类，`src/styles/map-theme.css:554-556` 在 Marker 内层缩放；浏览器回归断言外层 Leaflet `translate3d` 在悬停与缩放后保持完整。 |
| FR-24 | Covered | `src/data/travel.js:109-140` 用五个独立 `journeyId` 表达 2025–2026 连续路线及重复珠海节点；`scripts/verify-travel-journey.mjs:224-272` 逐段固定完整相邻顺序和 2026.6 阶段承接。 |
| SC-1–SC-5 | Covered | 结构化路线、递归回程、阶段承接和非法边界分别由 `verify-travel-journey` 与 `verify-travel-time` 覆盖。 |
| SC-6 | Covered | `pnpm check`：57 files，0 errors / warnings / hints；`pnpm build`：118 pages 并生成 `resume.pdf`；`pnpm verify`：120 HTML pages；`pnpm check:map`：35 markers，zoom 5 → 7；`git diff --check` 通过。 |
| SC-7 | Covered | 华北行程只有一个派生回程，杭州、嘉兴与华北完整顺序由 `scripts/verify-travel-journey.mjs:154-163,195-209` 固定。 |
| SC-8 | Covered | 页面命名、云南及杭州比赛路线、J / Space / 方向键 / Escape、时间轴键盘操作及 Marker 定位稳定性均由 `scripts/verify-map-runtime.mjs` 和 `scripts/verify-travel-journey.mjs` 覆盖。 |
| SC-9 | Covered | 2025 江南与深珠澳、2026 珠港、东北及六月长途路线由 `scripts/verify-travel-journey.mjs:224-272` 逐段断言。 |

### Task chain

- T-1：`src/lib/travel-time.js`、`scripts/verify-travel-time.mjs`；`Travel time verification passed.`
- T-2：`src/lib/travel-journey.js`、`scripts/verify-travel-journey.mjs`；`Travel journey verification passed.`
- T-3：`src/data/travel.js` 与生产数据回归；旧路线字段扫描为空。
- T-4：`src/scripts/travel-map.js`、`scripts/verify-map-runtime.mjs`；地图交互回归通过。
- T-5：季节值、`journeyId`、2023 杭州、嘉兴与华北路线均有失败优先测试和生产数据回归。
- T-6：页面命名、云南路线、全局快捷键和 Marker 外层变换保护均有失败优先回归；地图交互回归通过。
- T-7：嘉兴修正、云南后杭州比赛及五段 2025–2026 连续路线均有失败优先生产数据回归；未修改路线生成算法。
- Commit mapping：按用户确认的 bulk commit 模式统一延后，最终提交前再次审查 staged diff。

### Risk scan

- Correctness：嘉兴、云南后杭州、重复珠海节点、2026.6 庆阳类型和主基地承接均有精确相邻路线回归；时间树验证继续通过。
- Project standards：`pnpm check` 与 `git diff --check` 通过；新逻辑保持数据、派生和地图消费分层。
- Robustness：无效日期、越界节点和非法 `journeyId` 会明确失败；缺失地图坐标会集中报告。
- Performance：地图首屏只加载城市 GeoJSON；省份和世界数据在首次切换时按需加载并缓存，运行时回归固定请求顺序与一次性加载约束。
- Testability / API contract / Architecture：季节格式与 `journeyId` 是明确的数据契约，并由独立数据测试和地图端到端测试覆盖。
- Security：本次改动不涉及鉴权、密钥、用户输入、反序列化或 shell 拼接。

## 🟡 Improvement

- （无未解决项）

## 🔴 Blocking

- （无）
