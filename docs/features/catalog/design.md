# F-05 Service catalog — design

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

- Pencil file: [catalog.pen](catalog.pen) (created 2026-10-02 from the SDV feature-consumer template). It imports `design-system.lib.pen` with the prefix **`v:`** (Pen assigned it; F-03/F-04 use `W:`, same component IDs).
- Rules: `docs/design-system/token-usage.md` v3.1 (APPROVED). Library: 596 tokens, checksum `986ecbcb` after the F-05 promotion (below).
- Direction: **Option A2** from `exploration.pen` board 12 (Owner 2026-10-02: "ok i like it"): the F-03/F-04 v3 structure (App Shell C30, Page Header C40, Section Card C43, List Card Item/Two-line C42) with **underline tabs attached to the Page Header**, the tab row aligned with the title (the 720-column alignment was tried and reverted). Rejected: B (table + summary), C (master–detail), D (package cards), A (Segmented tabs).
- Status: **APPROVED** (Owner 2026-10-02: "mari kita finalize"). 26 desktop and 14 phone frames. Exports: `exports/*.html` (40 frames, `<state>-<frameId>.html`, html-tailwind).

## Frames

Desktop frames are 1440 wide in rows at y 0 / 1100 / 2200 / 3300 / 4400; phone frames are 375 wide at y 5600.

| State | Desktop | Phone | Covers |
|---|---|---|---|
| Layanan / Populated (3 categories, archived service last) | `Ku4iB` | `n9Gskl` | AC-CAT-003, 005 |
| Layanan / Empty | `gaVVo` | `sJJmC` | AC-CAT-004 |
| Layanan / Loading (skeleton rows) | `m603dh` | — | C-007 |
| Layanan / Row menu open (*Ubah*, *Arsipkan*, *Hapus*) | `V4GMSL` (Menu overlay) | `zPJZc` (Bottom Sheet/Actions) | AC-CAT-017, 018 |
| Kategori / Populated (counts, unused, archived) | `a6mNsJ` | `p9oM7y` | AC-CAT-009 |
| Item paket / Populated | `ZPYRy` | `mnsE2` | AC-CAT-006 |
| Item paket / Seeded (new workspace: four definitions) | `w4JrT6` | — | AC-CAT-001 |
| Tambah layanan / Default | `I8UReE` (Modal/MD) | `eh2WJ` (Bottom Sheet/Form) | AC-CAT-010 |
| Tambah layanan / Saving (Button Loading) | `HsFUH` | — | C-007 |
| Item form / Default (Angka, unit, selection off) | `m7Xoj` | — | AC-CAT-006 |
| Item form / Selection on + name taken | `n5KfB` | `LC6ik` | AC-CAT-007, 019 |
| Item form / *Jenis pilihan* open (dropdown) | `LCEV4` (Select/Open + Menu overlay) | `yt08g` (Bottom Sheet/Form picker) | AC-CAT-007 |
| Item form / *Tipe nilai* open (dropdown) | `sUS1j` (Select/Open + Menu overlay) | `JPS5e` (Bottom Sheet/Form picker) | AC-CAT-006 |
| Item form / Locked (used by services) | `l9hNq` | — | AC-CAT-008 |
| Kategori form / Add (Modal/SM; rename uses the same form) | `W8bUn` | — | AC-CAT-009 |
| Service detail / Filled | `K8Jd8H` | `RTzWq` (Compact Bar) | AC-CAT-011, 014, 016 |
| Service detail / Page actions (⋯): *Ubah info layanan*, *Arsipkan* / *Aktifkan*, *Hapus layanan* | — (Page Header action + row menu) | `s5M34T` (Compact Bar ⋯ → Bottom Sheet/Actions) | AC-CAT-017, 018 |
| Service detail / Item row actions: *Ubah nilai*, *Naikkan*, *Turunkan*, *Hapus dari layanan* | — (row buttons + Action Menu) | `FO6t9` (row ⋯ → Bottom Sheet/Actions) | AC-CAT-016 |
| Service detail / New (empty sections) | `l5kScE` | — | AC-CAT-010 |
| Service detail / Archived (Alert/Warning + *Aktifkan*) | `smSLQ` | — | AC-CAT-017 |
| Service item form / Number | `J9SoD` | — | AC-CAT-011 |
| Service item form / Range error (min > max) | `uFn2y` | — | AC-CAT-012 |
| Booking field form / *Pilihan* with options | `w8E47M` | — | AC-CAT-014 |
| Booking field form / Errors (duplicate name, duplicate option) | `X8gWpH` | — | AC-CAT-015 |
| Delete / Allowed (Modal/SM, Button Danger) | `VQfb3` | — | AC-CAT-018 |
| Delete / Blocked (in use → *Arsipkan*) | `lLxMz` | `rEgeC` (Bottom Sheet/Actions) | AC-CAT-018 |
| Toast / Archived with *Batalkan* | `bcy07` | `IbVZo` | AC-CAT-017 |
| Toast / Server error with *Coba lagi* | `Xr7z7` | — | AC-CAT-022 |

## Layout

