# Acceptance Criteria — Clients (F-06)

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## List

## AC-CLI-001 — Klien list
Covers: BR-CLI-001, BR-CLI-002, BR-WS-003 (A-1, A-3, A-7)

**Given** an Owner whose workspace has *Rina* (number `6281234567890`, Instagram `rina.wed`), *ade* (no number) and *Budi* (archived)
**When** they open *Klien*
**Then** the *Aktif* filter shows *ade* then *Rina*. *Rina*'s row shows `+62 812-3456-7890` and `@rina.wed`; *ade*'s row shows *Belum ada nomor WhatsApp*. *Budi* is not shown. The page shows *Tambah klien*, the search box and the *Aktif* / *Arsip* filter. The nav item *Klien* (icon `users`) is active, and no *Segera hadir* placeholder is shown.

## AC-CLI-002 — Archived filter
Covers: BR-CLI-003

**Given** the workspace from AC-CLI-001
**When** the Owner selects *Arsip*
**Then** only *Budi* is shown, with *Pulihkan* instead of *Arsipkan*.

## AC-CLI-003 — Empty lists
Covers: C-007

**Given** a workspace with no clients
**When** the Owner opens *Klien*, then selects *Arsip*
**Then** *Aktif* shows *Belum ada klien* with *Tambah klien*, and *Arsip* shows *Belum ada klien yang diarsipkan*.

## AC-CLI-004 — Search
Covers: BR-CLI-002 (A-4)

**Given** the workspace from AC-CLI-001
**When** the Owner searches *RIN*, then `0812 3456`, then `+62812`, then *zzz*
**Then** the first three each show only *Rina*; *zzz* shows *Tidak ada klien yang cocok* with *Hapus pencarian*, which clears the search. The query stays in the URL, so reloading keeps the result. Search applies only to the selected filter.

## AC-CLI-005 — Paging
Covers: A-5

**Given** a workspace with 65 active clients
**When** the Owner opens *Klien* and selects *Muat lebih banyak* twice
**Then** 30, then 60, then 65 clients are shown in name order with no duplicates or gaps, and *Muat lebih banyak* disappears once all are shown.

## AC-CLI-021 — Client count
Covers: BR-WS-003 (A-5, A-10)

**Given** a workspace with 38 active clients, among them *Rina*, and 1 archived client
**When** the Owner opens *Klien*, selects *Arsip*, returns to *Aktif*, searches *RIN*, clears the search, archives *Rina*, and then adds a client
**Then** the list card shows the title *Daftar klien* (not the page title *Klien*) with the subtitle *38 klien aktif*, although only 30 rows are loaded. *Arsip* shows *1 klien diarsipkan*. While searching, the subtitle stays *38 klien aktif*. After *Rina* is archived it shows *37 klien aktif* (and *Arsip* *2 klien diarsipkan*); after the new client is added it shows *38 klien aktif*. A workspace with no clients shows *0 klien aktif*. The subtitle is hidden while the list loads, and another workspace's clients are never counted.

## Add & edit

## AC-CLI-006 — Add a client
Covers: BR-CLI-001, BR-CLI-002 (A-2, A-8)

**Given** the *Tambah klien* dialog
**When** the Owner sees one empty *Instagram* row, enters *Rina Wedding*, `0812-3456-7890` and Instagram `@rina.wed`, adds a *TikTok* row `https://www.tiktok.com/@rina`, and confirms
**Then** an active client is stored with the trimmed name, number `6281234567890`, social links Instagram `rina.wed` and TikTok `https://www.tiktok.com/@rina` in that order, and `updatedBy` set to the Owner. The dialog closes, the list shows the client, and a success toast confirms.

## AC-CLI-007 — Optional fields
Covers: BR-CLI-001, BR-CLI-002

**Given** the *Tambah klien* dialog
**When** the Owner enters only the name *ade*, leaves the WhatsApp field and the Instagram row empty, and confirms
**Then** the client is stored with no number and no social links (the empty row is dropped). Removing the Instagram row before saving has the same result.

## AC-CLI-008 — Name validation
Covers: BR-CLI-001, C-004

**Given** the add or edit dialog
**When** the name is empty or only spaces, or longer than 100 characters after trimming
**Then** a field error is shown, nothing is stored, and the server applies the same rule when the form is bypassed. Two clients may have the same name.

## AC-CLI-009 — WhatsApp number normalization
Covers: BR-CLI-002, C-004

**Given** the add or edit dialog
**When** the Owner enters `0812 3456 7890`, `+62 812-3456-7890`, `62812.3456.7890`, `812 3456 7890` or `(0812) 3456-7890`
**Then** each is stored as `6281234567890`. `+1 415 555 0100` is stored as `14155550100`. `0812`, `abc`, `+62 812 3456 7890 1234 5` and `00812345678` show *Nomor WhatsApp tidak valid*, and nothing is stored; the server applies the same rule when the form is bypassed.

