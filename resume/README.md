# Typst 简历

仓库只保留一套手写 Typst 简历：

- `content.typ`：唯一内容源；
- `template.typ`：字体、颜色、页面和组件；
- `resume.typ`：章节顺序与文档入口。
- `fonts/`：`chicv` 使用的 Linux Biolinum 标题字体；
- `assets/logos/`：工作经历与项目组使用的透明背景标识（公司 Logo 和 `projects.svg`）。

```bash
pnpm resume:build
pnpm resume:watch
```

`pnpm resume:build` 会把 PDF 编译到 `public/resume/resume.pdf`。该 PDF 已提交进
仓库，Astro 构建会把它复制为 `dist/resume/resume.pdf`；修改内容后重新运行
`pnpm resume:build` 并提交新 PDF 即可。

字节跳动一段依据《赵勇臻｜个人介绍与试用期答辩准备（工作内容细化版）》整理，重点
保留日志成本治理与中间件 AI 提效，BMQ 与专线作为工程案例。对外版本已去掉内部平台名、
业务域和绝对成本数字，改用通用平台能力与相对指标描述。

腾讯、网易目前恢复为原始简历文本；此前基于 PPT/Obsidian 的改写已撤回。若要用
答辩 PPT 的口径（召回率约 50%、音色评估），可在 `content.typ` 里手动补。

当前使用自然分页；正文 `leading` 为 1.14em、纵向页边距为 1.15cm。内容较多时会到
3 页，按需删减或调整。

版式以 [`skyzh/chicv`](https://github.com/skyzh/chicv) 的源码为骨架，并在其出版物式
结构上加入个人强调色、公司标识和单行经历标题。三家公司均使用纯图形标识（无文字），
公司名称仍保留为可检索文本。ByteDance 标识来自
[`simple-icons`](https://github.com/simple-icons/simple-icons)；腾讯使用
TRTC（腾讯实时音视频）图形标识，取自 [trtc.io](https://trtc.io) 站点 favicon；
网易使用伏羲实验室图形标识，取自 [fuxi.163.com](https://fuxi.163.com) 站点
favicon。三者均去底透明化处理。

每条工作经历的标题行以该公司主题色的淡色块作为背景（`content.typ` 中的 `theme`
字段），配合透明背景 Logo 呈现品牌色，同时保证公司名与日期仍为普通文本。

“其他项目”按一段经历渲染：一张带自绘 `projects.svg` 文件夹标识和 navy 主题色的
标题行，下方用 `subproject` 挂多个普通项目行。这样它与“字节跳动”那一段保持相同
层级——一个标题行、多个项目——而不再为每个项目单独生成卡片或字母 Logo。每个项目
的日期单独右对齐显示，不写进标题行。

其他项目的博客链接用 `blog-link(url, text)` 内联在项目叙述的自然词句上，渲染为
虚线下划线加 `↗`，不单独加「博客」标签；`content.typ` 顶部自带 `blog-link` 定义，不依赖外部导入。
当前字节段是三条中间件方向的项目骨架：中间件方向 AI-Native 建设、数据中间件 ·
动态日志控制组件、通信中间件 · MQ 流量解析插件；每个项目只保留「项目简介」，
其余 bullet 在 `content.typ` 里用注释占位，方便手动填写。项目标题用 Songti Black
11.5pt 加粗；腾讯、网易、个人项目和专业技能保持原内容。

## 编辑指南

- `content.typ`：唯一内容源，改文字只动这里。
- `template.typ`：字体、颜色、页边距、项目标题/标签样式。
- `resume.typ`：章节顺序；当前自然分页。若想让字节独占第 1 页，可在字节后加 `#pagebreak()`。

### 工作经历

```typst
(
  company: [公司],
  department: [部门],
  role: [角色],
  logo: "assets/logos/xxx.svg",
  logo_height: 4.5mm,
  theme: rgb("#3c8cff"),
  dates: ("2025.06 - 2025.09 实习",),
  projects: (
    (
      name: [项目名],
      points: (
        (label: "项目简介", text: [组件/项目是什么 + 我负责什么。]),
        (label: "关键工作", text: [做了什么。]),
        (label: "结果", text: [量化结果。]),
      ),
    ),
  ),
)
```

### 个人项目

```typst
(
  name: [项目名],
  date: "2025.03 - 2025.04",
  points: (
    (label: "项目内容", text: [...]),
    (label: "关键实现", text: [...]),
  ),
)
```

### 博客链接

在正文里直接写：

```typst
#blog-link("https://yongzhen.space/writing/...")[显示文字]
```

会渲染成下划线 + `↗`，不单独占行，也不加「博客 N 篇」标签。

### 分页

当前 `resume.typ` 使用自然分页；若想让字节独占第 1 页，可在字节后加 `#pagebreak()`。
当前正文 `leading` 为 1.14em、纵向页边距 1.15cm；内容多时会到 3 页，按需删减。

```bash
pnpm resume:build
```
