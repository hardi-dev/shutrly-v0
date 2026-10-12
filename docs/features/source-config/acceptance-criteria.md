# Acceptance Criteria — Source configuration (F-04)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## Seeding

## AC-SRC-001 — New workspace gets a Google Drive source
Covers: BR-SRC-005, ADR-016 (A-2)

**Given** a verified Owner
**When** they create a workspace (onboarding or the switcher)
**Then** the workspace has exactly one source: `GOOGLE_DRIVE`, named *Google Drive*, active, with empty `configData`. If creating the workspace fails, no source exists either.

## AC-SRC-002 — Existing workspaces are backfilled
Covers: BR-SRC-005

**Given** workspaces created before F-04, with no source
**When** the F-04 migration is applied
**Then** each has exactly one *Google Drive* source, and applying it again creates no duplicates.

## List

## AC-SRC-003 — Sumber foto list
Covers: BR-SRC-004, BR-SRC-005, BR-WS-003 (A-1, A-3, A-4)

**Given** an Owner whose workspace has *Google Drive Utama* (active), *Arsip 2024* (inactive) and *Google Drive Arsip* (active)
**When** they open *Sumber foto*
**Then** they see *Google Drive Arsip*, *Google Drive Utama*, then *Arsip 2024* marked *Nonaktif*. Each row shows the Google Drive icon and provider name and its actions. The page shows *Tambah sumber*, the setup guide and the public-link warning. The nav item *Sumber foto* (icon `folder-open`) is active, and no *Segera hadir* placeholder is shown.

## AC-SRC-004 — Old route and label are gone
Covers: A-1

**Given** an Owner in their workspace
**When** they look at the navigation (sidebar, rail, phone menu sheet), or open `/w/[workspaceId]/client-sources`
**Then** no item is labelled *Sumber klien*, and the old route shows *not found*.

## AC-SRC-005 — Empty list
Covers: BR-SRC-005 (A-5)

**Given** a workspace whose sources were all deleted
**When** the Owner opens *Sumber foto*
**Then** they see *Belum ada sumber foto* with *Tambah sumber*, and the guide and warning are still shown.

## Add

## AC-SRC-006 — Add a Google Drive source
Covers: BR-SRC-002, BR-SRC-004, BR-SRC-005 (A-7)

**Given** the *Tambah sumber* dialog
**When** the Owner keeps Google Drive selected, enters *Google Drive Arsip* and confirms
**Then** an active `GOOGLE_DRIVE` source with that name and empty `configData` is stored with `updatedBy` set to the Owner, the dialog closes, the list shows it, and a success toast confirms. The dialog showed the public-link warning before confirming.

## AC-SRC-007 — Other providers are coming soon
Covers: BR-SRC-005 (A-6)

**Given** the *Tambah sumber* dialog
**When** the Owner looks at the provider choice
**Then** Dropbox, OneDrive, Amazon S3 and Custom URL are visible, disabled and labelled *Segera hadir*, and can't be selected with mouse, touch or keyboard. A request with any provider other than `GOOGLE_DRIVE` sent directly to the server is rejected, and nothing is stored.

## AC-SRC-008 — Name validation
Covers: BR-SRC-005, C-004

**Given** the add or rename dialog
**When** the name is empty or only spaces, or longer than 60 characters after trimming
**Then** a field error is shown, nothing is stored, and the server applies the same rule when the form is bypassed.

## AC-SRC-009 — Unique name per workspace
Covers: BR-SRC-005, C-003 (A-8)

**Given** a workspace with *Google Drive Utama*
**When** the Owner adds or renames another source to *google drive utama* (any case, surrounding spaces), including two tabs at once
**Then** the field shows *Nama ini sudah dipakai di workspace ini* and the database keeps one source with that name. The same name in another workspace is allowed.

## Manage

## AC-SRC-010 — Rename
Covers: BR-SRC-005

**Given** a source *Google Drive*
**When** the Owner renames it to *Google Drive Utama*
**Then** the trimmed name is stored with `updatedBy`, the list shows it in the right order, and a toast confirms.

## AC-SRC-011 — Deactivate and reactivate
Covers: BR-SRC-006

**Given** an active source
**When** the Owner selects *Nonaktifkan*
**Then** it's stored as inactive with no confirmation dialog, the row shows *Nonaktif* and moves to the inactive group, and a toast confirms with *Batalkan*. *Batalkan* or *Aktifkan* makes it active again.

## AC-SRC-012 — Delete
Covers: BR-SRC-006

**Given** a source that no gallery source refers to
**When** the Owner selects *Hapus* and confirms *Hapus sumber "{name}"?*
**Then** the source is deleted, the list updates, and a toast confirms. Choosing *Batal* deletes nothing. Deleting the last source leaves the empty list (AC-SRC-005).

## AC-SRC-013 — A source in use can't be deleted
Covers: BR-SRC-006, C-003

**Given** a source that a gallery source refers to (made possible by F-09; tested at the database and use-case level until then)
**When** anything tries to delete it
**Then** the delete is refused with *Sumber ini dipakai gallery. Nonaktifkan saja.*, and the source and its gallery sources are unchanged.

## Errors & security

## AC-SRC-014 — Server error
Covers: C-007

**Given** the add, rename, deactivate or delete request fails unexpectedly
**When** the Owner submits it
**Then** a danger toast *Perubahan belum tersimpan* with *Coba lagi* is shown, any dialog keeps its input, and stored data is unchanged.

## AC-SRC-015 — Workspace isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** an Owner
**When** they open *Sumber foto* for a workspace they don't own or that doesn't exist, or submit add, rename, deactivate or delete with a source ID from another workspace
**Then** they get *not found*, nothing changes, and no data from that workspace is returned.

## AC-SRC-016 — No credentials in sources
Covers: BR-SRC-003, C-103

**Given** any stored source
**When** its `configData`, the page and the server logs are inspected
**Then** `configData` holds no key, token or link, and logs carry only the workspace ID, source ID and outcome code.

## Accessibility & states

## AC-SRC-017 — States and accessibility
Covers: C-007, C-008

**Given** *Sumber foto* at desktop and phone widths, light and dark
**When** the Owner uses the list, the row actions and the dialogs with the keyboard only
**Then** every state in the spec's UI States is reachable, focus moves into each dialog and back to its trigger, disabled providers are announced as unavailable, field errors are linked to their fields, toasts are announced, and axe (wcag2a/2aa/21a/21aa) reports no violations.
