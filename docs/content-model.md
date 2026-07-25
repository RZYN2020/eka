# Content model

The distinction is structural, not descriptive copy added to the site.

## Writing

Writing is a dated publication. Each entry has a publication date, a form (`essay`, `technical`, or `journal`), and optional tags. It appears in chronological order and in tag archives.

Required frontmatter:

```yaml
title: ""
publishedAt: 2026-01-01
kind: essay
```

Optional frontmatter:

```yaml
description: ""
updatedAt: 2026-01-02
tags: []
draft: false
featured: false
legacyUrls: []
```

## Notes

A note is a knowledge record that may remain in progress. It belongs to one stable `topic`, can be manually ordered inside that topic, and records its source. Dates are optional.

Required frontmatter:

```yaml
title: ""
topic: Notes
```

Optional frontmatter:

```yaml
description: ""
tags: []
publishedAt:
updatedAt:
order: 999
draft: false
source: blog
legacyUrls: []
```
