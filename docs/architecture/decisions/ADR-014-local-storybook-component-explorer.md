# ADR-014: Local Storybook component explorer

Status: Accepted
Date: 2026-09-27

## Context

Shutrly has an approved design system whose canonical artifacts are the DTCG token payload in
`docs/design-system/tokens.json`, the token usage rules, the Pencil library, and the Markdown
component specifications. The React implementation under `src/ui` needs a fast local surface for
exploring real component states, themes, and token values without creating a production route or a
second hand-maintained design-system site.

## Decision

- Use Storybook **10.6.0** with `@storybook/nextjs-vite` as the local component explorer.
- Run it locally with `pnpm storybook`; verify its local artifact with `pnpm storybook:build`.
- Keep Storybook out of the production application routes and production build.
- Colocate stories with the `src/ui` unit they exercise.
- Keep `tokens.json` authoritative for token names and values; the token explorer reads that payload
  and never edits or duplicates it.
- Keep `docs/design-system/components/*.md` authoritative for component anatomy, usage,
  accessibility guidance, and rationale; stories provide executable examples and links.
- Load the generated token CSS and global styles through `.storybook/preview.tsx`, wrap stories with
  `AppProviders`, and expose the approved `light` / `dark` modes through a Storybook toolbar.
- Use Storybook Docs, Controls, and a11y for local exploration and verification.

## Alternatives considered

- **Ladle:** smaller and faster, but with a smaller documentation and addon ecosystem. Storybook's
  Docs, Controls, and a11y capabilities better match the component exploration workflow.
- **A custom Next.js route:** would add a product-facing route and require maintaining navigation,
  controls, source display, theme switching, and token browsing ourselves.
- **Zeroheight or another hosted design-system CMS:** unnecessary for the current internal,
  offline/local-only use case and would add an external documentation source.

## Consequences

### Positive

- Developers can inspect production React components and states without running the full application.
- Light/dark token behavior is visible in the same environment as component stories.
- Storybook stories can grow into interaction and accessibility verification without changing the
  source-of-truth model.
- The token explorer gives a searchable view of the canonical 479-token payload.

### Negative / trade-offs

- Storybook adds development dependencies and a local toolchain to maintain.
- Story metadata and Markdown specs can drift if stories start duplicating normative guidance; the
  Markdown specs and token files must remain authoritative.
- The Vite build may report existing `use client` directive and large-chunk warnings; these are
  local Storybook build warnings, not production route behavior.

## Related

- [ADR-010: React Aria and Tailwind](ADR-010-tailwind-react-aria.md)
- [Design-system Storybook guide](../../design-system/storybook.md)
- [Design-system token usage](../../design-system/token-usage.md)
- [Foundation technical design](../../features/foundation/technical-design.md)
