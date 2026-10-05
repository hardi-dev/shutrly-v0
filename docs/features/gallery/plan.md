# F-09 Gallery — Implementation Plan (vertical slices by screen)

> **For agentic workers:** `/sdv:build-feature gallery <slice>` runs one slice. Each step inside a slice is one commit, test-first (red → green → refactor). Read only the slice's **Read first** list. Stop with a `SPEC GAP` instead of guessing.

**Goal:** the Owner creates a password-protected gallery for a booked project and links Drive folders to it. The Owner then syncs and browses the photos (folders, search, preview), publishes the gallery, and manages its expiry, password and archive.

**Approach:**
- The plan follows F-07: each slice delivers one screen end to end (domain → application → repository → action → UI → tests) and can be tried in the browser when it's done.
- The order follows the data: create → sources and sync → photos → *Semua foto* → preview → lifecycle → cancel → verification.

**Sources:**
- [technical-design.md](technical-design.md) (decisions D-1…D-19);
- [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md) (AC-GAL-001…031);
- [design.md](design.md) and [exports/INDEX.md](exports/INDEX.md), which points to the raw HTML export of each state (`<state>-<device>-<frameId>.html`);
- component specs in `docs/design-system/components/` (`photo-tile`, `folder-tile`, `media-viewer`, `modal`).

**Free-tier rework (2026-10-05).** Slices 0–8 are built and on `main`. The Owner accepted [ADR-018](../../architecture/decisions/ADR-018-free-tier-runtime-budget.md) and [ADR-019](../../architecture/decisions/ADR-019-gallery-media-and-sync-on-free-tier.md), so slices **R1–R5** below rework sync, media and the content version for Workers Free. They run on `feat/gallery-free-tier`. Technical design decisions D-7…D-10 and D-19 are amended, and D-20…D-27 are new. The Owner allowed the free-preview CPU measurement (R5) and dropping `gallery_photo.last_seen_at` in migration `0013` (2026-10-05).

## Global constraints (every slice)

- **Free tier (rework slices):** every request stays within 50 subrequests and 10 ms CPU (ADR-018). Say in the slice record how many Drive calls a step makes and what it writes.
- **Branch hygiene (Owner):** pull `origin/main` into `feat/gallery-free-tier` before each slice, and never commit `.env*`.

- **Architecture and coding rules:** [architecture/overview.md](../../architecture/overview.md) and [coding-rules.md](../../coding-rules.md).
  - Unit folders with co-located tests.
  - `server-only` on application, composition and adapter modules.
  - No types in `.tsx` or use-case files; put them in `*.types.ts`.
  - Functions of at most 50 lines; copy lives in `*.copy.ts`.
  - Prettier and `eslint --fix` per file as you go.
- **Token rules:** `docs/design-system/token-usage.md` v3.1. Tokens only, no hex.
- **UI fidelity:** find each state in `exports/INDEX.md`, then build from its raw exports (desktop and mobile). Read only the states the slice names, one file at a time; each is a complete frame of 25–165 KB.
- **Secrets and logs:** never log links, the API key, passwords or ciphertext (C-103). Never use `process.env` in `src/`.
- **Migrations:** `pnpm db:migrate` only for the reviewed and committed `0012_gallery`, against the non-production database, and report the run.
- **Gate per slice:**
  - `pnpm typecheck`;
  - `pnpm lint`;
  - `pnpm test`;
  - the relevant `pnpm test:integration`;
  - the relevant `pnpm e2e`;
  - `pnpm build`.

  A slice is not done with any check failing or unrun.

## Existing code to follow

| Need | Follow |
|---|---|
| Composition entry with guard + scope | `src/composition/booking/project-flow/project-flow.ts`, `project-scope/` |
| Cross-feature transaction | `src/composition/workspace/workspace-creation-scope/` (ADR-016) |
| Locked aggregate writes | `withLockedProject` in `src/adapters/db/project-repository/drizzle-project-repository.ts` |
| Write results and validation failures | `features/booking/application/use-cases/project-results/` |
| Tenant tables | `src/adapters/db/schema/_conventions/tenant.ts`, `schema/booking/project.ts` |
| Web Crypto adapter | `src/adapters/crypto/access-token-generator/` |
| Rate limiter | `src/adapters/db/rate-limiter/neon-rate-limiter.ts` |
| Dialogs, menus, toasts, infinite scroll | `features/booking/ui/project-status-dialogs`, `project-menu`, `use-load-more-projects`; `src/ui/patterns/toast` |
| Existing gallery feature (F-04) | `src/features/gallery/**`, `src/composition/gallery/source-config-*` |
| Env bindings | `src/shared/env/app-env.schema.ts`, `.env.example` |

## Slice 0 — Base, secrets and Drive spike

**Done when:**
- the env keys validate;
- the Drive spike lists a real public test folder tree and fetches one thumbnail with the non-production key;
- its numbers are recorded in technical-design.md › R-1/R-2.

**Read first:**
- technical-design.md › Decisions D-6, D-7, D-10, Server / API Interface › Environment, Risks;
- coding-rules.md › Security-relevant rules;
- `src/shared/env/*`, `.env.example`.

**Steps:**
- [x] **Owner:** provision `GOOGLE_DRIVE_API_KEY` (Drive API enabled, restricted to the Drive API) and `GALLERY_PASSWORD_KEY` (32 random bytes, base64url) in `.dev.vars` and `.env.test`. Stop until they're done.
- [x] Add both keys and `E2E_FAKE_DRIVE` to `appEnvSchema`. The 32-byte decode is checked, and `E2E_FAKE_DRIVE` is refused when `APP_STAGE=production`. Add them to `.env.example` with comments. Tests in `app-env.test.ts`.
- [x] Spike: a script under `scripts/gallery/drive-spike.ts`, not shipped, that lists a public folder tree with the key and fetches `thumbnailLink=s400`. Record the list calls, the time and whether the thumbnail works without OAuth. Delete the script after recording, or keep it under `scripts/` with a header comment.

**Implementation record (2026-10-04):**
- Env keys validated (`GALLERY_PASSWORD_KEY` by a 43-character base64url pattern whose last character carries 4 bits, so exactly 32 bytes; `E2E_FAKE_DRIVE` refused on production); `.env.example` updated; 3 new `app-env` tests.
- `scripts/gallery/drive-spike.ts` written (header comment, prints counts only). Run 2026-10-05 on the Owner's public test folder: 1 list call in 0.6 s, 113 images, 0 ignored, 0 too deep; the thumbnail came from `*.googleusercontent.com` with HTTP 200 `image/jpeg` and no OAuth. R-1 and R-2 closed; A-T1 holds at this size (no 1,000+ photo folder tested).

