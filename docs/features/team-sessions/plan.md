# F-08 Team — Implementation Plan (vertical slices by screen)

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. In this repo, `/sdv:build-feature team-sessions <slice>` runs one slice; each **step** inside it is one commit.

**Goal:**
- the Owner keeps the freelancers they hire (*Tim*: members and roles);
- on a project's *Jadwal*, the Owner records who works each session and in which role.

There is no money in F-08 (F-18).

**Approach:** as F-07, each slice delivers one screen end to end:
- domain → application → repository → action → UI → tests;
- it can be tried in the browser when it is done;
- it produces the data the next slice shows.

The order is *Peran* → *Anggota* → row menu → *Jadwal* staffing → *Atur tim* → close.

**Architecture:** see [technical-design.md](technical-design.md) › Decisions D-1…D-17.
- Team joins `src/features/booking` (D-1).
- There are four tables behind three ports, `TeamRoleRepositoryPort`, `TeamMemberRepositoryPort` and `SessionAssignmentRepositoryPort`. All four tables arrive in Slice 1, in migration `0010`.
- Assignment writes lock the project row (D-4).
- The detail page gets the team through `ProjectDetailRecord.assignments` (D-13).

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), Hugeicons, Vitest (unit, dom, integration), Playwright + axe, Storybook. No new dependency.

**Sources:**
- design: [design.md](design.md) and `exports/`, read through [`exports/_compact/INDEX.md`](exports/_compact/INDEX.md) (a base per screen and device, plus a diff per state);
- technical design: [technical-design.md](technical-design.md), with the AC → test map;
- spec: [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md);
- diagrams: [activity](diagrams/activity.md), [state](diagrams/state.md).

**Base:** F-06 and F-07 are on `main`, and `main` is merged into `feat/team-sessions` (2026-10-04). Every path under *Existing code to follow* exists today.

## Global Constraints

Every step's requirements implicitly include this section.

