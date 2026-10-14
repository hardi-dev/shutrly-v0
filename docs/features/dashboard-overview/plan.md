# Plan — Dashboard overview (F-26)

Status: PLANNED (2026-10-15) · Design: [technical-design.md](technical-design.md) · Spec: [spec.md](spec.md) · Criteria: [acceptance-criteria.md](acceptance-criteria.md) · Exports: [exports/INDEX.md](exports/INDEX.md)

**Goal:** once a workspace has a project, `/w/{id}` shows:
- *New project* in the page header;
- four metric tiles (two with trend and sparkline, two with a ring);
- the *Active projects* table (10 rows, search, filter, the project list's ⋯ menu).

It replaces the F-02 placeholder. Seven iterations, test-first, one commit per task (`feat(<scope>): …` / `test(…)` / `docs(…)`, lowercase, English, Co-Authored-By trailer).

**Global rules for every iteration**
- Related tests only: `npx vitest run <paths>`; integration `npx vitest run --config vitest.integration.config.ts <path>`; one E2E spec. Never the full suite.
- Lint each changed file as you go: `npx prettier --write <file>`, then `NODE_OPTIONS=--max-old-space-size=6144 npx eslint --fix <file>`. Then `pnpm typecheck`.
- Functions ≤ 50 lines, cognitive complexity ≤ 15, no inline JSX arrow handlers, JSDoc on exported and domain functions, types in `*.types.ts`.
- Never type `head` (use `sed -n`). Never `pkill` a dev server; stop only your own PIDs or use `preview_stop`.
- UI text only from `*.copy.ts` (`local/ui-copy`), and only approved `copy-deck.md` rows (§1 *Dashboard subtitle*, §4.3b, §7.1, §7.3). Never `vi.mock("next-intl")` with a factory importing the copy registry; wrap in `NextIntlClientProvider` / `renderInLocale`.
- Read exports one file at a time, only the states and devices the iteration names. The fidelity pass may change only class names and nesting.
- No migration, no new dependency, no new ADR. Branch `docs/dashboard-feature-row` (or a `feat/dashboard-overview` branch from it). Don't push, deploy or open a PR without asking the Owner.

---

## Iteration 1 — Domain: windows, tiles, next-session label

**Read first:**
- Criteria: AC-DASH-022, 023, 024, 025, 027, 033, 034, 035 · A-1, A-2, A-7 · FC-001.
- Rules: BR-SEL-005, BR-DEL-003, BR-TEAM-003.
- technical-design › D-4, D-5, D-6, D-7, D-11, *Domain / application logic*.
- coding-rules › Pure domain, Functions and comments, Where types live.
- Code to follow: `src/features/booking/domain/schedule-clock/` (`todayInScheduleZone`), `src/features/booking/domain/session/session.ts` (`DATE_FORMATS`, `displayTime`).

- [x] **1.1** `src/features/booking/domain/dashboard-metrics/dashboard-metrics.types.ts`:
  - `MetricWindows` (`today`, `monthStart`, `prevMonthStart`, `prevEnd`, `sparkStart`, `months: readonly string[]`, `now: Date`);
  - `MetricFacts` (the eight counts plus `newByMonth` and `deliveredByMonth` as `readonly { month: string; count: number }[]`);
  - `MetricTrend`, `MetricRing`, `MetricTiles`.
- [x] **1.2** Test first, `dashboard-metrics.test.ts`, then `dashboard-metrics.ts`:
  - `metricWindows(now)`:
    - 2026-10-14T03:00Z gives `monthStart 2026-10-01`, `prevMonthStart 2026-09-01`, `prevEnd 2026-09-15`, `sparkStart 2026-04-01`, months `2026-04…2026-10`;
    - 2026-10-31 gives `prevEnd 2026-10-01` (capped);
    - 2026-03-31 gives `prevEnd 2026-03-01`;
    - 2026-09-30T16:30Z (23:30 on 30 Sep in Jakarta) gives `monthStart 2026-09-01`, and 2026-09-30T17:30Z (00:30 on 1 Oct) gives `monthStart 2026-10-01` (AC-DASH-025).
  - `buildMetricTiles(facts, windows)`:
    - trend +1 positive, −2 warning, 0 null (AC-DASH-033);
    - spark fills missing months with 0, oldest first (AC-DASH-034);
    - ring `{part:1,total:2}`, `{part:3,total:4}`, part 0 kept, count 0 null (AC-DASH-035);
    - the waiting badge count equals `to_review` (AC-DASH-023).
  - Constants `REVIEW_WAITING_DAYS = 3` (A-7) and `DASHBOARD_TABLE_LIMIT = 10` (A-2).
- [x] **1.3** Test first in `session.test.ts`, then `session.ts`:
  - `nextSessionLabel(session | null, today)` gives `NONE`, `TODAY`, `TODAY_AT`, or `DATE` (AC-DASH-027);
  - `formatSessionDayTime(session, locale)` gives the weekday, day and month, plus the time when set, with no year, in `en-US` and `id-ID` (D-11).
- [x] Commit `feat(dashboard): metric windows, tiles and next-session label`.

**Done when** the domain tests pass, typecheck is clean, and there is no I/O or framework import in `domain/`.

## Iteration 2 — Read port, two-statement adapter, use case

**Read first:**
- Criteria: AC-DASH-003, 022…027, 029, 031, 033…037 · BR-WS-002/003, BR-SEL-005, BR-DEL-003.
- technical-design › D-3, D-4, D-8, D-9, *Counting rules*, *Server / API interface*, R-2.
- coding-rules › Data Access, Validation, Errors and Logging.
- Code to follow:
  - `src/adapters/db/project-repository/project-list-sql.ts`, `shown-session-sql.ts`, `drizzle-project-list-reader.ts`;
  - `src/adapters/db/setup-facts-reader/` (Zod row schema);
  - `src/features/booking/application/use-cases/list-projects/`;
  - `tests/integration/booking/project-list.test.ts` (seeding).

- [x] **2.1** Port `features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port.ts`:
  - `ActiveProjectRow` (the `ProjectListRow` fields plus `agreedPrice: string`), `ActiveProjectsQuery`, `ActiveProjectsPage { rows; total }`;
  - `readMetrics` and `listActiveProjects`.
- [x] **2.2** In `project-list-sql.ts`, export the existing `filterPredicates` and a `searchPredicate(search)` extracted from `baseCte`. There is no behaviour change; run `tests/integration/booking/project-list.test.ts`.
- [x] **2.3** `dashboard-metrics-sql.ts`: one `select` of scalar subqueries (*Counting rules*). Each is scoped by `workspace_id`, uses the D-4 conversions, and ends at `<= now`. It returns `new_by_month` and `delivered_by_month` as `coalesce(json_agg(...), '[]')`.
- [x] **2.4** `dashboard-projects-sql.ts`:
  - `nextSessionJoin(today)` (from today only, earliest first, `start_time nulls first`, `created_at`);
  - a base like the list's, plus `p.agreed_price`, with the active statuses, search and filter;
  - the D-8 order, `limit`, and `count(*) over () as total`.
- [x] **2.5** `drizzle-dashboard-overview-reader.ts` plus `.schema.ts` (Zod for the metrics row and the JSON series). Rows are mapped like `toRow` in the list reader, and an unknown status is dropped. `agreed_price` goes through `canonicalIdrAmount` (D-9), because `formatIdr` would throw on `1500000.000`.
- [x] **2.6** Integration test first, `tests/integration/booking/dashboard-overview-reader.test.ts`. Seed two workspaces, set the timestamps with SQL on the test's own rows, and fix `now` = 2026-10-14T03:00Z. One `it` per AC:
  - 022: created on 30 Sep, 1 Oct (then cancelled), 10 Oct and 14 Oct → 3.
  - 023: SUBMITTED; OPEN+submitted; OPEN never sent; LOCKED; SUBMITTED on a cancelled project → 2.
  - 024: POST_PROCESSING ×2 counted; SHOOTING and DELIVERED not counted.
  - 025: published 30 Sep 23:30 Jakarta (September), 2 Oct, 13 Oct, and 5 Oct on a cancelled project → 2.
  - 033: the same-days counts.
  - 034: the months series.
  - 035: the waiting and ready parts.
  - 026: 12 active, 1 completed, 1 cancelled → 10 rows, total 12.
  - 027: the order and next-session values, with a past session ignored.
  - 036/037: search *rina* ignoring case, excluding the completed project; the status and service filters; the total follows them.
  - 003: workspace B's rows never appear and never count.
- [x] **2.7** Use case `load-dashboard-overview` (test with a fake reader): it calls `metricWindows(now)`, the reader twice with `limit: DASHBOARD_TABLE_LIMIT`, and `buildMetricTiles`, then returns `DashboardOverview`.
- [x] **2.8** Run `explain analyze` for both statements on the non-production DB once (R-2) and note the timings in the commit body.
- [x] Commits:
  - `feat(dashboard): overview read port and drizzle reader`;
  - `feat(dashboard): load the dashboard overview`.

**Done when** the new integration file, `project-list.test.ts` and the use-case test pass.

## Iteration 3 — Composition, route and the dashboard slot

**Read first:**
- Criteria: AC-DASH-001, 002, 019, 021, 032 · BR-WS-003.
- technical-design › D-1, D-2, D-14, *Error handling*.
- coding-rules › Next.js, Structure and boundaries.
- Code to follow:
  - `src/composition/workspace/dashboard-flow/`, `src/composition/booking/project-flow/project-flow.ts` (`loadProjects`), `src/composition/booking/project-scope/project-scope.ts` (`withProjectScope`), `src/features/booking/application/use-cases/load-filter-options/` (`loadFilterServices`);
  - `src/features/workspace/ui/owner-nav/owner-nav.tsx` (`dashboardSubtitle` call);
  - `src/app/(owner)/w/[workspaceId]/page.tsx`, `projects/page.tsx`;
  - `src/features/workspace/ui/dashboard-screen/`.

- [x] **3.1** `composition/booking/dashboard-overview-flow/dashboard-overview-flow.ts(+.types.ts, test)`: `loadDashboardOverview(context, params, now)` parses `parseProjectListParams(params, "ACTIVE")` and runs the use case plus `services` and `filterClient`.
- [x] **3.2** `dashboard-flow.ts`: `loadDashboard(rawId, params = {})`. The overview is read only when `checklist === null`. Extend `DashboardData` with `overview` and update the flow test (AC-DASH-001/002).
- [x] **3.3** `DashboardScreen`:
  - replace `DashboardPlaceholder` with an `overview: ReactNode` prop;
  - remove the placeholder copy rows (D-14) from `dashboard-screen.copy.ts`, keeping `created`;
  - update the test;
  - copy deck §4.3: mark *Welcome, complete message*, *Description; existing placeholder dashboard*, *Empty title*, *Empty body* and *Empty CTA* as retired by F-26 (2026-10-15), keeping *Title* and *Created toast*.
- [x] **3.4** `owner-nav.copy.ts › dashboardSubtitle` → *Track active projects, sessions and delivered work.* / *Pantau proyek aktif, sesi, dan hasil yang sudah dikirim.* (copy deck §1). Drop the `{workspaceName}` argument where it is passed, and update the tests that assert the old text.
- [x] **3.5** `page.tsx`: pass all `searchParams` to `loadDashboard`. Render `overview={data.overview === null ? null : <DashboardOverview …/>}` with a stub `DashboardOverview` in `features/booking/ui/dashboard-overview/` that renders nothing yet (iteration 5 fills it), so the route builds. Between iterations 3 and 5 a workspace with projects shows an empty dashboard on this branch only; don't deploy it in between.
- [x] Commit `feat(dashboard): load the overview once the workspace has a project`.

**Done when** the flow and screen tests and the copy registry test pass, and typecheck is clean.

## Iteration 4 — `src/ui`: metric tile, delta, spark, ring; table footer

**Read first:**
- design.md › *Component usage* (Metric Tile, Table), *Token-usage exceptions* (ring).
- `docs/design-system/components/metric-tile.md`, `metric-delta.md`, `table.md`; `docs/design-system/token-usage.md` G3, SP4, §3 *metric*.
- technical-design › D-13.
- coding-rules › Styling and React Aria; ADR-014.
- Code to follow: `src/ui/patterns/empty-state/` (unit, story, story copy, test), `src/ui/patterns/data-table/`.
- Export: `dashboard-default` **desktop** (`fvbbu`), the tiles row and table footer only.

- [x] **4.1** `src/ui/primitives/metric-delta/`: `tone: "positive" | "warning"`, `value`, `aria-label`; tokens `--component-metric-delta-*`. Story and test.
- [x] **4.2** `src/ui/patterns/metric-spark/`: `values: readonly number[]` (last bar current), bar heights relative to the series maximum (an all-zero series as the export draws empty bars; check the default export), `aria-hidden` unless `label` is given. Story and test.
- [x] **4.3** `src/ui/patterns/metric-ring/`: `part`, `total`, `label`; an SVG of 28 px, track `--component-metric-spark-bar`, value `--component-metric-spark-current`, inner radius 0.68; `role="img"` with `aria-label`. Story and test, including part 0.
- [x] **4.4** `src/ui/patterns/metric-tile/`: `label`, `value`, `delta?: ReactNode`, `chart?: ReactNode`. The read order is label, value, delta. Tokens `--component-metric-tile-*`. Story and test.
- [x] **4.5** `DataTable`: optional `footer?: ReactNode`, rendered after the grid with the library footer's tokens. Story and test; the existing `data-table.test.tsx` stays green.
- [x] Commit per unit, e.g. `feat(ui): metric tile pattern`.

**Done when** each unit's test passes, the stories render (`pnpm storybook` smoke for the new stories only), and `pnpm tokens:check` and lint are clean.

## Iteration 5 — Overview UI: desktop and tablet

**Read first:**
- Criteria: AC-DASH-001, 018, 020, 021, 026, 027, 029, 030, 031, 033…037 · BR-MSG-001, BR-CLI-002.
- technical-design › D-9, D-10, D-11, D-12, *UI components*, R-1, R-3.
- design.md › *Screen and state map*, *Component usage*, *Copy*.
- copy-deck §4.3b, §7.1, §7.3.
- coding-rules › Copy, React, UI States.
- Code to follow:
  - `src/features/booking/ui/projects-screen/` (`ProjectsBody`, `rowTarget`, `NewProjectButton`), `projects-table/`, `project-search-field/`;
  - `project-filter-dialog/` (`use-filter-draft.ts`), `project-menu-host/`, `projects-empty-state/`, `client-initials/`.
- Exports (desktop, one at a time): `dashboard-default` (`fvbbu`), `dashboard-row-menu-open` (`EhUPe`), `dashboard-filter-applied` (`f1IOdF`), `dashboard-no-match` (`f4pyy`), `dashboard-no-active-projects` (`od6HS`). Tablet: `dashboard-default` (`fC7eZ`).

- [x] **5.1** Shared-unit changes (R-3), with tests first:
  - `projectListUrl` → `listUrlAt(path, q, filter)`, keeping `projectListUrl` as a wrapper;
  - `ProjectSearchField` and `useFilterDraft`/`ProjectFilterDialog` get an optional `basePath`;
  - move `rowTarget` to `project-menu-host/project-row-target.ts`;
  - **fix in F-07 (found while planning F-26):** the project list passes `hasQuery={q !== ""}`, so filters that match nothing show the empty-tab state with *New project* instead of the no-match state. F-07 spec › *Filter* says no match shows *No matching projects*, whose *Clear search* also clears the filters. Use `q !== "" || activeFilterGroupCount(filter, tab) > 0` in `projects-screen.tsx` (desktop and phone), and add a `projects-screen.test.tsx` case for a filter-only no-match. Commit it separately as `fix(projects): show the no-match state when filters match nothing`.
  - Run the `projects-screen`, `project-filter-dialog` and `project-search-field` tests.
- [x] **5.2** `dashboard-overview.copy.ts`: the §4.3b rows, verbatim with the source comment, registered in `src/app/copy-registry.ts`.
- [x] **5.3** `dashboard-metric-tiles/`: the four tiles in lifecycle order:
  - trend badge `+n` / `−n` (the minus sign U+2212, as AC-DASH-033 writes it), with the screen-reader text;
  - `{count} waiting` warning badge on *To review*;
  - spark on tiles 1 and 4;
  - ring on tiles 2 and 3, with the screen-reader text.
- [x] **5.4** `dashboard-next-session/` (D-11) and `dashboard-projects-table/`:
  - columns, widths and footer as in *UI components*;
  - the project title is a link;
  - the client initials avatar;
  - `formatIdr(agreedPrice, locale)`.
- [x] **5.5** `dashboard-empty/` (D-12) and `dashboard-overview/`:
  - `PageActions` + `NewProjectButton`;
  - tiles; `ProjectMenuHost` (`variant="row"`, `onDeleted` → `router.refresh()`) around the table;
  - `ProjectFilterDialog` with `basePath = /w/{id}`;
  - search and filter hidden in the no-active state;
  - `hasQuery = q !== "" || activeFilterGroupCount(filter, "ACTIVE") > 0`.
- [x] **5.6** RTL tests (`renderInLocale` EN and ID), with IDs in the test names:
  - 021 the header action;
  - 026 the footer and the *View all projects* URL;
  - 027 the labels;
  - 029/031 *No active projects*;
  - 030 the same menu items as the list for BOOKED, SHOOTING, and DRAFT without a number;
  - 036 the filter counter and the URL;
  - 037 no match and *Clear search* → `/w/{id}`;
  - 018 ID copy and IDR formatting.
- [x] **5.7** Fidelity pass against each named export at 1440 and the tablet width in the preview, with the seeded staging data or a local seed (classes and nesting only).
- [x] Commits: `refactor(projects): share the list url, search and menu target`, `feat(dashboard): overview tiles and active projects table`.

**Done when** the RTL tests and the reused units' tests pass, and the screenshots match the five desktop exports and the tablet export.

## Iteration 6 — Overview UI: phone

**Read first:**
- Criteria: AC-DASH-020, 026, 029, 030, 036, 037.
- design.md › *Component usage* (Mobile App Shell, Section Card/Compact/Flush, Bottom Sheet/Actions, Empty State on phone).
- technical-design › *UI components* (`dashboard-projects-list`).
- Code to follow: `src/features/booking/ui/project-list/project-list.tsx`, `projects-screen.tsx` (mobile branch).
- Exports (mobile, one at a time): `dashboard-default` (`fkrDj`), `dashboard-row-menu-open` (`aoGYG`), `dashboard-filter-applied` (`p8HffF`), `dashboard-no-match` (`usmgv`), `dashboard-no-active-projects` (`k01xc`).

- [x] **6.1** `dashboard-projects-list/`:
  - list rows (meta *client · next session*, trailing chip and menu);
  - the footer count and a full-width *View all projects*;
  - the empty states with the card's compact content padding (design.md SP8 note).
- [x] **6.2** In `dashboard-overview`, use the mobile branch from `useMobileViewport()`: tiles 2×2, the search row, the list, *New project* where the phone export puts it, the menu as the existing bottom sheet, and the filter as the existing sheet.
- [x] **6.3** RTL tests at the phone viewport: the sheet meta and items (030), and the no-match and no-active states.
- [x] **6.4** Fidelity pass at 390 against the five mobile exports.
- [x] Commit `feat(dashboard): phone layout of the overview`.

**Done when** the phone tests pass and the screenshots match the five mobile exports.

## Iteration 7 — E2E, accessibility, close

**Read first:**
- Criteria: AC-DASH-001, 002, 020, 030, 032, 036, 037.
- technical-design › *Testing strategy*, R-1.
- Code to follow: `tests/e2e/setup-checklist/checklist.spec.ts`, `tests/e2e/projects/projects.spec.ts` (seeding and axe).

- [x] **7.1** `tests/e2e/dashboard-overview/overview.spec.ts`:
  - a seeded workspace with projects shows the overview (001); a new one shows the checklist (002);
  - search and filter keep the URL across a reload, and *View all projects* opens the list with them (036/037);
  - *Confirm booking* from a row menu updates the tiles and the table (030);
  - confirming a draft on the project page and going back updates the counts (032);
  - axe on desktop and phone, and the keyboard reaches a row menu named *Actions for {project}* (020).
- [x] **7.2** `build-notes.md`: the deviations, including R-1 (date order) and the R-2 timings. Feature-map F-26 → `IN PROGRESS (built <date>, awaiting verification)`; `/sdv:verify-feature` sets `DONE`.
- [x] Commit `test(dashboard): overview journey and accessibility`, then `docs(dashboard-overview): build notes`.

**Done when** the spec passes locally against the dev server, and the next step is `/sdv:verify-feature dashboard-overview`.
