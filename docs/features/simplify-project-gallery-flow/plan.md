# Plan — Simplify project and gallery creation (F-27)

Status: IN PROGRESS (2026-10-18; self-review applied 2026-10-18, Owner accepted A–C; iteration 1 built) · Design: [technical-design.md](technical-design.md) · Spec: [spec.md](spec.md) · Criteria: [acceptance-criteria.md](acceptance-criteria.md) · Exports: [exports/INDEX.md](exports/INDEX.md) · ADR: [ADR-028](../../architecture/decisions/ADR-028-gallery-without-stored-status.md)

**Goal:**
- a booked project already has its gallery;
- the gallery has no status, and there is no publish (gallery or final delivery), archive or delete;
- *Tandai terkirim* is a project step;
- the Owner shares the link from a share dialog (modal / bottom sheet) built on the `GALLERY_SHARE` template.

Nine iterations, test-first, one commit per task (`feat(<scope>): …` / `refactor(…)` / `test(…)` / `docs(…)`, lowercase, English, Co-Authored-By trailer). Branch `feat/simplify-project-gallery-flow`.

**Global rules for every iteration**
- Related tests only: `npx vitest run <paths>`; integration `npx vitest run --config vitest.integration.config.ts <file>`; one E2E spec. Never the full suite.
- Lint each changed file as you go: `npx prettier --write <file>`, then `NODE_OPTIONS=--max-old-space-size=6144 npx eslint --fix <file>`. Then `pnpm typecheck`.
- Functions ≤ 50 lines, cognitive complexity ≤ 15, no inline JSX arrow handlers, JSDoc on exported and domain functions, types in `*.types.ts`.
- Never type `head` (use `sed -n`). Never `pkill` a dev server.
- UI text only from `*.copy.ts` and approved `copy-deck.md` rows; new strings drafted with Codex and approved by the Owner before the UI iteration commits. Never `vi.mock("next-intl")` with a factory importing the copy registry.
- Read exports one file at a time, only the states and devices the iteration names. The fidelity pass may change only class names and nesting.
- Migrations: `pnpm db:migrate` only for a migration you generated, reviewed and committed, against `.dev.vars` (shutrly-v0 `main`); report each run. Migration 0023 waits for the Owner (iteration 9).
- Never log a password, a client link or a `wa.me` URL. Don't push, deploy or open a PR without asking the Owner.
- When an iteration deletes a file, delete its test and any story with it; when it changes a behaviour an F-09/F-10 test asserts, update that test in the same commit and name the superseded AC in the commit body.

---

## Iteration 1 — Domain: gallery state, visibility, expiry, deep link, menu input

**Read first:**
- Criteria: AC-GFL-008, 010, 011, 012, 014, 016, 019, 022 · A-1, A-2, A-11.
- Rules: BR-GAL-005, BR-GAL-010, BR-ACC-001, BR-DEL-002, BR-DEL-003, BR-MSG-001, BR-CLI-002.
- technical-design › D-1, D-2, D-6, D-8, D-10, D-11.
- coding-rules › Pure domain + orchestration, Functions and comments, Where types and schemas live, Testing, Quality Gate, Easy to break.
- Code to follow: `src/features/gallery/domain/gallery-status/`, `client-gallery-availability/`, `client-photo-visibility/`, `final-delivery/`, `gallery-expiry/`; `src/features/booking/domain/project-menu/`.
- Callers updated in this iteration (signature only, so typecheck stays green): `resolve-client-access`, `serve-client-photo`, `serve-client-file`, `browse-client-photos`, `publish-final-delivery`, `set-gallery-expiry`, `create-gallery`.

