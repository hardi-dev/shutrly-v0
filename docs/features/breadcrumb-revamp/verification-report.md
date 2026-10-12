# Verification report — Breadcrumb revamp (F-22)

Date: 2026-10-12 · Branch: `staging` at `45cf18c6` (range `f34cd45e..HEAD`, not pushed) · Verifier: `/sdv:verify-feature breadcrumb-revamp`, run without E2E tests (Owner: "tanpa e2e test")
**Result: NOT DONE.** One blocking item (B-1). Every acceptance criterion has passing evidence, and the quality gate passes.

Artifacts checked: [constitution](../../constitution.md) (C-001…C-012, C-101, C-104), [coding rules](../../coding-rules.md) v2.0, BR-WS-003, BR-ACC-003, BR-SEL-001, BR-SEL-005, [spec](spec.md), [acceptance criteria](acceptance-criteria.md), [technical design](technical-design.md), [ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md), ADR-018, [build notes](build-notes.md), [token usage rules](../../design-system/token-usage.md) (APPROVED, so deviations from them count as real deviations, not advisory), and the F-17 and F-10 amendment notes.

## 1. Quality gate (re-run 2026-10-12)

| Check | Result |
|---|---|
| `pnpm typecheck` | PASS (exit 0) |
| Prettier `--check`, every changed `src/` and `tests/` file | PASS |
| ESLint, every changed `src/` and `tests/` file | PASS (exit 0) |
| `pnpm tokens:check` | PASS (626 tokens, 1719 files) |
| `pnpm build` | PASS (compiled; working tree unchanged afterwards) |
| Unit: 16 related folders (owner-trail, owner-nav, owner-shell, page-header, app-panel, app-shell, sidebar, review-screen, client-browse-screen, client-home-screen, domain client-home, five composition flows) | PASS 118/118 (17 files) |
| Unit: all-photos-modal, browse-toolbar (breadcrumb consumers) | PASS 4/4 |
| Integration: `client-access/home.test.ts`, `secrets-sweep.test.ts` | PASS 4/4 |
| E2E `app-shell-revamp.spec.ts`, `client-access/gate.spec.ts` | **Not re-run** (Owner instruction). Last result: 6/6 passed, three runs in a row, 2026-10-12 ([build notes](build-notes.md) §2) |
| Migrations | None in this feature |

## 2. Functional behaviour (acceptance criteria)

| AC | Evidence | Result |
|---|---|---|
| 001 Dashboard = *Dasbor* | `owner-trail.test.ts` AC-CRUMB-001; `@crumbs/page.tsx`; e2e (last run) | PASS |
| 002 Section pages | `owner-trail.test.ts` AC-CRUMB-002; catch-all `@crumbs/[...segments]` | PASS |
| 003 Tab routes | `owner-trail.test.ts` AC-CRUMB-003; five mirrors (`projects/new|completed|cancelled`, `services/categories|items`) | PASS |
| 004 Project pages | builder test; slot pages `projects/[projectId]`, `…/gallery`; browser check (build notes) | PASS (no slot-level automated test, see B-1) |
| 005 Picks under gallery | slot pages `…/gallery/picks`, `…/picks/[groupId]`; browser check | PASS (same note) |
| 006 Service, template editor | slot pages `services/[serviceId]`, `message-templates/[templateType]`; browser check | PASS (same note) |
| 007 Profile | `profile/layout.tsx` passes *Profil*; browser check | PASS |
| 008 Client trails | `review-text.test.ts` AC-CRUMB-008 (open: linked group; read-only: plain group + *Tinjau*) | PASS |
| 009 Beranda always | A-31 redirect removed in `g/[token]/page.tsx`; `client-browse-screen.test.tsx` AC-CRUMB-009; gate e2e (last run) | PASS |
| 010 Accessible trail | `page-header.test.tsx` AC-CRUMB-010; `<nav aria-label>`, `aria-current="page"`, separators `aria-hidden` | PASS |
| 011 First paint | ADR-025 mechanism (server-rendered slot); raw server HTML checked on 16 routes (build notes) | PASS (documented verification, C-009) |
| 012 Tenant and token names | slots use the scoped cached loaders (`verifyOwnerWorkspace`, `loadProjectDetail`, `loadGalleryPage`, `loadSelectionGroups`, `loadSelectionGroupDetail`, `loadServiceDetail`), which throw `notFound()`; browser check of foreign IDs → 404 | PASS |
| 013 Long trail | `breadcrumb-trail.test.tsx` AC-CRUMB-013 (4 tests); browser check at 768 px | PASS |
| 014 Phone back | `PageHeadingOverride.parent` unchanged on each page; `owner-shell.test.tsx`; `review-text.ts` back targets | PASS |
| 015 Desktop toggle | `app-shell.test.tsx` AC-CRUMB-015, `page-header.test.tsx`, `sidebar.test.tsx`; e2e (last run) | PASS |
| 016 Tablet toggle | `app-shell.test.tsx` AC-CRUMB-016 (focus return after Esc checked in the browser only, jsdom limit) | PASS |

