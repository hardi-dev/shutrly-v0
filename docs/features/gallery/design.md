# F-09 Gallery — design

- **Pencil file:** [gallery.pen](gallery.pen), copied from the `feature-consumer.pen` template on 2026-10-04.
- **Library:** imports the worktree's `docs/design-system/design-system.lib.pen` (relative `../../design-system/design-system.lib.pen`) with the prefix **`r:`** (`clients.pen` uses `Y:`, `projects.pen` uses `H:`). The link is live: 623 variables (checksum `c2c0a40b`) and every library component listed below, including C46–C48.
  - The first import pointed at the main checkout's library under `s:`. On 2026-10-04 every ref and token was remapped to `r:` through MCP, and the frame IDs changed then; the IDs below are current. See `CLAUDE.md` › Mistakes to avoid.
- **Rules:** `docs/design-system/token-usage.md` v3.1 (APPROVED).
- **Direction:** the F-07 structure (App Shell C30, Mobile App Shell C35, Page Header C40, Section Card C43, List Card Item/Two-line C42). Owner decisions, 2026-10-04:
  1. The gallery has **its own page**, `/w/<id>/projects/<projectId>/gallery`. It uses the wide column, `size.content-max` (1096); the project detail keeps the 720 column.
  2. The project detail shows a **Galeri card right after *Info***.
  3. **Photo grid:** 4 per row on desktop, 3 on phones.
  4. **Photo Tile, Folder Tile and Media Viewer** were designed locally, then promoted to the library as C46–C48 (Owner: "Approve all", 2026-10-04).
  5. **Password:** the password is generated, easy to type, stored encrypted and visible to the Owner. It is filled into the WhatsApp message automatically (constitution v1.1, ADR-017).
     - The gallery page shows it in an *Akses klien* card, with *Salin* and *Ganti password*.
     - The project's Galeri card shows it too.
     - *Buat galeri* and *Ganti password* prefill a generated password with a *Buat ulang* button. There is no confirm field.
     - The expiry in *Buat galeri* uses the same radio group as *Kedaluwarsa galeri*: *Tidak ada kedaluwarsa* (default), *Sampai tanggal* (shows a date field) and *Selama beberapa hari* (shows *Jumlah hari*, counted from publishing).
- **Status:** **APPROVED 2026-10-04** (Owner: "1 approve").
- **Exports:** 100 HTML exports in [`exports/`](exports/), one per state frame (`<screen>-<state>-<device>-<frameId>.html`, html-tailwind), exported through Pencil MCP. The screens are `galeri`, `semuafoto`, `preview` and `proyek`. The Galeri card board and the sample-photo assets aren't exported.
- **Compact exports:** removed 2026-10-04 (Owner). The stripped base files from `compact-exports.py` didn't render the real UI, so `/sdv:build-feature` reads the raw exports in `exports/` directly. Don't re-run `compact-exports.py` for this feature.

## Frames

**Canvas layout:**

| Column | x |
|---|---|
| Gallery page, desktop · phone | 0 · 1560 |
| Gallery dialogs, menus and toasts, desktop · phone | 2400 · 3960 |
| Project detail and its dialogs, desktop · phone | 4800 · 6360 |
| Galeri card board | 7400 |
| Local component, sample photos | above the screens |

Desktop frames are 1440 wide and phone frames 390. Dialog, sheet, menu and toast frames are one viewport tall (1024 / 844). Page frames are as tall as their content.

### Gallery page (`/projects/[id]/gallery`)
| State | Desktop | Phone | AC |
|---|---|---|---|
| *Draf*, *Proof* tab, 2 folders | `OBrej` | `Dwvc7` | AC-GAL-005, 014 |
| *Draf*, no folders (empty; *Publikasikan* disabled) | `QgZ7f` | `ycHj3` | AC-GAL-014, 017 |
| Syncing (*Menyinkronkan*, button loading) | `p6M3x` | `D5fm9C` | AC-GAL-006, C-007 |
| Folder failed + photo *Hilang* | `I70acw` | `b692Pi` | AC-GAL-007, 008 |
| Loading skeleton | `K5PgU` | `umIa6` | C-007 |
| *Dipublikasikan* | `E0ycV4` | `m9F803` | AC-GAL-016 |
| *Dipublikasikan*, folder removed (*Dilepas*) | `vCv8f` | `TotmP` | AC-GAL-013 |
| *Kedaluwarsa* (Alert + *Ubah kedaluwarsa*) | `OU5yj` | `yeXEI` | AC-GAL-020 |
| *Diarsipkan* (read-only) | `N0t2S` | `Xmp7w` | AC-GAL-022 |
| Project cancelled, draft gallery (only *Hapus galeri*) | `pI39X` | `rVWtd` | AC-GAL-024 |

