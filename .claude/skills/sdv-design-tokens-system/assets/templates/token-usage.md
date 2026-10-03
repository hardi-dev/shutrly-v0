# Token usage rules — `<System name>` / `<Direction name>`

Status: token set `APPROVED <date>` · Rules: `PROPOSED` — awaiting explicit approval (`APPROVED <date>` only after the user says so) · Source of values: [`tokens.json`](tokens.json) · Visual version: `design-system.lib.pen` › boards **07 — Usage rules** and **08 — Spacing rules**

These rules say *which* token to reach for, *when*, and what never to do. They apply to Pencil library components, feature designs (`/sdv:design-feature`), and application code (`/sdv:build-feature`, `/sdv:verify-feature`). Replace every `<placeholder>` and example with project facts; delete rows for roles the project does not have instead of leaving them generic.

> Template note: the examples below use the fictional **Forma** demo (stone neutrals, forest action green, sun accent). Regenerate this file from the project's `tokens.json` during `/sdv:design-rules`; keep the section structure and IDs (G1–G8, SP1–SP11) stable so boards 07/08 and reports can cite them.

---

## 1. Global rules

| # | Rule | Why |
|---|---|---|
| G1 | **Choose a token by meaning, not by how it looks.** If a colour "happens to match", it is the wrong token. | Values change per mode and per brand; meaning doesn't. |
| G2 | **Never use `color.primitive.*` (including `alpha.*`) in a design, component or code.** Primitives only feed semantic tokens. | Primitives don't switch with dark mode and can't be re-themed. |
| G3 | **Components bind `component.*` tokens; screens and layouts bind `color.semantic.*`, `space.*`, `radius.*`.** If a component token exists, use it instead of the semantic one it aliases. | Lets a component change without touching every screen. |
| G4 | **No hard-coded values.** No hex, rgba, or px outside the scale. If nothing fits, report `DESIGN TOKEN GAP` — don't invent a value. | Hard-coded values are invisible to theming, verification and code sync. |
| G5 | **Always pair a foreground with its own background** (`*.fg` on its `*.bg`, `on-*` on its surface). Check both modes. | Pairs are contrast-checked together; mixing breaks AA. |
| G6 | **Never put a mode in a token name** (`dark-surface`, `text-light`). Use the `mode` theme axis. | One name, two values — the theme picks. |
| G7 | **Don't use opacity to create colour variants.** Use `text.secondary` / `text.muted`, not text at 50 %. | Opacity changes with what's underneath; tokens are contrast-checked. |
| G8 | **Changes go through the pipeline**: edit `tokens.json` → `validate_tokens.py` → `tokens_to_pencil.py` → Pencil variables → token canvas refresh → `/sdv:verify-design-system`. Renames/removals need a replacement note. | Keeps design, JSON and code in lock-step. |

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
| `surface.canvas` | App background behind panels | Anything inside a panel |
| `surface.panel` | App panel, cards, tiles, inputs, toasts, menus | Page background |
| `surface.subtle` | Quiet zones inside a panel: table header, search field | Primary content blocks |
| `surface.sunken` | Segmented-control track, disabled field fill, calendar day cell | Cards |
| `surface.muted` | Small neutral badges: nav count, avatar initials | Large areas |
| `surface.inverse` | One emphasised element: selected day, active pill | More than one or two items per view |

- Do: separate a panel from the canvas with `border.default`. Don't: stack panel-on-panel without a border.

### Text
| Token | Use for | Don't use for |
|---|---|---|
| `text.primary` | Titles, body, values | — |
| `text.secondary` | Supporting copy, labels in dense tables, secondary cells | Primary headings |
| `text.muted` | Helper text, placeholders, meta (dates, "12 min ago"), column heads, icons. ≥ 12 px | Body paragraphs or anything the user must read to act |
| `text.disabled` | Disabled controls only (fails AA as text by design) | Placeholders, hints, "less important" copy |
| `text.inverse` | Text on `surface.inverse` | Any other surface |

### Borders
| Token | Use for | Don't use for |
|---|---|---|
| `border.default` | Panel, tile, card, toast edges; dividers between panels | Row separators inside tables |
| `border.subtle` | Row separators and hairlines inside a panel | Field outlines |
| `border.input` | Text fields at rest (record the contrast; if < 3:1 it is an accepted gap with mitigations, see §8) | Containers |
| `border.control` | Unchecked checkbox & radio outline (≥ 3:1) | Decorative lines |

### Action & focus
- `action.primary` — **one primary action per view region** (e.g. "New project"), the active nav item, checked checkbox, selected radio, switch on. Label always `action.on-primary`.
- `action.primary-hover` — hover/pressed state of the same element only.
- Record the per-mode contrast of `action.primary` against the panel. If it is < 4.5:1 in a mode, it may be used for filled controls and icons but **not** small text in that mode → links use `status.info.fg`.
- Don't use `action.primary` as decoration, large background fills, or for anything that isn't interactive.
- `focus.ring` (2 px) on **every** focusable element; never remove it. `focus.glow` is an optional halo, never a replacement.

