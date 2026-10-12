# Plan — Setup checklist (F-25)

Status: PLANNED (2026-10-12) · Design: [technical-design.md](technical-design.md) · Spec: [spec.md](spec.md) · Criteria: [acceptance-criteria.md](acceptance-criteria.md) · Exports: [exports/INDEX.md](exports/INDEX.md)

**Goal:** a workspace with no project shows the four-step setup checklist on its dashboard (derived, read-only, one SQL statement); *New project*'s no-service alert links to an *Add service* deep link. Seven iterations, test-first, one commit per task (`feat(<scope>): …` / `test(…)` / `docs(…)`, lowercase, English, Co-Authored-By trailer).

**Global rules for every iteration**
- Related tests only: `npx vitest run <paths>`; integration `npx vitest run --config vitest.integration.config.ts <path>`; one E2E spec. Never the full suite.
- Lint per changed file as you go: `npx prettier --write <file>`, then `NODE_OPTIONS=--max-old-space-size=6144 npx eslint --fix <file>`. Then `pnpm typecheck`.
- Never type `head` (use `sed -n`). Never `pkill` a dev server; stop only your own PIDs or use `preview_stop`.
- UI text only from `*.copy.ts` (`local/ui-copy`), and only approved `copy-deck.md` rows. Never `vi.mock("next-intl")` with a factory importing the copy registry (CLAUDE.md); wrap in `NextIntlClientProvider` / `renderInLocale`.
- Read exports one file at a time, only the states the iteration names. The fidelity pass may change only class names and nesting.
- No migration, no new dependency, no new ADR. Branch `feat/setup-checklist`; don't push, deploy or open a PR without asking the Owner.

---

## Iteration 1 — Domain: derive the steps

**Read first:** AC-SETUP-001, 002, 006, 007, 010, 011, 012, 014, 015, 020 · BR-CAT-008, BR-SEL-001, BR-WS-004 · technical-design › D-3, D-4, D-9, *Domain* · coding-rules › Pure domain, Functions and comments, Where types live · code to follow: `src/features/workspace/domain/workspace-profile/` (domain unit + types + test).

- [ ] **1.1 Types.** `src/features/workspace/domain/setup-checklist/setup-checklist.types.ts`:
  ```ts
  export type SetupStepKey = "service" | "packageItems" | "firstProject" | "brandName";

  export type SetupStepState = "current" | "open" | "done" | "locked";

  export type SetupStepTarget =
    | { readonly kind: "addService" }
    | { readonly kind: "service"; readonly serviceId: string }
    | { readonly kind: "services" }
    | { readonly kind: "newProject" }
    | { readonly kind: "settings" };

  export interface SetupFacts {
    readonly hasProject: boolean;
    /** 0, 1, or 2 meaning "two or more" (the reader caps the count). */
    readonly activeServiceCount: number;
    /** The only active service's ID when exactly one exists, otherwise null. */
    readonly soleActiveServiceId: string | null;
    /** An active service has an item whose definition has selectionRequired (BR-SEL-001). */
    readonly hasSelectionItem: boolean;
    readonly hasBrandName: boolean;
  }

  export interface SetupStep {
    readonly key: SetupStepKey;
    readonly state: SetupStepState;
    readonly target: SetupStepTarget;
  }

  export interface SetupChecklist {
    readonly steps: readonly SetupStep[];
    readonly doneCount: number;
    readonly total: number;
  }
  ```
- [ ] **1.2 Tests first** in `setup-checklist.test.ts`, one `it` per AC, names prefixed with the AC ID:
  - AC-SETUP-001 new workspace (`{false,0,null,false,false}`) → service current, packageItems locked, firstProject locked, brandName open; doneCount 0, total 4.
  - AC-SETUP-002 `hasProject: true` → `null`, whatever the other facts.
  - AC-SETUP-006 one active service → service done, packageItems current, firstProject open.
  - AC-SETUP-007 / 015 count 0 with `hasBrandName` → steps 1–2 not done, 2–3 locked, brandName done.
  - AC-SETUP-010 / 011 packageItems target: count 1 + id → `{kind:"service", serviceId}`; count 2 → `{kind:"services"}`.
  - AC-SETUP-012 service done, no selection item → packageItems current, firstProject open with target `newProject`.
  - AC-SETUP-014 count 0, brand set → brandName done; brand blank → brandName open (never locked).
  - AC-SETUP-020 for all 2×3×2×2 combinations of (`hasProject` false, count 0/1/2, `hasSelectionItem`, `hasBrandName`) with consistent facts (no selection item without a service): exactly one step is `current`.
