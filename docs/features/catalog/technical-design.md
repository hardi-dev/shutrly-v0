# Technical Design — F-05 Service catalog

Status: PLANNED (2026-10-02) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) · Design: [design.md](design.md) (40 frames, `exports/`) · Plan: [plan.md](plan.md)

## Context

The Owner describes what they sell. **Item definitions** (*Item paket*) are reusable package benefits with a value type, an optional unit and, for selection items, a selection type. **Categories** group **services**. A service has a base price, **service items** (one value per definition) and **booking fields** (extra inputs collected when a project is created). Everything is a template: F-07 snapshots it into projects (BR-CAT-003, BR-PRJ-001). Every workspace starts with four item definitions (BR-CAT-011). F-05 calls no external service.

## Relevant Authority

- Constitution: C-002, C-003, C-004, C-005, C-006, C-007, C-008, C-101, C-102, C-105.
- Business rules: BR-CAT-001…011, BR-CUR-001, BR-CUR-003, BR-WS-002, BR-WS-003; BR-PRJ-001 shapes the data F-07 will copy.
- ADRs: ADR-003 (isolation, composite FKs), ADR-007 (money), ADR-009 (Neon), ADR-010 (Tailwind + React Aria), ADR-015 (URL-scoped routes), ADR-016 (seeding inside the creation transaction). **No new ADR** (see *Decisions* below).
- Rules: `docs/coding-rules.md` v2.0; `docs/design-system/token-usage.md` v3.1; component specs `tabs.md` (C45), `page-header.md`, `segmented-control.md`, `empty-state.md`, `menu-item.md` (Rich), `list-card.md` (trailing amendment), `select.md`, `switch.md`.

## Architecture

F-05 lives in the **`booking`** bounded context named in `architecture/overview.md` (catalog now, projects in F-07). It never imports another feature; workspace verification reaches it through `composition/`.

```text
app/(owner)/w/[workspaceId]/services/page.tsx                → Layanan tab      → composition › loadServices
app/(owner)/w/[workspaceId]/services/categories/page.tsx     → Kategori tab     → loadCategories
app/(owner)/w/[workspaceId]/services/items/page.tsx          → Item paket tab   → loadItemDefinitions
app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx    → service detail   → loadServiceDetail
app/(owner)/w/[workspaceId]/services/**/loading.tsx          → skeletons
app/actions/booking/catalog.ts                               → all catalog server actions
composition/booking/catalog-scope                            → Drizzle catalog repositories (one tx for multi-row writes)
composition/booking/catalog-flow                             → verify workspace (F-02) + use cases + logging
composition/workspace/workspace-creation-scope               → ONE transaction: workspace + templates + source + item definitions (ADR-016)
features/booking/domain        → names, value types, package values, IDR amounts, booking fields, defaults, order, summaries
features/booking/application   → ports, schemas, errors, use cases
features/booking/ui            → tab screens, rows, dialogs, detail sections, skeletons, copy
adapters/db/schema/booking     → service_category, service_item_definition, service, service_item, service_field_definition
adapters/db/catalog-repository → Drizzle implementations of the three ports
```

Shared UI built first (library promoted 2026-10-02; none exists in code yet):

| Unit | Location | Library |
|---|---|---|
| Icons `printer`, `clock`, `book-open`, `hash`, `move-horizontal`, `arrow-up`, `arrow-down`, `archive`, `archive-restore`, `lock`, `type`, `align-left`, `toggle-left`, `list` | `ui/primitives/icon` | Lucide names in the frames; Hugeicons in code |
| `Switch` | `ui/primitives/switch` | C07 |
| `Select` (single choice; optional rich options; phone opens a Bottom Sheet picker) | `ui/patterns/select` | C19 + C09 Menu Item/Rich + C32 Form sheet |
| `Tabs` (link tabs, `aria-current="page"`) | `ui/patterns/tabs` | C45 |
| `PageHeader` `tabs` prop; `AppShell` passes it through | `ui/patterns/page-header`, `ui/patterns/app-shell` | C40 Page Header/Tabs |
| `SegmentedControl` `isFullWidth` | `ui/patterns/segmented-control` | C23 Full width |
| `EmptyState` `placement="in-card"` | `ui/patterns/empty-state` | C38 In card |
| Owner shell: section tabs from the route; a page-heading override for dynamic sub-pages | `features/workspace/ui/owner-shell`, `owner-nav` | — |

