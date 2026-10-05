# F-10 Client access — design

- **Pencil file:** [client-access.pen](client-access.pen), copied from the `feature-consumer.pen` template. The flow exploration that came before it is [client-access-exploration.pen](client-access-exploration.pen) (boards `wfIbj` Flow A, `kcydm` Flow B).
- **Library:** imports the worktree's `docs/design-system/design-system.lib.pen` with the prefix **`3:`**. The link is live: 626 variables (checksum `78563812`, including `color.semantic.surface.on-media` added for F-10) and every library component listed below. A second, unused import `r:` (46 variables, no node uses it) is still in the file; remove it in the Pen UI.
- **Rules:** `docs/design-system/token-usage.md` v3.1 (APPROVED), with the F-10 amendment for `surface.on-media` (see Findings).
- **Direction:** Owner decisions, 2026-10-05 and 2026-10-06:
  1. **Flow B · Beranda tugas** (chosen over Flow A in the exploration file). After the password the client lands on **Beranda**, a hub of tasks: *Foto Anda* (Semua foto, Hasil akhir) first, then one *Pilih foto* card per selection group (spec A-24). One group is opened at a time: **Pilih** → **Tinjau** → **Kirim** (A-25…A-29). Without groups and without final delivery the client goes straight to *Semua foto* (A-31).
  2. **Narrow content:** Beranda, Tinjau and Lihat pilihan use the 720 column (`size.content-narrow`) on desktop; Pilih, Semua foto and Hasil akhir use the 1096 container (`size.content-max`).
  3. **Photo grid:** 4 per row on desktop and 2 on phones; a short last row keeps the column width (A-28). The Owner's phone view of picks uses 1 column.
  4. **Print quantities are set on Tinjau**, not on the tile (AC-SEL-018).
  5. ***Pilih untuk…* in the viewer** adds the open photo to a group (A-30, AC-SEL-019).
  6. **Pick notes (A-32, FC-009):** optional, up to 500 characters, only for items with `allowsPickNotes`. Written while picking via a *Catatan* button on each picked tile (option B), from the viewer next to *Pilih untuk…*, and on Tinjau (*Ubah catatan* / *Tambah catatan*). Notes show in an **Alert/Info** inside Pick Row; read-only after submit. The *Catatan* button on the photo uses `surface.on-media` (80 % surface).
  7. **Page header:** desktop client pages show a **breadcrumb** (*Beranda › … › page*; utilities off, aligned with the title) instead of back buttons. Phones keep a *Beranda* / *Kembali* button at the top of the content, because the library Mobile Header has no breadcrumb. Beranda greets the client by first name (*Halo, Rina*); there are no tabs on any client page.
  8. **Hasil akhir downloads (option A, 2026-10-06):** an **Unduh ▾** button in the Page Header opens a menu with *Unduh semua (n)* and *Pilih beberapa* (a bottom sheet on phones). While picking several, the header shows *n foto dipilih · Batal · Unduh n foto*. The card header keeps only the *Edited / Print* switch.
  9. **Owner pages** follow the dashboard patterns: each F-10 card on the project page starts its own flow (Pilihan klien, Add-on, Hasil akhir & selesai, Akses klien & ganti link).
- **Status:** **APPROVED 2026-10-06** (Owner: "approve").
- **Exports (2026-10-06):** 125 HTML exports (html-tailwind, through Pencil MCP) in [`exports/`](exports/), one subfolder per flow group (`klien-1-gerbang/` … `owner-6-katalog/`), named `<screen>-<state>-<device>-<frameId>.html`. Only states with their own layout are exported (Owner: "export yang perlu saja"). Not exported, because they reuse an exported layout with different copy or a library state: *memeriksa* (button loading), Beranda *dibuka lagi*, Semua foto *cari kosong* / *tanpa foto* (Empty State), Pratinjau *catatan*, Pilih *sudah dikirim*, Tinjau *mengirim*, Beranda *pilihan dikirim*, Hasil akhir *tanpa print*, Owner *dikunci* / *tanpa grup* / *galeri belum terbit* / *kosong* / *setujui (grup terbuka)* / *memproses*, and every toast.
- **Export index:** `python3 scripts/sdv/index-exports.py client-access` wrote [`exports/INDEX.md`](exports/INDEX.md), grouped by subfolder (the script now reads subfolders; flat folders such as `gallery/exports` index as before). `--check` passes.

## Frames

**Canvas layout:** two component boards at y −4400 (*B · Komponen lokal* `Q7CAFN` at x 21000, *A · Komponen library* `X7FTwg` at x 25672). Below them, one row per flow from x 21000: a blue `Grup · …` band, a `Langkah · …` caption per step, then the frames left to right in flow order, desktop then phone. Desktop frames are 1440 wide and phone frames 390; dialog, sheet, menu and toast frames are one viewport tall, page frames as tall as their content.

