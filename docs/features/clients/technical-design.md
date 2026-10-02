# Technical Design — F-06 Clients

Status: IN PROGRESS (2026-10-03; implementation complete, verification pending) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) (AC-CLI-001…021) · Design: [design.md](design.md) (40 frames, `exports/`) · Plan: [plan.md](plan.md)

## Context

Each workspace keeps a list of clients: the people who book shoots. A client has a name, an optional WhatsApp number (normalized, unique per workspace) and 0–10 social-media links. On *Klien* the Owner adds, edits, archives, restores and deletes clients. They search by name or number, switch between *Aktif* and *Arsip*, and page through the list 30 at a time, with a count in the list title. F-07 will reference clients from projects, and F-15 will use the number. F-06 calls no external service.

**Base (Owner 2026-10-02):** this plan assumes F-05 (`feat/catalog`) is finished and merged to `main` before Slice 0. F-06 reuses what F-05 adds:
- the `booking` context;
- `pg-error`;
- `Tabs` and the Page Header tabs;
- the owner-shell section tabs;
- `SegmentedControl isFullWidth` and `Select`;
- the `archive` and `archive-restore` icons;
- migrations 0006/0007.

F-06's migration is therefore **0008**.

## Relevant Authority

- **Constitution:** C-002, C-003, C-004, C-006, C-007, C-008, C-009, C-101, C-103, C-106.
- **Business rules:** BR-CLI-001…003, BR-AUTH-001, BR-WS-002, BR-WS-003.
- **ADRs:**
  - ADR-003 (isolation, composite FKs);
  - ADR-006 (WhatsApp deep links);
  - ADR-009 (Neon);
  - ADR-010 (Tailwind + React Aria);
  - ADR-015 (URL-scoped routes).
- **No new ADR.** Every decision below stays inside the accepted architecture: JSONB is allowed for schema-validated values, and grids go through React Aria in `src/ui`.
- **Rules:** `docs/coding-rules.md` v2.0; `docs/design-system/token-usage.md` v3.1 plus the F-06 `surface.panel-subtle` amendment.
- **Component specs:** `table.md` (C27), `tabs.md` (C45), `page-header.md`, `segmented-control.md`, `section-card.md`, `list-card.md`, `select.md`, `empty-state.md`, `menu.md`, `modal.md`, `bottom-sheet.md`.

## Decisions