- [ ] **1.3 Implement** `setup-checklist.ts`:
  ```ts
  import type {
    SetupChecklist,
    SetupFacts,
    SetupStep,
    SetupStepKey,
    SetupStepState,
    SetupStepTarget,
  } from "./setup-checklist.types";

  /** Step order; the first step that is neither done nor locked is the current one (F-25 D-3). */
  export const SETUP_STEP_ORDER: readonly SetupStepKey[] = [
    "service",
    "packageItems",
    "firstProject",
    "brandName",
  ];

  function isDone(key: SetupStepKey, facts: Readonly<SetupFacts>): boolean {
    if (key === "service") return facts.activeServiceCount > 0;
    if (key === "packageItems") return facts.hasSelectionItem;
    if (key === "brandName") return facts.hasBrandName;
    return false;
  }

  function isLocked(key: SetupStepKey, facts: Readonly<SetupFacts>): boolean {
    return facts.activeServiceCount === 0 && (key === "packageItems" || key === "firstProject");
  }

  function targetOf(key: SetupStepKey, facts: Readonly<SetupFacts>): SetupStepTarget {
    if (key === "service") return { kind: "addService" };
    if (key === "firstProject") return { kind: "newProject" };
    if (key === "brandName") return { kind: "settings" };
    return facts.activeServiceCount === 1 && facts.soleActiveServiceId !== null
      ? { kind: "service", serviceId: facts.soleActiveServiceId }
      : { kind: "services" };
  }

  function stateOf(
    key: SetupStepKey,
    facts: Readonly<SetupFacts>,
    current: SetupStepKey | undefined,
  ): SetupStepState {
    if (isDone(key, facts)) return "done";
    if (isLocked(key, facts)) return "locked";
    return key === current ? "current" : "open";
  }

  /**
   * Derives the dashboard setup checklist from workspace facts; nothing is stored (F-25 D-3).
   * @param facts - what the workspace already has
   * @returns the four steps with their states and targets, or null once the workspace has a project
   */
  export function deriveSetupChecklist(facts: Readonly<SetupFacts>): SetupChecklist | null {
    if (facts.hasProject) return null;
    const current = SETUP_STEP_ORDER.find((key) => !isDone(key, facts) && !isLocked(key, facts));
    const steps: SetupStep[] = SETUP_STEP_ORDER.map((key) => ({
      key,
      state: stateOf(key, facts, current),
      target: targetOf(key, facts),
    }));
    return {
      steps,
      doneCount: steps.filter((step) => step.state === "done").length,
      total: steps.length,
    };
  }
  ```
  Commit `feat(workspace): derive the setup checklist steps from workspace facts`.

**Done when:** `npx vitest run src/features/workspace/domain/setup-checklist` passes; typecheck and lint clean.

---

## Iteration 2 — Read port, one-statement adapter, use case

**Read first:** AC-SETUP-002, 003, 004, 007, 008, 009, 014, 019 · BR-CAT-008, BR-CAT-002, BR-PRJ-010, BR-WS-002, BR-WS-003 · C-101 · ADR-018 › Decision 3 · technical-design › D-2, D-9, *Validation*, *Security* · coding-rules › Data Access, Validation, Testing · code to follow: `src/adapters/db/team-repository/drizzle-team-role-repository.ts` (`db.execute(sql…)`, `result.rows`), `src/features/workspace/application/use-cases/get-workspace-profile/` (use case), `tests/integration/booking/catalog-repositories.test.ts` and `tests/integration/booking/project-repository.test.ts` (seeding a workspace, catalog rows, a client and a project).

