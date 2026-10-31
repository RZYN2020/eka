#import "template.typ": blog-link

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
  headline: "AI Agent 基础设施 / 后端开发",
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
    department: [中间件],
    role: [后端开发 / AI Agent],
    logo: "assets/logos/bytedance.svg",
    logo_height: 4.5mm,
    theme: rgb("#3c8cff"),
    dates: ("2025.12 - 2026.05 实习", "2026.07 - 至今 正式"),
    projects: (
      (
        name: [中间件 AI 提效],
        points: (
          (label: "项目简介", text: [面向中间件研发与运维的 AI 提效平台，负责知识库、Oncall Agent、排障 Skill、评测与研发流程。]),
          (label: "Oncall 与知识库", text: [建设覆盖 *26 个中间件*组件的三级知识库（AI 知识库 / 代码仓库 / Wiki 长尾召回）；在 Fops 建统一 Oncall 入口，配置 26 个问题分类与值班计划。]),
          (label: "工具与 Skill", text: [封装 5 个排障查询 Skill 和 21 个组件接入/开发 Skill，基于内部 Agent 平台搭建 Oncall Agent 与机器人入口。]),
          (label: "评测与流程", text: [建设 *104 题*问答测评与真实排障样例，准确率从*约 50% 提升至 80%+*；推进 Flux + Meego 流程在 *3 个需求*中落地，季度拦截率约 *30%*，节省 *4 人日+*。]),
        ),
      ),
      (
        name: [日志组件与成本治理],
        points: (
          (label: "项目简介", text: [负责日志组件与成本治理，覆盖日志采集转发、AI 日志分析与成本优化。]),
          (label: "系统设计", text: [兼容新旧写入器与异步发送，通过配置中心将日志路由到短 TTL 存储，业务免改代码与发版。]),
          (label: "AI 日志分析", text: [识别重复输出、RPC、Debug、配置、ABTest、不可读字段等噪声，生成裁剪/降级/转存建议；用 JSON Schema 约束输出，代码侧校验过滤错误规则。]),
          (label: "控制面与量化", text: [将分析、规则确认、发布与收益观察收敛到统一控制面，跟踪规则数、状态与成本趋势；单季度日均日志成本下降约 *三分之一*，其中纯治理约 *四成*，配置投入从 3 人日降至 0.1 人日，合计约 *50 人日*效率收益。]),
        ),
      ),
      (
        name: [流量治理组件],
        points: (
          (label: "项目简介", text: [面向业务流量的统一治理组件，可接入 RPC、数据库、消息队列等；负责 BMQ 适配与前端控制面。]),
          (label: "BMQ 适配", text: [抽象多种消息客户端差异，将统一识别、观测、限流与降级接入生产/消费入口；覆盖同步、批量、异步与单条、批量消费。]),
          (label: "验证", text: [申请 BMQ/MQ 测试资源，建设测试 Skill 固化各框架测试步骤与验收方式；针对 7 种消费处理模型 × 4 个消息框架完成 *28 次*集成测试，四客户端适配已完成（进度 *90%*）。]),
          (label: "控制面", text: [负责前端控制面开发，支持规则配置与运行效果查看。]),
        ),
      ),
      (
        name: [金融网络专线],
        points: (
          (label: "项目简介", text: [高流量基础组件，负责金融渠道专线的日常维护与功能演进，覆盖线路状态、连接与配置等日常问题，保障金融渠道稳定接入。]),
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
        label: "漏回声检测",
        text: [自动监控 AEC 效果、替代人工反馈的算法；负责算法选型与评测。对比 AECMOS / GCC-PHAT / WebRTC 后选择 *WebRTC*；通过 EMA 20s→3s、缓存 render 音频与分窗匹配，将精准率从约 *60% 提升至近 100%*，召回率约 *50%*；检查 *123 条*语料并拼接 *400 个*用例，搭建自动化评测。],
      ),
      (
        label: "音色评估",
        text: [Android 双声道 KTV 选声道；*149 组*盲测提出「*频谱高频能量和*」，分类 *95%*、差体验低于 *0.2%*。],
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
        label: "项目简介",
        text: [DDL 是 AOP 框架的跨语言序列化组件，负责 DDL / JSON / bytes / Python 对象双向转换，覆盖 Rust / Java / Python 三端；我负责功能、类型安全、测试和性能。],
      ),
      (
        label: "功能与质量",
        text: [扩展积类型、和类型、递归类型与 NumPy，提供 enc_hook/dec_hook 扩展点；引入 type hints 与 mypy；基于 PBT 完善随机测试，将覆盖率提升至 *90%* 并接入 CI。],
      ),
      (
        label: "性能优化",
        text: [通过类型特化（按类型生成 constructor，消除 switch 开销）、C API 扩展与 msgspec 复用、NumPy 零拷贝、缓存与关闭冗余校验，将序列化平均耗时从约为 protobuf 的 *50 倍*降至 *2 倍以内*，部分场景低于 *1/4*。],
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