### Gallery dialogs, menus, toasts
| State | Desktop | Phone | AC |
|---|---|---|---|
| *Semua foto*, folder list (*Proof (312)*, one tile per source) | `bVKq1` | `zOwNQ` | AC-GAL-028 |
| *Semua foto*, inside *Rina-Wisuda*: subfolders + photos, infinite scroll loading | `HFuOm` | `F9GmAY` | AC-GAL-028, 030 |
| *Semua foto*, inside *Rina-Wisuda › Akad* | `Ul1hj` | `toFgM` | AC-GAL-030 |
| *Semua foto*, *Edited* with the `edited` level folded into *Akad* | `bUrYA` | `nT848` | AC-GAL-014, 030 |
| *Semua foto*, search *IMG_02* | `VXaIl` | `CbdDH` | AC-GAL-029 |
| *Semua foto*, search with no result | `jnPSB` | `VBQQw` | AC-GAL-029 |
| Preview, proof photo (*12 / 64*, *Buka di Google Drive*) | `X0gqM` | `JdEp2` | AC-GAL-031 |
| Preview, missing photo | `sd93D` | `E4xiBx` | AC-GAL-031 |
| Preview, edited photo (hidden until final delivery) | `ucto1` | `p9yfa` | AC-GAL-031 |
| *Tambah folder* (with public-link warning) | `jKjJi` | `SVOz8` | AC-GAL-005 |
| *Tambah folder*, file link instead of folder | `cMLAv` | `I4axTa` | AC-GAL-009 |
| *Folder sudah dipakai proyek lain* | `Kptf5` | `mSDDZ` | AC-GAL-010 |
| *Publikasikan galeri?* | `R6SiK2` | `lArmb` | AC-GAL-016 |
| *Galeri belum bisa dipublikasikan* | `snkI7` | `H32Pz` | AC-GAL-017 |
| *Kedaluwarsa galeri* (none / date / days) | `qj2c9` | `skcOw` | AC-GAL-018, 019 |
| *Ganti password galeri* | `iMpj5` | `h8jvt` | AC-GAL-021 |
| *Lepas {folder}?* | `u50YVM` | `SKq3v` | AC-GAL-013 |
| *Arsipkan galeri?* | `HTBMv` | `c7Kd9b` | AC-GAL-022 |
| *Hapus galeri draf?* | `jPxBN` | `iytmt` | AC-GAL-023 |
| Gallery menu, *Draf* | `vJS8h` | `oM6lR` | AC-GAL-018, 021, 023 |
| Gallery menu, *Dipublikasikan* | `SXR6I` | `E667d` | AC-GAL-018, 021, 022 |
| Folder menu, draft | `Inc7R` | `HJvsN` | AC-GAL-006, 013 |
| Folder menu, *Lepas folder* disabled with hint (last active folder) | `ehkRA` | `UiQMu` | AC-GAL-013 |
| Toast *Galeri dibuat* | `H2AxoR` | `eiQJ2` | AC-GAL-001 |
| Toast *Sinkronisasi selesai* | `O5jCRA` | `fdSvN` | AC-GAL-007 |
| Toast *Sinkronisasi gagal* (danger) | `N3iwrr` | `e3C5VJ` | C-007 |
| Toast *Galeri dipublikasikan* | `fPdrd` | `nK5zM` | AC-GAL-016 |
| Toast *Password diganti* | `feedx` | `XBPLa` | AC-GAL-021 |
| Toast *Galeri diarsipkan* | `Iqpos` | `Z7DDH` | AC-GAL-022 |
| Toast *Galeri dibuka lagi* | `XuWOd` | `RosrF` | AC-GAL-020 |

