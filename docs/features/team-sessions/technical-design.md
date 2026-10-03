# Technical Design — F-08 Team

Status: PLANNED (2026-10-04) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) (AC-TEAM-001…027; 012, 016–019, 024, 025 removed) · Design: [design.md](design.md) (48 exports in `exports/`, read through [`exports/_compact/INDEX.md`](exports/_compact/INDEX.md)) · Diagrams: [activity](diagrams/activity.md), [state](diagrams/state.md) · Plan: [plan.md](plan.md)

## Context

The Owner keeps a list of the freelancers they hire (*Tim*) and records who works each session of a project, in which role. F-08 adds:

- **Tim** at `/w/[id]/team`: members on the *Aktif* and *Arsip* tabs, workspace roles on the *Peran* tab, and the member and role dialogs;
- **staffing on the project detail page (F-07):** an avatar group or a `user-plus` button per session, *Atur tim*, the Penugasan form, and team-aware session and draft delete confirmations.

F-08 has no money (Owner 2026-10-03), sends nothing to freelancers (C-106) and calls no external service. *Buka WhatsApp* is a browser `wa.me` link, as in F-06.

**Base:** F-06 Clients and F-07 Projects are built and merged into `main`, and `main` is merged into `feat/team-sessions` (2026-10-04). F-08 reuses:

- from F-06:
  - BR-CLI-002 normalization: `whatsappNumberSchema`, `formatWhatsappNumber` and `whatsappChatUrl`;
  - the search digits from `searchClientDigits`;
  - the list pattern: `DataTable`, keyset paging, `useLoadMoreClients`, the tabs bar, the search field and the row actions;
  - `ClientDialog`'s form shape, `DeleteClientDialog`'s blocked state, and `clientInitials`;
- from F-07:
  - the `project_session` table, `withLockedProject` / `FOR UPDATE` on the project row (F-07 D-2) and `ProjectDetailRecord`;
  - the *Jadwal* card (`project-detail-cards.tsx`), `SessionRowActions` and `DetailEditing`;
  - `DeleteDraftDialog` and `ProjectConfirmDialog`;
  - the `Select` and `MultiSelect` patterns and `EmptyState` *in-card*.

F-08's migrations are **0010** (tables) and **0011** (role backfill).

## Relevant Authority

- **Constitution:** C-002…C-009, C-101, C-103, C-106. C-005 applies because assignment writes lock the project row (spec › Business Rules).
- **Business rules:**
  - team: BR-TEAM-001…006 (BR-TEAM-007 is deprecated);
  - BR-CLI-002 (numbers), BR-AUTH-001;
  - projects: BR-PRJ-004, BR-PRJ-010;
  - workspace: BR-WS-002, BR-WS-003.
- **ADRs:** ADR-003 (composite FKs, project-path relations), ADR-006 (WhatsApp deep links), ADR-009 (per-request pool, transactions), ADR-010 (Tailwind + React Aria), ADR-015 (URL-scoped workspace), ADR-016 (role seeding in the workspace-creation transaction).
- **No new ADR.** Every decision stays inside the accepted architecture.
  - The three-column FK from an assignment to its session is the *composite project key* that `overview.md` › Data mapping rules already prescribes for project-path relations.
  - There is no new dependency.
- **Rules:** `docs/coding-rules.md` v2.0; `docs/design-system/token-usage.md` v3.1.
- **Component specs** (`docs/design-system/components/`): `table.md`, `tabs.md`, `segmented-control.md`, `section-card.md`, `list-card.md`, `select.md`, `multi-select.md`, `text-field.md`, `icon-button.md`, `avatar.md`, `tooltip.md`, `menu.md`, `action-menu.md`, `modal.md`, `bottom-sheet.md`, `empty-state.md`, `toast.md`.

## Decisions

