# Technical Design — F-02 Workspace

Status: DONE (verified 2026-09-28; implementation, dedicated E2E and documentation write-back complete). The build was split into **two batches**:
- **Batch A (iterations 1–4)** builds the design-system components F-02 needs that aren't in code yet ([design.md](design.md) › *Component usage*, ❌/⚠️ rows). It is feature-agnostic `src/ui` work.
- **Batch B (iterations 5–12)** builds the workspace feature on top of it.

## Context

This design implements [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md) (AC-WS-001…025; 010 deprecated), drawn in [workspace.pen](workspace.pen) ([design.md](design.md), APPROVED 2026-09-27). There are no F-02 diagrams: the flows are linear, and the spec and ADR-015 (routes, resolution order, verify vs touch) cover the order.

- **In scope:** the `workspace` table, first-workspace onboarding, creating another workspace, switching, Workspace settings (branding), the verified `WorkspaceContext` resolver, F-01's `WorkspaceDestinationPort`, the App Shell in code (desktop, tablet and mobile), the dashboard empty state, *Segera hadir* placeholders, and *Workspace not found*.
- **Out of scope** (per the spec): logo, archive/delete, staff, other currencies, dashboard metrics, message templates (F-03) and sources (F-04).
- **Code today** (checked 2026-09-27): F-00 and F-01 are on `main`. `src/ui` has Button, Input, TextField, Icon (Hugeicons, semantic names) and Alert (info/danger). `WorkspaceContext` / `asWorkspaceId` are in `src/shared/workspace-context`. `composition/auth/auth-scope` wires a stub destination that always returns `ONBOARDING`.

## Relevant Authority

- Constitution: C-003, C-004, C-005, C-006, C-007, C-008, C-009, C-010, C-011, C-012, C-101, C-102
- Business rules: BR-AUTH-003, BR-AUTH-004, BR-AUTH-005, BR-WS-001 … BR-WS-007, BR-CUR-001
- Acceptance criteria: AC-WS-001 … AC-WS-025 (010 deprecated)
- ADRs: ADR-002 (identity), ADR-003 (isolation), ADR-009 (per-request Pool), ADR-010 (Tailwind + React Aria), ADR-014 (Storybook), **ADR-015 URL-scoped workspace context (Accepted, Owner 2026-09-27; CONFLICT-ADR015-1 resolved as option (b); English slugs)**
- Coding rules v2.0; token-usage.md G1–G8, SP1–SP11
- Design: [design.md](design.md); component specs in `docs/design-system/components/`

## Architecture

```text
src/
  ui/                                      BATCH A: design-system units, feature-agnostic, each with test + story
    primitives/
      icon/                  (extend)      new semantic names (see Iteration 1)
      icon-button/                         C02 Ghost SM/MD
      avatar/                              C16 initials, MD
      count-badge/                         C13 (general count badges)
      tooltip/                             C37 Tooltip (React Aria TooltipTrigger)
      textarea/                            C04 (+ the label row, as in the design)
    patterns/
      alert/                 (extend)      + success tone for inline feedback
      toast/                               C39 global queued feedback pattern
      nav-item/  nav-group-label/          C22 (expanded + compact rail mode)
      bottom-nav/  bottom-nav-item/        C34 (+ CTA)
      menu/  menu-item/                    C09/C10 (+ group label, divider), React Aria Menu/MenuTrigger
      modal/                               C31 SM/MD/LG, React Aria Modal + Dialog
      bottom-sheet/  sheet-item/           C32 Actions/Form/Menu, React Aria Modal + Dialog
      app-panel/                           C28 + Page Content (title, actions, content container)
      sidebar/                             C29 + C37 expanded/compact modes
      mobile-app-shell/                    C35: app bar, content, Bottom Nav, sheet layer
      app-shell/                           C30 + C37 tablet: responsive composition, skip link, overlay layer
      split-layout/                        moved from features/auth/ui/auth-split-layout
      editorial-panel/                     moved from features/auth/ui/editorial-panel; headline → slot
  features/workspace/                      BATCH B
    domain/
      workspace-name/                      normaliseWorkspaceName, A-1 limits, name key (A-2)
      invoice-prefix/                      suggestInvoicePrefix (A-3), normaliseInvoicePrefix
      workspace-profile/                   A-4 field rules, clientBrandName fallback (AC-WS-018)
      owner-user-id/                       OwnerUserId brand (opaque; composition maps AuthUserId)
      coming-soon-sections/                COMING_SOON_SECTIONS allow-list + isComingSoonSection (ADR-015)
    application/
      ports/workspace-repository/          WorkspaceRepositoryPort
      errors/workspace-errors/             WorkspaceError + codes + field-error keys
      schemas/workspace-fields/            shared field schemas
      use-cases/
        resolve-owner-destination/         ONBOARDING | WORKSPACE (backs F-01's port)
        find-last-opened-workspace/        for /workspace, onboarding redirect and the /profile shell (read only)
        verify-workspace/                  THE resolver → WorkspaceContext; read only (ADR-015)
        touch-last-opened/                 conditional touch: only if not already the latest (ADR-015)
        create-first-workspace/            onboarding; refuses when ≥1 exists (AC-WS-006)
        create-workspace/                  from the switcher (AC-WS-007)
        list-owner-workspaces/             alphabetical (A-11)
        get-workspace-profile/  update-workspace-profile/
    ui/
      onboarding-screen/ onboarding-form/ workspace-preview-card/   (UTew4 card in the editorial slot)
      owner-shell/                         wires ui/app-shell: nav config, active item, switcher, account
      owner-nav/                           the A-7 destinations, routes, icons, active matching
      workspace-switcher/                  desktop Menu, rail Menu, mobile Actions sheet
      create-workspace-dialog/             Modal/SM (desktop) · Bottom Sheet/Form (mobile)
      more-sheet/                          mobile "Lainnya" (Bottom Sheet/Menu)
      dashboard-screen/ coming-soon-screen/ workspace-not-found-screen/
      settings-form/                       Identitas brand · Kontak · Invoice
      use-workspace-form/                  RHF + zodResolver + server field errors (auth pattern)
  adapters/db/
    schema/workspace/workspace.ts          + barrel export
    workspace-repository/                  drizzle-workspace-repository.ts
  composition/workspace/
    workspace-scope/                       per-request wiring (withRequestDb)
    workspace-destination/                 implements F-01's WorkspaceDestinationPort
    owner-workspace/                       resolution order (gate → 0 workspaces → claim): verifyWorkspace(rawId)
                                           (React cache), enterWorkspace(rawId) = verify + touch, resolveOwnerHome()
    onboarding-flow/ switch-flow/ create-flow/ settings-flow/ shell-flow/
  app/
    (owner)/onboarding/workspace/page.tsx
    (owner)/workspace/page.tsx             redirect → /w/<last opened> | onboarding
    (owner)/w/[workspaceId]/layout.tsx     App Shell; verifyWorkspace for the shell only, never touches
    (owner)/w/[workspaceId]/page.tsx       Dasbor: enterWorkspace
    (owner)/w/[workspaceId]/settings/page.tsx    enterWorkspace
    (owner)/w/[workspaceId]/[section]/page.tsx   Segera hadir: verifyWorkspace only; allow-list else notFound()
    (owner)/w/not-found.tsx                Tidak ditemukan (in the last-opened workspace's shell)
    (owner)/profile/layout.tsx             App Shell for the last-opened workspace, read only (F-01 R-6)
    actions/workspace/{onboarding,create,switch,settings}.ts
```

