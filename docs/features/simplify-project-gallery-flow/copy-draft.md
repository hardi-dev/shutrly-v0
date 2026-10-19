# Copy draft — simplify-project-gallery-flow (F-27)

Draft for Owner review (plan task 5.1). Nothing here is in the `*.copy.ts` files or `copy-deck.md` yet.

**Sources:** design text from `exports/` (desktop frames, wording used as-is unless noted), `acceptance-criteria.md`, `copy-deck.md` §10, §14, §15, the existing `gallery-copy.copy.ts`, `delivery.copy.ts`, `client-home-screen.copy.ts`, `client-browse-screen.copy.ts`, `project-copy.copy.ts`. Draft wording first produced by Codex (`codex exec`), reviewed against the design and the glossary.

**Status:** `new` · `changed` (replaces an existing string, shown in Notes) · `existing` (reuse, no change) · `remove`.

**Glossary:** galeri = gallery · folder = Google Drive folder · klien = client · Hasil akhir = final files · Kedaluwarsa = expiry · Ditutup = closed · Terkirim = delivered · kata sandi = password.

**Counts:** 86 table rows: new 44 · changed 17 · existing 25. Plus 8 remove rows (see To remove).

---

## Iteration 5 — Owner gallery card, page, dialogs, delivery

File for owner gallery strings: `src/features/gallery/ui/gallery-copy/gallery-copy.copy.ts` (namespace `gallery`, `en` and `id` blocks). Delivery: `src/features/gallery/ui/delivery-copy/delivery.copy.ts`.