- [ ] **2.1 Port.** `src/features/workspace/application/ports/setup-facts-reader/setup-facts-reader.port.ts`:
  ```ts
  import "server-only";

  import type { SetupFacts } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";
  import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

  /** Reads what a workspace already has for the setup checklist, scoped to the verified workspace (F-25 D-2). */
  export interface SetupFactsReaderPort {
    readonly read: (context: WorkspaceContext) => Promise<SetupFacts>;
  }
  ```
- [ ] **2.2 Integration test first** `tests/integration/workspace/drizzle-setup-facts-reader.test.ts` (seed per test, unique IDs, assert only on own data):
  - AC-SETUP-001 empty workspace → `{ hasProject:false, activeServiceCount:0, soleActiveServiceId:null, hasSelectionItem:false, hasBrandName:false }`.
  - AC-SETUP-002 one project in each of `DRAFT`, `BOOKED`, `COMPLETED`, `CANCELLED` (four workspaces) → `hasProject` true.
  - AC-SETUP-003 delete the only `DRAFT` row → `hasProject` false.
  - AC-SETUP-007 one archived service → count 0; one active → count 1 and its ID; three active → count 2, id null.
  - AC-SETUP-008 service with only *Durasi pemotretan* / *Jumlah orang* → `hasSelectionItem` false; add *Foto edit* → true.
  - AC-SETUP-009 *Foto edit* only on an archived service, plus an active service without selection items → false.
  - D-9 *Foto edit* definition archived but still on an active service → true.
  - AC-SETUP-014 brand name null, `'  '`, `'Explore Photo'` → false, false, true.
  - AC-SETUP-004 workspace A empty, workspace B fully set up → A's facts unchanged by B.
  - AC-SETUP-019 `vi.spyOn(db, "execute")` → called exactly once per `read`.
- [ ] **2.3 Adapter.** `src/adapters/db/setup-facts-reader/drizzle-setup-facts-reader.schema.ts`:
  ```ts
  import { z } from "zod";

  export const setupFactsRowSchema = z.object({
    has_project: z.boolean(),
    active_service_count: z.number().int().min(0).max(2),
    first_active_service_id: z.string().uuid().nullable(),
    has_selection_item: z.boolean(),
    has_brand_name: z.boolean(),
  });
  ```
  and `drizzle-setup-facts-reader.ts`:
  ```ts
  import "server-only";

  import { sql } from "drizzle-orm";

  import type { SetupFactsReaderPort } from "@/features/workspace/application/ports/setup-facts-reader/setup-facts-reader.port";

  import type { DbExecutor } from "../client/client.types";
  import { setupFactsRowSchema } from "./drizzle-setup-facts-reader.schema";

  // One statement of scalar subqueries, every one scoped to the workspace (C-101, ADR-018, F-25 D-2).
  function setupFactsSql(workspaceId: string) {
    return sql`select
      exists(select 1 from project p where p.workspace_id = ${workspaceId}) as has_project,
      (select count(*)::int from (
        select 1 from service s where s.workspace_id = ${workspaceId} and s.is_active limit 2
      ) capped) as active_service_count,
      (select s.id from service s
        where s.workspace_id = ${workspaceId} and s.is_active
        order by s.id limit 1) as first_active_service_id,
      exists(select 1 from service s
        join service_item si on si.workspace_id = s.workspace_id and si.service_id = s.id
        join service_item_definition d on d.workspace_id = si.workspace_id and d.id = si.definition_id
        where s.workspace_id = ${workspaceId} and s.is_active and d.selection_required
      ) as has_selection_item,
      exists(select 1 from workspace w
        where w.id = ${workspaceId} and coalesce(btrim(w.brand_name), '') <> ''
      ) as has_brand_name`;
  }

  /** Creates the setup-facts reader: one round trip per dashboard load (F-25 D-2). @param db - the request-scoped Drizzle database @returns the reader */
  export function createDrizzleSetupFactsReader(db: DbExecutor): SetupFactsReaderPort {
    return {
      async read(context) {
        const result = await db.execute(setupFactsSql(context.workspaceId));
        const row = setupFactsRowSchema.parse(result.rows.at(0));
        return {
          hasProject: row.has_project,
          activeServiceCount: row.active_service_count,
          soleActiveServiceId: row.active_service_count === 1 ? row.first_active_service_id : null,
          hasSelectionItem: row.has_selection_item,
          hasBrandName: row.has_brand_name,
        };
      },
    };
  }
  ```
  If `first_active_service_id` comes back as a non-string, fix the cast in SQL (`s.id::text`), not in the schema.
