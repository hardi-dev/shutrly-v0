# Component: `Menu Item`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1c, 2026-09-26). **No legacy evidence**: derived from tokens and existing component patterns, so review it carefully.
- Direction/token approval: `APPROVED` tokens; `menu.*` added 2026-09-26
- Pencil library: `design-system.lib.pen` › **C09 — Menu item** (`TbrWC`)
- Consumer: Menu (C10) → Select, Multi-select and Action menu (tier 2)

## Purpose

One row inside a Menu: a select option, a multi-select option (with a checkbox) or an action (with an icon). Destructive actions (*Hapus proyek*) use the danger role. Hover and keyboard highlight look the same.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Padding 8/12, gap 8, `radius.sm`; width 240 on the base, `fill_container` inside a Menu. About 36 px high. |
| 2 | Checkbox | `Checkbox` | No | Nested **Checkbox** (C05) with its label hidden. Swap the ref for checked or unchecked. For multi-select only. |
| 3 | Icon | `Icon` | No | 16 px lucide icon for actions, `menu.item.icon`. |
| 4 | Label | `Label` (in `Text`) | Yes | `font.size.body` / `font.weight.medium`; semibold when selected. |
| 5 | Description | `Description` (in `Text`) | No | Second line: `font.size.label`, `menu.item.description`. |
| 6 | Check | `Check` | No | 16 px `check` in `menu.item.check`; the selected single option. |

## Variants and properties

The private base is `_MenuItem/Base` (`mf83F`), with layers `Checkbox` `iWymw`, `Icon` `FL9Kk`, `Label` `vHwtA`, `Description` `leQSn` and `Check` `baOu6`.

| Type \ State | Default | Hover | Selected | Disabled |
|---|---|---|---|---|
| Default | `iSqRB` | `mCgnL` | `qKcfI` | `e0gYs` |
| Destructive | `Amnm5` | `nRGEe` | — | — |

| Property | Type | Mechanism |
|---|---|---|
| `icon`, `description`, `check`, `checkbox` | Boolean | `descendants: { <layer>: { enabled } }` |
| `iconName` | Instance swap | `descendants: { Icon: { icon } }` |
| `checkbox checked` | Instance swap | `descendants: { Checkbox: { type:"ref", ref:<Checkbox/Checked/Default or Unchecked>, … } }` |
| `label`, `description` | Text | `descendants` content |

**Configurations** on the canvas: option with description, selected with description, multi-select (checked), action with icon.

## Token dependencies

| Part | Token → alias |
|---|---|
| Text | `menu.item.text` → `text.primary`; `menu.item.description` → `text.muted`; `menu.item.text-disabled` → `text.disabled` |
| Icon / check | `menu.item.icon` → `text.muted`; `menu.item.check` → `action.primary` |
| Hover | `menu.item.background-hover` → `surface.sunken` |
| Destructive | `menu.item.text-destructive` → `status.danger.fg`; `menu.item.background-destructive-hover` → `status.danger.bg` |
| Spacing | `menu.item.padding-y` / `-x` → 8 / 12; `menu.item.gap` → 8 |
| Radius | `menu.item.radius` → `radius.sm` (≤ menu `radius.md`, SP9) |

## Accessibility

- Use `role=option` (listbox) or `menuitem` / `menuitemcheckbox` (menu). `aria-selected` / `aria-checked` carries the state, not the colour of the check.
- Keyboard highlight uses the hover style (`aria-activedescendant`). Enter or Space selects, and typing jumps to matching items.
- A destructive label says what gets deleted, and the action is confirmed in a dialog.
- Disabled items use `aria-disabled` and stay visible in the list.

## Implementation references

- Pencil: `C09 — Menu item` (`TbrWC`), base `mf83F`
- Rules: token-usage.md G3, SP1, SP9, §2 *Status*, §6, §8
