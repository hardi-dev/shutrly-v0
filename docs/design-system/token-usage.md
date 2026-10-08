# Token usage rules — Shutrly / Studio Lime

Status: token set **PERSISTED 2026-09-28** · Rules v3: **APPROVED 2026-09-28** (Owner: "ya") · **Rules v3.1 amendment N1 · H1 · C1: APPROVED 2026-09-29** (Owner: "ok agree"; F-17) · **F-09 amendment `surface.inverse` media-viewer backdrop: APPROVED 2026-10-04** (Owner: "amandemen aturan surface.inverse aja") · **F-06 amendment `surface.panel-subtle` (table header): APPROVED 2026-10-02** (Owner chose option C · new token neutral 50 / 800; with the F-05 library merged: 597 tokens, checksum `d09d3751`) · **F-10 amendment `surface.on-media` (controls over photos): APPROVED 2026-10-05** (Owner: white / neutral.850 at 80%; 626 tokens, checksum `78563812`) · Previous rules: APPROVED 2026-09-26 (Owner: "approve") with the amendments recorded in git history · v3 amendment: neutral surface roles L1–L3, border roles B1–B2, text roles T1–T3, and the accepted contrast exceptions below · Source of values: [`tokens.json`](tokens.json) · Visual version: `design-system.lib.pen` › boards **07 — Usage rules** and **08 — Spacing rules**

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
| Role | Token | Use for | Don't use for |
|---|---|---|---|
| **L1 shell** | `surface.muted` | Desktop sidebar, mobile header, and segmented-control track | Cards, fields, or content regions |
| **L2 content** | `surface.canvas` | The app panel/content plane inside the shell | Shell chrome or individual cards |
| **L3 card** | `surface.panel` | Cards, tiles, menus, alerts, and elevated content blocks on the content plane | The whole shell or app content plane |
| — | `surface.subtle` | Quiet regions inside L2/L3: low-emphasis grouped zones, search field, modal/sheet footers | Primary content blocks |
| — | `surface.panel-subtle` *(F-06, 2026-10-02)* | A quiet zone inside an L3 card that must stay visibly different from the L2 canvas: the table header row | Anything outside a card; tinting whole cards |
| — | `surface.sunken` | Recessed controls: disabled field fill and calendar day cell | Cards or shell regions |
| — | `surface.on-media` *(F-10, 2026-10-05)* | Small controls laid over a photo, e.g. the pick-tile *Catatan* button; translucent (80 %) so the photo shows through while text stays readable. Text and icons on it: `text.primary` | Cards, panels or any control that is not over an image; large areas |
| — | `surface.inverse` | One emphasised element: "Berlangsung" chip, selected day, active tab pill. **Also** the full-screen backdrop of a media viewer (photo preview / lightbox), where it is the only surface in the view *(F-09 amendment, 2026-10-04)* | More than one or two items per view; any backdrop other than a full-screen media viewer |

- Do: preserve the order `surface.muted` → `surface.canvas` → `surface.panel`; skip a layer only when the missing level has no structural role.
- Do: separate an L3 card from L2 with `border.default` when their values do not create a visible edge. Don't: flatten every region onto `surface.panel`.
- `overlay.scrim` is only the backdrop behind a Modal or Bottom Sheet (App Shell Overlay). Never use it to dim content in the page flow.

### Text
| Token | Use for | Don't use for |
|---|---|---|
| `text.primary` | Titles, body, values, table names | — |
| `text.secondary` | Supporting copy, field labels, secondary cells, and **all small text in the shell** | Primary headings |
| `text.muted` | Non-essential helper text, placeholders, meta (dates, "12 min ago"), column heads, icons. ≥ 12 px | Shell labels, body paragraphs, or anything the user must read to act |
| `text.disabled` | Disabled controls only (fails AA as text by design) | Placeholders, hints, "less important" copy |
| `text.inverse` | Text on `surface.inverse` | Any other surface |

Text hierarchy is fixed: **T1 `text.primary`** for content, **T2 `text.secondary`** for supporting and shell text, **T3 `text.muted`** only for non-essential metadata. In the shell, use T2 even at small sizes because T3 does not meet 4.5:1 on every v3 shell/canvas pairing.