### Klien 1 · Gerbang (`/g/{token}`)
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Password page | `A3bQ0` | `XIUZy` | AC-ACC-001 |
| Checking the password | `eZX1i` | `KkFfd` | AC-ACC-001, 014 |
| Wrong password | `KpxQW` | `Keh28` | AC-ACC-002 |
| Too many attempts | `DNzk6` | `AINFT` | AC-ACC-003 |
| Link not available (one neutral page) | `KOnTl` | `tCfyy` | AC-ACC-004, 010 |

### Klien 2 · Beranda
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Nothing picked yet | `jwDqh` | `YcDEU` | AC-SEL-001, 017 |
| Foto edit submitted | `jXn9U` | `GDmmw` | AC-SEL-008, 017 |
| Add-on reopened a group | `iPUjO` | `uEavO` | AC-ADD-007 |
| Final delivery ready (*Hasil akhir siap* first) | `UIXl3` | `D5Jol` | AC-DEL-001, AC-SEL-020 |

### Klien 3 · Semua foto
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Loading | `QndDK` | `rN1VN` | AC-ACC-014 |
| Root folders | `ra85A` | `WrhM7` | AC-ACC-011 |
| Inside a folder | `tMGaA` | `pSZXj` | AC-ACC-011 |
| Search results | `e5LAB` | `WdRrc` | AC-ACC-011 |
| Search, no result | `SvDCj` | `uRFxt` | AC-ACC-014 |
| Empty gallery | `w7R5h` | `LxqJO` | AC-ACC-014 |
| Failed to load | `HfiWB` | `UwBet` | AC-ACC-013, 014 |
| Project without groups (landing, no *Beranda*) | `N8a0x` | `rbwM6` | AC-SEL-012, 020 |

### Klien 4 · Pratinjau (viewer)
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Viewer | `NxnKv` | `h6GAvI` | AC-ACC-013 |
| *Pilih untuk…* menu | `eG55x` | `CV94I` | AC-SEL-019, 007 |
| Photo has a note | `Tpii0` | `npEUd` | AC-SEL-021 |
| Writing a note | `J9NvbJ` | `ThH3S` | AC-SEL-021 |

### Klien 5 · Pilih
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Picking Foto edit | `U6NYNS` | `jYelj` | AC-SEL-002 |
| *Catatan* button on a picked tile | `Y1CaC` | `MPuHg` | AC-SEL-021 |
| Writing a note | `L8fHE` | `eBuRz` | AC-SEL-021 |
| Limit reached | `LcFiB` | `SuHNx` | AC-SEL-003 |
| Picking Foto cetak | `vrwAk` | `qqcjQ` | AC-SEL-005, 016 |
| Group already submitted (error) | `PnwLD` | `bCGUt` | AC-SEL-014 |

### Klien 6 · Tinjau & kirim
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Tinjau Foto edit | `Iq6ek` | `s8USed` | AC-SEL-008, 021 |
| Editing a note on Tinjau | `sjqE6` | `owgEY` | AC-SEL-021 |
| Submit below the limit (confirm) | `zasqO` | `eTdE8` | AC-SEL-008 |
| Submitting | `Gd0wP` | `aDMRX` | AC-SEL-008, AC-ACC-014 |
| Back on Beranda + toast | `SWjao` | `WRNMD` | AC-SEL-008, 017 |
| Tinjau Foto cetak (quantities) | `OOwiB` | `dsBNi` | AC-SEL-005, 018 |
| Nothing picked | `KNxuX` | `q4BBE` | AC-SEL-009 |

### Klien 7 · Lihat pilihan
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Submitted picks, read-only | `zN3UH` | `q2OlpN` | AC-SEL-008, 021 |

### Klien 8 · Hasil akhir
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Edited files ready | `yNbAb` | `Ywmh5` | AC-DEL-001, 003 |
| *Unduh ▾* menu open | `omVU7` | `AHwGX` | AC-DEL-003 |
| Confirm *Unduh semua* | `ElySE` | `eoCbU` | AC-DEL-003 |
| Downloading | `aa1t2` | `u4IeBJ` | AC-DEL-003 |
| A file failed | `nHfQC` | `pT6mg` | AC-DEL-005 |
| Picking several | `Uolbi` | `t3LCP7` | AC-DEL-003 |
| File preview | `NsZoz` | `WniyG` | AC-DEL-003 |
| Print tab | `ivJbx` | `lrrF4` | AC-DEL-004 |
| No print files | `EXbfK` | `X8n3B` | AC-DEL-004 |

