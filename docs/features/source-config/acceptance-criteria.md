# Acceptance Criteria — Source configuration (F-04)

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## Seeding

## AC-SRC-001 — New workspace gets its Google Drive config
Covers: BR-SRC-005, ADR-016 (A-2)

**Given** a verified Owner
**When** they create a workspace (onboarding or the switcher)
**Then** the workspace has exactly one `GOOGLE_DRIVE` source config named *Google Drive*, active, with empty `configData`. If creating the workspace fails, no config exists either.

## AC-SRC-002 — Existing workspaces are backfilled
Covers: BR-SRC-005

**Given** workspaces created before F-04, with no source config
**When** the F-04 migration is applied
**Then** each has exactly one Google Drive config, and applying it again creates no duplicates.

## AC-SRC-003 — One config per provider
Covers: BR-SRC-005, C-003

**Given** a workspace that has its Google Drive config
**When** anything tries to insert a second `GOOGLE_DRIVE` config for it (including a concurrent seed)
**Then** the database rejects it and the workspace still has one.

## Page

## AC-SRC-004 — Sumber foto page
Covers: BR-SRC-002, BR-SRC-004, BR-WS-003 (A-1, A-3)

**Given** an Owner in their workspace
**When** they open *Sumber foto*
**Then** they see the Google Drive source card with status *Aktif* and the read-only statement, the setup guide, the public-link warning that anyone with the direct Drive link bypasses the gallery link and password, and the link checker. The nav item *Sumber foto* is active (the phone menu sheet shows it too), and no *Segera hadir* placeholder is shown.

## AC-SRC-005 — Old route and label are gone
Covers: A-1

**Given** an Owner in their workspace
**When** they look at the navigation, or open `/w/[workspaceId]/client-sources`
**Then** no item is labelled *Sumber klien*, and the old route shows *not found* (it was only ever a placeholder).

## AC-SRC-006 — Workspace isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** an Owner
**When** they open *Sumber foto* or submit a check for a workspace they don't own, or one that doesn't exist
**Then** they see *Workspace tidak ditemukan*, Drive isn't called, and no data from that workspace is returned.

## Link check

## AC-SRC-007 — Valid public folder
Covers: BR-SRC-002, BR-SRC-006, BR-GAL-007 (A-5)

**Given** a public Drive folder with 3 images and 1 PDF in the root, a child folder `Edited` with 2 images, a child folder `print` with 1 image and a nested folder inside it, and a child folder `raw` with 4 images
**When** the Owner checks its link
**Then** the result shows the folder name, PROOF 3, EDITED 2, PRINT 1, and 1 ignored folder; nested and unrelated files aren't counted, and nothing is written to the database.

## AC-SRC-008 — Empty root and missing delivery folders
Covers: BR-GAL-007

**Given** a public Drive folder with no images in the root and no `edited` / `print` child folders
**When** the Owner checks its link
**Then** the result succeeds with PROOF 0, EDITED 0, PRINT 0, a warning that the gallery would have no proof photos yet, and a hint that `edited` / `print` are added later for final delivery.

## AC-SRC-009 — Accepted link forms
Covers: BR-SRC-002 (A-4)

**Given** the link forms in A-4 (`/drive/folders/<id>`, `/drive/u/0/folders/<id>?usp=sharing`, `…?resourcekey=<key>`, `open?id=<id>`), with surrounding spaces
**When** they're parsed
**Then** each yields the same folder ID, and the resource key when present.

## AC-SRC-010 — Not a Drive folder link
Covers: C-004, C-006 (A-4)

**Given** an empty value, another host, `http://` or `www.` Drive URLs, a `/file/d/…` link, a Docs link, or a folder ID with invalid characters or length
**When** the Owner checks it (from the form or by calling the action directly)
**Then** a field error *Ini bukan tautan folder Google Drive* is shown and Drive isn't called.

## AC-SRC-011 — Private or missing folder
Covers: BR-SRC-002

**Given** a folder link that is private, not shared with *Anyone with the link*, or doesn't exist
**When** the Owner checks it
**Then** the result says *Folder tidak bisa dibaca* with the steps to share it publicly; no counts are shown.

## AC-SRC-012 — Link to a file, not a folder
Covers: BR-SRC-002

**Given** a well-formed folder link whose ID resolves to a file or a shortcut
**When** the Owner checks it
**Then** the result says the link must point to a folder; no counts are shown.

## AC-SRC-013 — Drive unavailable
Covers: C-007 (A-7)

**Given** Drive returns a server error, the quota is exhausted, or the check exceeds 10 seconds
**When** the Owner checks a link
**Then** a retryable error *Google Drive sedang tidak bisa dihubungi* is shown with *Coba lagi*, the link stays in the field, and retrying runs the check again.

## AC-SRC-014 — Rate limit
Covers: C-006 (A-6)

**Given** an Owner who has made 20 checks in the current 10-minute window
**When** they check another link
**Then** they see *Terlalu banyak pengecekan* with when they can try again, Drive isn't called, and the limit applies across all their workspaces.

## AC-SRC-015 — Large folders
Covers: A-5

**Given** a public folder with more than 2,000 images in the root
**When** the Owner checks its link
**Then** PROOF shows *2.000+* and the check still finishes within the A-7 budget.

## Security

## AC-SRC-016 — Secrets and links stay on the server
Covers: BR-SRC-003, C-103

**Given** any check, successful or failed
**When** the response, the rendered page and the server logs are inspected
**Then** none contains the API key, the pasted link, the folder ID, the resource key, file names, file IDs or Drive URLs; logs contain only the workspace ID and the outcome code.

## AC-SRC-017 — Provider-agnostic domain
Covers: BR-SRC-001

**Given** the F-04 code
**When** the domain and application layers are inspected (lint boundaries)
**Then** they depend on `GallerySourceProvider` and their own types only; Drive types and HTTP calls live only in the Drive adapter.

## Accessibility & states

## AC-SRC-018 — States and accessibility
Covers: C-007, C-008

**Given** the *Sumber foto* page at desktop and phone widths, light and dark
**When** the Owner uses the checker with the keyboard only
**Then** every state in the spec's UI States is reachable, the field error is linked to the field, the result and errors are announced by a live region, the button shows a pending state while checking, and axe (wcag2a/2aa/21a/21aa) reports no violations.
