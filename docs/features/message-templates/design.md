# F-03 Message templates — design

- Pencil file: [message-templates.pen](message-templates.pen). It imports `design-system.lib.pen` with the prefix `F:`; the library link is live and exposes C43 Section Card.
- Rules: `docs/design-system/token-usage.md` v3.1 (APPROVED).
- Direction: Option G from `exploration.pen`, board 09 (list `x9xAzf`, editor sub-page `QSKy6`), rebuilt on the current library (Owner 2026-10-01).
- Status: **APPROVED** (Owner 2026-10-01: "saved, /sdv:plan-feature message-templates"). Exports: `exports/*.html` (22 v3 frames).

## v3 frames (2026-10-01)

The new frames sit to the right of the earlier set: desktop at x 3200, mobile at x 4760. The earlier frames (x 0 / 1520) are kept unchanged for reference and are superseded by v3.

| State | Desktop | Mobile |
|---|---|---|
| List / Populated | `L9tLQ` | `m3crcH` |
| List / Loading | `KxWLq` | `CDwax` |
| Editor / Default (clean, Simpan disabled) | `byw9B` | `v8MaG` |
| Editor / Typing (dirty) | `haB5f` | `LTRdV` |
| Editor / Unknown variable | `sgWML` | `rQWDq` |
| Editor / Required link missing | `v1nCP` | `EOm16` |
| Editor / Saving | `svG4d` | `Dfkwo` |
| Editor / Saved (Toast/Success) | `VgQpQ` | `O9zahR` |
| Editor / Server error (Toast/Danger + *Coba lagi*) | `ysVv9` | `S5dA9` |
| Editor / Unsaved changes (Modal/SM · Bottom Sheet/Actions) | `KKHgt` | `T96gnV` |
| Editor / Preview tab | — (always visible) | `PBDeb` |
| Editor / Preview tab error | — (shown in the Pratinjau card) | `M9qsio` |

## Layout

- **List, desktop:** App Shell C30, with *Template pesan* active in the Nav. Page Header C40 (Aster Wedding › Template pesan) has no hero action. Content is a centered 720 column holding two **Section Card/Default/Flush** cards (C43), *Gallery* (3 rows) and *Invoice* (2 rows), `panel.app.content.gap` apart.
- **List, mobile:** Mobile App Shell C35 with Mobile Header (Workspace Pill, Cari · Notifikasi · Menu, title *Template pesan*) and the canvas sheet, as on Settings v3. It uses **Section Card/Compact/Flush**. No Bottom Nav tab is active (menu destination, F-17 S-A4); the fifth tab is *Invoice*.
- **List rows:** these are local rows placed directly in the Flush content. They're built on `component.list-card.item.*` (padding-x, gap, bottom border, icon well, title and meta colours). There are two lines: the label (body, semibold) and the purpose line (body-sm, `meta`). The row has a 36 icon well (`radius.md`) and a chevron, and the last row has no border.
- **Editor, desktop:** the breadcrumb is Template pesan › Bagikan gallery; the title is the template label and the subtitle is its purpose line.
  - Left column: **Section Card/Default** *Isi pesan* holds the Textarea (its own label is hidden because the card title labels it), the helper and counter, and *Sisipkan variabel* chips. Below the card, the action row has *Kembalikan ke default* (Secondary) and *Simpan* (Primary).
  - Right column: **Section Card/Default** *Pratinjau*, 400 wide, holding Message preview with its own header hidden.
- **Editor, mobile:** a sub-page (F-17), so the header is the **Compact Bar** (Back, *Bagikan gallery*, caption *Template pesan*), with its Actions slot empty.
  - One **Section Card/Compact** *Pesan* with the Edit/Pratinjau Segmented Control in the header **Actions** slot. Its content is the Edit tab (field and variables) or the Pratinjau tab (preview).
  - Below the card, *Simpan* is full-width Button LG (Primary), then *Kembalikan ke default* (Secondary LG), following Settings v3 (Owner 2026-10-01).
- **Feedback:**
  - Saved uses Toast/Success; a server error uses **Toast/Danger** with *Coba lagi* (Owner 2026-10-01), and the editor keeps the text.
  - Field errors show on the Textarea, and the preview shows its error state.
  - Unsaved changes use Modal/SM on desktop and Bottom Sheet/Actions on the phone.

## Components and tokens

- Library (`F:`): App Shell `y9uBJl`, Page Header, Sidebar and Nav Item; Mobile App Shell `c6qPz7`, Mobile Header `o8T8zb`, Compact Bar `J3Ppgp`, Bottom Nav; Section Card `G8WO8q`, `Q82mo`, `rHONT` and `lYGAJ`; Textarea; Segmented Control `uMP5H`; Button; Toast/Success `QCuMb`, Toast/Danger `C3PCyx`; Modal/SM; Bottom Sheet/Actions.
- Local (`Local components — F-03`, `znAAB`): Variable chip (`dT1mp`, `A3CYQ` required) and Message preview (`KhOfM`, `eiATb` error).
- Scan of the v3 frames: 0 broken variable references and 0 raw colours.

## Rule notes and exceptions

- **Two-line list rows** aren't a library component: List Card Item is one 44 px line. The local row uses only `list-card` tokens (G3). It's a candidate for a *List Card Item/Two-line* variant.
- The icon well is a 36 literal, since sizes can't bind in Pencil (mapping `unsupported.size-binding`).
- Mobile frames are taller than 844 where the content scrolls, as on Settings v3.

## Spec changes (Owner 2026-10-01)

- A-5 and AC-MSG-004: the list is grouped into *Gallery* and *Invoice*, and each row shows its label and purpose line, with no content excerpt. AC-MSG-007 no longer checks a list excerpt.
- AC-MSG-012 and UI states: a server error on save is a danger toast with *Coba lagi*.

## Approval

APPROVED 2026-10-01. `message-templates.pen` saved by the Owner; the v3 frames were exported to `exports/` (`list-*`, `list-loading-*`, `editor-*`). Planned in [plan.md](plan.md) / [technical-design.md](technical-design.md).
