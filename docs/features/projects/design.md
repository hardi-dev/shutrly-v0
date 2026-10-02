# F-07 Projects — design

- Pencil file: [projects.pen](projects.pen). It imports `design-system.lib.pen` with the prefix **`H:`** (not `Y:` as in `clients.pen`). The library link is live: 597 variables (checksum `d09d3751` in `tokens.json`), plus every library component used below.
- Rules: `docs/design-system/token-usage.md` v3.1 (APPROVED).
- Direction: the F-05/F-06 structure.
  - Shells: App Shell C30 / Mobile App Shell C35.
  - Page Header C40, Section Card C43 and List Card Item/Two-line C42.
  - The library **Table** for the desktop list, in the centred 720 column (`size.content-narrow`), as in F-05/F-06.
  - Tabs: underline tabs in the Page Header on desktop; Segmented Control/Full width on phones.
- Status: **APPROVED 2026-10-02** (Owner). 92 HTML exports in [`exports/`](exports/), one per state frame (`<state>-<device>-<frameId>.html`, html-tailwind). The two target boards aren't exported.

## Frames

Each row of the canvas is one state, with desktop on the left and its phone frame beside it.

- **Columns:** list at x 0 / 1560; *Proyek baru* at x 2400 / 3960; detail at x 4800 / 6360.
- **Sizes:** desktop 1440 wide, phone 390 wide.
- **Heights:** dialog, sheet and toast frames are one viewport (1024 / 844). Page frames are as tall as their content.

### List (`/projects`)
| State | Desktop | Phone | AC |
|---|---|---|---|
| *Aktif* | `sn4a4` | `liVLL` | AC-PRJ-001 |
| Filter active (red counter 2) | `KLoPc` | `VJ6Li` | AC-PRJ-028 |
| *Filter proyek* (Modal MD / Bottom Sheet Form) | `e1VJF` | `ITvcM` | AC-PRJ-002, 028 |
| Row menu open on *Wisuda Basic — Rina* | `E3eVH` | `EWFc5` | AC-PRJ-027 |
| *Selesai* | `u0Ck6F` | `gY8l7` | AC-PRJ-002 |
| *Dibatalkan* | `o2T7OP` | `H3gsoo` | AC-PRJ-002 |
| Empty *Aktif* / *Selesai* / *Dibatalkan* | `tHeNM` / `O4N4XM` / `fXKf8` | `V4TEva` / `CyTsk` / `GCYv0` | AC-PRJ-003 |
| No match (*andra*) | `Q5PE55` | `RVzmE` | AC-PRJ-004 |
| Loading | `v1y9at` | `dE780` | C-007 |
| Loading more | `rJ0pj` | `ijrVe` | AC-PRJ-005 |
| Toast / Draft deleted | `ex0WR` | `sV9q3` | AC-PRJ-023 |
| Board: row menu per status, target (later features) | `H0Gs4u` (menus) | `eKgbh` (sheets) | AC-PRJ-027 |

### *Proyek baru* (`/projects/new`)
| State | Desktop | Phone | AC |
|---|---|---|---|
| Filled (*Wisuda Basic — Rina*, 2 sessions) | `QeT50` | `l64V5` | AC-PRJ-007, 008, 029, 030 |
| Empty, before a service is chosen (*Jadwal* empty) | `yxqqv` | `OPt4W` | AC-PRJ-006 |
| Client picker open (*Rin*, 3 matches, *Tambah klien baru “Rin”*) | `VBXF3` | `lJ7dl` | AC-PRJ-006, 013 |
| Inline client dialog (F-06 *Tambah klien*) | `YkwXo` | `w2QKYN` | AC-PRJ-013 |
| Service with no items and no booking fields | `KwnCp` | `e7Dmly` | AC-PRJ-007 |
| No active service | `EWh9x` | `wr8Jc` | AC-PRJ-014 |
| Session form, add | `vv444` | `AnmVx` | AC-PRJ-029 |
| Session form, field errors | `eO5bn` | `yyDAM` | AC-PRJ-029 |
| Field errors (title, required booking field, *Tambahkan minimal satu sesi.*) | `h5ErBW` | `vs8Hr` | AC-PRJ-010, 011, 029 |
| *Tambah item* | `ipoUj` | `R8gAvN` | AC-PRJ-030 |
| *Ubah nilai* (range) | `b82A3` | `p1pXCE` | AC-PRJ-030 |
| *Hapus* item confirm | `t4LqJ` | `tTbXi` | AC-PRJ-030 |
| *Ganti layanan?* confirm | `ohp7C` | `kjNVD` | AC-PRJ-030 |
| Inactive service (race) | `atf72` | `Ma402` | AC-PRJ-012 |
| Submitting (*Membuat proyek…*) | `TI8mj` | `LGVBa` | C-007 |
| Server error toast | `q3PYk` | `TovK4` | C-007 |

