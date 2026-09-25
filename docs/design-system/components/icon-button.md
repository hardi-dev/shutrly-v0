# Component: `Icon Button`

## Status and approval

- Lifecycle: `PROPOSED` (tier 1b, 2026-09-26). Size **SM** (ghost only) added in tier 2, 2026-09-26, for the toast close and the table-row action menu.
- Direction/token approval: `APPROVED` (`icon-button.*` added 2026-09-26; `icon-button.sm.padding` added 2026-09-26)
- Pencil library: `design-system.lib.pen` › **C02 — Icon button** (`l3eUy`)
- Consumers: app header (bell), toast close, password input eye, table "more"

## Purpose

A button with only an icon, for compact, well-known actions. Use **Outline** in toolbars and **Ghost** inside other components.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | MD 40 × 40 = 16 px icon + 2 × padding 12 (matches the input height). SM 32 × 32 = 16 + 2 × 8. |
| 2 | Icon | `Icon` | Yes | Lucide icon, swappable. |
| 3 | Badge | `Badge` | No | Nested **Notification badge** (C14), absolutely positioned at the top right; off by default. |

## Variants and properties

The private base is `_IconButton/Base` (`s4zsCg`), with layers `Icon` `wSyzB` and `Badge` `w1Fg4G`.

Names are `Icon Button/<Style>/<Size>/<State>`. The MD variants were renamed from `Icon Button/<Style>/<State>` on 2026-09-26; their IDs are unchanged.

| Style / Size \ State | Default | Hover | Focus | Disabled |
|---|---|---|---|---|
| Outline / MD | `m9dUlL` | `q55i4` | `z8x6cH` | `cSqu0` |
| Ghost / MD | `qY0Em` | `sDBli` | `RXlcJ` | `V85La` |
| Ghost / SM | `VA96y` | `zl5JW` | `j1Kf3I` | `Zyrkn` |

Outline SM is deferred until a consumer needs it.

| Property | Type | Mechanism |
|---|---|---|
| `icon` | Instance swap | `descendants: { Icon: { icon } }` |
| `badge` | Boolean | `descendants: { Badge: { enabled:true } }`; set its `Count` |

**Ghost** has no fill (a disabled fill layer) and no border; on hover it fills with `icon-button.background-hover`.

## Token dependencies

- Colour: `icon-button.background` → `surface.panel`; `icon-button.background-hover` → `surface.sunken`; `icon-button.border` → `border.default`; `icon-button.icon` → `text.primary`.
- Spacing and shape: `icon-button.padding` → `space.3` (MD); `icon-button.sm.padding` → `space.2` (SM); `icon-button.radius` → `radius.sm`.
- Focus: `focus.ring` + `focus.glow`. Disabled: `opacity.disabled`.

## Accessibility

- Always give it an `aria-label` (*Notifikasi*, *Tutup*). With a badge: *Notifikasi, 3 belum dibaca*.
- MD 40 × 40 and SM 32 × 32 both meet WCAG 2.2's 24 px minimum. On the client gallery, use MD with a ≥ 44 px hit area; SM is for the dense owner app only.
- Never add text; if the action needs a label, use Button.

## Implementation references

- Pencil: `C02 — Icon button` (`l3eUy`), base `s4zsCg`
