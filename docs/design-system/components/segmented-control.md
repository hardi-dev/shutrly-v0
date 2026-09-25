# Component: `Segmented Control`

## Status and approval

- Lifecycle: `PROPOSED` (tier 2, 2026-09-26)
- Direction/token approval: `APPROVED` (existing `segmented.*`, amended to whole steps on 2026-09-26)
- Pencil library: `design-system.lib.pen` › **C23 — Segmented control** (`GD7cE`)
- Evidence: legacy Frame 1 › Timeline Head › Segmented (Hari / Minggu / Bulan)

## Purpose

Switches between 2–4 views of the same content. Changes are instant; there's no submit.

## Structure

A single component, `Segmented Control` (`uMP5H`), with no variant axes: state lives in its items.

- The track is the root: fill `segmented.track` → `surface.sunken`, padding `segmented.padding` (4), radius `segmented.radius` (full).
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

## Gaps

- LG size for the client gallery.

## Implementation references

- Pencil: `C23 — Segmented control` (`GD7cE`); items in C11 (`JU4XC`)