Each new shared unit gets a Storybook story (ADR-014) and a co-located test.

## Database Changes

Migration `0006_service_catalog` (drizzle-kit generated). Every table is a tenant table (`workspace_id`, `tenantKey`), with `created_at`, `updated_at` and `updated_by text NULL → user(id) ON DELETE SET NULL`.

**`service_category`**

| Column | Type / rule |
|---|---|
| `name` | text NOT NULL, CHECK `char_length between 1 and 60 and name = btrim(name)` (BR-CAT-009) |
| `is_active` | boolean NOT NULL DEFAULT true (BR-CAT-008) |

Unique index `(workspace_id, lower(name))`.

**`service_item_definition`**

| Column | Type / rule |
|---|---|
| `name` | as above; unique index `(workspace_id, lower(name))` |
| `value_type` | text NOT NULL CHECK `in ('NUMBER','RANGE')` (BR-CAT-001) |
| `unit` | text NULL CHECK `unit is null or (char_length(unit) between 1 and 20 and unit = btrim(unit))` (A-4) |
| `selection_required` | boolean NOT NULL DEFAULT false |
| `selection_type` | text NULL CHECK `in ('EDIT','PRINT')` (BR-CAT-007) |
| `is_active` | boolean NOT NULL DEFAULT true |

CHECKs: `selection_required = (selection_type is not null)` (BR-CAT-007); `not selection_required or value_type = 'NUMBER'` (BR-CAT-002).

**`service`**

| Column | Type / rule |
|---|---|
| `category_id` | uuid NOT NULL; composite FK `(workspace_id, category_id) → service_category(workspace_id, id)` ON DELETE RESTRICT |
| `name` | as above; unique index `(workspace_id, lower(name))` (A-11) |
| `base_price` | `numeric(18,3)` NOT NULL, CHECK `base_price >= 0 and base_price = trunc(base_price) and base_price <= 999999999999` (BR-CUR-001/003, A-7) |
| `currency` | text NOT NULL DEFAULT 'IDR' CHECK `= 'IDR'` (BR-CUR-001) |
| `is_active` | boolean NOT NULL DEFAULT true |

**`service_item`**

