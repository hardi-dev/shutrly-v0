# Feature: Simplify project and gallery creation

ID: F-27 · Slug: `simplify-project-gallery-flow`
Status: DESIGNED (2026-10-18) · Intent: [intent.md](intent.md) (ACCEPTED 2026-10-18) · Journeys: J-03 (book a project), J-04 (Owner half: link Drive folder, share gallery)
Changes: F-07 `projects` (booking creates the gallery), F-09 `gallery` (no status, no *Buat galeri*, publish, archive or delete), F-10 `client-access` (availability, A-17, A-23, menu item). Rules: BR-GAL-001, 002, 004, 005, 009, 010; BR-ACC-001; BR-SEL-001; BR-PRJ-004, 010; BR-DEL-002, 003. Architecture: [ADR-028](../../architecture/decisions/ADR-028-gallery-without-stored-status.md).

## Goal
Every booked project already has its gallery, and the gallery has no status of its own. The Owner's only gallery task before sharing is linking the Drive folder. Nothing in the gallery is published: proofs and finished files are visible to the client as soon as they are synced.

## User Story
As an Owner, I want a booked project to come with its gallery ready, so I only paste the Drive folder link and share it, without creating, publishing or archiving a gallery.

## Preconditions
- The Owner is signed in and the workspace is verified (BR-WS-003).
- For the gallery to be created: the project moves to `BOOKED` (created as `BOOKED`, or a `DRAFT` confirmed), which needs at least one session (BR-PRJ-004, BR-TEAM-003).
- For *Kirim link galeri*: BR-GAL-010.

## Inputs
| Input | Where | Rules |
|---|---|---|
| Drive folder link + workspace source | the gallery page's *Sumber foto* (unchanged from F-09) | BR-SRC-002, BR-SRC-006, BR-GAL-009 |
| Expiry: a date, or a duration from a preset list | the gallery page's *Akses klien* card | BR-GAL-005; presets A-1 |
| New password (rotation) | *Akses klien* | BR-GAL-002, BR-GAL-003 (unchanged) |

## Main Flow — book a project, link a folder, share
1. The Owner creates a project as `BOOKED`, or confirms a `DRAFT` (F-07, unchanged form).
2. In the same transaction Shutrly creates the project's gallery (BR-GAL-001): a generated password (BR-GAL-002), no expiry, no sources, and one selection group per selection item (BR-SEL-001). If any part fails, nothing is saved and the Owner sees the existing F-07 error.
3. The project page's *Galeri* card shows that the gallery has no folder yet, with *Tambah folder Drive* leading to the gallery page's *Sumber foto*. There is no *Buat galeri*.
4. The Owner links a folder; the sync runs as in F-09 (BR-GAL-006, BR-GAL-007).
5. From the moment a folder is linked, *Kirim link ke klien* shows on the project's *Galeri* card and in the gallery page header, and *Kirim link galeri* in the project menu (BR-GAL-010). It builds the `GALLERY_SHARE` message with the password filled in (BR-MSG-003), unchanged from F-10.
6. The client opens `/g/{token}`, enters the password, and sees the gallery (BR-ACC-001). There is no publish step anywhere.

