# Component: `Segmented Control`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 2, 2026-09-26)
- Direction/token approval: `APPROVED` (existing `segmented.*`, amended to whole steps on 2026-09-26 and shell v3 track on 2026-09-28)
- Pencil library: `design-system.lib.pen` › **C23 — Segmented control** (`GD7cE`)
- Evidence: legacy Frame 1 › Timeline Head › Segmented (Hari / Minggu / Bulan)

## Purpose

Switches between 2–4 views of the same content. Changes are instant; there's no submit.

## Structure

A single component, `Segmented Control` (`uMP5H`), with no variant axes: state lives in its items.

- The track is the root: fill `segmented.track` → `surface.muted`, padding `segmented.padding` (4), radius `segmented.radius` (full).
- `Items` (`ULzG1`) is a **slot** with gap `segmented.gap` (4). It accepts Segmented Item variants `NcbI1` (active), `AptHz` (default), `BrUPr` (hover) and `u7e89` (focus).
- Default content is Hari (active), Minggu, Bulan.

To change the items or which one is active:

```js
const s = Insert(parent, {type:"ref", ref:"uMP5H"})
const f = Replace(s+"/ULzG1", {type:"frame", name:"Items", gap:"$component/segmented/gap"})
Insert(f, {type:"ref", ref:"AptHz", descendants:{FnOrw:{content:"Hari"}}})
Insert(f, {type:"ref", ref:"NcbI1", descendants:{FnOrw:{content:"Minggu"}}})
```

## Content

- 2–4 items, one word each, always in the same order (shortest period first).
- Items hug their label, and the control hugs its items.

## Accessibility

- Code it as `role=radiogroup` (view switcher) or `role=tablist` (panel switcher). ← and → move between items; there's one Tab stop.
- The active item is raised on a surface with a border, not shown by colour alone.
- Items are 32 px high. The client gallery needs ≥ 44 px: a future LG size.

## Usage

- Use Select for 5+ options or for a form value. Use the sidebar to change page. Use a Switch for a single on/off setting.

## LG (added 2026-09-26)

`Segmented Control/LG` (`WadoU`) is used for mobile filters (44 px targets). Its Items slot holds `Segmented Item/LG/*` (Active `a17zLE`, Default `SaNob`, Hover `OD6NY`, Focus `w3GDB`): padding `segmented.item.lg.padding-y/-x` (12 / 20) with a body 14 label.

## Full width — APPROVED 2026-10-02 (F-05)

`Segmented Control/Full width` (`iIcai`): the Items slot fills the control's width, each item is `fill_container` with a centred label, and the tokens are unchanged. Use it on phones as view tabs, as the first item in the content (F-05 *Layanan*: Layanan · Kategori · Item paket). Set the instance width (`fill_container` in layouts). Desktop pages use C45 Tabs in Page Header/Tabs instead.

## Gaps


## Implementation references

- Pencil: `C23 — Segmented control` (`GD7cE`); items in C11 (`JU4XC`)
