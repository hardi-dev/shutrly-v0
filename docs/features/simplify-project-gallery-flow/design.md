# F-27 Simplify project and gallery creation — design

- **Pencil file:** [simplify-project-gallery-flow.pen](simplify-project-gallery-flow.pen), copied from the `feature-consumer.pen` template on 2026-10-18.
- **Library:** `docs/design-system/design-system.lib.pen` from the main checkout, imported by the Owner on 2026-10-18 with the prefix **`Y:`**. Checked through MCP: 626 variables (theme axis `Y:mode` light/dark), library boards C01–C48 visible.
- **Method (Owner 2026-10-18):** the Owner pastes the source frames from `gallery.pen` and `client-access.pen` through the Pen UI; the agent remaps their refs and tokens to `Y:` and edits only what F-27 changes.
  - 15 frames pasted: from `client-access.pen` `HT8V6`, `iGwTx`, `r71J5`, `QUSVb`, `jwDqh`, `YcDEU`, `w7R5h`, `LxqJO`; from `gallery.pen` `qj2c9`, `skcOw`, `OU5yj`, `yeXEI`, `u50YVM`, `SKq3v`, `ZiJzF`.
  - **Deviation, Owner-approved 2026-10-18:** pasting across files detached every library instance into plain frames. All ~10,000 token references were remapped from `$3:` / `$r:` to `$Y:` through MCP (0 old prefixes, 0 unknown tokens afterwards), so colours, spacing and type still follow the library, but later library component changes don't reach these frames. They exist only for this feature's design and exports.
  - The two source files were left unchanged (the temporary copy frames were reverted with `git restore`).
