# Feature: Client access

ID: F-10 · Slug: `client-access` (F-10 *Client gallery access*, F-11 *Selection*, F-12 *Final delivery* and F-13 *Add-ons* merged, Owner 2026-10-05)
Status: IN PROGRESS (build started 2026-10-06; planned 2026-10-06; specified 2026-10-05, designed 2026-10-06) · Technical design: [technical-design.md](technical-design.md) · Plan: [plan.md](plan.md) · Intent: [intent.md](intent.md) (ACCEPTED 2026-10-05) · Design: [design.md](design.md) (APPROVED 2026-10-06) · Journeys: J-04 (client half and Owner review), J-05, J-06
Builds on: F-07 `projects` (token, project items, lifecycle), F-09 `gallery` (published gallery, password hash and `passwordVersion`, photo kinds, media route, `contentVersion`)
Consumer: F-14 `billing` (approved add-ons not yet invoiced, BR-ADD-004), F-15 `whatsapp-share` (*Kirim link galeri*, *Ingatkan pilih foto*, *Kirim hasil akhir*)

## Goal
A client who has the project link and the current gallery password can open the gallery, pick the photos the package entitles them to, submit their picks, and later download the finished files from the same link. The Owner reviews and locks picks, grants extra picks through add-ons, publishes final delivery, and can end shared access by rotating the link. Nobody without the link and password learns anything (BR-ACC-*, BR-SEL-*, BR-DEL-*, BR-ADD-*).

## User Stories
- As a client, I want to open my gallery with the link and password my photographer sent, so that I can see my photos privately without creating an account.
- As a client, I want to pick photos for each part of my package and see how many I have left, so that I can submit my choice within what I paid for.
- As a client, I want to download my finished photos one by one, a few at a time, or all at once, so that I get them without asking the photographer.
- As a photographer (Owner), I want to see and lock each client's picks, grant extra picks when the client pays for them, and publish the finished files, so that the whole hand-over happens in one place.
- As a photographer (Owner), I want to replace the gallery link, so that a leaked link stops working.

## Preconditions
- The project has a client access token (BR-PRJ-003, created by F-07).
- For client access: the gallery is `PUBLISHED` and not expired (BR-ACC-001, BR-GAL-005).
- For selection: the project has at least one item with `selectionRequired = true` (BR-SEL-001); otherwise the client only browses.
- For final delivery: the conditions in BR-DEL-003 and A-17.
- Owner actions run behind the Owner session and workspace check (C-101, BR-WS-003).

## Inputs
- **Client:** the token in the URL; the gallery password; a pick or un-pick of a proof photo per group; a quantity per picked photo (`QUANTITY` groups, BR-SEL-003); a submit per group; download choices.
- **Owner:** lock a group; add-on fields (description, optional target group, quantity, unit price); approve or cancel an add-on; publish final delivery; rotate the link.

## Main Flow

### 1. Open the gallery (client)
1. The client opens `/g/{token}`.
2. If the token belongs to a project whose gallery is `PUBLISHED` and not expired, Shutrly shows the password screen with the workspace brand and the project title. Otherwise it shows the neutral unavailable page (Alternative flows).
3. The client enters the password. Shutrly verifies it against the hash, server-side (C-004, ADR-017).
4. On success the client gets a session for this gallery, tied to the token and the current `passwordVersion` (A-1), and lands on the gallery.
5. The client lands on **Beranda** (home), the hub of every client task (A-24, Owner 2026-10-05, Flow B): *Semua foto* and *Hasil akhir* first, then one card per selection group (A-24). A project with no selection group and no published final delivery skips Beranda and opens *Semua foto* (A-31).
6. *Semua foto* is laid out like the Owner's gallery (F-09 A-12, A-13): folder tiles with a breadcrumb, search by file name, and a grid of `PROOF` photos that are not missing or hidden (BR-GAL-006, BR-GAL-009, BR-GAL-007). The grid has no select controls; a photo already picked carries a marker naming its group, with *× n* for quantities. The photo viewer offers *Pilih untuk…* (A-30). `EDITED` and `PRINT` photos are not shown until final delivery (BR-DEL-002).
7. Images load from Google by file ID or from the controlled media route; no folder link, folder ID, resource key or API key reaches the browser (BR-ACC-005, ADR-019).