- [ ] **2.4 Use case.** `src/features/workspace/application/use-cases/load-setup-checklist/load-setup-checklist.ts` (+ a unit test with a fake reader: facts in → `deriveSetupChecklist` result out):
  ```ts
  import "server-only";

  import { deriveSetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist";
  import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";
  import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

  import type { SetupFactsReaderPort } from "../../ports/setup-facts-reader/setup-facts-reader.port";

  /** Loads the dashboard setup checklist for a verified workspace (F-25). @param reader - setup facts port @param context - ownership-verified workspace @returns the checklist, or null once the workspace has a project */
  export async function loadSetupChecklist(
    reader: SetupFactsReaderPort,
    context: WorkspaceContext,
  ): Promise<SetupChecklist | null> {
    return deriveSetupChecklist(await reader.read(context));
  }
  ```
  Commits: `feat(workspace): read setup facts in one statement` (port, adapter, integration test) and `feat(workspace): load the setup checklist` (use case).

**Done when:** the integration file and the use-case unit test pass against the non-production database (ADR-024; copy `.dev.vars` if missing); typecheck and lint clean.

---

## Iteration 3 — Composition and the dashboard route

**Read first:** AC-SETUP-001, 002, 004 · BR-WS-003 · ADR-015, ADR-016 · technical-design › D-1, D-6, *Server / API interface* · code to follow: `src/composition/workspace/owner-workspace/owner-workspace.ts` (`enterWorkspace`), `src/composition/workspace/workspace-scope/workspace-scope.ts` (`withRequestDb`), `src/app/(owner)/w/[workspaceId]/page.tsx`.

- [ ] **3.1 `loadDashboard`.** `src/composition/workspace/dashboard-flow/dashboard-flow.types.ts`:
  ```ts
  import type { WorkspaceSummary } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";
  import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

  export interface DashboardData {
    readonly workspace: WorkspaceSummary;
    readonly checklist: SetupChecklist | null;
  }
  ```
  `dashboard-flow.ts`:
  ```ts
  import "server-only";

  import { createDrizzleSetupFactsReader } from "@/adapters/db/setup-facts-reader/drizzle-setup-facts-reader";
  import { loadSetupChecklist } from "@/features/workspace/application/use-cases/load-setup-checklist/load-setup-checklist";

  import { withRequestDb } from "../../request-db/request-db";
  import { enterWorkspace } from "../owner-workspace/owner-workspace";
  import type { DashboardData } from "./dashboard-flow.types";

  /** Verifies and opens the workspace, then loads its setup checklist (F-25). @param rawId - untrusted route ID @returns the workspace summary and the checklist, or null once it has a project */
  export async function loadDashboard(rawId: string): Promise<DashboardData> {
    const verified = await enterWorkspace(rawId);
    const checklist = await withRequestDb((db) =>
      loadSetupChecklist(createDrizzleSetupFactsReader(db), verified.context),
    );
    return { workspace: verified.workspace, checklist };
  }
  ```
- [ ] **3.2 Route.** In `page.tsx`, replace `enterWorkspace` with `const { workspace, checklist } = await loadDashboard(workspaceId);` and pass `checklist={checklist}` to `DashboardScreen`. Add `readonly checklist?: SetupChecklist | null;` to `DashboardScreenProps` (optional until iteration 5 uses it). Commit `feat(workspace): load the setup checklist on the dashboard`.

