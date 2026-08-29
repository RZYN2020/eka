#let resume-template(author, body) = {
  set document(
    title: author + " - 简历",
    author: author,
    keywords: ("后端开发", "AI 应用开发", "性能优化", "基础设施"),
  )

  // Keep chicv's editorial structure, then add a restrained navy accent and
  // branded experience rows for this resume's own visual identity.
  show heading: set text(
    font: ("Linux Biolinum O", "Heiti SC"),
    fill: rgb("#173f5f"),
  )
  show link: set text(fill: rgb("#173f5f"))
  set page(margin: (x: 0.9cm, y: 1.3cm))
  set text(
    font: ("Libertinus Serif", "Songti SC"),
    size: 11pt,
    lang: "zh",
    region: "cn",
  )
  set par(justify: true, leading: 1.2em)

  body
}

#let chiline() = {
  v(-3pt)
  line(length: 100%, stroke: 0.8pt + rgb("#173f5f"))
  v(-5pt)
}

#let resume-header(profile) = [
  #grid(
    columns: (1fr, auto),
    column-gutter: 1.5em,
    align: top,
  )[
    #text(size: 1.4em, weight: "bold", font: ("Linux Biolinum O", "Heiti SC"), fill: rgb("#173f5f"))[#profile.name]
    #h(0.7em)
    #text(size: 11.5pt, fill: rgb("#263746"))[#profile.headline]
    #v(0.4em)
    #text(size: 9pt, fill: rgb("#52606d"))[
      #link("mailto:" + profile.email)[#profile.email] · #link("https://" + profile.website)[#profile.website]
      \
      #link("tel:" + profile.phone-link)[#profile.phone] · #profile.birth · #profile.hometown
    ]
  ][
    #image("assets/photo.png", width: 1.8cm)
  ]
]

#let masked = [\*\*\*]

#let labeled-list(items) = list(
  ..items.filter(item => item.text != none).map(item => [
    #strong(item.label + "：") #(if item.text == [] { masked } else { item.text })
  ]),
)

#let education-entry(item) = [
  #grid(
    columns: (1fr, auto),
    column-gutter: 1em,
    align: horizon,
  )[
    #strong(item.school) · #item.degree · #item.major #if item.note != "" { [（#item.note）] }
  ][
    #item.date
  ]
  #v(0.4em)
]

#let subproject(project) = [
  #strong(project.name) \
  #labeled-list(project.points)
  #v(0.35em)
]

#let brand-logo(path, height: 4.5mm) = box(
  height: height,
  align(center + horizon, image(path, height: height, fit: "contain")),
)

#let job-title(job) = {
  strong(job.company)

  let details = (
    if job.department != none { job.department },
    if job.role != none { job.role },
  ).filter(item => item != none)

  if details.len() > 0 {
    h(0.45em)
    text(fill: rgb("#263746"))[· #details.join([ · ])]
  }
}

#let experience-entry(job) = block(breakable: false)[
  #block(
    fill: job.theme.lighten(88%),
    radius: 3pt,
    inset: (x: 6pt, y: 4pt),
  )[
    #grid(
      columns: (auto, 1fr, auto),
      column-gutter: 6pt,
      align: horizon,
      brand-logo(job.logo, height: job.logo_height),
      job-title(job),
      text(size: 9.5pt, fill: rgb("#52606d"))[#job.dates.join("；")],
    )
  ]
  #if job.projects.len() > 0 or job.points.len() > 0 {
    v(0.5em)
  }
  #if job.projects.len() > 0 {
    for project in job.projects {
      subproject(project)
    }
  }
  #if job.points.len() > 0 {
    labeled-list(job.points)
  }
  #v(0.8em)
]

#let project-entry(project) = [
  #strong(project.name) #h(1fr) #project.date \
  #list(..project.points)
  #v(0.8em)
]
