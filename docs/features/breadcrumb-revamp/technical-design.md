# Technical design — Breadcrumb revamp (F-22)

Spec: [spec.md](spec.md) · Acceptance criteria: [acceptance-criteria.md](acceptance-criteria.md) · ADR: [ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md)
Status: PLANNED (2026-10-12; revised after review the same day). Iteration 7 is BLOCKED on OQ-5.

## 1. Context
Today the trail is built in three places:
- the Owner shell (`owner-shell.tsx`, from `owner-nav.tsx` resolvers);
- per-page `PageHeadingOverride` calls (project, gallery, picks, service pages), which report in a `useEffect`, so the first paint shows a shorter trail;
- the client screens (`review-text.ts`, `client-browse-screen.tsx`, `pick-screen.tsx`, `delivery-screen.tsx`), which render on the server through `ClientShell` and have no flash.

The plan:
- **Owner:** the trail moves to a server-rendered parallel route slot `@crumbs` (ADR-025), built by one pure function. `PageHeadingOverride` keeps the title, status, meta and phone back target, and stops touching the trail.
- **Client:** composition changes only, plus removing the A-31 redirect.
- **Sidebar toggle:** a `leading` slot in the breadcrumb bar.

Flagged concerns FC-001…FC-005 are all `RESOLVED` in [spec.md](spec.md); this plan follows their decisions. Pencil frames are waived for everything except OQ-5 (spec › *Design*).

## 2. Relevant business rules and constitution
- **BR-WS-003, C-101, C-004:** slot pages verify the workspace through `verifyOwnerWorkspace`, and every name comes from a scoped loader. A foreign project, service or group gives `notFound()` (AC-CRUMB-012).
- **BR-ACC-003, C-104:** client crumbs use only names from the token's access view.
- **BR-SEL-001:** a project with zero groups lands on Beranda (R-7).
- **BR-SEL-005, F-10 D-2:** a non-`OPEN` group's Pilih page redirects to its review, so the review's group crumb is plain text (R-5 exception).
- **C-008:** `<nav aria-label="Breadcrumb">`, keyboard links, `aria-current="page"`.
- **ADR-018:** the slot adds at most one small cached lookup per name per request.

## 3. Database
No changes. No migration.

## 4. Server and application interface
No new server action or API route. New read-only loaders in `src/composition/` (§5.2). Existing views already carry the names: `SelectionGroupsView.projectTitle` (`list-selection-groups.ts:33`), `SelectionGroupDetailView.projectTitle` (`get-selection-group-detail.types.ts:14`), `page.project.title` (gallery), `loadProjectDetail`, `loadServiceDetail`.

## 5. Logic

### 5.1 Pure trail builder (Owner)
New unit `src/features/workspace/domain/owner-trail/owner-trail.ts` (+ `.types.ts`, `.test.ts`). No React import.

```ts
interface TrailCrumb { readonly label: string; readonly href?: string } // no href = plain text

// Root first, then ancestors, then the current page (R-1, R-2, R-5).
ownerTrail(input: {
  workspaceId: string;
  workspaceName: string;
  ancestors: readonly TrailCrumb[];
  current: string;
  isRoot?: boolean;            // the Dashboard: returns [{ label: current }]
}): readonly TrailCrumb[]

// Fixed labels for the catch-all slot (sections, tabs, `new`, Segera hadir).
// Returns null for an unknown path, so the main route's notFound() decides.
staticOwnerTrail(segments: readonly string[], ctx: { workspaceId; workspaceName }): readonly TrailCrumb[] | null
```

`staticOwnerTrail` covers `projects`, `projects/completed`, `projects/cancelled`, `projects/new`, `clients`, `clients/archived`, `team`, `team/archived`, `team/roles`, `services`, `services/categories`, `services/items`, `message-templates`, `photo-sources`, `settings`, `invoices`, `search`, `notifications`. Labels come from `OWNER_NAV_COPY` (including `projectTabs`, `clientTabs`, `teamTabs`, `serviceTabs`) and `PROJECT_COPY.createTitle`.

**Labels vs. titles (R-3).** The crumb label and the page `<h1>` are separate. The resolvers in `owner-nav.tsx` keep returning `title` (the `<h1>`: *Proyek* on every projects tab), and the builder sets the crumb label (*Selesai*). `PageHeading.breadcrumbs` is removed from `owner-nav.types.ts` in iteration 4.

