# Storybook Component Explorer

**Status:** Proposed — awaiting Owner review
**Date:** 2026-09-27
**Scope:** Internal, local-only design-system exploration

## Context

Shutrly already has a design-system source of truth:

- `docs/design-system/tokens.json` owns token values and modes.
- `docs/design-system/token-usage.md` owns token usage rules.
- `docs/design-system/components/*.md` owns component anatomy, behavior, usage, and accessibility guidance.
- `docs/design-system/components/registry.json` owns the machine-readable Pencil component registry.
- `src/ui/theme/tokens.css` is generated from the canonical token payload.
- React UI primitives live under `src/ui/` and currently include `Button` and `TextField`.

What is missing is a local, interactive surface for exploring the implemented React components and seeing the token system in light and dark modes. This surface is for the Owner and internal development/design work only. It does not need to be deployed or exposed as a product route.

## Decision

Add Storybook as a local component explorer using the Next.js Vite framework. Storybook stories are executable examples of the real React components; they are not a replacement for the Markdown design-system specifications or the token generator.

The initial implementation should use the current project stack and Storybook's supported capabilities:

- `@storybook/nextjs-vite` for Next.js integration.
- Controls for interactive prop exploration.
- Docs/source panels for implementation inspection.
- A11y checks for component stories.
- A global light/dark theme decorator.
- A token gallery story that reads the canonical token data rather than duplicating token values.

Storybook runs locally through a package script and is not added to the production application or production build.

## Responsibilities and sources of truth

| Concern | Authoritative source | Storybook role |
|---|---|---|
| Token names and values | `docs/design-system/tokens.json` | Render searchable/inspectable token views |
| Token usage rules | `docs/design-system/token-usage.md` | Link from relevant docs/stories; do not duplicate all rules |
| Component anatomy and behavior | `docs/design-system/components/<name>.md` | Link from story docs and show executable examples |
| Pencil component identity | `components/registry.json` and component spec | Link/reference metadata where useful |
| React API | `*.types.ts` and component implementation | Infer controls and source from actual code |
| Visual behavior | React component + stories | Render and explore states |

The implementation must not create a second hand-maintained token catalog or a second normative component specification.

## Story structure

Stories are colocated with the component they exercise:

```text
src/ui/primitives/button/
  button.tsx
  button.types.ts
  button.test.tsx
  button.stories.tsx
```

The initial story coverage is:

- `Button`: primary and secondary variants, default/hover/pressed/disabled states where the component can represent them, leading/trailing icon configuration, and keyboard/focus behavior.
- `TextField`: empty, filled, invalid, disabled, helper/error content, and the supported input configurations.
- `Tokens`: primitive, semantic, and component token views, including light/dark values, aliases, and generated CSS custom-property names where available.

Additional component stories are added alongside each future `src/ui` component. Existing component Markdown specs remain the place for complete design guidance, do/don't rules, and rationale.

## Global Storybook setup

The Storybook preview config provides the smallest shared environment needed by the UI layer:

- import the generated token CSS and global styles;
- apply the project font setup required for visual parity;
- provide `AppProviders` when a story needs the shared React context;
- expose a light/dark global toolbar or equivalent decorator;
- keep the default theme aligned with the approved light mode;
- configure the a11y addon for story-level checks.

Stories must remain isolated. They must not require a running database, authentication session, Cloudflare context, or production route.

## Token explorer

The token explorer is a Storybook page/story implemented as a small internal UI. It consumes the canonical token payload and renders:

- category and token-name navigation/filtering;
- token value for the active mode;
- both light and dark values when the token has mode-specific values;
- alias/reference information;
- the generated CSS custom-property name;
- a visual swatch or sample only where the token type makes that meaningful.

The explorer must not edit tokens. Changes continue to flow through the existing token pipeline and `pnpm tokens:check`.

## Verification

The implementation plan must include these checks:

1. Storybook starts locally and discovers the expected stories.
2. The production application remains unaffected when Storybook is not running.
3. Existing gates remain green: `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
4. The token explorer renders from the canonical token source and does not contain duplicated token values.
5. Button and TextField stories render in light and dark modes.
6. A11y checks cover the initial stories without suppressing violations by default.
7. Storybook build succeeds if a build script is added for local artifact verification, even though the artifact is not deployed.

## Non-goals

- No production `/storybook` route.
- No public or hosted documentation site.
- No Zeroheight, Ladle, or separate documentation CMS.
- No migration of existing Markdown specs into Storybook-only content.
- No redesign of the approved token or component system.
- No direct editing of `.pen` files.
- No automatic mutation of `tokens.json` from Storybook.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Storybook metadata drifts from Markdown specs | Keep Markdown normative; stories contain executable examples and concise links, not a second full spec |
| Next.js-specific dependencies make stories fragile | Use `@storybook/nextjs-vite`; keep initial stories limited to isolated client UI primitives |
| Token values are duplicated in the explorer | Import/derive from canonical token data and retain `pnpm tokens:check` |
| Storybook dependencies increase install and maintenance cost | Keep the setup local-only and minimal; add addons only for docs, controls, and a11y needs |
| A11y checks become noisy or are bypassed | Fix initial violations; document genuine exceptions in the component spec rather than suppressing them silently |

## Open implementation choices

The implementation plan should resolve, using the pinned project versions and a small compatibility spike:

- the exact Storybook major/minor version compatible with Next.js 16, React 19, Vite 8, and Vitest 5;
- whether the token explorer imports `tokens.json` directly or consumes a small generated typed view;
- the minimal addon set and package scripts;
- whether story files are included in the existing lint/typecheck globs without boundary-rule changes.

These are implementation details, not changes to the source-of-truth model.