- **Reuse first.** Before building any UI unit, the agent:
  1. searches `src/ui/primitives`, `src/ui/patterns` and `src/features/booking/ui` (F-06's client units are the closest pattern for every *Tim* unit);
  2. lists in the step what it found;
  3. uses the existing unit, or extends it with an additive prop.

  The agent creates a new unit only when nothing fits, and says why in the commit message. The same applies to domain helpers: `whatsappNumberSchema`, `formatWhatsappNumber`, `whatsappChatUrl`, `searchClientDigits`, `optionalWhatsappValue`, `WHATSAPP_SEPARATORS` and `clientInitials`.
- **Boundaries (lint):** `features/booking` never imports another feature. Team code may import booking client and project modules, because they are the same feature.
- **Rule values (named constants, never literals):**

  | Constant | Value | Rule |
  |---|---|---|
  | `TEAM_ROLE_NAME_MAX_LENGTH` | 50 | BR-TEAM-005 |
  | `DEFAULT_TEAM_ROLES` | `["Fotografer", "Videografer", "Asisten"]` | BR-TEAM-005 |
  | `TEAM_MEMBER_NAME_MAX_LENGTH` | 100 | BR-TEAM-004 |
  | `TEAM_MEMBER_EMAIL_MAX_LENGTH` | 254 | BR-TEAM-004 |
  | `TEAM_MEMBER_ROLES_MAX` | 50 | TD-A-4 (input bound) |
  | `TEAM_PAGE_SIZE` | 30 | A-3 |
  | `TEAM_SEARCH_DEBOUNCE_MS` | reuse `CLIENT_SEARCH_DEBOUNCE_MS` | A-3 (as F-06) |
  | `SESSION_AVATAR_MAX` | 3 | design.md decision 3 |
- **Logging:** `team.save_failed` with `{ workspaceId, projectId?, operation }` only. Never a name, number, email, query or `wa.me` URL (C-103).
- **Copy:** from the exports and § [Copy](#copy) below, in `team-copy` (*Tim*) or `project-copy` (*Jadwal* additions). Strings not drawn carry `// not in Pencil`.
- **UI steps:**
  - build from the slice's exports, via `_compact/INDEX.md`, and stop if one is missing;
  - map every raw value to a token; a value with no token is a DESIGN TOKEN GAP: report it and never hard-code it;
  - compare the screen with its exports at 1440 and 390, and record the deviations in the step report.
- **Migration:** Slice 1 generates `0010` and `0011` with drizzle-kit, reviews them, commits them, then runs `pnpm db:migrate` against the non-production database from `.dev.vars` (AGENTS.md). Report the run.
- **Tests:** names start with the `AC-TEAM-*` / `BR-*` IDs they cover. Domain tests never touch the DB. Integration tests seed their own workspace (ADR-009).
- **Quality gate per step:**
  - `pnpm typecheck`, `pnpm lint` and `pnpm test` pass;
  - steps that touch a repository add `pnpm test:integration`;
  - the slice's last step adds `pnpm build` and the E2E specs written so far: `tests/e2e/team/*`, plus `tests/e2e/projects/*` from Slice 4.
- **F-07 regressions:** steps that touch F-07 units (`findDetail`, list SQL, `DeleteDraftDialog`, `SessionRowActions`, *Jadwal* rows) run F-07's unit and integration tests too.
- **Commits:** one per step; conventional, lowercase, with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Code in this plan:** written out for rules and the schema only. UI steps point to their exports and name the behaviour to test; they don't paste JSX.

## How to run this plan

- **Before the first slice:** read this file whole, then [technical-design.md](technical-design.md) › Decisions.
- **For each slice:** read its **Read first** list only. Use the spec and AC only to look up an ID.
- **For each step, in this order:**
  1. **Precondition:** open the exports the step names, through `_compact/INDEX.md`. If one is missing, STOP and ask.
  2. **Reuse check:** run the search from Global Constraints.
  3. **Failing tests:** write the tests the step lists and run them; they must fail.
  4. **Implement:** follow *Existing code to follow*.
  5. **Gate:** run the step's gate.
  6. **Commit:** use the step's commit message.
- **Never invent copy:** every user-facing string is in § Copy or an export. Otherwise STOP and report a `SPEC GAP`.
- **Never change a higher-authority document** to make a step pass. Report the conflict instead.

## Existing code to follow

| Need | Follow | Notes |
|---|---|---|
| Tenant schema helpers | `src/adapters/db/schema/_conventions/tenant.ts` | `idColumn`, `workspaceIdColumn`, `auditColumns`, `tenantKey`, `tenantRef`. Use `foreignKey` directly for the three-column session FK |
| Unique number + holder lookup, keyset list SQL, search | `src/adapters/db/client-repository/drizzle-client-repository.ts` | F-06 D-4, D-6, D-7 |
| `23503` / `23505` mapping | `src/adapters/db/catalog-repository/pg-error.ts` | `pgCode(error)` |
| Locking the project row | `src/adapters/db/project-repository/drizzle-project-repository.ts` › `withLockedProject` | `SELECT … FOR UPDATE` by `(workspace_id, id)` |
| Seeding + backfill | `seed-default-item-definitions` use case, `drizzle-item-definition-repository.ts` › `seedDefaults`, `drizzle/0007_item_definition_backfill.sql` | `onConflictDoNothing()` |
| Workspace-creation transaction | `src/composition/workspace/workspace-creation-scope/workspace-creation-scope.ts`, `owner-workspace.ts` | ADR-016 |
| Composition flow + scope | `src/composition/booking/client-flow/client-flow.ts`, `client-scope/client-scope.ts` | `verifyOwnerWorkspace`, `requireOwnerOrRedirect`, `idOrNotFound`, `saveError` |
| Server actions | `src/app/actions/booking/clients.ts` | `revalidatePath(PAGE, "layout")` on success |
| Tab routes + pages + loading | `src/app/(owner)/w/[workspaceId]/clients/**` | `page.tsx`, `archived/page.tsx`, `loading.tsx` |
| Section heading + tabs in the shell | `src/features/workspace/ui/owner-nav/owner-nav.tsx` › `resolveClientsHeading` | the same shape for *Tim*, with three tabs |
| Coming-soon list | `src/features/workspace/domain/coming-soon-sections/coming-soon-sections.ts` | remove `"team"` (step 2.3) |
| List screen, table, phone list, tabs bar, search, load more | `src/features/booking/ui/{clients-screen,clients-table,client-list,clients-tabs-bar,client-search-field,use-load-more-clients,clients-empty-state,clients-skeleton}` | F-06 |
| Row menu, delete with blocked state, mutations + toasts + undo | `ui/client-row-actions`, `ui/delete-client-dialog`, `ui/use-client-mutations` | F-06 |
| Entity dialog with RHF + server field errors | `ui/client-dialog` | `setError` for server field errors |
| *Jadwal* rows, session ⋯, detail dialogs | `ui/project-detail-screen/project-detail-cards.tsx`, `ui/session-row-actions`, `ui/project-detail-screen/detail-editing.tsx` | F-07 |
| Confirm dialog, draft delete | `ui/project-confirm-dialog`, `ui/project-status-dialogs/delete-draft-dialog.tsx` | F-07 |
| Detail writes + toasts + refresh | `ui/project-edit/use-project-edits` | `edits.run(action)` |
| Fakes for use-case tests | `tests/support/booking/fake-client-repository.ts`, `fake-project-repository.ts` | in-memory |
| Integration seeding | `tests/integration/booking/client-repository.test.ts` › `seedWorkspace`, `project-repository.test.ts` | `openTestDb()` from `tests/integration/helpers/test-db.ts` |
| E2E setup + axe | `tests/e2e/clients/clients.spec.ts`, `tests/e2e/projects/projects.spec.ts` | `registerAndVerify`, `createWorkspace`, axe helper |

## File Structure

```text
src/ui/primitives/icon/ (+ user-plus) · icon-button/ (+ tone="danger")
src/ui/patterns/multi-select/ (+ errorMessage, description, createAction)
src/features/workspace/domain/coming-soon-sections/       − "team"
src/features/workspace/ui/owner-nav/                       Tim heading + tabs
src/features/booking/
  domain/team-role/ · team-member/ · session-assignment/
  application/errors/team-errors/
  application/ports/team-role-repository/ · team-member-repository/ · session-assignment-repository/
  application/schemas/team-member-input/ · team-role-input/ · assignment-input/ · team-member-list-query/ · team-ids/
  application/use-cases/team-results/
  application/use-cases/{list-team-roles,add-team-role,rename-team-role,delete-team-role,seed-default-team-roles,
    list-team-members,count-team-members,add-team-member,update-team-member,set-team-member-archived,
    delete-team-member,list-assignable-members,add-session-assignment,remove-session-assignment}/
  ui/team-copy/ · team-field-error/ · team-tabs-bar/ · team-roles-screen/ · team-role-dialog/ · delete-team-role-dialog/
  ui/team-members-screen/ · team-members-table/ · team-member-list/ · team-member-search-field/
  ui/team-members-empty-state/ · team-members-skeleton/ · use-load-more-team-members/
  ui/team-member-dialog/ · team-member-row-actions/ · delete-team-member-dialog/ · use-team-mutations/
  ui/session-team-avatars/ · session-team-dialog/ · assignment-dialog/ · session-team-host/
src/adapters/db/schema/booking/team.ts                     (+ export in schema/index.ts; project_session unique)
src/adapters/db/team-repository/                           drizzle-team-role-repository.ts · drizzle-team-member-repository.ts
                                                           · drizzle-session-assignment-repository.ts
src/composition/booking/team-scope/ · team-flow/
src/app/actions/booking/team.ts · session-team.ts          (+ .test.ts)
src/app/(owner)/w/[workspaceId]/team/                      page · loading · archived/ · roles/
drizzle/0010_team.sql · 0011_team_role_backfill.sql
tests/support/booking/fake-team-repositories.ts · team-fixtures.ts
tests/integration/booking/team-repository.test.ts · session-assignment.test.ts
tests/e2e/team/team.spec.ts · tests/e2e/projects/session-team.spec.ts
```

## Screens

| # | Screen | Route / where it opens | States (exports, `_compact` groups) | Built in |
|---|---|---|---|---|
| T1 | **Tim › Peran** | `/team/roles` | `tim-peran`, `tim-peran-tambah-nama-sudah-ada`, `tim-peran-hapus-terblokir` (tim / desktop + mobile) | Slice [1](#slice-1-tim--peran-schema-and-seeded-roles) |
| T2 | **Tim › Anggota** (*Aktif*, *Arsip*) | `/team`, `/team/archived` | `tim-anggota-aktif` (base), `tim-anggota-arsip`, `tim-anggota-kosong`, `tim-anggota-tidak-ada-hasil`, `tim-anggota-loading` | Slice [2](#slice-2-tim--anggota-list-and-member-dialog) |
| T2a | Member dialog | T2 › *Tambah anggota* / *Ubah* / row | `tim-form-anggota-tambah`, `tim-form-anggota-error`, `tim-form-anggota-peran-baru` | Slice 2 |
| T2b | Row menu, delete, archive toast | T2 › row ⋯ | `tim-anggota-menu-baris`, `tim-anggota-hapus-terblokir`, `tim-toast-diarsipkan` | Slice [3](#slice-3-member-row-menu) |
| P1 | **Project detail › *Jadwal*** (extends F-07) | `/projects/[projectId]` | `proyek-detail-jadwal-dengan-tim` (desktop base / mobile diff), `proyek-menu-sesi-belum-ada-tim`, `proyek-menu-sesi-ada-tim` | Slice [4](#slice-4-jadwal-staffing-and-the-penugasan-form) |
| P1a | Penugasan form | P1 › `user-plus` / ⋯ *Tambah tim* / *Atur tim* › *Tambah anggota* | `proyek-penugasan-tambah`, `proyek-penugasan-tanpa-anggota-aktif`, `proyek-toast-anggota-ditambahkan` | Slice 4 |
| P1b | *Atur tim* | P1 › avatar group / ⋯ *Atur tim* | `proyek-atur-tim-terisi`, `proyek-hapus-dari-sesi` (mobile base), `proyek-dibatalkan-atur-tim-read-only` | Slice [5](#slice-5-atur-tim-removal-and-team-aware-deletes) |
| P1c | Session delete with a team | P1 › ⋯ *Hapus sesi* | `proyek-hapus-sesi-dengan-tim` | Slice 5 |

**Navigation between screens:**
- **Shell:** nav *Tim* → T2 (*Aktif*).
- **T1 / T2 tabs** switch routes.
- **P1a, no active members:** *Buka Tim* → T2.

## Copy

These strings are taken from the exports. Use them as written.

| Key | Text |
|---|---|
| page subtitle (desktop / phone) | *Freelancer yang kamu ajak bertugas. Pilih mereka di jadwal proyek.* / *Freelancer yang kamu ajak bertugas.* |
| tabs | *Aktif* · *Arsip* · *Peran* |
| list title / counts | *Daftar anggota* · *{n} anggota aktif* · *{n} anggota diarsipkan* |
| search placeholder (desktop / phone) | *Cari nama atau nomor WhatsApp* / *Cari nama atau nomor* |
| columns | ANGGOTA · WHATSAPP · PERAN |
| add (desktop / phone) | *Tambah anggota* / *Tambah* |
| empty *Aktif* | *Belum ada anggota tim* · *Catat freelancer yang sering kamu ajak, lalu pilih mereka di jadwal proyek.* · *Tambah anggota* |
| empty *Arsip* | *Belum ada anggota yang diarsipkan* (spec; body `// not in Pencil`: *Anggota yang diarsipkan muncul di sini.*) |
| no match | *Tidak ada anggota yang cocok* · *Coba nama lain atau nomor WhatsApp-nya.* · *Hapus pencarian* |
| row menu | *Ubah* · *Buka WhatsApp* · *Arsipkan* / *Pulihkan* · *Hapus* |
| member dialog | *Tambah anggota* / *Ubah anggota* (`// not in Pencil`) · *Freelancer yang bisa kamu tugaskan di jadwal proyek.* · *Nama* (*Nama lengkap*) · *Nomor WhatsApp* (hint *Contoh: 0812 3456 7890*) · *Email* *(opsional)* (*nama@email.com*) · *Peran* (*Pilih peran*; helper *Bisa lebih dari satu. Peran baru bisa dibuat dari sini.*; group label PERAN; *Tambah peran baru*) · *Batal* / *Simpan* |
| member field errors | *Isi nama anggota.* · *Nama paling banyak 100 karakter.* (`// not in Pencil`) · *Nomor WhatsApp wajib diisi* · *Nomor WhatsApp tidak valid* · *Nomor ini sudah dipakai {name}.* / *Nomor ini sudah dipakai {name} (diarsipkan).* · *Masukkan email yang valid.* · *Pilih minimal satu peran.* |
| member delete blocked | *{name} tidak bisa dihapus* · *Anggota ini punya penugasan. Arsipkan saja.* · *Tutup* |
| member delete confirm | *Hapus anggota "{name}"?* (spec) · body `// not in Pencil`: *Nama, nomor WhatsApp, email, dan perannya dihapus permanen.* · *Hapus* / *Batal* |
| archive toast | *{name} diarsipkan* · *Penugasannya tetap tersimpan.* · *Batalkan* |
| other member toasts (`// not in Pencil`) | added *Anggota ditambahkan* · *{name} siap dipilih di jadwal proyek.* · saved *Perubahan disimpan* · restored *{name} dipulihkan* · deleted *{name} dihapus* |
| roles list | *Daftar peran* · *{n} peran · dipilih saat menambah anggota* · PERAN · DIPAKAI · *{n} anggota* / *Belum dipakai* · *Tambah peran* |
| role dialog | *Tambah peran* / *Ubah peran* (`// not in Pencil`) · *Peran dipilih saat menambah anggota.* · *Nama peran* · *Batal* / *Simpan* |
| role errors | *Peran ini sudah ada.* · *Isi nama peran.* / *Nama peran paling banyak 50 karakter.* (`// not in Pencil`) |
| role delete blocked | *Peran {name} tidak bisa dihapus* · *Peran ini masih dipakai {n} anggota.* · *Tutup* |
| role delete confirm + toasts (`// not in Pencil`) | *Hapus peran "{name}"?* · *Peran ini dihapus dari daftar.* · toasts *Peran ditambahkan* / *Peran disimpan* / *Peran dihapus* |
| session ⋯ | *Tambah tim* (`user-plus`) / *Atur tim* (`users`) · *Ubah sesi* · *Hapus sesi* |
| `user-plus` aria-label (`// not in Pencil`) | *Tambah tim untuk {session}* |
| avatar group aria-label (`// not in Pencil`) | *Tim {session}: {n} anggota* |
| avatar tooltip | *{name} · {role}* (spec A-12) |
| *Atur tim* | *Tim · {session}* · session date, times and location (F-07 `formatSessionRange` + location) · rows *{name}* / *{role}*, *(diarsipkan)* after an archived name · *Tambah anggota* · *Selesai* |
| *Atur tim*, cancelled | *Proyek dibatalkan, tim tidak bisa diubah.* · *Tutup* |
| `trash-2` aria-label | *Hapus dari sesi* |
| remove confirm | *Hapus {name} dari {session}?* · *Penugasannya dihapus dari sesi ini. {first name} tetap ada di Tim.* · *Batal* / *Hapus dari sesi* |
| Penugasan form | *Tambah anggota · {session}* · *Anggota* (helper *Hanya anggota aktif yang belum ada di sesi ini.*) · *Peran* (helper *Peran yang dimiliki {name}.*) · *Batal* / *Tambah* |
| Penugasan, no active members | *Belum ada anggota tim aktif* · *Tambahkan anggota di halaman Tim dulu, lalu kembali ke sini.* · *Buka Tim* (`user-round-cog`) |
| assignment toast | *Anggota ditambahkan* · *{name} bertugas di {session} sebagai {role}.* |
| assignment errors (`// not in Pencil`) | `ALREADY_ASSIGNED` *{name} sudah ada di sesi ini.* · `MEMBER_ARCHIVED` *{name} sudah diarsipkan.* · `ROLE_NOT_HELD` *{name} tidak punya peran ini lagi.* |
| assignment removed toast (`// not in Pencil`) | *Anggota dihapus dari sesi* · *{name} tidak lagi bertugas di {session}.* |
| cancelled write | *Proyek dibatalkan; tim tidak bisa diubah.* (spec) |
| session delete with team | *Hapus sesi {session}?* · *Sesi ini punya {n} anggota tim. Penugasan mereka ikut terhapus.* |
| draft delete addition | *Penugasan tim ikut terhapus.* (appended to F-07's `deleteDialogBody`) |
| server error | *Perubahan belum tersimpan* · *Coba lagi* |

`{first name}` is the first word of the member's name (*Sari*), as drawn. Rule: the first whitespace-separated word.

## Shared contracts

Exported types go in sibling `.types.ts` files (coding rules). IDs are uuid strings.

```ts
// domain/team-member/team-member.types.ts
export type TeamMemberStatus = (typeof TEAM_MEMBER_STATUSES)[number]; // "ACTIVE" | "ARCHIVED"

// domain/session-assignment/session-assignment.types.ts
export interface AssignmentRef { readonly sessionId: string; readonly memberId: string }
export interface AvatarGroup<T> { readonly shown: readonly T[]; readonly overflow: number }

// application/ports/team-role-repository/team-role-repository.port.ts
export interface TeamRoleRecord { readonly id: string; readonly name: string; readonly usage: number }
export type RoleNameTaken = { readonly status: "DUPLICATE" };
export interface TeamRoleRepositoryPort {
  readonly list: (context: WorkspaceContext) => Promise<readonly TeamRoleRecord[]>; // by lower(name)
  readonly create: (context: WorkspaceContext, name: string, actorId: string)
    => Promise<{ readonly status: "CREATED"; readonly id: string } | RoleNameTaken>;
  readonly rename: (context: WorkspaceContext, id: string, name: string, actorId: string)
    => Promise<"UPDATED" | "NOT_FOUND" | RoleNameTaken>;
  /** D-10: locks the role, counts usage, deletes when unused. */
  readonly delete: (context: WorkspaceContext, id: string)
    => Promise<"DELETED" | "NOT_FOUND" | { readonly status: "IN_USE"; readonly usage: number }>;
  readonly seedDefaults: (context: WorkspaceContext, names: readonly string[]) => Promise<void>;
}

// application/ports/team-member-repository/team-member-repository.port.ts
export interface RoleRef { readonly id: string; readonly name: string }
export interface TeamMemberRecord {
  readonly id: string; readonly name: string; readonly whatsappNumber: string;
  readonly email: string | null; readonly roles: readonly RoleRef[]; // by lower(name), TD-A-1
  readonly isArchived: boolean;
}
export interface TeamMemberPageQuery {
  readonly status: TeamMemberStatus; readonly search: ClientSearch | null;
  readonly afterId: string | null; readonly limit: number;
}
export interface TeamMemberChange {
  readonly name: string; readonly whatsappNumber: string; readonly email: string | null;
  readonly roleIds: readonly string[]; readonly editorUserId: string;
}
export interface AssignableMember { readonly id: string; readonly name: string; readonly roles: readonly RoleRef[] }
export type MemberNumberTaken = { readonly status: "NUMBER_TAKEN"; readonly holder: NumberHolder }; // F-06 NumberHolder
export interface TeamMemberRepositoryPort {
  readonly listPage: (context: WorkspaceContext, query: TeamMemberPageQuery) => Promise<readonly TeamMemberRecord[]>;
  readonly count: (context: WorkspaceContext, status: TeamMemberStatus) => Promise<number>;
  /** D-9; NOT_FOUND when a role is not in the workspace (TD-A-5). */
  readonly create: (context: WorkspaceContext, change: TeamMemberChange)
    => Promise<{ readonly status: "CREATED"; readonly id: string } | MemberNumberTaken | "NOT_FOUND">;
  readonly update: (context: WorkspaceContext, id: string, change: TeamMemberChange)
    => Promise<"UPDATED" | "NOT_FOUND" | MemberNumberTaken>;
  readonly setArchived: (context: WorkspaceContext, change: ArchiveChange) => Promise<boolean>; // F-06 ArchiveChange
  /** D-11. */
  readonly delete: (context: WorkspaceContext, id: string) => Promise<"DELETED" | "HAS_ASSIGNMENTS" | "NOT_FOUND">;
  readonly listAssignable: (context: WorkspaceContext) => Promise<readonly AssignableMember[]>; // active, by lower(name)
}

// application/ports/session-assignment-repository/session-assignment-repository.port.ts
export interface AssignmentChange {
  readonly projectId: string; readonly sessionId: string; readonly memberId: string;
  readonly roleId: string; readonly actorId: string;
  /** BR-TEAM-006: the domain predicate, so the repository holds no policy. */
  readonly isEditable: (status: ProjectStatus) => boolean;
}
export type AddAssignmentResult =
  | "ADDED" | "NOT_FOUND" | "PROJECT_CANCELLED" | "MEMBER_ARCHIVED" | "ROLE_NOT_HELD" | "ALREADY_ASSIGNED";
export interface RemoveAssignmentChange {
  readonly projectId: string; readonly assignmentId: string;
  readonly isEditable: (status: ProjectStatus) => boolean;
}
export interface SessionAssignmentRepositoryPort {
  readonly add: (context: WorkspaceContext, change: AssignmentChange) => Promise<AddAssignmentResult>;
  readonly remove: (context: WorkspaceContext, change: RemoveAssignmentChange)
    => Promise<"REMOVED" | "NOT_FOUND" | "PROJECT_CANCELLED">;
}

// added to application/ports/project-repository/project-repository.port.ts
export interface SessionAssignmentRecord {
  readonly id: string; readonly sessionId: string; readonly memberId: string;
  readonly memberName: string; readonly isMemberArchived: boolean; readonly roleName: string;
}
// ProjectDetailRecord gains: readonly assignments: readonly SessionAssignmentRecord[];
// ProjectDetailView gains:   readonly canEditTeam: boolean;
// ProjectListRow gains:      readonly hasTeam: boolean;

// application/use-cases/team-results/team-results.types.ts
export type TeamMemberFieldErrorKey = "EMPTY" | "TOO_LONG" | "REQUIRED" | "INVALID" | "TAKEN";
export interface TeamMemberValidationFailure {
  readonly ok: false; readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<Partial<Record<"name" | "whatsappNumber" | "email" | "roleIds", TeamMemberFieldErrorKey>>>;
  readonly numberHolder?: NumberHolder;
}
export type TeamMemberWriteResult =
  | { readonly ok: true; readonly member?: { readonly id: string; readonly name: string } }
  | TeamMemberValidationFailure;
export interface TeamRoleValidationFailure {
  readonly ok: false; readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<{ name?: "EMPTY" | "TOO_LONG" | "DUPLICATE" }>;
}
export type TeamRoleWriteResult = { readonly ok: true; readonly role?: RoleRef } | TeamRoleValidationFailure;
export type AssignmentFailureCode = Exclude<AddAssignmentResult, "ADDED" | "NOT_FOUND">;
export type AssignmentWriteResult = { readonly ok: true } | { readonly ok: false; readonly code: AssignmentFailureCode };
```

The inline object literals above are shorthand for this plan. In `src/`, extract each one to a named interface in the `.types.ts` file (coding rules › Where types and schemas live).

## Rule code

Write the rules exactly as below, with JSDoc on every export. The tests decide the internals; never change a code (`EMPTY`, `REQUIRED`, …).

```ts
// domain/team-role/team-role.ts
/** BR-TEAM-005: a role name is 1–50 characters after trimming, unique per workspace ignoring case. */
export const TEAM_ROLE_NAME_MAX_LENGTH = 50;
/** BR-TEAM-005: every workspace starts with these roles; migration 0011 backfills them. */
export const DEFAULT_TEAM_ROLES = ["Fotografer", "Videografer", "Asisten"] as const;
export function fitsTeamRoleNameLength(name: string): boolean {
  return Array.from(name).length <= TEAM_ROLE_NAME_MAX_LENGTH;
}

// domain/team-role/team-role.schema.ts
export const teamRoleNameSchema = z
  .string().trim().min(1, { error: "EMPTY" })
  .refine(fitsTeamRoleNameLength, { error: "TOO_LONG" });

// domain/team-member/team-member.ts
/** BR-TEAM-004 */
export const TEAM_MEMBER_NAME_MAX_LENGTH = 100;
export const TEAM_MEMBER_EMAIL_MAX_LENGTH = 254;
/** TD-A-4: bounds the untrusted role list; not a business rule. */
export const TEAM_MEMBER_ROLES_MAX = 50;
export const TEAM_MEMBER_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
/** A-3 */
export const TEAM_PAGE_SIZE = 30;
export function fitsTeamMemberNameLength(name: string): boolean {
  return Array.from(name).length <= TEAM_MEMBER_NAME_MAX_LENGTH;
}

// domain/team-member/team-member.schema.ts
export const teamMemberNameSchema = z
  .string().trim().min(1, { error: "EMPTY" })
  .refine(fitsTeamMemberNameLength, { error: "TOO_LONG" });
/** BR-TEAM-004: required; blank (after separators) → REQUIRED, else BR-CLI-002 (INVALID). */
export const requiredWhatsappNumberSchema = z
  .string().transform(optionalWhatsappValue)
  .pipe(z.string({ error: "REQUIRED" }).pipe(whatsappNumberSchema));
/** BR-TEAM-004: optional, stored lower-case. */
export const optionalEmailSchema = z
  .string().trim()
  .transform((value) => (value === "" ? null : value.toLowerCase()))
  .pipe(z.email({ error: "INVALID" }).max(TEAM_MEMBER_EMAIL_MAX_LENGTH, { error: "TOO_LONG" }).nullable());
/** BR-TEAM-004: one or more roles, deduplicated. */
export const roleIdsSchema = z
  .array(z.uuid()).max(TEAM_MEMBER_ROLES_MAX)
  .transform((ids) => [...new Set(ids)])
  .refine((ids) => ids.length > 0, { error: "REQUIRED" });
export const teamMemberStatusSchema = z.enum(TEAM_MEMBER_STATUSES);

// domain/session-assignment/session-assignment.ts
/** design.md decision 3: at most three avatars, then +n. */
export const SESSION_AVATAR_MAX = 3;
/** BR-TEAM-006: assignments are added and removed in every status except CANCELLED. */
export function isTeamEditable(status: ProjectStatus): boolean {
  return status !== "CANCELLED";
}
export function avatarGroup<T>(assignments: readonly T[]): AvatarGroup<T> {
  return {
    shown: assignments.slice(0, SESSION_AVATAR_MAX),
    overflow: Math.max(0, assignments.length - SESSION_AVATAR_MAX),
  };
}
/** A-12 (UX only; the server re-checks): members not on the session yet. */
export function assignableFor<M extends { readonly id: string }>(
  members: readonly M[], sessionId: string, assignments: readonly AssignmentRef[],
): M[] {
  const taken = new Set(assignments.filter((a) => a.sessionId === sessionId).map((a) => a.memberId));
  return members.filter((member) => !taken.has(member.id));
}
```

`application/schemas/team-member-input`: `z.object({ name: teamMemberNameSchema, whatsappNumber: requiredWhatsappNumberSchema, email: optionalEmailSchema, roleIds: roleIdsSchema })`. `team-role-input`: `{ name: teamRoleNameSchema }`. `assignment-input`: `{ memberId: z.uuid(), roleId: z.uuid() }`. `team-member-list-query`: `{ status: teamMemberStatusSchema, q: z.string().max(CLIENT_SEARCH_MAX_LENGTH), afterId: z.uuid().nullable() }`.

**Drizzle schema** (`adapters/db/schema/booking/team.ts`):

```ts
// F-08 team (BR-TEAM-004…006, ADR-003; technical-design D-2, D-3).
export const teamRole = pgTable("team_role", {
  id: idColumn(),
  workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  ...auditColumns(),
}, (t) => [
  tenantKey(t),
  uniqueIndex("team_role_workspace_name_uq").on(t.workspaceId, sql`lower(${t.name})`),
  check("team_role_name_ck", sql`char_length(${t.name}) between 1 and 50 and ${t.name} = btrim(${t.name})`),
]);

export const teamMember = pgTable("team_member", {
  id: idColumn(),
  workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  email: text("email"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  ...auditColumns(),
}, (t) => [
  tenantKey(t),
  uniqueIndex("team_member_workspace_whatsapp_uq").on(t.workspaceId, t.whatsappNumber),
  index("team_member_workspace_list_idx").on(t.workspaceId, sql`lower(${t.name})`, t.createdAt, t.id),
  check("team_member_name_ck", sql`char_length(${t.name}) between 1 and 100 and ${t.name} = btrim(${t.name})`),
  check("team_member_whatsapp_number_ck",
    sql`${t.whatsappNumber} ~ '^[1-9][0-9]{9,14}$' and ${t.whatsappNumber} !~ '^620'`),
  check("team_member_email_ck",
    sql`${t.email} is null or (char_length(${t.email}) <= 254 and ${t.email} = lower(${t.email}))`),
]);

export const teamMemberRole = pgTable("team_member_role", {
  workspaceId: workspaceIdColumn(),
  memberId: uuid("member_id").notNull(),
  roleId: uuid("role_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.memberId, t.roleId] }),
  tenantRef({ workspaceId: t.workspaceId, column: t.memberId },
    { workspaceId: teamMember.workspaceId, id: teamMember.id }).onDelete("cascade"),
  tenantRef({ workspaceId: t.workspaceId, column: t.roleId },
    { workspaceId: teamRole.workspaceId, id: teamRole.id }).onDelete("restrict"),
  index("team_member_role_role_ix").on(t.workspaceId, t.roleId),
]);

export const sessionAssignment = pgTable("session_assignment", {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  projectId: uuid("project_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  memberId: uuid("member_id").notNull(),
  roleId: uuid("role_id").notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  ...auditColumns(),
}, (t) => [
  // D-3: the session must belong to this project and workspace; deleting it deletes the assignment.
  foreignKey({
    columns: [t.workspaceId, t.projectId, t.sessionId],
    foreignColumns: [projectSession.workspaceId, projectSession.projectId, projectSession.id],
  }).onDelete("cascade"),
  tenantRef({ workspaceId: t.workspaceId, column: t.memberId },
    { workspaceId: teamMember.workspaceId, id: teamMember.id }).onDelete("restrict"),
  tenantRef({ workspaceId: t.workspaceId, column: t.roleId },
    { workspaceId: teamRole.workspaceId, id: teamRole.id }).onDelete("restrict"),
  unique("session_assignment_member_uq").on(t.sessionId, t.memberId),
  index("session_assignment_session_ix").on(t.sessionId, t.createdAt, t.id),
  index("session_assignment_project_ix").on(t.workspaceId, t.projectId),
  index("session_assignment_member_ix").on(t.workspaceId, t.memberId),
  index("session_assignment_role_ix").on(t.workspaceId, t.roleId),
]);
```

In `project.ts`, `projectSession` gains `unique("project_session_project_key_uq").on(t.workspaceId, t.projectId, t.id)` (D-3).

## Test fixtures

`tests/support/booking/team-fixtures.ts` holds the AC people:
- *Dimas Pratama* `6281298765432`, *Fotografer* + *Videografer*;
- *Ayu Kirana* `6281244102231`, *Asisten*;
- *Budi Hartono* `6281111111111`, archived;
- *Sari Lestari* (*Asisten*) and *Joko Santoso* (*Videografer*).

It also has `seedRoles(context)` and `seedMember(context, member)` helpers for integration tests, and `fake-team-repositories.ts` holds in-memory fakes of the three ports for use-case tests.

## AC index

| AC | Slice |
|---|---|
| 008, 009 | 1 |
| 001, 002, 003, 004, 005, 006, 010 | 2 |
| 007, 023 | 3 (023 also in 6) |
| 011, 013, 026, 027, 021 | 4 |
| 014, 015, 020 | 5 |
| 022, C-008, fidelity | 6 (each slice also covers its own isolation cases) |

## Slice template

Each slice has a **Read first** list, a **Done when** check and numbered steps. Each step is plan → failing tests → implement → gate → commit.

---

## Slice 1: Tim › Peran (schema and seeded roles)

**Read first:**
- AC-TEAM-008, AC-TEAM-009, AC-TEAM-022 (roles part); BR-TEAM-005, BR-WS-002, BR-WS-003.
- technical-design.md › D-1, D-2, D-3, D-10, D-12, D-17, Database Changes, Server / API Interface (role rows), Error Handling.
- coding-rules.md › Structure and boundaries, Where types and schemas live, Data Access, Errors and Logging.
- ADR-003, ADR-016.
- Code: § Existing code to follow, rows *Tenant schema helpers*, *Seeding + backfill*, *Workspace-creation transaction*, *Composition flow + scope*, *Server actions*, *Section heading*, *Coming-soon list*.
- Exports: `tim / desktop` base `tim-desktop.base.html` + diffs `tim-peran`, `tim-peran-tambah-nama-sudah-ada`, `tim-peran-hapus-terblokir`; `tim / mobile` base + the same three diffs.

**Done when:** a new workspace and an existing one list their roles at `/team/roles`. Add, rename and delete work, with the duplicate and in-use errors. Migrations 0010/0011 are applied to non-production.

- [x] **1.1 Schema and migrations.**
  - Write `schema/booking/team.ts` as in § Rule code, plus the `project_session` unique and the export in `schema/index.ts`.
  - Run `pnpm db:generate --name team`, then `pnpm drizzle-kit generate --custom --name team_role_backfill` and paste the SQL from technical-design.md › Database Changes.
  - Review the SQL: the `project_session` unique comes before the FK that uses it, and nothing is dropped or renamed.
  - Integration test `tests/integration/booking/team-schema.test.ts`, which breaks every invariant once:
    - a duplicate role name ignoring case;
    - a number taken in the workspace, and the same number in another workspace (allowed);
    - a 0-prefixed number;
    - an upper-case email;
    - an assignment whose session belongs to another project (composite FK);
    - a duplicate session + member;
    - deleting a used role or an assigned member (RESTRICT);
    - deleting a session (assignments cascade).
  - Commit, then `pnpm db:migrate`; report the run.
  - Gate: typecheck, lint, test, test:integration.
  - Commit: `feat(team): add team tables and the role backfill migration`.
- [x] **1.2 Role domain and seeding.**
  - Write `domain/team-role` (§ Rule code), `seed-default-team-roles` and `TeamRoleRepositoryPort.seedDefaults` in `drizzle-team-role-repository.ts`.
  - `withWorkspaceCreationScope` gains `teamRoles`, and both `createOwner*Workspace` functions call `seedDefaultTeamRoles`.
  - Tests:
    - unit: `teamRoleNameSchema` (`EMPTY`, `TOO_LONG` at 51 code points, trimmed);
    - unit: `seedDefaultTeamRoles` passes `DEFAULT_TEAM_ROLES`;
    - integration: `AC-TEAM-008` (a new workspace has three roles; running the backfill SQL on a workspace that has *fotografer* adds *Videografer* and *Asisten* only);
    - integration: the creation rollback still leaves no roles (ADR-016).
  - Commit: `feat(team): seed the default team roles with each workspace`.
- [x] **1.3 Role use cases and repository.**
  - Write `list-team-roles`, `add-team-role`, `rename-team-role`, `delete-team-role`, `team-results`, `team-errors`, `team-role-input`, `team-ids`, and the rest of `drizzle-team-role-repository.ts` (D-10 usage count, `23505` → `DUPLICATE`, `23503` → recount).
  - Tests:
    - unit with fakes: field errors and `IN_USE` + usage;
    - integration: `AC-TEAM-009` (duplicate *videografer*; usage via a member role, and via an assignment only; delete unused);
    - integration: `AC-TEAM-022` (B's role ID through A → `NOT_FOUND`).
  - Commit: `feat(team): manage team roles`.
- [x] **1.4 Composition, actions, route and shell.**
  - Write `team-scope`, `team-flow` (role entries), `app/actions/booking/team.ts` (role actions) and `/team/roles/page.tsx` + `loading.tsx`.
  - `resolveTeamHeading` returns *Tim*, both subtitles and the tabs *Aktif · Arsip · Peran* (D-17); the nav stays active on `/team/*`.
  - `"team"` stays in `COMING_SOON_SECTIONS` until step 2.3. `/team` keeps the *Segera hadir* page; `/team/roles` is its own two-segment route, so `[section]` doesn't catch it.
  - Tests: unit for the heading resolver (three routes) and the action wrappers (revalidate on success).
  - Commit: `feat(team): add the team routes and shell heading`.
- [x] **1.5 *Peran* screen.**
  - Write `team-copy`, `team-tabs-bar`, `team-roles-screen` (desktop DataTable *Daftar peran*, phone list), `team-role-dialog`, `delete-team-role-dialog` (confirm → blocked) and the toasts.
  - Build from the exports in Read first.
  - Tests (dom):
    - the rows show *3 anggota* / *Belum dipakai*;
    - the duplicate field error;
    - the blocked dialog copy with *Tutup*;
    - focus returns to the ⋯ trigger.
  - Gate: + build. Compare with the exports at 1440 and 390.
  - Commit: `feat(team): build the roles tab`.

---

## Slice 2: Tim › Anggota (list and member dialog)

**Read first:**
- AC-TEAM-001, 002, 003, 004, 005, 006, 010; BR-TEAM-004, BR-TEAM-005, BR-CLI-002.
- technical-design.md › D-6, D-7, D-8, D-9, D-16 (`MultiSelect`), UI Components (Tim rows), Validation, Error Handling.
- coding-rules.md › Validation, UI / Components, Copy.
- Code: § Existing code to follow, rows *Unique number + holder lookup*, *List screen…*, *Entity dialog*, *Tab routes*.
- Exports: `tim / desktop` and `tim / mobile`: base `tim-anggota-aktif`, diffs `tim-anggota-arsip`, `tim-anggota-kosong`, `tim-anggota-tidak-ada-hasil`, `tim-anggota-loading`, `tim-form-anggota-tambah`, `tim-form-anggota-error`, `tim-form-anggota-peran-baru`.

**Done when:**
- *Aktif* and *Arsip* list members with search and *Muat lebih banyak*;
- the member dialog adds and edits members with every field error, including *number taken (diarsipkan)*;
- *Tambah peran baru* creates and selects a role.

- [x] **2.1 Member domain.**
  - Write `domain/team-member` (§ Rule code) and `team-member-input`, `team-member-list-query`.
  - Tests (unit, `AC-TEAM-004`, `AC-TEAM-005`):
    - `  Rina  ` is trimmed;
    - `0812-3456-7890` → `6281234567890`;
    - `Rina@Example.com` → lower case;
    - empty or 101-character name;
    - blank number → `REQUIRED`;
    - `12345` → `INVALID`;
    - `rina@` → `INVALID`;
    - `[]` roles → `REQUIRED`;
    - duplicate role IDs are deduplicated.
  - Commit: `feat(team): add team member rules`.
- [x] **2.2 Member use cases and repository.**
  - Write `list-team-members`, `count-team-members`, `add-team-member`, `update-team-member` and `drizzle-team-member-repository.ts` (`listPage`, `count`, `create`, `update`; D-7, D-8, D-9). Roles are aggregated by `lower(name)`.
  - Tests:
    - integration `AC-TEAM-001`: order *Ayu*, *Dimas*; count 2; *Budi* only in *Arsip*;
    - integration `AC-TEAM-003`: *DIM*, `0812 9876`, `%` escaped; 65 rows → 30 / 60 / 65;
    - integration `AC-TEAM-004`: stored values and roles;
    - integration `AC-TEAM-006`: archived holder, a client with the same number allowed, `Promise.all` → exactly one `NUMBER_TAKEN`;
    - integration `AC-TEAM-007`, part 1: removing *Videografer* leaves an existing assignment's role;
    - integration TD-A-5: B's role ID in A's body → `NOT_FOUND`.
  - Commit: `feat(team): list, add and edit team members`.
- [x] **2.3 Flow, actions and routes.**
  - Write the `team-flow` member entries (`loadTeamMembers`, `loadMoreTeamMembers`, add, update) and their actions, and `/team/page.tsx` + `/team/archived/page.tsx` + `loading.tsx`.
  - Remove `"team"` from `COMING_SOON_SECTIONS` (D-17); a unit test asserts *Tim* no longer resolves to *Segera hadir* (`AC-TEAM-001`).
  - Pages also pass the roles to the screen.
  - Tests: unit for the action wrappers; an action re-validates bypassed input (`AC-TEAM-005`).
  - Commit: `feat(team): wire the member routes and actions`.
- [x] **2.4 Shared `MultiSelect` + `IconButton` danger + `user-plus`.**
  - `MultiSelect` gains `description`, `errorMessage` and `createAction?: { label; onPress }`. The create row sits under the options with a `plus` icon (export `tim-form-anggota-peran-baru`).
  - `IconButton` gains `tone="danger"`, whose icon uses `--color-semantic-status-danger-fg`.
  - `Icon` gains `user-plus` (Hugeicons).
  - Update the stories and tests.
  - Commit: `feat(ui): extend multi-select, icon-button and icons for the team`.
- [x] **2.5 *Anggota* screen.**
  - Write `team-members-screen`, `team-members-table`, `team-member-list`, `team-member-search-field`, `team-members-empty-state`, `team-members-skeleton` and `use-load-more-team-members`.
  - The table footer renders only while there's a next page (design.md › Table footer).
  - Tests (dom):
    - `AC-TEAM-001` row content: `+62 812-9876-5432`, *Fotografer, Videografer*, no money;
    - `AC-TEAM-002`: both empty states;
    - `AC-TEAM-003`: no-match with *Hapus pencarian*, `q` kept in the URL;
    - the load-more append.
  - Gate: + build. Compare with the exports at 1440 and 390.
  - Commit: `feat(team): build the members tab`.
- [x] **2.6 Member dialog.**
  - Write `team-member-dialog` + `useTeamMemberForm` (RHF + `zodResolver(teamMemberInputSchema)`; server field errors through `setError`; the number-taken message with *(diarsipkan)*) and `team-field-error`.
  - *Tambah peran baru* opens `TeamRoleDialog` on top. On save, the new role joins the options and is selected (A-5).
  - The add and edit toasts.
  - Tests (dom):
    - `AC-TEAM-004`;
    - `AC-TEAM-005`: every message;
    - `AC-TEAM-006`: the holder message;
    - `AC-TEAM-010`: *MUA* created and selected;
    - focus returns to the member dialog;
    - `AC-TEAM-023`: the danger toast keeps the input.
  - Gate: + build + `tests/e2e/team/team.spec.ts` (add *Rina*, search, *Arsip* tab). Compare with the exports.
  - Commit: `feat(team): add the member dialog with inline role creation`.

---

## Slice 3: Member row menu

**Read first:**
- AC-TEAM-007, AC-TEAM-023; BR-TEAM-004; C-103, C-106.
- technical-design.md › D-11, Security.
- Code: § Existing code to follow, row *Row menu, delete with blocked state, mutations + toasts + undo*.
- Exports: `tim / desktop` and `tim / mobile` diffs `tim-anggota-menu-baris`, `tim-anggota-hapus-terblokir`, `tim-toast-diarsipkan`.

**Done when:** from a row, the Owner can:
- open WhatsApp;
- archive (with *Batalkan*) and restore;
- delete an unassigned member;
- see the blocked dialog for an assigned one.

No log line carries member data.

- [x] **3.1 Archive and delete backend.**
  - Write `set-team-member-archived`, `delete-team-member`, the repository `setArchived` / `delete` (D-11), the flow entries and the actions.
  - Tests:
    - integration `AC-TEAM-007`: archive, restore, delete with an assignment → `HAS_ASSIGNMENTS`, unassigned delete → gone and its role rows too;
    - integration `AC-TEAM-022`: B's member through A;
    - unit `AC-TEAM-023`: a failing write logs `team.save_failed` with `{ workspaceId, operation }` only (logger spy; no name, number or email).
  - Commit: `feat(team): archive, restore and delete team members`.
- [x] **3.2 Row menu, dialogs and toasts.**
  - Write `team-member-row-actions` (Action Menu on desktop, opening upward; Bottom Sheet/Actions on phones), `delete-team-member-dialog` (confirm → blocked) and `use-team-mutations` (archive toast with *Batalkan* → restore; restore and delete toasts).
  - *Arsip* rows show *Pulihkan* instead of *Arsipkan*.
  - *Buka WhatsApp* is an `<a>` with `wa.me`, `target="_blank"` and `rel="noopener noreferrer"`.
  - Selecting the row opens *Ubah* (A-1).
  - Tests (dom):
    - the menu items per tab;
    - the `wa.me` href;
    - undo calls restore;
    - the blocked copy.
  - Gate: + build + E2E (archive + undo, delete blocked). Compare with the exports.
  - Commit: `feat(team): add the member row menu`.

---

## Slice 4: *Jadwal* staffing and the Penugasan form

**Read first:**
- AC-TEAM-011, 013, 021, 026, 027; BR-TEAM-001, 002, 006; BR-PRJ-004.
- technical-design.md › D-3, D-4, D-13, D-14 (`hasTeam` only), D-15, D-16, UI Components (session team rows), Concurrency.
- diagrams/activity.md › *Add or remove an assignment*.
- Code: § Existing code to follow, rows *Locking the project row*, *Jadwal rows, session ⋯, detail dialogs*, *Detail writes + toasts + refresh*.
- Exports: `proyek / desktop` base `proyek-desktop.base.html` (*Jadwal dengan tim*) + diffs `proyek-menu-sesi-belum-ada-tim`, `proyek-menu-sesi-ada-tim`, `proyek-penugasan-tambah`, `proyek-penugasan-tanpa-anggota-aktif`, `proyek-toast-anggota-ditambahkan`; `proyek / mobile` base `proyek-mobile.base.html` + diff `proyek-detail-jadwal-dengan-tim`, and the same four diffs.

**Done when:**
- a session without a team shows `user-plus` and ⋯ › *Tambah tim*, and both open the Penugasan form;
- saving shows the avatar and the toast;
- a session with a team shows the avatar group (≤ 3 + *+n*, with desktop tooltips) and ⋯ › *Atur tim*. *Atur tim* opens in Slice 5; until then, the item and the avatar group open the Penugasan form.

- [ ] **4.1 Assignment domain and add backend.**
  - Write `domain/session-assignment` (§ Rule code), `assignment-input`, `add-session-assignment`, `list-assignable-members`, the repository `add` (D-4) and `listAssignable`.
  - Tests:
    - unit: `isTeamEditable`, `avatarGroup` (4 → 3 + 1), `assignableFor`;
    - integration `AC-TEAM-011`: added; project status unchanged (`AC-TEAM-021`);
    - integration `AC-TEAM-013`: duplicate sequential and `Promise.all` (one `ALREADY_ASSIGNED`); *Budi* archived → `MEMBER_ARCHIVED`; *Asisten* → `ROLE_NOT_HELD`; another project's session → `NOT_FOUND`;
    - integration `AC-TEAM-022`: B's member or role → `NOT_FOUND`.
  - Commit: `feat(team): assign members to sessions`.
- [ ] **4.2 Detail record carries the team.**
  - `findDetail` loads `assignments` (D-13); `getProjectDetail` adds `canEditTeam`.
  - The list SQL adds `hasTeam` (`EXISTS`), and `ProjectListRow` gains it (D-14).
  - Write the flow entries `loadAssignableMembers` and `addSessionAssignmentEntry` and `app/actions/booking/session-team.ts`.
  - The detail page loads `assignableMembers` beside the project.
  - Update `tests/support/booking/project-detail-view.ts` and the fake project repository.
  - Tests:
    - integration: assignment order (A-4); archived flag; renamed role shows (`AC-TEAM-009`, rename part);
    - integration: `hasTeam`;
    - F-07's project tests still pass.
  - Commit: `feat(team): load session teams with the project detail`.
- [ ] **4.3 Avatars, `user-plus` and the session ⋯ item.**
  - Write `session-team-avatars` (Avatar/SM with the `surface/panel` ring, overlap and *+n* chip as drawn; desktop Tooltip *{name} · {role}*; the group is a button opening *Atur tim*).
  - The *Jadwal* row trailing becomes: avatars or `IconButton` Ghost/SM `user-plus` (only when `canEditTeam`), then ⋯.
  - `SessionRowActions` gains an optional first item `teamAction` (*Tambah tim* `user-plus` / *Atur tim* `users`) and a divider before *Hapus sesi*, as drawn.
  - A cancelled project keeps the avatars and has no `user-plus` and no ⋯ (`AC-TEAM-015`, first bullet).
  - Tests (dom):
    - `AC-TEAM-026`: *DP*, *SL*, *JS*, *+1*; tooltip text; order;
    - `AC-TEAM-011`: menu items with and without a team;
    - `AC-TEAM-021`: no status control.
  - Commit: `feat(team): show session teams in the schedule`.
- [ ] **4.4 Penugasan form and the flow host.**
  - Write `assignment-dialog`:
    - Modal MD / Bottom Sheet Form with the session header;
    - an Anggota Select of `assignableFor(...)`;
    - a Peran Select of the member's roles, first preselected, reset when the member changes;
    - the helpers as drawn;
    - the Empty State with *Buka Tim* → `/w/[id]/team` when no member is assignable;
    - *Tambah* disabled.
  - Write `session-team-host` + the `sessionTeamFlow` reducer (D-15), with the team view stubbed to open the form until Slice 5.
  - Form errors per `AssignmentFailureCode` (§ Copy); `PROJECT_CANCELLED` → danger toast + refresh.
  - On success: toast *Anggota ditambahkan* and close (or return to *Atur tim*).
  - Tests:
    - unit: reducer transitions;
    - dom `AC-TEAM-011`: role preselect *Fotografer*, then *Videografer* saved;
    - dom `AC-TEAM-027`: empty state, disabled *Tambah*, *Buka Tim* href;
    - dom `AC-TEAM-013`: an error keeps the dialog open.
  - Gate: + build + `tests/e2e/projects/session-team.spec.ts` (staff *Resepsi*). Compare with the exports at 1440 and 390.
  - Commit: `feat(team): add the penugasan form`.

---

## Slice 5: *Atur tim*, removal and team-aware deletes

**Read first:**
- AC-TEAM-014, 015, 020; BR-TEAM-003, BR-TEAM-006, BR-PRJ-010.
- technical-design.md › D-5, D-14, D-15, Error Handling (cancelled).
- diagrams/activity.md (both diagrams).
- Code: § Existing code to follow, rows *Confirm dialog, draft delete*, *Jadwal rows…*.
- Exports: `proyek / desktop` diffs `proyek-atur-tim-terisi`, `proyek-hapus-dari-sesi`, `proyek-dibatalkan-atur-tim-read-only`, `proyek-hapus-sesi-dengan-tim`; `proyek / mobile` base (`proyek-hapus-dari-sesi`) + diffs `proyek-atur-tim-terisi`, `proyek-dibatalkan-atur-tim-read-only`, `proyek-hapus-sesi-dengan-tim`.

**Done when:**
- *Atur tim* lists the team, removes members with confirmation, adds more through the form and closes on the last removal;
- cancelled projects show it read-only;
- the session and draft delete confirmations name the team.

- [ ] **5.1 Remove backend.**
  - Write `remove-session-assignment`, the repository `remove` (D-5), the flow entry and the action.
  - Tests:
    - integration `AC-TEAM-014`: removed;
    - integration `AC-TEAM-015`: add and remove on `CANCELLED` → `PROJECT_CANCELLED`; `Promise.all(cancel, add)` → either the add wins and the cancel keeps it, or `PROJECT_CANCELLED`;
    - integration `AC-TEAM-022`: B's assignment → `NOT_FOUND`;
    - integration `AC-TEAM-020`: session delete and draft delete cascade, and the members remain.
  - Commit: `feat(team): remove members from sessions`.
- [ ] **5.2 *Atur tim*.**
  - Write `session-team-dialog`:
    - Modal MD / Bottom Sheet Form;
    - title *Tim · {session}* and the session line;
    - rows: Avatar/MD, name (+ *(diarsipkan)*), role, and `IconButton` Ghost/SM `trash-2` `tone="danger"` with aria-label *Hapus dari sesi*;
    - *Tambah anggota* and *Selesai* (desktop);
    - read-only when `!canEditTeam`: the note, no rows actions, no *Tambah anggota*, only *Tutup*.
  - The remove confirm uses `ProjectConfirmDialog` with the § Copy strings.
  - Wire the reducer's team view: the avatar group and ⋯ › *Atur tim* open it; *Tambah anggota* → form → back; it closes when the refreshed session has no assignments.
  - Tests:
    - dom `AC-TEAM-014`: rows, no *Ubah penugasan*, return to *Atur tim* after adding, closes on the last removal, toasts;
    - dom `AC-TEAM-015`: read-only.
  - Compare with the exports at 1440 and 390.
  - Commit: `feat(team): add atur tim`.
- [ ] **5.3 Team-aware deletes.**
  - In `DetailEditing`, a session with assignments gets the body *Sesi ini punya {n} anggota tim. Penugasan mereka ikut terhapus.*
  - `StatusDialogTarget` / `ProjectMenuTarget` gain `hasTeam?`. The list row passes `row.hasTeam`, the detail passes `assignments.length > 0`, and `DeleteDraftDialog` appends *Penugasan tim ikut terhapus.*
  - Tests (dom `AC-TEAM-020`): both bodies, with and without a team. F-07's dialog tests still pass.
  - Gate: + build + E2E (remove the last member, change a role by remove + add, delete a staffed session). Compare `proyek-hapus-sesi-dengan-tim` with its exports.
  - Commit: `feat(team): name the team in session and draft deletes`.

---

## Slice 6: Close

**Read first:**
- AC-TEAM-022, AC-TEAM-023, C-008; design.md › Frames (all 48).
- technical-design.md › Security, Testing Strategy.
- Code: `tests/e2e/clients/clients.spec.ts` (axe helper), `tests/e2e/projects/projects.spec.ts`.
- Exports: every group in `_compact/INDEX.md`.

**Done when:**
- the J-03 staffing journey passes in E2E;
- axe is clean on every F-08 surface at 1440 and 390, light and dark;
- the isolation sweep and the fidelity pass are recorded in technical-design.md › Implementation record.

- [ ] **6.1 Isolation and logging sweep.**
  - Integration `AC-TEAM-022`: one test per write and read entry with workspace B's IDs, in the route and in the body.
  - Unit `AC-TEAM-023`: every flow's `saveError` logs IDs only.
  - Commit: `test(team): cover tenant isolation and log redaction`.
- [ ] **6.2 Journeys and accessibility.**
  - E2E J-03:
    - add members;
    - staff two sessions;
    - open *Atur tim*;
    - remove;
    - cancel the project → read-only.
  - E2E foreign URLs → 404.
  - axe on the three tabs, the member and role dialogs, the row sheet, *Atur tim* and the Penugasan form, at 1440 and 390, light and dark.
  - Keyboard paths: tab to `user-plus`, Enter opens the form, Esc returns focus.
  - Commit: `test(team): add the staffing journey and accessibility checks`.
- [ ] **6.3 Fidelity pass and record.**
  - Compare every screen with its 48 exports at 1440 and 390. Only class names and nesting may change (AGENTS.md).
  - Append *Implementation record* to technical-design.md: deviations, DESIGN TOKEN GAPs, migration runs and test counts.
  - Set the spec status to BUILT, pending `/sdv:verify-feature team-sessions`.
  - Commit: `docs(team): record the f-08 implementation`.
