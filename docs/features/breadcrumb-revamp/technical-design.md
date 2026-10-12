# Technical design — Breadcrumb revamp (F-22)

Spec: [spec.md](spec.md) · Acceptance criteria: [acceptance-criteria.md](acceptance-criteria.md) · ADR: [ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md)
Status: BUILT (2026-10-12; revised after review the same day). Task 8 done: OQ-5 resolved 2026-10-12 (truncate the middle crumbs). Executable steps: [plan.md](plan.md).

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
New unit `src/features/workspace/ui/owner-trail/owner-trail.ts` (+ `.test.ts`). No React import. It lives in `ui/`, not `domain/`, because it reads `OWNER_NAV_COPY` and the coding rules forbid `domain` from importing `ui` copy.

```ts
ownerTrail(input: { workspaceId; workspaceName; ancestors: readonly BreadcrumbItem[]; current: string }): readonly BreadcrumbItem[]
dashboardTrail(): readonly BreadcrumbItem[]                 // [Dasbor]
sectionCrumb(workspaceId, section: OwnerSection): BreadcrumbItem
projectCrumb(workspaceId, projectId, title): BreadcrumbItem
staticOwnerTrail(segments, workspaceId, workspaceName): readonly BreadcrumbItem[] | null // null = unknown path
```

`staticOwnerTrail` covers `projects`, `projects/completed`, `projects/cancelled`, `projects/new`, `clients`, `clients/archived`, `team`, `team/archived`, `team/roles`, `services`, `services/categories`, `services/items`, `message-templates`, `photo-sources`, `settings`, `invoices`, `search`, `notifications`. Labels come from `OWNER_NAV_COPY` (including `projectTabs`, `clientTabs`, `teamTabs`, `serviceTabs`, and `create` for *Proyek baru*). Labels owned by other features (*Galeri*, *Pilihan klien*, template labels) are passed in by the slot pages in `app/`, which may import any feature's `ui`.

**Labels vs. titles (R-3).** The crumb label and the page `<h1>` are separate. The resolvers in `owner-nav.tsx` keep returning `title` (the `<h1>`: *Proyek* on every projects tab), and the builder sets the crumb label (*Selesai*). `PageHeading.breadcrumbs` is removed from `owner-nav.types.ts` (plan Task 5).

### 5.2 Names: the existing loaders, cached
No new loader. The slot pages call the same composition loaders as their pages, and those loaders are wrapped in React `cache()`, so a slot and its page share one query per request: `verifyOwnerWorkspace`, `loadProjectDetail` (`.title`), `loadServiceDetail` (`.name`), `loadGalleryPage` (`.project.title`), `loadSelectionGroups` (`.projectTitle`), `loadSelectionGroupDetail` (`.projectTitle`, `.group.name`). They already validate ids, verify the workspace and throw `notFound()` for a foreign entity (AC-CRUMB-012). The modules are `server-only`, not `"use server"`, so exporting a cached `const` is allowed; outside a server render `cache()` just calls the function. The template label needs no DB: the slot finds the editor in `messageTemplateSubPages(workspaceId)` by path and uses its `title`, or renders nothing for an unknown slug.

### 5.3 Slot routes (ADR-025)
Under `src/app/(owner)/w/[workspaceId]/@crumbs/`:

| File | Trail |
|---|---|
| `default.tsx` | `null` (Next 16 requirement) |
| `page.tsx` | `Dasbor` |
| `[...segments]/page.tsx` | `staticOwnerTrail(segments)`; `null` when unknown |
| `projects/new/page.tsx`, `projects/completed/page.tsx`, `projects/cancelled/page.tsx` | static mirrors (plan Task 4) |
| `projects/[projectId]/page.tsx` | Aster › Proyek › {judul} |
| `projects/[projectId]/gallery/page.tsx` | … › {judul} › Galeri |
| `projects/[projectId]/gallery/picks/page.tsx` | … › Galeri › Pilihan klien |
| `projects/[projectId]/gallery/picks/[groupId]/page.tsx` | … › Pilihan klien › {grup} |
| `services/categories/page.tsx`, `services/items/page.tsx` | static mirrors (plan Task 4) |
| `services/[serviceId]/page.tsx` | Aster › Layanan › {nama} |
| `message-templates/[templateType]/page.tsx` | Aster › Template pesan › {label} |