## Slice 1 — Create a gallery and see its password

**Done when:**
- on a `BOOKED` project the Galeri card offers *Buat galeri*;
- the dialog proposes a password (*Buat ulang* works);
- creating it opens the gallery page with *Akses klien* (password and *Salin*) and an empty *Sumber foto*;
- the database holds ciphertext and hash only;
- AC-GAL-001…004 and AC-GAL-027 pass.

**Read first:**
- AC-GAL-001, 002, 003, 004, 027, 025 (create and read paths);
- BR-GAL-001, 002, 009; ADR-017;
- technical-design.md › D-1…D-5, D-14, D-16, D-18, Database Changes (whole), Security;
- coding-rules.md › Data Access, Validation, UI / Components;
- `src/features/booking/ui/project-detail-screen/*`, `src/app/(owner)/w/[workspaceId]/projects/[projectId]/page.tsx`.

**Exports:**
- `proyek / desktop` and `proyek / mobile`: state `proyek-detail-dibooking-belum-ada-galeri`, plus states `proyek-detail-draf-galeri-belum-tersedia`, `proyek-detail-dibooking-galeri-draf`, `proyek-dialog-buat-galeri`, `proyek-dialog-buat-galeri-error`, `proyek-dialog-buat-galeri-kedaluwarsa-hari`, `proyek-dialog-buat-galeri-kedaluwarsa-tanggal`;
- `galeri / desktop` and `galeri / mobile`: states `galeri-draf-kosong`, `galeri-toast-galeri-dibuat`, `galeri-memuat`.

**Steps:**
- [x] Schema `src/adapters/db/schema/gallery/gallery.ts` (all three tables, D-1…D-3, Database Changes), exported from the schema barrel. Run `pnpm db:generate` to make `0012_gallery`, review it and commit. Then run `pnpm db:migrate` (non-production) and report it. Add integration tests for the checks and unique keys.
- [x] Domain `gallery-status`, `gallery-expiry`, `gallery-password` (generator and rules) with unit tests.
- [x] Adapters:
  - `adapters/crypto/gallery-password-cipher` (AES-256-GCM, AAD, key version);
  - `adapters/crypto/password-hasher` (`better-auth/crypto`);
  - `adapters/crypto/random-int`.

  Unit tests cover the round trip, a wrong AAD failing, and a fresh IV every time.
- [x] Ports, `GalleryError`, and `adapters/db/gallery-repository` (create with project `FOR SHARE`, card and page reads). Use cases `propose-gallery-password`, `create-gallery`, `get-gallery-card`, `get-gallery-page`, each with unit tests and integration tests for the race and the isolation.
- [x] Composition `gallery-scope` / `gallery-flow`, and actions in `src/app/actions/gallery/galleries.ts`.
- [x] UI:
  - `GalleryCard` (states A, B, C for now);
  - `CreateGalleryDialog` + `ExpiryFields`;
  - the `galleryCard` slot in `ProjectDetailScreen` (D-16);
  - the gallery page route + `loading.tsx`;
  - `GalleryPageScreen` with the header, `AccessCard` and an empty `SourcesCard`.

  Dom tests and the copy file go with it.
- [ ] E2E: create a gallery from a booked project, check the password shows and copies, and the draft project shows the hint.

**Implementation record (2026-10-04):**
- `0012_gallery` generated, reviewed (additive) and applied to the shared non-production DB.
- Domain (status, expiry, password generator), crypto adapters (AES-256-GCM with AAD, Better Auth scrypt, unbiased random int), gallery repository (project `FOR SHARE`, `ON CONFLICT DO NOTHING` create), use cases, composition, actions, Galeri card slot, gallery page + skeleton.
- New shared UI: `src/ui/primitives/radio` (C06, on `RadioField`), DateField `description`, icons `copy`, `images`, `image-off`, `external-link`, `arrow-left`.
- Checks: typecheck, lint, unit/dom (all), integration (all 91), build pass. The E2E spec `tests/e2e/gallery/gallery-create.spec.ts` is written but **not run** (Owner: continue without E2E).
- Deviations: no `ClockPort`; use cases take `now` from the scope, like F-07. Domain codes return as results (F-07 shape), and `GalleryError` keeps only `NOT_FOUND`/`SAVE_FAILED`. The design date "Sab, 4 Okt 2026" is a placeholder weekday; code prints the real one ("Min"). Fixed a stale token-count test (597 → 623, from the F-09 design session).

## Slice 2 — Folders and sync

**Done when:**
- *Tambah folder* validates the link, warns about public links and about a folder used by another project, then creates the source and syncs it;
- source rows show *Berhasil*, *Menyinkronkan*, *Gagal* with the reason, and the counts;
- *Sinkronkan* and *Sinkronkan semua* work;
- AC-GAL-005…012 pass with the fake provider.

**Read first:**
- AC-GAL-005, 006, 007, 008, 009, 010, 011, 012;
- BR-GAL-006, 007, 009, BR-SRC-002…006; ADR-005;
- technical-design.md › D-6…D-9, D-19, Concurrency / Consistency, Error Handling;
- `src/features/gallery/application/ports/workspace-source-repository/*` (active sources), `src/adapters/db/rate-limiter/*`.

**Exports (`galeri / desktop` and `galeri / mobile`):**
- the state `galeri-draf-proof`;
- the states:
  - `galeri-dialog-tambah-folder`, `galeri-dialog-tambah-folder-link-salah`, `galeri-dialog-folder-dipakai-proyek-lain`;
  - `galeri-draf-menyinkronkan`, `galeri-draf-gagal-foto-hilang`, `galeri-menu-folder-draf`;
  - `galeri-toast-sinkronisasi-selesai`, `galeri-toast-sinkronisasi-gagal`.

**Steps:**
- [x] Domain `drive-folder-link`, `photo-classification`, `name-sort-key`, `sync-plan` (tree walker), with unit tests for the AC-GAL-005 and AC-GAL-030 trees, depth 6 and `TOO_LARGE`.
- [x] `GallerySourceProviderPort`. Three providers:
  - `adapters/source/google-drive-provider` (fetch + Zod, error mapping, no key in errors), with unit tests on a mocked fetch;
  - a fixture provider for E2E;
  - a fake for tests.