| # | Decision | Why |
|---|---|---|
| D-1 | **Team joins the `booking` context.** It adds four tables: `team_role`, `team_member`, `team_member_role` and `session_assignment`. | The domain model puts sessions and their assignments in the **Project** aggregate (domain-model.md › Aggregate responsibilities). Assignments must lock the project row and check the session in the same transaction, and the *Jadwal* UI is booking UI. A separate `team` feature couldn't import either (coding rules › boundaries). |
| D-2 | **Member roles are a join table, `team_member_role`.** Its FK to the member is CASCADE and its FK to the role is RESTRICT. | BR-TEAM-005: a role is deleted only while unused, and the database backs the check. A JSONB list of role IDs couldn't carry an FK. Renaming a role changes it everywhere, because rows hold the role ID, not its name (AC-TEAM-009). |
| D-3 | **An assignment references its session through `(workspace_id, project_id, session_id)` → `project_session(workspace_id, project_id, id)`, ON DELETE CASCADE.** `project_session` gains `UNIQUE (workspace_id, project_id, id)`; the migration is additive. | Three rules hold in the database: the session belongs to the project in the route (AC-TEAM-013); deleting a session or a draft deletes its assignments (BR-TEAM-006, AC-TEAM-020); and no row crosses workspaces (C-101). F-07's delete code doesn't change. |
| D-4 | **Assignment writes lock the project row** (`SELECT … FOR UPDATE`, F-07 D-2), then lock the member row `FOR SHARE` and decide from the stored data:<br>1. the project isn't `CANCELLED`;<br>2. the session is in the project;<br>3. the member is in the workspace and active;<br>4. the member holds the role;<br>5. insert.<br>`UNIQUE (session_id, member_id)` decides duplicates, races included; `23505` → `ALREADY_ASSIGNED`. | C-004, C-005, BR-TEAM-006. A cancel that races an add is serialized by the project lock (AC-TEAM-015). Archiving the member, or removing the role from them, takes the member row `FOR UPDATE` and is serialized by the `FOR SHARE` (BR-TEAM-004). |
| D-5 | **Removing an assignment** locks the project row, requires a status other than `CANCELLED`, and deletes by `(workspace_id, project_id, id)`. Zero rows → `NOT_FOUND`. | Spec › Error Cases: a stale or foreign assignment is *not found*. |
| D-6 | ***Aktif*, *Arsip* and *Peran* are routes:** `/team`, `/team/archived` and `/team/roles`. Desktop shows them as Page Header tabs, phones as a full-width Segmented Control. The search is `?q=` (*Aktif* / *Arsip* only). | A-1, F-06 D-3, F-05's tabs. |
| D-7 | **The member list is F-06's list:** keyset paging on `(lower(name), created_at, id)` with the last row's ID as the cursor, page size 30. The search matches the name (`ILIKE`, wildcards escaped) OR the number's digits (`searchClientDigits`). The count ignores the search. | A-3, F-06 D-4 and D-7. The same SQL shape and tests. |
| D-8 | **Number taken:** `UNIQUE (workspace_id, whatsapp_number)` decides, races included. On `23505` the repository reads the holder's name and archived flag in the same workspace and returns `NUMBER_TAKEN`. | AC-TEAM-006, F-06 D-6. Client numbers are in another table, so they never conflict (BR-TEAM-004). |
| D-9 | **Member writes save the whole member** (name, number, email, role IDs) in one transaction:<br>- lock the member row `FOR UPDATE` on edit;<br>- lock each submitted role `FOR SHARE` and require that it is in the workspace (otherwise `NOT_FOUND`);<br>- update the row, then replace the `team_member_role` rows. | AC-TEAM-004, 007. `FOR SHARE` on the roles serializes with a role delete, which takes the role `FOR UPDATE` (D-10). Replacing the roles never touches assignments: an assignment keeps its role (AC-TEAM-007 step 1). |
| D-10 | **Role delete** locks the role row `FOR UPDATE` and counts its **usage**: the distinct members who hold it or have an assignment in it. Usage > 0 → `IN_USE` with the count, otherwise delete. The RESTRICT FKs back it (`23503` → recount, `IN_USE`). The *DIPAKAI* column shows the same usage count. | BR-TEAM-005 (*no member and no assignment uses it*). The copy *Peran ini masih dipakai {n} anggota.* counts people, and one count serves both places (TD-A-2). |
| D-11 | **Member delete** locks the member row `FOR UPDATE`. Any assignment → `HAS_ASSIGNMENTS`, otherwise delete (its role rows cascade). The RESTRICT FK on `session_assignment.member_id` backs it (`23503` → `HAS_ASSIGNMENTS`). | BR-TEAM-004, AC-TEAM-007. |
| D-12 | **Seeding (BR-TEAM-005, A-9):** `seedDefaultTeamRoles` runs in `withWorkspaceCreationScope` (ADR-016) beside the item-definition seed, with `ON CONFLICT DO NOTHING` on the case-insensitive name index. The custom migration **0011** backfills existing workspaces and skips names they already have, ignoring case. | AC-TEAM-008. The same mechanism as F-05's `0007` / `seedDefaultItemDefinitions`. |
| D-13 | **The project detail carries the team.**<br>- `ProjectDetailRecord` gains `assignments: SessionAssignmentRecord[]`, loaded in `findDetail`'s `Promise.all` and ordered by session, `created_at`, `id` (A-4).<br>- The detail page also loads `assignableMembers` (active members with their roles, by name) through the team scope.<br>- The Penugasan form hides members already on the session (UX only; D-4 re-checks). | Every *Jadwal* state (avatar group, `user-plus`, ⋯ item, *Atur tim*, delete counts) comes from one server render. A workspace has tens of freelancers, so preloading avoids a loading state that isn't drawn (TD-A-3). |
| D-14 | **Draft delete knows about the team.** `ProjectListRow` gains `hasTeam` (`EXISTS` on `session_assignment` by project). `StatusDialogTarget` / `ProjectMenuTarget` gain an optional `hasTeam`. `DeleteDraftDialog` appends *Penugasan tim ikut terhapus.* when it is true. The detail target sets it from `assignments.length > 0`. | AC-TEAM-020. *Hapus draf* opens from the list row menu as well as from the detail, so both need it. |
| D-15 | **Team writes save immediately** and then refresh the page (`revalidatePath` + `router.refresh()`), as F-07 D-15. *Atur tim* and the Penugasan form are driven by one pure reducer (`sessionTeamFlow`):<br>- `user-plus` / *Tambah tim* → assign (return: none);<br>- avatar group / *Atur tim* → team;<br>- team › *Tambah anggota* → assign (return: team);<br>- saving goes back to `returnTo` or closes;<br>- the team view closes when the refreshed session has no assignments. | A-12, AC-TEAM-011, 014. A reducer keeps the dialog flow testable without a DOM. |
| D-16 | **Shared UI changes (additive):**<br>- `Icon` + `user-plus`;<br>- `MultiSelect` + `errorMessage`, `description` and an optional `createAction` (*Tambah peran baru*);<br>- `IconButton` + `tone="danger"` (the `trash-2` row action; design.md › COMPONENT GAP);<br>- a feature-local `SessionTeamAvatars` (avatar group; design.md › COMPONENT GAP: not promoted to `src/ui` yet). | Coding rules: features never hand-roll selects or menus. `tone="danger"` uses `color/semantic/status/danger/fg`, as the design overrides it. |
| D-17 | **Shell:** `team` leaves `COMING_SOON_SECTIONS`. `resolvePageHeading` returns *Tim* with the subtitles from the exports and the tabs *Aktif · Arsip · Peran*. The nav item stays active on every `/team/*` route. *Tim* isn't added to the bottom nav (A-1). | F-17's slot is kept: same label, icon and position. |

## Architecture

