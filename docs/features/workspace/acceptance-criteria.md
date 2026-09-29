# Acceptance Criteria — Workspace (F-02)

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## Onboarding & creation

## AC-WS-001 — Zero workspaces go to onboarding
Covers: BR-AUTH-004, BR-WS-006

**Given** a verified, active Owner who owns no workspace
**When** they sign in, or open any owner-area page (dashboard, Profile, Workspace settings)
**Then** they are redirected to first-workspace onboarding.

## AC-WS-002 — Creating the first workspace
Covers: BR-WS-001, BR-WS-004, BR-WS-005, BR-WS-006, BR-CUR-001 (A-3)

**Given** a verified Owner on onboarding with zero workspaces
**When** they submit the name `Aster Wedding`
**Then** exactly one workspace exists, owned by them, with name `Aster Wedding`, invoice prefix `AW`, currency `IDR`, and no optional branding set. It is recorded as their last opened, and they land on its dashboard inside the App Shell.

## AC-WS-003 — Workspace name is validated on the server
Covers: C-004, BR-WS-004 (A-1)

**Given** a create request with an empty (or whitespace-only) name, or a name longer than 60 characters after trimming
**When** it reaches the server, even bypassing client validation
**Then** no workspace is created and a field-level error is shown on the name.

## AC-WS-004 — Duplicate name for the same Owner is rejected
Covers: BR-WS-001 (A-2)

**Given** an Owner who owns `Aster Wedding`
**When** they create a workspace named ` aster wedding ` (or submit the same create twice at once)
**Then** only one such workspace exists and the rejected request shows a field error on the name. A different Owner can still create `Aster Wedding`.

## AC-WS-005 — Invoice prefix suggestion
Covers: BR-WS-005 (A-3)

**Given** new workspaces named `Aster Wedding`, `Studio`, `Foto Keluarga Bahagia Sentosa Abadi Jaya`, and `@@`
**When** each is created
**Then** their invoice prefixes are `AW`, `STU`, `FKBSAJ` and `INV` respectively.

## AC-WS-006 — Onboarding is only for zero workspaces
Covers: BR-WS-006

**Given** an Owner with at least one workspace
**When** they open first-workspace onboarding
**Then** they are redirected to their active workspace, and no workspace is created.

## AC-WS-007 — Create another workspace from the switcher
Covers: BR-WS-001, BR-WS-006

**Given** an Owner inside workspace A
**When** they choose "create workspace" in the switcher and submit a valid, unused name B
**Then** workspace B is created with the same defaults as AC-WS-002, becomes active and last opened, and its dashboard is shown.

## Resolution & switching

## AC-WS-008 — Sign-in opens the most recently opened workspace
Covers: BR-WS-006 (A-5)

**Given** a verified Owner with one or more workspaces
**When** they sign in
**Then** the dashboard of the workspace they opened most recently opens, and there is no selection step.

## AC-WS-009 — Last opened follows the Owner across devices
Covers: BR-WS-006 (A-5)

**Given** an Owner with workspaces A and B who last opened B, on any device
**When** they sign in
**Then** workspace B's dashboard opens.

## ~~AC-WS-010 — Select workspace when there is no usable last opened~~
Deprecated 2026-09-27 (Owner): BR-WS-006 no longer has a selection step. Every workspace gets a last-opened time when it is created, so a usable last opened always exists. The ID is kept, not reused.

## AC-WS-011 — Switching workspaces
Covers: BR-WS-003, BR-WS-006 (A-11)

**Given** an Owner inside workspace A who also owns B
**When** they open the switcher (Sidebar on desktop, rail on tablet, Menu sheet on mobile)
**Then** it lists their workspaces alphabetically with A marked current, and choosing B makes B active, records it as last opened, and shows B's dashboard.

## Isolation

## AC-WS-012 — Another Owner's workspace is not found
Covers: BR-WS-002, BR-WS-003, C-101 (A-9)

**Given** Owner X and a workspace W owned by Owner Y
**When** X requests W by ID in any way (URL, switch action, settings save)
**Then** X gets the same *not found* response as for a nonexistent ID, W's data is not returned or changed, and X's last opened workspace is unchanged.

## AC-WS-013 — Browser-supplied workspace IDs are not trusted
Covers: BR-WS-003, C-004

**Given** an Owner inside workspace A
**When** they submit a Workspace settings save whose body carries another workspace ID (theirs or not)
**Then** the server updates only the active workspace it verified (A), or rejects the request; no other workspace changes.

## AC-WS-014 — Owner-scoped code gets a verified context
Covers: BR-WS-003, C-101

