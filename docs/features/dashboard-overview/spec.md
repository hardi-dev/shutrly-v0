# Feature: Dashboard overview

ID: F-26
Status: READY FOR DESIGN (specified 2026-10-13) · Intent: [intent.md](intent.md), ACCEPTED 2026-10-13 · AC: [acceptance-criteria.md](acceptance-criteria.md)

## Goal
Once a workspace has a project, the dashboard shows what needs the Owner now and what is coming in the next 7 days, each item one step from the page that handles it. It replaces the F-02 placeholder (and its *Set up branding* prompt) that F-25 left in place after the first project.

## User Story
As an Owner with projects under way, I want the dashboard to tell me which projects are waiting on me, which shoots are coming up and which galleries are about to expire, so that I don't have to open every list to find out.

## Preconditions
- The Owner is signed in and owns the workspace in the URL (BR-WS-003, ADR-015).
- The workspace has at least one project, in any status. Without one, F-25's setup checklist shows instead (F-25 AC-SETUP-001); this feature does not change that.

## Inputs
- Workspace ID from the URL (verified server-side, never trusted, C-004).
- The current instant, turned into *today* in the schedule time zone (A-1, FC-001).
- Read-only workspace data: projects and their status (BR-PRJ-004), sessions (BR-TEAM-003), selection groups (BR-SEL-005), galleries and their expiry (BR-GAL-005).

No Owner input on the page; it has no form and changes nothing.

## Dashboard content
Four parts, all computed on the server for this workspace only (BR-WS-002, C-101). Projects in `CANCELLED` are left out of parts 1, 2 and 4.

| # | Part | What counts | Order | Each item links to |
|---|---|---|---|---|
| 1 | **Needs you** | three groups, each with its count: **Drafts to confirm**: projects in `DRAFT`. **Selections to review**: selection groups the Owner can lock: `SUBMITTED`, or `OPEN` with a recorded submission (the client sent fewer than the limit) (BR-SEL-005). **Editing in progress**: projects in `POST_PROCESSING` (final delivery not yet published, BR-DEL-003) | drafts by creation (oldest first); selections by submission time (oldest first); editing by creation (oldest first) (A-3) | the project page; a selection goes to that group's picks page |
| 2 | **Upcoming sessions** | sessions dated from today to today + 6 (7 calendar days) of any project except `CANCELLED`, `DRAFT` included and shown with its project status | date, then start time (no time first), then creation, as BR-TEAM-003 | the project page |
| 3 | **Projects by status** | the number of projects in each of the seven statuses (BR-PRJ-004), zero included (A-4) | lifecycle order: `DRAFT`, `BOOKED`, `SHOOTING`, `POST_PROCESSING`, `DELIVERED`, `COMPLETED`, `CANCELLED` | the project list showing that status: *Active* tab with the status filter for the first five, *Completed* and *Cancelled* tabs for the last two |
| 4 | **Galleries expiring soon** | `PUBLISHED` galleries whose `expiresAt` falls on today to today + 6, in the schedule time zone. Already `EXPIRED`, `DRAFT` and `ARCHIVED` galleries are not shown | soonest expiry first | the project's gallery page |

Each list shows at most 5 items and, when there are more, the number not shown (A-2).

## Main Flow
1. The Owner opens the workspace dashboard (`/w/{workspaceId}`).
2. The server verifies the workspace (BR-WS-003), finds it has a project, and reads the four parts in a few cheap queries (ADR-018).
3. The dashboard shows *Needs you*, *Upcoming sessions*, *Projects by status* and *Galleries expiring soon*.
4. The Owner opens an item and lands on the page that handles it (project, picks or gallery page, or the filtered project list).
5. Coming back to the dashboard reads the data again; nothing is cached across requests or stored.

## Alternative Flows
- **A1 Nothing needs the Owner:** all three *Needs you* groups are empty. The part shows a calm "nothing needs you right now" message, not three empty boxes. The other parts show as usual.
- **A2 No sessions in the next 7 days:** *Upcoming sessions* shows an empty message.
- **A3 No gallery expiring:** *Galleries expiring soon* shows an empty message. A workspace that never set an expiry always sees this.
- **A4 Only cancelled projects:** the workspace still has projects, so the overview shows (not the checklist). Parts 1, 2 and 4 are empty; *Projects by status* shows the cancelled count.
- **A5 The last project is deleted** (a `DRAFT` deleted permanently, BR-PRJ-010): the workspace has no project again, and the dashboard shows F-25's checklist.
- **A6 A group or session changes between load and click:** the dashboard shows what was true at load. The target page shows the current state; nothing is acted on from the dashboard.
- **A7 Language:** all labels follow the Owner's language (BR-L10N-001/002). Project titles, client names and session names are shown as stored (BR-L10N-004). Dates are formatted in the current language.

