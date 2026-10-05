# F-04 Source configuration — design

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

- Pencil file: [source-config.pen](source-config.pen). It imports `design-system.lib.pen` with the prefix `W:`; the library link is live (549 variables, every library component).
- Rules: `docs/design-system/token-usage.md` v3.1 (APPROVED).
- Direction: the F-03 v3 structure (App Shell C30 / Mobile App Shell C35, Page Header C40, Section Card C43, List Card Item/Two-line), applied to the rescoped spec (Owner 2026-10-01: Owner-managed sources, no link checker).
- Status: **APPROVED** (Owner 2026-10-02: "approve"). Exports: `exports/*.html` (24 frames, `<state>-<frameId>.html`).

## Frames

Desktop frames are 1440 wide (rows at y 0 / 1300 / 2600 / 3900). Phone frames are 390 wide, at y 5300.

| State | Desktop | Phone |
|---|---|---|
| List / Populated (2 active + 1 inactive, AC-SRC-003) | `q4btAK` | `w4uSN` |
| List / Seeded (new workspace: one *Google Drive*) | `iyIoF` | — (same as populated) |
| List / Row menu open | `UPlrT` (Action Menu) | `J0kFv` (Bottom Sheet/Actions) |
| List / Empty | `Dxziw` | `Z5HewL` |
| List / Loading | `jB869` | `eh7Mt` |
| Add / Default | `zAIEh` (Modal/MD) | `J1U8P` (Bottom Sheet/Form) |
| Add / Name taken | `d2Pg49` | `uG6vj` |
| Add / Saving | `PJqHR` | `Zgejw` |
| Rename | `aRnMu` (Modal/SM) | `x78NAs` (Bottom Sheet/Form) |
| Delete confirm | `YAP3e` (Modal/SM, Danger) | `q5h45` (Bottom Sheet/Actions) |
| Toast / Added | `r9f43` | — (same toast as desktop) |
| Toast / Deactivated with *Batalkan* | `RBld9` | `t2RFDD` |
| Toast / Server error with *Coba lagi* | `q6uWA` | `bFkW0` |

## Layout

- **Page, desktop:**
  - App Shell, with *Sumber foto* active in the Sidebar (`folder-open`).
  - Page Header: Aster Wedding › Sumber foto, a subtitle, and the hero action *Tambah sumber* (Button Primary, `plus`).
  - Content is a centred 720 column with two cards, `panel.app.content.gap` apart.
- **Phone:**
  - Mobile App Shell as a menu destination, so no Bottom Nav tab is active (F-17 S-A4).
  - *Tambah* (Button Secondary MD, `plus`) sits in the list card's header Actions slot, because the Mobile Header has no action.
- **Daftar sumber:** Section Card Default/Flush (desktop) or Compact/Flush (phone). Each row has:
  - a 36 icon well (`hard-drive`);
  - the name (body, semibold) and *Google Drive* (body-sm, `meta`);
  - a status chip;
  - Action Menu SM (`ellipsis`).

  Rows are List Card Item/Two-line with the chip and the menu in the Trailing slot, on desktop and phones.
- **Status:** Status Chip/Success *Aktif*, Status Chip/Neutral *Nonaktif*.
- **Row menu:** *Ganti nama* (`pencil`), *Nonaktifkan* or *Aktifkan* (`power-off`), divider, *Hapus* (destructive). On desktop the open menu is drawn as an absolute overlay in the content container, so later rows don't cover it.
- **Menyiapkan folder Google Drive:** Section Card Default/Compact holding:
  - four numbered steps;
  - a folder-structure example (`surface.sunken`: root with proofs, `edited` and `print` added later);
  - the BR-SRC-004 warning (Alert/Warning).
- **Add source:** Modal/MD on desktop, Bottom Sheet/Form on phones.
  - **Provider** choice: Option Card/Selected for Google Drive; Dropbox, OneDrive, Amazon S3 and Custom URL are Option Card/Disabled with Status Chip/Neutral *Segera hadir* (no dot), one per line on desktop and phones (Owner 2026-10-01).
  - Then the Text Field *Nama sumber* and the same warning Alert.
  - Actions: *Batal* and *Tambah sumber*. While saving, the confirm button uses its Loading variant (*Menambahkan…*).