Business rules: BR-WS-003 / C-101: every slot verifies the URL workspace before reading a name (PASS). BR-ACC-003 / C-104: client crumbs come only from the token's views (PASS). BR-SEL-001: a project with no groups lands on Beranda (PASS). BR-SEL-005: the read-only review crumb isn't linked (PASS).

## 3. Technical quality

| Item | Result |
|---|---|
| Constitution C-004, C-006, C-101, C-104 (server authority, tenancy) | PASS. Names are loaded only on the server, from workspace- or token-scoped loaders. No new endpoint, no new data reaches the browser. |
| C-008 accessibility | PASS (AC-010, toggle focus kept or returned) |
| C-010 scope | PASS. The sidebar toggle was added by the Owner (spec › *Sidebar toggle*). The fixes to the pre-existing gate e2e are recorded in the build notes. |
| C-012 deviations recorded | PASS for the Pencil waiver (spec › *Design*). FAIL for B-1. |
| ADR-018 budget | PASS. Every dynamic slot calls the same cached loader with the same arguments as its page and layout (checked in each page file), so no extra query runs. |
| ADR-025 decision 1–6 | PASS: slot, catch-all, mirrors, `default.tsx`, cached loaders, `PageHeadingOverride` kept, client out of scope |
| ADR-025 › Consequences ("the slot has a test per route") | PASS after B-1 fix: `owner-route-coverage.test.ts` (2026-10-12, option a) |
| Architecture boundaries | PASS (lint). `owner-trail` sits in `features/workspace/ui` because it reads nav copy, as the technical design says. |
| Copy in `*.copy.ts` | PASS (lint `local/ui-copy`). The literal `"Layanan"` in the service page is replaced by `OWNER_NAV_COPY.services`. |
| Coding-rule conventions (not linted) | Deviations D-3 |

## 4. Visual fidelity and design system

**Pencil:** the Owner waived frames for the whole feature on 2026-10-12, covering the trail changes, the toggle move and the long-trail overflow (spec › *Design*, recorded per C-012). There's no export to compare against, so Pencil was not inspected in this run. The drift that remains is listed as D-1.

**Token usage rules (APPROVED):**

