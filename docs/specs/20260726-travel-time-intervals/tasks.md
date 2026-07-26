# Tasks: Travel Time Intervals

## Execution mode

- Path: sequential implementation
- Reason: all four tasks share the same travel schema and route semantics; later tasks consume contracts established by earlier tasks.
- Testing: TDD, with a focused regression command at every task boundary.
- Commit mode: bulk. Per-task commits are deferred because the current worktree contains the larger site migration in progress.

## Task list

| ID | Task | Files | Depends on | Acceptance |
| --- | --- | --- | --- | --- |
| T-1 | Establish interval-aware date and tree validation | `src/lib/travel-time.js`, `scripts/verify-travel-time.mjs` | — | `node scripts/verify-travel-time.mjs` passes; partial ISO dates, closed intervals, phase continuity, containment, `sequence/endSequence` ordering, and stay overlap rules are covered. |
| T-2 | Derive journeys from the recursive base stack | `src/lib/travel-journey.js`, `scripts/verify-travel-journey.mjs` | T-1 | Synthetic journey tests pass; visits return to the active base, stays temporarily replace it, and terminal stays transition directly to the next phase. |
| T-3 | Migrate the real travel history to interval data | `src/data/travel.js`, `scripts/verify-travel-journey.mjs` | T-2 | Real-data regressions pass for Chengdu 2018, the 2020 Lanzhou–Qingyang–Nanjing transition, and the Hangzhou secondary-base route; legacy routing flags are absent. |
| T-4 | Adapt map rendering, controls, and browser regressions | `src/scripts/travel-map.js`, `scripts/verify-map-runtime.mjs`, `package.json` | T-3 | `pnpm check`, `pnpm build`, `pnpm verify`, `pnpm check:map`, and `git diff --check` all pass without changing the intended map interaction or visual language. |
| T-5 | 支持显式连续行程并修正 2023 路线 | `src/lib/travel-time.js`, `src/lib/travel-journey.js`, `src/data/travel.js`, `src/scripts/travel-map.js`, `scripts/verify-travel-time.mjs`, `scripts/verify-travel-journey.mjs` | T-4 | 华北行程只在北京后返回南京；杭州期间没有庆阳，嘉兴和夏令营均从杭州往返；季节事实不伪造月份。 |
| T-6 | 统一人生足迹、键盘操作与 Marker 稳定性 | `src/pages/map/index.astro`, `scripts/migrate-custom-pages.mjs`, `src/data/travel.js`, `src/scripts/travel-map.js`, `src/styles/map-theme.css`, `scripts/verify-travel-journey.mjs`, `scripts/verify-map-runtime.mjs` | T-5 | 页面统一命名；云南连续往返；键盘可控制人生轨迹；悬停和缩放不再破坏 Marker 定位。 |
| T-7 | 补全 2023–2026 已确认连续路线 | `src/data/travel.js`, `scripts/verify-travel-journey.mjs` | T-6 | 嘉兴以城市节点点亮；云南后杭州往返；2025 江南与深珠澳、2026 珠港、东北和六月长途路线逐站连续且只在终点返回基地。 |

## Acceptance checklist

- [x] T-1 Interval validation complete
- [x] T-2 Recursive journey derivation complete
- [x] T-3 Real travel data migrated
- [x] T-4 Map consumers and regressions updated
- [x] T-5 显式连续行程与 2023 路线修正
- [x] T-6 人生足迹、键盘与 Marker 稳定性
- [x] T-7 补全已确认连续路线
- [x] Final spec/diff review complete