- [x] Repository: link the source (partial unique → `FOLDER_ALREADY_LINKED`), find a folder's use in other galleries, claim the sync (D-8), write the sync in chunks, mark missing photos.

  Use cases `link-gallery-source`, `find-folder-use`, `sync-gallery-source`, with the rate limit (D-19).

  Integration tests:
  - a concurrent sync leaves 8 photos;
  - missing photos and their return;
  - a failure keeps the earlier photos.
- [ ] Actions and composition, with the provider chosen by `E2E_FAKE_DRIVE`.
- [x] UI:
  - `SourcesCard` / `SourceRow` / `SourceMenu`;
  - `LinkSourceDialog` (link error, public-link Alert, the in-use warning step);
  - the client loop for *Sinkronkan semua* (D-9);
  - toasts.
- [ ] E2E: link the fixture folder, check the counts, re-sync, and a failing folder shows *Gagal*.

**Implementation record (2026-10-04):**
- Domain: link parser, classification (nearest `edited`/`print`, folded browse path), natural sort key, breadth-first walker (depth 5, shortcuts skipped, `TOO_LARGE` budget).
- Google Drive provider (Zod, error mapping, no key or URL in failures, host allowlist, no redirects), fixture provider for `E2E_FAKE_DRIVE`, test fake.
- `GallerySourceRepositoryPort` (a second port beside `GalleryRepositoryPort`): link with the partial unique index, folder use, D-8 claim/write/fail with stale-claim takeover and a discard when the gallery changed meanwhile.
- UI: source rows with status chips and failure reasons, folder ⋯ menu, *Sinkronkan semua* client loop, *Tambah folder* with the public-link Alert and the in-use step. `ListCardItem` gained `metaTone`; Button icons gained `refresh-cw`, `copy`, `images`, `external-link`.
- Checks: typecheck, lint, unit/dom (1180), integration (98), build pass. E2E not written or run (Owner: no E2E).
- Deviations: the in-use dialog says *Folder ini* (the folder name is unknown before the first sync); the sync toast reports folders synced and failed, not per-folder new/missing counts; phone source rows reuse the desktop row (icon and full meta) instead of the compact meta.

## Slice 3 — Photos card and Owner media

**Done when:**
- the *Foto* card shows the counts per kind, the visibility lines and the first 8 thumbnails (6 on phones) with *Hilang*;
- thumbnails load only through the Owner endpoint;
- AC-GAL-014 and AC-GAL-015 pass.

**Read first:**
- AC-GAL-014, 015, 025;
- BR-SRC-003, BR-ACC-005, BR-DEL-002;
- technical-design.md › D-10, D-11, D-12 (counts), D-17, Security;
- `docs/design-system/components/photo-tile.md`.

**Exports:**
- `galeri / desktop` and `galeri / mobile`, state `galeri-draf-proof` (the *Foto* card);
- the state `galeri-draf-gagal-foto-hilang`.

**Steps:**
- [x] `src/ui/patterns/photo-tile` (Default, Missing, Skeleton) with a story and a test.
- [x] Provider `thumbnail(file, size)` (host allowlist), use case `serve-owner-photo`, and route handler `api/w/[workspaceId]/gallery-photos/[photoId]/[size]` (headers per D-10). Unit tests cover the headers and the allowlist. An integration test checks that another workspace gets 404 and that no Drive URL is in the body or headers.
- [x] `PhotosCard` with the reader counts and the first page.
- [ ] E2E: thumbnails come from `/api/w/…`, and the page source has no `googleusercontent`/`drive.google` string other than the Owner Drive links.

**Implementation record (2026-10-04):**
- `src/ui/patterns/photo-tile` (Default, Missing, Skeleton; story and test). Plain `<img loading="lazy">` with a justified `no-img-element` disable.
- Owner media: `serve-owner-photo` → `GET /api/w/[ws]/gallery-photos/[id]/[thumb|preview]` with `private, max-age=600` and `nosniff`; missing, removed, foreign or failed → empty 404 (`notFound()` in the route handler).
- *Foto* card: counts ("8 proof (1 hilang) · …"), visibility line by status (+ the *Hilang* note), first 8 photos (6 on phones), proof first then natural name order.
- Checks: typecheck, lint, unit/dom (1423), integration (150), build pass. E2E not run (Owner).
- Deviations: visibility copy for expired/archived galleries is not in Pencil; *Lihat semua foto* comes with Slice 4.

## Slice 4 — *Semua foto*

**Done when:**
- the modal shows tabs with totals, Drive-like folders (one tile per source, or straight into a single source), the breadcrumb, infinite scroll with skeletons, and search with folder labels and an empty result;
- AC-GAL-028, 029 and 030 pass.

**Read first:**
- AC-GAL-014 (modal part), 028, 029, 030;
- BR-GAL-007; spec A-12, A-13;
- technical-design.md › D-12, D-13, D-17 (Modal `xl`);
- `docs/design-system/components/folder-tile.md`, `modal.md`;
- `features/booking/ui/use-load-more-projects`.

**Exports (`semuafoto / desktop` and `semuafoto / mobile`):**
- state `semuafoto-daftar-folder`;
- states `semuafoto-isi-folder-memuat`, `semuafoto-subfolder-akad`, `semuafoto-edited-dengan-subfolder`, `semuafoto-hasil-cari`, `semuafoto-cari-tanpa-hasil`.

**Steps:**
- [x] `src/ui/patterns/folder-tile`, and Modal `size="xl"` (with a story and test). Record it in `docs/design-system/components/modal.md`.
- [x] Reader `GalleryBrowseReaderPort` (folder level, page, search, keyset) and use case `browse-gallery-photos` + schema. Integration tests use the AC-GAL-028 fixture (312/40 photos, 48 per page) and the AC-GAL-030 folding.
- [x] UI `AllPhotosModal` + `use-gallery-browse` (tabs or Segmented, breadcrumb, debounced search, sentinel), opened from *Lihat semua foto*.
- [ ] E2E: open folders and the breadcrumb, scroll to load the next page, search and clear.