**Done when:** typecheck and lint clean; `npx vitest run src/features/workspace/ui/dashboard-screen` still passes; the dashboard still renders on `localhost:3000` for a seeded workspace (preview, no visual change yet).

---

## Iteration 4 — Copy

**Read first:** AC-SETUP-016, 017 · BR-L10N-001, BR-L10N-002 · technical-design › D-10 · copy-deck.md §4.3a and §1 *Done* / *Required marker* · coding-rules › Copy · code to follow: `src/features/workspace/ui/dashboard-screen/dashboard-screen.copy.ts`, `src/features/workspace/ui/page-not-found-screen/page-not-found-screen.deck.test.ts`, `src/app/copy-registry.ts`.

- [ ] **4.1 Deck row.** Add to copy-deck §4.3a, after *Recommended marker*: `| Optional marker (step 4) | Optional | Opsional | §4.3a note: markers reuse §1; §1 had no plain row. |`. Report it to the Owner in the iteration summary (R-4). Commit `docs(copy): add the optional marker row the setup checklist reuses`.
- [ ] **4.2 Deck test first** `src/features/workspace/ui/setup-checklist/setup-checklist.deck.test.ts`: every EN/ID pair below appears as one deck row (same `expectDeckRow` helper).
- [ ] **4.3 Copy module** `setup-checklist.copy.ts`, namespace `workspaceSetupChecklist`, `surface: "owner"`, verbatim from §4.3a and §1:
  ```ts
  // Source: copy-deck.md §4.3a "Setup checklist" (Owner-approved 2026-10-12) and §1 "Done", "Required marker". Copied verbatim.
  export const SETUP_CHECKLIST_COPY_NAMESPACE = "workspaceSetupChecklist";

  export const SETUP_CHECKLIST_COPY = {
    namespace: SETUP_CHECKLIST_COPY_NAMESPACE,
    surface: "owner",
    messages: {
      en: {
        title: "Set up your workspace",
        description: "Add a service first, then follow the recommended and optional steps.",
        progress: "{done} of {total} done",
        required: "Required",
        recommended: "Recommended",
        optional: "Optional",
        done: "Done",
        lockedHint: "This step opens after you add a service",
        serviceTitle: "Add a service",
        serviceBody: "Projects come from services; add categories in Add service",
        serviceAction: "Add service",
        packageItemsTitle: "Add package items",
        packageItemsBody: "“Foto edit 50” limits how many photos clients pick",
        packageItemsAction: "Add package items",
        firstProjectTitle: "Create your first project",
        firstProjectBody: "Fill in client and shoot date in New project",
        firstProjectAction: "New project",
        brandNameTitle: "Set your brand name",
        brandNameBody: "Clients see {workspaceName} in messages and galleries until then",
      },
      id: {
        title: "Siapkan ruang kerjamu",
        description: "Tambahkan layanan dulu, lalu ikuti langkah yang disarankan dan opsional.",
        progress: "{done} dari {total} selesai",
        required: "Wajib",
        recommended: "Disarankan",
        optional: "Opsional",
        done: "Selesai",
        lockedHint: "Langkah ini terbuka setelah kamu menambah layanan",
        serviceTitle: "Tambah layanan",
        serviceBody: "Proyek berawal dari layanan; kategori bisa dibuat lewat Tambah layanan",
        serviceAction: "Tambah layanan",
        packageItemsTitle: "Tambah isi paket",
        packageItemsBody: "“Foto edit 50” menentukan batas foto yang dipilih klien",
        packageItemsAction: "Tambah isi paket",
        firstProjectTitle: "Buat proyek pertamamu",
        firstProjectBody: "Masukkan klien dan tanggal pemotretan lewat Proyek baru",
        firstProjectAction: "Proyek baru",
        brandNameTitle: "Atur nama merek",
        brandNameBody: "Sebelum diatur, klien melihat {workspaceName} di pesan dan galeri",
      },
    },
  } as const;
  ```
  Copy each string from the deck file itself, not from this plan, and check the description's ID cell in full (the plan's copy is a guide). Register `SETUP_CHECKLIST_COPY` in `src/app/copy-registry.ts`.
