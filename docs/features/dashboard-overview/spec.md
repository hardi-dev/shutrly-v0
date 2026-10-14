# Feature: Dashboard overview

ID: F-26
Status: DESIGNED (specified 2026-10-13; revised to the Owner's design direction 2026-10-14; design approved 2026-10-15) · Intent: [intent.md](intent.md), ACCEPTED 2026-10-13, Owner revision 2026-10-14 · AC: [acceptance-criteria.md](acceptance-criteria.md) · Design: [dashboard-overview.pen](dashboard-overview.pen)

## Goal
Once a workspace has a project, the dashboard shows four numbers about the work moving through the studio, and lists the active projects with their next session, status and agreed price, each with the same ⋯ menu the project list uses. It replaces the F-02 placeholder (and its *Set up branding* prompt) that F-25 left in place after the first project.

## User Story
As an Owner with projects under way, I want the dashboard to show how much work is coming in, waiting on me and going out, and to act on my active projects from one table, so that I don't have to open the project list for the everyday steps.

## Preconditions
- The Owner is signed in and owns the workspace in the URL (BR-WS-003, ADR-015).
- The workspace has at least one project, in any status. Without one, F-25's setup checklist shows instead (F-25 AC-SETUP-001); this feature does not change that.

## Inputs
- Workspace ID from the URL (verified server-side, never trusted, C-004).
- The current instant, turned into *today* and *this month* in the schedule time zone (A-1, FC-001).
- Workspace data: projects (title, status, client, agreed price, created time, BR-PRJ-004), sessions (BR-TEAM-003), selection groups (BR-SEL-005), galleries and their final-delivery time (BR-DEL-003).
- Row-menu actions are the project list's (F-07, AC-PRJ-027); the dashboard adds no new action.

## Dashboard content
All values are computed on the server for this workspace only (BR-WS-002, C-101), in the order below.

### 1. Page header
- Title *Dashboard*; subtitle *Track active projects, sessions and delivered work.* (copy deck › *Dashboard subtitle*, approved by the Owner 2026-10-14; it no longer names the workspace).
- **New project** is the header's primary action and opens the new-project page (F-07).
- No greeting (Owner 2026-10-14).

### 2. Metrics (four tiles, lifecycle order)

| # | Tile | Counts | Badge | Chart |
|---|---|---|---|---|
| 1 | **New projects** | projects created in the current calendar month, any status (Owner 2026-10-14: no booking time is stored, so creation stands for it) | trend | 7 months |
| 2 | **To review** | selection groups the Owner can lock: `SUBMITTED`, or `OPEN` with a recorded submission (BR-SEL-005), on a project that is not `CANCELLED` | warning badge *{count} waiting* when the count is above 0 | ring: share waiting 3 days or more |
| 3 | **In editing** | projects in `POST_PROCESSING` (final delivery not yet published, BR-DEL-003) | — | ring: share ready to edit |
| 4 | **Delivered** | projects, not `CANCELLED`, whose final delivery was published in the current calendar month (`gallery.final_delivery_published_at`) | trend | 7 months |

*This month* is the calendar month of *today* in `Asia/Jakarta`. Labels fit one line (copy deck §4.3b) and carry no period caption, although tiles 1 and 4 count this month and tiles 2 and 3 count now (Owner 2026-10-14: "tidak perlu ada tulisan this month"). Tiles are not links (A-6).

**Trend badge (tiles 1 and 4, Owner 2026-10-14):** this month so far against the same days of last month (on 14 Oct: 1–14 Oct against 1–14 Sep; when last month is shorter, its last day stands for the missing days). The badge shows the difference with its sign: *+2* in the positive tone (Metric Delta/Positive), *−2* in the warning tone (Metric Delta/Warning; the design system has no negative tone), and no badge when the difference is 0.

**Sparkline (tiles 1 and 4, Owner 2026-10-14):** one bar per calendar month, the six previous months and the current one (current bar highlighted), each the same count as the tile for that month, computed from `project.created_at` and `gallery.final_delivery_published_at`. Tiles 2 and 3 have no sparkline: their counts are live and no history of them is stored, and none is added.

**Ring (tiles 2 and 3, Owner 2026-10-14):** a small ring whose filled part is a share of the tile's count, read from stored data at load:
- *To review*: the groups whose submission (`selection_group.submitted_at`) is 3 or more days before now (A-7).
- *In editing*: the projects whose selection groups are all `LOCKED`, so the edit list is final ("ready to edit"); a project with no selection group counts as ready (A-7).

An empty ring shows when the share is 0, and no ring when the count is 0. The ring is a feature-local element built from the Metric Tile's chart tokens; the library has no ring component.

### 3. Active projects (table)
- **Title:** *Active projects* (Owner 2026-10-15, chosen over *Bookings & production*).
- **Rows:** active projects, the statuses of the project list's *Active* tab (`DRAFT`, `BOOKED`, `SHOOTING`, `POST_PROCESSING`, `DELIVERED`). At most 10 rows (A-2).
- **No tabs** (Owner 2026-10-14): the table always lists all active projects.
- **Search** (Owner 2026-10-14: "with search"): the table header holds the project list's search field (*Search by project title or client name*), which narrows the table to projects whose title or client name contains the text, ignoring case, as on the project list (F-07 spec › *Search and filter*).
- **Filter** (Owner 2026-10-14: "add filter like filter on project page"): next to the search, the project list's filter icon button, and it opens the project list's *Filter projects* dialog reused unchanged (F-07 spec › *Filter*, A-11; modal on desktop, bottom sheet on phones): *Status* (the five active statuses), *Schedule* from/to with *Include projects without sessions*, *Service*, *Client*. *Apply* narrows the table, *Reset* clears it, and while filters are active the button shows the red counter with the number of active filter groups. Search and filters apply together (A-8).
- **Columns:**

| Column | Value |
|---|---|
| Project | project title (a link to the project page), with the client's name under it and the client's initials avatar |
| Next session | the earliest session dated today or later: *Today*, *Today, 09:00*, *Sat 18 Oct, 07:00*; the start time only when set; *Not scheduled* when there is none (draft copy; no em dash in UI text) |
| Status | the project status chip, as on the project list |
| Agreed price | `project.agreed_price` in IDR (Owner 2026-10-14: shown; it is not an invoice figure) |
| ⋯ | the project row menu (below) |

- **Order:** projects with a next session first, by that session's date, then start time (untimed first), then session creation (BR-TEAM-003); then projects without one, oldest created first (A-3).
- **Footer:** *Showing {shown} of {total} active projects*, where *total* counts the active projects that match the search and filters (all of them when none is set), and **View all projects**, which opens the project list's *Active* tab with the same search and filters.
- **No match:** with a search or filters set and no matching project, the table shows the project list's no-match state (*No matching projects*), whose *Clear search* clears the search and the filters.

### 4. Row menu
The ⋯ menu is the project list's menu, reused unchanged (F-07 spec › row menu, AC-PRJ-027; `buildProjectMenu`, `ProjectMenu`), Owner 2026-10-14:
- the next step for the status (*Confirm booking*, *Start shoot*, *Finish shoot*) and *Edit project info*;
- the *Send to client* group: *Chat on WhatsApp* (opens `wa.me` with the client's number), or *Add WhatsApp number* when the client has none;
- *Delete draft* for a `DRAFT`, *Cancel project* for `BOOKED` and `SHOOTING`.

Each item keeps its existing dialog, toast and stale-status handling. After an action the dashboard reads its data again, so the tiles and the table match the new state. On a phone the menu is the existing bottom sheet.

## Main Flow
1. The Owner opens the workspace dashboard (`/w/{workspaceId}`).
2. The server verifies the workspace (BR-WS-003), finds it has a project, and reads the four counts and the first 10 active projects in a few cheap queries (ADR-018).
3. The dashboard shows the page header, the metric tiles and the table on *All*.
4. The Owner searches or filters the table, opens a project, follows *View all projects*, or acts from a row menu.
5. Coming back, or finishing a menu action, reads the data again; nothing is cached across requests or stored.

## Alternative Flows
- **A1 No active project:** every project is `COMPLETED` or `CANCELLED`. The overview still shows (not the checklist); the table shows its empty state with **View project list**. Tiles show their counts, which can be 0.
- **A2** (empty tab): withdrawn 2026-10-14 with the tabs.
- **A3 Nothing to review:** *To review* shows 0 with no badge.
- **A4 The last project is deleted** (*Delete draft* from the row menu or elsewhere, BR-PRJ-010): the workspace has no project again, and the dashboard shows F-25's checklist.
- **A5 A status changes between load and action:** the existing stale handling of the project menu applies (*The project status has changed*, then a refresh).
- **A6 Language:** all labels follow the Owner's language (BR-L10N-001/002). Project titles, client and session names are shown as stored (BR-L10N-004). Dates, times and money are formatted in the current language.

## Error Cases
- **E1 Workspace not owned or missing:** the existing owner not-found handling (BR-WS-003); no data is read.
- **E2 A read fails:** the existing owner error page with retry (C-007). No tile or table shows partial or stale numbers as if they were complete.
- **E3 A menu action fails:** the project menu's existing error handling.

## Business Rules
- BR-WS-002, BR-WS-003 — workspace-scoped reads, verified context.
- BR-PRJ-004 — statuses, order and steps; BR-PRJ-005 — completion is manual; BR-PRJ-010 — deleting drafts.
- BR-TEAM-002, BR-TEAM-003 — sessions, ordering, workspace wall-clock dates.
- BR-SEL-005 — which groups the Owner can lock.
- BR-DEL-003 — publishing final delivery moves a project out of `POST_PROCESSING`.
- BR-MSG-001, BR-CLI-002 — the WhatsApp chat link and client numbers (through the reused menu).
- BR-L10N-001, BR-L10N-002, BR-L10N-004 — copy and stored values.

## Dependencies
- F-25 `setup-checklist` (DONE): `loadDashboard` already chooses the checklist or the placeholder; this feature replaces the placeholder branch. F-25's statement "after the first project the dashboard returns to the placeholder" is superseded by F-26 (FC-002).
- F-07 `projects`: project list tabs and status filter (`?status=`), project page, new-project page, the row menu and its dialogs (AC-PRJ-027), the schedule time zone.
- F-09 `gallery`, F-10 `client-access`: selection group status and submission, final-delivery time.
- F-22: copy rules; new copy drafted with Codex, approved by the Owner, rows added to the copy deck.

## Out of Scope
- Invoice, payment, revenue or balance figures (F-14). The agreed price is shown; nothing derived from it (totals, deposits, balances).
- The four summaries of the 2026-10-13 spec as separate parts: *Needs you*, *Upcoming sessions* (7-day list), *Projects by status*, *Galleries expiring soon* (Owner 2026-10-14, replaced by the tiles and the table).
- Exports, analytics beyond the two tile trends, per-team-member views, activity feed, "last viewed", or any new stored data.
- Owner-chosen windows or tabs on the table (tabs removed, Owner 2026-10-14); the search and filter are the project list's, nothing more.
- *Set up branding* on the dashboard (dropped, Owner 2026-10-12); Settings is unchanged.
- New project actions: the dashboard only reuses the project list's menu.
- Notifications or reminders (F-15).

## Assumptions (low-risk, reversible)
- **A-1 Today and this month:** the calendar day and month in the schedule time zone F-07 and F-09 use (`Asia/Jakarta`). See FC-001.
- **A-2 Table length:** 10 rows (Owner 2026-10-14: "show ten data"), then the footer count and *View all projects*.
- **A-3 Order without a session:** oldest created first, so the longest-waiting project is on top.
- **A-4** (zero counts in *Projects by status*): withdrawn 2026-10-14 with that part.
- **A-5** (greeting periods): withdrawn 2026-10-14 with the greeting.
- **A-7 Ring thresholds:** 3 days for *To review*; *ready to edit* = every selection group of the project is `LOCKED`, or it has none (Owner 2026-10-14: accepted the recommendation).
- **A-8 Dashboard search and filter:** the search text (`?q=`) and the filters are kept in the dashboard URL with the project list's parameter names, so a reload keeps them and *View all projects* passes them on; they narrow the table only, never the tiles.
- **A-6 Tiles are not links:** the table and the project list are the way to the projects behind a number.

## Flagged Concerns
Checked against the constitution (C-001…C-012, C-101…C-106), the rules listed above, ADR-003, ADR-015, ADR-018, F-07's spec and F-25's spec.

| ID | Concern | Conflicting sources | Owner decision | Status |
|---|---|---|---|---|
| FC-001 | No business rule names the workspace time zone. BR-TEAM-003 says session times are "local wall-clock times of the workspace", but BR-WS-004 gives a workspace no time zone. F-07 and F-09 fix `Asia/Jakarta` as a feature-level decision. | BR-TEAM-003, BR-WS-004, F-07 spec, F-09 spec | Use `Asia/Jakarta`, as F-07 and F-09 do (Owner 2026-10-13) | RESOLVED |
| FC-002 | F-25's spec and design say the dashboard returns to the placeholder after the first project; F-26 replaces it. | F-25 spec, F-25 design.md | "Superseded by F-26" note in F-25 (Owner 2026-10-13) | RESOLVED |
| FC-003 | The accepted intent made the dashboard read-only, excluded trends, and listed four summaries; the design direction adds the project row menu and replaces the summaries with tiles and a table. | intent.md (Constraints, Out of scope, Owner answers) | Follow the design; the intent records the revision (Owner 2026-10-14: "reuse the existing menu, update the spec") | RESOLVED |
| FC-004 | *New projects* (this month) would ideally count bookings, but no booking time is stored (`project` has `created_at`, no `booked_at`). | intent (no new stored data) | Count projects created this month (Owner 2026-10-14) | RESOLVED |
| FC-005 | The approved layout rule says to use the full content container (1096) for dashboards and tables; the Owner chose the 720 centered column (`size.content-narrow`). At 720 the table drops the *Service* column. | `docs/design-system/layouts/centered-narrow-content.md`, `token-usage.md` §4.5 | Use 720 for this dashboard; recorded as an accepted layout exception in `design.md` (Owner 2026-10-14: "720") | RESOLVED |
| FC-006 | The intent excludes "charts, trends over time"; the Owner keeps the Metric Tile's trend badge and sparkline, and adds a ring to the live tiles. | intent.md (Out of scope) | Trend and sparkline on the two monthly tiles (Owner 2026-10-14: "di pakai"); ring on *To review* and *In editing* (Owner 2026-10-14: "Chart option D — ring", chosen over a split bar, age bars and a shoot-date split) | RESOLVED |

## Open Questions / SPEC GAPS
- **Q-1 Trends and sparklines:** resolved 2026-10-14 (FC-006, *Metrics*).
- **Q-2 Phone and tablet:** how the tiles and the table sit on a phone (cards instead of table rows) and on a tablet is for `/sdv:design-feature`.