```text
app/(owner)/w/[workspaceId]/team/page.tsx            → Aktif  → composition › loadTeamMembers(…, "ACTIVE", q)
app/(owner)/w/[workspaceId]/team/archived/page.tsx   → Arsip  → loadTeamMembers(…, "ARCHIVED", q)
app/(owner)/w/[workspaceId]/team/roles/page.tsx      → Peran  → loadTeamRoles
app/(owner)/w/[workspaceId]/team/**/loading.tsx      → skeletons
app/(owner)/w/[workspaceId]/projects/[projectId]/page.tsx  (+ loadAssignableMembers, assignment actions)
app/actions/booking/team.ts              → members (add, update, archive, delete, load more), roles (add, rename, delete)
app/actions/booking/session-team.ts      → addSessionAssignmentAction, removeSessionAssignmentAction
composition/booking/team-scope           → role, member and assignment repositories on the request DB
composition/booking/team-flow            → verify workspace + use cases + logging + not-found mapping
composition/workspace/workspace-creation-scope  (+ teamRoles repository; ADR-016)
features/booking/domain                  → team-role, team-member, session-assignment (rules, constants, schemas)
features/booking/application             → ports, schemas, errors, results, use cases
features/booking/ui                      → Tim screens, member/role dialogs, session team (avatars, Atur tim, Penugasan)
adapters/db/schema/booking/team.ts       → team_role, team_member, team_member_role, session_assignment
adapters/db/team-repository              → Drizzle role, member and assignment repositories
```

Changes to existing units:

| Unit | Location | Change |
|---|---|---|
| `project_session` | `adapters/db/schema/booking/project.ts` | `unique("project_session_project_key_uq").on(workspaceId, projectId, id)` (D-3) |
| `ProjectDetailRecord` + `findDetail` | `application/ports/project-repository`, `adapters/db/project-repository` | `assignments` (D-13) |
| `ProjectDetailView` | `use-cases/get-project-detail` | `canEditTeam` (`isTeamEditable(status)`) |
| `ProjectListRow` + list SQL | `ports/project-list-reader`, `project-list-sql.ts` | `hasTeam` (D-14) |
| `StatusDialogTarget`, `ProjectMenuTarget`, `DeleteDraftDialog` | `ui/project-status-dialogs`, `ui/project-menu-host` | optional `hasTeam` and the extra sentence (D-14) |
| *Jadwal* rows, `SessionRowActions`, `DetailEditing` | `ui/project-detail-screen`, `ui/session-row-actions` | avatar group / `user-plus`; the team ⋯ item; the team-aware delete body |
| `withWorkspaceCreationScope`, `createOwner*Workspace` | `composition/workspace/*` | `teamRoles` repository + `seedDefaultTeamRoles` (D-12) |
| `COMING_SOON_SECTIONS`, `resolvePageHeading` | `features/workspace/{domain,ui}` | D-17 |
| `Icon`, `MultiSelect`, `IconButton` | `src/ui` | D-16 |

Each changed shared unit gets a Storybook story update and a co-located test.

## Database Changes

Migration **`0010_team`** is generated by drizzle-kit. Every table carries `workspace_id`, and every cross-table reference is a composite FK (ADR-003). The migration is additive: four new tables and one new unique constraint on `project_session`.

**`team_role`** (BR-TEAM-005)

| Column | Type / rule |
|---|---|
| `id` | uuid PK |
| `workspace_id` | uuid NOT NULL → `workspace(id)` RESTRICT |
| `name` | text NOT NULL, CHECK `char_length between 1 and 50` and `= btrim(name)` |
| `updated_by` | text NULL → `user(id)` SET NULL |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() |

Constraints: `tenantKey`; `team_role_workspace_name_uq` UNIQUE `(workspace_id, lower(name))`.

**`team_member`** (BR-TEAM-004)

| Column | Type / rule |
|---|---|
| `id`, `workspace_id` | as above |
| `name` | text NOT NULL, CHECK 1–100 and trimmed |
| `whatsapp_number` | text **NOT NULL**, CHECK `~ '^[1-9][0-9]{9,14}$' and !~ '^620'` (BR-CLI-002) |
| `email` | text NULL, CHECK `email is null or (char_length(email) <= 254 and email = lower(email))` |
| `archived_at` | timestamptz NULL |
| `updated_by`, `created_at`, `updated_at` | as above |

Constraints: `tenantKey`; `team_member_workspace_whatsapp_uq` UNIQUE `(workspace_id, whatsapp_number)`; `team_member_workspace_list_idx (workspace_id, lower(name), created_at, id)`.

**`team_member_role`** (D-2)

- Columns: `workspace_id`, `member_id`, `role_id`, `created_at`. PK `(member_id, role_id)`.
- FKs:
  - `(workspace_id, member_id)` → `team_member` **CASCADE**;
  - `(workspace_id, role_id)` → `team_role` **RESTRICT**.
- Index `team_member_role_role_ix (workspace_id, role_id)`.

**`session_assignment`** (BR-TEAM-006, D-3)

- Columns: `id`, `workspace_id`, `project_id`, `session_id`, `member_id`, `role_id`, `updated_by`, audit columns.
- FKs:
  - `(workspace_id, project_id, session_id)` → `project_session(workspace_id, project_id, id)` **CASCADE**, a three-column `foreignKey` (the `tenantRef` helper is two-column);
  - `(workspace_id, member_id)` → `team_member` **RESTRICT**;
  - `(workspace_id, role_id)` → `team_role` **RESTRICT**.
- `session_assignment_member_uq` UNIQUE `(session_id, member_id)`.
- Indexes:
  - `session_assignment_session_ix (session_id, created_at, id)` (A-4);
  - `session_assignment_project_ix (workspace_id, project_id)` (detail, `hasTeam`);
  - `session_assignment_member_ix (workspace_id, member_id)`;
  - `session_assignment_role_ix (workspace_id, role_id)`.

**`project_session`:** add `project_session_project_key_uq` UNIQUE `(workspace_id, project_id, id)`.

Migration **`0011_team_role_backfill`** is custom (`pnpm drizzle-kit generate --custom --name team_role_backfill`):

