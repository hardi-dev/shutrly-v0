# Technical Design — F-04 Source configuration

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Status: IN PROGRESS (2026-10-02) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) · Design: [design.md](design.md) (24 frames, `exports/`) · Plan: [plan.md](plan.md)

## Context

Each workspace keeps a list of photo sources (`WorkspaceSourceConfig`). In MVP only Google Drive can be added, and its `configData` is empty; the folder link is pasted per gallery in F-09. The Owner adds, renames, deactivates/reactivates and deletes sources on *Sumber foto*. Every workspace starts with one *Google Drive* source. F-04 calls no external service.

## Relevant Authority

- Constitution: C-003, C-004, C-006, C-007, C-008, C-101, C-103.
- Business rules: BR-SRC-001…006, BR-WS-002, BR-WS-003.
- ADRs: ADR-003 (workspace isolation), ADR-005 (Drive public links), ADR-009 (Neon serverless), ADR-010 (Tailwind + React Aria), ADR-015 (URL-scoped routes), ADR-016 (cross-feature transaction in composition, reused for seeding). **No new ADR:** F-04 reuses ADR-016 and adds no architecture.
- Rules: `docs/coding-rules.md` v2.0; `docs/design-system/token-usage.md` v3.1; component specs `status-chip.md`, `list-card.md`, `option-card.md` (2026-10-01).

## Architecture

F-04 opens the **`gallery`** bounded context named in `architecture/overview.md`; `WorkspaceSourceConfig` and F-09's `GallerySource` live together there. It never imports `features/workspace` or `features/communications`; workspace verification reaches it through `composition/`.

```text
app/(owner)/w/[workspaceId]/photo-sources/page.tsx     → composition › loadPhotoSources
app/(owner)/w/[workspaceId]/photo-sources/loading.tsx  → PhotoSourcesSkeleton
app/actions/gallery/photo-sources.ts                    → composition › add/rename/setActive/delete
composition/gallery/source-config-scope                 → Drizzle workspace-source repository
composition/gallery/source-config-flow                  → verify workspace (F-02) + use cases + logging
composition/workspace/workspace-creation-scope          → ONE transaction: workspace + templates + Google Drive source (ADR-016)
features/gallery/domain       → providers, source name rules, default source, list order
features/gallery/application  → port, schemas, errors, use cases (list, add, rename, set active, delete, seed)
features/gallery/ui           → Sumber foto screen, rows, dialogs, row actions, guide card, skeleton
adapters/db/schema/gallery    → workspace_source_config table
adapters/db/workspace-source-repository → Drizzle implementation of the port
```

Shared UI additions (`src/ui`), built first because the library components exist only in Pencil so far:

| Unit | Location | Library |
|---|---|---|
| Icons `hard-drive`, `folder-open`, `folder`, `power`, `dropbox`, `cloud`, `database`, `link`, `more-horizontal` | `ui/primitives/icon` | Lucide names in the frames; Hugeicons in code |
| `StatusChip` | `ui/primitives/status-chip` | C12 Status Chip |
| `ListCardItem` (two-line, trailing slot, optional link) and `ListCardItemSkeleton` | `ui/patterns/list-card-item` | C42 Two-line / Skeleton |
| `OptionCardGroup` (React Aria `RadioGroup`) | `ui/patterns/option-card` | C44 Option Card + C06 Radio |
| `PageActions` portal and the Owner shell's page-actions slot | `ui/patterns/page-actions`, `features/workspace/ui/owner-shell` | Page Header C40 *Actions* |

Each new shared unit gets a Storybook story (ADR-014) and a co-located test.

## Database Changes

New table `workspace_source_config` (tenant parent), migration `0004_workspace_source_config` (drizzle-kit generated):

| Column | Type | Rule |
|---|---|---|
| `id` | uuid PK default random | |
| `workspace_id` | uuid NOT NULL → `workspace(id)` ON DELETE RESTRICT | BR-WS-002 |
| `provider` | text NOT NULL, CHECK `in ('GOOGLE_DRIVE')` | BR-SRC-005; a later provider widens the CHECK by migration |
| `display_name` | text NOT NULL, CHECK `char_length(display_name) between 1 and 60 and display_name = btrim(display_name)` | BR-SRC-005 (last line of defence) |
| `config_data` | jsonb NOT NULL DEFAULT `'{}'`, CHECK `jsonb_typeof(config_data) = 'object'` | BR-SRC-003: never a secret |
| `is_active` | boolean NOT NULL DEFAULT true | BR-SRC-006 |
| `updated_by` | text NULL → `user(id)` ON DELETE SET NULL | A-7; NULL for seeded rows |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() | A-7 |

