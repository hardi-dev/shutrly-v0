# Component: `Select`

## Status and approval

- Lifecycle: `PROPOSED` (tier 2, 2026-09-26). The Menu part has no legacy evidence (see C10).
- Direction/token approval: `APPROVED` (existing `input.*`, `menu.*`)
- Pencil library: `design-system.lib.pen` › **C19 — Select** (`epNyK`)

## Purpose

Pick one of 6 or more options, or one of fewer when space is tight. It's a Text field whose Input is a select trigger, plus a Menu (C10) floating below it.

## Anatomy

| # | Part | Layer name | Description |
|---|---|---|---|
| 1 | Field | `Field` (`Et1pR`) | Nested **Text Field/Default** with a trailing `chevron-down`. Paths: label `Et1pR/Gmk0c`, placeholder `Et1pR/c67yIW/tvTDd`, value `Et1pR/c67yIW/CykHo`, helper `Et1pR/uh4XA`. |
| 2 | Menu | `Menu` (`xGHsR`) | Nested **Menu**, 320 wide, `layoutPosition: absolute` at y 65 (4 px under the Input). Off unless open. It overlays the helper and the content below and never pushes layout. |

## Variants

The private base is `_Select/Base` (`R1MZh`).

| State | ID | Notes |
|---|---|---|
| Default | `Wc7hd` | placeholder "Pilih layanan" |
| Hover | `v7bysV` | `input.border-hover` |
| Open | `b5dem` | focus border + glow, value "Wedding", `chevron-up`, Menu on (✓ on the selected item) |
| Error | `A6bXr` | danger border, red chevron, error message |
| Disabled | `umHpv` | disabled fill, border and text |

States re-apply Text field / Input overrides on the stable nested paths (see text-field.md › *Composite pattern*).

## Filling the menu

```js
const s = Insert(parent, {type:"ref", ref:"b5dem"})
const items = Replace(s+"/xGHsR/JoK1p", {type:"frame", name:"Items", width:"fill_container", layout:"vertical"})
Insert(items, {type:"ref", ref:"qKcfI", width:"fill_container", descendants:{vHwtA:{content:"2 jam"}}}) // selected
Insert(items, {type:"ref", ref:"iSqRB", width:"fill_container", descendants:{vHwtA:{content:"3 jam"}}})
```

The menu's y offset assumes the label row is on (15 px). With the label hidden, move the menu to y 44.

## Token dependencies

`component.input.*` (through Text field), `component.menu.*`, `elevation.1.*`.

## Usage

| Situation | Use |
|---|---|
| 2–5 options with room | Radio (C06) |
| 6+ options or tight space | **Select** |
| Many of many | Multi-select (C20) |
| Switch a view | Segmented control (C23) |
| Actions | Action menu (C21) |
| ≥ 10 options | Select with search: a combobox, not built yet |

## Accessibility

- The trigger is `role=combobox` (or a button) with `aria-expanded` and `aria-controls` pointing to a `role=listbox`; options are `role=option` with `aria-selected`.
- Enter, Space or ↓ opens it; ↑ and ↓ move; Enter selects and closes; Esc closes and returns focus; type-ahead jumps to a matching option.
- The selected option has a ✓ and a semibold label, so it isn't shown by colour alone.

## Gaps

- The menu offset depends on the label row.
- Combobox (search in the menu) isn't built.

## Implementation references

- Pencil: `C19 — Select` (`epNyK`), base `R1MZh`
- Rules: token-usage.md G3, §6, §8
