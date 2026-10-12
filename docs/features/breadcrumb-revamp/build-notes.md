# Build notes — Breadcrumb revamp (F-22)

Final report for [plan.md](plan.md), in the order the plan's *Final report* asks for. Built 2026-10-12 on `staging` (not pushed) by Claude Haiku 5.5 subagents (medium effort), one implementer and one reviewer per task, coordinated by the controller session.

## 1. Commits (`f34cd45e..HEAD`)

| Commit | Task |
|---|---|
| `13a5fc46` feat(workspace): add owner breadcrumb builder | 1 |
| `f0643228` perf(composition): cache owner loaders per request | 2 |
| `bfb05009` feat(ui): let the page header take a server-rendered trail | 3 |
| `02c831c4` feat(shell): add the server-rendered owner breadcrumb slot | 4 |
| `aa82bb78` feat(shell): render the owner breadcrumb from the server slot | 5 |
| `7f9a971e` feat(gallery): keep beranda in the client trail and show tinjau on read-only reviews | 6 |
| `c70a6b66` feat(shell): move the sidebar toggle beside the breadcrumb | 7 |
| `f8084a74` test(shell): land on beranda in the gate e2e and check toggle focus | final-review fix |
| `632c3d5b` docs(breadcrumb-revamp): resolve oq-5 and make task 8 executable | 8 (docs) |
| `38c744cf` feat(ui): keep the breadcrumb ends whole and shrink the middle | 8 |
| `bd1bc84b` test(gallery): wait for the published gallery in the gate e2e | follow-up (also carries the feature-map status) |
| `43473cb1` refactor(shell): render the static crumb mirrors through the catch-all | follow-up (Owner decision) |
| `07819fe3` test(gallery): fix the gate e2e for beranda landing and dev cache headers | follow-up |
| `17b75c47` docs(breadcrumb-revamp): note that static crumb mirrors reuse the catch-all | follow-up |

## 2. Tests per task (as reported, then re-run by the controller)

| Task | Command | Result |
|---|---|---|
| 1 | `npx vitest run src/features/workspace/ui/owner-trail` | 5/5 (RED: module not found) |
| 2 | `npx vitest run` on the five composition folders | 8/8 |
| 3 | `npx vitest run src/ui/patterns/page-header src/ui/patterns/app-panel src/ui/patterns/app-shell` | 18/18 (RED: 2 failing) |
| 4 | prettier, eslint, `pnpm typecheck` (no unit tests in the task) | clean |
| 5 | related unit set; `npx playwright test tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts` | 61/61; e2e 5/5 |
| 6 | review-screen, client-browse-screen, client-home-screen, domain/client-home; integration `home.test.ts` | 37/37; 2/2 |
| 7 | sidebar, page-header, app-panel, app-shell, owner-shell; shell e2e | 33/33; 5/5 |
| 8 | `breadcrumb-trail.test.tsx`; page-header, browse-toolbar, all-photos-modal | 4/4; 16/16 |

**Controller's final run (2026-10-12, after all commits):**
- Unit, every touched folder (19 files): **124/124 passed**. `pnpm typecheck`: exit 0. ESLint on every touched file: exit 0.
- Integration `home.test.ts` + `secrets-sweep.test.ts`: **4/4 passed**.
- E2e `client-access/gate.spec.ts` + `app-shell-revamp.spec.ts`: **6 passed, three runs in a row** (1.7 min each).

**Browser checks by the controller (dev server, local test accounts):**
- Owner: 16 routes show the spec trail in the server HTML (AC-CRUMB-001…007, 011), including `/profile` → *Profil* and `/w/[id]` → *Dasbor*; the five mirrors re-checked after the refactor.
- Client: open groups (`… › [Foto edit] › Tinjau`), read-only groups (`… › Foto edit › Tinjau`, group not linked; `/picks/…` redirects to `/review`), *Hasil akhir*, *Semua foto*; a project without groups lands on Beranda and *Semua foto* shows `[Beranda] › Semua foto` with the project title (AC-CRUMB-008, 009).
- Sidebar toggle: desktop collapse 252 → 72 px and back, stored preference, focus kept on the toggle; tablet overlay opens, has no sidebar button, Esc returns focus to the toggle (AC-CRUMB-015, 016).
- Long trail at 768 px with a 60-character title: root and current whole, middle truncated with tooltip, no overflow or horizontal scroll (AC-CRUMB-013).

## 3. Skipped or changed steps

- Task 5 Step 13 (browser check) was skipped by the subagent (no browser pane) and done by the controller instead (section 2).
- The AC-CRUMB-016 unit assertion of focus after Esc was removed: jsdom does not restore modal focus. Focus return is verified in the browser only.
- Plan Task 8 was first blocked on OQ-5; the Owner resolved it (truncate the middle, frames waived) and the task was rewritten and run.
- The final whole-branch review was done before Task 8 and the follow-ups; those had their own task reviews or controller review.

## 4. Old text that did not match the plan

- Task 1, 2, 3, 7, 8: lint-driven, behaviour-preserving deviations (length guard instead of destructuring, `isOwnerSection` type guard, `breadcrumbTrail` const, `HeaderTabs` and `CrumbText` extractions for the 50-line rule). No step's old text failed to match, except:
- Task 7 Step 5 Edit 2: written before Task 3's lint fix; the controller gave the implementer the adjusted line (`leading` added to the single `BreadcrumbRow` call).
- Task 4 Step 11: the project title lives on `ProjectDetailRecord` (port), not in `get-project-detail.types.ts`; the check passed there.

## 5. Working tree

`git status --short` at the end shows only files that were dirty before this work: `.agents/skills/sdv-ux-task-effectiveness/*`, `.claude/commands/sdv/ux-task-effectiveness.md`, `.claude/skills/ux-task-effectiveness/SKILL.md`, `docs/features/ux-task-effectiveness/`.

## Pre-existing issues fixed on the way (not caused by F-22)

The gate e2e failed on the commit before F-22 too:
- it opened the client link ~65 ms after `published_at` and got the neutral 404 (now retried until the gate answers);
- `getByLabel('Password')` matched three elements (now `getByPlaceholder`);
- `next dev` rewrites `Cache-Control` to `no-cache, must-revalidate` (Next 16.3.6 `base-server.js`), so the exact production value is asserted by `secrets-sweep.test.ts` against `next.config.ts`, and the e2e asserts "not public" plus `X-Robots-Tag: noindex`.

## Open minor findings (for a later pass)

Kept in `.superpowers/sdd/progress.md` (git-ignored): duplicate JSDoc on cached loaders; `OWNER_NAV_COPY.create` reused for the *Proyek baru* crumb; no automated slot-coverage test; very short middle crumbs can shrink to a few pixels beside a long title; hydration warning on `<html data-theme>` seen in an e2e log (root layout, likely pre-existing).
