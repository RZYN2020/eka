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
    degree: [硕士],
    major: [软件工程专业],
    date: "2024.09 - 2026.06",
    note: "推免",
  ),
  (
    school: [南京大学],
    degree: [本科],
    major: [软件工程专业],
    date: "2020.09 - 2024.06",
    note: "",
  ),
)

// 专业技能：text 留空（[]）表示掩码（渲染为星号）；text 为 none 表示该条目不显示。
#let skills = (
  (label: "编程语言", text: []),
  (label: "系统与底层", text: []),
  (label: "性能优化", text: []),
  (label: "AI 与 LLM", text: []),
  (label: "工程方法", text: []),
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
        label: "核心职责",
        text: [负责腾讯实时音视频（TRTC）*回声检测（Echo Detection）* 的算法优化与工程落地，旨在提升复杂声学环境下的通话质量。],
      ),
      (
        label: "技术优化",
        text: [主导了对 WebRTC 开源方案的改进，并结合业务场景进行参数深度调优与工程化改造。],
      ),
      (
        label: "量化成果",
        text: [成功实现回声精准识别，*精准率接近 100%，召回率达 80%*，显著改善了用户体验。],
      ),
      (
        label: "效率提升",
        text: [为加速迭代，独立设计并搭建了一套自动化测试评估框架，支持测试数据自动生成、拼接及量化报告输出，大幅度缩减了算法验证周期。],
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
        text: [负责面向智能体编程（AOP）框架的核心组件——*自研序列化框架 DDL* 的开发与性能优化。],
      ),
      (
        label: "功能开发",
        text: [扩展 DDL 模块的功能，新增对多种复杂数据类型的支持同时，采用*类型驱动开发*的思想，为项目引入 type hints，结合 mypy 进行静态类型检查，有效提升了代码的可读性、可维护性和类型安全性，减少了运行时错误的发生概率。],
      ),
      (
        label: "性能分析",
        text: [开发性能分析脚本，利用火焰图进行性能分析，定位了关键性能瓶颈。],
      ),
      (
        label: "完善测试",
        text: [采用*测试驱动开发（TDD）*的思想，基于 *Property-Based Random Testing* 技术，完善了 DDL 模块的测试，将覆盖率提升至 *90%*。],
      ),
      (
        label: "性能优化",
        text: [采用了多种优化方法提升了 DDL 的性能。在优化之前 DDL 序列化平均耗时在 protobuf 的 *50 倍*左右，优化后在大部分典型场景下性能与原生 protobuf 相差在 *2 倍*以内，部分场景为 protobuf 的*四分之一*不到。],
      ),
    ),
  ),
)

#let projects = (
  (
    name: [Transformer-LLM],
    date: "2025.03 - 2025.04",
    points: (
      [实现了一个基于 *Transformer* 架构的*大语言模型*，并在此基础上进行性能优化以及微调、对齐工作。],
      [深入研究并实践了 LLM 的性能剖析（*Profiling*）以及*性能优化*技术。],
      [通过该项目，掌握了 LLM 从模型设计、训练、优化到部署的*端到端流程和关键技术*。],
    ),
  ),
  (
    name: [SysY-RISCV 编译器],
    date: "2024.07 - 2024.09",
    points: (
      [使用 *C++17* 完成了一个*高性能编译器*，其生成的代码性能表现达到 *GCC O2 水准*。],
      [基于 *SSA IR* 实现了多种*编译器优化技术*，如*死代码消除*、*常量折叠*、*循环优化*和*寄存器分配*，显著提升了目标代码执行效率。],
      [负责编译器后端开发并担任*组长*，锻炼了团队协作和领导能力，加深了对编程语言的认识。],
    ),
  ),
  (
    name: [miniOS 操作系统],
    date: "2022.03 - 2022.06",
    points: (
      [使用*C 语言*实现了一个*支持多处理器的操作系统*。],
      [在实现*内存分配器*的过程中，分别实现了基于*链表*、*红黑树*和 *slab* 的内存分配器，深刻理解了不同内存管理策略的性能权衡，并将其融入到“*Fast Path，Slow Path*”相结合的系统设计原则中。],
      [在实现内核多线程的过程中，深入理解了*并发编程的基本理论*，认识到在并发编程中“*防御式编程*”的重要性。],
    ),
  ),
)