- [x] **1.1** Test first, `gallery-state.test.ts`, then `features/gallery/domain/gallery-state/gallery-state{,.types}.ts`: `galleryState(projectStatus, expiresAt, now)` → `OPEN | EXPIRED | CLOSED` (CLOSED wins over EXPIRED); `isWritable(state)`; `canShareGallery({ projectStatus, state, activeSourceCount })` (BR-GAL-010: `BOOKED`…`COMPLETED`, OPEN, ≥ 1 source). Additive: nothing else changes yet.
- [x] **1.2** `client-gallery-availability`: input `{ projectStatus, expiresAt, now }`, true only for OPEN; `resolve-client-access` stops passing the stored status. Tests (AC-GFL-008, 012, 016).
- [x] **1.3** `client-photo-visibility`: drop `finalDeliveryPublished` from `isInFinalDelivery`, `isServableToClient`, `clientBrowseKind`; update the three callers; tests for a synced `EDITED` file visible without delivery (AC-GFL-019).
- [x] **1.4** `final-delivery`: `galleryDeliveryReasons` returns only `NO_FINISHED_FILE`; `publish-final-delivery` stops passing the status. `deliveryCardState` stays until iteration 5 (it drives the card UI).
- [x] **1.5** `gallery-expiry`: `GALLERY_EXPIRY_PRESETS = [7, 14, 30, 60, 90]`; `resolveExpiry(input, now)` without status: `DAYS` → `now + days`, a `DATE` of today → `now` (A-2), a later date → end of that day; return shape unchanged (`expiryDays: null`) until iteration 2. `create-gallery` and `set-gallery-expiry` drop the status argument. `expiryOnPublish` stays until iteration 3 deletes publish (AC-GFL-010, 011, 012).
- [x] **1.6** `features/communications/domain/whatsapp-link/`: `whatsappLink(number | null, text)` → `https://wa.me/<number>?text=<encoded>` or null (AC-GFL-022: `6281234567890`, newlines and `&` encoded).
- [x] **1.7** `project-menu`: input `canShareGallery` (default false at every caller for now) → item `SHARE_GALLERY` in *Kirim ke klien*; `CHAT_WHATSAPP` stays when no template item applies. Callers that build list and dashboard rows always pass false (A-11). `MARK_DELIVERED` is **not** added here (iteration 4).
- [x] Commits: `feat(gallery): derive gallery state from project status and expiry`, `feat(gallery): open galleries without publish and show finished files once synced`, `feat(gallery): expiry presets and close today at once`, `feat(communications): whatsapp deep link`, `feat(projects): share gallery menu item`.

**Done when** the domain tests and the touched callers' tests pass, `pnpm typecheck` and lint are clean, and there is no I/O in `domain/`.

## Iteration 2 — Migration 0022 and adapters

**Read first:**
- Criteria: AC-GFL-005, 006 · A-5.
- technical-design › D-12, *Database changes*, R-2.
- coding-rules › Data Access; `AGENTS.md` › Hard stops (migrations).
- Code to follow: `src/adapters/db/schema/gallery/gallery.ts`, `src/adapters/db/gallery-repository/` (`gallery-rows.ts`, `gallery-lock-sql.ts`, `gallery-lifecycle-sql.ts`, `gallery-read-sql.ts`, `drizzle-client-access-repository.ts`, `drizzle-gallery-source-repository.ts`, `drizzle-gallery-repository.ts`), `drizzle/0021_default_item_keys.sql`.

- [x] **2.1** Schema: `status` nullable without default; remove checks `gallery_status_ck`, `gallery_expiry_days_draft_ck`, `gallery_published_ck`, `gallery_expiry_one_ck`. Keep `published_*`, `archived_*`, `expiry_days` columns in the schema file for now but stop reading and writing them. `pnpm db:generate --name gallery_without_status` → `drizzle/0022_gallery_without_status.sql`; review it (no drops); commit; run `pnpm db:migrate`; report.
- [x] **2.2** Rows and lock SQL return `{ expiresAt, projectStatus }`; ports drop `status`, `expiryDays`, `publishedAt`; `GalleryCreateWriter.insert` without status; delete writer methods `publish`, `archive`, `deleteDraft`; `setExpiry(expiresAt, actor, now)`.
- [x] **2.3** Client access repository: record drops `galleryStatus`; availability from `galleryState`.
- [x] **2.4** Integration test `tests/integration/gallery/gallery-without-status.test.ts`: insert a gallery without status; client access on it is available; a `CANCELLED` project's gallery isn't (AC-GFL-008, 016).
- [x] **2.5** Writers stop bumping `content_version` for publish and archive (removed); sync, expiry, rotation and source removal still bump it (D-15).
- [ ] Commits: `feat(db): drop gallery status constraints`, `refactor(gallery): read gallery state instead of status in adapters`.

