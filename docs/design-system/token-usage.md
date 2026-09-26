# Token usage rules — Shutrly / Studio Lime

Status: APPROVED token set (2026-09-26) · Rules: APPROVED 2026-09-26 (Owner: "approve") · Amended 2026-09-26 (Owner): `space.9` = 36 added to SP1; §4.2 button padding 10/16 → 12/36, LG 12/24 → 16/48 (3:1 squish, whole steps per SP6); §4.4 checkbox/radio/switch ↔ label 10 → 8; segmented item 6/12 → 8/16, track padding/gap 2 → 4; new semantic `border.control-hover`, `control.track-off-hover`, `status.danger.on-solid`; `menu.*` (tier 1c); tier 2 (2026-09-26): SP6 list adds alert text (title ↔ body 2), 16 component tokens (`calendar.day.label/number/dot/dot-selected`, `nav.item.background-hover`, `nav.group-label`, `metric.tile.label/value`, `metric.spark.gap/radius`, `alert.<tone>.action`, `icon-button.sm.padding`); tier 3 (2026-09-26): SP6 list adds table cell avatar ↔ name (10), 13 tokens (`table.background/border/radius`, `table.toolbar.padding-y/-x`, `table.header.padding-y/border`, `table.row.background-hover`, `table.cell.text/text-strong`, `table.footer.link`, `panel.app.title`, `panel.app.header.gap`); page content (2026-09-26): `size.content-max`, `panel.app.content.max-width`; modal (2026-09-26, option A): new primitives `red.300`, `alpha.neutral-950-a50`, `alpha.black-a60`, new semantic `overlay.scrim`, `status.danger.solid-hover`, 18 `modal.*` + 3 `button.danger.*` tokens; bottom sheet (2026-09-26, A + B header): 25 `sheet.*` tokens, SP6 list adds sheet item icon ↔ label (10); bottom nav (2026-09-26, option B, padding-top 12): 12 `bottom-nav.*` tokens; open questions (2026-09-26): 10 `sidebar.*` aliases, `calendar.day.background-hover`, `segmented.item.lg.padding-y/-x`, `table.row.background-selected`, `table.header.text-sorted`, `table.skeleton`, `menu.item.text-action`; alert close optical alignment approved (§4.6); tablet rail (2026-09-26, board 07 option A): scale `size.rail` 72, `sidebar.rail.width/gap`, `tooltip.*` (5) · Source of values: [`tokens.json`](tokens.json) · Visual version: `design-system.lib.pen` › board **07 — Usage rules**

These rules say *which* token to reach for, *when*, and what never to do. They apply to Pencil designs, the `components/ui` wrappers, and application code (ADR-010: Tailwind theme variables mirror these tokens).

---

## 1. Global rules

| # | Rule | Why |
|---|---|---|
| G1 | **Choose a token by meaning, not by how it looks.** If a colour "happens to match", it is the wrong token. | Values change per mode and per workspace brand; meaning doesn't. |
| G2 | **Never use `color.primitive.*` (including `alpha.*`) in a design, component or code.** Primitives only feed semantic tokens. | Primitives don't switch with dark mode and can't be re-themed. |
| G3 | **Components bind `component.*` tokens; screens and layouts bind `color.semantic.*`, `space.*`, `radius.*`.** If a component token exists, use it instead of the semantic one it aliases. | Lets a component change without touching every screen. |
| G4 | **No hard-coded values.** No hex, rgba, or px outside the scale. If nothing fits, report `DESIGN TOKEN GAP` — don't invent a value. | Hard-coded values are invisible to theming, verification and code sync. |
| G5 | **Always pair a foreground with its own background** (`*.fg` on its `*.bg`, `on-*` on its surface). Check both modes. | Pairs are contrast-checked together; mixing breaks AA. |
| G6 | **Never put a mode in a token name** (`dark-surface`, `text-light`). Use the `mode` theme axis. | One name, two values — the theme picks. |
| G7 | **Don't use opacity to create colour variants.** Use `text.secondary` / `text.muted`, not text at 50 %. | Opacity changes with what's underneath; tokens are contrast-checked. |
| G8 | **Changes go through the pipeline**: edit the generator/`tokens.json` → Pencil variables → mapping → `/sdv:verify-design-system`. Renames/removals need a replacement note. | Keeps design, JSON and code in lock-step. |

**Which token do I need?**
1. Is it inside a library component? → use that component's `component.*` token.
2. Otherwise, what is the element *for*? surface · text · border · action · focus · accent · status · data.
3. Pick the role, then the emphasis (primary / secondary / muted / subtle).
4. Is there a foreground on it? → take the matching `on-*` / `.fg` token.
5. Check light **and** dark. Nothing fits → `DESIGN TOKEN GAP`.

