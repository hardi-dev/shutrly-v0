# F-20 Delivery folder mapping — build notes

Built 2026-10-07 on `feat/client-access` straight from the accepted [intent](intent.md), without spec/AC/Pencil (Owner: "build langsung aja, nanti di catat di akhir"). The rule is BR-GAL-007 (replaced).

## What it does
- *Sumber foto* › folder ⋯ › *Edit folder*: the name, and *Subfolder hasil akhir* with one choice per subfolder found by the last sync: *Tetap foto proof* or a selection item of this project's package. One *Simpan* saves both; photos are reclassified at once (no re-sync).
- No selection item in the package: a short notice with *Buka Isi paket* (Owner: keep it simple). No subfolders yet: *Sinkronkan dulu*.
- A sync that finds subfolders the Owner hasn't seen yet shows a toast *n subfolder baru di {folder}* with *Petakan*, which opens *Edit folder*.
- Client *Hasil akhir*: one tab per package item (was *Edited / Print*), every selection item of the package even when it has no file yet, opening on the first item with files (Owner manual test 2026-10-08); files synced before F-20 without an item fall back to an *Edited* / *Print* tab.

## Rules (Owner 2026-10-07)
- Per linked folder; items offered are this project's selection items only; one subfolder → one item; *Edit folder* lists the package items and each picks one subfolder or none (Owner manual test 2026-10-07: item first, not subfolder first), and a subfolder another item has is not offered; mapping is optional and may come before the subfolder exists.
- `COUNT` item → `EDITED`, `QUANTITY` item → `PRINT`; the longest mapped folder wins; the mapped level is folded out of the browse path.
- No name is recognised by itself any more (`edited` / `print` included). Unmapped subfolders stay proofs and still show in the grid.
- A client pick of a photo that becomes a finished file stays. No migration of old data (still in development).

- **Empty subfolders are listed too** (Owner manual test, 2026-10-07: a photographer prepares the folders before uploading). A sync records every subfolder within the depth limit in its cursor and, when the run ends, stores them in `gallery_source.known_folders`. *Edit folder* lists those plus any folder that holds photos, and the new-folders toast names empty ones too. No migration.

- **Owner cards per item** (Owner 2026-10-08): the *Hasil akhir* card lists one row per package item with files and names them in the publish dialog and the Galeri card row (`DeliveryGalleryFacts.items`, reader `selectFinishedItems`); the photo and folder counts read *n proof · m hasil akhir*; saving a mapping refreshes the folder row's stored counts.

## Code
- Migration `0018_folder_map` (additive): table `gallery_folder_map`, `gallery_photo.project_item_id`, `gallery_source.known_folders`. Run on the dev database 2026-10-07; the integration database already had it.
- Domain `classifyPhoto(segments, mappings)`, `kindForPickMode`; sync reads the mappings once per step (`SyncTarget.mappings`) and stores `project_item_id`; a finished run returns `newFolders` (`takeNewFolders`).
- Use cases `getFolderMapping` / `setFolderMapping` (gallery lock, items checked against the project, reclassify per folder path, content version +1); actions `getFolderMappingAction` / `setFolderMappingAction`.
- UI: `use-folder-mapping`, `folder-mapping-fields` in `rename-folder-dialog` (*Edit folder*), toast in `use-gallery-sync`; `get-delivery-files` returns `groups`, *Hasil akhir* tabs per item.

## Checks
- Unit/dom: classification (6), walk step, sync step (+new folders), folder mapping (4), sources section (+3), delivery screen and text. Integration: `gallery-sync` (+map-after-sync), `gallery-browse`, `gallery-lifecycle`, delivery files; the fixture's folders are mapped through `setFolderMapping` (`helpers/map-fixture-folders.ts`).
- Browser: not seen (the Owner session had expired; I didn't sign in for it).

## Deviations / open
- No spec, AC or Pencil frames (Owner override); copy marked *built without a Pencil frame*.
- Mapping isn't offered inside *Tambah folder* / *Buat galeri*: subfolders are only known after the first sync, so the new-folders toast's *Petakan* is the "map when adding" path.
- ~~The Owner's *Hasil akhir* card summary still counts *edited · print*~~ Fixed 2026-10-08 (`7afdef4`, `11ccaf6`): owner cards count per item. The Owner's *Semua foto* modal still has Proof / Edited / Print tabs (owner-only view by kind).

## Pencil sync (2026-10-08)
- `client-access.pen`: new frames *Semua foto · Pilih foto*, *Semua foto · mode pilih · Masukkan ke*, *Hasil akhir · tab per item* (Desktop, REVISI 2026-10-08, beside OWNER 7); owner *Hasil akhir* card, publish dialog, Galeri card and photo counts reworded per item and *n proof · m hasil akhir*.
- `gallery.pen`: new frames *Dialog Hapus folder*, *Menu folder / Edit dan Hapus*, *Dialog Edit folder* (mapping and skeleton), *Dialog Buat galeri, dengan folder* and *folder dipakai proyek lain*; every *edited · print* count and *subfolder edited dan print* line reworded.
- Not drawn: phone variants of the new frames; the session dialogs' *Tambah anggota* (`team-sessions.pen` could not be opened through the Pencil MCP); the new Hugeicons download and pick icons (Pencil uses its own icon set).
