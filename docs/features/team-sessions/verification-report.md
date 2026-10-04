# F-08 Team — verification report

Date: 2026-10-04 · Verifier: agent (`/sdv:verify-feature team-sessions`) · Branch `feat/team-sessions` at `38c08c2` · Result: **NOT DONE — 3 blocking items** (E2E evidence, fidelity pass, AC-TEAM-023 retry). Status stays IN PROGRESS.

Sources:
- [spec.md](spec.md), [acceptance-criteria.md](acceptance-criteria.md) (AC-TEAM-001…028; 012, 016–019, 024, 025 removed), [diagrams](diagrams/), [design.md](design.md) (48 exports, `_compact/INDEX.md`);
- [technical-design.md](technical-design.md) (D-1…D-18, implementation records), [plan.md](plan.md);
- constitution v1.0, `docs/coding-rules.md` v2.0, `docs/domain/business-rules.md` (BR-TEAM-001…006, BR-CLI-002, BR-PRJ-004/010, BR-WS-002/003, BR-AUTH-001), ADR-003/006/009/010/015/016;
- `docs/design-system/token-usage.md` (rules v3.1, **APPROVED**: deviations below are findings, not advisory).

## Quality gate (run 2026-10-04)

| Check | Result |
|---|---|
| `pnpm typecheck` | PASS |
| Prettier (`src`, `tests`, feature docs) | PASS |
| ESLint `src tests` (boundaries, `server-only`, `ui-copy`, SonarJS) | PASS. Run on `src tests` because `pnpm lint` also scans another session's `.claude/worktrees/*` (known, Slice 1 record). |
| `pnpm tokens:check` | PASS: 597 tokens, CSS variable usage valid (1110 files) |
| `pnpm test` | PASS: 1297/1297 (336 files) |
| `pnpm test:integration` | PASS: 136/136 (18 files); booking 86/86, including team schema, seeding, role, member and assignment repositories, cascades, cancel races and isolation |
| `pnpm build` | PASS: `/team`, `/team/archived`, `/team/roles`, `/projects/new` built |
| Migrations | PASS: `0010_team` is additive (4 tables + `project_session_project_key_uq`, created before the 3-column FK that uses it); `0011_team_role_backfill` matches technical-design.md (skips names case-insensitively, `ON CONFLICT DO NOTHING`). Applied to the non-production DB (integration tests run against it). |
| E2E `tests/e2e/team` + `tests/e2e/projects` | **INCONCLUSIVE — blocking.** 23 tests: 9 passed, 4 flaky (passed on retry), 10 failed. See *E2E run* below. |
| Fidelity pass (plan 6.3) | **NOT RUN — blocking.** Needs a running app on port 3000 (see *E2E run*). |

### E2E run (51.5 min, 13:44–14:36)

- **Passed:** AC-TEAM-014 (*Atur tim*, last remove closes, role change by remove + add); AC-TEAM-020 (staffed session delete); axe on Tim (3 tabs), member and role dialogs, row menu, *Atur tim* and Penugasan form at desktop light, phone light, phone dark, and desktop dark (on retry); AC-TEAM-011 keyboard path (on retry); AC-TEAM-022 roles page of another workspace (on retry); F-07 AC-PRJ-006/007/008/009/013/025/029/030 and AC-PRJ-018…023 (on retry).
- **Failed, not attributable to F-08 code:**
  1. **13:44–14:09:** failures in setup steps that F-08 doesn't own: registration (`auth_rate_limit` insert *Failed query*), email verification (*Failed query*), onboarding not leaving `/onboarding/workspace` in 5 s, services page *Terjadi kesalahan* (`Failed to get session`), project create not navigating in 5 s. The dev server log has 51 `request.unhandled_error`, all DB query failures or aborted streams, across auth, services, clients and projects routes. Machine load average was about 5.
  2. **From 14:09:** another session's worktree (`.claude/worktrees/new-feature-skill-start-a92e1b`, PID 55432) started `next dev` on `*:3000`, and the remaining requests reached it. That checkout has no F-08: `/team` rendered *Segera hadir* (AC-TEAM-001 failure snapshot). Every result after 14:09 (team-journey AC-TEAM-022 foreign URLs, AC-TEAM-028, and `team.spec.ts`) is void. I didn't stop that server, because it belongs to another session.
