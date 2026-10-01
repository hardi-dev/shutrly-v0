# Technical Design — F-03 Message templates

Status: PLANNED (2026-10-01) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) · Design: [design.md](design.md) (v3 frames) · Plan: [plan.md](plan.md)

## Context

Every workspace has exactly one editable WhatsApp message per share situation. The Owner edits the wording with typed `{{variables}}`, sees a live preview and saves it. F-15 later turns a stored template into a message with a pure renderer that F-03 ships. F-03 sends nothing (BR-MSG-001).

## Relevant Authority

- Constitution: C-003, C-004, C-006, C-007, C-008, C-101, C-103, C-106.
- Business rules: BR-MSG-001…006, BR-WS-002, BR-WS-003, BR-WS-004 (`brandName`).
- ADRs: ADR-003 (workspace isolation), ADR-006 (WhatsApp deep links), ADR-009 (Neon serverless), ADR-010 (Tailwind + React Aria), ADR-015 (URL-scoped workspace routes), **ADR-016 (new: cross-feature transaction in composition)**.
- Rules: `docs/coding-rules.md` v2.0; `docs/design-system/token-usage.md` v3.1.

## Architecture

F-03 opens the **`communications`** bounded context named in `architecture/overview.md`, which F-15 will share: `src/features/communications/{domain,application,ui}`. It never imports `features/workspace`. Workspace data it needs, the brand name and the verified context, reaches it through `composition/`.

```text
app/(owner)/w/[workspaceId]/message-templates/(list)/page.tsx     → composition › loadMessageTemplateList
app/(owner)/w/[workspaceId]/message-templates/(list)/loading.tsx  → TemplateListSkeleton (route group: doesn't wrap the editor)
app/(owner)/w/[workspaceId]/message-templates/[templateType]/page → composition › loadMessageTemplateEditor
app/actions/communications/message-templates.ts                   → composition › saveMessageTemplate
composition/communications/message-template-scope                 → Drizzle message-template + workspace repos
composition/communications/message-template-flow                  → verify workspace (F-02) + use cases
composition/workspace/workspace-creation-scope                    → ONE transaction: create workspace + seed defaults (ADR-016)
features/communications/domain      → template types, variable catalogue, content rules, renderer, defaults
features/communications/application → port, schema, errors, use cases (list, get, update, seed)
features/communications/ui          → list, editor, chips, preview, unsaved-changes guard
adapters/db/schema/communications   → message_template table
adapters/db/message-template-repository → Drizzle implementation of the port
```

Shared UI additions (`src/ui`):
- **Segmented Control** pattern (library C23; not yet in code);
- Textarea options for a visually hidden label, rows and a trailing counter;
- five icons;
- **sub-page support in the shells:**
  - `AppShell.subPage` sets the breadcrumb parent;
  - `MobileAppShell.header` lets the Compact Bar replace the Mobile Header;
  - `OwnerShell.subPages` gives a route-supplied sub-page heading.

## Database Changes

New table `message_template` (tenant child of `workspace`), in migration `0002_message_template` (drizzle-kit generated):

| Column | Type | Rule |
|---|---|---|
| `id` | uuid PK default random | |
| `workspace_id` | uuid NOT NULL → `workspace(id)` ON DELETE RESTRICT | BR-WS-002 |
| `type` | text NOT NULL, CHECK in the five types | BR-MSG-002 |
| `channel` | text NOT NULL DEFAULT `'WHATSAPP'`, CHECK `= 'WHATSAPP'` | BR-MSG-002 |
| `content` | text NOT NULL, CHECK `char_length between 1 and 2000` | A-1 (last line of defence) |
| `updated_by` | text NULL → `user(id)` ON DELETE SET NULL | A-9; NULL for seeded defaults |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() | A-9; `updated_at` set by the repository on save |

Constraints:
- `UNIQUE (workspace_id, id)` (tenant key);
- **`UNIQUE (workspace_id, type, channel)`** — AC-MSG-003.

Backfill, in migration `0003_message_template_backfill` (drizzle-kit `--custom`):
- inserts the five defaults for every existing workspace with `ON CONFLICT (workspace_id, type, channel) DO NOTHING`, so it's idempotent (AC-MSG-002);
- the SQL text is checked against `DEFAULT_TEMPLATE_CONTENT` by a unit test, so the domain copy and the migration can't drift.

**Only the Owner applies migrations** (`pnpm db:migrate` is never run by an agent). Integration and E2E tests for F-03 need both migrations applied to the test database first.

## Server / API Interface

| Entry | Input | Result |
|---|---|---|
| `GET /w/[id]/message-templates` | route | List page. The workspace is verified; the list covers the five types in catalogue order. |
| `GET /w/[id]/message-templates/[templateType]` | slug `gallery-share` · `selection-reminder` · `final-delivery` · `invoice-share` · `payment-reminder` | Editor. An unknown slug, a missing template or an unowned workspace → `notFound()`. |
| `saveMessageTemplateAction(workspaceId, slug, { content })` | bound route IDs + untrusted content | `undefined` on success (revalidates the list), or `{ ok:false, code:"VALIDATION_FAILED", fieldErrors:{ content: <problem key> } }`. An unexpected failure throws a generic `MessageTemplateError("SAVE_FAILED")`. |

