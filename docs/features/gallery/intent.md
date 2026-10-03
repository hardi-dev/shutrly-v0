# Intent: Gallery (Owner side)

Author: Owner (hardi-dev)
Source: IDEA
Status: DRAFT

## Problem
A project already exists, but the Owner has no way to attach the photos to it. Photos live in the Owner's Google Drive, and today the Owner would still share folders by hand and track what is in them in their head. Without a gallery there is nothing for a client to open (F-10), select from (F-11) or receive as final files (F-12). This feature is on the primary journey ("links a Drive folder and publishes a gallery", `docs/product/overview.md`) and is the next dependency for J-04.

## Proposed outcome
From a project, the Owner can create one private gallery, link one or more Google Drive folders to it, and see the photos Shutrly found in those folders, grouped by kind (proof, edited, print). The Owner can re-sync at any time without duplicating photos and sees when each source last synced and whether it failed. The Owner sets the gallery password, publishes the gallery once it is ready, and can rotate the password or archive the gallery later. The Owner can check what a client will see before sharing anything.

## Affected users and systems
- Owner: new Gallery card on the project detail page (F-07), plus a gallery management screen with sources, photos by kind, sync status, password and publish/archive actions.
- Workspace source configuration (F-04): gallery sources are created from an active workspace source.
- Google Drive provider integration: reading folder metadata only, through the provider interface.
- Downstream features that depend on this one: F-10 (client access), F-11 (selection), F-12 (final delivery), F-15 (sharing).

## Constraints
- One gallery per project; the gallery owns no files, only metadata references to external files (BR-GAL-001).
- Password is required and stored only as a hash. Plaintext is accepted only at setup, rotation and share re-entry (BR-GAL-002, BR-GAL-003, constitution secrets rules).
- Publishing needs a password hash and at least one active, accessible source (BR-GAL-004). Lifecycle is `DRAFT → PUBLISHED → EXPIRED | ARCHIVED` (BR-GAL-005).
- Sync is idempotent and records status, time and error (BR-GAL-006). Folder classification follows BR-GAL-007.
- Provider access goes through the provider interface, the API key stays server-side, and direct Drive links are never exposed to clients (BR-SRC-*, BR-ACC-005).
- Every gallery and photo read is scoped to the workspace (BR-WS-002).
- UI is Indonesian and follows the approved design system.

## Out of scope
- The client-facing view, token and password entry, rate limits and media delivery (F-10).
- Selection groups, limits, quantities and submission (F-11).
- Final delivery of edited/print files (F-12). The folders are classified and synced here, but publishing them for download is not.
- WhatsApp sharing, including the *Kirim link galeri* menu item and message preview (F-15, F-10).
- Providers other than Google Drive.
- Uploading or storing photo files in Shutrly.

## Open questions
- **SPEC GAP (already recorded in BR-SRC, deferred to this discovery):** do gallery sources under a deactivated workspace source keep syncing, and do they count as *active* for BR-GAL-004?
- Is sync started only by the Owner, or also automatically (on link, on a schedule)? Drive API quota and Cloudflare Workers limits may decide this.
- What does "accessible" mean for a source (BR-GAL-004): the folder link resolved on the last sync, or checked again at publish time?
- When a file disappears from Drive between syncs, is the photo removed, hidden or kept as missing? Selections (F-11) will reference photos.
- Is the gallery created with its password at the same moment, or as a draft that gets a password before publishing? BR-GAL-002 says every gallery has a password.
- Which `expiresAt` options does the Owner get (none, a date, a default)? BR-GAL-005 requires it be honored but no rule sets it.
- Which project statuses may have a gallery, including `DRAFT` and `CANCELLED` projects?
