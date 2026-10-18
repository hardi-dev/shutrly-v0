# Technical Design — Simplify project and gallery creation (F-27)

Status: IN PROGRESS (2026-10-18; self-review applied, Owner accepted the recommendations A–C; iteration 1 built) · Spec: [spec.md](spec.md) · Criteria: [acceptance-criteria.md](acceptance-criteria.md) · Design: [design.md](design.md), [exports/INDEX.md](exports/INDEX.md) · Plan: [plan.md](plan.md) · ADR: [ADR-028](../../architecture/decisions/ADR-028-gallery-without-stored-status.md)

## Context
F-27 removes the gallery's own lifecycle and the two publish steps, creates the gallery when a project is booked, and adds the share dialog. Almost every change is to existing F-07, F-09 and F-10 code; the share dialog is the only new surface. No real users exist, so stored data needs no compatibility, but the deployed `staging` code shares the database (ADR-027), so columns are dropped only after the code stops reading them.

## Relevant authority
- Constitution: C-003 (rules in domain + DB), C-004 (server authority), C-005 (one transaction for booking + gallery), C-101 (workspace scoping), C-103 (password never logged, not cached), C-104, C-106.
- Rules: BR-GAL-001, 002, 003, 004, 005, 006, 009, 010; BR-ACC-001; BR-SEL-001; BR-PRJ-004, 010; BR-DEL-002, 003; BR-MSG-001, 003, 004, 006; BR-CLI-002; BR-L10N-006 (exception).
- ADRs: ADR-004, ADR-006, ADR-016 (cross-feature writes in composition), ADR-017 (encrypted password), ADR-019 (amended by ADR-028), ADR-027 (shared database), ADR-028.
- Flagged concerns: FC-001…FC-009, all RESOLVED; this design follows their decisions.