Key decisions:

- **ADR-015 (Accepted 2026-09-27):**
  - The workspace is URL-scoped (`/w/[workspaceId]`, English slugs).
  - Resolution order everywhere: F-01 gate → zero workspaces go to onboarding → a malformed, missing or other Owner's ID gets the same *not found*.
  - **`verifyWorkspace` reads only.** Every page, loader and action calls it itself; the layout is never the only check.
  - **`touchLastOpened` is separate and conditional.** It runs on create, on switch (POST), and on the first page entered from outside a workspace (option (b)). *Segera hadir* and `/profile` never write.
- **Batch A lives in `src/ui` and knows nothing about workspaces.** Shell templates take slots and plain data props (nav items `{href, label, icon, isActive}`, account `{name, email}`, and a `logout` action passed down from `app/`). `features/workspace/ui/owner-shell` fills them, because a feature can't import another feature (coding rules).
- **The split layout and editorial panel move to `src/ui/patterns`.** Onboarding reuses the auth layout, but `features/workspace` may not import `features/auth`. The move changes only imports in F-01's screens; the rendered output is unchanged. The headline becomes a `children` slot: auth passes its headline, and workspace passes the sidebar-preview card (`UTew4`).
- **F-01 integration goes through composition only.** `composition/auth/auth-scope` swaps its stub for `composition/workspace/workspace-destination`, which maps `AuthUserId → OwnerUserId`. The owner gate stays `requireOwnerOrRedirect` (BR-AUTH-003/005 run first, AC-WS-015).
- **One responsive shell, not three routes.** `AppShell` renders the Sidebar from `xl` (1280), the rail at `md`–`xl` (768–1279), and the Mobile App Shell below `md` (768). Tailwind's default `md`/`xl` breakpoints equal the spec values. Desktop collapse (A-8) shows the rail at `xl` and is kept in a non-httpOnly `shutrly_sidebar` cookie, so the server renders the right layout without a flash.

## Database Changes

`src/adapters/db/schema/workspace/workspace.ts`, exported from the barrel. The migration `drizzle/0001_workspace.sql` is generated by `pnpm db:generate`, reviewed and committed. **The Owner applies it** (`pnpm db:migrate` is never run by the agent).

| Column | Definition |
|---|---|
| `id` | `uuid PK DEFAULT gen_random_uuid()` (`idColumn`) |
| `owner_user_id` | `text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT` (ADR-015). There's no account deletion (F-01 out of scope). |
| `name` | `text NOT NULL`, stored trimmed; `CHECK (char_length(name) BETWEEN 1 AND 60)` (A-1) |
| `brand_name` | `text NULL`, `CHECK (char_length ≤ 80)` (A-4) |
| `contact_email` | `text NULL`, `CHECK (char_length ≤ 254)` |
| `phone` | `text NULL`, `CHECK (phone ~ '^[0-9 +()-]{8,20}$')` |
| `address` | `text NULL`, `CHECK (char_length ≤ 300)` |
| `invoice_prefix` | `text NOT NULL`, `CHECK (invoice_prefix ~ '^[A-Z0-9]{2,6}$')` (A-3) |
| `currency` | `text NOT NULL DEFAULT 'IDR'`, `CHECK (currency = 'IDR')` (BR-CUR-001) |
| `last_opened_at` | `timestamptz NOT NULL DEFAULT now()` (BR-WS-006, A-5) |
| `created_at`, `updated_at` | `auditColumns()` |

Indexes and constraints:
- `workspace_owner_name_uq` UNIQUE on `(owner_user_id, lower(name))`. This is the A-2 authority and makes a double submit safe (AC-WS-004).
- `workspace_owner_last_opened_ix` on `(owner_user_id, last_opened_at DESC)`.
- The `workspace` row **is** the tenant root, so it has no `workspace_id` column. Later tenant parents reference `workspace(id)` and add `tenantKey` (ADR-003).
- Empty optional fields are stored as `NULL` ("not set", A-4), never `''`.
- There is no delete path anywhere (BR-WS-007).

## Server / API Interface

All mutations are server actions. Each one parses its input with the use case's Zod schema, calls a composition entry point, and returns `{ ok: false, code, fieldErrors? }` or redirects. None of them reads a workspace ID from the form body. The ones that act in a workspace are bound on the server: `settingsAction.bind(null, workspaceId)` is created in the page from the route param and re-resolved by the resolver.