### Accent (brand)
- `accent.highlight` — brand marker only: workspace mark, "today" dot, selected-day label. Content on it uses `accent.on-highlight`; on `surface.inverse` use `accent.on-inverse`.
- `accent.soft` + `accent.soft-fg` — "active / in progress" states.
- Don't: accent text on light surfaces (record the ratio, e.g. Forma sun on white ≈ 1.5:1); accent to mean "success/done" (that's `status.success`).

### Status
| Status | Meaning | Examples (`<replace with product examples>`) |
|---|---|---|
| `status.success` | Completed / OK | Delivered, payment recorded |
| `status.warning` | Needs attention soon | In review, quota almost full |
| `status.danger` | Problem / blocked / destructive | Payment overdue, folder unreachable, field error |
| `status.info` | Neutral information / scheduled | Scheduled, sync running |

- Use `.bg` + `.fg` of the **same** status together; `danger.solid` for error field borders and notification badges.
- **Never rely on colour alone**: always add an icon or text label.
- Don't use status colours for categories, decoration, or brand.
- Domain state → status mapping (fixed, product-specific): `<state> → <status>` …

### Data
- `data.muted` / `data.current` only inside charts. Not for UI.

---

## 3. Typography
| Style | Tokens (size / weight / tracking / line-height) | Use | Rule |
|---|---|---|---|
| display | `font.size.display` / bold / `letter-spacing.display` / `line-height.tight` | Page greeting, hero | Once per page |
| metric | `font.size.metric` / bold / `letter-spacing.metric` | Numbers in metric tiles | Numbers only |
| title | `font.size.title` / bold / `letter-spacing.title` | Panel & section titles | — |
| subtitle | `font.size.subtitle` / bold | Card titles | — |
| body | `font.size.body` / medium / `line-height.body` | Default UI text, nav | Default |
| body-sm | `font.size.body-sm` / regular | Table cells, secondary lines | — |
| label | `font.size.label` / semibold | Field labels, tabs, tile labels | — |
| caption | `font.size.caption` / semibold | Chips, badges | Short labels only |
| overline | `font.size.overline` / bold / `letter-spacing.overline` | Table column heads | UPPERCASE, ≤ 3 words |

- One family (`font.family.base`) unless the approved direction says otherwise. Only the approved weights.
- Don't go below 12 px for sentences; 10–11 px only for chips and overlines.
- Composite text styles are not Pencil variables: bind size, weight, tracking and line-height separately.

## 4. Spacing, padding & gap

Visual version: `design-system.lib.pen` › board **08 — Spacing rules**.

### 4.1 Principles
| # | Rule |
|---|---|
| SP1 | **`<4>` px base.** Every space is a `space.*` step (`<list the scale>`). Off-scale values are snapped, never introduced. |
| SP2 | **Padding = inside a container, gap = between siblings.** Don't fake one with the other. |
| SP3 | **Proximity: inside < between.** Space inside a group is always smaller than the space between groups (e.g. label→field 6 < field→field 16 < section→section 28). |
| SP4 | **Same relationship, same space.** Siblings of the same kind (tiles in a row, rows in a table, fields in a form) always share one gap value. |
| SP5 | **Component spacing is owned by the component.** Inside a library component, use its `component.*` padding/gap tokens; screens never override an instance's internal padding. |
| SP6 | **Half-steps (e.g. `space.0-5`, `1-5`, `2-5`) only inside small components** (chips, badges, nav items, day cells, form label gaps). Layouts use whole steps. |
| SP7 | **No spacer elements, no margins.** Use the parent's `gap`/`padding`. The only allowed spacer is a flexible `fill_container` spacer that pushes content to an edge. In code: `gap-*`, `p-*`, not `m-*` on children. |
| SP8 | **Don't stack spacing to invent a value** (e.g. padding 12 + gap 8 to fake 20). Use the single step you need. |
| SP9 | **Nesting: inner ≤ outer.** A child container's padding is ≤ its parent's padding. Pair with radius: inner radius ≤ outer radius. |
| SP10 | **Density is per region, not per element.** Tables and sidebars are compact (squish insets); content areas are comfortable. |
| SP11 | **Touch targets win over density** where touch is primary: ≥ 44 px hit area — grow padding, never the font. `<name the surfaces>` |

### 4.2 Inset types (padding)
| Type | Shape | Use | Project tokens |
|---|---|---|---|
| **Square inset** | equal on all sides | Tiles, cards, toasts, panels, popovers | `metric.tile.padding`, `toast.padding-*` |
| **Squish inset** | vertical ≈ ½ horizontal | Buttons, chips, inputs, nav items, table rows, tabs | `button.md.padding-*`, `chip.padding-*`, `nav.item.padding-*`, `table.row.padding-*`, `segmented.item.padding-*`, `input.padding-x` |
| **Layout inset** | large, horizontal ≥ vertical | App panel header/content | `panel.app.*` |

