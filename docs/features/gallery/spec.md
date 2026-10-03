# Feature: Gallery

ID: F-09 · Slug: `gallery`
Status: SPECIFIED (2026-10-04) · Intent: [intent.md](intent.md) (ACCEPTED 2026-10-04) · Journeys: J-04, the Owner half (*Share Drive folder → Paste link, sync PROOF photos → Set password, publish gallery*)
Consumer: F-10 `client-access` (the published gallery, password hash and `passwordVersion`, the media endpoint), F-15 `whatsapp-share` (the decrypted password for `{{galleryPassword}}`, BR-MSG-003), F-11 `selection` (`PROOF` photos), F-12 `final-delivery` (`EDITED` / `PRINT` photos) and `galleryUrl`

## Goal
The Owner attaches a project's photos to the project without moving them out of Google Drive. From the project, the Owner creates one password-protected gallery, links one or more public Drive folders, syncs their metadata and checks the photos by kind. When ready, the Owner publishes the gallery, then manages its expiry and password and archives it at the end (BR-GAL-001..009).

## User Story
As a photographer (Owner), I want to link my project's Drive folders to one private gallery and see exactly which photos Shutrly found, so that I can publish it to my client with confidence and without uploading anything.

## Preconditions
- The Owner is signed in and the workspace in the URL is theirs (BR-WS-003, ADR-015).
- The project belongs to that workspace and is `BOOKED`, `SHOOTING`, `POST_PROCESSING`, `DELIVERED` or `COMPLETED` (BR-GAL-009).
- The workspace has at least one active source (BR-SRC-005; *Google Drive* is seeded).
- The Owner has shared each Drive folder as "Anyone with the link" (BR-SRC-002).
- **Platform:** a Google Cloud API key with the Drive API enabled is configured as a server secret (ADR-005). It doesn't exist yet: the Owner provisions it for non-production before build and for production before ship.

## Inputs
- **Create gallery:** password, prefilled with a generated easy-to-type proposal that the Owner may keep, regenerate or replace (6–64 characters, BR-GAL-002, A-11); optional expiry (none, a date, or a duration in days).
- **Add source:** workspace source (active ones only), Drive folder link (a URL with folder ID and optional resource key), and an optional label (A-3).
- **Change expiry:** none, a date (today or later), or a duration in whole days (1–3650, A-4).
- **Rotate password:** new password, prefilled with a new generated proposal (BR-GAL-003).
- **Actions:** sync one source, sync all, publish, remove source, archive, delete draft.

