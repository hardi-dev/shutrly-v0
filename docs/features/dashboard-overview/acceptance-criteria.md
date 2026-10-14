# Acceptance Criteria — Dashboard overview (F-26)

IDs are stable and never reused. Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible). Wording in *italics* stands for copy-deck rows still to be drafted (Codex) and approved by the Owner, or existing rows reused; tests read copy from the catalogue, not literals. Layout follows the Pencil frames from `/sdv:design-feature`. *Today* and *this month* are in `Asia/Jakarta` (FC-001); tests fix the clock.

Revised 2026-10-14 to the Owner's design direction (spec FC-003): AC-DASH-004…017 are withdrawn with the four summaries and the read-only rule; AC-DASH-021…037 replace them.

## Visibility

## AC-DASH-001 — A workspace with a project shows the overview
Covers: BR-WS-003, BR-PRJ-004

**Given** an Owner whose workspace has at least one project, in any status
**When** the dashboard opens
**Then**:
- it shows the page header with *New project*, the four metric tiles and the *Active projects* table;
- the F-25 checklist, the F-02 placeholder and *Set up branding* are not shown.

## AC-DASH-002 — A workspace without a project still shows the checklist
Covers: BR-WS-003

**Given** a workspace with no project (new, or after its only draft was deleted, BR-PRJ-010)
**When** the dashboard opens
**Then** F-25's setup checklist shows and none of the overview does.

## AC-DASH-003 — Only this workspace's data
Covers: BR-WS-002, BR-WS-003

**Given** an Owner with workspaces *A* and *B*, each with projects, sessions, groups and galleries that would count
**When** the Owner opens *A*'s dashboard
**Then** every count and row comes from *A* only, and opening the dashboard of a workspace the Owner doesn't own shows the existing not-found page with no data read.

## Withdrawn (2026-10-14)

- AC-DASH-004 Drafts to confirm, AC-DASH-005 Selections to review, AC-DASH-006 Editing in progress, AC-DASH-007 Nothing needs the Owner — *Needs you* replaced by the tiles and the table.
- AC-DASH-008 Sessions in the next 7 days, AC-DASH-009 Session order and statuses, AC-DASH-010 No upcoming sessions — replaced by the *Next session* column (AC-DASH-027).
- AC-DASH-011 Counts per status, AC-DASH-012 A status opens the matching list, AC-DASH-013 Only cancelled projects — *Projects by status* dropped; see AC-DASH-031.
- AC-DASH-014 Published galleries expiring in 7 days, AC-DASH-015 Expiry order and empty state — *Galleries expiring soon* dropped.
- AC-DASH-016 Long lists — replaced by AC-DASH-026.
- AC-DASH-017 Read-only and fresh — replaced by AC-DASH-030 (the row menu acts).

## Page header

## AC-DASH-021 — Header and New project
Covers: BR-L10N-001

**Given** an Owner on the overview
**When** the dashboard opens in EN
**Then** the page header shows *Dashboard* with the *Dashboard subtitle* row, and no greeting; its primary action **New project** opens the new-project page.

## Metrics

## AC-DASH-022 — New projects (this month)
Covers: BR-PRJ-004

**Given** today is 2026-10-14 and projects created on 2026-09-30, 2026-10-01 (later `CANCELLED`), 2026-10-10 and 2026-10-14
**When** the dashboard opens
**Then** *New projects* shows 3.

## AC-DASH-023 — To review
Covers: BR-SEL-005

**Given** selection groups that are `SUBMITTED`; `OPEN` with a recorded submission below the limit; `OPEN` never sent; and `LOCKED`; plus a `SUBMITTED` group on a `CANCELLED` project
**When** the dashboard opens
**Then** *To review* shows 2 with the warning badge *2 waiting*; with no group to review it shows 0 and no badge.

## AC-DASH-024 — In editing
Covers: BR-PRJ-004, BR-DEL-003

**Given** projects in `SHOOTING`, `POST_PROCESSING` (2) and `DELIVERED`
**When** the dashboard opens
**Then** *In editing* shows 2.

## AC-DASH-025 — Delivered (this month)
Covers: BR-DEL-003

**Given** today is 2026-10-14 and galleries whose final delivery was published on 2026-09-30, 2026-10-02 and 2026-10-13, plus one published 2026-10-05 whose project was later `CANCELLED`
**When** the dashboard opens
**Then** *Delivered* shows 2, and a final delivery published at 2026-09-30 23:30 `Asia/Jakarta` counts for September, not October.

## Active projects table

## AC-DASH-026 — Rows, columns and cap
Covers: BR-PRJ-004, BR-TEAM-003

**Given** 12 active projects (`DRAFT` to `DELIVERED`), plus one `COMPLETED` and one `CANCELLED`
**When** the dashboard opens
**Then** the table, which has no tabs, lists 10 active projects only, each with project title, client name and initials, next session, status chip and agreed price in IDR (no service column, spec FC-005), and the footer reads *Showing 10 of 12 active projects* with *View all projects*, which opens the project list's *Active* tab.

## AC-DASH-027 — Next session and order
Covers: BR-TEAM-003