**Given** any owner-area request
**When** it reaches owner-scoped application code
**Then** it carries a `WorkspaceContext` produced only by F-02's resolver after the ownership check; there is no other way to build one outside tests.

## AC-WS-015 — Gates run before workspace resolution
Covers: BR-AUTH-003, BR-AUTH-005

**Given** a signed-in Owner who is unverified, or `SUSPENDED`/`DISABLED`
**When** they request any F-02 screen or action
**Then** F-01's Verification pending or Account unavailable handling applies and no workspace data is rendered or changed.

## Branding

## AC-WS-016 — Edit workspace branding
Covers: BR-WS-004 (A-4)

**Given** an Owner in Workspace settings of workspace A
**When** they save a new name, brand name, contact email, phone and address, all valid
**Then** A shows the new values, the Sidebar switcher shows the new name, and the currency stays `IDR`, shown read-only.

## AC-WS-017 — Branding input is validated on the server
Covers: C-004, BR-WS-004, BR-WS-005 (A-1, A-2, A-3, A-4)

**Given** a settings save with an invalid name, a duplicate name, an invoice prefix that isn't 2–6 of `A–Z0–9`, an invalid email, an invalid phone, or an address over 300 characters
**When** it reaches the server, even bypassing client validation
**Then** nothing is saved and field-level errors are returned. A lowercase prefix such as `aw` is accepted and stored as `AW`.

## AC-WS-018 — Brand name falls back to the name
Covers: BR-WS-004

**Given** a workspace whose brand name is empty
**When** its client-facing brand name is resolved
**Then** the workspace name is used.

## AC-WS-019 — Invoice prefix change is forward-only
Covers: BR-WS-005, C-102

**Given** a workspace with prefix `AW`
**When** the Owner changes it to `ASW` and saves
**Then** the workspace's prefix is `ASW`. No stored data other than the workspace row changes. (Invoice numbering itself is verified in F-14.)

## AC-WS-020 — No archive or delete
Covers: BR-WS-007

**Given** any Owner
**When** they use the app
**Then** there is no archive or delete action for a workspace in any screen, and no such server action exists.

## App Shell

> F-17 `app-shell-revamp` (SPECIFIED 2026-09-29) supersedes AC-WS-021 and the mobile part of AC-WS-011 when it ships; see [AC-SHELL-*](../app-shell-revamp/acceptance-criteria.md).

## AC-WS-021 — App Shell wraps every owner screen
Covers: C-008 (A-7, A-8)

**Given** an Owner inside a workspace
**When** they open the dashboard, Workspace settings, or F-01's Profile
**Then** the page renders inside the App Shell matching the approved Pencil exports: Sidebar with switcher and the library's full navigation (A-7; the current page `aria-current="page"`; behaviour of unbuilt destinations per SPEC GAP-F02-1), and the account block linking to Profile and log out. At 768–1279 px it uses the rail; below 768 px the Bottom Nav and Menu sheet. The desktop collapse choice persists in that browser.

## AC-WS-022 — Shell accessibility
Covers: C-008

**Given** any App Shell page
**When** it is used with the keyboard and a screen reader
**Then** the skip link *Langsung ke konten* is the first focusable element, the sidebar is `<nav aria-label="Utama">`, the panel is `<main>`, the switcher is a button with `aria-haspopup="menu"` whose menu is keyboard-operable, icon-only buttons have Indonesian `aria-label`s, and axe reports no WCAG 2.1 AA violations.

## AC-WS-023 — Dashboard empty state
Covers: C-007 (A-6)

**Given** an Owner inside a new workspace
**When** the dashboard opens
**Then** it shows the workspace name and the approved empty state, and no data from any other workspace.

## AC-WS-024 — Form states
Covers: C-007

**Given** the onboarding, create-workspace, or Workspace settings form
**When** it is submitted
**Then** the submit control is disabled while submitting; a server failure shows a retryable error and keeps the entered values; success moves on (create) or confirms the save (settings).

## AC-WS-025 — Unbuilt destinations open a "Segera hadir" page
Covers: C-007 (A-7, SPEC GAP-F02-1)

**Given** an Owner inside a workspace
**When** they choose a nav item whose feature isn't built yet (e.g. Proyek, Klien, Invoice, Layanan, Tim, Template pesan, Sumber klien, or the mobile Bottom Nav CTA)
**Then** a *Segera hadir* page opens inside the App Shell, with that item active, showing the destination's name and a link back to Dasbor. No data is read or written, and the workspace context is still verified (BR-WS-003).
