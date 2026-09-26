# Component: `App Panel`

## Status and approval

- Lifecycle: `PROPOSED` (tier 3, 2026-09-26)
- Direction/token approval: `APPROVED`. `panel.app.title` and `panel.app.header.gap` were added on 2026-09-26. `panel.app.content.max-width` (→ `size.content-max` 1096) was added on 2026-09-26 with the Page Content extraction.
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
| 5 | Content | `C5QYo` (slot) | Accepts **Page Content** (`B4HAVd`) only; no padding or gap of its own. The default is an empty Page Content instance (`d2hCuQ`). |

## Page Content (`B4HAVd`)

The panel's content region, extracted as its own component so that very wide screens don't stretch the page.

| Part | Layer | Description |
|---|---|---|
| Root | `B4HAVd` | Width fill; padding 28 / 40 (`panel.app.content.padding-y/-x`); centres the Container. |
| Container | `bBehO` (slot) | Fixed **1096** = `panel.app.content.max-width` (`size.content-max`: 1440 shell − 252 sidebar − 12 gutter − 2 × 40). Sections stack at 28 (`panel.app.content.gap`). Recommended: Table, Metric Tile, Segmented Control, Text Field, Buttons, Toast. |
| Hint | `Wnclu` | Placeholder text, replaced with the page sections. |

Pencil has no max-width and can't bind width to a variable, so the Container is a literal 1096 and centres on wider panels. **In code:** `max-width: 1096px; width: 100%; margin-inline: auto`, so below 1176 it shrinks with the panel. On the canvas a panel narrower than 1176 clips the Container; show panels at 1176 or wider.

Fill a page (on a **top-level** instance of the panel or the shell):

```js
const c = Replace(panel + "/d2hCuQ/bBehO", {type:"frame", name:"Container", width:1096, layout:"vertical", gap:"$component/panel/app/content/gap"})
Insert(c, {type:"ref", ref:"FCsTI", width:"fill_container"})
```

Pencil can't replace a slot of an instance that sits inside another master, so the App Panel and App Shell masters show the empty Page Content. The dashboard (greeting + 4 Metric tiles) is shown in the C28 Modes exhibit and the dark App Shell example.

Slot gotcha: a frame with `slot: []` (empty list) rejects every insert with `Cannot read properties of undefined (reading 'id')`. Always list the allowed components.

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
- The Container width is literal 1096 (see Page Content).

## Implementation references

- Pencil: `C28 — App panel` (`yepgE`)
- Rules: token-usage.md G3, SP4, SP5, §4.5 layout map, §6