**Done when** the migration is applied and reported, the integration file passes, and adapters typecheck.

## Iteration 3 — Gallery use cases on the derived state

**Read first:**
- Criteria: AC-GFL-001, 006, 010–016, 019 · BR-GAL-001, 002, 004, 005, 009, BR-SEL-001, BR-DEL-002.
- technical-design › D-1, D-4, D-5, D-6, D-8, *Domain / application logic*.
- Code to follow: `create-gallery/create-gallery.ts` (encrypt and hash before the transaction), `publish-gallery/publish-gallery.ts` (`createSelectionGroups`), `gallery-lock/`, `delete-gallery-source/`.

- [x] **3.1** Test first, then `create-gallery-for-booking`: deps `{ galleries, cipher, hasher, passwords, newId }`; inputs `context, actorId, projectId, prepared` where `prepared = await prepareGalleryPassword(deps, context)` returns `{ galleryId, password, passwordHash }` (runs before the transaction); inside: insert with no expiry and no source, then `createSelectionGroups()`; `ALREADY_EXISTS` → no-op success (idempotent for the backfill).
- [x] **3.2** Switch every reader in the technical-design list to `galleryState` / `isWritable`; `delete-gallery-source` drops the last-source refusal (AC-GFL-015); `set-gallery-expiry` uses the presets schema (AC-GFL-010, 011); serve/browse use cases drop the delivery flag (AC-GFL-019).
- [x] **3.3** Delete `publish-gallery`, `archive-gallery`, `archive-gallery-of-cancelled-project`, `delete-draft-gallery`, `create-gallery`, their schemas and results, `expiryOnPublish`, and `domain/gallery-status/` (rewrite `gallery-header-actions` on `GalleryState`); keep `propose-gallery-password` (the rotate dialog's *Buat ulang* uses it); `publish-final-delivery` → `record-final-delivery` (no status check).
- [x] Commits: `531df551` feat(gallery): create the gallery and its selection groups for a booked project; `d2632656` refactor(gallery): use cases on the derived state and remove publish, archive and draft deletion (3.2 and 3.3 in one commit, see the record).

**Done when** gallery use-case tests pass and `src/features/gallery` typechecks.

## Iteration 4 — Composition: booking creates the gallery; cancel; mark delivered

**Read first:**
- Criteria: AC-GFL-001, 002, 003, 005, 016, 017 · BR-PRJ-004, BR-PRJ-010, BR-DEL-003 · FC-003.
- technical-design › D-3, D-4, D-7, *Concurrency / consistency*.
- ADR-016; coding-rules › Errors and Logging.
- Code to follow: `src/composition/booking/project-flow/project-flow.ts`, `project-cancellation-scope/`, `src/composition/gallery/final-delivery-scope/final-delivery-scope.ts`, `delivery-flow/`.

- [x] **4.1** `composition/booking/booking-gallery-scope/`: one transaction over project and gallery repositories; `createProjectWithGallery` (gallery only when `mode === "BOOKED"`) and `confirmBookingWithGallery`; password prepared before `db.transaction`. Unit test with fakes: a gallery failure rolls back the project (AC-GFL-003).
- [x] **4.2** `createProjectEntry` and `advanceProjectEntry` (`CONFIRM_BOOKING`) use it; `cancelProjectEntry` stops calling the archive use case and uses the plain project scope (delete `project-cancellation-scope` if unused).
- [x] **4.3** `final-delivery-scope` → `mark-delivered-scope` (`markDeliveredWithProject`, `runMarkDeliveredTransaction`). Add `ProjectStep` `MARK_DELIVERED` in the same commit as its routing: `advanceProject` refuses it (never `moveStatus`), `advanceProjectEntry` sends it to the transaction; `nextStep(POST_PROCESSING) = MARK_DELIVERED`; the project menu adds a `MARK_DELIVERED` item on `BOOKED` and `SHOOTING` (A-6). Domain tests for the placement; `publishFinalDeliveryEntry` removed.
- [x] **4.4** Integration `tests/integration/booking/booking-creates-gallery.test.ts`: create as `BOOKED` → one gallery + one `OPEN` group; confirm draft → same; cancel → client access unavailable; mark delivered with an `EDITED` photo → `DELIVERED` (AC-GFL-001, 002, 016, 017).
- [x] Commits: `257b35a9` feat(projects): booking creates the gallery in the same transaction; `86115243` feat(projects): mark delivered as a project step.

**Done when** the integration file passes and `pnpm typecheck` is clean except the UI (iteration 5).

## Iteration 5 — Owner UI: gallery page, card, expiry, delivery, project step

**Read first:**
- Criteria: AC-GFL-004, 006, 007, 010–017, 020 · A-3, A-6.
- technical-design › *UI components*, D-8, D-11.
- coding-rules › UI / Components, Copy, UI States.
- Exports (desktop and mobile each): `galeri-belum-ada-folder`, `galeri-ada-foto`, `galeri-kedaluwarsa`, `galeri-ditutup`, `dialog-kedaluwarsa-durasi`, `dialog-kedaluwarsa-tanggal-lewat`, `dialog-lepas-folder-terakhir`, `proyek-pascaproduksi`, `proyek-terkirim`; `kartu-galeri-board` (desktop).
- Code to follow: `src/features/gallery/ui/gallery-page-screen/`, `gallery-actions/`, `gallery-state-alert/`, `gallery-card/`, `access-card/`, `delivery-card/`, `expiry-dialog/`, `expiry-fields/`, `delete-source-dialog/`, `complete-project-button/`.

- [x] **5.1** Copy: draft new/changed strings (card states P1–P7, *Ditutup*, Alerts, expiry presets and helper, last-folder dialog, *Tandai terkirim* and its confirm/hint, *Kirim link ke klien*) with Codex; Owner approves; update `copy-deck.md` and the `*.copy.ts` files.
- [x] **5.2** Gallery page and card states without status; *Kirim link ke klien* placeholders wired to the dialog from iteration 6 (render hidden until then).
- [x] **5.3** Expiry Select of presets with the resulting date; date error (AC-GFL-010, 011).
- [x] **5.4** *Hasil akhir* card without publish (`deliveryCardState` drops `GALLERY_INACTIVE` and `PUBLISHED` → `DELIVERED`); *Tandai terkirim* header step on `POST_PROCESSING` and menu item on `BOOKED`/`SHOOTING`, with confirm and disabled hint (AC-GFL-017).
- [x] **5.5** Delete `create-gallery-dialog`, `create-gallery-folder-fields`, `use-create-gallery-*`, `publish-refused-dialog`, the publish/archive/delete parts of `gallery-lifecycle`, `use-lifecycle-runner` parts, and their tests.
- [ ] **5.6** Fidelity pass against the exports above, one file at a time.
- [x] Commit: one feature commit for the group plus a docs commit (see the iteration 5 record for why the group is one commit).

**Done when** component tests for the states pass, typecheck and lint are clean, and the pages match the exports.

## Iteration 6 — Share dialog

**Read first:**
- Criteria: AC-GFL-013, 014, 020–025 · BR-GAL-010, BR-MSG-001, 003, 004, 006, BR-CLI-002, BR-L10N-006 · A-7, A-8, A-9, A-10 · FC-008, FC-009.
- technical-design › D-9, D-10, D-11, *Security*.
- ADR-006, ADR-017.
- Exports: `kirim-link-preview` desktop + mobile, `kirim-link-tanpa-nomor` desktop + mobile.
- Code to follow: `src/features/communications/application/use-cases/render-template-for-recipient/`, `get-message-template/`, `src/features/communications/ui/message-preview/`, `src/composition/gallery/access-card-flow/` (client link reader, app URL), `src/features/gallery/application/use-cases/gallery-views/` (decrypt), `src/features/booking/ui/client-dialog/` (A-8), gallery dialogs (`gallery-dialog-shell`).

- [ ] **6.1** Test first, then `composition/gallery/gallery-share-flow/`: `loadGalleryShareEntry` returns recipient, rendered text and `waUrl` or `NOT_SHAREABLE`; no logging of text or URL (AC-GFL-021, 022, 025).
- [ ] **6.2** `features/gallery/ui/gallery-share-dialog/` (no booking import; *Tambah nomor WhatsApp* calls an `onAddNumber` prop, A-8): Modal on desktop, Bottom Sheet on phones; loading, error, K1, K2; *Salin pesan* (clipboard + toast), *Buka WhatsApp* (`<a target="_blank" rel="noopener noreferrer">`), *Ubah template* link to the F-03 editor, an app-level host renders the F-06 client dialog for `onAddNumber` and reloads the share data on save (AC-GFL-023, 024).
- [ ] **6.3** Entry points: gallery card, gallery page header / action bar, project detail menu `SHARE_GALLERY`; the project page composition computes `canShareGallery` from the gallery card data and passes it to the menu host; list and dashboard rows pass false (AC-GFL-013, 014, 020, A-11).
- [ ] **6.4** Fidelity pass against the four exports.
- [ ] Commits: `feat(gallery): load the gallery share message`, `feat(gallery): share dialog`, `feat(projects): share gallery from the menu and cards`.

**Done when** the loader and dialog tests pass and the dialog matches K1/K2 on both devices.

## Iteration 7 — Client: empty state and finished files

**Read first:**
- Criteria: AC-GFL-008, 009, 019 · BR-ACC-001, BR-DEL-002.
- Exports: `klien-beranda-tanpa-foto`, `klien-semua-foto-tanpa-foto` (desktop and mobile).
- Code to follow: `src/features/gallery/ui/client-home-screen/`, `client-browse-screen/`, `delivery-screen/`, `src/composition/gallery/client-gallery-flow/`.

- [ ] **7.1** Client home with no visible photo: empty copy in *Semua foto*, *Mulai memilih* disabled (AC-GFL-009).
- [ ] **7.2** *Hasil akhir* for the client lists synced finished files without a delivery date (AC-GFL-019).
- [ ] Commit `feat(gallery): client gallery before photos and finished files once synced`.

**Done when** client component tests pass.

## Iteration 8 — Seed and backfill

**Read first:**
- Criteria: AC-GFL-005, 018 · technical-design › D-13, D-14, R-3, R-4.
- Code to follow: `scripts/dev/seed.ts`, `seed-gallery.ts`, `seed-projects.ts`, `seed-staging.sh`.

- [x] **8.1** Confirm R-4: trace the `next/headers` import in the seed path; fix by importing only scope-free modules.
- [x] **8.2** Seed books projects (gallery from iteration 4), links the Drive fixture, maps folders, no publish; delivered fixture uses `runMarkDeliveredTransaction`.
- [x] **8.3** `scripts/dev/backfill-galleries.ts` + `pnpm db:backfill-galleries` (own `db`, no `request-db` import, D-13); integration test `tests/integration/gallery/backfill-galleries.test.ts`: a `SHOOTING` project without a gallery gets one with its groups, and a second run creates nothing (AC-GFL-005); run against `.dev.vars`; report counts.
- [x] **8.4** `scripts/dev/seed-staging.sh <new email>` exits 0 and writes the credentials file (AC-GFL-018).
- [x] Commits: `fix(seed): run without a request scope`, `feat(seed): booked projects get galleries`, `feat(db): backfill galleries for booked projects`.

**Done when** the seed and the backfill run clean on shutrly-v0 `main` and are reported.

## Iteration 9 — E2E, docs and migration 0023

**Read first:**
- Criteria: all AC-GFL; technical-design › *Testing strategy*, D-12.
- Code to follow: `tests/e2e/` existing gallery and client-access specs.

- [ ] **9.1** `tests/e2e/simplify-project-gallery-flow/flow.spec.ts`: book → gallery exists → link fixture → share dialog shows message → client signs in with the password (AC-GFL-001, 008, 013, 021).
- [ ] **9.2** Update superseded docs: F-09 and F-10 specs/AC get a header note pointing at F-27 and ADR-028 for publish, archive, delete draft, A-17, A-23; feature map F-27 → BUILT.
- [ ] **9.3** **Owner gate:** after the F-27 code is on staging, generate `0023_drop_gallery_status.sql` (drop `status`, `published_at`, `published_by`, `archived_at`, `archived_by`, `expiry_days`), review, commit, migrate, report.
- [ ] Commits: `test(e2e): book, share and open a gallery`, `docs(gallery): point superseded rules at f-27`, `feat(db): drop gallery status columns`.

**Done when** the E2E spec passes, typecheck and lint are clean, and the Owner has approved 0023.