### Project detail (`/projects/[id]`, F-07 page with the new Galeri card)
| State | Desktop | Phone | AC |
|---|---|---|---|
| *Dibooking*, no gallery (*Buat galeri*) | `hD0ZP` | `QVsJP` | AC-GAL-001 |
| *Draf* project, gallery not yet available | `Ng1Wc` | `L89QZe` | AC-GAL-003 |
| *Dibooking*, gallery *Draf* | `NDot4` | `XbVZ8` | AC-GAL-001 |
| *Pemotretan*, gallery published, one folder failed | `cBj3U` | `zHSgU` | AC-GAL-008 |
| *Dibatalkan*, gallery archived | `PjsSC` | `V5YiTy` | AC-GAL-024 |
| *Buat galeri* | `WqWQv` | `DoUlp` | AC-GAL-001 |
| *Buat galeri*, field errors | `LO8UC` | `k2wRWe` | AC-GAL-002 |
| *Buat galeri*, expiry *Selama beberapa hari* (30, counted from publishing) | `bIUHW` | `V3m5mR` | AC-GAL-018 |
| *Buat galeri*, expiry *Sampai tanggal* (date field) | `Nf7Yy` | `JgngY` | AC-GAL-019 |
| Toast *Galeri draf dihapus* | `chT5W` | `nokhw` | AC-GAL-023 |
| Board: Galeri card states A–G (no gallery, draft project, draft, published + failed folder, expired, archived, cancelled + draft) | `ZiJzF` | — | AC-GAL-001, 003, 020, 022, 024 |

### Defined but not drawn separately
These reuse a drawn pattern with the copy below:
- **Expiry by date in *Kedaluwarsa galeri*:** like `qj2c9`, with *Sampai tanggal* selected and the date field drawn in `Nf7Yy` (F-07 DateField).
- **Cancelling the project:** the F-07 cancel dialog is reused unchanged, apart from the extra sentence in Copy. It isn't redrawn here (Owner 2026-10-04).
- **Folder already in this gallery:** like `cMLAv`, with the error *Folder ini sudah ada di galeri ini.*
- **Date in the past:** like `cMLAv`, with the error *Pilih tanggal hari ini atau sesudahnya.*
- **Dialog submitting states:** the confirm button uses Button/…/Loading and *Batal* is disabled, as in F-06 and F-07.
- **Expired and archived Galeri card on the project detail:** board states E and F, placed where `NDot4` shows the card.

## Layout