- **Exports:** 27 HTML exports in [`exports/`](exports/) (html-tailwind, through Pencil MCP), one per state frame, named `<screen>-<state>-<device>-<frameId>.html`; photos load from Unsplash URLs, no local assets.
- **Export index:** `python3 scripts/sdv/index-exports.py simplify-project-gallery-flow` wrote [`exports/INDEX.md`](exports/INDEX.md): 12 states, every file matched.
- **Rules:** `docs/design-system/token-usage.md` v3.1 (APPROVED).
- **Direction:** change only what F-27 changes. Start from the current frames — F-09 [gallery.pen](../gallery/gallery.pen) and F-10 [client-access.pen](../client-access/client-access.pen) (gallery page `HT8V6` / `iGwTx`, *Akses klien* `zMo79` / `DIPEh`) — and keep their structure, components and copy, minus the gallery status.
- **Status:** **APPROVED 2026-10-18** (Owner: "menyetujui desain F-27"; `.pen` saved, 6.7 MB, 20:07). Design review 2026-10-18 (Owner): no visible "publish" anywhere, final delivery included (intent D-9, D-10); checked through MCP, 0 visible mentions of *publik*/*arsip* in F-27 frames.

## Frames
All F-27 frames sit left of the library boards (x < 0). Desktop frames are 1440 wide, phone frames 390. Columns: desktop at x, phone at x + 1560.

| Row | y |
|---|---|
| Gallery page (G) | 0 |
| Dialogs (D) | 2600 |
| Project pages and Galeri card board (P) | 4000 |
| Client (C) | 6400 |
| Share dialog (K) | 8000 |

### Gallery page (`/projects/[id]/gallery`)
| # | State | Desktop | Phone | AC |
|---|---|---|---|---|
| G1 | No folder yet: no status chip, no publish/archive/delete; *Pilihan klien* open at 0; *Hasil akhir* disabled; *Sumber foto* and *Foto* empty | `gcbAc` | `fzdaB` | AC-GFL-001, 006, 007 |
| G2 | With photos (replaces F-09/F-10 *Dipublikasikan*); *Foto* says "visible to clients with the link and password"; *Hasil akhir* has no publish button and says clients can download once synced | `jJGNf` | `NQx4P` | AC-GFL-006, 008, 019 |
| G3 | Expired: chip *Kedaluwarsa*, Alert + *Ubah kedaluwarsa* | `t96k0T` | `k9Jb3e` | AC-GFL-012 |
| G4 | Closed (project cancelled): chip *Ditutup*, Alert, every change action hidden | `VdyFM` | `M3ykQz` | AC-GFL-016 |

### Dialogs
| # | State | Desktop | Phone | AC |
|---|---|---|---|---|
| D1 | *Kedaluwarsa galeri*: *Selama beberapa hari* with the *Durasi* dropdown (14 hari) and the resulting date; counted from saving | `qRYin` | `VvlTb` | AC-GFL-010 |
| D2 | *Sampai tanggal* with a date before today: field error *Pilih hari ini atau tanggal sesudahnya.* | `elFQl` | `VXIKU` | AC-GFL-011 |
| D3 | *Lepas folder* on the last folder: photos removed, *Kirim link galeri* hidden until a folder is added | `xFdwL` | `JhIKa` | AC-GFL-015 |

### Project page
| # | State | Desktop | Phone | AC |
|---|---|---|---|---|
| P4 | Delivered project page: *Galeri* card summary without the gallery status row; *Hasil akhir* row says *Terkirim* | `LMXgW` | `A1y8J` | AC-GFL-006 |
| P7 | Post-production project page: *Tandai terkirim* as the header step (action bar on phones); *Hasil akhir* row *Siap diunduh* and visible to the client | `KUq9i` | `uc9Jx` | AC-GFL-017, 019 |
| P1–P6 | Board of *Galeri* card states: P1 draft project, P2 booked without folder (*Tambah folder Drive*), P3 syncing, P4 has photos (one folder failed), P5 expired, P6 cancelled (*Ditutup*); F-09's state G (cancelled draft gallery) hidden | `M4XBCN` | — | AC-GFL-004, 007, 012, 013, 016 |

### Client
| # | State | Desktop | Phone | AC |
|---|---|---|---|---|
| C1 | *Beranda* before any photo: *Semua foto* says the photographer hasn't added photos yet; groups at 0, *Mulai memilih* disabled | `Iut8G` | `loSnK` | AC-GFL-009 |
| C2 | *Semua foto* with no photos (the F-10 empty state, count 0) | `EMw7t` | `maNA0` | AC-GFL-009 |

### Share dialog (Owner 2026-10-18: a modal on desktop, a bottom sheet on phones, not a page)
| # | State | Desktop | Phone | AC |
|---|---|---|---|---|
| K1 | *Kirim link galeri*: *Kepada*, the rendered `GALLERY_SHARE` message in the preview bubble, password note, *Ubah template*; *Salin pesan* + *Buka WhatsApp* | `g55bdZ` | `ttcfb` | AC-GFL-021, 022, 023 |
| K2 | Client without a WhatsApp number: Alert, *Tambah nomor WhatsApp*, *Buka WhatsApp* disabled | `Ca2HG` | `a6CB4A` | AC-GFL-024 |

The dialogs sit over the F-09 gallery frame used by D1–D3. The preview bubble follows F-03's message preview (`communications/ui/message-preview`). The refused state (AC-GFL-025) uses the gallery dialogs' error pattern and isn't drawn.

### *Kirim link ke klien* (Owner design review 2026-10-18, intent D-11)
Primary button with the `send` icon, a copy of the library Button/Primary/MD. Shown where BR-GAL-010 holds: G2 and the P4/P7 pages, board states P3 and P4. Hidden in G1, G3, G4 and board states P1, P2, P5, P6. Placement (Owner design review 2026-10-18): on the *Galeri* card, last in the header actions, after *Kelola galeri* (desktop), full width below the card content (phones); on the gallery page, in the page header after the ⋯ menu (desktop) and in the sticky action bar (phones). *Akses klien* keeps *Ganti link* and *Ganti password* as in F-10. The F-09 gallery frames behind D1–D3 keep their old header and don't show it. AC-GFL-020.

### Defined but not drawn
- **M1 project menu:** *Kirim link galeri* follows BR-GAL-010 (`BOOKED` to `COMPLETED`, a linked folder, open gallery); the menu itself is unchanged from F-07/F-10.
- ***Tandai terkirim* confirmation and its disabled state** (no finished file yet): the F-07 status-step confirmation pattern, as for *Selesai pemotretan*.
- **D1 dropdown open:** the C19 Select list with 7, 14, 30, 60 and 90 hari (spec A-1).
- **P cards on phones:** the same card in Section Card/Compact, as in F-09.

### Removed (no frame)
F-09 *Buat galeri* dialog, *Publikasikan*, *Publikasi ditolak*, *Arsipkan*, *Hapus galeri draf*, the *Diarsipkan* page and the cancelled-project draft gallery; F-10 *Publikasikan hasil akhir* and its confirmation (Owner design review 2026-10-18, intent D-9). Recorded so plan-feature deletes their UI.

## Tokens and components
- Only library tokens (`$Y:`), remapped from the pasted frames; no new tokens and no local components.
- Disabled buttons use `Y:opacity/disabled`; the date error uses `Y:component/input/border-error` and `Y:component/input/error-text`.
- No token-usage rule exceptions.