### 5.2 Name loaders (Owner)
New unit `src/composition/workspace/owner-trail-names/owner-trail-names.ts`, each function wrapped in React `cache()`:
- `loadTrailWorkspace(rawWorkspaceId)` → `{ id, name }` through `verifyOwnerWorkspace`;
- `loadTrailProject(rawWorkspaceId, rawProjectId)` → `{ title }`, scoped to the workspace;
- `loadTrailService(rawWorkspaceId, rawServiceId)` → `{ name }`;
- `loadTrailGroup(rawWorkspaceId, rawProjectId, rawGroupId)` → `{ name }`, scoped to the project.

Each one validates its raw ids like the existing loaders, throws `notFound()` for a missing or foreign entity, and reads through the existing scoped repositories. The builder looks up the repository read used by `loadProjectDetail`, `loadServiceDetail` and `loadSelectionGroupDetail` and reuses it; it does not write new SQL if a scoped read exists. The template label needs no DB: slug → `TEMPLATE_COPY[type].label`, or `null` for an unknown slug.

### 5.3 Slot routes (ADR-025)
Under `src/app/(owner)/w/[workspaceId]/@crumbs/`:

| File | Trail |
|---|---|
| `default.tsx` | `null` (Next 16 requirement) |
| `page.tsx` | `Dasbor` |
| `[...segments]/page.tsx` | `staticOwnerTrail(segments)`; `null` when unknown |
| `projects/new/page.tsx`, `projects/completed/page.tsx`, `projects/cancelled/page.tsx` | static mirrors (iteration 3) |
| `projects/[projectId]/page.tsx` | Aster › Proyek › {judul} |
| `projects/[projectId]/gallery/page.tsx` | … › {judul} › Galeri |
| `projects/[projectId]/gallery/picks/page.tsx` | … › Galeri › Pilihan klien |
| `projects/[projectId]/gallery/picks/[groupId]/page.tsx` | … › Pilihan klien › {grup} |
| `services/categories/page.tsx`, `services/items/page.tsx` | static mirrors (iteration 3) |
| `services/[serviceId]/page.tsx` | Aster › Layanan › {nama} |
| `message-templates/[templateType]/page.tsx` | Aster › Template pesan › {label} |

Each slot page is a thin route file (coding rules › Next.js): load names, call the builder, render `<BreadcrumbTrail>` with the items (server-rendered; `BreadcrumbTrail` is a client component with serializable props). The mirrors reuse the catch-all's function.

**Rule for future routes:** every static sibling of a dynamic slot segment needs a mirror. A test lists the main-tree routes and fails if one has no slot match (§10).

### 5.4 Wiring
- `src/app/(owner)/w/[workspaceId]/layout.tsx` receives `crumbs` and passes it to `OwnerShell`.
- `OwnerShell` → `AppShell` (`panelCrumbs?: ReactNode`) → `AppPanel` → `PageHeader` (`trail?: ReactNode`). When `trail` is set, `BreadcrumbRow` renders it in place of the generated `BreadcrumbTrail`.
- `src/app/(owner)/profile/layout.tsx` passes the static trail *Profil* (no slot outside `/w`).
- **Transition (iterations 2–3):** a pure allow-list `hasServerTrail(pathname, workspaceId)` in the same unit decides whether `OwnerShell` uses `crumbs` or the old assembly. It grows per iteration and is deleted in iteration 4 together with the old assembly. Each commit therefore keeps every route with a correct or previous trail, never an empty bar.

### 5.5 Client trails
- `reviewHeader` (`review-text.ts`): the read-only branch returns `Beranda › {grup} (no href) › Tinjau`. The editable branch is unchanged.
- `src/app/(client)/g/[token]/page.tsx`: remove the `ALL_PHOTOS` redirect. Beranda renders with the *Semua foto* card only.
- `client-browse-screen.tsx` `baseHeader`: when the project has no groups, keep the title (project title) and the subtitle (`subtitleNoGroups`) and change only the trail to `Beranda › Semua foto` and add the `back` to Beranda. Rename `hasHome` to `hasGroups` (what it now means). Its value is still computed from the client home view (no groups and no final delivery).
- `clientLanding` (`client-home.ts`): it drives no redirect any more. If `rg clientLanding` then finds only the photos page, replace its use there with a `hasGroups` flag from the home view and delete the function and its test. Otherwise keep it and update its doc comment.

## 6. UI components

