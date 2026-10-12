# Build notes — Setup checklist (F-25)

Built 2026-10-12 on `feat/setup-checklist`, iterations 1–7 of [plan.md](plan.md). Not pushed.

## Iterations

| # | What was built | Checks |
|---|---|---|
| 1 | `deriveSetupChecklist` (step states, targets, current step) | 10 unit tests |
| 2 | `SetupFactsReaderPort`, one-statement Drizzle adapter (+ Zod row schema), `loadSetupChecklist` | 10 integration tests against the non-production DB (incl. isolation, one `execute`), 2 unit |
| 3 | `loadDashboard` composition; dashboard route uses it | typecheck; dashboard tests |
| 4 | `setup-checklist.copy.ts` (registered), §7.2 alert copy, deck *Optional marker* row, two deck-match tests | 24 tests incl. *New project* screen |
| 5 | `setupStepHref`, `SetupChecklistRow`, `SetupChecklist`, `DashboardScreen` branch; three icons; App Panel `min-h-full` | 19 dom/unit + icon and app-panel tests; visual check 1440 / 1024 / 390 |
| 6 | `?add=service` deep link (`useOpenOnLoad`), *New project* alert → deep link | 30 tests; checked in the preview |
| 7 | E2E `tests/e2e/setup-checklist/checklist.spec.ts`; `workspace.spec.ts` updated | see *E2E* |

Typecheck and ESLint clean on every changed file. Full unit/integration suites not run (project rule: related tests only).

## Deviations from the technical design

- **D-5, URL cleanup:** `window.history.replaceState` instead of `router.replace`. On save, the dialog's `close()` ran `router.replace` (an RSC request) right before F-05's `router.push` to the new service, and the two navigations cancelled each other (E2E). The native history API syncs with the Next router without a request (Next docs › Linking and navigating › Native History API).
- **D-5, opening:** the shell renders every page twice (desktop and phone layouts), so both `ServicesScreen` copies opened the dialog. `useOpenOnLoad` (`features/booking/ui/use-open-on-load`) opens it a frame after mount and only in the visible copy (`checkVisibility`).
- **D-8, vertical centering:** needed `min-h-full` on the App Panel's page-content container (`src/ui/patterns/app-panel`), so the checklist's `flex-1` wrapper can fill the panel. It sets only a minimum height; other pages are unchanged.
- **D-7, row height:** no token for the MD button height, so the trailing slot's minimum height is `calc(2 × button.md.padding-y + 1lh)`, derived from tokens.
- **Icons:** `briefcase`, `folder-plus`, `badge-check` added to the icon registry (Hugeicons `Briefcase01Icon`, `FolderAddIcon`, `CheckmarkBadge01Icon`), as the exports name them.
- **Copy:** step 4's approved action row is not used (step 4 is never current); the row component's sibling copy module re-exports the checklist namespace (`local/ui-copy` needs a sibling import, as in `create-project-screen.copy.ts`).

## Tests changed because behaviour changed

- `create-project-screen.test.tsx`: the no-service alert body and button label are the new approved copy (AC-SETUP-016).
- `services-screen.test.tsx`: router mock replaced by a `history.replaceState` spy.
- `tests/e2e/workspace/workspace.spec.ts`: a new workspace no longer shows the in-content greeting (D-6); the test checks the workspace name in the switcher and the checklist heading.

## E2E

Run against this worktree's dev server on port 3005 with a local, uncommitted Playwright config, because another checkout's server holds 3000 and the shared config reuses it (`reuseExistingServer`). `.dev.vars` was pointed at 3005 for the run and restored afterwards.

- `setup-checklist/checklist.spec.ts`: passed.
- `workspace/workspace.spec.ts`: 3/3 passed (AC-WS-002 passed on its retry; the first attempt timed out on the onboarding redirect).
- `catalog/catalog.spec.ts`: AC-CAT-003/010 passed; AC-CAT-023 (axe, desktop and phone) failed in the first run — it stalled on the onboarding redirect and on a 2-minute click timeout, before any F-25 screen. A rerun alone was stopped by the Owner; **not verified**.

## Open

- **R-1:** the exports' header title (*Welcome to Explore Studio*) differs from the shell's (*Dashboard*); the build keeps the shell header (D-6). Owner to confirm.
- **AC-CAT-023** (catalog axe test): not verified — rerun it alone (`npx playwright test tests/e2e/catalog/catalog.spec.ts -g AC-CAT-023`) on a free port 3000, and compare with `staging` if it still fails.
- **Owner decision (2026-10-12):** marked DONE after previewing on `localhost:3000`; `/sdv:verify-feature` and the AC-CAT-023 rerun were not run. Both stay open as follow-ups.
