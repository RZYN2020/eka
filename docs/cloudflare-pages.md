# Cloudflare Pages release checklist

## Repository

Use one dedicated GitHub repository for `eka-site`. A dedicated repository keeps Cloudflare's build root simple and avoids cloning the four legacy repositories.

Recommended repository visibility: **public**, because the source content and résumé are already intended to be public. If the résumé should not be visible in Git history, use a private repository instead; Cloudflare Pages supports both.

## Cloudflare configuration

1. Create a Pages project with Git integration.
2. Grant the Cloudflare GitHub App access only to the Eka repository.
3. Choose a non-`main` branch for the first preview deployment.
4. Configure:
   - Build command: `pnpm build`
   - Output directory: `dist`
   - Node.js: `22`
5. Validate the generated `*.pages.dev` preview.
6. Set `main` as the production branch.
7. Only after the Pages deployment is accepted, attach `yongzhen.space`.

## Domain migration

Keep the existing GitHub Pages sites online until their old domains and paths return permanent redirects to the new site.

Suggested order:

1. Deploy and verify `*.pages.dev`.
2. Attach `yongzhen.space`.
3. Attach or redirect `blog.yongzhen.space`.
4. Update GitHub Pages sites to redirect legacy paths.
5. Verify canonical URLs, RSS, sitemap and representative old links.

Do not remove the legacy sites before the redirects have been checked.

## Daily NeoDB sync

The `Sync NeoDB` GitHub Actions workflow runs at 04:20 Asia/Shanghai and commits
only the generated public shelf data. Add `NEODB_ACCESS_TOKEN` as a repository
Actions secret. The resulting commit uses the same Pages Git deployment path as
normal content updates.

## Visitor analytics

Cloudflare Web Analytics is the recommended analytics service for this site. It
is free, privacy-first, and its page views, visitors, referrers, countries, and
performance data are available in the Cloudflare dashboard.

For a Pages project, open **Workers & Pages → eka → Metrics** and enable Web
Analytics. Cloudflare injects the beacon automatically on the next deployment,
so no environment variable is required.

If automatic injection is unavailable, copy the site's Web Analytics token into
the Pages build environment as `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`.

## Comments

Article comments use giscus, which stores each article's conversation in GitHub
Discussions and allows moderation from GitHub.

1. Make the GitHub repository public and enable **Settings → Features →
   Discussions**.
2. Install the giscus GitHub App for that repository.
3. Create or select a Discussions category, then use the configurator at
   `https://giscus.app/zh-CN` to obtain the repository and category IDs.
4. Add these Pages build environment variables:
   - `PUBLIC_GISCUS_REPO` (for example `RZYN2020/eka`)
   - `PUBLIC_GISCUS_REPO_ID`
   - `PUBLIC_GISCUS_CATEGORY`
   - `PUBLIC_GISCUS_CATEGORY_ID`

The comment section stays out of the generated pages until all four values are
present, so an incomplete setup does not show a broken widget.
