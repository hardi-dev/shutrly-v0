# Template: `Mobile Shell`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 4, Owner review). The Owner asked to fix the missing mobile frame (GAP-04) after C32.
- Tokens: none added. It's a **layout region** like the Sidebar, so it binds semantic and scale tokens under G3's layout clause.
- Pencil library: `design-system.lib.pen` › **C33 — Mobile shell** (`rmpdk`)
- Evidence: none in the legacy frames. The client gallery (mobile) was GAP-04.

## Purpose

The phone screen template (375 × 812). Every phone screen starts from it, beginning with the client gallery. It also hosts the Bottom Sheet (C32) through its Overlay.

## Structure (`XHlWT`, 375 × 812, clipped, radius 36 as a device frame)

| Part | ID | Notes |
|---|---|---|
| Status bar | `gcvMh` | 54 high, time and indicators. **Device inset** (`env(safe-area-inset-top)`); the app never draws it. |
| App bar | `ombNI` | 52 high, padding-x `space.2`, gap `space.1`, bottom border `border.subtle`. Back `A7FVe` (Icon Button Ghost MD, chevron-left) · Title `YDCza` (subtitle 16 / 700, fill) · Action `iYuut` (Icon Button Ghost MD, share-2). Back and Action are optional. |
| Content | `JOcL3` (slot) | Fill; padding `space.4` (16), gap `space.3` (12). Accepts Metric Tile, Table, Text Field, Segmented Control, Button LG and Alert. |
| Safe area | `c6tsWc` | 34 high, home indicator. **Device inset** (`env(safe-area-inset-bottom)`). |
| Overlay | `uTdi7` | Boolean, **off**. Absolute 375 × 812, `sheet.scrim`, docks the Sheet slot to the bottom. |
| Sheet | `gc8dt` (slot) | Accepts Bottom Sheet/Actions · /Form. The default is Bottom Sheet/Actions (`OxGbt`). The sheet has its own safe area. |

**Fill (top-level instance):**

- Content: `Replace(<shell>/JOcL3, {type:"frame", name:"Content", layout:"vertical", width:"fill_container", height:"fill_container", padding:"$space/4", gap:"$space/3"})`
- Sheet:
  1. Turn the overlay on: `Update(<shell>, {descendants:{uTdi7:{enabled:true}}})`.
  2. Fill `<shell>/uTdi7/gc8dt/OxGbt/…` (the Actions sheet), or use `Replace(<shell>/uTdi7/gc8dt/OxGbt, {type:"ref", ref:"vSBbR", …})` for a Form sheet.

The C33 exhibits show the gallery, an actions sheet, a confirm and dark mode. C32's examples now use this shell.

## Accessibility

- Landmarks: `<header>` for the app bar and `<main>` for the content. The Back and Action icon buttons need `aria-label`s (*Kembali*, *Bagikan*).
- While the Overlay is open the content is `inert`, and the sheet follows the C32 dialog rules.

## Gaps

- Navigation: no bottom tab bar or drawer yet.
- Tablet (768–1279) and the Owner-app breakpoints are not specified.
- The status bar and home indicator are drawn only as device context.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library (`XHlWT`): App bar `ombNI` hosts **Compact Bar** `GaeSf` → master `J3Ppgp` (Title `I0gdll`, Parent `jbTiE`, Actions slot `wS30M`, empty by default); Content `JOcL3` sheet; Safe area off; Bottom Nav `F4VJ1u` added. Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- The sub-page **Compact Bar** has:
  - Back to the hierarchical parent;
  - the title in `title` 18;
  - the parent caption in `page-header.breadcrumb.text`;
  - an optional **Actions** slot, empty by default.

  The Bottom Nav stays visible on sub-pages.

## Implementation references

- Pencil: `C33 — Mobile shell` (`rmpdk`); used by `C32 — Bottom sheet` › Content
- Related: App Shell (C30, desktop), Bottom Sheet (C32)
- Rules: token-usage.md G3 (layout clause), SP4, SP5
