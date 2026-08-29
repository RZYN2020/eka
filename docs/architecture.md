# Architecture

Eka is a static Astro publication. The repository has one content source and keeps browser-side JavaScript limited to features that require interaction.

## Main boundaries

- `src/content/writing/`: articles and their presentation metadata.
- `src/content.config.ts`: the authoritative writing schema.
- `src/layouts/`: page composition; layouts must not contain article-slug special cases.
- `src/components/`: reusable Astro UI. Article decorations live under `components/effects/`.
- `src/features/travel-map/`: map domain, rendering controllers, and motion policy.
- `src/scripts/`: browser composition roots. They assemble feature modules but do not own domain logic.
- `scripts/verify*.mjs`: executable repository, content, and runtime contracts.

## Article presentation

Article-specific decoration is declared in frontmatter and validated by the content schema:

```yaml
presentation:
  ambient: snow
  backdrop: lushan
```

`ArticleEffects.astro` is the only registry that maps these values to components. A new effect requires a schema value, a component, documentation, and a runtime assertion.

## Travel map

`src/scripts/travel-map.ts` is the composition root. It creates the Leaflet map and connects these modules:

- `coordinates.ts`: coordinate lookup and injection.
- `layers.js`: GeoJSON loading and city/province/world layers.
- `markers.js`: marker grouping and popup rendering.
- `timeline.js`: timeline rendering and map/list selection synchronization.
- `journey-controller.js`: journey state machine and playback.
- `motion.ts`: the single reduced-motion policy.
- `dom.ts`: required-DOM assertions.

Feature state belongs inside controller factories. New module-level mutable state is reserved for the composition root and must have explicit lifecycle cleanup.

## Styling

Global layout, color, and spacing values are defined in `src/styles/tokens.css`. Components may define local custom properties for implementation details, but shared colors and layout widths must resolve from global tokens.

The map currently has one ordered stylesheet, `src/styles/map.css`, because its responsive and Leaflet overrides are tightly coupled. New rules should be added to the relevant documented section and must not use `transition: all`.
