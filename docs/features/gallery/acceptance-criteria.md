# Acceptance Criteria — Gallery (F-09)

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime). UI labels are working copy; the design may rename them.

Shared fixture, used unless an AC says otherwise. The Owner's workspace has:
- workspace sources *Google Drive* (active) and *Drive Lama* (inactive);
- project *Wisuda Rina* (`BOOKED`) and project *Wisuda Sari* (`DRAFT`);
- a public Drive folder *Rina-Wisuda* with:
  - root: `IMG_001.jpg`, `IMG_002.jpg`, `IMG_010.jpg`, `notes.pdf`, `clip.mp4`;
  - `Edited/`: `E_001.jpg`, `E_002.jpg`;
  - `print/`: `P_001.jpg`;
  - `raw/`: `R_001.jpg`;
  - `Edited/old/`: `X_001.jpg`.

## Create

## AC-GAL-001 — Create a gallery from the project
Covers: BR-GAL-001, BR-GAL-002, BR-GAL-009 (A-1, A-11)

**Given** project *Wisuda Rina* has no gallery
**When** the Owner opens the project and chooses *Buat galeri*
**Then** the password field is prefilled with a generated password such as *mawar-4821*, and *Buat ulang* replaces it with another one.

**When** the Owner keeps it and submits
**Then**:
- the project has one gallery in `DRAFT` with no sources;
- the Galeri card shows *Draf* and a way to add a source;
- the database stores the password encrypted and as a hash, never in plain text, with `passwordVersion` 1.

## AC-GAL-002 — Password rules
Covers: BR-GAL-002

**Given** the create form
**When** the Owner replaces the proposal with `abc12` (5 characters) or 65 characters
**Then** the form shows a field error and no gallery is created. 6 and 64 characters are accepted.

## AC-GAL-003 — Only booked-or-later projects
Covers: BR-GAL-009

**Given** project *Wisuda Sari* is `DRAFT` and another project is `CANCELLED`
**When** the Owner opens either project, or calls the create action directly
**Then** no *Buat galeri* is offered. The draft's card says a gallery is available once the project is booked, and the direct call is refused with a domain error.

## AC-GAL-004 — One gallery per project
Covers: BR-GAL-001

**Given** *Wisuda Rina* already has a gallery
**When** a second create request arrives (for example a double submit)
**Then** it is refused and the project still has exactly one gallery.

## Sources and sync

## AC-GAL-005 — Add a source and sync it
Covers: BR-SRC-002, BR-SRC-004, BR-GAL-006, BR-GAL-007 (A-9)

**Given** a `DRAFT` gallery for *Wisuda Rina*
**When** the Owner adds a source with *Google Drive* and the *Rina-Wisuda* folder link
**Then**:
- the public-link warning is shown before saving;
- after sync, the gallery has:
  - `PROOF` `IMG_001.jpg`, `IMG_002.jpg`, `IMG_010.jpg` and `raw/R_001.jpg`;
  - `EDITED` `Edited/E_001.jpg`, `Edited/E_002.jpg` and `Edited/old/X_001.jpg`;
  - `PRINT` `print/P_001.jpg`;
- `notes.pdf` and `clip.mp4` are ignored;
- the source shows status *Berhasil*, the sync time, and the counts 4 proof · 3 edited · 1 print · 2 diabaikan.

## AC-GAL-006 — Re-sync never duplicates
Covers: BR-GAL-006, C-005

**Given** the source from AC-GAL-005
**When** the Owner syncs it twice more, and two sync requests for it arrive at the same time
**Then** the gallery still has exactly 8 photos, and each `(source, externalFileId)` appears once.

## AC-GAL-007 — New and missing files
Covers: BR-GAL-006

**Given** the synced source from AC-GAL-005, after which `IMG_002.jpg` is removed and `IMG_011.jpg` is added in Drive
**When** the Owner syncs again
**Then**:
- `IMG_011.jpg` appears as `PROOF`;
- `IMG_002.jpg` is kept, marked *Hilang*, hidden from the client, and counted as 1 missing on the source.

