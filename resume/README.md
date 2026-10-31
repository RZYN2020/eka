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

腾讯一段依据《赵勇臻实习答辩_副本.pptx》重写：漏回声检测（精准率约 60%→近 100%，
召回率约 50%）与音色评估（149 组盲测，频谱高频能量和，分类准确率 95%）；不声称
生产上线。此前简历里的“召回率 80%”已按 PPT 更正为 50%。

当前版式按两页控制：正文 `leading` 为 1.14em、纵向页边距为 1.15cm；继续增加内容
前先确认页数没有被推到第三页。

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
虚线下划线加 `↗`，不单独加「博客」标签；`content.typ` 顶部已 `#import` 该函数。
当前版本保留 Agent 框架方向的标题，但字节段按实际职责收窄：「中间件 AI 提效」与
「日志组件与成本治理」直接写负责整体方案设计与推进；流量治理组件面向 RPC、数据库、
消息队列等业务流量，本人负责 BMQ 适配与前端控制面；金融网络专线保留一句「高流量
基础组件 + 日常维护与功能演进」。每个项目统一按「项目简介 → 关键工作 → 结果」
组织；项目标题用 Songti Black 11.5pt 加粗。第 1 页聚焦字节，第 2 页放腾讯、网易、
其他项目与技能；专业技能四条均完整。

## 编辑指南

- `content.typ`：唯一内容源，改文字只动这里。
- `template.typ`：字体、颜色、页边距、项目标题/标签样式。
- `resume.typ`：章节顺序与分页；当前第 1 页只放字节，第 2 页放其余经历、其他项目和技能。

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
  points: (),
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

### 分页与两页约束

`resume.typ` 里用 `#pagebreak()` 把第 1 页切成字节；想恢复自然分页就删掉这一行。
当前正文 `leading` 为 1.14em、纵向页边距 1.15cm；加内容前先确认页数没有被推到第三页。

```bash
pnpm resume:build
```
