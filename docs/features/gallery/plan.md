# F-09 Gallery — Implementation Plan (vertical slices by screen)

> **For agentic workers:** `/sdv:build-feature gallery <slice>` runs one slice. Each step inside a slice is one commit, test-first (red → green → refactor). Read only the slice's **Read first** list. Stop with a `SPEC GAP` instead of guessing.

**Goal:** the Owner creates a password-protected gallery for a booked project and links Drive folders to it. The Owner then syncs and browses the photos (folders, search, preview), publishes the gallery, and manages its expiry, password and archive.

**Approach:**
- The plan follows F-07: each slice delivers one screen end to end (domain → application → repository → action → UI → tests) and can be tried in the browser when it's done.
- The order follows the data: create → sources and sync → photos → *Semua foto* → preview → lifecycle → cancel → verification.

**Sources:**
- [technical-design.md](technical-design.md) (decisions D-1…D-19);
- [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md) (AC-GAL-001…031);
- [design.md](design.md) and the raw HTML exports in [exports/](exports/), named `<state>-<device>-<frameId>.html` (the compact exports were removed on 2026-10-04: their stripped bases didn't render the real UI, Owner);
- component specs in `docs/design-system/components/` (`photo-tile`, `folder-tile`, `media-viewer`, `modal`).

## Global constraints (every slice)

- **Architecture and coding rules:** [architecture/overview.md](../../architecture/overview.md) and [coding-rules.md](../../coding-rules.md).
  - Unit folders with co-located tests.
  - `server-only` on application, composition and adapter modules.
  - No types in `.tsx` or use-case files; put them in `*.types.ts`.
  - Functions of at most 50 lines; copy lives in `*.copy.ts`.
  - Prettier and `eslint --fix` per file as you go.
- **Token rules:** `docs/design-system/token-usage.md` v3.1. Tokens only, no hex.
- **UI fidelity:** build each screen from its raw exports, `exports/<state>-<device>-<frameId>.html`. Read only the states the slice names, desktop and mobile. Each file is a complete frame of 25–165 KB, so read one state at a time. There is no `_compact/`, and `compact-exports.py` must not be re-run for this feature (Owner, 2026-10-04).
- **Secrets and logs:** never log links, the API key, passwords or ciphertext (C-103). Never use `process.env` in `src/`.
- **Migrations:** `pnpm db:migrate` only for the reviewed and committed `0010_gallery`, against the non-production database, and report the run.
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
- [ ] **Owner:** provision `GOOGLE_DRIVE_API_KEY` (Drive API enabled, restricted to the Drive API) and `GALLERY_PASSWORD_KEY` (32 random bytes, base64url) in `.dev.vars` and `.env.test`. Stop until they're done.
- [ ] Add both keys and `E2E_FAKE_DRIVE` to `appEnvSchema`. The 32-byte decode is checked, and `E2E_FAKE_DRIVE` is refused when `APP_STAGE=production`. Add them to `.env.example` with comments. Tests in `app-env.test.ts`.
- [ ] Spike: a script under `scripts/gallery/drive-spike.ts`, not shipped, that lists a public folder tree with the key and fetches `thumbnailLink=s400`. Record the list calls, the time and whether the thumbnail works without OAuth. Delete the script after recording, or keep it under `scripts/` with a header comment.

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
- [ ] Schema `src/adapters/db/schema/gallery/gallery.ts` (all three tables, D-1…D-3, Database Changes), exported from the schema barrel. Run `pnpm db:generate` to make `0010_gallery`, review it and commit. Then run `pnpm db:migrate` (non-production) and report it. Add integration tests for the checks and unique keys.
- [ ] Domain `gallery-status`, `gallery-expiry`, `gallery-password` (generator and rules) with unit tests.
- [ ] Adapters:
  - `adapters/crypto/gallery-password-cipher` (AES-256-GCM, AAD, key version);
  - `adapters/crypto/password-hasher` (`better-auth/crypto`);
  - `adapters/crypto/random-int`.

  Unit tests cover the round trip, a wrong AAD failing, and a fresh IV every time.
- [ ] Ports, `GalleryError`, and `adapters/db/gallery-repository` (create with project `FOR SHARE`, card and page reads). Use cases `propose-gallery-password`, `create-gallery`, `get-gallery-card`, `get-gallery-page`, each with unit tests and integration tests for the race and the isolation.
- [ ] Composition `gallery-scope` / `gallery-flow`, and actions in `src/app/actions/gallery/galleries.ts`.
- [ ] UI:
  - `GalleryCard` (states A, B, C for now);
  - `CreateGalleryDialog` + `ExpiryFields`;
  - the `galleryCard` slot in `ProjectDetailScreen` (D-16);
  - the gallery page route + `loading.tsx`;
  - `GalleryPageScreen` with the header, `AccessCard` and an empty `SourcesCard`.

  Dom tests and the copy file go with it.
- [ ] E2E: create a gallery from a booked project, check the password shows and copies, and the draft project shows the hint.

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
- [ ] Domain `drive-folder-link`, `photo-classification`, `name-sort-key`, `sync-plan` (tree walker), with unit tests for the AC-GAL-005 and AC-GAL-030 trees, depth 6 and `TOO_LARGE`.
- [ ] `GallerySourceProviderPort`. Three providers:
  - `adapters/source/google-drive-provider` (fetch + Zod, error mapping, no key in errors), with unit tests on a mocked fetch;
  - a fixture provider for E2E;
  - a fake for tests.
- [ ] Repository: link the source (partial unique → `FOLDER_ALREADY_LINKED`), find a folder's use in other galleries, claim the sync (D-8), write the sync in chunks, mark missing photos.

  Use cases `link-gallery-source`, `find-folder-use`, `sync-gallery-source`, with the rate limit (D-19).

  Integration tests:
  - a concurrent sync leaves 8 photos;
  - missing photos and their return;
  - a failure keeps the earlier photos.
- [ ] Actions and composition, with the provider chosen by `E2E_FAKE_DRIVE`.
- [ ] UI:
  - `SourcesCard` / `SourceRow` / `SourceMenu`;
  - `LinkSourceDialog` (link error, public-link Alert, the in-use warning step);
  - the client loop for *Sinkronkan semua* (D-9);
  - toasts.
- [ ] E2E: link the fixture folder, check the counts, re-sync, and a failing folder shows *Gagal*.

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
- [ ] `src/ui/patterns/photo-tile` (Default, Missing, Skeleton) with a story and a test.
- [ ] Provider `thumbnail(file, size)` (host allowlist), use case `serve-owner-photo`, and route handler `api/w/[workspaceId]/gallery-photos/[photoId]/[size]` (headers per D-10). Unit tests cover the headers and the allowlist. An integration test checks that another workspace gets 404 and that no Drive URL is in the body or headers.
- [ ] `PhotosCard` with the reader counts and the first page.
- [ ] E2E: thumbnails come from `/api/w/…`, and the page source has no `googleusercontent`/`drive.google` string other than the Owner Drive links.

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
- [ ] `src/ui/patterns/folder-tile`, and Modal `size="xl"` (with a story and test). Record it in `docs/design-system/components/modal.md`.
- [ ] Reader `GalleryBrowseReaderPort` (folder level, page, search, keyset) and use case `browse-gallery-photos` + schema. Integration tests use the AC-GAL-028 fixture (312/40 photos, 48 per page) and the AC-GAL-030 folding.
- [ ] UI `AllPhotosModal` + `use-gallery-browse` (tabs or Segmented, breadcrumb, debounced search, sentinel), opened from *Lihat semua foto*.
- [ ] E2E: open folders and the breadcrumb, scroll to load the next page, search and clear.

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
- [ ] `src/ui/patterns/media-viewer`, with dom tests for the keyboard (←/→/Home/End/Esc), focus return and the dialog label.
- [ ] `listPreviewStripAction` (the neighbours around a photo in the same list) and `PhotoPreview` wiring from `PhotosCard` and `AllPhotosModal`.
- [ ] E2E: open a photo, move with → and the filmstrip, check the missing photo shows the message without the Drive button, Esc closes.

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
- [ ] Use cases with unit tests:
  - `publish-gallery` (re-check sources outside the lock, then the locked write);
  - `set-gallery-expiry` (re-open from `EXPIRED`);
  - `rotate-gallery-password`;
  - `remove-gallery-source` (`LAST_ACTIVE_SOURCE`);
  - `archive-gallery`;
  - `delete-draft-gallery` (cascade).

  Integration tests cover rotation (version 2, audit columns, no plaintext), delete draft and the refused delete of a published gallery.
- [ ] Actions and composition.
- [ ] UI: `GalleryMenu`, the remaining dialogs, header actions by state, the expired Alert, the archived read-only view, and the remaining card states.
- [ ] E2E: publish → set an expiry in the past through a test helper → expired → re-open; rotate the password; archive.

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
- [ ] Use case `archive-gallery-of-cancelled-project`, and the composition scope `withProjectCancellationScope` (D-15). Switch `cancelProjectEntry` to it. Integration tests cover the joint commit and the rollback when the archive throws.
- [ ] Add the F-07 copy sentence (`project-copy.copy.ts`, design.md › Copy) and the cancelled states on the card and page.
- [ ] E2E: cancel a booked project with a published gallery, and check the card shows *Diarsipkan*.

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
- every file in `exports/` (all 100 states).

**Steps:**
- [ ] Axe and keyboard E2E for each surface.
- [ ] Cross-workspace integration test table: every action plus the media route, expecting not found and no change.
- [ ] Fidelity pass per screen group (galeri, semuafoto, preview, proyek), desktop and mobile.
- [ ] Real Drive smoke test, an implementation record in technical-design.md, and the feature-map update.

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
