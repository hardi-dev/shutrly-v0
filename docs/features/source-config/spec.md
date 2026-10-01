# Feature: Source configuration (Google Drive)

ID: F-04 · Slug: `source-config`
Status: SPECIFIED (2026-10-01) · Journeys: none directly; prepares J-04 and J-06 (F-09 gallery sources)
Consumer: F-09 `gallery` (the config row, the provider interface and the Drive adapter)

## Goal
Each workspace has its Google Drive source ready. The Owner learns how to prepare a Drive folder, sees the public-link warning, and can check a folder link before a gallery needs it. The provider interface and the read-only Drive adapter are proven before F-09 builds sync on them.

## User Story
As a photographer (Owner), I want to know how to share my Drive folders and to check that a folder link works, so that linking a gallery later just works and I understand what a public link means for my clients' photos.

## Preconditions
- F-02 Workspace (DONE): verified `WorkspaceContext`, App Shell, workspace creation.
- F-17 App Shell (DONE): the nav slot `client-sources` (*Sumber klien*, `share-2` icon), currently a *Segera hadir* placeholder. F-04 renames it (A-1).
- ADR-016: workspace creation and seeding share one transaction, opened in composition.
- A platform Google Cloud API key with the Drive API enabled, held as a server secret (ADR-005, BR-SRC-003). Non-production: in `.dev.vars` / `.env.test`, provided by the Owner.
- Actor: a signed-in, verified, active Owner inside a workspace they own (BR-WS-003).

## Inputs
| Screen | Fields |
|---|---|
| Sumber foto | Drive folder link (single-line URL) · *Cek tautan* |

There is nothing to configure: the Drive config has no editable fields (BR-SRC-005).

## Main Flow — check a folder link
1. Owner opens *Sumber foto*. The server verifies the workspace. The page shows:
   - the Google Drive source card: provider, status *Aktif*, and that Shutrly only reads file lists and never uploads, changes or deletes anything in Drive (BR-SRC-002);
   - a short setup guide (A-3);
   - the public-link warning (BR-SRC-004);
   - the link checker.
2. Owner pastes a Drive folder link and selects *Cek tautan*.
3. The server parses the link (A-4). It extracts the folder ID and the optional resource key.
4. Through the `GallerySourceProvider` interface, the Drive adapter reads the folder's public metadata with the platform API key: the folder name, image files in the root, and image files directly in child folders named `edited` / `print`, matched case-insensitively (BR-GAL-007).
5. The page shows the result: the folder name, and the counts of PROOF, EDITED and PRINT images (A-5). Nothing is stored (BR-SRC-006).

## Alternative Flows
- **Public folder with no images in the root:** the result is shown with a warning that the gallery would have no proof photos yet. This isn't an error; the folder can still be used once filled.
- **No `edited` / `print` folder:** counts are 0 with a hint that these folders are created later, for final delivery (J-06).
- **Other folders and deeper nesting:** ignored and not counted (BR-GAL-007). The result says how many child folders were ignored (A-5).
- **New workspace:** created with its Google Drive config in the same transaction (BR-SRC-005, ADR-016).
- **Existing workspaces:** a data migration backfills the config for every workspace that lacks it. Only the Owner applies migrations (AGENTS.md).

## Error Cases
- Empty field, or not a Drive folder link (another host, a file link `/file/d/…`, a Docs link, malformed URL) → field error *Ini bukan tautan folder Google Drive*; Drive isn't called.
- The folder doesn't exist or isn't shared with *Anyone with the link* → result error *Folder tidak bisa dibaca* with steps to fix the sharing. The Drive API can't tell these two apart with an API key, so the message covers both.
- The link points to a file or a shortcut, not a folder → result error that it must be a folder link.
- Drive is unavailable, times out or the platform quota is exhausted → retryable error *Google Drive sedang tidak bisa dihubungi* with *Coba lagi*; the link stays in the field (C-007).
- Too many checks → *Terlalu banyak pengecekan*, with when to try again (A-6).
- Client bypasses the form → same parsing and validation on the server (C-004, C-006).
- Workspace not owned / not existing in URL → *not found*, no data (BR-WS-003, ADR-015). A workspace ID in the body is never trusted.

## Security & privacy (C-006, C-103, BR-SRC-003)
- The API key is read only by the Drive adapter on the server; it never appears in a response, page, log or error.
- The pasted link, the folder ID and the resource key are never logged and never stored. Logs carry the workspace ID and the outcome code only.
- Drive's raw error bodies and URLs are not passed to the browser; the adapter maps them to the outcome codes above.
- The result returns no file names, file IDs or Drive URLs, only the folder name and counts.

