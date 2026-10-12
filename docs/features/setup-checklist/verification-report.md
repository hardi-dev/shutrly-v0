# Verification report — Setup checklist (F-25)

Date: 2026-10-12 · Branch: `feat/setup-checklist` at `e22bde22` (F-25 range `staging...HEAD`, base `24ac2956`; local, not pushed) · Verifier: `/sdv:verify-feature setup-checklist`, run without E2E tests (Owner: "without e2e")
**Result: PASS WITH DEVIATIONS → `DONE` (confirmed).** Nothing blocks. Every acceptance criterion (AC-SETUP-001…020) has passing evidence. The quality gate passes. The deviations in §6 don't block; three of them need an Owner decision (DV-1, DV-2, DV-7).

Artifacts checked: [constitution](../../constitution.md) (C-001…C-012, C-101, C-102), [coding rules](../../coding-rules.md), BR-CAT-002, BR-CAT-007, BR-CAT-008, BR-CAT-011, BR-PRJ-001, BR-PRJ-008, BR-PRJ-010, BR-SEL-001, BR-WS-002, BR-WS-003, BR-WS-004, BR-L10N-001, BR-L10N-002, [intent](intent.md) (ACCEPTED), [spec](spec.md) (FC-001…FC-003 resolved), [acceptance criteria](acceptance-criteria.md), [design](design.md) (APPROVED) and [exports](exports/INDEX.md), [technical design](technical-design.md) (D-1…D-10), [plan](plan.md), [build notes](build-notes.md), F-22 [copy deck](../bilingual-copy-revamp/copy-deck.md) §4.3a/§7.2, ADR-003, ADR-009, ADR-015, ADR-016, ADR-018, ADR-025, and the [token usage rules](../../design-system/token-usage.md). Those rules are APPROVED, so a deviation from them is a real deviation, not advice. No UML diagrams exist for F-25. None were needed: the step states are a pure function, and the spec's *Steps* table defines them.

## 1. Quality gate (re-run 2026-10-12)

| Check | Result |
|---|---|
| `pnpm typecheck` (`next typegen && tsc --noEmit`) | PASS (exit 0) |
| ESLint, the 42 changed `src/` and `tests/` `.ts/.tsx` files | PASS (no output) |
| Prettier `--check`, same files + F-25 docs, feature map, copy deck | PASS |
| `pnpm tokens:check` | PASS (626 tokens, 1996 files) |
| `pnpm build` | PASS (exit 0; working tree unchanged afterwards) |
| Unit/DOM, related: domain, use case, `setup-step-href`, `setup-checklist-row`, `setup-checklist` (+ deck), `dashboard-screen`, `services-screen`, `use-open-on-load`, `create-project-screen`, `project-copy.deck`, `app-panel`, `icon` | PASS 78/78 (15 files) |
| Unit, cross-cutting: `copy-registry`, `tests/lint/coding-rules`, `tests/lint/boundaries`, `catalog-copy`, `list-card-item`, `section-card` | PASS 29/29 (7 files) |
| Integration `tests/integration/workspace/drizzle-setup-facts-reader.test.ts` (non-production DB) | PASS 10/10 |
| `python3 scripts/sdv/index-exports.py setup-checklist --check` | PASS (index up to date) |
| E2E `setup-checklist/checklist.spec.ts`, `workspace/workspace.spec.ts` | **Not re-run** (Owner instruction). Last results at build: checklist passed, workspace 3/3 ([build notes](build-notes.md) › E2E). `catalog.spec.ts` AC-CAT-023 (axe) is still **not verified** (DV-9). |
| Migrations | None (technical design › Database changes) |

## 2. Functional behaviour (acceptance criteria)

