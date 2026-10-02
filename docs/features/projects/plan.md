# F-07 Projects — Implementation Plan (vertical slices by screen)

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. In this repo, `/sdv:build-feature projects <slice>` runs one slice; each **step** inside it is one commit.

**Goal:** the Owner books shoots as projects.
- ***Proyek baru*:** one client, one service, an editable package snapshot, sessions and booking fields, saved in one transaction as a draft or as booked.
- **Detail page:** manual status steps, deal edits until shooting starts, session edits, and cancel or delete-draft.
- **List:** three tabs, search, a filter, 30 rows per page and a row menu.

**Approach (Owner 2026-10-03):** each slice delivers one screen end to end:
- domain → application → repository → action → UI → tests;
- it can be tried in the browser when it is done;
- it produces the data the next slice shows.

The slice order is *Proyek baru* → detail → list. Each step inside a slice is one commit.

**Architecture:**
- Projects join the `booking` feature (`src/features/booking/{domain,application,ui}`) beside the catalog (F-05) and clients (F-06).
- Four Drizzle tables sit behind `ProjectRepositoryPort` and `ProjectListReaderPort`: `project`, `project_item`, `project_field_value` and `project_session`. All four arrive in Slice 1 (one migration, `0009`).
- Every mutation locks the project row and decides from the stored status (D-2). Status actions send a step, never a status (D-3).
- The list sorts by each project's shown session, with keyset paging (D-8).
- Composition verifies the workspace and wires the routes and actions.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), `@internationalized/date` (new, D-12), Hugeicons, Vitest (unit, dom, integration), Playwright + axe, Storybook.

**Sources:**
- design: [design.md](design.md) and `exports/*.html` (92 frames, one per file);
- technical design: [technical-design.md](technical-design.md) (D-1…D-16, the AC → test map);
- spec: [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md) (AC-PRJ-001…030);
- component specs in `docs/design-system/components/` (listed in the technical design).

**Base:** F-06 Clients is **built and merged into `feat/projects`** before Slice 0. Its plan is ready ([../clients/plan.md](../clients/plan.md)) but not implemented yet. This plan uses these F-06 units by name:
- `client` table / migration `0008`;
- `ClientRepositoryPort`, `addClient`, `updateClient`;
- `ClientDialog`, `addClientAction`, `updateClientAction`;
- `DataTable`, `DataTableSkeleton`;
- `SheetItem` `isDisabled` / `isPending`;
- `formatWhatsappNumber`, `whatsappChatUrl`;
- the Input trailing `x` action.

## Global Constraints

Every step's requirements implicitly include this section. They are F-06's Global Constraints (`docs/features/clients/plan.md`) plus the following.

