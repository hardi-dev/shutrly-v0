# F-07 Projects — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo, `/sdv:build-feature projects <n>` runs Task n.

**Goal:** the Owner books shoots as projects.
- **List:** three tabs, search, a filter, 30 rows per page and a row menu.
- ***Proyek baru*:** one client, one service, an editable package snapshot, sessions and booking fields, saved in one transaction as a draft or as booked.
- **Detail page:** manual status steps, deal edits until shooting starts, session edits, and cancel or delete-draft.

**Architecture:**
- Projects join the `booking` feature (`src/features/booking/{domain,application,ui}`) beside the catalog (F-05) and clients (F-06).
- Four Drizzle tables sit behind `ProjectRepositoryPort` and `ProjectListReaderPort`: `project`, `project_item`, `project_field_value` and `project_session`.
- Every mutation locks the project row and decides from the stored status (D-2).
- The list sorts by each project's shown session, with keyset paging (D-8).
- Composition verifies the workspace and wires the routes and actions.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), `@internationalized/date` (new, D-12), Hugeicons, Vitest (unit, dom, integration), Playwright + axe, Storybook.

**Sources:**
- design: [design.md](design.md) and `exports/*.html` (92 frames);
- technical design: [technical-design.md](technical-design.md) (D-1…D-16);
- component specs in `docs/design-system/components/` (listed in the technical design).

**Base:** F-06 Clients is **built and merged into `feat/projects`** before Task 1. Its plan is ready ([../clients/plan.md](../clients/plan.md)) but not implemented yet. The plan uses these F-06 units by name:
- `client` table / migration `0008`;
- `ClientRepositoryPort`, `addClient`, `updateClient`;
- `ClientDialog`, `addClientAction`, `updateClientAction`;
- `DataTable`, `DataTableSkeleton`;
- `SheetItem` `isDisabled` / `isPending`;
- `formatWhatsappNumber`, `whatsappChatUrl`;
- the Input trailing `x` action.

F-07's migration is `0009`.

## Global Constraints

Every task's requirements implicitly include this section. They are F-06's Global Constraints (`docs/features/clients/plan.md`) plus:

- **Boundaries (lint):** `features/booking` never imports another feature. Project code may import booking catalog and client modules, because they are the same feature.
- **Rule values (named constants, never literals):**

  | Constant | Value | Rule |
  |---|---|---|
  | `PROJECT_TITLE_MAX_LENGTH` | 100 | BR-PRJ-008 |
  | `PROJECT_NOTES_MAX_LENGTH` | 2000 | BR-PRJ-008 |
  | `CANCEL_REASON_MAX_LENGTH` | 500 | spec › Error Cases |
  | `SESSION_NAME_MAX_LENGTH` | 100 | BR-TEAM-003 |
  | `SESSION_LOCATION_MAX_LENGTH` | 200 | BR-TEAM-003 |
  | `PROJECT_PAGE_SIZE` | 30 | A-4 |
  | `PROJECT_SEARCH_MAX_LENGTH` | 100 | TD |
  | `CLIENT_PICKER_LIMIT` | 8 | TD-A-3 |
  | `BOOKING_TEXT_MAX_LENGTH` / `BOOKING_TEXTAREA_MAX_LENGTH` | 200 / 2000 | A-3 |
  | `ACCESS_TOKEN_BYTES` | 32 | D-6 |
  | `PROJECT_SCHEDULE_TIME_ZONE` | `"Asia/Jakarta"` | D-9 |
- **Money:** whole IDR strings only (`parseIdrAmount` / `formatIdr`), never `number` arithmetic (ADR-007).
- **Token (C-103, D-6):** `client_access_token` is written once on create and never appears in a select list, a result type, a log or a page.
- **Logging:** `project.save_failed` with `{ workspaceId, projectId?, operation }` only. Never a title, note, client name, number, reason, query or `wa.me` URL.
- **Copy:** from the frames and design.md › Copy, in `project-copy`. Strings not drawn carry `// not in Pencil`.
- **UI tasks:** build from `exports/*.html`. Map every raw value to a token; a value with no token is a DESIGN TOKEN GAP: report it and never hard-code it. Compare at 1440 and 390.
- **Migrations:** generate 0009 with drizzle-kit, review it, commit it, then run `pnpm db:migrate` against the non-production database from `.dev.vars` (AGENTS.md). Report the run.
- **Tests:** names start with the `AC-PRJ-*` / `BR-*` IDs they cover.
- **Quality gate per task:**
  - `pnpm typecheck`, `pnpm lint` and `pnpm test` pass;
  - from Task 9 on, `pnpm test:integration` also passes;
  - Task 20 adds `pnpm build` and the E2E suite.
- **Commits:** one per task; conventional, lowercase, with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```text
src/ui/primitives/checkbox/ · time-field/ · icon-button/ (+ badgeCount) · icon/ (+ icons)
src/ui/patterns/combobox/ · multi-select/ · date-field/ · select/ (+ sections) · page-header/ (+ titleAdornment, meta)
src/features/workspace/domain/coming-soon-sections/        − "projects", "new-project"
src/features/workspace/ui/owner-nav/ · owner-shell/        projects heading, tabs, sub-pages, create action → /projects/new
src/features/booking/
  domain/project-status/ · project-menu/ · project-record/ · session/ · booking-field-value/
  domain/project-items/ · project-list-query/ · schedule-clock/
  application/errors/project-errors/
  application/ports/project-repository/ · project-list-reader/ · access-token-generator/
  application/schemas/create-project-input/ · project-info-input/ · project-step/ · cancel-project-input/
  application/schemas/project-list-query/ · project-ids/
  application/use-cases/project-results/
  application/use-cases/{list-projects,count-projects,get-project-detail,load-create-options,search-active-clients,
    get-client,create-project,update-project-info,add-project-item,update-project-item-value,remove-project-item,
    update-project-field-values,add-session,update-session,delete-session,advance-project,cancel-project,delete-draft}/
  ui/project-copy/ · project-field-error/ · project-status-chip/ · project-session-summary/ · project-menu/
  ui/projects-screen/ · projects-table/ · project-list/ · projects-tabs-bar/ · project-search-field/
  ui/project-filter-dialog/ · projects-empty-state/ · projects-skeleton/ · use-load-more-projects/
  ui/project-status-dialogs/ · use-project-actions/
  ui/create-project-screen/ · use-create-project-form/ · client-picker/ · use-client-search/ · service-picker/
  ui/package-items-card/ · project-item-dialog/ · sessions-card/ · session-dialog/
  ui/booking-fields-card/ · booking-field-input/ · booking-fields-dialog/ · change-service-dialog/
  ui/project-detail-screen/ · project-info-dialog/
src/adapters/db/schema/booking/project.ts                  (+ export in schema/index.ts)
src/adapters/db/project-repository/                        drizzle-project-repository.ts · drizzle-project-list-reader.ts
                                                           · shown-session-sql.ts · .test.ts files
src/adapters/crypto/access-token-generator/                web-crypto-access-token-generator.ts · .test.ts
src/composition/booking/project-scope/ · project-flow/
src/app/actions/booking/projects.ts                        (+ projects.test.ts)
src/app/(owner)/w/[workspaceId]/projects/                  page · loading · completed/ · cancelled/ · new/ · [projectId]/
drizzle/0009_project.sql
tests/support/booking/fake-project-repository.ts · project-fixtures.ts
tests/integration/booking/project-repository.test.ts · project-list.test.ts
tests/e2e/projects/projects.spec.ts
```

