# Technical Design — F-07 Projects

Status: IN PROGRESS (Slices 0–5 built 2026-10-03; E2E steps 3.3 and 5.3 deferred to Slice 8) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) (AC-PRJ-001…030) · Design: [design.md](design.md) (94 frames, 92 exports in `exports/`) · Plan: [plan.md](plan.md)

## Context

A project books one client on one service with the deal they agreed on. Creating it copies the service's package items and booking fields into the project (the snapshot) in one transaction, and adds its sessions (the schedule). The Owner then:
- moves it through `DRAFT → BOOKED → SHOOTING → POST_PROCESSING` by hand;
- edits the deal until shooting starts;
- edits the title, notes and sessions until it is cancelled;
- cancels it, or deletes it while it is a draft.

The list has three tabs, search, a filter, keyset paging and a row menu. F-07 calls no external service. *Chat WhatsApp* is a browser-built `wa.me` link.

**Base:** F-06 Clients must be **built and merged into `feat/projects`** before Slice 0. Its plan is ready, but it is not implemented yet. F-07 reuses from F-06:
- the `client` table (migration 0008) and `ClientRepositoryPort`;
- `ClientDialog` and `addClientAction` / `updateClientAction`;
- the `DataTable` pattern;
- `SheetItem` `isDisabled` / `isPending`;
- `whatsappChatUrl` / `formatWhatsappNumber`;
- the `x` Input action and the `message-circle` icon.

F-07's migration is therefore **0009**.

## Relevant Authority

- **Constitution:** C-002…C-009, C-101, C-102, C-103, C-105, C-106.
- **Business rules:**
  - projects: BR-PRJ-001…004, 007…010;
  - sessions: BR-TEAM-002, BR-TEAM-003;
  - catalog: BR-CAT-001…003, BR-CAT-008;
  - clients: BR-CLI-002, BR-CLI-003;
  - BR-CUR-001, BR-CUR-003, BR-AUD-001, BR-MSG-001, BR-WS-002, BR-WS-003.
- **ADRs:**
  - ADR-003 (composite FKs);
  - ADR-004 (one client access token per project);
  - ADR-006 (WhatsApp deep links);
  - ADR-007 (money);
  - ADR-009 (Neon, per-request pool, transactions);
  - ADR-010 (Tailwind + React Aria);
  - ADR-015 (URL-scoped workspace).
- **No new ADR.** Every decision stays inside the accepted architecture. The one new package, `@internationalized/date`, is React Aria's own date library (ADR-010); it is recorded in `tech-stack.md` › UI (D-12).
- **Rules:** `docs/coding-rules.md` v2.0; `docs/design-system/token-usage.md` v3.1.
- **Component specs:** `table.md`, `tabs.md`, `page-header.md`, `segmented-control.md`, `section-card.md`, `list-card.md`, `select.md`, `combobox.md`, `multi-select.md`, `checkbox.md`, `calendar-day.md`, `text-field.md`, `textarea.md`, `status-chip.md`, `count-badge.md`, `icon-button.md`, `menu.md`, `action-menu.md`, `modal.md`, `bottom-sheet.md`, `empty-state.md`, `alert.md`, `toast.md`.

## Decisions