### Owner 1 · Pilihan klien
| Step | Desktop | Phone | AC |
|---|---|---|---|
| *Pilihan klien* card on the project page | `hu4V8` | `pVhF3` | AC-SEL-010 |
| Waiting for the client | `V8hUXM` | — | AC-SEL-010 |
| Some groups submitted | `X6hz46` | `t3YWpu` | AC-SEL-010 |
| All locked | `POazf` | — | AC-SEL-011 |
| No groups | `vH55s` | — | AC-SEL-012 |
| Gallery not published | `K0npOm` | — | AC-ACC-001 |

### Owner 2 · Detail pilihan grup
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Open | `xoOFm` | — | AC-SEL-010 |
| Submitted | `rhnVU` | `BFe8M` | AC-SEL-010, 021 |
| Toast *nama file disalin* (with notes) | `aLXT9` | `FW3QC` | AC-SEL-010 |
| Confirm *Kunci pilihan* | `t1goVj` | `BEgqG` | AC-SEL-011 |
| Toast *pilihan dikunci* | `ROjxI` | `x5YUa` | AC-SEL-011 |
| Locked | `Jevbr` | — | AC-SEL-011 |
| Confirm *Tutup pilihan* (nothing submitted) | `rYTOm` | `O6ldJt` | AC-SEL-011 |
| Print group | `O9IowE` | — | AC-SEL-005 |
| A picked photo is missing | `eptRn` | — | AC-SEL-015 |
| Empty | `y6qjf` | — | AC-SEL-010 |

### Owner 3 · Add-on
| Step | Desktop | Phone | AC |
|---|---|---|---|
| *Add-on* card on the project page | `I1rArz` | `Wm00h` | AC-ADD-001 |
| Menu, draft | `Q45ZqR` | `lCib1` | AC-ADD-001 |
| *Tambah add-on* | `vkFKg` | `I94a1f` | AC-ADD-001, 002 |
| *Tambah add-on*, errors | `fKZng` | `jhp7x` | AC-ADD-003, 006 |
| Approve (group submitted) | `AN4pY` | `OuXAq` | AC-ADD-001, 007 |
| Approve (group open) | `Rb9xp` | `mmEgd` | AC-ADD-001 |
| Toast *add-on disetujui* | `LWeFq` | `hAUS4` | AC-ADD-001 |
| Menu, approved | `DFYKy` | `lfOW1` | AC-ADD-004 |
| Cancel | `T4teC` | `Noxsi` | AC-ADD-005 |
| Cancel refused | `Lrxus` | `fDHWi` | AC-ADD-005 |
| Toast *add-on dibatalkan* | `Z3zcE` | `tIBxa` | AC-ADD-005 |

### Owner 4 · Hasil akhir & selesai
| Step | Desktop | Phone | AC |
|---|---|---|---|
| *Hasil akhir* card on the project page | `bLPAH` | `d3iypK` | AC-DEL-001 |
| Menu | `k5mu5` | `VdXx4` | AC-DEL-001, 007 |
| Confirm publishing | `F9X1a` | `f9eIWy` | AC-DEL-001 |
| Publishing refused | `FjMco` | `amshA` | AC-DEL-002 |
| Toast *hasil akhir dipublikasikan* | `b5DiaA` | `EvB6o` | AC-DEL-001 |
| Confirm *Tandai selesai* | `ZHOq1` | `o7DEB` | AC-DEL-007 |
| Toast *proyek selesai* | `nKZE9` | `x4bhZ7` | AC-DEL-007 |

### Owner 5 · Akses klien & ganti link
| Step | Desktop | Phone | AC |
|---|---|---|---|
| *Akses klien* card on the project page | `zMo79` | `DIPEh` | AC-ACC-009 |
| Confirm *Ganti link* | `V0gYsZ` | `h2Ifa` | AC-ACC-009 |
| Processing | `wVCqi` | `uFgsX` | AC-ACC-009 |
| Toast *link diganti* | `UPDpQ` | `olg9k` | AC-ACC-009 |

### Owner 6 · Katalog item paket (F-05 change)
| Step | Desktop | Phone | AC |
|---|---|---|---|
| Item list | `G1z3T` | `m6TE1` | AC-CAT-001 |
| Selection off | `j6GL8r` | `E7KkOR` | AC-CAT-001 |
| Count photos (notes on) | `AT5Aw` | `trGFW` | AC-CAT-001, AC-SEL-021 |
| Quantity per photo (notes off) | `GguU9` | `yvL3e` | AC-CAT-001 |
| Locked (item in use) | `Sa0dG` | `QsOoK` | AC-CAT-001 |