Constraints:
- `UNIQUE (workspace_id, id)`: the tenant key that F-09's `gallery_source` will reference with a composite FK, ON DELETE RESTRICT.
- **Unique index `workspace_source_config_workspace_name_uq` on `(workspace_id, lower(display_name))`:** AC-SRC-009, including races.

Backfill, migration `0005_workspace_source_config_backfill` (drizzle-kit `--custom`):

```sql
INSERT INTO workspace_source_config (workspace_id, provider, display_name)
SELECT w.id, 'GOOGLE_DRIVE', 'Google Drive' FROM workspace w
WHERE NOT EXISTS (SELECT 1 FROM workspace_source_config s WHERE s.workspace_id = w.id)
ON CONFLICT DO NOTHING;
```

It is idempotent: a second run finds a source and inserts nothing (AC-SRC-002). A unit test checks that the SQL uses `DEFAULT_SOURCE` and `ON CONFLICT DO NOTHING`.

**The Owner applies migrations** (`pnpm db:migrate`; the agent may run it only with the Owner's per-action approval). Integration and E2E tests for F-04 need 0004 and 0005 applied first.

## Server / API Interface

| Entry | Input | Result |
|---|---|---|
| `GET /w/[id]/photo-sources` | route | The list page; the workspace is verified (ADR-015). |
| `GET /w/[id]/client-sources` | route | `notFound()`: removed from the coming-soon sections (AC-SRC-004). |
| `addSourceAction(workspaceId, values)` | bound route ID + untrusted `{ provider, displayName }` | `undefined` (revalidates the page) or `{ ok:false, code:"VALIDATION_FAILED", fieldErrors:{ displayName \| provider } }`. |
| `renameSourceAction(workspaceId, sourceId, values)` | bound IDs + untrusted `{ displayName }` | same shape. |
| `setSourceActiveAction(workspaceId, sourceId, isActive)` | bound IDs + boolean | `undefined`. |
| `deleteSourceAction(workspaceId, sourceId)` | bound IDs | `undefined`, or `{ ok:false, code:"IN_USE" }`. |

- The workspace ID comes only from the route and is verified on every call; a body never carries it.
- A malformed or unknown source ID, or one from another workspace, → `notFound()` (AC-SRC-015).
- An unexpected failure throws a generic `SourceConfigError("SAVE_FAILED")`, which the client turns into a danger toast with *Coba lagi* (AC-SRC-014).

## Domain / Application Logic

**Domain (`features/gallery/domain`, pure):**

| Unit | Responsibility |
|---|---|
| `source-provider` | `SOURCE_PROVIDERS` in display order (`GOOGLE_DRIVE`, `DROPBOX`, `ONEDRIVE`, `AMAZON_S3`, `CUSTOM_URL`, A-6); `AVAILABLE_SOURCE_PROVIDERS = ["GOOGLE_DRIVE"]`; `isSourceProvider`, `isAvailableSourceProvider`; `emptyProviderConfig(provider)` → `{}`. |
| `source-name` | `SOURCE_NAME_MAX_LENGTH = 60`; `normaliseSourceName` (trim); `sourceNameLength` (code points); `findSourceNameProblem` → `EMPTY` \| `TOO_LONG` \| null; `sourceNameKey` (lower case, used for duplicate checks in fakes and UI). |
| `default-source` | `DEFAULT_SOURCE = { provider: "GOOGLE_DRIVE", displayName: "Google Drive" }` (A-2). |
| `source-order` | `sortSources`: active first, then by name (`localeCompare(…, "id", { sensitivity: "base" })`) (A-3). |

**Application (`features/gallery/application`):**

- **Port** `WorkspaceSourceRepositoryPort`. Every call takes a `WorkspaceContext`.

  | Operation | Returns |
  |---|---|
  | `listForWorkspace` | `WorkspaceSourceRecord[]` |
  | `create` | `"CREATED"` \| `"NAME_TAKEN"` |
  | `rename` | `"UPDATED"` \| `"NAME_TAKEN"` \| `"NOT_FOUND"` |
  | `setActive` | boolean (false = not found) |
  | `delete` | `"DELETED"` \| `"IN_USE"` \| `"NOT_FOUND"` |
  | `seedDefault` | void (inserts only when the workspace has no source) |

- **Schemas:** `sourceNameSchema` (`{ displayName }`, refined by `findSourceNameProblem`); `addSourceSchema` (`{ provider: enum of AVAILABLE_SOURCE_PROVIDERS, displayName }`); `sourceIdSchema` (uuid). The dialogs (`zodResolver`) and the use cases share them (C-004).
- **Errors:** `SourceConfigError` with codes `NOT_FOUND` and `SAVE_FAILED`. Codes only, never names (C-103).
- **Use cases:**

  | Use case | Behaviour |
  |---|---|
  | `listWorkspaceSources` | Records sorted by `sortSources`. |
  | `addWorkspaceSource` | Validate; `NAME_TAKEN` → field error `displayName: "NAME_TAKEN"`; store an active source with `emptyProviderConfig` and the editor (AC-SRC-006…009). |
  | `renameWorkspaceSource` | Validate; `NAME_TAKEN` → field error; `NOT_FOUND` → throw (AC-SRC-010). |
  | `setWorkspaceSourceActive` | `false` from the port → throw `NOT_FOUND` (AC-SRC-011). |
  | `deleteWorkspaceSource` | `IN_USE` → `{ ok:false, code:"IN_USE" }`; `NOT_FOUND` → throw (AC-SRC-012, AC-SRC-013). |
  | `seedDefaultSource` | `seedDefault(DEFAULT_SOURCE)` (AC-SRC-001). |

**Composition:**
- `loadPhotoSources`, `addPhotoSource`, `renamePhotoSource`, `setPhotoSourceActive` and `deletePhotoSource`:
  - verify the workspace with F-02's `verifyOwnerWorkspace`;
  - parse the source ID with `sourceIdSchema` (a malformed ID → `notFound()`);
  - map `NOT_FOUND` to `notFound()`;
  - log unexpected failures as `source_config.save_failed` with `{ workspaceId, sourceId?, operation }` only (AC-SRC-016), then throw a generic `SAVE_FAILED`.
- `withWorkspaceCreationScope` gains `sources`. Both F-02 create flows run *create workspace → seed templates → seed default source* in one `db.transaction` (ADR-016, AC-SRC-001).

## UI Components

Built from the exports in `exports/` ([design.md](design.md)):

| Unit | Location | Exports |
|---|---|---|
| `SOURCE_COPY`, `PROVIDER_COPY` | `features/gallery/ui/source-copy` | all |
| `PhotoSourcesScreen` | `features/gallery/ui/photo-sources-screen` | `list-populated-*`, `list-seeded-iyIoF`, `list-empty-*` |
| `SourceRow` (ListCardItem + StatusChip + row actions) | `features/gallery/ui/source-row` | rows in `list-*` |
| `SourceRowActions`: desktop Menu, phone Bottom Sheet/Actions | `features/gallery/ui/source-row-actions` | `list-row-menu-UPlrT`, `row-actions-sheet-J0kFv` |
| `SetupGuideCard` | `features/gallery/ui/setup-guide-card` | guide card in `list-*` |
| `PhotoSourcesSkeleton` | `features/gallery/ui/photo-sources-skeleton` | `list-loading-*` |
| `AddSourceDialog`: Modal MD / Bottom Sheet Form, OptionCardGroup, TextField, warning Alert | `features/gallery/ui/add-source-dialog` | `add-*` |
| `RenameSourceDialog` | `features/gallery/ui/rename-source-dialog` | `rename-*` |
| `DeleteSourceDialog`: Modal SM destructive / Bottom Sheet Actions | `features/gallery/ui/delete-source-dialog` | `delete-confirm-*` |
| `useSourceMutations`: calls the actions and shows toasts (added, renamed, deactivated with *Batalkan*, reactivated, deleted, server error with *Coba lagi*) | `features/gallery/ui/use-source-mutations` | `toast-*` |
| `sourceNameErrorText` | `features/gallery/ui/source-name-error` | field errors |

Layout:
- **Desktop:** *Tambah sumber* renders through `PageActions` into the Page Header actions.
- **Phone:** *Tambah* sits in the list card's header Actions slot.

`useMobileViewport` picks one, because the shell renders the page in both trees.

## Validation

- Client: `zodResolver(addSourceSchema | sourceNameSchema)` for immediate field errors (UX only).
- Server: the use cases re-parse with the same schemas and trim the name (C-004). The provider is checked against `AVAILABLE_SOURCE_PROVIDERS` (AC-SRC-007).
- DB:
  - CHECKs on the provider, name length/trim and `config_data` type;
  - the case-insensitive unique name index;
  - FK RESTRICT from F-09's `gallery_source` later.

## Error Handling

| Case | Result |
|---|---|
| Empty / too-long name | `VALIDATION_FAILED` + `EMPTY` \| `TOO_LONG` → field error; nothing stored. |
| Duplicate name (any case, including a race) | Unique violation 23505 → `NAME_TAKEN` → *Nama ini sudah dipakai di workspace ini*. |
| Unavailable provider | `VALIDATION_FAILED` on `provider`; nothing stored. |
| Source in use (F-09 onward) | FK violation 23503 → `IN_USE` → *Sumber ini dipakai gallery. Nonaktifkan saja.* |
| Unknown or foreign source or workspace | `notFound()`. |
| Unexpected failure | Generic `SAVE_FAILED`; Toast/Danger *Perubahan belum tersimpan* + *Coba lagi*; the dialog keeps its input. |

## Concurrency / Consistency

- Last write wins for rename and active state (A-8). The name index makes concurrent duplicate names fail on the second write (AC-SRC-009).
- Seeding: the backfill is idempotent (`NOT EXISTS` + `ON CONFLICT DO NOTHING`). Creation-time seeding runs in the creation transaction (ADR-016).
- Delete versus a concurrent F-09 attach: the FK RESTRICT decides. Delete either wins, before the attach, or gets `IN_USE`.

## Security

- Every query filters by the verified `workspaceId` (C-101); there is no unscoped function.
- `config_data` is always `{}` in MVP; no key, token or link is ever stored (BR-SRC-003, AC-SRC-016).
- Logs carry the workspace ID, source ID, operation and code only. The logger already redacts sensitive keys.
- Names are plain text and React escapes them.

## Testing Strategy

| AC | Test |
|---|---|
| AC-SRC-001 | integration: creation transaction → workspace + 1 Google Drive source; a failure → neither · unit: `seedDefaultSource` |
| AC-SRC-002 | integration: `seedDefault` twice → one row · unit: backfill SQL uses `DEFAULT_SOURCE` + `NOT EXISTS` + `ON CONFLICT DO NOTHING` |
| AC-SRC-003 | unit: `sortSources`, `PhotoSourcesScreen` order, chips and actions · E2E: nav active, guide, warning |
| AC-SRC-004 | unit: owner nav and menu sheet labels, `isComingSoonSection("client-sources") === false` · E2E: old route → not found |
| AC-SRC-005 | unit: empty state · E2E: delete the last source → empty state |
| AC-SRC-006 | unit: `addWorkspaceSource` stores trimmed name, provider, `{}` and editor · dialog test · E2E add |
| AC-SRC-007 | unit: OptionCardGroup disabled options; schema rejects `DROPBOX` · action test with a bypassed provider |
| AC-SRC-008 | unit: `findSourceNameProblem`, use-case field errors |
| AC-SRC-009 | integration: case-insensitive duplicate → `NAME_TAKEN`; another workspace allowed · E2E duplicate error |
| AC-SRC-010 | unit: rename use case + dialog · E2E rename |
| AC-SRC-011 | unit: deactivate without confirmation, toast *Batalkan* reactivates · integration `setActive` · E2E |
| AC-SRC-012 | unit: delete dialog cancel/confirm · E2E delete |
| AC-SRC-013 | unit: use case maps `IN_USE`; repository maps 23503 (a mocked executor until F-09 adds `gallery_source`) |
| AC-SRC-014 | unit: mutation failure → danger toast with *Coba lagi*; dialog keeps input |
| AC-SRC-015 | integration: rename/setActive/delete with another context change nothing · E2E another owner's URL → not found |
| AC-SRC-016 | unit: flow logs only `{ workspaceId, sourceId, operation }`; integration: `config_data = {}` |
| AC-SRC-017 | E2E: axe (wcag2a/2aa/21a/21aa) on the list, add dialog and delete confirm at 1440 and 390 px; keyboard through the row menu and dialogs |

## Implementation Iterations

See [plan.md](plan.md): 14 tasks, test-first, one commit each. Owner checkpoints:
- Task 6: review migration 0004/0005, then apply them (the agent may run `pnpm db:migrate` only with explicit per-action approval) before Task 8's integration tests.
- Task 14: browser check against the exports.

1. Icons + `StatusChip` (+ story)
2. `ListCardItem` + `ListCardItemSkeleton` (+ stories)
3. Radio + `OptionCardGroup` (+ stories)
4. Page-actions slot (`PageActions` portal, OwnerShell)
5. Domain: provider, name, default, order
6. Schema + migrations 0004/0005 + backfill config test — **Owner applies**
7. Application: port, schemas, errors, use cases, fake repository
8. Drizzle repository + integration tests
9. Composition (scope, flow, creation seeding) + server actions
10. Nav rename, `photo-sources` route, loading, coming-soon removal
11. Screen: list, rows, chips, guide card, empty state, skeleton, page action
12. Add and rename dialogs
13. Row actions: deactivate with undo, reactivate, delete confirmation, toasts
14. E2E + axe, browser fidelity check, implementation record

## Risks / Open Questions

- **Page-action flash:** the desktop *Tambah sumber* is portalled into the Page Header after hydration. It appears one frame later than the page content. Accepted; recorded if visible.
- **Double render:** the shell renders children in both trees, so dialogs and menus must mount once per tree, and E2E selectors scope to the visible tree (as in F-03).
- **AC-SRC-013** can only be proven against a real FK once F-09 adds `gallery_source`. Until then the mapping is unit-tested, and F-09 adds the integration test.
- **F-03 rows** stay local in this feature. Moving `template-list-screen` to `ListCardItem` is a separate follow-up.
- **Inactive rows** are not dimmed: the library row has no inactive state, and the chip carries the meaning (design.md).

## Implementation record (2026-10-02)

F-04 is implemented on branch `feat/source-config` and is ready for `/sdv:verify-feature source-config` after the Owner reviews the verification evidence. The 14 tasks were completed test-first with one conventional commit per task:

`31c4256`, `9c68055`, `9816f18`, `d4e61d4`, `2da0044`, `807040c`, `c15b827`, `0d899dc`, `1862435`, `95fbf36`, `a0ec47c`, `c6d2740`, `b4f77df`, followed by the Task 14 record commit.

### Deviations and implementation notes

- The Owner shell renders desktop and phone trees at the same time. `PageActions` now claims the shared portal target once, while the E2E selectors scope assertions to the visible tree. This prevents duplicate page actions without changing the export layout.
- The page-action portal still appears after hydration, so the expected one-frame action flash remains accepted.
- The loading skeleton uses token-backed classes plus the export's fixed shape and height literals; no new design token was introduced for the one-off skeleton geometry.
- The option-card focus glow uses the existing semantic focus-glow token. Shared Modal, BottomSheet and OptionCard text styles use semantic text tokens so the settled dialogs meet WCAG AA contrast; the E2E axe journey waits for the 300 ms entrance animation to settle before analysis.
- AC-SRC-013's repository `IN_USE` mapping is unit-tested with the planned executor error shape. The real foreign-key integration assertion remains deferred until F-09 adds `gallery_source`.
- The Owner applied migrations 0004 and 0005. The agent did not run `pnpm db:migrate`.

### AC → verification map

| Acceptance criteria | Evidence |
|---|---|
| AC-SRC-001…004 | Workspace creation/backfill integration tests; source screen tests; navigation and legacy-route E2E journey |
| AC-SRC-005…012 | Domain/application/UI tests; source lifecycle E2E journey covering add, duplicate, rename, deactivate/undo and delete-to-empty |
| AC-SRC-013…016 | Repository/application/composition tests, including tenant scoping, generic failure mapping and `{}` config data |
| AC-SRC-015 | Cross-owner E2E journey resolves the foreign workspace URL as not found |
| AC-SRC-017 | Playwright + axe at 1440 px and 390 px, plus keyboard menu → rename → Escape focus return |

The final verification gate is recorded in the Task 14 commit and includes typecheck, lint, unit tests, integration tests, the full E2E suite and the production build.