| Entry | Input | Outcomes |
|---|---|---|
| `GET /onboarding/workspace` | none | Owner gate → the page if 0 workspaces · else → `/workspace` (AC-WS-006) |
| `createFirstWorkspaceAction` | `createWorkspaceSchema` { name } | → `/w/<new>` · `VALIDATION_FAILED` · `DUPLICATE_NAME` (field) · `ALREADY_HAS_WORKSPACE` → `/workspace` |
| `GET /workspace` | none | → `/w/<last opened>` · → `/onboarding/workspace` (AC-WS-001/008/009). Reads only. |
| `GET /w/[workspaceId]` and `/settings` | route param | gate → onboarding if 0 workspaces → `enterWorkspace` (verify + conditional touch) → shell + page · *not found* for a malformed, missing or other Owner's ID (404, AC-WS-012) |
| `GET /w/[workspaceId]/[section]` | route param | the same order, `verifyWorkspace` only (no write, AC-WS-025) · a section not in `COMING_SOON_SECTIONS` → `notFound()` |
| `createWorkspaceAction` | { name } | → `/w/<new>` (create sets `last_opened_at`) · field errors · `DUPLICATE_NAME` (AC-WS-007) |
| `switchWorkspaceAction` | { workspaceId } (the claim) | verify + touch → `/w/<id>` · *not found* (AC-WS-011/012) |
| `saveWorkspaceSettingsAction` (bound ID) | `updateWorkspaceProfileSchema` | ok (saved state, AC-WS-016) · field errors · `DUPLICATE_NAME` · *not found* |
| `GET /profile` (F-01) | none | wrapped in the last-opened workspace's shell, read only (no touch) · → onboarding if 0 (AC-WS-001) |

**Route slugs** (English, Owner 2026-09-27; UI copy stays Indonesian): `settings`, plus `COMING_SOON_SECTIONS` = `projects`, `clients`, `invoices`, `services`, `team`, `message-templates`, `client-sources`, `new-project` (Bottom Nav CTA). A later feature adds a static segment (for example `w/[workspaceId]/projects/page.tsx`) and removes its slug from the list in the same change.

AC-WS-020: no archive or delete action exists. A test asserts the exports of `app/actions/workspace/*` and the port's method list.

## Domain / Application Logic

**Domain** (pure, no I/O, unit-tested):
- `normaliseWorkspaceName(raw)`: trims and checks 1–60 (A-1; constants `WORKSPACE_NAME_MAX = 60` tied to A-1). `workspaceNameKey(name) = name.trim().toLocaleLowerCase("id-ID")` is used only by fakes and messages; the DB `lower()` index is the authority.
- `suggestInvoicePrefix(name)` (A-3, AC-WS-005):
  1. Take the first character of each word from `[\p{L}\p{N}]+`, uppercase, and cut to 6.
  2. If that's shorter than 2, take the first 3 letters or digits of the name.
  3. If it's still shorter than 2, use `INV`.
  - Results: `Aster Wedding → AW`, `Studio → STU`, `Foto Keluarga Bahagia Sentosa Abadi Jaya → FKBSAJ`, `@@ → INV`. Non-ASCII letters are folded with NFKD and dropped if they're not `A–Z0–9`. This is tested.
- `normaliseInvoicePrefix(raw)`: trims and uppercases, then `^[A-Z0-9]{2,6}$` (AC-WS-017: `aw` → `AW`).
- `workspaceProfileRules`: brand name ≤ 80, email ≤ 254 and valid, phone 8–20 of `[0-9 +()-]`, address ≤ 300. Empty becomes null (A-4).
- `clientBrandName(profile) = brandName ?? name` (AC-WS-018).

**Application** (`import "server-only"` except schemas and types; over `WorkspaceRepositoryPort`):

| Port method | Contract |
|---|---|
| `countForOwner(owner)` | number of workspaces |
| `create(owner, fields)` | inserts with `last_opened_at = now()` → `{ ok: true, id }` or `{ ok: false, reason: "DUPLICATE_NAME" }` (unique violation on `workspace_owner_name_uq`) |
| `findForOwner(owner, id)` | `SELECT id, name … WHERE id = $1 AND owner_user_id = $2` → summary or `null`. Reads only. |
| `touchIfNotLatest(owner, ctx)` | `UPDATE … SET last_opened_at = now() WHERE id = $1 AND owner_user_id = $2 AND last_opened_at < (SELECT max(last_opened_at) FROM workspace WHERE owner_user_id = $2)` → touched or not |
| `findLastOpened(owner)` | the ID with max `last_opened_at`, or `null`. Reads only. |
| `listForOwner(owner)` | `{id, name}[]` ordered by `lower(name), id` (A-11) |
| `getProfile(ctx)` / `updateProfile(ctx, fields)` | scoped by `ctx.workspaceId` **and** owner; update → ok / `DUPLICATE_NAME` / not found |

Use cases:
- `resolveOwnerDestination(owner)`: `countForOwner > 0 ? "WORKSPACE" : "ONBOARDING"` (AC-WS-001/008).
- `verifyWorkspace(owner, rawId)`:
  1. Parse `workspaceIdSchema`; a failure is `WORKSPACE_NOT_FOUND`.
  2. Call `findForOwner`; `null` is `WORKSPACE_NOT_FOUND`.
  3. Return `{ context: WorkspaceContext, workspace: {id, name} }`.
  - It writes nothing, and it's the only producer of a `WorkspaceContext` (AC-WS-014).
  - Its caller has already run the F-01 gate and the zero-workspace check (see *Resolution order* below).
- `touchLastOpened(owner, ctx)`: `touchIfNotLatest`. It takes only a verified context, so another Owner's ID can never reach it (AC-WS-012).
  - Called by the switch flow, and by `enterWorkspace` on every workspace page except *Segera hadir*.
  - Create doesn't call it: the insert sets `last_opened_at = now()`.

**Resolution order** (`composition/workspace/owner-workspace`, ADR-015), for every owner page and action:
1. `requireOwnerOrRedirect` (F-01 gate; AC-WS-015).
2. `countForOwner = 0` → redirect `/onboarding/workspace`, for any `/w/<anything>`, `/workspace` and `/profile` (AC-WS-001).
3. `verifyWorkspace` → `notFound()` on `WORKSPACE_NOT_FOUND` (A-9).

`enterWorkspace(rawId)` = steps 1–3 + `touchLastOpened`, for pages. Pages call it (or `verifyWorkspace`) themselves; the layout's own call only feeds the shell.
- `createFirstWorkspace(owner, input)`:
  1. Parse the input.
  2. If `countForOwner > 0`, return `ALREADY_HAS_WORKSPACE` and create nothing (AC-WS-006).
  3. Create with `suggestInvoicePrefix`, currency `IDR` and null branding (AC-WS-002).