## Decisions
- **D-1 Gallery state is derived.** A new pure function `galleryState(projectStatus, expiresAt, now)` in `features/gallery/domain/gallery-state/` returns `OPEN | EXPIRED | CLOSED` (CLOSED for a `CANCELLED` project, EXPIRED when `expiresAt <= now`, else OPEN). It replaces `effectiveGalleryStatus`, `canPublish`, `canArchive`, `canDeleteDraft` and the `GalleryStoredStatus` type. `canSync`, `canEditSources`, `canSetExpiry`, `canRotatePassword` become `isWritable(state) = state !== "CLOSED"`.
- **D-2 Client availability** (`isAvailableToClient`) becomes `galleryState(...) === "OPEN"`. The repository record drops `galleryStatus`.
- **D-3 Booking creates the gallery** in one transaction (C-005, ADR-016): a new composition scope `composition/booking/booking-gallery-scope/` runs `createProject` (for `mode: BOOKED`) or `advanceProject` (`CONFIRM_BOOKING`) and then the gallery use case `createGalleryForBooking` on transaction-bound repositories. Any failure rolls both back (AC-GFL-003). Other steps (`START_SHOOTING`, `FINISH_SHOOTING`) keep the plain project scope.
- **D-4 Password before the transaction.** As `create-gallery` does today, `createGalleryForBooking` gets a pre-generated gallery id, a generated password (`propose-gallery-password`), its ciphertext (`cipher.encrypt` with `{ workspaceId, galleryId }`) and its hash, all computed before the transaction opens, because scrypt is slow and must not hold the project lock. The AAD needs only the workspace and gallery ids, so the project id can come from the insert inside the transaction.
- **D-5 Selection groups at creation.** `createGalleryForBooking` calls the existing writer `createSelectionGroups()` (today called by `publishGallery`). `sync-group-with-item` already keeps groups in step with item edits while the deal is editable.
- **D-6 Finished files are visible once synced.** `isInFinalDelivery`, `isServableToClient` and `clientBrowseKind` lose the `finalDeliveryPublished` argument (BR-DEL-002).
- **D-7 *Tandai terkirim*** replaces *Publikasikan hasil akhir*. The existing transaction `publishFinalDeliveryWithProject` is renamed `markDeliveredWithProject`: booking moves the project to `DELIVERED`, gallery records `final_delivery_published_at`/`by` (kept, F-26 reads it). `galleryDeliveryReasons` drops `GALLERY_NOT_PUBLISHED`. A new `ProjectStep` `MARK_DELIVERED` (`BOOKED | SHOOTING | POST_PROCESSING → DELIVERED`) is added **in the same iteration as its routing** (iteration 4): `advanceProject` must never move it with `moveStatus`, because that would skip the finished-file check (BR-DEL-003). Placement (A-6): `nextStep(POST_PROCESSING) = MARK_DELIVERED` (header); on `BOOKED` and `SHOOTING` the project menu adds a `MARK_DELIVERED` item next to the header step.
- **D-8 Expiry** keeps `resolveExpiry` without the `DRAFT` branch: a duration is `now + days`; the days must be one of `GALLERY_EXPIRY_PRESETS = [7, 14, 30, 60, 90]` (A-1); a date must be today or later in Asia/Jakarta (existing `PAST_DATE`). **Today means now** (A-2): `expiresAt = now`, so the gallery closes at once; a later date stores the end of that day (`endOfGalleryDay`). `expiryOnPublish` and `expiry_days` go away.
- **D-9 Share dialog.** A server action `loadGalleryShareEntry(workspaceId, projectId)` in `composition/gallery/gallery-share-flow/` verifies the workspace, checks BR-GAL-010 (`galleryState === OPEN` and an active source), loads the client (name, WhatsApp), the workspace brand, the `GALLERY_SHARE` template (communications use case), decrypts the password, builds the client link (the reader the *Akses klien* card uses), renders with `renderTemplateForRecipient` in the request locale (BR-L10N-006 exception, FC-009), and returns `{ ok: true, recipient, text, waUrl | null }` or `{ ok: false, code: "NOT_SHAREABLE" }`. The dialog calls it on open; nothing is cached or logged (A-10, BR-MSG-004).
- **D-10 Deep link.** A pure function `whatsappLink(number, text)` in `features/communications/domain/whatsapp-link/` returns `https://wa.me/<digits>?text=<encodeURIComponent(text)>`; null without a number. Numbers are already normalised (BR-CLI-002).
- **D-11 Share entry points.** One client component `gallery-share-dialog` (modal on desktop via the Modal primitive, bottom sheet on phones via Bottom Sheet, as the gallery dialogs do) opened from: the project *Galeri* card, the gallery page header (desktop) / action bar (phone), and the project **detail** ⋯ menu item *Kirim link galeri* (A-11: not the list or dashboard row menus). `get-project-detail` is a booking use case and can't read gallery data (feature boundary), so the composition that loads the project page (`project-flow` + `gallery-flow`) computes `canShareGallery` from the gallery card data and passes it to the menu host as a prop; `buildProjectMenu` takes it as input. The F-06 client dialog for *Tambah nomor WhatsApp* (A-8) is rendered by an app-level host next to the share dialog, which exposes an `onAddNumber` callback; nothing in `features/gallery/ui` imports booking UI.
- **D-12 Migrations in two releases** (ADR-028 point 4, A-5): `0022_gallery_without_status.sql` drops the status/draft checks (`gallery_status_ck`, `gallery_expiry_days_draft_ck`, `gallery_published_ck`) and makes `status` nullable with no default, so new code can insert without it while deployed code still reads it; `0023_drop_gallery_status.sql` (iteration 9, after the code is deployed) drops `status`, `published_at`, `published_by`, `archived_at`, `archived_by`, `expiry_days`. The backfill of galleries for booked projects (D-13) is a script.
- **D-13 Backfill** `scripts/dev/backfill-galleries.ts`: for each `BOOKED`-or-later project without a gallery, create one through `createGalleryForBooking` (needs `GALLERY_PASSWORD_KEY`); idempotent (the one-gallery-per-project unique index refuses a second). Like the seed (D-14) it builds its repositories from its own `db` and imports no module that reaches `request-db` / `next/headers`.
- **D-15 `content_version`** (ADR-019 point 5 as amended by ADR-028): the writers stop bumping it on publish and archive (both removed); sync, expiry change, password rotation and source removal still bump it.
- **D-14 Seed** drops `publishGallery` / `publishDeliveryIfFinished`, books projects so galleries come from D-3, and stops importing request-scoped composition: `seed-gallery.ts` imports `runFinalDeliveryTransaction` from `final-delivery-scope`, whose module graph reaches `request-db` and `next/headers` ("`headers` was called outside a request scope"). The seed calls the scope-free transaction function with its own `db`, from a module with no `request-db` import.