---

## 2. Colour

### Surfaces — layer from back to front
| Token | Use for | Don't use for |
|---|---|---|
| `surface.canvas` | App background behind panels (the grey around the white panel) | Anything inside a panel |
| `surface.panel` | App panel, cards, tiles, inputs, alerts, menus | Page background |
| `surface.subtle` | Quiet zones inside a panel: table header, search field | Primary content blocks |
| `surface.sunken` | Segmented-control track, disabled field fill, calendar day cell | Cards |
| `surface.muted` | Small neutral badges: nav count, avatar initials | Large areas |
| `surface.inverse` | One emphasised element: "Berlangsung" chip, selected day, active tab pill | More than one or two items per view |

- Do: separate a panel from the canvas with `border.default`. Don't: stack panel-on-panel without a border.
- `overlay.scrim` is only the backdrop behind a Modal or Bottom Sheet (App Shell Overlay). Never use it to dim content in the page flow.

### Text
| Token | Use for | Don't use for |
|---|---|---|
| `text.primary` | Titles, body, values, table names | — |
| `text.secondary` | Supporting copy, field labels in dense tables, secondary cells | Primary headings |
| `text.muted` | Helper text, placeholders, meta (dates, "12 min ago"), column heads, icons. ≥ 12 px | Body paragraphs or anything the user must read to act |
| `text.disabled` | Disabled controls only (fails AA as text by design) | Placeholders, hints, "less important" copy |
| `text.inverse` | Text on `surface.inverse` | Any other surface |

### Borders
| Token | Use for | Don't use for |
|---|---|---|
| `border.default` | Panel, tile, card, alert edges; dividers between panels | Row separators inside tables |
| `border.subtle` | Row separators and hairlines inside a panel | Field outlines |
| `border.input` / `border.input-hover` | Text fields at rest / hover (Option A; GAP-06 accepted) | Containers |
| `border.control` / `border.control-hover` | Unchecked checkbox & radio outline (≥ 3:1) / its hover | Decorative lines |

### Action & focus
- `action.primary` — **one primary action per view region** (e.g. "Proyek baru"), the active nav item, checked checkbox, selected radio, switch on. Label always `action.on-primary`.
- `action.primary-hover` — hover/pressed state of the same element only.
- Same blue in light and dark (user decision). On dark, blue is **3.6:1** against the panel: fine for filled buttons/icons, **not** for small blue text → links on dark use `status.info.fg`.
- Don't use `action.primary` as decoration, large background fills, or for anything that isn't interactive.
- `focus.ring` (2 px) on **every** focusable element; never remove it. `focus.glow` is an optional halo, never a replacement.

### Accent (brand lime)
- `accent.highlight` — brand marker only: workspace mark, "today" dot/label, selected-day label. Content on it uses `accent.on-highlight`.
- `accent.soft` + `accent.soft-fg` — "active / in progress" states: current timeline event, *Pemotretan* stage chip, highlight alert.
- `progress.positive` — positive progress fills (e.g. 11 / 14 shoots confirmed).
- Don't: lime text on light surfaces (fails contrast); lime to mean "success/done" (that's green `status.success`).

### Status
| Status | Meaning | Examples |
|---|---|---|
| `status.success` | Completed / OK | *Terkirim*, payment recorded |
| `status.warning` | Needs attention soon | *Editing*, selection limit almost full, outstanding invoices |
| `status.danger` | Problem / blocked / destructive | *Menunggu DP*, Drive folder unreachable, field error |
| `status.info` | Neutral information / scheduled | *Dijadwalkan*, gallery sync running |
| `status.positive` | Metric trend up | "+12,4 %" delta |

- Use `.bg` + `.fg` of the **same** status together; `.border` only on alerts; `danger.solid` for error field borders and the notification badge, with `danger.on-solid` for its content.
- **Never rely on colour alone**: always add an icon or text label.
- Don't use status colours for categories, decoration, or brand.
- Stage chip mapping (fixed): Pemotretan → accent.soft · Dijadwalkan → info · Editing → warning · Menunggu DP → danger · Terkirim → success.

### Data
- `data.muted` / `data.current` only inside charts (sparkline history vs current bar). Not for UI.

---

