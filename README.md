# Eka

Eka 的个人内容出版网站。四个旧站被合并为一个 Astro 项目：

- `Writing`：全部文章
- `Categories`：父子两层的主要分类
- `Tags`：跨分类的主题与文章形态标签
- `About`：Media、人生足迹与中文简历入口
- `Media`：NeoDB 书影音记录
- `/map/`：人生足迹
- `/resume/resume.pdf`：Typst 生成的中文 PDF 简历

## Local development

Node.js 22+ and pnpm are required.

```sh
pnpm install
pnpm dev
```

文章直接维护在 `src/content/writing/`；分类定义在
`src/config/taxonomy.ts`。新增文章时复制同目录下现有文章的 frontmatter，
然后运行下方验证命令。历史站点迁移已经完成，当前仓库是唯一内容源。

## Validation

```sh
pnpm check
pnpm build
pnpm verify
```

`pnpm verify` 已包含内容模型、内部链接、构建产物和真实浏览器地图验证；
`pnpm verify:fast` 只运行不依赖构建产物的快速检查，`pnpm verify:runtime`
只运行构建产物与浏览器检查，`pnpm check:map` 可用于只重跑地图验证。

仓库对文章图片和地图数据设有体积预算。GeoJSON 源文件更新后运行
`pnpm optimize:geojson` 再提交；一次性文案和样式调整以提交记录为准，
`docs/specs/` 只保留需要长期追溯的设计决策或复杂功能方案。

简历 PDF 已编译并提交为 `public/resume/resume.pdf`，由 Astro 构建复制为
`dist/resume/resume.pdf`；修改简历内容后运行 `pnpm resume:build` 重新生成并提交。

## NeoDB

复制 `.env.example` 为 `.env`，填入只读的 `NEODB_ACCESS_TOKEN`，然后同步公开书架：

```sh
pnpm sync:neodb
```

同步会读取所有分页和书架状态，但只把 NeoDB 中公开可见的条目写入
`src/data/neodb/shelf.json`。密钥不会进入该文件或最终网站。

GitHub Actions 会在每天北京时间 04:20 运行同一同步，并在数据变化时提交
`shelf.json`。仓库需要配置只读的 `NEODB_ACCESS_TOKEN` Actions secret；
提交会触发 Cloudflare Pages 的 Git 部署。

## Terminal Easter egg

Cloudflare Pages Functions 会为终端客户端提供纯文本首页：

```sh
curl https://yongzhen.space
curl https://yongzhen.space/terminal
```

`curl`、`wget`、HTTPie 和 `xh` 访问首页时会收到由构建自动生成的 ASCII
名片和最新三篇文章。浏览器首页不受影响；`/terminal` 是不依赖 User-Agent
的显式入口。

在浏览器中按下 `F12` 也会打开同一张名片：页面短暂显示开发者提示，并在
开发者工具的 Console 中输出 ASCII 名片和最新文章。

## Cloudflare Pages

The content site remains static. A Pages middleware only routes terminal requests to
the generated `terminal.txt`; no database, secrets, or Astro Cloudflare adapter are
required.

Recommended Git deployment settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node.js | `22` |

Use a feature branch for the first Cloudflare preview. Promote it to `main` only after visual and link validation.
