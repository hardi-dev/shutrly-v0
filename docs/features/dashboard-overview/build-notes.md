# Build notes — Dashboard overview (F-26)

Built 2026-10-15 on branch `feat/dashboard-overview` (worktree `.claude/worktrees/dashboard-overview`, from `docs/dashboard-feature-row`). Status: `IN PROGRESS` (built, awaiting `/sdv:verify-feature dashboard-overview`). Nothing pushed, no PR, no deploy.

## Iterations

| # | Commits | Built | Checks |
|---|---|---|---|
| 1 | `d80c4689` | Metric windows, tiles, next-session label (domain) | 31 unit tests; typecheck; eslint |
| 2 | `ea7b9fbf`, `48c7c50c` | Read port, two statements, drizzle reader, use case | integration 12 (overview reader) + 7 (project list, shared-SQL refactor); unit 4; typecheck |
| 3 | `bfc30713` | Composition, route, dashboard slot, subtitle, copy deck §4.3 | 42 related unit tests; typecheck |
| 4 | `4ec35f92`, `61a25476`, `ee219398`, `2107cb38` | `src/ui`: metric delta, spark, ring, tile; table footer | 22 unit tests; `tokens:check`; typecheck |
| 5 | `eb7a100c`, `a64e9497`, `a7d8cb83` | Shared-unit refactor; F-07 no-match fix; desktop overview | 64 related unit tests; typecheck; eslint |
| 6 | `d9c1dd85` | Phone layout | 17 overview tests; related suites green |
| 7 | this commit | E2E journey (read-only), build notes | e2e 5/5; `pnpm build` (see below) |

R-2 (query cost, `EXPLAIN ANALYZE`, read-only, largest workspace of 65 projects on the non-production database): metrics 0.31 ms, active projects 0.54 ms. No index added.

## Deviations from the plan

- **Folder layout.** The overview's components sit in one folder, `features/booking/ui/dashboard-overview/`, not in the plan's sub-folders. One copy module per folder keeps the `local/ui-copy` rule satisfied.
- **Metric delta spoken text.** `MetricDelta` takes `srText` (visible value `aria-hidden`, spoken text in `sr-only`), not `aria-label`, because an `aria-label` on a plain `span` is not announced.
- **Phone header action.** None. The phone frame has no *New project* text; its `+` is the shell's bottom-nav CTA, which already creates a project.
- **Phone card avatar.** `ListCardItem` requires `icon` or `avatarInitials`; the phone card uses the client's initials, the same avatar as the desktop row.
- **`footerCount` (Indonesian).** Wrapped in a single-form plural (`{total, plural, other {…}}`) so the copy-registry parity check passes. The output is the deck's text.
- **`today` in the use case output.** Added after the plan: the next-session label is relative to the same clock as the metrics.
- **F-07 commits.** The refactor and the fix are split, but the fix commit `a64e9497` also carries `projects-screen.test.tsx` (the test was staged with its folder).
- **Shared-unit additions.** `displayTime` is exported from `session.ts`; `toRow` from the list reader is exported for the dashboard reader; `DataTable` gained `footer`.

## Checks

- Typecheck: passes after every iteration.
- Eslint: clean on every touched file. Prettier was run with `--ignore-path /dev/null`, because prettier skips anything under `.claude/` and this worktree lives there.
- `tokens:check`: passes.
- Integration `tests/integration/booking/dashboard-overview-reader.test.ts`: 12 pass (AC-DASH-003, 022–027, 033–037, and the canonical price). `project-list.test.ts`: 7 pass.
- E2E `tests/e2e/dashboard-overview/overview.spec.ts`: 6 pass against `pnpm dev` (Playwright started it): AC-DASH-001/002, 036/037, 030 (keyboard and name), 020 (axe desktop and phone), 026 (phone list), and 030/032 (two drafts created and confirmed, one from the row menu and one on its page; the counts and statuses change on the overview).
- Storybook: `pnpm storybook:build` exits 0, so every new story compiles. The stories were not opened interactively.
- `pnpm build`: passes (routes include `/w/[workspaceId]`).
- Fidelity pass (plan 5.7 and 6.4): the live page was screenshotted at 1440, 1024 and 390 and compared with the three default exports. Tile layout, uppercase table heads, the spark and ring placement, the 2×2 phone tiles, the card list and the full-width link now match in structure. Fixes made in this pass: the tile label/badge row and the bottom-right chart (`metric-tile.tsx`), uppercase column heads, `nowrap` on the price, the `md` avatar.

## Remaining differences (accepted, for verification)

- **Table row height.** Export rows are about 85 px tall; ours are about 62 px. Row padding comes from the shared `DataTable`, which this feature does not restyle.
- **Phone card leading element.** The export has no leading avatar on the list cards; ours shows the client's initials, because `ListCardItem` requires one of `icon` or `avatarInitials`.
- **Sample data.** The test Owner's data differs from the export's fixtures (names, counts, prices), so the comparison is structural.
- **R-1 date order.** EN renders *Sun, Oct 18, 07:00* (app order), the export shows *Sat 18 Oct, 07:00*. Left for the Owner at verification.
- **Not covered by e2e:** the fresh-owner checklist case (AC-DASH-002 for a new workspace; the checklist itself is covered by the setup-checklist spec).
- **Full suite.** Not run, per the related-checks rule.