### Project detail (`/projects/[id]`)
| State | Desktop | Phone | AC |
|---|---|---|---|
| *Dibooking* (next step *Mulai pemotretan*) | `X5y4S3` | `hLX50` | AC-PRJ-015, 017 |
| *Draf*, no sessions (next step *Konfirmasi booking*) | `C8AhE3` | `L72PK` | AC-PRJ-009 |
| *Pemotretan*, deal read-only (next step *Selesai pemotretan*) | `D8RE2` | `X2DGk` | AC-PRJ-018, 020 |
| *Pascaproduksi* (no manual step) | `q70gHf` | `bBSyL` | AC-PRJ-020 |
| *Dibatalkan* (Alert with actor, date and reason; read-only) | `syy8h` | `y3p2K` | AC-PRJ-022 |
| Status action pending | `h5LJT` | `YT1bd` | AC-PRJ-020 |
| Last session: *Hapus sesi* disabled with hint | `bQbmb` (Action Menu) | `DzmLU` (sheet) | AC-PRJ-029 |
| *Ubah info* | `wExLM` | `fbF7C` | AC-PRJ-017 |
| *Ubah info*, price locked (*Pemotretan*) | `W1tKw` | `RJoq9` | AC-PRJ-018 |
| *Ubah field booking* | `VgCZF` | `j4w4o` | AC-PRJ-017 |
| *Batalkan proyek*, reason required (*Pemotretan*, error) | `o7Uhi0` | `A0cZN` | AC-PRJ-022 |
| *Hapus draf* | `iRCuz` | `VORis` | AC-PRJ-023 |
| *Hapus sesi* | `QJUBI` | `ZyZuV` | AC-PRJ-029 |
| Toast / Created | `E5tDH` | `cKFVl` | AC-PRJ-008 |
| Toast / Status changed | `UAtGk` | `HOrnO` | AC-PRJ-020 |
| Toast / Deal locked (race) | `MZtLr` | `E7jJ3F` | AC-PRJ-019 |
| Toast / Cancelled | `v3KD6D` | `PTr8W` | AC-PRJ-022 |

**Defined but not drawn separately.** These reuse a drawn pattern with the copy below:
- *Ubah sesi*: the session form with title *Ubah sesi* and *Simpan*.
- Cancel from `BOOKED`: the cancel dialog with *Alasan pembatalan (opsional)* and no error.
- Detail with no items and no booking fields: like `KwnCp`.
- Dialog submitting states: the confirm button pending and *Batal* disabled, as in F-06.
- The draft-saved and saved toasts.
- The inactive client: like `atf72`, on the client field (see the COMPONENT GAP below).

## Layout

- **List.** Desktop and phone are as reviewed (Owner decisions 1–9 in [design-handoff.md](design-handoff.md)).
  - **Table:** columns PROYEK (fill, about 236) · ACARA 240 · STATUS 124 · ⋯ 32, with 16 between columns. The text of the PROYEK cell links to the detail page. The ACARA cell follows A-12.
  - **Filter:** an Icon Button Outline (`list-filter`) next to the search, with a red Count Badge of the active filter groups. It opens Modal MD on desktop and Bottom Sheet/Form on phones.
  - **Row menu:** Action Menu on desktop; Bottom Sheet/Actions with the meta *client · date · status* on phones.
