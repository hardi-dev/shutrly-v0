# ADR-015: URL-scoped workspace context with a server-side last-opened time

Status: Accepted (Owner 2026-09-27)
Date: 2026-09-27

## Context

F-02 must resolve an "active workspace" for every owner request, and verify that the Owner owns it (BR-WS-003, C-004, C-101). Sign-in must open the workspace the Owner opened most recently, on any device, with no selection step (BR-WS-006 as amended 2026-09-27, A-5; AC-WS-010 deprecated). There are two common shapes:

- **Session-scoped:** the active workspace is server state (a cookie or the last-opened row), and URLs carry no workspace ID (`/dashboard`).
- **URL-scoped:** every in-workspace URL names the workspace (`/w/<id>/…`).

With session-scoped state, two tabs share one active workspace. A switch in tab B silently retargets a settings save still open in tab A. That is a cross-workspace write, which C-101 forbids.

Next.js layouts are not a security boundary. They don't re-render on client navigation, and they don't stop the page segment below them from rendering (Next docs › Authentication › *Layouts and auth checks*). Checks belong next to the data, in every page, loader and action.

F-01 fixes two entry points (auth technical design, SPEC GAP-2): `ONBOARDING → /onboarding/workspace` and `WORKSPACE → /workspace`.

## Decision

### Routes

| Route | Behaviour |
|---|---|
| `/onboarding/workspace` | Only for an Owner with zero workspaces. With one or more, it redirects to the last-opened workspace and creates nothing (AC-WS-006). Submitting runs a server action (POST): create + touch → `/w/<new>` (AC-WS-002). |
| `/workspace` | Redirects to `/w/<last opened>`, or to `/onboarding/workspace` when the Owner has none (AC-WS-001, AC-WS-008/009). |
| `/w/<id>` | Dashboard (AC-WS-023). Entering it from outside the workspace touches last opened (see *Verify and touch*). |
| `/w/<id>/settings` | Workspace settings. Entering it from outside the workspace touches last opened. |
| `/w/<id>/<section>` | *Segera hadir*, only for the allow-listed sections below (AC-WS-025). Anything else → `notFound()`. |
| "Buat workspace" (switcher) | A server action (POST): create + touch → redirect to `/w/<new>` (AC-WS-007). It has no route of its own. |
| Switch (switcher) | A server action (POST): verify + touch → redirect to `/w/<id>` (AC-WS-011). Never a link to another workspace, so link prefetching can't count a workspace as opened. |
| `/profile` (F-01) | Rendered inside the App Shell of the last-opened workspace. **Read only**: verify, no touch (AC-WS-021). |

**Section allow-list.** One constant, `COMING_SOON_SECTIONS`, holds the known destinations whose feature isn't built yet. The slugs match the navigation from A-7 and SPEC GAP-F02-1 (option c):

```ts
export const COMING_SOON_SECTIONS = [
  "projects",          // Proyek
  "clients",           // Klien
  "invoices",          // Invoice
  "services",          // Layanan
  "team",              // Tim
  "message-templates", // Template pesan
  "client-sources",    // Sumber klien
  "new-project",       // Bottom Nav CTA "Proyek baru"
] as const;
```

- A `<section>` not in this list calls `notFound()`. That renders the design's *Tidak ditemukan* screen (`JJ8Ex` / `QUMXc`), inside the App Shell.
- *Segera hadir* reads no data and writes nothing. It still verifies the workspace first (AC-WS-025, BR-WS-003).
- A later feature replaces its placeholder by adding a static segment, for example `/w/[workspaceId]/projects/page.tsx`. Next matches static segments before the dynamic `[section]`. The feature then removes its slug from `COMING_SOON_SECTIONS` in the same change.

### Resolution order

Every owner page, loader and action resolves in this order. It stops at the first step that doesn't pass:

1. **F-01 gate** (`requireOwnerOrRedirect`): no session → `/login`; unverified → Verification pending; `SUSPENDED` or `DISABLED` → Account unavailable (BR-AUTH-003, BR-AUTH-005, AC-WS-015). No workspace data is read before this step.
2. **Zero workspaces → `/onboarding/workspace`**, for every owner page: `/workspace`, `/profile`, and `/w/<anything>`, whether the ID is valid, missing, malformed or another Owner's (BR-AUTH-004, AC-WS-001). An Owner with no workspace is never shown *not found*.
3. **The workspace claim:** a malformed ID, an ID that doesn't exist, and an ID owned by another Owner all give the **same** *not found*. That means the same screen, the same status (404) and no workspace data (A-9, AC-WS-012).

### Verify and touch

These are two separate operations in `features/workspace/application`:

- **`verifyWorkspace(ownerUserId, rawId)`** reads only.
  - It parses `rawId` with `workspaceIdSchema`, then runs `SELECT … FROM workspace WHERE id = $1 AND owner_user_id = $2`.
  - It returns a `WorkspaceContext` (plus the summary the shell needs), or `WORKSPACE_NOT_FOUND`. It writes nothing.
  - It is the **only** producer of a `WorkspaceContext` outside tests, and a lint rule enforces this (AC-WS-014).
- **`touchLastOpened(context)`** writes.
  - It runs `UPDATE workspace SET last_opened_at = now() WHERE id = $1 AND owner_user_id = $2`.
  - It takes a verified `WorkspaceContext` plus the Owner's user ID from the F-01 gate, never a raw ID.
  - It runs only at these points (BR-WS-006):
    1. **Create:** from onboarding or the switcher, in the same use case as the insert. The insert itself sets `last_opened_at = now()`.
    2. **Switch:** the POST action, after `verifyWorkspace`.
    3. **Entering any workspace page from outside that workspace** (BR-WS-006 as written, CONFLICT-ADR015-1 resolved as option (b)). This includes the dashboard, Workspace settings and every later feature page; a pasted or bookmarked deep link; and the redirect from `/workspace`.
       - The *Segera hadir* placeholder is the only exception: AC-WS-025 and SPEC GAP-F02-1 say it makes no writes.
       - It's implemented as a **conditional touch**: `… WHERE id = $1 AND owner_user_id = $2 AND last_opened_at < (SELECT max(last_opened_at) FROM workspace WHERE owner_user_id = $2)`. The update applies only when the workspace isn't already the Owner's most recently opened one. So only the first page entered from outside writes. Later pages, re-renders and prefetches inside the current workspace are no-ops.
       - Pages call it through one entry point, `enterWorkspace(rawId)` = `verifyWorkspace` + conditional touch. *Segera hadir* and `/profile` call `verifyWorkspace` only.

**Where verification runs.** Every page, data loader and server action under `/w/[workspaceId]` calls `verifyWorkspace` itself, directly or through `enterWorkspace` (BR-WS-003, AC-WS-014).
- The layout may also call `verifyWorkspace` (deduplicated per request with React `cache`), to render the shell. The layout never touches: the touch belongs to the page, so *Segera hadir* stays write-free.
- The layout is **never** the only check: pages and actions don't rely on the layout having run.
- Actions never take a workspace ID from the form body. They are bound to the route's ID on the server, and that ID is verified again before any write (AC-WS-013).

**AC-WS-012 holds.** Another Owner's ID fails `verifyWorkspace`, so there is no `WorkspaceContext` and no touch. `touchLastOpened` also filters by `owner_user_id` as defence in depth. Nobody's `last_opened_at` changes.

### Storage

- `last_opened_at timestamptz NOT NULL` lives on the `workspace` row, so it follows the Owner across devices (A-5). Every workspace gets one when it's created, so a last-opened workspace always exists once the Owner has any.
- The `workspace` table is the tenant root: `owner_user_id text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT`. Identity stays Better Auth's (ADR-002); the workspace references it and never copies it.
- There is no archive or delete route, action or repository method (BR-WS-007).

## Alternatives Considered