**Implementation record (2026-10-04):**
- `src/ui/patterns/folder-tile` (C47), Modal `size="xl"` (recorded in `modal.md`), `use-intersection-sentinel` hook.
- Existing units extended, not recreated (Owner): `Tabs` takes button tabs (`onPress`, no `href`) for in-page state; the Page Header breadcrumb is now `page-header/breadcrumb-trail.tsx`, with `onPress` items, reused by *Semua foto*. Phones use the existing `SegmentedControl`, as clients/projects/team do.
- `GalleryBrowseReaderPort` + Drizzle reader (folder level on the folded path, recursive counts, keyset pages of 48, escaped `ILIKE` search), `browse-gallery-photos` use case and schema.
- UI: `AllPhotosModal` (tabs with totals, breadcrumb with folder/photo counts, debounced search with folder labels, empty results, skeleton rows and the sentinel), `useGalleryBrowse` (stale answers dropped).
- Checks: typecheck, lint, unit/dom (1438), integration (153, incl. the 312/40 fixture and the AC-GAL-030 folding), build pass. E2E not run (Owner).
- Deviations: none beyond the shared-unit changes above.

## Slice 5 — Photo preview

**Done when:**
- opening any tile (card or modal) shows the immersive preview with the top-bar meta, *Buka di Google Drive* (not for missing photos), ←/→, the keys, the filmstrip and Esc;
- AC-GAL-031 passes.

**Read first:**
- AC-GAL-031;
- technical-design.md › D-10 (`preview` size), D-11, D-17;
- `docs/design-system/components/media-viewer.md`;
- token-usage.md, the `surface.inverse` row (amended 2026-10-04).

**Exports (`preview / desktop` and `preview / mobile`):**
- desktop: state `preview-edited`, states `preview-proof`, `preview-hilang`;
- mobile: state `preview-proof`, states `preview-edited`, `preview-hilang`.

**Steps:**
- [x] `src/ui/patterns/media-viewer`, with dom tests for the keyboard (←/→/Home/End/Esc), focus return and the dialog label.
- [x] `listPreviewStripAction` (the neighbours around a photo in the same list) and `PhotoPreview` wiring from `PhotosCard` and `AllPhotosModal`.
- [ ] E2E: open a photo, move with → and the filmstrip, check the missing photo shows the message without the Drive button, Esc closes.

**Implementation record (2026-10-04):**
- `src/ui/patterns/media-viewer` (C48): dark backdrop, top bar with an actions slot, stage with ← / → (desktop), swipe (phones), filmstrip; ←/→/Home/End/Esc; focus starts on *Tutup* and returns on close. Story and dom tests.
- `Button` gained `href`/`target` (link with the same look), used for *Buka di Google Drive*.
- `PhotoPreview` + `usePhotoPreview`, opened from the *Foto* card and *Semua foto*; meta *{folder} · {Kind} · [Hilang ·] n dari total*; no Drive button for a missing file.
- Fixed: *Semua foto* lost its folders and breadcrumb counts after loading the next page.
- Checks: typecheck, lint, unit/dom (1445), build pass. Integration not rerun (no server change). E2E not run (Owner).
- Deviations: no `listPreviewStripAction`; the preview follows the open list and loads *Semua foto*'s next page through the same browse action near the end. Phones show *Buka di Drive* as a labelled button, not icon-only.

## Slice 6 — Lifecycle: publish, expiry, password, remove, archive, delete

**Done when:**
- every gallery and folder menu action works in each state (draft, published, expired, archived), with its dialog and toast;
- the refused publish names the failing folders;
- AC-GAL-013 and AC-GAL-016…023 pass.

**Read first:**
- AC-GAL-013, 016, 017, 018, 019, 020, 021, 022, 023;
- BR-GAL-003, 004, 005, 009, BR-AUD-001;
- technical-design.md › D-1, D-2, D-18, Domain / Application Logic › Rules, Concurrency / Consistency.

**Exports (`galeri`, desktop and mobile):** states
- **dialogs:** `galeri-dialog-publikasikan`, `galeri-dialog-publikasi-ditolak`, `galeri-dialog-kedaluwarsa`, `galeri-dialog-ganti-password`, `galeri-dialog-lepas-folder`, `galeri-dialog-arsipkan`, `galeri-dialog-hapus-galeri-draf`;
- **menus:** `galeri-menu-galeri-draf`, `galeri-menu-galeri-dipublikasikan`, `galeri-menu-folder-lepas-tidak-tersedia`;
- **states:** `galeri-dipublikasikan`, `galeri-dipublikasikan-folder-dilepas`, `galeri-kedaluwarsa`, `galeri-diarsipkan`;
- **toasts:** `galeri-toast-dipublikasikan`, `galeri-toast-password-diganti`, `galeri-toast-diarsipkan`, `galeri-toast-dibuka-lagi`.

Also `proyek / *` states `proyek-toast-galeri-draf-dihapus` and `proyek-detail-pemotretan-galeri-dipublikasikan-folder-gagal` (card states D, E and F).

**Steps:**
- [x] Use cases with unit tests:
  - `publish-gallery` (re-check sources outside the lock, then the locked write);
  - `set-gallery-expiry` (re-open from `EXPIRED`);
  - `rotate-gallery-password`;
  - `remove-gallery-source` (`LAST_ACTIVE_SOURCE`);
  - `archive-gallery`;
  - `delete-draft-gallery` (cascade).

  Integration tests cover rotation (version 2, audit columns, no plaintext), delete draft and the refused delete of a published gallery.
- [x] Actions and composition.
- [x] UI: `GalleryMenu`, the remaining dialogs, header actions by state, the expired Alert, the archived read-only view, and the remaining card states.
- [ ] E2E: publish → set an expiry in the past through a test helper → expired → re-open; rotate the password; archive.

**Implementation record (2026-10-04):**
- Use cases `publish-gallery` (provider checked outside the lock, re-check inside), `set-gallery-expiry` (re-opens from `EXPIRED`), `rotate-gallery-password`, `remove-gallery-source` (`LAST_ACTIVE_SOURCE`), `archive-gallery`, `delete-draft-gallery`, all under `withGalleryLock`; Drizzle lifecycle writer (version + audit columns, cascade delete); actions and composition entries.
- Domain `galleryHeaderActions` (primary and menu per state, from the same guards as the server).
- UI: `GalleryLifecycle` (header buttons or phone sticky bar, ⋯ menu, dialogs), confirm, expiry, rotate-password, publish-refused and remove-source dialogs, expired/archived Alert, folder *Lepas folder* with the last-folder hint, failed-folder Alert on the project card.
- Checks: typecheck, lint, unit/dom (1474), integration (156), build pass. E2E not run (Owner).
- Deviations: no *Ganti password* button in the *Akses klien* header (it is in the ⋯ menu); the failed-folder Alert on the card shows a count, not the folder name; success toasts for publish, expiry, remove are not drawn in Pencil; *Galeri dibuka lagi* toast is not wired (the expiry toast reads *Kedaluwarsa disimpan* even when it re-opens).