### Defined but not drawn separately
- **Owner pages on phones:** only *Pilihan klien · dikirim* and *Pilihan · dikirim* are drawn. The other Owner page states use the same Mobile App Shell + Section Card/Compact pattern as F-07/F-09.
- **Pilih *Dipilih* filter, Lihat pilihan · dikunci, Tinjau at the full limit:** same layouts as the drawn states with the filter, chip or count changed.
- **Tablet and dark mode:** not drawn (GAP-01, GAP-04). The shells are built from semantic tokens, so dark mode follows the library theme.

## Tokens and components

Two boards on the canvas show the split; use them when reading the exports.

- **A · Komponen library** (`X7FTwg`): every library component F-10 uses, with its library page and whether it exists in `src/ui`.
  - Actions: Button (Primary, Secondary, Danger; MD, LG, Disabled), Icon Button Ghost SM, Menu, Menu Item.
  - Status and feedback: Status Chip (Info, Neutral, Success, Warning, Danger), Alert (Info, Success, Warning, Danger), Toast (Success, Danger).
  - Forms: Text Field (Default, Error, Disabled), Textarea, Select, Input/Search, Switch, **Stepper**, Segmented Control (+ Full width), Option Card.
  - Content: Section Card (Default, Default/Flush, Compact, Compact/Flush), List Card Item/Two-line, Empty State (+ In card), Photo Tile (Skeleton, Missing), Folder Tile, Filmstrip Thumb.
  - Overlays and structure: Modal (SM, MD), Bottom Sheet (Form, Actions), Sheet Item, Page Header, Mobile Header, Bottom Nav, App Shell (Owner), Media Viewer (Desktop, Mobile).
  - **Stepper (C08) is the only library component not yet in `src/ui`**; build it before the Foto cetak screens.
- **B · Komponen lokal** (`Q7CAFN`): masters that exist only in this file.

  | Component | Node | Plan |
  |---|---|---|
  | Pick Tile | `j1xyVG` | **Promote now** as *Photo Tile/Selectable* (the Owner pages use it too). Photo Tile plus a select control, a quantity chip and a note marker (`FagWc`). |
  | Client Header/Desktop · /Mobile | `gloCE` · `Qk0C6` | **Wait for F-14.** Promote if the public invoice page `/i/{token}` uses the same brand bar. |
  | Client Shell/Desktop · /Mobile | `a7uMtC` · `BhBua` | **Wait for F-14**, as above. Desktop: brand bar, Page Header with breadcrumb (utilities and tabs off), Content 1096, Overlay and Toast slots. Mobile: brand bar, Mobile Header, Content, Overlay (Sheet) and Toast slots. |
  | Group Summary | `SBwD1` | **Stays local** (feature component): group name, status chip, usage bar, Tinjau/Kirim. |
  | Pick Row | `Xig4E` | **Stays local** (feature component): thumbnail, file name, folder, Trailing slot (remove button or Stepper), Note with Alert/Info and *Ubah catatan*. |

### Findings
- **Token amendment, APPROVED 2026-10-05** (Owner: "Setujui, 80%"): new token `color.semantic.surface.on-media` (light `alpha.neutral-0-a80`, dark `alpha.neutral-850-a80`) for controls on top of photos, such as the *Catatan* button. Added to `tokens.json`, `pencil-mapping.json` (626 tokens, checksum `78563812`), `tokens.css` and the library (board 01 alpha row, board 02 swatch `OipvM`); recorded in `token-usage.md`.
- **Exception, SP layout:** the narrow column width is the literal 720 in Pencil because frame width can't bind to a variable. In code use `size.content-narrow`.
- **Pencil drawing of menus:** the open *Unduh ▾* menu in `omVU7` sits absolutely inside the Content slot; in code it is a normal popover anchored to the button.
- **Phone navigation:** the library Mobile Header has no breadcrumb, so phones keep back buttons. If more public pages need it, propose a breadcrumb row for the Mobile Header with the F-14 promotion.
- **SPEC GAP:** none open. A-31 (skip Beranda without groups and without final delivery) and the Hasil akhir download menu are Owner decisions recorded in the spec and here.
- **Token-usage check:** semantic tokens in layouts, component tokens inside components; no hex values or off-scale spacing in the frames.

## Approval

- [x] Owner reviewed the frames and approved them, 2026-10-06 ("approve").
- [x] `client-access.pen` saved: 1,809,765 bytes, 2026-10-06 01:31, imports the worktree library under `3:` (626 variables).
- [x] HTML exports written to `exports/` (125 files, by flow group), and `index-exports.py client-access` run (`--check` passes).
