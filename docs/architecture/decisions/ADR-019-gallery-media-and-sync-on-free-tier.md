# ADR-019: Gallery sync in small steps, images straight from Google, cached by gallery version

Status: Accepted (Owner, 2026-10-05), including the media trade-off in Consequences. C-103 (v1.2), BR-ACC-005, BR-SRC-003 and AC-GAL-015 are amended. Point 5's Cache API part belongs to F-10; F-09 only adds `content_version`. Point 6 stays deferred.
Date: 2026-10-05
Amends, once accepted: F-09 technical design D-7 (sync walk), D-10 (Owner media route) and R-1; the media part of C-103 / AC-GAL-015 needs an Owner decision (see Consequences).

## Context
[ADR-018](ADR-018-free-tier-runtime-budget.md) targets Workers Free: 50 subrequests and 10 ms CPU per request, 100,000 requests a day. F-09 as built:
- walks a Drive folder tree in one request with up to 300 list calls (D-7), which can exceed 50 subrequests;
- serves every thumbnail and preview through the Worker (`/api/w/[ws]/gallery-photos/[id]/[size]`, D-10), so one view of a 300-photo gallery costs 300 Worker requests;
- rewrites every `gallery_photo` row on each sync (`last_seen_at` upsert), which doubles the table on disk and adds Neon history.

Fastpik, a competing product, was inspected on the Owner's own project on 2026-10-05:
- Its client page lists the Drive folder live (`/api/photos?gdriveLink=…&detectSubfolders=true`).
- It loads every image straight from `lh3.googleusercontent.com/d/<fileId>=w600`, so its servers carry no image traffic.
- It also sends the Drive folder link itself to the browser, which lets a client open the folder and bypass the gallery's password and expiry.

The Slice 0 spike (2026-10-05) listed 113 photos in 1 call and fetched a thumbnail with the API key only.

## Decision (proposed)
1. **Sync in small steps.**
   - Each sync request does at most `MAX_LIST_CALLS_PER_STEP = 40` Drive list calls, leaving room for other subrequests.
   - The folders still to read are stored with the source.
   - The browser calls the step action again until the source is done, showing *Menyinkronkan… n dari m folder*.
   - The overall photo cap A-T1 is no longer needed for the subrequest limit; keep a soft cap only if the Owner wants one.
2. **Write only what changed.**
   - A sync inserts new files and updates rows whose name or path changed.
   - It marks missing files with one set-based statement, instead of upserting every row.
   - `last_seen_at` is replaced by a sync-run marker on the source.
3. **Images straight from Google, with a fallback.**
   - Thumbnails and previews use `https://lh3.googleusercontent.com/d/<externalFileId>=w<size>` (for example `w600` for tiles, `w1600` for the preview).
   - If an image fails to load, it falls back to the existing media route.
   - This URL form is undocumented by Google, so the fallback stays.
4. **Never send the folder link to a browser.**
   - Client and Owner pages receive only file IDs of photos they may see (BR-GAL-007: no `EDITED`/`PRINT` before delivery).
   - The Drive folder URL and folder ID stay on the server.
5. **Cache the client gallery by version.**
   - F-10's client gallery data (the photo list JSON) is cached with the Workers Cache API, keyed by `galleryId` + `contentVersion`.
   - `contentVersion` increments on sync, publish, expiry change, password rotation, source removal and archive, so stale entries are never read.
   - Owner pages stay `private, no-store`.
   - Whether Cache API calls count toward the free subrequest limit must be checked before building this.
6. **Retention cleanup, deferred.** These are recorded but not built:
   - delete photos missing for more than 30 days;
   - delete the photo rows of galleries archived more than 6 months ago, keeping their counts on `gallery`.

   Build them when storage passes ~800 MB (ADR-018 point 4). Both need an Owner decision first, because the second changes AC-GAL-022.

## Alternatives considered
- **No sync, list Drive live on every view (Fastpik's way).** It fits the free plan and is always fresh, but it loses kind counts, cross-folder search, missing-photo detection and the stable photo records F-11 (selection) and F-12 (delivery) need. Rejected.
- **Keep proxying images through the Worker.** Keeps photo IDs private after expiry, but costs one Worker request per image. Rejected for galleries; kept as the fallback.

## Consequences
- A 300-photo gallery view costs 1–2 Worker requests instead of ~300. Sync fits 50 subrequests for any folder size.
- `gallery_photo` stays near its data size (~0.75 KB a photo) instead of ~2×.
- **Trade-off on media privacy:** a client who has seen a photo can keep its `lh3` URL after the gallery expires or the password changes. The files are already public on Drive (BR-SRC-004), so this mostly affects expiry. C-103 and AC-GAL-015 currently say media is Owner-only; accepting this ADR needs the Owner to accept the trade-off and amend them.
- **Dependency on an undocumented Google URL:** if Google blocks or rate-limits it, every image falls back to the media route and the request budget shrinks (ADR-018).
- Implementation is F-09 rework (sync use case, `use-gallery-sync`, photo tiles and preview) plus F-10 caching. Plan it with `/sdv:plan-feature` after acceptance.

## Related
- ADR-008, ADR-018
- F-09 technical design D-7, D-10, R-1, R-2, R-3; Slice 0 spike record in the F-09 plan
- BR-GAL-007, BR-SRC-004, C-103, AC-GAL-015, AC-GAL-022