- [ ] **4.4 *New project* copy.** In `project-copy.copy.ts` set `noServiceBody` / `noServiceAction` (EN and ID) to the §4.3a *§7.2 replaces* rows; update the §7.2 rows in the deck to the same text (mark them "replaced by §4.3a, F-25"). Add `project-copy.deck.test.ts` for the two keys plus `noServiceTitle`. Update the `"Buka layanan"` assertion in `create-project-screen.test.tsx` to `"Tambah layanan"`. Commit `feat(copy): add the setup checklist copy and the new no-service alert copy`.

**Done when:** both deck tests, `create-project-screen.test.tsx` and the copy-registry's own test (if any) pass; lint clean.

---

## Iteration 5 — Checklist UI on the dashboard

**Read first:** AC-SETUP-001, 002, 006, 012, 013, 017, 018, 020 · C-007, C-008 · technical-design › D-4, D-6, D-7, D-8, *UI components* · design.md › *Row overrides*, *Token-usage exceptions* · coding-rules › React, Styling and React Aria, Copy, UI States · code to follow: `src/ui/patterns/list-card-item/list-card-item.tsx` (`LIST_CARD_ROW`, link row, tokens), `src/ui/patterns/section-card/section-card.tsx`, `src/features/workspace/ui/dashboard-screen/dashboard-screen.tsx` · exports (one at a time): `dashboard-new-workspace` desktop `liGsJ`, mobile `Rbpwx`, tablet `X0t9KY`; `dashboard-step-1-done` desktop `u4OTj3` (step 3 hover), mobile `eEfVG`; `dashboard-first-project-left` desktop `J29pj`, mobile `KsvGt`. Read only the content region of each (the checklist card); the shell is unchanged (D-6).

- [ ] **5.1 `setupStepHref`** in `src/features/workspace/ui/setup-step-href/` with a test per target kind (D-4): `addService` → `/w/{id}/services?add=service`, `service` → `/w/{id}/services/{serviceId}`, `services` → `/w/{id}/services`, `newProject` → `/w/{id}/projects/new`, `settings` → `/w/{id}/settings`.
- [ ] **5.2 `SetupChecklistRow`** test first (`setup-checklist-row.test.tsx`, `renderInLocale`): current → a primary button-link with the action label and no chevron; open → one link named by the step title, href from 5.1, no button; done → *Done* chip, success icon, no link, no button; locked → lock icon, locked hint instead of the description, no link, no button, not focusable (AC-SETUP-013, 018). Marker per step (D-7 table in technical-design › *UI components*). Implement from the exports: row = `LIST_CARD_ROW` + `component.list-card.item.*` tokens; title row = title + `StatusChip`; description `text-(--color-semantic-text-muted)` (design T3 exception); done well `bg-(--color-semantic-status-success-bg)` with `text-(--color-semantic-status-success-fg)`; desktop/tablet trailing min height = MD button height; below `md` the current step's button renders under the description, aligned with the title, sized to its label. The current step's action is a link styled as a primary MD button (navigation, not a form action): follow how existing screens render a `Button` inside `next/link`.
- [ ] **5.3 `SetupChecklist`** test first (`setup-checklist.test.tsx`, `en` and `id`): title, description, progress *0 of 4 done* / *0 dari 4 selesai*; four rows in order in an `<ol>`; exactly one button (AC-SETUP-020); brand-name body interpolates the workspace name. Implement with `SectionCard content="flush"` (title, description, progress in `actions`), width `size.content-narrow`, centered; vertically centered at `xl` only (D-8).
- [ ] **5.4 `DashboardScreen`.** Test first: with a checklist → renders it and no *Set up branding* link, no in-content greeting; with `null` → today's placeholder unchanged (keep the two existing tests for the null case). Make `checklist` required (`SetupChecklist | null`). Keep the *Workspace created* toast in both branches.
- [ ] **5.5 Visual check** in the preview (`preview_start`), signed in as a seeded Owner on a workspace with no project: compare with the exports at 1440, 1024 and 390 (new workspace), then after adding a service (step 1 done) and with only step 3 left. Report R-1 (header title) to the Owner with a screenshot. Commits: `feat(workspace): add the setup checklist row`, `feat(workspace): show the setup checklist on the dashboard`.