Don't: squish insets on cards (cramped), square insets on buttons/chips (bloated).

### 4.3 Stack (vertical gap) ladder
| Space | Token | Relationship | Examples |
|---|---|---|---|
| 2 | `space.0-5` | Parts of one text unit | toast title ↔ body |
| 4 | `space.1` | Tight sub-items | day ↔ date in a calendar cell |
| 6 | `space.1-5` | Label ↔ its control ↔ helper | form field anatomy (`input.gap`) |
| 8 | `space.2` | Related lines in a group | list items, heading ↔ subtitle |
| 12 | `space.3` | Parts of a card | tile head ↔ value |
| 16 | `space.4` | Siblings of one kind | form fields, tiles in a grid |
| 24 | `space.6` | Separate groups / columns | card groups |
| 28 | `space.7` | Page sections inside the panel | `panel.app.content.gap` |
| 40–48 | `space.10`–`12` | Page-level separation | panel content side padding |

### 4.4 Inline (horizontal gap)
| Space | Token | Use |
|---|---|---|
| 2 | `space.0-5` | Segmented items |
| 6 | `space.1-5` | Status dot ↔ chip label |
| 8 | `space.2` | Icon ↔ label in buttons/inputs; chips in a row |
| 10 | `space.2-5` | Nav icon ↔ label; avatar ↔ name; checkbox ↔ label |
| 12 | `space.3` | Toolbar controls; toast icon ↔ text |
| 16 | `space.4` | Tiles in a row; form columns |
| 24 | `space.6` | Content columns |

### 4.5 Layout map (`<primary screen>`, `<width>`)
| Area | Value | Token |
|---|---|---|
| Screen gutter | `<n>` | `space.<k>` |
| Sidebar padding / section gap | `<n>` | `space.<k>` |
| Panel header height / side padding | `<n>` / `<n>` | documented height / `panel.app.header.padding-x` |
| Panel content padding | `<y>` · `<x>` | `panel.app.content.padding-y` / `-x` |
| Section gap inside content | `<n>` | `panel.app.content.gap` |
| Tile grid gap | `<n>` | `space.<k>` |
| Column gap | `<n>` | `space.<k>` |

### 4.6 Optical exceptions
Allowed only inside a library component, max ±2 px, documented in the component spec (e.g. icon nudged to align with a text baseline). Never in screen layouts.

## 5. Radius
- `<radius.token>` → `<components>` for each step (e.g. `radius.full` chips, segmented, switch · `radius.sm` buttons, inputs, nav items · `radius.md` tiles, toasts · `radius.lg` app panel, day cells · `radius.xs` checkbox, delta · `radius.2xs` chart bars · `radius.xl` sheets).
- Nested corners: inner radius ≤ outer radius.

## 6. Elevation
- Default is **flat**: in-flow panels/tiles/cards use `border.default`, no shadow.
- `elevation.1` only for floating layers (menus, popovers, toasts). `elevation.2` only for dialogs and sheets.
- Don't add shadows to cards in the page flow.

## 7. Opacity
- `opacity.disabled` for disabled controls only. `opacity.scrim` for modal backdrops. Tints for dark status fills are alpha primitives, not opacity.
- Don't lower text opacity to make it "lighter" (G7).
- Pencil stores opacity variables as percent; literal node opacity is 0–1.

## 8. Accessibility (WCAG 2.1 AA)
- Text pairs ≥ 4.5 : 1, UI boundaries & icons ≥ 3 : 1 — see contrast badges on board 02.
- Known exceptions (accepted gaps with mitigations, as recorded in the decision record): `text.disabled` (disabled only); `<e.g. border.input ≈ n:1 — mitigated by visible label, 40 px height, 2 px focus/error borders>`.
- Status is never colour-only; focus ring is never removed; touch targets ≥ 44 px where touch is primary.

## 9. Branding / overrides
Name the tokens that may be overridden per brand or workspace (typically only `action.primary` and `accent.highlight`) and the contrast guard they must pass. Until defined, record `DESIGN TOKEN GAP` and don't hard-code a brand colour anywhere.

---
Research basis (cite the sources actually consulted in this project's research pass): Atlassian (choose by meaning; don't match by appearance), Primer (base tokens never used directly; pair emphasis backgrounds with on-emphasis foregrounds; component tokens only when functional tokens don't fit), Carbon (never absolute values; role-based tokens + layering), Polaris (roles for status; replace hard-coded values). Spacing: Atlassian spacing (small / medium / large ranges; similarity, proximity, hierarchy, rhythm; don't separate related items), EightShapes "Space in Design Systems" (inset, squish, stretch, stack, inline, grid).