## AC-CLI-010 — WhatsApp number is unique per workspace
Covers: BR-CLI-002, C-003 (A-9)

**Given** a workspace with *Rina* (`6281234567890`) and archived *Budi* (`6289876543210`)
**When** the Owner adds or edits another client with `0812 3456 7890`, or with `0898 7654 3210`, including two tabs saving the same number at once
**Then** the field shows *Nomor ini sudah dipakai Rina*, or *Nomor ini sudah dipakai Budi (diarsipkan)*, and the database keeps one client with that number. The same number in another workspace is allowed, and saving a client with its own unchanged number succeeds.

## AC-CLI-011 — Social-media rows
Covers: BR-CLI-001, C-004 (A-2)

**Given** the add or edit dialog
**When** the Owner adds rows up to 10, then tries an 11th; enters a value longer than 200 characters; enters Instagram `@rina.wed` and Instagram `RINA.WED` in two rows; or sends an unknown platform by bypassing the form
**Then** *Tambah media sosial* is disabled at 10 rows; the long value and the duplicate row each show an error on that row; the unknown platform is rejected by the server; and nothing is stored in any of these cases. Removing a row with its button removes only that row, and focus moves to a sensible neighbour.

## AC-CLI-012 — Edit a client
Covers: BR-CLI-001, BR-CLI-002 (A-8)

**Given** a client *Rina* with an Instagram link
**When** the Owner selects *Ubah*, renames her to *Rina & Dimas*, removes the Instagram row, adds a *Facebook* row and saves
**Then** the whole client is stored as edited with `updatedBy`, the list shows the new name in the right order, and a toast confirms. Closing the dialog without saving changes nothing.

## Manage

## AC-CLI-013 — Archive and restore
Covers: BR-CLI-003

**Given** an active client
**When** the Owner selects *Arsipkan*
**Then** it's stored as archived with `archivedAt`, with no confirmation dialog; it leaves the *Aktif* list and appears under *Arsip*, and a toast confirms with *Batalkan*. *Batalkan*, or *Pulihkan* under *Arsip*, makes it active again and clears `archivedAt`.

## AC-CLI-014 — Delete
Covers: BR-CLI-003

**Given** a client, active or archived, that no project refers to
**When** the Owner selects *Hapus* and confirms *Hapus klien "{name}"?*
**Then** the client and its social links are deleted, the list updates, and a toast confirms; the number becomes free for another client. Choosing *Batal* deletes nothing.

## AC-CLI-015 — A client with projects can't be deleted
Covers: BR-CLI-003, C-003

**Given** a client that a project refers to (made possible by F-07; tested at the database and use-case level until then)
**When** anything tries to delete it
**Then** the delete is refused with *Klien ini punya proyek. Arsipkan saja.*, and the client and its projects are unchanged.

## AC-CLI-016 — Open WhatsApp
Covers: A-6, C-106

**Given** a client with number `6281234567890`, and one without a number
**When** the Owner opens each row's actions
**Then** the first offers *Buka WhatsApp*, a link to `https://wa.me/6281234567890` that opens in a new tab with no prefilled text; the second has no *Buka WhatsApp*.

## Errors & security

## AC-CLI-017 — Server error
Covers: C-007

**Given** the add, edit, archive, restore or delete request fails unexpectedly
**When** the Owner submits it
**Then** a danger toast *Perubahan belum tersimpan* with *Coba lagi* is shown, any dialog keeps its input, and stored data is unchanged.

## AC-CLI-018 — Workspace isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** an Owner
**When** they open *Klien* for a workspace they don't own or that doesn't exist, search it, or submit add, edit, archive, restore or delete with a client ID from another workspace
**Then** they get *not found*, nothing changes, and no data from that workspace is returned (including in search results and the number-taken message).

## AC-CLI-019 — No client PII in logs
Covers: C-103, architecture overview › Observability

**Given** any client action, including a failed one
**When** the server logs are inspected
**Then** they carry only the workspace ID, client ID and outcome code: no name, number, social link, search query or WhatsApp link.

## Accessibility & states

## AC-CLI-020 — States and accessibility
Covers: C-007, C-008

**Given** *Klien* at desktop and phone widths, light and dark
**When** the Owner uses the search, the filter, the row actions, the dialog's social rows and the delete confirmation with the keyboard only
**Then** every state in the spec's UI States is reachable, focus moves into each dialog and back to its trigger, each social row's platform, value and remove button have accessible names that include the row's platform, field errors are linked to their fields, the search result count and toasts are announced, and axe (wcag2a/2aa/21a/21aa) reports no violations.
