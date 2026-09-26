# Template: `App Shell`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 3, Owner review). Added to the tier 3 scope by the Owner.
- Pencil library: `design-system.lib.pen` › **C30 — App shell** (`f7qs8Z`)
- Evidence: legacy dashboard › Screen

## Purpose

The Owner app screen template. Every Owner screen starts from an instance of this and fills the panel's Content slot.

## Structure (`y9uBJl`, 1440 × 960, clipped)

| Part | ID | Notes |
|---|---|---|
| Root | `y9uBJl` | `surface.canvas`; padding `space.3` on the top, right and bottom, and 0 on the left (the sidebar sits flush left) |
| Sidebar | `fNszT` | Nested C29, height fill |
| Panel | `Sw0yD` | Nested C28, width and height fill (1176 × 936) |

To make a screen, insert an instance, then:
- set `Sw0yD/nrRBd` (title);
- replace `Sw0yD/uR9Ye` (actions), and fill the content with `Replace(<shell>/Sw0yD/d2hCuQ/bBehO, {type:"frame", name:"Container", width:1096, layout:"vertical", gap:"$component/panel/app/content/gap"})` (Page Content's container, max-width 1096 centred);
- make the current page's Nav item Active by replacing items in `fNszT/tilEo`.

The gutter, panel insets and the 1096 content max-width are owned by the template (SP5). The master shows an empty Page Content; the dark example (`TXZxf`) shows the dashboard.

## Accessibility

- Landmarks: `<nav>` (the sidebar) and `<main>` (the panel). A skip link, *Langsung ke konten*, is the first focusable element.

## Gaps

- The design width is 1440 only. Below 1280 the sidebar should collapse to icons, and below 768 it becomes a drawer; these breakpoints are future work.
- The client gallery (mobile, GAP-04) uses a different shell.

## Implementation references

- Pencil: `C30 — App shell` (`f7qs8Z`)
- Rules: token-usage.md SP5, §4.5 layout map
