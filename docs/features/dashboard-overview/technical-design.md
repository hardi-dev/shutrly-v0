# Technical Design — Dashboard overview (F-26)

Status: IN PROGRESS (built 2026-10-15, awaiting verification) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) · Design: [design.md](design.md), [exports/INDEX.md](exports/INDEX.md) · Plan: [plan.md](plan.md)

## Context
Today `/w/{workspaceId}` renders `DashboardScreen` (`features/workspace`). It shows F-25's checklist while the workspace has no project, and otherwise the F-02 placeholder (a greeting, *Set up branding*). `loadDashboard` (`composition/workspace/dashboard-flow`) verifies the workspace and reads the setup facts in one statement.

F-26 replaces the placeholder branch with the overview: the page-header action *New project*, four metric tiles, and the *Active projects* table. The table has the project list's search, filter and row menu. Every value is read from stored data on each request. There is no migration and no new dependency.

Most of the overview reuses F-07 code in `features/booking`: the row menu (`ProjectMenuHost`, `PROJECT_MENU_ACTIONS`), the search field, the filter button and dialog, the status chip, the empty state, the URL grammar (`parseProjectListParams`, `filterToParams`) and the SQL search and filter predicates (`project-list-sql.ts`). A feature never imports another feature, so the overview lives in **`features/booking`**. The workspace dashboard receives it as a slot (D-1).

## Relevant authority
- Constitution: C-004, C-007, C-008, C-009, C-010, C-101, C-105.
- Business rules: BR-WS-002/003, BR-PRJ-004/005/010, BR-TEAM-003, BR-SEL-005, BR-DEL-003, BR-MSG-001, BR-CLI-002, BR-L10N-001/002/004.
- Acceptance criteria: AC-DASH-001…003, 018…027, 029…037 (004…017 and 028 are withdrawn).
- ADRs:
  - ADR-003 (workspace isolation);
  - ADR-009 (per-request pool);
  - ADR-010 (React Aria in `src/ui`);
  - ADR-014 (Storybook for `src/ui`);
  - ADR-015 (URL-scoped workspace);
  - ADR-016 (cross-feature work in composition);
  - ADR-018 (free-tier budget);
  - ADR-025 (next-intl).
- Flagged concerns, all RESOLVED:
  - FC-001: `Asia/Jakarta`.
  - FC-002: F-25 superseded.
  - FC-003: the row menu is reused.
  - FC-004: *New projects* counts `created_at`.
  - FC-005: the page uses the 720 column, with no *Service* column.
  - FC-006: trend and sparkline on tiles 1 and 4, a ring on tiles 2 and 3.

