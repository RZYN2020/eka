#import "template.typ": *
#import "content.typ": *

#show: document => resume-template(profile.name, document)

#resume-header(profile)

== 教育背景
#chiline()

#for item in education {
  education-entry(item)
}

#if skills.len() > 0 [
  == 专业技能
  #chiline()
  #labeled-list(skills)
]

== 工作与实习经历
#chiline()

#for job in experience {
  experience-entry(job)
}

== 项目经历
#chiline()

#for project in projects {
  project-entry(project)
}
