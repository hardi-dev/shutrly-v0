# Component: `Table` (+ `Table Cell`, `Table Header Cell`, `Table Header Row`, `Table Row`)

## Status and approval

- Lifecycle: `PROPOSED` (tier 3, 2026-09-26)
- Direction/token approval: `APPROVED`. 11 `table.*` tokens were added on 2026-09-26 (Owner: "approve all"). SP6 was amended so the table cell avatar ↔ name gap (10) is allowed.
- Pencil library: `design-system.lib.pen` › **C27 — Table** (`zWcpb`)
- Evidence: legacy Frame 2 › Production Table (Booking & Produksi)

## Purpose

A data table presented as a card, used for dashboard lists and list pages. It's built from parts, so a screen can compose any set of columns.

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
| `Table Header Row` | `oOFk7` | `table.header.background`; `table.header.border` top and bottom; padding 8/20; slot `Cells` `mxhia` |
| `_TableRow/Base` (private) | `Y1wn7` | padding 12/20 (`table.row.padding-*`); bottom border `table.row.border`; slot `Cells` `GoLkn` |
| `Table Row/Default` · `/Hover` | `r7YZY` · `XlPZD` | Hover uses `table.row.background-hover` (clickable rows only) |
| `Table` | `FCsTI` | The card: `table.background`, 1 px `table.border`, `table.radius` (16), clipped. It holds the Toolbar, Header, Rows and Footer, described below. |

The Table card's parts:

| Part | Padding | Contents |
|---|---|---|
| Toolbar | 16/20 | `Title` `ycT8w` (subtitle 16/700), `Subtitle` `aIKsB` (label, muted), and `Filter` `YTJjx` (a Segmented control). Subtitle and Filter are booleans. |
| Header | — | A Table Header Row. |
| Rows | — | Slot `cYo5t` of Table Row variants. The last row sets `strokeWidth:{bottom:0}`. |
| Footer | 12/20, top border `table.border` | `Count` `X0Kcc` (label, muted) and `Link` `QTddd` (label 600, `table.footer.link`). Link is a boolean. |

**Columns.** Widths live on the cell instances and are identical in the header and every row. One column is `fill_container`; the others are fixed. The legacy set is Klien fill · Jenis 130 · Tanggal 120 · Tahap 130 · Nilai 110 · Aksi 32.

**Filling a row:**

```js
const r = Insert(rows, {type:"ref", ref:"r7YZY", width:"fill_container"})
const c = Replace(r+"/GoLkn", {type:"frame", name:"Cells", width:"fill_container", alignItems:"center"})
Insert(c, {type:"ref", ref:"lVDvO", width:"fill_container", descendants:{Q4FlPn:{content:"Rina & Adi"}, "cTnMA/DloPs":{content:"RA"}}})
```

## Decisions and snaps

- Filter: the legacy dark inverse pills are replaced by the **Segmented control** (Owner, 2026-09-26), so the app has one filter pattern.
- Footer padding 14 → 12, the same as the rows (SP4). Avatar 30 → Avatar MD 32. The legacy stage chip padding 3/9 becomes the approved chip values.
- Footer link: `action.primary` in light mode, `status.info.fg` in dark mode (§2: small blue text fails on dark).

## Accessibility

- A native `<table>` with `<th scope=col>`. The overline header style is visual only.
- Clickable rows: the client name is the link (one Tab stop per row); the Action menu has its own `aria-label`.
- Stage chips have text and a dot, never colour alone. Money uses tabular figures in code (`DESIGN TOKEN GAP`).
- After filtering, the footer count is announced (`aria-live=polite`).

## Gaps

- No sorting, row selection, empty, loading or pagination states (GAP-02).
- The toolbar title and subtitle and the footer count bind semantic text tokens; they have no component aliases.

## Implementation references

- Pencil: `C27 — Table` (`zWcpb`)
- Rules: token-usage.md G3, SP4, SP6 (amended), SP10, §2 *Status*, §3, §6, §8