| # | Decision | Why |
|---|---|---|
| D-1 | Projects join the **`booking`** context, beside the catalog and clients. There are four tables: `project`, `project_item`, `project_field_value` and **`project_session`**. The domain term stays *Session*; the table is prefixed because Better Auth owns `session`. | The domain model puts Project, Client and Service in one aggregate family. The create snapshot reads the catalog and clients in the same transaction, which only works inside one feature (no cross-feature imports). |
| D-2 | **One write path per aggregate change, inside a transaction with the project row locked** (`SELECT … FOR UPDATE`). Status moves, deal edits, session deletes and cancel all re-read the stored status under that lock and decide from it. | C-004, C-005, A-9. A stale step and a deal edit that races with *Mulai pemotretan* fail deterministically (AC-PRJ-019, 021). |
| D-3 | **The client never sends a status.** Status actions send a **step** (`CONFIRM_BOOKING`, `START_SHOOTING`, `FINISH_SHOOTING`). The domain maps each step to its one allowed `from → to`; a stored status that differs is `STALE`. | AC-PRJ-021: *any status sent in the body* is rejected because there is no status field to send. A backward or skipped move can't be expressed. |
| D-4 | **Create snapshot (BR-PRJ-001)** runs in one transaction:<br>1. Lock the client and service `FOR SHARE` and check that both are active in the workspace.<br>2. Load the service's booking fields.<br>3. Lock each submitted item's definition `FOR SHARE`. An item whose definition is in the service may use an archived definition; an *added* item needs an active one.<br>4. Insert the project, its items in the submitted order, one field-value row per snapshotted field, and the sessions. | The form submits the **intended item list** (`definitionId` + value). The server rebuilds every name, unit, value type and selection type from the definitions, never from the request (C-004). `FOR SHARE` makes a concurrent archive wait or fail first, so *Klien ini sudah diarsipkan* / *Layanan ini sudah tidak aktif* is exact (AC-PRJ-012). |
| D-5 | **One `project_field_value` row per snapshotted field**, with `value` NULL when an optional field is empty. | The detail shows *Ukuran toga* as empty (AC-PRJ-015), and *Ubah field booking* needs its snapshotted options (AC-PRJ-017). AC-PRJ-008's *"none for Ukuran toga"* is read as *no value* (A-3: *an optional field left empty stores no value*). The metadata row still exists. |
| D-6 | **The client access token** is 32 random bytes (Web Crypto `getRandomValues`, 256 bits), base64url-encoded. It is stored in `project.client_access_token` (unique, NOT NULL) and **never selected by any F-07 query.** The generator is a port (`AccessTokenGeneratorPort`) wired in composition. | BR-PRJ-003, ADR-004, C-103. F-10 resolves it and F-15 puts it in links, so it is stored retrievable, not hashed. F-07 repository projections list their columns explicitly, and a unit test asserts that no F-07 result type contains it (AC-PRJ-008). |
| D-7 | **Tabs are routes:**<br>- `/projects` (*Aktif*), `/projects/completed` (*Selesai*), `/projects/cancelled` (*Dibatalkan*);<br>- `/projects/new` (*Proyek baru*);<br>- `/projects/[projectId]` (detail).<br>The query and filters live in the URL: `?q=&status=BOOKED,SHOOTING&from=2026-10-01&to=2026-11-30&noSchedule=1&service=<id>,<id>&client=<id>` (A-11). | Same as F-06 D-3. Static segments win over `[projectId]`, and project IDs are UUIDs. Reload and shared links keep the filter. |
| D-8 | **Keyset paging by the shown session (A-4, A-12).** A `LATERAL` subquery picks each project's shown session relative to `today`. The order is:<br>1. projects with a session first;<br>2. shown date, ascending on *Aktif* and descending on *Selesai* / *Dibatalkan*;<br>3. `created_at` descending;<br>4. `id`.<br>The cursor is the last row's ID. Its sort key is recomputed inside the workspace with the same subquery. The page size is 30. | The sort depends on `today`, so it can't be stored. The cursor is an ID, as in F-06 D-4. One SQL expression (`shownSessionSql`) is used for both the order and the cursor. A pure domain function (`pickShownSession`) uses the same rule for the detail header, and both are tested against shared fixtures. |
| D-9 | **`today` is the date in `Asia/Jakarta`** (`PROJECT_SCHEDULE_TIME_ZONE`), computed on the server per request and passed into the domain and SQL as a `YYYY-MM-DD` string. | BR-TEAM-003 stores wall-clock times without a zone, and workspaces have no time-zone setting in MVP (IDR-only, Indonesian UI). TD-A-1 makes this reversible. |
| D-10 | ***Proyek baru* is one client-side form** (React Hook Form) holding client, service, title, price, notes, items, sessions and field values. *Simpan draf* / *Buat proyek* call **one** server action with `mode: "DRAFT" \| "BOOKED"`. Item and session dialogs edit the form state only; nothing is stored before submit (spec › Sessions). | One transaction for everything (D-4). The form and the action share `createProjectInputSchema`. |
| D-11 | **Client picker:** a server action `searchActiveClientsAction(q)` returns at most 8 active clients (`combobox.md`), with a debounce of 250 ms. **Inline create** uses F-06's `ClientDialog`. F-06's `addClient` result is **extended** to return the new client's `{ id, name, whatsappNumber }`, so the picker can select it (AC-PRJ-013). | The client list can grow, so it isn't sent whole. Extending F-06's result is additive: F-06's own callers ignore the new field. |
| D-12 | **New UI primitives and patterns:**<br>- `Checkbox` primitive (C05);<br>- `Combobox` pattern (C36);<br>- `MultiSelect` pattern (C20);<br>- `DateField` with a calendar popover (C25 Calendar Day) and a `TimeField`, on React Aria `DatePicker` / `TimeField`;<br>- `Select` gains option **sections** (services grouped by category, spec › Inputs).<br>Adds the dependency `@internationalized/date` (pinned), recorded in `tech-stack.md`. | Coding rules: features never hand-roll selects, menus or pickers. React Aria's date components need `@internationalized/date`'s `CalendarDate` / `Time` types. It is already installed transitively by `react-aria-components`; declaring it pins the version that is used directly. |
| D-13 | **One project menu model** (`buildProjectMenu(status, hasWhatsappNumber)`, pure, in the domain) feeds the list row menu, the phone row sheet and the detail menu. The *Kirim ke klien* group label is shown on desktop menus. On phones a local group label sits in the sheet (design.md › COMPONENT GAP). | AC-PRJ-027 and the spec's menu table. One source keeps the three surfaces identical. Later features (F-10…F-15) add items to this model. |
| D-14 | ***Tambah nomor WhatsApp*** needs the client's whole record for F-06's edit dialog. F-07 adds the `getClient` use case and `loadClientForEditAction(workspaceId, clientId)`. | F-06's edit dialog is fed from list rows; projects don't carry a client's social links. |
| D-15 | **Detail sessions save immediately:** the add, edit and delete actions each run in their own transaction, then the page is refreshed and a toast shown. The last-session guard and the `CANCELLED` guard are re-checked under the project lock (D-2). | Spec › Sessions (detail). |
| D-16 | **Shell:** `projects` and `new-project` leave `COMING_SOON_SECTIONS`. The shell's create action and the Bottom Nav CTA link to `/projects/new`. The heading resolver returns *Proyek* with the three tabs for the list routes and the Compact Bar for `/projects/new` and `/projects/[id]` (sub-pages, no Bottom Nav). | A-1, F-17. |

## Architecture

```text
app/(owner)/w/[workspaceId]/projects/page.tsx              → Aktif        → composition › loadProjects(…, "ACTIVE", params)
app/(owner)/w/[workspaceId]/projects/completed/page.tsx    → Selesai
app/(owner)/w/[workspaceId]/projects/cancelled/page.tsx    → Dibatalkan
app/(owner)/w/[workspaceId]/projects/new/page.tsx          → loadCreateProjectOptions
app/(owner)/w/[workspaceId]/projects/[projectId]/page.tsx  → loadProjectDetail
app/(owner)/w/[workspaceId]/projects/**/loading.tsx        → skeletons
app/actions/booking/projects.ts         → create, info, deal edits, sessions, steps, cancel, delete, load more, client search, client for edit
composition/booking/project-scope       → repositories on the request DB + token generator + clock
composition/booking/project-flow        → verify workspace + use cases + logging + not-found mapping
features/booking/domain                 → status, steps, menu, title/notes/price, cancel reason, sessions, shown session,
                                          booking-field values, item list, list query/filter
features/booking/application            → ports, schemas, errors, results, use cases
features/booking/ui                     → list (table/phone), filter, row menu, create form, item/session/field dialogs,
                                          detail, status/cancel/delete dialogs, skeletons, copy
adapters/db/schema/booking/project.ts   → project, project_item, project_field_value, project_session
adapters/db/project-repository          → Drizzle ProjectRepositoryPort (writes, detail) + ProjectListReader (list SQL)
```

Shared changes:

| Unit | Location | Change |
|---|---|---|
| `Checkbox` | `ui/primitives/checkbox` | New (C05): unchecked, checked, mixed, disabled, focus |
| `Combobox` | `ui/patterns/combobox` | New (C36): async items, group label with the count, create row, no-results row; the menu opens inline under the field on phones too (export `new-pilih-klien-mobile-lJ7dl`) |
| `MultiSelect` | `ui/patterns/multi-select` | New (C20): checkbox menu items, value summary (*Dibooking, Pemotretan*), phone sheet |
| `DateField`, `TimeField` | `ui/patterns/date-field`, `ui/primitives/time-field` | New: Text Field look with a trailing `calendar` / `clock` icon; `display` *10 Nov 2026* or *Sel, 10 Nov 2026* (exports); calendar popover built from Calendar Day C25 (not drawn in F-07) |
| `Select` sections | `ui/patterns/select` | `SelectOption.section?` renders Menu Group Labels (the category) |
| `IconButton` badge | `ui/primitives/icon-button` | `badgeCount?` renders Count Badge/Danger (design.md › filter counter gap) |
| Money display | `features/booking/domain/idr-amount` | none: `formatIdr` (*Rp 750.000*) is reused; the F-07 frames were aligned to it (Owner 2026-10-02) |
| `PageHeader` detail | `ui/patterns/page-header` | `titleAdornment?` (the Status Chip beside the title) and `meta?`. The actions slot already exists (design.md › Page Header gap). |
| Icons | `ui/primitives/icon` | `list-filter`, `calendar`, `calendar-plus`, `calendar-check`, `clock`, `camera`, `circle-check-big`, `refresh-cw`, `send` (if missing) |
| Owner shell | `features/workspace/{domain/coming-soon-sections,ui/owner-nav}` | D-16 |

