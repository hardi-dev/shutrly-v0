# Verification report — Setup flow fixes (F-24)

Date: 2026-10-12 · Branch: `staging` at `00468175` (F-24 range `561ad17c..HEAD`, local, not pushed) · Verifier: `/sdv:verify-feature setup-flow-fixes`, run without E2E tests (Owner: "tanpa e2e test")
**Result: PASS WITH DEVIATIONS → `DONE`.** No blocking item. Every live acceptance criterion (AC-SFX-001…004, 009…017) has passing evidence, the quality gate passes, and the deviations below are non-blocking (follow-ups listed in §7).

Artifacts checked: [constitution](../../constitution.md) (C-001…C-012, C-101, C-103), [coding rules](../../coding-rules.md), BR-WS-002, BR-WS-003, BR-GAL-007 (as amended by F-21), BR-L10N-002, [intent](intent.md), [spec](spec.md) (incl. FC-001…FC-006), [acceptance criteria](acceptance-criteria.md), [technical design](technical-design.md) (D-1…D-7), [plan](plan.md) (all tasks ticked, incl. 5.4), [build notes](build-notes.md), [copy draft](copy-draft.md) (APPROVED), F-22 [copy deck](../bilingual-copy-revamp/copy-deck.md), ADR-010, ADR-015, ADR-021, ADR-025, [ADR-026](../../architecture/decisions/ADR-026-owner-breadcrumb-parallel-route.md), [token usage rules](../../design-system/token-usage.md) (APPROVED, so deviations from them are real deviations, not advisory), [FND-003](../../findings/FND-003-ui-copy-lint-misses-copy-in-constants.md). No UML diagrams exist for F-24 (none needed: no new flow or state). No Pencil frames for F-24 by Owner decision (FC-005).

## 1. Quality gate (re-run 2026-10-12)

| Check | Result |
|---|---|
| `pnpm typecheck` (`next typegen && tsc --noEmit`) | PASS (exit 0) |
| ESLint, the 83 changed `src/` and `tests/` files | PASS (exit 0) |
| Prettier `--check`, same files | PASS |
| `pnpm tokens:check` | PASS (626 tokens, 1980 files) |
| `pnpm build` | PASS (exit 0; working tree unchanged afterwards) |
| Unit: 27 related paths (use-hydrated, `features/auth/ui`, client-password-form, waitlist-form, settings-screen, the four catalog dialogs, option-list-editor, category-dialog, catalog/client/team/project copy, catalog-skeletons, page-not-found-screen, owner-workspace-context, owner-trail incl. `owner-route-coverage`, owner-shell, workspace-not-found-screen, source-copy, gallery-copy, browse-text, setup-guide-card, `copy-registry`, `tests/lint/coding-rules`) | PASS 210/210 (54 files) |
| E2E `forms-without-js.spec.ts`, `page-not-found.spec.ts` | **Not re-run** (Owner instruction). Last results: `forms-without-js` 10/10 with `E2E_CLIENT_GALLERY_PATH` set, `page-not-found` 2/2 with `--retries=0` ([build notes](build-notes.md) › Iteration 5 and 6, Follow-up). Commits after those runs touch copy, skeletons and a lint rule only. |
| Migrations | None in this feature |

## 2. Functional behaviour (acceptance criteria)