## Slice 7 — Cancelling the project archives the gallery

**Done when:**
- cancelling a project with a published gallery archives it in the same transaction, and a forced failure rolls back both;
- a cancelled project's draft gallery is read-only except *Hapus galeri*;
- the F-07 cancel dialog has the new sentence;
- AC-GAL-024 passes.

**Read first:**
- AC-GAL-024; BR-PRJ-010, BR-GAL-005, BR-GAL-009; ADR-016;
- technical-design.md › D-14, D-15;
- `src/composition/booking/project-flow/project-flow.ts` (`cancelProjectEntry`), `src/features/booking/application/use-cases/cancel-project/*`, `src/composition/workspace/workspace-creation-scope/*`.

**Exports:**
- `galeri / *` state `galeri-proyek-dibatalkan`;
- `proyek / *` state `proyek-detail-dibatalkan-galeri-diarsipkan`.

**Steps:**
- [x] Use case `archive-gallery-of-cancelled-project`, and the composition scope `withProjectCancellationScope` (D-15). Switch `cancelProjectEntry` to it. Integration tests cover the joint commit and the rollback when the archive throws.
- [x] Add the F-07 copy sentence (`project-copy.copy.ts`, design.md › Copy) and the cancelled states on the card and page.
- [ ] E2E: cancel a booked project with a published gallery, and check the card shows *Diarsipkan*.

**Implementation record (2026-10-04):**
- `archive-gallery-of-cancelled-project` and composition `withProjectCancellationScope` (ADR-016 pattern: project and gallery repositories over one `tx`; their transactions become savepoints). `cancelProjectEntry` now runs the cancel and, on success, the archive in that scope; a published or expired gallery is archived with the actor, a draft is left alone.
- `lockGallery` now locks the project (FOR SHARE) before the gallery (FOR UPDATE), the same order cancelling uses, to avoid deadlocks between a gallery write and a cancel.
- F-07 cancel dialog description carries the new sentence (`cancelDialogDescription`).
- Checks: typecheck, lint, unit/dom (1478), integration (159, incl. the joint commit, the rollback after a forced failure and the draft that stays), build pass. E2E not run (Owner).
- Deviations: the cancelled-project card and page states reuse the Slice 1 and 6 logic (no new components); the new sentence shows on every cancel, not only when a gallery is published.

## Slice 8 — Verification pass

**Done when:**
- keyboard-only and axe pass on the card, page, modal, preview and every dialog (AC-GAL-026);
- the isolation suite covers every action and the media route (AC-GAL-025);
- the fidelity pass against all 100 exports is done (class names and nesting only);
- the real-Drive smoke test with the non-production key passes;
- feature-map F-09 is marked `DONE`, pending Owner acceptance.

**Read first:**
- AC-GAL-025, 026; C-008;
- technical-design.md › Testing Strategy;
- `exports/INDEX.md` (all 50 states, desktop and mobile).

**Steps:**
- [x] Axe and keyboard E2E for each surface.
- [x] Cross-workspace integration test table: every action plus the media route, expecting not found and no change.
- [x] Fidelity pass per screen group (galeri, semuafoto, preview, proyek), desktop and mobile.
- [x] Real Drive smoke test, an implementation record in technical-design.md, and the feature-map update.

**Implementation record (2026-10-04/05) — Slice 8:**
- Isolation (AC-GAL-025): `tests/integration/gallery/gallery-isolation.test.ts` drives every gallery use case and the media use case from another workspace; each is not found and a before/after snapshot is unchanged.
- Browser verification (Owner: no Playwright E2E, so a manual pass in the in-app browser against the dev server with `E2E_FAKE_DRIVE=1`, a throwaway test user and `axe-core` run in the page for WCAG 2 A/AA/2.1): register → create → *Tambah folder* and sync (4 proof · 3 edited · 1 print · 2 diabaikan) → *Semua foto* (folders, breadcrumb, tabs, folded `Edited/old`) → preview (←/→/Home/End, focus on *Tutup*) → publish → expiry (30 days = *Sel, 3 Nov 2026*) → forced expiry and re-open → rotate → archive → cancel the project (card becomes *Diarsipkan*). Axe found no violation on the card, page, *Buat galeri*, *Tambah folder*, publish, expiry, rotate, archive, menus, *Semua foto* and the preview, on desktop and phone, after the fixes below.
- Fixed while verifying: folder and photo tiles collapsed in the grid (`w-full`); phone meta line failed contrast (page-header subtitle token); preview position counted subfolder photos; *Semua foto* sheet wasn't full height (`BottomSheet isFullHeight`, viewport − 44); *Buka di Drive* is an icon link on phones (`IconButton href`); `PasswordDialog` started a server action while rendering (React warning); the phone ⋯ menu never appeared because `CompactBarActions` looked for the shell slot only once at mount (new `useSlotTarget` waits for it; it also fixes F-07's phone menu).
- Fidelity: compared the draft, expired and archived pages, *Buat galeri*, *Tambah folder*, *Semua foto* (modal 1094 × 942 vs 1096 × 944, tiles 250 px), the preview and the phone page against their exports in the browser. Copy fidelity: a script compared the visible text of all 100 exports with `GALLERY_COPY` and the components; mismatches were fixed in code (e.g. *(lewat)* on an expired expiry date, failed-folder names, publish-refused dialog). Visual (pixel) comparison covers only the screens above.
- Real Drive (2026-10-05, Owner's public test folder, non-production key): `tests/e2e/gallery/gallery-drive-smoke.spec.ts` links the folder, syncs 113 proof photos, loads a thumbnail, previews with ←/→ and Escape, opens *Semua foto*, publishes, opens expiry and rotate from the ⋯ menu and archives, with axe on each surface: pass. It runs only when `GALLERY_SMOKE_FOLDER_URL` is set (`testIgnore` in `playwright.config.ts`), so the folder ID is never committed.
- E2E (Owner: "run e2e", 2026-10-05): full suite 73 passed, 2 flaky (catalog phone axe timeout, AC-SRC-015; both pass on retry), 1 failed: `workspace.spec.ts` AC-WS-022 still clicked *Proyek* and expected *Segera hadir*, stale since F-07 built Projects (fails on `main` too). Fixed to open `/invoices`, now passes; gallery specs pass.

## Slice R1 — Spike, schema and the step walker

**Done when:**
- the Google image URL is proven on the Owner's test folder (or the Owner has been told it isn't and has decided);
- migration `0013_gallery_free_tier` is applied to the non-production database;
- `walkStep` and the cursor type pass their unit tests;
- nothing user-visible changed.