## Main Flow
1. On a `BOOKED`-or-later project, the project detail shows a **Galeri** card with *Buat galeri*.
2. The Owner keeps (or changes) the proposed password, optionally sets the expiry, and creates the gallery. It is a `DRAFT` with no sources. The password is stored encrypted plus a hash (BR-GAL-002, ADR-017).
3. The Owner adds a source: picks an active workspace source and pastes a Drive folder link. The public-link warning is shown (BR-SRC-004).
4. Adding the source syncs it (BR-GAL-006):
   - the whole folder tree is read (BR-GAL-007, up to A-14's depth);
   - images under a folder named `edited` / `print`, at any depth, become `EDITED` / `PRINT`;
   - every other image, in the root or in any other subfolder, becomes `PROOF`;
   - non-image files are ignored.
   The source records its sync status, time, counts and any error.
5. The gallery screen shows the password (with *Salin*), so the Owner never has to remember it. It also shows each source with its status and last sync.
   - **Foto card:** counts per kind (*Proof*, *Edited*, *Print*), a preview of the first 8 photos, and *Lihat semua foto*. Thumbnails come from the Owner-only media endpoint.
   - Each kind is marked for what the client will see: *Proof* is visible once published. *Edited* and *Print* are hidden until final delivery (BR-DEL-002). Missing and removed photos are hidden.
   - **Semua foto** (a modal; full screen on phones) holds all browsing (Owner 2026-10-04):
     - tabs by kind, each with its total;
     - the folder tree like Google Drive, keeping only the folders that hold photos of that kind. Folders and photos sit in one grid, folders first, at the same tile size. In *Edited* and *Print*, the `edited` / `print` folders are folded into their parent folder;
     - with several sources, the top level shows one folder per source. With a single source, its folder opens directly. A breadcrumb (*Semua folder › Rina-Wisuda › Akad*) leads back (A-12);
     - infinite scroll (A-13), with thumbnails loaded when visible;
     - *Cari nama file* across every folder; results show each photo's folder.
   - **Photo preview:** opening any photo, on the card or in the modal, shows a large preview, again through the Owner-only media endpoint.
     - It has ← / → (and the arrow keys) for the previous and next photo in the same list, and Esc closes it.
     - Info: file name, folder path, kind, *Hilang* if missing, and whether the client can see it.
     - *Buka di Google Drive* opens the file in Drive in a new tab. It is shown only to the Owner (BR-SRC-003 covers client responses only) and never for a missing file.
6. The Owner may sync one source or all of them again at any time. Repeated syncs never duplicate photos.
7. The Owner publishes:
   - the server checks that a password hash exists and lists every linked source again;
   - with at least one accessible source, the gallery becomes `PUBLISHED`;
   - a duration expiry becomes `expiresAt` = publish time + duration (BR-GAL-004, BR-GAL-005).
8. After publishing, the card shows *Dipublikasikan*, with the expiry and the source and photo summary. Sharing the link is F-10/F-15.

## Alternative Flows
- **Several sources:** the Owner adds more folders. Photos from all sources appear together, grouped by kind, and each photo shows its source (A-5).
- **Same folder twice:**
  - the same folder ID in the same gallery is refused;
  - a folder already linked to another gallery in the workspace is allowed, with a warning naming that project (BR-GAL-009).
- **File removed from Drive:** the next sync marks the photo *missing*. It is hidden from the client and flagged to the Owner with a count per source. It becomes visible again if a later sync finds it (BR-GAL-006).
- **Remove source:**
  - the source and its photos stay on record, but the photos are hidden;
  - it is refused when it is the last active source of a `PUBLISHED` or `EXPIRED` gallery (BR-GAL-009).
  - A removed source can't be re-synced. Linking the same folder again creates a new source whose sync re-matches nothing from the removed one (A-6).
- **Deactivated workspace source:** gallery sources already using it keep syncing and count as active. It no longer appears in *Add source* (BR-SRC-006).
- **Change expiry:** allowed in `DRAFT`, `PUBLISHED` and `EXPIRED`. A duration counts from publish on a draft and from the moment of saving otherwise. Setting a later expiry or removing it on an `EXPIRED` gallery returns it to `PUBLISHED` (BR-GAL-005).
- **Expiry passes:** a `PUBLISHED` gallery whose `expiresAt` is in the past is `EXPIRED` for every reader, Owner and public, without needing a job (A-7).
- **Rotate password:**
  - allowed in `DRAFT`, `PUBLISHED` and `EXPIRED`;
  - proposes a new generated password the Owner may replace;
  - replaces the encrypted password and the hash, and increments `passwordVersion` (BR-GAL-003);
  - records actor and time (BR-AUD-001);
  - reminds the Owner to share the new password.
- **Archive:** from `PUBLISHED` or `EXPIRED`, after confirmation. It is final; the gallery becomes read-only (BR-GAL-005, BR-GAL-009).
- **Delete draft:** a `DRAFT` gallery can be deleted after confirmation, with its sources and photo records. The card returns to *Buat galeri* (BR-GAL-005).
- **Project cancelled:** cancelling the project archives a `PUBLISHED` or `EXPIRED` gallery in the same transaction. A `DRAFT` gallery on a cancelled project stays a read-only draft that can only be deleted (BR-PRJ-010, BR-GAL-009, A-8).
- **Project `DRAFT`:** the Galeri card explains that a gallery can be created once the project is booked. There is no *Buat galeri* (BR-GAL-009).

## Error Cases
- **Password:** shorter than 6 or longer than 64 characters. The field error is shown and nothing is saved. There is no confirmation field: the password stays visible to the Owner.
- **Invalid link:** not a Drive folder link. A field error; no source is created.
- **Folder can't be listed** (not public, deleted, wrong resource key): the source is still created, with sync status *Gagal* and a plain-language reason. The Owner can fix the sharing and sync again. The Drive link is never logged (C-103).
- **Partial failure in *Sync all*:** each source reports its own result; one failure doesn't roll back the others.
- **Provider unavailable or quota exceeded:** the sync fails with a retry message. Earlier photos stay unchanged.
- **Concurrent syncs of the same source:** they never create duplicates. A second request while one runs is refused or waits (C-005; mechanism in the technical design).
- **Publish refused:**
  - no sources, or none passes the publish-time check: the Owner sees which source failed and why (BR-GAL-004);
  - on a `CANCELLED` project.
- **Gallery already exists:** creating a second gallery for the project is refused (BR-GAL-001), including from a double submit.
- **Action not allowed in this state:** for example sync on `ARCHIVED`, remove the last active source of a published gallery, or delete a published gallery. Refused server-side with a domain error (C-004), even if the UI hides the action.
- **Another workspace's project, gallery or photo:** not found (BR-WS-002, C-101).

## Business Rules
- BR-GAL-001..009 (BR-GAL-002, -004, -005 and -006 amended and BR-GAL-009 added in this discovery)
- BR-SRC-001..006 (BR-SRC-006 SPEC GAP resolved)
- BR-PRJ-004, BR-PRJ-010 (cancelling archives the gallery)
- BR-DEL-002 (edited/print hidden until final delivery: shown to the Owner as *hidden*)
- BR-AUD-001 (password rotation)
- BR-WS-002, BR-WS-003
- BR-ACC-005 and BR-SRC-003: media is delivered by the server; the API key and Drive links never reach the browser
- Constitution C-004, C-005, C-007, C-008, C-101, C-103

## Dependencies
- F-07 `projects`: project detail page (new Galeri card), project status, cancel action.
- F-04 `source-config`: workspace sources and their `isActive`.
- The Google Drive provider behind the `GallerySourceProvider` interface (ADR-005). It's new in this feature; F-04 only stored configurations.
- Server secret: the Drive API key (see Preconditions).
- ADR-008/009 (Workers, Neon `Pool` transactions), ADR-004 (token, `passwordVersion`), ADR-017 (encrypted, Owner-visible password; a new server secret, the encryption key, which the Owner provisions like the Drive API key), ADR-016 (cross-feature transaction for cancel → archive).

## Out of Scope
- The client view `/g/{token}`, password entry, client sessions, rate limits and public media access (F-10). The Owner-only media endpoint built here is reused there behind token and password.
- Selection groups and selection (F-11); final-delivery publishing (F-12).
- Sharing the gallery link or password and the *Kirim link galeri* menu item (F-10/F-15).
- Token rotation (BR-PRJ-003, F-10).
- The gallery slug (BR-GAL-008): no slug in F-09 (A-2).
- Linking photos to sessions (BR-TEAM-002).
- Scheduled or automatic sync; providers other than Google Drive; uploading files; nested folders beyond `edited` / `print`.
- Unpublishing, and unarchiving.

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1:** the gallery lives on the project's detail page (Galeri card) and on its own screen `/w/<id>/projects/<projectId>/gallery`. There is no workspace-wide gallery list (intent).
- **A-2:** no slug field in F-09.
- **A-3:** a source has an optional label (at most 60 characters); otherwise it shows the Drive folder name from the last sync.
- **A-4:** a duration is 1–3650 whole days; a date expires at the end of that day in the workspace's local time.
- **A-5:** photos are ordered by file name (natural order) within each kind, across sources.
- **A-6:** removing a source can't be undone.
- **A-7:** `EXPIRED` is derived from `expiresAt` when read. Whether it is also stored is a technical-design choice.
- **A-8:** a `DRAFT` gallery on a cancelled project is not archived, because it was never public. It can only be deleted.
- **A-9:** an image is a file whose MIME type starts with `image/`. Videos and other files are ignored and counted as *diabaikan* in the sync summary.
- **A-11:** a generated password is a common lowercase Indonesian word, a hyphen and four digits (for example *mawar-4821*). It has no look-alike characters and never contains the client's name. Brute force is limited by the token (≥128 bits) and rate limits (BR-ACC-004).
- **A-12:** a folder tile shows the folder name and its photo count for the active tab. Empty folders, and folders without photos of that kind, are not shown.
- **A-14:** sync reads folders up to 5 levels below the source. Deeper folders are skipped and counted in the sync summary as *n folder terlalu dalam*. Shortcuts to other folders are not followed.
- **A-13:** the grid loads 48 photos per page. Search matches part of a file name, ignoring case, and returns results 48 at a time too.
- **A-10 (delegated to Claude by the Owner, 2026-10-04):**
  - a `DRAFT` gallery can be deleted;
  - there is no unpublish;
  - `ARCHIVED` is final.

## Flagged Concerns
Checked against the constitution (C-001..C-106), BR-GAL/SRC/ACC/PRJ/DEL/AUD, ADR-004/005/008/016 and the coding rules (Security, *Easy to break*).

| ID | Concern | Conflicting sources | Owner decision | Status |
|---|---|---|---|---|
| FC-001 | Whether gallery sources under a deactivated workspace source sync and count as active was undecided. | BR-SRC-006 SPEC GAP ↔ BR-GAL-004 | They keep syncing and count as active (Owner 2026-10-04). Recorded in BR-SRC-006 and BR-GAL-004. | RESOLVED |
| FC-002 | A photo whose file disappears had no defined state, and deleting it would break F-11 selections. | BR-GAL-006 ↔ BR-SEL-004 | Keep the photo, mark it *missing* and hide it; it reappears if the file returns (Owner 2026-10-04). Recorded in BR-GAL-006. | RESOLVED |
| FC-003 | Expiry as a duration and re-opening an expired gallery weren't allowed by the lifecycle (`EXPIRED → ARCHIVED` only). | BR-GAL-005 | A duration counts from publish; `EXPIRED → PUBLISHED` on a later or removed expiry (Owner 2026-10-04). Recorded in BR-GAL-005 and the domain-model state diagram. | RESOLVED |
| FC-004 | Owner thumbnails need media from Drive, but the API key must never reach the browser, and controlled media delivery was scoped to F-10. | BR-SRC-003, BR-ACC-005 ↔ feature map F-10 | Build an Owner-only media endpoint in F-09; F-10 reuses it behind token and password (Owner 2026-10-04). | RESOLVED |
| FC-005 | Cancelling a project left a published gallery reachable by the client. | BR-PRJ-010 ↔ BR-GAL-005 | Cancelling archives the gallery in the same transaction (Owner 2026-10-04). Recorded in BR-PRJ-010 and BR-GAL-005. | RESOLVED |
| FC-006 | "Accessible" in the publish precondition was undefined. | BR-GAL-004 | Checked again with the provider at publish time (Owner 2026-10-04). Recorded in BR-GAL-004. | RESOLVED |
| FC-008 | Photographers keep shoots in subfolders (`Akad`, `Resepsi`), which BR-GAL-007 ignored, so their photos would never show. | BR-GAL-007, ADR-005 | Sync the whole tree. Any folder except `edited` / `print` is proof, and `edited` / `print` count at any depth. Folders are browsed like Drive (Owner 2026-10-04). | RESOLVED |
| FC-007 | Hash-only passwords meant the Owner had to remember and retype a password per project to share it, which isn't workable. | C-103, ADR-004, BR-GAL-002, BR-MSG-003 | Store the password encrypted (plus a hash), generate an easy-to-type one, show it to the Owner, and fill it into the WhatsApp message automatically (Owner 2026-10-04). Recorded in constitution v1.1, ADR-017, BR-GAL-002/003 and BR-MSG-003. | RESOLVED |

## Open Questions / SPEC GAPS
- **Resolved in design review (Owner, 2026-10-04):** how hundreds of photos are browsed. The answer is tabs by kind, then folders per source, infinite scroll and filename search (Main flow 5).

None blocking. For the technical design:
- **Sync on Workers (ADR-008):** a large folder means several Drive list pages plus up to two subfolders. The technical design must show that one sync fits the Worker's CPU, subrequest and duration limits (or splits the work) and stays idempotent (C-005).
- **Owner media endpoint:** thumbnail size and caching (`private, no-store` per coding rules, or a short private cache for the Owner only), and how it hides the API key (proxy vs. short-lived Drive thumbnail links resolved server-side).