- `createWorkspace(owner, input)`: the same without the zero check (AC-WS-007).
- `listOwnerWorkspaces(owner, ctx)`: the list, with `isCurrent` set from ctx (AC-WS-011).
- `getWorkspaceProfile(ctx)` and `updateWorkspaceProfile(ctx, input)`:
  - `updateWorkspaceProfile` parses, normalises the prefix, and updates **only** `ctx`'s row (AC-WS-013, AC-WS-019).
  - Currency is not in the schema, so it can't be changed (AC-WS-016).
  - Last-write-wins (A-10).

## UI Components

Visual truth is `workspace.pen`, and components are built from **HTML exports** (AGENTS.md, coding rules › Styling):
- **Batch A** uses the library's component exports in `docs/design-system/exports/cNN-<name>.html` (precedent: c01, c03, c18).
- **Batch B** uses the frame exports in `docs/features/workspace/exports/<state>-<frameId>.html` (design.md › *HTML exports*).

A missing export stops the task. Raw values map to tokens, and a value with no token is a `DESIGN TOKEN GAP`.

### Batch A — design-system units

| Unit | Spec | React Aria / behaviour | Export needed |
|---|---|---|---|
| Icon (extend) | icon.md | Hugeicons for camera, chevrons-up-down, layout-grid, folder-kanban, users, receipt, package, user-round-cog, message-square-text, share-2, settings, menu, check, chevron-right, search-x, panel-left, panel-left-open, log-out, x (plus exists) | — (registry) |
| Alert (extend) | alert.md | + `success` tone: `role=status` when live | `c24-alert.html` |
| IconButton | icon-button.md | `Button`, Ghost SM/MD, required `aria-label` | `c02-icon-button.html` |
| Avatar | avatar.md | initials, `aria-hidden` next to the visible name | `c16-avatar.html` |
| CountBadge | count-badge.md | text badge | `c13-count-badge.html` |
| Tooltip | nav-rail.md | `TooltipTrigger` 300 ms, Esc, portal | `c37-nav-rail.html` |
| Textarea | textarea.md | `TextField` + `TextArea`, label, helper, error, optional | `c04-textarea.html` |
| NavItem, NavGroupLabel | nav-item.md | `Link`, `aria-current=page`, Count off | `c22-nav-item.html` |
| NavItem (`isCompact`) | nav-rail.md | `Link` + Tooltip, `aria-label` | `c37-nav-rail.html` |
| BottomNav, BottomNavItem, CTA | bottom-nav.md | `<nav aria-label="Utama">`, links, CTA `<a>`/button, safe area | `c34-bottom-nav.html` |
| Menu, MenuItem, MenuGroupLabel, MenuDivider | menu.md, menu-item.md | `MenuTrigger` / `Menu` / `MenuItem` / `MenuSection` / `Separator`, Selected with check | `c09-menu-item.html`, `c10-menu.html` |
| Modal | modal.md | `ModalOverlay` + `Modal` + `Dialog`, SM/MD/LG, Close *Tutup*, focus return, scroll lock | `c31-modal.html` |
| BottomSheet (Actions/Form/Menu), SheetItem | bottom-sheet.md | `ModalOverlay` docked bottom, max 90 dvh, reduced motion fades, Selected Sheet Item checkmark | `c32-bottom-sheet.html` |
| AppPanel + PageContent | app-panel.md | `<main id="konten">`, title, actions slot, 1096 container (`size.content-max`) / 720 (`size.content-narrow`) | `c28-app-panel.html` |
| Sidebar | sidebar.md | `<nav aria-label="Utama">`, switcher slot, nav slots, collapse *Ciutkan sidebar*, account + *Keluar* | `c29-sidebar.html` |
| Sidebar compact mode + tablet shell | nav-rail.md | 72 rail (`size.rail`), Expand overlay (GAP-F02-2 decided: full Sidebar over the panel) | `c37-nav-rail.html` |
| MobileAppShell | mobile-app-shell.md | `<header>`, `<main>`, Bottom Nav, sheet layer; content `inert` while a sheet is open | `c35-mobile-app-shell.html` |
| AppShell | app-shell.md | skip link *Langsung ke konten* first, overlay layer (portal; the rest `inert`), breakpoints, collapse cookie | `c30-app-shell.html` |
| SplitLayout, EditorialPanel (moved) | auth design | unchanged output; editorial `children` slot | — (auth exports) |

Every unit gets a DOM test (roles, names, keyboard, states), a Storybook story (ADR-014; the a11y addon runs axe), and a `*.copy.ts` for its built-in strings (*Tutup*, *Ciutkan sidebar*, *Langsung ke konten*).

### Batch B — feature units

| Unit | Frames | Notes |
|---|---|---|
| OnboardingScreen + OnboardingForm | `BbSnR`/`z0GB3`, `ffqh6`/`lFOKQ`, `EoCGL`/`y1C8M`, `JCHet`/`x0AxCg` | SplitLayout; the "what you get" list; signed-in row (email + *Keluar* → F-01 `logoutAction` passed from `app/`) |
| WorkspacePreviewCard | `UTew4` | Rendered in the EditorialPanel slot, `aria-hidden`. No literals (GAP-F02-3 decided): shadow `elevation.2`, width `size.editorial-card`, marks `size.mark-sm`/`size.mark-md`. |
| OwnerShell + OwnerNav | all in-workspace frames | A-7 nav: Dasbor `/w/<id>`, Proyek `projects`, Klien `clients`, Invoice `invoices`, KATALOG: Layanan `services`, Tim `team`, Template pesan `message-templates`, Sumber klien `client-sources`, Pengaturan `settings`; mobile CTA `new-project`. Counts off. Search and Notifications hidden. |
| WorkspaceSwitcher | `Y20OZ`, `D1sDCL` | Desktop and rail: MenuTrigger (`aria-haspopup=menu`), *PINDAH WORKSPACE*, current = Selected, *+ Buat workspace*. Mobile: Actions sheet *Pindah workspace · N workspace*, current = checkmark. Choosing another item submits `switchWorkspaceAction`. |
| MoreSheet | `R5Wwrk` | Bottom Sheet/Menu: switcher entry, nav items, account |
| CreateWorkspaceDialog | `uuZRc`/`eyWYY`, `IZXw3`/`qe9tC`, `VPvsS`/`vUYBV` | Modal/SM with *Batal* (desktop); Form sheet (mobile); helper "Prefiks invoice: XX" computed live with the domain `suggestInvoicePrefix` |
| DashboardScreen | `gCkJa`/`K6WCRa`, `DUUnI` | Greeting + workspace name, empty state, Secondary *Lengkapi branding* → settings (AC-WS-023) |
| ComingSoonScreen | `B9WOJ`/`PlBRK` | The destination name and a link back to Dasbor. Reads nothing beyond the resolved context (AC-WS-025). |
| WorkspaceNotFoundScreen | `JJ8Ex`/`QUMXc` | The same screen for "not yours" and "doesn't exist" (A-9) |
| SettingsForm | `lEtZt`/`P1z3XX`, `RCZ3C`/`a944D`, `V3HqRv`/`hTxoz`, `Qbg5K`/`HRSHO` | 720 column; sections Identitas brand · Kontak · Invoice; currency disabled field "IDR"; global Toast Success *Perubahan tersimpan*; Danger on server error; values kept |

