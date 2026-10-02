# F-06 Clients — Implementation Plan (vertical slices by screen)

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. In this repo, `/sdv:build-feature clients <slice>` runs one slice; each **step** inside it is one commit.

**Goal:** on *Klien*, the Owner manages the workspace's clients.
- **List:** *Aktif* and *Arsip* tabs, a count in the list title, search by name or WhatsApp number, and 30 rows per page with *Muat lebih banyak*.
- **Add and edit dialog:** a normalised, unique WhatsApp number and 0–10 social links.
- **Row actions:** *Buka WhatsApp*, archive with undo, restore, and a guarded delete.

**Approach:** each slice delivers one part of the *Klien* page end to end:
- domain → application → repository → action → UI → tests;
- it can be tried in the browser when it is done;
- it produces the data the next slice shows.

The slice order is: list + add → validation + edit → row menu + archive → delete → search + paging. Each step inside a slice is one commit.

**Architecture:**
- Clients join the `booking` feature (`src/features/booking/{domain,application,ui}`), next to the F-05 catalog (D-1).
- One Drizzle table, `client`, sits behind `ClientRepositoryPort`. Social links are a Zod-validated JSONB array (D-2). Migration `0008`.
- *Aktif* and *Arsip* are routes, `/clients` and `/clients/archived`, shown as F-05's owner-shell section tabs (D-3). The search query is `?q=`.
- The list pages with a keyset on `(lower(name), created_at, id)`, 30 at a time (D-4). The first page and the count are server-rendered; *Muat lebih banyak* calls a server action.
- The unique index on `(workspace_id, whatsapp_number)` decides *number taken*, races included (D-6).
- A new shared `DataTable` pattern (C27, React Aria `Table`) renders the desktop list (D-5). Phones use Section Card + List Card Item rows.
- Composition verifies the workspace (F-02) and wires the routes and actions.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), Hugeicons, Vitest (unit, dom, integration), Playwright + axe, Storybook.

**Sources:**
- design: [design.md](design.md) and `exports/*.html` (40 frames, one per file);
- technical design: [technical-design.md](technical-design.md) (D-1…D-8, the AC → test map, TD-A-1…3);
- spec: [spec.md](spec.md) (A-1…A-10) and [acceptance-criteria.md](acceptance-criteria.md) (AC-CLI-001…021);
- component specs: `docs/design-system/components/{table,tabs,page-header,segmented-control,section-card,list-card,select,empty-state,menu,modal,bottom-sheet}.md`.

**Base:** F-05 Catalog is on `main` and merged into `feat/clients` (`7ac6cdf`, 2026-10-02). This plan uses these F-05 units by name:
- the `booking` context folders, `CatalogError` (shape to copy) and `catalog-flow` / `catalog-scope` (pattern to copy);
- `pgCode` in `src/adapters/db/catalog-repository/pg-error.ts`;
- `Tabs` / Page Header `tabs` and owner-nav `resolveServicesHeading` (the section-tabs pattern);
- `SegmentedControl` `isFullWidth`, `Select`, `EmptyState` `placement`, `Alert`;
- the `archive` / `archive-restore` icons;
- migrations up to `0007`, so this feature's migration is `0008`.

**Consumer:** F-07 Projects (`feat/projects`) builds on this plan and checks these names in its Slice 0: `client` table, `drizzle/0008_client.sql`, `ClientRepositoryPort`, `addClient`, `updateClient`, `ClientDialog`, `addClientAction`, `updateClientAction`, `DataTable`, `DataTableSkeleton`, `SheetItem` `isDisabled` / `isPending`, `formatWhatsappNumber`, `whatsappChatUrl`, and the Input trailing `x` action. **Don't rename them.**

## Global Constraints

Every step's requirements implicitly include this section. They are F-05's Global Constraints (`docs/features/catalog/plan.md`) plus the following.

- **Reuse first.** Before building any UI unit, the agent:
  1. searches `src/ui/primitives`, `src/ui/patterns` and `src/features/booking/ui`, and the Storybook stories;
  2. lists in the step what it found;
  3. uses the existing unit, or extends it with an additive prop.

  The agent creates a new unit only when nothing fits, and says why in the commit message. The same applies to helpers: `pgCode`, `withRequestDb`, `verifyOwnerWorkspace`, `requireOwnerOrRedirect`, `showToast`, `useMobileViewport`, `cn`.
- **Boundaries (lint):** `features/booking` never imports another feature, nor the reverse. Client code imports catalog code only for `pg-error`.
- **Rule values (named constants, never literals):**

  | Constant | Value | Rule |
  |---|---|---|
  | `CLIENT_NAME_MAX_LENGTH` | `100` code points, after trim; names are not unique | BR-CLI-001 |
  | `WHATSAPP_NUMBER_PATTERN` | `/^(?!620)[1-9]\d{9,14}$/` (the DB check repeats it) | BR-CLI-002 |
  | `WHATSAPP_SEPARATORS` | `/[\s\-.()]/g` | BR-CLI-002 |
  | `SOCIAL_PLATFORMS` | `["INSTAGRAM", "TIKTOK", "FACEBOOK", "YOUTUBE", "X", "OTHER"]` | A-2 order |
  | `SOCIAL_LINK_MAX_COUNT` | `10` | BR-CLI-001 |
  | `SOCIAL_VALUE_MAX_LENGTH` | `200` code points | BR-CLI-001 |
  | `CLIENT_PAGE_SIZE` | `30` | A-5 |
  | `CLIENT_SEARCH_MAX_LENGTH` | `100` | TD-A-1 |
  | `CLIENT_SEARCH_DEBOUNCE_MS` | `300` | A-4 |
  | `CLIENT_SKELETON_ROWS` | `5` | design.md › Layout |

- **Number display:** stored as digits with the country code (`6281234567890`); shown as *+62 812-3456-7890* for Indonesia and *+14155550100* otherwise (A-7).
- **Logging (C-103, AC-CLI-019):** `client.save_failed` with `{ workspaceId, clientId?, operation }` only. Never a name, number, social link, search query or `wa.me` URL.
- ***Buka WhatsApp*** is built in the browser with `whatsappChatUrl` and is never sent to an action or logged (A-6).
- **Copy:** from the frames and design.md › Copy, in `CLIENT_COPY` (`features/booking/ui/client-copy/client-copy.copy.ts`). Strings not drawn carry `// not in Pencil`.
- **Copy differs by breakpoint** where the exports differ. Keep both variants (`…Desktop` / `…Mobile`):

  | Key | Desktop | Phone |
  |---|---|---|
  | page subtitle (owner-nav) | *Orang yang memesan sesi foto. Pilih mereka saat membuat proyek.* | *Orang yang memesan sesi foto.* |
  | `searchPlaceholder` | *Cari nama atau nomor WhatsApp* | *Cari nama atau nomor* |
  | add action | *Tambah klien* (Page Header, Button Primary `plus`) | *Tambah* (Section Card actions, Button Secondary `plus`) |
  | `socialValuePlaceholder` | *@nama atau tautan https://* | *@nama atau tautan* |
  | dialog cancel | *Batal* (Button Secondary) | none: the sheet's Close icon cancels |
  | `deleteDescription` | *Nama, nomor WhatsApp, dan media sosialnya dihapus permanen. Nomornya bisa dipakai klien lain.* | *Nama, nomor WhatsApp, dan media sosialnya dihapus permanen.* |
  | blocked delete | title *Hapus klien "{name}"?* + the description + Alert/Danger *Klien ini punya proyek. Arsipkan saja.*; *Tutup* + *Hapus klien* disabled | sheet title *Klien ini punya proyek. Arsipkan saja.*, description *{name} tidak dihapus.*, one item *Tutup* |
  | load more | centred in the table footer | full width below the card |

- **UI steps:**
  - build from the slice's exports, and stop if one is missing;
  - map every raw value to a token; a value with no token is a DESIGN TOKEN GAP: report it and never hard-code it. The only literal sizes are the ones design.md lists: container 720 (`size.content-narrow`), search 320, columns 184 / 240 / 32, platform select 148, phone sheet height;
  - compare the screen with its exports at 1440 and 390 and record the deviations.
- **Migration:** Slice 1 generates `0008` with drizzle-kit, reviews it, commits it, then runs `pnpm db:migrate` against the non-production database from `.dev.vars` (AGENTS.md). Report the run.
- **Tests:** names start with the `AC-CLI-*` / `BR-CLI-*` IDs they cover. Domain tests never touch the DB. Integration tests seed their own workspace.
- **Quality gate per step:**
  - `pnpm typecheck`, `pnpm lint` and `pnpm test` pass;
  - steps that touch the repository add `pnpm test:integration`;
  - the slice's last step adds `pnpm build`, and from Slice 1 on, the E2E specs written so far.
- **Commits:** one per step; conventional, lowercase, with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Code in this plan:** written out for rules only (domain schemas, port, results, table, SQL). UI steps point to their exports and name the behaviour to test. They don't paste JSX, except the shared-pattern tests that fix a public API.

## File Structure

```text
src/ui/primitives/icon/                        registry + types: message-circle                       (Slice 3)
src/ui/primitives/input/                       InputIconName + "x"                                   (Slice 5)
src/ui/primitives/text-field/                  label optional (+ FieldNameProps)                     (Slice 1)
src/ui/patterns/select/                        label optional                                        (Slice 1)
src/ui/primitives/textarea/                    label optional, isLabelHidden removed                 (Slice 1)
src/features/communications/ui/template-editor-screen/   Textarea caller migrated to aria-label     (Slice 1)
src/ui/patterns/data-table/                    data-table.tsx · data-table-skeleton.tsx · .types.ts · .test.tsx · .stories.tsx (+ .stories.copy.ts)  (Slice 1)
src/ui/patterns/list-card-item/                + avatar leading                                      (Slice 1)
src/ui/patterns/menu/                          MenuItem + href / target                              (Slice 3)
src/ui/patterns/sheet-item/                    + href (Slice 3) · + isPending (Slice 4)
src/ui/patterns/app-shell/                     + mobileSubtitle                                      (Slice 1)
src/features/workspace/domain/coming-soon-sections/   − "clients"                                    (Slice 1)
src/features/workspace/ui/owner-nav/           clients heading, subtitles and Aktif · Arsip tabs      (Slice 1)
src/features/workspace/ui/owner-shell/         passes mobileSubtitle                                 (Slice 1)
src/features/booking/
  domain/client-name/ · whatsapp-number/ · social-link/ · client-search/ · client-list/              (Slice 1)
  application/errors/client-errors/                                                                  (Slice 1)
  application/ports/client-repository/                                                               (Slice 1; grows in 2, 3, 4)
  application/schemas/client-input/ · client-id/ · client-list-query/ · client-schemas.test.ts       (Slice 1)
  application/use-cases/client-results/ · list-clients/ · count-clients/ · add-client/               (Slice 1)
  application/use-cases/update-client/ (2) · set-client-archived/ (3) · delete-client/ (4)
  ui/client-copy/ · client-initials/ · client-field-error/ · clients-screen/ · clients-table/        (Slice 1)
  ui/client-list/ · clients-tabs-bar/ · clients-empty-state/ · clients-skeleton/                     (Slice 1)
  ui/client-dialog/ · social-links-editor/ · use-client-mutations/                                   (Slice 1; grow in 2)
  ui/client-row-actions/ (3) · delete-client-dialog/ (4) · client-search-field/ (5) · use-load-more-clients/ (5)
src/adapters/db/schema/booking/client.ts       (+ export in schema/index.ts)                         (Slice 1)
src/adapters/db/client-repository/             drizzle-client-repository.ts · .test.ts               (Slice 1; grows in 2, 3, 4)
src/composition/booking/client-scope/          client-scope.ts · .types.ts                           (Slice 1)
src/composition/booking/client-flow/           client-flow.ts · .types.ts · .test.ts                 (Slice 1; grows per slice)
src/app/actions/booking/clients.ts             (+ clients.test.ts)                                   (Slice 1; grows per slice)
src/app/(owner)/w/[workspaceId]/clients/       page.tsx · loading.tsx · archived/{page,loading}.tsx  (Slice 1)
drizzle/0008_client.sql                                                                              (Slice 1)
tests/support/booking/fake-client-repository.ts · client-fixtures.ts                                 (Slice 1)
tests/integration/booking/client-repository.test.ts                                                  (Slice 1; grows)
tests/e2e/clients/clients.spec.ts                                                                    (Slice 1; grows)
```

## Screens

F-06 has one page plus the overlays that open on it. Every state is one export per device (`exports/<state>-<desktop|mobile>-<id>.html`).

