# Component: `Empty State`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-28 (Owner approved Empty State as C38)
- Pencil library: `design-system.lib.pen` › **C38 — Empty state** (`n2bAJ`)
- Reusable component: **Empty State** (`H43gDN`)

## Purpose

Guidance for a page or content area that has no data yet. It should explain the current state and offer one clear next step when an action is available.

## Anatomy

| Part | Layer | Contract |
|---|---|---|
| Container | root | `surface.subtle` background, default border, `radius.md`, vertical layout, gap `space.4`, padding `space.12`, centered content. |
| Icon wrap | `Icon wrap` (`HFN6r`) | 48 × 48, `accent.soft` background, `radius.md`; use a contextual 24 px icon. |
| Icon | `Icon` (`zOUao`) | 24 px, `accent.soft-fg`; decorative when the title and body provide the same meaning. |
| Text | `Text` (`z32Xo`) | Vertical stack, gap `space.1`, centered. |
| Title | `Title` (`c8Y4Ky`) | Short sentence-case heading, body 600, `text.primary`. |
| Body | `Body` (`FCyNB`) | Supporting guidance, fixed 360 px specimen width, body-sm, `text.secondary`, line-height 1.5. |
| Action | `Complete branding button` (`SzhQW`) | Optional single secondary action. Hide when there is no meaningful next step. |

## Variants and properties

One reusable component (`H43gDN`) with content properties. The Pencil component set demonstrates these approved action variants:

| Specimen | Icon | Icon background | Action | Use when |
|---|---|---|---|---|
| Default | `camera` | `accent.soft` / `accent.soft-fg` | Secondary: `Lengkapi branding` | The next step is helpful but not urgent. |
| Primary | `receipt` | `action.primary` / `action.on-primary` | Primary: `Mulai sekarang` | The empty state is the main flow entry point. |
| Danger | `circle-alert` | `status.danger.bg` / `status.danger.fg` | Danger: `Hapus data` | The action is destructive and requires clear warning context. |

The icon changes with the context, while the 24 px size and icon-wrap tokens stay consistent.

Content properties:

| Property | Type | Mechanism |
|---|---|---|
| `icon` | Icon name | Replace the `Icon` glyph while retaining the 24 px size and semantic accent token. |
| `title` | Text | Descendant content on `Title`. |
| `body` | Text | Descendant content on `Body`; omit only when the title is self-explanatory. |
| `action` | Optional node | Enable or hide the single action slot. |

## Content

- Keep the title concise and describe the state, not the implementation.
- Explain what the user can do next in one sentence.
- Use one primary next step; avoid stacking multiple actions inside the empty state.
- Use sentence case and product language consistent with the surrounding page.

## Accessibility

- The title is the accessible heading for the empty region.
- The icon is decorative when it repeats the title; do not rely on it to convey meaning.
- The action must have an accessible name that describes its outcome.
- Preserve readable contrast for primary and secondary text in both themes.

## Implementation references

- Pencil: `C38 — Empty state` (`n2bAJ`), reusable component `H43gDN`
- Storybook: `Patterns/Empty State`
- Code: `src/ui/patterns/empty-state/empty-state.tsx`
- Rules: `token-usage.md` G3, SP6, §6, §8
