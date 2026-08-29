# Content model

All published content belongs to one `writing` collection. Category and tags are separate taxonomy dimensions.

## Category

Each article has one top-level category and zero or more subcategories:

```text
Tech
├── AI
├── System
├── Backend
├── Application
└── Algorithm

Human
├── Sociology
└── Economics

Life
├── Instinct
└── Journal
```

## Tags

Tags are flat and can connect articles across categories. The Tags index presents them in two groups:

- Topics: subject tags such as `LLM`, `Compiler`, or `Database`.
- Forms: `Book`, `Code`, `CheatSheet`, `Reflection`, `Summary`, `Interview`, `Knowledge`, and `Share`.

## Frontmatter

```yaml
title: ''
description: ''
publishedAt: 2026-01-01
updatedAt:
category: Tech
subcategories:
  - AI
tags:
  - LLM
order: 999
draft: false
toc: true
neodbIds: []
legacyUrls: []
presentation:
  ambient: snow
  backdrop: lushan
```

Only `title` and `category` are required. Dates are optional so continuously maintained and imported algorithm articles use the same model.
The table of contents appears automatically when an article has at least three level-two or level-three headings. Set `toc: false` to disable it for an individual article.

`presentation` is optional and accepts only schema-registered decorative effects. Most articles should omit it. See `docs/visual-effects.md` before adding a new value.