### 2. Select (client)
1. On Beranda each group card shows the group name, *used / effective limit* with its unit (BR-SEL-007, A-20) and a status chip: *Terbuka*, *Dibuka lagi* (reopened by an add-on, A-22), *Dikirim* (waiting for the Owner) or *Dikunci*. An `OPEN` card leads to its **Pilih** screen; a `SUBMITTED` or `LOCKED` card opens its picks read-only (A-12). Without groups there are no group cards.
2. **Pilih** is one screen per group (A-25): its title is the group name, the breadcrumb (desktop) or back button (phones) returns to Beranda (A-26), and the grid of `PROOF` photos (folder filter and search as in *Semua foto*) has a select control on every tile. A summary bar above the grid shows the group, its status, *used / limit* and the button *Tinjau*. Tapping a tile picks or un-picks it; in a `QUANTITY` group a pick starts at quantity 1 and the tile shows *× n* (BR-SEL-003, BR-SEL-004). A photo picked in another group shows that group's marker. The client can filter the grid to this group's picks.
3. Every pick, un-pick and quantity change is saved at once, checked server-side under a lock on the group (BR-SEL-006, A-7). A change that would exceed the limit is refused with *Batas pilihan tercapai*.
4. A photo may be picked in several groups (BR-SEL-004). From the photo viewer in *Semua foto*, *Pilih untuk…* picks or un-picks the photo in any `OPEN` group (A-30), with the same checks.
5. **Tinjau** (A-29) lists the group's picks with thumbnail and file name, *used / limit* and the places left. In a `QUANTITY` group each row has a quantity stepper; quantities are changed only here. A pick can be removed here. When the group's item allows pick notes (A-32), each row shows its note with *Ubah catatan*, and a pick without a note shows *Tambah catatan*; both open the same note sheet as Pilih, so the client can check and fix notes before sending (Owner 2026-10-05). *Tambah foto lagi* returns to Pilih with all picks kept.
6. *Kirim n foto* (or *n lembar*) submits the group (A-5). Below the limit a confirmation names the remaining places. The group becomes `SUBMITTED`, its picks are read-only for everyone (BR-SEL-005), and the client returns to Beranda, where the card shows *Dikirim · menunggu fotografer*.
7. One group is one task: to work on another group the client goes back to Beranda and opens that card (A-27).

### 3. Review and lock (Owner)
1. On the gallery page, the *Pilihan klien* card shows each group with its status (*Terbuka*, *Dikirim*, *Dikunci*), *used / effective limit* and the number of notes; it opens the *Pilihan klien* page, which lists the groups with *Lihat pilihan* and *Kunci pilihan* (A-34).
2. The Owner opens a group and sees the picked photos with file name, folder path, quantity and the client's note, and can copy the list of file names with their notes (A-6).
3. The Owner locks a `SUBMITTED` group, or closes an `OPEN` group without submission; both make it `LOCKED` and record actor and time (BR-SEL-005, BR-AUD-001).

### 4. Add-ons (Owner)
1. The client asks for more off-app, for example on WhatsApp (A-4).
2. From the *Add-on* card on the project page (*Tambah add-on*), the Owner creates a `DRAFT` add-on: description, optional target group, quantity, unit price; total = quantity × unit price, computed server-side in the project currency (BR-ADD-001, BR-ADD-002, BR-ADD-006, C-105).
3. The Owner approves it from the add-on's menu (*Setujui*; a draft can also be deleted with *Hapus draf*). In one transaction the target group's `extraLimit` grows by the quantity and a `SUBMITTED` group returns to `OPEN` (BR-ADD-004, BR-SEL-002, BR-SEL-005); no invoice line is created until F-14 (BR-ADD-004 amendment). Actor and time are recorded (BR-AUD-001).
4. The client sees the new effective limit the next time the group is loaded (BR-SEL-007). A reopened group keeps its picks; the client adds the extra photos and submits again (A-22).
5. The Owner may delete a `DRAFT` add-on (*Hapus draf*, A-35), or cancel an `APPROVED` one when the reduced limit stays ≥ usage (BR-ADD-003, BR-ADD-005).

