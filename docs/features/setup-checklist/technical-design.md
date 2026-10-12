# Technical Design — Setup checklist (F-25)

Status: PLANNED (2026-10-12) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) · Design: [design.md](design.md), [exports/INDEX.md](exports/INDEX.md) · Plan: [plan.md](plan.md)

## Context

A workspace with no project shows a four-step setup checklist on its dashboard instead of the placeholder's *Set up branding* empty state. Every state is derived on each dashboard load from workspace data; nothing is stored and nothing is written. *New project*'s no-service alert gets new copy and links to *Add service*, which becomes reachable by URL.

Existing code this builds on:
- Dashboard route `src/app/(owner)/w/[workspaceId]/page.tsx` → `enterWorkspace` (`src/composition/workspace/owner-workspace/owner-workspace.ts`) → `DashboardScreen` (`src/features/workspace/ui/dashboard-screen/`).
- The shell header (title *Dashboard*, subtitle *Your workspace: {workspaceName}.*) comes from `OwnerShell` / `owner-nav.copy.ts`, not from the dashboard screen.
- Services: `src/app/(owner)/w/[workspaceId]/services/page.tsx` → `ServicesScreen` with a local `useServiceDialogs` hook (`isDialogOpen`).
- *New project*: `NoServiceAlert` in `src/features/booking/ui/create-project-screen/client-service-card.tsx` (`router.push(/w/{id}/services)`), copy in `src/features/booking/ui/project-copy/project-copy.copy.ts` (`noServiceBody`, `noServiceAction`).
- UI: `SectionCard` (`content="flush"`), `ListCardItem` and its `LIST_CARD_ROW` classes, `StatusChip`, `Button`, `Icon`.
- Copy modules register in `src/app/copy-registry.ts`; deck-match tests follow `page-not-found-screen.deck.test.ts`.

## Relevant authority

- Constitution: C-002, C-004, C-007, C-008, C-009, C-101 (tenant isolation), C-010.
- Rules: BR-CAT-002, BR-CAT-007, BR-CAT-008, BR-CAT-011, BR-PRJ-001, BR-PRJ-008, BR-PRJ-010, BR-SEL-001, BR-WS-002, BR-WS-003, BR-WS-004, BR-L10N-001, BR-L10N-002.
- ADRs: ADR-003 (workspace isolation), ADR-009 (request-scoped Neon pool), ADR-015 (URL-scoped workspace), ADR-016 (cross-feature work is wired in `composition/`), ADR-018 (free-tier budget: cheap reads), ADR-025 (next-intl, one copy module per unit).
- Spec flagged concerns: FC-001, FC-002, FC-003 all `RESOLVED`; FC-003's decision (dedicated existence reads, never the *New project* service listing) is D-2 below.

## Decisions

