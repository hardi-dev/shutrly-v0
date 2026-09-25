# Component: `App Panel`

## Status and approval

- Lifecycle: `PROPOSED` (tier 3, 2026-09-26)
- Direction/token approval: `APPROVED`. `panel.app.title` and `panel.app.header.gap` were added on 2026-09-26.
- Pencil library: `design-system.lib.pen` › **C28 — App panel** (`yepgE`)
- Evidence: legacy dashboard › Panel

## Purpose

The white working surface of every Owner page. It sits on `surface.canvas` next to the Sidebar, inside the App shell.

## Anatomy

| # | Part | Layer | Description |
|---|---|---|---|
| 1 | Panel | root `UmVJD` | 1176 wide in the shell (fill); `panel.app.background`, 1 px `panel.app.border`, `panel.app.radius` (16); clipped. |
| 2 | Panel header | `gmoTC` | Height 72 (literal; Pencil can't bind height); padding-x 28 (`panel.app.header.padding-x`); bottom border `panel.app.border`; gap 12 (`panel.app.header.gap`). |
| 3 | Title | `nrRBd` | title 18/700/−0.4, `panel.app.title`. This is the page `<h1>`. |
| 4 | Actions | `uR9Ye` (slot) | Input/Search (300), Icon Button/Outline MD (bell with badge), and at most one Button. |
| 5 | Content | `C5QYo` (slot) | Padding 28 / 40 (`panel.app.content.padding-y/-x`); section gap 28 (`panel.app.content.gap`). Default content is the dashboard greeting (display type + an LG primary Button) and a row of 4 Metric tiles. |

Replace the content: `Replace(<panel>/C5QYo, {type:"frame", name:"Content", layout:"vertical", width:"fill_container", padding:["$component/panel/app/content/padding-y","$component/panel/app/content/padding-x"], gap:"$component/panel/app/content/gap"})`.

## Rules

- Layout insets are owned by the panel (SP5). Screens never add their own outer padding.
- Sections stack at 28. Inside a section, use 16 for tiles and 24 for columns (board 08).
- The panel is flat (§6); never nest a panel inside a panel.

## Accessibility

- The panel is the `<main>` landmark. Its title is the page `<h1>`. Header actions come before the content in tab order.
- Search is a `role=searchbox` with `aria-keyshortcuts="Meta+K"`. The bell has an `aria-label` that includes the unread count.

## Gaps

- The header height (72) is literal.
- Breakpoints aren't specified.

## Implementation references

- Pencil: `C28 — App panel` (`yepgE`)
- Rules: token-usage.md G3, SP4, SP5, §4.5 layout map, §6