| # | Decision | Why |
|---|---|---|
| D-1 | Clients live in the **`booking`** bounded context, next to the catalog. F-07 will add projects there. | The domain model puts Client with Project (one booking aggregate family). A separate `clients` feature would force F-07 to cross features for its picker and delete guard. |
| D-2 | Social links are a **JSONB array** column `social_links` on `client`, schema-validated on every read and write. | The client is always saved whole (AC-CLI-012). Links have no identity, no cross-row query and at most 10 entries, and they keep the Owner's order. A child table would add a join and a diff-and-replace write for no behavioural gain. The architecture's mapping rules allow JSONB when it is always schema-validated. |
| D-3 | *Aktif* and *Arsip* are **routes**: `/w/[id]/clients` and `/w/[id]/clients/archived`. Desktop shows them as Page Header tabs (`aria-current="page"` links, as F-05). Phones show a full-width Segmented Control that navigates. The search query is `?q=` (A-4). | This follows tabs.md (*each view has its own URL → links*) and F-05's owner-shell section tabs. Reload and back keep both the tab and the query. Switching tabs drops `q`: search applies to one filter (AC-CLI-004). |
| D-4 | **Keyset paging** on `(lower(name), created_at, id)`, page size 30 (A-3, A-5). The first page and the count (A-10) are rendered by the server. *Muat lebih banyak* calls a server action with the last row's ID as the cursor, and the screen appends the result to the pages it holds. The appended pages reset when the tab, the query or the server data changes. | Coding rules allow client fetching when interaction needs it. The cursor is an ID, not a timestamp: `created_at` has microsecond precision that a JS `Date` would round, which could repeat a row. The query resolves the cursor row's sort key with a workspace-scoped subquery. The cursor is untrusted: Zod-validated as a uuid and only matched inside the verified workspace. |
| D-5 | A new shared **`DataTable`** pattern (C27) is built on React Aria `Table`. Rows have a row action (open *Ubah*), and the actions cell holds the row menu. | Coding rules: *features never hand-roll grids*. React Aria provides keyboard row navigation and accessible headers. |
| D-6 | **Number taken:** the unique index decides, including races. On `23505` the repository reads the holder's name and archived flag from the same workspace and returns them with `NUMBER_TAKEN`. | AC-CLI-010 needs *Nomor ini sudah dipakai {name}* plus *(diarsipkan)*. The lookup is workspace-scoped (AC-CLI-018). |
| D-7 | **Search:** the name matches `ILIKE '%q%'` with `%`, `_` and `\` escaped. If the query has digits, they are normalized like BR-CLI-002's prefix step (`+` dropped, a leading `0` → `62`) and matched with `LIKE '%digits%'` on the number. The two are combined with OR. | A-4. There are no indexes beyond the list index; per-workspace client counts are small in MVP (TD-A-2). |
| D-8 | Phones show the shorter page subtitle (*Orang yang memesan sesi foto.*). It is added as an optional `mobileSubtitle` on the owner-shell page heading and passed through `AppShell`. | The approved frames differ by breakpoint (design.md › Copy). |

## Architecture

```text
app/(owner)/w/[workspaceId]/clients/page.tsx            → Aktif tab   → composition › loadClients(…, "ACTIVE", q)
app/(owner)/w/[workspaceId]/clients/archived/page.tsx   → Arsip tab   → loadClients(…, "ARCHIVED", q)
app/(owner)/w/[workspaceId]/clients/loading.tsx (+ archived/loading.tsx) → ClientsSkeleton
app/actions/booking/clients.ts                          → add / update / setArchived / delete / loadMore
composition/booking/client-scope                        → Drizzle client repository on the request DB
composition/booking/client-flow                         → verify workspace (F-02) + use cases + logging
features/booking/domain        → client name, WhatsApp number, social links, search query, page size
features/booking/application   → port, schemas, errors, results, use cases
features/booking/ui            → Klien screen (table / phone list), search, tabs bar, row actions, dialogs, skeleton, copy
adapters/db/schema/booking/client.ts  → client table
adapters/db/client-repository         → Drizzle implementation of ClientRepositoryPort
```

Shared changes:

| Unit | Location | Change |
|---|---|---|
| Icon `message-circle` | `ui/primitives/icon` | Hugeicons `MessageCircleIcon` |
| `ListCardItem` avatar leading | `ui/patterns/list-card-item` | Initials avatar instead of the icon well (design.md › component gap); icon rows keep working |
| `Input` trailing `x` | `ui/primitives/input` | `"x"` joins `InputIconName`, for the clear-search action (no-match frames) |
| `DataTable` + skeleton rows | `ui/patterns/data-table` | New, C27 Table: card, toolbar (title, subtitle, actions), header row, rows, footer, empty slot |
| `SheetItem` `isDisabled` / `isPending` | `ui/patterns/sheet-item` | Disabled and pending states (design.md › phone deleting, component gap); pending shows the spinner icon |
| `AppShell` `mobileSubtitle` | `ui/patterns/app-shell` | Optional; the Mobile Header uses it when given (D-8) |
| Clients section | `features/workspace/domain/coming-soon-sections`, `features/workspace/ui/owner-nav` | `clients` leaves the coming-soon list. `resolvePageHeading` returns *Klien*, both subtitles and the *Aktif · Arsip* tabs; the nav item stays active on `/clients/archived`. |

Each new shared unit gets a Storybook story (ADR-014) and a co-located test.

## Database Changes

New tenant table `client`, migration `0008_client` (drizzle-kit generated):

| Column | Type / rule |
|---|---|
| `id` | uuid PK default random |
| `workspace_id` | uuid NOT NULL → `workspace(id)` ON DELETE RESTRICT (BR-WS-002) |
| `name` | text NOT NULL, CHECK `char_length(name) between 1 and 100 and name = btrim(name)` (BR-CLI-001) |
| `whatsapp_number` | text NULL, CHECK `whatsapp_number ~ '^[1-9][0-9]{9,14}$' and whatsapp_number !~ '^620'` (BR-CLI-002) |
| `social_links` | jsonb NOT NULL DEFAULT `'[]'`, CHECK `jsonb_typeof(social_links) = 'array' and jsonb_array_length(social_links) <= 10` (BR-CLI-001; element shape is checked by Zod) |
| `archived_at` | timestamptz NULL: archived when set (BR-CLI-003, A-8) |
| `updated_by` | text NULL → `user(id)` ON DELETE SET NULL (A-8) |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() |

Constraints and indexes:
- `UNIQUE (workspace_id, id)` (`tenantKey`). F-07's `project.client_id` will reference it with a composite FK, ON DELETE RESTRICT (AC-CLI-015).
- Unique index `client_workspace_whatsapp_uq` on `(workspace_id, whatsapp_number)`. NULLs are distinct, so many clients may have no number (AC-CLI-010).
- Index `client_workspace_list_idx` on `(workspace_id, lower(name), created_at, id)`: the keyset order (D-4).

There is no backfill. The agent generates 0008, reviews it, commits it and applies it with `pnpm db:migrate` against the shared non-production database (AGENTS.md, tech-stack.md › Deployment, 2026-10-02), and reports the run.

## Server / API Interface

| Entry | Input | Result |
|---|---|---|
| `GET /w/[id]/clients` | route + `?q=` | *Aktif*: first page + active count (A-10) |
| `GET /w/[id]/clients/archived` | route + `?q=` | *Arsip*: first page + archived count |
| `loadMoreClientsAction(workspaceId, query)` | bound route ID + untrusted `{ status, q, afterId }` | `{ items, nextCursor }` |
| `addClientAction(workspaceId, values)` | bound ID + untrusted `ClientInput` | `undefined` (revalidates `/clients`) or `ClientValidationFailure` |
| `updateClientAction(workspaceId, clientId, values)` | bound IDs + untrusted `ClientInput` | same shape |
| `setClientArchivedAction(workspaceId, clientId, isArchived)` | bound IDs + boolean | `undefined` |
| `deleteClientAction(workspaceId, clientId)` | bound IDs | `undefined`, or `{ ok:false, code:"IN_USE" }` |

- The workspace ID comes only from the route and is verified on every call (ADR-015). A body never carries it.
- A malformed client ID, an unknown one, or one from another workspace → `notFound()` (AC-CLI-018).
- An unexpected failure throws a generic `ClientError("SAVE_FAILED")`. The client turns it into Toast/Danger *Perubahan belum tersimpan* with *Coba lagi* (AC-CLI-017).

## Domain / Application Logic

**Domain (`features/booking/domain`, pure):** the rules are Zod schemas (`*.schema.ts`), as in `workspace/domain`. Each one normalises and validates, and its issue message is the field-error key. Plain functions are kept only for display.

| Unit | Responsibility |
|---|---|
| `client-name` | `CLIENT_NAME_MAX_LENGTH = 100`. `clientNameSchema`: trim, then `EMPTY` / `TOO_LONG` counting code points. |
| `whatsapp-number` | `WHATSAPP_SEPARATORS`, `WHATSAPP_NUMBER_PATTERN` (`^(?!620)[1-9]\d{9,14}$`, repeated by the DB check). `whatsappNumberSchema`: strip separators, apply the first matching BR-CLI-002 prefix step, check the pattern (`INVALID`), and brand the result `WhatsappNumber`. `optionalWhatsappNumberSchema`: blank → `null`. `formatWhatsappNumber(digits)` → `+62 812-3456-7890` or `+<digits>` (A-7), which parses back to the same digits. `whatsappChatUrl(digits)` → `https://wa.me/<digits>` (A-6). |
| `social-link` | `SOCIAL_PLATFORMS` (A-2 order), `SOCIAL_LINK_MAX_COUNT = 10`, `SOCIAL_VALUE_MAX_LENGTH = 200`. `socialValueSchema`: trim, drop one leading `@` from a handle, then `EMPTY` / `INVALID_URL` / `TOO_LONG`. `socialPlatformSchema` (`UNKNOWN_PLATFORM`). `socialLinksSchema`: the stored array, also used to read the JSONB column. `socialLinkRowsSchema`: the form rows (`TOO_MANY`, `DUPLICATE` on later repeats ignoring case and `@`, blank rows dropped, order kept). `socialLinkLabel` (`@handle`, or the URL without `https://` and `www.`). |
| `client-search` | `CLIENT_SEARCH_MAX_LENGTH = 100` (TD-A-1). `clientSearchSchema` → `{ text, digits }`. `digits` is null unless the query is number-like, and is prefix-normalized as in D-7. A blank or over-long query fails, and the list is then unfiltered. |
| `client-list` | `CLIENT_STATUSES`, `clientStatusSchema`, `CLIENT_PAGE_SIZE = 30` (A-5). |

