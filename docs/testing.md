# Testing and validation

## Commands

- `pnpm format:check`: deterministic formatting for maintained source and documentation.
- `pnpm lint`: JavaScript, TypeScript, and Astro static rules.
- `pnpm check`: Astro and TypeScript diagnostics.
- `pnpm verify:fast`: content, data, pure logic, and repository contracts.
- `pnpm build`: production static output and responsive images.
- `pnpm verify:runtime`: built-site browser checks.
- `pnpm verify`: all fast and runtime checks.

## Required checks by change

| Change                     | Minimum validation                                |
| -------------------------- | ------------------------------------------------- |
| Article text/frontmatter   | `pnpm check && pnpm verify:fast`                  |
| Shared component or CSS    | format, lint, check, build, full verify           |
| Article visual effect      | full verify plus desktop/mobile screenshot review |
| Map data or runtime        | full verify and `pnpm check:map`                  |
| Dependency or build config | frozen-lockfile install, build, full verify       |

Runtime checks prefer DOM geometry, computed styles, accessibility state, and absence of browser errors over pixel snapshots. Screenshots remain a human visual-quality gate rather than a brittle CI oracle.