| Column | Type / rule |
|---|---|
| `service_id` | composite FK → `service(workspace_id, id)` ON DELETE CASCADE |
| `definition_id` | composite FK → `service_item_definition(workspace_id, id)` ON DELETE **RESTRICT** (BR-CAT-008: a used definition can't be deleted) |
| `value` | jsonb NOT NULL CHECK `jsonb_typeof(value) = 'object'`; shape validated in the domain (BR-CAT-001) |
| `sort_order` | integer NOT NULL |

Unique `(workspace_id, service_id, definition_id)` (BR-CAT-005); index `(service_id, sort_order)`.

**`service_field_definition`**

| Column | Type / rule |
|---|---|
| `service_id` | composite FK → `service` ON DELETE CASCADE |
| `key` | text NOT NULL CHECK `key ~ '^[a-z][a-z0-9_]{0,49}$'`; unique `(workspace_id, service_id, key)` (BR-CAT-006) |
| `name` | text NOT NULL, 1–60, trimmed; unique index `(service_id, lower(name))` (BR-CAT-009) |
| `field_type` | text NOT NULL CHECK `in ('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT')` |
| `is_required` | boolean NOT NULL DEFAULT false |
| `options` | jsonb NULL; CHECK `(field_type = 'SELECT') = (options is not null)` and `options is null or jsonb_typeof(options) = 'array'` |
| `sort_order` | integer NOT NULL |

**Backfill** `0007_item_definition_backfill` (drizzle-kit `--custom`), idempotent (AC-CAT-002):

```sql
INSERT INTO "service_item_definition" ("workspace_id","name","value_type","unit","selection_required","selection_type")
SELECT w."id", d.name, d.value_type, d.unit, d.selection_required, d.selection_type
FROM "workspace" w
CROSS JOIN (VALUES
  ('Foto edit','NUMBER','foto',true,'EDIT'),
  ('Foto cetak','NUMBER','lembar',true,'PRINT'),
  ('Jumlah orang','RANGE','orang',false,NULL),
  ('Durasi pemotretan','NUMBER','jam',false,NULL)
) AS d(name, value_type, unit, selection_required, selection_type)
WHERE NOT EXISTS (
  SELECT 1 FROM "service_item_definition" s
  WHERE s."workspace_id" = w."id" AND lower(s."name") = lower(d.name))
ON CONFLICT DO NOTHING;
```

A config test checks the SQL against `DEFAULT_ITEM_DEFINITIONS`. The agent applies 0006/0007 with `pnpm db:migrate` against the shared non-production database after committing them (tech-stack.md › Deployment, Owner 2026-10-02); both are additive.

## Server / API Interface

| Entry | Input | Result |
|---|---|---|
| `GET /w/[id]/services`, `/services/categories`, `/services/items` | route | the tab page; the workspace is verified (ADR-015). `services` leaves `COMING_SOON_SECTIONS`. |
| `GET /w/[id]/services/[serviceId]` | route | the detail page; a malformed, unknown or foreign ID → `notFound()` (AC-CAT-021). |
| `addCategoryAction(wsId, { name })`, `renameCategoryAction(wsId, id, { name })` | bound IDs + untrusted input | `undefined` or `{ ok:false, code:"VALIDATION_FAILED", fieldErrors }` |
| `addItemDefinitionAction(wsId, values)`, `updateItemDefinitionAction(wsId, id, values)` | `{ name, valueType, unit, selectionRequired, selectionType }` | same; `fieldErrors.valueType = "LOCKED"` when BR-CAT-010 blocks |
| `addServiceAction(wsId, { name, categoryId, basePrice })` | | `{ ok:true, serviceId }` (the client navigates to the detail) or field errors |
| `updateServiceInfoAction(wsId, id, { name, categoryId, basePrice })` | | `undefined` or field errors |
| `setCatalogActiveAction(wsId, kind, id, isActive)` | `kind ∈ category \| definition \| service` | `undefined` |
| `deleteCatalogEntryAction(wsId, kind, id)` | | `undefined` or `{ ok:false, code:"IN_USE" }` |
| `addServiceItemAction(wsId, serviceId, { definitionId, value })`, `updateServiceItemAction(wsId, serviceId, itemId, { value })` | value: `{ value }` or `{ min, max }` strings | `undefined` or field errors |
| `addBookingFieldAction(wsId, serviceId, values)`, `updateBookingFieldAction(wsId, serviceId, fieldId, values)` | `{ name, fieldType, isRequired, options? }` | `undefined` or field errors |
| `removeServiceItemAction`, `removeBookingFieldAction` | bound IDs | `undefined` |
| `moveServiceItemAction`, `moveBookingFieldAction` | bound IDs + `direction: "UP" \| "DOWN"` | `undefined` |

- The workspace ID comes only from the route and is verified on every call (ADR-015, AC-CAT-021).
- Every referenced ID (category, definition, service, item, field) is re-read inside the workspace scope; composite FKs back this up (ADR-003).
- Unexpected failures throw a generic `CatalogError("SAVE_FAILED")` → danger toast *Perubahan belum tersimpan* + *Coba lagi* (AC-CAT-022).

## Domain / Application Logic

**Domain (`features/booking/domain`, pure):**

| Unit | Responsibility |
|---|---|
| `catalog-name` | `CATALOG_NAME_MAX_LENGTH = 60`; `normaliseCatalogName`; `findCatalogNameProblem` → `EMPTY` \| `TOO_LONG` \| null; `catalogNameKey` (lower case). Used for categories, definitions, services and booking-field names (BR-CAT-009). |
| `item-definition-type` | `VALUE_TYPES`, `SELECTION_TYPES = ["EDIT","PRINT"]`, `UNIT_MAX_LENGTH = 20`; `findDefinitionTypeProblem({ valueType, selectionRequired, selectionType })` → `SELECTION_NEEDS_NUMBER` \| `SELECTION_TYPE_REQUIRED` \| `SELECTION_TYPE_UNEXPECTED` \| null (BR-CAT-002, BR-CAT-007); `isTypeChange(before, after)` (BR-CAT-010). |
| `package-value` | `PackageValue = { type:"NUMBER"; value } \| { type:"RANGE"; min; max }` with **decimal strings**; `parseQuantity` (accepts `1,5` and `1.5`; ≤ 2 decimals; 0…999 999.99) → value or `INVALID` \| `NEGATIVE` \| `TOO_MANY_DECIMALS` \| `TOO_LARGE`; `findPackageValueProblem(definition, value)` adds `NOT_WHOLE` (selection) and `MIN_GREATER_THAN_MAX`; `compareDecimal`; `formatQuantity` (`1.5` → `1,5`). |
| `idr-amount` | `IDR_MAX = "999999999999"`; `parseIdrAmount` (`"750.000"`, `"750000"`, `"Rp 750.000"` → `"750000"`) → amount or `EMPTY` \| `INVALID` \| `NOT_WHOLE` \| `TOO_LARGE`; `formatIdr("750000")` → `Rp 750.000` (BigInt + `Intl.NumberFormat("id-ID")`). No JS number arithmetic (ADR-007, C-105). |
| `booking-field` | `FIELD_TYPES`; `fieldKeyFromName` (lower case, strip diacritics, non-alphanumerics → `_`, max 50, fallback `field`); `uniqueFieldKey(base, existingKeys)` → `base`, `base_2`, …; `OPTION_MAX_COUNT = 50`, `OPTION_MAX_LENGTH = 60`; `findOptionsProblem(options)` → `OPTIONS_REQUIRED` \| `OPTION_EMPTY` \| `OPTION_TOO_LONG` \| `OPTION_DUPLICATE` \| `TOO_MANY_OPTIONS` (+ index) \| null (A-3). |
| `default-item-definitions` | `DEFAULT_ITEM_DEFINITIONS` (BR-CAT-011). |
| `catalog-order` | `sortCatalogEntries`: active first, then by name (`localeCompare(…, "id", { sensitivity:"base" })`) (AC-CAT-005). |
| `item-summary` | `summariseServiceItems(items, max = 3)` → `25 foto · 5 lembar · 1–2 orang` (A-8; see *Decisions*). |

**Application (`features/booking/application`):**

- **Ports** (every call takes a `WorkspaceContext`; no unscoped function, C-101):

  | Port | Operations |
  |---|---|
  | `CategoryRepositoryPort` | `list` (with service counts), `create`, `rename`, `setActive`, `delete` |
  | `ItemDefinitionRepositoryPort` | `list` (with usage counts), `findById`, `create`, `update` (BR-CAT-010 guard), `setActive`, `delete`, `seedDefaults` |
  | `ServiceRepositoryPort` | `listWithItems`, `findDetail`, `create`, `updateInfo`, `setActive`, `delete`, `addItem`, `updateItemValue`, `removeItem`, `moveItem`, `addField`, `updateField`, `removeField`, `moveField` |

  Write results are unions (`"CREATED" \| "NAME_TAKEN" \| "NOT_FOUND" \| "IN_USE" \| "LOCKED" \| "DUPLICATE_DEFINITION" \| "INACTIVE_REFERENCE"` as applicable).
- **Schemas** (shared by forms and use cases, C-004): `catalogNameSchema`, `itemDefinitionSchema`, `serviceInfoSchema` (`basePrice` via `parseIdrAmount`), `packageValueInputSchema` (discriminated by the definition's type at use-case time), `bookingFieldSchema`, `catalogIdSchema` (uuid), `moveDirectionSchema`.
- **Errors:** `CatalogError` codes `NOT_FOUND`, `SAVE_FAILED`. Codes only, never names (C-103-style logging discipline).
- **Use cases:** categories (list, add, rename, set active, delete); item definitions (list, add, update, set active, delete, seed defaults); services (list grouped by category with summaries, get detail, add, update info, set active, delete); service items (add, update value, remove, move); booking fields (add, update, remove, move). Each validates with the schema, re-checks domain rules, calls the port and maps results to `{ ok:true }`, `VALIDATION_FAILED` + `fieldErrors`, `IN_USE`, or throws `NOT_FOUND`.

**Composition:**
- `catalog-flow` exports one loader per page (`loadServices`, `loadCategories`, `loadItemDefinitions`, `loadServiceDetail`) and one entry per action. Each verifies the workspace (`verifyOwnerWorkspace`), parses IDs with `catalogIdSchema` (malformed → `notFound()`), maps `NOT_FOUND` → `notFound()`, and logs unexpected failures as `catalog.save_failed` with `{ workspaceId, entity, entityId?, operation }` only, then throws `SAVE_FAILED`.
- `withCatalogScope` builds the three Drizzle repositories over the request `Db`; writes that touch several rows (item add with definition lock, reorder) open `db.transaction` inside the repository method (single feature, no ADR-016 scope needed).
- `withWorkspaceCreationScope` gains `itemDefinitions`; both F-02 create flows run `seedDefaultItemDefinitions` after the source seed (ADR-016, AC-CAT-001).

## UI Components

Built from `exports/` ([design.md](design.md)); copy in `features/booking/ui/catalog-copy/catalog-copy.copy.ts`.

| Unit | Exports |
|---|---|
| `CatalogTabsBar` (phone: Segmented Control/Full width linking the three tab routes; desktop: nothing, tabs are in the header) | `*-populated-n9Gskl`, `p9oM7y`, `mnsE2` |
| `ServicesScreen` (category Section Cards, `ServiceRow`, empty state in card, *Tambah layanan* page action / phone primary button) | `layanan-*` |
| `CategoriesScreen` + `CategoryRow` | `kategori-*` |
| `ItemDefinitionsScreen` (*Dipilih klien* / *Item lainnya*) + `ItemDefinitionRow` | `item-paket-*` |
| `CatalogRowActions` (desktop Menu; phone Bottom Sheet/Actions): *Ubah* / *Ganti nama*, *Arsipkan* / *Aktifkan*, *Hapus* | `layanan-row-menu-*` |
| `CategoryDialog` (Modal SM / sheet) | `kategori-form-W8bUn` |
| `ItemDefinitionDialog` (Select *Tipe nilai* and *Jenis pilihan* with rich options, Switch, locked state with Alert/Info) | `item-form-*` |
| `AddServiceDialog` (name, category Select with *+ Kategori baru*, price with `Rp` prefix; navigates to the detail on success) | `tambah-layanan-*` |
| `DeleteCatalogDialog` (allowed → Danger; blocked → *Arsipkan*) | `delete-*` |
| `ServiceDetailScreen`: `ServiceInfoCard` (facts + *Ubah*), `ServiceItemsCard`, `BookingFieldsCard`, archived Alert/Warning, page action *Arsipkan* / *Aktifkan*; phone Compact Bar ⋯ sheet | `service-detail-*`, `service-actions-sheet-s5M34T`, `item-row-actions-sheet-FO6t9` |
| `ServiceInfoDialog`, `ServiceItemDialog` (definition Select, number or min/max inputs), `BookingFieldDialog` (type Select, Switch *Wajib diisi*, `OptionListEditor`) | `service-item-form-*`, `booking-field-form-*` |
| Skeletons for the three tabs and the detail | `layanan-loading-m603dh` |
| `useCatalogMutations` (toasts: saved, archived with *Batalkan*, unarchived, deleted, server error with *Coba lagi*) | `toast-*` |
| `definitionIcon(definition)` | rows (see *Decisions*) |

## Validation

- Client: `zodResolver(<shared schema>)` for immediate field errors (UX only).
- Server: use cases re-parse with the same schemas, trim names, parse money and quantities in the domain, and check referenced rows are active and in the workspace (C-004, AC-CAT-007/011/012).
- DB: CHECKs (types, lengths, money range, selection consistency, options shape), case-insensitive unique indexes, composite FKs, RESTRICT for referenced rows.

## Error Handling

| Case | Result |
|---|---|
| Empty / too-long name | field error `EMPTY` \| `TOO_LONG` (AC-CAT-019 wording *Nama ini sudah dipakai* is for `NAME_TAKEN`) |
| Duplicate name (same kind, any case, archived included, race) | 23505 → `NAME_TAKEN` |
| Selection rules broken (bypassing the form) | `VALIDATION_FAILED` on `valueType` / `selectionType` (AC-CAT-007) |
| Type change on a used definition | `LOCKED` on `valueType` (AC-CAT-008) |
| Bad package value | `INVALID` \| `NEGATIVE` \| `NOT_WHOLE` \| `MIN_GREATER_THAN_MAX` \| `TOO_LARGE` on `value` / `min` / `max` (AC-CAT-012) |
| Definition already in the service (race) | 23505 → `DUPLICATE_DEFINITION` (AC-CAT-013) |
| Archived category / definition referenced by a write | `INACTIVE_REFERENCE` field error (AC-CAT-017) |
| Bad price | `INVALID` \| `NOT_WHOLE` \| `TOO_LARGE` on `basePrice` |
| Booking field problems | `NAME_TAKEN`, `OPTIONS_REQUIRED`, `OPTION_DUPLICATE` (+ index) … (AC-CAT-015) |
| Delete of a referenced row | 23503 → `IN_USE` → blocked dialog with *Arsipkan* (AC-CAT-018) |
| Unknown or foreign ID / workspace | `notFound()` (AC-CAT-021) |
| Unexpected failure | generic `SAVE_FAILED`; danger toast + *Coba lagi*; dialog keeps input (AC-CAT-022) |

## Concurrency / Consistency

- Names and booking-field keys: unique indexes decide races (A-10).
- One item per definition: the unique key decides (AC-CAT-013).
- BR-CAT-010: `addItem` reads the definition `FOR SHARE` inside its transaction; `update` changes the type only `WHERE NOT EXISTS (service_item …)` in the same statement. A concurrent type change and item insert therefore serialize on the definition row.
- Reorder: `moveItem` / `moveField` lock the service row `FOR UPDATE`, then swap `sort_order` with the neighbour.
- Seeding: creation-time seeding runs in the creation transaction (ADR-016); the backfill is idempotent (`NOT EXISTS` + `ON CONFLICT DO NOTHING`).
- Delete versus a concurrent reference (a new service in a category, an item using a definition, F-07 projects): the FK RESTRICT decides.

## Security

- Every query filters by the verified `workspaceId`; children carry `workspace_id` with composite FKs (C-101, ADR-003).
- Prices are parsed and checked server-side; the browser's number is never trusted (C-004, C-105).
- Logs carry IDs, entity kind, operation and code only.
- Names, units and options are plain text, escaped by React.

## Testing Strategy

| AC | Test |
|---|---|
| AC-CAT-001 | integration: creation transaction → 4 definitions; a failure → none · unit: `seedDefaultItemDefinitions` |
| AC-CAT-002 | integration: `seedDefaults` twice and with an existing *foto edit* → no duplicates · config test on 0007 |
| AC-CAT-003 | unit: shell tabs, `isComingSoonSection("services") === false` · E2E: nav + tabs |
| AC-CAT-004 | unit: empty state in card · E2E new workspace |
| AC-CAT-005 | unit: `sortCatalogEntries`, `formatIdr`, `summariseServiceItems`, screen order |
| AC-CAT-006/007/008 | unit: domain type rules, schemas, use cases, dialog · integration: LOCKED guard · E2E add |
| AC-CAT-009 | unit + E2E: add/rename category |
| AC-CAT-010 | unit: `parseIdrAmount`, add-service use case · integration: numeric round-trip `750000.000` · E2E |
| AC-CAT-011/012 | unit: `parseQuantity`, `findPackageValueProblem`, item dialog · integration: JSON value round-trip |
| AC-CAT-013 | integration: concurrent duplicate add → one row |
| AC-CAT-014/015 | unit: `fieldKeyFromName`, `uniqueFieldKey`, `findOptionsProblem`, rename keeps key · integration: unique key/name |
| AC-CAT-016 | integration: move up/down persists order · unit: dialog/remove |
| AC-CAT-017 | unit: archived pickers exclude archived rows; toast *Batalkan* · integration: setActive |
| AC-CAT-018 | integration: delete unused category OK; category with services / used definition → `IN_USE` |
| AC-CAT-019 | integration: case-insensitive duplicates per kind; same name across kinds allowed |
| AC-CAT-020 | integration: editing a service writes only catalog tables (row counts) |
| AC-CAT-021 | integration: every write with another workspace's context → `NOT_FOUND`/no change; composite FK rejects cross-workspace references · E2E foreign URL → not found |
| AC-CAT-022 | unit: mutation failure → danger toast + retry; dialog keeps input · flow test logs IDs only |
| AC-CAT-023 | E2E: axe (wcag2a/2aa/21a/21aa) at 1440 and 390 px on the three tabs, the detail and the item dialog; keyboard through tabs, row menu and dialogs |

## Decisions (recorded here, no ADR)

- **Bounded context `booking`:** named in the architecture overview; F-07 projects join it. No architecture change.
- **Money without a decimal library:** F-05 only stores and displays a base price. Amounts are whole-rupiah digit strings, formatted with BigInt + `Intl`, stored in `numeric(18,3)` (ADR-007's decimal-safe requirement). A decimal library is chosen when arithmetic arrives (F-07/F-14), with its own decision.
- **Package values as decimal strings in JSONB** (`{"value":"25"}`, `{"min":"1","max":"2"}`), never floats; ≤ 2 decimals, max 999 999.99. *Low-risk assumption TD-A-1* (the spec doesn't fix precision).
- **Tabs are routes** (`/services`, `/services/categories`, `/services/items`) so each tab is linkable and server-rendered; desktop tabs render in the Page Header from the route, phone tabs are a full-width Segmented Control in the content.
- **Service detail heading:** the page registers its title and parent with the owner shell (a heading override), because the service name is dynamic and the layout can't read it.
- **Row icons are derived from type** (`EDIT` → `image`, `PRINT` → `printer`, `RANGE` → `move-horizontal`, otherwise `hash`; services `package`, categories `folder`). The frames used illustrative per-item icons (`users`, `clock`, `book-open`); definitions have no icon field. **Deviation to confirm with the Owner (TD-D-1).**
- **Item summary** uses value + unit (falls back to the definition name when there is no unit): *25 foto · 5 lembar · 1–2 orang*. The frames show *25 foto edit · 5 lembar cetak*. **Deviation to confirm (TD-D-2).**

## Implementation Iterations

See [plan.md](plan.md): 15 tasks, test-first, one commit each. Task 6 applies migrations 0006/0007 to the non-production database (agent, reported). Owner checkpoint: Task 15 browser check against the exports.

1. Icons + `Switch` (+ story)
2. `Select` with rich options and the phone picker (+ story)
3. `Tabs`, `PageHeader`/`AppShell` tabs, `SegmentedControl` full width, `EmptyState` in card (+ stories)
4. Owner shell: services leaves coming soon, route-driven header tabs, heading override, nav active state
5. Domain units
6. Schema + migrations 0006/0007 + backfill config test, applied to the non-production database
7. Application: categories and item definitions (+ seed) with fake repositories
8. Application: services, service items, booking fields
9. Drizzle repositories + integration tests
10. Composition, creation seeding, server actions
11. Routes, loaders, copy, skeletons, phone tabs bar
12. Layanan and Kategori tabs: lists, row actions, category dialog, add-service dialog, delete dialog, toasts
13. Item paket tab: list and item-definition dialog (Selects, Switch, lock)
14. Service detail: info, items, booking fields, reorder, archive/unarchive/delete, phone sheets
15. E2E + axe, browser fidelity, implementation record

## Risks / Open Questions

- **TD-D-1, TD-D-2:** icon and summary deviations above; confirm or the plan switches to an `icon` column / name-based summary.
- **Heading flash:** the detail title and the desktop page action appear after hydration (same accepted flash as F-04's page actions).
- **Double render:** the shell renders both trees; dialogs mount once per tree; E2E scopes to the visible tree (F-03/F-04).
- **F-07 coupling:** `IN_USE` for services with projects and BR-CAT-008's "used by a snapshot" for definitions are proven only when F-07 adds its FKs; until then they are unit-tested.
- **`catalog.pen` migration:** the frames still use local pieces (design.md follow-up). Code uses the library components named above.
- **No search or paging** in MVP lists (spec out of scope); fine for expected catalog sizes.