## Error Cases
- **E1 Workspace not owned or missing:** the existing owner not-found handling (BR-WS-003); no data is read.
- **E2 A read fails:** the existing owner error page with retry (C-007). No part shows partial or stale numbers as if they were complete.

## Business Rules
- BR-WS-002, BR-WS-003 — workspace-scoped reads, verified context.
- BR-PRJ-004 — statuses and their order; BR-PRJ-005 — completion is manual (the dashboard doesn't complete anything); BR-PRJ-010 — deleting drafts.
- BR-TEAM-002, BR-TEAM-003 — sessions, no stored session status, ordering, workspace wall-clock dates.
- BR-SEL-005 — which groups the Owner can lock.
- BR-DEL-003 — publishing final delivery moves a project out of `POST_PROCESSING`.
- BR-GAL-005 — gallery status and `expiresAt`.
- BR-L10N-001, BR-L10N-002, BR-L10N-004 — copy and stored values.

## Dependencies
- F-25 `setup-checklist` (DONE): `loadDashboard` already chooses the checklist or the placeholder; this feature replaces the placeholder branch. F-25's statement "after the first project the dashboard returns to the placeholder" (its spec and design) is superseded by F-26 (FC-002).
- F-07 `projects`: project list tabs and status filter (`?status=`), project page, schedule time zone.
- F-09 `gallery`, F-10 `client-access`: gallery page, picks page per group, group status and submission time.
- F-22: copy rules; new copy drafted with Codex, approved by the Owner, rows added to the copy deck.

## Out of Scope
- Invoice, payment, revenue or balance figures (F-14); a card is added after F-14.
- Charts, trends, exports, analytics, per-team-member views.
- Activity feed, "last viewed", or any new stored data.
- Owner-chosen windows or filters; the window is a fixed 7 days.
- *Set up branding* on the dashboard (dropped, Owner 2026-10-12); Settings is unchanged.
- Already-expired galleries, and `DELIVERED` projects waiting to be completed, as attention items (Owner 2026-10-13).
- Notifications or reminders (F-15); any action taken from the dashboard.

## Assumptions (low-risk, reversible)
- **A-1 Today:** *today* is the calendar day in the schedule time zone F-07 and F-09 already use (`Asia/Jakarta`). See FC-001.
- **A-2 List length:** each list shows at most 5 items plus "N more"; *Needs you* groups show their full count.
- **A-3 Order in Needs you:** oldest first, so the longest-waiting item is on top.
- **A-4 Zero counts:** *Projects by status* shows all seven statuses, including zeros, so the layout doesn't jump.

## Flagged Concerns
Checked against the constitution (C-001…C-012, C-101…C-106), the rules listed above, ADR-003, ADR-015, ADR-018 and F-25's spec.

| ID | Concern | Conflicting sources | Owner decision | Status |
|---|---|---|---|---|
| FC-001 | No business rule names the workspace time zone. BR-TEAM-003 says session times are "local wall-clock times of the workspace", but BR-WS-004 gives a workspace no time zone. F-07 (`schedule-clock`) and F-09 (`gallery-expiry`) both fix `Asia/Jakarta` as a feature-level decision. The 7-day window and *today* need one zone. | BR-TEAM-003, BR-WS-004, F-07 spec, F-09 spec | Use `Asia/Jakarta`, as F-07 and F-09 do; a feature decision, no new rule or data (Owner 2026-10-13) | RESOLVED |
| FC-002 | F-25's spec and design say the dashboard returns to the F-02 placeholder after the first project; F-26 replaces it and drops *Set up branding*. Same authority level, later decision. | F-25 spec (UI States), F-25 design.md › *Not drawn* | Add a short "superseded by F-26" note to F-25's spec and design.md; nothing else in F-25 changes (Owner 2026-10-13) | RESOLVED |

## Open Questions / SPEC GAPS
- None open. FC-001 and FC-002 are resolved. Layout, copy and how the four parts sit on desktop and phone are for `/sdv:design-feature`.
