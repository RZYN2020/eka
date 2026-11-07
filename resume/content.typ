// 博客链接样式：内容文件自带，避免编辑器里 import 解析不到。
#let blog-link(url, body) = link(url)[
  #underline(body, stroke: (
    paint: rgb("#173f5f"),
    thickness: 0.45pt,
    dash: "dotted",
  ))
  #text(size: 0.62em, baseline: 0.32em, fill: rgb("#173f5f"))[↗]
]

// ============================================================
// 简历内容（唯一内容源）
//
// 结构：
//   1. profile / education / skills
//   2. experience：每段经历 = 公司信息 + projects
//      每个 project = name + points
//      points 第一条建议写「项目简介」：组件/项目是什么 + 我负责什么
//      后续每条 = label + text；text: [] 渲染成 ***，text: none 不显示
//   3. projects：个人项目 = name + date + points
//
// 博客链接：正文中写 #blog-link("https://...")[显示文字]
//          渲染为下划线 + ↗，不要单独加「博客 N 篇」标签。
// ============================================================

// ---------- 基本信息 ----------
#let profile = (
  name: "赵勇臻",
  headline: "AI Agent 应用 / 后端开发",
  phone: "(+86) 181-6810-0075",
  phone-link: "+8618168100075",
  email: "zhaoyzzz@outlook.com",
  website: "yongzhen.space",
  birth: "2002.3.22",
  hometown: "甘肃庆阳",
)

// ---------- 教育背景 ----------
#let education = (
  (
    school: [南京大学],
    logo: "assets/logos/nju-emblem-purple.pdf",
    logo_height: 6mm,
    theme: rgb("#6a005f"),
    lines: (
      (degree: [硕士], major: [软件工程专业], date: "2024.09 - 2026.06", note: ""),
      (degree: [本科], major: [软件工程专业], date: "2020.09 - 2024.06", note: ""),
    ),
  ),
)

// ---------- 专业技能 ----------
#let skills = (
  (label: "AI / Agent", text: [熟悉 LLM、Transformer 与 PyTorch，具备 Tool Calling、RAG、Context Engineering、Agent Evaluation 等 AI Agent 开发经验。]),
  (label: "后端与分布式系统", text: [Go、Python、C/C++；熟悉 Linux、并发编程、数据库、Kafka、etcd、Docker / Kubernetes 及云原生基础设施。]),
  (label: "系统与性能", text: [具备操作系统、编译器、程序语言与运行时基础，熟悉 Benchmark、Profiling、火焰图分析及端到端性能优化。]),
  (label: "工程质量", text: [具备复杂系统调试与问题定位经验，熟悉自动化测试、Property-Based Testing、静态类型检查与可观测性建设。]),
)