### 5. Final delivery
1. The Owner publishes final delivery with *Publikasikan hasil akhir* on the *Hasil akhir* card of the gallery page, after a confirmation, when BR-DEL-003 and A-17 hold. Shutrly records `finalDeliveryPublishedAt` and moves the project to `DELIVERED` in the same transaction (BR-PRJ-004).
2. The same link and password now also show the finished files: the *Hasil akhir* card moves to the top of Beranda and opens the files by kind (*Edited*, *Print*), excluding missing ones (BR-DEL-001, BR-DEL-002, A-26).
3. The client downloads one file (from its tile or the preview), several chosen files, or all finished files of the open kind (BR-DEL-004, A-33). Files are the originals. A bulk download never sends the folder link or folder ID to the browser (BR-ACC-005).
4. Files synced later into `edited` / `print` folders appear for the client after the next sync (A-18).

### 6. Mark the project complete (Owner)
1. On a `DELIVERED` project the Owner chooses *Tandai selesai*, the main action in the project page header (the phone action bar), and confirms (A-34).
2. The project becomes `COMPLETED`, with actor and time recorded (BR-PRJ-005, BR-AUD-001). Invoice state plays no part (BR-PRJ-006); the outstanding-balance warning arrives with F-14 (A-19).
3. The client keeps access while the gallery stays published and not expired (BR-ACC-001).