**Application (`features/booking/application`):**

- **Port** `ClientRepositoryPort`. Every call takes a `WorkspaceContext`.

  | Operation | Returns |
  |---|---|
  | `listPage(context, query)` with `{ status, search, afterId, limit }` | `ClientRecord[]`, at most `limit`, in keyset order after the row `afterId` (none if that row no longer exists) |
  | `count(context, status)` | number |
  | `create(context, change)` | `{ status:"CREATED" }` \| `{ status:"NUMBER_TAKEN", holder }` |
  | `update(context, id, change)` | `"UPDATED"` \| `"NOT_FOUND"` \| `{ status:"NUMBER_TAKEN", holder }` |
  | `setArchived(context, change)` | boolean (false = not found) |
  | `delete(context, id)` | `"DELETED"` \| `"IN_USE"` \| `"NOT_FOUND"` |

- **Schemas** (`*.schema.ts`, shared by the dialog and the use cases):

  | Schema | Shape and rules |
  |---|---|
  | `clientInputSchema` | `z.object` of the domain schemas: `{ name: clientNameSchema, whatsappNumber: optionalWhatsappNumberSchema, socialLinks: socialLinkRowsSchema }`. The output is normalised (trimmed name, `WhatsappNumber` or null, links without `@` and without blank rows). Field problems are reported together, each with its path (`name`, `whatsappNumber`, `socialLinks.N.value`, `socialLinks.N.platform`, `socialLinks`). Duplicate rows are reported once every row parses. |
  | `clientIdSchema` | uuid |
  | `clientListQuerySchema` | `{ status, q, afterId: uuid \| null }`. `q` has no length check: an over-long query lists unfiltered (TD-A-1). |