Each new shared unit gets a Storybook story (ADR-014) and a co-located test.

## Database Changes

Migration `0009_project`, generated by drizzle-kit. Every table carries `workspace_id`, and every cross-table reference is a composite `(workspace_id, x_id)` FK (ADR-003).

**`project`**

| Column | Type / rule |
|---|---|
| `id` | uuid PK |
| `workspace_id` | uuid NOT NULL → `workspace(id)` RESTRICT |
| `client_id` | uuid NOT NULL; `(workspace_id, client_id)` → `client(workspace_id, id)` **RESTRICT** (AC-PRJ-024, BR-CLI-003) |
| `service_id` | uuid NOT NULL; `(workspace_id, service_id)` → `service(workspace_id, id)` **RESTRICT** (origin only; BR-CAT-008) |
| `title` | text NOT NULL, CHECK 1–100 chars and trimmed (BR-PRJ-008) |
| `notes` | text NULL, CHECK `char_length <= 2000` |
| `agreed_price` | numeric(18,3) NOT NULL, CHECK whole, `>= 0`, `<= 999999999999` (BR-PRJ-008, BR-CUR-003) |
| `currency` | text NOT NULL, CHECK `= 'IDR'` (BR-PRJ-007, BR-CUR-001) |
| `status` | text NOT NULL, CHECK in the 7 lifecycle values (BR-PRJ-004) |
| `client_access_token` | text NOT NULL, **UNIQUE**, CHECK `~ '^[A-Za-z0-9_-]{43}$'` (D-6) |
| `cancelled_at`, `cancelled_by`, `cancel_reason` | timestamptz NULL, text NULL → `user(id)` SET NULL, text NULL ≤ 500. CHECK: `status = 'CANCELLED'` ⇔ `cancelled_at is not null` (BR-AUD-001, A-8) |
| `created_by`, `updated_by` | text NULL → `user(id)` SET NULL (A-8) |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() |

Constraints and indexes: `tenantKey` UNIQUE `(workspace_id, id)`; `project_workspace_status_ix (workspace_id, status, created_at desc)`; `project_workspace_client_ix (workspace_id, client_id)`; `project_workspace_service_ix (workspace_id, service_id)`.

**`project_item`**: `id`, `workspace_id`, `project_id`, `definition_id`, `name`, `value_type`, `value`, `unit`, `selection_required`, `selection_type`, `sort_order`, audit columns.
- FKs:
  - `(workspace_id, project_id)` → `project` **CASCADE** (a draft delete removes its snapshots);
  - `(workspace_id, definition_id)` → `service_item_definition` **RESTRICT** (AC-PRJ-024).
- `UNIQUE (workspace_id, project_id, definition_id)`: one item per definition (BR-PRJ-009).
- CHECKs repeat the definition rules: `value_type` in NUMBER/RANGE; `value` is a JSON object; `selection_required = (selection_type is not null)`; selection items are NUMBER.

**`project_field_value`**: `id`, `workspace_id`, `project_id`, `field_key`, `field_name`, `field_type`, `is_required`, `options` (jsonb NULL), `value` (jsonb NULL), `sort_order`, audit columns.
- `(workspace_id, project_id)` → `project` CASCADE.
- `UNIQUE (project_id, field_key)` (BR-PRJ-002; architecture mapping rules).
- CHECKs: the type list; options present ⇔ SELECT.

**`project_session`**: `id`, `workspace_id`, `project_id`, `name`, `session_date` (date), `start_time` (time NULL), `end_time` (time NULL), `location` (text NULL), audit columns, `updated_by`.
- `(workspace_id, project_id)` → `project` CASCADE.
- CHECKs: name 1–100 and trimmed; location ≤ 200; `end_time is null or (start_time is not null and end_time > start_time)` (BR-TEAM-003).
- Index `project_session_order_ix (project_id, session_date, start_time nulls first, created_at)`.

There is no backfill. The agent generates 0009, reviews it, commits it and applies it with `pnpm db:migrate` against the shared non-production database (AGENTS.md; the change is additive). The run is reported.

## Server / API Interface

All entries take the workspace ID from the route only (ADR-015). Malformed, unknown or foreign IDs → `notFound()` (AC-PRJ-025).

| Entry | Input (untrusted unless noted) | Result |
|---|---|---|
| `GET …/projects[/completed\|/cancelled]` | route + search params | first page, tab count, filter options, filter state |
| `GET …/projects/new` | route | active services grouped by category, item definitions, `hasActiveService` |
| `GET …/projects/[projectId]` | route | `ProjectDetail` (no token) |
| `loadMoreProjectsAction(wsId, query)` | `{ tab, q, filter, afterId }` | `{ items, nextCursor }` |
| `searchActiveClientsAction(wsId, q)` | text | ≤ 8 `{ id, name, whatsappNumber, projectCount }` |
| `loadClientForEditAction(wsId, clientId)` | uuid | F-06 `ClientRecord` |
| `createProjectAction(wsId, input)` | `CreateProjectInput` + `mode` | `{ ok:true, projectId }` (then redirect + toast) \| `ProjectValidationFailure` |
| `updateProjectInfoAction(wsId, projectId, input)` | `{ title, agreedPrice?, notes }` | `undefined` \| failure (`DEAL_LOCKED` when the price changes after `BOOKED`) |
| `addProjectItemAction` / `updateProjectItemValueAction` / `removeProjectItemAction` | definition ID + value / item ID + value / item ID | `undefined` \| failure |
| `updateProjectFieldValuesAction(wsId, projectId, values)` | `Record<fieldKey, raw>` | `undefined` \| failure |
| `addSessionAction` / `updateSessionAction` / `deleteSessionAction` | `SessionInput` / ID + input / ID | `undefined` \| failure (`LAST_SESSION`, `PROJECT_CANCELLED`) |
| `advanceProjectAction(wsId, projectId, step)` | `CONFIRM_BOOKING \| START_SHOOTING \| FINISH_SHOOTING` | `undefined` \| `{ ok:false, code:"STALE" \| "SESSION_REQUIRED" }` |
| `cancelProjectAction(wsId, projectId, reason)` | text ≤ 500 | `undefined` \| failure (`REASON_REQUIRED`, `STALE`) |
| `deleteDraftAction(wsId, projectId)` | — | redirect to the list + toast \| `{ ok:false, code:"STALE" }` |

Writes call `revalidatePath("/w/[workspaceId]/projects", "layout")` on success. An unexpected failure throws the generic `ProjectError("SAVE_FAILED")`; the client shows Toast/Danger *Perubahan belum tersimpan* with *Coba lagi* (C-007).