- **D-1 — The workspace feature owns the checklist.** The dashboard is F-02's screen, so the pure step logic lives in `features/workspace/domain/setup-checklist`, the read port and use case in `features/workspace/application`, the screen parts in `features/workspace/ui`. The feature imports nothing from `booking`.
- **D-2 — One read port, one SQL statement.** `SetupFactsReaderPort.read(context)` returns five facts (see *Domain*). Its adapter `adapters/db/setup-facts-reader/drizzle-setup-facts-reader.ts` answers all of them in **one** `select` of scalar subqueries (`exists`, a `count` capped at 2 with `limit 2`, one id with `limit 1`) on `project`, `service`, `service_item`, `service_item_definition` and `workspace`, every subquery filtered by `workspace_id` (C-101). One round trip, no row lists (ADR-018, AC-SETUP-019). The adapter reads tables that belong to booking's schema; that is the ports-and-adapters split already in use (a port names what a feature needs, an adapter answers it in SQL), and nothing in `features/` crosses a boundary, so **no new ADR**.
- **D-3 — Step states.** Order `service → packageItems → firstProject → brandName`. *Done*: an active service exists / an active service has a selection item / never (the checklist disappears with the first project) / the brand name is not blank. *Locked*: `packageItems` and `firstProject` while there's no active service. *Current*: the first step in order that is neither done nor locked; exactly one, always (step 3 is never done, and step 1 is current when there's no service). *Open*: the rest. With a project in the workspace the result is `null` (no checklist).
- **D-4 — Targets.** Step 1 → `/w/{id}/services?add=service`; step 2 → `/w/{id}/services/{serviceId}` when exactly one active service exists, otherwise `/w/{id}/services`; step 3 → `/w/{id}/projects/new`; step 4 → `/w/{id}/settings`. The domain returns a target *kind* (`addService`, `service` + id, `services`, `newProject`, `settings`); a UI helper turns it into an href.
- **D-5 — *Add service* deep link.** The Services page reads `searchParams.add === "service"` and passes `openAddOnLoad` to `ServicesScreen`. `useOpenOnLoad` (`features/booking/ui/use-open-on-load`) opens the dialog a frame after mount and only in the visible copy of the page, because the shell renders each page in its desktop and phone layouts. Closing the dialog drops the query with `window.history.replaceState` (the native history API syncs with the Next router without a server request), so a refresh or Back doesn't reopen it and it can't race the push to the new service's page after a save (F-05). *(Updated at build, 2026-10-12: `router.replace` cancelled that push; see [build-notes.md](build-notes.md).)*
- **D-6 — Dashboard content while the checklist shows.** The content area holds only the checklist card, as the exports' content region does; the in-content greeting, placeholder subtitle and *Set up branding* empty state render only when there's no checklist (unchanged). The shell header stays as today (*Dashboard* / *Your workspace: {workspaceName}.*). The exports' header title *Welcome to Explore Studio* was a frame-building artifact, not part of the F-25 design; the build doesn't change the shell header (see *Risks* R-1). The *Workspace created* toast stays.
- **D-7 — The row is a feature component.** The Owner kept the row changes as Pencil overrides (design.md), so the row is `features/workspace/ui/setup-checklist-row`, not a change to `src/ui/patterns/list-card-item`. It reuses `LIST_CARD_ROW` and the `component.list-card.item.*` tokens, adds the chip after the title, the success icon well for done (`color.semantic.status.success.bg/fg`), the description in `color.semantic.text.muted`, and the three trailing modes (button, chevron link, nothing).
- **D-8 — Layout.** Card width `size.content-narrow` (720) centered; vertically centered in the content area only at the desktop shell breakpoint (`xl`), top-aligned below (tablet frame `X0t9KY`). Desktop/tablet rows keep a fixed trailing height equal to the MD button so rows are even. Below `md` (phone shell) the current step's button sits under its description, aligned with the title, sized to its label (frames `Rbpwx`, `eEfVG`, `KsvGt`).
- **D-9 — Selection item.** A service item counts when its definition has `selection_required`, whatever the definition's `is_active` (BR-CAT-008: services keep using archived definitions, and projects copy them). Only active services count (AC-SETUP-009).
- **D-10 — Copy.** One new module `setup-checklist.copy.ts` (namespace `workspaceSetupChecklist`) with the approved §4.3a rows; `project-copy.copy.ts` takes the two §7.2 replacements. Step 4's action label is approved but unused (step 4 is never current, D-3) and is not added. §4.3a says the *Optional* marker reuses §1, but §1 has no plain *Optional* row: iteration 4 adds *Optional marker (step 4) | Optional | Opsional* to §4.3a under the existing approval note and reports it to the Owner.

## Database changes

None. No migration. All columns exist (`service.is_active`, `service_item.definition_id`, `service_item_definition.selection_required`, `workspace.brand_name`, `project.workspace_id`).

## Server / API interface

- No new server action or route handler.
- `GET /w/[workspaceId]` (page): `loadDashboard(workspaceId)` replaces the direct `enterWorkspace` call.
- `GET /w/[workspaceId]/services?add=service` (page): opens the *Add service* dialog on load. Any other `add` value is ignored.

## Domain / application logic