The workspace ID comes only from the route. It is verified per request (ADR-015, AC-MSG-015); a workspace ID in a body is never read.

## Domain / Application Logic

**Domain (`features/communications/domain`, pure):**

| Unit | Responsibility |
|---|---|
| `template-type` | `TEMPLATE_TYPES` in journey order (A-5); `templateGroupOf` (GALLERY / INVOICE); `templateSlugOf` / `templateTypeFromSlug`; `isTemplateType`. |
| `variable-catalogue` | BR-MSG-006 table: `allowedVariables(type)`, `requiredVariable(type)`, `isTemplateVariable`. |
| `template-content` | A-1 and A-2: `normaliseTemplateContent` (trim), `templateContentLength` (code points, like Postgres `char_length`), `placeholdersIn`, `findTemplateProblem`. The first problem wins, in the order EMPTY → TOO_LONG → MALFORMED → UNKNOWN_VARIABLE → MISSING_REQUIRED. Problem keys are `CODE` or `CODE:variable`. |
| `render-template` | F-15 contract: `renderTemplate(type, content, values)` and `sanitiseTemplateValue`. It rejects invalid content, variables the type doesn't allow and missing values with `RenderTemplateError` (codes only, never content). Substitution is single-pass, so a value can't inject a placeholder (BR-MSG-004, AC-MSG-016…018). |
| `default-templates` | `DEFAULT_TEMPLATE_CONTENT` per type (A-10; each one passes `findTemplateProblem`). |

**Application (`features/communications/application`):**
- **Port** `MessageTemplateRepositoryPort`: `listForWorkspace`, `findByType`, `updateContent`, `seedDefaults`. Every call takes a `WorkspaceContext`.
- **Schema** `messageTemplateContentSchema(type)`: Zod over `{ content }`, refined by `findTemplateProblem`. The editor form (`zodResolver`) and the use case share it (C-004).
- **Use cases:**

  | Use case | Behaviour |
  |---|---|
  | `listMessageTemplates` | Returns the records in catalogue order. |
  | `getMessageTemplate` | Throws `NOT_FOUND` when the record is missing. |
  | `updateMessageTemplate` | Validates and returns field errors, or stores the trimmed content with the editor and `updated_at` (AC-MSG-007…011). No row → `NOT_FOUND`. |
  | `seedDefaultTemplates` | Inserts all five defaults with ON CONFLICT DO NOTHING (AC-MSG-001). |

**Composition:**
- `loadMessageTemplateList`, `loadMessageTemplateEditor` and `saveMessageTemplate`:
  - they verify the workspace with F-02's `verifyOwnerWorkspace`;
  - they resolve the slug;
  - the editor reads `brandName` (brand name, else workspace name — BR-WS-004) with F-02's `getWorkspaceProfile` for the preview (A-6);
  - `saveMessageTemplate` catches unexpected errors and logs `message_template.save_failed` with `{ type }` only (C-103, AC-MSG-019). Then it throws a generic `SAVE_FAILED`.
- `withWorkspaceCreationScope` (ADR-016): F-02's two create flows run *create workspace → seed defaults* in one `db.transaction`.

## UI Components

These are built from the exports in `exports/` (v3 frames, [design.md](design.md)):

| Unit | Location | Export |
|---|---|---|
| `SegmentedControl` | `src/ui/patterns/segmented-control` | C23 · mobile editor tabs |
| Textarea (`isLabelHidden`, `rows`, `trailingMeta`) | `src/ui/primitives/textarea` | editor field + counter |
| Icons `image`, `hourglass`, `package-check`, `wallet`, `rotate-ccw`, `braces` | `src/ui/primitives/icon` | list rows, restore button, chips |
| Shell sub-page: `AppShell.subPage`, `MobileAppShell.header`, `OwnerShell.subPages`, nested nav active | `src/ui/patterns/*`, `features/workspace/ui/owner-*` | editor breadcrumb + Compact Bar |
| `TemplateListScreen`, `TemplateListSkeleton` | `features/communications/ui/template-list-*` | `list-{L9tLQ,m3crcH}`, `list-loading-{KxWLq,CDwax}` |
| `VariableChip`, `MessagePreview`, `renderPreview` | `features/communications/ui/*` | chips + preview in `editor-*` |
| `TemplateEditorScreen`, `useTemplateForm`, `useUnsavedChangesGuard`, `UnsavedChangesDialog` | `features/communications/ui/*` | `editor-*` (all states) |

