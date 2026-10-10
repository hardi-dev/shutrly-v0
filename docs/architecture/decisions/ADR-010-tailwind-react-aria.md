# ADR-010: Tailwind CSS + React Aria Components for UI

Status: Accepted
Date: 2026-09-25

## Context
Visual truth lives in Pencil; code must match it closely. The constitution targets WCAG 2.1 AA with keyboard-accessible UI (C-008). The client gallery needs a keyboard/touch-friendly multi-select photo grid and per-workspace branding. MVP UI is Indonesian with English fallback, so dates, numbers, and currency must be locale-aware.

## Decision
- Styling: **Tailwind CSS v4**; design tokens (color, radius, spacing, type) as CSS variables in the Tailwind theme, mirrored from Pencil.
- Behavior/accessibility: **React Aria Components** (`react-aria-components`), unstyled and styled with Tailwind via their `data-*` state attributes.
- Own a thin wrapper set in `src/ui/primitives/*` and `src/ui/patterns/*` (Button, TextField, Dialog, Menu, Select, DatePicker, GridList, Toast, …); features import the wrappers, not React Aria directly.
- Workspace branding = overriding the token CSS variables at runtime on client-facing pages.
- Photo selection grid builds on React Aria `GridList` (multi-select, keyboard, touch).
- Locale from `I18nProvider` (`id-ID` default) for dates/numbers.

## Alternatives Considered
- shadcn/ui (Radix + Tailwind): prebuilt styled components, but Owner prefers React Aria's accessibility, i18n, and collection components.
- Mantine / Chakra: faster admin screens, weaker Pencil fidelity, heavier client bundle.

## Consequences
### Positive
- Strong accessibility and internationalization defaults support C-008.
- No visual opinions to fight when matching Pencil.
### Negative / Trade-offs
- All visual styling is ours to build; the `components/ui` layer is F-00/F-01 work.
- React Aria components are client components: keep them inside small `"use client"` wrappers so pages stay server components.

## Related
- Constitution: C-007, C-008
- Coding rules: UI / Components
- Folder architecture: `docs/superpowers/specs/2026-09-26-project-folder-architecture-design.md`

## Amendment — 2026-10-06

[ADR-025](ADR-025-next-intl-bilingual-localization.md) supersedes only this ADR's Indonesian default and English fallback. Current policy is English default, EN/ID switching and no cross-language fallback. React Aria's provider follows the resolved active formatting locale rather than fixed `id-ID`. Tailwind and React Aria selection remain accepted. Earlier context above records the original decision, not current language behavior.
