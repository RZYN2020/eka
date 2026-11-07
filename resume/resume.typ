#import "template.typ": *
#import "content.typ": *

#show: document => resume-template(profile.name, document)

#resume-header(profile)

== 教育背景
#chiline()

#for item in education {
  education-entry(item)
}

== 技术经历
#chiline()

#for job in experience {
  experience-entry(job)
}

// 内容完整版：其他项目 + 技能放第 3 页；最后压 2 页时删掉这行
#pagebreak()
// 其他项目整段不拆页
#block(breakable: false)[
  #experience-entry(other-projects)
]

#if skills.len() > 0 [
  // 技能整段不拆页，避免标题和条目分到两页
  #block(breakable: false)[
    == 专业技能
    #chiline()
    #labeled-list(skills)
  ]
]
