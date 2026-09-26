# Component: `Segmented Item`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED`. Spacing was amended to whole steps by the Owner on 2026-09-26: item 6/12 → **8/16**, track padding and gap 2 → **4**. `segmented.item.text-hover` was added.
- Pencil library: `design-system.lib.pen` › **C11 — Segmented item** (`JU4XC`)
- Consumer: Segmented control (tier 2 composite: a track holding 2–4 items)

## Purpose

One option inside a segmented control, such as *Hari / Minggu / Bulan*.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Pill; padding 8/16. When active, it has a fill and a border. |
| 2 | Label | `Label` | Yes | One word, `font.size.label` / `font.weight.semibold`. |

## Variants and properties

The private base is `_SegmentedItem/Base` (`k0HnIZ`), with layer `Label` `FnOrw`.

| Property | Type | Values | Mechanism |
|---|---|---|---|
| `state` | Variant | `active` `NcbI1`, `default` `AptHz`, `hover` `BrUPr`, `focus` `u7e89` | component `Segmented Item/<State>` |
| `label` | Text | "Minggu" | `descendants` content |

## LG size (added 2026-09-26)

`Segmented Item/LG/<State>` has the same states, padding `segmented.item.lg.padding-y/-x` (12 / 20) and label `font.size.body` (14). Use it only inside `Segmented Control/LG`.

## Token dependencies

| Part | Token |
|---|---|
| Active fill + border | `segmented.item.background-active`, `segmented.item.border-active` |
| Text | `segmented.item.text` / `-hover` / `-active` |
| Padding | `segmented.item.padding-y` / `-x` (8 / 16) |
| Radius | `segmented.radius` (full) |
| Track (preview only) | `segmented.track`, `segmented.padding` (4), `segmented.gap` (4) |

Focus uses `focus.ring` and `focus.glow`.

## Usage-rule compliance

- **G3:** every part binds a component token.
- **SP1:** whole steps.
- **§4.2:** squish inset.
- **§5:** `radius.full` for segmented.

## Accessibility

- Code it as a radiogroup (view switcher) or a tablist (panel switcher). Arrow keys move between items.
- The active item isn't shown by colour alone: it's raised on a surface with a border.

## Implementation references

- Pencil: `C11 — Segmented item` (`JU4XC`), base `k0HnIZ`