---

### Task 1: Check the base

**Files:** none (verification); `docs/HANDOFF.md` if the base is missing.

- [ ] **Step 1: Check that F-06 is in this branch.** All of these must hold:
  - `src/adapters/db/schema/booking/client.ts` exists, and so does `drizzle/0008_client.sql`;
  - `src/ui/patterns/data-table/data-table.tsx` exists, and so does `src/features/booking/ui/client-dialog/client-dialog.tsx`;
  - `pnpm tokens:check` passes.
- [ ] **Step 2: If any is missing, STOP.** Report to the Owner: *F-06 must be built (`/sdv:build-feature clients 1…14`) and merged into `feat/projects` first.* Change nothing.
- [ ] **Step 3: If `main` moved, sync it** with the ccd_host `sync_with_base_branch` tool (or `git merge main` outside an app worktree). Keep both features' text in `docs/HANDOFF.md` and `docs/product/feature-map.md`. Keep this branch's `projects.pen`.
- [ ] **Step 4:** run the gate (`pnpm typecheck && pnpm lint && pnpm test`) → PASS. No commit, unless the sync made a merge commit.

### Task 2: Domain — status, steps and menu

**Files:** create `src/features/booking/domain/project-status/{project-status.ts,.types.ts,.test.ts}` and `domain/project-menu/{project-menu.ts,.types.ts,.test.ts}`.

- [ ] **Step 1: Types** (`project-status.types.ts`):

```ts
export type ProjectStatus =
  | "DRAFT" | "BOOKED" | "SHOOTING" | "POST_PROCESSING" | "DELIVERED" | "COMPLETED" | "CANCELLED";
export type ProjectTab = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type ProjectStep = "CONFIRM_BOOKING" | "START_SHOOTING" | "FINISH_SHOOTING";
export interface StepTransition {
  readonly from: ProjectStatus;
  readonly to: ProjectStatus;
}
```

- [ ] **Step 2: Failing tests** (`project-status.test.ts`). Cover:

```ts
describe("project status (BR-PRJ-004, BR-PRJ-009, BR-PRJ-010)", () => {
  it("AC-PRJ-020 offers one manual step per status and none from POST_PROCESSING", () => {
    expect(nextStep("DRAFT")).toBe("CONFIRM_BOOKING");
    expect(nextStep("BOOKED")).toBe("START_SHOOTING");
    expect(nextStep("SHOOTING")).toBe("FINISH_SHOOTING");
    for (const s of ["POST_PROCESSING", "DELIVERED", "COMPLETED", "CANCELLED"] as const)
      expect(nextStep(s)).toBeNull();
  });
  it("AC-PRJ-021 maps each step to exactly one forward move", () => {
    expect(stepTransition("START_SHOOTING")).toEqual({ from: "BOOKED", to: "SHOOTING" });
  });
  it("AC-PRJ-018 keeps the deal editable only while DRAFT or BOOKED", () => {
    expect(PROJECT_STATUSES.filter(isDealEditable)).toEqual(["DRAFT", "BOOKED"]);
  });
  it("AC-PRJ-029 allows schedule edits in every status except CANCELLED", () => {
    expect(PROJECT_STATUSES.filter((s) => !isScheduleEditable(s))).toEqual(["CANCELLED"]);
  });
  it("AC-PRJ-022 cancels BOOKED and SHOOTING, and needs a reason from SHOOTING", () => {
    expect(PROJECT_STATUSES.filter(canCancel)).toEqual(["BOOKED", "SHOOTING"]);
    expect(cancelReasonRequired("SHOOTING")).toBe(true);
    expect(cancelReasonRequired("BOOKED")).toBe(false);
  });
  it("AC-PRJ-023 deletes only drafts", () => {
    expect(PROJECT_STATUSES.filter(canDeleteDraft)).toEqual(["DRAFT"]);
  });
  it("A-4 maps tabs to statuses", () => {
    expect(tabStatuses("ACTIVE")).toEqual(["DRAFT", "BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED"]);
    expect(tabStatuses("COMPLETED")).toEqual(["COMPLETED"]);
    expect(tabStatuses("CANCELLED")).toEqual(["CANCELLED"]);
  });
  it("A-6 requires a session for BOOKED and later", () => {
    expect(PROJECT_STATUSES.filter(needsSession)).toEqual(["BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED", "COMPLETED"]);
  });
});
```

- [ ] **Step 3: Implement** (`project-status.ts`). Each exported function gets JSDoc (coding rules).