- ***Proyek baru*.** Desktop uses the centred 720 column. Phones use the Compact Bar and a sticky action bar, with no Bottom Nav.
  - **Cards, in order:**
    1. *Klien & layanan*: Combobox and Select, with the base price as the helper.
    2. *Isi paket*: flush list; each item has ⋯ *Ubah nilai* / *Hapus*; *Tambah item* in the header.
    3. *Detail proyek*: *Judul proyek* and *Harga sepakat* on one row on desktop, then *Catatan internal*.
    4. *Jadwal*: flush list of sessions with ⋯; *Tambah sesi* in the header.
    5. *Field booking*.
  - **Actions:** *Simpan draf* (Secondary) and *Buat proyek* (Primary). On desktop they sit right-aligned under the form only (Owner 2026-10-02). On phones each takes half the action bar.
  - Before a service is chosen, *Isi paket* and *Field booking* are hidden. *Judul* and *Harga* show placeholders.
  - An empty *Jadwal* shows Empty State/In card (`calendar-plus`). After a failed *Buat proyek*, the error line *Tambahkan minimal satu sesi.* sits under it.
  - **Service with no booking fields:** the *Field booking* card is hidden, here and on the detail page (Owner 2026-10-02). A service with no items shows Empty State/In card in *Isi paket*; *Tambah item* stays available.
  - **No active service:** Select/Disabled (*Belum ada layanan aktif*), then Alert/Info with the action *Buka Layanan*. Both buttons are disabled (AC-PRJ-014).
  - **Client picker:** Combobox/Open. Each match shows the client's name with *number · n proyek*, or *Belum ada nomor WhatsApp*. The last row is *Tambah klien baru “{query}”*, which opens the F-06 dialog with the name prefilled; the saved client is then selected.
- **Detail.**
  - **Desktop Page Header:**
    - breadcrumb *Proyek › {title}*;
    - the title with its Status Chip on the same line;
    - a meta line: *client · Sesi berikutnya {weekday, date · start · location} · +n sesi*. When every session is past it reads *Sesi terakhir …*; with no session it reads *Belum ada jadwal*;
    - on the right, the status step (Button Primary) and Action Menu MD ⋯ with the row-menu items for the status. *Pascaproduksi* and *Dibatalkan* show only ⋯.
  - **Phone:** the Compact Bar (title, parent *Proyek*, ⋯) and a header block (Status Chip + next session). The status step is a full-width Button Primary in the sticky action bar. The bar is hidden when there is no step.
  - **Cards in the 720 column:**
    1. *Info*: a fact row (*Klien*, *Layanan*, *Harga sepakat*), then *Catatan internal*, and *Ubah info* in the header. This is the F-05 service-detail fact pattern; on phones the facts stack.
    2. *Isi paket*.
    3. *Jadwal*.
    4. *Field booking*: facts, with *Ubah* in the header.
  - **From `SHOOTING` on, the deal is read-only:** *Isi paket* and *Field booking* lose *Tambah item*, the item ⋯ and *Ubah*, and their description reads *Terkunci sejak pemotretan dimulai.* *Ubah info* stays, with *Harga sepakat* shown as Text Field/Disabled.
  - **`CANCELLED`:** Alert/Warning *Proyek dibatalkan* at the top, with actor, date and reason. Every edit control is removed; ⋯ keeps *Chat WhatsApp*.
  - **Last session:** the session menu shows *Hapus sesi* as Menu Item/Disabled with the hint as its description. The phone sheet dims the item and shows the hint below it.
- **Dialogs:** Modal MD (forms) or Modal SM (confirms) on desktop. On phones, Bottom Sheet/Form for forms and Bottom Sheet/Actions for confirms (destructive item + *Batal*). Destructive confirms use Button Danger.
- **Toasts:** App Shell Toast layer, bottom right on desktop and top on phones. Toast/Success, or Toast/Danger for errors.

## Copy

Screen copy is drawn in Pencil. The table lists copy beyond the spec, for Owner review.