- `features/workspace/domain/setup-checklist/setup-checklist.ts`: `deriveSetupChecklist(facts): SetupChecklist | null` (D-3, D-4). Types in `setup-checklist.types.ts`: `SetupFacts { hasProject, activeServiceCount (0, 1 or 2 meaning "two or more"), soleActiveServiceId, hasSelectionItem, hasBrandName }`, `SetupStep { key, state, target }`, `SetupChecklist { steps, doneCount, total }`.
- `features/workspace/application/ports/setup-facts-reader/setup-facts-reader.port.ts`: `SetupFactsReaderPort { read(context: WorkspaceContext): Promise<SetupFacts> }`.
- `features/workspace/application/use-cases/load-setup-checklist/load-setup-checklist.ts`: reads the facts, returns `deriveSetupChecklist(facts)`.
- `composition/workspace/dashboard-flow/dashboard-flow.ts`: `loadDashboard(rawId)` = `enterWorkspace(rawId)` (ownership check, BR-WS-003), then the use case over `createDrizzleSetupFactsReader(db)` inside `withRequestDb`; returns `{ workspace, checklist }`.

## UI components

| Unit | Folder | Notes | Exports |
|---|---|---|---|
| `setupStepHref` | `features/workspace/ui/setup-step-href/` | target kind → href (D-4); pure, unit-tested | — |
| `SetupChecklistRow` | `features/workspace/ui/setup-checklist-row/` | one `<li>`; states current/open/done/locked (D-7); open = one `next/link` whose accessible name is the step title, with a decorative chevron; done/locked are plain text, not focusable | all dashboard states |
| `SetupChecklist` | `features/workspace/ui/setup-checklist/` | `SectionCard content="flush"` with title, description and the progress text in `actions`; an `<ol>` of rows; centering (D-8) | all dashboard states |
| `DashboardScreen` | existing | new prop `checklist: SetupChecklist \| null`; renders `SetupChecklist` or today's placeholder (D-6) | — |
| `ServicesScreen` | existing | new prop `openAddOnLoad?: boolean` (D-5) | — |
| `NoServiceAlert` | existing | href `/w/{id}/services?add=service`, new copy | `new-project-no-service` desktop/mobile |

Markers: step 1 *Required* (warning), step 2 *Recommended* (info), step 4 *Optional* (neutral), done steps *Done* (success); step 3 has none. Icons (lucide): `briefcase`, `list-checks`, `folder-plus`, `badge-check`; done `check`; locked `lock`.

## Validation

No user input. The facts row from raw SQL is parsed with a Zod schema in the adapter (`drizzle-setup-facts-reader.schema.ts`), so a schema drift fails loudly. The `add` search param is compared to one literal; nothing else is read from it. The workspace ID is verified by `enterWorkspace` before any read (C-004, BR-WS-003).

## Error handling

A failed facts read throws out of the page and is handled by the owner routes' existing error boundary (spec E1); the checklist never renders a guessed state. An unowned or malformed workspace ID keeps `enterWorkspace`'s `notFound()` (E2).

## Concurrency / consistency

Read-only, one statement, so the five facts come from one snapshot. A change made in another tab shows on the next dashboard load (spec A-2). No transaction or lock is needed.

## Security

Every subquery filters by the verified `workspace_id` (C-101); the integration test seeds two workspaces and checks isolation (AC-SETUP-004). No IDs other than the workspace's own service ID reach the page. No logging of facts beyond the existing request logging.

## Testing strategy

Related tests only (project rule): the unit files named below, the one integration file, the one E2E spec; then typecheck and lint on changed files.