```ts
import type { ProjectStatus, ProjectStep, ProjectTab, StepTransition } from "./project-status.types";

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "DRAFT", "BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED", "COMPLETED", "CANCELLED",
];
const TRANSITIONS: Readonly<Record<ProjectStep, StepTransition>> = {
  CONFIRM_BOOKING: { from: "DRAFT", to: "BOOKED" },
  START_SHOOTING: { from: "BOOKED", to: "SHOOTING" },
  FINISH_SHOOTING: { from: "SHOOTING", to: "POST_PROCESSING" },
};
const TABS: Readonly<Record<ProjectTab, readonly ProjectStatus[]>> = {
  ACTIVE: ["DRAFT", "BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};

/** Returns the one manual forward move a step performs (BR-PRJ-004, D-3). @param step - the requested step @returns its from and to status */
export function stepTransition(step: ProjectStep): StepTransition {
  return TRANSITIONS[step];
}
const NEXT_STEP: Readonly<Record<ProjectStatus, ProjectStep | null>> = {
  DRAFT: "CONFIRM_BOOKING",
  BOOKED: "START_SHOOTING",
  SHOOTING: "FINISH_SHOOTING",
  POST_PROCESSING: null,
  DELIVERED: null,
  COMPLETED: null,
  CANCELLED: null,
};

/** Finds the manual step offered for a status, or null when F-07 offers none (BR-PRJ-004). @param status - stored status @returns the step or null */
export function nextStep(status: ProjectStatus): ProjectStep | null {
  return NEXT_STEP[status];
}

/** Lists the statuses shown under a list tab (A-4). @param tab - the tab @returns its statuses */
export function tabStatuses(tab: ProjectTab): readonly ProjectStatus[] {
  return TABS[tab];
}

/** Tells whether the deal (price, items, booking values) may change (BR-PRJ-009). @param status - stored status @returns true while DRAFT or BOOKED */
export function isDealEditable(status: ProjectStatus): boolean {
  return status === "DRAFT" || status === "BOOKED";
}
```

  Implement `isScheduleEditable` (≠ CANCELLED), `canCancel` (BOOKED, SHOOTING), `cancelReasonRequired` (SHOOTING), `canDeleteDraft` (DRAFT) and `needsSession` (BOOKED…COMPLETED) the same way: one comparison or `includes` on a named constant each, with JSDoc. `NEXT_STEP` and `TRANSITIONS` must agree; the tests in Step 2 cover both.
- [ ] **Step 4: Menu** (`project-menu.ts`). Write a failing test first: one test per row of the spec table (AC-PRJ-027), plus the no-number case.

```ts
export type ProjectMenuItem =
  | { readonly kind: "STEP"; readonly step: ProjectStep }
  | { readonly kind: "EDIT_INFO" }
  | { readonly kind: "CHAT_WHATSAPP" }
  | { readonly kind: "ADD_WHATSAPP_NUMBER" }
  | { readonly kind: "CANCEL" }
  | { readonly kind: "DELETE_DRAFT" };
export interface ProjectMenuGroups {
  readonly project: readonly ProjectMenuItem[];
  readonly sendToClient: readonly ProjectMenuItem[];
  readonly destructive: readonly ProjectMenuItem[];
}
```

  `buildProjectMenu({ status, hasWhatsappNumber })`:
  - `project` = the step, if any, plus `EDIT_INFO` unless the status is COMPLETED or CANCELLED;
  - `sendToClient` = `CHAT_WHATSAPP` or `ADD_WHATSAPP_NUMBER`;
  - `destructive` = `DELETE_DRAFT` (DRAFT), `CANCEL` (BOOKED/SHOOTING), or nothing.
- [ ] **Step 5:** gate → PASS. Commit `feat(projects): add project lifecycle and menu rules`.

### Task 3: Domain — record, sessions, booking-field values, items, list query, clock

**Files:** create `domain/{project-record,session,booking-field-value,project-items,project-list-query,schedule-clock}/` each with `.ts` / `.schema.ts` / `.types.ts` / `.test.ts` as needed.

- [ ] **Step 1: Failing tests, one file per unit.** Each case carries its AC ID:
  - **`project-record`:**
    - `projectTitleSchema`: `" "` → `EMPTY`; 101 chars → `TOO_LONG`; trims.
    - `projectNotesSchema`: blank → `null`; 2001 → `TOO_LONG`.
    - `agreedPriceSchema`: `-1` → `NEGATIVE`; `10,5` → `NOT_WHOLE`; `1.000.000.000.000` → `TOO_LARGE`; `Rp 700.000` → `"700000"` (AC-PRJ-011).
    - `cancelReasonSchema`: 501 → `TOO_LONG`; blank → `null`.
    - `defaultProjectTitle("Wisuda Basic", "Rina")` → `Wisuda Basic — Rina`, cut to 100 (AC-PRJ-007, A-2).
  - **`session`:**
    - `sessionInputSchema` table: no name; no date; 101-char name; 201-char location; end without start; end 07.00 with start 07.30 → its key (AC-PRJ-029).
    - `compareSessions`: date, then start time with nulls first, then `createdAt`.
    - `pickShownSession`:
      - with `today = "2026-10-02"`, AC-PRJ-001's *Prewed Dewi* gives 2026-10-20 + `extraCount 1`;
      - when all sessions are past, it gives the latest one with `isPast: true`;
      - `[]` gives `null`.
    - `formatSessionWhen` → `Sel, 10 Nov 2026 · 07.30` (no time → date only).
  - **`booking-field-value`:**
    - `bookingFieldValueSchema(field)` per type (A-3), with `true`/`false` for BOOLEAN.
    - `validateFieldValues`:
      - Nama kampus empty → `REQUIRED`;
      - Ukuran toga `XL` → `NOT_AN_OPTION`;
      - empty optional → `null`;
      - all problems are collected (AC-PRJ-010).
  - **`project-items`:** `validateItemList`:
    - the same definition twice → `DUPLICATE_DEFINITION` on the second;
    - `2,5` on a selection item → `NOT_WHOLE`;
    - `RANGE` 3–1 → `MIN_GREATER_THAN_MAX` (AC-PRJ-017).
  - **`project-list-query`:** `projectListParamsSchema` parses `?status=BOOKED,SHOOTING&from=2026-10-01&to=2026-11-30&noSchedule=1&service=a,b&client=c`:
    - unknown statuses and malformed IDs are dropped;
    - `to < from` → `{ ok:false, problem:"TO_BEFORE_FROM" }`;
    - `activeFilterGroupCount` counts Status, Jadwal, Layanan and Klien, so the example gives 4;
    - on the `COMPLETED` tab the status filter is ignored (AC-PRJ-028, A-11).
  - **`schedule-clock`:** `todayInScheduleZone(new Date("2026-10-01T18:30:00Z"))` → `"2026-10-02"` (Jakarta is +7).
- [ ] **Step 2: Implement.**
  - Use Zod in the domain as F-06 does; issue messages are the error keys.
  - Implement `pickShownSession` from sorted sessions: the first with `date >= today`, otherwise the last. `extraCount = sessions.length - 1`.
  - Implement `todayInScheduleZone` with `Intl.DateTimeFormat("en-CA", { timeZone: PROJECT_SCHEDULE_TIME_ZONE })`. `Intl` is a JS built-in, not a vendor package, so it is allowed in the domain.
  - Reuse `parseIdrAmount`, `parseQuantity`, `findPackageValueProblem` and `formatQuantity` from the catalog domain.
