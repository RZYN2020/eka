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
  // 公司卡片 + 项目保持在同一页，避免卡片在页底、项目在下一页
  block(breakable: false)[
    #experience-entry(job)
  ]
}

// 2 页版：其他项目 + 技能接在腾讯/网易后面
// 其他项目整段不拆页
#block(breakable: false)[
  #experience-entry(other-projects)
]

#if skills.len() > 0 [
  // 技能整段不拆页，避免标题和条目分到两页
  #block(breakable: false)[
    == 专业技能
    #chiline()
    #labeled-list(skills, spacing: 1.4em)
  ]
]