| AC | Evidence | Result |
|---|---|---|
| 001 New workspace shows the checklist | `setup-checklist.test.ts` (step 1 current, 2–3 locked, 4 open); `setup-checklist.test.tsx` (four rows in order, markers, one action); `dashboard-screen.test.tsx` (checklist instead of *Set up branding*); integration "new workspace has nothing set up"; read-only adapter (one `select`, no write path). E2E at build. The **greeting** bullet is not met: see DV-1 | PASS (with DV-1) |
| 002 Any project hides it | domain (`hasProject` → `null`); integration (DRAFT, BOOKED, COMPLETED, CANCELLED → `has_project`); `dashboard-screen.test.tsx` (null → unchanged placeholder) | PASS |
| 003 Deleting the only draft brings it back | integration "stops counting a deleted draft" (`exists` over live rows; drafts are hard-deleted, BR-PRJ-010) | PASS |
| 004 Workspace isolation | integration with two workspaces; every subquery filters on the verified `workspace_id` (read in code) | PASS |
| 005 Step 1 opens *Add service* | href `/services?add=service` (`setup-step-href.test.ts`); `services-screen.test.tsx` (opens from the link, closing drops the query); `use-open-on-load.test.tsx` (only the visible layout copy opens). Save → service page: E2E at build only (DV-5) | PASS (with DV-5) |
| 006 Active service completes step 1 | domain + `setup-checklist.test.tsx` (step 1 done with no button, step 2 current with *Add package items*, step 3 open link) | PASS |
| 007 Archived services don't count | domain; integration (archived → count 0; capped at 2; sole ID only when exactly one) | PASS |
| 008 Only a selection item completes step 2 | integration (non-selection items → false; *Foto edit* → true); D-9 archived definition still counts | PASS |
| 009 Selection item on an archived service | integration | PASS |
| 010 / 011 Step 2 target | domain targets + `setup-step-href.test.ts` (one service → its page; several → *Services*, no dialog) | PASS |
| 012 Step 3 opens *New project* | domain (step 3 open while step 2 current); `setup-checklist-row.test.tsx` (one link to `/projects/new` named by the title). "Creating there succeeds, checklist gone" rests on F-07 tests + AC-002 (DV-5) | PASS (with DV-5) |
| 013 Locked steps can't be used | `setup-checklist-row.test.tsx` (no link, no button, hint text, nothing focusable). "Announced as unavailable" comes from the hint text only (DV-4) | PASS (with DV-4) |
| 014 Step 4 follows the brand name | domain (done/open, never locked, also without a service); integration (blank vs set, `btrim`); row test (workspace name in the body). Settings round trip not automated (DV-5) | PASS (with DV-5) |
| 015 Removing data reverts steps | domain (archived only service → 1–2 not done, 2–3 locked, 4 kept) | PASS |
| 016 No-service alert | `create-project-screen.test.tsx` (new body, *Add service* → `/services?add=service`, both submits disabled); `project-copy.deck.test.ts`; E2E at build | PASS |
| 017 Complete EN and ID | `setup-checklist.test.tsx` and row test in `id`; `setup-checklist.deck.test.ts` and `project-copy.deck.test.ts` equal the approved §4.3a/§7.2 rows; `copy-registry` test (module registered, EN/ID key parity) | PASS |
| 018 Not colour alone | row test: *Done* chip text, locked hint text, open row link named by its title; icons are `aria-hidden` | PASS (with DV-4) |
| 019 Cheap reads | one `db.execute` (integration spy); scalar `exists`/capped `count`/`limit 1`, no row lists (read in code). Ownership check stays in `enterWorkspace` (separate, pre-existing) | PASS |
| 020 One button per state | domain "exactly one current in every fact combination" (10 valid combinations of service count, selection item, brand name); `setup-checklist.test.tsx` (one action moves to step 2). Phone placement: build visual check only (DV-6) | PASS (with DV-6) |

Business rules and constitution: BR-CAT-011 PASS (read-only, nothing seeded); BR-CAT-008 PASS (`s.is_active` in every service subquery); BR-SEL-001/BR-CAT-002/007 PASS (`d.selection_required`); BR-PRJ-008/001 PASS (step 3 only after an active service; *New project* unchanged apart from the alert); BR-PRJ-010 PASS; BR-WS-002/003 and C-101 PASS; BR-WS-004 PASS; BR-L10N-001/002 PASS; C-007 PASS (states drawn and built; loading/error reuse the route UI, spec E1/E2); C-008 PASS with DV-2/DV-4; C-102 n/a (no snapshot touched).

