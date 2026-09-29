# Component: `Menu` (+ `Menu Divider`, `Menu Group Label`)

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1c, 2026-09-26). **No legacy evidence**: derived from tokens and existing component patterns, so review it carefully.
- Direction/token approval: `APPROVED` tokens; `menu.*` added 2026-09-26
- Pencil library: `design-system.lib.pen` › **C10 — Menu** (`AgR78`)

## Purpose

A floating panel that holds Menu items: the list behind a Select, a Multi-select or an Action menu (⋯). It's a floating layer, so it uses `elevation.1` (§6).

## Components

| Component | ID | Notes |
|---|---|---|
| `Menu` | `g6dKmz` | Container. Slot **`Items`** (`JoK1p`, `slot` = Menu Item variants, Divider, Group Label). Default content: 4 options with 1 selected. |
| `Menu Divider` | `z7QON` | 1 px `menu.divider` line with 4 px above and below. Separates groups. |
| `Menu Group Label` | `yNxME` | Overline text (`menu.group-label`), UPPERCASE, ≤ 3 words. Text prop `Label` (`n0wAh6`). |

## How to fill the slot (pen.dev)

pen.dev doesn't allow `Insert` into an instance's slot. **Replace** the slot instead:

```js
const m = Insert(parent, {type:"ref", ref:"g6dKmz", name:"Menu"})
const items = Replace(m+"/JoK1p", {type:"frame", name:"Items", width:"fill_container", layout:"vertical"})
Insert(items, {type:"ref", ref:"iSqRB", width:"fill_container", descendants:{"vHwtA":{content:"Prewedding"}}})
```

Known Pencil limitation: a `Get` visitor that walks into an instance with a replaced slot can throw. Scans call `ctx.skipChildren()` on `ref` nodes.

## Layout

- Width 240 by default; at least as wide as the trigger.
- Opens 4 px (`space.1`) below the trigger, left-aligned. An action menu aligns right to its ⋯ button.
- Maximum height about 320, then it scrolls (code).
- Container padding is 4 (`menu.padding`) and items stack with no gap.

## Token dependencies

| Part | Token → alias |
|---|---|
| Panel | `menu.background` → `surface.panel`; `menu.border` → `border.default`; `menu.radius` → `radius.md`; `menu.padding` → `space.1` |
| Shadow | `color.semantic.elevation.1.color`, `elevation.1.offset-y`, `elevation.1.blur` (split composite) |
| Divider | `menu.divider` → `border.subtle` |
| Group label | `menu.group-label` → `text.muted`; type overline (10 / bold / +0.6) |

## Compositions (previews on canvas; the real composites come in tier 2)

- **Select (single):** Input trigger in focus with `chevron-up`, then a Menu with a ✓ on the selected option.
- **Multi-select:** Input trigger ("WhatsApp, Email"), then a Menu with a group label and checkbox items.
- **Action menu:** Icon button ⋯, then a Menu with icon items, a divider and a destructive item.

## Usage

| Situation | Use |
|---|---|
| One of 2–5 options, with room to show them | Radio |
| One of 6+ options, or tight space | Select |
| Many of many | Multi-select |
| Row actions | Action menu (the primary action stays a visible Button) |
| ≥ 10 options | Add a search Input at the top (combobox, tier 2) |

## Accessibility

- **Select:** combobox or button with `aria-expanded` and `aria-controls` → listbox.
- **Action menu:** `aria-haspopup=menu` → `role=menu`.
- Opens on Enter, Space or ↓. Esc closes it and returns focus to the trigger; Tab closes it.
- The panel edge is shown by the border plus the elevation, not by colour alone.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: **Menu/List** `I3q8f` (padding `menu.padding` / 0). Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- **List** use: horizontal padding 0, with Menu Divider between items so dividers are full width.
- A footer can hold a primary Button MD (the workspace switcher's *Buat workspace*).
- This needs a Menu variant, instead of today's instance padding override (SP5 exception).

## F-17 validation update — PROMOTED 2026-09-29

D-2/D-3 (Owner 2026-09-29): **Menu/List** `I3q8f` rows use the Bottom Sheet row anatomy so the workspace switcher reads the same on desktop, tablet and phone: 52 px, `sheet.item.padding-x` / `sheet.item.gap`, a full-width top border `sheet.item.border`, label `font.size.body` medium (semibold when selected), check `sheet.item.check`, no description. The group label aligns to `sheet.item.padding-x`. Code: `MenuItem layout="row"`, `MenuCtaItem`, `MenuSection`.

## Implementation references

- Pencil: `C10 — Menu` (`AgR78`)
- Rules: token-usage.md G3, SP9, §5, §6, §8