Forms follow F-01's pattern:
- React Hook Form + `zodResolver(<use-case schema>)`.
- A server field error is applied with `setError`; anything else becomes a focused Alert.
- The submit is disabled with progress copy while processing (AC-WS-024).

## Validation

- Canonical schemas sit beside the use cases: `createWorkspaceSchema` and `updateWorkspaceProfileSchema`, built from `schemas/workspace-fields`. The forms import the same schema (UX only), and the server re-parses (C-004; AC-WS-003/017).
- Zod strips unknown keys, so a `workspaceId`, `currency` or `ownerUserId` in a body is ignored (AC-WS-013).
- Route and action IDs go through `workspaceIdSchema` inside the resolver. A malformed ID is the same *not found*.
- The DB CHECKs mirror A-1, A-3, A-4 and BR-CUR-001 as the last line of defence.
- Redirect targets are built from resolved IDs and constants, never from raw input.

## Error Handling

`WorkspaceError extends DomainError` with codes `VALIDATION_FAILED`, `DUPLICATE_NAME`, `ALREADY_HAS_WORKSPACE` and `WORKSPACE_NOT_FOUND`.

| Code | UI |
|---|---|
| `VALIDATION_FAILED` | field errors (`ffqh6`, `RCZ3C`) |
| `DUPLICATE_NAME` | field error on the name (`ffqh6`, `IZXw3`) |
| `ALREADY_HAS_WORKSPACE` | redirect to `/workspace` (no UI) |
| `WORKSPACE_NOT_FOUND` | `notFound()` → *Workspace not found* (`JJ8Ex`), HTTP 404 |
| unexpected | a form-level Danger Alert with retry, values kept (`JCHet`, `Qbg5K`); logged with the request ID and workspace ID (C-007) |

Validation copy that isn't drawn (empty name, phone format and so on) comes from spec A-1…A-4 and is marked `// not in Pencil` for the Owner's copy review (as F-01 D-3).

## Concurrency / Consistency

- **Duplicate names and double submits:** the unique `(owner_user_id, lower(name))` index. The adapter maps the violation of that one constraint to `DUPLICATE_NAME`, and anything else is re-thrown. This is integration-tested with two concurrent creates (AC-WS-004).
- **Verify, then touch:** the touch filters by `id` **and** `owner_user_id` again, so a context that passed verification can only touch its own row, even if something changed in between. The conditional `last_opened_at < max(…)` makes repeat entries a no-op. Two tabs entering different workspaces at the same moment both succeed, and the later commit wins (last opened is last-write-wins, like A-10).
- **First workspace:** two onboarding submits with *different* names can both pass the zero check. That's acceptable: both are legitimate workspaces owned by the same Owner, and no invariant breaks. It's recorded as a known behaviour rather than locked.
- **Settings:** last-write-wins (A-10), a single-row update. A prefix change touches only that row (AC-WS-019, C-102).
- There are no multi-table writes in F-02, so no transactions are needed beyond single statements.

## Security

- The owner gate (`requireOwnerOrRedirect`, F-01) runs first on every F-02 page and action (AC-WS-015), then the workspace resolver (BR-WS-003). The Proxy stays a cookie-presence hint only.
- **Isolation:** every repository query filters by `owner_user_id`, plus `id` from `WorkspaceContext` where one applies (C-101). There is no `*Unscoped` function.
- **Verification runs in every page, loader and action, never only in the layout** (Next docs › Authentication › *Layouts and auth checks*; ADR-015).
- **`WorkspaceContext` is producible only by `verifyWorkspace`.** An ESLint `no-restricted-imports` rule forbids `asWorkspaceId` / `workspaceIdSchema` outside `features/workspace/application/use-cases/verify-workspace`, `adapters/db/workspace-repository`, `src/shared/workspace-context` and tests. A unit test fails if a new importer appears (AC-WS-014).
- **Not found, not forbidden:** the same 404 for all three cases, so no timing branch exists (A-9).
- The collapse cookie holds only `collapsed|expanded`. It's not sensitive and is validated on read.
- **Logs:** workspace ID and request ID only. Contact email, phone and address are never logged (C-103 spirit).

## Testing Strategy

- **Unit (Vitest):** domain; use cases over an in-memory `FakeWorkspaceRepository` (`tests/support/workspace`); composition helpers; every `src/ui` unit and feature UI unit (DOM, `@testing-library/user-event`).
- **Integration:** `DrizzleWorkspaceRepository` on the shared non-production Neon database. Each test creates its own users and workspaces with unique IDs (ADR-009).
- **E2E (Playwright):** the J-01 continuation (register → verify → onboarding → dashboard), switching, create, settings, *Segera hadir*, not found; viewports 1440, 1024 and 390; `@axe-core/playwright` on every F-02 page. Visual fidelity is a manual review against the exports (same policy as F-01 D-2).

