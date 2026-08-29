# Typst 简历

仓库只保留一套手写 Typst 简历：

- `content.typ`：唯一内容源；
- `template.typ`：字体、颜色、页面和组件；
- `resume.typ`：章节顺序与文档入口。
- `fonts/`：`chicv` 使用的 Linux Biolinum 标题字体；
- `assets/logos/`：工作经历使用的公司透明背景标识。

```bash
pnpm resume:build
pnpm resume:watch
```

`pnpm resume:build` 会把 PDF 编译到 `public/resume/resume.pdf`。该 PDF 已提交进
仓库，Astro 构建会把它复制为 `dist/resume/resume.pdf`；修改内容后重新运行
`pnpm resume:build` 并提交新 PDF 即可。

内容迁移以原 Markdown 简历为完整基线，并保留此前已经补充的字节跳动项目说明。
“专业技能”目前仅保留章节，等待后续补充。

版式以 [`skyzh/chicv`](https://github.com/skyzh/chicv) 的源码为骨架，并在其出版物式
结构上加入个人强调色、公司标识和单行经历标题。三处经历均使用纯图形标识（无文字），
公司名称仍保留为可检索文本。ByteDance 标识来自
[`simple-icons`](https://github.com/simple-icons/simple-icons)；腾讯使用
TRTC（腾讯实时音视频）图形标识，取自 [trtc.io](https://trtc.io) 站点 favicon；
网易使用伏羲实验室图形标识，取自 [fuxi.163.com](https://fuxi.163.com) 站点
favicon。三者均去底透明化处理。

每条工作经历的标题行以该公司主题色的淡色块作为背景（`content.typ` 中的 `theme`
字段），配合透明背景 Logo 呈现品牌色，同时保证公司名与日期仍为普通文本。