| AC | Test | Level |
|---|---|---|
| AC-SETUP-001 | `setup-checklist.test.ts` (new workspace facts → step states) · `setup-checklist.test.tsx` (four rows, markers, one button, no *Set up branding*) · E2E new workspace | unit · dom · e2e |
| AC-SETUP-002 | `setup-checklist.test.ts` (`hasProject` → null) · `drizzle-setup-facts-reader.test.ts` (DRAFT, BOOKED, COMPLETED, CANCELLED projects → `hasProject`) · `dashboard-screen.test.tsx` (null → placeholder) | unit · integration · dom |
| AC-SETUP-003 | `drizzle-setup-facts-reader.test.ts` (draft deleted → `hasProject` false) | integration |
| AC-SETUP-004 | `drizzle-setup-facts-reader.test.ts` (two workspaces, facts don't leak) | integration |
| AC-SETUP-005 | `services-screen.test.tsx` (`openAddOnLoad` opens the dialog; closing calls `router.replace`) · E2E step 1 | dom · e2e |
| AC-SETUP-006 | `setup-checklist.test.ts` · `setup-checklist.test.tsx` · E2E after saving a service | unit · dom · e2e |
| AC-SETUP-007 | `setup-checklist.test.ts` · `drizzle-setup-facts-reader.test.ts` (archived service → count 0) | unit · integration |
| AC-SETUP-008 | `drizzle-setup-facts-reader.test.ts` (only non-selection items → false; *Foto edit* → true) | integration |
| AC-SETUP-009 | `drizzle-setup-facts-reader.test.ts` (selection item only on an archived service → false) | integration |
| AC-SETUP-010, 011 | `setup-checklist.test.ts` (targets) · `setup-step-href.test.ts` | unit |
| AC-SETUP-012 | `setup-checklist.test.ts` (step 3 open while step 2 current) · `setup-checklist-row.test.tsx` (open row is a link to *New project*) | unit · dom |
| AC-SETUP-013 | `setup-checklist-row.test.tsx` (locked: no link, no button, hint text) | dom |
| AC-SETUP-014 | `setup-checklist.test.ts` (brand name done/open with no service) · `drizzle-setup-facts-reader.test.ts` (blank vs set brand name) | unit · integration |
| AC-SETUP-015 | `setup-checklist.test.ts` (archived only service → steps 1–2 not done, 2–3 locked) | unit |
| AC-SETUP-016 | `create-project-screen.test.tsx` (new body, *Add service* → `/services?add=service`) · `project-copy.deck.test.ts` | dom · unit |
| AC-SETUP-017 | `setup-checklist.test.tsx` in `en` and `id` · `setup-checklist.deck.test.ts` | dom · unit |
| AC-SETUP-018 | `setup-checklist-row.test.tsx` (state in text: *Done* chip, hint, title link) | dom |
| AC-SETUP-019 | `drizzle-setup-facts-reader.test.ts` (one `execute` call: spy on the executor) | integration |
| AC-SETUP-020 | `setup-checklist.test.ts` (exactly one current in every fact combination) · `setup-checklist.test.tsx` (one button) | unit · dom |

Visual check: the finished dashboard at 1440, 1024 and 390 against the exports `dashboard-new-workspace` (desktop, tablet, mobile), `dashboard-step-1-done` and `dashboard-first-project-left` (desktop, mobile); *New project* against `new-project-no-service` (desktop, mobile).

## Implementation iterations

See [plan.md](plan.md): 1 domain · 2 read port, adapter, integration test · 3 composition and route · 4 copy · 5 checklist UI · 6 *Add service* deep link and the *New project* alert · 7 E2E, visual check, close.

## Risks / open questions

- **R-1 — Export header vs shell header.** The exports show *Welcome to Explore Studio* as the header title; the app's shell shows *Dashboard*. D-6 keeps the shell header and drops the in-content greeting while the checklist shows. If the Owner wants the greeting kept, it is one line in `DashboardScreen`; reported at iteration 5.
- **R-2 — `router.replace` on dialog close** could flash or reset scroll; covered by `scroll: false` and the E2E.
- **R-3 — Neon websocket flake** (HANDOFF › F-22) may fail the E2E run for reasons outside F-25; rerun once, report if it persists.
- **R-4 — Copy gap.** The plain *Optional* marker row (D-10) is added under the existing approval; the Owner sees it in the iteration 4 report.