| Component | Change | Iteration |
|---|---|---|
| `PageHeader` (`page-header.tsx`, `.types.ts`) | `trail?: ReactNode` (replaces generated trail); `leading?: ReactNode` (toggle) | 2, 6 |
| `AppPanel` (`app-panel.tsx`, `.types.ts`) | pass `trail`, `leading`; remove the English default `parent = "Workspace"` | 2, 4, 6 |
| `AppShell` (`app-shell.tsx`, `.types.ts`) | `panelCrumbs`; toggle | 2, 6 |
| `OwnerShell` (`owner-shell.tsx`) | uses `crumbs`; old `panelBreadcrumbs` assembly removed | 2, 4 |
| `owner-nav.tsx`, `.types.ts` | `breadcrumbs` removed from resolvers and `PageHeading` | 4 |
| `PageHeadingOverride` | unchanged contract (`parent` stays: phone Compact Bar target) | — |
| `Sidebar` (`sidebar.tsx`, `.types.ts`) | remove `onCollapse`, `onExpand`, logo-row and rail buttons | 6 |
| Client header helpers | composition only | 5 |

**Copy.** New strings go into `*.copy.ts` (lint `local/ui-copy`). The literal `"Layanan"` in `services/[serviceId]/page.tsx` becomes `OWNER_NAV_COPY.services` (iteration 3).

## 7. Validation and errors
- Slot pages validate raw ids like the existing loaders (`galleryIdOrNotFound` and equivalents).
- A missing or foreign entity → `notFound()` in the slot, the same as the page.
- A name loader that throws an unexpected error → the route's error boundary, as for the page. No guessed name is rendered (spec › Error Cases).

## 8. Security and tenancy
- No name is read without a workspace check (C-101). The group loader also checks that the group belongs to the project.
- The slot renders on the server only; no raw id or name is sent that the page itself doesn't already send.
- Client trails read only the token's access view (C-104).

## 9. Concurrency
None.

## 10. Testing strategy (AC → test)

| AC | Test |
|---|---|
| AC-CRUMB-001 | `owner-trail.test.ts` (`isRoot`), e2e `app-shell-revamp.spec.ts` (replaces *Aster Wedding Dasbor*) |
| AC-CRUMB-002 | `owner-trail.test.ts` › `staticOwnerTrail` per section |
| AC-CRUMB-003 | `owner-trail.test.ts` › tab routes; `owner-nav.test.tsx` titles stay the section name |
| AC-CRUMB-004, 006 | `owner-trail.test.ts` with ancestors; `owner-trail-names.test.ts`; e2e on project, gallery, service, template pages |
| AC-CRUMB-005 | same, for picks and a picks group |
| AC-CRUMB-007 | `owner-shell.test.tsx` or profile layout test: `Profil` only |
| AC-CRUMB-008 | `review-text.test.ts`: editable vs read-only (no href on the group crumb) |
| AC-CRUMB-009 | `client-browse-screen` test (title, subtitle, trail, back); e2e: a project without groups lands on Beranda |
| AC-CRUMB-010 | `page-header.test.tsx`: nav label, link focus order, `aria-current`, the plain-text exception not focusable |
| AC-CRUMB-011 | e2e: fetch the gallery URL and assert the server HTML contains the full trail; client navigation asserts the first visible trail |
| AC-CRUMB-012 | `owner-trail-names.test.ts` (foreign project/service/group → not found); e2e for a foreign project id |
| AC-CRUMB-013 | blocked (iteration 7) |
| AC-CRUMB-014 | `owner-shell.test.tsx`: Compact Bar parent per sub-page (unchanged mechanism); client back targets in the header helper tests |
| AC-CRUMB-015, 016 | `sidebar.test.tsx`, `app-shell.test.tsx`, e2e `app-shell-revamp.spec.ts` |
| Slot coverage | `owner-trail-routes.test.ts`: every `page.tsx` under `src/app/(owner)/w/[workspaceId]/` (outside `@crumbs`) has a matching slot route or a catch-all entry |

Per the Owner's working rule (2026-10-05), each iteration runs only its related tests plus prettier, eslint and typecheck on the touched files, never the full suite.

## 11. Risks
- **Slot capture:** a dynamic slot segment captures a static sibling (`projects/[projectId]` would match `new`). Mitigation: mirrors and the coverage test.
- **Extra queries:** a slot loader that can't share the page's cached function adds one lookup (ADR-018). Keep the lookups to one indexed read.
- **Test churn:** many tests pin the old trails; they change on purpose, one iteration at a time.
- **Transition code:** the `hasServerTrail` allow-list must be deleted in iteration 4; its removal is in that iteration's checklist.
- **Long trails (iteration 7):** blocked until OQ-5.

