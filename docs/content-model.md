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
title: ""
description: ""
publishedAt: 2026-01-01
updatedAt:
category: Tech
subcategories:
  - AI
tags:
  - LLM
order: 999
draft: false
featured: false
legacyUrls: []
```

Only `title` and `category` are required. Dates are optional so continuously maintained and imported algorithm articles use the same model.