## 3. Technical quality

| Item | Result |
|---|---|
| Server authority, security (C-004, C-006) | PASS. No new action or route handler. The workspace ID is verified by `enterWorkspace` before the facts read. The SQL is parameterised (`sql` template). The row is parsed with Zod (`drizzle-setup-facts-reader.schema.ts`). `?add` is compared to one literal; a repeated param (array) just doesn't open the dialog. |
| Tenant isolation (C-101, ADR-003) | PASS. All five subqueries are scoped; the joins carry `workspace_id` on both sides; integration isolation test. |
| Free-tier budget (ADR-018) | PASS. One statement, scalar subqueries, no listing (FC-003 / D-2). |
| Architecture (ADR-016, folder rule, boundaries) | PASS. Domain/port/use case in `features/workspace`, adapter in `adapters/db`, wiring in `composition/workspace/dashboard-flow`; no `features/` → `features/` import (`tests/lint/boundaries` passes). Each new unit has its own folder and co-located test. |
| Consistency (C-005) | PASS. One statement means one snapshot; nothing is stored. |
| Copy rules (ADR-025, F-22) | PASS. One copy module per unit; strings equal approved deck rows (deck tests). The row's sibling copy module re-exports the checklist namespace for `local/ui-copy` (build notes). |
| Scope (C-010) | PASS. Additions outside the plan are recorded and justified in the build notes: `useOpenOnLoad`, `PageContent min-h-full`, three icons, `history.replaceState`. |
| Lint shape (≤ 50-line functions etc.) | PASS (ESLint clean). |

## 4. Visual fidelity (Pencil)

Compared statically against the raw exports `dashboard-new-workspace` (desktop `liGsJ`), `dashboard-step-1-done` (desktop `u4OTj3`) and the design's *Row overrides* table. No new browser pass in this run: see DV-6.

| Element | Export | Code | Result |
|---|---|---|---|
| Card | 720 wide, centered; desktop also vertically (Container `justify-center`) | `max-w-(--size-content-narrow)`, `items-center`, `xl:justify-center` (desktop shell is `xl`, `app-shell.tsx`); tablet top-aligned | match |
| Card header | title, description, progress `13/semibold text.secondary` in Actions | `SectionCard` title/description, `actions` = progress `body-sm semibold text.secondary` | match |
| Row | padding 12, gap 12, separator `#F0F0F2` except last | `LIST_CARD_ROW` (`list-card.item.padding/gap` = `space.3`), `border-b list-card.item.border` except `isLast` | match |
| Icon well | 36, radius 12, `#F4F4F5`; done `#E8F7EE` + green tick; locked `lock` `#71717A` | `size-(--space-9)`, `list-card.item.icon-radius`, `icon-background`; done `status.success.bg/fg` + `check`; locked `lock` + `text.muted` | match |
| Title row | title 14 semibold + chip gap 8; done/locked title `text.secondary` | `font-size-body` semibold, `gap-(--space-2)`, `StatusChip` after title; done/locked → `text.secondary` | match |
| Description | 13 `#71717A` (`text.muted`) | `font-size-body-sm`, `text.muted`; locked → hint | match |
| Trailing | current: Button Primary MD in a 42 high slot; open: chevron 16 `text.muted`; done/locked empty | `Button` (default primary MD); `min-h calc(2×button.md.padding-y + 1lh)` = 42; chevron `sm` `text.muted`; empty otherwise | match |
| Hover (open row) | row fill `#F4F4F5` (`u4OTj3`, step 3) | `hover:bg-(--color-semantic-surface-subtle)` | match |
| Phone current step | button under the description, hugging its label, inset 60 from the card edge | `basis-full`, `pl-[calc(space.9 + list-card.item.gap)]` inside the 12 row padding = 60 | match |
| Header title | **"Welcome to Explore Studio"** (display) | shell header **"Dashboard"** | **deviation DV-1** |
| *New project* alert | Alert/Info, *Add service* action | `NoServiceAlert` (library `Alert`), copy replaced, href changed | match |

