# Eka

Eka（赵勇臻）的个人内容出版网站。四个旧站被合并为一个 Astro 项目：

- `Writing`：全部文章
- `Categories`：父子两层的主要分类
- `Tags`：跨分类的主题与文章形态标签
- `About`：个人介绍、旅行地图与多语言简历

## Local development

Node.js 22+ and pnpm are required.

```sh
pnpm install
pnpm migrate
pnpm dev
```

Content migration reads the sibling legacy repositories in the parent directory. Migrated Markdown and assets are committed to this repository, so Cloudflare Pages does not need those legacy repositories at build time.

## Validation

```sh
pnpm check
pnpm build
pnpm verify
```

## Cloudflare Pages

The site is intentionally static. No Pages Functions, bindings, database, secrets, or Astro Cloudflare adapter are required.

Recommended Git deployment settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node.js | `22` |

Use a feature branch for the first Cloudflare preview. Promote it to `main` only after visual and link validation.