- **Never passed in this run:** J-03 journey (`team-journey.spec.ts:84`), AC-TEAM-022 foreign URLs (`:98`), AC-TEAM-028 (`:123`), `session-team.spec.ts:24` (AC-TEAM-011/013/021/026/027), `team.spec.ts` (AC-TEAM-001…004, 007, 008, 009), and F-07 AC-PRJ-001/004/009/026/027/028/029.
- **Note:** every team spec sets `retries: 2`, so a pass can hide flakiness. F-07 already has six known flaky journeys.

## Functional — acceptance criteria

All ACs are PASS at unit and integration level. Where the E2E evidence is missing, that is noted.

| AC | Result | Evidence |
|---|---|---|
| AC-TEAM-001 | PASS (E2E pending) | `list-team-members.test.ts`, `team-member-roles.test.ts`, `team-members-screen.test.tsx`, `coming-soon-sections.test.ts`, `owner-nav.test.tsx`; integration `team-member-repository` (order, count) |
| AC-TEAM-002 | PASS (E2E pending) | `team-members-screen.test.tsx` (empty *Aktif*, empty *Arsip*), integration *Arsip* filter |
| AC-TEAM-003 | PASS (E2E pending) | integration (name `ILIKE` with escaped wildcards, digits, 65 rows → 30/60/65); `team-flow.test.ts`, action test |
| AC-TEAM-004 | PASS (E2E pending) | `team-member.test.ts` (trim, normalize, lower-case email), `add-team-member.test.ts`, dialog test, integration stored values |
| AC-TEAM-005 | PASS | schema table, `team-field-error.test.ts`, dialog messages, `team.test.ts` (bypassed input rejected by the action) |
| AC-TEAM-006 | PASS | integration: archived holder → `NUMBER_TAKEN` + archived flag; client number doesn't conflict; parallel creates → exactly one `NUMBER_TAKEN` |
| AC-TEAM-007 | PASS (E2E pending) | integration (role removal keeps the assignment's role, archive/restore, `HAS_ASSIGNMENTS`), row actions, undo toast, blocked delete dialog; E2E `session-team.spec.ts` part didn't run to completion |
| AC-TEAM-008 | PASS | `team-role-seeding.test.ts` (new workspace has the three roles; backfill on *fotografer* adds two, no duplicate) |
| AC-TEAM-009 | PASS | integration (duplicate ignoring case, rename visible on members and assignments, `IN_USE` for member-held and assignment-only, unused delete); roles screen test |
| AC-TEAM-010 | PASS | `team-member-dialog.test.tsx` (*Tambah peran baru* opens the role dialog, new role selected), `multi-select.test.tsx` |
| AC-TEAM-011 | PASS (journey E2E pending) | `session-team-flow.test.ts`, `session-team-host.test.tsx`, `assignment-dialog.test.tsx` (role preselect), `project-detail-team.test.tsx` (menu items), integration add; E2E keyboard path passed |
| AC-TEAM-013 | PASS | integration: sequential and `Promise.all` duplicate, archived member, role not held, foreign session/member/role → `NOT_FOUND`; `assignableFor` unit |
| AC-TEAM-014 | PASS | reducer and dialog tests, integration remove, **E2E passed** |
| AC-TEAM-015 | PASS (journey E2E pending) | `isTeamEditable`, read-only *Atur tim* test, no `user-plus` / ⋯; integration add/remove on `CANCELLED` → `PROJECT_CANCELLED`, cancel-vs-add serialized |
| AC-TEAM-020 | PASS | dialog tests (count sentence, draft sentence), integration cascades (members stay), **E2E passed** |
| AC-TEAM-021 | PASS | `project-detail-team.test.tsx` (no status control), integration (status unchanged) |
| AC-TEAM-022 | PASS (foreign-URL E2E pending) | integration isolation in every team repository and `session-assignment`; use-case `NOT_FOUND` tests; E2E roles page of another workspace passed (retry) |
| AC-TEAM-023 | **PARTIAL — blocking** | Logs: PASS (`team-flow-redaction.test.ts`, all 13 flow entries log IDs only; the only log call is `team.save_failed` with `{ workspaceId, operation, projectId? }`). Member and role writes show *Perubahan belum tersimpan* with *Coba lagi* (`use-team-mutations`). **Assignment add and remove show the danger toast without *Coba lagi*** (`use-assignment-form.ts`, `use-remove-assignment.ts`); the AC requires it for "any member, role or assignment write". Implementation record slice 5, deviation 4 records it for removal only. |
| AC-TEAM-026 | PASS (E2E pending) | `avatarGroup` (4 → 3 + *+1*), `project-detail-team.test.tsx` (initials, order, tooltip text) |
| AC-TEAM-027 | PASS | `assignment-dialog.test.tsx` (Empty State, *Tambah* disabled, *Buka Tim* target) |
| AC-TEAM-028 | PASS (E2E pending) | `create-project.test.ts` (duplicate member → `TEAM_INVALID`), `session-team-field.test.tsx`, `session-dialog.test.tsx`, `create-project-screen.test.tsx`, `team-assignments.test.ts`; integration `session-assignment.test.ts` (one transaction, foreign → `NOT_FOUND`, archived / role not held → `TEAM_INVALID`, nothing created) |

## Technical quality

| Item | Result |
|---|---|
| Server authority (C-004) | PASS: every action re-parses with the shared schema; workspace from the route only; status, member state and role ownership are read under lock, never taken from the request. |
| Domain integrity (C-003) | PASS: CHECKs (names, number, email), unique number per workspace, unique role name ignoring case, `UNIQUE (session_id, member_id)`, composite FKs including the 3-column session key, RESTRICT on member/role use. |
| Consistency (C-005) | PASS: assignment add locks the project `FOR UPDATE` and the member `FOR SHARE` (D-4); remove locks the project (D-5); create-project team check locks members `FOR SHARE` in the snapshot transaction (D-18); `23505` → `ALREADY_ASSIGNED` backstop. |
| Isolation (C-101) | PASS: every query filters `workspace_id`; `alreadyOnSession` filters by session ID only, after the session was verified in the workspace. |
| Logging (C-103) | PASS: see AC-TEAM-023. `wa.me` links are built in the browser (`whatsappChatUrl`) and never logged. |
| C-106, BR-AUTH-001 | PASS: no message is sent, and F-08 adds no public route. |
| Boundaries and `server-only` | PASS (lint). |
| Co-located tests | ADVISORY: `session-team-avatars`, `team-members-table`, `team-member-list`, `team-tabs-bar`, `team-role-dialog`, `team-role-list`, `team-roles-table`, `team-role-row-actions`, `team-member-search-field`, `team-members-empty-state`, `delete-team-role-dialog`, `use-team-mutations` and `use-load-more-team-members` have no test in their own folder. They are covered through the screen and host tests (`team-members-screen`, `team-roles-screen`, `project-detail-team`), not unit by unit (coding rules › Files). |
| Types in parameters | ADVISORY: `insertTeams(tx, context, target: { … })` in `adapters/db/project-repository/drizzle-snapshot-team.ts` uses an inline object type in a parameter (coding rules › Where types and schemas live). |
| Assignment order (A-4) | ADVISORY: `insertTeams` sets `createdAt` from the app clock (`Date.now() + i`), while later adds through *Atur tim* use the DB's `now()`. If the app clock is ahead of the DB, a later add can sort before the create-time picks. |

## Visual fidelity (Pencil exports)

| Surface | Result | Notes |
|---|---|---|
| Tim › Anggota, Arsip, Peran, dialogs, row menu, toasts (28 exports) | **NOT RUN** | Plan 6.3 is open. No screenshots of the running app could be taken (port 3000, see above). |
| Project detail: *Jadwal* avatars / `user-plus`, session ⋯, *Atur tim*, Penugasan, deletes, cancelled, toast (20 exports) | **NOT RUN** | Same. Spot check of the code against the export: avatar overlap 6, ring 2 in `surface/panel`, *+n* chip 24 × 24, caption semibold, `text/secondary`. These match apart from the chip fill token (DS-2). |
| *Proyek baru* › session dialog *Tim* field (AC-TEAM-028) | **NO DESIGN** | Not drawn in Pencil and has no export. spec.md says *"design.md COMPONENT GAP"*, but design.md has no such entry (DOC-2). It was built without an export, contrary to AGENTS.md › UI tasks. The Owner accepted that in the spec, but the visual result can't be verified. |

Recorded implementation deviations (technical-design.md › Implementation records) are accepted as listed, apart from slice 5 deviation 4, which conflicts with AC-TEAM-023 (see above). In short: Peran phone rows get a `user-round-cog` leading element; *Hapus pencarian* has no icon; the phone MultiSelect uses the F-07 sheet list; `Button` gains `user-round-cog` / `user-plus`; *Atur tim* on phones has only *Tambah anggota* in its footer; the dialogs are remounted per view.

## Design system (token-usage v3.1, APPROVED)

| Rule | Result | Notes |
|---|---|---|
| G2: no primitives | PASS | Scan of every F-08 UI file: no `color-primitive` reference. |
| G4: no hard-coded values | **FAIL (minor), DS-1** | `session-team-avatars.tsx`: `-ml-[6px]` duplicates `space.1-5` (6 px, exists). Use `-ml-(--space-1-5)`. The other literals are design-recorded literal sizes with no token: `size-[24px]` (*+n* chip), `md:w-[320px]` (search), column widths 184 / 200 / 32, and the 720 container (it uses `--size-content-narrow`, a token). Record those as a DESIGN TOKEN GAP. No hex, `rgb` or opacity variants. |
| G1/G3: token by meaning, component tokens | **DEVIATION, DS-2 and DS-3** | DS-2: the *+n* chip uses `color/semantic/surface/subtle`; design.md says `surface/sunken`. Both resolve to neutral 100 / 900 today, so nothing looks different, but the meaning has drifted. DS-3: `IconButton tone="danger"` binds `color/semantic/status/danger/fg` directly, because there is no `component/icon-button/danger/icon` (design.md COMPONENT GAP, D-16). Promote the token if F-09+ reuses it. |
| G5: fg/bg pairing | PASS | *+n* chip `text/secondary` on a neutral surface; danger icon on the ghost button surface; axe found no contrast violations at 1440/390 in light and dark (the desktop-dark run passed on retry). |
| SP1–SP11: spacing ladder, insets | PASS (except DS-1) | Screens use `space.*` and `component.panel.app.content.gap`; the avatar group button inset is `space.1`; no `m-*` on children except `mx-auto` centring (existing pattern); half-steps only inside small components. |
| SP5: linked instances, no padding overrides | PASS | design.md scan: every frame uses linked `m:` library instances, 0 raw colours. Code doesn't override `src/ui` component insets. |
| Theme coverage | PASS (code) | No mode-specific classes; dark mode is covered by the axe matrix. The Pencil frames are light only (GAP-01, project-wide). |
| Drift tokens ⇄ CSS ⇄ library | PASS | `tokens:check` (597 tokens). F-08 changed no token. |

## Spec and document consistency

- **CONFLICT-1 (same authority level, spec vs AC):** spec A-2 still says *Proyek baru* doesn't offer staffing. The spec's own alternative flow *While creating a project* and AC-TEAM-028 (Owner 2026-10-04) say it does. Fix A-2; the AC is the later Owner decision.
- **DOC-1:** `diagrams/state.md` › Not modelled says an assignment is *"created, edited and removed"*. It is never edited (BR-TEAM-006).
- **DOC-2:** design.md doesn't record the AC-TEAM-028 *Tim* field COMPONENT GAP that the spec points to.
- **DOC-3:** technical-design.md header still says `Status: PLANNED` and *AC-TEAM-001…027*; D-18 sits before D-17; there's no implementation record for the AC-TEAM-028 commits (`878b940`, `49b8b3f`, `7f101dc`) or the combobox fix (`1f53b2c`). Plan steps 6.2 and 6.3 are still unchecked.
- **DOC-4:** `docs/HANDOFF.md` (F-08 PLANNED) and `docs/product/feature-map.md` (Slices 1–5, *Next: build 1*) are stale.
- **Process (C-011):** the AC-TEAM-028 spec, AC and D-18 text landed in `7f101dc` (`fix(team): …`), after the feature commits `878b940` and `49b8b3f`. They weren't written first or committed with the behaviour.

## Blocking

1. **E2E evidence:** J-03 journey, foreign URLs (AC-TEAM-022), AC-TEAM-028, `session-team.spec.ts:24` and `team.spec.ts` need a clean run against this checkout. Free port 3000 (stop the other worktree's `next dev`, PID 55432), then run `pnpm e2e tests/e2e/team tests/e2e/projects`.
2. **Fidelity pass (plan 6.3):** compare the 48 exports at 1440 / 390 with the running app and record the result.
3. **AC-TEAM-023:** add the *Coba lagi* action to the assignment add and remove failure toasts (both `PROJECT_COPY.retry` and the toast `action` already exist), or have the Owner amend the AC.

## Non-blocking (fix before or with DONE)

- CONFLICT-1, DOC-1…DOC-4 (document edits only).
- DS-1 (`-ml-(--space-1-5)`), DS-2 (`surface/sunken`).
- The AC-TEAM-028 *Tim* field: the Owner decides whether to draw it in `team-sessions.pen` and export it, or to accept it as built.

## Advisory

- Co-located tests for the listed UI units; the inline parameter type in `insertTeams`; `createdAt` source in `insertTeams`.
- `retries: 2` on every team spec can hide flakiness; F-07's six flaky journeys are still open.
- DESIGN TOKEN GAP: the literal sizes 24 (chip), 320 (search), 184 / 200 / 32 (columns).