```sql
INSERT INTO "team_role" ("workspace_id", "name")
SELECT w."id", d.name
FROM "workspace" w
CROSS JOIN (VALUES ('Fotografer'), ('Videografer'), ('Asisten')) AS d(name)
WHERE NOT EXISTS (
  SELECT 1 FROM "team_role" r
  WHERE r."workspace_id" = w."id" AND lower(r."name") = lower(d.name))
ON CONFLICT DO NOTHING;
```

The agent generates both migrations, reviews them, commits them and applies them with `pnpm db:migrate` against the shared non-production database (AGENTS.md; the change is additive). The run is reported.

## Server / API Interface

Every entry takes the workspace ID from the route only (ADR-015). Malformed, unknown or foreign IDs → `notFound()` (AC-TEAM-022).

| Entry | Input (untrusted) | Result |
|---|---|---|
| `GET …/team[/archived]` | route + `?q=` | first page, tab count, `q`, the roles (for the member form) |
| `GET …/team/roles` | route | roles with their usage count, by name |
| `GET …/projects/[projectId]` (extended) | route | `ProjectDetailView` with `assignments` + `canEditTeam`; `assignableMembers` |
| `loadMoreTeamMembersAction(wsId, query)` | `{ status, q, afterId }` | `{ items, nextCursor }` |
| `addTeamMemberAction(wsId, values)` | `TeamMemberInput` | `{ ok:true, member:{ id, name } }` \| `TeamMemberValidationFailure` |
| `updateTeamMemberAction(wsId, memberId, values)` | uuid + `TeamMemberInput` | `undefined` \| failure |
| `setTeamMemberArchivedAction(wsId, memberId, isArchived)` | uuid + boolean | `undefined` |
| `deleteTeamMemberAction(wsId, memberId)` | uuid | `{ ok:true }` \| `{ ok:false, code:"HAS_ASSIGNMENTS" }` |
| `addTeamRoleAction(wsId, values)` | `{ name }` | `{ ok:true, role:{ id, name } }` \| `TeamRoleValidationFailure` |
| `renameTeamRoleAction(wsId, roleId, values)` | uuid + `{ name }` | `undefined` \| failure |
| `deleteTeamRoleAction(wsId, roleId)` | uuid | `{ ok:true }` \| `{ ok:false, code:"IN_USE", usage:n }` |
| `addSessionAssignmentAction(wsId, projectId, sessionId, values)` | uuids + `{ memberId, roleId }` | `{ ok:true }` \| `{ ok:false, code: AssignmentFailureCode }` |
| `removeSessionAssignmentAction(wsId, projectId, assignmentId)` | uuids | `{ ok:true }` \| `{ ok:false, code:"PROJECT_CANCELLED" }` |

- **Revalidation:** member and role writes call `revalidatePath("/w/[workspaceId]/team", "layout")`. Role renames and member edits also revalidate `/w/[workspaceId]/projects`, because names show in *Jadwal*. Assignment writes revalidate `/w/[workspaceId]/projects`.
- **Unexpected failures** throw `TeamError("SAVE_FAILED")`. The client shows Toast/Danger *Perubahan belum tersimpan* with *Coba lagi*, and the dialog keeps its input (AC-TEAM-023).

## Domain / Application Logic

**Domain (`features/booking/domain`, pure):**

| Unit | Responsibility |
|---|---|
| `team-role` | `TEAM_ROLE_NAME_MAX_LENGTH = 50`; `teamRoleNameSchema` (trim; `EMPTY`, `TOO_LONG` by code points); `DEFAULT_TEAM_ROLES = ["Fotografer", "Videografer", "Asisten"]` (BR-TEAM-005) |
| `team-member` | `TEAM_MEMBER_NAME_MAX_LENGTH = 100`, `TEAM_MEMBER_EMAIL_MAX_LENGTH = 254`, `TEAM_MEMBER_ROLES_MAX = 50` (an input bound; TD-A-4). `teamMemberNameSchema` (`EMPTY`, `TOO_LONG`); `requiredWhatsappNumberSchema`: blank after separators → `REQUIRED`, else `whatsappNumberSchema` (`INVALID`); `optionalEmailSchema` (blank → null, lower-cased, `INVALID` / `TOO_LONG`); `roleIdsSchema` (uuid array, deduplicated, `REQUIRED` when empty). `TEAM_MEMBER_STATUSES`, `TEAM_PAGE_SIZE = 30` |
| `session-assignment` | `isTeamEditable(status)` (≠ `CANCELLED`, BR-TEAM-006); `SESSION_AVATAR_MAX = 3`; `avatarGroup(assignments)` → `{ shown, overflow }` (design decision 3, AC-TEAM-026); `assignmentsBySession(assignments)` → `Map<sessionId, Assignment[]>`, keeping the stored order; `assignableFor(members, sessionAssignments)` → the members not on the session (A-12, UX only) |

**Application (`features/booking/application`):**

- **Ports:**
  - `TeamRoleRepositoryPort`: `list`, `create`, `rename`, `delete`, `seedDefaults`;
  - `TeamMemberRepositoryPort`: `listPage`, `count`, `create`, `update`, `setArchived`, `delete`, `listAssignable`;
  - `SessionAssignmentRepositoryPort`: `add`, `remove`.
- **Repository contracts:**
  - Each write runs its own transaction with the locks of D-4, D-5 and D-9…D-11.
  - Each returns a discriminated result, for example `"ADDED" | "NOT_FOUND" | "PROJECT_CANCELLED" | "MEMBER_ARCHIVED" | "ROLE_NOT_HELD" | "ALREADY_ASSIGNED"`.
  - The status rule is passed in as the domain predicate `isTeamEditable`, so the repository holds no policy (F-07 pattern).
- **Schemas:**
  - `teamMemberInputSchema` `{ name, whatsappNumber, email, roleIds }`;
  - `teamRoleInputSchema` `{ name }`;
  - `assignmentInputSchema` `{ memberId, roleId }`;
  - `teamMemberListQuerySchema` `{ status, q, afterId }`;
  - ID schemas: `teamMemberIdSchema`, `teamRoleIdSchema`, `assignmentIdSchema` (uuid).