## 5. Design-system compliance (token-usage.md, APPROVED)

The `sdv-design-tokens-system` checks were applied to the changed UI files (`setup-checklist-row.tsx`, `setup-checklist.tsx`, `dashboard-screen.tsx`, `services-screen.tsx`, `app-panel.tsx`).

| Rule | Result |
|---|---|
| G2 no primitives | PASS. No `--color-primitive-*` in changed code; `tokens:check` validates every CSS variable. |
| G4 no hard-coded values | PASS. No hex/rgba; the two `calc()` values are built only from tokens (`button.md.padding-y`, `space.9`, `list-card.item.gap`) plus `1lh`. Pre-existing `max-w-[1096px]` (App Panel) and `min-h-[480px]` (placeholder) are untouched by F-25. |
| G3 component tokens | PASS with accepted exceptions: description `text.muted` instead of `list-card.item.meta`, done well `status.success.bg/fg` (design.md › Token-usage exceptions, Owner "keep overrides"). The hover fill `surface.subtle` has no `list-card` hover token; it matches the export. |
| G5 fg/bg pairing | PASS. `status.success.fg` on `status.success.bg`; chips are library `StatusChip` tones; button label is the library pair. |
| T3 `text.muted` | PASS (re-measured as design.md asked): on `surface.panel` 4.83:1 light, 6.41:1 dark. **On the hovered/focused row (`surface.subtle`) it is 4.40:1 in light**, below 4.5 (DV-3). |
| SP1/SP8 spacing ladder | PASS with the accepted SP1 exception (phone inset 60 = 12 + 36 + 12, a sum of tokens). |
| SP2–SP4, SP7 | PASS. Gaps for siblings, padding for containers, no margins or spacer elements. |
| SP5 no padding overrides on instances | PASS. `SectionCard`, `StatusChip`, `Button`, `Alert` are used without spacing overrides. The row is a feature component (D-7) reusing `LIST_CARD_ROW`, as the design keeps the row as overrides (no library variant). |
| SP9/SP10 | PASS (row 12 inside card 20/24; one density). |
| §2 Action & focus / §8 "`focus.ring` on every focusable element; never remove it" | **FAIL (DV-2).** The open-row link has `outline-none` and only `focus-visible:bg-(--component-list-card-item-icon-background)`. That is `surface.subtle`, the same as hover, and 1.10:1 against the panel (1.08:1 dark). The pattern is copied from the library `ListCardItem` (`list-card-item.tsx` lines 77 and 118), so it is library-wide drift. |
| One primary per region (`action.primary`) | PASS. Exactly one primary button on the checklist (AC-020). |
| Status never colour-only | PASS. *Done* and the markers are text chips; locked uses hint text. |

Pencil side: design.md records 626 variables matching `pencil-mapping.json`, linked instances only, no local component, and no `DESIGN TOKEN GAP`. Not re-queried through MCP in this run, since no `.pen` changed after approval (last save 17:35, committed in `e78be2de`).

## 6. Deviations