| AC | Evidence | Result |
|---|---|---|
| 001 Credentials never reach a URL | Every D1 form has `method="post"` (6 auth forms, client password, waitlist, settings; read in code and asserted in each form's test); E2E: `/register`, `/login`, `/forgot-password`, `/`, `/g/<token>` are posts, Enter leaves no query string and sends no POST (last run) | PASS |
| 002 Submit waits until ready | `useHydrated` (`useSyncExternalStore`, server snapshot `false`); each form's test renders server markup with the button disabled and enabled after mount; E2E with JavaScript off (last run). A disabled default button also blocks implicit submission; the only other buttons in these forms are React Aria buttons (`type="button"`) | PASS |
| 003 A native post changes nothing | E2E `request.post` to `/register` (no account, no email, no session cookie, no echo) and `/login` (no session, no echo) (last run). Other forms: documented verification, see DV-1 | PASS (with DV-1) |
| 004 Server-action forms unchanged | `google-button`, `account-unavailable-screen` not in the diff; their tests pass | PASS |
| 009 Enter equals the primary button | Four dialogs wrap fields in `<form id={useId()} noValidate onSubmit>`, primary `type="submit" form={formId}`; each dialog test (Enter → action once, same input; invalid → same error); real Enter in a browser for *Add service* (build 6.1). `option-list-editor` key fix keeps focus in option rows | PASS (with DV-5) |
| 010 No double submit | `onFormSubmit` returns while pending, the button is `isPending`; "Enter twice → once" in each dialog test. No multi-line field in catalog dialogs (D-4) | PASS |
| 011 Missing page inside a workspace | `w/[workspaceId]/not-found.tsx` → `PageNotFoundScreen` inside the shell; `page-not-found-back-target.test.ts`, `page-not-found-screen.test.tsx` (EN/ID); E2E: unknown template slug, random project and service uuid, unknown section (last run). Selection group id: code path only, see DV-4 | PASS (with DV-4) |
| 012 Foreign record looks missing | Scoped loaders throw `notFound()` for foreign ids (BR-WS-002/003); same screen and trail; E2E owner B on owner A's project/service ids shows no A data (last run) | PASS |
| 013 Workspace not found stays | Layout `verifyOwnerWorkspace` `notFound()` still reaches `w/not-found.tsx`; E2E random workspace uuid (last run) | PASS |
| 014 Breadcrumb on page not found | `@crumbs/not-found.tsx` → `PageNotFoundCrumbs` from pathname + `OwnerWorkspaceProvider`, never the record; `page-not-found-trail.test.ts`, `page-not-found-crumbs.test.tsx`; E2E asserts workspace + section shown and no id or name (last run) | PASS |
| 015 No folder name is special | `source-copy.test.ts`, `gallery-copy.test.ts` (no EN/ID message matches `` `edited` `` / `` `print` ``, no exception left after task 5.4); `git grep` over `src` finds no remaining folder-name wording | PASS |
| 016 Deck and code agree | Four `*.deck.test.ts` (source, gallery, catalog, page-not-found) pass; the deck has no row presenting `edited`/`print` as folder names (searched 2026-10-12) | PASS |
| 017 English catalog screens English only | `catalog-copy.test.tsx` (EN ≠ ID, equals approved rows); browser EN/ID screenshots (build 6.1) | PASS |
| 005…008 | Withdrawn (D2/D7 not reproduced, Owner 2026-10-12) | n/a |

Business rules and constitution: C-103/C-006 (D1) PASS; BR-WS-003/C-101 (D4) PASS, the back link and trail come from the pathname and the verified workspace only; BR-GAL-007 (D5) PASS; BR-L10N-002 (D6, plus the loading-copy follow-up) PASS; C-007 (page-not-found state) PASS; C-009 PASS with DV-1/DV-4 documented here.

## 3. Technical quality

| Item | Result |
|---|---|
| Server authority, security (C-004, C-006, C-103) | PASS. No server action, loader or schema changed. A native post renders the page without a `Next-Action` header, so no action runs and nothing reads the body. |
| Tenant isolation (C-101) | PASS. No new data path; foreign ids hit the existing scoped loaders. |
| Architecture (unit folders, co-located tests, ADR-015, ADR-026) | PASS. New units each have their own folder and test (`use-hydrated`, `page-not-found-screen`, `owner-workspace-context`). D-6 spike held case (a): no ADR-026 amendment needed. |
| Copy rules (copy only from approved deck rows, no inline UI text) | PASS. `copy-draft.md` APPROVED; deck parity tests; `local/ui-copy` now also catches copy held in constants (FND-003, `tests/lint/coding-rules.test.ts`). |
| Scope (C-010) | PASS. Additions outside the plan's file list are recorded and justified in build notes: option-row key (needed by AC-SFX-009), workspace context + crumbs (Owner chose *workspace › section*), loading-copy follow-up (Owner request), lint fix (FND-003). |
| Lint shape (≤ 50-line functions etc.) | PASS (ESLint clean). |

## 4. Visual fidelity (Pencil)

- **D4 page not found:** no Pencil frame (Owner exception, FC-005). Built from the library `EmptyState` (standalone) inside the shell; browser screenshots EN/ID in build 6.1. See DV-3 for one spacing deviation.
- **D1, D3:** no visual change beyond the disabled state of existing buttons (library `Button` disabled style).
- **D5 copy in existing frames:** the code is now ahead of Pencil. The F-04 source-config frames still carry the old guide text (export `list-populated-w4uSN.html`: *"Untuk hasil akhir, nanti tambahkan subfolder edited dan print."* and the `edited` / `print` tree labels). See DV-2.
- **D6:** copy-only changes to existing screens; no layout change.

## 5. Design-system compliance (token-usage.md, APPROVED)

| Rule | Result |
|---|---|
| G2 / G4 no primitives, no hard-coded values | PASS. No `primitive`, hex, rgba, arbitrary `[…px]` or margin utility in any F-24 addition (diff scan). Pre-existing `md:w-[178px]` in the waitlist button and `max-w-[1096px]` in `app-panel` are not F-24 changes. |
| G5 fg/bg pairing | PASS. New UI reuses `EmptyState` (accent-soft / accent-soft-fg) and `PageHeaderTrail`; no new colour pairs. |
| SP1–SP11 spacing ladder and insets | **DEVIATION DV-3**: `PageNotFoundScreen` wraps `EmptyState` in `p-(--space-6)` inside the app panel, whose content already has the layout inset (28 / 40). That stacks padding (SP8) and differs from the sibling `ComingSoonScreen`, which adds none. Low severity. |
| SP5 no padding overrides on instances | PASS for F-24. (The settings save button's `md:px/py` override pre-dates F-24.) |
| Token pipeline (`tokens:check`) | PASS, no token change. |

## 6. Deviations

| ID | Artifact | Expected | Actual | Severity / resolution |
|---|---|---|---|---|
| DV-1 | Technical design › Testing, AC-SFX-003 | E2E `request.post` to `/register`, `/login` **and `/g/<token>`** | Only register and login are posted natively. The gallery E2E case checks `method` and the disabled button (001/002), not 003; build notes' "AC-SFX-001…003 … for the gallery password form too" overstates it. Waitlist, settings, profile, reset/forgot have no native-post test. | Non-blocking: documented verification here (page render for a POST runs no server action, attempts are only counted inside the action). Follow-up: add the `/g/<token>` native-post case (no attempt counted, no session cookie, no echo). |
| DV-2 | Pencil (F-04 source-config frames, e.g. `w4uSN`) | Pencil is the visual truth and matches shipped copy | Pencil still shows `edited` / `print` subfolder guidance; code follows BR-GAL-007 (higher authority) | Non-blocking design drift. Follow-up: update the guide text and tree labels in those frames via Pencil MCP (joins the existing "sync Pencil with F-21" item in HANDOFF). |
| DV-3 | token-usage SP8 / layout map 4.5 | Screen content sits directly in the panel content inset | Extra `p-(--space-6)` around `EmptyState` | Low. Fix: drop the wrapper padding (match `ComingSoonScreen`). |
| DV-4 | AC-SFX-011 (selection group id) | Evidence for each listed record type | Project, service, template, section are E2E-tested; a missing group id is verified in code only (`loadSelectionGroupDetail` → `gallerySaveError` → `notFound()`) | Non-blocking, documented here. |
| DV-5 | AC-SFX-009 evidence | Enter key per dialog | Unit tests fire the form `submit` after checking the button's form owner (jsdom can't do implicit submission across the `form` attribute); real Enter checked in a browser for *Add service* only | Non-blocking; same browser association. |
| DV-6 | C-008 | No interactive element inside another | `PageNotFoundScreen` renders `<Link><Button>` (a `<button>` inside `<a>`), copying `WorkspaceNotFoundScreen` | Advisory, pre-existing pattern; fix both together (link styled as a button). |
| DV-7 | build notes / HANDOFF | Open items current | HANDOFF lists *Memuat layanan* on the EN UI as open; it was fixed in `5d39543e`. The "mixed-language EN diagram labels" question is answered by spec › D5, which allows example subfolders named as an Owner would (*Hasil Edit*), and the Owner approved the text | Docs only; refresh with `/sdv:handoff`. |

Observation (outside F-24): the reset-password link carries its token in the query string by F-01 design; F-24 doesn't change that and no form adds to it.

## 7. SPEC GAP / CONFLICT
- None open. FC-001…FC-006 are all WITHDRAWN or RESOLVED in the spec.

## 8. Result
**PASS WITH DEVIATIONS.** Nothing blocking; feature map F-24 set to `DONE` (verified 2026-10-12). Recommended follow-ups before or with ship: DV-3 (one-line fix), DV-1 (one E2E case), DV-2 (Pencil text sync), DV-6 (both not-found screens). Ship notes must say the waitlist form change (D1) reaches production with the next landing deploy (ADR-021).