| AC | Level | Iteration |
|---|---|---|
| AC-WS-001 | unit (resolve-owner-destination; resolution order: 0 workspaces beats *not found*) + E2E (`/profile`, `/w/<garbage>` with 0 workspaces → onboarding) | 6, 7, 9, 12 |
| AC-WS-002 | unit (create-first-workspace) + integration + E2E | 6, 7, 12 |
| AC-WS-003 | unit (domain, schema, use case) + integration (CHECK) | 5, 6, 7 |
| AC-WS-004 | unit (fake unique) + integration (concurrent create, cross-owner same name) | 6, 7 |
| AC-WS-005 | unit (suggestInvoicePrefix) | 5 |
| AC-WS-006 | unit + E2E | 6, 8 |
| AC-WS-007 | unit (create-workspace) + DOM (dialog) + E2E | 6, 10, 12 |
| AC-WS-008, 009 | unit + integration (find-last-opened after switch, create and a deep-link entry on "another device"; *Segera hadir* and `/profile` don't touch) + E2E | 6, 7, 12 |
| AC-WS-011 | unit (list order, isCurrent) + DOM (switcher) + E2E | 6, 10, 12 |
| AC-WS-012 | unit (verify-workspace, touch-last-opened) + integration (other Owner's ID: 404, nobody's last opened changes) + E2E | 6, 7, 12 |
| AC-WS-013 | unit (schema strips ID) + integration (update scoped) | 6, 7 |
| AC-WS-014 | unit (import-guard test) + lint rule | 6 |
| AC-WS-015 | unit (flows call the owner gate first) + E2E (unverified → /verify) | 7, 12 |
| AC-WS-016, 017 | unit (schema, use case) + integration (CHECK, `aw` → `AW`) + DOM + E2E | 5, 6, 7, 11, 12 |
| AC-WS-018 | unit (clientBrandName) | 5 |
| AC-WS-019 | integration (only the workspace row changes) | 7 |
| AC-WS-020 | unit (port method list; action exports) | 6, 7 |
| AC-WS-021 | DOM (shells, active item, collapse cookie) + E2E (three viewports, Profile in the shell) | 1–4, 9, 12 |
| AC-WS-022 | DOM (skip link first, landmarks, switcher keyboard) + Storybook a11y + E2E axe | 1–4, 12 |
| AC-WS-023 | DOM + E2E | 9, 12 |
| AC-WS-024 | DOM (each form: disabled while submitting, server error keeps values) | 8, 10, 11 |
| AC-WS-025 | unit (allow-list) + DOM + E2E (each section, active item, back link, no touch; unknown section → *Tidak ditemukan*) | 6, 9, 12 |

Every test title starts with its `AC-WS-*` / `BR-WS-*` ID.

## Implementation Iterations

Each iteration runs **plan → implement → test → verify → commit**, with one conventional commit per task (for example `feat(ui): add icon button`, `feat(workspace): add workspace schema`). An iteration is done only when the coding-rules quality gate passes: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, plus `pnpm test:integration` / `pnpm e2e` from the iteration where they start. **UI tasks stop until their HTML export exists** (AGENTS.md).

### Batch A — Design system (`src/ui`)

#### Iteration 1 — Primitives and small patterns
- [x] Exports (Pencil MCP, 2026-09-27): `c02-icon-button`, `c04-textarea`, `c13-count-badge`, `c16-avatar`, `c24-alert` in `docs/design-system/exports/`
- [x] Icon registry: the new semantic names (Hugeicons equivalents of the lucide names in design.md)
- [x] Alert `success` tone
- [x] IconButton (Ghost SM/MD), Avatar (MD, initials), CountBadge
- [x] Textarea (label row, optional, helper, error, disabled)
- [x] Tests + stories for each; `components/registry.json` has no code-status field to update
- **Done when:** the gate is green, each unit matches its export (manual review at 1:1), and the Storybook a11y panel is clean.

#### Iteration 2 — Navigation items
- [x] Exports (2026-09-27): `c22-nav-item`, `c34-bottom-nav`, `c37-nav-rail`
- [x] NavItem + NavGroupLabel (Default/Active, `aria-current`)
- [x] Tooltip; NavItem compact mode (Default/Hover/Active/Focus; the label is the accessible name)
- [x] BottomNavItem (Default/Active, colour + weight), BottomNav CTA, BottomNav (4 tabs + CTA, safe area)
- [x] Tests + stories
- **Done when:** the gate is green, keyboard focus and the tooltip timing are tested, and the units match the exports.

#### Iteration 3 — Overlays
- [x] Exports (2026-09-27): `c09-menu-item`, `c10-menu`, `c31-modal`, `c32-bottom-sheet`
- [x] Menu, MenuItem (Default/Selected/Disabled/Destructive, icon, check), MenuGroupLabel, MenuDivider; MenuTrigger wrapper
- [x] Modal SM/MD/LG (header, description, Close *Tutup*, body and actions slots, footer)
- [x] BottomSheet Actions/Form/Menu + SheetItem (Default/Destructive/Selected, Count); grabber `aria-hidden`; 90 dvh cap; reduced motion
- [x] Tests: focus trap, return focus, Esc, `inert`/scroll lock, keyboard menu navigation
- **Done when:** the gate is green, the overlay behaviour tests pass, and the units match the exports.

#### Iteration 4 — Shell templates
- [x] Exports (2026-09-27): `c28-app-panel`, `c29-sidebar`, `c30-app-shell`, `c35-mobile-app-shell` (+ `c37` from Iteration 2)
- [x] Tokens (G8 pipeline, first task of the iteration):
  - Add `size.sidebar` = 252 (T5), `size.mark-md` = 20 and `size.mark-lg` = 22 to `gen_tokens.py`, plus the alias `sidebar.width` → `size.sidebar`.
  - Back-fill T1–T4 (`size.auth-panel`, `size.auth-form`, `space.16`, `font.size.hero`) into `gen_tokens.py` (R-6).
  - Regenerate `tokens.json`/`pencil-mapping.json`, then `pnpm tokens:css`, then `pnpm tokens:check`.
  - The Owner runs `/sdv:sync-pencil` so Pencil gets the variables (this also closes drift F-6).
- [x] Tablet Expand overlay (GAP-F02-2 decided): the full Sidebar as an overlay above the panel, never pushing it. React Aria `ModalOverlay` with the `overlay.scrim` backdrop. Esc, a scrim click and the Sidebar's collapse button close it; focus is trapped and returns to Expand. Styled from the `c29-sidebar` export (no frame of its own).
- [x] AppPanel + PageContent (wide 1096 / narrow 720)
- [x] Sidebar (logo row + collapse, switcher slot, nav and nav-bottom slots, account + log-out slot)
- [x] Sidebar compact mode + tablet layout; Expand overlay per the decision
- [x] MobileAppShell (app bar title, content, Bottom Nav, sheet layer)
- [x] AppShell: responsive composition and skip link first; owner-shell cookie integration remains a Batch B concern
- [x] Move `AuthSplitLayout` → `ui/patterns/split-layout` and `EditorialPanel` → `ui/patterns/editorial-panel` (headline → `children`); update F-01 imports; auth DOM tests stay green
- [x] Stories: the responsive shell uses sample nav data at the 1440/1024/390 breakpoints
- **Done when:** the gate is green, F-01's tests and a manual check of `/login` are unchanged, AC-WS-021/022 are covered at component level, and the units match the exports. **Batch A checkpoint:** optionally run `/sdv:verify-design-system` before Batch B.

### Batch B — Workspace feature

#### Iteration 5 — Domain and schema
- [x] Domain units: workspace-name, invoice-prefix, workspace-profile, owner-user-id (AC-WS-003/005/017/018 unit tests)
- [x] Drizzle `workspace` table + barrel export; `pnpm db:generate` → `drizzle/0001_workspace.sql`; review it (CHECKs, unique `lower(name)` index, FK to `user`)
- [x] Migration `0001_workspace.sql` applied successfully with Owner authorization.
- **Done when:** the unit gate is green, the migration is reviewed and committed, and the Owner confirms it's applied.

#### Iteration 6 — Application
- [x] Port, errors, field schemas, `FakeWorkspaceRepository`
- [x] Use cases: resolve-owner-destination, find-last-opened, verify-workspace, touch-last-opened, create-first-workspace, create-workspace, list-owner-workspaces, get/update-workspace-profile
- [x] Domain constant `COMING_SOON_SECTIONS` (English slugs) + `isComingSoonSection`
- [x] Workspace ID boundary and import-guard tests (AC-WS-014)
- **Done when:** the unit gate is green and every application-level AC in the table has a passing test.

#### Iteration 7 — Adapter, composition, actions
- [x] `DrizzleWorkspaceRepository` (unique-violation mapping; read-only `findForOwner`; conditional `touchIfNotLatest`)
- [x] Integration tests for workspace repository and flows (AC-WS-002/003/004/008/009/012/013/017/019)
- [x] `composition/workspace/*`: scope, destination, resolution order + `verifyWorkspace` + `enterWorkspace`, `resolveOwnerHome`, flows
- [x] Server actions `app/actions/workspace/*`; action-exports test (AC-WS-020)
- **Done when:** `pnpm test:integration` is green, the full gate and `pnpm build` are green, and F-01's integration tests still pass with the real destination.

#### Iteration 8 — Onboarding
- [x] Pencil (GAP-F02-3, 2026-09-27): the `UTew4` card shadow (`Wk19T`) is bound to `$G:color/semantic/elevation/2/color`, `$G:elevation/2/offset-y` and `$G:elevation/2/blur`.
- [x] Tokens: add `size.editorial-card` = 360 and `size.mark-sm` = 14 through the pipeline. The code uses them where Pencil keeps literal 360 / 14 / 20 (it can't bind sizes).
- [x] Exports (2026-09-27): `onboarding-BbSnR`, `onboarding-z0GB3`, `onboarding-duplicate-ffqh6`, `onboarding-duplicate-lFOKQ`, `onboarding-processing-EoCGL`, `onboarding-processing-y1C8M`, `onboarding-error-JCHet`, `onboarding-error-x0AxCg`. The mosaic `url()` in the 4 desktop files was corrected to `../../../../public/…`, because Pencil writes it relative to the `.pen` file, not to `exports/`.
- [x] `/onboarding/workspace` page, OnboardingScreen/Form, workspace preview card, signed-in row
- [x] `/workspace` redirector
- **Done when:** the gate is green, DOM tests cover the 4 states (AC-WS-006, 024), and the page matches the exports at 1440 and 390.

#### Iteration 9 — Owner shell and in-workspace pages
- [x] Exports (2026-09-27): `dashboard-gCkJa`, `dashboard-K6WCRa`, `dashboard-tablet-DUUnI`, `more-menu-R5Wwrk`, `coming-soon-B9WOJ`, `coming-soon-PlBRK`, `not-found-JJ8Ex`, `not-found-QUMXc`
- [x] OwnerNav config + active matching; OwnerShell (Sidebar, rail, mobile, MoreSheet); `w/[workspaceId]/layout.tsx`
- [x] Dashboard (AC-WS-023, `enterWorkspace`), `[section]` Segera hadir (AC-WS-025; allow-list, `verifyWorkspace` only), `w/not-found.tsx` (AC-WS-012)
- [x] DOM/unit audit: every page under `/w/[workspaceId]` calls the resolver itself (not only the layout)
- [x] `profile/layout.tsx`: F-01 Profile inside the shell (AC-WS-001, 021)
- [x] Route audit: `notFound()` from the `[workspaceId]` layout reaches `w/not-found.tsx` in Next 16.3
- **Done when:** the gate is green and the pages match the exports at 1440, 1024 and 390.

#### Iteration 10 — Switcher and create workspace
- [x] Exports (2026-09-27): `switcher-Y20OZ`, `switcher-D1sDCL`, `create-workspace-uuZRc`, `create-workspace-eyWYY`, `create-workspace-duplicate-IZXw3`, `create-workspace-duplicate-qe9tC`, `create-workspace-processing-VPvsS`, `create-workspace-processing-vUYBV`
- [x] WorkspaceSwitcher (desktop Menu) → `switchWorkspaceAction`
- [x] CreateWorkspaceDialog (Modal/SM · Form sheet), prefix helper
- **Done when:** the gate is green, DOM tests cover AC-WS-007/011/024 and switcher keyboard use (AC-WS-022), and the units match the exports.

#### Iteration 11 — Workspace settings
- [x] Exports (2026-09-27): `settings-lEtZt`, `settings-P1z3XX`, `settings-errors-RCZ3C`, `settings-errors-a944D`, `settings-saved-V3HqRv`, `settings-saved-hTxoz`, `settings-server-error-Qbg5K`, `settings-server-error-HRSHO`
- [x] `/w/[id]/settings` page + SettingsForm (bound action; success Toast; currency read-only)
- **Done when:** the gate is green, DOM tests cover AC-WS-016/017/024, and the page matches the exports.

#### Iteration 12 — Journeys and docs
- [x] Workspace-specific Playwright journeys and axe coverage (3 journeys passed, including axe at 1440/1024/390).
- [x] Log audit (no contact data in workspace logs).
- [x] Record deviations and update this file, feature-map, and HANDOFF.
- **Done when:** unit, integration and E2E are green; ready for `/sdv:verify-feature workspace`.

## Risks / Open Questions

- **Verification note (2026-09-28):** Batch B application, routes, adapter, composition, onboarding, shell, profile, switcher, create flow, and settings passed the dedicated Workspace verification. Three Playwright journeys pass (including axe at 1440, 1024 and 390 px); the unit suite (305), integration suite (38), typecheck, lint, token check and production build pass. Visual fidelity remains the approved manual export review policy; see [verification-report.md](verification-report.md) for the non-blocking Pencil and route-source-test follow-ups.

- **ADR-015 — ACCEPTED (Owner 2026-09-27).** CONFLICT-ADR015-1 was resolved as option (b), so BR-WS-006 is unchanged. Route slugs are English.
- **GAP-F02-2 — Tablet Expand overlay. DECIDED (Owner 2026-09-27): build it** per nav-rail.md › Rules: the full Sidebar over the panel, never pushing it; Esc or an outside click closes it.
  - It has no Pencil frame. It's styled from the `c29-sidebar` export over `overlay.scrim` (Iteration 4).
  - The nav-rail.md gap "not drawn" stays open for a later design pass; it isn't a deviation.
  - Owner-approved deviations recorded 2026-09-28: C38 Empty State (C36 remains Combobox), Button loading, C39 Toast with separate desktop/mobile shell slots, and the mobile workspace-switcher checkmark.
- **DESIGN TOKEN GAP T5 — sidebar width. DECIDED (Owner 2026-09-27):**
  - Add `size.sidebar` = 252, aliased by `sidebar.width`.
  - The Sidebar's logo mark (22) and workspace mark (20), which are literal in sidebar.md, get `size.mark-lg` = 22 and `size.mark-md` = 20.
  - All are added in Iteration 4 through `gen_tokens.py`, then `/sdv:sync-pencil`.
- **GAP-F02-3 — WorkspacePreviewCard literals. DECIDED (Owner 2026-09-27): the code uses no literals.**
  - **Shadow → the existing `elevation.2`** (colour, offset-y, blur): the card is a floating layer.
    - **Done in Pencil on 2026-09-27:** `UTew4` is rebound, so the literal `#00000059`/48 is gone, and the exports show `0 16px 40px` with the elevation colour.
    - In light mode `elevation.2` is lighter (neutral-900 at 14 %) than the old 35 % black.
  - **Width 360 → new `size.editorial-card`; marks 14 / 20 → new `size.mark-sm` / `size.mark-md` (from T5).** These are code tokens only.
    - Pencil can't bind sizes to variables. It keeps literal 360 / 14 / 20, which is the same documented limitation as `size.rail`, the modal widths and the bottom-nav sizes.
    - The tokens are added in Iteration 8, and the code uses them.
- **R-6 — Token generator drift.** T1–T4 (F-01) were added to `tokens.json` directly, not to `docs/design-system/scripts/gen_tokens.py`, so regenerating would drop them. Iteration 4's token task back-fills them into the generator first.
- **R-7 — More literal sizes in Batch A.** The component specs mark several sizes as literal because Pencil can't bind size: modal widths 400/560/720, bottom-nav item 64 and CTA 54, sheet item 52 / max 560, avatar, rail item 40.
  - Each Batch A iteration first checks these against existing tokens (`space.*`, `size.*`).
  - A value with no token is reported as a DESIGN TOKEN GAP before that unit is built, never hard-coded.
- **Token drift F-6** (T1–T4 not in Pencil) doesn't block the code, but the onboarding exports carry literal 600/420/64. Map them to `size.auth-panel`, `size.auth-form` and `space.16`, which already exist in `tokens.css`.
- **R-1 — Exports. DONE (2026-09-27), all 32 frames.** Exported through Pencil MCP `Export(…, "html-tailwind", …)`, the same scaffold as the F-01 exports. There are 32 frames in `docs/features/workspace/exports/` and 16 component pages in `docs/design-system/exports/`. The 8 onboarding frames followed after the `UTew4` shadow rebind. Re-export any frame whose design changes before its iteration is built.
- **R-2 — Next 16 not-found boundaries.** A layout's `notFound()` is caught by the parent segment's `not-found.tsx`. Confirm this in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` at Iteration 9. Fallback: the `[workspaceId]` layout renders the not-found screen directly and sets 404 through `notFound()` in the page.
- **R-3 — An unknown `[section]` shows *Tidak ditemukan*.** A section outside `COMING_SOON_SECTIONS` calls `notFound()` and falls through to `w/not-found.tsx` (ADR-015). The copy review can split "page" from "workspace" not found later.
- **R-4 — Page GET writes.** `enterWorkspace` may touch on a page render. A prefetch of the current workspace is a no-op because of the conditional touch. Pages of another workspace are never linked (switching is a POST), so a prefetch can't count them as opened (ADR-015).
- **R-5 — F-01 file changes:** the `auth-scope` stub is replaced, the split layout and editorial panel imports move, and `/profile` gets a layout. F-01's unit, integration and E2E suites must stay green.
- **Copy:** strings not drawn in Pencil are marked `// not in Pencil` for the Owner's review (like F-01 D-3).
- **Known behaviour:** two concurrent first-workspace submits with different names both succeed (see Concurrency).