## Provider contract for F-09 (application port)
F-04 ships `GallerySourceProvider` with one operation, `inspectFolder(reference) → FolderInspection | ProviderError`, and its Google Drive adapter. F-09 extends the port with file listing for sync. The domain and application layers never import Drive types (BR-SRC-001). Link parsing (`parseDriveFolderLink`) is a pure domain function F-09 reuses when the Owner attaches a gallery source.

## UI States (C-007)
Page: loading, ready. Checker: idle, field error, checking (button pending, field read-only), result (success, success with an empty-root warning), provider error (retryable), rate-limited. Results are announced to screen readers (C-008).

## Business Rules
- BR-SRC-001 — provider-agnostic sources (the port; no Drive types in domain)
- BR-SRC-002 — public links, read-only metadata
- BR-SRC-003 — the API key and Drive links never reach clients
- BR-SRC-004 — public-link warning
- BR-SRC-005 — one Google Drive config per workspace, seeded and backfilled
- BR-SRC-006 — the link check reads and stores nothing
- BR-GAL-007 — folder classification (used by the counts)
- BR-WS-002, BR-WS-003 — tenant isolation, verified workspace context
- Constitution: C-003, C-004, C-006, C-007, C-008, C-101, C-103
- ADR-003, ADR-005, ADR-015, ADR-016

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Nav label and route (Owner 2026-10-01):** the slot *Sumber klien* becomes *Sumber foto*, slug `photo-sources` (`/w/[workspaceId]/photo-sources`), same position and `share-2` icon. *Sumber klien* read as "client acquisition source". The shell, its tests and the library nav label change with it.
- **A-2 Config record:** provider `GOOGLE_DRIVE`, display name *Google Drive*, `configData` `{}`, active. Unique per (workspace, provider).
- **A-3 Setup guide (Indonesian, reviewed in design):** one root folder per project; proofs go directly in the root; `edited` and `print` subfolders are added later for final delivery; share the root as *Siapa saja yang memiliki link — Pelihat*; copy the folder link.
- **A-4 Accepted link forms:** `https://drive.google.com/drive/folders/<id>`, with or without `/u/<n>/`, query strings such as `?usp=sharing`, and an optional `resourcekey`; and `https://drive.google.com/open?id=<id>`. Leading/trailing spaces are trimmed; `http`, a missing scheme and `www.` are not accepted (they aren't what Drive's *Copy link* produces). Folder IDs are 10–100 characters of `[A-Za-z0-9_-]`.
- **A-5 Counting:** images are files whose MIME type starts with `image/`; trashed files, shortcuts and other files are ignored. Counts are exact up to 2,000 per folder; beyond that the result shows *2.000+*. Ignored child folders are counted, not named.
- **A-6 Rate limit:** 20 checks per Owner per 10 minutes, a fixed window, server-side. Protects the platform Drive quota.
- **A-7 Timeout:** the whole check has a 10-second budget; exceeding it is the retryable provider error.
- **A-8 No history:** previous checks aren't kept; reloading the page clears the result.

## Dependencies
- F-02 Workspace: `WorkspaceContext`, App Shell, workspace creation (seeding hooks into its transaction per ADR-016).
- F-17 App Shell: the nav slot (renamed by A-1).
- F-09 Gallery: consumes the config row, `GallerySourceProvider`, the Drive adapter and `parseDriveFolderLink`.
- Owner: a Google Cloud API key with the Drive API enabled for dev/test, and later for production (ship blocker).

## Out of Scope
- Adding, renaming, deactivating or deleting source configs; other providers (BR-SRC-005, scope.md).
- Owner OAuth, service accounts, private folders, creating folders or uploading (BR-SRC-002, ADR-005).
- Attaching a link to a gallery, storing sources, syncing photos, thumbnails or media delivery (F-09, F-10).
- Listing file names or previewing photos in the checker.
- Detecting whether a folder is shared as *Pelihat* vs *Editor*; the Drive API with an API key can't see it. The guide covers it.

## Open Questions / SPEC GAPS
- None blocking. A-1 changes the F-17 nav label: the F-17 spec carries a dated note, and the library label is updated in `/sdv:design-feature source-config`.
- **Ship blocker (new):** a production Google Cloud API key, restricted to the Drive API, must exist before the first ship that includes F-04.
- For design: `/sdv:design-feature source-config` needs frames for the page (source card, guide, warning, checker in each state), desktop and phone, as HTML exports (AGENTS.md).