### 7. Rotate the link (Owner)
1. The Owner chooses *Ganti link* on the *Akses klien* card of the gallery page (beside F-09's *Ganti password*) and confirms a warning that every shared link stops working.
2. Shutrly replaces the project token, records actor and time (BR-PRJ-003, BR-AUD-001), and shows the new link.
3. Old links show the neutral unavailable page and existing client sessions end (A-1). The password is unchanged.

## Alternative Flows
- **Wrong password:** *Password salah*, the field keeps focus, and the attempt counts toward the rate limit (BR-ACC-004, A-2).
- **Too many attempts:** *Terlalu banyak percobaan. Coba lagi dalam n menit.*; no password is checked until the window ends (A-2).
- **Password rotated (F-09) while a client is in:** their next request returns to the password screen (BR-GAL-003).
- **Gallery becomes expired, archived or the project is cancelled while a client is in:** their next request shows the neutral unavailable page (BR-GAL-005, BR-PRJ-010).
- **Expired gallery re-opened by the Owner:** the same link and password work again; the client signs in again only if their session ended (BR-GAL-005, A-1).
- **Limit reached:** further picks in that group are refused; un-picking frees a place.
- **Concurrent changes** (two devices, or the Owner lowering a limit): the server's answer wins and the client view refreshes the group (BR-SEL-006).
- **Submitting fewer than the limit:** allowed after a confirmation that names the remaining places (A-5).
- **Project without selection items:** Beranda has no group cards and the viewer has no *Pilih untuk…*; before final delivery the client lands on *Semua foto* (A-31).
- **Deal edited while `BOOKED`:** groups follow the project items; an edit that would break a group is refused for the Owner (BR-PRJ-009, BR-SEL-001 amendments).
- **Group no longer `OPEN`:** a pick or submit is refused with *Pilihan sudah dikirim* and the view refreshes.
- **A picked photo goes missing:** the pick stays, counts toward usage, and is flagged to the Owner as *Hilang*; the client sees it as unavailable (A-8).

## Error Cases
- **Unavailable gallery:** an unknown token, a `DRAFT`, `EXPIRED` or `ARCHIVED` gallery, a project without a gallery, or a cancelled project all show one neutral page with no project data and the same status code (Owner 2026-10-05, A-3).
- **Rate limit on unknown tokens:** repeated unknown tokens from one address are limited like wrong passwords (A-2).
- **Image fails to load from Google:** it falls back to the media route (ADR-019).
- **Download fails** (file gone from Drive, network): the file is reported as failed with *Coba lagi*; the others continue.
- **Add-on cancel below usage:** refused with the current usage (BR-ADD-005).
- **Final delivery without a finished file, or in a status BR-DEL-003 doesn't allow:** refused with the reason.
- **Server or provider error:** retryable error state (C-007).

## Business Rules
- BR-ACC-001, BR-ACC-003, BR-ACC-004, BR-ACC-005 (BR-ACC-002 invoices: F-14)
- BR-PRJ-003 (token rotation), BR-PRJ-004 (move to `DELIVERED`), BR-PRJ-005, BR-PRJ-006 (manual completion), BR-PRJ-009 (amended: edits guarded by groups), BR-PRJ-010
- BR-GAL-003, BR-GAL-005, BR-GAL-006, BR-GAL-007, BR-GAL-009
- BR-SEL-001 (amended: groups from first publish) … BR-SEL-007
- BR-DEL-001 … BR-DEL-004 (BR-DEL-004 amended: download modes)
- BR-ADD-001 … BR-ADD-006 (BR-ADD-004 amended: invoice line deferred to F-14)
- BR-CAT-002, BR-CAT-007, BR-CAT-010, BR-CAT-011 (whole-number limits; pick mode per definition, amended)
- BR-CUR-001 … BR-CUR-003, BR-PRJ-007 (add-on money)
- BR-AUD-001 (token rotation, selection lock, add-on approval and cancellation)
- BR-WS-002, BR-WS-003 (Owner side)
- Constitution C-004, C-005, C-006, C-007, C-008, C-101, C-103, C-104, C-105

## Dependencies
- F-05 `catalog` (follow-up inside this feature): the item-definition form, seed and `service_item` replace the `EDIT`/`PRINT` selection type with a pick mode and add *Klien bisa memberi catatan* (`allowsPickNotes`) (BR-CAT-007, BR-CAT-010, BR-CAT-011); migration maps `EDIT`→`COUNT` with notes on, `PRINT`→`QUANTITY` with notes off.
- F-07: `project_item` snapshots the pick mode (BR-PRJ-001); `client_access_token` (write-once today; rotation makes it replaceable), project items and status transitions.
- F-09: gallery status and expiry, password hash and `passwordVersion`, photo kinds and missing state, the media route, `contentVersion` (ADR-019 point 5).
- ADR-004 / ADR-017 (token and password), ADR-013 (public endpoints choose their own rate-limit mechanism), ADR-016 (cross-feature transactions: delivery → project status, add-on → group), ADR-018 (Workers Free budget), ADR-019 (images from Google, gallery data cached by `contentVersion`).
- ADR-019 point 5 lists the events that bump `contentVersion`. The client data in this feature also changes on final-delivery publish and token rotation; the technical design adds them, in line with the ADR's purpose (no stale entry is ever read).

## Out of Scope
- Invoices, payments and `/i/{token}/{invoiceId}` (F-14), including putting approved add-ons on an invoice.
- WhatsApp sharing and the project-menu items (F-15).
- Project cancellation (F-07); the outstanding-balance warning on completion (F-14, A-19).
- Client requests for add-ons inside the app (A-4), notifications to the Owner, comments on photos other than the per-pick note (A-32), and favourites.
- Re-opening a group by any means other than an approved add-on, and re-opening a `LOCKED` group (BR-SEL-005).
- Proof downloads; downloads of photos that aren't `EDITED` or `PRINT`.
- Gallery slug (BR-GAL-008); client accounts; providers other than Google Drive.

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Client session:** an http-only, same-site cookie for this token's path, valid 30 days on that browser. It ends on password rotation (older `passwordVersion`), token rotation, or when the gallery stops being available.
- **A-2 Rate limits:** wrong passwords 5 per 15 minutes per token and address, and 20 per hour per token from any address; unknown tokens 30 per hour per address; selection writes 120 per minute per session. Limits are checked server-side; the mechanism is a technical-design choice (ADR-013).
- **A-3 Neutral page:** an expired gallery shows the same page as a wrong link, with no contact hint (Owner chose one page for every case, 2026-10-05).
- **A-4 Add-on requests:** the client asks off-app; there is no request button.
- **A-5 Submit per group:** each group is submitted on its own, needs at least one pick, and may be submitted below its limit after a confirmation.
- **A-6 Owner review:** the copyable list is one file name per line, with `× n` for print quantities and ` — note` when the pick has a note (line breaks in a note become spaces).
- **A-7 Autosave:** every pick change is saved immediately; there is no separate draft or *Simpan* button.
- **A-8 Missing picked photo:** stays selected and counted; the client sees it as unavailable and can un-pick it while the group is `OPEN`.
- **A-9 Quantities:** a print quantity is a whole number from 1 up to the group's remaining places.
- **A-10 Add-on fields:** description 1–100 characters; quantity a whole number ≥ 1; unit price whole IDR ≥ 0. A target group is required for an add-on that adds picks and must be `OPEN` or `SUBMITTED`; a `LOCKED` group can't be targeted (BR-SEL-005). An add-on with no target adds a service only.
- **A-11 Add-on statuses:** add-ons can be created on `BOOKED` … `DELIVERED` projects.
- **A-12 Groups after lock:** a locked group stays visible to the client, read-only, with its picks.
- **A-13 Group names:** a group is named after its project item (for example *Foto edit*, *Foto cetak*).
- **A-14 Selection while expired:** no selection or download while the gallery is expired; picks are kept.
- **A-15 Final delivery and groups:** publishing final delivery does not change group statuses.
- **A-16 Link rotation:** the new token has the same strength and format as the old one (BR-PRJ-003); the old one is never reused.
- **A-17 Final delivery needs a published gallery:** besides BR-DEL-003, the gallery must be `PUBLISHED`, so the client can actually open it.
- **A-18 Later finished files:** files synced into `edited` / `print` after delivery are shown without publishing again.
- **A-20 One group per selection item:** a group is made from a project item with `selectionRequired` and is named after that snapshotted item (BR-PRJ-001), so two items of the same type (for example *Foto edit* and *Foto edit bonus*) are two groups with separate limits. Its pick mode, set by the Owner on the item definition, decides how usage counts: `COUNT` or `QUANTITY` (BR-SEL-003). The unit text (*foto*, *lembar*) is shown beside the limit.
- **A-21 Zero limit:** an item with value 0 yields a group with limit 0 that is shown *0 / 0*, offers no picks, and can't be submitted. An add-on can raise it.
- **A-24 Beranda:** after the password the client lands on Beranda: first *Semua foto* and *Hasil akhir*, then the section *Pilih foto* with one card per group in project-item order, stacked in one column because a package can have any number of groups. Before final delivery the *Hasil akhir* row is shown with *Belum tersedia*; after it, a *Hasil akhir siap* card sits at the very top. On desktop Beranda uses the centered narrow content layout (`size.content-narrow`, 720) (Owner 2026-10-05). The brand bar shows the studio and the project title; Beranda's Page Header greets the client by first name (*Halo, Rina*) so the project title isn't repeated, and there are no tabs (Owner 2026-10-05, Flow B).
- **A-27 One group at a time:** Pilih and Tinjau have no group switcher; another group is opened from its Beranda card.
- **A-28 Grid columns:** photo grids have 4 columns on desktop and 2 on phones (Owner 2026-10-05). The Owner's phone view of a group's picks uses 1 column, so each photo and its client note are readable at full width (Owner 2026-10-05). A last row with fewer photos keeps the same column width and leaves the rest empty; tiles never stretch (Owner 2026-10-05).
- **A-25 Pilih screen:** select controls show only for the screen's group; a photo picked in another group shows a marker with that group's name, and print quantities show as *× n*. The summary bar's only button is *Tinjau* (Owner 2026-10-05).
- **A-26 No tabs, breadcrumb back:** the client area has no tabs; *Semua foto*, each group and *Hasil akhir* are reached from Beranda. On desktop every client page below Beranda shows a breadcrumb (*Beranda › Foto edit › Tinjau*) instead of a back button; phones show a *Beranda* (or *Kembali*) button at the top of the content, because the Mobile Header has no breadcrumb (Owner 2026-10-06).
- **A-29 Tinjau:** a review screen per group between Pilih and submit. Quantities of a `QUANTITY` group are set only here, with a stepper from 1 to the places left (A-9). *Kirim* is disabled with no picks (A-5) (Owner 2026-10-05). On desktop, Tinjau and the read-only picks view use the centered narrow content layout (720), like Beranda (Owner 2026-10-05).
- **A-30 Pilih untuk… in the viewer:** the photo viewer in *Semua foto* has *Pilih untuk…*, which lists the `OPEN` groups with usage and a check where the photo is already picked; tapping a group picks the photo (quantity 1) or un-picks it. `SUBMITTED` and `LOCKED` groups are listed disabled. A full group refuses with *Batas pilihan tercapai* (Owner 2026-10-05).
- **A-31 Skipping Beranda:** a project with no selection group and no published final delivery opens *Semua foto* directly, because Beranda would hold only one card. Once final delivery is published the client lands on Beranda.
- **A-22 Reopened group:** reopening by an add-on keeps every pick; submitting again follows A-5. Cancelling that add-on later never changes the group's status, only its limit (BR-ADD-005). If the Owner locks a group while an add-on is `DRAFT`, approving it is refused (the target is `LOCKED`).
- **A-23 Groups for galleries published before this feature:** a published gallery with no groups gets them when F-10 is deployed (a backfill in the migration), so it behaves like one published after.
- **A-32 Pick notes:** a group whose item has `allowsPickNotes` lets the client add one optional note per pick, up to 500 characters, written while picking, because the client already knows what they want changed when they choose the photo (Owner 2026-10-05). Picking stays one tap; each picked tile in such a group shows a *Catatan* button (＋ when empty, a note icon when filled) that opens a note sheet (a dialog on desktop) with *Batal* and *Simpan catatan* (Owner chose option B, 2026-10-05). The photo viewer also has *Catatan* next to *Pilih untuk…* when the photo is picked in a group with notes, opening the same sheet to write or change the note (Owner 2026-10-05). Tinjau shows each note with *Ubah catatan* (or *Tambah catatan* when empty), opening the same sheet; the read-only picks view after submit shows notes without actions. A tile with a note shows a note marker. Notes are saved at once (A-7), editable while the group is `OPEN` and read-only after submit; removing a pick deletes its note. A photo picked in two groups has a separate note in each (Owner 2026-10-05).
- **A-33 Hasil akhir downloads:** the page shows one kind at a time (*Edited · n* / *Print · n* switch). Each tile has a download button and the preview has *Unduh foto*. The Page Header holds *Unduh ▾* (a bottom sheet on phones) with *Unduh semua (n)* and *Pilih beberapa* (Owner chose option A, 2026-10-06). *Unduh semua* covers the open kind only (Owner 2026-10-06: follow the design) and asks first (*Unduh semua n foto?*, the browser downloads the files one by one and may ask to allow several downloads); a progress card shows *n dari m foto selesai* with *Batalkan*, and a failed file is marked *Gagal* with *Coba lagi* on the card. *Pilih beberapa* turns the tiles into checkboxes and the Page Header into *n foto dipilih · Batal · Unduh n foto*.
- **A-34 Owner surfaces (revised Owner 2026-10-07; first version 2026-10-06):** client access, the client's picks and final delivery belong to the gallery, so they live on the **gallery page**, in this order: *Akses klien* (link, password, expiry, *Ganti link*, *Ganti password*; it replaces F-09's *Akses klien* card), *Pilihan klien* (opens the *Pilihan klien* page and each group's detail, now under the gallery at `/projects/[id]/gallery/pilihan`: breadcrumb *Galeri › Pilihan klien*), *Hasil akhir* (*Publikasikan hasil akhir*), then F-09's *Sumber foto* and *Foto*. Every card on the gallery page uses the 720 narrow column, and the *Foto* preview shows the first 6 photos in 3 columns. The **project page** keeps *Add-on* (money belongs to the booking), and its *Galeri* card summarises the gallery with two rows, *Pilihan klien* and *Hasil akhir*, each with a status chip, beside *Kelola galeri*. *Tandai selesai* is the project page's main header action on a `DELIVERED` project (the action bar on phones), where the other stage steps sit.
- **A-35 Deleting a draft add-on:** *Hapus draf* removes a `DRAFT` add-on permanently; a draft never changed a limit or an invoice, so nothing needs an audit record. An `APPROVED` add-on is never deleted, only cancelled (BR-ADD-003, BR-ADD-005) (Owner 2026-10-06, delegated: "jawab sesuai rekomendasi kamu").
- **A-19 Completion before invoices:** *Tandai selesai* shows no balance warning until F-14 exists; BR-PRJ-005 never blocks on balances anyway.

## Flagged Concerns
Checked against the constitution (C-001..C-106), BR-ACC/SEL/DEL/ADD/PRJ/GAL/CAT/CUR/AUD, ADR-004, -013, -016, -017, -018, -019 and the coding rules' security section.

| ID | Concern | Conflicting sources | Owner decision | Status |
|---|---|---|---|---|
| FC-001 | Approving an add-on must add an invoice line, but invoices are F-14 and not merged here. | BR-ADD-004, BR-ADD-005 ↔ feature map (F-14 separate) | Approval raises the limit now and stores the price on the add-on; F-14 puts approved add-ons on the draft invoice (Owner 2026-10-05). Recorded in BR-ADD-004. | RESOLVED |
| FC-002 | The gallery can be published while the project is `BOOKED`, when the deal is still editable, so limits could change under the client's picks. | BR-PRJ-009 ↔ BR-SEL-001, BR-SEL-003 | Selection starts at publish; groups follow the items; edits that would break a group are refused (Owner 2026-10-05). Recorded in BR-SEL-001 and BR-PRJ-009. | RESOLVED |
| FC-003 | *Download all* could be read against "independent download", and a bulk download must not reveal the folder. | BR-DEL-004 ↔ C-103, BR-ACC-005 | One file, several files or all files; never through the folder link or folder ID (Owner 2026-10-05). Recorded in BR-DEL-004. | RESOLVED |
| FC-004 | The scope merges four features the feature map listed separately. | Feature map F-10..F-13 | Merged into F-10 `client-access` (Owner 2026-10-05). Recorded in the feature map and the intent. | RESOLVED |
| FC-005 | Token rotation was in product scope but owned by no feature. | scope.md, BR-PRJ-003 ↔ F-09 out of scope | Built here, with an audit record (Owner 2026-10-05). | RESOLVED |
| FC-006 | Project completion (old F-12) was left out of the accepted intent, so no feature built it. | Feature map F-12 ↔ intent out of scope | Included here; the balance warning comes with F-14 (Owner 2026-10-05). Intent updated. | RESOLVED |
| FC-007 | Studios want their own selection items, but BR-CAT-007 and scope.md fixed the types to `EDIT` and `PRINT`, and BR-SEL-003 left the other types undefined. | BR-CAT-007, BR-SEL-003, scope.md ↔ product need | Replace the fixed types by a pick mode (`COUNT` / `QUANTITY`) chosen per item definition, built inside F-10 with a catalog follow-up (Owner 2026-10-05). Recorded in BR-CAT-007, -010, -011, BR-PRJ-001, BR-SEL-003, domain model and scope. | RESOLVED |
| FC-008 | A client who submitted and then buys extra picks could not use them: a submitted group never reopens (BR-SEL-005) and add-ons needed an `OPEN` target. | BR-SEL-005, BR-ADD-002, BR-ADD-004 ↔ J-05 | An approved add-on returns a `SUBMITTED` group to `OPEN`; `LOCKED` stays final (Owner 2026-10-05). Recorded in BR-SEL-005, BR-ADD-004 and the domain model. | RESOLVED |
| FC-009 | Clients need to tell the photographer how to edit each picked photo, but notes on photos were out of scope and the catalog had no way to say which items take notes. | Spec out-of-scope list, BR-CAT-007, BR-SEL-004 ↔ Owner need | Optional per-pick note (≤ 500 characters) for items whose definition has *Klien bisa memberi catatan*; written while picking (the *Catatan* button on a picked tile, or in the viewer) and editable on Tinjau until submit (A-32); seeded *Foto edit* on, *Foto cetak* off (Owner 2026-10-05). Recorded in BR-CAT-007, BR-CAT-011, BR-PRJ-001, BR-SEL-004 and the domain model. | RESOLVED |

## Open Questions / SPEC GAPS
None blocking. For the technical design:
- **R-1 Original-file downloads by file ID:** BR-ACC-005 allows a server-controlled URL or Google's image host by file ID. Check that the image host serves full-resolution originals. The design assumes *several* and *all* run as sequential browser downloads with progress (A-33), not a zip; confirm that fits the Workers Free budget (ADR-018). If originals need another Google URL, that is a BR-ACC-005 change for the Owner.
- **R-2 Rate-limit storage and the cache:** where A-2 counters live, and whether Workers Cache API calls count toward the 50-subrequest limit (ADR-019 point 5).
- **R-4 Pick-mode migration:** about 39 files in `src` use `selectionType` (catalog and booking schema, domain, forms, tests). The plan lists them; the migration is safe for other branches on the shared database (add `pick_mode`, backfill, keep the old column until the code stops using it).
- **R-3 Token rotation in code:** `client_access_token` is write-once today (F-07 TD D-6).
- **Carried, not blocking:** GAP-04 is designed for phone and desktop ([design.md](design.md)); tablet and dark mode stay open (GAP-01, GAP-04). The *SELECTION_REMINDER* deadline variable (business-rules, MSG catalogue; F-15).