## Database changes
| Migration | Change | Safe for deployed `staging`? |
|---|---|---|
| `0022_gallery_without_status` | drop checks `gallery_status_ck`, `gallery_expiry_days_draft_ck`, `gallery_published_ck`, `gallery_expiry_one_ck`; `status` nullable, default dropped | yes: old code still reads and writes `status`; new rows have `status` null, which old code treats as unknown and maps to not available (`toGalleryStatus` returns null). Acceptable on staging with no users. |
| `0023_drop_gallery_status` (iteration 9) | drop `status`, `published_at`, `published_by`, `archived_at`, `archived_by`, `expiry_days` | only after the F-27 code is deployed to staging |

No new tables. `final_delivery_published_at`/`by` stay (D-7).

## Server / API interface
- `createProjectEntry` and `advanceProjectEntry` (`CONFIRM_BOOKING`, `MARK_DELIVERED`) route through the booking-gallery scope (D-3, D-7).
- Removed server actions: `createGalleryEntry`, `proposeGalleryPasswordEntry` (kept only if rotation uses it), `publishGalleryEntry`, `archiveGalleryEntry`, `deleteDraftGalleryEntry`, `publishFinalDeliveryEntry`.
- New: `loadGalleryShareEntry(workspaceId, projectId)` (D-9).
- `setGalleryExpiryEntry` keeps its shape; the schema restricts `days` to the presets.

## Domain / application logic
- `gallery-state` (new), `gallery-status` (deleted; `gallery-header-actions` rewritten on `GalleryState`), `client-gallery-availability`, `client-photo-visibility`, `final-delivery`, `gallery-expiry` as in D-1, D-2, D-6, D-7, D-8.
- Use cases removed: `publish-gallery`, `archive-gallery`, `archive-gallery-of-cancelled-project`, `delete-draft-gallery`, `create-gallery` (replaced by `create-gallery-for-booking`, no input schema). Cancelling a project no longer touches the gallery.
- Use cases changed to `galleryState`: `delete-gallery-source` (no last-source refusal, BR-GAL-009), `link-gallery-source`, `rename-gallery-source`, `rotate-gallery-password`, `set-gallery-expiry`, `sync-gallery-source-step`, `folder-mapping`, `resolve-client-access`, `serve-client-photo`, `serve-client-file`, `browse-client-photos`, `get-gallery-card`, `get-delivery-card`, `gallery-views`.
- Booking: `project-status` (`MARK_DELIVERED`), `project-menu` (`SHARE_GALLERY`), `mark-project-delivered` (unchanged rule).
- Communications: `whatsapp-link` (new, pure).

## UI components
| Component | Change | Design |
|---|---|---|
| `gallery-card` (project page) | states P1–P7; *Kirim link ke klien* after *Kelola galeri* (desktop), below content (phone); no status row | `kartu-galeri-board`, `proyek-terkirim`, `proyek-pascaproduksi` |
| `gallery-page-screen`, `gallery-actions`, `gallery-state-alert`, `access-card` | no status chip / publish / archive / delete; *Kirim link ke klien* in the header (desktop) or action bar (phone); Alerts for EXPIRED and CLOSED | `galeri-*` |
| `delivery-card` | no *Publikasikan hasil akhir*; copy "clients can download once synced" | `galeri-ada-foto` |
| project header step | *Tandai terkirim* (confirm dialog, disabled with hint without a finished file) | `proyek-pascaproduksi` |
| `expiry-dialog`, `expiry-fields` | duration becomes a Select of presets; helper shows the resulting date; date error | `dialog-kedaluwarsa-*` |
| `delete-source-dialog` | last-folder copy | `dialog-lepas-folder-terakhir` |
| client `client-home-screen`, `client-browse-screen` | empty state before photos | `klien-*` |
| `gallery-share-dialog` (new) | K1, K2, refused state | `kirim-link-*` |
| removed | `create-gallery-dialog`, `create-gallery-folder-fields`, `use-create-gallery-*`, `publish-refused-dialog`, `gallery-lifecycle` publish/archive/delete parts, `complete-project-button` publish part | — |

Copy: new and changed strings go through `*.copy.ts` and `docs/product/copy-deck.md` (drafted with Codex, Owner approves; memory *Copy via Codex CLI*).