**When** `IMG_002.jpg` is put back and the Owner syncs again
**Then** it is no longer missing.

## AC-GAL-008 — Folder that can't be read
Covers: BR-GAL-006, BR-SRC-003, C-103

**Given** a folder link that is not shared publicly
**When** the Owner adds it
**Then**:
- the source is created with status *Gagal* and a reason telling the Owner to share the folder as "Anyone with the link";
- no photos are added;
- after the folder is shared and the Owner syncs again, the photos appear;
- no log line or error record contains the Drive link or the API key.

## AC-GAL-009 — Invalid link
Covers: BR-SRC-002

**Given** the add-source form
**When** the Owner pastes a link that isn't a Drive folder (for example a Drive file link or `https://example.com`)
**Then** a field error is shown and no source is created.

## AC-GAL-010 — Same folder twice
Covers: BR-GAL-009

**Given** *Rina-Wisuda* is already linked to this gallery, and folder *Shared-Album* is linked to another project's gallery
**When** the Owner adds *Rina-Wisuda* again, then adds *Shared-Album*
**Then** *Rina-Wisuda* is refused as already linked. *Shared-Album* is added after a warning naming the other project.

## AC-GAL-011 — Only active workspace sources can be chosen; deactivation keeps existing ones
Covers: BR-SRC-006, BR-GAL-004

**Given** the gallery has a source created from *Google Drive*
**When** the Owner opens *Add source*, then deactivates *Google Drive* in *Sumber foto* and returns
**Then**:
- *Drive Lama* is never offered;
- after deactivation, *Google Drive* is no longer offered for new sources;
- the existing gallery source still syncs and still counts as active for publishing.

## AC-GAL-012 — Several sources together
Covers: BR-GAL-006, BR-GAL-007 (A-5)

**Given** the gallery has *Rina-Wisuda* and a second folder with root `IMG_003.jpg`
**When** the Owner chooses *Sync semua*, and the second folder fails
**Then**:
- each source shows its own result;
- *Rina-Wisuda*'s photos are updated even though the other source failed;
- *Proof* lists `IMG_001`, `IMG_003`, `IMG_010` … in file-name order, each labelled with its source.

## AC-GAL-013 — Remove a source
Covers: BR-GAL-009, BR-GAL-004 (A-6)

**Given** a `PUBLISHED` gallery with sources *Rina-Wisuda* and *Extra*
**When** the Owner removes *Extra* and confirms
**Then** *Extra* and its photos are hidden from the client and shown to the Owner as removed, and they are not deleted.

**When** the Owner then tries to remove *Rina-Wisuda*
**Then** it is refused, because a published gallery needs at least one active source.

## Owner view

## AC-GAL-014 — Photos by kind with client visibility
Covers: BR-GAL-007, BR-DEL-002, BR-GAL-006

**Given** the synced gallery from AC-GAL-007
**When** the Owner opens the gallery screen
**Then**:
- the *Foto* card shows *5 proof · 3 edited · 1 print* and a preview of the first photos, with the missing `IMG_002.jpg` marked *Hilang*, and *Lihat semua foto*;
- in *Semua foto*, the tabs *Proof (5)*, *Edited (3)*, *Print (1)* show the folder tree, and *Proof* shows the folder `raw` and the root photos together at the same tile size;
- *Proof* is marked visible to the client once published, and *Edited* and *Print* hidden until final delivery;
- loading, empty (no sources yet: a prompt to add a folder) and error states are shown where they apply (C-007).

## AC-GAL-015 — Owner-only media
Covers: BR-SRC-003, BR-ACC-005, BR-WS-002

**Given** a thumbnail on the gallery screen
**When** the browser loads it
**Then**:
- the image comes from a Shutrly endpoint;
- no response, URL or page source contains the API key or a Drive link;
- the same URL returns nothing without a signed-in Owner of that workspace;
- the response is not publicly cacheable.

## Publish and lifecycle