- **Errors:** `ClientError` with codes `NOT_FOUND` and `SAVE_FAILED`. Codes only, never names or numbers (C-103).
- **Results:** `ClientValidationFailure` is `{ ok:false, code:"VALIDATION_FAILED", fieldErrors: Record<path, ClientFieldErrorKey>, numberHolder?: { name, isArchived } }`. The keys are `EMPTY`, `TOO_LONG`, `INVALID`, `TAKEN`, `INVALID_URL`, `DUPLICATE`, `UNKNOWN_PLATFORM` and `TOO_MANY`; any other Zod message (a wrong type from a bypassed form) becomes `INVALID`.
- **Use cases:**

  | Use case | Behaviour |
  |---|---|
  | `listClients` | Parse the query. Ask the port for `limit = CLIENT_PAGE_SIZE + 1`, and return the first 30 with `nextCursor` (null when ≤ 30). The search runs over the selected status only (AC-CLI-001…005). |
  | `countClients` | `count(context, status)` (A-10, AC-CLI-021). |
  | `addClient` | Validate. `create` with the editor. `NUMBER_TAKEN` → field error `whatsappNumber: "TAKEN"` + `numberHolder` (AC-CLI-006…011). |
  | `updateClient` | Validate. `update` the whole record. `NOT_FOUND` → throw. `NUMBER_TAKEN` as above (AC-CLI-012). A client keeps its own number without conflict. |
  | `setClientArchived` | Sets or clears `archived_at` with the editor. `false` → throw `NOT_FOUND` (AC-CLI-013). |
  | `deleteClient` | `IN_USE` → `{ ok:false, code:"IN_USE" }`. `NOT_FOUND` → throw (AC-CLI-014, 015). |

**Composition (`composition/booking/client-flow`):**
- **Every entry point:**
  - verifies the workspace (`verifyOwnerWorkspace`);
  - parses the client ID with `clientIdSchema`, where a malformed ID → `notFound()`;
  - maps `NOT_FOUND` to `notFound()`.
- **Writes** also resolve the editor with `requireOwnerOrRedirect`.
- **Unexpected failures** are logged as `client.save_failed` with `{ workspaceId, clientId?, operation }` only (AC-CLI-019); the entry point then throws the generic `SAVE_FAILED`.
- `loadClients` returns `{ status, query, page, count }` for one tab.

## UI Components

Built from `exports/` ([design.md](design.md)):

