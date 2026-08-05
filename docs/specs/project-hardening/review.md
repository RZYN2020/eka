# Review: 博客质感与工程可靠性收尾

**Base:** `main@dcbd626`
**Head:** `a8aabcc`
**Date:** 2026-07-26

## 🟢 Passing

- 视觉与响应式：首页列表节奏、链接反馈、正文排版和移动端单行导航已更新；移动端真实浏览器验证覆盖 390×844 视口、5 个导航入口、主题入口和页面级横向溢出（commit `a8aabcc`，`src/styles/layout.css:150`、`src/styles/content.css:1`、`scripts/verify-site-runtime.mjs:14-35`）。
- 主题契约：`Auto` 为默认偏好，跟随 `prefers-color-scheme`，系统变化时自动重算；存储不可用时降级为 `Auto`，并统一更新 `theme-color`（commit `a8aabcc`，`src/components/ThemeBootstrap.astro:8-55`、`scripts/verify-site-runtime.mjs:31-47`）。
- 内容模型：分类与子分类关系由唯一 taxonomy 约束；内容验证覆盖输出 slug、旧链接、日期顺序、废弃字段和孤立资源（commit `a8aabcc`，`src/content.config.ts:6-41`、`scripts/verify-content-model.mjs`）。
- 可靠性：地图会安全处理被禁用或损坏的 `sessionStorage`，初始化失败后不再绑定无效地图事件（commit `a8aabcc`，`src/lib/map-storage.js:1-31`、`src/scripts/travel-map.js:130-174`、`scripts/verify-map-storage.mjs`）。
- 同步幂等性：NeoDB 请求具有超时、有限重试与响应结构校验；业务数据不变时保留原时间戳且不写文件（commit `a8aabcc`，`scripts/lib/neodb-sync.mjs:1-66`、`scripts/verify-neodb-sync.mjs`）。
- 安全与可维护性：搜索数据先转义 `<`，结果通过 DOM API 和 `textContent` 构造，不再使用 `any` 或 `innerHTML`（commit `a8aabcc`，`src/pages/search.astro:27-90`）。
- 项目精简：历史迁移入口与双内容源已移除；Tailwind、`smol-toml` 和外部 Google Fonts 依赖已去除；站点、主题、导航与描述常量集中管理（commit `a8aabcc`，`package.json`、`src/config/site.ts`、`src/config/theme.ts`）。
- 持续集成：新增 push/PR 检查，覆盖冻结锁文件安装、类型检查、完整构建与全量验证（commit `a8aabcc`，`.github/workflows/ci.yml:1-44`）。
- 验证证据：
  - `pnpm check`：64 个文件，0 errors / 0 warnings / 0 hints。
  - `pnpm build`：118 个静态页面、598 个响应式图片变体，并成功生成 `dist/resume/resume.pdf`。
  - `pnpm verify`：最终全绿，覆盖 39 篇文章、180 张引用图片、120 个 HTML 页面、移动端站点运行、终端中间件和地图运行时（35 个标记，缩放 5 → 7）。
  - 最终 `git diff --cached --check`：通过。
- 风险扫描：Correctness、Project standards、Security、Robustness、Performance、Testability、API contract 与 Architecture 均未发现阻塞或待解决项。

## 🟡 Improvement

- （无）

## 🔴 Blocking

- （无）

## 2026-08-05 仓库治理复审

### 🟢 Passing

- 资产预算：庐山游记 20 张大体积 PNG 已替换为 WebP，内容目录由约 160 MiB 降至 30 MiB；GeoJSON 总量由约 25 MiB 降至 4.5 MiB，并由 `scripts/verify-repo-health.mjs` 持续约束。
- 模块边界：人生轨迹状态、动画与时间轴逻辑迁移到 `src/lib/travel-map-journey.js`；地图运行时覆盖点击、拖动、Home/End 键盘导航和图层懒加载。
- 样式治理：`map.css` 与 `map-theme.css` 合并为单一地图样式入口，消除跨文件重复选择器的隐式覆盖。
- 依赖与验证：移除未使用的模块化 `d3` 依赖，保留幻灯片所需的 vendored D3；完整验证由 `scripts/verify.mjs` 分阶段调度，并提供 fast/runtime 两种子集。
- 文档治理：删除 About 单行文案调整产生的 112 行一次性过程材料，README 明确只长期保留复杂功能方案和设计决策。
- 验证证据：`pnpm check` 为 74 个文件、0 errors / 0 warnings / 0 hints；`pnpm build` 成功生成 121 个页面与 PDF；`pnpm verify` 共 13 项通过，地图运行时为 35 个标记、缩放 5 → 7；冻结 lockfile 离线校验通过。
- 风险扫描：Correctness、Project standards、Security、Robustness、Performance、Testability、API contract 与 Architecture 均无阻塞项；未执行部署、推送或历史重写。

### 🟡 Improvement

- （无）

### 🔴 Blocking

- （无）