- [ ] **Step 3:** gate → PASS. Commit `feat(projects): add project record, session, field value and list rules`.

### Task 4: Application — ports, schemas, errors, results

**Files:** create `application/ports/{project-repository,project-list-reader,access-token-generator}/*.port.ts`, `application/schemas/*` (+ `project-schemas.test.ts`), `application/errors/project-errors/*`, `application/use-cases/project-results/*`, and `tests/support/booking/{fake-project-repository.ts,project-fixtures.ts}`.

- [ ] **Step 1: Ports.** Every call takes `WorkspaceContext`. The record types hold no token.

```ts
export interface ProjectRepositoryPort {
  readonly createSnapshot: (context: WorkspaceContext, input: ProjectSnapshotInput) =>
    Promise<{ readonly status: "CREATED"; readonly id: string } | { readonly status: "CLIENT_INACTIVE" | "SERVICE_INACTIVE" | "DEFINITION_INACTIVE" | "NOT_FOUND" }>;
  readonly findDetail: (context: WorkspaceContext, id: string) => Promise<ProjectDetailRecord | null>;
  /** Runs `change` under `SELECT … FOR UPDATE` on the project; `change` returns the domain verdict first (D-2). */
  readonly withLockedProject: <T>(context: WorkspaceContext, id: string,
    change: (locked: LockedProject, tx: ProjectWriter) => Promise<T>) => Promise<T | "NOT_FOUND">;
  readonly moveStatus: (context: WorkspaceContext, id: string, transition: StepTransition, actorId: string) =>
    Promise<"MOVED" | "STALE" | "NOT_FOUND">;
}
```

  - `LockedProject` = `{ status, sessionCount, itemDefinitionIds }`.
  - `ProjectWriter` exposes the narrow writes: `updateInfo`, `addItem` (locks the definition `FOR SHARE`, checks it is active and not used), `updateItemValue`, `removeItem`, `updateFieldValues`, `addSession`, `updateSession`, `deleteSession`, `cancel`, `deleteProject`.
  - `ProjectListReaderPort`: `listPage(context, query, today)` → `ProjectListRow[]`, and `count(context, tab)`.
  - `AccessTokenGeneratorPort`: `() => string`.
- [ ] **Step 2: Schemas** (shared by forms and use cases):
  - `createProjectInputSchema` (`mode: "DRAFT" | "BOOKED"`): items as `{ definitionId, value: packageValueInputSchema }`, sessions as `sessionInputSchema[]`, `fieldValues` as `z.record(z.string(), z.union([z.string(), z.boolean(), z.null()]))`;
  - `projectInfoInputSchema`, `projectStepSchema` (the 3 steps only), `cancelProjectInputSchema`, `projectListQuerySchema` (`tab`, `params`, `afterId: uuid | null`);
  - ID schemas.
- [ ] **Step 3: Tests** (`project-schemas.test.ts`):
  - a `status` key in any input is stripped, not trusted (AC-PRJ-021);
  - `mode` other than DRAFT/BOOKED fails;
  - paths match the technical design.
- [ ] **Step 4: Errors and results.**
  - `ProjectError` (`NOT_FOUND`, `SAVE_FAILED`).
  - `toProjectValidationFailure(zodError)` maps the issue paths to keys; an unknown message becomes `INVALID`.
  - Domain failure helpers.
- [ ] **Step 5: Fakes.**
  - `FakeProjectRepository` keeps projects in memory. `withLockedProject` runs `change` against a copy and commits it on success.
  - `project-fixtures.ts` builds the AC shared fixture: *Rina* active, *Budi* archived, *Wisuda Basic* with its items and fields, *Prewed Lama* archived.
- [ ] **Step 6:** gate → PASS. Commit `feat(projects): add project ports, schemas and results`.

### Task 5: Use cases — read and create

**Files:** use-case folders `list-projects`, `count-projects`, `get-project-detail`, `load-create-options`, `search-active-clients`, `get-client`, `create-project` (each `.ts` + `.test.ts`).

- [ ] **Step 1: Failing tests** against the fakes:
  - `createProject`:
    - `BOOKED` without a session → `sessions: SESSION_REQUIRED` and nothing stored; `DRAFT` without one → created (AC-PRJ-029);
    - every field problem is reported together (title + Nama kampus + price) (AC-PRJ-010, 011);
    - item problems come back on `items.N.*` (AC-PRJ-030);
    - `CLIENT_INACTIVE` / `SERVICE_INACTIVE` pass through (AC-PRJ-012);
    - the token comes from the generator and is not in the result (AC-PRJ-008).
  - `getProjectDetail`:
    - the flags per status (`canEditDeal`, `canEditSchedule`, `nextStep`, menu) (AC-PRJ-015, 018);
    - the shown session uses the injected `today`.
  - `listProjects`: asks for 31 rows, returns 30 + `nextCursor` (AC-PRJ-005).
  - `loadCreateOptions`: active services only, grouped by category name; `hasActiveService: false` when none (AC-PRJ-006, 014).
  - `searchActiveClients`: ≤ 8 results, archived excluded.
- [ ] **Step 2: Implement.** `createProject` does, in order:
  1. parse the input;
  2. `validateItemList`;
  3. load the service's field metadata through the repository's snapshot read (`findServiceForSnapshot`, added to the port) and run `validateFieldValues`;
  4. check the session rule for the mode;
  5. call `createSnapshot` with `status: mode === "BOOKED" ? "BOOKED" : "DRAFT"`, `token: generate()` and `actorId`.

  The repository re-checks activity and definitions under lock (D-4).
- [ ] **Step 3:** gate → PASS. Commit `feat(projects): add project read and create use cases`.

### Task 6: Use cases — status, deal, sessions, cancel, delete

**Files:** use-case folders `advance-project`, `update-project-info`, `add-project-item`, `update-project-item-value`, `remove-project-item`, `update-project-field-values`, `add-session`, `update-session`, `delete-session`, `cancel-project`, `delete-draft`.