| Unit | Location | Exports |
|---|---|---|
| `CLIENT_COPY`, `PLATFORM_COPY` | `features/booking/ui/client-copy` | all |
| `clientInitials` | `features/booking/ui/client-initials` | avatar initials (`Bayu & Laras` → `BL`) |
| `ClientsScreen` (owns dialogs, appended pages, desktop/phone switch) | `features/booking/ui/clients-screen` | `list-*` |
| `ClientsTable` (DataTable: toolbar *Daftar klien* + count + search, columns 184 / 240 / 32, *Muat lebih banyak* footer, empty slot) | `features/booking/ui/clients-table` | `list-*-desktop-*` |
| `ClientList` (Section Card Compact/Flush, List Card Item/Two-line rows with initials avatars, *Tambah*) | `features/booking/ui/client-list` | `list-*-mobile-*` |
| `ClientSearchField` (debounced `?q=`, clear button, live result announcement) | `features/booking/ui/client-search-field` | toolbar and phone controls |
| `ClientsTabsBar` (phone Segmented Control/Full width → route) | `features/booking/ui/clients-tabs-bar` | phone frames |
| `ClientsEmptyState`: the standalone Empty State on desktop and phone (*Aktif*, *Arsip*, no match with *Hapus pencarian*) | `features/booking/ui/clients-empty-state` | `list-empty-*`, `list-no-match-*` |
| `ClientRowActions` (desktop Menu / phone Bottom Sheet: *Ubah*, *Buka WhatsApp*, *Arsipkan* / *Pulihkan*, *Hapus*) | `features/booking/ui/client-row-actions` | `list-row-menu-desktop-uTkvt`, `row-actions-sheet-mobile-cVBpx`, `list-archived-row-menu-desktop-sfgdK`, `list-archived-row-actions-sheet-mobile-Ttcj1` |
| `ClientDialog` (Modal MD / full-height Bottom Sheet/Form; add and edit) | `features/booking/ui/client-dialog` | `add-*`, `edit-*` |
| `SocialLinksEditor` (rows: Select + TextField + remove; *Tambah media sosial*, disabled at 10) | `features/booking/ui/social-links-editor` | dialog body |
| `DeleteClientDialog` (Modal SM danger / Bottom Sheet/Actions; deleting; blocked) | `features/booking/ui/delete-client-dialog` | `delete-*` |
| `ClientsSkeleton` | `features/booking/ui/clients-skeleton` | `list-loading-*` |
| `useClientMutations` (actions + toasts: added, saved, archived with *Batalkan*, restored, deleted, server error with *Coba lagi*) | `features/booking/ui/use-client-mutations` | `toast-*` |
| `useLoadMoreClients` | `features/booking/ui/use-load-more-clients` | `list-loading-more-*` |
| `clientFieldErrorText` | `features/booking/ui/client-field-error` | field errors |

**Layout:**
- **Desktop:**
  - *Tambah klien* renders through `PageActions`.
  - The content is the 720 column (`size.content-narrow`, design.md exception to token-usage §4.5).
  - The tabs sit in the Page Header.
- **Phone:**
  - the Segmented Control, then the search field, then the Section Card with *Tambah* in its Actions slot;
  - *Muat lebih banyak* is a full-width Button Secondary below the card.
- `useMobileViewport` picks one tree.

