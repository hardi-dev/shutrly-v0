# Technical Design — Gallery (F-09)

Status: DRAFT (2026-10-04) · Plan: [plan.md](plan.md)

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
- **Design:** [design.md](design.md) (APPROVED 2026-10-04), [exports/_compact/INDEX.md](exports/_compact/INDEX.md). Component specs: `docs/design-system/components/photo-tile.md`, `folder-tile.md`, `media-viewer.md`.

## Decisions

| ID | Decision | Why |
|---|---|---|
| D-1 | **Status:** stored `status` ∈ `DRAFT`, `PUBLISHED`, `ARCHIVED`. `EXPIRED` is derived when read: `PUBLISHED` and `expires_at <= now` (A-7). | Expiry needs no job, and re-opening only changes `expires_at`. Every reader calls the domain `effectiveGalleryStatus(row, now)`. |
| D-2 | **Expiry columns:** `expires_at timestamptz null` and `expiry_days int null`, never both. `expiry_days` is kept only on a draft; publish turns it into `expires_at` = publish time + days (BR-GAL-005, AC-GAL-018). On a published or expired gallery, saving a duration writes `expires_at` = now + days directly. A date expires at 23:59:59.999 of that day in `Asia/Jakarta` (A-4, the same single MVP zone as F-07's `PROJECT_SCHEDULE_TIME_ZONE`, kept as a gallery-domain constant). | Matches the spec's two kinds of expiry and keeps the readers simple. |
| D-3 | **Password storage (ADR-017):** <ul><li>`password_ciphertext`, `password_iv` and `password_key_version` hold AES-256-GCM output, base64url.</li><li>The AAD is `gallery:<workspaceId>:<galleryId>`, so a ciphertext can't be moved to another row.</li><li>`password_hash` comes from `better-auth/crypto` `hashPassword` (scrypt, already proven on Workers by F-01) and sits behind a `PasswordHasherPort`.</li><li>`password_version` starts at 1.</li></ul> | Uses Web Crypto and a hash already running on the target runtime. F-10 verifies against the hash and never decrypts. |
| D-4 | **Password generator:** a pure domain function `generateGalleryPassword(random, clientName)` builds `<word>-<4 digits>` (A-11). <ul><li>The word comes from a fixed list of about 200 common lowercase Indonesian words, 4–8 letters, using only `a–z`.</li><li>The digits are 2–9, so no `0`/`1` that look like `O`/`l`.</li><li>A word equal to any word of the client name (case-insensitive) is redrawn.</li><li>Randomness comes in through `RandomIntPort`, backed by `crypto.getRandomValues`.</li></ul> | Easy to type and testable without randomness. |
| D-5 | **Generated proposals come from the server.** The create and rotate dialogs call a `proposeGalleryPasswordAction`, so the word list and randomness stay server-side, and *Buat ulang* calls it again. The Owner may type their own password instead; the server validates 6–64 characters after trim (BR-GAL-002). | One authority (C-004). The list never ships to the browser. |
| D-6 | **Drive provider (ADR-005):** `GallerySourceProviderPort` with `listFolder(folder, pageToken)` and `thumbnail(file, size)`. The Google adapter calls Drive v3 `files.list` with: <ul><li>`q='<id>' in parents and trashed=false`;</li><li>`pageSize=1000`;</li><li>`fields=nextPageToken,files(id,name,mimeType,resourceKey,shortcutDetails/targetId)`;</li><li>`key=<GOOGLE_DRIVE_API_KEY>`;</li><li>the header `X-Goog-Drive-Resource-Keys: <id>/<key>` when a resource key exists.</li></ul> Errors map to `NOT_PUBLIC` (403/404), `RATE_LIMITED` (429, or 403 `rateLimitExceeded`/`userRateLimitExceeded`) and `UNAVAILABLE` (5xx or network). Neither the URL nor the key ever appears in an error message. | The domain never sees Drive types (BR-SRC-001). |
| D-7 | **Sync is a breadth-first walk** from the source root, with depth ≤ 5 below it (A-14). <ul><li>Shortcuts are skipped (A-14).</li><li>Non-image files count as ignored (A-9).</li><li>Folders deeper than 5 are counted as `too_deep_count` and not opened.</li><li>The walk stops with `TOO_LARGE` after `MAX_SYNC_LIST_CALLS = 300` list calls or `MAX_SYNC_PHOTOS = 10 000` images, and the source keeps its earlier photos.</li><li>`classifyPhoto(pathSegments)` is pure. The nearest ancestor named `edited` / `print` (case-insensitive) decides the kind (BR-GAL-007), and `browse_path` is the path with that one segment removed (the folding in Main flow 5).</li></ul> | 300 calls stay well inside the Workers paid-plan subrequest limit, and the listing is I/O wait rather than CPU. The limits are named constants (coding rules › General). See Risks R-1. |
| D-8 | **Sync has two phases.** <ol><li>**Claim, in a short transaction.** `UPDATE gallery_source SET sync_status='SYNCING', sync_started_at=now() WHERE id=? AND workspace_id=? AND removed_at IS NULL AND (sync_status<>'SYNCING' OR sync_started_at < now() - interval '10 minutes') RETURNING …`. With no row, the result is `SYNC_IN_PROGRESS` (or `NOT_FOUND`).</li><li>**List Drive** outside any transaction.</li><li>**Write, in one transaction:** <ul><li>re-check the gallery is not archived and its project not cancelled;</li><li>upsert the photos in chunks of 500 with `ON CONFLICT (gallery_source_id, external_file_id) DO UPDATE` (name, kind, paths, resource key, `missing_at = null`, `last_seen_at = $syncStartedAt`);</li><li>mark `missing_at = now()` where `last_seen_at < $syncStartedAt` and `missing_at is null`;</li><li>write the counts and `SUCCEEDED`.</li></ul></li></ol> On a provider failure only the status, `sync_error_code` and `last_sync_attempt_at` change. | Idempotent (AC-GAL-006): the unique key prevents duplicates, and a concurrent second sync is refused (C-005). A crashed sync unlocks itself after 10 minutes. |
| D-9 | ***Sinkronkan semua*** is driven by the client: the UI calls `syncGallerySourceAction` once per active source, in order, and shows each result. | Each source gets its own request budget, and one failure never rolls back another (AC-GAL-012). |
| D-10 | **Owner media endpoint:** `GET /api/w/[workspaceId]/gallery-photos/[photoId]/[size]` with `size` ∈ `thumb` (`s400`) or `preview` (`s1600`). <ol><li>It verifies the Owner and workspace (C-101), then loads the photo scoped by workspace.</li><li>The adapter calls `files.get?fields=thumbnailLink` with the key, checks that the host ends with `.googleusercontent.com`, swaps the `=s220` suffix for the size, fetches it and streams the bytes back.</li><li>The response carries `Content-Type` from upstream (images only), `Cache-Control: private, max-age=600` and `X-Content-Type-Options: nosniff`.</li><li>A missing photo, a non-image or any upstream failure gives 404 with no body detail.</li></ol> | No key or Drive URL reaches the browser (BR-SRC-003, AC-GAL-015). `private` keeps it out of shared caches (C-103), and the short browser cache keeps grid scroll-back cheap; the spec left caching to this design. F-10 reuses the core use case behind token and password checks. |
| D-11 | **"Buka di Google Drive"** links are built server-side for the Owner only: `https://drive.google.com/file/d/<id>/view` plus `?resourcekey=` when the file has one. They are returned only in the Owner photo DTO and never for a missing photo. | BR-SRC-003 covers client responses. Owner pages are private. |
| D-12 | **Browsing reads** (the `GalleryBrowseReaderPort`), all scoped by workspace and gallery, with visible photos only (source not removed). Missing photos are shown to the Owner with the *Hilang* badge. <ul><li>**Counts per kind:** `count(*) filter (where …)`.</li><li>**One folder level:** for kind K and folder prefix P (source id + `browse_path` prefix), the direct child folder names with their recursive photo counts (via `split_part` on the remaining path), then a page of the photos directly in P.</li><li>**Search:** `file_name ILIKE '%' || escaped || '%'` across the gallery and all kinds.</li><li>**Order and paging:** `name_sort_key, id`, 48 per page (A-13), keyset cursor `(name_sort_key, id)`.</li><li>**Top level:** with more than one source it is one folder tile per source; with one source the reader starts inside it (AC-GAL-028).</li></ul> | Few thousand rows per gallery, so `(gallery_id, kind, gallery_source_id, browse_path, name_sort_key)` covers it and no trigram index is needed. |
| D-13 | **Natural file-name order (A-5):** `name_sort_key` is computed in the domain. It lowercases the name and left-pads every digit run to 10 digits, so `IMG_2` sorts before `IMG_10`. | Plain `ORDER BY` in SQL, testable in the domain. |
| D-14 | **Project facts come through a gallery port.** `GalleryProjectPort.lockForGallery(context, projectId)` returns `{ status, title, clientName }` with `SELECT … FOR SHARE` inside the gallery write transaction. It is implemented in the gallery repository adapter, which reads `project` and `client` directly. | `features/gallery` can't import `features/booking`. Sharing the lock blocks a concurrent cancel, which takes `FOR UPDATE`, so a gallery can't be created or published on a project being cancelled. |
| D-15 | **Cancel → archive (BR-PRJ-010, ADR-016):** a new composition scope `withProjectCancellationScope` opens `db.transaction` and builds both the project repository and the gallery repository over `tx`. `cancelProjectEntry` runs `cancelProject`; when it succeeds it runs `archiveGalleryOfCancelledProject`, which archives a `PUBLISHED` gallery (including an expired one) with the actor and time and leaves a `DRAFT` one. A throw in either rolls back both (AC-GAL-024). `withLockedProject` nested inside `tx` becomes a savepoint. | This is the ADR-016 pattern, with no new ADR needed. |
| D-16 | **Galeri card slot:** `ProjectDetailScreen` gains an optional `galleryCard: ReactNode` prop, rendered right after `ProjectInfoCard`. The route page loads the gallery summary through `composition/gallery` and passes `<GalleryCard …/>` in. | Keeps `features/booking/ui` free of gallery imports (boundaries lint). |
| D-17 | **New shared UI units** (design C46–C48, used by F-10/F-11): <ul><li>`src/ui/patterns/photo-tile` (Default, Missing, Skeleton);</li><li>`src/ui/patterns/folder-tile`;</li><li>`src/ui/patterns/media-viewer`, a React Aria `ModalOverlay` with the filmstrip, ←/→, Home/End and Esc;</li><li>Modal `size="xl"` (width up to `--size-content-max`, height viewport − 80; design.md › Findings).</li></ul> | Features never hand-roll dialogs (coding rules). The token set already exists (623 tokens). |
| D-18 | **Audit (BR-AUD-001):** rotation writes `password_changed_at` / `password_changed_by`; archive writes `archived_at` / `archived_by`; source removal writes `removed_at` / `removed_by`. | Same column-based audit as F-07's cancellation. |
| D-19 | **Rate limit:** sync and media are Owner-only. Sync is limited to 20 starts per workspace per minute through the existing Neon fixed-window limiter. The gallery declares its own `GalleryRateLimiterPort`, and composition passes the same `createNeonRateLimiter` object. Media requests aren't limited in F-09; they sit behind the Owner session. | Architecture › Security lists sync; F-10 adds the public limits (BR-ACC-004). |

## Database Changes

One migration, `0010_gallery`, generated by drizzle-kit. It is additive only, so it is safe on the shared non-production database. Schema file: `src/adapters/db/schema/gallery/gallery.ts`.

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
| `linkGallerySourceAction(ws, galleryId, values)` | `linkGallerySource` (creates, then syncs once) | 005, 008–011 |
| `checkFolderInUseAction(ws, galleryId, link)` | `findFolderUse` (the warning before confirming) | 010 |
| `syncGallerySourceAction(ws, sourceId)` | `syncGallerySource` | 006, 007, 012 |
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
| `sync-plan` | `walkFolderTree(listFolder, root)`: a pure async walker over an injected listing function. It returns photos, an ignored count, a too-deep count, or `TOO_LARGE`. |

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
- `link-gallery-source`, `find-folder-use`, `sync-gallery-source`, `remove-gallery-source`;
- `publish-gallery`, `set-gallery-expiry`, `rotate-gallery-password`, `archive-gallery`, `delete-draft-gallery`, `archive-gallery-of-cancelled-project`;
- `browse-gallery-photos`, `serve-owner-photo`.

*Schemas:* `create-gallery`, `gallery-expiry`, `gallery-password`, `link-gallery-source` and `browse-query`. Each is shared by its form and its action.

*Rules:*
- Every mutation locks the gallery row (`FOR UPDATE`) and the project row (`FOR SHARE`, D-14), and decides from the stored state, never from client input (C-004).
- **Publish:**
  - loads the active sources;
  - calls `provider.listFolder(root, first page)` for each, outside the lock;
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
- **Thumbnails:** plain `<img loading="lazy">` on the Owner endpoint. Never `next/image`, whose optimiser would cache publicly.
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
| Concurrent sync (AC-GAL-006) | Claim with a conditional `UPDATE … RETURNING` (D-8), plus the unique `(gallery_source_id, external_file_id)`. |
| Sync vs archive or remove | The write phase re-locks and re-checks the state, and discards its listing if the gallery or source changed. |
| Publish vs remove source | Both lock the gallery row, and publish re-counts active sources inside the lock. |
| Create, publish or sync vs project cancel (AC-GAL-024) | Gallery writes take the project `FOR SHARE`; cancel takes `FOR UPDATE` and archives in the same transaction (D-14, D-15). |
| Link the same folder twice concurrently | The partial unique index; 23505 maps to `FOLDER_ALREADY_LINKED`. |

## Security

- **Owner checks:** every action and the media route verify the Owner and workspace. Every query filters by `workspace_id`, and tenant FKs stop cross-workspace references (C-101, AC-GAL-025).
- **Secrets:** both are Worker secrets, read only through `AppEnv` (no `process.env`) and passed to adapters by composition.
- **Password exposure:** the plaintext reaches only the Owner's gallery page and the Owner's own actions. The ciphertext never leaves the adapter (C-103).
- **Drive data in responses:** Owner responses carry only `id`, file name, kind, paths, `missing` and the Owner-only Drive file link. Folder IDs and resource keys stay server-side; the source row shows the label or folder name.
- **Media proxy:** host allowlist, an image content-type check, no redirects followed to other hosts, `private` cache.

## Testing Strategy

Test names start with the AC or BR ID.

| Level | What | AC |
|---|---|---|
| Domain unit | status guards and the derived `EXPIRED`; expiry resolution (dates in Asia/Jakarta, duration on publish); password rules and the generator (word list, digits, client-name redraw); link parser cases; classification at any depth plus folding; natural sort; tree walker (depth 6 skipped, shortcuts, ignored, `TOO_LARGE`) with a fake lister | 002, 005, 009, 018–020, 022, 024, 028, 030 |
| Application unit | each use case with fake ports: state refusals, publish with one of two sources failing, rotation increments the version, propose redraws | 001, 003, 013, 016, 017, 021–023 |
| Adapter unit | Google Drive adapter with a mocked `fetch` (query, headers, error mapping, no key in errors); Web Crypto cipher round-trip, wrong AAD fails, ciphertext differs per call; media proxy host allowlist | 008, 015, 027 |
| Integration (shared non-prod DB, own workspace per test) | schema constraints; create race (two creates → one gallery); concurrent sync of one source → 8 photos; missing and back; cancel archives in one transaction, and a forced failure rolls back both; cross-workspace reads, writes and media → not found; the stored password is never plaintext | 001, 004, 006, 007, 024, 025, 027 |
| UI unit (dom) | `PhotoTile`, `FolderTile`, `MediaViewer` keyboard (←/→/Home/End/Esc); dialogs' field errors; card states | 002, 014, 026, 031 |
| E2E (Playwright + axe) | project → *Buat galeri* → link folder (Drive faked through a test-only provider switch, as F-01's `E2E_EMAIL_CAPTURE`) → sync → *Semua foto* → preview → publish → archive; keyboard-only and axe on every dialog | 001, 005, 014, 016, 022, 026, 028–031 |

**Drive in tests:**
- Unit and integration tests use a fake `GallerySourceProviderPort`.
- E2E uses `E2E_FAKE_DRIVE=1` (development stage only, refused in production by `appEnvSchema`). Composition then wires a fixture provider that serves the AC fixture tree and sample JPEGs from `tests/fixtures/drive/`.
- A manual smoke test against real Drive with the Owner's non-production key is part of Slice 0 and Slice 8.

## Implementation Iterations

See [plan.md](plan.md): Slice 0 (base and spike) and Slices 1–8, each with a **Read first** list and a done check.

## Risks / Open Questions

- **R-1 — Sync size on Workers.**
  - The limits `MAX_SYNC_LIST_CALLS = 300` and `MAX_SYNC_PHOTOS = 10 000` are an engineering assumption (**A-T1**, reversible). A source above them fails with *Folder terlalu besar*, and the spec doesn't name this case. Slice 0's spike measures a real 2 000-photo tree.
  - If a real shoot hits the limit, the fallback is a resumable sync: store a cursor and let the client call again until done. That would be a SPEC change, so it goes to the Owner first.
  - The limits assume the Workers paid plan. Check the plan before ship.
- **R-2 — Thumbnail links.** `thumbnailLink` for public files works without OAuth today but is undocumented for API-key access. Slice 0 proves it. The fallback is `files.get?alt=media` for previews (full file; heavier) with `thumb` drawn from a downsized `preview`.
- **R-3 — Drive API quota.** Quota is per API key: 12 000 queries per minute per project by default. Sync rate limit D-19 and the browser cache D-10 keep the Owner's use low. F-10 client traffic needs its own budget.
- **R-4 — `better-auth/crypto` as the hasher.** It is a vendor import, kept inside `adapters/crypto` behind `PasswordHasherPort`. If Better Auth changes the scrypt parameters, stored hashes still verify, because the parameters are encoded in the hash.
- **R-5 — Key rotation.** `password_key_version` exists, but rotating the key (re-encrypting) is a later ops task. Record it in ship notes.
- **SPEC GAP:** none blocking. **A-T1** (the size limit and its copy) is the only new user-visible behaviour, flagged for the Owner in the plan report.
