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
  (label: "工程质量", text: [具备复杂系统调试经验，熟悉自动化测试、PBT、静态类型检查与可观测性建设。]),
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
    projects: (
      (
        name: [中间件方向 AI-Native 建设],
        points: (
          (label: "项目简介", text: [面向业务中间件团队，设计并推进 AI-Native 建设方案，提升研发人效。]),
          (label: "研发流程", text: [建设中间件 AI-Native SDLC，打通需求澄清、方案设计、开发、测试、发布和运维的全流程 AI 辅助与状态自动流转；SDK 发布流水线从单服务、单业务域、关键链路，逐步覆盖到全部 2000+ 微服务，AI 自动生成各服务仓库 MR 并由机器人推送合入，发布耗时从约 *6 个月*缩短至 *3 个月以内*。]),
          (label: "值班提效", text: [建设中间件 Oncall Agent，覆盖接入、排障、选型咨询三类场景；整理 FAQ 作为 Fast Path，导入已有飞书文档到 LLM Wiki 覆盖长尾；把 RPC 接口和 OpenAPI 封装为 MCP，为 Oncall Agent 提供微服务运行时状态查询；梳理组件知识，沉淀排障 Skill。Oncall 问题拦截率达 *60% 以上*。]),
          (label: "数据资产", text: [把散落在文档和个人经验里的中间件信息统一成 Schema（包括产品名称、Skill、控制面地址、Metrics/告警），并整理通用架构资产（链路信息、服务等级、Owner），使元信息可审计、可调用，支撑 Oncall Agent。]),
        ),
      ),
      (
        name: [数据中间件 · 动态日志控制组件],
        points: (
          (label: "项目简介", text: [建设动态日志控制组件和对应的控制面前端，可动态配置日志、降级、裁剪、采样和转存规则，助力日志成本优化。]),
          (label: "组件建设", text: [通过提供 SDK 对业务正在使用的日志库进行透明封装；支持切面机制的库通过 Middleware 注入，不支持切面的库通过反射替换底层 LogAgent Sender；支持配置中心下发规则，按行号、前缀/后缀、context KV 匹配做级别控制、JSON 裁剪、采样与分级 TTL 存储。]),
          (label: "维护升级", text: [负责组件维护和升级：通过 Webhook 监听组件版本变化，自动测试 + AI Review 暴露 API 兼容性问题；并通过 AI、MR 推动全域风险版本升级。]),
          (label: "前端建设", text: [使用 React 建设动态日志控制组件的前端控制面，支持通过 UI 快速配置日志裁剪规则；建设日志报告能力，分析 Top 日志行号；引入 AI 日志分析，识别不可读字段、冗余字段、上下游重复 RPC 日志，生成治理规则建议并支持一键发布。]),
          (label: "成本治理", text: [在财经各业务域推广动态日志组件与控制面，年化降本 *50% 以上*。]),
        ),
      ),
      (
        name: [通信中间件 · MQ 流量解析插件],
        points: (
          (label: "项目简介", text: [财经 MQ 稳定性问题频发，核心是缺乏快速问题发现与限流降级能力。建设流量解析插件，并补齐相关 MQ 框架支持，提升 MQ 稳定性。]),
          (label: "组件建设", text: [建设流量解析插件，以 SDK 形式通过切面接入 RPC、数据库、MQ 等基础组件 SDK，拦截业务流量请求并进行分析和处理；相比 Mesh 方案更具有业务感知能力。]),
          (label: "扩展适配", text: [建设流量解析插件的 MQ 扩展包，通过接口封装和切面适配原有 MQ 库，复用流量解析插件已有的限流/降级能力。]),
          (label: "完善测试", text: [沉淀通用测试 Skill，集成内部 CLI 一键完成集成测试；部署服务、接入组件、发 RPC 请求模拟业务行为，通过日志打点验证限流/降级/观测，并统一申请测试资源池。]),
        ),
      ),
    ),
  ),
  (
    company: [腾讯],
    department: [CSIG · TRTC],
    role: [音视频 SDK],
    logo: "assets/logos/trtc.png",
    logo_height: 4.5mm,
    theme: rgb("#0095ff"),
    dates: ("2025.06 - 2025.09 实习",),
    projects: (
      (
        name: [漏回声检测算法],
        points: (
          (label: "项目简介", text: [负责腾讯实时音视频（TRTC）漏回声检测（Echo Detection）的算法优化与工程落地，针对复杂声学环境改进 WebRTC 开源方案，完成参数调优与业务集成。]),
          (label: "评测体系", text: [独立设计并搭建漏回声检测自动化评测框架，实现测试音频的自动生成与拼接，自动输出量化指标（精准率、召回率、F1-score 等）。]),
          (label: "算法优化", text: [通过分析 Bad Case，调节参数并引入相关工程化方法优化算法。精准率从约 *60%* 提升至近 *100%*，召回率从 *50%* 提升至 *80%*。]),
        ),
      ),
    ),
  ),
  (
    company: [网易],
    department: [雷火 · 伏羲],
    role: [后端系统开发],
    logo: "assets/logos/fuxi.png",
    logo_height: 4.5mm,
    theme: rgb("#00458e"),
    dates: ("2023.06 - 2023.09 实习",),
    projects: (
      (
        name: [自研 RPC 框架序列化模块 · DDL],
        points: (
          (label: "项目简介", text: [DDL（Data Definition Language）是自研 RPC 框架的序列化模块：通过 .ddl 后缀的 IDL 文件定义 schema，框架读取 schema 后动态生成 encoder 与 decoder，实现语言对象与二进制序列的双向转换。后端服务主要使用 Python，序列化框架也是纯 Python 实现，因此性能较慢。负责该框架的维护与性能优化。]),
          (label: "类型安全", text: [引入 Type Hints 并结合 mypy 静态类型检查，提升代码可读性，减少运行时异常。]),
          (label: "完善测试", text: [采用 Property-Based Testing 随机生成输入，验证序列化/反序列化前后一致；代码覆盖率 *90%*，并接入 CI。在性能优化等大规模重构中，使用 diff test 保证实现正确性。]),
          (label: "性能优化", text: [编写性能分析脚本并结合火焰图定位性能瓶颈，主导 DDL 序列化性能优化；通过类型特化、C 语言扩展、基础类型复用 msgspec、NumPy 零拷贝、类型缓存等技术，将平均耗时从 protobuf 的 *50 倍*降到 *2 倍以内*，部分场景低于 *1/4*。]),
        ),
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
      (label: "项目简介", text: [#blog-link("https://yongzhen.space/writing/building-a-transformer-lm/")[从零实现基于 *Transformer* 架构的语言模型]，包括 BPE Tokenizer 与模型架构搭建，并完成训练、#blog-link("https://yongzhen.space/writing/adaptation-in-action/")[微调与对齐]。]),
      (label: "性能优化", text: [通过 #blog-link("https://yongzhen.space/writing/optimize-language-model-performance/")[Profiling] 定位计算与显存瓶颈，实践混合精度、Triton 融合算子、Tiling/Online Softmax 与 PagedAttention 等优化。]),
    ),
  ),
  (
    name: [SysY-RISCV 编译器],
    date: "2024.07 - 2024.09",
    points: (
      (label: "项目简介", text: [使用 *C++17* 实现 #blog-link("https://yongzhen.space/writing/compiler-reflections/")[SysY 到 RISC-V 的编译器]，生成代码的性能达到 *GCC O2 水准*。]),
      (label: "编译优化", text: [基于 *SSA IR* 实现死代码消除、常量折叠、循环优化与寄存器分配等优化 Pass。]),
      (label: "团队协作", text: [担任组长，负责后端架构、指令选择与代码生成，推动团队协作与性能调优。]),
    ),
  ),
  (
    name: [miniOS 操作系统],
    date: "2022.03 - 2022.06",
    points: (
      (label: "项目简介", text: [使用 *C* 实现支持多处理器的 #blog-link("https://yongzhen.space/writing/xv6-riscv-hardware/")[miniOS 操作系统]，完成内存管理与内核多线程等核心模块。]),
      (label: "内存分配", text: [实现内存分配器时，分别实现基于链表、红黑树和 slab 的内存分配器，理解不同策略在时间、空间与碎片化上的权衡，并形成 Fast Path / Slow Path 的设计。]),
      (label: "并发编程", text: [实现内核多线程时，理解并发编程的基本理论，并认识到防御式编程的重要性。]),

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
)