## 12. ADR
[ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md): the Owner breadcrumb is rendered on the server by a parallel route slot.

## 13. Iterations

Each iteration: plan → implement (test-first) → test → verify → commit. One commit per iteration, conventional, English, lowercase, no trailing period, with the session's Co-Authored-By line.

### Iteration 1 — Trail builder and name loaders
**Covers:** groundwork for AC-CRUMB-001…007, AC-CRUMB-012.
**Read first:** spec R-1…R-5, the trail tables; this doc §5.1, §5.2, §8; ADR-025; `coding-rules.md` › Files, Functions and comments, Copy, Testing; `owner-nav.copy.ts`; `verifyOwnerWorkspace` (`owner-workspace.ts:51`); the scoped reads behind `loadProjectDetail`, `loadServiceDetail`, `loadSelectionGroupDetail`.
**Checklist:**
- [ ] `owner-trail.ts` with `ownerTrail` and `staticOwnerTrail`; failing tests first for root, ancestors, dashboard, each static route and an unknown path.
- [ ] `owner-trail-names.ts` with the four cached loaders; tests for a found name, a foreign workspace, a foreign project and a group of another project.
**Done:** both units are tested and green; nothing renders them yet.
**Commit:** `feat(workspace): add owner breadcrumb builder and scoped name loaders`

### Iteration 2 — Slot wiring, dashboard, profile, sections and tabs
**Covers:** AC-CRUMB-001, 002, 003, 007, 010 (owner), 011 (static routes).
**Read first:** ADR-025; this doc §5.3, §5.4, §6; Next docs `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md` and `upgrading/version-16.md` › *Parallel Routes `default.js` requirement*; `layout.tsx` (workspace and profile); `owner-shell.tsx`; `app-shell.tsx`; `app-panel.tsx`; `page-header.tsx`.
**Checklist:**
- [ ] `@crumbs/default.tsx`, `@crumbs/page.tsx`, `@crumbs/[...segments]/page.tsx`.
- [ ] Layout passes `crumbs`; `OwnerShell` → `AppShell.panelCrumbs` → `AppPanel` → `PageHeader.trail`.
- [ ] `hasServerTrail` allow-list: dashboard and the static routes; others keep the old assembly.
- [ ] Profile layout passes `Profil`.
- [ ] Tests: page-header `trail` slot and accessibility; owner-shell uses `crumbs` for allow-listed paths; e2e AC-SHELL-001 expectation becomes `Dasbor`.
**Done:** the dashboard, profile, sections and tabs show the spec trails in the server HTML; project and service pages still show their previous trail.
**Commit:** `feat(shell): render the owner breadcrumb from a server slot`

### Iteration 3 — Project, gallery, service and template pages
**Covers:** AC-CRUMB-004, 006, 011, 012.
**Read first:** this doc §5.3 (mirrors), §7, §8; the slot pages from iteration 2; `services/[serviceId]/page.tsx`; `template-sub-pages.ts`; `TEMPLATE_COPY`.
**Checklist:**
- [ ] Slot pages `projects/[projectId]`, `projects/[projectId]/gallery`, `services/[serviceId]`, `message-templates/[templateType]`.
- [ ] Mirrors `projects/new`, `projects/completed`, `projects/cancelled`, `services/categories`, `services/items`.
- [ ] Extend `hasServerTrail`.
- [ ] `services/[serviceId]/page.tsx`: `parent` label from `OWNER_NAV_COPY.services`.
- [ ] `owner-trail-routes.test.ts` (slot coverage).
- [ ] e2e: the gallery URL's server HTML has the full trail; a foreign project id gives 404.
**Done:** those pages show the spec trails on first paint; no static route is captured by a dynamic slot segment.
**Commit:** `feat(shell): show full owner trails on project, gallery, service and template pages`