**Done when:** the four dom/unit test files pass; typecheck and lint clean; screenshots match the exports' content region at the three widths, deviations listed.

---

## Iteration 6 — *Add service* deep link and the *New project* alert

**Read first:** AC-SETUP-005, 016 · BR-PRJ-008 · technical-design › D-5, D-4 · code to follow: `src/app/(owner)/w/[workspaceId]/services/page.tsx`, `src/features/booking/ui/services-screen/services-screen.tsx` (`useServiceDialogs`), `src/features/booking/ui/create-project-screen/client-service-card.tsx` (`NoServiceAlert`), `src/app/(owner)/w/[workspaceId]/page.tsx` (async `searchParams`) · Next.js docs in `node_modules/next/dist/docs/` for page `searchParams` and `useRouter().replace` · exports: `new-project-no-service` desktop `nUEqD`, mobile `iPdZV`.

- [ ] **6.1 Services deep link.** Test first in `services-screen.test.tsx`: `openAddOnLoad` → the *Add service* dialog is open on first render; closing it without saving calls `router.replace("/w/ws-1/services", { scroll: false })`; without the prop the dialog stays closed. Implement: page reads `const { add } = await searchParams;` and passes `openAddOnLoad={add === "service"}`; `useServiceDialogs(openAddOnLoad)` seeds `useState(openAddOnLoad)`; the dialog's `onOpenChange(false)` also replaces the URL when it was opened by the link. Commit `feat(catalog): open add service from a link`.
- [ ] **6.2 *New project* alert.** Test first in `create-project-screen.test.tsx`: no active service → the alert shows the new body; its action navigates to `/w/ws-1/services?add=service`. Implement in `NoServiceAlert`. Check against the exports (Service field disabled with *No active services yet*, both form buttons disabled: unchanged F-07 behaviour). Commit `feat(projects): send owners without a service to add service`.

**Done when:** both test files pass; typecheck and lint clean; in the preview, *New project* → *Add service* opens Services with the dialog open, and Escape leaves `/services` without the query.

---

## Iteration 7 — E2E, verification notes, close

**Read first:** AC-SETUP-001, 005, 006, 016 · J-01 · coding-rules › Testing · code to follow: `tests/e2e/workspace/workspace.spec.ts` (register → verify → create workspace, with `E2E_EMAIL_CAPTURE=1` and `GET /api/test/auth-emails?to=`), `tests/e2e/catalog/catalog.spec.ts` (adding a service).

- [ ] **7.1 E2E** `tests/e2e/setup-checklist/checklist.spec.ts`: a new Owner creates a workspace → the dashboard shows *Set up your workspace*, *0 of 4 done*, one button *Add service*, and no *Set up branding* (AC-SETUP-001) → the button opens Services with the dialog open (AC-SETUP-005) → save a service with a new category → its page opens (F-05) → back on the dashboard step 1 is *Done*, *Add package items* is the only button, *Create your first project* is a link (AC-SETUP-006) → *New project* from a second workspace with no service shows the new alert and its action opens the dialog (AC-SETUP-016). Run it alone; rerun once on the Neon websocket flake (R-3).
- [ ] **7.2 Close.** Record the build in a short `build-notes.md` (iterations, checks run, deviations, R-1 outcome); set the feature map to `IN PROGRESS` during the build and `DONE, pending verification` here; tick this plan. Commit `docs(setup-checklist): record the build`.

**Done when:** the E2E spec passes; all files touched in iterations 1–6 still pass their related tests; typecheck and lint clean. Next: `/sdv:verify-feature setup-checklist`.