## Validation
- Expiry: `{ type: "NONE" } | { type: "DATE", date } | { type: "DAYS", days ∈ presets }` (zod enum of literals); past date → `PAST_DATE`.
- Share: workspace and project ids validated as today; no other input.
- Booking: unchanged F-07 schemas.

## Error handling
- Booking + gallery: any thrown error rolls back; `saveError` maps to `SAVE_FAILED` as today, logged without secrets.
- Share: `NOT_SHAREABLE` → dialog error state; `NOT_FOUND` → not found; decrypt failure → logged `gallery.share_failed` with workspace and project ids only, dialog shows the generic error.
- *Tandai terkirim*: refusal reasons `NO_FINISHED_FILE`, `PROJECT_STATUS` as today.

## Concurrency / consistency
- Booking creates the gallery under the project row lock in the same transaction; the one-gallery-per-project unique index keeps double submits safe.
- Writes that need `galleryState` read it under `withGalleryLock`, as today.
- Mark delivered keeps the project-then-gallery lock order (D-17 of F-10).

## Security
- Password decrypted only server-side in the share action and returned only to the verified Owner; never logged (BR-MSG-003/004, C-103); the `wa.me` URL is built on the server and not logged.
- Client access still needs token + current password; availability now also means a gallery may be opened from booking (FC-003).
- Share action re-checks BR-GAL-010 on the server; the client-side button visibility is not trusted (C-004).

## Testing strategy
| Layer | Tests | AC |
|---|---|---|
| Domain unit | `gallery-state`, availability, visibility, final-delivery reasons, expiry presets and today-is-now, `whatsapp-link`, project menu `SHARE_GALLERY` (detail only) and `MARK_DELIVERED` placement | 006, 008, 010–012, 014, 016, 017, 019, 022 |
| Use case unit (ports mocked) | `create-gallery-for-booking`, booking-gallery scope rollback, delete last source, share loader (refused, no number, renders) | 001–003, 013, 015, 021, 024, 025 |
| Integration (`vitest.integration.config.ts`, one file each) | booking creates gallery + groups; cancel closes gallery; mark delivered; client access on a gallery without status; migration 0022 applied; backfill creates missing galleries once | 001, 002, 005, 016, 017 |
| Component | gallery card states, page header CTA, expiry select, share dialog (modal/sheet, copy, disabled WhatsApp), client empty state | 004, 007, 009, 010, 020, 021, 023, 024 |
| E2E (one spec `tests/e2e/simplify-project-gallery-flow/flow.spec.ts`) | book → gallery exists → link folder fixture → share dialog → client opens with password | 001, 008, 013, 021 |
| Seed | `seed-staging.sh <new email>` exits 0 | 018 |

## Risks / open questions
- **R-1 Blast radius:** ~60 files read the status. Iterations go domain → adapters → use cases → UI so typecheck finds every reader; each iteration ends green.
- **R-2 Staging window:** between migration 0022 and the F-27 deploy, staging's old code shows galleries created by new code as unavailable. Accepted (no users).
- **R-3 Backfill needs the key:** run locally with `.dev.vars` (agents may run it against the non-prod DB only, like `db:migrate`).
- **R-4 Seed root cause** is inferred from the import graph (D-14); confirm in iteration 8 before changing it.

