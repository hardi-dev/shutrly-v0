# Local Storybook explorer

Status: IMPLEMENTED 2026-09-27 · internal/local-only tooling · [ADR-014](../architecture/decisions/ADR-014-local-storybook-component-explorer.md)

Shutrly uses Storybook as a local playground for exploring the implemented React design-system
components and canonical design tokens. It is not a production route, a public documentation site,
or a replacement for the Markdown component specifications.

## Run it

From the repository root:

```bash
pnpm storybook
```

Open [http://localhost:6006/](http://localhost:6006/).

Available initial entries:

- **Primitives / Button** — primary, secondary, disabled, and combined variant examples.
- **Primitives / TextField** — empty, filled, helper, invalid, read-only, and password examples.
- **Design System / Tokens** — searchable token table with category filtering, light/dark values,
  aliases, CSS custom-property names, and color swatches.

Use the Storybook theme toolbar to switch between the approved `light` and `dark` modes.

## Source-of-truth boundaries

| Concern | Source of truth | Storybook role |
|---|---|---|
| Token names and values | [`tokens.json`](tokens.json) | Reads and renders the canonical payload |
| Token usage rules | [`token-usage.md`](token-usage.md) | Remains the normative guidance |
| Component anatomy and behavior | [`components/`](components/) | Stories provide executable examples |
| React component API | `src/ui/**` | Stories render the production components |
| Generated CSS variables | `src/ui/theme/tokens.css` | Loaded through the shared preview styles |

Do not copy token values into a story or edit tokens from Storybook. Change tokens through the
existing generator pipeline, then run `pnpm tokens:check`.

## Story conventions

Stories live next to the unit they explore:

```text
src/ui/primitives/button/
  button.tsx
  button.types.ts
  button.test.tsx
  button.stories.tsx
```

New stories should show the states and configurations that are meaningful for the component, use
the real component implementation, and link back to its Markdown spec. Add a sibling `.copy.ts`
file for story-only user-facing labels when the repository copy rule requires it.

The shared preview loads the application tokens and global styles, wraps stories with
`AppProviders`, and exposes the light/dark theme switcher. Stories must remain isolated from the
database, authentication, Cloudflare context, and production routes.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm storybook:build
```

The Storybook build is for local artifact verification only. It is not deployed with the
production application.
