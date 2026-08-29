## Development

When starting the dev server, use background mode:

```
pnpm exec astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project map

- Read `docs/architecture.md` before structural work.
- Read `docs/visual-effects.md` before changing the reader, snowfall, or article backdrops.
- Read `docs/testing.md` to select the required verification scope.
- Article-specific visuals are content metadata; do not add slug checks to layouts.
- `src/scripts/travel-map.ts` is a composition root. Put map behavior in `src/features/travel-map/`.
- Preserve reduced-motion, mobile visibility, reading-column clearance, and article-boundary contracts.

Run `pnpm format`, `pnpm lint`, and `pnpm check` before the runtime verification required by the change.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