## Domain / Application Logic

**Domain (`features/booking/domain`, pure).** Rules are Zod schemas where they validate input (the F-06 style), and plain functions otherwise.

| Unit | Responsibility |
|---|---|
| `project-status` | `PROJECT_STATUSES`; `PROJECT_TABS` (`ACTIVE` = DRAFT…DELIVERED, `COMPLETED`, `CANCELLED`; A-4); `PROJECT_STEPS` with `stepTransition(step) → { from, to }`; `nextStep(status)`; `isDealEditable` (DRAFT/BOOKED, BR-PRJ-009); `isScheduleEditable` (≠ CANCELLED); `canCancel` (BOOKED/SHOOTING; DRAFT is not offered, A-10); `cancelReasonRequired` (SHOOTING); `canDeleteDraft` (DRAFT) |
| `project-menu` | `buildProjectMenu({ status, hasWhatsappNumber }) → groups` (D-13, AC-PRJ-027) |
| `project-record` | `PROJECT_TITLE_MAX_LENGTH = 100`, `PROJECT_NOTES_MAX_LENGTH = 2000`, `CANCEL_REASON_MAX_LENGTH = 500`. Schemas `projectTitleSchema`, `projectNotesSchema` (blank → null), `agreedPriceSchema` (reuses `parseIdrAmount`, BR-CUR-003), `cancelReasonSchema`. `defaultProjectTitle(service, client)` cut to 100 (A-2). |
| `session` | `SESSION_NAME_MAX_LENGTH = 100`, `SESSION_LOCATION_MAX_LENGTH = 200`. `sessionInputSchema` (`EMPTY`, `TOO_LONG`, `END_WITHOUT_START`, `END_NOT_AFTER_START`; BR-TEAM-003). `compareSessions` (date, start time with nulls first, creation). `pickShownSession(sessions, today)` → `{ session, extraCount, isPast }` (A-12). `formatSessionWhen` (*Sel, 10 Nov 2026 · 07.30*) |
| `booking-field-value` | `bookingFieldValueSchema(field)` per type (A-3): TEXT 1–200 / TEXTAREA 1–2000, trimmed; NUMBER decimal; DATE ISO date; BOOLEAN `true`/`false`; SELECT one of the snapshotted options. Blank optional → `null`; blank required → `REQUIRED`. `validateFieldValues(fields, raw)` collects every problem (coding rules › errors). |
| `project-items` | `validateItemList(items)`: one item per definition (`DUPLICATE_DEFINITION`); each value checked with `findPackageValueProblem` (BR-CAT-001/002). Reuses `package-value`. |
| `project-list-query` | `PROJECT_PAGE_SIZE = 30`, `PROJECT_SEARCH_MAX_LENGTH = 100`. `projectListParamsSchema` parses the URL: an invalid part is ignored, except `to < from`, which is reported (A-11). `activeFilterGroupCount(filter)` drives the red counter. The status filter is ignored outside *Aktif*. |
| `schedule-clock` | `PROJECT_SCHEDULE_TIME_ZONE = "Asia/Jakarta"`; `todayInScheduleZone(now)` → `YYYY-MM-DD` (D-9) |

**Application (`features/booking/application`):**

- **Ports:**
  - `ProjectRepositoryPort`: create snapshot; find detail; lock-and-apply helpers per change;
  - `ProjectListReaderPort`: `listPage(context, query, today)` and `count(context, tab)`;
  - `AccessTokenGeneratorPort`.
- **Repository contract:** each mutating call runs its own transaction with `FOR UPDATE` on the project row (D-2). It returns a discriminated result, for example `"UPDATED" | "NOT_FOUND" | "DEAL_LOCKED" | "STALE" | "LAST_SESSION" | "PROJECT_CANCELLED"`. The status rule is passed in as the domain predicate, so the repository holds no policy.
- **Schemas:**
  - `createProjectInputSchema`: `clientId`, `serviceId`, `title`, `agreedPrice`, `notes`, `items[{ definitionId, value }]`, `sessions[SessionInput]`, `fieldValues: Record<key, string \| boolean \| null>`, `mode`;
  - `projectInfoInputSchema`, `sessionInputSchema` (from the domain);
  - `projectStepSchema`, `cancelProjectInputSchema`;
  - `projectListQuerySchema`;
  - `projectIdSchema`, `sessionIdSchema`, `projectItemIdSchema`.
- **Errors:** `ProjectError` (`NOT_FOUND`, `SAVE_FAILED`), with codes only (C-103).
- **Results:** `ProjectValidationFailure = { ok:false, code:"VALIDATION_FAILED", fieldErrors }`, keyed by paths:
  - `clientId`, `serviceId`, `title`, `notes`, `agreedPrice`;
  - `items.N.value` / `.min` / `.max`;
  - `sessions`, `sessions.N.*`;
  - `fieldValues.<key>`.

  Plus the domain failures `{ ok:false, code: "CLIENT_INACTIVE" | "SERVICE_INACTIVE" | "DEAL_LOCKED" | "STALE" | "SESSION_REQUIRED" | "LAST_SESSION" | "PROJECT_CANCELLED" | "DUPLICATE_DEFINITION" | "DEFINITION_INACTIVE" | "REASON_REQUIRED" }`.
- **Use cases:**

  | Use case | Behaviour (AC) |
  |---|---|
  | `listProjects` / `countProjects` | Parse the query and fetch `limit 31`. Return 30 + `nextCursor`. The count ignores search and filter (001…005, 028) |
  | `getProjectDetail` | Detail + `pickShownSession` + `nextStep` + `buildProjectMenu` + edit flags (015, 016, 018) |
  | `loadCreateOptions` | Active services with their items and fields, grouped by category; active item definitions; `hasActiveService` (006, 014) |
  | `searchActiveClients` | Active clients only, ≤ 8, name contains q (006, 013) |
  | `createProject` | Validate everything and collect field errors. `BOOKED` needs ≥ 1 session (`sessions: SESSION_REQUIRED`). Generate the token, then call `repository.createSnapshot` (D-4) (007…012, 029, 030) |
  | `updateProjectInfo` | Title and notes always (except `CANCELLED`). A price change requires `isDealEditable` (A-6, 017, 018) |
  | `addProjectItem` / `updateProjectItemValue` / `removeProjectItem` | `isDealEditable` under lock. Add snapshots an active definition that isn't in the project yet and appends it last (A-7) (017, 019) |
  | `updateProjectFieldValues` | `isDealEditable`. Values are validated against the stored metadata only; metadata never changes (017) |
  | `addSession` / `updateSession` / `deleteSession` | `isScheduleEditable`. Delete needs > 1 session when the status is BOOKED or later (029) |
  | `advanceProject` | `stepTransition(step)` and conditional on the stored `from`. `CONFIRM_BOOKING` needs ≥ 1 session (009, 020, 021, 029) |
  | `cancelProject` | `canCancel`. The reason is required from SHOOTING. Records `cancelled_at` / `cancelled_by` / `cancel_reason` (022) |
  | `deleteDraft` | `canDeleteDraft` under lock; the snapshots cascade (023) |
  | `getClient` | For *Tambah nomor WhatsApp* (D-14, 027) |