## AC-GAL-016 — Publish
Covers: BR-GAL-004, BR-GAL-005

**Given** a `DRAFT` gallery with an accessible source
**When** the Owner chooses *Publikasikan* and confirms
**Then** the server lists the folder again, the gallery becomes `PUBLISHED`, and the Galeri card shows *Dipublikasikan*.

## AC-GAL-017 — Publish refused
Covers: BR-GAL-004

**Given** a `DRAFT` gallery with no sources, or whose only source has stopped being public since its last sync
**When** the Owner tries to publish
**Then** publishing is refused, the gallery stays `DRAFT`, and the Owner sees which source failed and why. With two sources of which one fails the check, publishing succeeds.

## AC-GAL-018 — Expiry by duration
Covers: BR-GAL-005 (A-4)

**Given** a `DRAFT` gallery with expiry *30 hari*
**When** it is published on 2026-10-04 10.00
**Then** `expiresAt` is 2026-11-03 10.00.

**Given** a `PUBLISHED` gallery with no expiry
**When** the Owner sets *7 hari* on 2026-10-10 09.00
**Then** `expiresAt` is 2026-10-17 09.00.

## AC-GAL-019 — Expiry by date and no expiry
Covers: BR-GAL-005 (A-4)

**Given** a gallery
**When** the Owner sets the date 2026-12-31, and later removes the expiry
**Then**:
- with the date set, it expires at the end of 2026-12-31 in workspace local time;
- after removal it has no expiry;
- a date before today is refused.

## AC-GAL-020 — Expired and re-opened
Covers: BR-GAL-005 (A-7)

**Given** a `PUBLISHED` gallery whose `expiresAt` has passed
**When** the Owner opens it
**Then** it shows *Kedaluwarsa* with no background job needed.

**When** the Owner sets a later expiry or removes it
**Then** it is `PUBLISHED` again, with the same link and password.

## AC-GAL-021 — Rotate password
Covers: BR-GAL-003, BR-GAL-002, BR-AUD-001

**Given** a `PUBLISHED` gallery with `passwordVersion` 1
**When** the Owner chooses *Ganti password*, keeps the new proposal (or types `baru2026`) and confirms
**Then**:
- the encrypted password and the hash change, and `passwordVersion` is 2;
- the gallery screen shows the new password;
- an audit record has the actor and time, and no password;
- the Owner sees a reminder to share the new password.

## AC-GAL-022 — Archive is final and read-only
Covers: BR-GAL-005, BR-GAL-009

**Given** a `PUBLISHED` gallery
**When** the Owner archives it and confirms
**Then**:
- it becomes `ARCHIVED`;
- sync, source changes, expiry changes, password rotation and publish are no longer offered;
- each of those is refused if called directly;
- there is no unarchive.

## AC-GAL-023 — Delete a draft
Covers: BR-GAL-005 (A-10)

**Given** a `DRAFT` gallery with a source and photos
**When** the Owner deletes it and confirms
**Then** the gallery, its sources and photo records are gone, and the card offers *Buat galeri* again.

**Given** a gallery that is or was published
**When** a delete request arrives
**Then** it is refused.

## AC-GAL-024 — Cancelling the project
Covers: BR-PRJ-010, BR-GAL-005, BR-GAL-009, C-005 (A-8)

**Given** *Wisuda Rina* (`BOOKED`) with a `PUBLISHED` gallery
**When** the Owner cancels the project
**Then** the project is `CANCELLED` and the gallery `ARCHIVED` in the same transaction; if either fails, neither changes.

**Given** a cancelled project with a `DRAFT` gallery
**Then** it can't be published, synced or edited, only deleted.

## Isolation and access

## AC-GAL-025 — Workspace isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** a gallery, source and photo in workspace A
**When** the Owner of workspace B requests any of them through any gallery action or media URL, including with a correct ID
**Then** the response is not found, and nothing is read or changed.

## AC-GAL-026 — Accessibility
Covers: C-008