| Rule | Result | Note |
|---|---|---|
| G2 no primitives | PASS | No `color.primitive.*` in the diff |
| G4 no hard-coded values | PASS for the new code | The new classes are layout utilities only (`shrink-0`, `min-w-0`, `truncate`, `hidden md:flex xl:flex`). The focus-ring arbitrary shadow `0_0_0_2px…4px` in `breadcrumb-trail.tsx` was there before F-22 (advisory, not F-22's) |
| G3 component tokens first | PASS | The bar keeps `component.page-header.breadcrumb-*` |
| G5 fg/bg pairing | PASS | Crumb text (`breadcrumb-text`, `breadcrumb-current`) stays on the Page Header background; the colours didn't change |
| SP1 / SP2 / SP7 / SP8 | PASS | The toggle is separated from the trail by the row's `gap` (`breadcrumb-gap` = `space.2`). The leading wrapper adds no padding or margin. |
| SP5 linked instance, no padding override | PASS | The toggle is an `IconButton` with the `size="sm"` variant and no `className` |
| SP9 / SP10 | PASS | Density of the bar unchanged |
| Theme coverage | PASS (token-level) | Only mode-switching tokens are used. Dark mode is still not drawn (GAP-01, pre-existing) |

## 5. Blocking

### B-1 — CONFLICT: ADR-025 says each slot route has a test; none exists
- **ADR-025 › Consequences** (higher authority) says: "Missing one shows the wrong trail, so the slot has a test per route (F-22 technical design)."
- **Technical design §5.3 and §11** (lower authority) say: "There is no automated check yet." The build notes list "no automated slot-coverage test" as an open finding.
- **Impact:** the trails are correct today (browser-checked on 16 routes). A future Owner route with a dynamic name, or a new static sibling of `projects/[projectId]` or `services/[serviceId]`, would get the wrong trail or a stale one, and no test would catch it. ADR-025 names that exact regression.
- **Fix, pick one:**
  - **(a) Recommended, about 30 minutes:** add a unit test that lists every `page.tsx` under `src/app/(owner)/w/[workspaceId]/` (outside `@crumbs`). For each one, it asserts there is either a matching `@crumbs` page, or a path that `staticOwnerTrail` resolves (`(list)` group stripped, `[section]` checked against the *Segera hadir* sections). It also asserts that every static sibling of a dynamic slot segment has a mirror. The Owner trail then has automated coverage for AC-004…006 at route level.
  - **(b) Owner decision:** amend ADR-025 › Consequences to "no automated coverage check; checked by review", with the date and the Owner's words. A test isn't needed after that.

## 6. Non-blocking deviations

| ID | Deviation | Source | Suggested action |
|---|---|---|---|
| D-1 | **Design-system and Pencil drift** (waived, C-012). (1) The library *Sidebar* component still draws the collapse button in the logo row and the expand button on the rail; the code removed both. (2) The C40 Page Header breadcrumb bar has no leading toggle slot. (3) The per-page trails drawn in feature frames and recorded in `catalog/design.md`, `projects/design.md`, `message-templates/design.md`, `clients/design.md` contradict R-1 (FC-002). | spec › *Design*, FC-002 | Sync in the next design pass: Sidebar and C40 in `design-system.lib.pen`, then the affected frames and design notes |
| D-2 | The toggle sits inside the bar's left padding (`breadcrumb-padding-x` = `space.10`), so on desktop and tablet the first crumb now starts right of the hero title's left edge, offset by the toggle's width plus `space.2`. No design reference was drawn for it. | page-header.tsx `BreadcrumbRow` | Owner looks at it in the review. If it should line up, decide it in the design pass (D-1) |
| D-3 | Coding-rule conventions (not linted): `owner-trail.ts` exports `type OwnerSection` from an implementation file (rule: exported types go in `owner-trail.types.ts`); `ownerTrail(input: { … })` takes an inline object type literal (rule: extract a named interface); `PageHeaderTrail` and `CrumbText` use inline props literals (an existing pattern in that file) | coding-rules › *Where types and schemas live* | Move `OwnerSection` and an `OwnerTrailInput` interface to `owner-trail.types.ts` (5 minutes, no behaviour change) |
| D-4 | Doc status drift (C-011): `technical-design.md` still says `Status: PLANNED` (this run updated `spec.md`); technical design §10 still says AC-CRUMB-013 is "blocked (Task 8)"; the F-22 amendment notes in `app-shell-revamp/acceptance-criteria.md` (lines 26, 35) and `client-access/acceptance-criteria.md` (lines 227, 244) still say "not yet built" | those files | Update the status lines and drop "not yet built" when B-1 is closed |
| D-5 | Minor code findings from the build: duplicate JSDoc on the cached loaders (for example `gallery-flow.ts` lines 71 and 94); `OWNER_NAV_COPY.create` reused as the *Proyek baru* crumb label (same text today, but a different meaning); very short middle crumbs can shrink to a few pixels beside a long title; a hydration warning on `<html data-theme>` once in an e2e log (root layout, likely pre-existing) | build notes › *Open minor findings* | Later cleanup; record them in `docs/findings/` if they aren't fixed with B-1 |
| D-6 | No E2E was re-run in this verification (Owner instruction). AC-001, 009, 015 and 016 rely partly on the last green e2e run of 2026-10-12. | — | Run the two specs once before `/sdv:ship` |
| D-7 | The branch is local on `staging` (not pushed, no PR). The feature map says it is awaiting the Owner's review on `localhost`. | feature map F-22 | Owner reviews the change |

## 7. Status

The feature map (F-22) is set to **BUILT, verified 2026-10-12, 1 blocking item (B-1)**. It is not `DONE`. Close B-1 with option (a) or (b), then re-run `/sdv:verify-feature breadcrumb-revamp` (B-1 only, plus the D-4 doc fixes) to set it to `DONE`.

**Follow-up (2026-10-12, same day):** B-1 closed with option (a). `src/features/workspace/ui/owner-trail/owner-route-coverage.test.ts` lists every Owner page and slot page; it fails on a dynamic page with no slot, a static sibling of a dynamic slot segment with no mirror, a static page the catch-all cannot name, or a slot page with no real page. `[section]` is the one exception (served by the catch-all). The test was checked by adding a temporary dynamic page, which made it fail; the page was removed. D-4 doc status lines are updated. D-3 and the other non-blocking items are still open. Re-run `/sdv:verify-feature breadcrumb-revamp` to set the status to `DONE`.
