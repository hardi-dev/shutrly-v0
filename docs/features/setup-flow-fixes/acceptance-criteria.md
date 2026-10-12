# Acceptance criteria: Setup flow fixes (F-24)

Spec: [spec.md](spec.md) · Area code: `SFX`

## D1 — Forms

## AC-SFX-001 — Credentials never reach a URL
Covers: C-103, C-006 (D1)

**Given** any form listed in spec › D1 (register, login, forgot password, reset password, profile, change password, client gallery password, landing waitlist, workspace settings)
**When** it is submitted by any means, with or without its JavaScript loaded
**Then** the request is a `POST`, and no field value (name, email, password, gallery password, reset token, contact details) appears in the resulting URL, the browser history entry, or a server or analytics log.

## AC-SFX-002 — Submit waits until the form is ready
Covers: C-006, C-007 (D1)

**Given** a D1 form whose page has rendered but whose JavaScript hasn't loaded yet
**When** the visitor presses the submit button or presses Enter in a field
**Then** nothing is submitted, and the submit button is shown disabled
**And** once the page is interactive, the button is enabled and the form submits as today, with the same validation, errors and submitting state.

## AC-SFX-003 — A native post changes nothing
Covers: C-006, BR-AUTH-003 (D1)

**Given** a D1 form
**When** a native form `POST` reaches its page without the app's client-side submit (no JavaScript)
**Then** no account is created, no one is signed in, no password or setting changes, no waitlist entry is stored, no gallery session starts, and no gallery password attempt is counted
**And** the response doesn't echo the submitted values.

## AC-SFX-004 — Server-action forms are unchanged
Covers: (D1 correction)

**Given** the Google sign-in button and the *account unavailable* sign-out form
**Then** they keep submitting through their server actions, with and without JavaScript, as today.

## D2 + D7 — Withdrawn

AC-SFX-005, AC-SFX-006, AC-SFX-007 and AC-SFX-008 are **withdrawn** (Owner 2026-10-12): the defect did not reproduce, and F-05's AC-CAT-010 (the service page opens after *Add service*) stays in force. The IDs are not reused.

## D3 — Enter submits catalog dialogs

## AC-SFX-009 — Enter equals the primary button
Covers: C-008 (D3)

**Given** a catalog dialog listed in spec › D3, with focus in a single-line field
**When** the Owner presses Enter
**Then** the dialog submits exactly as clicking its primary button: same validation, field errors, saving state and result (for *Add package item*: *Printed photos* 20 is added and the dialog closes).

## AC-SFX-010 — No double submit, no submit from multi-line fields
Covers: C-005, C-008 (D3)

**Given** a catalog dialog that is saving
**When** the Owner presses Enter or clicks the primary button again
**Then** no second save is sent
**And** Enter in a multi-line field inserts a line break and doesn't submit.

## D4 — Not found inside a workspace

## AC-SFX-011 — Missing page inside a workspace
Covers: C-007, BR-WS-003 (D4)

**Given** an Owner who owns workspace *W*
**When** they open, inside *W*, an unknown message-template slug (e.g. `GALLERY_SHARE`), a project, service or selection group id that doesn't exist, or an unknown section
**Then** a *page not found* state shows inside *W*'s shell (sidebar and header kept), says the page doesn't exist or was removed, and offers a way back (the dashboard, or the parent list)
**And** it doesn't say "Workspace not found".

## AC-SFX-012 — Another workspace's record looks missing
Covers: C-101, BR-WS-002, BR-WS-003 (D4)

**Given** an Owner who owns *W* but not *V*, and a project, service or group id that belongs to *V*
**When** they open it under `/w/W/…`
**Then** they see the same *page not found* state as AC-SFX-011, with no data from *V* and nothing that tells it apart from an id that doesn't exist.

## AC-SFX-013 — Workspace not found stays for workspaces
Covers: BR-WS-003 (D4)

**Given** a workspace id that doesn't exist or isn't owned by the Owner
**When** they open any page under it
**Then** "Workspace not found" shows, as today.

## AC-SFX-014 — Breadcrumb on page not found
Covers: C-008 (D4, F-23)

**Given** the *page not found* state of AC-SFX-011
**Then** the breadcrumb shows the workspace and, where it exists, the parent section, and never the missing record's id or name.

## D5 — Folder guidance

## AC-SFX-015 — No folder name is presented as special
Covers: BR-GAL-007 (D5)

**Given** the *Photo sources* guide and the gallery folder screens (empty folder state, add-folder dialog, the folder kinds' explanations), in EN and in ID
**Then** no text or diagram label says finished files go in folders named `edited` or `print`, or that those names are recognised
**And** the text says finished files go in subfolders the Owner maps to the project's package items, that any folder name works, and that unmapped photos stay selection photos.

## AC-SFX-016 — Deck and code agree
Covers: BR-L10N-002 (D5, D6, copy)

**Given** every string added or changed by F-24
**Then** its EN and ID text equals an Owner-approved row in `copy-deck.md`, and no deck row still describes `edited`/`print` as special folder names.

## D6 — Language

## AC-SFX-017 — English catalog screens are English only
Covers: BR-L10N-002 (D6)

**Given** the UI in English
**When** the Owner views *Services* › *Package items* and opens *Add booking field*
**Then** the pick-mode line and the dialog subtitle are in English, with no Indonesian
**And** with the UI in Indonesian, both show their Indonesian text.