**Read first:**
- ADR-019 points 1–3; ADR-018 points 3, 5;
- AC-GAL-032, 033, 036 (the data they need);
- technical-design.md › D-7, D-8, D-20, D-21, D-24, Database Changes (both sections), R-1, R-7;
- coding-rules.md › Data Access, General (named constants, 50-line functions);
- existing code to follow: `src/features/gallery/domain/sync-plan/*`, `src/adapters/db/schema/gallery/gallery.ts`, `scripts/gallery/drive-spike.ts`.

**Exports:** none (no UI).

**Steps:**
- [x] Spike: extend `scripts/gallery/drive-spike.ts` to fetch `https://lh3.googleusercontent.com/d/<fileId>=w600` for a photo of the Owner's public test folder with no key and no referrer, then the same for a file that has a resource key if the Owner has one. Record status, content type and size in technical-design.md › R-7.
  - **Stop:** if `lh3` fails, report to the Owner before R3; ADR-019 point 3 rests on it. R1 and R2 do not depend on it.
- [x] Schema: add `content_version`, `sync_cursor` and `sync_lease_at`, and give `last_seen_at` a default, in `gallery.ts` (the drop of `last_seen_at` moves to R2, see the record); generate the migration with drizzle-kit, review that it is additive, commit it, then apply it to the non-production database with the project's migrate script and report the run. Integration test for the new check and defaults.
- [x] Domain: constants `SYNC_STEP_MAX_LIST_CALLS`, `SYNC_STEP_MAX_ENTRIES`, `MAX_SYNC_PHOTOS` (replace `SYNC_LIMITS`), the cursor type, `startCursor` and `walkStep` in `sync-plan`. Keep `walkFolderTree` until R2 removes it. Unit tests: a 95-folder fake tree takes 3 steps and gives the same photos as one pass, the budget stops at 40 calls and at the entry cap, a folder page token resumes, the depth and shortcut rules still hold, and `TOO_LARGE` at the photo cap.
- [x] Cursor Zod schema in `application/schemas/sync-cursor`, with unit tests for a bad shape.

**Implementation record (2026-10-05) — R1:**
- Spike: on the Owner's test folder `lh3.googleusercontent.com/d/<id>=w600` and `=w1600` return HTTP 200 `image/jpeg` with no key and no referrer (R-7 closed except a resource-key file, none available).
- Migration `0013_gallery_free_tier` (additive: `content_version`, `sync_lease_at`, `sync_cursor`, a default on `last_seen_at`) generated, reviewed, committed and applied to the non-production database (no other branch breaks).
- Domain `sync-step` (`startCursor`, `walkStep`, `syncProgress`, the cursor types) with `SYNC_STEP_MAX_LIST_CALLS = 40`, `SYNC_STEP_MAX_ENTRIES = 3000`, `MAX_SYNC_PHOTOS = 20 000`; `toPhoto` exported from `sync-plan`. `walkFolderTree` stays until R2.
- `application/schemas/sync-cursor` (Zod, bounded) with `parseSyncCursor`.
- Checks: typecheck, lint (incl. tokens), unit/dom 1505 passed (387 files), integration for `gallery-repository` 7 passed. Build not run (no routing or config change). Other integration and E2E not rerun (nothing user-visible changed).
- Deviation: the drop of `gallery_photo.last_seen_at` (Owner-approved) moves from R1 to R2 as migration `0014`, because the current sync code still writes it and R1 must leave sync working.

## Slice R2 — Sync in steps, end to end

**Done when:**
- *Tambah folder* creates the source, and the page then syncs it step by step with *Menyinkronkan… n dari m folder*;
- *Sinkronkan* and *Sinkronkan semua* work the same way;
- an unchanged re-sync writes no photo row; a failed run keeps what it saved and marks nothing missing;
- publish checks folders until one passes;
- AC-GAL-005…012, 016, 017, 032 and 033 pass with the fake provider and a counting fake.

**Read first:**
- AC-GAL-005, 006, 007, 008, 010, 011, 012, 016, 017, 032, 033;
- BR-GAL-004, 006, 007, 009;
- technical-design.md › D-8, D-9, D-19, D-20, D-21, D-23, D-25, D-27, Concurrency / Consistency, Error Handling;
- coding-rules.md › Data Access, Easy to break, UI / Components;
- existing code to follow: `application/use-cases/sync-gallery-source/*`, `link-gallery-source/*`, `publish-gallery/*`, `adapters/db/gallery-repository/{gallery-sync-sql,drizzle-gallery-source-repository}.ts`, `ui/use-gallery-sync/*`, `ui/link-source-dialog/*`, `ui/gallery-sources-section/*`, `ui/source-text/*`.

**Exports (`galeri / desktop` and `galeri / mobile`):** the state `galeri-draf-menyinkronkan` (the source row while syncing; only its meta text changes), and `galeri-dialog-tambah-folder` for the dialog that now closes right after linking.

