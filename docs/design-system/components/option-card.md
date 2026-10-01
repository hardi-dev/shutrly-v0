# Component: `Option Card`

## Status and approval

- Lifecycle: `APPROVED` 2026-10-01. The Owner asked for it as a library component in F-04 ("kerjakan ketiganya sekaligus") and approved the `component.option-card.*` tokens.
- Pencil library: `design-system.lib.pen` › **C44 — Option card** (`y0Pj2o`)
- Consumers: F-04 *Tambah sumber* provider choice. Expected: F-07 service/package choice, F-09 source choice.

## Purpose

One option of a single-choice radio group, shown as a card with an icon, a title and an optional description. Use it when each option needs a sentence of explanation. For plain short labels, use Radio (C06) on its own.

## Anatomy

| # | Part | Layer | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Horizontal; fill, border, radius, padding and gap bound. Fills its group's width. |
| 2 | Radio | `Radio` | Yes | Nested Radio (C06) instance, label hidden; the card is its label. |
| 3 | Icon | `Icon` | No | 18 px Lucide icon. |
| 4 | Title | `Title` | Yes | Body, semibold. |
| 5 | Description | `Description` | No | Body-sm, one or two lines. |
| 6 | Trailing | `Trailing` (slot) | No (off) | A Status Chip, e.g. Neutral without dot *Segera hadir*. |

Private base: `_OptionCard/Base` (`wl20h`).

## Variants

| Component | ID | Container | Radio |
|---|---|---|---|
| `Option Card/Default` | `mtP8i` | `background`, 1 px `border` | Unselected/Default |
| `Option Card/Hover` | `Gnak3` | 1 px `border-hover` | Unselected/Hover |
| `Option Card/Focus` | `xZvS4` | 2 px `border-selected` | Unselected/Focus |
| `Option Card/Selected` | `K1BPO` | 2 px `border-selected`; icon in `title` colour | Selected/Default |
| `Option Card/Disabled` | `AwKEK` | `background-disabled`, `border-disabled`; title `title-disabled`, icon `icon-disabled`, description off, Trailing on | Unselected/Disabled |

## Behaviour and layout

- Options stack one per line, `space.2` apart, on desktop and phones (Owner 2026-10-01).
- The whole card selects its option. Exactly one option is selected; a disabled option can't be selected.
- Keep titles short; put the explanation in the description.

## Token dependencies

| Decision | Token |
|---|---|
| Fill | `component.option-card.background`, `-disabled` |
| Border | `component.option-card.border`, `-hover`, `-selected` (2 px), `-disabled` |
| Text | `component.option-card.title`, `title-disabled`, `description` |
| Icon | `component.option-card.icon`, `icon-disabled` |
| Spacing | `component.option-card.padding` (12), `gap` (12), `text-gap` (2) |
| Radius | `component.option-card.radius` → `radius.md` |

All tokens are PERSISTED 2026-10-01.

## Accessibility

- Build it as a radio group: each card is the label of its radio. Arrow keys move between options and Space selects.
- Disabled options are `aria-disabled`, skipped by the arrow keys, and their Status Chip text is part of the accessible name ("Dropbox, segera hadir").
- Selection is shown by the filled radio and the 2 px border, never by colour alone.
- Focus: 2 px `border-selected` plus the Radio focus ring. Pencil can't draw a spread glow, so code adds `focus.glow` as on inputs.

## Gaps

- The icon size (18) is a literal because sizes can't bind in Pencil (`unsupported.size-binding`).

## Implementation references

- Pencil: C44 (`y0Pj2o`), base `wl20h`
- Tokens: `component.option-card.*`
- Rules: `token-usage.md` G1, G3, G5, SP5, SP6
- Code: not built yet. Planned in F-04 (`src/ui/patterns/option-card`, with a Radio primitive).
