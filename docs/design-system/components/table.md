# Component: `Table` (+ `Table Cell`, `Table Header Cell`, `Table Header Row`, `Table Row`)

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 3, Owner review)
- Direction/token approval: `APPROVED`. 11 `table.*` tokens were added on 2026-09-26 (Owner: "approve all"). SP6 was amended so the table cell avatar ↔ name gap (10) is allowed.
- Pencil library: `design-system.lib.pen` › **C27 — Table** (`zWcpb`)
- Evidence: legacy Frame 2 › Production Table (Booking & Produksi)

## Purpose

A React Aria data grid for column headers and rows in dashboard lists and list pages. It is built from parts, so a screen can compose any set of columns. **Table is not a card and does not own a title, summary, search/filter control, footer, or empty state.**

For a titled list page, compose Table inside `SectionCard` with `content="bleed"`: `SectionCard` owns the title, description/count, and one header action such as search or a segmented filter. The consumer composes `EmptyState` when there are no records and any paging/count control after the table. This supersedes the earlier Table-card wording in this document.

## Parts

| Component | ID | Structure |
|---|---|---|
| `_TableCell/Base` (private) | `Nm9LJ` | gap `table.cell.gap` (10); optional layers: `Avatar` `cTnMA` (Avatar MD), `Text` `qlRSm` (`Primary` `Q4FlPn`, body-sm, `table.cell.text`; `Secondary` `m3GsQx`, label, `text.muted`), `Stage` `T67o9d` (Stage chip), `Actions` `EUP7g` (Action Menu/SM/Closed) |
| `Table Cell/Text` | `f0oyj` | Primary text |
| `Table Cell/Strong` | `f7pbaS` | Primary in `table.cell.text-strong`, semibold (the value column) |
| `Table Cell/Client` | `lVDvO` | Avatar + strong name; `Secondary` is optional (email or phone) |
| `Table Cell/Stage` | `rS9BY` | Stage chip. Swap the stage with `Replace(<cell>/T67o9d, {type:"ref", ref:<Stage Chip/…>, name:"Stage", enabled:true})` |
| `Table Cell/Actions` | `C1MRI` | Action menu SM, width 32, aligned right |
| `Table Header Cell` | `T3MFWw` | overline in `table.header.text`; text `Label` `t55nF` |
| `Table Header Row` | `oOFk7` | `table.header.background` (→ `surface.panel-subtle` since 2026-10-02, F-06; was `surface.subtle`, which equals the canvas); `table.header.border` top and bottom; padding 8/20; slot `Cells` `mxhia` |
| `_TableRow/Base` (private) | `Y1wn7` | padding 12/20 (`table.row.padding-*`); bottom border `table.row.border`; slot `Cells` `GoLkn` |
| `Table Row/Default` · `/Hover` | `r7YZY` · `XlPZD` | Hover uses `table.row.background-hover` (clickable rows only) |
| `Table` | `FCsTI` | The full-width table content: header row and rows only. It has no outer card chrome or toolbar. |

## Composition

| Concern | Owner | Contents |
|---|---|---|
| `SectionCard` | Card, heading, description/count, and one action | Use `content="bleed"` for table rows. Put search and a segmented filter in the header `actions` slot. |
| `Table` | Header and rows | A Table Header Row followed by Table Row variants. The last row has no bottom border. |
| Consumer | Empty, paging, and external count/link | Render the shared `EmptyState` instead of Table when there are no records. Render paging/count controls outside Table, in the page composition. |

**Columns.** Widths live on the cell instances and are identical in the header and every row. One column is `fill_container`; the others are fixed. The legacy set is Klien fill · Jenis 130 · Tanggal 120 · Tahap 130 · Nilai 110 · Aksi 32.

**Filling a row:**

```js
const r = Insert(rows, {type:"ref", ref:"r7YZY", width:"fill_container"})
const c = Replace(r+"/GoLkn", {type:"frame", name:"Cells", width:"fill_container", alignItems:"center"})
Insert(c, {type:"ref", ref:"lVDvO", width:"fill_container", descendants:{Q4FlPn:{content:"Rina & Adi"}, "cTnMA/DloPs":{content:"RA"}}})
```

## States (added 2026-09-26)

| Component | ID | Use |
|---|---|---|
| `Table Header Cell/Sorted` | `UD38Q` | The sorted column: label in `table.header.text-sorted` plus a 12 px chevron (down = descending; swap to `chevron-up` for ascending). Code: `aria-sort`. |
| `Table Header Cell/Select` | `h0RSa` | 32 wide, select-all Checkbox (swap to Checked or Mixed). |
| `Table Cell/Select` · `/Selected` | `xbQwc` · `whHzE` | 32 wide, a row Checkbox, unchecked or checked. |
| `Table Row/Selected` | `bd9LK` | `table.row.background-selected` (`status.info.bg`); pair it with `Table Cell/Selected`. Code: `aria-selected`. |
| `Table Row/Skeleton` | `eFemy` | Loading placeholder: avatar circle and bars in `table.skeleton` on `table.background`. Show 3–5 rows; the table gets `aria-busy`. |
| `Table Empty State` | `w0HQb` | Historical Pencil reference only. In code, compose the shared `EmptyState` in the parent `SectionCard`; do not add an empty-state slot to Table. |

The header cell and cell bases carry an optional `Checkbox` layer (last child, off). **Never move a newly inserted layer inside these masters**: that corrupted the existing Table instances on 2026-09-26, so Pen couldn't save.

The master's sample rows use a plain 130 frame holding a Stage Chip for the *Tahap* column, because Pencil can't swap the chip inside a cell nested in a master. In screens, use `Table Cell/Stage` and `Replace(<cell>/T67o9d, …)` on a top-level instance.

## Decisions and snaps

- Filter: the legacy dark inverse pills are replaced by the **Segmented control** (Owner, 2026-09-26), so the app has one filter pattern. Place it in the `SectionCard` header action slot.
- Avatar 30 → Avatar MD 32. The legacy stage chip padding 3/9 becomes the approved chip values.

## Accessibility

- A native `<table>` with `<th scope=col>`. The overline header style is visual only.
- Clickable rows: the client name is the link (one Tab stop per row); the Action menu has its own `aria-label`.
- Stage chips have text and a dot, never colour alone. Money uses tabular figures in code (`DESIGN TOKEN GAP`).
- If a consumer shows a changed filtered count, it announces that count with `aria-live=polite` outside Table.

## Gaps

- No pagination (GAP-02).
- C27's former card, toolbar, and footer tokens remain legacy design tokens; new consumers compose these concerns through `SectionCard` and page patterns.

## Implementation references

- Pencil: `C27 — Table` (`zWcpb`)
- Code: `src/ui/patterns/data-table/` uses React Aria `Table`, `TableHeader`, `TableBody`, `Row`, `Column`, and `Cell`; it exposes only grid semantics, columns, rows, and the loading skeleton.
- Composition: `SectionCard` (`C43`) owns card chrome and page-facing content; `EmptyState` is composed by the consumer.
- Rules: token-usage.md G3, SP4, SP6 (amended), SP10, §2 *Status*, §3, §6, §8