- **Errors:** `TeamError` (`NOT_FOUND`, `SAVE_FAILED`), with codes only (C-103).
- **Results:**
  - `TeamMemberValidationFailure = { ok:false, code:"VALIDATION_FAILED", fieldErrors, numberHolder? }`, with keys `name`, `whatsappNumber`, `email`, `roleIds`;
  - `TeamRoleValidationFailure`, with key `name` (`EMPTY` / `TOO_LONG` / `DUPLICATE`).
- **Use cases:**

  | Use case | Behaviour (AC) |
  |---|---|
  | `listTeamMembers` / `countTeamMembers` | Parse the query and fetch `limit 31`; return 30 + `nextCursor`. Each row has its role names by name, ignoring case (TD-A-1). The count ignores the search (001, 002, 003) |
  | `addTeamMember` / `updateTeamMember` | Validate and collect every field error, then call the repository (D-8, D-9) (004, 005, 006, 007) |
  | `setTeamMemberArchived` | Set or clear `archived_at`; idempotent (007) |
  | `deleteTeamMember` | D-11 (007) |
  | `listTeamRoles` | Roles with their usage count, by name (008, 009) |
  | `addTeamRole` / `renameTeamRole` | Validate; the name index decides `DUPLICATE` (`23505`) (009, 010) |
  | `deleteTeamRole` | D-10 (009) |
  | `seedDefaultTeamRoles` | D-12 (008) |
  | `listAssignableMembers` | Active members with their roles, by name (011, 027) |
  | `addSessionAssignment` | D-4 (011, 013, 015) |
  | `removeSessionAssignment` | D-5 (014, 015) |
  | `getProjectDetail` (extended) | Adds `assignments` and `canEditTeam` (015, 020, 026) |

**Composition (`composition/booking/team-flow`), following F-06's `client-flow`:**
- verify the workspace;
- parse IDs (a malformed one → `notFound()`);
- resolve the actor with `requireOwnerOrRedirect` for writes;
- map `NOT_FOUND` → `notFound()`;
- log `team.save_failed` with `{ workspaceId, projectId?, operation }` only, then throw `SAVE_FAILED`.

## UI Components

Built from `exports/` through `_compact/INDEX.md`. All copy lives in `team-copy` (strings from the exports; anything not drawn is marked `// not in Pencil`, see plan.md › Copy).

| Unit | Location | Exports |
|---|---|---|
| `TEAM_COPY` | `ui/team-copy` | all |
| `TeamMembersScreen` (desktop/phone switch, appended pages, dialogs, toasts) | `ui/team-members-screen` | `tim-anggota-*` |
| `TeamMembersTable` (DataTable: *Daftar anggota* + count, search 320; ANGGOTA · WHATSAPP 184 · PERAN 200 · ⋯ 32) | `ui/team-members-table` | `tim-anggota-*-desktop-*` |
| `TeamMemberList` (Compact/Flush card; meta = roles) | `ui/team-member-list` | `tim-anggota-*-mobile-*` |
| `TeamTabsBar` (*Aktif · Arsip · Peran*) | `ui/team-tabs-bar` | all `tim-*` |
| `TeamMemberRowActions` (*Ubah*, *Buka WhatsApp*, *Arsipkan* / *Pulihkan*, *Hapus*) | `ui/team-member-row-actions` | `tim-anggota-menu-baris-*` |
| `TeamMemberDialog` (Nama, Nomor WhatsApp, Email, Peran Multi-select + *Tambah peran baru*) + `useTeamMemberForm` | `ui/team-member-dialog` | `tim-form-anggota-*` |
| `DeleteTeamMemberDialog` (confirm → blocked) | `ui/delete-team-member-dialog` | `tim-anggota-hapus-terblokir-*` |
| `TeamMembersEmptyState` (*Aktif* empty, *Arsip* empty, no match) | `ui/team-members-empty-state` | `tim-anggota-kosong-*`, `tim-anggota-tidak-ada-hasil-*` |
| `TeamMembersSkeleton` | `ui/team-members-skeleton` | `tim-anggota-loading-*` |
| `TeamRolesScreen` (PERAN · DIPAKAI 184 · ⋯; *Tambah peran*) | `ui/team-roles-screen` | `tim-peran-*` |
| `TeamRoleDialog` (one field; also opened over the member dialog) | `ui/team-role-dialog` | `tim-peran-tambah-nama-sudah-ada-*` |
| `DeleteTeamRoleDialog` (confirm → blocked) | `ui/delete-team-role-dialog` | `tim-peran-hapus-terblokir-*` |
| `useTeamMutations` (toasts, *Batalkan* undo, *Coba lagi*) | `ui/use-team-mutations` | `tim-toast-diarsipkan-*` |
| `useLoadMoreTeamMembers` | `ui/use-load-more-team-members` | load more |
| `SessionTeamAvatars` (≤ 3 Avatar/SM with ring + *+n*; desktop tooltip *{name} · {role}*) | `ui/session-team-avatars` | `proyek-detail-jadwal-dengan-tim-*` |
| `SessionTeamDialog` (*Atur tim*: Modal MD / Bottom Sheet Form; rows with `trash-2`; read-only when cancelled) | `ui/session-team-dialog` | `proyek-atur-tim-terisi-*`, `proyek-dibatalkan-atur-tim-read-only-*` |
| `AssignmentDialog` (Penugasan: Anggota Select, Peran Select; Empty State with *Buka Tim*) | `ui/assignment-dialog` | `proyek-penugasan-*` |
| `SessionTeamHost` + `sessionTeamFlow` reducer | `ui/session-team-host` | D-15 |