### Iteration 4 — Picks pages and removal of the old assembly
**Covers:** AC-CRUMB-005, 012, 014 (owner).
**Read first:** this doc §5.3, §6; picks main pages; `owner-shell.tsx`; `owner-nav.tsx`, `owner-nav.types.ts`; `app-panel.tsx`.
**Checklist:**
- [ ] Slot pages `.../gallery/picks` and `.../gallery/picks/[groupId]`.
- [ ] Delete `hasServerTrail` and the old `panelBreadcrumbs` assembly in `OwnerShell`.
- [ ] Remove `breadcrumbs` from `resolveServicesHeading` and `PageHeading`; update `owner-nav.test.tsx`.
- [ ] Remove the `parent = "Workspace"` default in `AppPanel`.
- [ ] Tests: picks trails; Compact Bar parent per sub-page unchanged.
**Done:** every Owner route's trail comes from the slot; `rg panelBreadcrumbs` finds no assembly code; related tests green.
**Commit:** `feat(shell): show full owner trails on picks pages and drop the client-side trail`

### Iteration 5 — Client trails and Beranda always present
**Covers:** AC-CRUMB-008, 009, 010 (client), 014 (client).
**Read first:** spec R-5 exception, R-7, *Semua foto for a project without groups*; this doc §5.5; `review-text.ts` and its test; `client-browse-screen.tsx`; `client-home.ts` and its test; `src/app/(client)/g/[token]/page.tsx`, `photos/page.tsx`, `picks/[groupId]/page.tsx` (D-2 redirect); client-access AC-SEL-012 and AC-SEL-020 amendment notes.
**Checklist:**
- [ ] Read-only review: group crumb without `href`, then *Tinjau*.
- [ ] Remove the `ALL_PHOTOS` redirect; Beranda shows only the *Semua foto* card for a project without groups and final delivery.
- [ ] `baseHeader`: `hasHome` → `hasGroups`; trail `Beranda › Semua foto` and `back` to Beranda always; title and subtitle unchanged.
- [ ] `clientLanding`: delete or keep per §5.5.
- [ ] Tests: review trail both branches; browse header for a project without groups; e2e AC-SEL-012/020 per their amendment.
**Done:** related client tests and the client e2e for a project without groups pass.
**Commit:** `feat(gallery): keep beranda in the client trail and show tinjau on read-only reviews`

### Iteration 6 — Sidebar toggle beside the breadcrumb
**Covers:** AC-CRUMB-015, 016.
**Read first:** spec › *Sidebar toggle*; F-17 amendment notes (spec Desktop/Tablet rows, AC-SHELL-001…003); this doc §6; `sidebar.tsx`, `sidebar.types.ts`, `sidebar.test.tsx`; `app-shell.tsx`, `app-shell.test.tsx`; `page-header.tsx`; e2e `app-shell-revamp.spec.ts` lines 83–91, 170.
**Checklist:**
- [ ] `SidebarProps`: remove `onCollapse`, `onExpand`; `SidebarLogo` renders the brand only; remove the compact footer expand button.
- [ ] `PageHeader`/`AppPanel`: `leading` slot left of the trail, rendered only when set.
- [ ] `AppShell`: one `sidebarToggle` with two `IconButton`s carrying `data-sidebar-toggle`: `hidden xl:flex` (icon and label follow `isDesktopSidebarCollapsed`; collapses or expands) and `hidden md:flex xl:hidden` (*Buka sidebar*; opens the overlay); pass it as `leading`.
- [ ] Remove `onCollapse`/`onExpand` from `DesktopSidebar`, `onExpand` from `TabletRail`, `onCollapse` from `TabletSidebarOverlay`; delete `handleCloseTabletSidebar`.
- [ ] Tests: sidebar has no collapse or expand button and keeps logout; desktop toggle collapses, expands, is remembered, and keeps focus; tablet toggle opens the overlay and focus returns after Esc; e2e selectors point at the breadcrumb toggle.
**Done:** related unit tests and the e2e shell spec pass.
**Commit:** `feat(shell): move the sidebar toggle beside the breadcrumb`

### Iteration 7 — Long trail overflow (BLOCKED)
**Covers:** AC-CRUMB-013.
**Blocked on:** OQ-5 and its frame (spec › *Design*). Once decided: `/sdv:design-feature breadcrumb-revamp` for the overflow state, then this iteration.

## 14. Dependencies between iterations
- 1 → 2 → 3 → 4: each builds on the builder and the slot.
- 5 is independent of 1–4 (client side, its own `ClientPageHeader`). It can run any time.
- 6 is independent of the trail work. It touches `PageHeader` and `AppPanel` like iterations 2 and 4, so run it after 4 or rebase the props.
- 7 needs 1–5 and the OQ-5 decision.

## 15. Open items for the Owner
- OQ-5: how a long trail shrinks. It blocks iteration 7 only.