- **Gallery page:**
  - **Akses klien card** (first card, after any Alert): *Password* `mawar-4821` with an Icon Button Ghost SM `copy` (*Salin password*), *Kedaluwarsa*, and *Ganti password* (Secondary) in the header. The archived and cancelled states have no *Ganti password*. Phones use Section Card/Compact with stacked facts.
  - The Page Header has the breadcrumb *{project title} › Galeri*, the title *Galeri* with a Status Chip, and a meta line *{project} · {n} folder · {n} proof · {expiry}*.
  - **Header actions by state:**

    | State | Actions |
    |---|---|
    | Draft | *Publikasikan* (Primary) + ⋯ |
    | Published | ⋯ |
    | Expired | *Ubah kedaluwarsa* (Secondary) + ⋯ |
    | Cancelled project | *Hapus galeri* (Secondary) |
    | Archived | none |

  - **Sumber foto:** Section Card/Default/Flush, with *Sinkronkan semua* and *Tambah folder* in the header. Each folder is a List Card Item/Two-line with the `folder` icon, the sync summary as meta, and a Status Chip:
    - *Berhasil* (success);
    - *Menyinkronkan* (info);
    - *Gagal* (danger, with the reason as danger-coloured meta);
    - *Dilepas* or *Arsip* (neutral).

    Each row also has an Action Menu SM.
  - **Foto card** (Owner 2026-10-04): the counts per kind (*8 proof · 2 edited · 1 print*, plus *(n hilang)*), the visibility line, and a preview of the first 8 photos (6 on phones) in the same grid as before. *Lihat semua foto* (*Semua* on phones) sits in the header. A missing photo in the preview shows the *Hilang* badge.
  - **Semua foto** (Modal/LG widened to `size.content-max` 1096 × 944 on desktop; Bottom Sheet/Form at full height, 800, with no footer on phones). The body scrolls:
    - tabs *Proof / Edited / Print* with totals, then the toolbar: the breadcrumb (*Semua folder › {folder} · n foto*) and Input/Search *Cari nama file*. On phones, Segmented Control/Full width and the search first;
    - the Drive-like grid: one Folder Tile per source at the top level, then subfolders before photos at the same tile size. In *Edited* and *Print*, the `edited` / `print` level is folded into its parent. With one source, its folder opens directly;
    - infinite scroll: 48 more per page, with skeleton tiles and *Memuat foto berikutnya…*;
    - search spans every folder and kind. The breadcrumb becomes *n foto cocok dengan “…”*, and tiles show *{folder path} · {kind}*.
  - **Photo preview** (from the card or the modal). Owner 2026-10-04 chose option B, immersive, without a status chip (the exploration board with options A and B was lost while the library import was being fixed; the decision is recorded here and in `components/media-viewer.md`). It is a custom lightbox pattern (COMPONENT GAP-3).
    - **Desktop:** a full-screen `surface.inverse` backdrop.
      - The top bar has the file name and *{folder} · {kind} · n dari total* (`text.inverse`), *Buka di Google Drive* (Secondary) and *Tutup*.
      - The stage holds the image (`contain`) with Icon Button Outline ← / → at its sides.
      - The bottom filmstrip has 48 px thumbnails, with the current one outlined in `text.inverse`.
    - **Phones:** the same full screen, with the name and meta at the top and *Buka di Drive* as an icon button. There are no arrows (swipe). The filmstrip has 44 px thumbnails.
    - **Missing photo:** the stage shows `image-off` and *File tidak ditemukan di Google Drive* (`text.inverse`), and the meta reads *… · Hilang · …*. There is no Drive button.
    - A missing photo shows Status Chip/Warning *Hilang* over its image.
  - **Phone:** Compact Bar (*Galeri*, parent = project title, ⋯) and a header block (Status Chip + meta). Below it:
    - Section Card/Compact/Flush and Section Card/Compact;
    - Segmented Control/Full width instead of the tabs;
    - an Icon Button Outline for *Sinkronkan semua*.

    The sticky action bar holds the primary step (*Publikasikan*, *Ubah kedaluwarsa* or *Hapus galeri*). There is no Bottom Nav, as on the F-07 detail.
- **Project detail:** the Galeri card sits second, after *Info*.
  - Without a gallery it shows Empty State/In card (`images`): with *Buat galeri*, or with the hint on a draft project.
  - With a gallery it shows facts: *Status* (chip), *Sumber*, *Foto*, *Kedaluwarsa*, and *Kelola galeri* (or *Lihat galeri* when archived) in the header. A failed folder adds Alert/Warning.
- **Dialogs:** Modal MD (forms) or Modal SM (confirms) on desktop. On phones, Bottom Sheet/Form for forms and Bottom Sheet/Actions for destructive confirms and menus. Destructive confirms use Button Danger, as in F-07.
- **Menus:**
  - Desktop: Action Menu MD (gallery) and SM (folder).
  - Pencil drawing: the open menu is drawn on a top layer of a wrapper frame. Inside the shell it would be drawn under the following cards. In code it is a normal popover.
  - *Lepas folder* on the last active folder of a published gallery is Menu Item/Disabled with the hint as its description; the phone sheet dims it and shows the hint below.
- **Toasts:** App Shell Toast layer, bottom right on desktop and top on phones. Toast/Success, or Toast/Danger for errors.

## Copy

Screen copy is drawn in Pencil. The table lists copy beyond the spec, for Owner review.