**Composition (`composition/booking/project-flow`):** as F-06's client-flow:
- verify the workspace;
- parse IDs (a malformed one → `notFound()`);
- resolve the actor with `requireOwnerOrRedirect` for writes;
- compute `today` (D-9);
- map `NOT_FOUND` → `notFound()`;
- log `project.save_failed` with `{ workspaceId, projectId?, operation }` only, then throw `SAVE_FAILED`.

## UI Components

Built from `exports/` ([design.md](design.md)). All copy lives in `project-copy` (design.md › Copy).

| Unit | Location | Exports |
|---|---|---|
| `PROJECT_COPY` | `features/booking/ui/project-copy` | all |
| `ProjectsScreen` (desktop/phone switch, appended pages, dialogs) | `ui/projects-screen` | `list-*` |
| `ProjectsTable` (DataTable: *Daftar proyek* + count, search + filter button, PROYEK · ACARA · STATUS · ⋯, 16 gap) | `ui/projects-table` | `list-*-desktop-*` |
| `ProjectList` (Compact/Flush card, rows, *Baru* Primary) | `ui/project-list` | `list-*-mobile-*` |
| `ProjectsTabsBar`, `ProjectSearchField` | `ui/projects-tabs-bar`, `ui/project-search-field` | controls |
| `ProjectFilterDialog` (Modal MD / Bottom Sheet Form; Status · Jadwal · Layanan · Klien; *Reset* / *Terapkan*) | `ui/project-filter-dialog` | `filter-*`, `list-filter-diterapkan-*` |
| `ProjectsEmptyState` | `ui/projects-empty-state` | `list-empty-*`, `list-no-match-*` |
| `ProjectStatusChip` (tone map, decision 1 in design-handoff) | `ui/project-status-chip` | all |
| `ProjectSessionSummary` (ACARA cell / meta line) | `ui/project-session-summary` | list, detail header |
| `ProjectMenu` (Action Menu / Bottom Sheet Actions from `buildProjectMenu`; *Chat WhatsApp* link; *Tambah nomor WhatsApp*) | `ui/project-menu` | `list-row-menu-*`, `list-row-actions-sheet-*`, detail ⋯ |
| `ProjectStepDialogs` (cancel, delete draft) + `useProjectActions` (steps, toasts, stale reload) | `ui/project-status-dialogs`, `ui/use-project-actions` | `detail-batalkan-*`, `detail-hapus-draf-*`, toasts |
| `CreateProjectScreen` (form shell, cards, action bar) | `ui/create-project-screen` | `new-*` |
| `ClientPicker` (Combobox + F-06 `ClientDialog`) | `ui/client-picker` | `new-pilih-klien-*`, `new-klien-baru-*` |
| `ServicePicker` (Select with sections, base price helper, no-active alert) | `ui/service-picker` | `new-tanpa-layanan-aktif-*`, `new-layanan-tidak-aktif-*` |
| `PackageItemsCard` + `ProjectItemDialog` + `RemoveItemDialog` (create and detail) | `ui/package-items-card`, `ui/project-item-dialog` | `new-tambah-item-*`, `new-ubah-nilai-*`, `new-hapus-item-*` |
| `SessionsCard` + `SessionDialog` + `DeleteSessionDialog` | `ui/sessions-card`, `ui/session-dialog` | `new-sesi-form-*`, `detail-sesi-terakhir-*`, `detail-hapus-sesi-*` |
| `BookingFieldsCard` + `BookingFieldInput` (renders by type) + `BookingFieldsDialog` | `ui/booking-fields-card`, `ui/booking-field-input`, `ui/booking-fields-dialog` | create and `detail-ubah-field-booking-*` |
| `ChangeServiceDialog` | `ui/change-service-dialog` | `new-ganti-layanan-*` |
| `ProjectDetailScreen` (header, Info facts, cards, cancelled alert, phone action bar) | `ui/project-detail-screen` | `detail-*` |
| `ProjectInfoDialog` | `ui/project-info-dialog` | `detail-ubah-info-*` |
| `ProjectsSkeleton`, `ProjectDetailSkeleton` | `ui/projects-skeleton` | `list-loading-*` |
| `useCreateProjectForm` (RHF + title rule A-2 + service change confirm + submit) | `ui/use-create-project-form` | create |
| `useLoadMoreProjects`, `useClientSearch` | hooks | list, picker |
| `projectFieldErrorText` | `ui/project-field-error` | all errors |

**Layout:**
- **Desktop:** the 720 column (`size.content-narrow`). List tabs sit in the Page Header. The detail header uses `PageHeader` `titleAdornment` / `meta` and an actions slot holding the step Button and the Action Menu MD.
- **Phone:**
  - the list keeps the Bottom Nav, with the Segmented Control and then the search + filter row;
  - create and detail are sub-pages: Compact Bar and a sticky action bar, no Bottom Nav.
