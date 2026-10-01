# Component: `Nav Rail` (+ `Tooltip`, compact `Nav Item`, `Sidebar/Rail`, `App Shell/Tablet`)

## Status and approval

- Lifecycle: `PROPOSED` (2026-09-26)
- Direction/token approval: `APPROVED`. The Owner picked option A ("A with tooltip") on exploration board 07 (`exploration.pen` › **07 — Tablet rail study**). It adds a new scale token `size.rail` = 72 and 7 component tokens: `sidebar.rail.width/gap` and `tooltip.background/text/radius/padding-y/padding-x`.
- Pencil library: `design-system.lib.pen` › **C37 — Nav rail & tablet shell** (`jNOvR`)

## Purpose

The tablet layout (768–1279 px). The desktop Sidebar collapses to a 72 px icon rail next to the App panel. It's the same navigation, only collapsed: every Sidebar destination stays one tap away. Labels move into a Tooltip, and counts become Notification Badges. Below 768 px use the Mobile App Shell (C35); at 1280 px and above, the App Shell (C30).

## Components

| Component | ID | Structure |
|---|---|---|
| `Tooltip` | `OYkds` | `tooltip.background` (`surface.inverse`), `tooltip.radius` (8), padding `tooltip.padding-y/-x` (4 / 8), shadow `elevation.1`. Label `WLS9S` (label 12 / 600, `tooltip.text`). General purpose: rail items and icon-only buttons. |
| `Nav Item` with `isCompact` (code mode) | — | 40 × 40, `nav.item.radius`, centred. Icon uses `nav.item.icon`; the visible label is omitted and the shared Tooltip exposes it on hover/focus. Active and focus use the same tokens as expanded `Nav Item`. |
| `Sidebar/Rail` | `JRUY0` | 72 (= `sidebar.rail.width` → `size.rail`), gap `sidebar.rail.gap` (8), padding-y `sidebar.padding-y`, centred. Contents: Logo mark (`sidebar.logo`) · Workspace switch icon (40; opens the workspace menu) · Divider · **Nav** slot `r1Gq4` (Dasbor, Proyek 12, Klien, Invoice 3, a group hairline, Layanan, Tim) · Spacer · **Nav bottom** slot `A4gKt` (Template pesan, Sumber foto, Pengaturan) · Divider · Expand (Icon Button Ghost MD `panel-left-open`) · Avatar MD |
| `App Shell/Tablet` | `lQnS8` | 1024 × 768, `surface.canvas`, gutter `space.3` on the top, right and bottom. Nested Rail `f4EPF6` + App Panel `QhPny` (fill). The Page Content Container is overridden to fill, and Search is 300. Overlay `bbU0M` (off): `modal.scrim` + Modal slot `o14Rz`. |

**Use (top-level instance):**
- Content: `Replace(<shell>/QhPny/d2hCuQ/bBehO, {type:"frame", name:"Container", width:"fill_container", layout:"vertical", gap:"$component/panel/app/content/gap"})`
- Active page: render the shared `Nav Item` with `isCompact` and `isActive`, and set the previously active item back to its default state.
- **Canvas note:** the rail comes before the panel in the layer order, so a rail item's own Tooltip is hidden under the panel. The C37 hover example places a Tooltip above the shell instead. In code the tooltip renders in a portal above everything.

## Rules

- The same destinations and order as the Sidebar (C29). The KATALOG label becomes a hairline, because the compact `Nav Item` Tooltip carries the name.
- A tooltip shows on hover and keyboard focus after 300 ms and hides on Esc. It holds only the destination name, at most 3 words.
- Expand opens the full Sidebar as an overlay above the panel, never pushing it. Esc and clicking outside close it.

## Accessibility

- Compact `Nav Item`s are links with `aria-label` (the Tooltip text) and `aria-current=page` when active. The Tooltip is linked with `aria-describedby`, never used as the only name.
- Badge counts are part of the name (*Proyek, 12 baru*).
- Targets are 40 × 40 with 8 px gaps, which meets the 24 px minimum (WCAG 2.2 AA) and is comfortable for touch.

## Gaps

- The expanded overlay state (full Sidebar over the panel) is described but not drawn.
- The rail width and item size are literal on the canvas, because Pencil can't bind width.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: `OKf00` via nav tokens; `GMxFW` icon `icon-hover`; App Shell/Tablet `lQnS8` root `surface.muted`, Toast layer `z9osf8`; rail workspace control `HbcMi`/`z3corP` = `chevrons-up-down` 16 `text.muted`. Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- Active and hover change the same way as C22.
- The workspace control uses `chevrons-up-down` 16 in `text.muted`, with no `accent.highlight` mark.
- App Shell/Tablet root becomes `surface.muted` (v3 L1).
- A **Toast layer** is added, bottom-right with a `space.6` inset, as on desktop.

## Implementation references

- Pencil: `C37 — Nav rail & tablet shell` (`jNOvR`); tokens on board 06 › *Sidebar*, *Tooltip*
- Exploration: `exploration.pen` › 07 (options A / B)
- Related: Sidebar (C29), App Shell (C30), Mobile App Shell (C35), Nav Item (C22)