| ID | Deviation | Severity | Recommendation |
|---|---|---|---|
| DV-1 | **Greeting / header title.** AC-SETUP-001 and spec *UI States* say "greeting + checklist", and every dashboard export shows the header title *Welcome to Explore Studio*. The build keeps the shell header *Dashboard* / *Your workspace: {workspaceName}.* and drops the in-content greeting while the checklist shows (technical design D-6, R-1). It treats the export title as a frame artifact. This is a CONFLICT between AC/design and the technical design; the lower-authority document won without an Owner decision. | Non-blocking (cosmetic; behaviour intact). **Owner decision needed.** | Either (a) design wins: while the checklist shows, the page header title is the existing `dashboard.greeting` row ("Welcome to {workspaceName}" / "Selamat datang di {workspaceName}"), via the shell's title for the dashboard route; or (b) keep the shell header and reword AC-SETUP-001 bullet 1 and spec *UI States* to "checklist (the shell header keeps *Dashboard*)". **RESOLVED (Owner 2026-10-12):** AC-SETUP-001 and spec *UI States* reworded to the shell header + checklist only. |
| DV-2 | **Focus indicator on open rows.** `outline-none` + background change only (1.10:1), identical to hover; token-usage §2/§8 require `focus.ring` and never removing it; C-008 / WCAG 2.4.7 is at risk. Inherited from library `ListCardItem`. | Non-blocking for F-25 (same pattern as the shipped library row), **should fix**. | Add `focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--color-semantic-focus-ring)` (as `Button` does) to the row link, and fix `ListCardItem` the same way in its own change. Owner to decide whether it is fixed before ship. **FIXED for the checklist row (2026-10-12):** inset `focus.ring` shadow on open rows, test added; the shared list-card row stays a separate task. |
| DV-3 | Description `text.muted` on the hovered/focused row (`surface.subtle`) is 4.40:1 in light mode (< 4.5). Transient state; resting state is 4.83:1. | Advisory | Accept as part of the T3 exception, or use `text.secondary` on hover. |
| DV-4 | Locked rows say they are unavailable only through the visible hint text ("This step opens after you add a service"); there is no programmatic state. Step 3's "not done" is implied by the missing *Done* chip. AC-013/018 are met by text. | Advisory | Optional: add a visually hidden state word if screen-reader testing shows it is unclear. |
| DV-5 | Parts of AC-005 (save → service page), AC-012 (create from step 3 → checklist gone) and AC-014 (save brand name in Settings → done) are covered only by the build-time E2E or by other features' tests. E2E was not re-run in this verification. | Non-blocking | Re-run `tests/e2e/setup-checklist/checklist.spec.ts` at `/sdv:ship`. Optionally extend it with step 3 → project → no checklist. |
| DV-6 | No new browser visual pass in this verification: the gstack headless browser has no Chromium installed (it would need a download), and E2E was excluded. Fidelity rests on the static export comparison (§4), the build's check at 1440/1024/390, and the Owner's preview on `localhost:3000`. | Non-blocking | Screenshot at 1440/1024/390 during `/sdv:ship` smoke test, mainly the phone current-step button (AC-020). |
| DV-7 | *Optional marker* deck row added at build under the existing §4.3a approval (D-10, R-4). No record says the Owner saw it. | Non-blocking. **Owner acknowledgement.** | Owner confirms the row (*Optional* / *Opsional*). **RESOLVED:** Owner confirmed the row on 2026-10-12. |
| DV-8 | Doc drift: technical design D-5 still says `router.replace`. Build uses `window.history.replaceState` + `useOpenOnLoad` (recorded in build notes). E2E asserts the literal `"0 of 4 done"` though the AC note says tests read copy from the catalogue. | Minor | Sync D-5 to the build; read the progress text from `SETUP_CHECKLIST_COPY` in the E2E. |
| DV-9 | `catalog.spec.ts` AC-CAT-023 (axe, desktop and phone) is unverified since the build run, where it stalled before any F-25 screen. | Non-blocking (carried) | Rerun alone on a free port at ship: `npx playwright test tests/e2e/catalog/catalog.spec.ts -g AC-CAT-023`; compare with `staging` if it fails. |
| DV-10 | Technical-design deviations recorded in build notes: `useOpenOnLoad` (shell renders two copies), `PageContent min-h-full`, trailing height via `calc`, three icons from Hugeicons. All are justified and tested. | Accepted | None. |

No `SPEC GAP`. One `CONFLICT` (DV-1), resolved by the Owner on 2026-10-12 by rewording AC-SETUP-001.

## 7. Status

Feature map F-25 stays `DONE`, now verified (pass with non-blocking deviations). Follow-ups, in order: DV-1 decision, DV-2 focus ring (row + library), DV-7 acknowledgement, then at ship DV-5/DV-6/DV-9 runs and the DV-8 doc sync.
