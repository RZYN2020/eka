# Visual effects

Visual effects are decorative: they must never make content harder to read or become required for understanding the page.

## Window reader

- Appears inline on About between the main copy and Elsewhere.
- Appears fixed on desktop Media only.
- Is hidden on narrow Media layouts.
- Uses three equal-size frames in a stable aspect-ratio container.
- Shows a static resting frame when reduced motion is requested.

## Snowfall

- Enabled only through `presentation.ambient: snow`.
- Uses a deterministic particle generator so builds and screenshots remain reproducible.
- Masks out the complete reading column plus breathing room.
- Is disabled at 720px and below and when reduced motion is requested.
- Must stay within the particle budget enforced by `verify-visual-effects.mjs`.

## Lushan backdrop

- Enabled only through `presentation.backdrop: lushan`.
- Lives inside `.article-visual-boundary`, which stops before article navigation.
- Keeps the reading column transparent and is hidden below the desktop breakpoint.
- Uses the optimized transparent WebP in `public/images/`.

## Adding an effect

1. Add the constrained value to `src/content.config.ts`.
2. Register it in `ArticleEffects.astro`.
3. Implement a pointer-inert, `aria-hidden` component under `components/effects/`.
4. Define mobile, dark-theme, and reduced-motion behavior.
5. Add runtime assertions to `scripts/verify-visual-effects.mjs`.
6. Run the complete validation suite.