- **Session-scoped active workspace (cookie or last-opened only):** shorter URLs, but the multi-tab cross-write above breaks C-101.
- **A slug in the URL instead of a UUID:** readable, but names are editable and only unique per Owner, which adds a lookup and a rename problem. It can be added later.
- **One resolver that always runs `UPDATE … RETURNING`** (verify and touch in one statement): simpler, but every page, loader, action and prefetch would write. Read-only renders such as `/profile` and *Segera hadir* would then count as opening. Rejected in favour of a read-only verify plus an explicit touch.
- **Verifying only in the `[workspaceId]` layout:** layouts don't re-render on client navigation and don't gate their child segments (Next docs), so a page or action could run unverified. Rejected.
- **Touching only when entering through the dashboard, switch or create** (CONFLICT-ADR015-1 option (a)): fewer write points, but a pasted deep link such as `/w/<id>/settings` wouldn't count as opening. That narrows BR-WS-006 and would need an amendment to the business rule. Rejected (2026-09-27) in favour of option (b), which needs no amendment.
- **Detecting "from outside" with a referrer, cookie or navigation flag:** unreliable (it's absent on pasted URLs and differs per tab). The conditional `WHERE … < max(last_opened_at)` gives the same result from server state alone.
- **Recording last opened only at sign-in:** a pasted URL or a switch wouldn't count as opening, which contradicts BR-WS-006.

## Consequences

### Positive

- Tabs are independent, and every write names its workspace explicitly and is re-verified.
- Only create, switch and the first page entered from outside a workspace change `last_opened_at`, and only for a verified context. So an unowned ID can't change anyone's last-opened time (AC-WS-012). `/profile`, *Segera hadir*, loaders and non-switch actions never write it.
- BR-WS-006 holds as written: any way of opening a workspace, including a deep link, counts.
- The resolution order gives a zero-workspace Owner onboarding everywhere, and everyone else a single, non-probeable *not found* (AC-WS-001, A-9).
- Later features get their routes by adding a static segment and removing one slug from `COMING_SOON_SECTIONS`.

### Negative / Trade-offs

- Every page and action repeats the `verifyWorkspace` read. React `cache` removes the duplicate within one request, but each navigation costs one indexed lookup.
- A page GET may write (the conditional touch). It's idempotent within the current workspace. Switching is a POST, so no link ever points at another workspace's pages, and a prefetch can't count another workspace as opened.
- A deep link to *Segera hadir* from outside doesn't update last opened (the AC-WS-025 "no writes" exception). Once a later feature replaces the placeholder with a real page, that page touches like any other.
- The conditional touch adds a subquery on `(owner_user_id, last_opened_at)`, which is covered by the owner/last-opened index.
- `/profile` has no workspace in its URL. Its shell shows the last-opened workspace, read-only.

### Resolved conflict

- **CONFLICT-ADR015-1 — BR-WS-006 vs a dashboard-only touch. RESOLVED 2026-09-27 as option (b):** the touch applies to the first page entered from outside a workspace, on any page except *Segera hadir* (AC-WS-025). BR-WS-006 is unchanged. Option (a), dashboard/switch/create only, was rejected because it would narrow the business rule.

### Route language

- **Slugs are English** (Owner 2026-09-27), matching F-01's routes (`/login`, `/profile`) and the code identifiers. Examples: `/w/<id>/settings`, `projects`, `message-templates`. Only the UI copy is Indonesian (coding rules › Language).

## Related

- Constitution: C-004, C-101
- Business rules: BR-AUTH-003, BR-AUTH-004, BR-AUTH-005, BR-WS-002, BR-WS-003, BR-WS-006, BR-WS-007
- Acceptance criteria: AC-WS-001, AC-WS-006, AC-WS-007, AC-WS-011, AC-WS-012, AC-WS-013, AC-WS-014, AC-WS-015, AC-WS-021, AC-WS-025
- Feature docs: `docs/features/workspace/spec.md` (A-5, A-7, A-9, SPEC GAP-F02-1), `design.md` (*Segera hadir*, *Tidak ditemukan*), `docs/features/auth/technical-design.md` (SPEC GAP-2)
- ADRs: ADR-002, ADR-003, ADR-009