## 3. Typography
| Style | Tokens | Use | Rule |
|---|---|---|---|
| display | 34 / bold / −1 / tight | Page greeting | Once per page |
| metric | 26 / bold / −0.6 | Numbers in metric tiles | Numbers only |
| title | 18 / bold / −0.4 | Panel & section titles | — |
| subtitle | 16 / bold | Card titles | — |
| body | 14 / medium | Default UI text, nav | Default |
| body-sm | 13 / regular | Table cells, secondary lines | — |
| label | 12 / semibold | Field labels, tabs, tile labels | — |
| caption | 11 / semibold | Chips, badges | Short labels only |
| overline | 10 / bold / +0.6 | Table column heads | UPPERCASE, ≤ 3 words |

- One family (`font.family.base`). Weights 400–700 only (no 800).
- Don't go below 12 px for sentences; 10–11 px only for chips and overlines.
- Money and times should use tabular figures (`DESIGN TOKEN GAP` until implemented in code).

## 4. Spacing, padding & gap

Visual version: `design-system.lib.pen` › board **08 — Spacing rules**.

### 4.1 Principles
| # | Rule |
|---|---|
| SP1 | **4 px base.** Every space is a `space.*` step (2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 28 · 32 · 36 · 40 · 48). Off-scale values (3, 5, 7, 9, 14, 18, 26 …) are snapped, never introduced. |
| SP2 | **Padding = inside a container, gap = between siblings.** Padding pushes content away from its own edge; gap separates children of the same parent. Don't fake one with the other. |
| SP3 | **Proximity: inside < between.** Space inside a group is always smaller than the space between groups (label→field 6 < field→field 16 < section→section 28). If two items belong together, they must be visibly closer to each other than to anything else. |
| SP4 | **Same relationship, same space.** Siblings of the same kind (tiles in a row, rows in a table, fields in a form) always share one gap value. |
| SP5 | **Component spacing is owned by the component.** Inside a library component, use its `component.*` padding/gap tokens; screens never override an instance's internal padding. |
| SP6 | **Half-steps (`space.0-5`, `1-5`, `2-5` = 2 / 6 / 10) only inside small components** (chips, badges incl. kbd, nav items, day cells, form label gaps, switch knob inset, alert title ↔ body, table cell avatar ↔ name, sheet item icon ↔ label). Layouts use whole steps. |
| SP7 | **No spacer elements, no margins.** Use the parent's `gap`/`padding`. The only allowed spacer is a flexible `fill_container` spacer that pushes content to an edge (e.g. sidebar footer). In code: `gap-*`, `p-*`, not `m-*` on children (ADR-010 Tailwind). |
| SP8 | **Don't stack spacing to invent a value** (e.g. padding 12 + gap 8 to fake 20 between two things). If you need 20, use `space.5` on one property. |
| SP9 | **Nesting: inner ≤ outer.** A child container's padding is ≤ its parent's padding (panel 28/40 › tile 16 › chip 2/8). Pair with radius: inner radius ≤ outer radius. |
| SP10 | **Density is per region, not per element.** Tables and sidebars are compact (squish insets); content areas are comfortable. Don't mix densities inside one panel. |
| SP11 | **Touch targets win over density on the client gallery**: ≥ 44 px hit area — grow padding, never the font. |

### 4.2 Inset types (padding)
| Type | Shape | Use | Shutrly tokens |
|---|---|---|---|
| **Square inset** | equal on all sides | Tiles, cards, alerts, panels, popovers | tile 16 (`metric.tile.padding`), alert 12, calendar-week card 24 |
| **Squish inset** | vertical ≈ ½ horizontal | Buttons, chips, inputs, nav items, table rows, tabs | button 12/36 (LG 16/48) — 3:1, chip 2/8, nav 8/12, table row 12/20, segmented item 8/16, input 0/12 at 40 px height, textarea 12/12 |
| **Layout inset** | large, horizontal ≥ vertical | App panel header/content | header x 28, content 28 / 40 (`panel.app.*`) |

Don't: squish insets on cards (cramped), square insets on buttons/chips (bloated).

### 4.3 Stack (vertical gap) ladder
| Space | Token | Relationship | Examples |
|---|---|---|---|
| 2 | `space.0-5` | Parts of one text unit | alert title ↔ body, name ↔ email |
| 4 | `space.1` | Tight sub-items | day ↔ date in calendar cell, nav items in a group |
| 6 | `space.1-5` | Label ↔ its control ↔ helper | form field anatomy (`input.gap`) |
| 8 | `space.2` | Related lines in a group | list items, heading ↔ subtitle |
| 12 | `space.3` | Parts of a card | metric tile head ↔ value, sidebar sections |
| 16 | `space.4` | Siblings of one kind | form fields, tiles in a grid |
| 24 | `space.6` | Separate groups / columns | timeline ↔ week card, card groups |
| 28 | `space.7` | Page sections inside the panel | greeting ↔ metrics ↔ today ↔ table (`panel.app.content.gap`) |
| 40–48 | `space.10`–`12` | Page-level separation | panel content side padding, documentation sections |

