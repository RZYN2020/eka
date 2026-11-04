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

// 其他项目整段不拆页；内容多时整体移到下一页
#block(breakable: false)[
  #experience-entry(other-projects)
]

#if skills.len() > 0 [
  == 专业技能
  #chiline()
  #labeled-list(skills)
]