| Where | Copy |
|---|---|
| Galeri card, none | *Belum ada galeri* + *Buat galeri berpassword, lalu tautkan folder Google Drive berisi foto proyek ini.* · draft project: *Galeri tersedia setelah booking* + *Konfirmasi booking dulu, lalu buat galeri untuk proyek ini.* |
| *Buat galeri* | *Klien membuka galeri dengan link proyek dan password ini. Password terisi otomatis saat kamu membagikan galeri.* · helper *Dibuat otomatis, mudah diketik klien. Boleh diganti (6–64 karakter). Selalu bisa dilihat di halaman galeri.* · icon button *Buat ulang* · error *Password minimal 6 karakter.* |
| *Akses klien* | *Klien membuka galeri dengan link proyek dan password ini. Password terisi otomatis saat kamu membagikan galeri.* |
| *Sumber foto* | Description *Folder Google Drive yang dibagikan sebagai “Siapa saja yang memiliki link”.* · empty *Belum ada folder* + *Tautkan folder Google Drive berisi foto proyek ini. Foto di folder utama menjadi proof; subfolder edited dan print untuk hasil akhir.* · failed *Folder tidak bisa dibaca. Bagikan folder sebagai “Siapa saja yang memiliki link”, lalu sinkronkan lagi.* |
| *Tambah folder* | *Foto di folder utama menjadi proof. Subfolder edited dan print menjadi hasil akhir.* · Alert *Link Drive melewati password galeri* + *Siapa pun yang punya link folder bisa melihat fotonya langsung. Bagikan link galeri ke klien, bukan link Drive.* (BR-SRC-004) · error *Ini link file. Tempel link folder Google Drive.* |
| Visibility lines | *Terlihat oleh klien setelah galeri dipublikasikan.* · *Terlihat oleh klien sekarang.* · *Disembunyikan dari klien sampai hasil akhir dikirim. Tidak bisa dipilih klien.* · *Foto bertanda Hilang disembunyikan sampai ditemukan lagi.* |
| Publish | *Publikasikan galeri?* + *Folder dicek ulang sekarang. Setelah itu klien bisa membuka galeri dengan link dan password yang kamu bagikan.* · refused *Galeri belum bisa dipublikasikan* + *Tidak ada folder yang bisa dibaca saat dicek ulang.* |
| Expiry | *Kedaluwarsa galeri* + *Setelah kedaluwarsa, klien tidak bisa membuka galeri sampai kamu mengubahnya.* · options *Tidak ada kedaluwarsa* / *Sampai tanggal* / *Selama beberapa hari* · helper *Dihitung dari saat galeri dipublikasikan.* · Alert *Galeri kedaluwarsa sejak {date}* + *… Atur tanggal baru atau hapus kedaluwarsa untuk membukanya lagi dengan link dan password yang sama.* |
| Password | *Ganti password galeri* (field *Password baru*, generated, *Buat ulang*) + *Password lama langsung tidak berlaku. Klien yang sedang membuka galeri harus memasukkan password baru.* · toast *Bagikan password baru ke klien. Password lama tidak berlaku lagi.* |
| Remove / archive / delete | *Lepas {folder}?* + *{n} foto dari folder ini disembunyikan dari klien. Folder di Google Drive tidak berubah. Folder yang dilepas tidak bisa dipasang lagi; tambahkan sebagai folder baru bila perlu.* · *Arsipkan galeri?* + *Klien tidak bisa membuka galeri lagi. Galeri yang diarsipkan tidak bisa dipublikasikan kembali.* · *Hapus galeri draf?* + *Galeri, {n} folder, dan data {n} foto dihapus dari Shutrly. File di Google Drive tidak berubah.* |
| F-07 cancel dialog (changed) | Adds *Galeri yang dipublikasikan ikut diarsipkan; klien tidak bisa membukanya lagi.* (BR-PRJ-010) |

## Tokens and components

- **Library components used:**
  - Shells and structure: App Shell, Mobile App Shell, Page Header, Compact Bar, Section Card (Default, Default/Flush, Compact, Compact/Flush).
  - Lists and states: List Card Item/Two-line (+ Skeleton), Tabs, Segmented Control/Full width, Status Chip (Neutral, Info, Success, Warning, Danger, Accent), Empty State/In card, Alert (Info, Warning, Danger).
  - Controls: Button (Primary, Secondary, Danger; Disabled, Loading), Icon Button Outline, Action Menu MD/SM, Menu, Menu Item (Default, Destructive, Disabled), Menu Divider.
  - Forms and overlays: Text Field (Default, Error), Select, Radio, Modal SM/MD, Bottom Sheet Form/Actions, Sheet Item, Toast Success/Danger.