Layout:
- **Desktop:** the *Isi pesan* Section Card, with *Kembalikan ke default* and *Simpan* below it, plus the *Pratinjau* Section Card (400 wide).
- **Phone:** one Compact Section Card *Pesan* whose header Actions hold Edit/Pratinjau; *Simpan* (LG, full width) and *Kembalikan ke default* sit below it; the Compact Bar replaces the Mobile Header.

`useMobileViewport` switches the layouts, because the shell renders the page in both the desktop and the phone tree.

## Validation

- Client: `zodResolver(messageTemplateContentSchema(type))` gives immediate field errors (UX only).
- Server: the use case re-parses with the same schema and normalises (trim) before storing (C-004).
- DB: CHECK constraints on type, channel and length, plus the unique `(workspace_id, type, channel)`.

## Error Handling

| Case | Result |
|---|---|
| Invalid content (A-1, A-2, BR-MSG-006) | `VALIDATION_FAILED` + problem key → field error on the textarea, which gets focus; the preview shows its error state. Nothing is stored. |
| Unknown slug, missing template, unowned or malformed workspace | `notFound()` (AC-MSG-015, F-02 A-9). |
| Unexpected failure on save | The action throws a generic error, and the client shows **Toast/Danger** *Template belum tersimpan* with *Coba lagi*. The editor keeps the text (AC-MSG-012). Only `{ type }` is logged. |
| Render failure (F-15) | `RenderTemplateError` with a code only (AC-MSG-017, AC-MSG-019). |

## Concurrency / Consistency

- Last write wins, with no conflict warning (A-8). `updateContent` updates the single `(workspace_id, type, 'WHATSAPP')` row.
- Seeding is idempotent (ON CONFLICT DO NOTHING) and transactional with workspace creation (ADR-016). A concurrent duplicate seed can't create a second row (AC-MSG-003).

## Security

- Every query filters by the verified `workspaceId` (C-101); there is no `*Unscoped` function.
- Content is plain text. React escapes it; it is never rendered as HTML (spec › Rendering contract).
- No content, values or rendered text in logs (C-103). The logger already redacts URLs and sensitive keys.
- Unsaved-changes guard: `beforeunload`, plus a capture-phase click guard on internal links. It never blocks external links or new-tab clicks.

## Testing Strategy

| AC | Test |
|---|---|
| AC-MSG-001 | integration: transaction creates workspace + 5 templates; failure → neither · unit: `seedDefaultTemplates` |
| AC-MSG-002 | integration: `seedDefaults` twice → 5 rows · unit: backfill SQL contains every default + ON CONFLICT |
| AC-MSG-003 | integration: a direct duplicate insert fails with 23505 |
| AC-MSG-004 | unit: `TemplateListScreen` groups, order, links · E2E: nav active, no *Segera hadir* |
| AC-MSG-005 | unit: editor shows chips (required marked) + preview with `••••••` note · E2E |
| AC-MSG-006 | unit: chip inserts at the caret and the preview updates · E2E |
| AC-MSG-007 | unit: use case stores trimmed content for one type · action test · E2E toast |
| AC-MSG-008…011 | unit: domain `findTemplateProblem` + use case field errors (server path) · E2E unknown variable |
| AC-MSG-012 | unit: editor server failure → danger toast with *Coba lagi*, text kept |
| AC-MSG-013 | unit: restore default marks the form dirty and stores nothing until save · E2E |
| AC-MSG-014 | unit: guard intercepts an internal link and cancel keeps the editor · E2E |
| AC-MSG-015 | integration: `updateContent` with another context changes nothing · E2E: another owner's editor URL → not found |
| AC-MSG-016…018 | unit: `renderTemplate` |
| AC-MSG-019 | unit: `saveMessageTemplate` logs only `{ type }`; render errors carry codes only |
| AC-MSG-020 | E2E: axe on the list and editor at 1440 and 390 px; keyboard reachability |

## Implementation Iterations

See [plan.md](plan.md). There are 14 tasks, test-first, one commit each. Progress is ticked in the plan; done: Tasks 1–2 (2026-10-01). The Owner checkpoints are:
- Task 4: review the default copy, A-10;
- Task 5: apply migrations 0002 and 0003 before the integration tests in Task 7.

## Risks / Open Questions

- **Default copy (A-10):** *Bagikan gallery* comes from the approved frames; the other four defaults are drafts for Owner review before migration 0003 is generated.
- **Double render:** the shell renders children in the desktop and phone trees. Each tree has its own form state; only the visible one is used. E2E selectors must target visible elements.
- **Browser back/forward** isn't intercepted by the unsaved-changes guard (the App Router has no blocking API); `beforeunload` covers reloads and closing the tab. Recorded as deviation D-M2 if the Owner wants more.
- **Mobile subtitle:** the frames show a shorter list subtitle on phones; the shell has one subtitle for both (same as Settings v3). Recorded as D-M1.
- **Preview column width:** no token for the 400 px column; the editor uses a 5:3 flex split (D-M3).
- **Two-line list rows** are local (list-card tokens), pending a possible library *List Card Item/Two-line* variant.