Each slot page is a thin route file (coding rules › Next.js): load names, call the builder, render `<PageHeaderTrail items>` (server-rendered; it wraps the client `BreadcrumbTrail`, whose props are serializable). Each mirror renders the catch-all page component with fixed segments (Owner 2026-10-12: no duplicated body).

**Rule for future routes:** every static sibling of a dynamic slot segment needs a mirror. `owner-route-coverage.test.ts` checks this for every Owner page; see §11.

### 5.4 Wiring
- `src/app/(owner)/w/[workspaceId]/layout.tsx` receives `crumbs` and passes it to `OwnerShell`.
- `OwnerShell` (`trail?: ReactNode`) → `AppShell` (`panelTrail?: ReactNode`) → `AppPanel` (`trail`) → `PageHeader` (`trail?: ReactNode`). When `trail` is set, `BreadcrumbRow` renders it in place of the generated trail.
- `src/app/(owner)/profile/layout.tsx` passes the static trail *Profil* (no slot outside `/w`).
- **Transition:** no allow-list. The slot routes are added first while the layout still ignores `crumbs` (Next renders them; nothing shows them). One later commit makes the layout pass `crumbs` and removes the old browser-side assembly. Every commit keeps a working trail.

### 5.5 Client trails
- `reviewHeader` (`review-text.ts`): the read-only branch returns `Beranda › {grup} (no href) › Tinjau`. The editable branch is unchanged.
- `src/app/(client)/g/[token]/page.tsx`: remove the `ALL_PHOTOS` redirect. Beranda renders with the *Semua foto* card only.
- `client-browse-screen.tsx` `baseHeader`: when the project has no groups, keep the title (project title) and the subtitle (`subtitleNoGroups`) and change only the trail to `Beranda › Semua foto` and add the `back` to Beranda. Rename `hasHome` to `hasGroups` (what it now means). Its value is still computed from the client home view (no groups and no final delivery).
- `clientLanding` (`client-home.ts`): it drives no redirect any more. If `rg clientLanding` then finds only the photos page, replace its use there with a `hasGroups` flag from the home view and delete the function and its test. Otherwise keep it and update its doc comment.

## 6. UI components

| Component | Change | Plan task |
|---|---|---|
| `PageHeader` (`page-header.tsx`, `.types.ts`) | `trail?: ReactNode` and `PageHeaderTrail` (Task 3); `leading?: ReactNode` (toggle, Task 7) | 3, 7 |
| `AppPanel` (`app-panel.tsx`, `.types.ts`) | pass `trail`, `leading`. The English default `parent = "Workspace"` stays: production always passes `parent`, and the AppPanel unit tests rely on the default | 3, 7 |
| `AppShell` (`app-shell.tsx`, `.types.ts`) | `panelTrail` (Task 3); toggle (Task 7) | 3, 7 |
| `OwnerShell` (`owner-shell.tsx`) | `trail` prop from the layout; old `panelBreadcrumbs` assembly removed | 5 |
| `owner-nav.tsx`, `.types.ts` | `breadcrumbs` removed from resolvers and `PageHeading` | 5 |
| `PageHeadingOverride` | unchanged contract (`parent` stays: phone Compact Bar target) | — |
| `Sidebar` (`sidebar.tsx`, `.types.ts`) | remove `onCollapse`, `onExpand`, logo-row and rail buttons | 7 |
| Client header helpers | composition only | 6 |

**Copy.** New strings go into `*.copy.ts` (lint `local/ui-copy`). The literal `"Layanan"` in `services/[serviceId]/page.tsx` becomes `OWNER_NAV_COPY.services` (plan Task 5).

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