## Alternative Flows
- **Draft project:** no gallery exists. The *Galeri* card says the gallery is created when the project is booked (as today, without *Buat galeri*).
- **Draft deleted:** nothing to delete on the gallery side (BR-PRJ-010).
- **Client opens the link before photos arrive:** after the password, the client sees an empty state (*Photos aren't ready yet*) instead of the photo grid; selection groups exist but nothing can be picked (intent D-5).
- **Set an expiry:** the Owner picks a date, or a duration from the presets; a duration becomes `expiresAt` = now + duration on save (BR-GAL-005). The card shows the resulting date.
- **Close by hand:** the Owner sets the expiry to today. The gallery shows *Kedaluwarsa* to the Owner and is unavailable to clients. A later date, or clearing the expiry, reopens it with the same link and password (BR-GAL-005).
- **Expiry passes:** the gallery is expired for every reader without a job, as today (F-09 A-7).
- **Remove the last folder:** allowed unless a client pick references one of its photos (BR-GAL-009). *Kirim link galeri* disappears (BR-GAL-010); a client who already has the link sees the empty state.
- **Project cancelled:** the gallery is closed for good, derived from the project status: read-only for the Owner, unavailable to clients (BR-GAL-005, BR-PRJ-010). Nothing is written to the gallery.
- **Project moves on (`SHOOTING` … `COMPLETED`):** no effect on the gallery.
- **Finished files:** `EDITED` / `PRINT` files in mapped folders are visible to the client as soon as a sync finds them (BR-DEL-002). The *Hasil akhir* card has no *Publikasikan hasil akhir*; F-10's A-17 is withdrawn.
- **Mark delivered:** the Owner moves the project to `DELIVERED` with *Tandai terkirim* in the project header (the action bar on phones), after a confirmation, once at least one finished file is synced (BR-DEL-003). Its time is stored where the publish time was (`finalDeliveryPublishedAt`), so F-26's *Delivered* tile keeps working.
- **Projects booked before this change without a gallery:** the migration creates their galleries with generated passwords and selection groups (ADR-028 point 4, intent D-8).

## Error Cases
| Case | Result |
|---|---|
| Gallery creation fails while booking or confirming | The whole booking is rolled back; F-07's error message; the project stays as it was |
| Expiry duration not in the preset list, or a date in the past other than today | Refused with a field error (A-1, A-2) |
| Any gallery change (sync, source, expiry, password) on a `CANCELLED` project | Refused; the page is read-only (BR-GAL-009) |
| Removing a folder whose photos a client picked | Refused, as today (BR-GAL-009) |
| *Tandai terkirim* without a synced finished file, or from another status | Refused with the reason; the button is disabled with a hint (BR-DEL-003) |
| Client opens an expired gallery or one of a cancelled project | The neutral unavailable page, same status code as an unknown token (F-10 A-3, unchanged) |

## UI States (C-007)
- *Galeri* card (project page): `DRAFT` project (created on booking); no folder yet (*Tambah folder Drive*); syncing; has photos (summary as today, minus the status chip); expired (*Kedaluwarsa*); closed (cancelled project, read-only).
- *Kirim link ke klien* (primary button, `send` icon): in the *Galeri* card header after *Kelola galeri* (desktop) or below the card content (phones), and in the gallery page header after the ⋯ menu (desktop) or the sticky action bar (phones); hidden where BR-GAL-010 fails. *Akses klien* keeps *Ganti link* and *Ganti password*.
- Gallery page: the *Akses klien* card loses *Publikasikan* and *Arsipkan*; the header loses the status chip and the publish/archive/delete actions; expiry gets the date-or-preset control; the *Hasil akhir* card loses *Publikasikan hasil akhir*.
- Project page: *Tandai terkirim* as the header step on `BOOKED`, `SHOOTING` and `POST_PROCESSING`; disabled with a hint until a finished file is synced.
- Client gallery: the new empty state when there are no visible photos.

## Business Rules
BR-GAL-001, BR-GAL-002, BR-GAL-003, BR-GAL-004, BR-GAL-005, BR-GAL-006, BR-GAL-009, BR-GAL-010, BR-ACC-001, BR-SEL-001, BR-PRJ-004, BR-PRJ-010, BR-DEL-002, BR-DEL-003, BR-MSG-003.

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Duration presets:** 7, 14, 30, 60 and 90 days (intent open question). Changing the list is a copy and constant change.
- **A-2 Expiry date:** today or later; today closes the gallery (intent D-3). A date in the past is refused, so "closed by hand" always reads as today.
- **A-3 Status chip replacement:** the Owner sees *Kedaluwarsa* when expired, *Ditutup* on a cancelled project, and no chip otherwise (intent open question).
- **A-4 Client empty state** is one line of copy in EN and ID, inside the existing gallery shell; no new design frame beyond the state.
- **A-6 *Tandai terkirim* placement:** the project header step, like *Selesai pemotretan*, from `BOOKED`, `SHOOTING` and `POST_PROCESSING` (the statuses BR-DEL-003 already allowed); the `FINAL_DELIVERY` message (*Kirim hasil akhir*) stays in the menu on `DELIVERED`.
- **A-5 Migration order:** release 1 ships code that ignores `status`, `published_at`, `archived_at` and `expiry_days` and creates galleries on booking, plus the backfill script; release 2 drops the columns and their checks (ADR-028 point 4, ADR-027).

## Dependencies
- F-07 `projects` (create as `BOOKED`, confirm draft), F-09 `gallery`, F-10 `client-access` (availability, selection groups, project menu, final delivery).
- ADR-016: the gallery is created from the composition layer, in the booking transaction.
- `scripts/dev/seed.ts`: drop its publish step; its gallery step also fails today with "`headers` was called outside a request scope" (fix in this feature, since the seed changes anyway).

## Out of Scope
- Changes to the project lifecycle (BR-PRJ-004) and the *New project* form.
- Linking the Drive folder inside *New project* (intent option B).
- Folder mapping, browsing, selection and final-delivery behaviour beyond the points above.
- A workspace setting for a default expiry (intent D-4: none).

## Flagged Concerns
| ID | Concern | Sources | Decision | Status |
|---|---|---|---|---|
| FC-001 | Removing the last folder was refused on a published gallery; without publish, should it still be? | BR-GAL-004, BR-GAL-009 (old) | Allowed; only a client pick blocks removal. *Kirim link galeri* hides and the client sees the empty state (Owner 2026-10-18). Recorded in BR-GAL-009. | RESOLVED |
| FC-002 | The feature map shows *Kirim link galeri* from `SHOOTING`; intent D-2 says "once a folder is linked". | feature map › Project menu, intent D-2 | `BOOKED` to `COMPLETED`, with a linked folder and an open gallery (Owner 2026-10-18). Recorded in BR-GAL-010; the feature map row is updated. | RESOLVED |
| FC-003 | A gallery is open to anyone with the token and password from booking, before the Owner chose to publish. | C-104, BR-ACC-001, ADR-004 | Access still needs the token and the current password; the password reaches the client only through the Owner's share action (BR-MSG-003, C-106). Accepted in the intent (D-1) and ADR-028 Consequences. | RESOLVED |
| FC-004 | BR-GAL-002 let the Owner keep, regenerate or replace the proposed password at creation; there is no creation dialog now. | BR-GAL-002, BR-GAL-003 | Shutrly generates it; the Owner replaces it through rotation. BR-GAL-002 amended. | RESOLVED |
| FC-005 | ADR-019 point 5 bumps `contentVersion` on publish and archive, point 6 cleans up "archived" galleries. | ADR-019 | Amended by ADR-028 point 5. | RESOLVED |
| FC-007 | Removing *Publikasikan hasil akhir* changes BR-DEL-002/003 and BR-PRJ-004, beyond the intent's out-of-scope line on final delivery. | intent › Out of scope, BR-DEL-002, BR-DEL-003 | Owner widened the scope in design review (intent D-9, D-10); rules and intent updated first. | RESOLVED |
| FC-006 | F-09 and F-10 specs and acceptance criteria still describe publish, archive, delete draft, A-17 and A-23. | F-09 spec/AC, F-10 spec/AC | Higher authority (BR, ADR-028) now wins; this spec supersedes those parts, and the technical design lists each superseded AC so the build updates or removes its tests. | RESOLVED |

## Open Questions / SPEC GAPS
None open. A-1 and A-3 answer the intent's two open questions as assumptions; the Owner can change them in design.