## Implementation record — iteration 1
Built: `galleryState` / `isWritable` / `canShareGallery` (D-1); client availability from the derived state (D-2); photo visibility without the delivery flag (D-6); `galleryDeliveryReasons` with only `NO_FINISHED_FILE`; `GALLERY_EXPIRY_PRESETS`, `isExpiryPreset`, `resolveExpiry(input, now)` with today = save time (D-8); `whatsappLink` (D-10); `SHARE_GALLERY` in the project menu (D-11, input always false).
Commits: `8d79eff9` derive gallery state; `4951c7ed` open galleries without publish and show finished files; `31b39868` expiry presets; `1d92866b` whatsapp deep link; `def4bef3` share gallery menu item.
Checks: `npx vitest run src/features/gallery` 134 files pass; `npx vitest run src/features/booking` 175 files pass; `pnpm typecheck` green; eslint and prettier clean on every changed file.
Deviations:
- `isAvailableToClient` takes `projectStatus: string` and fails closed on an unknown status (lint bans the cast from the text column).
- `clientBrowseKind` deleted: after the change it only returned its input.
- `setGalleryExpiry` checks `isWritable(galleryState(...))` and `reopened` uses the derived states, not the stored status (needed for D-1).
- `SHARE_GALLERY` is filtered out in `resolve-menu-items.ts` until its copy is approved (iteration 6); the item is not in the UI yet.
- `GALLERY_NOT_PUBLISHED` stays in `FinalDeliveryReason` until the delivery dialog changes (iteration 5).
Open (not fixed here, outside the plan's callers): `browse-client-photos` totals, `get-delivery-files` and `get-client-home` still gate *Hasil akhir* on `finalDeliveryPublished`, which contradicts AC-GFL-019 for a synced file before delivery. Needs a decision in iteration 4 or 5.

## Implementation record — iteration 2
Built: migration `0022_gallery_without_status` (drops `gallery_status_ck`, `gallery_expiry_one_ck`, `gallery_expiry_days_draft_ck`, `gallery_published_ck`; `status` nullable, no default), applied once to the non-production database (success). Ports and adapters read no stored status (lock, summary, source sync, client access, delivery reader); `setExpiry(expiresAt, actor, now)`; writers `publish`, `archive` and `deleteGallery` removed; `legacyGalleryStatus(projectStatus, expiresAt, now)` bridges the remaining callers to iteration 3 (OPEN reads PUBLISHED, EXPIRED reads EXPIRED, CLOSED reads ARCHIVED).
Commits: `76063109` drop gallery status constraints; `68673c15` read gallery state instead of status in adapters.
Checks: `pnpm typecheck` green; `npx vitest run src/features/gallery/application src/features/gallery/domain` 84 files, 365 tests pass; integration `gallery-without-status`, `gallery-repository`, `gallery-lifecycle`, `gallery-cancellation`, `client-access/gate` and `client-access/final-delivery` pass; eslint and prettier clean on every changed file.
Deviations:
- publish, archive, delete-draft and archive-of-cancelled use cases stay compiling as refusals (`INVALID_STATE`; cancel archives nothing) until iteration 3 deletes them. The plan's `deleteDraft` writer is `deleteGallery`.
- `GalleryRecord` gained `projectStatus` (joined from `project`); `GallerySummaryView.expiryDays` is always null (no days stored); `resolveExpiry` returns `expiresAt` only.
- Superseded tests were updated and named in the commit body (AC-GFL-006, AC-GFL-016, D-7). `delete-gallery-source` keeps the last-folder refusal until AC-GFL-015.

## Implementation record — iteration 3
Built: `create-gallery-for-booking` (password prepared before the transaction, gallery with no expiry or source, selection groups, ALREADY_EXISTS as a no-op; not wired into booking yet) (D-3, D-4, D-5). Every reader on `galleryState` / `isWritable` (D-1, D-2); `legacyGalleryStatus` removed. `delete-gallery-source` allows the last folder (AC-GFL-015). Browse totals and client photos show synced finished files before delivery (D-6, AC-GFL-019). Removed: publish, archive, delete-draft, create-gallery and archive-of-cancelled use cases with their server actions, schemas, UI, `expiryOnPublish` and `domain/gallery-status/`. `galleryHeaderActions` on GalleryState (`domain/gallery-state/`). `publish-final-delivery` is now `record-final-delivery` with no status check.
Commits: `531df551` create the gallery for a booked project; `d2632656` use cases on the derived state and remove publish, archive and draft deletion.
Checks: `pnpm typecheck` green; `npx vitest run src/features/gallery src/composition/gallery src/adapters/db/gallery-repository` 133 files, 598 tests pass; integration, one file each: gallery-lifecycle, -repository, -cancellation, -isolation, -browse, -sync, -without-status, client-access/* pass; eslint and prettier clean on every changed file.
Deviations:
- 3.2 and 3.3 landed in one commit: removing the stored-status bridge and the status domain touched the same UI and view types as the deletions, so the tree typechecks only as a whole.
- Superseded tests updated in that commit: AC-GAL-001, AC-GAL-013, AC-GAL-024, AC-GAL-027 (create and cancel paths), AC-ACC-011, AC-ACC-013, AC-DEL-004, BR-DEL-002, D-22 (finished files before delivery, AC-GFL-019).
- `galleryHeaderActions` lives in `domain/gallery-state/gallery-header-actions.ts` (plan 3.3 said rewrite in place; same result).
- The password proposer is bound by the composition (client name), passed as `passwords.propose`.
Leftover for iteration 4: `withProjectCancellationScope` wraps only the project cancel; the booking composition does not call `createGalleryForBooking` yet; `publishFinalDeliveryEntry` and `publishFinalDeliveryWithProject` keep their names.
Leftover for iteration 5: `NoGallery` has no *Buat galeri* CTA; `AccessCardState` `DRAFT` and the `GALLERY_NOT_PUBLISHED` reason still have dead UI branches; `isDraft={false}` in the expiry dialog and `isLastLocked={false}` in the sources section; `loadGalleryCard` still lists linkable sources; `checkNewGalleryFolderAction` has no caller.
Leftover for iteration 7.2 and 8: `get-delivery-files` and `get-client-home` still gate on `finalDeliveryPublished`; `tests/e2e/gallery/gallery-create.spec.ts` and `gallery-drive-smoke.spec.ts` describe the old publish flow (only the copy keys changed); `scripts/dev/seed-gallery.ts` creates the gallery through `createGalleryForBooking`, the D-14 seed rework is still open.

## Implementation record — iteration 4
Built: `booking-gallery-flows` (`createProjectWithGallery`, `confirmBookingWithGallery`) and the DB wiring in `booking-gallery-scope` (`createBookedProject`, `confirmBookedProject`): the password is prepared before `db.transaction`, then the project and its gallery are written together (D-3, D-4, AC-GFL-001–003). Cancel uses the plain project scope; `project-cancellation-scope` is deleted (AC-GFL-016). `final-delivery-scope` is now `mark-delivered-scope` (`markDeliveredWithProject`, `runMarkDeliveredTransaction`; `publishFinalDeliveryEntry` → `markDeliveredEntry`) (D-7). `MARK_DELIVERED` is a `ProjectStep`; `nextStep(POST_PROCESSING)` returns it; the menu adds it on BOOKED and SHOOTING (A-6); `advanceProjectEntry` routes it to the transaction, `advanceProject` takes manual steps only.
Commits: `257b35a9` feat(projects): booking creates the gallery in the same transaction; `86115243` feat(projects): mark delivered as a project step.
Checks: `pnpm typecheck` green; `npx vitest run src/features/booking src/composition` 202 files, 990 tests pass; integration, one file each: `booking/booking-creates-gallery` (6), `gallery/client-access/final-delivery` (8), `client-list-cache` (3), `secrets-sweep` (2), `gallery/gallery-cancellation` (2), `booking/project-repository` (19) all pass; prettier and eslint clean on every changed file.
Deviations:
- Create reads the client name (`findFilterClient`) and confirm reads the project facts (`findProjectFacts`) before the transaction, so the password can be prepared first (D-4). A missing client is NOT_FOUND, as `createProject` already reports.
- A refused Tandai terkirim becomes a booking code: `STALE` when the status moved, `DELIVERY_REFUSED` (new `ProjectDomainCode`) without a synced finished file. The gallery reasons stay in the gallery. The spec doesn't name the booking-side code, so this is a decision to confirm.
- `MARK_DELIVERED` is hidden in the header and in the menu until its copy is approved (same pattern as `SHARE_GALLERY`).
- Superseded tests updated and named in the commit bodies: BR-PRJ-004 step list, AC-PRJ-015 (POST_PROCESSING step), the BOOKED and SHOOTING menu rows (A-6), AC-DEL-001/002 publish wording.
Leftover for iteration 5: `Publikasikan hasil akhir` copy and the delivery card still call `publishFinalDeliveryAction` (now `markDeliveredEntry`); `"Tandai terkirim"` has no copy yet (header and menu label); `DELIVERY_REFUSED` has no toast copy; the gallery writer `publishFinalDelivery` keeps its name.
Leftover for 7.2 and 8: `get-delivery-files` and `get-client-home` still gate on `finalDeliveryPublished`; AC-GFL-016 is checked through `galleryState` = CLOSED, not through client access; `scripts/dev/seed-gallery.ts` still uses `createGalleryForBooking` and the renamed transaction (D-14).