| AC | Test (plan task) |
|---|---|
| AC-CRUMB-001 | `owner-trail.test.ts` (`dashboardTrail`), e2e `app-shell-revamp.spec.ts` expects `Dasbor` (Tasks 1, 5) |
| AC-CRUMB-002 | `owner-trail.test.ts` › each section (Task 1) |
| AC-CRUMB-003 | `owner-trail.test.ts` › tab routes and *Proyek baru* (Task 1); `owner-nav.test.tsx` titles stay the section name (Task 5) |
| AC-CRUMB-004, 005, 006 | `owner-trail.test.ts` with ancestors (Task 1); slot pages verified by typecheck and the manual first-load check (Tasks 4, 5) |
| AC-CRUMB-007 | profile layout passes `Profil` (Task 5) |
| AC-CRUMB-008 | `review-text.test.ts`: editable vs read-only (Task 6) |
| AC-CRUMB-009 | `client-browse-screen.test.tsx` (title, subtitle, trail, back); integration `home.test.ts` unchanged (Task 6) |
| AC-CRUMB-010 | `page-header.test.tsx`: plain-text crumb not focusable, `aria-current` (Task 3) |
| AC-CRUMB-011 | manual first-load check of a gallery URL (Task 5 Step 13); the mechanism is server rendering (ADR-025) |
| AC-CRUMB-012 | the cached loaders keep their existing workspace checks and tests (Task 2) |
| AC-CRUMB-013 | `breadcrumb-trail.test.tsx` (Task 8, OQ-5 truncate the middle crumbs) |
| AC-CRUMB-014 | unchanged mechanism (`PageHeadingOverride.parent`); existing `owner-shell.test.tsx` *Kembali* tests; client back targets in `review-text.test.ts` (Task 6) |
| AC-CRUMB-015, 016 | `sidebar.test.tsx`, `page-header.test.tsx`, `app-shell.test.tsx`, e2e `app-shell-revamp.spec.ts` (Task 7) |

Per the Owner's working rule (2026-10-05), each task runs only its related tests plus prettier, eslint and typecheck on the touched files, never the full suite.

## 11. Risks
- **Slot capture:** a dynamic slot segment captures a static sibling (`projects/[projectId]` would match `new`). Mitigation: the five mirrors in Task 4. Any new Owner route with a dynamic sibling needs a mirror (ADR-025 › Consequences); the automated route check is `owner-route-coverage.test.ts` (B-1, 2026-10-12), which fails on a dynamic page without a slot, a static sibling without a mirror, or a stale mirror.
- **Extra work per request:** the slot calls the same loaders as the page; `cache()` makes them run once per request. A slot on a page that does not call the same loader with the same arguments runs it again (ADR-018).
- **Test churn:** tests that pin the old trails change on purpose, one task at a time.
- **Long trails (Task 8):** root and current stay whole; if both together are wider than the bar, the bar clips them (no horizontal page scroll, since the App Panel hides overflow).

## 12. ADR
[ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md): the Owner breadcrumb is rendered on the server by a parallel route slot.

## 13. Iterations
The executable steps, with exact code and commands, are in [plan.md](plan.md). It is written so Claude Haiku 5.5 can run it task by task. One commit per task.

| Task | Content | AC |
|---|---|---|
| 1 | Owner trail builder (`features/workspace/ui/owner-trail`) | 001–003, 007 (groundwork) |
| 2 | Cache the shared loaders | 012 (kept), ADR-025 |
| 3 | Page Header takes a server-rendered trail (`trail`, `PageHeaderTrail`, `panelTrail`) | 010 |
| 4 | `@crumbs` slot routes, mirrors and dynamic pages (not shown yet) | 001–006 |
| 5 | Switch the Owner shell and the profile layout to the slot; drop the browser-side trail | 001–007, 011, 014 |
| 6 | Client trails; Beranda always present | 008, 009, 010, 014 |
| 7 | Sidebar toggle beside the breadcrumb | 015, 016 |
| 8 | Long trail overflow: root and current whole, middle crumbs truncate with a tooltip | 013 |

## 14. Dependencies between tasks
- 1 → 4; 2 → 4; 3 → 4 → 5.
- 6 is independent of 1–5.
- 7 edits the same Page Header, App Panel and App Shell files as 3, so it runs after 3 (the plan runs it last).
- 8 changes only `breadcrumb-trail.tsx` and can run after 7.

## 15. Open items for the Owner
- None. OQ-5 resolved 2026-10-12.
