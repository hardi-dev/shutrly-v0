# Acceptance Criteria — Simplify project and gallery creation (F-27)

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime). UI labels are working copy; the design may rename them.

Shared fixture: the Owner's workspace has the active service *Wisuda* with one selection item *Foto edit* (`COUNT`, 25), the active workspace source *Google Drive*, the client *Rina*, and a public Drive folder *Rina-Wisuda* with three images.

## Gallery created on booking
**AC-GFL-001 — Booking creates the gallery** (BR-GAL-001, BR-GAL-002, BR-SEL-001)
Given the Owner creates a project for *Rina* from *Wisuda* as `BOOKED` with one session
When the project is saved
Then the project has exactly one gallery with an encrypted generated password of 6–64 characters, no expiry and no sources
And it has one `OPEN` selection group *Foto edit* with base limit 25.

**AC-GFL-002 — Confirming a draft creates the gallery** (BR-GAL-001, BR-PRJ-004)
Given a `DRAFT` project with one session and no gallery
When the Owner confirms it
Then it is `BOOKED` and has one gallery and its selection groups, created in the same transaction.

**AC-GFL-003 — Nothing is saved when gallery creation fails** (BR-GAL-001, C-005)
Given gallery creation fails while a project is being booked
When the Owner saves
Then no project, session, gallery or selection group is saved, and the F-07 error is shown.

**AC-GFL-004 — A draft project has no gallery and no *Buat galeri*** (BR-GAL-001)
Given a `DRAFT` project
When the Owner opens it
Then the *Galeri* card says the gallery is created when the project is booked, and there is no action to create one.

**AC-GFL-005 — Existing booked projects get a gallery** (BR-GAL-001, ADR-028)
Given a `SHOOTING` project with no gallery before the migration
When the backfill runs
Then the project has one gallery with a generated password and its selection groups, and running the backfill again creates nothing more.

## No gallery status
**AC-GFL-006 — No publish, archive or delete** (BR-GAL-005)
Given a booked project's gallery
When the Owner opens the project page and the gallery page
Then there is no *Buat galeri*, *Publikasikan*, *Arsipkan* or *Hapus galeri* action, and no gallery status chip other than A-3's labels.

**AC-GFL-007 — The gallery card asks for the folder** (BR-GAL-004)
Given a booked project whose gallery has no source
When the Owner opens the project page
Then the *Galeri* card shows *Tambah folder Drive*, which opens the gallery page's *Sumber foto*.

**AC-GFL-008 — The client gets in without a publish step** (BR-ACC-001, BR-GAL-005)
Given a booked project whose gallery has a synced source and no expiry
When the client opens `/g/{token}` and enters the current password
Then the gallery opens with its proof photos.

**AC-GFL-009 — Empty gallery for the client** (BR-ACC-001, A-4)
Given a booked project whose gallery has no visible photos
When the client opens the link and enters the password
Then they see the empty state (*Photos aren't ready yet*) and no photo grid, in the current language.

## Expiry
**AC-GFL-010 — Duration from presets** (BR-GAL-005, A-1)
Given an open gallery
When the Owner picks *14 days* and saves
Then `expiresAt` is the save time plus 14 days, and the card shows that date.

**AC-GFL-011 — Only preset durations and dates from today** (BR-GAL-005, A-1, A-2)
Given an open gallery
When the server receives a duration not in the presets, or a date before today
Then it refuses with a field error and the expiry is unchanged.

**AC-GFL-012 — Close by setting today, reopen by changing it** (BR-GAL-005)
Given an open gallery
When the Owner sets the expiry to today and that moment passes
Then the Owner sees *Kedaluwarsa* and the client gets the neutral unavailable page
And when the Owner then clears the expiry, the client gets in again with the same link and password.

## Sharing and sources
**AC-GFL-013 — *Kirim link galeri* needs a linked folder** (BR-GAL-010)
Given a `BOOKED` project whose gallery has no source
When the Owner opens the project menu
Then *Kirim link galeri* is not shown
And when the Owner links a folder, it is shown even while the first sync is running.

**AC-GFL-014 — *Kirim link galeri* from `BOOKED` to `COMPLETED`** (BR-GAL-010)
Given projects with a linked folder in each status
When the Owner opens each project menu
Then *Kirim link galeri* shows for `BOOKED`, `SHOOTING`, `POST_PROCESSING`, `DELIVERED` and `COMPLETED`, and not for `CANCELLED` or an expired gallery.

**AC-GFL-015 — The last folder can be removed** (BR-GAL-009)
Given a gallery whose only source has no picked photos
When the Owner removes it
Then the source and its photos are deleted and *Kirim link galeri* is no longer shown
And given a source with a picked photo, removal is refused as before.

## Cancelled projects and final delivery
**AC-GFL-016 — Cancelling closes the gallery** (BR-PRJ-010, BR-GAL-005, BR-GAL-009)
Given a `BOOKED` project with a synced gallery
When the Owner cancels the project
Then the client gets the neutral unavailable page, the Owner sees the gallery read-only with *Ditutup*, and sync, source, expiry and password changes are refused.

**AC-GFL-017 — *Tandai terkirim* moves the project to `DELIVERED`** (BR-DEL-003, BR-PRJ-004)
Given a `POST_PROCESSING` project whose gallery has one synced `EDITED` file
When the Owner confirms *Tandai terkirim*
Then the project is `DELIVERED` with the time and actor recorded, and the gallery page has no *Publikasikan hasil akhir*
And given a project with no synced finished file, *Tandai terkirim* is disabled and the server refuses it.

**AC-GFL-019 — Finished files are visible once synced** (BR-DEL-002)
Given an open gallery whose *Foto edit* item is mapped to the subfolder `Edited`
When a sync finds `E_001.jpg` in `Edited`
Then the client sees it under *Hasil akhir* and can download it, with the project still `POST_PROCESSING`.

**AC-GFL-020 — Share from the cards** (BR-GAL-010, BR-MSG-003)
Given a `BOOKED` project whose gallery has a linked folder
When the Owner opens the project page and the gallery page
Then the *Galeri* card and the gallery page header each show *Kirim link ke klien*, which opens the same `GALLERY_SHARE` message preview as the project menu
And given a gallery with no folder, expired, or on a cancelled project, neither place shows it.

## Seed
**AC-GFL-018 — The demo seed runs end to end** (ADR-028)
Given a new Owner email
When `scripts/dev/seed-staging.sh <email>` runs
Then it creates the Owner, workspace, a booked project with its gallery and synced folder, writes the credentials file, and exits 0.
