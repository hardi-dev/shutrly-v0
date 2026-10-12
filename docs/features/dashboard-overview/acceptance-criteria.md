# Acceptance Criteria — Dashboard overview (F-26)

IDs are stable and never reused. Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible). Wording in *italics* stands for copy-deck rows still to be drafted (Codex) and approved by the Owner; tests read copy from the catalogue, not literals. Layout follows the Pencil frames from `/sdv:design-feature`. *Today* is the calendar day in `Asia/Jakarta` (FC-001); tests fix the clock.

## Visibility

## AC-DASH-001 — A workspace with a project shows the overview
Covers: BR-WS-003, BR-PRJ-004

**Given** an Owner whose workspace has at least one project, in any status
**When** the dashboard opens
**Then**:
- it shows four parts: *Needs you*, *Upcoming sessions*, *Projects by status* and *Galleries expiring soon*;
- the F-25 checklist, the F-02 placeholder and *Set up branding* are not shown.

## AC-DASH-002 — A workspace without a project still shows the checklist
Covers: BR-WS-003

**Given** a workspace with no project (new, or after its only draft was deleted, BR-PRJ-010)
**When** the dashboard opens
**Then** F-25's setup checklist shows and none of the four parts do.

## AC-DASH-003 — Only this workspace's data
Covers: BR-WS-002, BR-WS-003

**Given** an Owner with workspaces *A* and *B*, each with projects, sessions, groups and galleries that would count
**When** the Owner opens *A*'s dashboard
**Then** every count and item comes from *A* only, and opening the dashboard of a workspace the Owner doesn't own shows the existing not-found page with no data read.

## Needs you

## AC-DASH-004 — Drafts to confirm
Covers: BR-PRJ-004

**Given** projects in `DRAFT`, `BOOKED` and `CANCELLED`
**When** the dashboard opens
**Then** *Drafts to confirm* lists only the `DRAFT` projects, oldest created first (A-3), with their count, and each opens its project page.

## AC-DASH-005 — Selections to review
Covers: BR-SEL-005

**Given** selection groups that are `SUBMITTED`; `OPEN` with a recorded submission below the limit; `OPEN` never sent; and `LOCKED`; plus a `SUBMITTED` group on a `CANCELLED` project
**When** the dashboard opens
**Then** *Selections to review* lists the first two kinds only, oldest submission first, each named with its project and group, and each opens that group's picks page. The never-sent, locked and cancelled-project groups are not listed.

## AC-DASH-006 — Editing in progress
Covers: BR-PRJ-004, BR-DEL-003

**Given** projects in `SHOOTING`, `POST_PROCESSING` and `DELIVERED`
**When** the dashboard opens
**Then** *Editing in progress* lists only the `POST_PROCESSING` projects, oldest created first, and each opens its project page. A project whose final delivery is published (`DELIVERED`) is no longer listed.

## AC-DASH-007 — Nothing needs the Owner
Covers: BR-PRJ-004, BR-SEL-005

**Given** a workspace with projects but no `DRAFT` or `POST_PROCESSING` project and no group to review
**When** the dashboard opens
**Then** *Needs you* shows *nothing needs you right now* instead of three empty groups.

## Upcoming sessions

## AC-DASH-008 — Sessions in the next 7 days
Covers: BR-TEAM-002, BR-TEAM-003

**Given** today is 2026-10-13 and sessions dated 2026-10-12, 2026-10-13, 2026-10-19 and 2026-10-20 on `BOOKED` projects
**When** the dashboard opens
**Then** it lists the sessions of 2026-10-13 and 2026-10-19 only, each with session name, date, start time when set, project title and client, and each opens its project page.

## AC-DASH-009 — Session order and statuses
Covers: BR-TEAM-003, BR-PRJ-004

**Given** in the window: two sessions on the same day, one without a start time; a session of a `DRAFT` project; a session of a `CANCELLED` project
**When** the dashboard opens
**Then** sessions are ordered by date, then start time with untimed first, then creation; the `DRAFT` project's session is listed and shows the project status; the `CANCELLED` project's session is not listed.

## AC-DASH-010 — No upcoming sessions
Covers: BR-TEAM-003

**Given** no session from today to today + 6 on a non-cancelled project
**When** the dashboard opens
**Then** *Upcoming sessions* shows its empty message.

## Projects by status

## AC-DASH-011 — Counts per status
Covers: BR-PRJ-004

**Given** 2 `DRAFT`, 1 `BOOKED`, 0 `SHOOTING`, 1 `POST_PROCESSING`, 0 `DELIVERED`, 3 `COMPLETED` and 1 `CANCELLED` projects
**When** the dashboard opens
**Then** *Projects by status* shows the seven statuses in lifecycle order with 2, 1, 0, 1, 0, 3 and 1 (zeros shown, A-4).

## AC-DASH-012 — A status opens the matching list
Covers: BR-PRJ-004

**Given** the *Projects by status* part
**When** the Owner opens a status
**Then** `DRAFT` to `DELIVERED` open the *Active* project list filtered to that status, `COMPLETED` opens the *Completed* tab and `CANCELLED` the *Cancelled* tab, and the list shows the same number of projects as the count.

## AC-DASH-013 — Only cancelled projects
Covers: BR-PRJ-004

**Given** a workspace whose only projects are `CANCELLED`
**When** the dashboard opens
**Then** the overview shows (not the checklist), *Needs you*, *Upcoming sessions* and *Galleries expiring soon* show their empty messages, and *Projects by status* shows the cancelled count.

## Galleries expiring soon

## AC-DASH-014 — Published galleries expiring in 7 days
Covers: BR-GAL-005

**Given** today is 2026-10-13 and galleries: `PUBLISHED` expiring 2026-10-15; `PUBLISHED` expiring 2026-10-25; `PUBLISHED` without expiry; `EXPIRED`; `DRAFT` with an expiry duration; `ARCHIVED`
**When** the dashboard opens
**Then** only the gallery expiring 2026-10-15 is listed, with its project title and expiry date, and it opens the project's gallery page.

## AC-DASH-015 — Expiry order and empty state
Covers: BR-GAL-005

**Given** two published galleries expiring in the window
**When** the dashboard opens
**Then** the soonest expiry is first; and with none in the window the part shows its empty message.

## Common

## AC-DASH-016 — Long lists
Covers: BR-PRJ-004

**Given** 8 `DRAFT` projects
**When** the dashboard opens
**Then** *Drafts to confirm* shows a count of 8, lists the 5 oldest and shows *3 more* (A-2). The same cap applies to every list.

## AC-DASH-017 — Read-only and fresh
Covers: BR-PRJ-004, BR-PRJ-005

**Given** the dashboard is open
**When** the Owner confirms a draft on its project page and comes back
**Then** the counts reflect the change, and nothing on the dashboard itself changes a status, a group or a gallery.

## AC-DASH-018 — Language
Covers: BR-L10N-001, BR-L10N-002, BR-L10N-004

**Given** the Owner switches between EN and ID
**When** the dashboard opens
**Then** every label, empty message, status name and date is in that language, and project titles, client names and session names are shown as stored.

## AC-DASH-019 — Error
Covers: BR-WS-003

**Given** a read fails while the dashboard loads
**When** the page renders
**Then** the existing owner error page with retry shows, never a part with partial numbers.

## AC-DASH-020 — Accessibility
Covers: C-008

**Given** the overview
**When** used by keyboard and screen reader
**Then** each part has a heading, every item is a link reachable by Tab with a visible focus ring and a name that includes the project, counts are read with their label, and the page has no axe violations on desktop and phone.
