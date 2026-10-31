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

// 第 1 页：字节跳动（只放这一段，写满第一页）
#experience-entry(experience.at(0))
#pagebreak()
// 第 2 页：腾讯、网易、其他项目、专业技能
#for job in experience.slice(1) {
  experience-entry(job)
}

#experience-entry(other-projects)

#if skills.len() > 0 [
  == 专业技能
  #chiline()
  #labeled-list(skills)
]
