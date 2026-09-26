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
| Overlay | `fwm7P` | Boolean, **off** by default. Absolute, 1440 × 960, `modal.scrim`; centres the Modal slot. |
| Modal | `hnTfu` (slot) | Accepts Modal/SM·MD·LG (C31); default Modal/MD `nRbAO`. |

To make a screen, insert an instance, then:
- set `Sw0yD/nrRBd` (title);
- replace `Sw0yD/uR9Ye` (actions), and fill the content with `Replace(<shell>/Sw0yD/d2hCuQ/bBehO, {type:"frame", name:"Container", width:1096, layout:"vertical", gap:"$component/panel/app/content/gap"})` (Page Content's container, max-width 1096 centred);
- make the current page's Nav item Active by replacing items in `fNszT/tilEo`.

To show a modal: `Update(<shell>, {descendants:{fwm7P:{enabled:true}}})`, then fill `<shell>/fwm7P/hnTfu/nRbAO/c5Prsw` (Body) and `…/I7e8yh` (Actions), or replace `…/hnTfu/nRbAO` with another Modal size. C30's *Modal overlay* exhibit shows a delete confirm.

The gutter, panel insets and the 1096 content max-width are owned by the template (SP5). The master shows an empty Page Content; the dark example (`TXZxf`) shows the dashboard.

## Wide screens

`C30 — App shell · 1920` (`R6JQ6`) shows the same shell at 1920 × 1080. The Sidebar stays 252 wide and the panel fills the rest. Page Content keeps its Container at 1096 and centres it.

## Accessibility

- Landmarks: `<nav>` (the sidebar) and `<main>` (the panel). The Overlay is a portal to `<body>`; while it is open the sidebar and panel are `inert`. A skip link, *Langsung ke konten*, is the first focusable element.

## Gaps

- Tablet (768–1279): use `App Shell/Tablet` (C37, Sidebar/Rail + panel). Below 768: use the Mobile App Shell (C35).
- On the canvas the Overlay is absolute and can't fill, so a resized shell instance also overrides `fwm7P` width and height. In code it is `position: fixed; inset: 0`.

## Implementation references

- Pencil: `C30 — App shell` (`f7qs8Z`)
- Rules: token-usage.md SP5, §4.5 layout map
