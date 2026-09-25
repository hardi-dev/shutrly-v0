# Component: `Icon Button`

## Status and approval

- Lifecycle: `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED` (`icon-button.*` added 2026-09-26)
- Pencil library: `design-system.lib.pen` › **C02 — Icon button** (`l3eUy`)
- Consumers: app header (bell), toast close, password input eye, table "more"

## Purpose

A button with only an icon, for compact, well-known actions. Use **Outline** in toolbars and **Ghost** inside other components.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | 40 × 40 = 16 px icon + 2 × padding 12, which matches the input height. |
| 2 | Icon | `Icon` | Yes | Lucide icon, swappable. |
| 3 | Badge | `Badge` | No | Nested **Notification badge** (C14), absolutely positioned at the top right; off by default. |

## Variants and properties

The private base is `_IconButton/Base` (`s4zsCg`), with layers `Icon` `wSyzB` and `Badge` `w1Fg4G`.

| Style \ State | Default | Hover | Focus | Disabled |
|---|---|---|---|---|
| Outline | `m9dUlL` | `q55i4` | `z8x6cH` | `cSqu0` |
| Ghost | `qY0Em` | `sDBli` | `RXlcJ` | `V85La` |

| Property | Type | Mechanism |
|---|---|---|
| `icon` | Instance swap | `descendants: { Icon: { icon } }` |
| `badge` | Boolean | `descendants: { Badge: { enabled:true } }`; set its `Count` |

**Ghost** has no fill (a disabled fill layer) and no border; on hover it fills with `icon-button.background-hover`.

## Token dependencies

- Colour: `icon-button.background` → `surface.panel`; `icon-button.background-hover` → `surface.sunken`; `icon-button.border` → `border.default`; `icon-button.icon` → `text.primary`.
- Spacing and shape: `icon-button.padding` → `space.3`; `icon-button.radius` → `radius.sm`.
- Focus: `focus.ring` + `focus.glow`. Disabled: `opacity.disabled`.

## Accessibility

- Always give it an `aria-label` (*Notifikasi*, *Tutup*). With a badge: *Notifikasi, 3 belum dibaca*.
- 40 × 40 meets WCAG 2.2's 24 px minimum. On the client gallery, give it a ≥ 44 px hit area.
- Never add text; if the action needs a label, use Button.

## Implementation references

- Pencil: `C02 — Icon button` (`l3eUy`), base `s4zsCg`