- **Literal sizes** (design.md: they can't bind in Pencil): container 720, columns 240 / 124 / 32, search 320. Each comes from the design and is marked as such.

## Validation

- **Client:** `zodResolver` with the shared schemas, for feedback only.
- **Server:** every action re-parses with the same schema. Item metadata, field metadata, status, currency and token are never read from the request (C-004).
- **DB:** CHECKs on title, notes, price, currency, status, cancellation coherence, session times and lengths, and item value type and selection; unique `(project_id, definition_id)` and `(project_id, field_key)`; composite FKs with RESTRICT to client, service and definition.
- **JSONB:** item values are parsed with the package-value schema and field values with `bookingFieldValueSchema` on every read. A malformed row is a bug: it throws and is logged generically.

## Error Handling

| Case | Result (copy from design.md) |
|---|---|
| Field errors (title, notes, price, client, service, item values, sessions, booking fields) | Path-keyed `fieldErrors` → field messages. On create, all are reported at once (AC-PRJ-010, 011, 029) |
| `BOOKED` without a session | `sessions: SESSION_REQUIRED` → *Tambahkan minimal satu sesi.* under *Jadwal* |
| Client archived / service inactive meanwhile | `CLIENT_INACTIVE` / `SERVICE_INACTIVE` → error on that field; the form keeps its input (AC-PRJ-012) |
| Foreign or unknown client, service, definition or project | `notFound()` (AC-PRJ-012, 025) |
| Duplicate or inactive definition | `items: DUPLICATE_DEFINITION` → *Item ini sudah ada di proyek* · `DEFINITION_INACTIVE` → definition field error |
| Deal edit after `BOOKED` | `DEAL_LOCKED` → Toast/Danger *Detail paket tidak bisa diubah lagi*, then `router.refresh()` (AC-PRJ-018, 019) |
| Stale or invalid step | `STALE` → toast *Status proyek sudah berubah*, then refresh (AC-PRJ-021, 027) |
| *Konfirmasi booking* without a session | `SESSION_REQUIRED` → toast *Tambahkan minimal satu sesi sebelum konfirmasi booking.* and the session dialog opens (AC-PRJ-029) |
| Last session / cancelled project | `LAST_SESSION` (the button is disabled anyway) / `PROJECT_CANCELLED` → toast + refresh |
| Cancel from `SHOOTING` without a reason | `reason: REASON_REQUIRED` field error |
| Unexpected failure | `SAVE_FAILED` → Toast/Danger *Perubahan belum tersimpan* + *Coba lagi*; the form keeps its input |

## Concurrency / Consistency

- **Create (C-005):**
  - one transaction holding `FOR SHARE` on the client, the service and each definition;
  - the client's and the definitions' composite RESTRICT FKs make a concurrent F-06 / F-05 delete fail (AC-PRJ-024);
  - the unique token index makes a token collision fail loudly (practically impossible at 256 bits).
- **Status moves:** `UPDATE … WHERE id = ? AND workspace_id = ? AND status = :from`. Zero rows means another tab moved it first: `STALE` or `NOT_FOUND` (AC-PRJ-021).
- **Deal edits, session deletes and cancel:** `SELECT … FOR UPDATE` on the project, then the domain predicate, then the write (AC-PRJ-019, 029).
- **List:** keyset is stable under inserts. The count is a separate query, as in F-06.
- **Otherwise last write wins** (A-9).

## Security

- Every query filters by the verified `workspaceId` (C-101). Composite FKs stop cross-workspace references (AC-PRJ-025).
- **Token (D-6):** never selected, never returned, never logged. A unit test fails if `client_access_token` appears in any F-07 select list.
- **Logs** carry IDs, operation and code only. They never carry a title, notes, client name, number, cancel reason, search query or `wa.me` URL (C-103).
- ***Chat WhatsApp*** is `<a href="https://wa.me/<digits>" target="_blank" rel="noopener noreferrer">`, built in the browser from the client's stored number, with no text (BR-MSG-001, C-106).
- **Internal notes** never leave Owner routes (BR-PRJ-008).

## Testing Strategy

| AC | Tests |
|---|---|
| AC-PRJ-001 | unit: `pickShownSession`, `formatSessionWhen`, table/list rows, chip tones · integration: *Aktif* order with the AC fixture and a fixed `today` · E2E list |
| AC-PRJ-002 | integration: the *Selesai* / *Dibatalkan* order and no-session last · E2E tabs |
| AC-PRJ-003 | unit: three empty states · E2E new workspace |
| AC-PRJ-004 | integration: title or client name `ILIKE`, wildcards escaped, scoped to the tab · unit: search field URL · E2E |
| AC-PRJ-005 | integration: 65 rows → 30 / 60 / 65, no gaps · unit: load-more hook |
| AC-PRJ-006 | unit: `loadCreateOptions`, `searchActiveClients` (archived excluded) · E2E picker |
| AC-PRJ-007 | unit: `defaultProjectTitle`; form hook (title kept after an edit; price and items prefilled; field order) |
| AC-PRJ-008 | integration: one transaction creates the project, items, field values and session; currency IDR; token length and uniqueness; no token in the detail result · unit: no F-07 result type exposes the token |
| AC-PRJ-009 | integration: draft, then `CONFIRM_BOOKING` · E2E |
| AC-PRJ-010 | unit: `validateFieldValues` (required, `XL` not in the options) · integration: nothing created |
| AC-PRJ-011 | unit: title, notes and price schemas; client required |
| AC-PRJ-012 | integration: archive client / archive service before create → codes, no rows; foreign service → not found |
| AC-PRJ-013 | unit: `ClientPicker` selects the created client and updates the default title; cancel changes nothing |
| AC-PRJ-014 | unit: no-service alert, buttons disabled · E2E |
| AC-PRJ-015 | unit: detail screen per status · E2E |
| AC-PRJ-016 | integration: catalog edits and archive after create leave the detail unchanged |
| AC-PRJ-017 | unit: item and field rules · integration: each deal edit; the added item copies the definition and goes last; the service is unchanged; errors |
| AC-PRJ-018 | unit: detail flags per status · integration: deal edit in SHOOTING → `DEAL_LOCKED`; title and notes allowed |
| AC-PRJ-019 | integration: `Promise.all(start shooting, update item)` → one of the two orders; the item stays 25 when the step wins |
| AC-PRJ-020 | unit: `nextStep`, `stepTransition` · integration: the steps · E2E toasts |
| AC-PRJ-021 | unit: backward/skip steps unrepresentable · integration: concurrent `START_SHOOTING` → one `STALE`; moves from CANCELLED rejected |
| AC-PRJ-022 | unit: `cancelReasonSchema`, `cancelReasonRequired` · integration: actor, time and reason stored; > 500 rejected · E2E banner |
| AC-PRJ-023 | integration: the draft delete cascades; a BOOKED delete is rejected · unit: menus |
| AC-PRJ-024 | integration: deleting the client, service or definition after create → `IN_USE` (real FKs; completes F-06's AC-CLI-015) |
| AC-PRJ-025 | integration: every repository call with workspace B → nothing; composite-FK insert with B's client fails · E2E foreign URL |
| AC-PRJ-026 | E2E: axe (wcag2a/2aa/21a/21aa) on the list, filter, create, detail and dialogs at 1440 and 390, light and dark; keyboard paths; focus return |
| AC-PRJ-027 | unit: `buildProjectMenu` table for every status and the no-number case; `wa.me` href · E2E row step from the menu |
| AC-PRJ-028 | unit: `projectListParamsSchema` (`to < from`, ignored parts), `activeFilterGroupCount` · integration: status, date-range and no-schedule filters · E2E reload keeps the filters |
| AC-PRJ-029 | unit: `sessionInputSchema` table, `compareSessions` · integration: create without a session, confirm without a session, last-session delete, cancelled guard |
| AC-PRJ-030 | integration: create with edited / removed / added items → exact items; the service unchanged · unit: service-change confirm resets items |

## Implementation Iterations

See [plan.md](plan.md): vertical slices by screen (Slice 0–8), test-first, one commit per step.
- **Slice 0** stops unless F-06 is built and merged.
- **Slice 1** (step 1.2) generates and applies migration 0009.
- **Slice 8** is the browser fidelity check against the exports.

## Assumptions (technical, reversible)

- **TD-A-1:** *today* is the `Asia/Jakarta` date (D-9). If a workspace time zone arrives, it replaces the constant.
- **TD-A-2:** search and filters use no extra indexes beyond the list and FK indexes. Revisit past a few thousand projects per workspace.
- **TD-A-3:** the client picker shows at most 8 matches (`combobox.md`), without *Lihat semua* in F-07, because the query narrows the list.
- **TD-A-4:** the *Klien* filter offers active and archived clients (filtering past projects needs archived ones), labelled *(diarsipkan)*. The *Layanan* filter includes archived services, as the spec says.
- **TD-A-5:** *Selesai pemotretan* and the other steps show no confirmation (spec). The toasts follow design.md › Copy.

## Risks / Open Questions

- **Base dependency:** F-06 is planned but not built. Slice 0 stops otherwise. Building F-07 first would duplicate `client`, `DataTable` and the client dialog, and clash on migration 0008.
- **Size:** F-07 is the largest feature so far (9 slices). Slices 1–7 each end in UI steps that stop at their own exports.
- **Date and time pickers** are new shared components (D-12). Their keyboard behaviour comes from React Aria and is checked by axe in Slice 8.
- **List SQL complexity (D-8):** the `LATERAL` shown-session expression is shared by the order and the cursor and covered by integration tests with a fixed `today`. If it gets slow, add a partial index on `project_session (project_id, session_date)`, which already exists.
- **D-5 reading of AC-PRJ-008:** a row exists for an empty optional field (value NULL). Reported here for the Owner. It doesn't change behaviour visible in the spec.

## Implementation record — Slice 1 (2026-10-03)

**Scope built:** Slice 0 (base check, merge of `main`, component inventory) and Slice 1 (*Proyek baru*, main path). Commits: `dff27f5` (merge), `3367cb3`, `8cf1388`, `bf0b518`, `21c261c`, `03a8b56`, `32cb537`.

**Migration:** `0009_project` was generated, reviewed (four `CREATE TABLE`, no `DROP` or `RENAME`), committed and then applied to the shared non-production database with `pnpm db:migrate` (`migrations applied successfully!`).

**Checks:**

| Check | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | pass (0 errors; 3 warnings in F-06/F-17 files this slice did not touch) |
| `pnpm test` | pass (275 files, 918 tests) |
| `pnpm test:integration tests/integration/booking` | pass (3 files, 16 tests); the other integration suites were not run |
| `pnpm build` | pass |
| E2E `tests/e2e/projects` + `app-shell-revamp` | pass (projects journeys include axe on the form) |

**AC → test (Slice 1):** AC-PRJ-006 (`create-project`, `load-create-options`, `search-active-clients`, `service-picker`, `client-picker`, E2E) · 007 (`create-project-screen`, `project-record`, shell test) · 008 (`project-repository` integration, `create-project`, E2E) · 009 (draft half: `create-project`, `create-project-screen`, E2E) · 010/011 (`create-project`, `project-record`, `create-project-screen`) · 012 (`project-repository` integration, `create-project`) · 024 (`project-repository` integration) · 029 (`session`, `sessions-card`, `create-project`).

**Deviations and decisions:**

1. **`@internationalized/date` was added by hand.** `pnpm add` refuses to run here (the `node_modules` store differs from the configured store). I edited `package.json` and `pnpm-lock.yaml` (importer entry, `3.12.4`, the version already resolved through `react-aria-components`) and linked the package into `node_modules`. **Owner action:** run `pnpm install` once and confirm the lockfile does not change.
2. **A restrict violation is now "in use" (bug found by AC-PRJ-024).** `ON DELETE RESTRICT` raises `23001`, not `23503`. The client, service, category and definition deletes only recognised `23503`, so deleting a referenced row would have thrown instead of returning `IN_USE`. `isReferencedRowError` in `catalog-repository/pg-error.ts` accepts both. This also closes F-06's carry-over *AC-CLI-015 real foreign-key check*.
3. **Items and the client picker are read-only in this slice (as planned).** *Tambah item*, the item ⋯ and the *Tambah klien baru* row appear in the exports but arrive in Slice 7. The picker's create row is hidden until `onCreate` is wired.
4. **The phone Bottom Nav is hidden on *Proyek baru*.** The exports show a Compact Bar and a sticky action bar and no Bottom Nav, but the plan's Backend table had no shell change for it. `PageHeadingOverride` takes `hidesBottomNav`, passed through `OwnerShell` and `AppShell` (`AppShellSubPage.hidesBottomNav`). The phone CTA E2E in `app-shell-revamp` changed to match (the Bottom Nav *Proyek* tab is hidden on this page, and notifications are opened from the dashboard).
5. **Rows have a leading icon the exports lack.** `ListCardItem` requires exactly one leading icon or avatar (library rule, tested), but the item and session rows in the frames are plain. The rows use `package`/`image` and `calendar`. **Owner decision:** allow plain rows in the library, or redraw the frames.
6. **Title-only card headers are shorter than the frames** (about 65 px against 99 px) because `SectionCard` has no spare description row. Not changed; it is the library unit.
7. **`validateItemList` returns `{ values, errors }`**, not only the errors, so the use case stores the canonical values (`2,5` → `2.5`). The plan's signature returned the errors only.
8. **Combobox:** `allowsCustomValue` makes Escape close the menu and keep the query (React Aria otherwise clears it and reopens the menu); `allowsEmptyCollection` keeps the menu open for the *TIDAK ADA KLIEN “…”* state. The create row is hidden for a blank query.
9. **Placeholder copy:** a choice or yes/no booking field reads *Pilih {field in lower case}* (for example *Pilih ukuran toga*); the frame draws *Pilih ukuran*. The plan gives the rule, the frame one example.
10. **Not unit-tested:** clearing a time segment (jsdom does not deliver the key events React Aria listens to); the arrow keys and the displayed `07.30` are.

**Visual check:** the filled form was compared with `new-terisi-desktop-QeT50` at 1440, and the empty and filled forms with the phone exports at 390. Layout, copy, Compact Bar, sticky bar and the *Wisuda* group label match apart from deviations 3, 5 and 6. The check used a service without items and booking fields, so the item rows and the *Field booking* card were checked by their tests rather than by eye.

## Implementation record — Slice 2 (2026-10-03)

**Scope built:** the project detail page (S3) read-only with the three status steps. Commits: `47d643f` (manual-test fixes to Slice 1), `46cf832` (backend), `4978da9` (screen), and the E2E commit after them.

**Manual-test fixes to Slice 1 (`47d643f`):** the Owner tried the form in the browser and reported four problems. The calendar popover opened at the top-left (the trigger was not wrapped in a React Aria `Group`, so it had no anchor); the client picker and the calendar were not bottom sheets on phones (`Combobox` and `DateField` now switch on `useMobileViewport`, like `Select`); and *Buat proyek* ran off the right edge on a 375 px phone (the footer buttons now shrink). Phone-mode tests were added for the combobox sheet and the calendar sheet.

**Checks:**

| Check | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | pass (0 errors) |
| `pnpm test` | pass (283 files, 956 tests) |
| `pnpm test:integration tests/integration/booking` | pass (20 tests); other integration suites were not run |
| `pnpm build` | pass |
| E2E `tests/e2e/projects` + `app-shell-revamp` | pass (the projects journeys now run the steps and axe on the detail page) |

**AC → test (Slice 2):** AC-PRJ-009 (`advance-project`, `use-project-actions`, E2E) · 015 (`get-project-detail`, `project-detail-screen`, `project-status-chip`, `project-session-summary`, `booking-value-display`, `page-header`, `page-heading-override`) · 016 (`project-repository` integration: catalog edits after create; `project-detail-screen`: locked and cancelled descriptions) · 018 (`get-project-detail`, `project-session-summary`, `project-detail-screen`) · 020 (`advance-project`, `project-repository` integration: two concurrent steps → `MOVED` + `STALE`, `project-detail-screen`, E2E) · 021 (`advance-project`, `use-project-actions`, `project-repository` integration) · 025 (`get-project-detail`, `advance-project`, `project-repository` integration, including `cancellation.byName`).

**Deviations and decisions:**

1. **The phone Bottom Nav is hidden on the detail page**, as on *Proyek baru*. No phone detail export draws a Bottom Nav, including *Pascaproduksi* where there is no step bar either (`hidesBottomNav`). **Owner to confirm.**
2. **No ⋯ menu and no edit controls are rendered**, as the plan says (Slices 5 and 6). The phone Compact Bar therefore shows no actions yet, and `CompactBar` is not changed in this slice.
3. **`PageHeader` / `AppPanel` / `AppShell` gained `titleAdornment` and `meta`**, and `PageHeadingOverride` gained `status` (label, tone, dot) and `meta`. `meta` replaces the subtitle. The phone shows the chip and the session line in the screen's own header block (`ProjectStatusChip`, `ProjectSessionSummaryLine`), without the client.
4. **Two icons were registered**: `calendar-check` (Hugeicons `CalendarCheck01Icon`) and `circle-check-big` (`CheckmarkCircle02Icon`). `ButtonIconName` also allows `camera`. These are the closest Hugeicons to the Lucide names in the exports.
5. **`PackageItemsCard` got an optional `description`** instead of a second card; the detail page passes the *Bisa diubah…*, *Terkunci…* or *Proyek dibatalkan…* text. The project items are mapped to the service-item shape it already takes.
6. **Item, session and field rows keep the leading icon** that `ListCardItem` requires (same as Slice 1 deviation 5). The detail Info and Field booking cards are a plain label/value list (`ProjectFacts`), not a shared pattern, because no existing unit shows facts.
7. **`SPEC GAP` (low risk, resolved with a default):** a cancelled project whose canceller was deleted has `byName = null`. The alert then reads *Dibatalkan pada {tanggal}.* `// not in Pencil`. The cancel date is shown in `Asia/Jakarta`.
8. **The step buttons use `Button` with `iconLeading`.** Pending shows the `loading-03` spinner and the *…* label, which is the existing Button pending state (the export's Loading variant).
9. **`getProjectDetail` takes `today`** from `todayInScheduleZone(new Date())` in `project-flow`, so the shown session is decided on the server.
10. **Not verified in the browser:** the *Dibatalkan*, *Draf*, *Pemotretan* and *Pascaproduksi* views and the toasts' look (they are covered by tests and the E2E). Only a *Dibooking* project was compared by eye against the exports at 1440 and 390.

## Implementation record — Slices 3–5 (2026-10-03)

**Scope built:** the project list (S1, Slice 3), the filter (S1a, Slice 4) and the ⋯ menu with *Ubah info*, *Batalkan proyek* and *Hapus draf* (S1b, S3a, Slice 5). Commits: `2b49f22`, `43a313b` (list), `931b32a`, `d188ba3`, `dc9aad9` (filter), `911c589`, `c33e983` (menu and dialogs).

**Checks:**

| Check | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | pass (0 errors) |
| `pnpm test` | pass (298 files, 1023 tests) |
| `pnpm test:integration tests/integration/booking` | pass (31 tests, incl. `project-list.test.ts`); other integration suites were not run |
| `pnpm build` | pass |
| E2E | **not run.** The Owner asked to run E2E only on the last slice, so steps 3.3 and 5.3 stay open and move to Slice 8 |

**AC → test:** AC-PRJ-001…005 (`project-list` integration, `list-projects`, `projects-screen`, `owner-nav`) · 028 (`project-list-filter`, `project-list` integration, `project-filter-dialog`, `multi-select`, `checkbox`, `icon-button`) · 017/018 (`update-project-info`, `project-repository` integration, `project-info-dialog`) · 022 (`cancel-project`, `project-repository` integration, `project-status-dialogs`) · 023 (`delete-draft`, integration) · 027 (`project-menu`, `project-menu` UI test) · 025 (workspace B cases in every use case and integration).

**Deviations and decisions:**

1. **E2E deferred** (see above).
2. **`Checkbox` uses React Aria `CheckboxField` + `CheckboxButton`**, because `Checkbox` is deprecated in 1.21. `MultiSelect` is a React Aria `Select` with `selectionMode="multiple"`; on phones it opens a sheet of checkboxes.
3. **`IconButton` gained `badgeLabel`** (default *belum dibaca*); the filter button passes *aktif*. Icons added: `list-filter`, `circle-x`.
4. **Filter status ignored outside *Aktif*** and the badge counts four groups, per A-11. The list reads the filter from the URL; *Terapkan* keeps `q`.
5. **`ProjectRepositoryPort` grew** `listServicesForFilter`, `searchClientsForFilter`, `findFilterClient`, `withLockedProject`; `ClientRepositoryPort` grew `findById` (for *Tambah nomor WhatsApp*).
6. **Cancel dialog is not a destructive `Modal`**, because the destructive Modal variant renders no body and the reason field is part of the dialog. The confirm button is Danger. The reason label uses the Textarea's own *Opsional* suffix in BOOKED.
7. **The ⋯ menu opens the dialogs from one host** (`ProjectMenuHost`) used by list rows and the detail page; *Ubah info* from a row loads the project through `loadProjectDetailAction` first.
8. **Phone detail ⋯** goes into the Compact Bar through the new `CompactBarActions` portal.
9. **Several new responsive files carry a paired `max-lines-per-function` disable** with a reason (same practice as `clients-screen`).
10. **Not checked by eye:** the list at 1440 only (the *Aktif* tab with three projects); the filter dialog, menus and cancel/delete dialogs were not compared with their exports.
