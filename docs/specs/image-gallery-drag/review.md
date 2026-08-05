# Review: 图片画廊鼠标拖动

**Base:** agent/project-hardening@4b1023f
**Head:** working tree@4b1023f
**Date:** 2026-08-05

## 🟢 Passing

- 用户需求“鼠标按住图片本身可横向拖动画廊”已覆盖：`src/components/ArticleImages.astro:61` 禁用画廊图片的浏览器原生拖拽，避免 `dragstart` 中断 pointer 滚动。
- 回归检查已覆盖：`scripts/verify-project-contracts.mjs:50` 会在禁用原生拖拽的契约丢失时失败。
- 正确性：改动仅作用于 `.image-gallery` 内图片，不影响独立文章图片和现有单击放大流程。
- 验证：项目契约检查通过；Astro check 为 0 errors / 0 warnings / 0 hints；本地 Chrome 实测横向位移 350px，拖动不打开大图，普通单击仍打开大图。

## 🟡 Improvement

- 无。

## 🔴 Blocking

- 无。