**Literal sizes** (design.md: sizes can't bind in Pencil) are the only raw values:
- search 320;
- column widths 184 / 240 / 32;
- the phone sheet height.

## Validation

- **Client:** `zodResolver(clientInputSchema)` for immediate field errors (UX only). The error on a social row is placed on that row's value field.
- **Server:** the use cases re-parse with the same schema. The cursor and list query are parsed with `clientListQuerySchema` (C-004).
- **DB:**
  - the name and number CHECKs and the JSONB array CHECK;
  - the unique number index (the authority for AC-CLI-010);
  - F-07's RESTRICT FK for AC-CLI-015.
- **JSONB reads:** the repository parses `social_links` with the link schema. A malformed row is a bug: it throws and is logged generically.

## Error Handling

| Case | Result |
|---|---|
| Empty / too-long name | `name: EMPTY \| TOO_LONG` → *Isi nama klien.* / *Nama klien maksimal 100 karakter.* |
| Invalid number | `whatsappNumber: INVALID` → *Nomor WhatsApp tidak valid* |
| Number taken (including a race) | 23505 → holder lookup → `whatsappNumber: TAKEN` + `numberHolder` → *Nomor ini sudah dipakai {name}* (+ *(diarsipkan)*) |
| Social row too long / duplicate / not https / unknown platform / > 10 rows | `socialLinks.N.value: TOO_LONG \| DUPLICATE \| INVALID_URL`, `socialLinks.N.platform: UNKNOWN_PLATFORM`, `socialLinks: TOO_MANY` → error on the row |
| Client has projects (F-07 onward) | 23503 → `IN_USE` → blocked delete dialog *Klien ini punya proyek. Arsipkan saja.* |
| Unknown, foreign or malformed client / workspace | `notFound()` |
| Invalid `?q=` on the page | Ignored: the page shows the unfiltered tab (TD-A-1) |
| Invalid load-more query or cursor | `notFound()` |
| Unexpected failure | Generic `SAVE_FAILED`; Toast/Danger *Perubahan belum tersimpan* + *Coba lagi*; the dialog keeps its input |

## Concurrency / Consistency

- Last write wins for edits and archive state (A-9). The unique number index makes the second of two concurrent saves of the same number fail with `NUMBER_TAKEN` (AC-CLI-010).
- Keyset paging is stable under inserts. A row added before the cursor is not shown until reload, and nothing is duplicated (AC-CLI-005).
- The count is a separate query, so it may differ by one from the rows during concurrent edits. That is accepted; it refreshes on the next render.
- Delete versus a concurrent F-07 project creation: the FK RESTRICT decides.

## Security

- Every query filters by the verified `workspaceId` (C-101). The number-holder lookup and search are workspace-scoped (AC-CLI-018).
- **Logs** carry the workspace ID, client ID, operation and code only. They never carry a name, number, link, search query or `wa.me` URL (C-103, AC-CLI-019).
- ***Buka WhatsApp*** is a plain `<a href="https://wa.me/<digits>" target="_blank" rel="noopener noreferrer">`. It is built in the browser and never sent to the server or logged. There is no prefilled text, so C-106 and BR-MSG-001 don't apply (A-6).
- **Social URLs** render as links only when they start with `https://` (enforced by the schema), with `rel="noopener noreferrer"`. Handles are plain text. React escapes all text.

## Testing Strategy

| AC | Test |
|---|---|
| AC-CLI-001 | unit: `ClientsTable` / `ClientList` rows, formatted number, *Belum ada nomor WhatsApp*, desktop: first link plus *+N* for the rest; phone: number only; owner-nav active on both tabs · E2E nav |
| AC-CLI-002 | unit: archived rows show *Pulihkan* · integration: `listPage` by status · E2E *Arsip* tab |
| AC-CLI-003 | unit: both empty states · E2E new workspace |
| AC-CLI-004 | unit: `clientSearchSchema`; search field debounce + URL · integration: name `ILIKE` with wildcards escaped, `0812 3456` / `+62812` digits · E2E search + reload + *Hapus pencarian* |
| AC-CLI-005 | integration: 65 rows → 30 / 60 / 65, no duplicates, in order · unit: `useLoadMoreClients` append + reset |
| AC-CLI-006 / 007 | unit: `addClient` stores normalised record and order; empty row dropped · dialog test · E2E add |
| AC-CLI-008 | unit: `clientNameSchema`; `clientInputSchema`; use case bypassing the form |
| AC-CLI-009 | unit: `whatsappNumberSchema` table of every spec example |
| AC-CLI-010 | integration: active and archived holders, concurrent `Promise.all` creates → one row, another workspace allowed, own number kept · E2E message |
| AC-CLI-011 | unit: social rules, duplicate (`@rina.wed` vs `RINA.WED`), 11th row, unknown platform via the action; editor disables add at 10, focus after remove |
| AC-CLI-012 | unit: `updateClient` stores the whole record · E2E edit |
| AC-CLI-013 | unit: row actions archive without confirmation, toast *Batalkan* restores · integration `archived_at` set/cleared · E2E |
| AC-CLI-014 | unit: delete dialog cancel/confirm · integration: delete frees the number · E2E |
| AC-CLI-015 | unit: use case maps `IN_USE`; repository maps 23503 (mocked executor until F-07 adds `project`) |
| AC-CLI-016 | unit: *Buka WhatsApp* only with a number; `href`, `target`, `rel` |
| AC-CLI-017 | unit: mutation failure → danger toast with *Coba lagi*; dialog keeps input |
| AC-CLI-018 | integration: every repository call with another workspace changes and returns nothing; holder lookup scoped · E2E foreign workspace URL → not found |
| AC-CLI-019 | unit: `client-flow` logs only `{ workspaceId, clientId, operation }` on failure |
| AC-CLI-020 | E2E: axe (wcag2a/2aa/21a/21aa) on the list, dialog and delete confirm at 1440 and 390 px, light and dark; keyboard through tabs, row menu, social rows, delete; focus returns · unit: row-specific accessible names |
| AC-CLI-021 | integration: `count` per status ignores search and other workspaces · unit: subtitle copy, hidden while loading · E2E count after archive / add |

## Implementation Iterations

See [plan.md](plan.md): vertical slices by screen (Slice 0–6), test-first, one commit per step.
- **Slice 0** checks that F-05 is on `main` and merged into `feat/clients`, then inventories the components.
- **Slice 1** (step 1.5) generates and applies migration 0008.
- **Slice 6** is the browser fidelity check against the exports.

0. Check the base + component inventory
1. *Klien* list and add a client: DataTable, shared extensions, domain, application, table + migration 0008, repository (list, count, create, search, keyset), composition, routes and tabs, list UI, add dialog
2. Dialog validation and edit: number taken, update, field errors and row rules, edit dialog
3. Row menu, archive and restore: link menu items, `setArchived`, row actions
4. Delete: delete backend, pending sheet item, delete dialog
5. Search and paging: search field and no match, load more
6. Close: E2E, axe, fidelity, implementation record

## Assumptions (technical, reversible)

- **TD-A-1:** the search query is cut at 100 characters (`CLIENT_SEARCH_MAX_LENGTH`), so a longer `?q=` is ignored. UX only; not a business rule.
- **TD-A-2:** no trigram index for search in MVP. Revisit if a workspace passes a few thousand clients.
- **TD-A-3:** the page title is *Klien* on both tabs (the frames). The active tab is shown by the tabs, not the title (unlike F-05, whose title follows the tab).

## Risks / Open Questions

- **Base dependency:** Slice 0 stops if F-05 isn't on `main` yet. Running F-06 first would duplicate Tabs, Select, the shell tabs and the booking context, and clash on migration numbers.
- **AC-CLI-015** can only be proven against a real FK once F-07 adds `project.client_id`. Until then the mapping is unit-tested, and F-07 adds the integration test.
- **Double render:** the shell renders children in both trees. Dialogs and menus mount once per tree, and E2E selectors scope to the visible tree (F-03/F-04).
- **Page-action flash:** the desktop *Tambah klien* is portalled after hydration (accepted in F-04).

## Implementation record — 2026-10-03

F-06 is implemented on `codex/clients`; formal `/sdv:verify-feature clients` remains pending.

- **Commits:** `b4d1e72` through `138c48e`, including the client domain, migration `0008_client`, Drizzle repository, composition/actions/routes, responsive lists and dialogs, row lifecycle actions, search/paging, E2E journeys, and accessibility coverage.
- **Migration:** the reviewed and committed `0008_client` migration was applied to the shared non-production database. Output: `migrations applied successfully!`.
- **Exports/fidelity:** all 40 HTML exports were present. The implementation was compared structurally at the required desktop/phone compositions. The desktop table is intentionally a standalone React Aria `DataTable`; the Section Card owns *Daftar klien*, count, actions and search, while `EmptyState` remains a separate composition unit. Search is 320px on desktop and full width on phone; the allowed table column literals (184/240/32) and narrow 720px content column are retained.
- **Accessibility refinements:** `IconButton` forwards a ref for React Aria triggers. A client row-menu Escape restores focus to its own action trigger; social-link focus remains on a surviving field after removal. The focused DOM tests and keyboard E2E path pass.
- **AC map:** the test matrix above maps AC-CLI-001…021 to domain/UI/integration/E2E coverage. `tests/e2e/clients/clients.spec.ts` supplies the completed journeys for navigation, add/edit/duplicate number, archive/restore/delete, search, WhatsApp link and tenant isolation.
- **Verification pending:** targeted unit/DOM tests, TypeScript and ESLint pass. The separate axe run first found a React Aria transient tree after repeated overlay transitions; isolated runs then hit a local registration failure at `/register` with no alert content before scans began. Re-run the full E2E/axe suite on a fresh local server before marking the feature DONE. AC-CLI-015's real-FK integration check remains F-07 work, as already documented.
- **Follow-ups:** promote the List Card Item avatar and pending Sheet Item additions when the design-system promotion cycle resumes; resolve the existing `text.link` design-token gap.
