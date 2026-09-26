# Component: `Icon`

## Status

- Lifecycle: `IMPLEMENTED` shared code primitive
- Source: `src/ui/primitives/icon/`
- Icon set: Hugeicons Free (`@hugeicons/react` + `@hugeicons/core-free-icons`)
- Pencil relationship: shared implementation primitive; C01, C03 and C18 consume it

## Purpose

`Icon` is the single semantic icon boundary for the design system. Components use stable names such as `search` and `eye-off`; the Hugeicons glyph mapping stays inside the registry so consumers do not depend on vendor-specific names.

## Registered names

| Semantic name | Use |
|---|---|
| `search` | Search fields |
| `chevron-down` | Select and menu affordances |
| `calendar` | Date fields |
| `eye`, `eye-off` | Password visibility |
| `circle-alert` | Error and validation messages |
| `plus`, `send`, `arrow-right`, `trash-2` | Button actions |

## Sizing and accessibility

- Default size is `md`: 16 px, backed by `space.4`.
- `sm` is 12 px, backed by `space.3`.
- Icons are decorative by default (`aria-hidden="true"`). Pass an accessible label when an icon itself communicates meaning.
- Clickable icons remain controls owned by the consuming component. Use a labelled button around `Icon`; do not make `Icon` responsible for press behavior.
- Colour is inherited from the parent and must be supplied with an existing design token.

## Implementation rules

- Add vendor mappings only in `src/ui/primitives/icon/icon.registry.ts`.
- Reuse a registered semantic name instead of importing Hugeicons directly in a component.
- Add a name only when it is needed by an approved component or documented pattern.
- Keep the C01, C03 and C18 matrices complete when changing icon-bearing states.