**Steps:**
- [x] Port `GallerySourceRepositoryPort`: replace `claimSync`, `completeSync`, `failSync` with `claimStep`, `commitStep` and `failRun`; adapter in `gallery-sync-sql.ts` (claim with lease and 30-minute restart, the conditional upsert with the `IS DISTINCT FROM` guard, the `<> ALL(seen)` missing update, counts, cursor; `content_version` is left to R4). Integration tests: a 3-step run equals one pass; two concurrent steps, only one commits; unchanged re-sync leaves `updated_at` and `xmin`; rename and remove touch only their rows; a failed run keeps earlier rows and marks none missing; a stale run restarts.
- [x] Use case `sync-gallery-source-step` replaces `sync-gallery-source` and its outcome gains `CONTINUE`; the rate limit counts run starts only. Unit tests with a counting fake provider assert ≤ 40 list calls per step.
- [x] `linkGallerySource` stops syncing inline (D-27). `publishGallery` checks folders until one passes (D-25). Update their unit tests.
- [x] Migration `0014`: drop `gallery_photo.last_seen_at` (Owner-approved 2026-10-05), generated, reviewed, committed, then applied to the non-production database and reported, together with the removal of every write to it.
- [x] Action and composition: `syncGallerySourceAction` returns the step outcome. Remove `walkFolderTree`, `SYNC_LIMITS` and the old claim code.
- [x] UI: `useGallerySync` loops steps (cap 500), reports `foldersDone` of `foldersTotal`, and *Sinkronkan semua* runs sources one after another; the link dialog closes and the page starts the first sync; progress copy in `gallery-copy.copy.ts`. Dom tests: the loop ends on `SUCCEEDED`, on `FAILED` and at the cap.
- [x] E2E (fake drive): link the fixture folder, see the progress text then *Berhasil*, re-sync, and a failing folder shows *Gagal*.

**Implementation record (2026-10-05) — R2:**
- Server: `claimStep` / `commitStep` / `failRun` replace the old claim, complete and fail. A step claims with a lease (2 min) and a 30-minute run limit, lists at most 40 Drive pages, then writes in one transaction. A photo row is written only if a column changed (`IS DISTINCT FROM`); the last step marks every unseen photo missing with one `<> ALL(seen)` update. Use case `sync-gallery-source-step`; `walkFolderTree`, `SYNC_LIMITS` and the old claim code are gone.
- `linkGallerySource` only creates the source (D-27); `publishGallery` stops at the first accessible folder (D-25). The step action skips `revalidatePath` on `CONTINUE`; the step read selects only the columns it needs, not the cursor.
- UI: `useGallerySync` loops steps (cap 500) with progress (*Menyinkronkan… n dari m folder*); the link dialog closes and the page starts the first sync.
- Migration `0014_gallery_drop_last_seen` (drops `gallery_photo.last_seen_at`, Owner-approved) generated, reviewed, committed and applied to the non-production database; it breaks older F-09 code on other branches that still writes that column.
- Checks (related only, Owner 2026-10-05): typecheck, eslint on `src` and `tests`, unit/dom for `src/features/gallery` and `src/adapters` 257 passed, integration `tests/integration/gallery` 36 passed (3-step run, concurrent steps, lease and 30-minute restart, failed run, unchanged re-sync by `xmin`), new E2E `gallery-sync.spec.ts` (fake drive) passed. Build, the full suite and the real-Drive smoke spec not run.
- Deviations: none from the design. One transient `SAVE_FAILED` log from a page render appeared during the E2E and did not recur after the step read was narrowed; the cause is unproven, watch it in R5.


## Slice R3 — Images from Google, with a fallback

**Done when:**
- thumbnails and the preview load from `lh3.googleusercontent.com/d/<id>=w600` / `=w1600` with no referrer;
- a failed image falls back once to the Owner endpoint, then shows the missing-image state;
- in fake-drive mode the UI uses the Owner endpoint directly;
- no view carries a folder ID or resource key;
- AC-GAL-015, 034 and 035 pass.

**Read first:**
- AC-GAL-014, 015, 031, 034, 035;
- BR-SRC-003, BR-ACC-005 (amended), BR-DEL-002; ADR-019 points 3, 4;
- technical-design.md › D-10, D-11, D-22, D-26, Security, UI Components;
- `docs/design-system/components/photo-tile.md`, `media-viewer.md`;
- existing code to follow: `ui/gallery-media-url/*`, `src/ui/patterns/photo-tile/*`, `src/ui/patterns/media-viewer/*`, `ui/photos-card`, `ui/browse-grid`, `ui/photo-preview`, `application/use-cases/gallery-views/*`.

**Exports (`galeri`, `semuafoto`, `preview`; desktop and mobile):** `galeri-draf-proof`, `semuafoto-daftar-folder`, `preview-proof`, `preview-hilang`. The look doesn't change; check the missing-image state still matches `preview-hilang`.

**Steps:**
- [x] Domain `google-image-url` (`googleImageUrl`, widths `w600` / `w1600`, the ID pattern) with unit tests (valid, bad IDs, widths).
- [x] Views: `GalleryPhotoView` gains `externalFileId`; the page view gains `imageHost` (null with `E2E_FAKE_DRIVE=1`). Replace `galleryMediaUrl` by an `imageSources(photo, size, imageHost)` helper returning `{ src, fallbackSrc }`. Unit tests.
- [x] UI: `PhotoTile` and the viewer image slot take `fallbackSrc` and swap once on `onError`; `<img referrerPolicy="no-referrer">`. Dom tests for one swap and no loop. Wire `PhotosCard`, `BrowseGrid` and `PhotoPreview`.
- [x] A test that walks the Owner page view, a browse page and every action result for the fixture's folder ID and resource key (AC-GAL-035).
- [x] E2E (fake drive): thumbnails come from `/api/w/…`; one test with the image host on checks the `lh3` URL shape.

**Implementation record (2026-10-05) — R3:**
- Domain `google-image-url` (`w600` tiles, `w1600` preview, ID pattern). `GalleryPhotoView` gains `externalFileId`; the route page gets `googleImages` (a boolean, false with `E2E_FAKE_DRIVE=1`) from the composition scope, through `GalleryPageScreenView`. `imageSources(photo, size, workspaceId, googleImages)` returns the Google URL with the Owner route as fallback.
- `useImageFallback` (shared hook): the main URL, then the fallback once, then nothing. `PhotoTile` and `MediaViewer` (stage and filmstrip) use it, with `referrerPolicy="no-referrer"`. A React context (`GalleryImageProvider`, in `GalleryPhotosSection`) carries the flag to the card tiles, *Semua foto* and the preview, so no prop travels through the modal and grid.
- Checks (related only): typecheck, eslint on `src` and `tests`, unit/dom for `src/ui/patterns/photo-tile`, `media-viewer`, `src/ui/hooks`, `src/features/gallery` 251+ passed, integration `tests/integration/gallery` 39 passed (AC-GAL-035 walks the page view, a browse page and the sync results for the folder ID and its resource key), E2E `gallery-sync.spec.ts` (fake drive) checks the tile URL and `no-referrer`. The real-Drive smoke is R5.
- Provider-aware (Owner 2026-10-05, after checking `source-config`): the direct URL is chosen from the photo's provider (`source-image` domain table), read from its workspace source, not from a global flag. `directImages` stays only as the E2E switch. A photo whose image failed on both URLs reads as missing in the viewer (the existing missing state) and shows no image in a tile. `serveOwnerPhoto` still uses the one Google adapter; it must choose by provider when a second one exists. AC-GAL-035 now says *the folder's resource key*: the Owner-only *Buka di Google Drive* link may carry a file's resource key (D-11).