- **Library components added for F-09 (2026-10-04):**
  - **C46 Photo Tile** (`r:AzJU9` Default, `r:HEwJS` Missing, `r:e0pYUm` Skeleton): image heights are overridden to 220 on desktop and 104 on phones.
  - **C47 Folder Tile** (`r:NWvmt`).
  - **C48 Media Viewer** (`r:rbwFa` Desktop, `r:cLkBF` Mobile, Filmstrip Thumb `r:IGxRK` / `r:xyliD`).
  - Specs are in `docs/design-system/components/photo-tile.md`, `folder-tile.md` and `media-viewer.md`. The preview frames are still drawn from plain frames that match C48; build them from `Media Viewer` in code.
- **Sample images:** stock photos in *Assets / Sample photos*. They are design placeholders, not product content.

### Findings
- **COMPONENT GAP-1/2/3 — resolved 2026-10-04:** Photo Tile, Folder Tile and Media Viewer were promoted to the library as C46–C48, with 26 new tokens (623 in total, checksum `c2c0a40b`). Their code units belong in `src/ui/` (shared with F-10).
- **Exception — Modal/LG width:** *Semua foto* widens Modal/LG from 720 to `size.content-max` (1096) and fixes its height to the viewport minus 40 on each side. Code should add a Modal `size="xl"` (full width up to `size.content-max`) rather than override inline. Record it in `modal.md` when promoting.
- **Token rule amendment, APPROVED 2026-10-04** (Owner: "amandemen aturan surface.inverse aja"): `token-usage.md` now allows `surface.inverse` as the full-screen backdrop of a media viewer, with `text.inverse` on it. Library board 07 (*Usage rules*) still shows the old row; refresh it with the next `/sdv:design-rules` or `/sdv:sync-pencil` pass.
  - **Filmstrip, Owner decision 2026-10-04:** inactive thumbnails are dimmed to opacity 0.6, and the current one is full opacity with a `text.inverse` outline. This is an accepted exception to G7: it dims photos, not a colour variant.
  - **DESIGN TOKEN GAP:** the 0.6 value has no token, because only `opacity.hover-overlay` exists. Propose `opacity.media-inactive` (0.6) with the backdrop decision in `/sdv:design-rules`.
- **Token-usage exceptions:** the Modal width above, and filmstrip opacity (G7 exception, Owner-approved; token gap).
  - The image placeholder uses `surface.sunken`, which G1 allows for recessed areas.
  - The missing badge uses Status Chip/Warning.
  - No hex, opacity variants or off-scale spacing.
- **Dark mode:** `E0ycV4` and `m9F803` were checked in the `r:mode = dark` theme (checked under the old `s:` prefix). Surfaces, chips and text stay legible, and the photos are unchanged.
- **SPEC GAP:** none found while designing. The password concern raised in review is FC-007 (RESOLVED: constitution v1.1, ADR-017).
- **F-03 follow-up:** the template preview note saying the password is entered when sharing (F-03 A-6) is outdated. Update it in F-15.
- **Sharing (deferred, Owner 2026-10-04):** the gallery page has no link or share action in F-09. Sharing stays in F-10 (the *Kirim link galeri* item in the project menu, `/g/{token}`) and F-15 (WhatsApp). Whether the gallery page itself also gets *Salin link* / *Kirim ke klien* is decided in F-10 discovery.
- **Copy changed outside F-09:** the F-07 *Batalkan proyek?* dialog gains one sentence. Record it in the F-07 copy when F-09 is built.

## Approval

- [x] Owner reviewed the frames and approved them, 2026-10-04 ("1 approve").
- [x] `gallery.pen` saved: 3,524,610 bytes, 2026-10-04 05:03, imports the worktree library under `r:` (623 variables).
- [x] HTML exports written to `exports/`. The compact exports were removed later (Owner, 2026-10-04); build from the raw files.