| Where | Copy |
|---|---|
| *Proyek baru* subtitle | *Pilih klien dan layanan, lalu catat apa yang kalian sepakati.* |
| *Isi paket* description | Create: *Disalin dari {layanan}. Perubahan hanya berlaku untuk proyek ini.* · Detail: *Disalin dari {layanan}. Bisa diubah sampai pemotretan dimulai.* · Locked: *Terkunci sejak pemotretan dimulai.* · Cancelled (*Isi paket*, *Jadwal*, *Field booking*): *Proyek dibatalkan, tidak bisa diubah.* |
| *Jadwal* | Description *Sesi pemotretan. Minimal satu sesi untuk Buat proyek.* (create) / *Sesi pemotretan, urut tanggal.* (detail) · Empty *Belum ada sesi* + *Catat tanggal, jam, dan lokasi pemotretan. Draf boleh disimpan tanpa sesi.* (create) / *… sebelum konfirmasi booking.* (draft detail) |
| No items | *Layanan ini belum punya item paket* + *Tambahkan item bila perlu. Item yang kamu tambah hanya berlaku untuk proyek ini.* |
| No active service | Alert *Belum ada layanan aktif* + *Proyek dibuat dari layanan. Buat atau aktifkan layanan dulu, lalu kembali ke sini.* + *Buka Layanan* |
| Client dialog description | *Klien baru langsung dipilih untuk proyek ini.* |
| Session form | Description *Sesi disimpan bersama proyek.* (create) · Errors: *Isi nama sesi.* · *Pilih tanggal sesi.* · *Jam selesai harus setelah jam mulai.* |
| Field errors | *Isi judul proyek.* · *Isi {field}.* · *Layanan ini sudah tidak aktif. Pilih layanan lain.* · *Klien ini sudah diarsipkan. Pilih klien lain.* |
| Item dialogs | *Tambah item*: *Item hanya ditambahkan ke proyek ini.*, helper *Hanya item aktif yang belum ada di proyek.* · *Ubah nilai · {item}*: *Hanya berlaku untuk proyek ini. Layanan tidak berubah.* · *Hapus {item}?*: *Item dihapus dari proyek ini. Layanan tidak berubah.* |
| *Ganti layanan?* | *Perubahan isi paket akan hilang. Isi paket diganti dengan isi {layanan baru}.* · button *Ganti layanan* (Primary: it discards unsaved edits, not stored data) |
| *Ubah info* | *Judul, harga sepakat, dan catatan proyek.* · locked: *Judul dan catatan masih bisa diubah.* + helper *Terkunci sejak pemotretan dimulai.* |
| *Ubah field booking* | *Nilai field untuk proyek ini. Nama dan jenis field tidak berubah.* |
| *Batalkan proyek?* | *Proyek pindah ke Dibatalkan dan tidak bisa diubah lagi.* · error *Isi alasan pembatalan. Wajib setelah pemotretan dimulai.* · buttons *Kembali* / *Batalkan proyek* |
| *Hapus draf* | *Hapus draf “{judul}”?* + *Draf beserta isi paket, jadwal, dan field booking-nya dihapus permanen.* |
| *Hapus sesi* | *Hapus sesi {nama}?* + *Sesi dihapus dari jadwal proyek ini.* |
| Cancelled alert | *Proyek dibatalkan* + *Dibatalkan oleh {nama} pada {tanggal}. Alasan: {alasan}.* |
| Pending labels | *Membuat proyek…* · *Menyimpan draf…* · *{langkah}…* (for example *Mulai pemotretan…*) |
| Toasts | Created *Proyek dibuat* / *{judul} sudah Dibooking.* · Draft saved *Draf disimpan* · Saved *Perubahan disimpan* · Status *Pemotretan dimulai* / *Isi paket dan harga sekarang terkunci.*, *Booking dikonfirmasi*, *Pemotretan selesai* · Cancelled *Proyek dibatalkan* / *{judul} pindah ke tab Dibatalkan.* · Draft deleted *Draf dihapus* / *{judul} sudah dihapus.* · Deal locked (danger) *Detail paket tidak bisa diubah lagi* / *Proyek sudah dalam pemotretan. Data terbaru sudah dimuat.* · Server error (danger) *Perubahan belum tersimpan* / *Terjadi kendala di server. Isian formulirmu masih ada.* + *Coba lagi* |
| Status step icons | *Konfirmasi booking* `calendar-check` · *Mulai pemotretan* `camera` · *Selesai pemotretan* `circle-check-big` (Owner 2026-10-02) |

## Components and tokens