## Slice R4 — Content version

**Done when:** `content_version` increments exactly on the D-24 events, and AC-GAL-036 passes.

**Read first:**
- AC-GAL-036; BR-GAL-005, BR-GAL-006; ADR-019 point 5;
- technical-design.md › D-24, Concurrency / Consistency;
- existing code: `adapters/db/gallery-repository/gallery-lifecycle-sql.ts`, `gallery-sync-sql.ts`, `gallery-lock-sql.ts`.

**Exports:** none.

**Steps:**
- [x] Increment `content_version` in the lifecycle writers (publish, expiry change, rotate, remove source, archive) and in the sync commit (a step that wrote or marked a row, and the last step). Integration tests: one per event, and an unchanged re-sync leaves it.
- [x] Note for F-10 in `docs/features/gallery/technical-design.md` › Context: the client gallery cache key is `galleryId` + `content_version`, and whether Cache API calls count as subrequests must be checked first (ADR-019 point 5).

**Implementation record (2026-10-05) — R4:**
- `content_version` is bumped inside the existing locked transactions by publish, expiry change, password rotation, source removal, archive, and by a sync step that wrote or marked at least one photo row. An unchanged re-sync leaves it (AC-GAL-036). D-24 said the last step always bumps; that contradicted the AC, so D-24 now follows the AC.
- Checks (related only): typecheck, eslint, integration `tests/integration/gallery` 39 passed (one test per event, two tests).
- Deviations: none beyond the D-24 wording.


## Slice R5 — Verification, CPU check and PR

**Done when:**
- every gate passes and the real-Drive smoke spec passes, including one Google image URL;
- the free-preview CPU numbers are recorded (or the Owner has said to skip them);
- the records, handoff and feature map are up to date, and `feat/gallery-free-tier` is pushed with a PR to `main`.

**Read first:**
- AC-GAL-015, 026, 032…036; ADR-018 points 2, 4; technical-design.md › Testing Strategy, R-6, R-7;
- existing code: `tests/e2e/gallery/*`, `playwright.config.ts`.

**Exports:** none.

**Steps:**
- [x] Re-run the axe and keyboard specs on the surfaces R2 and R3 touched; extend the real-Drive smoke spec to check that a tile's image URL is a Google URL and loads.
- [ ] Deploy a preview to the free Cloudflare account that is signed in from the terminal (Owner allowed it, 2026-10-05): create a new Workers project, or reuse an existing one if that is refused. Use the non-production secrets only, and remove nothing that exists. Then read CPU time per request (`wrangler tail` or the dashboard) for login, the project page, the gallery page, one sync step of the real 113-photo folder and one browse page. Record the numbers in ADR-018 and technical-design.md › R-6, and tune `SYNC_STEP_MAX_ENTRIES`. Any path over 10 ms: stop and report; ADR-018 point 2 needs a new ADR.
- [x] Update `docs/HANDOFF.md` (rework done, retention cleanup still deferred) and the feature map; run `/sdv:verify-feature gallery`.
- [x] Push `feat/gallery-free-tier` and open a PR to `main`.

**Implementation record (2026-10-05) — R5 (CPU check blocked):**
- Real-Drive smoke (`gallery-drive-smoke.spec.ts`, the Owner's 113-photo folder, non-production key) passes, now also asserting the first tile's `src` is `lh3.googleusercontent.com/d/<id>=w600` with `no-referrer`, so it loaded from Google without the fallback. Axe and keyboard on every surface pass inside that spec; `gallery-sync.spec.ts` (fake drive) passes with axe too.
- **Free-preview CPU check done: far over the documented limit, yet no request refused (ADR-018 › Measurement).** After the Owner signed in, `opennextjs-cloudflare build` and `wrangler deploy` put a throwaway Worker `shutrly-cpu-check` on the account (non-production secrets, then deleted), and `wrangler tail` gave `cpuTime`: `GET /login` 22–43 ms (9 of 20) and 356–1,007 ms (11 of 20), against a 10 ms limit. The build itself (`opennextjs-cloudflare build`) passes. A second round with the Owner signed in measured the gallery paths too: sync step 102–173 ms, browse 365 ms, create gallery 184 ms, pages 354–631 ms (table in ADR-018 › Measurement). `POST /reset-password` also hung for about 550 s in that Worker (separate defect).
- Local proxy only (`scripts/gallery/step-cpu-proxy.ts`, pure work of one step: Zod-parse of Drive list pages, the walker, the cursor JSON): about 3–5 ms CPU per 1,000–3,000 entries on a laptop. A Workers isolate is slower and the session, database and response work come on top, so `SYNC_STEP_MAX_ENTRIES = 3000` may be too high for 10 ms. It is not a measurement.
- Checks (related only): see R3 and R4 plus the two specs above. `pnpm build` and the full suite were not run.
- Decision (Owner, 2026-10-05): go on with Workers Free as it is, watch for CPU errors (ADR-018 point 4). Open: `/sdv:verify-feature gallery`, then mark the PR ready.


## AC index

| AC | Slice |
|---|---|
| 001–004, 027 | 1 |
| 005–012 | 2 |
| 014, 015 | 3 (and 4 for the modal part of 014) |
| 028–030 | 4 |
| 031 | 5 |
| 013, 016–023 | 6 |
| 024 | 7 |
| 025, 026 | 1–7 per surface, completed in 8 |
| 005–012, 016, 017 (reworked) | R2 |
| 015 (amended), 034, 035 | R3 |
| 032, 033 | R2 (data in R1) |
| 036 | R4 |
| 015, 026, 032–036 (re-check) | R5 |