**Given** the Galeri card, the gallery screen and its dialogs (create, add source, expiry, rotate password, publish, archive, delete)
**When** they are used with the keyboard only and checked with axe
**Then** every action is reachable and labelled, focus moves into and out of dialogs correctly, and there are no serious or critical axe violations.

## AC-GAL-027 — The Owner sees and copies the password
Covers: BR-GAL-002, C-103, BR-WS-002 (ADR-017)

**Given** a gallery whose password is *mawar-4821*
**When** the Owner opens the gallery screen
**Then**:
- the password is shown with *Salin*, which copies it;
- the Owner of another workspace gets not found;
- no log line, analytics event, error record or client response contains the password or its ciphertext.

## AC-GAL-028 — Many photos: folders and infinite scroll
Covers: BR-GAL-007 (A-12, A-13)

**Given** a gallery with *Rina-Wisuda* (212 proof, 40 edited) and *Rina-Keluarga* (100 proof)
**When** the Owner opens *Lihat semua foto*
**Then** the tabs read *Proof (312)*, *Edited (40)*, *Print (0)*, and *Proof* shows two folder tiles, *Rina-Wisuda · 212* and *Rina-Keluarga · 100*.

**When** the Owner opens *Rina-Wisuda*
**Then**:
- the breadcrumb reads *Semua folder › Rina-Wisuda*;
- the first 48 photos show in file-name order;
- scrolling near the end loads the next 48, with a skeleton row while loading, until all 212 are shown.

**Given** a gallery with a single source
**When** the Owner opens a tab
**Then** that source's photos show directly, without the folder step.

## AC-GAL-029 — Search by file name
Covers: BR-GAL-006 (A-13)

**Given** the gallery from AC-GAL-028
**When** the Owner types `IMG_02` in *Cari nama file* in *Semua foto*
**Then**:
- the matches from every folder and kind show, each with its folder (for example *Rina-Wisuda · edited*);
- a search with no match shows *Tidak ada foto bernama “…”*;
- clearing the search returns to the folder view.

## AC-GAL-030 — Subfolders browse like Drive
Covers: BR-GAL-007 (A-12, A-14)

**Given** *Rina-Wisuda* holds `IMG_001.jpg` and the folders `Akad/` (`A_001.jpg`, `edited/AE_001.jpg`) and `Resepsi/` (`R_010.jpg`)
**When** the Owner opens *Proof* in *Semua foto* on a gallery whose only source is *Rina-Wisuda*
**Then**:
- the grid shows the folder tiles *Akad · 1 foto* and *Resepsi · 1 foto*, then `IMG_001.jpg`, all the same tile size;
- opening *Akad* shows `A_001.jpg` under the breadcrumb *Semua folder › Rina-Wisuda › Akad*.

**When** the Owner opens *Edited*
**Then** it shows the folder *Akad · 1 foto*, and inside it `AE_001.jpg`. The `edited` folder level is folded into *Akad*.

**Given** a folder 6 levels below the source
**When** the source syncs
**Then** its photos are skipped, and the sync summary reports *1 folder terlalu dalam*.

## AC-GAL-031 — Photo preview
Covers: BR-GAL-006, BR-DEL-002, BR-SRC-003, BR-WS-002

**Given** *Rina-Wisuda › Akad* with 64 proof photos
**When** the Owner opens `A_012.jpg` from *Semua foto*
**Then**:
- a full-screen preview shows the photo;
- the top bar shows `A_012.jpg`, *Rina-Wisuda › Akad · Proof · 12 dari 64* and *Buka di Google Drive*;
- the filmstrip highlights the current photo;
- → (or the right-arrow key, or a filmstrip thumbnail) shows another photo, and Esc closes the preview.

**Given** the missing `IMG_002.jpg`
**When** the Owner opens it
**Then** the preview shows *File tidak ditemukan di Google Drive*, the top bar reads *… · Hilang · …*, and there is no *Buka di Google Drive*.

**Given** the Owner of another workspace
**When** they request the preview image or the Drive link of this photo
**Then** the response is not found.