### 4.4 Inline (horizontal gap)
| Space | Token | Use |
|---|---|---|
| 2 | `space.0-5` | Rare (segmented moved to `space.1` on 2026-09-26) |
| 4 | `space.1` | Segmented items; stepper buttons ↔ value |
| 6 | `space.1-5` | Status dot ↔ chip label |
| 8 | `space.2` | Icon ↔ label in buttons/inputs; chips in a row; checkbox/radio ↔ label; switch label ↔ track |
| 10 | `space.2-5` | Nav icon ↔ label; avatar ↔ name |
| 12 | `space.3` | Toolbar controls (search ↔ bell ↔ avatar); alert icon ↔ text |
| 16 | `space.4` | Tiles in a row; form columns |
| 24 | `space.6` | Content columns (timeline ↔ week card) |

### 4.5 Layout map (Owner app, 1440)
| Area | Value | Token |
|---|---|---|
| Screen gutter around sidebar + panel | 12 | `space.3` |
| Sidebar padding / section gap | 8·12 / 12 | `space.2`·`space.3` / `space.3` |
| Panel header height / side padding | 72 / 28 | 18 × `space.1` / `panel.app.header.padding-x` |
| Panel content padding | 28 top · 40 sides | `panel.app.content.padding-y` / `-x` |
| Section gap inside content | 28 | `panel.app.content.gap` |
| Tile grid gap | 16 | `space.4` |
| Column gap | 24 | `space.6` |

**Centered narrow content (Owner approved 2026-09-26).** Within the 1096-wide Page Content container, center a 720-wide vertical content region (`size.content-narrow`) for single-column settings and forms. Keep text, fields, and actions aligned within that region; dividers and notices share the same width. The page remains top-aligned. Use the full container for tables, dashboards, and multi-column work areas. See [the layout pattern](layouts/centered-narrow-content.md).

**Alert (Owner approved 2026-09-26).** Place `Alert/<Tone>` inline beside the related content or action. It persists without a timer; the Close control is off by default and appears only for safely dismissible information. Use `component.alert.*` tokens and let the instance fill its content region. See [Alert](components/alert.md).

### 4.6 Optical exceptions
Allowed only inside a library component, max ±2 px, documented in the component spec (e.g. icon nudged to align with a text baseline). Never in screen layouts.

## 5. Radius
- `radius.full` buttons, chips, segmented, switch, stepper, avatar, badges · `radius.sm` inputs, nav items, icon buttons, menu items · `radius.md` tiles, alerts, menus · `radius.lg` app panel, modals, day cells · `radius.xs` checkbox, delta, kbd · `radius.2xs` chart bars · `radius.xl` bottom sheets (top corners only).
- Nested corners: inner radius ≤ outer radius.

## 6. Elevation
- Default is **flat**: in-flow panels/tiles/cards use `border.default`, no shadow.
- `elevation.1` only for floating layers (menus, popovers). Inline alerts have no shadow. `elevation.2` only for dialogs and sheets.
- Don't add shadows to cards in the page flow.

## 7. Opacity
- `opacity.disabled` for disabled controls only. `opacity.scrim` for modal backdrops (already baked into `overlay.scrim` — don't reapply it). `opacity.status-tint` is already baked into dark status backgrounds — don't reapply it.
- Don't lower text opacity to make it "lighter" (G7).

## 8. Accessibility (WCAG 2.1 AA, C-008)
- Text pairs ≥ 4.5 : 1, UI boundaries & icons ≥ 3 : 1 — see contrast badges on board 02.
- Known exceptions: `text.disabled` (disabled only); `border.input` ≈ 1.5 : 1 (GAP-06 accepted — field always has a visible label, 40 px height, 2 px focus/error borders).
- Status is never colour-only; focus ring is never removed; touch targets ≥ 44 px on the client gallery.

## 9. Workspace branding (deferred — GAP-03)
Only `action.primary` and `accent.highlight` are candidates for per-workspace override. Until the override rules and contrast guard are defined, don't hard-code a workspace colour anywhere.

---
Research basis: Atlassian (choose by meaning; don't match by appearance), Primer (base tokens never used directly; pair emphasis backgrounds with on-emphasis foregrounds; component tokens only when functional tokens don't fit), Carbon (never absolute values; role-based tokens + layering), Polaris (roles for status; replace hard-coded values). Spacing: Atlassian spacing (small / medium / large ranges; similarity, proximity, hierarchy, rhythm; don't separate related items), EightShapes "Space in Design Systems" (inset, squish, stretch, stack, inline, grid).