- [ ] **Step 1: Failing tests** (fakes):
  - **`advanceProject`:**
    - `CONFIRM_BOOKING` with no session → `SESSION_REQUIRED`, still `DRAFT`;
    - a stale `from` → `STALE`;
    - a move from `CANCELLED` → `STALE` (AC-PRJ-009, 020, 021, 029).
  - **Deal edits in `SHOOTING`** → `DEAL_LOCKED`, nothing changed (AC-PRJ-018):
    - `updateProjectInfo` with a new price;
    - `addProjectItem`, `updateProjectItemValue` and `removeProjectItem`;
    - `updateProjectFieldValues`.

    In SHOOTING, `updateProjectInfo` with only the title and notes passes.
  - **`addProjectItem`:**
    - an existing definition → `DUPLICATE_DEFINITION`;
    - an archived one → `DEFINITION_INACTIVE`;
    - a valid one is appended last with the definition's current metadata (AC-PRJ-017).
  - **`updateProjectFieldValues`** validates against the stored metadata; `XL` is rejected and `M` accepted.
  - **`deleteSession`:**
    - in BOOKED with one session → `LAST_SESSION`; with two → ok;
    - in CANCELLED, any session change → `PROJECT_CANCELLED` (AC-PRJ-029).
  - **`cancelProject`:**
    - SHOOTING without a reason → `REASON_REQUIRED`;
    - BOOKED without a reason → ok, recording the actor and time;
    - DRAFT → `STALE` (AC-PRJ-022, A-10).
  - **`deleteDraft`:** BOOKED → `STALE`; DRAFT → deleted (AC-PRJ-023).
- [ ] **Step 2: Implement.** Each use case:
  1. parses its input;
  2. calls `withLockedProject`;
  3. applies the domain predicate to `locked.status`;
  4. performs the narrow write and returns `undefined` or the failure.

  Only `advanceProject` uses `moveStatus` (a conditional update). `CONFIRM_BOOKING` first checks `sessionCount` under the lock and then moves.
- [ ] **Step 3:** gate → PASS. Commit `feat(projects): add status, deal, session, cancel and delete use cases`.

### Task 7: Token generator adapter

**Files:** create `src/adapters/crypto/access-token-generator/{web-crypto-access-token-generator.ts,.test.ts}`.

- [ ] **Step 1: Failing test.** The token matches `/^[A-Za-z0-9_-]{43}$/`, and 1,000 calls give 1,000 distinct values (BR-PRJ-003, AC-PRJ-008).
- [ ] **Step 2: Implement:**

```ts
import "server-only";

import type { AccessTokenGeneratorPort } from "@/features/booking/application/ports/access-token-generator/access-token-generator.port";

export const ACCESS_TOKEN_BYTES = 32;

/** Creates a 256-bit URL-safe client access token from Web Crypto (BR-PRJ-003, ADR-004). @returns the generator */
export function createWebCryptoAccessTokenGenerator(): AccessTokenGeneratorPort {
  return () => {
    const bytes = crypto.getRandomValues(new Uint8Array(ACCESS_TOKEN_BYTES));
    return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  };
}
```

  If the `adapters/crypto` folder is new, add it to the `eslint-plugin-boundaries` element list in the same commit.
- [ ] **Step 3:** gate → PASS. Commit `feat(projects): add the client access token generator`.

### Task 8: Schema and migration 0009

**Files:** create `src/adapters/db/schema/booking/project.ts` and `drizzle/0009_project.sql` (generated); modify `src/adapters/db/schema/index.ts`.

- [ ] **Step 1: Schema.** Follow `catalog.ts` and `client.ts` conventions (`idColumn`, `workspaceIdColumn`, `tenantKey`, `tenantRef`, `auditColumns`). The skeleton is below; add every CHECK from technical-design.md › Database Changes.

```ts
export const project = pgTable("project", {
  id: idColumn(),
  workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
  clientId: uuid("client_id").notNull(),
  serviceId: uuid("service_id").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  agreedPrice: numeric("agreed_price", { precision: 18, scale: 3 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  status: text("status").notNull(),
  clientAccessToken: text("client_access_token").notNull(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelledBy: text("cancelled_by").references(() => user.id, { onDelete: "set null" }),
  cancelReason: text("cancel_reason"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  ...auditColumns(),
}, (t) => [
  tenantKey(t),
  tenantRef({ workspaceId: t.workspaceId, column: t.clientId }, { workspaceId: client.workspaceId, id: client.id }).onDelete("restrict"),
  tenantRef({ workspaceId: t.workspaceId, column: t.serviceId }, { workspaceId: service.workspaceId, id: service.id }).onDelete("restrict"),
  uniqueIndex("project_access_token_uq").on(t.clientAccessToken),
  index("project_workspace_status_ix").on(t.workspaceId, t.status, t.createdAt),
  check("project_title_ck", sql`char_length(${t.title}) between 1 and 100 and ${t.title} = btrim(${t.title})`),
  check("project_status_ck", sql`${t.status} in ('DRAFT','BOOKED','SHOOTING','POST_PROCESSING','DELIVERED','COMPLETED','CANCELLED')`),
  check("project_cancel_ck", sql`(${t.status} = 'CANCELLED') = (${t.cancelledAt} is not null)`),
  // … notes, price, currency, token, reason checks
]);
```

  Add `projectItem`, `projectFieldValue` and `projectSession` the same way, with the FKs, uniques and CHECKs from the technical design. Use `date("session_date", { mode: "string" })` and `time("start_time")` / `time("end_time")`.
- [ ] **Step 2: Generate and review.** `pnpm db:generate` → rename the file to `0009_project.sql`, keeping the journal tag consistent. Review it:
  - only `CREATE TABLE` / `ALTER TABLE ADD CONSTRAINT` / `CREATE INDEX`;
  - no drop or rename.
- [ ] **Step 3: Schema test** (`schema` unit test if the folder has one, otherwise skip). `tenant.test.ts` conventions still hold.
- [ ] **Step 4: Commit** `feat(projects): add project tables and migration 0009`.
- [ ] **Step 5: Apply.** `pnpm db:migrate` (non-production, `.dev.vars`). Record the output in the task report.

### Task 9: Drizzle repository — create, detail, writes

**Files:** create `src/adapters/db/project-repository/{drizzle-project-repository.ts,.test.ts}` and `tests/integration/booking/project-repository.test.ts`.