- **Library (`H:`), all linked instances.** Refs are listed in [design-handoff.md](design-handoff.md) › *Library refs used*. In addition:
  - Combobox/Open `LN80X` and Select/Disabled `umHpv` / Error `A6bXr`;
  - Text Field/Disabled `Q64HTj` and Textarea/Error `XyHPI`;
  - Empty State/In card `E9A74J`;
  - Alert/Info `S5bhVn` and Alert/Warning `pt1q7`;
  - Modal SM `cdSbf`;
  - Button Danger `z3mR7`, Button/Primary/MD/Loading `rv68E` and Button Primary Disabled `lBKcT`;
  - Menu Item/Default/Disabled `e0gYs`;
  - Action Menu MD `rXttF`;
  - Toast/Success `QCuMb` and Toast/Danger `C3PCyx`.
- **Local compositions.** Each is one consumer, built from library instances and `component.input.*` / semantic tokens:
  - the *Catatan* / *Alasan* field (label row + Textarea + error line), because there is no Textarea field wrapper;
  - the *Jadwal* error line under the empty state;
  - the detail fact rows (F-05 pattern);
  - the detail heading (title + Status Chip + meta), which replaces the Page Header *Heading* and *Actions*;
  - the phone header block;
  - the *Media sosial* group of the inline client dialog (the same composition as F-06).
- **Scan of all 94 frames** (2026-10-02):
  - 0 raw colours.
  - The only fully clipped nodes are intentional: open menus that overflow their trigger (row menu, client picker, session menu), and cards below the fold in 844-tall phone overlay frames.

## Rule notes and exceptions

- **SP5 (component spacing):** the table column gap is a frame-level override of 16 (`space/4`). Proposed library fix: `component/table/column/gap` = `space/4`.
- **G3 / SP5 (Page Header):** the detail replaces the Page Header's *Heading* and *Actions* children with local frames, so the Status Chip sits beside the title and the menu sits beside the step button. **COMPONENT GAP (non-blocking):** Page Header has no status or secondary-action slot. Promote a Page Header/Detail variant if F-09 or later features need it.
- **COMPONENT GAP — Bottom Sheet group label:** the phone row-menu sheet's *KIRIM KE KLIEN* label is local.
- **COMPONENT GAP — red badge on the filter button:** the filter button's red Count Badge is placed on Icon Button Outline, which has no badge.
- **COMPONENT GAP (non-blocking) — Combobox/Error:** Combobox has no error variant. The inactive-client error (*Klien ini sudah diarsipkan*) is defined but not drawn. In code, `Combobox` takes `errorMessage` like `Select`.
- **COMPONENT GAP — Sheet Item disabled:** the last-session sheet dims Sheet Item/Destructive with `opacity/disabled` (as F-06 *Deleting*).
- Open menus are drawn as absolute overlays; the client picker is a second Combobox/Open instance above the field. In code they are portals.
- **Literal sizes** (they can't bind in Pencil): container 720 (= `size.content-narrow`), table columns 240 / 124 / 32, picker menu width = field width, platform select 148.

## Spec notes

- The Owner decisions from the design review are recorded in spec, AC and domain (see [design-handoff.md](design-handoff.md) › *Owner decisions*). Decisions added in this pass, all Owner 2026-10-02:
  - the detail direction as drawn;
  - no *Field booking* card when the service has none;
  - the `circle-check-big` icon for *Selesai pemotretan*;
  - the *Proyek baru* actions only under the form.
- No blocking `SPEC GAP`.

## Plan check against the design (2026-10-02)

- **Exports:** six exports held a second frame, because frames touched or overlapped on the canvas:
  - *Detail Dibooking* ↔ *Draf* (phone);
  - *Status pending* ↔ *Sesi terakhir* (phone);
  - the target board ↔ *Ubah nilai* (desktop).

  The fix: *Draf* and *Sesi terakhir* moved down 100, and the two target boards moved to y 25200 / 25940. Every pair of frames is now at least 40 apart, and all 92 exports were regenerated with one frame each.
- **Money format (Owner 2026-10-02):** *Rp 750.000* with a space, as F-05's `formatIdr` produces. 96 texts were updated in the frames; AC-PRJ-015/016 were updated too.

## Approval

APPROVED by the Owner on 2026-10-02. The Owner asked the agent to review; the review fixed three things:
- the cancelled-project copy;
- the empty *Jadwal* body;
- two phone frame heights.

Evidence:
- `projects.pen` saved by the Owner (⌘S, 2,528,161 bytes, 23:36);
- 94 frames, 0 raw colours, only intentional clipping;
- exports: `exports/*.html` (92 files).

Next: `/sdv:plan-feature projects`.