**Layout:**
- **Tim, desktop:** App Shell, Page Header with tabs and *Tambah anggota* / *Tambah peran*, and the table in the 720 column.
- **Tim, phone:** Mobile Header *Tim*, the Segmented Control, the search, and the list card with *Tambah*.
- **Literal sizes** (design.md: they can't bind in Pencil): container 720, search 320, columns 184 / 200 / 32, avatar overlap −6, ring 2, overflow chip 24 × 24. Each is marked as coming from the design.

## Validation

- **Client:** `zodResolver` with the shared schemas, for feedback only.
- **Server:** every action re-parses with the same schema. Workspace, member status, role ownership and project status are never read from the request (C-004).
- **DB:**
  - CHECKs on names, the number and the email;
  - unique number per workspace;
  - unique role name per workspace, ignoring case;
  - unique `(session_id, member_id)`;
  - composite FKs, including the three-column session key.

## Error Handling

| Case | Result |
|---|---|
| Member field errors | `fieldErrors` → *Isi nama anggota.* · *Nomor WhatsApp wajib diisi* · *Nomor WhatsApp tidak valid* · *Masukkan email yang valid.* · *Pilih minimal satu peran.* (AC-TEAM-005) |
| Number taken | `whatsappNumber: TAKEN` + holder → *Nomor ini sudah dipakai {name}* + *(diarsipkan)* (AC-TEAM-006) |
| Role name empty / too long / duplicate | field error; *Peran ini sudah ada.* (AC-TEAM-009) |
| Role in use | `IN_USE` → dialog *Peran {name} tidak bisa dihapus* · *Peran ini masih dipakai {n} anggota.* · *Tutup* (AC-TEAM-009) |
| Member with assignments | `HAS_ASSIGNMENTS` → dialog *{name} tidak bisa dihapus* · *Anggota ini punya penugasan. Arsipkan saja.* · *Tutup* (AC-TEAM-007) |
| Assignment duplicate / archived member / role not held | form-level error on the Penugasan form; it stays open (AC-TEAM-013; copy in plan.md › Copy, `// not in Pencil`) |
| Write on a `CANCELLED` project | `PROJECT_CANCELLED` → Toast/Danger *Proyek dibatalkan; tim tidak bisa diubah.*, then refresh (AC-TEAM-015) |
| Foreign or unknown member, role, session, assignment or project | `notFound()` (AC-TEAM-022) |
| Unexpected failure | `SAVE_FAILED` → Toast/Danger *Perubahan belum tersimpan* + *Coba lagi*; the dialog keeps its input (AC-TEAM-023) |

## Concurrency / Consistency

- **Assignment add (D-4):**
  - the project is `FOR UPDATE` and the member `FOR SHARE`;
  - the unique index lets one of two parallel adds through (AC-TEAM-013);
  - a concurrent cancel or archive is serialized.
- **Assignment remove (D-5):** the project is `FOR UPDATE`.
- **Session delete and draft delete** (F-07, unchanged code): the FK cascade removes the assignments inside F-07's transaction (AC-TEAM-020).
- **Member write (D-9):** the member is `FOR UPDATE` and the roles `FOR SHARE`; a race on the number index → `NUMBER_TAKEN` (AC-TEAM-006).
- **Role delete (D-10) and member delete (D-11):** the row is `FOR UPDATE`, then the usage check; the RESTRICT FKs are the backstop.
- **Lists:** keyset is stable under inserts; the count is a separate query (F-06).
- **Otherwise last write wins** (spec has no versioning).

## Security

- Every query filters by the verified `workspaceId` (C-101). Composite FKs stop cross-workspace references, including role IDs sent in a member's body and member or role IDs sent in an assignment body (AC-TEAM-022).
- **Logs** carry IDs, the operation and the code only: never a name, number, email, query or `wa.me` URL (C-103, AC-TEAM-023). A unit test spies on `logger` for a failing member write.
- ***Buka WhatsApp*** is `<a href="https://wa.me/<digits>" target="_blank" rel="noopener noreferrer">`, built in the browser from the stored number, with no text (ADR-006, C-106).
- Freelancers never log in (BR-AUTH-001); F-08 adds no public route.

## Testing Strategy

| AC | Tests |
|---|---|
| AC-TEAM-001 | unit: table/list rows (number format, roles joined) · integration: *Aktif* order and count · E2E list, nav active, no *Segera hadir* |
| AC-TEAM-002 | unit: empty states per tab · integration: *Arsip* filter · E2E new workspace |
| AC-TEAM-003 | integration: name `ILIKE` (wildcards escaped), digits `0812 9876`, 65 rows → 30/60/65 · unit: search URL, load-more hook |
| AC-TEAM-004 | unit: `teamMemberInputSchema` (trim, normalize, lower-case email) · integration: stored values and roles · E2E add |
| AC-TEAM-005 | unit: schema table (empty, 101 chars, no number, `12345`, `rina@`, no role); dialog shows each message · integration: the action rejects bypassed input |
| AC-TEAM-006 | integration: archived holder → `NUMBER_TAKEN` + archived flag; a client with the same number doesn't conflict; `Promise.all` of two creates → one `NUMBER_TAKEN` |
| AC-TEAM-007 | integration: role removal keeps the assignment's role; archive/restore; delete with an assignment → `HAS_ASSIGNMENTS`; delete without → gone · unit: undo toast calls restore · E2E archive + undo |
| AC-TEAM-008 | integration: new workspace has the three roles; the backfill SQL on a workspace with *fotografer* adds two and no duplicate |
| AC-TEAM-009 | unit: `teamRoleNameSchema` · integration: duplicate ignoring case; rename visible in the member list and in detail assignments; delete in use (member-held and assignment-only) → `IN_USE` + count; unused delete |
| AC-TEAM-010 | unit: member dialog › *Tambah peran baru* opens the role dialog; on save the new role is selected |
| AC-TEAM-011 | unit: `sessionTeamFlow` (user-plus → assign → close), session menu items, role preselect, toast · integration: add · E2E staff a session |
| AC-TEAM-013 | integration: duplicate (sequential and `Promise.all`), archived member, role not held, foreign session → `NOT_FOUND`, member or role of another workspace → `NOT_FOUND` · unit: `assignableFor` |
| AC-TEAM-014 | unit: reducer (team → assign → back to team; last remove closes) · integration: remove · E2E change a role by remove + add |
| AC-TEAM-015 | unit: `isTeamEditable`; read-only *Atur tim*; no `user-plus`, no ⋯ · integration: add/remove on `CANCELLED` → `PROJECT_CANCELLED`; `Promise.all(cancel, add)` serializes |
| AC-TEAM-020 | unit: session delete body with *n*; draft delete sentence · integration: session delete and draft delete cascade the assignments; the members stay |
| AC-TEAM-021 | unit: no status control in *Jadwal* / *Atur tim* · integration: adding an assignment leaves `project.status` unchanged |
| AC-TEAM-022 | integration: every repository call with workspace B's IDs → `NOT_FOUND`, nothing changes · E2E foreign URLs |
| AC-TEAM-023 | unit: composition logs `team.save_failed` with IDs only (logger spy); danger toast with *Coba lagi*; dialog keeps input |
| AC-TEAM-026 | unit: `avatarGroup` (4 → 3 + *+1*), initials, tooltip text, order · E2E avatars |
| AC-TEAM-027 | unit: Penugasan Empty State, *Tambah* disabled, *Buka Tim* href |
| C-008 | E2E: axe (wcag2a/2aa/21a/21aa) on Tim (3 tabs), the member and role dialogs, *Atur tim* and the Penugasan form, at 1440 and 390, light and dark |

## Implementation Iterations

See [plan.md](plan.md): six vertical slices by screen, test-first, one commit per step.

1. *Peran*: the schema, migrations 0010/0011 and role seeding.
2. *Anggota*: the list and the member dialog.
3. The member row menu: WhatsApp, archive, delete.
4. *Jadwal*: avatars, the `user-plus` button and the Penugasan form.
5. *Atur tim*, removal, the cancelled read-only view and the team-aware deletes.
6. Close: E2E, axe, isolation and the fidelity pass.

## Assumptions (technical, reversible)

- **TD-A-1:** a member's roles are listed by name, ignoring case (*Fotografer, Videografer*), in the table, the phone meta, the Peran select and the Penugasan role select. The first one is preselected (AC-TEAM-011: *Fotografer*).
- **TD-A-2:** a role's usage (*DIPAKAI* and the blocked delete) counts the distinct members who hold the role **or** have an assignment in it (D-10). A role used only by an old assignment shows *1 anggota* and can't be deleted, as BR-TEAM-005 requires.
- **TD-A-3:** the detail page preloads every active member with their roles (D-13). Revisit past a few hundred members per workspace.
- **TD-A-4:** `TEAM_MEMBER_ROLES_MAX = 50` bounds the untrusted `roleIds` array. It isn't a business rule.
- **TD-A-5:** a role sent in a member's body that isn't in the workspace (deleted by another tab, or foreign) is *not found*, as the spec says for unknown roles. It isn't a field error.

## Risks / Open Questions

- **Copy not drawn:** the assignment form errors, the member/role toasts, the plain delete confirmations and the assignment-removed toast are proposed in plan.md › Copy and marked `// not in Pencil`. The Owner can change them at any time.
- **F-07 code touched:** `findDetail`, the list SQL (`hasTeam`), `DeleteDraftDialog`, `SessionRowActions` and the *Jadwal* rows. The changes are additive, but they need F-07's tests to keep passing; each step runs them.
- **The three-column FK** is hand-written with `foreignKey` (the helper is two-column). Review the generated SQL for the `project_session` unique constraint *before* the FK that references it.
- **Nested dialogs:** the role dialog opens over the member dialog (A-5). React Aria supports nested modals; the Slice 2 dialog test covers focus return.

## Implementation record — Slice 1 (2026-10-04)

- **Built:** the four tables and migrations `0010_team` / `0011_team_role_backfill` (applied to the non-production database, additive), role seeding in the workspace-creation scope, role use cases and repository, `team-flow` and role actions, the *Tim* shell heading with *Aktif · Arsip · Peran*, and the *Peran* screen (table on desktop, list on phones, role dialog, delete confirm → blocked) at `/team/roles`.
- **Checks:** typecheck, ESLint on `src` and `tests`, Prettier, tokens, `pnpm build` and 1109 unit tests pass. Team integration (14: schema, seeding, repository) pass. Team E2E (`tests/e2e/team`) **not verified**: port 3000 is a dev server from another checkout (`~/.codex/worktrees/clients`), so Playwright reused it and `/team/roles` returned 404. A server on another port is no use because `.dev.vars` sets `BETTER_AUTH_URL` to port 3000.
- **Deviations:**
  1. The *Peran* phone rows are drawn without a leading element; `ListCardItem` requires one, so they use `user-round-cog` (as F-07's deviation 5).
  2. The `/team/roles` route files were written in step 1.5 with their screen, not in 1.4, so the build never has a page without its screen.
  3. A `team-role-row-actions` unit was added (the plan's file list had none) for the roles ⋯ menu.
  4. The empty roles state (*Belum ada peran*) is not drawn; its copy is marked `// not in Pencil`.
  5. `/team` keeps *Segera hadir* with the new tabs in the header until step 2.3.
- **Environment:** `pnpm install` was run once (F-07's `@internationalized/date`). `pnpm lint` also scans another session's `.claude/worktrees/*` and fails there, and needs `NODE_OPTIONS=--max-old-space-size=6144`; the repo's own `src` and `tests` lint clean.

## Implementation record — Slices 2 and 3 (2026-10-04)

- **Built:** the member rules and input schemas; member use cases (list, count, add, update, archive, delete) and the Drizzle member repository (D-7…D-9, D-11); `team-flow` member entries and actions; the shared `MultiSelect` (`description`, `errorMessage`, `groupLabel`, `createAction`), `IconButton` `tone="danger"` and the `user-plus` icon; the *Anggota* tabs at `/team` and `/team/archived` (table, phone list, search, load more, empty and loading states); the member dialog with inline role creation; the row menu (*Ubah*, *Buka WhatsApp*, *Arsipkan* / *Pulihkan*, *Hapus*) with the archive undo toast and the blocked delete dialog. `team` left `COMING_SOON_SECTIONS`.
- **Checks:** typecheck, ESLint on the changed paths, Prettier, `pnpm build` and 1199 unit tests pass. Team integration (`team-member-repository`: 13) pass. Team E2E (`tests/e2e/team`) written for the members and row menu but **not run**: port 3000 is still the other checkout's dev server (PID 83066), as in Slice 1. The visual comparison with the exports at 1440 and 390 was not possible for the same reason.
- **Deviations:**
  1. The `/team` route files and the `COMING_SOON_SECTIONS` removal landed in 2.5 with their screen, not in 2.3 (same reason as Slice 1 deviation 2).
  2. `MultiSelect` also gained `groupLabel` (the drawn *PERAN* overline); the plan listed three props. On phones it keeps F-07's bottom-sheet list, so the drawn inline menu inside the sheet is not reproduced; the *Tambah peran baru* row is a sheet row.
  3. The *Hapus pencarian* button in the no-match state has no icon: `Button` allows a fixed icon set without `x`.
  4. The *Arsip* tab keeps the add button, as the export's header does. The phone row ⋯ and the desktop menu are both in 3.2, so a phone has no edit entry in 2.5/2.6 alone.
  5. The delete-blocked E2E waits for Slice 4, which is when an assignment can exist.
  6. The search field has its own hook (`use-team-member-search`) because F-06's is private to its component.
- **Environment:** integration tests share `tests/support/booking/team-seed.ts` (workspace, roles, project with a session, assignment).

## Implementation record — Slice 4 (2026-10-04)

- **Built:** the assignment rules (`isTeamEditable`, `avatarGroup`, `assignableFor`, `assignmentsBySession`), `addSessionAssignment` and `listAssignableMembers`, the Drizzle assignment repository (project row `FOR UPDATE`, member `FOR SHARE`, D-4) and `listAssignable`; `findDetail` carries `assignments`, `ProjectDetailView.canEditTeam`, the list reader `hasTeam`; the flow entries, `session-team` action and the detail page's `assignableMembers`; the *Jadwal* rows (avatar group with desktop tooltips, `user-plus`, ⋯ › *Tambah tim* / *Atur tim* with a divider before *Hapus sesi*); the Penugasan form and `SessionTeamHost` with the `sessionTeamFlow` reducer.
- **Checks:** typecheck, ESLint on `src` and `tests`, Prettier, `pnpm build` and 1246 unit tests pass. Team integration plus F-07's `project-repository` and `project-list` (62) pass. The Slice 4 E2E (`tests/e2e/projects/session-team.spec.ts`) is written but **not run**, and the visual comparison with the exports was not possible: port 3000 is still the other checkout's dev server (PID 83066).
- **Deviations:**
  1. The detail page's `assignableMembers` load moved from 4.2 to 4.4 with the host that uses it.
  2. `Button` gains the `user-round-cog` icon (the drawn *Buka Tim*); it has no `href`, so *Buka Tim* calls `router.push`.
  3. `Atur tim` and the avatar group open the Penugasan form until Slice 5; on a cancelled project they do nothing yet.
  4. The member field of the form has the placeholder *Pilih anggota* (`// not in Pencil`).
  5. Reuse: `SessionTeamAvatars` is feature-local (design.md COMPONENT GAP); the avatar group is one `<button>`, which opens *Atur tim*.
- **Open for Slice 5:** `DeleteDraftDialog` and the list row menu need `hasTeam` (D-14), already on `ProjectListRow`.

## Implementation record — Slices 5 and 6 (2026-10-04)

- **Built:** `removeSessionAssignment` and the repository `remove` (project row `FOR UPDATE`, D-5), its flow entry and action; `SessionTeamDialog` (*Atur tim*: rows, `trash-2` remove with `ProjectConfirmDialog`, read-only note and *Tutup* for a cancelled project) wired into `SessionTeamHost` with the `addFromTeam` return to the team view; `firstName`; `hasTeam` on `StatusDialogTarget` / `ProjectMenuTarget` (list row and detail), the draft delete sentence and the session delete body with the team count; the 6.1 sweep (isolation reads, a table-driven log redaction test over all 13 flow entries); E2E specs for the staffing journey (J-03), foreign URLs, the axe matrix (desktop and phone, light and dark) and the keyboard path, with shared helpers in `tests/e2e/team/team-e2e.ts`.
- **Checks:** typecheck, ESLint and Prettier on `src` and `tests`, `pnpm build` and 1282 unit tests pass. Team integration plus F-07 `project-repository` and `project-list` (73) pass, including remove, cancel races, the cascades and isolation. **Not run:** every team E2E spec (`tests/e2e/team/*`, `tests/e2e/projects/session-team.spec.ts`; they load with `playwright test --list`), the axe matrix, and the comparison with the exports at 1440 and 390. Port 3000 is still a dev server of another checkout (PID 83066, `~/.codex/worktrees/clients`) and `.dev.vars` ties auth to it. I did not stop it.
- **Deviations:**
  1. Step 5.2's dom tests were written after the component, not before; they pass and cover the listed behaviours.
  2. `Button` gained the `user-plus` icon (the drawn *Tambah anggota* in *Atur tim*).
  3. On phones *Atur tim* shows only *Tambah anggota* in its footer, and the read-only sheet has no footer button, as drawn; removing is the same Actions sheet as F-07's.
  4. The removal failure toast is F-07's (*Perubahan belum tersimpan*, no *Coba lagi* action), as `useProjectEdits` does.
  5. `AssignmentDialog` and `SessionTeamDialog` are mounted per view, so the Penugasan form no longer animates out when it returns to *Atur tim*.
- **Open:** run the E2E, axe and fidelity pass once port 3000 is free, then set the spec to BUILT and run `/sdv:verify-feature team-sessions`.