- **Delete:** Modal/SM with Button Danger *Hapus sumber* on desktop; on phones, Bottom Sheet/Actions with Sheet Item/Destructive and *Batal*.
- **Feedback:** Toast/Success for added, renamed and reactivated; for deactivated with the *Batalkan* action; Toast/Danger *Perubahan belum tersimpan* with *Coba lagi*.

## Components and tokens

- **Library (`W:`), all linked instances:**
  - shells: App Shell `y9uBJl`, Mobile App Shell `c6qPz7`, Mobile Header `o8T8zb`, Nav Item;
  - cards and rows: Section Card `rHONT`, `lYGAJ`, `G8WO8q`, `Q82mo`; **List Card Item/Two-line** `PV6HB` and `/Last` `Bf3eg` (Trailing: Status Chip + Action Menu SM); **List Card Item/Skeleton** `ksPQI` and `/Last` `KKvqb`;
  - status: **Status Chip/Success** `GyfYn` (*Aktif*) and **/Neutral** `w7OAR` (*Nonaktif*, and *Segera hadir* with the dot off);
  - controls: **Option Card/Selected** `K1BPO` and **/Disabled** `AwKEK`, Action Menu SM `tgN4c` / `M3v1E5`, Text Field `HHNPk` / `AVpMa`, Button (Primary, Secondary, Danger, Loading);
  - feedback: Alert/Warning `pt1q7`, Empty State `H43gDN`, Toast `QCuMb` / `C3PCyx`;
  - overlays: Modal MD `f8ym9` / SM `cdSbf`, Bottom Sheet Form `vSBbR` / Actions `U0wHw`, Sheet Item.
- **Local:** numbered setup steps and the folder-structure example only.
- **Scan of all 24 frames:** 0 broken variable references, 0 raw colours, 0 leftover local chips, rows or tiles.

## Promoted to the library (Owner 2026-10-01)

The local pieces from the first pass were promoted, with 36 new tokens (585 total, checksum `284a052f`):
- C12 *Stage Chip* generalised to **Status Chip** (tone axis, free label, optional dot; stages kept as presets) — [status-chip.md](../../design-system/components/status-chip.md);
- **List Card Item/Two-line** and **/Skeleton** in C42 — [list-card.md](../../design-system/components/list-card.md);
- new **C44 Option Card** — [option-card.md](../../design-system/components/option-card.md).

Inactive rows now differ only by the *Nonaktif* chip; the dimmed title and icon of the first pass were dropped, because the library row has no inactive state and the chip carries the meaning.

## Library change (Owner 2026-10-01)

In `design-system.lib.pen`, the nav item *Sumber klien* (`share-2`) is now **Sumber foto** (`folder-open`) in the Sidebar (`I3aJo`), the Bottom Sheet menu (`r1bhQ`) and the Nav Rail (`ycw6L`). The component specs (bottom-sheet, nav-rail, mobile-app-shell) are updated to match. The specimens that use *Sumber klien* to mean a client's lead source (Select `A3Yui2`, Section Card `miFTZ`) are unchanged.

## Rule notes and exceptions

- Numbered steps (24 dots) and the folder-structure example stay local: one consumer each.
- Icon wells (36) and step dots (24) are literals, since sizes can't bind in Pencil (mapping `unsupported.size-binding`).
- Phone list frames are taller than 844 where the content scrolls; overlay frames are 844.

## Not designed (by spec)

- *Delete blocked (in use)* (AC-SRC-013): no gallery source can refer to a source before F-09. The text is fixed in the spec, and F-09 designs where it appears.

## Approval

APPROVED 2026-10-02 (Owner: "approve"). Disk-save evidence: `source-config.pen` 811,279 B (2026-10-02 00:03); `design-system.lib.pen` 4,552,146 B (2026-10-02 00:00). All 24 frames exported to `exports/` with `html-tailwind`. Next: `/sdv:plan-feature source-config`.
