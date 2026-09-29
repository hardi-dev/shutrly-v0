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
| Root | `y9uBJl` | `surface.muted` (L1 shell); padding `space.3` on the top, right and bottom, and 0 on the left (the sidebar sits flush left) |
| Sidebar | `fNszT` | Nested C29; expanded or compact 72 px rail mode, height fill |
| Panel | `Sw0yD` | Nested C28, width and height fill (1176 × 936) |
| Overlay | `fwm7P` | Boolean, **off** by default. Absolute, 1440 × 960, `modal.scrim`; centres the Modal slot. |
| Modal | `hnTfu` (slot) | Accepts Modal/SM·MD·LG (C31); default Modal/MD `nRbAO`. |
| Toast | `VJpuD` (slot) | Boolean, **off** by default. Absolute 1440 × 960, bottom-right stack for transient feedback; accepts `Toast/Success` (C39). It is independent of Overlay and does not make the page inert. |

To make a screen, insert an instance, then:
- set the nested Page Header text (`Sw0yD/MST3f/EPpbd`, `Hh5tj`, `HsrFT`, `i8XPWU`) and replace its `U9JxE` Actions slot;
- fill the content with `Replace(<shell>/Sw0yD/d2hCuQ/bBehO, {type:"frame", name:"Container", width:1096, layout:"vertical", gap:"$component/panel/app/content/gap"})` (Page Content's container, max-width 1096 centred);
- make the current page's Nav item Active by replacing items in `fNszT/tilEo`.

To show a modal: `Update(<shell>, {descendants:{fwm7P:{enabled:true}}})`, then fill `<shell>/fwm7P/hnTfu/nRbAO/c5Prsw` (Body) and `…/I7e8yh` (Actions), or replace `…/hnTfu/nRbAO` with another Modal size. C30's *Modal overlay* exhibit shows a delete confirm.

To show transient feedback: enable `VJpuD` and fill its Toast slot. Toast is not a modal, so it never shares or replaces `fwm7P`.

The gutter, panel insets and the 1096 content max-width are owned by the template (SP5). The master shows an empty Page Content; the dark example (`TXZxf`) shows the dashboard.

## Responsive sidebar behavior

- At `xl` and above, the sidebar starts expanded. Its header collapse button
  changes it to compact rail mode inline, allowing the panel to grow. The logo
  in compact mode expands it again.
- From `md` through `lg`, the compact rail is the default. Clicking its logo
  opens the expanded Sidebar as a dismissible overlay.
- Below `md`, the Mobile App Shell owns navigation.

## Wide screens

`C30 — App shell · 1920` (`R6JQ6`) shows the same shell at 1920 × 1080. The Sidebar stays 252 wide and the panel fills the rest. Page Content keeps its Container at 1096 and centres it.

## Accessibility

- Landmarks: `<nav>` (the sidebar) and `<main>` (the panel). The Overlay is a portal to `<body>`; while it is open the sidebar and panel are `inert`. A skip link, *Langsung ke konten*, is the first focusable element.

## Gaps

- Tablet (`md` through `lg`): use the compact Sidebar rail + panel. Below `md`: use the Mobile App Shell (C35).
- On the canvas the Overlay is absolute and can't fill, so a resized shell instance also overrides `fwm7P` width and height. In code it is `position: fixed; inset: 0`.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: Toast layer `VJpuD` padding → `space.6`; Toast slots accept `Toast/Success` `QCuMb` and `Toast/Danger` `C3PCyx`. Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- The Toast layer `VJpuD` pads with a literal 24; it should use `space.6`.
- Page Header breadcrumb utilities come through C40, and the Nav active/hover change comes through C22.

## Implementation references

- Pencil: `C30 — App shell` (`f7qs8Z`)
- Rules: token-usage.md SP5, §4.5 layout map