// ---------- 工作经历 ----------
// 每段经历：company / department / role / logo / theme / dates / projects。
// projects 里每个项目：name + points；points 第一条建议用 "项目简介"。
#let experience = (
  (
    company: [字节跳动],
    department: [财经业务 · 基础组件/中间件方向],
    role: none,
    logo: "assets/logos/bytedance.svg",
    logo_height: 4.5mm,
    theme: rgb("#3c8cff"),
    dates: ("2025.12 - 2026.05 实习", "2026.07 - 至今 正式"),
    // 字节三条只保留「项目简介」；补内容时按下面注释的格式加：
    // (label: "关键工作", text: [...]),
    // (label: "难点与结果", text: [...]),
    projects: (
      (
        name: [中间件方向 AI-Native 建设],
        points: (
          (label: "项目简介", text: [面向组件研发与运维的 AI-Native 建设，负责知识库、Oncall Agent、排障 Skill、评测与研发流程。]),
          // (label: "关键工作", text: [...]),
          // (label: "难点与结果", text: [...]),
        ),
      ),
      (
        name: [数据中间件 · 动态日志控制组件],
        points: (
          (label: "项目简介", text: [负责数据中间件下的动态日志控制组件、控制面前端与日志成本治理，覆盖日志采集转发、AI 日志分析与成本优化。]),
          // (label: "关键工作", text: [...]),
          // (label: "难点与结果", text: [...]),
        ),
      ),
      (
        name: [通信中间件 · MQ 流量解析插件],
        points: (
          (label: "项目简介", text: [面向业务流量的统一治理组件，可接入 RPC、数据库、消息队列等；负责 MQ 流量解析插件与前端控制面。]),
          // (label: "关键工作", text: [...]),
          // (label: "难点与结果", text: [...]),
        ),
      ),
    ),
    points: (),
  ),
  (
    company: [腾讯],
    department: [CSIG · TRTC · 音视频 SDK],
    role: none,
    logo: "assets/logos/trtc.png",
    logo_height: 4.5mm,
    theme: rgb("#0095ff"),
    dates: ("2025.06 - 2025.09 实习",),
    projects: (),
    points: (
      (
        label: "算法与工程",
        text: [负责腾讯实时音视频（TRTC）*回声检测（Echo Detection）* 的算法优化与工程落地，针对复杂声学环境改进 WebRTC 开源方案，完成参数调优与业务集成。],
      ),
      (
        label: "识别效果",
        text: [实现复杂场景下的回声识别，*精准率接近 100%，召回率达 80%*。],
      ),
      (
        label: "评测体系",
        text: [独立设计并搭建自动化评测框架，支持测试数据生成、音频拼接、批量运行与量化报告输出，缩短算法验证周期。],
      ),
    ),
  ),
  (
    company: [网易],
    department: [伏羲],
    role: [后端系统开发],
    logo: "assets/logos/fuxi.png",
    logo_height: 4.5mm,
    theme: rgb("#00458e"),
    dates: ("2023.06 - 2023.09 实习",),
    projects: (),
    points: (
      (
        label: "核心职责",
        text: [负责面向智能体编程（AOP）框架核心组件——*自研序列化框架 DDL* 的功能开发、质量建设与性能优化。],
      ),
      (
        label: "功能与类型安全",
        text: [扩展多种复杂数据类型支持，引入 type hints 与 mypy 静态类型检查，提升代码可维护性和类型安全性。],
      ),
      (
        label: "质量建设",
        text: [基于 *Property-Based Testing* 完善随机测试，将 DDL 模块测试覆盖率提升至 *90%*。],
      ),
      (
        label: "性能优化",
        text: [编写性能分析脚本并通过火焰图定位瓶颈，将 DDL 序列化平均耗时从 protobuf 的约 *50 倍*优化至典型场景下 *2 倍以内*，部分场景低于 protobuf 的 *1/4*。],
      ),
    ),
  ),
)

// ---------- 个人项目 ----------
#let projects = (
  (
    name: [Transformer-LLM],
    date: "2025.03 - 2025.04",
    points: (
      (label: "项目内容", text: [#blog-link("https://yongzhen.space/writing/building-a-transformer-lm/")[从零实现基于 *Transformer* 架构的语言模型]，完成训练、#blog-link("https://yongzhen.space/writing/adaptation-in-action/")[微调、对齐]与部署链路。]),
      (label: "性能优化", text: [通过 #blog-link("https://yongzhen.space/writing/optimize-language-model-performance/")[Profiling] 定位计算与显存瓶颈，实践混合精度、Triton 融合算子、Tiling/Online Softmax 与 PagedAttention 等优化。]),
    ),
  ),
  (
    name: [SysY-RISCV 编译器],
    date: "2024.07 - 2024.09",
    points: (
      (label: "项目内容", text: [使用 *C++17* 实现 #blog-link("https://yongzhen.space/writing/compiler-reflections/")[SysY 到 RISC-V 的编译器]，生成代码的性能达到 *GCC O2 水准*。]),
      (label: "编译优化", text: [基于 *SSA IR* 实现死代码消除、常量折叠、循环优化与寄存器分配等优化 Pass。]),
      (label: "团队协作", text: [担任组长并负责后端架构、指令选择与代码生成，推进团队协作和性能调优。]),
    ),
  ),
  (
    name: [miniOS 操作系统],
    date: "2022.03 - 2022.06",
    points: (
      (label: "项目内容", text: [使用 *C* 实现支持多处理器的#blog-link("https://yongzhen.space/writing/xv6-riscv-hardware/")[教学操作系统]，完成内存管理与内核多线程等核心模块。]),
      (label: "核心实现", text: [分别实现基于链表、红黑树与 *slab* 的内存分配器，对比其时间、空间与碎片化权衡，并设计 Fast Path / Slow Path。]),
    ),
  ),
)

// “其他项目”按一段经历渲染：一张带标识的标题行，下面挂多个普通项目行，
// 与字节跳动那一段的层级保持一致。
#let other-projects = (
  company: [其他项目],
  department: [编译器 / 操作系统 / LLM],
  role: none,
  logo: "assets/logos/projects.svg",
  logo_height: 4.5mm,
  theme: rgb("#173f5f"),
  dates: (),
  projects: projects,
  points: (),
)