### 5a Gallery card on project detail (P1–P6)

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| gallery · `cardTitle` | Card title | Galeri | Gallery | existing | §10.1 Project gallery card |
| gallery · `cardDescription` | Card description | Foto proyek dari folder Google Drive kamu. | Project photos from your Google Drive folder. | existing | §10.1 |
| gallery · `cardDraftProjectTitle` | P1 draft project, AC-GFL-004 | Galeri dibuat saat proyek dibooking | Gallery is created when the project is booked | changed (was "Galeri tersedia setelah pemesanan dikonfirmasi" / "Galeries are available after booking") | §10.1 |
| gallery · `cardDraftProjectBody` | P1 body | Konfirmasi booking dulu; galeri dan kata sandinya dibuat otomatis. | Confirm the booking first; the gallery and its password are created automatically. | changed (was "Konfirmasi pemesanan dulu, lalu buat galeri untuk proyek ini.") | §10.1 |
| gallery · `cardNoFolderTitle` | P2 booked, no folder, AC-GFL-007 | Belum ada folder | No folder yet | new | §10.1 (new row) |
| gallery · `cardNoFolderBody` | P2 body | Galeri sudah siap dengan kata sandi. Tambahkan folder Google Drive berisi foto proyek ini, lalu kirim link ke klien. | The gallery is ready with a password. Add a Google Drive folder with this project’s photos, then send the link to the client. | new | §10.1 |
| gallery · `addFolderCta` | P2 action | Tambah folder Drive | Add Drive folder | new (dialogs keep existing `addFolder`) | §10.3 |
| gallery · `cardSyncingSummary` | P3 summary line | {count, plural, other {# folder}} · menyinkronkan {done} dari {total} folder | {count, plural, one {# folder} other {# folders}} · syncing {done} of {total} folders | new | §10.4 |
| gallery · `cardFailedBody` | P4 failed folder, body | {names} belum bisa dibaca. Buka galeri untuk melihat penyebabnya. | {names} couldn’t be read. Open the gallery for details. | existing (wording matches the design) | §10.4 |
| gallery · `cardFailedTitle` | P4 failed folder, count | {count} folder gagal disinkronkan | {count} folder failed to sync | new | §10.4 |
| gallery · `statusExpired` | P5 chip | Kedaluwarsa | Expired | existing | §10.1 |
| gallery · `expiredSince` | P5 summary | Kedaluwarsa sejak {date} | Expired since {date} | existing | §10.1 |
| gallery · `statusClosed` | P6 chip, A-3 | Ditutup | Closed | new (no existing closed chip; `statusArchived` is a different state) | §10.1 |
| gallery · `cardClosedTitle` | P6 summary title | Proyek dibatalkan, galeri ditutup | Project cancelled, gallery closed | new | §10.1 |
| gallery · `sendLink` | *Kirim link ke klien* button, AC-GFL-020, shown on P3/P4 and G2 | Kirim link ke klien | Send link to client | new | §10.1 and §10.6 |
| gallery · `view` | P6 action | Lihat galeri | View gallery | existing | §10.1 |

### 5b Gallery page states (G1–G4)

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| gallery · `pageMetaNoFolder` | G1 header meta, AC-GFL-001 | {title} · Belum ada folder · Tanpa kedaluwarsa | {title} · No folder yet · No expiry | changed (was `sourceCount` + `expiryNoneMeta` composition; the design shows this single line) | §10.1 |
| gallery · `sourcesEmptyBody` | G1 sources empty, AC-GFL-007 | Belum ada folder. Tambahkan folder Google Drive berisi foto proyek ini; setelah itu kamu bisa mengirim link galeri ke klien. | No folder yet. Add a Google Drive folder with this project’s photos; then you can send the gallery link to the client. | changed (was `sourcesEmptyBody`, now names the send step) | §10.3 |
| gallery · `pickNoteEmpty` | G1 "Pilihan klien" note, AC-GFL-001 | Klien bisa memilih setelah foto masuk. | The client can choose once photos arrive. | new | §10.5 |
| gallery · `finalEmpty` | G1 *Hasil akhir* empty | Belum ada file hasil akhir. | No final files yet. | new | §10.5 |
| gallery · `visibilityPublished` | G2 *Foto* visibility | Terlihat oleh klien yang punya link dan kata sandi. | Visible to clients with the link and password. | changed (was "Terlihat oleh klien sekarang.") | §10.5 |
| gallery · `finalDownloadNote` | G2 *Hasil akhir* note, AC-GFL-019 | Klien bisa mengunduh begitu file tersinkron. | The client can download once files are synced. | new | §10.5 and §15.x |
| gallery · `pickStatusFinal` | G2 *Pilihan klien* status | Pilihan sudah final. | Selections are final. | new | §10.5 |
| gallery · `expiredAlertTitle` | G3 Alert title, AC-GFL-012 | Galeri kedaluwarsa sejak {date} | Gallery expired since {date} | existing | §10.6 Expired alert title |
| gallery · `expiredAlertBody` | G3 Alert body | Klien tidak bisa membuka galeri. Atur tanggal baru atau hapus kedaluwarsa untuk membukanya lagi dengan link dan kata sandi yang sama. | The client can’t open the gallery. Set a new date or remove the expiry to open it again with the same link and password. | new | §10.6 |
| gallery · `cardClosedAlertBody` | G4 Alert body, AC-GFL-016 | Klien tidak bisa membuka galeri lagi. Foto, folder dan pilihan klien tetap tersimpan dan hanya bisa dilihat. | The client can no longer open the gallery. Photos, folders and the client’s selections stay saved and can only be viewed. | new | §10.1 and §10.7 |
| gallery · `visibilityExpired` | G3 visibility, A-3 | Tidak terlihat oleh klien selama galeri kedaluwarsa. | Hidden from clients while the gallery is expired. | existing | §10.5 |
| gallery · `visibilityCancelled` | G4 visibility | Tidak terlihat oleh klien: proyek dibatalkan. | Hidden from clients: the project was cancelled. | changed (was "Tidak akan terlihat oleh klien.") | §10.5 |

### 5c Expiry dialog (D1, D2) — AC-GFL-010, 011, 012

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| gallery · `expiryDialogTitle` | Dialog title | Kedaluwarsa galeri | Gallery expiry | existing | §10.6 Expiry-dialog title |
| gallery · `expiryDialogBody` | Dialog body | Setelah kedaluwarsa, klien tidak bisa membuka galeri sampai kamu mengubahnya. | After expiry, the client can’t open the gallery until you change it. | existing (wording matches the design) | §10.6 Expiry body |
| gallery · `expiryOptionNone` | D1 option, design wording | Tanpa kedaluwarsa | No expiry | existing (Owner 2026-10-18: one term everywhere) | §10.2 Expiry option |
| gallery · `expiryOptionDate` | D2 option | Sampai tanggal | Until a date | existing | §10.2 |
| gallery · `expiryOptionDays` | D1 option | Selama beberapa hari | For a number of days | existing | §10.2 |
| gallery · `expiryDurationLabel` | D1 Select label | Durasi | Duration | new | §10.6 |
| gallery · `expiryPreset` | Presets 7/14/30/60/90, AC-GFL-010, A-1 | {count, plural, other {# hari}} | {count, plural, one {# day} other {# days}} | new (presets: 7, 14, 30, 60, 90) | §10.6 (new row) |
| gallery · `expiryDaysHelperLive` | D1 helper, design text with resulting date | Dihitung dari saat disimpan. Galeri tertutup pada {date}. | Counted from when you save. The gallery closes on {date}. | changed (was "Dihitung dari saat disimpan.") | §10.6 |
| gallery · `errorPastDate` | D2 field error, AC-GFL-011 | Pilih hari ini atau tanggal sesudahnya. | Choose today or a later date. | existing (wording matches the design) | §10.8 |
| gallery · `cancel` | Dialog cancel | Batal | Cancel | existing | — |
| gallery · `expirySave` | Dialog save | Simpan | Save | existing | — |

### 5d Last-folder removal dialog (D3) — AC-GFL-015

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| gallery · `deleteFolderTitle` | Dialog title | Lepas {name}? | Remove {name}? | existing | §10.7 Unlink title |
| gallery · `deleteLastFolderBody` | D3 body, design wording | Ini folder terakhir galeri. {count} foto dari folder ini dihapus dari galeri, dan Kirim link ke klien tidak muncul sampai kamu menambah folder lagi. Folder di Google Drive tidak berubah. | This is the gallery’s last folder. {count} photos from it are removed from the gallery, and Send link to client stays hidden until you add a folder. The folder in Google Drive doesn’t change. | new (replaces the "Galeri yang dipublikasikan butuh minimal satu folder aktif" hint) | §10.7 |
| gallery · `deleteFolder` | Confirm button | Lepas folder | Remove folder | existing | §10.7 Unlink action |

### 5e Tandai terkirim (delivery) — AC-GFL-017, A-6

File: `delivery-copy/delivery.copy.ts`. Replaces the `complete*` strings.

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| delivery · `complete` | Header step and menu label (P7, BOOKED/SHOOTING menu item) | Tandai terkirim | Mark as delivered | changed (was "Tandai selesai") | §15.x Delivery card "Mark complete" |
| delivery · `completeTitle` | Confirm dialog title | Tandai proyek terkirim? | Mark this project as delivered? | changed (was "Tandai proyek selesai?") | §15.x |
| delivery · `completeDescription` | Confirm dialog description | Proyek {title} akan berstatus Terkirim. | Project {title} will be marked Delivered. | changed (was "…akan berstatus Selesai.") | §15.x |
| delivery · `completeBody` | Confirm dialog body | Galeri tetap bisa dibuka klien. | The client can still open the gallery. | changed (was "Galeri tetap terbuka selama masih dipublikasikan.") | §15.x |
| delivery · `completeConfirm` | Confirm button | Tandai terkirim | Mark as delivered | new | §15.x |
| delivery · `completeDisabledHint` | Disabled hint, no finished file, AC-GFL-017 | Belum ada hasil akhir yang tersinkron. Sinkronkan folder hasil akhir dulu. | No final files are synced yet. Sync the final-files folder first. | new | §15.x |
| delivery · `refusedCompleteTitle` | DELIVERY_REFUSED toast title, A-6 | Proyek belum bisa ditandai terkirim | This project can’t be marked as delivered yet | new | §15.x (Owner delivery refusal rows) |
| delivery · `reasonNoFinishedFile` | DELIVERY_REFUSED toast body | Belum ada hasil akhir yang tersinkron. | No final files are synced yet. | existing (same wording as the refusal reason key) | §15.x |
| delivery · `completedToast` | Success toast | Proyek ditandai terkirim | Project marked as delivered | changed (was "Proyek ditandai selesai") | §15.x |
| delivery · `completedTitle` | Hasil akhir card, delivered row | Terkirim {when} | Delivered {when} | changed (was "Selesai {when}") | §15.x Owner delivery rows |

### 5f Hasil akhir card, no publish (AC-GFL-006, 017, 019)

File: `delivery-copy/delivery.copy.ts`.

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| delivery · `cardTitle` | Card title | Hasil akhir | Final files | existing | §15.x |
| delivery · `cardDescription` | Card description | Unduhan untuk klien. | Downloads for the client. | existing | §15.x |
| delivery · `readyRowMeta` | P7 row, AC-GFL-019 | {edited} Foto edit · {print} Foto cetak · terlihat oleh klien | {edited} edited photos · {print} print photos · visible to the client | new | §15.x |
| delivery · `readyStatus` | P7 status | Siap diunduh | Ready to download | new (replaces the "Dipublikasikan" chip) | §15.x |
| delivery · `deliveredRowTitle` | P4 row, AC-GFL-006 | Terkirim {when} · {edited} Foto edit · {print} Foto cetak | Delivered {when} · {edited} edited photos · {print} print photos | changed (was "Dipublikasikan {when}") | §15.x |
| delivery · `deliveredStatus` | P4 status | Terkirim | Delivered | changed (was "Dipublikasikan" chip) | §15.x |
| delivery · `emptyNote` | No synced finished file | Belum ada hasil akhir yang tersinkron. Buat subfolder hasil akhir di Drive, petakan ke item paket lewat Edit folder, lalu sinkronkan galeri. | No final files are synced yet. Create a final-files subfolder in Drive, map it to a package item in Edit folder, then sync the gallery. | existing (same wording) | §15.x |

---

## Iteration 6 — Share dialog and entry points

File for the share dialog: **new** `src/features/gallery/ui/gallery-share-dialog/gallery-share-dialog.copy.ts` (`GALLERY_SHARE_COPY`, namespace `galleryShare`). Project menu item: `src/features/booking/ui/project-menu/project-menu.copy.ts` (existing file; key name proposed). Share copy gets a new deck section §10.9.

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| galleryShare · `title` | K1/K2 title, AC-GFL-021 | Kirim link ke klien | Send link to client | new | §10.9 (new) |
| galleryShare · `description` | K1 description, design wording | Periksa pesannya, lalu kirim dari WhatsApp. Shutrly tidak mengirim apa pun sendiri. | Check the message, then send it from WhatsApp. Shutrly doesn’t send anything itself. | new | §10.9 |
| galleryShare · `recipientLabel` | Recipient row | Kepada | To | new | §10.9 |
| galleryShare · `recipientValue` | Recipient row value | {name} · {phone} | {name} · {phone} | new | §10.9 |
| galleryShare · `passwordNote` | K1 password note, AC-GFL-022 | Kata sandi galeri ikut di pesan ini. Siapa pun yang menerima pesan ini bisa membuka galeri. | The gallery password is in this message. Anyone who gets it can open the gallery. | new (design says "Password galeri…"; Owner chose kata sandi) | §10.9 |
| galleryShare · `editTemplate` | Link to the F-03 editor, AC-GFL-021 | Ubah template | Edit template | new | §10.9 |
| galleryShare · `copyMessage` | *Salin pesan* button, AC-GFL-023 | Salin pesan | Copy message | new | §10.9 |
| galleryShare · `copiedTitle` | Toast after copy | Pesan disalin | Message copied | new | §10.9 |
| galleryShare · `copiedBody` | Toast body | Tempel di WhatsApp. | Paste it into WhatsApp. | new | §10.9 |
| galleryShare · `copyFailed` | Toast when the clipboard write fails (Owner 2026-10-18) | Pesan tidak bisa disalin. Salin manual dari kotak pesan. | Couldn’t copy the message. Copy it from the message box. | new | §10.9 |
| galleryShare · `openWhatsapp` | *Buka WhatsApp*, AC-GFL-022 | Buka WhatsApp | Open WhatsApp | existing (`client-copy` `openWhatsapp`, same wording) | §10.9 (reuses §11) |
| galleryShare · `noNumberTitle` | K2 Alert title, AC-GFL-024 | {name} belum punya nomor WhatsApp | {name} doesn’t have a WhatsApp number yet | new | §10.9 |
| galleryShare · `noNumberBody` | K2 Alert body | Tambahkan nomor di data klien untuk membuka WhatsApp. Kamu tetap bisa menyalin pesannya. | Add a number in the client’s details to open WhatsApp. You can still copy the message. | new | §10.9 |
| galleryShare · `addNumber` | K2 action | Tambah nomor WhatsApp | Add WhatsApp number | existing (`project-copy` `menuAddNumber`) | §10.9 |
| galleryShare · `recipientNoNumber` | K2 recipient value | {name} · belum ada nomor WhatsApp | {name} · no WhatsApp number | new | §10.9 |
| galleryShare · `loading` | Loading state, AC-GFL-021 | Menyiapkan pesan… | Preparing the message… | new | §10.9 |
| galleryShare · `errorTitle` | Error state, AC-GFL-025 | Link galeri belum bisa dikirim | The gallery link can’t be sent yet | new | §10.9 |
| galleryShare · `errorBody` | Error body | Coba lagi sebentar lagi. Galeri belum bisa dibagikan saat ini. | Try again in a moment. The gallery can’t be shared right now. | new | §10.9 |
| galleryShare · `close` | Error close | Tutup | Close | existing (`gallery` `close`) | §10.9 |
| booking project-menu · `shareGallery` | Project menu item, AC-GFL-013, 014 | Kirim link ke klien | Send link to client | new | §10 (menu row; check §15) |
| booking project-menu · `shareGalleryNoFolder` | Disabled hint, AC-GFL-013 | Galeri harus punya folder dulu. | The gallery needs a folder first. | new (no design text; proposed) | §10 |

---

**Owner 2026-10-18:** `{clientName}` in the `GALLERY_SHARE` message is the client's first name (same as the client gallery greeting), not the full stored name.

## Iteration 7 — Client empty state and finished files

Files: `src/features/gallery/ui/client-browse-screen/client-browse-screen.copy.ts` (`emptyBody`), `src/features/gallery/ui/client-home-screen/client-home-screen.copy.ts` (`namespace clientHome`), `client-copy/client-copy.copy.ts` (shared client strings).

| Key (file · key) | Purpose / AC | ID | EN | Status | Copy-deck row to update |
|---|---|---|---|---|---|
| client-copy · `noPhotosTitle` | *Semua foto* empty title, AC-GFL-009 | Belum ada foto | No photos yet | existing (`pickScreen`/client shared "Belum ada foto", design C2) | §14.2 |
| client-browse · `emptyBody` | *Semua foto* empty body (C2) | Fotografer belum menambahkan foto ke galeri ini. Coba lagi nanti. | The photographer hasn’t added photos to this gallery yet. Try again later. | changed (was "Fotografer belum menambahkan foto di sini.") | §14.2 |
| client-home · `subtitleNoPhotos` | *Beranda* empty row, C1 | Belum ada foto · fotografer belum menambahkan foto. Coba lagi nanti. | No photos yet · the photographer hasn’t added any. Try again later. | new | §14.4 (new row) |
| client-home · `actionStartDisabledHint` | Disabled *Mulai memilih* hint, optional | Foto akan muncul di sini setelah fotografer menambahkannya. | Photos will appear here once the photographer adds them. | new (no design text; optional per plan 7.1) | §14.4 |
| client-home · `finalUnavailable` | *Hasil akhir* before sync, C1 | Belum tersedia · muncul di sini setelah foto selesai diedit. | Not available yet · it appears here once the photos are edited. | new | §14.4 |
| client-home · `finalReadyNoDate` | *Hasil akhir* listing without delivery date, AC-GFL-019 | {edited} Foto edit · {print} Foto cetak | {edited} edited photos · {print} print photos | new (no date line; replaces the dated "Terkirim" line) | §14.3 |
| client-home · `finalReadyStatus` | Status chip | Siap diunduh | Ready to download | new | §14.3 |

Check before adding: `client-home-screen.copy.ts` already has `finalReadyTitle` and `finalReadyBody` (PROPOSED, §14.4). Reuse them where the wording still fits.

---

## To remove

| Obsolete string | Where it lives now | Status |
|---|---|---|
| Publikasikan galeri / Publikasikan galeri ini? / Galeri dipublikasikan / Galeri dibuka lagi | `gallery-copy.copy.ts` (`publish`, `publishDialogTitle`, `publishedTitle`, `reopenedTitle`) | remove |
| Publikasikan hasil akhir / Publikasikan hasil akhir? / Hasil akhir dipublikasikan / Hasil akhir belum bisa dipublikasikan | `delivery.copy.ts` (`publish`, `publishTitle`, `publishedToast`, `refusedTitle`) | remove |
| Arsipkan galeri / Arsipkan galeri ini? / Galeri diarsipkan | `gallery-copy.copy.ts` (`archive`, `archiveDialogTitle`, `archivedTitle`) | remove |
| Hapus galeri draf ini? / Hapus galeri | `gallery-copy.copy.ts` (`deleteDialogTitle`, `deleteGallery`, `deletedTitle`) | remove |
| Buat galeri / Buat galeri (create dialog) / Galeri dibuat | `gallery-copy.copy.ts` (`create`, `createDialogTitle`, `createdTitle`) | remove |
| Dipublikasikan (chip/status) | `gallery-copy.copy.ts` `statusPublished` | remove |
| Dihitung sejak galeri dipublikasikan. | `gallery-copy.copy.ts` `expiryDaysHelperDraft` (replaced by the changed `expiryDaysHelperLive` in 5c) | remove |
| Tandai selesai (menu, header and confirm) | `delivery.copy.ts` `complete`, `completeTitle` | remove (replaced by changed keys in 5e) |

Also remove the copy-deck rows that describe publish/archive/delete (§10.6, §10.7 and the §15.x publish rows), and mark them superseded.

---

## Wording conflicts (for Owner decision)

| Topic | Design | Other source | Draft proposal |
|---|---|---|---|
| Password word | "Password" (P2, G2, K1, D1) | copy-deck and `gallery-copy` use "Kata sandi" | **Owner 2026-10-18: kata sandi.** |
| No-expiry option | D1 "Tidak ada kedaluwarsa" | G-page meta and `expiryOptionNone` say "Tanpa kedaluwarsa" | **Owner 2026-10-18: "Tanpa kedaluwarsa" everywhere.** |
| Send button name | Card and page "Kirim link ke klien" | Dialog title "Kirim link galeri" (K1, D3, menu) | **Owner 2026-10-18: "Kirim link ke klien" everywhere** (button, menu, dialog title, D3 body). |
| Empty *Semua foto* title | Design C2 "Belum ada foto" | Brief/AC-GFL-009 "Photos aren’t ready yet" | **Owner 2026-10-18: design wording "Belum ada foto"; sync AC-GFL-009.** |
| Closed gallery meta | G4 "Tidak terlihat oleh klien" uses an apposition; P6 "Ditutup" | `visibilityCancelled` "Tidak akan terlihat oleh klien." | Design wording. |
| Expiry helper | D1 "Galeri tertutup pada {date}" | Existing "Galeri kedaluwarsa di akhir hari itu" | Design wording for the dialog helper. |

---

## Tally

| Status | Table rows |
|---|---|
| new | 44 |
| changed | 17 |
| existing | 25 |
| remove | 8 (each row lists one or more strings) |

Counted from the Status column of the iteration tables. Notes after the status word are not counted separately.
