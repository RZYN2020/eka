#let profile = (
  name: "赵勇臻",
  headline: "后端开发 / AI 应用开发",
  phone: "(+86) 181-6810-0075",
  phone-link: "+8618168100075",
  email: "zhaoyzzz@outlook.com",
  website: "yongzhen.space",
  birth: "2002.3.22",
  hometown: "甘肃庆阳",
)

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

// 专业技能：text 留空（[]）表示掩码（渲染为星号）；text 为 none 表示该条目不显示。
#let skills = (
  (label: "AI / Agent", text: [熟悉 LLM、Transformer 与 PyTorch，具备 Tool Calling、RAG、Context Engineering、Agent Evaluation 等 AI Agent 开发经验。]),
  (label: "后端与分布式系统", text: [Go、Python、C/C++；熟悉 Linux、并发编程、数据库、Kafka、etcd、Docker / Kubernetes 及云原生基础设施。]),
  (label: "系统与性能", text: [具备操作系统、编译器、程序语言与运行时基础，熟悉 Benchmark、Profiling、火焰图分析及端到端性能优化。]),
  (label: "工程质量", text: [具备复杂系统调试与问题定位经验，熟悉自动化测试、Property-Based Testing、静态类型检查与可观测性建设。]),
)

#let experience = (
  (
    company: [字节跳动],
    department: [财经],
    role: [后端开发 / AI 应用开发],
    logo: "assets/logos/bytedance.svg",
    logo_height: 4.5mm,
    theme: rgb("#3c8cff"),
    dates: ("2025.12 - 2026.05 实习", "2026.07 - 至今 正式"),
    projects: (
      (
        name: [日志基础设施与成本治理],
        points: (
          (label: "项目目标", text: none),
          (
            label: "系统设计",
            text: [],
          ),
          (
            label: "治理策略",
            text: [],
          ),
          (
            label: "量化成果",
            text: [],
          ),
        ),
      ),
      (
        name: [流量控制组件],
        points: (
          (label: "项目目标", text: none),
          (
            label: "系统架构",
            text: [],
          ),
          (
            label: "核心开发",
            text: [],
          ),
          (label: "运行效果", text: none),
        ),
      ),
      (
        name: [Oncall Agent],
        points: (
          (label: "问题定义", text: none),
          (
            label: "上下文建设",
            text: [],
          ),
          (
            label: "Agent 设计",
            text: [],
          ),
          (label: "评估效果", text: none),
        ),
      ),
      (
        name: [AI Native 研发流程],
        points: (
          (label: "项目目标", text: none),
          (
            label: "流程设计",
            text: [],
          ),
          (
            label: "系统实现",
            text: [],
          ),
          (
            label: "量化效果",
            text: [],
          ),
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

#let projects = (
  (
    name: [Transformer-LLM],
    date: "2025.03 - 2025.04",
    points: (
      [从零实现基于 *Transformer* 架构的语言模型，完成训练、微调、对齐与部署链路。],
      [针对训练与推理链路开展 *Profiling*，定位计算与内存瓶颈并实施性能优化。],
      [通过端到端实践理解模型结构、数据处理、训练优化与推理部署的关键机制。],
    ),
  ),
  (
    name: [SysY-RISCV 编译器],
    url: "https://github.com/RZYN2020/2024-antpie",
    date: "2024.07 - 2024.09",
    points: (
      [使用 *C++17* 实现 SysY 到 RISC-V 的编译器，生成代码的性能达到 *GCC O2 水准*。],
      [基于 *SSA IR* 实现死代码消除、常量折叠、循环优化与寄存器分配等优化 Pass。],
      [担任组长并负责后端架构、指令选择与代码生成，推进团队协作和性能调优。],
    ),
  ),
  (
    name: [miniOS 操作系统],
    date: "2022.03 - 2022.06",
    points: (
      [使用 *C* 实现支持多处理器的教学操作系统，完成内存管理与内核多线程等核心模块。],
      [分别实现基于链表、红黑树与 *slab* 的内存分配器，对比其时间、空间与碎片化权衡，并设计 Fast Path / Slow Path。],
      [在内核并发场景中实践锁、共享状态管理与防御式编程，深化对并发正确性的理解。],
    ),
  ),
)
