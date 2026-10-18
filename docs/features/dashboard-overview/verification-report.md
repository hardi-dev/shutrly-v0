# Verification report — Dashboard overview (F-26)

Verified 2026-10-18 on `staging` at `ada1e321` (the F-26 commits from `d80c4689` to `ada1e321`), plus the AC-DASH-019 test added the same day. Command: `/sdv:verify-feature dashboard-overview`. Status: **DONE** — every active acceptance criterion has passing evidence, and nothing blocking remains.

## Evidence

| Check | Result |
|---|---|
| `pnpm typecheck` (`next typegen && tsc --noEmit`) | pass, exit 0 |
| `eslint` on the dashboard folders, the metric patterns, the dashboard reader and the use-case test | pass, exit 0 |
| Related unit tests (`src/features/booking`, `src/composition/{booking,workspace}`, dashboard screen, metric patterns, data table, metric delta, project menu host) | 189 files, 918 tests pass (before the AC-DASH-019 test) |
| AC-DASH-019 test (`load-dashboard-overview.test.ts`) and `src/app/error.test.tsx` | 8 of 8 pass, including the retry test (AC-FND-010) |
| Integration `tests/integration/booking/dashboard-overview-reader.test.ts` | 12 of 12 pass |
| Owner manual check (1440, tablet, 390; mutating journeys: confirm a draft, row-menu actions) | reported by the Owner as done, 2026-10-18; not automated and not in this report's run |
| E2E `tests/e2e/dashboard-overview/overview.spec.ts` | not re-run here (needs `pnpm dev` and the database); last recorded run 7 of 7 in [build notes](build-notes.md) |

## Acceptance criteria

Active criteria: AC-DASH-001…003, 018, 020…027, 029…037. AC-DASH-004…017 and 028 are withdrawn (see [acceptance criteria](acceptance-criteria.md)).

| AC | Result | Evidence |
|---|---|---|
| 001 overview shows with a project | pass | e2e; unit `dashboard-overview.test.tsx` |
| 002 checklist without a project | pass | e2e (fresh Owner); dashboard-screen test |
| 003 only this workspace's data | pass | integration reader test |
| 018 language | pass | unit (copy catalogue) |
| 019 read error shows the error page | pass | use-case test: a failed read rejects with no partial overview; `src/app/error.test.tsx` covers the page and its retry. The flow has no catch of its own (`dashboard-overview-flow.ts:14`), so the error reaches `src/app/error.tsx`, the only error page in the app |
| 020 accessibility (axe, keyboard, names) | pass | e2e axe desktop and phone; keyboard and name checks |
| 021 header and New project | pass | unit |
| 022 new projects | pass | integration |
| 023 to review | pass | integration |
| 024 in editing | pass | unit / integration |
| 025 delivered (Jakarta boundary) | pass | integration |
| 026 rows, columns, cap of 10 | pass | integration; e2e phone list |
| 027 next session and order | pass | unit; integration |
| 029 empty table | pass | unit `dashboard-overview.test.tsx` |
| 030 row menu reused | pass | e2e keyboard/name; Owner manual row-menu check |
| 031 only completed or cancelled projects | pass by the AC-DASH-029 case | no separate test; the empty-table case covers the same data shape |
| 032 fresh on every visit | pass | e2e confirm-draft journey; Owner manual check |
| 033 trend badge | pass | unit (`dashboard-metrics.test.ts`) |
| 034 sparkline | pass | unit (`metric-spark.test.tsx`, metrics) |
| 035 ring | pass | unit (`metric-ring.test.tsx`) |
| 036 filter the table | pass | integration; e2e |
| 037 search and no-match state | pass | e2e; F-07 fix commit `a64e9497` |

## Deviations and open items

- **AC-DASH-019 wording.** The AC says "the existing owner error page with retry". No owner-specific error page exists; the owner routes use the app-wide `src/app/error.tsx`, which has the retry button. Recorded here as the existing page, not a new one.
- **AC-DASH-031** is covered only by the AC-DASH-029 case, not by its own test. Non-blocking.
- **Build notes name 7 e2e cases; the handoff said 5/5.** The build notes are the later record. Non-blocking.
- **R-1 date order** is now the design order (`Sun 18 Oct, 07:00`), recorded in [build notes](build-notes.md). The spec and AC-DASH-027 match this.
- **Tablet and phone fidelity** were compared structurally in the build's fidelity pass and checked manually by the Owner; no pixel-diff tool was run.

## Next

Run `/sdv:handoff` to refresh `HANDOFF.md`, then `/sdv:ship dashboard-overview` when the Owner wants a deploy.
