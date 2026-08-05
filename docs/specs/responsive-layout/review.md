# Review: 全站窄屏适配修复

**Base:** agent/project-hardening@fc77b6b
**Head:** working tree@fc77b6b
**Date:** 2026-08-05

## 🟢 Passing

- FR-1 长 URL 在窄屏正文内换行：`src/styles/content.css:383` 使用 `overflow-wrap: anywhere`；浏览器复扫 37 篇文章的 320/390/768px 状态均无页面级横向溢出。
- FR-2 长公式不撑开页面：`src/styles/content.css:502` 将块级 KaTeX 公式限制为独立横向滚动区域；`adaptation-in-action` 在 320/390/768px 下均无页面级溢出。
- FR-3 地图侧栏适配小于 360px 的屏幕：`src/styles/map-theme.css:647` 增加 `max-width: 100vw`；320px 下侧栏宽度为 320px，390px 下仍保持 360px。
- 回归覆盖：`scripts/verify-project-contracts.mjs:58` 检查链接换行、公式滚动容器和地图侧栏视口上限。
- 验证：项目契约检查通过；Astro check 为 0 errors / 0 warnings / 0 hints；111 个文章响应式状态无溢出；浏览器控制台无 error。
- 风险扫描：改动仅增加 CSS 约束，不涉及安全、数据、API、依赖或运行时状态变更；正确性与项目规范未发现问题。

## 🟡 Improvement

- 无。

## 🔴 Blocking

- 无。