- [ ] **Step 1: Failing integration tests.** Each test seeds its own workspace with unique IDs (ADR-009).
  - AC-PRJ-008:
    - one create writes the project, two items, three field-value rows (Ukuran toga `value` null, D-5) and one session;
    - currency is `IDR`;
    - the token matches the pattern, and two projects get different tokens.
  - AC-PRJ-012:
    - archive the client between the read and the create → `CLIENT_INACTIVE`, and the project count stays 0;
    - the same for the service;
    - a service ID from workspace B → `NOT_FOUND`.
  - AC-PRJ-016: the catalog edits listed in the AC, then `findDetail`, which is unchanged.
  - AC-PRJ-017 / 019: deal writes under the lock, run concurrently with `moveStatus` (`Promise.all`). The item value is 30 only if the edit committed first; otherwise the edit returns `DEAL_LOCKED`.
  - AC-PRJ-021: two concurrent `moveStatus(START_SHOOTING)` → one `MOVED`, one `STALE`.
  - AC-PRJ-023: a draft delete cascades the items, field values and sessions.
  - AC-PRJ-024: F-06 `delete(client)`, F-05 `delete(service)` and `delete(definition)` each → `IN_USE`.
  - AC-PRJ-025: every method with workspace B's context → `NOT_FOUND` / no change; a raw insert of a project pointing at B's client fails with 23503.
  - Token safety: `findDetail`'s result has no `clientAccessToken` key.
- [ ] **Step 2: Implement.**
  - `createSnapshot` runs in `db.transaction`:
    - `select … from client where workspace_id = ? and id = ? for share`;
    - the same for `service`;
    - the field definitions ordered by `sort_order`;
    - the definitions `for share` by `inArray`.
  - Map 23503 / 23505 through `pgCode`.
  - Explicit column lists everywhere: no `select()` on `project`.
  - `withLockedProject` = transaction + `for("update")` on the project + a session count, then the callback with a writer bound to `tx`.
  - `moveStatus` = `update … where id, workspace_id, status = from returning id`. If no row comes back, check existence to choose `STALE` or `NOT_FOUND`.
- [ ] **Step 3:** `pnpm test:integration` → PASS. Commit `feat(projects): add the drizzle project repository`.

### Task 10: Drizzle list reader — order, search, filter, paging, counts

**Files:** create `src/adapters/db/project-repository/{drizzle-project-list-reader.ts,shown-session-sql.ts,.test.ts}` and `tests/integration/booking/project-list.test.ts`.

- [ ] **Step 1: Failing integration tests** with `today = "2026-10-02"` and AC-PRJ-001's five projects:
  - AC-PRJ-001: *Berjalan* order is *Prewed Dewi*, *Wisuda Rina*, *Wisuda Sari*; the shown session and extra count are right.
  - AC-PRJ-002: *Selesai* / *Dibatalkan* by latest date first, no-session last.
  - AC-PRJ-004: `rina` matches the title or client name; `%` and `_` are literal; only the selected tab is searched.
  - AC-PRJ-005: 65 projects → pages of 30 / 30 / 5, with no duplicates or gaps.
  - AC-PRJ-028:
    - status filter;
    - date range (any session inside);
    - `noSchedule` adds sessionless projects;
    - service and client filters;
    - the counts ignore search and filter.
  - AC-PRJ-025: no row from another workspace.
