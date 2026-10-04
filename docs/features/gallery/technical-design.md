# Technical Design — Gallery (F-09)

Status: DRAFT (2026-10-04); **rework for the free tier PLANNED (2026-10-05)** · Plan: [plan.md](plan.md) (slices 0–8 built, rework slices R1–R5)

## Context

The Owner creates one password-protected gallery per project and links public Google Drive folders to it. The Owner then syncs photo metadata, browses the photos with Owner-only media, and publishes the gallery. After that the Owner manages its expiry and password, and archives it at the end. Nothing is uploaded: photos stay in Drive, and Shutrly stores metadata only.

- **Feature folder:** F-09 joins the existing `gallery` feature (`src/features/gallery`), next to F-04's workspace sources (`workspace_source_config`, `WorkspaceSourceRepositoryPort`).
- **Owner screens:**
  - the Galeri card on the F-07 project detail;
  - the gallery page `/w/<id>/projects/<projectId>/gallery`;
  - the *Semua foto* modal and the photo preview.
- **Out of scope:** the client side (`/g/{token}`, password entry, public media) is F-10, and sharing is F-10/F-15. F-09 builds the pieces they reuse:
  - the stored password hash and `password_version`;
  - the decrypt port;
  - the media proxy core.

## Relevant Authority

- **Constitution:** C-003, C-004, C-005, C-007, C-008, C-101, C-103 (v1.1), C-104.
- **Business rules:**
  - BR-GAL-001…009;
  - BR-SRC-001…006;
  - BR-PRJ-004, BR-PRJ-010;
  - BR-DEL-002, BR-ACC-004, BR-ACC-005, BR-AUD-001, BR-MSG-003 (consumer), BR-WS-002, BR-WS-003.
- **Acceptance criteria:** AC-GAL-001…031.
- **ADRs:**
  - ADR-003 (tenant keys);
  - ADR-004 (token, `passwordVersion`), whose storage part is superseded by ADR-017;
  - ADR-005 (Drive public links, amended for the whole tree);
  - ADR-008/009 (Workers, Neon `Pool` per request);
  - ADR-010 (React Aria in `src/ui`);
  - ADR-015 (URL workspace);
  - ADR-016 (cross-feature transaction in composition);
  - ADR-017 (encrypted, Owner-visible password).
- **Design:** [design.md](design.md) (APPROVED 2026-10-04), [exports/INDEX.md](exports/INDEX.md) (raw HTML exports). Component specs: `docs/design-system/components/photo-tile.md`, `folder-tile.md`, `media-viewer.md`.

## Decisions

