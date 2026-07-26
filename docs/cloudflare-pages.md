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