- **Tabs page (desktop):** App Shell with *Layanan* active in the Sidebar; Page Header with breadcrumb *Aster Wedding › Layanan*, the hero action (*Tambah layanan* / *Tambah kategori* / *Tambah item* per tab) and the underline tabs (local *Page Header Hero/Tabs*). Content: centred 720 column of Section Card Default/Flush.
- **Layanan tab:** one card per category (title = category, description = counts); rows are List Card Item/Two-line (`package` icon, name, item summary) with price, an optional *Diarsipkan* Status Chip/Neutral, and Action Menu SM. Archived rows sort last.
- **Kategori tab:** one card; rows use `folder` with the service count.
- **Item paket tab:** two cards, *Dipilih klien* (Status Chip/Info with the selection type) and *Item lainnya*; meta = value type · unit · usage count.
- **Service detail (desktop):** Page Header without tabs, breadcrumb *Layanan › {service}*, hero action *Arsipkan* / *Aktifkan* (Button Secondary). Cards: *Info layanan* (fact row + *Ubah*), *Item paket* and *Field booking* (rows with value, *Naikkan* / *Turunkan* Icon Button Ghost SM, Action Menu SM; header action *Tambah …*).
- **Phone:** Mobile App Shell as a menu destination (no Bottom Nav tab active, F-17 S-A4). The Mobile Header keeps its standard Titles; the tabs are the library **Segmented Control** (C23), full width, as the first item in the content (Owner 2026-10-02: "gunakan tabs yg biasa, tapi di dalam content"). The underline tabs are desktop-only. *Tambah …* is a full-width **Button Primary** below the tabs (Owner 2026-10-02). Segmented items are full width with centred labels (now Segmented Control/Full width in the library; see the follow-up below). Rows show price in the meta line. Service detail uses the Compact Bar; reordering on phones is in the row menu (no up/down buttons).
- **Forms:** Modal/MD (Modal/SM for category and delete) on desktop; Bottom Sheet/Form on phones. *Tipe nilai* and *Jenis pilihan* are **Select** dropdowns (Owner 2026-10-02): the closed field shows the value with its leading icon (`hash` / `move-horizontal`, `image` / `printer`) and a helper line; the open list uses Menu Item with Icon + Description + Check, the same content the option cards had. With selection on, *Tipe nilai* is Select/Disabled fixed to *Angka*. On phones the Select opens a Bottom Sheet/Form picker with the same Menu Items and *Pilih*. On desktop the open list is drawn as an absolute Menu in the Overlay's Modal slot so later fields don't cover it; *Dipakai untuk pilihan foto klien* is a Switch; a locked definition shows Alert/Info and a disabled Text Field with a `lock` icon. *Pilihan* options are an Input list with remove buttons and *Tambah pilihan*.
- **Empty state (Owner 2026-10-02):** Empty State C38 sits inside Section Card/Default/No header (desktop) or Compact/No header (phone), full content width. The instance's own fill is overridden to `component/section-card/background` and its border removed so the card is the only surface; on phones its padding is `space/8` vertical only and the body text fills the width.
- **Frame height:** desktop frames are 1000 tall (App Shell default 960). The App Shell's absolute *Overlay* and *Toast* layers are 960 tall and can't fill on the canvas, so each frame overrides both to the frame height, as the [App Shell spec](../../design-system/components/app-shell.md) prescribes for resized instances (in code they are `position: fixed; inset: 0`).
- **Row menu (desktop):** drawn as an absolute Menu overlay in the content column (as F-04), so later rows don't cover it.

## Library promotion (Owner 2026-10-02: "follow your suggestion", "ikuti saranmu")

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` phase C, PERSISTED 2026-10-02 (596 tokens, checksum `986ecbcb`; +11 component tokens, no primitives):

- **C45 Tabs** (`Pu7zm`): Tab/Default `M43F7D`, /Hover `WLfdt`, /Active `WbyBE`, /Focus `DLhzi`, Tabs row `NSzy3` — [tabs.md](../../design-system/components/tabs.md).
- **Page Header/Tabs** `NPQ7d` (C40; base gains an optional Tabs row `Iu4gK`, off by default).
- **Segmented Control/Full width** `iIcai` (C23).
- **Empty State/In card** `E9A74J` (C38).
- **Menu Item/Rich** Default `WWqyy`, Hover `w5XzS`, Selected `WngMO` (C09), plus the *Rich select open* composition on C10.
- **List Card Two-line Trailing amendment** (C42): value text and Naikkan / Turunkan before the Action Menu.

## Open follow-up: migrate `catalog.pen` to the promoted components

The frames still use the pre-promotion pieces, which look the same:

- local board `RXnTb` (*Local components (F-05)*): `Tab/Underline/Active` `n2KMCj`, `/Default` `KHTPi`, `Page Header Hero/Tabs` `empmN` → replace with Page Header/Tabs;
- phone Segmented Control with full-width items set per instance → Segmented Control/Full width;
- Empty State with fill/border/padding overrides → Empty State/In card;
- Menu Item/Default/Selected with Icon + Description switched on → Menu Item/Rich.

`broken-library-link` (suspected): after the library was saved (4,651,214 bytes, 2026-10-02 08:53) and `catalog.pen` was reopened, `catalog.pen` still resolved 585 variables and none of the new components — the content of `shutrly-v01/docs/design-system/design-system.lib.pen` (main checkout), not `shutrly-v01-catalog/docs/design-system/design-system.lib.pen` (this branch). Check *Libraries › Imported Libraries* in Pen and use **Locate** to point `v:` at this branch's library, then migrate. Until then the exports reflect the approved design; code should use the library components named above.

Checks (2026-10-02): 0 local variables and 0 raw colours across all frames.
