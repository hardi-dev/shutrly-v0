# Component: `Section Card`

## Status and approval

- Lifecycle: `APPROVED` 2026-10-01. Owner: "create that form layout pattern to design-system.lib.pen as new component", then "make the slot … versatile" → renamed from *Form Section* the same day.
- Pencil library: `design-system.lib.pen` › **C43 — Section card** (`d8Dpw`)
- Evidence: approved F-02 Settings v3 frames in `docs/features/workspace/workspace.pen` (desktop `EjWRU`, mobile `NurYs`)

## Purpose

A titled card that groups one kind of related content on a page, under a title and a one-line description. The content can be form fields, a List Card, a Table, toggles or an Empty State. On settings and edit pages, stack cards in the [centered narrow content](../layouts/centered-narrow-content.md) column. On list or table pages, they use the full container.

## Anatomy (`_SectionCard/Base` `qWBIt`, private)

| Part | Layer | Contract |
|---|---|---|
| Root | `qWBIt` | Vertical, flat (no elevation). Fill `section-card.background` (L3 `surface.panel`), 1 px `section-card.border`, radius `section-card.radius`. The consumer sets the width. |
| Header | `P6BlE` | **Boolean, on by default.** Horizontal, `alignItems: center`. Padding `header.padding-y` / `header.padding-x` (20 / 24); gap `header.actions-gap` (16) between Heading and Actions; 1 px bottom `header.border` (`border.subtle`). |
| Heading | `KVDyd` | Vertical, fills the width; gap `header.gap` (4) between Title and Description. |
| Title | `BXWnC` | Subtitle 16 / bold, `section-card.title`. Renders as the section heading (`<h2>` under the page `<h1>`). |
| Description | `nHCW8` | Body-sm 13 / regular, `section-card.description`. One concise sentence. |
| Actions | `QcKHK` | **Slot**, on the right of the header, empty by default; gap `space.2`. Holds at most one control: Segmented Control (view tabs) or one Secondary / Icon / Action Menu button. |
| Content | `DElnV` | **Slot.** Vertical, padding `content.padding` (24), gap `content.gap` (16) between siblings (SP4). |

The Content slot accepts:
- Text Field, Textarea and Select (all states), plus horizontal field rows;
- Table Header Row and Table Rows, edge to edge (not the whole Table card);
- List Card Item rows, in the Flush variants (not the whole List Card);
- Empty State;
- Alert;
- Metric Tile;
- Segmented Control;
- Switch, Checkbox and Radio.

To fill it: `Replace(instance+'/DElnV', {type:'frame', name:'Content', width:'fill_container', layout:'vertical', gap:'$component/section-card/content/gap', padding:'$component/section-card/content/padding'})`, then insert the content. Use the `compact.content.padding` token on Compact.

## Variants

| Variant | ID | Use | Insets |
|---|---|---|---|
| Default | `rHONT` | Desktop and tablet | Header 20 / 24; content 24 |
| Compact | `lYGAJ` | Phone (< 768 px) | Header `compact.header.padding-y` / `-x` (12 / 16); content `compact.content.padding` (16) |
| Default/Flush | `G8WO8q` | Desktop and tablet lists (e.g. *Template pesan*) | Header 20 / 24; content `flush.padding-y` / `flush.padding-x` (4 / 12), so row content (12 inset) aligns with the title at 24 |
| Compact/Flush | `Q82mo` | Phone lists | Compact header; content `flush.padding-y` / `compact.flush.padding-x` (4 / 4), so rows align at 16 |
| Default/No header | `B19wQC` | Desktop and tablet, when the page heading already names the content | No header; content 24 |
| Compact/No header | `uBGFy` | Phone, same case | No header; content `compact.content.padding` (16) |

**Flush** content holds List Card Item/Default rows with a final /Last row **directly**, with no gap; each row's bottom border separates it from the next. Don't nest a whole List Card inside a Section Card.

**Table content** sits edge to edge, with zero content padding. Fill Content with a Table Header Row (`oOFk7`) and Table Row instances (`r7YZY`, …), not the whole Table (C27), which is already a card with its own toolbar and border.

- **Filter tabs:** put the Segmented Control in the header **Actions** slot, not in a row above the table.
- **Alignment:** row cells keep `table.row.padding-x` (20), 4 px inside the title's 24. This is accepted, because rows stay full-bleed so their dividers and hover span the card.
- **Examples** on the board: `I81ygA` (Table), `LcKBl` (header actions: Segmented Control + Table) and `KwkAv` (header off). Full-width pages use the full container instead of the 720 column.

## Rules

- Stack cards in one column, using `panel.app.content.gap` (28) on desktop and tablet and `space.6` (24) on phones. Don't nest Section Cards.
- Header Actions holds at most one control. Use a Segmented Control only to switch the view of this card's Content (tabs); page-level primary actions belong in the Page Header.
- Use a /No header variant only when the page heading already names the content (e.g. a single table on a list page). The card keeps its border and Content insets.
- Put one kind of content in each card. Lists use a Flush variant. For a bare list of destinations with no heading, use List Card (C42) on its own. Group (C41) is for an overline title with no card.
- Page actions, such as *Simpan perubahan*, stay **outside** the cards: trailing inside the column on desktop, and full width (Button LG) on phones. Inline alerts about the whole page (Alert/Danger) sit above the first card. Toast feedback uses the shell's toast layer.
- On desktop, two short related fields may share a horizontal row inside Content, `space.4` (16) apart. On phones every field is full width.
- Pick Default or Compact. Never override an instance's header or content insets (SP5).

## Accessibility

- Render each card as `<section aria-labelledby>` pointing to its Title (`<h2>`). The Description may be referenced with `aria-describedby`.
- A Segmented Control in Actions acts as tabs for the Content (`role=tablist`, `aria-controls` the Content region).
- With the header off, name the section with `aria-label`, or rely on the page heading when it's the only section.
- The content components keep their own semantics (labels, errors, list roles, focus).

## Implementation references

- Code: `src/ui/patterns/section-card/` — `SectionCard` with `title`, `description`, `actions`, `content` (`padded` · `flush` · `bleed` for table rows) and `aria-label` (no header). Compact insets apply below `md` (768 px), Default from `md` up.

- Tokens: `component.section-card.*`, 18 tokens: background, border, radius, header.{padding-x, padding-y, gap, border, actions-gap}, title, description, content.{padding, gap}, flush.{padding-x, padding-y}, compact.header.{padding-x, padding-y}, compact.content.padding and compact.flush.padding-x. Total 549 tokens, checksum `373a3591`.
- Consumers: F-02 Workspace settings (`docs/features/workspace/design.md` › Settings v3).
- Gap: the width is a literal in Pencil (720 / 358). The code uses `width: 100%` inside its column (`size.content-narrow` for settings).
