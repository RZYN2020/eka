# Key Info: travel-time-intervals

## 1. Requirements & Documents

| Field | Value | Source / Notes |
| --- | --- | --- |
| PRD Feishu Doc | 不适用 | 个人项目；需求来自当前用户对话 |
| Meego Link | 不适用 | 个人项目 |
| Background / Goal Summary | 用地点时间区间和基地层级推导真实人生轨迹，替代单程特例 | 用户确认 |
| Scope Boundaries / Non-Goals | 不改变地图视觉与播放交互；不伪造未知的具体日期；不推导现实交通线路 | 用户确认 |

## 2. Technical Plan Documents

| Field | Value | Source / Notes |
| --- | --- | --- |
| Technical Plan Template Doc | 不适用 | 本地个人项目 |
| Technical Plan Storage Wiki Node | 不适用 | 本地个人项目 |
| Technical Plan Online Doc | 不适用 | 本地个人项目 |
| Technical Plan Local Copy | `docs/specs/20260726-travel-time-intervals/spec.md`；`docs/specs/20260726-travel-time-intervals/plan.md` | 本地正式规格与执行计划 |

## 3. BITS / Deployment / Testing

| Field | Value | Source / Notes |
| --- | --- | --- |
| BITS Space | 不适用 | 个人项目 |
| BITS Pipeline / Dev Task | 不适用 | 个人项目 |
| Test Mode | 自测 | 使用现有数据、构建和浏览器地图回归测试 |
| Deploy Swimlane | 不适用 | 此功能不包含部署 |
| Verification Environment | 本地 Astro 生产构建与无头浏览器 | 当前仓库现有验证方式 |
| Involved PSMs & Branches | 无 PSM；`/Users/bytedance/code/awesome-blog/eka-site`，当前分支 `main` | 本地仓库 |

## 4. Key Decisions & Clarifications

| Date | Decision / Clarification | Impact | Source |
| --- | --- | --- | --- |
| 2026-07-26 | 主基地表示人生阶段容器，不等同于每一时刻的实际所在地 | 允许阶段末尾在其他地点停留，再从该地点进入下一阶段 | 用户确认 |
| 2026-07-26 | 普通旅行暂视为短暂访问，结束后返回当前基地 | 月份或季节级日期无需伪造具体日期 | 用户确认 |
| 2026-07-26 | 次主基地期间，短程旅行默认返回次主基地 | 路线生成需要维护当前基地栈 | 用户确认 |
| 2026-07-26 | 最后一个持续驻留地点与阶段同时结束时，直接进入下一个主基地 | 删除 `oneWay` 类临时例外 | 用户确认 |
| 2026-07-26 | 同月内已知顺序使用 `sequence/endSequence`，不补造具体日期 | 严格保持半开区间，同时支持 2026.5 的北京离开顺序 | 实施验证 |
| 2026-07-26 | 相邻访问只有在显式共享 `journeyId` 时才组成连续行程 | 华北旅行按南京、青岛、淄博、泰安、北京、南京连续派生；普通访问仍返回基地 | 用户确认 |
| 2026-07-26 | 2023 年杭州实习期间没有返回庆阳 | 删除错误的杭州—庆阳往返；实习结束后直接回南京 | 用户确认 |
| 2026-07-26 | 乌镇作为独立地点显示，归属嘉兴，备注记录与家人同行 | 数据提供显式坐标，避免按地级市中心定位 | 用户确认 |
| 2026-07-26 | 只知道 2023 年暑假顺序，不补造乌镇和夏令营的月份 | 时间模型加入机器可读季节值，使用排序锚点但保留原始季节精度 | 用户提供“暑假”事实；既有不伪造日期约束 |
| 2026-07-26 | 地图产品名称统一为“人生足迹”并支持全局键盘控制 | 页面、迁移模板、无障碍属性和浏览器回归同步修改 | 用户确认 |
| 2026-07-26 | 2024 云南旅行从南京连续经过西双版纳、大理、丽江、昆明后一次性返回南京 | 四个访问共享显式 `journeyId`，后续无锡、镇江不加入该行程 | 用户确认 |
| 2026-07-26 | Marker 卡顿与偏移来自强调动画覆盖 Leaflet 外层定位 transform | 强调动画迁移到图标内层，外层仅由 Leaflet 定位 | 调试复现与代码数据流确认 |
| 2026-07-26 | 2023 乌镇节点更正为嘉兴旅行并直接点亮嘉兴市 | 城市改为嘉兴，移除乌镇显式坐标，家人同行事实保留 | 用户确认 |
| 2026-07-26 | 2024 云南行程结束后从南京前往杭州参加编译比赛并返回南京 | 新增普通杭州访问，排在云南最终回程之后 | 用户确认 |
| 2026-07-26 | 2025 江南与深圳期间的深珠澳路线为显式连续行程 | 江南按南京—苏州—上海—南京；深珠澳保留珠海—澳门—珠海折返 | 用户确认 |
| 2026-07-26 | 2026 珠港与东北路线均从北京连续出发并返回北京 | 珠海—香港—珠海及哈尔滨—长春—沈阳分别使用独立 `journeyId` | 用户确认 |
| 2026-07-26 | 用户口述的“2016 年 6 月”按上下文确认为 2026 年 6 月长途路线 | 庆阳不再作为 `stay`；路线从南京连续经过庆阳、西安、珠海、深圳、惠州、广州、南昌、九江回南京，再进入北京工作阶段 | 用户原文与前后年份上下文 |

## 5. Pending Information

- [x] 正式规格与验收标准
- [ ] 当前 Codex Desktop 线程的可恢复会话标识

## 6. User Preferences

| Field | Value | Source / Notes |
| --- | --- | --- |
| Pipeline Confirm | 待补充 | 当前功能不创建流水线 |
| Pre-Clean Branch | false | 用户要求在现有项目上持续完成；当前工作区包含本轮未提交改动 |
| Commit Mode | bulk | 用户希望全部完成后统一推送 GitHub |
| Auto Push Doc | false | 仅维护本地设计文档 |

## 7. Session Recovery Instructions

| Agent / Model Type | Restore Command | Notes |
| --- | --- | --- |
| Claude Code / Claude-family models | `cjadk claude --resume <session_id>` | 当前没有可验证的 Claude `session_id` |
| Codex CLI / GPT-family models | `codex resume --last` | 仅在当前线程是最近一次原生 Codex 会话时使用 |
| Current Recommended Resume | 待补充 | 当前运行于 Codex Desktop，未提供可验证的原生 session id |

### Current Session Context

- Project path: `/Users/bytedance/code/awesome-blog/eka-site`
- Feature dir: `docs/specs/20260726-travel-time-intervals`
- Owning agent/model: `codex / GPT-family`
- CJADK session ref: `待补充`
- Native session ref: `待补充`
- Quick restore: 在 Codex Desktop 中重新打开当前线程，并先读取本文件和 `brainstorm.md`