| # | Screen | Route / where it opens | Layout | States (exports) | Built in |
|---|---|---|---|---|---|
| S1 | **Klien** | `/w/[workspaceId]/clients` (*Aktif*), `/w/[workspaceId]/clients/archived` (*Arsip*) | Desktop: App Shell, *Klien* active in the Sidebar; Page Header with breadcrumb *Aster Wedding › Klien*, subtitle, *Tambah klien* and the *Aktif · Arsip* underline tabs; the 720 column holds the DataTable card (toolbar: *Daftar klien* + count left, search 320 right). Phone: Mobile App Shell with Bottom Nav *Klien* active; Segmented Control/Full width, search, Section Card Compact/Flush *Daftar klien* with *Tambah* | `list-populated-*`, `list-empty-*`, `list-empty-archived-*`, `list-loading-*`, `list-archived-*`, `list-no-match-*`, `list-loading-more-*`, `toast-*` | Slices [1](#slice-1-klien-list-and-add-a-client), [3](#slice-3-row-menu-archive-and-restore), [5](#slice-5-search-and-paging) |
| S1a | Row menu | S1 › row ⋯ (Action Menu SM / Bottom Sheet/Actions titled with the name and number) | | `list-row-menu-desktop-uTkvt`, `row-actions-sheet-mobile-cVBpx`, `list-archived-row-menu-desktop-sfgdK`, `list-archived-row-actions-sheet-mobile-Ttcj1` | Slice [3](#slice-3-row-menu-archive-and-restore) |
| S1b | Client dialog (add / edit) | S1 › *Tambah klien* / *Tambah*; desktop row click; row menu *Ubah* (Modal MD / full-height Bottom Sheet/Form) | | `add-default-*`, `add-saving-*`, `add-field-errors-*`, `add-number-taken-*`, `edit-several-rows-*` | Slices [1](#slice-1-klien-list-and-add-a-client), [2](#slice-2-dialog-validation-and-edit) |
| S1c | Delete confirm | S1a › *Hapus* (Modal SM danger / Bottom Sheet/Actions) | | `delete-confirm-*`, `delete-deleting-*`, `delete-blocked-*` | Slice [4](#slice-4-delete) |

**Navigation between screens:**
- **Shell:** Sidebar / rail / Bottom Nav *Klien* (`users`) → S1 *Aktif*. The nav item stays active on `/clients/archived`.
- **S1:** the tabs switch route and drop `?q=`; *Tambah klien* / *Tambah* → S1b add; desktop row click → S1b edit; ⋯ → S1a.
- **S1a:** *Ubah* → S1b edit; *Buka WhatsApp* → `https://wa.me/<digits>` in a new tab; *Arsipkan* / *Pulihkan* → toast; *Hapus* → S1c.

**Not drawn, behaviour defined:** a search with matching rows (the populated list, filtered), the 10th social row (*Tambah media sosial* disabled), the row menu of a client without a number (no *Buka WhatsApp*), and the saved, restored and deleted toasts (Toast/Success with design.md › Copy).

## How to run this plan in one session

- **Before the first slice:**
  - read this file whole, then [technical-design.md](technical-design.md) › Decisions, [design.md](design.md) › Layout and Copy, and `docs/coding-rules.md`;
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

Copy these patterns instead of inventing new ones. Every path exists on `feat/clients` today.

| Need | Follow | Notes |
|---|---|---|
| Server actions | `src/app/actions/booking/catalog.ts` | `"use server"`; `const PAGE = "/w/[workspaceId]/services"`; call the flow; `revalidatePath(PAGE, "layout")` on success; return `result.ok ? undefined : result` |
| Composition flow | `src/composition/booking/catalog-flow/catalog-flow.ts` | `verifyOwnerWorkspace(rawWorkspaceId)` → `verified.context`; `idOrNotFound` with the ID schema; `requireOwnerOrRedirect()` for writes; one `saveError(error, details)` that maps `NOT_FOUND` → `notFound()`, logs non-domain errors and throws `SAVE_FAILED` |
| Scope (repositories on the request DB) | `src/composition/booking/catalog-scope/catalog-scope.ts` | `withRequestDb((db) => work({ … }))` |
| Domain errors | `src/features/booking/application/errors/catalog-errors/catalog-errors.ts` | `CatalogError extends DomainError` with a code union |
| Zod domain schemas | `src/features/workspace/domain/{workspace-name,invoice-prefix}` | `*.schema.ts`, the issue message is the error key, types via `z.input` / `z.output` in `.types.ts` |
| Drizzle repository + DB errors | `src/adapters/db/catalog-repository/drizzle-service-repository.ts`, `pg-error.ts` | `pgCode(error)` reads `code`, also nested in `cause` (`23505`, `23503`) |
| Tenant schema helpers | `src/adapters/db/schema/_conventions/tenant.ts` | `idColumn`, `workspaceIdColumn`, `auditColumns`, `tenantKey` |
| List page + loading | `src/app/(owner)/w/[workspaceId]/services/{page,loading}.tsx` | the page awaits `params`, loads through the flow, renders the screen with the actions as props |
| Section tabs in the shell | `src/features/workspace/ui/owner-nav/owner-nav.tsx` › `resolveServicesHeading` | `PageHeading` `{ title, subtitle, tabs: { label, tabs: TabLink[] } }`; copy in `owner-nav.copy.ts` (`servicesTabsLabel`) |
| Coming-soon list | `src/features/workspace/domain/coming-soon-sections/coming-soon-sections.ts` | remove `"clients"` (Slice 1) |
| Desktop page actions | `src/ui/patterns/page-actions/page-actions.tsx` | `<PageActions>` portals into the Page Header actions |
| Toasts | `src/features/booking/ui/use-catalog-mutations/use-catalog-mutations.ts` | `showToast({ tone, title, body?, action? })` from `@/ui/patterns/toast/toast`; the danger toast's action `{ label: retry, onAction: () => void run(mutation) }` repeats the call |
| Desktop vs phone tree | `src/ui/hooks/use-mobile-viewport/use-mobile-viewport.ts` | `useMobileViewport()` picks one tree; tests mock it (`service-item-dialog.test.tsx`) |
| Dialog with form, desktop + phone | `src/features/booking/ui/service-item-dialog/service-item-dialog.tsx` | Modal on desktop, Bottom Sheet/Form on phones, RHF + `zodResolver` |
| Row actions + delete dialog | `src/features/gallery/ui/source-row-actions/`, `src/features/gallery/ui/delete-source-dialog/` | Menu on desktop, Bottom Sheet/Actions on phones; delete with pending and blocked states |
| Field label | `src/ui/primitives/text-field/text-field.tsx`, `src/ui/patterns/select/select.tsx`, `src/ui/primitives/textarea/textarea.tsx` | today `label` is required and always rendered (`Textarea` can hide it with `isLabelHidden`, used once in `template-editor-screen.tsx`). `Select` also uses `label` as the ListBox `aria-label` and the phone sheet title. Slice 1 makes `label` optional on all three |
| Fakes for use-case tests | `tests/support/booking/fake-category-repository.ts` | a class with public `rows`, implementing the port in memory |
| Integration seeding | `tests/integration/booking/catalog-repositories.test.ts` › `seedWorkspace` | `openTestDb()` from `tests/integration/helpers/test-db.ts`, a unique user + workspace per test |
| E2E setup + axe | `tests/e2e/catalog/catalog.spec.ts` | `registerAndVerify` / `uniqueEmail` from `tests/e2e/auth/auth-e2e.ts`, `createWorkspace`, `expectCatalogA11y` (wait until `[data-entering], [data-exiting]` count is 0) |

**What the shared units can't do yet** (each becomes an *extend* row in Slice 0 and a step below):
- `Input`: `InputIconName` has no `"x"` (Slice 5).
- `Icon`: no `message-circle` (Slice 3). `users`, `archive`, `archive-restore`, `search-x`, `pencil`, `trash-2`, `x`, `loading-03`, `more-horizontal` exist.
- `TextField`, `Select`, `Textarea`: `label` is required and always rendered; the social row needs fields with no visible label (Slice 1).
- `ListCardItem`: `icon` is required; no avatar leading (Slice 1).
- `MenuItem`: no `href`; `onSelect` is required (Slice 3).
- `SheetItem`: `isDisabled` exists; no `href` (Slice 3) and no `isPending` (Slice 4).
- `AppShell`: one `subtitle` for both trees; no `mobileSubtitle` (Slice 1).
- `PageHeading` (owner-nav): no `mobileSubtitle` (Slice 1).
- Already enough: `Avatar` (`initials`, `size`), `CountBadge` (`count`), `EmptyState` (`icon`, `iconTone`, `title`, `body`, `placement`, `action`), `SegmentedControl` (`isFullWidth`), `Modal` (`size`, `isDestructive`, `actions`), `BottomSheet` (`variant`, `meta`, `description`, `actions`), `Button` (`isPending`, icons `plus`, `archive`, `archive-restore`, `trash-2`, `pencil`), `IconButton`, `Alert` (`tone="danger"`), `SectionCard` (`content="flush"`, `actions`).

## Shared contracts

Each slice creates the types it needs, with exactly these shapes. Exported types go in sibling `.types.ts` files (coding rules). IDs are uuid strings; numbers are digit strings.

```ts
// application/ports/client-repository/client-repository.port.ts (Slice 1; update in 2, setArchived in 3, delete in 4)
import "server-only";

import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";
import type { ClientSearch } from "@/features/booking/domain/client-search/client-search.types";
import type { SocialLink } from "@/features/booking/domain/social-link/social-link.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ClientFields } from "../../schemas/client-input/client-input.types";

export interface ClientRecord {
  readonly id: string;
  readonly name: string;
  readonly whatsappNumber: string | null;
  readonly socialLinks: readonly SocialLink[];
  readonly isArchived: boolean;
}

export interface ClientPageQuery {
  readonly status: ClientStatus;
  readonly search: ClientSearch | null;
  /** Keyset cursor: the last row already shown; null for the first page (D-4). */
  readonly afterId: string | null;
  readonly limit: number;
}

export interface ClientChange extends ClientFields {
  readonly editorUserId: string;
}

export interface NumberHolder {
  readonly name: string;
  readonly isArchived: boolean;
}

export type NumberTaken = { readonly status: "NUMBER_TAKEN"; readonly holder: NumberHolder };

export interface ArchiveChange {
  readonly id: string;
  readonly isArchived: boolean;
  readonly editorUserId: string;
}

// Every call is scoped by the verified workspace (C-101).
export interface ClientRepositoryPort {
  readonly listPage: (context: WorkspaceContext, query: ClientPageQuery) => Promise<readonly ClientRecord[]>;
  readonly count: (context: WorkspaceContext, status: ClientStatus) => Promise<number>;
  readonly create: (context: WorkspaceContext, change: ClientChange) => Promise<{ readonly status: "CREATED" } | NumberTaken>;
  readonly update: (context: WorkspaceContext, id: string, change: ClientChange) => Promise<"UPDATED" | "NOT_FOUND" | NumberTaken>;
  readonly setArchived: (context: WorkspaceContext, change: ArchiveChange) => Promise<boolean>;
  readonly delete: (context: WorkspaceContext, id: string) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
}
```

```ts
// application/use-cases/client-results/client-results.types.ts (Slice 1)
import type { ClientRecord, NumberHolder } from "../../ports/client-repository/client-repository.port";

import type { CLIENT_FIELD_ERROR_KEYS } from "./client-results";

// client-results.ts: export const CLIENT_FIELD_ERROR_KEYS =
//   ["EMPTY", "TOO_LONG", "INVALID", "TAKEN", "INVALID_URL", "DUPLICATE", "UNKNOWN_PLATFORM", "TOO_MANY"] as const;
export type ClientFieldErrorKey = (typeof CLIENT_FIELD_ERROR_KEYS)[number];
export interface ClientValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  /** Keyed by field path: `name`, `whatsappNumber`, `socialLinks`, `socialLinks.N.value`, `socialLinks.N.platform`. */
  readonly fieldErrors: Readonly<Partial<Record<string, ClientFieldErrorKey>>>;
  readonly numberHolder?: NumberHolder;
}
export type ClientWriteResult = { readonly ok: true } | ClientValidationFailure;
export type DeleteClientResult = { readonly ok: true } | { readonly ok: false; readonly code: "IN_USE" };
export interface ClientPage {
  readonly items: readonly ClientRecord[];
  readonly nextCursor: string | null;
}
```

**Field error copy** (`ui/client-field-error/client-field-error.ts`, `clientFieldErrorText(key, holder?)`):

| Path | Key | Copy |
|---|---|---|
| `name` | `EMPTY` | *Isi nama klien.* |
| `name` | `TOO_LONG` | *Nama klien maksimal 100 karakter.* `// not in Pencil` |
| `whatsappNumber` | `INVALID` | *Nomor WhatsApp tidak valid* |
| `whatsappNumber` | `TAKEN` | *Nomor ini sudah dipakai {name}*; archived holder: *Nomor ini sudah dipakai {name} (diarsipkan)* |
| `socialLinks.N.value` | `DUPLICATE` | *Akun ini sudah ada di daftar.* |
| `socialLinks.N.value` | `TOO_LONG` | *Maksimal 200 karakter.* `// not in Pencil` |
| `socialLinks.N.value` | `INVALID_URL` | *Tautan harus diawali https://* `// not in Pencil` |
| `socialLinks.N.value` | `EMPTY` | *Isi akun atau tautan.* `// not in Pencil` (only a bare `@` reaches it) |
| `socialLinks.N.platform` | `UNKNOWN_PLATFORM` | *Pilih platform dari daftar.* `// not in Pencil` (form bypassed only) |
| `socialLinks` | `TOO_MANY` | *Maksimal 10 media sosial.* `// not in Pencil` (form bypassed only) |
| any | `INVALID` (unknown key) | *Isian ini tidak valid.* `// not in Pencil` |

**Platform labels** (`PLATFORM_COPY`, A-2 order): `INSTAGRAM` *Instagram*, `TIKTOK` *TikTok*, `FACEBOOK` *Facebook*, `YOUTUBE` *YouTube*, `X` *X*, `OTHER` *Lainnya*.

**Toasts** (`useClientMutations`):

| Event | Tone | Title / body | Action |
|---|---|---|---|
| added | success | *Klien ditambahkan* / *{name} siap dipilih saat membuat proyek.* | — |
| saved | success | *Perubahan disimpan* | — |
| archived | success | *Klien diarsipkan* / *{name} pindah ke Arsip.* | *Batalkan* → restore |
| restored | success | *Klien dipulihkan* | — |
| deleted | success | *Klien dihapus* | — |
| any throw | danger | *Perubahan belum tersimpan* / *Terjadi kendala di server. Data klienmu tidak berubah.* | *Coba lagi* → the same call |

**Row menu items** (desktop Menu and phone sheet, in this order):

| Item | Icon | Shown when | Does |
|---|---|---|---|
| *Ubah* | `pencil` | always | opens the edit dialog |
| *Buka WhatsApp* | `message-circle` | the client has a number | link `https://wa.me/<digits>`, `target="_blank"`, `rel="noopener noreferrer"` |
| *Arsipkan* | `archive` | *Aktif* tab | archives at once, toast with *Batalkan* |
| *Pulihkan* | `archive-restore` | *Arsip* tab | restores, toast |
| divider (desktop only) | | | |
| *Hapus* | `trash-2` | always | opens the delete confirm (destructive) |

## Test fixtures

`tests/support/booking/client-fixtures.ts` (Slice 1) builds the AC shared fixture on `FakeClientRepository`. Integration tests build the same data with Drizzle inserts. Use these exact values everywhere:
- **AC-CLI-001 workspace:**
  - *Rina*: active, `6281234567890`, links `[{ INSTAGRAM, "rina.wed" }, { TIKTOK, "rina" }]`;
  - *ade*: active, no number, no links;
  - *Budi*: archived, `6289876543210`, links `[{ INSTAGRAM, "budi.foto" }]`.
  - The *Aktif* order is *ade*, *Rina* (lower-case name order); *Arsip* has *Budi*.
- **AC-CLI-005 / 021 workspaces:** 65 active clients named `Klien 001`…`Klien 065`; and 38 active (including *Rina*) + 1 archived.
- **AC-CLI-006 input:** name `"  Rina Wedding "`, number `"0812-3456-7890"`, rows `[{ INSTAGRAM, "@rina.wed" }, { TIKTOK, "https://www.tiktok.com/@rina" }]` → stored `"Rina Wedding"`, `"6281234567890"`, `[{ INSTAGRAM, "rina.wed" }, { TIKTOK, "https://www.tiktok.com/@rina" }]`.
- **Stories and fidelity** use the export rows instead: *Ade Kurnia* (no number, `—`), *Anisa Putri* `6281322004512` Instagram `anisaputri`, *Bayu & Laras* `6285711239087` TikTok `https://www.tiktok.com/@bayularas`, *Dimas & Sari* `6281177882301` Instagram `dimassari.wed` + 2 more, *Keluarga Wijaya* `6282144550098` no links, *Maya Nugroho* `14155550100` Instagram `mayanug`, *Rina* `6281234567890` Instagram `rina.wed` + 1 more, *Rizky & Tania* `6287890123344` Facebook `https://facebook.com/rizkytania`; count *38 klien aktif*.

## AC index

| AC | Slice.step |
|---|---|
| 001 | 1.3, 1.9, 1.10, 6.1 |
| 002 | 1.6, 1.10, 3.3 |
| 003 | 1.10, 6.1 |
| 004 | 1.3, 1.6, 5.1, 6.1 |
| 005 | 1.4, 1.6, 5.2 |
| 006, 007 | 1.3, 1.4, 1.6, 1.11, 6.1 |
| 008, 009 | 1.3, 1.4, 2.3 |
| 010 | 2.1, 2.3, 6.1 |
| 011 | 1.3, 1.4, 2.3 |
| 012 | 2.2, 2.4, 6.1 |
| 013 | 3.2, 3.3, 6.1 |
| 014 | 4.1, 4.3, 6.1 |
| 015 | 4.1, 4.3 |
| 016 | 1.3, 3.1, 3.3, 6.1 |
| 017 | 1.11, 3.3, 4.3, 5.2 |
| 018 | 1.4, 1.6, 1.7, 2.1, 2.2, 3.2, 4.1, 6.1 |
| 019 | 1.7 |
| 020 | 2.3, 6.2 |
| 021 | 1.4, 1.6, 1.10, 3.3, 6.1 |

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

Screens: none. This slice checks the base and inventories the components for S1–S1c.

- [ ] **0.1 Check that F-05 is in this branch.** All of these must hold:
  - `src/ui/patterns/tabs/tabs.tsx`, `src/ui/patterns/select/select.tsx` and `src/adapters/db/catalog-repository/pg-error.ts` exist;
  - `drizzle/0007_item_definition_backfill.sql` exists and no `drizzle/0008_*` exists;
  - `pnpm tokens:check` reports 597 tokens;
  - `pnpm typecheck && pnpm lint && pnpm test` pass.

  If any is missing, **STOP** and report: *F-05 must be on `main` and merged into `feat/clients` first.* Change nothing.
- [ ] **0.2 Sync.** If `main` moved, use the ccd_host `sync_with_base_branch` tool (or `git merge main` outside an app worktree).
  - Keep both features' text in `docs/HANDOFF.md` and `docs/product/feature-map.md`.
  - Keep this branch's `clients.pen`, `exports/` and `design-system.lib.pen`.
  - Commit the merge if there was one.
- [ ] **0.3 Component inventory.** Write `docs/features/clients/component-inventory.md` with the columns *Component · Spec · Status (exists / extend / new) · Path · Needed change · First used in*.
  - **Fill each row by reading the code, not by memory:** open the file, and for *extend* name the exact prop to add.
  - **Rows, at least:** Table → `DataTable` (new), Tabs / Page Header tabs, SegmentedControl, Input search, TextField, Select, IconButton, Button (pending), Avatar, CountBadge, ListCardItem (+ skeleton), SectionCard, EmptyState, Menu / MenuItem / MenuTrigger, SheetItem, Modal, BottomSheet, Alert, Toast, PageActions, AppShell / MobileHeader, Icon.
  - **Expected results** (confirm them): the list in *Existing code to follow* › *What the shared units can't do yet*.
  - Commit `docs(clients): inventory reusable components for f-06`.

**Done check:** the gate passes on the synced branch, and the inventory is committed with no empty cells.

---

## Slice 1: *Klien* list and add a client

This slice builds the whole page skeleton and the main path: open *Klien*, see the active list (or its empty state) with the count, switch to *Arsip*, add a client, and see it in the list.

**Requires:** Slice 0.

### Screen overview

| | |
|---|---|
| Screens | S1 (populated, empty, empty archived, loading), S1b (add: default, saving) |
| Route | `/w/[workspaceId]/clients` and `/w/[workspaceId]/clients/archived`: top-level section pages with the full shell (Bottom Nav shown on phones) |
| ACs | AC-CLI-001, 003, 006, 007, 021 (count after add); 002 (list by status); 004, 005 (backend only); 008, 009, 011 (domain + schema); 017 (add); 018, 019 (backend) |
| Out of this slice | the row ⋯ (Slice 3: the actions cell and the phone trailing slot stay empty), server field errors and edit (Slice 2), delete (Slice 4), the search field and *Muat lebih banyak* (Slice 5: the toolbar has no search yet, and the footer is hidden). The backend for search and paging is complete here. |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Populated | `list-populated-desktop-UiKLP` | `list-populated-mobile-M4s8Ln` | Desktop: DataTable card; toolbar *Daftar klien* / *38 klien aktif* (search on the right is Slice 5); headers *KLIEN* · *WHATSAPP* · *MEDIA SOSIAL* · (actions, hidden label); rows: Avatar initials + name, the formatted number or *Belum ada nomor WhatsApp* (`text.muted`), `Instagram · @anisaputri` or `TikTok · tiktok.com/@bayularas` (first link only) followed by CountBadge *+2* / *+1* when there are more, or `—` (`text.muted`). Phone: Segmented Control *Aktif* / *Arsip*, search (Slice 5), Section Card *Daftar klien* / *38 klien aktif* with *Tambah*; List Card Item/Two-line rows: Avatar MD initials, name, meta = the number only (no social links on phones) |
| Empty *Aktif* | `list-empty-desktop-VRacP` | `list-empty-mobile-onzhv` | Toolbar / card subtitle *0 klien aktif*; Empty State (tinted box, accent icon `users`) *Belum ada klien* · *Tambahkan orang yang memesan sesi foto, lalu pilih mereka saat membuat proyek.*; the phone adds the button *Tambah klien*. No header row, no footer |
| Empty *Arsip* | `list-empty-archived-desktop-kdPPO` | `list-empty-archived-mobile-t6bMn` | *0 klien diarsipkan*; Empty State `archive` *Belum ada klien yang diarsipkan* · *Klien yang kamu arsipkan muncul di sini dan bisa dipulihkan kapan saja.*; *Arsip* tab active |
| Loading | `list-loading-desktop-GBPbh` | `list-loading-mobile-DP344` | Desktop: the table card with header and five skeleton rows, no subtitle. Phone: five List Card Item skeleton rows, no description |
| Add / default | `add-default-desktop-L4hww4` | `add-default-mobile-JQzjy` | Modal MD / full-height Bottom Sheet/Form *Tambah klien* · *Klien bisa dipilih saat membuat proyek.* · *Nama klien* (placeholder *mis. Rina & Dimas*) · *Nomor WhatsApp* *(opsional)* (placeholder *0812 3456 7890*, helper *Contoh: 0812 3456 7890. Nomor luar negeri diawali + dan kode negara.*) · *Media sosial* *(opsional)* with one row: Select *Instagram* + value (placeholder per breakpoint) + Icon Button Ghost `x` · Button Secondary *Tambah media sosial* · actions *Batal* / *Tambah klien* (phone: the confirm only, pinned) |
| Add / saving | `add-saving-desktop-UBslj` | `add-saving-mobile-mb5al` | Values *Rina Wedding*, `0812-7788-9900`, Instagram `@rinawedding` (desktop also TikTok `https://www.tiktok.com/@rina`); confirm pending *Menyimpan…*; *Batal* disabled |
| Toast / added | `toast-added-desktop-PdmEI` | `toast-added-mobile-mERwg` | Toast/Success *Klien ditambahkan* · *Rina Wedding siap dipilih saat membuat proyek.*; the list shows *Rina Wedding* after *Rina*, *39 klien aktif* |
| Toast / server error | `toast-server-error-desktop-d0WR8o` | `toast-server-error-mobile-o5ktK6` | Toast/Danger *Perubahan belum tersimpan* · *Terjadi kendala di server. Data klienmu tidak berubah.* · *Coba lagi*; the dialog keeps its input |

Page heading (desktop): breadcrumb *Aster Wedding › Klien*, title *Klien* on both tabs (TD-A-3), subtitle per breakpoint, tabs *Aktif · Arsip* (label *Status klien* `// not in Pencil`).

### Backend

| File | Content |
|---|---|
| `domain/{client-name,whatsapp-number,social-link,client-search,client-list}/*` | Rule code below |
| `application/ports/client-repository/client-repository.port.ts` | Shared contracts › port: `listPage`, `count`, `create` (the other three arrive in Slices 2–4) |
| `application/schemas/client-input/*`, `client-id/*`, `client-list-query/*` | Rule code below; `client-schemas.test.ts` |
| `application/errors/client-errors/*` | `ClientError extends DomainError`, `ClientErrorCode = "NOT_FOUND" \| "SAVE_FAILED"`, the same shape as `CatalogError` |
| `application/use-cases/client-results/*` | Shared contracts › results; `client-results.ts` (server-only): `validationFailure(issues)` and `numberTaken(holder)`, below |
| `application/use-cases/list-clients/*` | `listClients(repository, context, query: ClientListQuery): Promise<ClientPage>`: `search = clientSearchSchema.safeParse(query.q).data ?? null`; asks for `limit = CLIENT_PAGE_SIZE + 1`; returns the first 30 and `nextCursor` = the 30th row's `id` (`rows.at(CLIENT_PAGE_SIZE - 1)?.id`, no `!`) when more than 30 came back, else `null` |
| `application/use-cases/count-clients/*` | `countClients(repository, context, status): Promise<number>` |
| `application/use-cases/add-client/*` | `addClient(repository, context, editorUserId, input: unknown): Promise<ClientWriteResult>`: `clientInputSchema.safeParse(input)`; failure → `validationFailure(error.issues)`; else `create(context, { ...data, editorUserId })`; `NUMBER_TAKEN` → `numberTaken(holder)` (the repository returns it from Slice 2); `CREATED` → `{ ok: true }` |
| `adapters/db/schema/booking/client.ts` | Rule code below; `export * from "./booking/client";` in `schema/index.ts` (match the existing lines) |
| `adapters/db/client-repository/drizzle-client-repository.ts` | `createDrizzleClientRepository(db: DbExecutor): ClientRepositoryPort` with `listPage`, `count`, `create`, below |
| `composition/booking/client-scope/*` | `withClientScope(work)` = `withRequestDb((db) => work({ clients: createDrizzleClientRepository(db) }))` |
| `composition/booking/client-flow/*` | `loadClients(rawWorkspaceId, status, rawQ?: string): Promise<ClientsData>` → `{ status, q, page, count }`; an invalid or over-long `rawQ` becomes `""` (TD-A-1); `listClients` and `countClients` run in one scope. `addWorkspaceClient(rawWorkspaceId, values: unknown)` resolves the editor with `requireOwnerOrRedirect()` (`account.id`). Both go through `saveError(error, { workspaceId, clientId?, operation })` → `client.save_failed` |
| `app/actions/booking/clients.ts` | `const PAGE = "/w/[workspaceId]/clients"`; `addClientAction(workspaceId, values: unknown)`: `revalidatePath(PAGE, "layout")` on success; returns `undefined` or the `ClientValidationFailure` |
| `app/(owner)/w/[workspaceId]/clients/page.tsx`, `archived/page.tsx` | await `params` and `searchParams` (`q`); `loadClients(workspaceId, "ACTIVE" \| "ARCHIVED", q)`; render `ClientsScreen` with the data and the actions |
| `…/clients/loading.tsx`, `archived/loading.tsx` | render `ClientsSkeleton` |

### Rule code

**Domain** (Zod schemas, as in `workspace/domain`; each schema normalises and validates, and its issue message is the field-error key). Each exported schema and function gets JSDoc naming its rule.

```ts
// client-name/client-name.schema.ts
import { z } from "zod";

/** BR-CLI-001: a client name is 1–100 characters after trimming; names are not unique. */
export const CLIENT_NAME_MAX_LENGTH = 100;

const fitsNameLength = (name: string) => [...name].length <= CLIENT_NAME_MAX_LENGTH;

/** BR-CLI-001: the trimmed name, counted in code points so emoji count once. */
export const clientNameSchema = z
  .string()
  .trim()
  .min(1, { error: "EMPTY" })
  .refine(fitsNameLength, { error: "TOO_LONG" });
```

```ts
// whatsapp-number/whatsapp-number.types.ts
import type { z } from "zod";

import type { whatsappNumberSchema } from "./whatsapp-number.schema";

export type WhatsappNumber = z.output<typeof whatsappNumberSchema>;

// whatsapp-number/whatsapp-number.schema.ts
import { z } from "zod";

/** BR-CLI-002: the separators removed before anything else. */
export const WHATSAPP_SEPARATORS = /[\s\-.()]/g;
/** BR-CLI-002: 10–15 digits with the country code, no leading 0, no 0 right after 62. The DB check repeats it. */
export const WHATSAPP_NUMBER_PATTERN = /^(?!620)[1-9]\d{9,14}$/;

const stripSeparators = (raw: string) => raw.replace(WHATSAPP_SEPARATORS, "");

/**
 * Applies only the first matching prefix step of BR-CLI-002.
 * @param value - the number without separators
 * @returns the number with its country code
 */
function applyPrefixStep(value: string): string {
  if (value.startsWith("+")) return value.slice(1);
  if (value.startsWith("0")) return `62${value.slice(1)}`;
  if (value.startsWith("8")) return `62${value}`;
  return value;
}

/** BR-CLI-002: a typed number, normalised to the stored digits, or the issue `INVALID`. */
export const whatsappNumberSchema = z
  .string()
  .transform((raw) => applyPrefixStep(stripSeparators(raw)))
  .pipe(z.string().regex(WHATSAPP_NUMBER_PATTERN, { error: "INVALID" }).brand<"WhatsappNumber">());

/** BR-CLI-002: the form field, where a blank (after removing separators) means no number. */
export const optionalWhatsappNumberSchema = z
  .string()
  .transform((raw) => (stripSeparators(raw) === "" ? null : raw))
  .pipe(whatsappNumberSchema.nullable());

// whatsapp-number/whatsapp-number.ts
const INDONESIA = "62";

/**
 * Shows a stored number as `+62 812-3456-7890` for Indonesia and `+<digits>` otherwise (A-7).
 * @param digits - the stored number
 * @returns the display form, which whatsappNumberSchema parses back to the same digits
 */
export function formatWhatsappNumber(digits: string): string {
  if (!digits.startsWith(INDONESIA)) return `+${digits}`;
  const rest = digits.slice(INDONESIA.length);
  const groups = [rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter((group) => group.length > 0);
  return `+${INDONESIA} ${groups.join("-")}`;
}

/**
 * Builds the plain WhatsApp chat link for a stored number, with no prefilled text (A-6, ADR-006).
 * @param digits - the stored number
 * @returns the `wa.me` URL
 */
export function whatsappChatUrl(digits: string): string {
  return `https://wa.me/${digits}`;
}
```

```ts
// social-link/social-link.types.ts
import type { z } from "zod";

import type { socialLinkSchema, socialPlatformSchema } from "./social-link.schema";

export type SocialPlatform = z.output<typeof socialPlatformSchema>;
export type SocialLink = z.output<typeof socialLinkSchema>;

// social-link/social-link.ts
import type { SocialLink } from "./social-link.types";

/** A-2: platforms in display order. */
export const SOCIAL_PLATFORMS = ["INSTAGRAM", "TIKTOK", "FACEBOOK", "YOUTUBE", "X", "OTHER"] as const;
const HTTPS = /^https:\/\//i;
const URL_PREFIX = /^https:\/\/(www\.)?/i;

/** @param value - a social value @returns whether it is an https URL rather than a handle */
export function isSocialUrl(value: string): boolean {
  return HTTPS.test(value.trim());
}

/**
 * Stores a handle without its leading `@` and keeps URLs as typed (BR-CLI-001).
 * @param raw - the value as typed
 * @returns the stored value
 */
export function normaliseSocialValue(raw: string): string {
  const value = raw.trim();
  return isSocialUrl(value) ? value : value.replace(/^@/, "");
}

/**
 * Labels a link for lists: `@handle`, or the URL without `https://` and `www.`.
 * @param link - a stored link
 * @returns the label
 */
export function socialLinkLabel(link: SocialLink): string {
  return isSocialUrl(link.value) ? link.value.replace(URL_PREFIX, "") : `@${link.value}`;
}

// social-link/social-link.schema.ts
import { z } from "zod";

import { isSocialUrl, normaliseSocialValue, SOCIAL_PLATFORMS } from "./social-link";

/** BR-CLI-001: at most ten links, each value 1–200 characters. */
export const SOCIAL_LINK_MAX_COUNT = 10;
export const SOCIAL_VALUE_MAX_LENGTH = 200;
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

const isHandleOrHttps = (value: string) => isSocialUrl(value) || !ANY_SCHEME.test(value);
const fitsValueLength = (value: string) => [...value].length <= SOCIAL_VALUE_MAX_LENGTH;

/** BR-CLI-001: a handle (stored without `@`) or an https URL, 1–200 characters. */
export const socialValueSchema = z
  .string()
  .transform(normaliseSocialValue)
  .pipe(
    z
      .string()
      .min(1, { error: "EMPTY" })
      .refine(isHandleOrHttps, { error: "INVALID_URL" })
      .refine(fitsValueLength, { error: "TOO_LONG" }),
  );

/** A-2: one of the six platforms. */
export const socialPlatformSchema = z.enum(SOCIAL_PLATFORMS, { error: "UNKNOWN_PLATFORM" });

/** One stored link. */
export const socialLinkSchema = z.object({ platform: socialPlatformSchema, value: socialValueSchema });

/** BR-CLI-001: the stored links; it also validates the JSONB column on read (D-2). */
export const socialLinksSchema = z.array(socialLinkSchema).max(SOCIAL_LINK_MAX_COUNT, { error: "TOO_MANY" });

/** A form row. A blank value is a row the Owner left empty, and it is dropped. */
const socialLinkRowSchema = z.object({
  platform: socialPlatformSchema,
  value: z
    .string()
    .transform((raw) => (raw.trim() === "" ? null : raw))
    .pipe(socialValueSchema.nullable()),
});

type SocialLinkRow = z.output<typeof socialLinkRowSchema>;

/**
 * Flags each later row that repeats an earlier row's platform and value (BR-CLI-001). Values are
 * already normalised, so the comparison ignores `@` and case only.
 * @param rows - the parsed rows in the Owner's order
 * @param context - the refinement context that receives the issues
 */
function addDuplicateIssues(rows: readonly SocialLinkRow[], context: z.RefinementCtx): void {
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    if (row.value === null) continue;
    const key = `${row.platform}|${row.value.toLowerCase()}`;
    if (seen.has(key)) context.addIssue({ code: "custom", path: [index, "value"], message: "DUPLICATE" });
    else seen.add(key);
  }
}

const dropBlankRows = (rows: readonly SocialLinkRow[]) =>
  rows.flatMap((row) => (row.value === null ? [] : [{ platform: row.platform, value: row.value }]));

/** BR-CLI-001: the form's rows, at most ten, no duplicates, blank rows dropped, order kept. */
export const socialLinkRowsSchema = z
  .array(socialLinkRowSchema)
  .max(SOCIAL_LINK_MAX_COUNT, { error: "TOO_MANY" })
  .superRefine(addDuplicateIssues)
  .transform(dropBlankRows);
```

Zod skips a refinement while the array already has issues, so a duplicate is reported only once every row parses. The dialog shows row errors first, then duplicates; the tests cover them separately.

```ts
// client-search/client-search.types.ts
import type { z } from "zod";

import type { clientSearchSchema } from "./client-search.schema";

export type ClientSearch = z.output<typeof clientSearchSchema>;

// client-search/client-search.schema.ts
import { z } from "zod";

import { WHATSAPP_SEPARATORS } from "../whatsapp-number/whatsapp-number.schema";

/** TD-A-1: longer queries are ignored. */
export const CLIENT_SEARCH_MAX_LENGTH = 100;
const NUMBER_LIKE = /^\+?\d+$/;

/**
 * Reads the digits of a number-like query with BR-CLI-002's leading-0 step, so `0812…` matches `62812…` (A-4, D-7).
 * @param text - the trimmed query
 * @returns the digits, or null when the query is not number-like
 */
function searchDigits(text: string): string | null {
  const stripped = text.replace(WHATSAPP_SEPARATORS, "");
  if (!NUMBER_LIKE.test(stripped)) return null;
  const digits = stripped.replace(/^\+/, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

/** A-4: a search over names (text) and numbers (digits); blank or over-long queries fail and the list is unfiltered. */
export const clientSearchSchema = z
  .string()
  .trim()
  .min(1)
  .max(CLIENT_SEARCH_MAX_LENGTH)
  .transform((text) => ({ text, digits: searchDigits(text) }));
```

```ts
// client-list/client-list.ts
/** BR-CLI-003: the list shows active or archived clients. */
export const CLIENT_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
/** A-5: clients load 30 at a time. */
export const CLIENT_PAGE_SIZE = 30;

// client-list/client-list.schema.ts
import { z } from "zod";

import { CLIENT_STATUSES } from "./client-list";

/** BR-CLI-003: an untrusted list status. */
export const clientStatusSchema = z.enum(CLIENT_STATUSES);

// client-list/client-list.types.ts
import type { z } from "zod";

import type { clientStatusSchema } from "./client-list.schema";

export type ClientStatus = z.output<typeof clientStatusSchema>;
```

**Application schemas** (`*.schema.ts`, no `server-only`; they compose the domain schemas and add no rules):

```ts
// client-input/client-input.schema.ts — shared by the dialog (zodResolver) and the use cases
import { z } from "zod";

import { clientNameSchema } from "@/features/booking/domain/client-name/client-name.schema";
import { socialLinkRowsSchema } from "@/features/booking/domain/social-link/social-link.schema";
import { optionalWhatsappNumberSchema } from "@/features/booking/domain/whatsapp-number/whatsapp-number.schema";

export const clientInputSchema = z.object({
  name: clientNameSchema,
  whatsappNumber: optionalWhatsappNumberSchema,
  socialLinks: socialLinkRowsSchema,
});

// client-input/client-input.types.ts
import type { z } from "zod";

import type { clientInputSchema } from "./client-input.schema";

/** The form values: raw strings, social rows in the Owner's order. */
export type ClientInput = z.input<typeof clientInputSchema>;
/** The stored fields: trimmed name, WhatsappNumber or null, links without blank rows. */
export type ClientFields = z.output<typeof clientInputSchema>;
```

```ts
// client-id/client-id.schema.ts
import { z } from "zod";

export const clientIdSchema = z.uuid();
```

```ts
// client-list-query/client-list-query.schema.ts
import { z } from "zod";

import { clientStatusSchema } from "@/features/booking/domain/client-list/client-list.schema";

// q is not length-checked here: an over-long query lists unfiltered (TD-A-1), the same as the first page.
export const clientListQuerySchema = z.object({
  status: clientStatusSchema,
  q: z.string().default(""),
  afterId: z.uuid().nullable().default(null),
});
```

**Results helpers** (`client-results.ts`, server-only):
- `CLIENT_FIELD_ERROR_KEYS = ["EMPTY", "TOO_LONG", "INVALID", "TAKEN", "INVALID_URL", "DUPLICATE", "UNKNOWN_PLATFORM", "TOO_MANY"] as const`.
- `validationFailure(issues)`: every issue becomes `fieldErrors[issue.path.join(".")]`, reading the message with `z.enum(CLIENT_FIELD_ERROR_KEYS).catch("INVALID")`. Zod's own messages (a wrong type from a bypassed form) are not keys and become `INVALID`. The first issue per path wins.
- `numberTaken(holder)` → `{ ok: false, code: "VALIDATION_FAILED", fieldErrors: { whatsappNumber: "TAKEN" }, numberHolder: holder }`.

**Table** (`adapters/db/schema/booking/client.ts`, BR-CLI-001…003, ADR-003, D-2):

```ts
import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-06 clients (BR-CLI-001…003, ADR-003). Social links are a Zod-validated JSONB array (TD D-2).
export const client = pgTable(
  "client",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    whatsappNumber: text("whatsapp_number"),
    socialLinks: jsonb("social_links").notNull().default(sql`'[]'::jsonb`),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("client_workspace_whatsapp_uq").on(t.workspaceId, t.whatsappNumber),
    index("client_workspace_list_idx").on(t.workspaceId, sql`lower(${t.name})`, t.createdAt, t.id),
    check("client_name_ck", sql`char_length(${t.name}) between 1 and 100 and ${t.name} = btrim(${t.name})`),
    check(
      "client_whatsapp_number_ck",
      sql`${t.whatsappNumber} is null or (${t.whatsappNumber} ~ '^[1-9][0-9]{9,14}$' and ${t.whatsappNumber} !~ '^620')`,
    ),
    check(
      "client_social_links_ck",
      sql`jsonb_typeof(${t.socialLinks}) = 'array' and jsonb_array_length(${t.socialLinks}) <= 10`,
    ),
  ],
);
```

**Repository** (`drizzle-client-repository.ts`):
- **Columns:** select `id, name, whatsappNumber, socialLinks, archivedAt`. Map to `ClientRecord` with `isArchived: archivedAt !== null` and `socialLinks: socialLinksSchema.parse(row.socialLinks)` (a malformed row throws: it is a bug).
- **Status:** `ACTIVE` → `isNull(client.archivedAt)`, `ARCHIVED` → `isNotNull(client.archivedAt)`.
- **Search (D-7):**

```ts
const LIKE_SPECIAL = /[\\%_]/g;
const escapeLike = (value: string) => value.replace(LIKE_SPECIAL, (character) => `\\${character}`);

function searchCondition(search: ClientSearch | null): SQL | undefined {
  if (!search) return undefined;
  const nameMatch = sql`${client.name} ilike ${`%${escapeLike(search.text)}%`} escape '\\'`;
  return search.digits ? or(nameMatch, like(client.whatsappNumber, `%${search.digits}%`)) : nameMatch;
}
```

- **Keyset (D-4):** the cursor row is read inside the same workspace, so a foreign or deleted ID yields no rows:

```ts
function afterCondition(context: WorkspaceContext, afterId: string | null): SQL | undefined {
  if (!afterId) return undefined;
  return sql`(lower(${client.name}), ${client.createdAt}, ${client.id}) > (
    select lower(c.name), c.created_at, c.id from client c
    where c.workspace_id = ${context.workspaceId} and c.id = ${afterId}
  )`;
}
```

  Order by `sql\`lower(${client.name})\``, `client.createdAt`, `client.id`, then `.limit(query.limit)`. All conditions are combined with `and(eq(client.workspaceId, context.workspaceId), status, search, after)`.
- **count:** `select count(*)::int` with the workspace and status conditions only (no search, A-10).
- **create:** insert `{ workspaceId, name, whatsappNumber, socialLinks, updatedBy: editorUserId }` → `{ status: "CREATED" }`. (Slice 2 adds the `23505` mapping.)

### Components

- **Reuse (inventory first):**
  - **Optional field labels** on `TextField`, `Select` and `Textarea`. The props take `FieldNameProps` (exported from `text-field.types.ts`) instead of `label: string`:

    ```ts
    /** A field is named by its visible label, or, when no label is drawn, by aria-label. */
    export type FieldNameProps =
      | { readonly label: string; readonly "aria-label"?: never }
      | { readonly label?: never; readonly "aria-label": string };
    ```

    - With `label`: unchanged (the label and the optional marker render as today).
    - Without `label`: no `<Label>` element and no optional marker are rendered, and `aria-label` goes on the React Aria field. `Select` uses `label ?? aria-label` for the ListBox `aria-label` and the phone sheet title. Description and `errorMessage` still render and stay linked (React Aria `Text slot="description"` / `FieldError`).
    - `Textarea` drops `isLabelHidden`; its one caller (`template-editor-screen.tsx`) passes `aria-label={COPY.contentLabel}` instead of `label` + `isLabelHidden`. Every other caller is unchanged.
  - `ListCardItem` gains an avatar leading: `icon?: IconName` becomes optional and `avatarInitials?: string` is added; exactly one is given (a dev-time `throw` when both or neither, covered by a test). The avatar is `Avatar size="md" aria-hidden`. F-04/F-05 rows that pass `icon` are unchanged. Update the story with an *Avatar* variant.
  - `AppShell` gains `mobileSubtitle?: string`; the Mobile Header shows `mobileSubtitle ?? subtitle`.
  - `PageActions`, `SectionCard content="flush"`, `EmptyState`, `Avatar`, `CountBadge`, `SegmentedControl isFullWidth`, `Modal size="md"`, `BottomSheet variant="form"`, `Button`, `IconButton`.
- **New shared:** `DataTable` and `DataTableSkeleton` (C27), below.
- **Feature units:**
  - `CLIENT_COPY` / `PLATFORM_COPY` (`client-copy`): every string in this slice's state table, the toasts and field errors from Shared contracts, `count(status, n)` → *{n} klien aktif* / *{n} klien diarsipkan*;
  - `clientInitials(name)` (`client-initials`): the first letters of the first two words, where a word is a run of letters or digits (so `&` is skipped); one word → its first two letters; upper case;
  - `clientFieldErrorText(key, holder?)` (`client-field-error`): Shared contracts › Field error copy;
  - `ClientsScreen` (`clients-screen`, client component) `{ workspaceId, status, q, page: ClientPage, count, actions: { add } }`: owns the dialog state (`{ kind: "add" } | null` now; edit and delete later); renders `PageActions` with *Tambah klien* (desktop), the 720 column (`max-w-(--size-content-narrow) mx-auto`), and `ClientsTable` or the phone stack;
  - `ClientsTable` (`clients-table`) `{ status, rows, count, emptyState, onRowAction? }`: `DataTable` with columns `name` *KLIEN* (fill), `whatsapp` *WHATSAPP* (184), `social` *MEDIA SOSIAL* (240), `actions` (32, no `label`, `aria-label` *Aksi* `// not in Pencil`); the social cell is `{PLATFORM_COPY[platform]} · {socialLinkLabel(link)}` (`min-w-0 truncate`), an `<a target="_blank" rel="noopener noreferrer">` for URLs (same colour, underline on hover / focus), then `CountBadge count={links.length - 1}` (`shrink-0`, gap `space-1-5`) when there is more than one link;
  - `ClientList` (`client-list`) `{ rows, count, onAdd }`: `SectionCard content="flush"` title *Daftar klien*, description the count, actions *Tambah*; rows `ListCardItem avatarInitials={clientInitials(name)} title={name} meta={number or *Belum ada nomor WhatsApp*}`;
  - `ClientsTabsBar` (`clients-tabs-bar`) `{ workspaceId, status }`: phone only, `SegmentedControl isFullWidth label={OWNER_NAV_COPY.clientsTabsLabel}`; selecting pushes `/w/{id}/clients` or `/w/{id}/clients/archived` (drops `q`);
  - `ClientsEmptyState` (`clients-empty-state`) `{ kind: "ACTIVE" | "ARCHIVED" | "NO_MATCH", onAdd?, onClearSearch? }`: `EmptyState iconTone="accent"`, `users` + *Tambah klien* (phone only) / `archive` / `search-x` + *Hapus pencarian* (Slice 5);
  - `ClientsSkeleton` (`clients-skeleton`): desktop `DataTableSkeleton` (toolbar title only, `CLIENT_SKELETON_ROWS` rows); phone the tabs bar, a search-shaped bar and `ListCardItemSkeleton` × 5;
  - `ClientDialog` (`client-dialog`) `{ mode: "add", isOpen, onOpenChange, onSubmit: (values: ClientInput) => Promise<ClientWriteResult | undefined> }` (edit mode in Slice 2): Modal MD on desktop, full-height `BottomSheet variant="form"` on phones;
  - `SocialLinksEditor` (`social-links-editor`) `{ control, errors }`: `useFieldArray` rows; each row is a `SocialLinkRow` component (no inline handlers): `Select` without `label` (`aria-label`; options `SOCIAL_PLATFORMS` + `PLATFORM_COPY`, width 148 on desktop), `TextField` without `label` (`aria-label`, `placeholder` per breakpoint, `errorMessage` for the row's error), `IconButton` ghost `x`; *Tambah media sosial* appends `{ platform: "INSTAGRAM", value: "" }`;
  - `useClientMutations` (`use-client-mutations`): `run(kind, call)` shows the success toast for `kind`, or the danger toast with *Coba lagi* that repeats `call`.

**DataTable types** (`data-table.types.ts`):

```ts
import type { ReactNode } from "react";

import type { FieldNameProps } from "@/ui/primitives/text-field/text-field.types";

/** A column is named by its header text, or by aria-label when the header is drawn empty (the actions column). */
export type DataTableColumn = FieldNameProps & {
  readonly id: string;
  /** Fixed width in px from the frame; omit for the column that fills the rest. */
  readonly width?: number;
};

export interface DataTableToolbar {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
}

export interface DataTableProps<Row extends { readonly id: string }> {
  readonly label: string;
  readonly toolbar: DataTableToolbar;
  readonly columns: readonly DataTableColumn[];
  readonly rows: readonly Row[];
  readonly renderCell: (row: Row, columnId: string) => ReactNode;
  readonly onRowAction?: (row: Row) => void;
  /** Replaces header and rows when there are no rows (the caller passes an Empty State). */
  readonly emptyState?: ReactNode;
  readonly footer?: ReactNode;
}

export interface DataTableSkeletonProps {
  readonly toolbar: DataTableToolbar;
  readonly columns: readonly DataTableColumn[];
  readonly rowCount: number;
}
```

### Steps

- [ ] **1.1 DataTable pattern (C27).**
  - **Tests first** (`data-table.test.tsx`):

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "./data-table";
import { DataTableSkeleton } from "./data-table-skeleton";

const columns = [
  { id: "name", label: "KLIEN" },
  { id: "phone", label: "WHATSAPP", width: 184 },
  { id: "actions", "aria-label": "Aksi", width: 32 },
] as const;
const rows = [
  { id: "a", name: "Anisa Putri", phone: "+62 813-2200-4512" },
  { id: "b", name: "Rina", phone: "+62 812-3456-7890" },
];

function renderCell(row: (typeof rows)[number], columnId: string) {
  return columnId === "actions" ? null : row[columnId === "name" ? "name" : "phone"];
}

describe("DataTable (C27)", () => {
  it("AC-CLI-001 renders the toolbar, column headers and one row per item", () => {
    render(
      <DataTable
        label="Daftar klien"
        toolbar={{ title: "Daftar klien", subtitle: "38 klien aktif", actions: <input aria-label="Cari" /> }}
        columns={columns}
        rows={rows}
        renderCell={renderCell}
      />,
    );
    const table = screen.getByRole("grid", { name: "Daftar klien" });
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["KLIEN", "WHATSAPP", ""]);
    expect(within(table).getByRole("columnheader", { name: "Aksi" })).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("38 klien aktif")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Cari" })).toBeVisible();
  });

  it("AC-CLI-012 runs the row action on click and Enter", async () => {
    const onRowAction = vi.fn();
    render(
      <DataTable label="Daftar klien" toolbar={{ title: "Daftar klien" }} columns={columns} rows={rows} renderCell={renderCell} onRowAction={onRowAction} />,
    );
    await userEvent.click(screen.getByText("Rina"));
    expect(onRowAction).toHaveBeenLastCalledWith(rows[1]);
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(onRowAction).toHaveBeenLastCalledWith(rows[0]);
  });

  it("AC-CLI-003 shows the empty state instead of header and rows", () => {
    render(
      <DataTable label="Daftar klien" toolbar={{ title: "Daftar klien" }} columns={columns} rows={[]} renderCell={renderCell} emptyState={<p>Belum ada klien</p>} />,
    );
    expect(screen.getByText("Belum ada klien")).toBeVisible();
    expect(screen.queryByRole("columnheader")).toBeNull();
  });

  it("renders skeleton rows with the header for the loading state", () => {
    render(<DataTableSkeleton toolbar={{ title: "Daftar klien" }} columns={columns} rowCount={5} />);
    expect(screen.getAllByTestId("data-table-skeleton-row")).toHaveLength(5);
    expect(screen.getByText("KLIEN")).toBeVisible();
  });
});
```

  - **Implement:**
    - **Structure:** a `<section>` card (Table card tokens). Inside: the toolbar row (the title group left, `toolbar.actions` right, `justify-between`), then the React Aria `Table` (`aria-label={label}`, `onRowAction` mapped by key), then the optional footer (centred, top border `table.border`).
    - **Columns:** a fixed `width` becomes an inline `style={{ width }}` (literal sizes, design.md); the fill column gets `flex-1`. A column without `label` renders an empty header named by its `aria-label` (React Aria `Column aria-label`), the same rule as the optional field labels.
    - **Rows:** padding `table.row.padding-*`, bottom border `table.row.border` except on the last row; row hover only when `onRowAction` is set.
    - **Empty:** when `rows` is empty and `emptyState` is given, render it in the card body inside `space-4` padding and skip the header and footer.
    - **Skeleton:** the same card, the header row and `rowCount` rows of `surface.sunken` bars (the export's shape), each `data-testid="data-table-skeleton-row"`.
    - Read `docs/design-system/components/table.md` and the table in `list-populated-desktop-UiKLP.html`. Copy comes from props only; story copy lives in `.stories.copy.ts`.
  - **Story** `Patterns/DataTable`: *Populated*, *Empty*, *Loading*, with the export rows (Test fixtures › Stories).
  - Commit `feat(ui): add the data table pattern`.
- [ ] **1.2 Optional field labels, avatar rows and the mobile subtitle.**
  - **Tests first:**
    - `text-field.test.tsx`, `select.test.tsx`, `textarea.test.tsx`: with `label` nothing changes; with only `aria-label` no label element renders, the field's accessible name is the `aria-label`, and an `errorMessage` is still linked (`toHaveAccessibleErrorMessage`); `Select` without `label` names its ListBox and phone sheet with the `aria-label`;
    - `template-editor-screen.test.tsx` still passes with the migrated `Textarea`;
    - `list-card-item.test.tsx`: `avatarInitials="RI"` renders the avatar and no icon well; `icon` still works;
    - `app-shell.test.tsx`: the mobile header shows `mobileSubtitle` when given, otherwise `subtitle`.
  - **Implement** the three additive props (Components › Reuse). Update the ListCardItem story.
  - Commit `feat(ui): make field labels optional and add avatar rows and a mobile subtitle`.
- [ ] **1.3 Domain rules.**
  - **Tests first** (a small helper reads the first issue's message, or the parsed data):

```ts
// client-name/client-name.test.ts
import { describe, expect, it } from "vitest";

import { CLIENT_NAME_MAX_LENGTH, clientNameSchema } from "./client-name.schema";

const issue = (raw: string) => clientNameSchema.safeParse(raw).error?.issues[0]?.message;

describe("client name (BR-CLI-001)", () => {
  it("AC-CLI-008 rejects empty and over-long names after trimming, counting code points", () => {
    expect(issue("   ")).toBe("EMPTY");
    expect(issue("a".repeat(CLIENT_NAME_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(issue(` ${"a".repeat(CLIENT_NAME_MAX_LENGTH)} `)).toBeUndefined();
    expect(issue("😀".repeat(CLIENT_NAME_MAX_LENGTH))).toBeUndefined();
  });

  it("AC-CLI-006 trims the stored name", () => {
    expect(clientNameSchema.parse("  Rina Wedding ")).toBe("Rina Wedding");
  });
});
```

```ts
// whatsapp-number/whatsapp-number.test.ts
import { describe, expect, it } from "vitest";

import { formatWhatsappNumber, whatsappChatUrl } from "./whatsapp-number";
import { optionalWhatsappNumberSchema, whatsappNumberSchema } from "./whatsapp-number.schema";

describe("WhatsApp number (BR-CLI-002)", () => {
  it.each([
    "0812 3456 7890",
    "+62 812-3456-7890",
    "62812.3456.7890",
    "812 3456 7890",
    "(0812) 3456-7890",
  ])("AC-CLI-009 normalizes %s to 6281234567890", (raw) => {
    expect(whatsappNumberSchema.parse(raw)).toBe("6281234567890");
  });

  it("AC-CLI-009 keeps a foreign number with its country code", () => {
    expect(whatsappNumberSchema.parse("+1 415 555 0100")).toBe("14155550100");
  });

  it.each(["0812", "abc", "+62 812 3456 7890 1234 5", "00812345678", "620812345678", "+0812345678"])(
    "AC-CLI-009 rejects %s",
    (raw) => {
      expect(whatsappNumberSchema.safeParse(raw).error?.issues[0]?.message).toBe("INVALID");
    },
  );

  it("AC-CLI-007 treats a blank field as no number", () => {
    expect(optionalWhatsappNumberSchema.parse("  ")).toBeNull();
    expect(optionalWhatsappNumberSchema.parse(" - ")).toBeNull();
    expect(optionalWhatsappNumberSchema.parse("0812-3456-7890")).toBe("6281234567890");
  });

  it("AC-CLI-001 formats Indonesian and foreign numbers (A-7)", () => {
    expect(formatWhatsappNumber("6281234567890")).toBe("+62 812-3456-7890");
    expect(formatWhatsappNumber("6281322004512")).toBe("+62 813-2200-4512");
    expect(formatWhatsappNumber("14155550100")).toBe("+14155550100");
  });

  it("AC-CLI-012 parses its own display form back to the stored number", () => {
    expect(whatsappNumberSchema.parse(formatWhatsappNumber("6281234567890"))).toBe("6281234567890");
  });

  it("AC-CLI-016 builds a plain chat link without text (A-6)", () => {
    expect(whatsappChatUrl("6281234567890")).toBe("https://wa.me/6281234567890");
  });
});
```

```ts
// social-link/social-link.test.ts
import { describe, expect, it } from "vitest";

import { socialLinkLabel } from "./social-link";
import { SOCIAL_LINK_MAX_COUNT, SOCIAL_VALUE_MAX_LENGTH, socialLinkRowsSchema, socialValueSchema } from "./social-link.schema";

const valueIssue = (raw: string) => socialValueSchema.safeParse(raw).error?.issues[0]?.message;
const rowIssues = (rows: readonly { platform: string; value: string }[]) =>
  socialLinkRowsSchema.safeParse(rows).error?.issues.map((i) => ({ path: i.path, message: i.message }));

describe("social links (BR-CLI-001, A-2)", () => {
  it("AC-CLI-006 drops a leading @ from handles and keeps URLs", () => {
    expect(socialValueSchema.parse("  @rina.wed ")).toBe("rina.wed");
    expect(socialValueSchema.parse("https://www.tiktok.com/@rina")).toBe("https://www.tiktok.com/@rina");
  });

  it("AC-CLI-011 rejects a bare @, non-https URLs and over-long values", () => {
    expect(valueIssue("@")).toBe("EMPTY");
    expect(valueIssue("http://instagram.com/rina")).toBe("INVALID_URL");
    expect(valueIssue("a".repeat(SOCIAL_VALUE_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(valueIssue("rina.wed")).toBeUndefined();
  });

  it("AC-CLI-006 AC-CLI-007 drops blank rows and keeps the Owner's order", () => {
    expect(
      socialLinkRowsSchema.parse([
        { platform: "INSTAGRAM", value: "@rina.wed" },
        { platform: "FACEBOOK", value: "  " },
        { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
      ]),
    ).toEqual([
      { platform: "INSTAGRAM", value: "rina.wed" },
      { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
    ]);
  });

  it("AC-CLI-011 flags later rows with the same platform and value, ignoring case and @", () => {
    expect(
      rowIssues([
        { platform: "INSTAGRAM", value: "@rina.wed" },
        { platform: "TIKTOK", value: "rina.wed" },
        { platform: "INSTAGRAM", value: "RINA.WED" },
        { platform: "INSTAGRAM", value: "" },
        { platform: "INSTAGRAM", value: "" },
      ]),
    ).toEqual([{ path: [2, "value"], message: "DUPLICATE" }]);
  });

  it("AC-CLI-011 rejects an unknown platform and more than ten rows", () => {
    expect(rowIssues([{ platform: "MYSPACE", value: "rina" }])).toEqual([{ path: [0, "platform"], message: "UNKNOWN_PLATFORM" }]);
    const rows = Array.from({ length: SOCIAL_LINK_MAX_COUNT + 1 }, (_, i) => ({ platform: "OTHER", value: `akun${i}` }));
    expect(rowIssues(rows)).toEqual([{ path: [], message: "TOO_MANY" }]);
  });

  it("AC-CLI-001 labels handles with @ and URLs without the scheme", () => {
    expect(socialLinkLabel({ platform: "INSTAGRAM", value: "anisaputri" })).toBe("@anisaputri");
    expect(socialLinkLabel({ platform: "TIKTOK", value: "https://www.tiktok.com/@bayularas" })).toBe("tiktok.com/@bayularas");
  });
});
```

```ts
// client-search/client-search.test.ts
import { describe, expect, it } from "vitest";

import { CLIENT_SEARCH_MAX_LENGTH, clientSearchSchema } from "./client-search.schema";

describe("client search (A-4)", () => {
  it("AC-CLI-004 searches names by text", () => {
    expect(clientSearchSchema.parse(" RIN ")).toEqual({ text: "RIN", digits: null });
  });

  it.each([
    ["0812 3456", "628123456"],
    ["+62812", "62812"],
    ["812", "812"],
  ])("AC-CLI-004 normalizes the digits in %s", (raw, digits) => {
    expect(clientSearchSchema.parse(raw).digits).toBe(digits);
  });

  it("fails on blank and over-long queries, which the use case lists unfiltered (TD-A-1)", () => {
    expect(clientSearchSchema.safeParse("  ").success).toBe(false);
    expect(clientSearchSchema.safeParse("a".repeat(CLIENT_SEARCH_MAX_LENGTH + 1)).success).toBe(false);
  });
});
```

```ts
// client-list/client-list.test.ts
import { describe, expect, it } from "vitest";

import { CLIENT_PAGE_SIZE } from "./client-list";
import { clientStatusSchema } from "./client-list.schema";

describe("client list", () => {
  it("AC-CLI-005 pages 30 clients at a time (A-5)", () => {
    expect(CLIENT_PAGE_SIZE).toBe(30);
  });

  it("AC-CLI-002 accepts only the two list statuses", () => {
    expect(clientStatusSchema.safeParse("ACTIVE").success).toBe(true);
    expect(clientStatusSchema.safeParse("ARCHIVED").success).toBe(true);
    expect(clientStatusSchema.safeParse("DELETED").success).toBe(false);
  });
});
```

  - **Implement** with the rule code.
  - Commit `feat(booking): add client domain rules`.
- [ ] **1.4 Application: port, schemas, results, list, count and add.**
  - **Tests first:**
    - `client-schemas.test.ts`:
      - AC-CLI-008/009/011: one `clientInputSchema.safeParse` with an empty name, `0812` and a `MYSPACE` row reports all three issues at once, with paths `["name"]`, `["whatsappNumber"]`, `["socialLinks", 0, "platform"]` and messages `EMPTY`, `INVALID`, `UNKNOWN_PLATFORM`;
      - AC-CLI-006: a valid parse outputs the normalised fields (Test fixtures › AC-CLI-006); a blank number outputs `whatsappNumber: null`;
      - `clientListQuerySchema` rejects `status: "DELETED"` and a non-uuid `afterId`, and keeps a 101-character `q`.
    - `client-results.test.ts`: `validationFailure` maps paths with `.`; an unknown message (`"Invalid input: expected string"`) → `INVALID`; `numberTaken({ name: "Budi", isArchived: true })` shape.
    - `add-client.test.ts` (on `FakeClientRepository`):
      - AC-CLI-006: the AC input is stored normalised, in row order, with `updatedBy`;
      - AC-CLI-007: only *ade* → no number and no links; removing the Instagram row before saving gives the same result;
      - AC-CLI-008: `"  "` → `fieldErrors.name: "EMPTY"`; the same name twice is allowed;
      - AC-CLI-009: `0812` → `whatsappNumber: "INVALID"`;
      - AC-CLI-011: platform `MYSPACE` (form bypassed) → `socialLinks.0.platform: "UNKNOWN_PLATFORM"`, and nothing is stored.
    - `list-clients.test.ts`: AC-CLI-005 65 rows → 30 + cursor, then 30 + cursor, then 5 + `null`; AC-CLI-002 the archived status shows only *Budi*; AC-CLI-004 the parsed search is passed to the port; a 101-character `q` → `search: null`.
    - `count-clients.test.ts`: AC-CLI-021 counts per status, ignoring other workspaces.
  - **Implement:**
    - the port (Shared contracts; `listPage`, `count`, `create`), schemas, errors, results and the three use cases (Backend table);
    - `tests/support/booking/fake-client-repository.ts`, mirroring `FakeCategoryRepository`: public `rows` with `workspaceId`, `id`, `name`, `whatsappNumber`, `socialLinks`, `archivedAt`, `updatedBy`, `createdAt` (an increasing counter); `listPage` filters by workspace, status and search (name includes `text` ignoring case, or number includes `digits`), sorts by `name.toLowerCase()`, `createdAt`, `id`, starts after `afterId` and takes `limit`; `count` filters by workspace and status; `create` returns `NUMBER_TAKEN` with the holder when another row in the workspace has the number; a public `failNext` flag makes the next call throw;
    - `tests/support/booking/client-fixtures.ts` (Test fixtures).
  - Commit `feat(booking): add client list and add use cases`.
- [ ] **1.5 Schema and migration 0008.**
  - Write `client.ts`, add the export to `schema/index.ts`, then `pnpm db:generate --name client`.
  - **Review** `drizzle/0008_client.sql`: one `CREATE TABLE "client"`, the FKs to `workspace` (restrict) and `user` (set null), the unique `(workspace_id, id)`, both indexes and the three CHECKs. No other table changes, no `DROP` or `RENAME`. If drizzle-kit numbers it other than 0008, STOP: the base is wrong (0.1).
  - `pnpm typecheck` and `tests/config/drizzle-config.test.ts` pass.
  - Commit `feat(booking): add the client table`.
  - `pnpm db:migrate` against `.dev.vars` (non-production); paste the output into the step report.
- [ ] **1.6 Drizzle repository: list, count, create.**
  - **Tests first** (`tests/integration/booking/client-repository.test.ts`; seed as in `catalog-repositories.test.ts`, one workspace per test):
    - AC-CLI-006: `create` → `listPage` returns the normalised record with links in order; `updated_by` is the owner;
    - AC-CLI-001 / 002: the AC-CLI-001 data → *Aktif* `[ade, Rina]`, *Arsip* `[Budi]`;
    - AC-CLI-005: `Klien 001…065` → three `listPage` calls of limit 31, chained by the 30th ID, give 30 / 30 / 5 distinct rows in name order;
    - AC-CLI-004: `RIN` matches *Rina*; a name with `%` or `_` matches literally only; digits `628123456` and `62812` match `6281234567890`;
    - AC-CLI-021: archive one of three clients (direct update) → active `count` 2, archived 1; a search doesn't change the count;
    - AC-CLI-018: `listPage` and `count` with another workspace's context return nothing / 0; a cursor ID from another workspace returns no rows.
  - **Implement** `listPage`, `count`, `create` (Rule code › Repository).
  - Gate + `pnpm test:integration`. Commit `feat(booking): add the drizzle client repository`.
- [ ] **1.7 Composition and the add action.**
  - **Tests first:**
    - `client-flow.test.ts` (mock `verifyOwnerWorkspace`, `requireOwnerOrRedirect`, `withClientScope` and `logger` as `catalog-flow.test.ts` does):
      - AC-CLI-018: a `ClientError("NOT_FOUND")` → `notFound()`;
      - AC-CLI-017 / 019: an unexpected repository error in `addWorkspaceClient` → `logger.error("client.save_failed", { workspaceId, operation: "add" })` with exactly those keys, then a thrown `ClientError("SAVE_FAILED")`; the input's name, number and links appear nowhere in the logged arguments;
      - TD-A-1: `loadClients(id, "ACTIVE", "a".repeat(101))` runs an unfiltered list and returns `q: ""`.
    - `clients.test.ts`: `addClientAction` revalidates `/w/[workspaceId]/clients` (`"layout"`) only on success and returns the validation failure unchanged.
  - **Implement** the scope, the flow (`loadClients`, `addWorkspaceClient`, `saveError`) and the action.
  - Commit `feat(booking): wire client composition and the add action`.
- [ ] **1.8 Navigation and routes.**
  - **Tests first:**
    - `coming-soon-sections.test.ts`: AC-CLI-001 `isComingSoonSection("clients")` is false;
    - `owner-nav.test.tsx`:
      - AC-CLI-001: `resolveActiveNav` returns `{ nav: "clients", tab: "clients" }` for `/w/x/clients` and `/w/x/clients/archived`;
      - `resolvePageHeading` for `/w/x/clients` returns title *Klien*, subtitle *Orang yang memesan sesi foto. Pilih mereka saat membuat proyek.*, `mobileSubtitle` *Orang yang memesan sesi foto.*, and tabs `{ label: "Status klien", tabs: [{ label: "Aktif", href: "/w/x/clients", isActive: true }, { label: "Arsip", href: "/w/x/clients/archived", isActive: false }] }`;
      - for `/w/x/clients/archived` the activity flips and the title stays *Klien* (TD-A-3).
  - **Implement:**
    - remove `"clients"` from `COMING_SOON_SECTIONS`;
    - `resolveClientsHeading(pathname, prefix)` beside `resolveServicesHeading`; copy in `OWNER_NAV_COPY`: `clientsSubtitle`, `clientsMobileSubtitle`, `clientTabs: { active: "Aktif", archived: "Arsip" }`, `clientsTabsLabel: "Status klien"` (`// not in Pencil`);
    - `mobileSubtitle?` on `PageHeading`; `OwnerShell` passes `mobileSubtitle={heading.mobileSubtitle}` to `AppShell`;
    - the two `page.tsx` and two `loading.tsx` (Backend table). Until 1.10, `ClientsScreen` renders the client names in a plain list.
  - Commit `feat(workspace): route the clients section and its tabs`.
- [ ] **1.9 Copy, initials and field errors.**
  - **Tests first:**
    - `client-initials.test.ts`: `Bayu & Laras` → `BL`, `Ade Kurnia` → `AK`, `Keluarga Wijaya` → `KW`, `Budi` → `BU`, `Rina` → `RI`, `ade` → `AD`;
    - `client-field-error.test.ts`: every key in Shared contracts › Field error copy; `TAKEN` with `{ name: "Rina", isArchived: false }` → *Nomor ini sudah dipakai Rina*, with `{ name: "Budi", isArchived: true }` → *Nomor ini sudah dipakai Budi (diarsipkan)*;
    - `client-copy.test.ts`: `count("ACTIVE", 38)` → *38 klien aktif*, `count("ARCHIVED", 1)` → *1 klien diarsipkan*, `count("ACTIVE", 0)` → *0 klien aktif*.
  - **Implement** `client-copy`, `client-initials`, `client-field-error`.
  - Commit `feat(booking): add client copy, initials and field errors`.
- [ ] **1.10 List screen (S1: populated, empty, empty archived, loading).**
  - **Precondition:** open `list-populated-*`, `list-empty-*`, `list-empty-archived-*`, `list-loading-*`.
  - **Tests first:**
    - `clients-table.test.tsx`:
      - AC-CLI-001: rows show the initials avatar, the name, the formatted number or *Belum ada nomor WhatsApp*, and `Instagram · @rina.wed` followed by a CountBadge *+1* for *Rina*; `—` for *ade*; no badge with one link;
      - A-2: a URL link renders as `<a target="_blank" rel="noopener noreferrer">`; a handle is plain text;
      - AC-CLI-021: the toolbar shows *Daftar klien* and *38 klien aktif*;
      - AC-CLI-003: with no rows, `emptyState` replaces the header.
    - `client-list.test.tsx`: AC-CLI-001 Section Card *Daftar klien* with the count and *Tambah*; rows with the avatar, the name and the number only (no social text).
    - `clients-empty-state.test.tsx`: AC-CLI-003 the *Aktif* and *Arsip* copy and icons; *Tambah klien* only on phones.
    - `clients-tabs-bar.test.tsx`: AC-CLI-002 renders only on phones (`useMobileViewport` mocked); selecting *Arsip* pushes `/w/x/clients/archived`.
    - `clients-skeleton.test.tsx`: desktop five skeleton rows and no subtitle (A-10); phone five `ListCardItemSkeleton`.
    - `clients-screen.test.tsx`: the desktop tree renders `ClientsTable`, the phone tree the tabs bar + `ClientList`.
  - **Implement** the units (Components). Phone order: `ClientsTabsBar`, then (Slice 5) the search, then `ClientList`.
  - **Compare** with the four export pairs at 1440 and 390.
  - Commit `feat(booking): add the client list`.
- [ ] **1.11 Add dialog (S1b: default, saving, added, server error).**
  - **Precondition:** open `add-default-*`, `add-saving-*`, `toast-added-*`, `toast-server-error-*`.
  - **Tests first:**
    - `social-links-editor.test.tsx`: one row by default; *Tambah media sosial* adds a row with platform *Instagram*; remove deletes only its row;
    - `client-dialog.test.tsx`:
      - AC-CLI-006: the add dialog opens with one empty Instagram row; filling the AC values and confirming calls `onSubmit` with the **raw** form values; then the toast *Klien ditambahkan* / *Rina Wedding siap dipilih saat membuat proyek.* and the dialog closes;
      - AC-CLI-007: an empty Instagram row is sent, and the call succeeds;
      - the client-side resolver blocks submit with *Isi nama klien.* under the name, before any call;
      - the confirm shows *Menyimpan…* while pending and *Batal* is disabled;
      - AC-CLI-017: a throwing `onSubmit` shows *Perubahan belum tersimpan* with *Coba lagi*, and the input stays;
      - phone (`useMobileViewport` → true): a Bottom Sheet/Form with no *Batal*; the value placeholder is *@nama atau tautan*.
    - `use-client-mutations.test.ts`: `run("added", call)` toasts the added copy with the name; a throw toasts the danger copy, and *Coba lagi* calls `call` again.
  - **Implement:**
    - **Form:** `useForm<ClientInput, unknown, ClientFields>({ resolver: zodResolver(clientInputSchema), defaultValues: { name: "", whatsappNumber: "", socialLinks: [{ platform: "INSTAGRAM", value: "" }] } })`. Submit sends `form.getValues()` (the raw `ClientInput`), never the resolver's output: the server parses the same raw shape again (C-004).
    - **Errors:** each field's `errorMessage` is `clientFieldErrorText(error.message)`; a row error goes on the row's value `TextField`.
    - `ClientsScreen` opens the dialog from *Tambah klien* / *Tambah* / the empty state, and passes `onSubmit = (values) => mutations.run("added", () => actions.add(workspaceId, values))`.
  - **Compare** with the four export pairs.
  - **E2E** (`tests/e2e/clients/clients.spec.ts`): a new workspace → *Klien* is active and the *Aktif* empty state shows → *Arsip* shows its empty state → add *Rina Wedding* with `0812-3456-7890` → the row with *+62 812-3456-7890* and *1 klien aktif*.
  - Gate + `pnpm build` + the E2E spec. Commit `feat(booking): add clients from the list`.

**Done check:** in the browser, *Klien* opens from the nav with no *Segera hadir*; both tabs show their empty states with *0 klien …*; adding *Rina Wedding* with `0812-3456-7890` shows the toast, the row with *+62 812-3456-7890* and *1 klien aktif*; reload keeps it. The gate passes.

---

## Slice 2: Dialog validation and edit

This slice adds the server-side *number taken* rule, the row rules in the editor, and the edit dialog.

**Requires:** Slice 1 (`ClientDialog`, `SocialLinksEditor`, `addClient`, the repository).

### Screen overview

| | |
|---|---|
| Screens | S1b (field errors, number taken, edit) |
| Route | `/w/[workspaceId]/clients` (same page) |
| ACs | AC-CLI-008, 009, 010, 011 (UI), 012, 018 (update), 020 (row names, error links) |
| Out of this slice | opening *Ubah* from the row menu (Slice 3); on phones edit is reachable only from the row menu, so it's tested here with the dialog opened directly |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Field errors | `add-field-errors-desktop-cOct2` | `add-field-errors-mobile-LddVM` | Text Field/Error under *Nama klien*: *Isi nama klien.*; number `0812` with *Nomor WhatsApp tidak valid* (replaces the helper); two Instagram rows `@rina.wed` and `RINA.WED`, the second with *Akun ini sudah ada di daftar.* |
| Number taken | `add-number-taken-desktop-o6vrQ` | `add-number-taken-mobile-E8rum` | Desktop: *Rina Wedding*, `0812 3456 7890` → *Nomor ini sudah dipakai Rina*. Phone: *Budi Santoso*, `0898 7654 3210` → *Nomor ini sudah dipakai Budi (diarsipkan)* |
| Edit / several rows | `edit-several-rows-desktop-IGbYB` | `edit-several-rows-mobile-l3rBdN` | *Ubah klien* · *Perubahan dipakai di proyek dan pesan berikutnya.* · *Rina & Dimas* · `0812 3456 7890` · rows Instagram `@rina.wed`, TikTok `https://www.tiktok.com/@rina`, Facebook (empty, placeholder) · *Batal* / *Simpan* (phone: *Simpan* pinned). Desktop rows are one line; phone rows stack the value under the platform |
| 10 rows | — | — | Not drawn. At 10 rows *Tambah media sosial* is disabled (AC-CLI-011) |
| Toast / saved | — | — | Toast/Success *Perubahan disimpan* |

### Backend

| File | Content |
|---|---|
| port | `update(context, id, change)` → `"UPDATED" \| "NOT_FOUND" \| NumberTaken` |
| `drizzle-client-repository.ts` | `create` / `update`: on `pgCode(error) === "23505"` read the holder with `select name, archived_at from client where workspace_id = $1 and whatsapp_number = $2 limit 1` → `{ status: "NUMBER_TAKEN", holder: { name, isArchived } }`. `update` sets every field + `updatedBy` + `updatedAt: new Date()`, filtered by workspace and id; zero rows → `"NOT_FOUND"` |
| `application/use-cases/update-client/*` | `updateClient(repository, context, id, editorUserId, input: unknown): Promise<ClientWriteResult>`: as `addClient`; `NOT_FOUND` → `throw new ClientError("NOT_FOUND")` |
| `client-flow.ts` | `updateWorkspaceClient(rawWorkspaceId, rawClientId, values)`: `idOrNotFound(rawClientId)` with `clientIdSchema`; editor; `saveError` with `operation: "update"` |
| `clients.ts` | `updateClientAction(workspaceId, clientId, values: unknown)`, same shape as add |

### Components

- **Reuse:** Slice 1's `ClientDialog` and `SocialLinksEditor`.
- **`ClientDialog`** gains `mode: "edit"` with `client: ClientRecord`. Default values: the record with handles shown as `@` + value (URLs as stored) and the number as `formatWhatsappNumber(number)` (empty when null). Title *Ubah klien*, description *Perubahan dipakai di proyek dan pesan berikutnya.*, confirm *Simpan*, pending *Menyimpan…*.
- **Server errors:** for each `fieldErrors` entry, `form.setError(path, { type: "server", message: key })`; the number message uses `numberHolder`.
- **`SocialLinksEditor`:**
  - *Tambah media sosial* is disabled at `SOCIAL_LINK_MAX_COUNT` rows;
  - remove moves focus to the next row's value, else the previous row's value, else *Tambah media sosial*;
  - accessible names per row N (1-based): *Platform media sosial N*, *Akun {platform} N*, *Hapus {platform} N* (`// not in Pencil`);
  - a row error renders under the row's value `TextField` (its `errorMessage`, linked by React Aria).
- **`ClientsScreen`:** dialog state adds `{ kind: "edit", client }`; desktop `onRowAction` opens it; `onSubmit` → `mutations.run("saved", () => actions.update(workspaceId, client.id, values))`.

### Steps

- [ ] **2.1 Number taken (AC-CLI-010).**
  - **Tests first:**
    - integration: a duplicate number → `NUMBER_TAKEN` with the holder; an archived holder → `isArchived: true`; `Promise.all` of two creates with one number → exactly one row and one `NUMBER_TAKEN`; another workspace may use the number; the holder lookup never names a client from another workspace (AC-CLI-018);
    - `add-client.test.ts`: a number held by archived *Budi* → `TAKEN` + `numberHolder { name: "Budi", isArchived: true }`.
  - **Implement** the `23505` mapping in `create`.
  - Gate + `pnpm test:integration`. Commit `feat(booking): report taken whatsapp numbers`.
- [ ] **2.2 Update a client (AC-CLI-012).**
  - **Tests first:**
    - `update-client.test.ts`: the whole record is replaced with `updatedBy`; the client keeps its own number without conflict; another client's number → `TAKEN`; an ID from another workspace → throws `NOT_FOUND`;
    - integration: `update` with its own unchanged number → `UPDATED`; with another workspace's context → `NOT_FOUND`;
    - `client-flow.test.ts`: a malformed client ID → `notFound()`; an unexpected error logs `operation: "update"` with `clientId`;
    - `clients.test.ts`: `updateClientAction` revalidates only on success.
  - **Implement** the port method, repository, use case, flow and action.
  - Gate + `pnpm test:integration`. Commit `feat(booking): update clients`.
- [ ] **2.3 Field errors and row rules (S1b, AC-CLI-008…011, 020).**
  - **Precondition:** open `add-field-errors-*`, `add-number-taken-*`.
  - **Tests first:**
    - `client-dialog.test.tsx`: AC-CLI-008/009 client-side errors appear before any call; AC-CLI-010 a result with `TAKEN` + holder sets *Nomor ini sudah dipakai Budi (diarsipkan)* on the number and keeps the dialog open; AC-CLI-011 `@rina.wed` + `RINA.WED` → *Akun ini sudah ada di daftar.* on the second row;
    - `social-links-editor.test.tsx`: AC-CLI-011 disabled at 10 rows; the focus moves after remove; AC-CLI-020 the row names; the row error is the value field's accessible error message (`toHaveAccessibleErrorMessage`).
  - **Implement** (Components).
  - **Compare** with the two export pairs.
  - Commit `feat(booking): show client field errors`.
- [ ] **2.4 Edit dialog (S1b edit, AC-CLI-012).**
  - **Precondition:** open `edit-several-rows-*`.
  - **Tests first:**
    - `client-dialog.test.tsx`: the edit dialog is prefilled (handles with `@`, the number formatted); saving calls `onSubmit` with the raw values and toasts *Perubahan disimpan*; *Batal* / Close calls nothing;
    - `clients-screen.test.tsx`: a desktop row click opens *Ubah klien* for that client.
  - **Implement** (Components).
  - **Compare** with the export pair.
  - **E2E:** add a second client with `0812 3456 7890` → *Nomor ini sudah dipakai Rina Wedding*; click *Rina Wedding*'s row, rename it → the new name in the list.
  - Gate + `pnpm build` + the E2E spec. Commit `feat(booking): edit clients`.

**Done check:** in the browser, saving a duplicate number shows the holder's name; ten social rows disable *Tambah media sosial*; clicking a row on desktop opens *Ubah klien* filled in, and saving shows *Perubahan disimpan*. The gate passes.

---

## Slice 3: Row menu, archive and restore

This slice adds the row ⋯ on both trees: *Ubah*, *Buka WhatsApp*, *Arsipkan* with undo, and *Pulihkan* on the *Arsip* tab.

**Requires:** Slices 1–2 (`ClientDialog` edit mode, `useClientMutations`).

### Screen overview

| | |
|---|---|
| Screens | S1 (archived list), S1a |
| Route | `/clients` and `/clients/archived` |
| ACs | AC-CLI-002 (*Pulihkan*), 013, 016, 017 (archive), 018 (setArchived), 021 (count after archive) |
| Out of this slice | *Hapus* opens the delete confirm (Slice 4); until then the item is rendered and its handler is a no-op that Slice 4 replaces |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Row menu | `list-row-menu-desktop-uTkvt` | `row-actions-sheet-mobile-cVBpx` | Action Menu open beside the row's ⋯ (absolute overlay in the content container): *Ubah* · *Buka WhatsApp* · *Arsipkan* · divider · *Hapus* (destructive). Phone: Bottom Sheet/Actions titled with the client name and the number as meta, the same items without the divider |
| Archived list | `list-archived-desktop-LYK6l` | `list-archived-mobile-KHHeQ` | *Arsip* active; *1 klien diarsipkan*; *Budi* · *+62 898-7654-3210* · `Instagram · @budi.foto` (desktop) |
| Archived row menu | `list-archived-row-menu-desktop-sfgdK` | `list-archived-row-actions-sheet-mobile-Ttcj1` | *Ubah* · *Buka WhatsApp* · *Pulihkan* · *Hapus* |
| Toast / archived | `toast-archived-desktop-c8Kyy` | `toast-archived-mobile-SBrKO` | Toast/Success *Klien diarsipkan* · *Rina pindah ke Arsip.* · *Batalkan*; *Rina* is gone and the count reads *37 klien aktif* |
| No number | — | — | Not drawn: no *Buka WhatsApp* item (AC-CLI-016) |
| Toast / restored | — | — | Toast/Success *Klien dipulihkan* |

### Backend

| File | Content |
|---|---|
| port | `setArchived(context, change: ArchiveChange): Promise<boolean>` (false = not found) |
| repository | `archivedAt: change.isArchived ? sql\`now()\` : null`, `updatedBy`, `updatedAt`, filtered by workspace and id, returning id |
| `application/use-cases/set-client-archived/*` | `setClientArchived(repository, context, editorUserId, id, isArchived): Promise<void>`; `false` → `throw new ClientError("NOT_FOUND")` |
| `client-flow.ts` | `setWorkspaceClientArchived(rawWorkspaceId, rawClientId, isArchived: boolean)`; `operation: "archive"` / `"restore"` |
| `clients.ts` | `setClientArchivedAction(workspaceId, clientId, isArchived: boolean)` → `undefined`; revalidates |

### Components

- **Reuse (extend):**
  - `Icon`: `message-circle` → `MessageCircleIcon` from `@hugeicons/core-free-icons` (registry + type).
  - `MenuItem` gains `href?: string` and `target?: "_blank"`. With `href` it renders a React Aria link item (`rel="noopener noreferrer"` when `target="_blank"`); `onSelect` becomes optional. Existing items are unchanged.
  - `SheetItem` gains `href?: string` and `target?: "_blank"`: an anchor with the same classes and `rel="noopener noreferrer"`; `onPress` becomes optional. Existing items are unchanged.
- **Feature units:**
  - `ClientRowActions` (`client-row-actions`) `{ client: ClientRecord, status, onEdit, onArchive, onRestore, onDelete }`: desktop `MenuTrigger` with `IconButton` `more-horizontal` (*Aksi untuk {name}* `// not in Pencil`) and the items from Shared contracts › Row menu items; phone `IconButton` that opens `BottomSheet variant="actions" title={name} meta={number or *Belum ada nomor WhatsApp*}` with `SheetItem`s. Follow `SourceRowActions`.
  - `ClientsTable` puts it in the `actions` cell; `ClientList` in `ListCardItem` `trailing`.
  - `ClientsScreen`: `onArchive` → `mutations.run("archived", …)` whose toast action *Batalkan* calls `actions.setArchived(workspaceId, id, false)` through `run("restored", …)`; `onRestore` → `run("restored", …)`; `onEdit` → the edit dialog.

### Steps

- [ ] **3.1 Icon and link items (AC-CLI-016).**
  - **Tests first:** `icon.test.tsx` lists `message-circle`; `menu-item.test.tsx` and `sheet-item.test.tsx`: with `href` + `target="_blank"` the item is a link with `rel="noopener noreferrer"`; without `href` it is unchanged.
  - **Implement** (Components › Reuse). Update both stories with a link item.
  - Commit `feat(ui): add link menu and sheet items`.
- [ ] **3.2 Archive and restore backend (AC-CLI-013, 018).**
  - **Tests first:** `set-client-archived.test.ts` archive then restore, unknown → `NOT_FOUND`; integration: `setArchived` sets then clears `archived_at`, another workspace → `false`; `client-flow.test.ts` a malformed ID → `notFound()`; `clients.test.ts` revalidates.
  - **Implement** the port method, repository, use case, flow and action.
  - Gate + `pnpm test:integration`. Commit `feat(booking): archive and restore clients`.
- [ ] **3.3 Row actions (S1a, archived list).**
  - **Precondition:** open the four row-menu exports, `list-archived-*`, `toast-archived-*`.
  - **Tests first** (`client-row-actions.test.tsx`, `clients-screen.test.tsx`):
    - AC-CLI-016: with a number, *Buka WhatsApp* links to `https://wa.me/6281234567890` with `target="_blank"` and `rel="noopener noreferrer"`; without a number it is absent;
    - AC-CLI-013: *Arsipkan* calls `setArchived(…, true)` with no confirmation and toasts *Klien diarsipkan* / *Rina pindah ke Arsip.* with *Batalkan*, which calls it with `false` and toasts *Klien dipulihkan*;
    - AC-CLI-002: under *Arsip* the item is *Pulihkan* (`archive-restore`);
    - *Ubah* opens *Ubah klien*;
    - phones show the Bottom Sheet/Actions titled *Rina* with meta *+62 812-3456-7890*;
    - AC-CLI-017: a throwing archive shows the danger toast, and *Coba lagi* repeats it.
  - **Implement** (Components).
  - **Compare** with the export pairs.
  - **E2E:** archive *Rina Wedding* → *Batalkan* restores → archive again → *Arsip* shows it with *Pulihkan* → restore; the count updates each time (AC-CLI-021); the menu's *Buka WhatsApp* `href` is `https://wa.me/6281234567890` (assert the attribute; don't follow it).
  - Gate + `pnpm build` + the E2E spec. Commit `feat(booking): add client row actions`.

**Done check:** in the browser, ⋯ opens the menu (sheet on phones); *Arsipkan* moves the client to *Arsip* with an undo toast; *Pulihkan* brings it back; *Buka WhatsApp* opens `wa.me` in a new tab. The gate passes.

---

## Slice 4: Delete

**Requires:** Slice 3 (`ClientRowActions` `onDelete`).

### Screen overview

| | |
|---|---|
| Screens | S1c |
| Route | `/clients` and `/clients/archived` |
| ACs | AC-CLI-014, 015, 017 (delete), 018 (delete) |
| Out of this slice | an *Arsipkan* shortcut inside the blocked dialog (not specified; design.md › Spec notes) |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Confirm | `delete-confirm-desktop-wMTsk` | `delete-confirm-mobile-C7MJQ` | Modal SM, danger: *Hapus klien "Rina"?* · the desktop description · *Batal* / Button Danger *Hapus klien*. Phone: Bottom Sheet/Actions, the same title, the short description, Sheet Item/Destructive *Hapus klien*, then *Batal* |
| Deleting | `delete-deleting-desktop-v8owZB` | `delete-deleting-mobile-G2IVO` | Desktop: Danger pending *Menghapus…*, *Batal* disabled. Phone: the sheet stays open; the item reads *Menghapus…* with the `loading-03` spinner; both items are dimmed (`opacity.disabled`) |
| Blocked | `delete-blocked-desktop-l5w2s3` | `delete-blocked-mobile-RPieW` | Desktop: the same title and description, Alert/Danger *Klien ini punya proyek. Arsipkan saja.*, *Tutup* and *Hapus klien* disabled. Phone: title *Klien ini punya proyek. Arsipkan saja.*, description *Rina tidak dihapus.*, one item *Tutup* |
| Toast / deleted | — | — | Toast/Success *Klien dihapus* |

### Backend

| File | Content |
|---|---|
| port | `delete(context, id): Promise<"DELETED" \| "IN_USE" \| "NOT_FOUND">` |
| repository | delete filtered by workspace and id, returning id; zero rows → `"NOT_FOUND"`; `pgCode(error) === "23503"` → `"IN_USE"` |
| `application/use-cases/delete-client/*` | `deleteClient(repository, context, id): Promise<DeleteClientResult>`; `IN_USE` → `{ ok: false, code: "IN_USE" }`; `NOT_FOUND` → throw |
| `client-flow.ts` | `deleteWorkspaceClient(rawWorkspaceId, rawClientId)`; `operation: "delete"` |
| `clients.ts` | `deleteClientAction(workspaceId, clientId)` → `undefined` or `{ ok: false, code: "IN_USE" }` unchanged; revalidates on success |

### Components

- **Reuse (extend):** `SheetItem` gains `isPending?: boolean`: disabled + the `loading-03` icon (spinning, `motion-safe:animate-spin`) in place of `icon`. Existing items are unchanged.
- **Feature unit:** `DeleteClientDialog` (`delete-client-dialog`) `{ client: ClientRecord | null, onOpenChange, onConfirm: () => Promise<DeleteClientResult | undefined> }`. State `idle → deleting → (closed | blocked)`. Follow `DeleteSourceDialog`. The copy per breakpoint is in Global Constraints.

### Steps

- [ ] **4.1 Delete backend (AC-CLI-014, 015, 018).**
  - **Tests first:**
    - `delete-client.test.ts`: deletes; `inUse` (a public `Set` on the fake) → `{ ok: false, code: "IN_USE" }` and the row stays; unknown → `NOT_FOUND`;
    - `drizzle-client-repository.test.ts` (unit, mocked executor): an error with `code: "23503"`, also nested in `cause`, → `"IN_USE"`. F-07 adds the real-FK integration test;
    - integration: delete frees the number for a new client; another workspace → `"NOT_FOUND"`;
    - `clients.test.ts`: `deleteClientAction` returns `IN_USE` unchanged and doesn't revalidate it.
  - **Implement** the port method, repository, use case, flow and action; add `inUse` to the fake.
  - Gate + `pnpm test:integration`. Commit `feat(booking): delete clients without projects`.
- [ ] **4.2 Pending sheet item.**
  - **Tests first:** `sheet-item.test.tsx`: `isPending` disables the item and shows the spinner instead of the icon.
  - **Implement** and add a *Pending* story.
  - Commit `feat(ui): add a pending sheet item`.
- [ ] **4.3 Delete dialog (S1c).**
  - **Precondition:** open `delete-confirm-*`, `delete-deleting-*`, `delete-blocked-*`.
  - **Tests first** (`delete-client-dialog.test.tsx`):
    - AC-CLI-014: *Hapus klien "Rina"?* with the description per breakpoint; *Batal* calls nothing; confirm shows *Menghapus…* (desktop Danger pending, *Batal* disabled; phone pending item, both disabled), then toasts *Klien dihapus* and closes;
    - AC-CLI-015: an `IN_USE` result switches to the blocked state (desktop Alert + *Tutup* + disabled *Hapus klien*; phone title + *Rina tidak dihapus.* + *Tutup*);
    - AC-CLI-017: a throw shows the danger toast and returns to idle.
  - **Implement** and wire `onDelete` in `ClientsScreen`.
  - **Compare** with the three export pairs.
  - **E2E:** delete *Rina Wedding* with confirmation → the empty state and *0 klien aktif*.
  - Gate + `pnpm build` + the E2E spec. Commit `feat(booking): confirm client deletion`.

**Done check:** in the browser, *Hapus* asks first, shows *Menghapus…*, then removes the client with *Klien dihapus*; *Batal* changes nothing. The gate passes.

---

## Slice 5: Search and paging

**Requires:** Slice 1 (the backend already searches and pages).

### Screen overview

| | |
|---|---|
| Screens | S1 (no match, loading more, the search field in the populated frames) |
| Route | `/clients?q=…`, `/clients/archived?q=…` |
| ACs | AC-CLI-004, 005, 017 (load more) |
| Out of this slice | nothing more on S1: after this slice every export is implemented |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| Search field | `list-populated-desktop-UiKLP` | `list-populated-mobile-M4s8Ln` | Desktop: Input search (320, `search` icon) on the right of the toolbar, placeholder *Cari nama atau nomor WhatsApp*. Phone: full width between the Segmented Control and the card, *Cari nama atau nomor* |
| No match | `list-no-match-desktop-H6dpp3` | `list-no-match-mobile-jc8Al` | The field holds `zzz` with the `x` clear action; the count stays *38 klien aktif*; Empty State `search-x` *Tidak ada klien yang cocok* · *Coba nama lain, atau ketik sebagian nomor WhatsApp.* · *Hapus pencarian* |
| Loading more | `list-loading-more-desktop-n8bqd` | `list-loading-more-mobile-ztbVD` | The footer button pending *Memuat…* (desktop centred in the table footer; phone full width below the card) |
| More pages | `list-populated-*` | | Button Secondary *Muat lebih banyak*; hidden when everything is shown |

### Backend

| File | Content |
|---|---|
| `client-flow.ts` | `loadMoreClients(rawWorkspaceId, rawQuery: unknown): Promise<ClientPage>`: `clientListQuerySchema.safeParse`; failure → `notFound()`; `operation: "list"` |
| `clients.ts` | `loadMoreClientsAction(workspaceId, query: unknown)` → `ClientPage` (no revalidation) |

### Components

- **Reuse (extend):** `Input`: `"x"` joins `InputIconName`. The adornment already renders an action as a labelled button.
- **Feature units:**
  - `ClientSearchField` (`client-search-field`) `{ workspaceId, status, q, resultCount }`: `Input variant="search" iconLeading="search"`, with `iconTrailing="x"` + `iconTrailingAction={{ label: "Hapus pencarian", onPress: clear }}` only when it has a value; debounces `CLIENT_SEARCH_DEBOUNCE_MS`, then `router.replace` to the current tab's path with `?q=` (none when blank); a polite live region announces *{n} klien cocok* when the query is non-empty (`// not in Pencil`, AC-CLI-020);
  - `useLoadMoreClients` (`use-load-more-clients`) `({ workspaceId, status, q, initial: ClientPage, action })` → `{ rows, hasMore, isLoading, loadMore }`: keeps the appended rows and the cursor, keyed by `status + q + initial.nextCursor`, so another tab, query or revalidation resets them; a call while pending is ignored; a failure shows the danger toast and keeps the rows;
  - the footer: `Button variant="secondary"` *Muat lebih banyak*, `isPending` → *Memuat…*.

### Steps

- [ ] **5.1 Search (AC-CLI-004).**
  - **Precondition:** open `list-no-match-*` and the populated pair.
  - **Tests first:**
    - `input.test.tsx`:

```tsx
it("AC-CLI-004 renders a trailing x action that clears the search", async () => {
  const onClear = vi.fn();
  render(
    <Input
      variant="search"
      aria-label="Cari klien"
      value="zzz"
      iconLeading="search"
      iconTrailing="x"
      iconTrailingAction={{ label: "Hapus pencarian", onPress: onClear }}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Hapus pencarian" }));
  expect(onClear).toHaveBeenCalledOnce();
});
```

    - `client-search-field.test.tsx` (fake timers): typing `RIN` calls `router.replace("/w/x/clients?q=RIN")` once after 300 ms; clearing calls `router.replace("/w/x/clients")`; the clear action appears only with a value; the live region text;
    - `clients-screen.test.tsx`: a `q` with no rows renders the no-match state, and *Hapus pencarian* clears it.
  - **Implement** and place the field in the toolbar (desktop) and the phone stack.
  - **Compare** with the export pairs.
  - **E2E:** two clients → search *RIN* → one row; reload keeps `?q=RIN`; `zzz` → *Tidak ada klien yang cocok* → *Hapus pencarian* clears.
  - Commit `feat(booking): search clients`.
- [ ] **5.2 Load more (AC-CLI-005).**
  - **Precondition:** open `list-loading-more-*`.
  - **Tests first:**
    - `use-load-more-clients.test.ts` (`renderHook`): from `{ items: 30, nextCursor: "c1" }`, `loadMore()` calls the action with `{ status, q, afterId: "c1" }` and appends 30, then 5 with `nextCursor: null`; `isLoading` while pending; a second call while pending is ignored; a new `initial` resets; a failure toasts and keeps the rows;
    - `client-flow.test.ts`: an invalid query or cursor → `notFound()`.
  - **Implement** the flow function, the action, the hook and the footer in `ClientsTable` / `ClientList`.
  - **Compare** with the export pair.
  - Gate + `pnpm build` + the E2E spec. Commit `feat(booking): load more clients`.

**Done check:** in the browser, typing in the search narrows the list after a short pause and survives reload; `zzz` shows the no-match state; with more than 30 clients *Muat lebih banyak* appends the next 30. The gate passes.

---

## Slice 6: Close

Screens: S1–S1c, end to end.

- [ ] **6.1 E2E journeys.** Complete `tests/e2e/clients/clients.spec.ts` (helpers from `catalog.spec.ts`; scope desktop selectors to `#app-shell-content`). Every journey is one `test(...)` named with its AC IDs:

  | Journey | Checks |
  |---|---|
  | AC-CLI-001, 003 | new workspace → nav *Klien* active (`aria-current`) → *Aktif* empty → *Arsip* empty |
  | AC-CLI-006, 010, 012, 021 | add *Rina Wedding* (`0812-3456-7890`, `@rina.wed`, a TikTok URL) → row + *1 klien aktif*; a second client with `0812 3456 7890` → *Nomor ini sudah dipakai Rina Wedding*; edit the name → the new name |
  | AC-CLI-013, 014, 021 | archive → *Batalkan* → archive → *Arsip* + *Pulihkan* → restore → delete → empty; the count each step |
  | AC-CLI-004 | search, reload, no match, clear |
  | AC-CLI-016 | *Buka WhatsApp* `href` |
  | AC-CLI-018 | a second owner opens the first owner's `/clients` URL → not found |

  Commit `test(clients): complete client journeys`.
- [ ] **6.2 Accessibility (AC-CLI-020).**
  - Add `expectClientsA11y(page)`, a copy of `expectCatalogA11y`.
  - Run it at 1440×900 and 390×844, light and dark (`page.emulateMedia({ colorScheme: "dark" })`), on: the populated list, both empty states, the no-match state, the row menu open, the add dialog with field errors, the edit dialog, and the delete confirm and blocked states.
  - **Keyboard-only paths:** tabs → search → a row (Enter opens *Ubah*) → the row ⋯ (Enter opens, Escape closes, focus returns) → *Ubah* → the social rows (add, remove, focus moves) → Escape returns focus to the trigger; the delete confirm traps focus.
  - Commit `test(clients): check client screens for accessibility`.
- [ ] **6.3 Fidelity.**
  - Start the dev server with `preview_start`.
  - For each of the 40 exports: open the export and the matching app state at the same width (1440 or 390), screenshot both, and compare structure, copy, spacing and tokens.
  - Fix every deviation that is a bug (class names and nesting only, AGENTS.md). Record the intentional ones (literal sizes, the COMPONENT GAPs, the link-text DESIGN TOKEN GAP) in the implementation record.
  - Commit fixes as `fix(clients): match {screen} to the design`.
- [ ] **6.4 Full gate and record.**
  - Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm build` and the E2E suite; all pass.
  - Append *Implementation record* to `technical-design.md`: date and commits; the migration run output; deviations (each with its reason); the AC → test-file map for AC-CLI-001…021; open follow-ups (promote List Card Item/Avatar and Sheet Item/Pending; the `text.link` token).
  - Set F-06 to `IN PROGRESS` in `spec.md`, `docs/product/feature-map.md` and `docs/HANDOFF.md`, with verification pending (`/sdv:verify-feature clients`).
  - Commit `docs(clients): record the f-06 implementation`.

**Done check:** every AC-CLI-001…021 maps to a passing test or a recorded verification (C-009), and the full gate passes.