- **Reuse first (Owner 2026-10-03).** Before building any UI unit, the agent:
  1. searches `src/ui/primitives`, `src/ui/patterns` and `src/features/booking/ui` (F-05 and F-06 added many units), and the Storybook stories;
  2. lists in the step what it found;
  3. uses the existing unit, or extends it with an additive prop.

  The agent creates a new unit only when nothing fits, and says why in the commit message. The same applies to domain helpers: `parseIdrAmount`, `formatIdr`, `parseQuantity`, `findPackageValueProblem`, `formatQuantity`, the item summary, and F-06's WhatsApp and client helpers.
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
- **Money:** whole IDR strings only (`parseIdrAmount` / `formatIdr`), never `number` arithmetic (ADR-007). The display is *Rp 750.000*, with a space, as in F-05 (Owner 2026-10-02).
- **Token (C-103, D-6):** `client_access_token` is written once on create and never appears in a select list, a result type, a log or a page.
- **Logging:** `project.save_failed` with `{ workspaceId, projectId?, operation }` only. Never a title, note, client name, number, reason, query or `wa.me` URL.
- **Copy:** from the frames and design.md › Copy, in `project-copy`. Strings not drawn carry `// not in Pencil`.
- **Copy differs by breakpoint** where the exports differ. Keep both variants in `project-copy` (`…Desktop` / `…Mobile`):

  | Where | Desktop | Phone |
  |---|---|---|
  | List page subtitle (F-06's `mobileSubtitle`) | *Setiap pemotretan yang kamu pegang, dari draf sampai selesai.* | *Pemotretan dari draf sampai selesai.* |
  | Card buttons | *Tambah item* · *Tambah sesi* · *Ubah info* | *Tambah* · *Tambah* · *Ubah* |
  | *Isi paket* description | *Disalin dari {layanan}. Perubahan hanya berlaku untuk proyek ini.* (create) / *Disalin dari {layanan}. Bisa diubah sampai pemotretan dimulai.* (detail) | *Dari {layanan}. Hanya untuk proyek ini.* / *Bisa diubah sampai pemotretan dimulai.* |
  | *Jadwal* description | *Sesi pemotretan. Minimal satu sesi untuk Buat proyek.* / *Sesi pemotretan, urut tanggal.* | *Minimal satu sesi untuk Buat proyek.* / *Urut tanggal.* |
  | *Field booking* description (detail) | *Disalin dari {layanan} saat proyek dibuat.* | *Disalin dari {layanan}.* |
- **Date display** (exports):
  - list ACARA cell, session rows and detail facts: *Sel, 10 Nov 2026* (weekday);
  - phone list rows, the phone row sheet, and the date fields for booking values and the filter: *10 Nov 2026*.
- **UI steps:**
  - build from the slice's exports, and stop if one is missing;
  - map every raw value to a token; a value with no token is a DESIGN TOKEN GAP: report it and never hard-code it;
  - compare the screen with its exports at 1440 and 390 and record the deviations.
- **Migration:** Slice 1 generates `0009` with drizzle-kit, reviews it, commits it, then runs `pnpm db:migrate` against the non-production database from `.dev.vars` (AGENTS.md). Report the run.
- **Tests:** names start with the `AC-PRJ-*` / `BR-*` IDs they cover. Domain tests never touch the DB. Integration tests seed their own workspace (ADR-009).
- **Quality gate per step:**
  - `pnpm typecheck`, `pnpm lint` and `pnpm test` pass;
  - steps that touch the repository add `pnpm test:integration`;
  - the slice's last step adds `pnpm build`, and from Slice 2 on, the E2E specs written so far.
- **Commits:** one per step; conventional, lowercase, with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Code in this plan:** written out for rules only (status, menu, sessions, schema, token, list SQL shape). UI steps point to their exports and name the behaviour to test. They don't paste JSX.

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

Each slice lists the subset it creates.

## Screens

F-07 has three pages plus the overlays that open on them. Each overlay belongs to the page it opens on. Every state is one export per device (`exports/<state>-<desktop|mobile>-<id>.html`).

| # | Screen | Route / where it opens | Layout | States (exports) | Built in |
|---|---|---|---|---|---|
| S1 | **Proyek list** | `/projects` (*Aktif*), `/projects/completed` (*Selesai*), `/projects/cancelled` (*Dibatalkan*) | Desktop: App Shell, Page Header with tabs, table in the 720 column. Phone: Mobile App Shell + Bottom Nav, Segmented Control, list card | `list-aktif-*`, `list-selesai-*`, `list-dibatalkan-*`, `list-empty-{aktif,selesai,dibatalkan}-*`, `list-no-match-*`, `list-loading-*`, `list-loading-more-*`, `list-toast-draf-dihapus-*` | Slice [3](#slice-3-list) |
| S1a | Filter proyek | S1 › filter button (Modal MD / Bottom Sheet Form) | | `filter-modal-desktop-e1VJF`, `filter-sheet-mobile-ITvcM`, `list-filter-diterapkan-*` | Slice [4](#slice-4-filter) |
| S1b | Row menu | S1 › row ⋯ (Action Menu / Bottom Sheet Actions) | | `list-row-menu-desktop-E3eVH`, `list-row-actions-sheet-mobile-EWFc5` | Slice [5](#slice-5-row-menu-and-project-dialogs) |
| S2 | **Proyek baru** | `/projects/new` (shell create action, *Proyek baru* / *Baru*) | Desktop: App Shell, form in the 720 column, actions under the form. Phone: Compact Bar, sticky action bar, no Bottom Nav | `new-kosong-*`, `new-pilih-klien-*`, `new-terisi-*`, `new-tanpa-isi-paket-dan-field-*`, `new-field-error-*`, `new-menyimpan-*`, `new-server-error-*` · Slice 7: `new-tanpa-layanan-aktif-*`, `new-layanan-tidak-aktif-*` | Slices [1](#slice-1-proyek-baru--the-main-path), [7](#slice-7-proyek-baru--the-rest) |
| S2a | Session form | S2 › *Tambah sesi* / session ⋯ *Ubah* (Modal MD / Bottom Sheet Form); reused on S3 | | `new-sesi-form-*`, `new-sesi-form-error-*` | Slice [1](#slice-1-proyek-baru--the-main-path) |
| S2b | Inline client dialog | S2 › picker *Tambah klien baru* (F-06 `ClientDialog`) | | `new-klien-baru-*` | Slice [7](#slice-7-proyek-baru--the-rest) |
| S2c | Item dialogs | S2 and S3 › *Tambah item*, item ⋯ *Ubah nilai* / *Hapus* | | `new-tambah-item-*`, `new-ubah-nilai-*`, `new-hapus-item-*` | Slices [6](#slice-6-detail-edits--package-booking-fields-and-sessions), [7](#slice-7-proyek-baru--the-rest) |
| S2d | *Ganti layanan?* | S2 › service change after package edits | | `new-ganti-layanan-*` | Slice [7](#slice-7-proyek-baru--the-rest) |
| S3 | **Project detail** | `/projects/[projectId]` (from the list's PROYEK text, or after saving) | Desktop: App Shell, Page Header with chip, meta, step button and ⋯, cards in the 720 column. Phone: Compact Bar with ⋯, header block, sticky step bar | `detail-{dibooking,draf,pemotretan,pascaproduksi,dibatalkan}-*`, `detail-status-pending-*`, `detail-toast-{dibuat,status-berubah,paket-terkunci,dibatalkan}-*` | Slices [2](#slice-2-detail--read-and-status-steps), [5](#slice-5-row-menu-and-project-dialogs), [6](#slice-6-detail-edits--package-booking-fields-and-sessions) |
| S3a | Project menu + project dialogs | S3 › ⋯, and S1b: *Ubah info*, *Batalkan proyek*, *Hapus draf* | | `detail-ubah-info-*`, `detail-ubah-info-harga-terkunci-*`, `detail-batalkan-proyek-alasan-wajib-*`, `detail-hapus-draf-*` | Slice [5](#slice-5-row-menu-and-project-dialogs) |
| S3b | Booking fields dialog | S3 › *Field booking* › *Ubah* | | `detail-ubah-field-booking-*` | Slice [6](#slice-6-detail-edits--package-booking-fields-and-sessions) |
| S3c | Session menu + delete | S3 › session ⋯ (*Ubah sesi*, *Hapus sesi*; last-session hint) | | `detail-sesi-terakhir-*`, `detail-hapus-sesi-*` | Slice [6](#slice-6-detail-edits--package-booking-fields-and-sessions) |

**Navigation between screens:**
- **Shell:** the create action / Bottom Nav CTA → S2; nav *Proyek* → S1.
- **S1:** *Proyek baru* / *Baru* → S2; the PROYEK cell text → S3.
- **S2:** *Buat proyek* / *Simpan draf* → S3 with a toast.
- **S3:** *Hapus draf* → S1 with a toast. Back (breadcrumb / Compact Bar) → S1.

**Not a screen of its own:** the *Row menu per status / Target* boards (`H0Gs4u`, `eKgbh`) show later features' menu items. They aren't built in F-07 and aren't exported.

## How to run this plan in one session

- **Before the first slice:**
  - read this file whole, then [technical-design.md](technical-design.md) › Decisions, [design.md](design.md) › Frames and Copy, and `docs/coding-rules.md`;
  - use the spec and AC only to look up a rule ID.
- **For each step, in this order:**
  1. **Precondition:** open every export the step names, `exports/<name>.html`. If one is missing, STOP and ask.
  2. **Reuse check:** look the unit up in `component-inventory.md` (Slice 0).
  3. **Failing tests:** write the tests the step lists, using the names, paths and copy given here, and run them; they must fail.
  4. **Implement:** follow *Existing code to follow* below, which names the file to copy each pattern from.
  5. **Gate:** run the step's gate.
  6. **Commit:** use the step's commit message.
- **Never invent copy:**
  - every user-facing string is in this plan, in design.md › Copy, or in an export;
  - anything not drawn is marked `// not in Pencil` here, so use it as written;
  - if a string is in none of these places, STOP and report a `SPEC GAP`.
- **Never change a higher-authority document to make a step pass.** That means the constitution, business rules, ADRs, coding rules, spec and AC. Report the conflict instead.
- **On failure:** if the gate fails for a reason outside the step (for example the shared Neon pooler is down), record it in the step's report and continue only with work that doesn't need that check.

## Existing code to follow

Copy these patterns instead of inventing new ones. The paths exist on `feat/projects` today, except the F-06 ones, which exist after Slice 0.

| Need | Follow | Notes |
|---|---|---|
| Server actions | `src/app/actions/booking/catalog.ts` | `"use server"`; call the flow; `revalidatePath(PAGE, "layout")` on success; return `result.ok ? undefined : result` |
| Composition flow | `src/composition/booking/catalog-flow/catalog-flow.ts` | `verifyOwnerWorkspace(rawWorkspaceId)` → `verified.context`; `requireOwnerOrRedirect()` for the actor (`account.id`); ID schema `safeParse` → `notFound()`; `saveError` logs + throws `SAVE_FAILED`, except `DomainError` |
| Scope (repositories on the request DB) | `src/composition/booking/catalog-scope/catalog-scope.ts` | `withRequestDb((db) => work({...}))` |
| Drizzle repository + transactions | `src/adapters/db/catalog-repository/drizzle-service-repository.ts` | `db.transaction(async (tx) => …)`, `pgCode(error)` from `pg-error.ts` for `23503` / `23505` |
| Tenant schema helpers | `src/adapters/db/schema/_conventions/tenant.ts` | `idColumn`, `workspaceIdColumn`, `auditColumns`, `tenantKey`, `tenantRef` |
| Detail route with a sub-page heading | `src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx` | `PageHeadingOverride` (`features/workspace/ui/page-heading-override`) sets title, subtitle and parent |
| Desktop page actions | `src/ui/patterns/page-actions/page-actions.tsx` | `<PageActions>` portals into the Page Header actions (`PAGE_ACTIONS_ID`) |
| Toast after a client action | `src/features/booking/ui/use-catalog-mutations/use-catalog-mutations.ts` | `showToast({ tone, title, body?, action? })` from `@/ui/patterns/toast/toast`; the danger toast has *Coba lagi* re-running the mutation |
| Toast after a redirect | `src/app/(owner)/w/[workspaceId]/page.tsx` + `dashboard-screen.tsx` | the page reads `?state=…` and renders `<ToastOnMount tone title body dedupeKey>` |
| Desktop vs phone tree | `src/ui/hooks/use-mobile-viewport/use-mobile-viewport.ts` | `useMobileViewport()` picks one tree (F-05/F-06) |
| Section tabs in the shell | `features/workspace/ui/owner-nav/owner-nav.tsx` › `resolveServicesHeading` | the same shape for the project tabs |
| Coming-soon list | `features/workspace/domain/coming-soon-sections/coming-soon-sections.ts` | remove `"new-project"` (Slice 1) and `"projects"` (Slice 3) |
| Phone create CTA | `features/workspace/ui/owner-shell/owner-shell.tsx` › `handleOpenProjects` | today it pushes `/projects`; Slice 1 changes it to `/projects/new` |
| Item value input, item summary, field-error copy | `features/booking/ui/service-item-dialog`, `domain/item-summary`, `ui/catalog-field-error` | reuse for project items |
| Fakes for use-case tests | `tests/support/booking/fake-service-repository.ts`, `service-fixtures.ts` | in-memory classes with `rows` arrays |
| Integration seeding | `tests/integration/booking/catalog-repositories.test.ts` › `seedWorkspace` | `openTestDb()` from `tests/integration/helpers/test-db.ts`, unique user + workspace per test |
| E2E setup + axe | `tests/e2e/catalog/catalog.spec.ts` | `registerAndVerify`, `createWorkspace`, `expectCatalogA11y` (wait for `[data-entering]` to settle) |

## Shared contracts

Each slice creates the types it needs, with exactly these shapes. Exported types go in sibling `.types.ts` files (coding rules). IDs are strings (uuid), dates are `YYYY-MM-DD`, times are `HH:MM` (24-hour), money is whole-rupiah digit strings.

```ts
// domain/project-status/project-status.types.ts (Slice 1)
export type ProjectStatus =
  | "DRAFT" | "BOOKED" | "SHOOTING" | "POST_PROCESSING" | "DELIVERED" | "COMPLETED" | "CANCELLED";
export type ProjectTab = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type ProjectStep = "CONFIRM_BOOKING" | "START_SHOOTING" | "FINISH_SHOOTING";
export interface StepTransition { readonly from: ProjectStatus; readonly to: ProjectStatus }

// domain/session/session.types.ts (Slice 1)
export interface SessionRecordShape {
  readonly id: string;
  readonly name: string;
  readonly date: string;            // YYYY-MM-DD
  readonly startTime: string | null; // HH:MM
  readonly endTime: string | null;
  readonly location: string | null;
  readonly createdAt: string;       // ISO timestamp, tie-breaker only
}
export interface ShownSession {
  readonly session: SessionRecordShape;
  readonly extraCount: number; // sessions beyond the shown one (*· +n sesi*)
  readonly isPast: boolean;    // *Sesi terakhir* instead of *Sesi berikutnya*
}
export interface SessionInput {
  readonly name: string;
  readonly date: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly location: string | null;
}

// domain/booking-field-value/booking-field-value.types.ts (Slice 1)
export type BookingValue = string | boolean | null; // NUMBER = canonical decimal string, DATE = YYYY-MM-DD, BOOLEAN = boolean
export interface SnapshotField {
  readonly key: string;
  readonly name: string;
  readonly fieldType: FieldType; // from domain/booking-field
  readonly isRequired: boolean;
  readonly options: readonly string[] | null;
}

// application/ports/project-repository/project-repository.port.ts (Slice 1; grows in 2, 5, 6)
export interface ProjectItemRecord {
  readonly id: string;
  readonly definitionId: string;
  readonly name: string;
  readonly unit: string | null;
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
  readonly selectionType: "EDIT" | "PRINT" | null;
  readonly value: PackageValue;
}
export interface ProjectFieldRecord extends SnapshotField {
  readonly id: string;
  readonly value: BookingValue;
}
export interface ProjectDetailRecord {
  readonly id: string;
  readonly title: string;
  readonly notes: string | null;
  readonly agreedPrice: string; // digits
  readonly currency: "IDR";
  readonly status: ProjectStatus;
  readonly client: { readonly id: string; readonly name: string; readonly whatsappNumber: string | null };
  readonly service: { readonly id: string; readonly name: string };
  readonly items: readonly ProjectItemRecord[];   // sort_order
  readonly fields: readonly ProjectFieldRecord[]; // sort_order
  readonly sessions: readonly SessionRecordShape[]; // compareSessions order
  readonly cancellation: { readonly at: string; readonly byName: string | null; readonly reason: string | null } | null;
}
export interface ProjectSnapshotInput {
  readonly status: "DRAFT" | "BOOKED";
  readonly clientId: string;
  readonly serviceId: string;
  readonly title: string;
  readonly notes: string | null;
  readonly agreedPrice: string;
  readonly accessToken: string;
  readonly actorId: string;
  readonly items: readonly { readonly definitionId: string; readonly value: PackageValue }[];
  readonly fieldValues: Readonly<Record<string, BookingValue>>;
  readonly sessions: readonly SessionInput[];
}
export type CreateSnapshotResult =
  | { readonly status: "CREATED"; readonly id: string }
  | { readonly status: "CLIENT_INACTIVE" | "SERVICE_INACTIVE" | "NOT_FOUND" }
  | { readonly status: "DEFINITION_INACTIVE" | "DUPLICATE_DEFINITION"; readonly definitionId: string };

// application/ports/project-list-reader/project-list-reader.port.ts (Slice 3)
export interface ProjectListRow {
  readonly id: string;
  readonly title: string;
  readonly status: ProjectStatus;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientWhatsappNumber: string | null;
  readonly serviceName: string;
  readonly shownSession: SessionRecordShape | null;
  readonly sessionCount: number;
}

// application/use-cases/project-results/project-results.types.ts (Slice 1; codes grow per slice)
export type ProjectFieldErrorKey =
  | "EMPTY" | "TOO_LONG" | "REQUIRED" | "INVALID" | "NEGATIVE" | "NOT_WHOLE" | "TOO_LARGE"
  | "TOO_MANY_DECIMALS" | "MIN_GREATER_THAN_MAX" | "NOT_AN_OPTION" | "END_WITHOUT_START"
  | "END_NOT_AFTER_START" | "SESSION_REQUIRED" | "CLIENT_INACTIVE" | "SERVICE_INACTIVE"
  | "DEFINITION_INACTIVE" | "DUPLICATE_DEFINITION" | "REASON_REQUIRED" | "TO_BEFORE_FROM";
export type ProjectDomainCode =
  | "DEAL_LOCKED" | "STALE" | "SESSION_REQUIRED" | "LAST_SESSION" | "PROJECT_CANCELLED";
export type ProjectFailure =
  | { readonly ok: false; readonly code: "VALIDATION_FAILED"; readonly fieldErrors: Readonly<Record<string, ProjectFieldErrorKey>> }
  | { readonly ok: false; readonly code: ProjectDomainCode };
export type CreateProjectResult = { readonly ok: true; readonly projectId: string } | ProjectFailure;
export type ProjectWriteResult = undefined | ProjectFailure;
```

**Field error copy** (`ui/project-field-error/project-field-error.ts`, `projectFieldErrorText(path, key)`). Item value keys reuse `catalog-field-error`.

| Path | Key | Copy |
|---|---|---|
| `clientId` | `REQUIRED` | *Pilih klien.* `// not in Pencil` |
| `clientId` | `CLIENT_INACTIVE` | *Klien ini sudah diarsipkan. Pilih klien lain.* `// not in Pencil` |
| `serviceId` | `REQUIRED` | *Pilih layanan.* `// not in Pencil` |
| `serviceId` | `SERVICE_INACTIVE` | *Layanan ini sudah tidak aktif. Pilih layanan lain.* |
| `title` | `EMPTY` / `TOO_LONG` | *Isi judul proyek.* / *Judul proyek maksimal 100 karakter.* `// not in Pencil` |
| `notes` | `TOO_LONG` | *Catatan maksimal 2000 karakter.* `// not in Pencil` |
| `agreedPrice` | `EMPTY` / `NEGATIVE` / `NOT_WHOLE` / `TOO_LARGE` / `INVALID` | *Isi harga sepakat.* / *Harga tidak boleh negatif.* / *Harga dalam rupiah bulat, tanpa koma.* / *Harga maksimal Rp 999.999.999.999.* / *Masukkan angka yang valid.* `// not in Pencil` |
| `sessions` | `SESSION_REQUIRED` | *Tambahkan minimal satu sesi.* |
| `name` (session) | `EMPTY` / `TOO_LONG` | *Isi nama sesi.* / *Nama sesi maksimal 100 karakter.* `// not in Pencil` (2nd) |
| `date` (session) | `EMPTY` / `INVALID` | *Pilih tanggal sesi.* / *Pilih tanggal yang valid.* `// not in Pencil` (2nd) |
| `endTime` | `END_WITHOUT_START` / `END_NOT_AFTER_START` | *Isi jam mulai dulu.* `// not in Pencil` / *Jam selesai harus setelah jam mulai.* |
| `location` | `TOO_LONG` | *Lokasi maksimal 200 karakter.* `// not in Pencil` |
| `fieldValues.<key>` | `REQUIRED` | *Isi {field}.* |
| `fieldValues.<key>` | `TOO_LONG` / `INVALID` / `NOT_AN_OPTION` | *{field} maksimal {n} karakter.* / *Masukkan nilai yang valid.* / *Pilih salah satu opsi.* `// not in Pencil` |
| `items.N.definitionId` | `DUPLICATE_DEFINITION` / `DEFINITION_INACTIVE` | *Item ini sudah ada di proyek* / *Item ini sudah tidak aktif. Pilih item lain.* `// not in Pencil` (2nd) |
| `reason` | `REASON_REQUIRED` / `TOO_LONG` | *Isi alasan pembatalan. Wajib setelah pemotretan dimulai.* / *Alasan maksimal 500 karakter.* `// not in Pencil` (2nd) |
| `to` (filter) | `TO_BEFORE_FROM` | *Tanggal Sampai harus sama atau setelah Dari.* `// not in Pencil` |

**Status labels and chip tones** (design-handoff decision 1):

| Status | Label | Tone | Dot |
|---|---|---|---|
| DRAFT | *Draf* | `neutral` | yes |
| BOOKED | *Dibooking* | `info` | yes |
| SHOOTING | *Pemotretan* | `accent` | yes |
| POST_PROCESSING | *Pascaproduksi* | `warning` | yes |
| DELIVERED | *Terkirim* | `success` | yes |
| COMPLETED | *Selesai* | `success` | **no** (`hasDot={false}`) |
| CANCELLED | *Dibatalkan* | `neutral` | yes |

**Step buttons:**

| Step | Label | Pending label | Icon | Toast (title / body) |
|---|---|---|---|---|
| `CONFIRM_BOOKING` | *Konfirmasi booking* | *Konfirmasi booking…* | `calendar-check` | *Booking dikonfirmasi* / — |
| `START_SHOOTING` | *Mulai pemotretan* | *Mulai pemotretan…* | `camera` | *Pemotretan dimulai* / *Isi paket dan harga sekarang terkunci.* |
| `FINISH_SHOOTING` | *Selesai pemotretan* | *Selesai pemotretan…* | `circle-check-big` | *Pemotretan selesai* / — |

## Test fixtures

`tests/support/booking/project-fixtures.ts` (Slice 1) builds the AC shared fixture on the fakes. Integration tests build the same data with Drizzle inserts. Use these exact values everywhere:

- **Clients:**
  - *Rina*, active, `6281234567890`;
  - *Budi*, archived;
  - *Sari*, active, no number.
- **Category *Wisuda*, with:**
  - service *Wisuda Basic*: active, base price `750000`.
    - Items in order: *Foto edit* `NUMBER` 25, unit *foto*, selection `EDIT`; *Jumlah orang* `RANGE` 1–3, unit *orang*.
    - Fields in order: `nama_kampus` *Nama kampus* `TEXT` required; `tanggal_wisuda` *Tanggal wisuda* `DATE` required; `ukuran_toga` *Ukuran toga* `SELECT` [`S`, `M`, `L`] optional.
  - service *Prewed Lama*: archived.
- **Definitions:** *Foto cetak* `NUMBER`, unit *foto*, selection `PRINT`, active; *Album lama*, archived.
- **List projects (AC-PRJ-001)**, with `today = "2026-10-02"`:
  - *Wisuda Rina*: `BOOKED`, session *Wisuda* 2026-11-10 07:30–10:00 at *Balairung UI, Depok*;
  - *Wisuda Sari*: `DRAFT`, no session;
  - *Prewed Dewi*: `SHOOTING`, sessions 2026-10-20 06:00 at *Tebing Keraton, Bandung* and 2026-10-21 (no time);
  - *Family Tono*: `COMPLETED`, session 2026-08-16 16:00;
  - *Wisuda Andi*: `CANCELLED`, session 2026-09-01, cancelled with the reason *Klien membatalkan acara*.

## AC index

| AC | Slice.step |
|---|---|
| 001, 002, 003, 004, 005 | 3.1, 3.2, 3.3 |
| 006, 007 | 1.3, 1.5 |
| 008 | 1.3, 1.5, 2.3 |
| 009 | 1.3 (draft), 2.1, 2.3 (confirm) |
| 010, 011 | 1.1, 1.3, 1.5 |
| 012 | 1.3 (repository), 7.2 (UI) |
| 013 | 7.1 |
| 014 | 7.2 |
| 015, 016 | 2.1, 2.2 |
| 017 | 5.1 (price), 6.1, 6.2 |
| 018 | 2.2 (display), 5.1, 6.1 |
| 019 | 6.1 |
| 020, 021 | 2.1, 2.2, 2.3 |
| 022, 023 | 5.1, 5.2, 5.3 |
| 024 | 1.3 |
| 025 | 1.3, 2.1, 3.1, 8.1 |
| 026 | 8.1 |
| 027 | 5.1, 5.2, 5.3 |
| 028 | 4.1, 4.3 |
| 029 | 1.1, 1.3, 1.5, 6.1, 6.2 |
| 030 | 7.3, 7.4 |

## Slice template

Every slice below has the same parts:
1. **Screen overview:** the screens, the route, the ACs, what is out of scope, then one row per state with both export IDs and what the export shows.
2. **Backend:** each file to create or change, with its signature.
3. **Rule code:** written out where a rule could be read two ways.
4. **Components:** shared units (reuse check first) and feature units with their props.
5. **Steps:** one commit each, test-first, naming the test files.
6. **Done check:** what must work in the browser, and the gate.

---

## Slice 0: Check the base

Screens: none. This slice checks the base and inventories the components for S1–S3.

- [ ] **0.1 Check that F-06 is in this branch.** All of these must hold:
  - `src/adapters/db/schema/booking/client.ts` and `drizzle/0008_client.sql` exist;
  - `src/ui/patterns/data-table/data-table.tsx` and `src/features/booking/ui/client-dialog/client-dialog.tsx` exist;
  - `src/features/booking/domain/whatsapp-number/whatsapp-number.ts` exports `formatWhatsappNumber` and `whatsappChatUrl`;
  - `pnpm typecheck && pnpm lint && pnpm test` pass.

  If any is missing, **STOP** and report: *F-06 must be built (`/sdv:build-feature clients 0…6`) and merged into `feat/projects` first.* Change nothing.
- [ ] **0.2 Sync.** If `main` moved, use the ccd_host `sync_with_base_branch` tool (or `git merge main` outside an app worktree).
  - Keep both features' text in `docs/HANDOFF.md` and `docs/product/feature-map.md`.
  - Keep this branch's `projects.pen` and `exports/`.
  - Commit the merge if there was one.
- [ ] **0.3 Component inventory.** Write `docs/features/projects/component-inventory.md` with the columns *Component · Spec · Status (exists / extend / new) · Path · Needed change · First used in*.
  - **Fill each row by reading the code, not by memory:** open the file, and for *extend* name the exact prop to add.
  - **Rows, at least:**
    - Checkbox (C05), Combobox (C36), MultiSelect (C20);
    - DateField with the C25 calendar, TimeField, Select with sections;
    - IconButton with `badgeCount`;
    - PageHeader / `PageHeadingOverride` with status chip and meta;
    - CompactBar actions (phone ⋯), DataTable, SheetItem disabled;
    - Alert, Toast + ToastOnMount, Modal SM/MD, BottomSheet Form/Actions;
    - EmptyState in-card, StatusChip `hasDot`, SegmentedControl full width, Tabs;
    - Menu with group label, divider and disabled item with description;
    - ActionMenu SM/MD, Textarea, TextField disabled, Button Danger / pending.
  - **Expected results** (confirm them): `PageHeadingOverrideValue` today has only `title`, `subtitle` and `parent`, and `CompactBar` takes `actions` but `AppShell` doesn't pass any. Both are *extend*.
  - Commit `docs(projects): inventory reusable components for f-07`.

**Done check:** the gate passes on the synced branch, and the inventory is committed with no empty cells.

---

## Slice 1: *Proyek baru* — the main path

### Screen overview

| | |
|---|---|
| Screens | S2 (main-path states), S2a |
| Route | `/w/[workspaceId]/projects/new`: a sub-page, with the Compact Bar on phones and no Bottom Nav |
| ACs | AC-PRJ-006, 007, 008, 009 (draft half), 010, 011, 024, 029 (create half) |
| Out of this slice | inline client dialog, item edits before saving, *Ganti layanan?*, no active service, inactive client/service UI (all Slice 7). The real detail page is Slice 2. Until then, success lands on a placeholder detail page that shows only the title. |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Empty | `new-kosong-desktop-yxqqv` | `new-kosong-mobile-OPt4W` | *Klien & layanan* with the Combobox placeholder *Cari atau tambah klien* and the Select placeholder *Pilih layanan*. *Detail proyek* with *Judul proyek* placeholder *Terisi otomatis setelah memilih layanan* (phone: *Terisi setelah memilih layanan*), *Harga sepakat* `Rp` `0` and *Catatan internal (opsional)* (*Hanya kamu yang bisa melihat catatan ini.*). *Jadwal* with Empty State/In card (`calendar-plus`, *Belum ada sesi*, *Catat tanggal, jam, dan lokasi pemotretan. Draf boleh disimpan tanpa sesi.*). No *Isi paket* or *Field booking* yet |
| Client picker open | `new-pilih-klien-desktop-VBXF3` | `new-pilih-klien-mobile-lJ7dl` | Combobox/Open with query *Rin*, group label *KLIEN · 3 COCOK*, matches *Rina* (*+62 812-3456-7890 · 2 proyek*), *Rina Kartika*, *Marina Putri* (*Belum ada nomor WhatsApp*), divider, create row *Tambah klien baru “Rin”* (wired in Slice 7). The menu opens inline under the field on phones too |
| Filled | `new-terisi-desktop-QeT50` | `new-terisi-mobile-l64V5` | Client helper *+62 812-3456-7890*. Service helper *Wisuda · harga dasar Rp 750.000*. Items *Foto edit* (*25 foto · pilihan edit*) and *Jumlah orang* (*1–3 orang*), each with ⋯ (Slice 7). *Judul proyek* *Wisuda Basic — Rina* with the helper *Terisi otomatis dari layanan dan klien. Bisa diubah.* *Harga sepakat* *750.000* with the helper *Harga dasar layanan: Rp 750.000*. Two sessions with ⋯. *Field booking* (*Dari layanan Wisuda Basic. Semua field tanpa (opsional) wajib diisi, juga untuk draf.*). Actions *Simpan draf* / *Buat proyek* |
| No items, no fields | `new-tanpa-isi-paket-dan-field-desktop-KwnCp` | `…-mobile-e7Dmly` | *Isi paket* with Empty State/In card (*Layanan ini belum punya item paket* · *Tambahkan item bila perlu. Item yang kamu tambah hanya berlaku untuk proyek ini.*); no *Field booking* card |
| Session form | `new-sesi-form-desktop-vv444` | `new-sesi-form-mobile-AnmVx` | Modal MD / Bottom Sheet Form: *Tambah sesi* · *Sesi disimpan bersama proyek.* · *Nama sesi* · *Tanggal* (DateField `weekday`: *Sel, 10 Nov 2026*) · *Jam mulai (opsional)* + *Jam selesai (opsional)* in one row · *Lokasi (opsional)* · *Batal* / *Tambah sesi* |
| Session errors | `new-sesi-form-error-desktop-eO5bn` | `…-mobile-yyDAM` | *Isi nama sesi.* (placeholder *Contoh: Akad, Resepsi, Foto keluarga*) · *Pilih tanggal sesi.* · *Jam selesai harus setelah jam mulai.* |
| Field errors | `new-field-error-desktop-h5ErBW` | `…-mobile-vs8Hr` | *Isi judul proyek.* (placeholder *Contoh: Wisuda Basic — Rina*) · *Jadwal* empty + the error line *Tambahkan minimal satu sesi.* · *Isi Nama kampus.* (placeholder *Universitas atau sekolah*) |
| Submitting | `new-menyimpan-desktop-TI8mj` | `…-mobile-LGVBa` | *Buat proyek* → Button Primary Loading *Membuat proyek…*; *Simpan draf* disabled. The draft path shows *Menyimpan draf…* on *Simpan draf* `// not in Pencil` |
| Server error | `new-server-error-desktop-q3PYk` | `…-mobile-TovK4` | Toast/Danger *Perubahan belum tersimpan* · *Terjadi kendala di server. Isian formulirmu masih ada.* · *Coba lagi*; the form keeps its input |

Page heading (desktop): breadcrumb *Proyek › Proyek baru*, title *Proyek baru*, subtitle *Pilih klien dan layanan, lalu catat apa yang kalian sepakati.* Phone: the Compact Bar has title *Proyek baru* and parent *Proyek*.

### Backend

| File | Content |
|---|---|
| `domain/project-status/*` | Rule code below (`.ts`, `.types.ts`, `.test.ts`) |
| `domain/project-record/*` | `projectTitleSchema` (trim; `EMPTY`; `TOO_LONG` > 100 code points), `projectNotesSchema` (trim; blank → `null`; `TOO_LONG` > 2000), `agreedPriceSchema` (wraps `parseIdrAmount`: `EMPTY` / `NEGATIVE` (leading `-`) / `NOT_WHOLE` / `INVALID` / `TOO_LARGE`; output digits), `cancelReasonSchema` (trim; blank → `null`; `TOO_LONG` > 500), `defaultProjectTitle(serviceName, clientName)` → `` `${service} — ${client}` `` cut to 100 code points |
| `domain/session/*` | Rule code below + `formatSessionWhen`, `formatSessionRange`, `formatShortDate` |
| `domain/booking-field-value/*` | Rule code below |
| `domain/project-items/*` | `validateItemList(items, rules)`: `rules` maps `definitionId → ValueRules` (from `package-value`). Returns `Record<string, ProjectFieldErrorKey>` keyed `items.N.definitionId` / `items.N.value` / `items.N.min` / `items.N.max`. A repeated `definitionId` → `DUPLICATE_DEFINITION` on the later index. Values go through `parseQuantity` + `findPackageValueProblem` |
| `domain/schedule-clock/*` | `PROJECT_SCHEDULE_TIME_ZONE`; `todayInScheduleZone(now: Date): string` via `Intl.DateTimeFormat("en-CA", { timeZone, year:"numeric", month:"2-digit", day:"2-digit" })` |
| `application/ports/project-repository/project-repository.port.ts` | `createSnapshot(context, input: ProjectSnapshotInput): Promise<CreateSnapshotResult>`; `findServiceForSnapshot(context, serviceId)` → `{ id, name, categoryName, basePrice, isActive, items: ServiceItemRecord[], fields: SnapshotField[] } \| null`; `findDefinitionRules(context, ids)` → `{ id, valueType, selectionRequired, isActive }[]`; `searchActiveClients(context, text, limit)` → `{ id, name, whatsappNumber, projectCount }[]`; `findDetail(context, id)` → `ProjectDetailRecord \| null`; `listActiveServiceOptions(context)` → services grouped by category with items and fields |
| `application/ports/access-token-generator/access-token-generator.port.ts` | `export type AccessTokenGeneratorPort = () => string;` |
| `application/schemas/create-project-input/*` | `createProjectInputSchema`, below |
| `application/schemas/project-ids/project-ids.schema.ts` | `projectIdSchema = z.uuid()` (follow `catalog-id.schema.ts`) |
| `application/errors/project-errors/*` | `ProjectError extends DomainError` with `code: "NOT_FOUND" \| "SAVE_FAILED"` |
| `application/use-cases/project-results/*` | `toValidationFailure(issues)` (Zod issues → `fieldErrors`, unknown message → `INVALID`) |
| `application/use-cases/load-create-options/*` | `loadCreateOptions(repo, context)` → `{ serviceGroups }` (Slice 7 adds `definitions` and `hasActiveService`) |
| `application/use-cases/search-active-clients/*` | `searchActiveClients(repo, context, query)`: trims; blank → the first 8 by name; otherwise name `ILIKE`; `CLIENT_PICKER_LIMIT` |
| `application/use-cases/create-project/*` | Algorithm below |
| `application/use-cases/get-project-detail/*` | Slice 1 version: `findDetail` or throw `ProjectError("NOT_FOUND")`. Slice 2 adds the view model |
| `adapters/db/schema/booking/project.ts` | All four tables (rule code below); export from `schema/index.ts` |
| `adapters/db/project-repository/drizzle-project-repository.ts` | The port above |
| `adapters/crypto/access-token-generator/web-crypto-access-token-generator.ts` | Rule code below. Add `adapters/crypto` to the boundaries element list in `eslint.config.mjs` if it isn't there |
| `composition/booking/project-scope/*` | `withProjectScope(work)` → `{ projects, accessTokens, now: () => new Date() }` |
| `composition/booking/project-flow/*` | `loadCreateProjectOptions(rawWorkspaceId)`, `createProjectEntry(rawWorkspaceId, values: unknown)`, `searchClientsEntry(rawWorkspaceId, query: unknown)`, `loadProjectDetail(rawWorkspaceId, rawProjectId)` |
| `app/actions/booking/projects.ts` | `createProjectAction(workspaceId, values)` → `CreateProjectResult` (revalidates `/w/[workspaceId]/projects` on ok); `searchActiveClientsAction(workspaceId, query)` |
| `app/(owner)/w/[workspaceId]/projects/new/{page,loading}.tsx` | Load the options; `PageHeadingOverride` (title *Proyek baru*, the subtitle above, parent *Proyek* → `/w/{id}/projects`); render `CreateProjectScreen` |
| `app/(owner)/w/[workspaceId]/projects/[projectId]/page.tsx` | **Placeholder:** `loadProjectDetail`, `PageHeadingOverride` with the project title and parent *Proyek*, plus `ToastOnMount` for `?state=created` / `draft-saved`. Slice 2 replaces the body |
| `app/(owner)/w/[workspaceId]/projects/page.tsx` | **Placeholder until Slice 3:** renders `<ComingSoonScreen workspaceId section="projects" />` after `verifyOwnerWorkspace`, because a static `projects/` folder stops `[section]` from matching `/projects` |
| `features/workspace/domain/coming-soon-sections` | Remove `"new-project"` (keep `"projects"` until Slice 3) |
| `features/workspace/ui/owner-shell/owner-shell.tsx` | `handleOpenProjects` → push `/w/{id}/projects/new` (rename it to `handleCreateProject`) |

### Rule code

**`project-status.ts`:** write it whole now; later slices only import it.

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
const NEXT_STEP: Readonly<Record<ProjectStatus, ProjectStep | null>> = {
  DRAFT: "CONFIRM_BOOKING",
  BOOKED: "START_SHOOTING",
  SHOOTING: "FINISH_SHOOTING",
  POST_PROCESSING: null,
  DELIVERED: null,
  COMPLETED: null,
  CANCELLED: null,
};
const TABS: Readonly<Record<ProjectTab, readonly ProjectStatus[]>> = {
  ACTIVE: ["DRAFT", "BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};
const NEEDS_SESSION: readonly ProjectStatus[] = ["BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED", "COMPLETED"];

/** Returns the one manual forward move a step performs (BR-PRJ-004, D-3). @param step - the requested step @returns its from and to status */
export function stepTransition(step: ProjectStep): StepTransition {
  return TRANSITIONS[step];
}
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
/** Tells whether title, notes and sessions may change (A-6, BR-TEAM-003). @param status - stored status @returns false only when CANCELLED */
export function isScheduleEditable(status: ProjectStatus): boolean {
  return status !== "CANCELLED";
}
/** Tells whether F-07 offers cancelling (BR-PRJ-010, A-10). @param status - stored status @returns true for BOOKED and SHOOTING */
export function canCancel(status: ProjectStatus): boolean {
  return status === "BOOKED" || status === "SHOOTING";
}
/** Tells whether a cancel needs a reason (BR-PRJ-004). @param status - stored status @returns true from SHOOTING */
export function cancelReasonRequired(status: ProjectStatus): boolean {
  return status === "SHOOTING";
}
/** Tells whether the project may be deleted (BR-PRJ-010). @param status - stored status @returns true only for DRAFT */
export function canDeleteDraft(status: ProjectStatus): boolean {
  return status === "DRAFT";
}
/** Tells whether the status needs at least one session (BR-TEAM-003). @param status - stored status @returns true from BOOKED on */
export function needsSession(status: ProjectStatus): boolean {
  return NEEDS_SESSION.includes(status);
}
```

**`session.schema.ts` and `session.ts`** (BR-TEAM-003, A-12):

```ts
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const codePoints = (value: string) => Array.from(value).length;
const isRealDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};
const optionalText = z.string().trim().transform((value) => (value === "" ? null : value)).nullable();

export const sessionInputSchema = z
  .object({
    name: z.string().trim().min(1, "EMPTY").refine((v) => codePoints(v) <= SESSION_NAME_MAX_LENGTH, "TOO_LONG"),
    date: z.string().min(1, "EMPTY").regex(DATE_PATTERN, "INVALID").refine(isRealDate, "INVALID"),
    startTime: z.string().regex(TIME_PATTERN, "INVALID").nullable(),
    endTime: z.string().regex(TIME_PATTERN, "INVALID").nullable(),
    location: optionalText.refine((v) => v === null || codePoints(v) <= SESSION_LOCATION_MAX_LENGTH, "TOO_LONG"),
  })
  .superRefine((session, ctx) => {
    if (session.endTime === null) return;
    if (session.startTime === null) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "END_WITHOUT_START" });
    } else if (session.endTime <= session.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "END_NOT_AFTER_START" });
    }
  });
```

```ts
/** Orders sessions by date, then start time with untimed first, then creation (BR-TEAM-003). @param a - left @param b - right @returns a sort comparison */
export function compareSessions(a: SessionRecordShape, b: SessionRecordShape): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.startTime !== b.startTime) {
    if (a.startTime === null) return -1;
    if (b.startTime === null) return 1;
    return a.startTime < b.startTime ? -1 : 1;
  }
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

/** Picks the session shown in lists and headers: the earliest from today, else the latest (A-12). @param sessions - the project's sessions @param today - YYYY-MM-DD in the schedule zone @returns the shown session or null */
export function pickShownSession(sessions: readonly SessionRecordShape[], today: string): ShownSession | null {
  const sorted = [...sessions].sort(compareSessions);
  const upcoming = sorted.find((session) => session.date >= today);
  const shown = upcoming ?? sorted.at(-1);
  if (shown === undefined) return null;
  return { session: shown, extraCount: sorted.length - 1, isPast: upcoming === undefined };
}
```

The formatters use `Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })` on `${date}T00:00:00Z`. Times replace `:` with `.`.
- `formatSessionWhen(session)` → *Sel, 10 Nov 2026 · 07.30*, or *Sel, 10 Nov 2026* when there is no time.
- `formatSessionRange(session)` → *Sel, 10 Nov 2026 · 06.30–07.15 · Rumah Rina, Depok*, dropping the missing parts.
- `formatShortDate(date)` → *10 Nov 2026*.

Assert the exact strings in tests. If `id-ID` gives a different weekday or month abbreviation than *Sel* / *Okt* / *Agu* / *Des*, map it through a named constant table instead.

**`booking-field-value.ts`** (A-3, BR-PRJ-002):

```ts
const NUMBER_PATTERN = /^-?\d+(?:[.,]\d+)?$/;
const blank = (raw: BookingValue) => raw === null || (typeof raw === "string" && raw.trim() === "");

/** Parses one booking value against its snapshotted field (A-3). @param field - snapshotted metadata @param raw - untrusted value @returns the stored value or a problem */
export function parseBookingValue(field: SnapshotField, raw: BookingValue): BookingValueResult {
  if (blank(raw)) return field.isRequired ? { ok: false, problem: "REQUIRED" } : { ok: true, value: null };
  switch (field.fieldType) {
    case "TEXT":
    case "TEXTAREA": {
      if (typeof raw !== "string") return { ok: false, problem: "INVALID" };
      const max = field.fieldType === "TEXT" ? BOOKING_TEXT_MAX_LENGTH : BOOKING_TEXTAREA_MAX_LENGTH;
      const text = raw.trim();
      return Array.from(text).length > max ? { ok: false, problem: "TOO_LONG" } : { ok: true, value: text };
    }
    case "NUMBER":
      return typeof raw === "string" && NUMBER_PATTERN.test(raw.trim())
        ? { ok: true, value: raw.trim().replace(",", ".") }
        : { ok: false, problem: "INVALID" };
    case "DATE":
      return typeof raw === "string" && isRealIsoDate(raw) ? { ok: true, value: raw } : { ok: false, problem: "INVALID" };
    case "BOOLEAN":
      return typeof raw === "boolean" ? { ok: true, value: raw } : { ok: false, problem: "INVALID" };
    case "SELECT":
      return typeof raw === "string" && (field.options ?? []).includes(raw)
        ? { ok: true, value: raw }
        : { ok: false, problem: "NOT_AN_OPTION" };
  }
}

/** Validates every snapshotted field at once; unknown keys are ignored (BR-PRJ-002). @param fields - snapshotted fields in order @param raw - untrusted values by key @returns the stored values and every problem */
export function validateFieldValues(
  fields: readonly SnapshotField[],
  raw: Readonly<Record<string, BookingValue>>,
): FieldValuesResult {
  const values: Record<string, BookingValue> = {};
  const problems: Record<string, BookingValueProblem> = {};
  for (const field of fields) {
    const result = parseBookingValue(field, raw[field.key] ?? null);
    if (result.ok) values[field.key] = result.value;
    else problems[field.key] = result.problem;
  }
  return { values, problems };
}
```

`isRealIsoDate` is the same check as `isRealDate` in `session.schema.ts`. Move it to `domain/session/calendar-date.ts` and import it from both.

**`create-project-input.schema.ts`:**

```ts
export const createProjectInputSchema = z.object({
  mode: z.enum(["DRAFT", "BOOKED"]),
  clientId: z.uuid({ error: "REQUIRED" }),
  serviceId: z.uuid({ error: "REQUIRED" }),
  title: projectTitleSchema,
  agreedPrice: agreedPriceSchema,
  notes: projectNotesSchema,
  items: z.array(z.object({ definitionId: z.uuid(), value: packageValueInputSchema })),
  sessions: z.array(sessionInputSchema),
  fieldValues: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])),
});
```

There is no `status`, `currency`, `token`, `workspaceId` or item metadata in the schema, and Zod strips unknown keys (C-004).

**`createProject` algorithm** (D-4, D-10):
1. `safeParse` the input. Collect the Zod issues as field errors, keep going, and use the partial data where it is valid.
2. If `serviceId` parsed:
   - `findServiceForSnapshot`. A `null` result throws `ProjectError("NOT_FOUND")`, which the flow turns into `notFound()` (AC-PRJ-012, other workspace).
   - `!isActive` → `serviceId: SERVICE_INACTIVE`.
   - Run `validateFieldValues(service.fields, input.fieldValues)` and add `fieldValues.<key>` errors.
3. Run `findDefinitionRules(ids of input.items)`, then `validateItemList`. An unknown ID → `items.N.definitionId: INVALID`.
4. `mode === "BOOKED"` and no session → `sessions: SESSION_REQUIRED`.
5. If any error was collected, return `VALIDATION_FAILED` with all of them (AC-PRJ-010, 011).
6. Call `createSnapshot`:
   - `status: mode === "BOOKED" ? "BOOKED" : "DRAFT"`;
   - `accessToken: generate()`, `actorId`;
   - the parsed values, with `fieldValues` = the validated `values`.
7. Map the result:
   - `CLIENT_INACTIVE` / `SERVICE_INACTIVE` → field errors;
   - `DEFINITION_INACTIVE` / `DUPLICATE_DEFINITION` → `items.N.definitionId` (index of `definitionId`);
   - `NOT_FOUND` → throw;
   - `CREATED` → `{ ok: true, projectId }`.

**`createSnapshot` in Drizzle (D-4):** one `db.transaction`:
1. `select id, archived_at from client where workspace_id = $ws and id = $clientId for share`. No row → `NOT_FOUND`; archived → `CLIENT_INACTIVE`.
2. The same for `service` (`is_active`) → `SERVICE_INACTIVE`. Then select its `service_item` definition IDs.
3. `select … from service_item_definition where workspace_id = $ws and id in (…) for share`:
   - any missing ID → `NOT_FOUND`;
   - an inactive one that isn't in the service's items → `DEFINITION_INACTIVE`;
   - a repeated ID → `DUPLICATE_DEFINITION`.
4. `select … from service_field_definition where service_id = … order by sort_order`.
5. Insert:
   - the `project` (`currency` `IDR`, `created_by` / `updated_by` = actor) `returning({ id })`;
   - the `project_item` rows in the submitted order, `sort_order` 0…n, with the name, unit, value type and selection taken from the locked definition rows;
   - one `project_field_value` per service field in `sort_order`, with `value` = the validated value or `null` (D-5);
   - the `project_session` rows.
6. Return `CREATED`.

**Token generator** (D-6):

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

**Schema:** `src/adapters/db/schema/booking/project.ts`. Follow `catalog.ts` / `client.ts`.

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
  index("project_workspace_client_ix").on(t.workspaceId, t.clientId),
  index("project_workspace_service_ix").on(t.workspaceId, t.serviceId),
  check("project_title_ck", sql`char_length(${t.title}) between 1 and 100 and ${t.title} = btrim(${t.title})`),
  check("project_notes_ck", sql`${t.notes} is null or char_length(${t.notes}) <= 2000`),
  check("project_price_ck", sql`${t.agreedPrice} >= 0 and ${t.agreedPrice} = trunc(${t.agreedPrice}) and ${t.agreedPrice} <= 999999999999`),
  check("project_currency_ck", sql`${t.currency} = 'IDR'`),
  check("project_status_ck", sql`${t.status} in ('DRAFT','BOOKED','SHOOTING','POST_PROCESSING','DELIVERED','COMPLETED','CANCELLED')`),
  check("project_token_ck", sql`${t.clientAccessToken} ~ '^[A-Za-z0-9_-]{43}$'`),
  check("project_cancel_ck", sql`(${t.status} = 'CANCELLED') = (${t.cancelledAt} is not null)`),
  check("project_cancel_reason_ck", sql`${t.cancelReason} is null or char_length(${t.cancelReason}) <= 500`),
]);

export const projectItem = pgTable("project_item", {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid("project_id").notNull(),
  definitionId: uuid("definition_id").notNull(),
  name: text("name").notNull(),
  valueType: text("value_type").notNull(),
  value: jsonb("value").notNull(),
  unit: text("unit"),
  selectionRequired: boolean("selection_required").notNull(),
  selectionType: text("selection_type"),
  sortOrder: integer("sort_order").notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  ...auditColumns(),
}, (t) => [
  tenantRef({ workspaceId: t.workspaceId, column: t.projectId }, { workspaceId: project.workspaceId, id: project.id }).onDelete("cascade"),
  tenantRef({ workspaceId: t.workspaceId, column: t.definitionId }, { workspaceId: serviceItemDefinition.workspaceId, id: serviceItemDefinition.id }).onDelete("restrict"),
  unique("project_item_definition_uq").on(t.workspaceId, t.projectId, t.definitionId),
  index("project_item_order_ix").on(t.projectId, t.sortOrder),
  check("project_item_value_type_ck", sql`${t.valueType} in ('NUMBER','RANGE')`),
  check("project_item_value_ck", sql`jsonb_typeof(${t.value}) = 'object'`),
  check("project_item_selection_ck", sql`${t.selectionRequired} = (${t.selectionType} is not null)`),
  check("project_item_selection_type_ck", sql`${t.selectionType} is null or ${t.selectionType} in ('EDIT','PRINT')`),
  check("project_item_selection_number_ck", sql`not ${t.selectionRequired} or ${t.valueType} = 'NUMBER'`),
]);

export const projectFieldValue = pgTable("project_field_value", {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid("project_id").notNull(),
  fieldKey: text("field_key").notNull(),
  fieldName: text("field_name").notNull(),
  fieldType: text("field_type").notNull(),
  isRequired: boolean("is_required").notNull(),
  options: jsonb("options"),
  value: jsonb("value"),
  sortOrder: integer("sort_order").notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  ...auditColumns(),
}, (t) => [
  tenantRef({ workspaceId: t.workspaceId, column: t.projectId }, { workspaceId: project.workspaceId, id: project.id }).onDelete("cascade"),
  unique("project_field_value_key_uq").on(t.projectId, t.fieldKey),
  check("project_field_value_type_ck", sql`${t.fieldType} in ('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT')`),
  check("project_field_value_options_ck", sql`(${t.fieldType} = 'SELECT') = (${t.options} is not null)`),
]);

export const projectSession = pgTable("project_session", {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid("project_id").notNull(),
  name: text("name").notNull(),
  sessionDate: date("session_date", { mode: "string" }).notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  location: text("location"),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  ...auditColumns(),
}, (t) => [
  tenantRef({ workspaceId: t.workspaceId, column: t.projectId }, { workspaceId: project.workspaceId, id: project.id }).onDelete("cascade"),
  index("project_session_order_ix").on(t.projectId, t.sessionDate, t.startTime, t.createdAt),
  check("project_session_name_ck", sql`char_length(${t.name}) between 1 and 100 and ${t.name} = btrim(${t.name})`),
  check("project_session_location_ck", sql`${t.location} is null or char_length(${t.location}) <= 200`),
  check("project_session_time_ck", sql`${t.endTime} is null or (${t.startTime} is not null and ${t.endTime} > ${t.startTime})`),
]);
```

Postgres returns `time` as `HH:MM:SS`. Cut it to `HH:MM` in the repository's row mapping.

### Components

- **Shared** (inventory first): `Combobox` (C36), `DateField`, `TimeField` and `Select` sections.

  ```ts
  export interface ComboboxProps<T extends { readonly id: string }> {
    readonly label: string;
    readonly placeholder: string;
    readonly items: readonly T[];
    readonly selectedId: string | null;
    readonly inputValue: string;
    readonly onInputChange: (text: string) => void;
    readonly onSelect: (id: string) => void;
    readonly renderItem: (item: T) => { readonly label: string; readonly description?: string };
    readonly groupLabel: string;                       // *KLIEN · 3 COCOK*
    readonly createLabel?: string;                     // *Tambah klien baru “Rin”*
    readonly onCreate?: (query: string) => void;       // Slice 7
    readonly description?: string;                     // helper under the field
    readonly errorMessage?: string;
    readonly isLoading?: boolean;
  }
  export interface DateFieldProps {
    readonly label: string;
    readonly value: string | null; // YYYY-MM-DD
    readonly onChange: (value: string | null) => void;
    readonly display: "date" | "weekday"; // *10 Nov 2026* / *Sel, 10 Nov 2026*
    readonly placeholder?: string;
    readonly isOptional?: boolean;
    readonly errorMessage?: string;
  }
  export interface TimeFieldProps {
    readonly label: string;
    readonly value: string | null; // HH:MM
    readonly onChange: (value: string | null) => void;
    readonly isOptional?: boolean;
    readonly errorMessage?: string;
  }
  // SelectOption gains: readonly section?: string; (options with the same section render under one Menu Group Label)
  ```

- **Feature** (`src/features/booking/ui/`):

  | Unit | Responsibility |
  |---|---|
  | `project-copy` | All copy above, desktop/phone variants |
  | `project-field-error` | `projectFieldErrorText(path, key, fieldName?)` per the Shared contracts table |
  | `create-project-screen` | Layout from the exports. Desktop: the 720 column, cards, actions right-aligned under the form. Phone: cards, then the sticky action bar with half-width buttons |
  | `use-create-project-form` | React Hook Form + `zodResolver(createProjectInputSchema)`. On service change: prefill the price (`basePrice`), items, fields (blank) and title (`defaultProjectTitle`, kept when edited; Slice 7 replaces this with `nextProjectTitle`). `submit(mode)` |
  | `client-picker` | Combobox + `useClientSearch` (250 ms debounce, `searchActiveClientsAction`). Helper = `formatWhatsappNumber(number)`, or none |
  | `service-picker` | Select with `section` = category name; helper *{kategori} · harga dasar Rp 750.000* via `formatIdr` |
  | `package-items-card` | Read-only rows (title, meta from `item-summary`) in this slice; Empty State/In card when there are none |
  | `sessions-card` + `session-dialog` | Sessions in `compareSessions` order; row meta `formatSessionRange`; dialog fields per the export; ⋯ *Ubah* / *Hapus* edit the form list |
  | `booking-fields-card` + `booking-field-input` | Inputs by type: TEXT → TextField; TEXTAREA → Textarea; NUMBER → TextField (`inputMode="decimal"`); DATE → DateField `display="date"`; BOOLEAN → radio *Ya* / *Tidak* (`// not in Pencil`, no default); SELECT → Select with the placeholder *Pilih {field}* (export: *Pilih ukuran* `// not in Pencil` for others) |

### Steps

- [ ] **1.1 Domain rules.**
  - **Tests first:** `project-status.test.ts`, `project-record.test.ts`, `session.test.ts`, `booking-field-value.test.ts`, `project-items.test.ts`, `schedule-clock.test.ts`:
    - the status tables (every function, every status);
    - title: `" "` → `EMPTY`, 101 chars → `TOO_LONG`;
    - notes: 2001 → `TOO_LONG`;
    - price: `-1` → `NEGATIVE`, `10,5` → `NOT_WHOLE`, `1.000.000.000.000` → `TOO_LARGE`, `Rp 700.000` → `"700000"` (AC-PRJ-011);
    - `defaultProjectTitle("Wisuda Basic","Rina")` → *Wisuda Basic — Rina* (AC-PRJ-007);
    - the session error table (AC-PRJ-029): no name, no date, 101-char name, 201-char location, end without start, 07:30 → 07:00;
    - `compareSessions` and `pickShownSession` with the fixture (*Prewed Dewi* → 2026-10-20 + `extraCount 1`; *Family Tono* → `isPast`; none → `null`);
    - the formatters' exact strings;
    - `validateFieldValues`: Nama kampus empty → `REQUIRED`, Ukuran toga `XL` → `NOT_AN_OPTION`, empty optional → `null`, all problems collected (AC-PRJ-010);
    - `validateItemList` (AC-PRJ-017 errors);
    - `todayInScheduleZone(new Date("2026-10-01T18:30:00Z"))` → `"2026-10-02"`.
  - **Implement** with the rule code.
  - Commit `feat(projects): add project, session, booking value and item rules`.
- [ ] **1.2 Schema and migration 0009.**
  - Write `project.ts`, add `export * from "./booking/project";` to `schema/index.ts` (match the existing line style), then `pnpm db:generate`.
  - Rename the output to `0009_project.sql` and keep the journal `tag` in step.
  - Review it: four `CREATE TABLE`, constraints, indexes, no `DROP` or `RENAME`.
  - `pnpm typecheck`.
  - Commit `feat(projects): add project tables and migration 0009`.
  - `pnpm db:migrate`; paste the output into the step report.
- [ ] **1.3 Create backend.**
  - **Tests first:**
    - `create-project.test.ts`, `load-create-options.test.ts`, `search-active-clients.test.ts` (fakes + fixture):
      - BOOKED without a session → `sessions: SESSION_REQUIRED`; DRAFT without one → created (AC-PRJ-029);
      - title + Nama kampus + price all reported together (AC-PRJ-010, 011);
      - a `status` key in the input is ignored;
      - the token comes from the generator, and the result is `{ ok, projectId }` only (AC-PRJ-008);
      - active services grouped by category, *Prewed Lama* absent (AC-PRJ-006);
      - ≤ 8 active clients, *Budi* absent.
    - `web-crypto-access-token-generator.test.ts`: the pattern; 1,000 distinct values.
    - `tests/integration/booking/project-repository.test.ts`:
      - the AC-PRJ-008 create writes 1 project, 2 items, 3 field values (*Ukuran toga* `value` null) and 1 session in one transaction; `IDR`; 43-char token; tokens differ;
      - archived client / service → `CLIENT_INACTIVE` / `SERVICE_INACTIVE`, 0 rows (AC-PRJ-012);
      - workspace B's service → `NOT_FOUND`;
      - `findDetail` has no `clientAccessToken` key;
      - after a create, F-06 `delete(client)` and F-05 `delete(service)` / `delete(definition)` → `IN_USE` (AC-PRJ-024).
    - `project-flow.test.ts`:
      - a malformed project ID → `notFound()`;
      - an unexpected error logs `project.save_failed` with `{ workspaceId, operation }` only.
    - `projects.test.ts`: `createProjectAction` revalidates `/w/[workspaceId]/projects` (layout) only when `ok`.
    - Owner shell test: the CTA pushes `/w/<id>/projects/new`; `new-project` is not coming soon.
  - **Implement** every file in the Backend table, plus the two placeholder pages.
  - Commit `feat(projects): add the project create backend`.
- [ ] **1.4 Shared fields.**
  - Read `component-inventory.md`, then build or extend `Combobox`, `DateField`, `TimeField` and `Select` sections.
  - **Tests** (`*.test.tsx`):
    - Combobox: typing calls `onInputChange`; the group label; Arrow keys + Enter select; Escape closes; the menu renders inline at 390 width;
    - DateField: both displays; a day pick sets an ISO string; the error state;
    - TimeField: `07.30` ↔ `"07:30"`;
    - Select: sections render group labels.
  - One story each (ADR-014).
  - Add `@internationalized/date` to `package.json`, pinned to the version `react-aria-components` 1.21.1 already resolves (see `pnpm why @internationalized/date`).
  - Commit `feat(ui): add combobox, date and time fields and select sections`.
- [ ] **1.5 The screen.**
  - **Precondition:** the 18 Slice 1 exports exist.
  - **Tests first:** `create-project-screen.test.tsx`, `use-create-project-form.test.ts`, `client-picker.test.tsx`, `service-picker.test.tsx`, `sessions-card.test.tsx`, `booking-field-input.test.tsx`. Each behaviour in the state table, plus:
    - the picker items read *{formatted number} · {n} proyek* or *Belum ada nomor WhatsApp*;
    - picking a service fills the title, price, helpers, items and fields in order (AC-PRJ-007);
    - an edited title survives a client change (AC-PRJ-007);
    - no items → Empty State; no fields → no card;
    - the session dialog's error table, and sessions in order;
    - BOOKED without a session → the error line under *Jadwal*;
    - the pending label on the pressed button only;
    - field errors back on their fields;
    - a thrown action → the danger toast with *Coba lagi* re-submitting, and the input kept;
    - success → `router.push("/w/<id>/projects/<projectId>?state=created")` or `?state=draft-saved`.
  - **Implement**, then compare all 18 exports at 1440 and 390.
  - Commit `feat(projects): add the create project screen`.

**Done check:**
- In the browser, the phone CTA and `/w/<id>/projects/new` open the form.
- *Rina* + *Wisuda Basic* + a session + the fields + *Buat proyek* lands on the placeholder detail with the toast *Proyek dibuat*.
- *Simpan draf* with no session lands there with *Draf disimpan*.
- The gate, `pnpm test:integration` and `pnpm build` pass.

---

## Slice 2: Detail — read and status steps

### Screen overview

| | |
|---|---|
| Screens | S3 (one view per status, step pending, toasts) |
| Route | `/w/[workspaceId]/projects/[projectId]` (sub-page) |
| ACs | AC-PRJ-009 (confirm), 015, 016, 018 (display), 020, 021, 025 (detail, step) |
| Out of this slice | the ⋯ menu (Slice 5; nothing is rendered in its place until then); the card edit controls (*Ubah info* Slice 5; *Tambah item*, item ⋯, *Ubah* field booking, *Tambah sesi*, session ⋯ Slice 6). This slice renders the cards **without** edit controls. Slices 5 and 6 add them only where the status allows. *Dibatalkan* is checked with an integration-seeded cancelled project; the cancel UI arrives in Slice 5. |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Dibooking | `detail-dibooking-desktop-X5y4S3` | `detail-dibooking-mobile-hLX50` | Header: title + chip *Dibooking* + meta *Rina · Sesi berikutnya Sel, 10 Nov 2026 · 06.30 · Rumah Rina, Depok · +1 sesi*; step *Mulai pemotretan* (`camera`). Cards: *Info* facts (*Klien* *Rina · +62 812-3456-7890*, *Layanan*, *Harga sepakat* *Rp 700.000*, *Catatan internal*), *Isi paket* (*Disalin dari Wisuda Basic. Bisa diubah sampai pemotretan dimulai.*), *Jadwal* (*Sesi pemotretan, urut tanggal.*), *Field booking* (*Disalin dari Wisuda Basic saat proyek dibuat.*, facts; *Ukuran toga* *—* muted). Phone: Compact Bar title + parent *Proyek*, header block (chip + *Sesi berikutnya …* without the client), cards, sticky bar with the full-width step |
| Draf | `detail-draf-desktop-C8AhE3` | `detail-draf-mobile-L72PK` | Chip *Draf*, meta *Rina · Belum ada jadwal*, step *Konfirmasi booking* (`calendar-check`). *Jadwal* Empty State (*Belum ada sesi* · *Tambahkan minimal satu sesi sebelum konfirmasi booking.*) |
| Pemotretan | `detail-pemotretan-desktop-D8RE2` | `detail-pemotretan-mobile-X2DGk` | Chip *Pemotretan*, step *Selesai pemotretan* (`circle-check-big`). *Isi paket* / *Field booking* description *Terkunci sejak pemotretan dimulai.* |
| Pascaproduksi | `detail-pascaproduksi-desktop-q70gHf` | `detail-pascaproduksi-mobile-bBSyL` | Chip *Pascaproduksi*, meta *Rina · Sesi terakhir Sel, 10 Nov 2026 · 07.30 · Balairung UI, Depok*, no step (phone: no sticky bar), locked descriptions |
| Dibatalkan | `detail-dibatalkan-desktop-syy8h` | `detail-dibatalkan-mobile-y3p2K` | Chip *Dibatalkan*, no step. Alert/Warning first in the column (phone: after the header block): *Proyek dibatalkan* · *Dibatalkan oleh {nama} pada {Rab, 4 Nov 2026}. Alasan: {alasan}.* (without a reason: *Dibatalkan oleh {nama} pada {tanggal}.* `// not in Pencil`). *Isi paket* / *Jadwal* / *Field booking* description *Proyek dibatalkan, tidak bisa diubah.* |
| Step pending | `detail-status-pending-desktop-h5LJT` | `…-mobile-YT1bd` | Step → Button/Primary Loading *Mulai pemotretan…* |
| Toast created | `detail-toast-dibuat-desktop-E5tDH` | `…-mobile-cKFVl` | Toast/Success *Proyek dibuat* · *{judul} sudah Dibooking.* (draft: *Draf disimpan* · *{judul} tersimpan sebagai draf.* `// not in Pencil`) |
| Toast step | `detail-toast-status-berubah-desktop-UAtGk` | `…-mobile-HOrnO` | Toast/Success per the step table in Shared contracts |

### Backend

| File | Content |
|---|---|
| `ProjectRepositoryPort` (+) | `moveStatus(context, id, transition, actorId)` → `"MOVED" \| "STALE" \| "NOT_FOUND"`; `countSessions(context, id)` → `number \| null` (null = not found) |
| `findDetail` (Drizzle) | Explicit columns. Join `client`, `service` and `user` (for `cancelled_by` → `byName`). Items and fields in `sort_order`, sessions in `compareSessions` order (`order by session_date, start_time nulls first, created_at`). Parse the JSONB with `packageValueInputSchema`-compatible parsing and the `BookingValue` shape; a parse failure throws |
| `moveStatus` (Drizzle) | `update project set status = $to, updated_by = $actor, updated_at = now() where workspace_id = $ws and id = $id and status = $from returning id`. No row → `select 1 … where workspace_id and id` decides `STALE` or `NOT_FOUND` |
| `application/schemas/project-step/project-step.schema.ts` | `projectStepSchema = z.enum(["CONFIRM_BOOKING","START_SHOOTING","FINISH_SHOOTING"])` |
| `get-project-detail` (+) | Returns `ProjectDetailView`: the record plus `shownSession` (`pickShownSession(sessions, today)`), `nextStep`, `canEditDeal = isDealEditable`, `canEditSchedule = isScheduleEditable` and `canEditInfo = isScheduleEditable` |
| `advance-project` | Parse the step (invalid → `ProjectError("NOT_FOUND")`, so a forged body gets not-found). For `CONFIRM_BOOKING`, `countSessions === 0` → `SESSION_REQUIRED`. `moveStatus(stepTransition(step))`: `STALE` → `{ ok:false, code:"STALE" }`; `NOT_FOUND` → throw |
| `project-flow` (+) | `loadProjectDetail` returns the view (with `today` from `todayInScheduleZone(now())`); `advanceProjectEntry(rawWs, rawId, step: unknown)` |
| `projects.ts` (+) | `advanceProjectAction(workspaceId, projectId, step)` → `ProjectWriteResult` |
| `projects/[projectId]/{page,loading}.tsx` | Read `?state=created \| draft-saved` → `ToastOnMount`. `PageHeadingOverride` with title, parent *Proyek* → `/w/{id}/projects`, plus `status` and `meta` (below). Render `ProjectDetailScreen` |

**Shell extension** (from the inventory):
- `PageHeadingOverrideValue` gains `status?: { label: string; tone: StatusChipTone; hasDot?: boolean }` and `meta?: string`.
- `owner-shell` passes them to `PageHeader`, which gains `titleAdornment?: ReactNode` (the Status Chip after the title, `space/3` gap) and `meta?: string` (rendered in place of the subtitle).
- On phones, the screen renders the chip and meta in its own header block (export), because the Compact Bar has no room.

### Components

- **Shared:** the `PageHeader` / `PageHeadingOverride` extension above; `StatusChip` `hasDot`; Button Primary pending (`isPending` → Loading variant with the `loader-circle` icon).
- **Feature:**

  | Unit | Responsibility |
  |---|---|
  | `project-status-chip` | `ProjectStatusChip({ status })` per the tone table |
  | `project-session-summary` | `projectMetaText(clientName, shown)` → *Rina · Sesi berikutnya {formatSessionWhen} · {location} · +n sesi* / *Rina · Sesi terakhir …* / *Rina · Belum ada jadwal*; the phone variant drops *Rina · * |
  | `project-detail-screen` | Cards from the exports. Desktop step: `<PageActions><Button …/></PageActions>`. Phone: sticky bottom bar (the same layout as the create action bar), hidden when `nextStep === null` |
  | `use-project-actions` | `advance(step)` calls the action, `router.refresh()` and shows the step toast. `STALE` → Toast/Danger *Status proyek sudah berubah* (`// not in Pencil` body: *Halaman dimuat ulang dengan data terbaru.*) + refresh. `SESSION_REQUIRED` → Toast/Danger *Tambahkan minimal satu sesi sebelum konfirmasi booking.* (Slice 6 also opens *Tambah sesi*). A thrown error → *Perubahan belum tersimpan* + *Coba lagi* |

### Steps

- [ ] **2.1 Detail and step backend.**
  - **Tests first:**
    - `get-project-detail.test.ts`: the flags for all 7 statuses; the shown session with the injected `today` (AC-PRJ-015, 018);
    - `advance-project.test.ts`: no session → `SESSION_REQUIRED`; stored ≠ from → `STALE`; from CANCELLED → `STALE`; an invalid step → throws not-found (AC-PRJ-009, 020, 021);
    - integration:
      - `Promise.all` of two `moveStatus(START_SHOOTING)` → `["MOVED","STALE"]` in some order;
      - the catalog edits in AC-PRJ-016 after a create, then `findDetail` is unchanged;
      - workspace B → `null` / `NOT_FOUND` (AC-PRJ-025);
      - a seeded cancelled project returns `cancellation.byName`.
  - **Implement.**
  - Commit `feat(projects): add project detail and status steps backend`.
- [ ] **2.2 Detail screen.**
  - **Precondition:** the 16 Slice 2 exports.
  - **Tests first:** `project-detail-screen.test.tsx`, `project-session-summary.test.ts`, `use-project-actions.test.ts`, the `page-header` test. Every row of the state table, plus:
    - the step button's icon and label per status;
    - pending disables the button and shows the Loading label;
    - `?state=created` shows the toast once (`dedupeKey` `project-created:<id>`).
  - **Implement**, then compare the 16 exports.
  - Commit `feat(projects): add the project detail page`.
- [ ] **2.3 E2E.** Create `tests/e2e/projects/projects.spec.ts` with helpers `createWorkspace`, `seedCatalog` (through the services UI, like `catalog.spec.ts`) and `createClientViaUi` (F-06 UI). Journeys:
  - create a booked project → detail with *Proyek dibuat* → *Mulai pemotretan* (toast) → *Selesai pemotretan* → no step;
  - save a draft → *Konfirmasi booking* without a session shows the session-required toast.

  Commit `test(projects): cover create and status steps end to end`.

**Done check:** a project from Slice 1 opens with every card. It steps to *Pascaproduksi* with toasts. A second tab's stale step shows *Status proyek sudah berubah* and refreshes. The gate, integration, build and E2E pass.

---

## Slice 3: List

### Screen overview

| | |
|---|---|
| Screens | S1 |
| Routes | `/w/[workspaceId]/projects` (*Aktif*), `/projects/completed` (*Selesai*), `/projects/cancelled` (*Dibatalkan*), each with `?q=` |
| ACs | AC-PRJ-001, 002, 003, 004, 005, 025 (list) |
| Out of this slice | the filter button (Slice 4); the row ⋯ (Slice 5: the actions column renders nothing until then) |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Aktif | `list-aktif-desktop-sn4a4` | `list-aktif-mobile-liVLL` | Page *Proyek*, subtitle (desktop / phone variant), hero action *Proyek baru* (`plus`). Tabs *Aktif · Selesai · Dibatalkan* (desktop Page Header tabs; phone Segmented Control full width as the first content item). Table card *Daftar proyek* + *12 proyek aktif*, search *Cari judul atau nama klien* (320). Columns PROYEK · ACARA · STATUS · ⋯. Phone: list card *Daftar proyek* + count + *Baru* (Primary), rows *title* / *{client} · 10 Nov 2026* + chip + ⋯; *Muat lebih banyak* below |
| Selesai | `list-selesai-desktop-u0Ck6F` | `list-selesai-mobile-gY8l7` | Same, *{n} proyek selesai*, chips *Selesai* (no dot), latest first |
| Dibatalkan | `list-dibatalkan-desktop-o2T7OP` | `list-dibatalkan-mobile-H3gsoo` | *{n} proyek dibatalkan* |
| Empty Aktif | `list-empty-aktif-desktop-tHeNM` | `list-empty-aktif-mobile-V4TEva` | *0 proyek aktif*; Empty State *Belum ada proyek* · *Buat proyek untuk mencatat klien, layanan, dan harga yang kamu sepakati.* + *Proyek baru* |
| Empty Selesai | `list-empty-selesai-desktop-O4N4XM` | `…-mobile-CyTsk` | *Belum ada proyek yang selesai* · *Proyek pindah ke sini setelah hasil akhirnya dikirim dan diselesaikan.* (no button) |
| Empty Dibatalkan | `list-empty-dibatalkan-desktop-fXKf8` | `…-mobile-GCYv0` | *Belum ada proyek yang dibatalkan* · *Proyek yang kamu batalkan muncul di sini, lengkap dengan alasannya.* |
| No match | `list-no-match-desktop-Q5PE55` | `…-mobile-RVzmE` | Query *andra* in the field; *Tidak ada proyek yang cocok* · *Coba judul lain, atau ketik sebagian nama klien.* + *Hapus pencarian*; the count stays the tab total |
| Loading | `list-loading-desktop-v1y9at` | `…-mobile-dE780` | Header row + skeleton rows (DataTableSkeleton / List Card Item Skeleton); no count |
| Loading more | `list-loading-more-desktop-rJ0pj` | `…-mobile-ijrVe` | Appended rows, the footer button pending *Memuat…* |

### Backend

| File | Content |
|---|---|
| `domain/project-list-query/*` | `PROJECT_PAGE_SIZE`, `PROJECT_SEARCH_MAX_LENGTH`; `projectSearchSchema` (trim; blank or > 100 → `null`, list unfiltered) |
| `application/ports/project-list-reader/*` | `listPage(context, query: { tab; search: string \| null; filter: ProjectFilter \| null; afterId: string \| null; limit; today })` → `ProjectListRow[]`; `count(context, tab)` → `number` |
| `application/schemas/project-list-query/*` | `projectListQuerySchema = z.object({ tab: z.enum(["ACTIVE","COMPLETED","CANCELLED"]), q: z.string().default(""), afterId: z.uuid().nullable() })` (Slice 4 adds the filter) |
| `list-projects` / `count-projects` | `limit = PROJECT_PAGE_SIZE + 1`; return `{ items: first 30, nextCursor: items[29].id or null }` |
| `adapters/db/project-repository/shown-session-sql.ts` + `drizzle-project-list-reader.ts` | SQL below |
| `project-flow` (+) | `loadProjects(rawWs, tab, rawQ)` → `{ tab, query, page, count }`; `loadMoreProjectsEntry(rawWs, query: unknown)` |
| `projects.ts` (+) | `loadMoreProjectsAction(workspaceId, query)` |
| Routes | `projects/page.tsx` (replace the placeholder), `projects/completed/page.tsx`, `projects/cancelled/page.tsx`, a `loading.tsx` each |
| `coming-soon-sections` | Remove `"projects"` |
| `owner-nav.tsx` | `resolveProjectsHeading`, like `resolveServicesHeading`: title *Proyek*, subtitle (desktop copy), tabs *Aktif · Selesai · Dibatalkan* (`OWNER_NAV_COPY.projectTabs`), active by path; `/projects/new` and `/projects/<uuid>` return the sub-page heading (no tabs). `resolveActiveNav` keeps *Proyek* active on every `/projects/*` |

**List SQL** (D-8). Build it with Drizzle's `sql` template. `$today` is a bound `date` parameter, and `dir` is `ASC` for `ACTIVE` and `DESC` otherwise.

```sql
with base as (
  select p.id, p.title, p.status, p.created_at, p.client_id, c.name as client_name,
         c.whatsapp_number as client_whatsapp, s.name as service_name,
         shown.id as s_id, shown.name as s_name, shown.session_date as s_date,
         shown.start_time as s_start, shown.end_time as s_end, shown.location as s_location,
         shown.created_at as s_created,
         (select count(*) from project_session x where x.project_id = p.id)::int as session_count
  from project p
  join client c on c.workspace_id = p.workspace_id and c.id = p.client_id
  join service s on s.workspace_id = p.workspace_id and s.id = p.service_id
  left join lateral (
    select * from (
      (select ps.*, 0 as bucket from project_session ps
        where ps.project_id = p.id and ps.session_date >= $today
        order by ps.session_date, ps.start_time nulls first, ps.created_at limit 1)
      union all
      (select ps.*, 1 as bucket from project_session ps
        where ps.project_id = p.id and ps.session_date < $today
        order by ps.session_date desc, ps.start_time desc nulls last, ps.created_at desc limit 1)
    ) candidates order by bucket limit 1
  ) shown on true
  where p.workspace_id = $ws and p.status in ($tabStatuses)
    -- search: and (p.title ilike $pattern escape '\' or c.name ilike $pattern escape '\')
    -- filter predicates: Slice 4
)
select * from base
-- cursor: where (base.s_date is null, …) is after the cursor row, see below
order by (s_date is null), s_date ${dir}, created_at desc, id
limit $limit
```

**Cursor predicate**, with `cur` = the same `base` CTE filtered to `id = $afterId`. If there is no row, start from the beginning.

```sql
( (base.s_date is null)::int > (cur.s_date is null)::int )
or ( (base.s_date is null) = (cur.s_date is null) and (
      (base.s_date is not null and base.s_date ${dir === "ASC" ? ">" : "<"} cur.s_date)
   or (base.s_date is not distinct from cur.s_date and (
         base.created_at < cur.created_at
      or (base.created_at = cur.created_at and base.id > cur.id)))))
```

The search pattern is `%${escaped}%`, where `escaped` replaces `\` with `\\`, `%` with `\%` and `_` with `\_`. The count is `select count(*) from project where workspace_id = $ws and status in ($tabStatuses)` and ignores the search.

### Components

- **Shared:** `DataTable` / `DataTableSkeleton` (F-06), Page Header tabs (shell), `SegmentedControl` `isFullWidth`, Input search with the `x` clear action, EmptyState, ListCardItem Two-line, Button Secondary pending.
- **Feature:**

  | Unit | Responsibility |
  |---|---|
  | `projects-screen` | Desktop/phone switch; holds the appended pages; *Proyek baru* via `PageActions` on desktop |
  | `projects-table` | DataTable columns `PROYEK` (fill) · `ACARA` (240) · `STATUS` (124) · actions (32), column gap 16 (design.md SP5 exception). PROYEK cell: a link wrapping the title (≤ 2 lines, `line-clamp-2`) and *client · service* (1 line, `truncate`) to `/w/{id}/projects/{projectId}`. ACARA: `formatSessionWhen` / location + *· +n sesi* (after the date when there is no location) / *Belum ada jadwal* in `text.muted`. STATUS: `ProjectStatusChip` |
  | `project-list` | Section Card Compact/Flush *Daftar proyek* + count + *Baru* (Button Primary `plus`, links to `/projects/new`); rows title (truncate) + *{client} · {formatShortDate}* / *{client} · Belum ada jadwal* + chip |
  | `projects-tabs-bar` | Phone Segmented Control that navigates (follow `catalog-tabs-bar`) |
  | `project-search-field` | 300 ms debounce, `router.replace` with `?q=`, keeps other params; clear `x` *Hapus pencarian* |
  | `projects-empty-state` | The four empty and no-match states per the table |
  | `projects-skeleton` | `loading.tsx` content |
  | `use-load-more-projects` | Appends `loadMoreProjectsAction` pages; resets when the tab, `q` or the server data changes; the footer shows *Muat lebih banyak* / pending *Memuat…* |

Copy: count *{n} proyek aktif* / *{n} proyek selesai* / *{n} proyek dibatalkan* (hidden while loading). Tab labels *Aktif* / *Selesai* / *Dibatalkan*.

### Steps

- [ ] **3.1 List query.**
  - **Tests first** (`tests/integration/booking/project-list.test.ts`, the five AC-PRJ-001 projects, `today = "2026-10-02"`):
    - *Aktif* = *Prewed Dewi*, *Wisuda Rina*, *Wisuda Sari*, with the shown session and count;
    - *Selesai* / *Dibatalkan* each have their project; with extra projects the latest date comes first and no-session projects come last (AC-PRJ-002);
    - `rina` → *Wisuda Rina* only; `%` matches nothing extra; *Selesai* doesn't see *Aktif* projects (AC-PRJ-004);
    - 65 projects → 30 / 30 / 5, ordered, no duplicates (AC-PRJ-005);
    - counts 3 / 1 / 1;
    - workspace B sees nothing.

    Unit: `list-projects.test.ts`, the 31 → 30 + cursor rule.
  - **Implement.**
  - Commit `feat(projects): add the project list query`.
- [ ] **3.2 List screen.**
  - **Precondition:** the 18 Slice 3 exports.
  - **Tests first:** `projects-table.test.tsx`, `project-list.test.tsx`, `project-search-field.test.tsx`, `projects-empty-state.test.tsx`, `use-load-more-projects.test.ts`, the `owner-nav` test. Every state row, plus:
    - only the PROYEK text is a link;
    - the tabs navigate and keep no `q`;
    - the search debounce writes the URL;
    - *Hapus pencarian* clears `q`;
    - load more appends and resets;
    - `projects` and `new-project` are not coming soon.
  - **Implement**, then compare the 18 exports.
  - Commit `feat(projects): add the project list`.
- [ ] **3.3 E2E.** Add to `projects.spec.ts`:
  - two projects appear in *Aktif* in date order;
  - tabs;
  - search *rina* + reload keeps `?q=`;
  - a fresh workspace shows *Belum ada proyek*.

  Commit `test(projects): cover the project list end to end`.

**Done check:** Slice 1–2 projects show in the right tab and order. Search, tabs and *Muat lebih banyak* work at both widths. The gate, integration, build and E2E pass.

---

## Slice 4: Filter

### Screen overview

| | |
|---|---|
| Screens | S1a, plus the filter button and the filtered list on S1 |
| ACs | AC-PRJ-028 (A-11) |
| Out of this slice | nothing else on S1a |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Filter open | `filter-modal-desktop-e1VJF` | `filter-sheet-mobile-ITvcM` | Modal MD / Bottom Sheet Form *Filter proyek* · *Berlaku untuk tab Aktif.* Fields, in order: *Status* (MultiSelect, value *Dibooking, Pemotretan*); *Jadwal* group label with *Dari* (*1 Okt 2026*) and *Sampai* (*30 Nov 2026*) side by side (DateField `display="date"`) and Checkbox *Sertakan proyek tanpa jadwal*; *Layanan* (MultiSelect, placeholder *Semua layanan*); *Klien* (Combobox, placeholder *Semua klien*). Footer: desktop *Reset* (Secondary) then *Terapkan* (Primary); phone *Terapkan* above *Reset*, both full width |
| Filter applied | `list-filter-diterapkan-desktop-KLoPc` | `list-filter-diterapkan-mobile-VJ6Li` | The filter button (Icon Button Outline `list-filter`, right of the search; on phones right of the search in the controls row) with a red Count Badge *2*; the list filtered; the count still the tab total |

### Backend

**URL grammar** (A-11, D-7). Every key is optional, and a malformed part is dropped silently:

| Key | Format | Meaning |
|---|---|---|
| `status` | CSV of `DRAFT,BOOKED,SHOOTING,POST_PROCESSING,DELIVERED` | status `IN`; **ignored outside *Aktif*** |
| `from`, `to` | `YYYY-MM-DD` | any session dated within `[from, to]` (inclusive; open-ended when one is missing). On load, `to < from` drops both |
| `noSchedule` | `1` | with `from` / `to`, also include projects with no sessions; ignored when neither date is set |
| `service` | CSV of uuids | `service_id IN` (archived services allowed) |
| `client` | uuid | `client_id =` |

**Rule code** (`domain/project-list-query/project-list-filter.ts`):

```ts
export interface ProjectFilter {
  readonly statuses: readonly ProjectStatus[];
  readonly from: string | null;
  readonly to: string | null;
  readonly includeNoSchedule: boolean;
  readonly serviceIds: readonly string[];
  readonly clientId: string | null;
}

/** Counts the active filter groups shown on the red badge: Status, Jadwal, Layanan, Klien (A-11). @param filter - parsed filter @param tab - the selected tab @returns 0–4 */
export function activeFilterGroupCount(filter: ProjectFilter, tab: ProjectTab): number {
  const status = tab === "ACTIVE" && filter.statuses.length > 0;
  const schedule = filter.from !== null || filter.to !== null;
  return [status, schedule, filter.serviceIds.length > 0, filter.clientId !== null].filter(Boolean).length;
}
```

`parseProjectListParams(params: Readonly<Record<string, string | string[] | undefined>>, tab: ProjectTab)` → `{ q: string | null; filter: ProjectFilter }` applies the grammar above. `filterFormSchema` (the dialog) reports `to < from` as `to: "TO_BEFORE_FROM"` and applies nothing.

**SQL predicates**, added to the `base` CTE of Slice 3:

```sql
and ($statuses::text[] is null or p.status = any($statuses))
and ($serviceIds::uuid[] is null or p.service_id = any($serviceIds))
and ($clientId::uuid is null or p.client_id = $clientId)
and ( ($from::date is null and $to::date is null)
   or exists (select 1 from project_session f where f.project_id = p.id
              and ($from::date is null or f.session_date >= $from)
              and ($to::date is null or f.session_date <= $to))
   or ($includeNoSchedule and not exists (select 1 from project_session g where g.project_id = p.id)) )
```

Bind an empty list as `null`. `count` ignores the filter (A-11).

| File | Content |
|---|---|
| `projectListQuerySchema` (+) | `filter` field (the parsed `ProjectFilter`) |
| `ProjectRepositoryPort` (+) | `listServicesForFilter(context)` → `{ id, name, isActive }[]` by name; `searchClientsForFilter(context, text, limit)` → `{ id, name, isArchived }[]` (active and archived, TD-A-4) |
| `load-filter-options` | Use case, ≤ 8 clients per query |
| `project-flow` / `projects.ts` (+) | `loadProjects` parses the filter from the search params; `searchFilterClientsAction(workspaceId, query)` |

### Components

- **Shared** (inventory first):
  - `Checkbox` (C05);
  - `MultiSelect` (C20): `label`, `options: { id, label }[]`, `selectedIds`, `onChange`, `placeholder`, value summary joined with `, `;
  - `IconButton` `badgeCount?: number`: renders Count Badge/Danger at the top right when `> 0`; the accessible name becomes *Filter, {n} aktif* (`// not in Pencil`).
- **Feature:** `project-filter-dialog`.
  - Opens from the button with the current URL filter.
  - *Status* shows only on *Aktif*. Its placeholder is *Semua status* (`// not in Pencil`), and its options are the five labels in the status table.
  - The description on the other tabs is *Berlaku untuk tab {Selesai\|Dibatalkan}.* (`// not in Pencil`).
  - Client options show *{nama} (diarsipkan)* for archived clients (`// not in Pencil`).
  - *Terapkan* validates, then `router.replace` with the new params (keeping `q`, dropping the paging) and closes.
  - *Reset* clears the filter params and closes.
- The no-match state's *Hapus pencarian* now also clears the filter params (A-11).

### Steps

- [ ] **4.1 Filter query.**
  - **Tests first:**
    - `project-list-filter.test.ts`:
      - the grammar table: unknown statuses dropped, a malformed uuid dropped, `to < from` → both dropped on load;
      - the badge count on each tab (*Selesai* ignores the status);
      - `filterFormSchema` `TO_BEFORE_FROM`.
    - `project-list.test.ts` (integration), with the AC-PRJ-001 data:
      - `status=BOOKED,SHOOTING` + `from=2026-10-01` + `to=2026-11-30` → *Prewed Dewi*, *Wisuda Rina* (AC-PRJ-028);
      - `noSchedule=1` adds *Wisuda Sari*;
      - the service and client filters;
      - the counts are unchanged.
  - **Implement.**
  - Commit `feat(projects): add project list filters`.
- [ ] **4.2 Shared filter controls.**
  - Read the inventory, then build or extend `Checkbox`, `MultiSelect` and the `IconButton` badge.
  - **Tests:** keyboard toggling, labels, the badge's accessible name, disabled.
  - One story each.
  - Commit `feat(ui): add checkbox, multi-select and icon button badge`.
- [ ] **4.3 Filter dialog.**
  - **Precondition:** the 4 Slice 4 exports.
  - **Tests first** (`project-filter-dialog.test.tsx`, `projects-table.test.tsx` +):
    - every state row;
    - *Terapkan* writes exactly `?status=BOOKED,SHOOTING&from=2026-10-01&to=2026-11-30` (plus `q` when present);
    - *Reset* removes them;
    - `to < from` shows the error and doesn't navigate;
    - the badge reads 2;
    - *Status* is hidden on *Selesai*;
    - *Hapus pencarian* clears the filters too.
  - **Implement**, then compare.
  - Commit `feat(projects): add the project filter dialog`.

**Done check:** AC-PRJ-028 in the browser at 1440 and 390, including reloading with the filter in the URL. The gate and integration pass.

---

## Slice 5: Row menu and project dialogs

### Screen overview

| | |
|---|---|
| Screens | S1b, S3a, plus the ⋯ on S3 (desktop Page Header, phone Compact Bar) |
| ACs | AC-PRJ-022, 023, 027; AC-PRJ-017/018 for title, notes and price |
| Out of this slice | item, field-booking and session edits (Slice 6) |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Row menu (BOOKED) | `list-row-menu-desktop-E3eVH` | `list-row-actions-sheet-mobile-EWFc5` | Desktop Action Menu SM open on *Wisuda Basic — Rina*: *Mulai pemotretan* (`camera`), *Ubah info* (`pencil`), divider, group label *KIRIM KE KLIEN*, *Chat WhatsApp* (`message-circle`), divider, *Batalkan proyek* (`circle-x`, destructive). Phone Bottom Sheet/Actions: title *Wisuda Basic — Rina*, meta *Rina · 10 Nov 2026 · Dibooking*, the same items, with the local group label |
| Ubah info | `detail-ubah-info-desktop-wExLM` | `detail-ubah-info-mobile-fbF7C` | Modal MD / Sheet Form *Ubah info* · *Judul, harga sepakat, dan catatan proyek.* · *Judul proyek* · *Harga sepakat* (`Rp` prefix; helper *Harga dasar layanan: Rp 750.000*) · *Catatan internal (opsional)* (Textarea) · *Batal* / *Simpan* |
| Ubah info, price locked | `detail-ubah-info-harga-terkunci-desktop-W1tKw` | `…-mobile-RJoq9` | Description *Judul dan catatan masih bisa diubah.*; *Harga sepakat* is Text Field/Disabled with the helper *Terkunci sejak pemotretan dimulai.* |
| Cancel, reason required | `detail-batalkan-proyek-alasan-wajib-desktop-o7Uhi0` | `…-mobile-A0cZN` | Modal MD *Batalkan proyek?* · *Proyek pindah ke Dibatalkan dan tidak bisa diubah lagi.* · Textarea *Alasan pembatalan* (placeholder *Contoh: klien membatalkan karena jadwal berubah*) with the error *Isi alasan pembatalan. Wajib setelah pemotretan dimulai.* · *Kembali* / *Batalkan proyek* (Danger). Phone: sheet with the full-width Danger button. In BOOKED the label reads *Alasan pembatalan (opsional)* with no error (`// not in Pencil`) |
| Delete draft | `detail-hapus-draf-desktop-iRCuz` | `detail-hapus-draf-mobile-VORis` | Modal SM *Hapus draf “{judul}”?* · *Draf beserta isi paket, jadwal, dan field booking-nya dihapus permanen.* · *Batal* / *Hapus draf* (Danger). Phone: Bottom Sheet/Actions, destructive *Hapus draf* (`trash-2`) + *Batal* (`x`) |
| Toast cancelled | `detail-toast-dibatalkan-desktop-v3KD6D` | `…-mobile-PTr8W` | *Proyek dibatalkan* · *{judul} pindah ke tab Dibatalkan.*; the detail now shows the cancelled view (Slice 2) |
| Toast draft deleted | `list-toast-draf-dihapus-desktop-ex0WR` | `…-mobile-sV9q3` | On the list: *Draf dihapus* · *{judul} sudah dihapus.* |

**Menu item details:**

| Kind | Label | Icon | Notes |
|---|---|---|---|
| `STEP` | the step label (Shared contracts) | the step icon | runs `advance(step)` from `use-project-actions` |
| `EDIT_INFO` | *Ubah info* | `pencil` | opens `project-info-dialog` |
| `CHAT_WHATSAPP` | *Chat WhatsApp* | `message-circle` | `<a href={whatsappChatUrl(number)} target="_blank" rel="noopener noreferrer">` |
| `ADD_WHATSAPP_NUMBER` | *Tambah nomor WhatsApp* | `message-circle` (`// not in Pencil`) | `loadClientForEditAction`, then F-06 `ClientDialog` (edit) with `updateClientAction`; on save `router.refresh()` |
| `CANCEL` | *Batalkan proyek* | `circle-x` | destructive; opens the cancel dialog |
| `DELETE_DRAFT` | *Hapus draf* | `trash-2` | destructive; opens the delete confirm |

### Rule code

```ts
/** Builds the project menu for a status: project actions, Kirim ke klien, destructive (D-13, AC-PRJ-027). @param input - stored status and whether the client has a number @returns the three groups, empty ones omitted by the UI */
export function buildProjectMenu(input: ProjectMenuInput): ProjectMenuGroups {
  const step = nextStep(input.status);
  const isClosed = input.status === "COMPLETED" || input.status === "CANCELLED";
  const project: ProjectMenuItem[] = [];
  if (step !== null) project.push({ kind: "STEP", step });
  if (!isClosed) project.push({ kind: "EDIT_INFO" });
  const sendToClient: ProjectMenuItem[] = [
    input.hasWhatsappNumber ? { kind: "CHAT_WHATSAPP" } : { kind: "ADD_WHATSAPP_NUMBER" },
  ];
  let destructive: ProjectMenuItem[] = [];
  if (canDeleteDraft(input.status)) destructive = [{ kind: "DELETE_DRAFT" }];
  else if (canCancel(input.status)) destructive = [{ kind: "CANCEL" }];
  return { project, sendToClient, destructive };
}
```

`ProjectMenuItem`, `ProjectMenuGroups` and `ProjectMenuInput` (`{ status: ProjectStatus; hasWhatsappNumber: boolean }`) go in `project-menu.types.ts`:

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

A divider separates non-empty groups. The *KIRIM KE KLIEN* label sits above `sendToClient`.

### Backend

| File | Content |
|---|---|
| `ProjectRepositoryPort` (+) | `withLockedProject<T>(context, id, change: (locked: LockedProject, writer: ProjectWriter) => Promise<T>): Promise<T \| "NOT_FOUND">`. `LockedProject = { status, agreedPrice, sessionCount, title }`. `ProjectWriter` gets `updateInfo({ title, notes, agreedPrice, actorId })`, `cancel({ reason, actorId })` (sets `status='CANCELLED'`, `cancelled_at=now()`, `cancelled_by`, `cancel_reason`) and `deleteProject()` |
| Drizzle `withLockedProject` | `db.transaction`: `select status, agreed_price, title, (select count(*) from project_session where project_id = p.id)::int from project p where workspace_id = $ws and id = $id for update`; no row → `"NOT_FOUND"`; otherwise `change(locked, writerBoundTo(tx))` |
| `findDetail` (+) | `service.basePrice` (the current base price, for the *Ubah info* helper) |
| `update-project-info` | Parse `projectInfoInputSchema = { title, agreedPrice, notes }`. Under the lock: CANCELLED → `PROJECT_CANCELLED`; `agreedPrice !== locked.agreedPrice && !isDealEditable(status)` → `DEAL_LOCKED`; else `updateInfo` |
| `cancel-project` | Parse `{ reason }` with `cancelReasonSchema`. Under the lock: `!canCancel(status)` → `STALE`; `cancelReasonRequired(status) && reason === null` → `VALIDATION_FAILED { reason: "REASON_REQUIRED" }`; else `cancel` |
| `delete-draft` | Under the lock: `!canDeleteDraft(status)` → `STALE`; else `deleteProject()` (the snapshots cascade). Returns `{ ok: true, title }` |
| `get-client` | F-06 `ClientRepositoryPort` lookup by ID in the workspace → `ClientRecord` or `NOT_FOUND` |
| `get-project-detail` (+) | Adds `menu = buildProjectMenu({ status, hasWhatsappNumber })` |
| `ProjectListRow` users | The list builds the same menu per row from `status` + `clientWhatsappNumber` |
| `projects.ts` (+) | `updateProjectInfoAction(ws, id, values)`, `cancelProjectAction(ws, id, values)`, `deleteDraftAction(ws, id)` → `{ ok:true, title } \| ProjectFailure`, `loadClientForEditAction(ws, clientId)` |
| Shell | `CompactBarActions` (new, like `PageActions`): a portal into a container `COMPACT_BAR_ACTIONS_ID` that `CompactBar` renders in its `actions` slot. `AppShell` passes `actions={<div id={COMPACT_BAR_ACTIONS_ID} />}` when `subPage` is set |

### Components

- **Shared:** ActionMenu SM (rows) and MD (detail header), Menu with group label, divider and destructive item, Bottom Sheet/Actions with a local group label (design.md COMPONENT GAP: a small `text.secondary` overline above the group, `space/4` inset), Modal SM/MD, Button Danger + pending, TextField disabled, Textarea + error, `CompactBarActions` (new).
- **Feature:**

  | Unit | Responsibility |
  |---|---|
  | `project-menu` | `ProjectMenu({ groups, project, onEditInfo, onCancel, onDeleteDraft, onAddNumber, onStep, variant: "row" \| "detail" })`. Desktop: ActionMenu (SM in rows, MD on the detail); phone: Bottom Sheet/Actions with the title and meta |
  | `project-info-dialog` | Fields per the export, RHF + `zodResolver(projectInfoInputSchema)`; the price is disabled when `!canEditDeal`; errors via `projectFieldErrorText` |
  | `project-status-dialogs` | `CancelProjectDialog` (reason optional / required by status) and `DeleteDraftDialog` |
  | `use-project-actions` (+) | `editInfo`, `cancel` (toast *Proyek dibatalkan* + refresh), `deleteDraft` (`showToast` *Draf dihapus* then `router.push(/w/{id}/projects)`; the toast queue lives in the shell, so it survives the navigation), `addNumber` |
  | Wiring | `projects-table` / `project-list` render `ProjectMenu` in the ⋯ cell; `project-detail-screen` renders it via `PageActions` (desktop, beside the step) and `CompactBarActions` (phone). Slice 5 also adds *Ubah info* to the *Info* card header when `canEditInfo` (phone label *Ubah*) |

### Steps

- [ ] **5.1 Backend.**
  - **Tests first:**
    - `project-menu.test.ts`: one case per spec row (DRAFT, BOOKED, SHOOTING, POST_PROCESSING, DELIVERED, COMPLETED, CANCELLED), the no-number case and the AC-PRJ-027 rows;
    - `update-project-info.test.ts`: title and notes change in SHOOTING; a price change in SHOOTING → `DEAL_LOCKED`; CANCELLED → `PROJECT_CANCELLED` (AC-PRJ-018);
    - `cancel-project.test.ts`: SHOOTING without a reason → `REASON_REQUIRED`; BOOKED without one → ok; 501 chars → `TOO_LONG`; DRAFT → `STALE` (AC-PRJ-022, A-10);
    - `delete-draft.test.ts`: BOOKED → `STALE`; DRAFT → `{ ok, title }` (AC-PRJ-023);
    - integration:
      - cancel stores `cancelled_at`, `cancelled_by` and `cancel_reason`, and `findDetail` returns `byName`;
      - a draft delete removes its items, fields and sessions (counts 0);
      - a BOOKED delete changes nothing;
      - workspace B → `NOT_FOUND`.
  - **Implement.**
  - Commit `feat(projects): add project info, cancel and delete backend`.
- [ ] **5.2 Menu and dialogs.**
  - **Precondition:** the 14 Slice 5 exports.
  - **Tests first** (`project-menu.test.tsx`, `project-info-dialog.test.tsx`, `project-status-dialogs.test.tsx`, `use-project-actions.test.ts` +, `compact-bar.test.tsx` +):
    - every state row;
    - the menu item table (labels, icons, destructive tone, dividers, group label);
    - *Chat WhatsApp* `href` / `target` / `rel`;
    - *Tambah nomor WhatsApp* → the dialog → after saving, the menu offers *Chat WhatsApp*;
    - a row step keeps the list open, shows the toast and refreshes; `STALE` → *Status proyek sudah berubah* + refresh;
    - cancel in BOOKED (optional) vs SHOOTING (required);
    - *Hapus draf* → toast + push to the list;
    - *Ubah info* locked price.
  - **Implement**, then compare.
  - Commit `feat(projects): add the project menu and dialogs`.
- [ ] **5.3 E2E.** Add to `projects.spec.ts`:
  - *Mulai pemotretan* from the row menu (chip *Pemotretan*, toast);
  - cancel a SHOOTING project: required error, then a reason → banner with the reason;
  - delete a draft → list + toast;
  - *Chat WhatsApp* `href` matches `https://wa.me/62…` (AC-PRJ-022, 023, 027).

  Commit `test(projects): cover the project menu end to end`.

**Done check:** every AC-PRJ-027 menu matches in the browser at both widths. Cancel, delete and info edits work from the list and the detail. The gate, integration, build and E2E pass.

---

## Slice 6: Detail edits — package, booking fields and sessions

### Screen overview

| | |
|---|---|
| Screens | S3 (edit controls), S2c (detail mode), S3b, S3c |
| ACs | AC-PRJ-017, 018 (controls hidden + direct requests rejected), 019, 029 (detail half) |
| Out of this slice | create-mode reuse of the item dialogs (Slice 7) |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Add item | `new-tambah-item-desktop-ipoUj` | `new-tambah-item-mobile-R8gAvN` | Same dialog as in Slice 7 (Modal MD / Sheet *Tambah item* …), opened from the detail *Isi paket* header (*Tambah item*; phone *Tambah*) while `canEditDeal` |
| Edit value | `new-ubah-nilai-desktop-b82A3` | `new-ubah-nilai-mobile-p1pXCE` | *Ubah nilai · {item}* from the item ⋯ |
| Remove item | `new-hapus-item-desktop-t4LqJ` | `new-hapus-item-mobile-tTbXi` | *Hapus {item}?* confirm |
| Field booking dialog | `detail-ubah-field-booking-desktop-VgCZF` | `…-mobile-j4w4o` | Modal MD / Sheet *Ubah field booking* · *Nilai field untuk proyek ini. Nama dan jenis field tidak berubah.* · the snapshotted fields by type (*Nama kampus*, *Tanggal wisuda* DateField, *Ukuran toga (opsional)* Select *Pilih ukuran*) · *Batal* / *Simpan* |
| Last session | `detail-sesi-terakhir-desktop-bQbmb` | `…-mobile-DzmLU` | Desktop session ⋯ (Action Menu SM): *Ubah sesi* (`pencil`), divider, *Hapus sesi* (`trash-2`) as Menu Item/Disabled with the description *Proyek yang sudah dibooking butuh minimal satu sesi.* Phone: Bottom Sheet/Actions titled with the session name, meta `formatSessionRange`, *Ubah sesi*, *Hapus sesi* dimmed (`SheetItem isDisabled`), then the hint text |
| Delete session | `detail-hapus-sesi-desktop-QJUBI` | `…-mobile-ZyZuV` | Modal SM *Hapus sesi {nama}?* · *Sesi dihapus dari jadwal proyek ini.* · *Batal* / *Hapus sesi* (Danger); phone Actions sheet |
| Deal locked | `detail-toast-paket-terkunci-desktop-MZtLr` | `…-mobile-E7jJ3F` | Toast/Danger *Detail paket tidak bisa diubah lagi* · *Proyek sudah dalam pemotretan. Data terbaru sudah dimuat.*; the page shows the SHOOTING view after the refresh |

**Detail edit controls** (rendered only when allowed):

| Card | Control | Shown when |
|---|---|---|
| *Isi paket* | header *Tambah item* (phone *Tambah*), item ⋯ (*Ubah nilai* `pencil`, *Hapus* `trash-2` destructive) | `canEditDeal` |
| *Field booking* | header *Ubah* (`pencil`) | `canEditDeal` and the project has fields |
| *Jadwal* | header *Tambah sesi* (phone *Tambah*), session ⋯ (*Ubah sesi*, *Hapus sesi*) | `canEditSchedule` |
| *Jadwal*, *Hapus sesi* | disabled + hint | `needsSession(status) && sessions.length === 1` |

Session dialog on the detail: title *Tambah sesi* / *Ubah sesi*, description *Perubahan langsung disimpan.* (`// not in Pencil`), confirm *Tambah sesi* / *Simpan*.

### Backend

| File | Content |
|---|---|
| `ProjectWriter` (+) | `addItem({ definitionId, value, actorId })` → `"ADDED" \| "DEFINITION_INACTIVE" \| "DUPLICATE_DEFINITION" \| "NOT_FOUND"`. It locks the definition `FOR SHARE`, requires `is_active`, and inserts with `sort_order = coalesce(max,−1)+1` and the definition's current name, unit, value type and selection. `23505` → `DUPLICATE_DEFINITION`. Also `findItem(itemId)` → `ProjectItemRecord \| null`, `updateItemValue(itemId, value, actorId)`, `removeItem(itemId)`, `listFields()` → `ProjectFieldRecord[]`, `updateFieldValues(values, actorId)` (one `update` per key), `addSession(input, actorId)`, `updateSession(sessionId, input, actorId)` → `boolean`, `deleteSession(sessionId)` → `boolean` |
| `add-project-item` | Input `{ definitionId, value }` (`packageValueInputSchema`). Under the lock: `!isDealEditable` → `DEAL_LOCKED`. Load the definition rules, validate the value with `validateItemList([...])`, then `addItem` → map to field errors (`definitionId: DEFINITION_INACTIVE \| DUPLICATE_DEFINITION`) |
| `update-project-item-value` | Under the lock: `DEAL_LOCKED`; `findItem` (null → `NOT_FOUND` throw); validate against the item's own `valueType` / `selectionRequired`; update |
| `remove-project-item` | Under the lock: `DEAL_LOCKED`; remove (false → throw `NOT_FOUND`) |
| `update-project-field-values` | Input `{ values: Record<string, BookingValue> }`. Under the lock: `DEAL_LOCKED`; `validateFieldValues(listFields(), values)` → `fieldValues.<key>` errors; else update |
| `add-session` / `update-session` | `sessionInputSchema`. Under the lock: `!isScheduleEditable` → `PROJECT_CANCELLED` |
| `delete-session` | Under the lock: CANCELLED → `PROJECT_CANCELLED`; `needsSession(status) && sessionCount <= 1` → `LAST_SESSION`; delete (false → throw `NOT_FOUND`) |
| `projects.ts` (+) | `addProjectItemAction(ws, id, values)`, `updateProjectItemValueAction(ws, id, itemId, values)`, `removeProjectItemAction(ws, id, itemId)`, `updateProjectFieldValuesAction(ws, id, values)`, `addSessionAction(ws, id, values)`, `updateSessionAction(ws, id, sessionId, values)`, `deleteSessionAction(ws, id, sessionId)`, all → `ProjectWriteResult` |

### Components

- **Shared:** Menu Item disabled with a description (Menu Item/Default/Disabled `H:e0gYs`), `SheetItem isDisabled` (F-06), Modal SM + Danger, DateField, TimeField.
- **Feature:**

  | Unit | Responsibility |
  |---|---|
  | `project-item-dialog` | **Reuse contract.** Props `{ mode: "add" \| "edit"; isOpen; onOpenChange; definitions?: DefinitionOption[] /* add */; item?: { name; unit; valueType; selectionRequired; value } /* edit */; onSubmit: (input: { definitionId?: string; value: PackageValueInput }) => Promise<Readonly<Record<string, ProjectFieldErrorKey>> \| null> }`. It shows the errors that `onSubmit` returns and closes on `null`. It calls no server action itself |
  | `remove-item-dialog` | `{ itemName; isOpen; onOpenChange; onConfirm: () => Promise<void> }`; Modal SM / Actions sheet |
  | `package-items-card` (+) | `mode: "create" \| "detail"`. In detail mode the callbacks call the item actions through `use-project-actions` and toast *Perubahan disimpan* |
  | `booking-fields-dialog` | Reuses `booking-field-input`; RHF; `onSubmit(values)` → field errors or `null` |
  | `sessions-card` (+) | Detail mode: the session dialog's `onSubmit` calls `add/updateSessionAction`; the menu per the state table; the delete confirm. `openAddSession()` is exposed for *Konfirmasi booking* without a session |
  | `use-project-actions` (+) | Maps `DEAL_LOCKED` → the danger toast + `router.refresh()`; `LAST_SESSION` → Toast/Danger *Proyek yang sudah dibooking butuh minimal satu sesi.*; `PROJECT_CANCELLED` → Toast/Danger *Proyek sudah dibatalkan.* (`// not in Pencil`) + refresh. `SESSION_REQUIRED` from *Konfirmasi booking* now also calls `openAddSession()` |

### Steps

- [ ] **6.1 Backend.**
  - **Tests first** (use cases on the fakes):
    - every deal edit in SHOOTING → `DEAL_LOCKED` with no change (AC-PRJ-018);
    - add: an existing definition → `definitionId: DUPLICATE_DEFINITION`; archived (*Album lama*) → `DEFINITION_INACTIVE`; *Foto cetak* 10 → appended last with the definition's name, unit and `PRINT` (AC-PRJ-017);
    - edit value: *Foto edit* `2,5` → `NOT_WHOLE`; *Jumlah orang* 3–1 → `MIN_GREATER_THAN_MAX`; *Foto edit* 30 → saved;
    - field values: *Ukuran toga* `XL` → `NOT_AN_OPTION`, `M` → saved; the metadata unchanged;
    - sessions: last in BOOKED → `LAST_SESSION`; with two → deleted; any change in CANCELLED → `PROJECT_CANCELLED` (AC-PRJ-029).

    Integration:
    - `Promise.all([advance START_SHOOTING, updateItemValue 30])`: if the step committed first, the edit returns `DEAL_LOCKED` and the value stays 25; otherwise the value is 30 and the status SHOOTING (AC-PRJ-019);
    - every new method with workspace B → `NOT_FOUND`.
  - **Implement.**
  - Commit `feat(projects): add deal and session edit backend`.
- [ ] **6.2 Screens.**
  - **Precondition:** the 14 Slice 6 exports.
  - **Tests first** (`package-items-card.test.tsx` +, `project-item-dialog.test.tsx`, `booking-fields-dialog.test.tsx`, `sessions-card.test.tsx` +, `use-project-actions.test.ts` +):
    - the control table per status;
    - each dialog per its state row;
    - each successful edit → *Perubahan disimpan* + refresh;
    - `DEAL_LOCKED` → the danger toast + refresh;
    - the last session's disabled delete with the hint (desktop Menu Item, phone SheetItem);
    - *Konfirmasi booking* with no session → the toast, then the session dialog opens;
    - the item dialog calls no action (create-mode readiness).
  - **Implement**, then compare.
  - Commit `feat(projects): add deal and session editing on the detail page`.

**Done check:** AC-PRJ-017's edits, the two-tab race (AC-PRJ-019) and the session rules (AC-PRJ-029) work in the browser. Controls disappear from SHOOTING on. The gate and integration pass.

---

## Slice 7: *Proyek baru* — the rest

Slice 1 covers the main path of the create form. This slice adds the parts that change the form's data before saving:
- creating a client inline;
- editing the package;
- changing the service;
- the two service and client guards.

**Requires:**
- Slice 1: the form, `createProject`, and the pickers;
- Slice 6: `project-item-dialog` and the remove-item confirm, which this slice reuses in create mode.

### Screen overview

| | |
|---|---|
| Screens | S2 (remaining states), S2b, S2c (create mode), S2d |
| Route | `/w/[workspaceId]/projects/new` (same page as Slice 1) |
| ACs | AC-PRJ-012 (UI), 013, 014, 030 |
| Out of this slice | nothing more on S2: after this slice every S2 export is implemented |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Inline client dialog | `new-klien-baru-desktop-YkwXo` | `new-klien-baru-mobile-w2QKYN` | F-06 `ClientDialog` (Modal MD / full-height Bottom Sheet Form) over the form. Title *Tambah klien*, description *Klien baru langsung dipilih untuk proyek ini.*, name prefilled from the query, *Batal* / *Tambah klien* |
| Add item | `new-tambah-item-desktop-ipoUj` | `new-tambah-item-mobile-R8gAvN` | Modal MD / Sheet: *Tambah item* · *Item hanya ditambahkan ke proyek ini.* · Select *Item* (helper *Hanya item aktif yang belum ada di proyek.*) · *Jumlah* with the helper *Satuan: {unit}* · *Batal* / *Tambah item* |
| Edit value (RANGE) | `new-ubah-nilai-desktop-b82A3` | `new-ubah-nilai-mobile-p1pXCE` | *Ubah nilai · {item}* · *Hanya berlaku untuk proyek ini. Layanan tidak berubah.* · *Minimal* / *Maksimal* side by side, each with the unit as helper · *Batal* / *Simpan*. NUMBER shows one *Jumlah* field |
| Remove item | `new-hapus-item-desktop-t4LqJ` | `new-hapus-item-mobile-tTbXi` | Modal SM + Button Danger / Bottom Sheet Actions: *Hapus {item}?* · *Item dihapus dari proyek ini. Layanan tidak berubah.* · *Hapus item* / *Batal* |
| Change service | `new-ganti-layanan-desktop-ohp7C` | `new-ganti-layanan-mobile-kjNVD` | Modal SM + Button **Primary** / Bottom Sheet Actions (Sheet Item `refresh-cw`): *Ganti layanan?* · *Perubahan isi paket akan hilang. Isi paket diganti dengan isi {layanan baru}.* · *Ganti layanan* / *Batal* |
| No active service | `new-tanpa-layanan-aktif-desktop-EWh9x` | `new-tanpa-layanan-aktif-mobile-wr8Jc` | Select/Disabled with *Belum ada layanan aktif*, then Alert/Info *Belum ada layanan aktif* · *Proyek dibuat dari layanan. Buat atau aktifkan layanan dulu, lalu kembali ke sini.* · action *Buka Layanan*. *Simpan draf* and *Buat proyek* are disabled. *Isi paket* and *Field booking* are hidden |
| Inactive service (race) | `new-layanan-tidak-aktif-desktop-atf72` | `new-layanan-tidak-aktif-mobile-Ma402` | Select/Error on *Layanan*: *Layanan ini sudah tidak aktif. Pilih layanan lain.* The rest of the form keeps its input |
| Inactive client (race) | — | — | Not drawn (Combobox has no error variant; design.md › COMPONENT GAP). The error goes under *Klien*: *Klien ini sudah diarsipkan. Pilih klien lain.* `// not in Pencil` |

### Backend

- **F-06 `addClient` result (D-11).** In `src/features/booking/application/use-cases/add-client/add-client.ts` and its `.types.ts`, success returns `{ ok: true, client: { id, name, whatsappNumber } }` instead of `undefined`. `addClientAction` passes it through, and F-06's callers ignore it.
  - **Additive:** update `add-client.test.ts` and `clients.test.ts` for the new success shape.
  - `ClientRepositoryPort.create` already returns `CREATED`. Extend it to return the new row's `id` (`returning({ id })`), and update the Drizzle repository test.
- **`createProject` failures → fields.** Slice 1 (step 7 of the `createProject` algorithm) already maps these codes to field paths. This slice renders them, with the copy from Shared contracts › Field error copy:

  | Code | Field path | Copy |
  |---|---|---|
  | `CLIENT_INACTIVE` | `clientId` | *Klien ini sudah diarsipkan. Pilih klien lain.* (`// not in Pencil`) |
  | `SERVICE_INACTIVE` | `serviceId` | *Layanan ini sudah tidak aktif. Pilih layanan lain.* |
  | `DEFINITION_INACTIVE` | `items.N.definitionId` | *Item ini sudah tidak aktif. Pilih item lain.* (`// not in Pencil`) |
  | `DUPLICATE_DEFINITION` | `items.N.definitionId` | *Item ini sudah ada di proyek* (spec) |

- **`loadCreateOptions`** also returns the active item definitions (`id`, `name`, `valueType`, `unit`, `selectionRequired`, `selectionType`) for *Tambah item*, and `hasActiveService`. Slice 1 returned services only, so add both fields and a test.
- **No new action.** Package edits live in form state until *Buat proyek* / *Simpan draf* (spec › Main Flow 3). The submitted `items` list is the edited list (D-4).

### Components

- **Reuse (inventory first):**
  - F-06 `ClientDialog` in add mode, with three new optional props, all additive (F-06's own use is unchanged):
    - `initialName?: string`, which prefills *Nama klien*;
    - `description?: string`, which replaces F-06's add description (*Klien bisa dipilih saat membuat proyek.*) with *Klien baru langsung dipilih untuk proyek ini.*;
    - `onCreated?: (client: { id; name; whatsappNumber }) => void`, called after a successful add with the result's client.

    The dialog keeps F-06's own success toast (*Klien ditambahkan* / *{name} siap dipilih saat membuat proyek.*);
  - Slice 6's `project-item-dialog` and remove confirm, through their callback contract (see Slice 6 › Components);
  - `Modal` SM, `BottomSheet` Actions, `SheetItem`, `Alert` Info, `Select` disabled and error states.
- **Feature units:**
  - `client-picker`: the create row (*Tambah klien baru “{query}”*) opens `ClientDialog` with `initialName = query`; on `onCreated` it selects the client;
  - `package-items-card` (create mode): each row's ⋯ has *Ubah nilai* and *Hapus*; the header has *Tambah item* (*Tambah* on phones);
  - `change-service-dialog`;
  - `service-picker`: the no-active and inactive states;
  - `use-create-project-form`: holds the package draft and the default-title rule below.

### Rule code

**Default title (A-2, AC-PRJ-007, AC-PRJ-013).** Add to `domain/project-record/project-record.ts`:

```ts
/** Decides the title after the client or service changes: it follows the default until the Owner edits it (A-2). @param input - the current title, the last default shown, and the new names @returns the next title and default */
export function nextProjectTitle(input: NextTitleInput): NextTitleResult {
  const nextDefault =
    input.serviceName !== null && input.clientName !== null
      ? defaultProjectTitle(input.serviceName, input.clientName)
      : null;
  const isUntouched = input.currentTitle === "" || input.currentTitle === input.lastDefault;
  return {
    title: isUntouched && nextDefault !== null ? nextDefault : input.currentTitle,
    lastDefault: nextDefault,
  };
}
```

`NextTitleInput` is `{ currentTitle: string; lastDefault: string | null; serviceName: string | null; clientName: string | null }`, and `NextTitleResult` is `{ title: string; lastDefault: string | null }`, both in `project-record.types.ts`.

**Package draft (spec › Main Flow 3, AC-PRJ-030).** This is pure form state, kept beside the hook in `ui/use-create-project-form/package-draft.ts`:

```ts
/** Applies one package edit to the form's item list; the service template is never touched (BR-PRJ-001). @param items - current draft items @param action - the edit @returns the next items */
export function reducePackageDraft(
  items: readonly DraftItem[],
  action: PackageDraftAction,
): readonly DraftItem[] {
  switch (action.type) {
    case "RESET":
      return action.serviceItems;
    case "UPDATE_VALUE":
      return items.map((item) =>
        item.definitionId === action.definitionId ? { ...item, value: action.value } : item,
      );
    case "REMOVE":
      return items.filter((item) => item.definitionId !== action.definitionId);
    case "ADD":
      return [...items, action.item];
  }
}

/** Tells whether the package differs from the service's items, so a service change must be confirmed (spec › Main Flow 3). @param items - draft items @param serviceItems - the chosen service's items @returns true when anything was changed */
export function isPackageEdited(
  items: readonly DraftItem[],
  serviceItems: readonly DraftItem[],
): boolean {
  if (items.length !== serviceItems.length) return true;
  return items.some((item, index) => {
    const original = serviceItems[index];
    return original === undefined || original.definitionId !== item.definitionId || !samePackageValue(original.value, item.value);
  });
}
```

`DraftItem` is `{ definitionId, name, unit, valueType, selectionRequired, selectionType, value: PackageValue }`. Items are keyed by `definitionId`, because a project has one item per definition (BR-PRJ-009). `samePackageValue` compares the canonical decimal strings. *Tambah item* offers only active definitions whose `definitionId` isn't in the draft.

### Steps

- [ ] **7.1 Inline client (S2b, AC-PRJ-013).**
  - **Tests first:**
    - `add-client.test.ts`: success returns `{ ok: true, client }` with the new ID; the validation failures are unchanged;
    - `nextProjectTitle` table:
      - empty title → the default;
      - title equal to the last default → the new default;
      - edited title → kept;
      - no service yet → title unchanged and `lastDefault` null;
    - `client-picker.test.tsx`:
      - the create row opens `ClientDialog` with *Rin* prefilled;
      - saving *Sari* / `0812 3456 7891` selects *Sari*, shows *+62 812-3456-7891* as the helper and updates the title if it is still the default;
      - *Batal* (desktop) or Close (phone) leaves the client, the title and the picker query unchanged;
      - an F-06 validation error stays inside the dialog.
  - **Implement:**
    - the F-06 result change;
    - `ClientDialog` `initialName` / `description` / `onCreated`, with a test in `client-dialog.test.tsx` that F-06's add dialog without them is unchanged;
    - the picker wiring;
    - `nextProjectTitle` in the form hook, for both client and service changes.
  - **Compare** with `new-klien-baru-*`.
  - Commit `feat(projects): create a client from the project form`.
- [ ] **7.2 Service guards (S2, AC-PRJ-012, AC-PRJ-014).**
  - **Tests first:**
    - `load-create-options.test.ts`: `hasActiveService: false` when every service is archived; active definitions are returned;
    - `create-project.test.ts`: `CLIENT_INACTIVE` → `clientId`, `SERVICE_INACTIVE` → `serviceId`, `DEFINITION_INACTIVE` / `DUPLICATE_DEFINITION` → `items.N.definitionId`;
    - integration: archive the service between loading the form and `createProject` → `SERVICE_INACTIVE` and no rows; the same for the client;
    - `service-picker.test.tsx`:
      - no active service → Select/Disabled, Alert/Info with *Buka Layanan* linking to `/w/<id>/services`, both submit buttons disabled, *Isi paket* and *Field booking* hidden;
      - the inactive error renders Select/Error with the copy above;
    - `create-project-screen.test.tsx`: after a `SERVICE_INACTIVE` failure every other field keeps its value, and focus moves to *Layanan*.
  - **Implement**, then compare with `new-tanpa-layanan-aktif-*` and `new-layanan-tidak-aktif-*`.
  - Commit `feat(projects): guard the project form against inactive clients and services`.
- [ ] **7.3 Package edits and service change (S2c create mode, S2d, AC-PRJ-030).**
  - **Tests first:**
    - `package-draft.test.ts`:
      - each action, with order kept and an added item last (A-7);
      - `isPackageEdited`: false right after `RESET`; true after any edit; false again after editing a value back to the original;
    - `package-items-card.test.tsx` (create mode):
      - *Ubah nilai* on *Foto edit* → 30 updates the meta (*30 foto · pilihan edit*);
      - `2,5` on a selection item shows the AC-PRJ-017 error and leaves the draft unchanged;
      - *Hapus* confirms, then removes the row;
      - *Tambah item* lists only active definitions not in the draft; adding *Foto cetak* 10 appends it;
      - a service with no items shows Empty State/In card and still offers *Tambah item*;
    - `change-service-dialog.test.tsx`:
      - picking another service with an untouched package switches at once, with no dialog;
      - with an edited package it asks *Ganti layanan?* naming the new service;
      - *Batal* keeps the old service and the edits;
      - *Ganti layanan* resets the items to the new service's items, and its price, fields and default title (A-2);
    - integration (`project-repository.test.ts`): create with *Foto edit* 30, *Jumlah orang* removed and *Foto cetak* 10 added → the project items are exactly *Foto edit* 30 and *Foto cetak* 10, *Foto cetak* copied from the definition, and *Wisuda Basic*'s items unchanged (AC-PRJ-030).
  - **Implement:** the draft in `use-create-project-form` (`useReducer` + `reducePackageDraft`), the card in create mode, the reused dialogs, and `change-service-dialog`.
  - **Compare** with `new-tambah-item-*`, `new-ubah-nilai-*`, `new-hapus-item-*` and `new-ganti-layanan-*` at 1440 and 390.
  - Commit `feat(projects): edit the package and change the service before saving`.
- [ ] **7.4 E2E.** Extend `projects.spec.ts`:
  1. On *Proyek baru*, type *Sar*, choose *Tambah klien baru “Sar”*, save *Sari* with a number. *Sari* is selected and the title reads *{layanan} — Sari*.
  2. Pick *Wisuda Basic*, set *Foto edit* 30, remove *Jumlah orang*, add *Foto cetak* 10.
  3. Switch to another service, cancel the confirm, and check the edits are still there.
  4. Add a session, then *Buat proyek*. The detail lists *Foto edit 30 foto* and *Foto cetak 10*.

  Commit `test(projects): cover inline client and package edits end to end`.

**Done check:**
- The 7.4 journey works in the browser at 1440 and 390.
- With every service archived, *Proyek baru* shows the alert and can't be submitted.
- Archiving the service in a second tab before *Buat proyek* shows the field error and keeps the form.
- Every S2 export (Slices 1 and 7) is implemented and compared.
- The gate, integration, build and E2E pass.

---

## Slice 8: Close

Screens: all (S1–S3c), end to end.

- [ ] **8.1 E2E journeys.** Complete `tests/e2e/projects/projects.spec.ts`. It reuses the helpers from 2.3 and `registerAndVerify` / `uniqueEmail` from `tests/e2e/auth/auth-e2e.ts`. Every journey is one `test(...)` named with its AC IDs:

  | Journey | Checks |
  |---|---|
  | AC-PRJ-008, 030 | book with an edited package and a session → detail items exact |
  | AC-PRJ-009, 029 | draft without a session → *Konfirmasi booking* toast + dialog → add a session → confirm → *Dibooking* |
  | AC-PRJ-001, 004, 005 | list order, search + reload |
  | AC-PRJ-028 | filter, badge 2, reload keeps the filter, *Reset* |
  | AC-PRJ-018, 020 | step to *Pemotretan* → deal controls gone; *Ubah info* price disabled |
  | AC-PRJ-022 | cancel with a reason → banner |
  | AC-PRJ-023 | delete a draft |
  | AC-PRJ-027 | row-menu step; *Chat WhatsApp* href |
  | AC-PRJ-025 | a second account opens the first account's project URL → not found |

  Commit `test(projects): complete project journeys`.
- [ ] **8.2 Accessibility (AC-PRJ-026).**
  - Add `expectProjectsA11y(page)`, a copy of `expectCatalogA11y` (wait until `[data-entering], [data-exiting]` count is 0, then axe with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and expect no violations).
  - Run it on each surface at 1440×900 and 390×844, in light, and in dark through `page.emulateMedia({ colorScheme: "dark" })`:
    - the list (populated and empty);
    - the filter dialog;
    - *Proyek baru* (filled and with field errors);
    - the client picker open;
    - the session, item and *Ganti layanan?* dialogs;
    - the detail in BOOKED and in CANCELLED;
    - the menu open, and the cancel / *Ubah info* / field-booking dialogs.
  - **Keyboard-only paths:**
    - Tab to the picker, type, Arrow + Enter selects;
    - open the DateField with the keyboard and pick a day;
    - open the row menu with Enter, Escape closes, and focus returns to ⋯;
    - every dialog traps focus and returns it to its trigger.
  - Commit `test(projects): check project screens for accessibility`.
- [ ] **8.3 Fidelity.**
  - Start the dev server with `preview_start`.
  - For each of the 92 exports: open the export file and the matching app state at the same width (1440 or 390), take both screenshots, and compare structure, copy, spacing and tokens.
  - Fix every deviation that is a bug. Record the intentional ones (literal sizes, the documented COMPONENT GAPs) in the implementation record.
  - Commit fixes as `fix(projects): match {screen} to the design`.
- [ ] **8.4 Full gate and record.**
  - Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm build` and the E2E suite; all pass.
  - Append *Implementation record* to `technical-design.md`:
    - date and commits;
    - the migration run output;
    - deviations from the design and plan (each with its reason);
    - the AC → test-file map for AC-PRJ-001…030;
    - open follow-ups (the COMPONENT GAPs to promote).
  - Set F-07 to `IN PROGRESS` in `docs/product/feature-map.md`, with verification pending (`/sdv:verify-feature projects`), and update `docs/HANDOFF.md`.
  - Commit `docs(projects): record the f-07 implementation`.

**Done check:** every AC-PRJ-001…030 maps to a passing test or a recorded verification (C-009), and the full gate passes.