| ID | Decision | Why |
|---|---|---|
| D-1 | **Status:** stored `status` ∈ `DRAFT`, `PUBLISHED`, `ARCHIVED`. `EXPIRED` is derived when read: `PUBLISHED` and `expires_at <= now` (A-7). | Expiry needs no job, and re-opening only changes `expires_at`. Every reader calls the domain `effectiveGalleryStatus(row, now)`. |
| D-2 | **Expiry columns:** `expires_at timestamptz null` and `expiry_days int null`, never both. `expiry_days` is kept only on a draft; publish turns it into `expires_at` = publish time + days (BR-GAL-005, AC-GAL-018). On a published or expired gallery, saving a duration writes `expires_at` = now + days directly. A date expires at 23:59:59.999 of that day in `Asia/Jakarta` (A-4, the same single MVP zone as F-07's `PROJECT_SCHEDULE_TIME_ZONE`, kept as a gallery-domain constant). | Matches the spec's two kinds of expiry and keeps the readers simple. |
| D-3 | **Password storage (ADR-017):** <ul><li>`password_ciphertext`, `password_iv` and `password_key_version` hold AES-256-GCM output, base64url.</li><li>The AAD is `gallery:<workspaceId>:<galleryId>`, so a ciphertext can't be moved to another row.</li><li>`password_hash` comes from `better-auth/crypto` `hashPassword` (scrypt, already proven on Workers by F-01) and sits behind a `PasswordHasherPort`.</li><li>`password_version` starts at 1.</li></ul> | Uses Web Crypto and a hash already running on the target runtime. F-10 verifies against the hash and never decrypts. |
| D-4 | **Password generator:** a pure domain function `generateGalleryPassword(random, clientName)` builds `<word>-<4 digits>` (A-11). <ul><li>The word comes from a fixed list of about 200 common lowercase Indonesian words, 4–8 letters, using only `a–z`.</li><li>The digits are 2–9, so no `0`/`1` that look like `O`/`l`.</li><li>A word equal to any word of the client name (case-insensitive) is redrawn.</li><li>Randomness comes in through `RandomIntPort`, backed by `crypto.getRandomValues`.</li></ul> | Easy to type and testable without randomness. |
| D-5 | **Generated proposals come from the server.** The create and rotate dialogs call a `proposeGalleryPasswordAction`, so the word list and randomness stay server-side, and *Buat ulang* calls it again. The Owner may type their own password instead; the server validates 6–64 characters after trim (BR-GAL-002). | One authority (C-004). The list never ships to the browser. |
| D-6 | **Drive provider (ADR-005):** `GallerySourceProviderPort` with `listFolder(folder, pageToken)` and `thumbnail(file, size)`. The Google adapter calls Drive v3 `files.list` with: <ul><li>`q='<id>' in parents and trashed=false`;</li><li>`pageSize=1000`;</li><li>`fields=nextPageToken,files(id,name,mimeType,resourceKey,shortcutDetails/targetId)`;</li><li>`key=<GOOGLE_DRIVE_API_KEY>`;</li><li>the header `X-Goog-Drive-Resource-Keys: <id>/<key>` when a resource key exists.</li></ul> Errors map to `NOT_PUBLIC` (403/404), `RATE_LIMITED` (429, or 403 `rateLimitExceeded`/`userRateLimitExceeded`) and `UNAVAILABLE` (5xx or network). Neither the URL nor the key ever appears in an error message. | The domain never sees Drive types (BR-SRC-001). |
| D-7 | **Sync is a breadth-first walk done in steps** (amended 2026-10-05, [ADR-019](../../architecture/decisions/ADR-019-gallery-media-and-sync-on-free-tier.md)). The walk starts at the source root, with depth ≤ 5 below it (A-14). <ul><li>Shortcuts are skipped (A-14).</li><li>Non-image files count as ignored (A-9).</li><li>Folders deeper than 5 are counted as `too_deep_count` and not opened.</li><li>One **step** stops at the first of `SYNC_STEP_MAX_LIST_CALLS = 40` Drive list calls or `SYNC_STEP_MAX_ENTRIES = 3 000` directory entries read (A-T3, tuned by the CPU check, R-6). What is left of the walk is its **cursor** (D-20).</li><li>The whole run fails with `TOO_LARGE` after `MAX_SYNC_PHOTOS = 20 000` images (A-T1, amended); photos already written stay.</li><li>`classifyPhoto(pathSegments)` is unchanged (BR-GAL-007).</li></ul> | A step costs at most 40 Drive subrequests plus a few for the session and the database, inside Workers Free's 50, and the entry cap keeps parsing and writing inside 10 ms CPU (ADR-018). Any folder size works because the browser repeats steps. The limits are named constants. See R-1 and R-6. |
| D-8 | **A sync is a run of steps** (amended 2026-10-05). Each step is one request with three phases. <ol><li>**Claim, one short statement.** `UPDATE gallery_source … RETURNING sync_cursor` that either (a) starts a run: `sync_status <> 'SYNCING'`, or `sync_started_at` older than 30 minutes; it sets `SYNCING`, `sync_started_at = now()`, `sync_lease_at = now()` and `sync_cursor = NULL`; or (b) continues the run: `SYNCING` with `sync_lease_at` null or older than 2 minutes; it sets `sync_lease_at = now()`. With no row, the result is `SYNC_IN_PROGRESS` (or `NOT_FOUND`). `sync_started_at` is the run's identity.</li><li>**List Drive** outside any transaction: `walkStep` runs the pure walker from the cursor (or from the root when the cursor is null) until its budget (D-7) or the end.</li><li>**Commit, in one transaction** (the gallery locked, D-14): re-check the gallery is not archived and the project not cancelled, and that this run still holds the claim; write the step's photos (D-21); on the last step also mark missing photos, write the counts and `SUCCEEDED`, clear the cursor; otherwise store the new cursor and clear the lease.</li></ol> On a provider failure the run ends: `sync_status = 'FAILED'`, `sync_error_code`, `last_sync_attempt_at`, and the cursor and lease are cleared (D-23). | Idempotent (AC-GAL-006): the unique key prevents duplicates, and a concurrent second step is refused through the lease (C-005). A dropped browser leaves a run without a lease that the next *Sinkronkan* continues. A run older than 30 minutes restarts. |
| D-9 | **The browser drives the steps** (amended 2026-10-05). `useGallerySync` calls `syncGallerySourceAction` for one source until the result is `SUCCEEDED` or `FAILED`, showing *Menyinkronkan… n dari m folder* from each `CONTINUE` result (at most 500 calls, then it stops with a retry message). ***Sinkronkan semua*** runs the sources one after another this way. A new source is synced the same way right after it is linked (D-27). | Each step gets its own request budget (ADR-018), and one failing source never rolls back another (AC-GAL-012). |
| D-10 | **Owner media endpoint, now the fallback** (amended 2026-10-05, ADR-019): `GET /api/w/[workspaceId]/gallery-photos/[photoId]/[size]` with `size` ∈ `thumb` (`s400`) or `preview` (`s1600`). The page loads images from Google first (D-22) and falls back to this endpoint when an image fails to load. <ol><li>It verifies the Owner and workspace (C-101), then loads the photo scoped by workspace.</li><li>The adapter calls `files.get?fields=thumbnailLink` with the key, checks that the host ends with `.googleusercontent.com`, swaps the `=s220` suffix for the size, fetches it and streams the bytes back.</li><li>The response carries `Content-Type` from upstream (images only), `Cache-Control: private, max-age=600` and `X-Content-Type-Options: nosniff`.</li><li>A missing photo, a non-image or any upstream failure gives 404 with no body detail.</li></ol> | The key and the folder link never reach the browser (BR-SRC-003). The route costs one Worker request and two subrequests per image, so it is the exception, not the path (ADR-018). F-10 reuses the core use case behind token and password checks. |
| D-11 | **"Buka di Google Drive"** links are built server-side for the Owner only: `https://drive.google.com/file/d/<id>/view` plus `?resourcekey=` when the file has one. They are returned only in the Owner photo DTO and never for a missing photo. | BR-SRC-003 covers client responses. Owner pages are private. |
| D-12 | **Browsing reads** (the `GalleryBrowseReaderPort`), all scoped by workspace and gallery, with visible photos only (source not removed). Missing photos are shown to the Owner with the *Hilang* badge. <ul><li>**Counts per kind:** `count(*) filter (where …)`.</li><li>**One folder level:** for kind K and folder prefix P (source id + `browse_path` prefix), the direct child folder names with their recursive photo counts (via `split_part` on the remaining path), then a page of the photos directly in P.</li><li>**Search:** `file_name ILIKE '%' || escaped || '%'` across the gallery and all kinds.</li><li>**Order and paging:** `name_sort_key, id`, 48 per page (A-13), keyset cursor `(name_sort_key, id)`.</li><li>**Top level:** with more than one source it is one folder tile per source; with one source the reader starts inside it (AC-GAL-028).</li></ul> | Few thousand rows per gallery, so `(gallery_id, kind, gallery_source_id, browse_path, name_sort_key)` covers it and no trigram index is needed. |
| D-13 | **Natural file-name order (A-5):** `name_sort_key` is computed in the domain. It lowercases the name and left-pads every digit run to 10 digits, so `IMG_2` sorts before `IMG_10`. | Plain `ORDER BY` in SQL, testable in the domain. |
| D-14 | **Project facts come through a gallery port.** `GalleryProjectPort.lockForGallery(context, projectId)` returns `{ status, title, clientName }` with `SELECT … FOR SHARE` inside the gallery write transaction. It is implemented in the gallery repository adapter, which reads `project` and `client` directly. | `features/gallery` can't import `features/booking`. Sharing the lock blocks a concurrent cancel, which takes `FOR UPDATE`, so a gallery can't be created or published on a project being cancelled. |
| D-15 | **Cancel → archive (BR-PRJ-010, ADR-016):** a new composition scope `withProjectCancellationScope` opens `db.transaction` and builds both the project repository and the gallery repository over `tx`. `cancelProjectEntry` runs `cancelProject`; when it succeeds it runs `archiveGalleryOfCancelledProject`, which archives a `PUBLISHED` gallery (including an expired one) with the actor and time and leaves a `DRAFT` one. A throw in either rolls back both (AC-GAL-024). `withLockedProject` nested inside `tx` becomes a savepoint. | This is the ADR-016 pattern, with no new ADR needed. |
| D-16 | **Galeri card slot:** `ProjectDetailScreen` gains an optional `galleryCard: ReactNode` prop, rendered right after `ProjectInfoCard`. The route page loads the gallery summary through `composition/gallery` and passes `<GalleryCard …/>` in. | Keeps `features/booking/ui` free of gallery imports (boundaries lint). |
| D-17 | **New shared UI units** (design C46–C48, used by F-10/F-11): <ul><li>`src/ui/patterns/photo-tile` (Default, Missing, Skeleton);</li><li>`src/ui/patterns/folder-tile`;</li><li>`src/ui/patterns/media-viewer`, a React Aria `ModalOverlay` with the filmstrip, ←/→, Home/End and Esc;</li><li>Modal `size="xl"` (width up to `--size-content-max`, height viewport − 80; design.md › Findings).</li></ul> | Features never hand-roll dialogs (coding rules). The token set already exists (623 tokens). |
| D-18 | **Audit (BR-AUD-001):** rotation writes `password_changed_at` / `password_changed_by`; archive writes `archived_at` / `archived_by`; source removal writes `removed_at` / `removed_by`. | Same column-based audit as F-07's cancellation. |
| D-19 | **Rate limit** (amended 2026-10-05): the sync *start* of a run is limited to 20 per workspace per minute through the existing Neon fixed-window limiter; later steps of a run are not counted. The gallery declares its own `GalleryRateLimiterPort`, and composition passes the same `createNeonRateLimiter` object. Media requests aren't limited in F-09; they sit behind the Owner session. | Architecture › Security lists sync; F-10 adds the public limits (BR-ACC-004). A run has a finite cursor, so its steps can't loop. |
| D-20 | **Cursor** (ADR-019 point 1). `gallery_source.sync_cursor jsonb` holds, while a run is open: <ul><li>`queue`: folders still to read, each `{ folderId, resourceKey, segments, pageToken }`;</li><li>`seen`: the file IDs found so far in this run (D-21);</li><li>the counters `ignoredCount`, `tooDeepCount`, `foldersDone`, `listCalls`, and the root `folderName`.</li></ul> A Zod schema parses it on every read; an unknown shape ends the run as `UNAVAILABLE` and the next sync starts fresh. Progress is `foldersDone` of `foldersDone + queue.length`. The domain owns the cursor type and `walkStep(listFolder, cursor, budget)`; the adapter only stores JSON. | The state lives with the source (ADR-019), so a step needs no server memory, and any Worker instance can continue a run. |
| D-21 | **Write only what changed** (ADR-019 point 2). A step upserts its photos with `INSERT … ON CONFLICT (gallery_source_id, external_file_id) DO UPDATE SET … WHERE (file_name, mime_type, kind, folder_path, browse_path, resource_key, missing_at) IS DISTINCT FROM (excluded.…)`, so an unchanged row is neither rewritten nor given a new version. The step also appends the IDs it found to `seen`. The last step runs one set-based statement: `UPDATE gallery_photo SET missing_at = now() WHERE gallery_source_id = ? AND missing_at IS NULL AND external_file_id <> ALL($seen)`, then the counts. `last_seen_at` is no longer written, and the same migration drops its column (Owner 2026-10-05, see Database Changes). | A re-sync of an unchanged folder writes no photo rows, and `gallery_photo` stays near its data size (ADR-018 capacity). The run's `seen` list replaces the per-row marker without touching the rows. |
| D-22 | **Images from Google first** (ADR-019 point 3, Owner 2026-10-05; C-103, BR-ACC-005 and AC-GAL-015 amended). The pure domain function `googleImageUrl(externalFileId, width)` returns `https://lh3.googleusercontent.com/d/<id>=w<width>` for an ID matching `^[A-Za-z0-9_-]{10,200}$`, and null otherwise. <ul><li>Widths: `w600` for tiles and the filmstrip, `w1600` for the preview.</li><li>The Owner photo view carries `externalFileId`. It never carries a folder ID, a folder link, a resource key or the API key.</li><li>The `<img>` has `referrerPolicy="no-referrer"`, so Google never sees the Shutrly page URL.</li><li>`PhotoTile` and the viewer's image slot take a `fallbackSrc`; one `onError` swaps once to the D-10 route. A photo that fails on both shows the existing missing-image state.</li><li>The page view carries `imageHost`, which composition sets to null when `E2E_FAKE_DRIVE=1`; then the UI uses the D-10 route directly, so E2E never calls Google.</li></ul> | One view of a 300-photo gallery costs 1–2 Worker requests instead of ~300. The undocumented URL form is why the fallback stays (R-7). |
| D-23 | **Failure semantics.** A failed run keeps what its earlier steps wrote and marks nothing missing, because missing marking only happens on the last step of a successful run. The source shows *Gagal* with the reason, and its counts are those of its last success. The next sync converges (idempotent). | Buffering a whole listing until the end would need the whole listing in the cursor. *Earlier photos stay unchanged* in the spec becomes *earlier photos are kept* (spec amended). |
| D-24 | **Content version** (ADR-019 point 5, the part that belongs to F-09). `gallery.content_version int not null default 1` is incremented, inside the same locked transaction, by: a sync commit that wrote or marked at least one row (and the last step of a run), publish, a changed expiry, password rotation, source removal and archive. F-10 builds its cache key on `galleryId` + `content_version`; the cache itself is F-10's. | The only writers that change what a client sees are already under the gallery lock, so the counter can't be missed or raced. |
| D-25 | **Publish checks until one folder passes.** `publishGallery` calls `getFolder` on the active sources in order and stops at the first accessible one; it returns the per-source failures only when none passes (AC-GAL-017). | BR-GAL-004 refuses only when none passes, and the normal case now costs one subrequest. |
| D-26 | **Folder identifiers never leave the server** (ADR-019 point 4). `provider_folder_id`, `resource_key` and the folder URL stay in the adapter, the use cases and the cursor. No view, action result, RSC payload, error or log carries them; a test walks the Owner page view and every action result for the fixture's folder ID (AC-GAL-035). The Owner-only *Buka di Google Drive* link points to a **file**, not a folder (D-11). | The comparison product leaks the folder link to the browser (ADR-019 context). |
| D-27 | **Linking no longer syncs inline.** `linkGallerySource` only creates the source (`NEVER`) and returns its id. The dialog closes, and the page starts the first sync through `useGallerySync`, so the source shows *Menyinkronkan… n dari m folder* at once. | Link and the first step would otherwise share one request budget, and the progress needs the client loop (D-9). |

## Database Changes

One migration, `0012_gallery`, generated by drizzle-kit. It is additive only, so it is safe on the shared non-production database. Schema file: `src/adapters/db/schema/gallery/gallery.ts`.

**`gallery`**
- **Identity:**
  - `id`, `workspace_id` (FK `workspace`, restrict);
  - `project_id`, tenant FK to `project`, restrict, **unique** (BR-GAL-001);
  - `tenantKey`.
- **Status:** `status` with the check `in ('DRAFT','PUBLISHED','ARCHIVED')`.
- **Password:**
  - `password_ciphertext`, `password_iv`, `password_hash`: text, not null;
  - `password_key_version`: int not null default 1;
  - `password_version`: int not null default 1, check ≥ 1;
  - `password_changed_at` timestamptz, `password_changed_by` (user, set null).
- **Expiry:**
  - `expires_at` timestamptz null;
  - `expiry_days` int null, check `between 1 and 3650`;
  - check `not (expires_at is not null and expiry_days is not null)`;
  - check `expiry_days is null or status = 'DRAFT'`.
- **Lifecycle:**
  - `published_at` timestamptz null, check `(status = 'DRAFT') = (published_at is null)`;
  - `archived_at`, `archived_by`, check `(status = 'ARCHIVED') = (archived_at is not null)`.
- **Audit:** `created_by`, `updated_by`, `auditColumns`.

**`gallery_source`**
- **Identity:**
  - `id`, `workspace_id`;
  - `gallery_id`, tenant FK to `gallery`, **cascade** (draft delete, BR-GAL-005);
  - `workspace_source_id`, tenant FK to `workspace_source_config`, **restrict** (F-04 delete already maps 23503 to `IN_USE`, BR-SRC-006);
  - `tenantKey`.
- **Folder:**
  - `provider_folder_id` text not null, check `~ '^[A-Za-z0-9_-]{10,200}$'`;
  - `resource_key` text null;
  - `label` text null, ≤ 60 characters after trim (A-3);
  - `folder_name` text null (from the last sync).
- **Removal:** `removed_at`, `removed_by`.
- **Sync status:**
  - `sync_status` with the check `in ('NEVER','SYNCING','SUCCEEDED','FAILED')`;
  - `sync_started_at`, `last_synced_at`, `last_sync_attempt_at`;
  - `sync_error_code` null, check `in ('NOT_PUBLIC','RATE_LIMITED','UNAVAILABLE','TOO_LARGE')`.
- **Counts:** int not null default 0: `proof_count`, `edited_count`, `print_count`, `ignored_count`, `missing_count`, `too_deep_count`.
- **Audit:** `created_by`, `auditColumns`.
- **Partial unique index:** `(gallery_id, provider_folder_id) WHERE removed_at IS NULL` (BR-GAL-009: the same folder once per gallery, and re-linking after removal is allowed, A-6).
- **Index:** `(workspace_id, provider_folder_id)` for the "linked to another project" warning.

**`gallery_photo`**
- **Identity:**
  - `id`, `workspace_id`;
  - `gallery_id`, tenant FK to `gallery`, cascade;
  - `gallery_source_id`, tenant FK to `gallery_source`, cascade.
- **File:**
  - `external_file_id`, `resource_key` null, `file_name`, `mime_type`, `name_sort_key`;
  - `kind`, check `in ('PROOF','EDITED','PRINT')`;
  - `folder_path` text not null default `''`: the path below the source root, `/`-joined, as in Drive;
  - `browse_path` text not null default `''`: `folder_path` without the kind folder.
- **Sync marks:** `last_seen_at` timestamptz not null, `missing_at` null, `auditColumns`.
- **Unique:** `(gallery_source_id, external_file_id)` (BR-GAL-006).
- **Indexes:** `(gallery_id, kind, gallery_source_id, browse_path, name_sort_key, id)` for browsing, `(gallery_id, name_sort_key, id)` for search and the preview strip.

Removed-source photos are hidden by joining the source's `removed_at` (BR-GAL-009). Nothing is denormalised onto the photo.

## Database Changes — free-tier rework (migration `0013_gallery_free_tier`)

One more migration, generated by drizzle-kit, additive only (safe for code on other branches that share the non-production database; AGENTS.md hard stops).
- **`gallery`:** `content_version int not null default 1`, check `>= 1` (D-24).
- **`gallery_source`:** `sync_cursor jsonb null`, `sync_lease_at timestamptz null` (D-8, D-20).
- **`gallery_photo`:** `last_seen_at` is dropped. This breaks the F-09 code of any other branch that still writes it against the shared non-production database; the Owner allowed it explicitly on 2026-10-05 (AGENTS.md normally forbids dropping columns other branches use). Say so in the migration report.
- The existing unique `(gallery_source_id, external_file_id)` serves both the conditional upsert and the `<> ALL(seen)` update.

## Server / API Interface

**Composition** (`src/composition/gallery/gallery-flow/`, `gallery-scope/`). Every entry:
- verifies the Owner (`requireOwnerOrRedirect`) and the workspace (`verifyOwnerWorkspace`);
- parses IDs, or calls `notFound()`;
- runs the use case;
- maps an unexpected error to `GalleryError("SAVE_FAILED")` with a redacted log.

**Server actions** (`src/app/actions/gallery/galleries.ts`), each a thin wrapper that revalidates `/w/[workspaceId]/projects` on success:

| Action | Use case | AC |
|---|---|---|
| `proposeGalleryPasswordAction(ws, projectId)` | `proposeGalleryPassword` | 001, 021 |
| `createGalleryAction(ws, projectId, values)` | `createGallery` | 001–004 |
| `linkGallerySourceAction(ws, galleryId, values)` | `linkGallerySource` (creates the source; the page then syncs it, D-27) | 005, 008–011 |
| `checkFolderInUseAction(ws, galleryId, link)` | `findFolderUse` (the warning before confirming) | 010 |
| `syncGallerySourceAction(ws, sourceId)` | `syncGallerySourceStep`: one step of the run; returns `CONTINUE` (with `foldersDone`, `foldersTotal`), `SUCCEEDED`, `FAILED` or a refusal | 006, 007, 012, 032, 033 |
| `removeGallerySourceAction(ws, sourceId)` | `removeGallerySource` | 013 |
| `publishGalleryAction(ws, galleryId)` | `publishGallery` | 016, 017 |
| `setGalleryExpiryAction(ws, galleryId, values)` | `setGalleryExpiry` | 018–020 |
| `rotateGalleryPasswordAction(ws, galleryId, values)` | `rotateGalleryPassword` | 021 |
| `archiveGalleryAction(ws, galleryId)` | `archiveGallery` | 022 |
| `deleteDraftGalleryAction(ws, galleryId)` | `deleteDraftGallery` | 023 |
| `browseGalleryPhotosAction(ws, galleryId, query)` | `browseGalleryPhotos` (folder level or search, one page) | 028–030 |
| `listPreviewStripAction(ws, galleryId, query)` | the same reader around one photo | 031 |

**Reads for pages:**
- `loadGalleryCard(ws, projectId)`: the project-detail card;
- `loadGalleryPage(ws, projectId)`: the header, *Akses klien* with the decrypted password, sources, counts and the first 8 photos.

**Route handler:** `src/app/api/w/[workspaceId]/gallery-photos/[photoId]/[size]/route.ts` → `serveOwnerPhotoEntry` (D-10).

**Page:** `src/app/(owner)/w/[workspaceId]/projects/[projectId]/gallery/page.tsx` and `loading.tsx` (the skeleton `K5PgU`/`umIa6`).

**Environment** (`appEnvSchema`, `.env.example`, Worker secrets):
- `GOOGLE_DRIVE_API_KEY` (min 1);
- `GALLERY_PASSWORD_KEY` (base64url of 32 bytes, validated to decode to 32 bytes).

The Owner provisions both.

## Domain / Application Logic

**Domain** (`src/features/gallery/domain/`), pure:

| Unit | Contents |
|---|---|
| `gallery-status` | <ul><li>`effectiveGalleryStatus(stored, expiresAt, now)`;</li><li>guards `canSync`, `canEditSources`, `canPublish`, `canSetExpiry`, `canRotatePassword`, `canArchive` and `canDeleteDraft`, all taking `(status, projectStatus)` (BR-GAL-005, BR-GAL-009, AC-GAL-022/024);</li><li>`galleryAllowedForProject(projectStatus)`.</li></ul> |
| `gallery-expiry` | <ul><li>`ExpiryInput` = `NONE` \| `{DATE, date}` \| `{DAYS, days}`;</li><li>`resolveExpiry(input, status, now)` returns `{expiresAt, expiryDays}` and refuses a past date;</li><li>`expiresAtOnPublish`.</li></ul> |
| `gallery-password` | <ul><li>`GALLERY_PASSWORD_MIN = 6`, `GALLERY_PASSWORD_MAX = 64`;</li><li>`generateGalleryPassword(randomInt, clientName)`;</li><li>`GALLERY_PASSWORD_WORDS`.</li></ul> |
| `drive-folder-link` | `parseDriveFolderLink(url)` returns `{folderId, resourceKey}` or `NOT_A_FOLDER` / `NOT_DRIVE`. It accepts `drive.google.com/drive/folders/<id>`, `/drive/u/<n>/folders/<id>`, `?resourcekey=` and `open?id=` (only when it's a folder link). A `/file/d/` link is `NOT_A_FOLDER` (AC-GAL-009). |
| `photo-classification` | <ul><li>`classifyPhoto(segments)` returns `{kind, browsePath}`;</li><li>`isImageMime`;</li><li>`SYNC_MAX_DEPTH = 5`, `MAX_SYNC_LIST_CALLS`, `MAX_SYNC_PHOTOS`.</li></ul> |
| `name-sort-key` | `nameSortKey(fileName)` (D-13). |
| `sync-plan` | <ul><li>`walkStep(listFolder, cursor, budget)`: a pure async walker over an injected listing function. It reads until the budget (D-7) or the end and returns the photos found, the new cursor and whether the run is done, or a failure code. `startCursor(root)` makes the first cursor.</li><li>`SYNC_STEP_MAX_LIST_CALLS`, `SYNC_STEP_MAX_ENTRIES`, `MAX_SYNC_PHOTOS`.</li></ul> |
| `google-image-url` | `googleImageUrl(externalFileId, width)` (D-22). |

**Application** (`src/features/gallery/application/`).

*Ports:*
- `GalleryRepositoryPort`: locked writes inside one transaction, `withLockedGallery`, `withProjectForGallery`;
- `GalleryBrowseReaderPort`;
- `GallerySourceProviderPort`;
- `GalleryPasswordCipherPort`: `encrypt` / `decrypt`, with the AAD from IDs;
- `PasswordHasherPort`;
- `RandomIntPort`;
- `GalleryRateLimiterPort`;
- `ClockPort` (`now`).

*Use cases (one folder each):*
- `propose-gallery-password`, `create-gallery`, `get-gallery-card`, `get-gallery-page`;
- `link-gallery-source`, `find-folder-use`, `sync-gallery-source-step`, `remove-gallery-source`;
- `publish-gallery`, `set-gallery-expiry`, `rotate-gallery-password`, `archive-gallery`, `delete-draft-gallery`, `archive-gallery-of-cancelled-project`;
- `browse-gallery-photos`, `serve-owner-photo`.

*Schemas:* `create-gallery`, `gallery-expiry`, `gallery-password`, `link-gallery-source` and `browse-query`. Each is shared by its form and its action.

*Rules:*
- Every mutation locks the gallery row (`FOR UPDATE`) and the project row (`FOR SHARE`, D-14), and decides from the stored state, never from client input (C-004).
- **Publish:**
  - loads the active sources;
  - calls `provider.getFolder(root)` on the sources in order until one is accessible, outside the lock (D-25);
  - then in one transaction re-locks, re-checks the state and sets `PUBLISHED`, `published_at` and `expires_at` from `expiry_days`;
  - returns the failed sources with reasons when none passes (AC-GAL-017).
- **Rotate:** encrypts and hashes the new password, `password_version + 1`, and records who and when (AC-GAL-021).

## UI Components

| Unit | Location | Notes |
|---|---|---|
| `PhotoTile`, `FolderTile`, `MediaViewer` | `src/ui/patterns/*` | <ul><li>C46–C48 specs.</li><li>`MediaViewer` takes `items`, `index`, `onIndexChange`, a `renderImage` slot, an `actions` slot and `onClose`.</li><li>Stories and tests are co-located.</li></ul> |
| Modal `size="xl"` | `src/ui/patterns/modal` | design.md › Findings. |
| `GalleryCard` | `features/gallery/ui/gallery-card` | <ul><li>States A–G (board `ZiJzF`).</li><li>Server-rendered.</li><li>Opens `CreateGalleryDialog`.</li></ul> |
| `CreateGalleryDialog`, `ExpiryFields` | `features/gallery/ui/*` | <ul><li>React Hook Form + `zodResolver`.</li><li>*Buat ulang* calls the propose action.</li><li>Uses the radio group with Date/Days (F-07 `DateField`).</li></ul> |
| `GalleryPageScreen` | `features/gallery/ui/gallery-page-screen` | Header actions by state, then *Akses klien*, *Sumber foto* and *Foto* (design.md › Layout). |
| `AccessCard` (password + *Salin* via `navigator.clipboard`), `SourcesCard` + `SourceRow` + `SourceMenu`, `PhotosCard` | `features/gallery/ui/*` | Shows each sync status chip. |
| `LinkSourceDialog`, `PublishDialog`, `PublishRefusedDialog`, `ExpiryDialog`, `RotatePasswordDialog`, `RemoveSourceDialog`, `ArchiveDialog`, `DeleteDraftDialog`, `GalleryMenu` | `features/gallery/ui/*` | Modal on desktop, Bottom Sheet on phones, as in F-06/F-07. |
| `AllPhotosModal` + `use-gallery-browse` hook | `features/gallery/ui/*` | <ul><li>Tabs or Segmented, breadcrumb, search, grid.</li><li>Infinite scroll with an `IntersectionObserver` sentinel (follows `use-load-more-projects`).</li></ul> |
| `PhotoPreview` | `features/gallery/ui/photo-preview` | <ul><li>Wraps `MediaViewer`.</li><li>Image `src` is the media endpoint.</li><li>Lazily loads neighbour pages through `listPreviewStripAction`.</li></ul> |

- **Rendering:** server components for the page and card, with client components only for the dialogs, menus, the modal and the preview.
- **Thumbnails:** plain `<img loading="lazy" referrerPolicy="no-referrer">` with the Google image URL and a `fallbackSrc` on the Owner endpoint (D-22). Never `next/image`, whose optimiser would cache publicly.
- **Sync progress:** `useGallerySync` shows *Menyinkronkan… n dari m folder* on the source row while it loops (D-9); the copy goes in `gallery-copy.copy.ts`. The row shape is the drawn *Menyinkronkan* state; only the meta text changes, so this is not a new design state.
- **Copy:** all copy lives in `gallery-copy.copy.ts` (design.md › Copy).
- **F-07 cancel dialog:** gains the BR-PRJ-010 sentence in `project-copy.copy.ts`.

## Validation

- **Zod at every action:**
  - IDs;
  - password: trim, 6–64 characters;
  - expiry: a discriminated union, days 1–3650, date `YYYY-MM-DD`;
  - link: URL ≤ 2048 characters, parsed by the domain;
  - label ≤ 60 characters;
  - browse query: kind, cursor, source id, path ≤ 1024 characters, search ≤ 100 characters.
- **Drive responses** are parsed with Zod in the adapter; an unknown shape is `UNAVAILABLE`.
- **The database is the last line:** checks, unique and partial unique indexes, tenant FKs.

## Error Handling

`GalleryError` codes (typed, extending `DomainError`):
- `NOT_FOUND`, which maps to `notFound()`;
- `NOT_ALLOWED_FOR_PROJECT`, `ALREADY_EXISTS`, `INVALID_STATE`;
- `FOLDER_ALREADY_LINKED`, `SOURCE_NOT_ACTIVE`, `LAST_ACTIVE_SOURCE`;
- `SYNC_IN_PROGRESS`, `RATE_LIMITED`;
- `PUBLISH_REFUSED` (with per-source reasons), `PAST_DATE`;
- `SAVE_FAILED`.

Form-level and field errors return as `{ ok: false, code | fieldErrors }`, matching the F-07 `ProjectWriteResult` shape.

Sync failures are data, not errors. The source stores the code, and the UI maps it to:
- *Gagal* with the sharing hint (`NOT_PUBLIC`);
- *Coba lagi nanti* (`RATE_LIMITED`, `UNAVAILABLE`);
- *Folder terlalu besar* (`TOO_LARGE`, see R-1).

Logs carry IDs and codes only, never links, keys, passwords or ciphertext (C-103, AC-GAL-008/027).

## Concurrency / Consistency

| Case | Mechanism |
|---|---|
| Double create (AC-GAL-004) | Unique `gallery.project_id`; 23505 maps to `ALREADY_EXISTS`. |
| Concurrent sync steps (AC-GAL-006, 032) | The claim is a conditional `UPDATE … RETURNING` with a lease (D-8), plus the unique `(gallery_source_id, external_file_id)`. A step commits only while it still holds the run (`sync_started_at`). |
| Sync vs archive or remove | The write phase re-locks and re-checks the state, and discards its listing if the gallery or source changed. |
| Publish vs remove source | Both lock the gallery row, and publish re-counts active sources inside the lock. |
| Create, publish or sync vs project cancel (AC-GAL-024) | Gallery writes take the project `FOR SHARE`; cancel takes `FOR UPDATE` and archives in the same transaction (D-14, D-15). |
| Link the same folder twice concurrently | The partial unique index; 23505 maps to `FOLDER_ALREADY_LINKED`. |

## Security

- **Owner checks:** every action and the media route verify the Owner and workspace. Every query filters by `workspace_id`, and tenant FKs stop cross-workspace references (C-101, AC-GAL-025).
- **Secrets:** both are Worker secrets, read only through `AppEnv` (no `process.env`) and passed to adapters by composition.
- **Password exposure:** the plaintext reaches only the Owner's gallery page and the Owner's own actions. The ciphertext never leaves the adapter (C-103).
- **Drive data in responses:** Owner responses carry only `id`, file name, kind, paths, `missing` and the Owner-only Drive file link. Folder IDs and resource keys stay server-side; the source row shows the label or folder name.
- **Media proxy (fallback):** host allowlist, an image content-type check, no redirects followed to other hosts, `private` cache.
- **Google image URLs (D-22):** built only from a file ID that passed the ID pattern, for photos the reader may see (Owner: all present photos; client, in F-10: kinds allowed by BR-GAL-007 and BR-DEL-002, never missing or removed ones). A client who saw a photo can keep its URL after expiry or a password change; the files are already link-shared on Drive (BR-SRC-004), and this trade-off was accepted by the Owner on 2026-10-05 ([ADR-019](../../architecture/decisions/ADR-019-gallery-media-and-sync-on-free-tier.md)).
- **Folder identifiers:** see D-26.
- **Cursor:** holds folder IDs and resource keys, so it is never selected into a view.

## Testing Strategy

Test names start with the AC or BR ID.

| Level | What | AC |
|---|---|---|
| Domain unit | `walkStep` (budget stops at 40 calls and at the entry cap, resumes from its cursor, page tokens, `TOO_LARGE`, same photos as one long walk) and `googleImageUrl`; status guards and the derived `EXPIRED`; expiry resolution (dates in Asia/Jakarta, duration on publish); password rules and the generator (word list, digits, client-name redraw); link parser cases; classification at any depth plus folding; natural sort; tree walker (depth 6 skipped, shortcuts, ignored, `TOO_LARGE`) with a fake lister | 002, 005, 009, 018–020, 022, 024, 028, 030, 032, 034 |
| Application unit | each use case with fake ports: state refusals, publish with one of two sources failing, rotation increments the version, propose redraws | 001, 003, 013, 016, 017, 021–023 |
| Adapter unit | Google Drive adapter with a mocked `fetch` (query, headers, error mapping, no key in errors); Web Crypto cipher round-trip, wrong AAD fails, ciphertext differs per call; media proxy host allowlist | 008, 015, 027 |
| Integration (shared non-prod DB, own workspace per test) | a multi-step run on a 3-step tree ends with the same rows as one pass, and two concurrent steps never both commit; an unchanged re-sync leaves every photo row's `xmin` and `updated_at` as they were; a failed run keeps earlier rows and marks none missing; `content_version` increments on each D-24 event; schema constraints; create race (two creates → one gallery); concurrent sync of one source → 8 photos; missing and back; cancel archives in one transaction, and a forced failure rolls back both; cross-workspace reads, writes and media → not found; the stored password is never plaintext | 001, 004, 006, 007, 024, 025, 027, 032, 033, 035, 036 |
| UI unit (dom) | `PhotoTile`, `FolderTile`, `MediaViewer` keyboard (←/→/Home/End/Esc); `PhotoTile` swaps to its `fallbackSrc` once on a failed image; the sync hook loops to the end and reports progress; dialogs' field errors; card states | 002, 014, 026, 031, 032, 034 |
| E2E (Playwright + axe) | project → *Buat galeri* → link folder (Drive faked through a test-only provider switch, as F-01's `E2E_EMAIL_CAPTURE`) → sync → *Semua foto* → preview → publish → archive; keyboard-only and axe on every dialog | 001, 005, 014, 016, 022, 026, 028–031, 035 |

**Drive in tests:**
- Unit and integration tests use a fake `GallerySourceProviderPort`.
- E2E uses `E2E_FAKE_DRIVE=1` (development stage only, refused in production by `appEnvSchema`). Composition then wires a fixture provider that serves the AC fixture tree and sample JPEGs from `tests/fixtures/drive/`.
- A manual smoke test against real Drive with the Owner's non-production key is part of Slice 0, Slice 8 and rework slice R5 (the real smoke spec also checks that a Google image URL loads).
- **Free-tier check (ADR-018 point 2):** CPU time per request on a free Workers preview, for login, the project page, the gallery page, one sync step and one browse page. The Owner allowed the deploy (R5).

## Implementation Iterations

See [plan.md](plan.md): Slice 0 (base and spike) and Slices 1–8 (built), then **rework slices R1–R5** for the free tier (ADR-018/019), each with a **Read first** list and a done check.

## Risks / Open Questions

- **R-1 — Sync size on Workers (reworked 2026-10-05).**
  - The one-request walk of 300 list calls assumed Workers Paid. ADR-018/019 (Accepted) target Workers Free: 50 subrequests and 10 ms CPU per request. D-7…D-9 split a sync into steps of ≤ 40 list calls, so folder size no longer breaks the subrequest limit.
  - **A-T1 (amended):** the whole run stops at `MAX_SYNC_PHOTOS = 20 000` images (about a year of one busy tenant), with *Folder terlalu besar*. The call cap `MAX_SYNC_LIST_CALLS` is gone.
  - Per step the Worker also spends subrequests on the session and the database connection, so 40 leaves room under 50. R5 measures the real count.
- **R-2 — Thumbnail links.** `thumbnailLink` for public files works without OAuth today but is undocumented for API-key access. Slice 0 proves it. The fallback is `files.get?alt=media` for previews (full file; heavier) with `thumb` drawn from a downsized `preview`.
  - **Spike result (2026-10-05):** the Owner's public test folder (113 photos, flat) took 1 list call in 0.6 s, and `thumbnailLink` returned HTTP 200 `image/jpeg` from `*.googleusercontent.com` with the API key only. R-2 is closed; the fallback isn't needed. R-1's per-call cost is confirmed, but no 1,000+ photo tree was measured, so A-T1 stays an assumption.
- **R-3 — Drive API quota.** Quota is per API key: 12 000 queries per minute per project by default. Sync rate limit D-19 keeps the Owner's use low. With images served by Google (D-22) the key is used only for listing and the fallback. F-10 client traffic needs its own budget.
- **R-4 — `better-auth/crypto` as the hasher.** It is a vendor import, kept inside `adapters/crypto` behind `PasswordHasherPort`. If Better Auth changes the scrypt parameters, stored hashes still verify, because the parameters are encoded in the hash.
- **R-5 — Key rotation.** `password_key_version` exists, but rotating the key (re-encrypting) is a later ops task. Record it in ship notes.
- **Earlier SPEC GAP (2026-10-04):** none blocking. **A-T1** (the size limit and its copy) is the only new user-visible behaviour, flagged for the Owner in the plan report.
- **R-6 — CPU per request is unmeasured.** The 10 ms Workers Free limit applies to JS execution time, not I/O wait. Parsing and Zod-checking 3 000 directory entries, building the upsert for a step and the first render of the gallery page are the likely heavy spots. `SYNC_STEP_MAX_ENTRIES` (A-T3) is a guess until R5 measures it on a free preview. If a path stays over 10 ms, ADR-018 point 2 applies (a new ADR: Workers Paid, another host, or a lighter hash). **The Owner allowed the deploy on 2026-10-05**: a new Workers project on the free account already signed in from the terminal, or an existing one if a new one is refused.
- **R-7 — The Google image URL is undocumented.** If Google blocks or throttles `lh3.googleusercontent.com/d/<id>`, every image falls back to the D-10 route and the request budget shrinks (ADR-019). Rework slice R1's spike checks the URL on the Owner's test folder with and without a resource key; R5 re-checks it in the real-Drive smoke. A visible failure shows up as a rising share of `/api/w/…/gallery-photos/…` requests in the logs.
- **R-8 — Neon compute hours.** Each step opens a pooled connection and wakes the database. A normal 330-photo folder is one step. A sync of a huge tree is a few steps, so the cost is small next to browsing. ADR-018 point 4 watches the CU-hours.
- **R-9 — A-T3 and the cursor size.** The cursor holds `seen` file IDs for the run (about 45 bytes each), so a 20 000-photo run rewrites about 0.9 MB of JSON per step. This is rare and bounded; if it shows up in R5, `seen` moves to a short-lived table.
- **SPEC GAP (decided 2026-10-05, Owner):** media from Google (BR-ACC-005, C-103, AC-GAL-015) and the *earlier photos are kept* wording of the sync failure case (D-23) are amended in the owning artifacts before any code (C-011).