**Given** today is 2026-10-14 and active projects with: a session today without a start time; a session today at 09:00; a past session 2026-10-12 and the next one 2026-10-18 07:00; no session from today on
**When** the dashboard opens
**Then** *Next session* reads *Today*, *Today, 09:00*, *Sun 18 Oct, 07:00* (ID *Min, 18 Okt, 07.00*; the locale's date order, technical design D-11) and *No sessions scheduled*, and the rows are in that order (untimed first on the same day, projects without a next session last, oldest created first, A-3).

## AC-DASH-028 — Tabs

Withdrawn 2026-10-14: the table has no tabs (Owner).

## AC-DASH-037 — Search the table
Covers: BR-PRJ-004

**Given** 12 active projects, two of them for the client *Rina Putri*, and one `COMPLETED` project titled *Wisuda Rina 2025*
**When** the Owner types *rina* in the table's search field
**Then** the table lists the two active projects only, the footer reads *Showing 2 of 2 active projects*, the tiles do not change, *View all projects* opens the project list's *Active* tab with `?q=rina`, and a search that matches nothing shows *No matching projects* with *Clear search*, which clears the search and the filters.

## AC-DASH-036 — Filter the table
Covers: BR-PRJ-004, BR-TEAM-003

**Given** 12 active projects, 3 of them `BOOKED` for the service *Wedding Premium*
**When** the Owner opens the table's filter button, picks *Booked* and *Wedding Premium*, and applies
**Then**:
- the dialog is the project list's *Filter projects* (AC-PRJ-028), with *Status* offering only the five active statuses;
- the table lists the 3 projects, the footer reads *Showing 3 of 3 active projects*, the button shows the counter *2*, and the tiles do not change;
- *View all projects* opens the project list's *Active* tab with the same two filters, and a reload of the dashboard keeps them;
- *Reset* shows all active projects again; filters that match nothing show the no-match state, whose action clears them.

## AC-DASH-029 — Empty table
Covers: BR-PRJ-004

**Given** a workspace whose projects are all `COMPLETED` or `CANCELLED`
**When** the dashboard opens
**Then** the overview still shows (not the checklist), the table shows *No active projects* with *View project list*, which opens the project list, and the tiles show their counts.

## Row menu

## AC-DASH-030 — The project row menu is reused
Covers: BR-PRJ-004, BR-PRJ-010, BR-MSG-001, BR-CLI-002

**Given** the table rows of AC-PRJ-027's projects that are active (`BOOKED`, `SHOOTING`, `DRAFT` with a client without a number)
**When** the Owner opens each row's ⋯ menu
**Then**:
- each menu has the same items, order, groups and dividers as on the project list (AC-PRJ-027): the step and *Edit project info*, the *Send to client* group with *Chat on WhatsApp* or *Add WhatsApp number*, then *Delete draft* or *Cancel project*;
- every item behaves as on the project list (its dialog, toast and stale-status handling), and *Chat on WhatsApp* opens `https://wa.me/<number>` in a new tab;
- after a step, a cancel or a draft deletion, the tiles and the table show the new state; deleting the workspace's only project shows the checklist (AC-DASH-002).

## AC-DASH-033 — Trend badge on the monthly tiles
Covers: BR-PRJ-004, BR-DEL-003

**Given** today is 2026-10-14, 4 projects created 1–14 Oct and 3 created 1–14 Sep (plus 5 more created 15–30 Sep), and 1 final delivery published 1–14 Oct against 3 on 1–14 Sep
**When** the dashboard opens
**Then** *New projects* shows the badge *+1* in the positive tone, *Delivered* shows *−2* in the warning tone, a difference of 0 shows no badge, and *To review* and *In editing* show no trend badge.

## AC-DASH-034 — Sparkline on the monthly tiles
Covers: BR-PRJ-004, BR-DEL-003

**Given** projects created and final deliveries published in each of April to October 2026, today 2026-10-14
**When** the dashboard opens
**Then** *New projects* and *Delivered* each show seven bars, April to October, each the month's count, with October highlighted; *To review* and *In editing* show no bars.

## AC-DASH-035 — Ring on the live tiles
Covers: BR-SEL-005, BR-PRJ-004

**Given** now is 2026-10-14 10:00 and two groups to review, submitted 2026-10-10 and 2026-10-13; and four `POST_PROCESSING` projects: two whose groups are all `LOCKED`, one with no selection group, one with an `OPEN` group
**When** the dashboard opens
**Then** *To review* shows a ring half filled (1 of 2 waiting 3 days or more), *In editing* shows a ring three-quarters filled (3 of 4 ready to edit), a share of 0 shows an empty ring, and a count of 0 shows no ring.

## Common

## AC-DASH-031 — Only completed or cancelled projects
Covers: BR-PRJ-004

**Given** a workspace whose only projects are `CANCELLED`
**When** the dashboard opens
**Then** the overview shows (not the checklist), *To review*, *In editing* and *Delivered* show 0, and the table shows its empty message.

## AC-DASH-032 — Fresh on every visit
Covers: BR-PRJ-004, BR-PRJ-005

**Given** the dashboard is open
**When** the Owner confirms a draft on its project page and comes back
**Then** the tiles and the table reflect the change; nothing is cached across requests.

## AC-DASH-018 — Language
Covers: BR-L10N-001, BR-L10N-002, BR-L10N-004

**Given** the Owner switches between EN and ID
**When** the dashboard opens
**Then** every label, empty message, status name, date, time and amount is in that language, and project titles, client and session names are shown as stored.

## AC-DASH-019 — Error
Covers: BR-WS-003

**Given** a read fails while the dashboard loads
**When** the page renders
**Then** the existing owner error page with retry shows, never a tile or table with partial numbers.

## AC-DASH-020 — Accessibility
Covers: C-008

**Given** the overview
**When** used by keyboard and screen reader
**Then** the page has one heading and the table a heading, each tile's number is read with its label, every row's project is a link and its ⋯ button is named *Actions for {project}* (the existing menu label), every focusable element has a visible focus ring, and the page has no axe violations on desktop and phone.