## Decisions
| ID | Decision | Why |
|---|---|---|
| D-1 | The overview's domain, port, use case and UI live in `features/booking`. `DashboardScreen` (workspace) gets an `overview: ReactNode` prop that replaces `DashboardPlaceholder`. The page builds `<DashboardOverview …>` and passes it in. `app/` may import both features' `ui`. | It reuses F-07's menu, filter and SQL without a feature-to-feature import (coding rules › Import boundaries). |
| D-2 | `loadDashboard` keeps one verification and the setup-facts read. When `checklist` is `null`, it calls the booking composition's `loadDashboardOverview(context, params, now)` with the already verified context. | No second ownership check. AC-DASH-002 is unchanged. |
| D-3 | Two read statements per overview: **metrics** (scalar subqueries plus two monthly series as JSON) and **active projects** (one page of 10 plus `count(*) over ()`). The filter options are read by the existing `loadFilterServices` and `findFilterClient`. | ADR-018: about 5 round trips per document request, the same order as the project list. |
| D-4 | `now` is injected (`new Date()` in composition) and turned into windows by a pure domain function. *Today* and the month boundaries are dates in `PROJECT_SCHEDULE_TIME_ZONE`. SQL converts each date with `(${d}::date)::timestamp at time zone ${tz}`, and counts stop at `<= now`. | AC-DASH-022, 025 and 033 fix the clock. A final delivery at 2026-09-30 23:30 Jakarta counts for September. |
| D-5 | **Trend:** this month = `[monthStart, now]`; the same days of last month = `[prevMonthStart, min(prevMonthStart + dayOfMonth days, monthStart))`. The cap means last month's last day stands in for the missing days. The delta is the difference of the two counts; 0 means no badge. | Spec › *Trend badge*. |
| D-6 | **Sparkline:** SQL groups `to_char(ts at time zone tz, 'YYYY-MM')` from `sparkStart` (the first day of the month 6 months back) to `now`. The domain fills the seven month keys and puts 0 where a month is missing. The last bar is current. | AC-DASH-034; no stored history. |
| D-7 | **Ring:** SQL returns the parts: `to_review_waiting` (`submitted_at <= now - interval '3 days'`, `REVIEW_WAITING_DAYS = 3`, A-7) and `in_editing_ready` (no group of the project with `status <> 'LOCKED'`). The domain returns `null` for no ring when the count is 0, otherwise `{ part, total }`. | AC-DASH-035; the rule constant is named, not inline. |
| D-8 | **Table SQL** is a new builder, `dashboard-projects-sql.ts`, beside `project-list-sql.ts`. It reuses that file's search and filter predicates (exported, unchanged). Its session join `nextSessionJoin(today)` takes only sessions dated today or later (no past fallback, unlike the list's `shownSessionJoin`). It orders by `(n_date is null), n_date, n_start nulls first, n_created, created_at asc, id`, limits to `DASHBOARD_TABLE_LIMIT = 10` (A-2), and carries `count(*) over () as total`. | AC-DASH-026/027/036/037. The list's order (latest first, past fallback) differs, so its SQL is not changed. |
| D-9 | **Row type** `ActiveProjectRow` = the `ProjectListRow` fields plus `agreedPrice: string`, mapped with `canonicalIdrAmount` as the project repository does, because `formatIdr` parses it with `BigInt` and a raw `numeric(18,3)` text such as `1500000.000` would throw (ADR-007). `shownSession` holds the *next* session or `null`. The menu target builder `rowTarget` moves from `projects-screen.tsx` to `project-menu-host/project-row-target.ts`, so the list and the dashboard share it. | One menu (AC-DASH-030), with no copy of it. |
| D-10 | **URL:** the dashboard reads `q` and the filter with `parseProjectListParams(params, "ACTIVE")`. `ProjectSearchField` and `useFilterDraft`/`ProjectFilterDialog` get an optional `basePath` (default `projectTabPath(workspaceId, tab)`). `projectListUrl` is split into `listUrlAt(path, q, filter)`. The project list's behaviour is unchanged. | A-8; the search and dialog are reused unchanged in behaviour. |
| D-11 | **Next session label:** the domain function `nextSessionLabel(session, today)` returns `NONE` / `TODAY` / `TODAY_AT {time}` / `DATE {date, time}`. The UI renders *No sessions scheduled* (§7.1 `metaNoSchedule`), *Today*, *Today, {time}* (§4.3b), or for another day one locale `Intl.DateTimeFormat` with weekday, day, month and, when set, hour and minute (`hourCycle: "h23"`, UTC from the wall-clock fields). That is no year and no new copy row. The export's *Sat 18 Oct, 07:00* is sample text (18 Oct 2026 is a Sunday); EN renders in the app's `en-US` order (*Sun, Oct 18, 07:00*), ID as *Min, 18 Okt, 07.00* (checked with Node `Intl`). | It stays consistent with every other date in the app (`DATE_FORMATS` in `booking/domain/session/session.ts`) and needs no translated fragment. The order difference is reported at verification. |
| D-12 | **Empty states:** the table shows no rows with no `q` and no active filter → *No active projects* (§4.3b, `EmptyState`, `folder-kanban`, action *View project list* → `projectTabPath(ACTIVE)`), with search, filter and footer hidden. No rows with `q` or a filter → the project list's no-match state (`ProjectsEmptyState`, `hasQuery`), whose *Clear search* goes to `/w/{id}` and clears both. | AC-DASH-029/031/037; the design's `od6HS` and `f4pyy` frames. |
| D-13 | **New `src/ui` units:** `patterns/metric-tile` (label, value, optional delta, optional `chart` slot), `primitives/metric-delta` (positive and warning tones), `patterns/metric-spark` (7 bars), `patterns/metric-ring` (an SVG ring from the tile's spark tokens, inner radius 0.68, 28 px, design.md exception). `DataTable` gets an optional `footer`. Each unit has a story and a test. | The library has C26 and C15 but the code has none (ADR-014). The ring is the accepted local element. |
| D-14 | The dashboard subtitle row (`owner-nav.copy.ts › dashboardSubtitle`) becomes the approved *Track active projects, sessions and delivered work.* with no `{workspaceName}`, in both states (copy deck §1, 2026-10-14). `DashboardPlaceholder` and its rows (`greeting`, `subtitle`, `emptyTitle`, `emptyBody`, `settings`) are removed. | Spec › Page header; *Set up branding* is dropped. |

No ADR: D-1…D-14 stay inside the accepted architecture.

## Database changes
None. There is no migration and no index. Every subquery filters on `workspace_id`, and the joins use the composite tenant keys. The volume per tenant is small (ADR-018 capacity estimate). If plans show sequential scans on `project.created_at` or `gallery.final_delivery_published_at` once tenants grow, add an index then (R-2).

## Server / API interface
- **Port** `features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port.ts`:
  - `readMetrics(context, windows: MetricWindowsSql): Promise<MetricFacts>`
  - `listActiveProjects(context, query: { search, filter, today, limit }): Promise<{ rows: readonly ActiveProjectRow[]; total: number }>`
- **Adapter** `adapters/db/project-repository/drizzle-dashboard-overview-reader.ts`, plus `dashboard-metrics-sql.ts` and `dashboard-projects-sql.ts`. Rows are parsed with Zod (`*.schema.ts`), as `drizzle-setup-facts-reader` does.
- **Use case** `features/booking/application/use-cases/load-dashboard-overview/`: `loadDashboardOverview(reader, context, { q, filter, now })` → `DashboardOverview { tiles, table: { rows, total, q, filter } }`. It is a per-consumer aggregate (coding rules › Files).
- **Composition** `composition/booking/dashboard-overview-flow/`: `loadDashboardOverview(context, params, now)` wires the reader on the request DB (`withProjectScope` or `withRequestDb`) and adds `services` and `filterClient` for the dialog. `composition/workspace/dashboard-flow` → `loadDashboard(rawId, params)` returns `{ workspace, checklist, overview | null }`.
- **Route** `app/(owner)/w/[workspaceId]/page.tsx` passes `searchParams` through, then renders `DashboardScreen` with `overview={data.overview ? <DashboardOverview … menuActions={PROJECT_MENU_ACTIONS} searchClientsAction={searchFilterClientsAction}/> : null}`.
- **Server actions:** none new. The menu reuses `PROJECT_MENU_ACTIONS`, and the filter's client search reuses `searchFilterClientsAction`.

## Domain / application logic
`features/booking/domain/dashboard-metrics/` (pure, unit-tested):
- `metricWindows(now: Date): MetricWindows` returns `today`, `monthStart`, `prevMonthStart`, `prevEnd` (D-5), `sparkStart`, and `months` (7 `YYYY-MM` keys, oldest first), all from `todayInScheduleZone(now)`.
- `buildMetricTiles(facts: MetricFacts, windows): MetricTiles`. Its four tiles are, in order:
  - `newProjects`: value, trend delta, spark;
  - `toReview`: value, waiting badge count, ring;
  - `inEditing`: value, ring;
  - `delivered`: value, trend, spark.
  - Trend: `{ delta, tone: delta > 0 ? "positive" : "warning" } | null` when the delta is 0.
  - Spark: 7 numbers.
  - Ring: `{ part, total } | null`.
- Constants `REVIEW_WAITING_DAYS = 3` (A-7) and `DASHBOARD_TABLE_LIMIT = 10` (A-2), each with its assumption ID in a comment.

`features/booking/domain/session/`: adds `nextSessionLabel(session | null, today)` (D-11) and `formatSessionDayTime(session, locale)` (no year).

Counting rules (SQL; the integration tests are the authority):

| Fact | Rule |
|---|---|
| `new_this_month` / `new_prev` | `project` in the workspace, any status, `created_at` in the window |
| `to_review` | `selection_group` with `status = 'SUBMITTED' or (status = 'OPEN' and submitted_at is not null)`, joined to a project `<> 'CANCELLED'` (BR-SEL-005) |
| `to_review_waiting` | the same, plus `submitted_at <= now - 3 days` |
| `in_editing` | `project.status = 'POST_PROCESSING'` |
| `in_editing_ready` | the same, plus `not exists` a group of that project with `status <> 'LOCKED'` |
| `delivered_this_month` / `delivered_prev` | `gallery.final_delivery_published_at` in the window, joined to a project `<> 'CANCELLED'` |
| `new_by_month` / `delivered_by_month` | the same predicates from `sparkStart`, grouped by Jakarta month |

## UI components
All in `features/booking/ui/` unless noted. The client boundary is `DashboardOverview` (`"use client"`, like `ProjectsScreen`).

| Unit | Role |
|---|---|
| `dashboard-overview/` | The root: `<PageActions><NewProjectButton/></PageActions>` on desktop, tiles, `ProjectMenuHost` around the table or the list, `ProjectFilterDialog` with `basePath`. It switches by `useMobileViewport()`. Container `max-w-(--size-content-narrow)` (FC-005). |
| `dashboard-metric-tiles/` | Maps `MetricTiles` to four `MetricTile`s: desktop one row (gap `space.4`), phone 2×2 (gap `space.3`). Screen-reader texts from §4.3b. |
| `dashboard-projects-table/` | `SectionCard` (bleed) with the title *Active projects*, a search row (`ProjectSearchField` + `ProjectFilterButton`), and a `DataTable` with columns project (fill: link, client initials and name), next session 150, status 130, agreed price 110 (`formatIdr`), actions 32. The footer has the count and *View all projects* → `listUrlAt(projectTabPath(ACTIVE), q, filter)`. |
| `dashboard-projects-list/` | Phone: `SectionCard` flush with `ListCardItem` rows (meta *client · next session*, trailing chip and menu), the footer count, and a full-width secondary *View all projects*. |
| `dashboard-next-session/` | Renders D-11's label; *No sessions scheduled* in `text.muted` (design exception). |
| `dashboard-empty/` | D-12's two states. |
| `project-menu-host/project-row-target.ts` | D-9, moved from `projects-screen.tsx`. |
| `src/ui/primitives/metric-delta`, `src/ui/patterns/metric-tile`, `metric-spark`, `metric-ring`; `DataTable.footer` | D-13 |

Not built: an overview-specific loading skeleton (the dashboard route keeps its existing loading UI) and an error UI (the owner error page).

## Validation
- `workspaceId` is verified by `enterWorkspace` (C-004, BR-WS-003).
- Search params go through `parseProjectListParams`. Unknown parts are dropped, `q` is trimmed and capped by `projectSearchSchema`, and UUIDs are checked. `status` keeps only the active statuses.
- DB rows are parsed with Zod in the adapter. An invalid status row is dropped, as in the list reader.

## Error handling
- A read failure propagates to the owner error page with retry (E2, AC-DASH-019). Nothing is partially rendered, because the page awaits the whole `loadDashboard`. As in F-25's `loadDashboard`, the flow adds no catch of its own.
- A workspace that isn't owned shows the existing not-found page from `enterWorkspace` (E1, AC-DASH-003).
- Menu actions keep the existing dialogs, toasts and stale handling (E3, A5). After success, `router.refresh()` re-runs the page (AC-DASH-030/032).

## Concurrency / consistency
It is read-only, with no transaction. The two statements may see slightly different instants. That is acceptable for a dashboard, because the next request reads fresh and nothing is cached (`searchParams` makes the route dynamic, AC-DASH-032). Writes stay in the reused menu actions, which already lock and check stale state.

## Security
- Every subquery and join is scoped by `workspace_id` (C-101). The isolation integration test seeds two workspaces (AC-DASH-003).
- No new action, and nothing secret is read. The client WhatsApp number reaches the browser only as the existing menu does (BR-MSG-001). Money is formatted from the decimal string (C-105).

## Testing strategy
| AC | Test |
|---|---|
| 022, 023, 024, 025, 033, 034, 035 | Unit: `dashboard-metrics.test.ts` (windows on 14 Oct and 31 Oct/1 Mar, September 23:30 boundary, trend sign and zero, spark fill, ring null/0/part). Integration: `tests/integration/booking/dashboard-overview-reader.test.ts` (the counting rules with `created_at`, `submitted_at`, `final_delivery_published_at` set by the test) |
| 026, 027, 036, 037 | Integration: the cap of 10 and total, active statuses only, next-session order (untimed first, past ignored, none last, oldest created), search ignoring case, filter by status/service, total under search. Unit: `nextSessionLabel` |
| 003 | Integration: workspace B's rows never counted; unit: flow uses the verified context |
| 001, 002, 019, 021 | Unit: `dashboard-flow.test.ts` (checklist vs overview), `dashboard-screen.test.tsx` (slot, no placeholder), page header action |
| 029, 031, 036, 037 | Unit (RTL): `dashboard-overview.test.tsx` (no-active vs no-match, footer, *View all projects* URL with `q` and filters, filter counter) |
| 030 | Unit: menu items come from `ProjectMenuHost` (same target); E2E: a step from the dashboard updates tiles and table |
| 018 | Unit in `renderInLocale` EN and ID; copy registry test |
| 020 | E2E: `tests/e2e/dashboard-overview/overview.spec.ts` with axe on desktop and phone, keyboard to a row menu |
| 032 | E2E: confirm a draft on the project page, back to the dashboard, counts changed |
| src/ui units | Unit and stories: `metric-tile`, `metric-delta`, `metric-spark`, `metric-ring`, `data-table` footer |

Only related tests run per iteration (CLAUDE.md). Integration tests seed their own workspaces on the shared non-production DB.

## Implementation iterations
See [plan.md](plan.md): 7 iterations, each with *Read first*, a checklist and a done check. Built on `feat/dashboard-overview`; the deviations are in [build-notes.md](build-notes.md).

- [x] 1 Domain: windows, tiles, next-session label (`d80c4689`)
- [x] 2 Read port, two-statement adapter, use case (`ea7b9fbf`, `48c7c50c`)
- [x] 3 Composition, route and the dashboard slot (`bfc30713`)
- [x] 4 `src/ui`: metric tile, delta, spark, ring; table footer (`4ec35f92`, `61a25476`, `ee219398`, `2107cb38`)
- [x] 5 Overview UI: desktop and tablet, with the shared-unit refactor and the F-07 fix (`eb7a100c`, `a64e9497`, `a7d8cb83`); fidelity pass against the exports (see build-notes)
- [x] 6 Overview UI: phone (`d9c1dd85`); fidelity pass against the exports (see build-notes)
- [x] 7 E2E, accessibility, close (`b9f849c2`; mutating journey and fidelity commit follow)

## Risks / open questions
- **R-1 Date order (D-11):** the export shows *Sat 18 Oct, 07:00* (a sample whose weekday is also wrong for 2026); the app's EN formatter gives *Sun, Oct 18, 07:00*. Verification reports it, and the Owner may ask for `en-GB` order later (one formatter change).
- **R-2 Query cost:** no new index. Check `explain` on the seeded staging data during build iteration 2. If a statement is above ~50 ms, report it rather than adding a migration silently.
- **R-3 Shared units changed:**
  - `ProjectSearchField`, `useFilterDraft`/`ProjectFilterDialog` (`basePath`), `projectListUrl` (split), `rowTarget` (moved) and `DataTable` (`footer`).
  - These are additive with defaults. The project list's tests must stay green; run `projects-screen`, `project-filter-dialog` and `data-table` tests in iterations 4–5.
- **R-4 Reopened groups:** a `SUBMITTED` group reopened by an approved add-on is `OPEN` with `submitted_at` set, so it counts in *To review*. That is consistent with BR-SEL-005 (the Owner can lock it).
- **R-5 Trend partial day:** this month counts up to *now*, while last month counts its whole day *d*. This is accepted as "the same days" (spec); it is noted here so the tests don't assert otherwise.
- **R-6 F-07 bug found while planning:** the project list shows the empty-tab state instead of the no-match state when only filters match nothing (`hasQuery` checks `q` only, but F-07 spec › *Filter* says no match). It is fixed in plan iteration 5.1 as a separate `fix(projects)` commit.
