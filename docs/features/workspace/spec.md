# Feature: Workspace — onboarding, switching, branding, App Shell

ID: F-02 · Slug: `workspace`
Status: DONE (Owner 2026-09-28) · [technical-design.md](technical-design.md)
Journey: [J-01 Owner onboarding](../../product/user-journeys.md) · Paired with: F-01 `auth`

## Goal
A verified Owner creates their first workspace, lands in it, and can create more workspaces, switch between them, and edit each one's branding. Every owner screen runs inside the App Shell, in a workspace the server has verified the Owner owns.

## User Story
As a photographer (Owner) running one or more brands, I want a separate workspace per brand that I can switch between quickly, so that each brand's clients, projects and invoices stay apart.

## Preconditions
- F-00 Foundation (DONE): per-request database, error model, `WorkspaceId` / `WorkspaceContext` types (`src/shared/workspace-context`), design-system primitives.
- F-01 Auth: session, verification and status gates (BR-AUTH-003, BR-AUTH-005), and the `WorkspaceDestinationPort` hand-off. Its destinations are fixed: `ONBOARDING → /onboarding/workspace`, `WORKSPACE → /workspace` (auth SPEC GAP-2, Owner 2026-09-27).
- Actor: a signed-in Owner who is `ACTIVE` and verified. Anyone else is handled by F-01 before F-02 runs.
- Design-system templates exist: App Shell (C30), Sidebar (C29), tablet App Shell with Sidebar/Rail (C37), Mobile App Shell (C35), Bottom Nav (C34), Menu (C32).

## Inputs
| Screen | Fields |
|---|---|
| First-workspace onboarding | workspace name |
| Create another workspace (from the switcher) | workspace name |
| Workspace switcher (Sidebar / mobile Menu) | choice of one owned workspace · "create workspace" action |
| Workspace settings (branding) | name, brand name, contact email, phone, address, invoice prefix · currency shown read-only (IDR) |

All text is trimmed. Formats: A-1 to A-4.

## Main Flow — first workspace (new Owner)
1. F-01 signs the Owner in (after verification or Google). The destination port finds zero workspaces and sends them to first-workspace onboarding (BR-AUTH-004, BR-WS-006).
2. Owner enters a workspace name and submits.
3. The server validates the name (A-1), creates the workspace owned by that Owner with an invoice prefix suggested from the name (BR-WS-005, A-3), currency `IDR` (BR-CUR-001), and empty optional branding (BR-WS-004).
4. The new workspace becomes the active one and is recorded as last opened (BR-WS-006).
5. Owner lands on the workspace dashboard inside the App Shell.

## Main Flow — returning Owner
1. F-01 signs the Owner in and asks the destination port where to go.
2. Zero workspaces → onboarding (as above). Otherwise the workspace they opened most recently opens, with no selection step (BR-WS-006). A new workspace counts as opened when it is created, so there is always an answer.