- [ ] **Step 2: Implement** `shownSessionSql(today)`. It is a `LEFT JOIN LATERAL` that picks `coalesce((first upcoming by date, start nulls first, created), (latest past))`, plus a count of all sessions. The `ORDER BY` and the cursor predicate reuse it: compute the cursor row's `(has_session, shown_date, created_at, id)` with the same expression in a CTE, then compare lexicographically with the tab's direction. Escape the `ILIKE` input (`\`, `%`, `_`).
- [ ] **Step 3:** gate + `pnpm test:integration` → PASS. Commit `feat(projects): add the project list query`.

### Task 11: Composition, server actions and shell wiring

**Files:** create `src/composition/booking/{project-scope,project-flow}/*` and `src/app/actions/booking/{projects.ts,projects.test.ts}`; modify `features/workspace/domain/coming-soon-sections`, `features/workspace/ui/owner-nav/*` and `owner-shell`; extend F-06's `addClient` result with `{ id, name, whatsappNumber }` (D-11; additive, update its test).

- [ ] **Step 1: Failing tests:**
  - **`project-flow.test.ts`:**
    - a malformed project ID → `notFound()`;
    - `NOT_FOUND` → `notFound()`;
    - an unexpected error logs `project.save_failed` with only `{ workspaceId, projectId, operation }` and throws `SAVE_FAILED`;
    - `today` is passed from the clock.
  - **`projects.test.ts`:**
    - writes revalidate `/w/[workspaceId]/projects` (layout) only on success;
    - `createProjectAction` redirects to the detail on success;
    - failures come back unchanged.
  - **owner nav:**
    - `projects` and `new-project` are not coming soon;
    - the create action href is `/w/<id>/projects/new`;
    - `resolveActiveNav` marks *Proyek* on `/projects/completed` and on `/projects/<uuid>`;
    - `/projects/new` and `/projects/<uuid>` are sub-pages (Compact Bar, no Bottom Nav).
- [ ] **Step 2: Implement.**
  - `withProjectScope` builds the repositories, the list reader, the token generator and the client repository on the request DB.
  - The flow entries follow `client-flow` / `catalog-flow`.
  - The actions are thin.
- [ ] **Step 3:** gate → PASS. Commit `feat(projects): wire project composition, actions and navigation`.

### Task 12: Shared UI — checkbox, combobox, multi-select, date and time fields, select sections, badges

**Files:** create `src/ui/primitives/checkbox/*`, `src/ui/primitives/time-field/*`, `src/ui/patterns/{combobox,multi-select,date-field}/*`; modify `ui/patterns/select` (sections), `ui/primitives/icon-button` (`badgeCount`), `ui/patterns/page-header` (`titleAdornment`, `meta`) and `ui/primitives/icon` (new icons); add `@internationalized/date` to `package.json` (pinned) and `docs/architecture/tech-stack.md` › UI (D-12).

- [ ] **Step 1: Precondition.** The library exports for the specs exist under `docs/design-system/exports/` (C05, C20, C25, C36). If one is missing, STOP and ask the Owner to export it.
- [ ] **Step 2: Failing tests** (`*.test.tsx`). Each component gets keyboard, label and state tests:
  - `Checkbox`: toggles with Space; mixed state; disabled.
  - `Combobox`:
    - typing filters through `onInputChange`;
    - the group label shows the count;
    - the create row fires `onCreate(query)`;
    - no-results label;
    - Escape closes;
    - the phone variant opens a sheet.
  - `MultiSelect`: toggles items; the summary reads *Dibooking, Pemotretan*; *Semua status* placeholder.
  - `DateField`: types `10/11/2026` and opens the calendar; selecting a day sets an ISO string; Calendar Day states follow C25.
  - `TimeField`: `07.30` in 24-hour time.
  - `Select` with sections renders the group labels.
  - `IconButton` `badgeCount={2}` renders Count Badge/Danger and names it in the accessible label (*Filter, 2 aktif*).
  - `PageHeader` renders `titleAdornment` beside the title, and `meta` under it.
- [ ] **Step 3: Implement.** Wrap the React Aria `Checkbox`, `ComboBox`, `Select` / `ListBox` (multi), `DatePicker` + `Calendar` and `TimeField`. Style through `data-*` attributes and tokens only.
- [ ] **Step 4: Stories** for each new unit (ADR-014).
- [ ] **Step 5:** gate → PASS. Commit `feat(ui): add checkbox, combobox, multi-select and date and time fields`.

### Task 13: List — desktop table, phone list, tabs, search, empty states, skeleton, load more

**Files:** create the `ui/` units `project-copy`, `project-status-chip`, `project-session-summary`, `projects-screen`, `projects-table`, `project-list`, `projects-tabs-bar`, `project-search-field`, `projects-empty-state`, `projects-skeleton`, `use-load-more-projects`; create routes `projects/{page,loading}.tsx`, `completed/`, `cancelled/`.

- [ ] **Step 1: Precondition.** These exports exist:
  - `list-berjalan-*`, `list-selesai-*`, `list-dibatalkan-*`;
  - `list-empty-*`, `list-no-match-*`;
  - `list-loading-*`, `list-loading-more-*`.

  If one is missing, STOP and ask.
- [ ] **Step 2: Failing tests:**
  - rows show the title link (only the PROYEK cell text), *client · service*, the ACARA cell (date · time / location / *+n sesi* / *Belum ada jadwal* muted) and the chip with its tone (AC-PRJ-001);
  - the subtitle reads *3 proyek berjalan*;
  - the three empty states and the no-match state with *Hapus pencarian* (AC-PRJ-003, 004);
  - the load-more hook appends and resets on tab, query or filter change (AC-PRJ-005);
  - the search writes `?q=` with a debounce and keeps the filter params.
- [ ] **Step 3: Implement** from the exports: table columns 240 / 124 / 32 with a 16 gap (design.md exception); phone Compact/Flush card with Primary *Baru*.
- [ ] **Step 4: Compare** with the exports at 1440 and 390 (screenshots). Note every deviation.
- [ ] **Step 5:** gate → PASS. Commit `feat(projects): add the project list`.

### Task 14: Filter

**Files:** create `ui/project-filter-dialog/*`; modify `projects-table` and `project-list` (the filter button with its badge).

- [ ] **Step 1: Precondition:** exports `filter-modal-desktop-e1VJF`, `filter-sheet-mobile-ITvcM` and `list-filter-aktif-*`.
- [ ] **Step 2: Failing tests** (AC-PRJ-028):
  - *Terapkan* writes the URL params;
  - *Reset* clears them;
  - the badge shows the group count;
  - *Status* is shown only on *Berjalan*;
  - *Sampai* before *Dari* → a field error and nothing applied;
  - the description reads *Berlaku untuk tab Berjalan.*;
  - the client options include archived clients with *(diarsipkan)* (TD-A-4).
- [ ] **Step 3: Implement** (Modal MD / Bottom Sheet Form), compare, gate → PASS. Commit `feat(projects): add the project filter`.

### Task 15: Row menu and status, cancel and delete dialogs

**Files:** create the `ui/` units `project-menu`, `project-status-dialogs`, `use-project-actions`, `project-info-dialog` (shared with the detail).

- [ ] **Step 1: Precondition:** exports `list-row-menu-desktop-E3eVH`, `list-row-actions-sheet-mobile-EWFc5`, `detail-batalkan-*`, `detail-hapus-draf-*`, `detail-ubah-info-*`, `detail-toast-*` and `list-toast-draf-dihapus-*`.
- [ ] **Step 2: Failing tests** (AC-PRJ-022, 023, 027):
  - **Menus:** each status's menu has its groups and dividers in order; the *Kirim ke klien* label is present.
  - ***Chat WhatsApp*** is an anchor with `href = https://wa.me/<digits>`, `target="_blank"` and `rel="noopener noreferrer"`.
  - ***Tambah nomor WhatsApp*** loads the client and opens F-06's `ClientDialog` in edit mode; after saving, the menu offers *Chat WhatsApp*.
  - **Steps:** a step shows its toast and refreshes; `STALE` shows *Status proyek sudah berubah* and refreshes.
  - **Cancel:** the reason is optional in BOOKED and required in SHOOTING (the error state in the export).
  - ***Hapus draf*** confirms, redirects to the list and shows a toast.
  - ***Ubah info*** shows the price as Text Field/Disabled when the deal is locked.
- [ ] **Step 3: Implement, compare, gate.** Commit `feat(projects): add the project menu and status dialogs`.

### Task 16: *Proyek baru* — form shell, client picker, service picker

**Files:** create the `ui/` units `create-project-screen`, `use-create-project-form`, `client-picker`, `use-client-search`, `service-picker`, `change-service-dialog`; create route `projects/new/{page,loading}.tsx`.

- [ ] **Step 1: Precondition:** exports `new-terisi-*`, `new-kosong-*`, `new-pilih-klien-*`, `new-klien-baru-*`, `new-tanpa-layanan-aktif-*`, `new-layanan-tidak-aktif-*` and `new-ganti-layanan-*`.
- [ ] **Step 2: Failing tests:**
  - archived clients are never offered, and the picker shows ≤ 8 matches with *Tambah klien baru “{q}”* (AC-PRJ-006);
  - the create row opens `ClientDialog` with the name prefilled; on save the new client is selected and the default title updates; cancel changes nothing (AC-PRJ-013);
  - choosing a service sets the title (A-2), the price and the base-price helper, and lists the items and fields in order (AC-PRJ-007);
  - an edited title survives a client change (AC-PRJ-007);
  - changing the service after an item edit asks *Ganti layanan?*; *Batal* keeps everything, and confirm resets the items (AC-PRJ-030);
  - with no active service: Select/Disabled + Alert/Info *Buka Layanan* (→ `/services`), and both buttons are disabled (AC-PRJ-014);
  - before a service is chosen, *Isi paket* and *Field booking* are hidden.
- [ ] **Step 3: Implement, compare, gate.** Commit `feat(projects): add the create form with client and service pickers`.

### Task 17: *Proyek baru* — items, sessions, booking fields, submit

**Files:** create the `ui/` units `package-items-card`, `project-item-dialog`, `sessions-card`, `session-dialog`, `booking-fields-card`, `booking-field-input`, `project-field-error`.

- [ ] **Step 1: Precondition:** exports `new-tambah-item-*`, `new-ubah-nilai-*`, `new-hapus-item-*`, `new-sesi-form-*`, `new-sesi-form-error-*`, `new-field-error-*`, `new-tanpa-isi-paket-dan-field-*`, `new-menyimpan-*` and `new-server-error-*`.
- [ ] **Step 2: Failing tests:**
  - **Item dialogs:**
    - *Tambah item* lists active definitions not already listed;
    - NUMBER has one field and RANGE has min and max;
    - errors follow AC-PRJ-017;
    - remove confirms (AC-PRJ-030).
  - **Session dialog:** the AC-PRJ-029 error table; sessions sorted by date, then time.
  - **Empty *Jadwal*:** Empty State/In card; *Buat proyek* with no session shows *Tambahkan minimal satu sesi.* under it.
  - **Booking field inputs** by type: TEXT / TEXTAREA / NUMBER / DATE / BOOLEAN (radio *Ya* / *Tidak*) / SELECT; *(opsional)* marks optional ones; required ones are not marked (AC-PRJ-007, 010).
  - **Submit:**
    - the pressed button shows pending (*Membuat proyek…* / *Menyimpan draf…*) and the other is disabled;
    - field errors map back to the fields;
    - `CLIENT_INACTIVE` / `SERVICE_INACTIVE` show on their field;
    - an unexpected error shows Toast/Danger with *Coba lagi* and keeps the input;
    - on success it navigates to the detail with *Proyek dibuat* / *Draf disimpan* (AC-PRJ-008, 009, 012).
  - **No items and no fields:** Empty State in *Isi paket*; no *Field booking* card (Owner 2026-10-02).
- [ ] **Step 3: Implement, compare, gate.** Commit `feat(projects): add package, session and booking-field editing to the create form`.

### Task 18: Detail page

**Files:** create `ui/project-detail-screen/*` and `ui/projects-skeleton` (detail skeleton); create route `projects/[projectId]/{page,loading}.tsx`.

- [ ] **Step 1: Precondition:** exports `detail-dibooking-*`, `detail-draf-*`, `detail-pemotretan-*`, `detail-pascaproduksi-*`, `detail-dibatalkan-*` and `detail-status-pending-*`.
- [ ] **Step 2: Failing tests** (AC-PRJ-015, 018, 020, 022):
  - the header has the title, chip, meta (*Rina · Sesi berikutnya …*), step button and ⋯ (desktop), or the Compact Bar ⋯, header block and sticky step (phone);
  - the step icons are `calendar-check` / `camera` / `circle-check-big`;
  - no step button in POST_PROCESSING or CANCELLED;
  - the Info facts show the price as *Rp700.000* and the notes;
  - *Ukuran toga* is shown as `—` (muted);
  - SHOOTING: no *Tambah item*, item ⋯ or field *Ubah*; the description reads *Terkunci sejak pemotretan dimulai.*;
  - CANCELLED: Alert/Warning with the actor, date and reason; no edit controls; the descriptions read *Proyek dibatalkan, tidak bisa diubah.*;
  - pending: the step button is in its Loading state.
- [ ] **Step 3: Implement, compare, gate.** Commit `feat(projects): add the project detail page`.

### Task 19: Detail edits

**Files:** modify `package-items-card`, `sessions-card`, `booking-fields-card` (detail mode: save immediately); create `ui/booking-fields-dialog/*` and `ui/delete-session-dialog` (inside `session-dialog`).

- [ ] **Step 1: Precondition:** exports `detail-ubah-field-booking-*`, `detail-hapus-sesi-*`, `detail-sesi-terakhir-*` and `detail-toast-paket-terkunci-*`.
- [ ] **Step 2: Failing tests** (AC-PRJ-017, 018, 019, 029):
  - each deal edit calls its action and shows *Perubahan disimpan*;
  - `DEAL_LOCKED` shows Toast/Danger *Detail paket tidak bisa diubah lagi* and calls `router.refresh()`;
  - the field dialog keeps names, types and options and validates by type;
  - the last session's *Hapus sesi* is disabled with the hint (Menu Item disabled; Sheet Item `isDisabled` on phones);
  - *Hapus sesi* confirms;
  - *Konfirmasi booking* without a session shows the toast and opens *Tambah sesi* (AC-PRJ-029).
- [ ] **Step 3: Implement, compare, gate.** Commit `feat(projects): add deal and session editing on the detail page`.

### Task 20: E2E, accessibility, fidelity and record

**Files:** create `tests/e2e/projects/projects.spec.ts`; modify `docs/features/projects/technical-design.md` (implementation record), `docs/product/feature-map.md`, `docs/HANDOFF.md`.

- [ ] **Step 1: E2E journeys:**
  - create a client and a service (fixtures);
  - book a project with an edited package and a session (AC-PRJ-008, 030);
  - see it in *Berjalan*;
  - search and filter, then reload (AC-PRJ-004, 028);
  - step to *Pemotretan* from the row menu (AC-PRJ-027) and to *Pascaproduksi* on the detail (AC-PRJ-020);
  - check that the deal is locked (AC-PRJ-018);
  - cancel a second project with a reason (AC-PRJ-022);
  - save a draft and delete it (AC-PRJ-023);
  - open a foreign workspace URL → not found (AC-PRJ-025).
- [ ] **Step 2: axe** (wcag2a/2aa/21a/21aa) on the list, filter, create, detail and every dialog, at 1440 and 390 px, light and dark. Keyboard-only paths through the picker, the date field and the menus; focus returns after each dialog (AC-PRJ-026).
- [ ] **Step 3: Fidelity.** Screenshot every implemented frame, compare it with its export and record the deviations.
- [ ] **Step 4: Full gate:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm build`, and the E2E suite.
- [ ] **Step 5: Record.**
  - Append *Implementation record* to technical-design.md: the deviations, the migration run, the AC → test map with the test paths.
  - Set F-07 to `IN PROGRESS → DONE`, or keep `IN PROGRESS` if verification is pending, as earlier features did.
  - Update the handoff.
  - Commit `test(projects): add project journeys and record the implementation`.