### Borders
| Token | Use for | Don't use for |
|---|---|---|
| `border.default` | **B1** card, tile, and alert edges; standard separators between content regions | Row separators inside dense tables |
| `border.subtle` | **B1** row separators and quiet hairlines inside L2/L3 | Field outlines or the app-panel edge |
| `border.input` / `border.input-hover` | **B2** fields at rest / hover; `border.input` also defines the app-panel edge and sidebar divider | Ordinary card edges or table rows |
| `border.control` / `border.control-hover` | Unchecked checkbox & radio outline (≥ 3:1) / its hover | Decorative lines |

Use B2 deliberately where the shell/content boundary must remain visible in both modes. Its low-contrast resting value is an accepted exception; focus, error, selection, and hover states still use their dedicated stronger tokens.

### Action & focus
- `action.primary` — **one primary action per view region** (e.g. "Proyek baru"), checked checkbox, selected radio, and switch on. Label always `action.on-primary`. Active navigation follows N1.
- **N1 — Active navigation (v3.1, F-17):**
  - The active Nav Item and Nav Rail Item use an `action.primary` pill, with the icon and label in `action.on-primary` and the label in `font.weight.semibold`. This is the one allowed use of `action.primary` outside an action, an exception to *one primary per region*.
  - **Hover** uses the former active pill: `surface.panel`, `text.primary`, and an `accent.soft-fg` icon.
  - Never style hover like active.
  - The Bottom Nav keeps `bottom-nav.item.active`.
  - Tokens (on promotion): `nav.item.background-active` → `action.primary`; `nav.item.text-active` / `icon-active` → `action.on-primary`; `nav.item.background-hover` → `surface.panel`.
- **C1 — Selected list item (v3.1, F-17):** a selected Menu Item or Sheet Item has a `semibold` label and a check in `action.primary`. For sheets this is `component.sheet.item.check` → `action.primary`, added on promotion. Don't use `text.secondary` for the check; it is too quiet and differs from Menu.
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
| heading *(v3.1, H1)* | 26 / bold / −0.6 / tight | Page title (`<h1>`) on compact (phone) layouts: the Mobile Header | Once per page; desktop uses display. Tokens `font.size.heading`, `font.letter-spacing.heading` (added on promotion) |
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

## Local explorer

Run `pnpm storybook` to inspect implemented components and the token gallery locally. Storybook
reads the real React components and the canonical `docs/design-system/tokens.json`; it is an
exploration surface, not a replacement for these usage rules or component specs.

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
- Known exceptions: `text.disabled` (disabled only); `border.input` is **1.37:1 light / 1.81:1 dark** (expanded GAP-06 — accepted for field outlines, the app-panel edge, and the sidebar divider; fields retain a visible label, 40 px height, and 2 px focus/error borders); `text.muted` in light mode is below 4.5:1 on `surface.canvas` and `surface.muted`, so it is limited to non-essential metadata and never used for small shell text.
- **N1 dark mode (v3.1, accepted exception):** the active `action.primary` pill against the dark Sidebar (`surface.muted`) is **2.02:1**, below the 3:1 of SC 1.4.11 (light is 4.08:1). It is accepted with these mitigations:
  - the state is not conveyed by fill alone: the label becomes `semibold`, and the icon changes from `text.muted` to `action.on-primary`;
  - the link carries `aria-current="page"`.

  Label and icon on the pill are 5.17:1 in both modes. The C1 check `action.primary` on `surface.panel` is 5.17:1 light and 3.18:1 dark (≥ 3:1 for icons).
- Status is never colour-only; focus ring is never removed; touch targets ≥ 44 px on the client gallery.

## 9. Workspace branding (deferred — GAP-03)
Only `action.primary` and `accent.highlight` are candidates for per-workspace override. Until the override rules and contrast guard are defined, don't hard-code a workspace colour anywhere.

---
Research basis: [Atlassian design tokens](https://atlassian.design/foundations/design-tokens) (choose by meaning, not visual match), [Primer colour usage](https://primer.style/product/getting-started/foundations/color-usage/) (base tokens never direct; functional and component layers), and [Carbon colour layering](https://carbondesignsystem.com/elements/color/usage/) (ordered neutral layers with role-stable tokens). Spacing basis remains Atlassian spacing and EightShapes “Space in Design Systems”. v3.1 amendment (2026-09-29): [Primer NavList](https://primer.style/product/components/nav-list/) (`aria-current="page"` marks the current item) and [WCAG 2.1 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) (3:1 for state indicators and icons).

### F-17 validation amendment (2026-09-29)

- **Muted text on muted surfaces:** `text.muted` must not carry text on `surface.muted` (3.8:1). Use `text.secondary`. `component.nav.group-label` now aliases `text.secondary`; tokens 531, checksum `ee680c2a`.