## Alternative Flows
- **Switch workspace:** from the Sidebar switcher (desktop), the rail (tablet) or the mobile Menu sheet, the Owner opens the list of owned workspaces (the current one is marked) and picks another. The server verifies ownership, makes it active, records it as last opened, and shows its dashboard.
- **Create another workspace:** from the switcher's "create workspace" action, the Owner enters a name. Same validation and defaults as onboarding. The new workspace opens.
- **Edit branding:** from *Workspace settings*, the Owner edits the fields in *Inputs* and saves. The currency is shown but can't be changed (IDR only). A changed invoice prefix applies only to invoices numbered afterwards (BR-WS-005).
- **Onboarding visited with ≥1 workspace:** the Owner is sent to their active workspace instead (the onboarding screen is only for zero workspaces). Creating more happens from the switcher.
- **Owner-area page visited with zero workspaces** (e.g. F-01's Profile): redirected to onboarding (BR-AUTH-004).
- **Profile and log out:** the Sidebar account block links to F-01's Profile page and offers F-01's log out.

## Error Cases
- Empty or too-long name, invalid invoice prefix, email or phone, too-long address → field-level errors. The same schema is re-validated on the server (C-004).
- Name already used by another workspace of the same Owner → field error on the name (A-2). No second workspace is created. This also covers a double-submitted create.
- A workspace ID the Owner doesn't own, or that doesn't exist, in a URL, form or request → the same *not found* response for both, and no workspace data (BR-WS-003, A-9).
- A workspace ID sent in a request body is never trusted. The server acts only on the active workspace it verified (C-004).
- Unverified or non-active Owner → F-01's Verification pending / Account unavailable handling runs first. F-02 renders no workspace data.
- Unexpected server error on create, save or switch → a retryable error state; nothing half-saved (C-007).

## UI States (C-007)
Every form: idle, submitting (disabled submit), field errors, server error with retry, success. The switcher list: loading and populated (they're never empty for an Owner who reaches them). Dashboard: the empty state described in A-6. *Segera hadir* page: a static placeholder (SPEC GAP-F02-1).

## Business Rules
- BR-AUTH-003 — verified email before workspace
- BR-AUTH-004 — zero workspaces → onboarding
- BR-AUTH-005 — non-active users blocked (enforced by F-01, relied on here)
- BR-WS-001 — one owner, many workspaces
- BR-WS-002 — tenant isolation
- BR-WS-003 — workspace context is verified
- BR-WS-004 — workspace profile (no logo)
- BR-WS-005 — invoice prefix
- BR-WS-006 — active workspace after sign-in
- BR-WS-007 — no archive or delete in MVP
- BR-CUR-001 — IDR only, currency code persisted
- Constitution: C-004, C-006, C-007, C-008, C-101
- ADR-003 — `workspace_id` + composite FKs (the workspace row itself is the tenant root)

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Name:** 1–60 characters after trimming.
- **A-2 Name is unique per Owner,** compared case-insensitively after trimming, so the switcher never shows two identical names. Different Owners may use the same name.
- **A-3 Invoice prefix:** 2–6 characters, `A–Z` and `0–9`, stored uppercase (input is uppercased). Not unique across workspaces. Suggestion at creation: the initials of the name's words (letters and digits only), uppercased and cut to 6. If that's shorter than 2, use the first 3 letters or digits of the name; if still shorter than 2, use `INV`.
- **A-4 Optional branding:** brand name ≤ 80; contact email a valid address ≤ 254; phone 8–20 characters of digits, spaces, `+`, `-`, `(`, `)`; address ≤ 300. Empty means "not set".
- **A-5 Last opened is stored on the server** (a time on each workspace), so it follows the Owner across devices and browsers. There is no selection screen: this matches Linear (last visited workspace) and Vercel (default team) rather than Slack's picker (research, Owner 2026-09-27).
- **A-6 Dashboard:** F-02 ships the dashboard page with the workspace name and an empty state only. Metrics and widgets belong to later features.
- **A-7 Navigation — changed by the Owner (2026-09-27):** the App Shell shows the library's full navigation, with the same items and labels as the design system: Dasbor, Proyek, Klien, Invoice, Layanan, Tim, Template pesan, Sumber klien, Pengaturan; the mobile Bottom Nav with the CTA; and the *Lainnya* sheet. Count badges are off in an empty workspace. Header Search and Notifications stay hidden: they aren't navigation, and no feature provides them yet. *Pengaturan* opens Workspace settings. See SPEC GAP-F02-1.
  > **F-17 (`app-shell-revamp`, 2026-09-29) supersedes parts of A-7 when it ships.** On phones, Invoice becomes a Bottom Nav tab and *Lainnya* becomes a header Menu button. Header Search and Notifications are visible and open *Segera hadir*. See [F-17 spec](../app-shell-revamp/spec.md) › *Supersedes*.
- **A-8 Sidebar collapse:** the desktop collapse button switches to the rail layout. The choice is remembered per browser only.
- **A-9 Not found, not forbidden:** another Owner's workspace looks exactly like a nonexistent one, so IDs can't be probed.
- **A-10 Concurrent edits:** saving branding is last-write-wins. There's no conflict warning in MVP.
- **A-11 Ordering:** the switcher lists workspaces alphabetically by name.

## Dependencies
- F-00 Foundation; F-01 Auth (session, gates, `WorkspaceDestinationPort`).
- F-02 builds the App Shell in code: desktop Sidebar, tablet rail, and mobile Bottom Nav + Menu sheet, including the design-system components they need, plus `src/app/(owner)/layout.tsx` (auth R-6; Owner confirmed 2026-09-27). F-01's Profile page depends on this layout; today it renders without a shell.
- F-02 provides to later features: the verified `WorkspaceContext` resolver, the App Shell / `(owner)` layout, and the Sidebar nav slots.
- F-14 Billing consumes the invoice prefix. F-03/F-04 and other workspace-level features hang off the workspace.

## Out of Scope
- Logo upload or logo URL (BR-WS-004).
- Archiving, deleting or transferring a workspace (BR-WS-007).
- Staff/multi-user workspaces, invitations, roles.
- Currencies other than IDR; changing the currency.
- Dashboard metrics and widgets (later features).
- Message templates (F-03) and source configuration (F-04), even though they are workspace-level settings.
- Per-workspace theme or colors; custom domains.

## Open Questions / SPEC GAPS
- **SPEC GAP-F02-1 — DECIDED (Owner 2026-09-27): option (c).** Every nav item is visible. A destination whose feature isn't built yet opens a *Segera hadir* page inside the App Shell, with its nav item active. The page shows the destination's name, one line saying the feature is coming, and a link back to Dasbor. It shows no data and makes no writes. Each later feature replaces its own placeholder.
- Assumptions A-1 to A-11 are open for the Owner to change.
- For design: `/sdv:design-feature workspace` must add the frames not in the design system yet — onboarding, create-workspace, Workspace settings, dashboard empty state, and the switcher's open Menu — each in desktop and mobile, as HTML exports (AGENTS.md).
