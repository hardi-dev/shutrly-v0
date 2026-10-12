# Feature: Breadcrumb revamp — one crumb per route level

ID: F-22 · Slug: `breadcrumb-revamp`
Status: PLANNED (2026-10-12) · Technical design: [technical-design.md](technical-design.md) · Acceptance criteria: [acceptance-criteria.md](acceptance-criteria.md) · ADR: [ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md)
Supersedes: F-17 [S-A6 Breadcrumb depth](../app-shell-revamp/spec.md), F-10 [A-31 Skipping Beranda](../client-access/spec.md), and the per-page trails recorded in other features' designs (FC-001…FC-003)
Also: moves the sidebar toggle beside the breadcrumb (see *Sidebar toggle*).

## Goal
Every desktop breadcrumb shows the full path of the current URL: one crumb per route level, from the root to the current page. The audit of 2026-10-11 found 14 Owner routes and 1 client route whose trail is shorter or longer than their URL.

## User Story
As a photographer (Owner) or a client, I want the breadcrumb to show every level above the page I'm on, so that I can see where I am and jump to any of those levels in one click.

## Preconditions
- The page renders a Page Header with a breadcrumb: the Owner App Shell on desktop and tablet (F-17), or the client shell on desktop (F-10 A-26).
- The names on the path can be loaded for the current route.

## Inputs
- The current route and its params (`workspaceId`, `projectId`, `serviceId`, `groupId`, `templateType`, `token`).
- The display names on the path: workspace name, project title, service name, selection-group name, template label.

## Main Flow — the trail rule
1. **R-1 One crumb per page level.** Walk the URL from its root to the current page. Every level that is a page of its own adds one crumb. A path segment with no page (`/g/[token]/picks`) and a route group (`(list)`) add none.
2. **R-2 Roots.** The Owner root is the workspace route `/w/[id]`, labelled with the workspace name. The client root is *Beranda* (`/g/[token]`).
   - The Dashboard *is* the Owner root, so its trail is the single crumb *Dasbor* (Owner 2026-10-12, OQ-1). The root crumb on other pages keeps the workspace name, although it opens the page whose own trail says *Dasbor*. The name tells which workspace the page belongs to.
   - `/profile` has no workspace in its URL, so its trail is the single crumb *Profil*, even though it renders in the last-opened workspace's shell (Owner 2026-10-12, OQ-2).
3. **R-3 Labels.** A fixed segment uses its navigation or page label (*Proyek*, *Galeri*, *Pilihan klien*). A tab route uses its tab label, even when the page title (`<h1>`) stays the section name (*Proyek* page, *Selesai* crumb). A dynamic segment uses the entity's name (project title, service name, group name, template label).
4. **R-4 Tabs are levels.** A tab with its own route (`/projects/completed`) adds a crumb with the tab label. The default tab is the parent route itself and adds none.
5. **R-5 Links.** Every crumb except the last links to its route. The last crumb is the current page: plain text with `aria-current="page"`.
   - **Exception:** a crumb whose route only redirects back to the current page is plain text, not a link, so it never sends the user in a loop. Today this applies to one case: the *{nama grup}* crumb on the review of a group that is not `OPEN` (`/picks/[groupId]` redirects such a group to its review, F-10 D-2). Owner 2026-10-12.
6. **R-6 First paint.** The trail is complete in the server HTML and on the first render. It never shows a shorter trail first and then grows. Mechanism: [ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md) (Owner 2026-10-12).
7. **R-7 Beranda always exists.** Every client project lands on Beranda, even when Beranda holds only the *Semua foto* card. This withdraws F-10 A-31, so the *Beranda* crumb always links to a real page (Owner 2026-10-12, OQ-3).

### Resulting trails (desktop)

Owner (`Aster` = workspace name; `…` repeats the trail before it in the same cell):

| Route | Trail |
|---|---|
| `/w/[id]` | Dasbor |
| `/projects` | Aster › Proyek |
| `/projects/completed` · `/projects/cancelled` | Aster › Proyek › Selesai · Aster › Proyek › Dibatalkan |
| `/projects/new` | Aster › Proyek › Proyek baru |
| `/projects/[projectId]` | Aster › Proyek › {judul proyek} |
| `/projects/[projectId]/gallery` | Aster › Proyek › {judul proyek} › Galeri |
| `/projects/[projectId]/gallery/picks` | Aster › Proyek › {judul proyek} › Galeri › Pilihan klien |
| `/projects/[projectId]/gallery/picks/[groupId]` | Aster › Proyek › {judul proyek} › Galeri › Pilihan klien › {nama grup} |
| `/clients` · `/clients/archived` | Aster › Klien · … › Arsip |
| `/team` · `/team/archived` · `/team/roles` | Aster › Tim · … › Arsip · … › Peran |
| `/services` · `/services/categories` · `/services/items` | Aster › Layanan · … › Kategori · … › Item paket |
| `/services/[serviceId]` | Aster › Layanan › {nama layanan} |
| `/message-templates` | Aster › Template pesan |
| `/message-templates/[templateType]` | Aster › Template pesan › {label template} |
| `/photo-sources` · `/settings` | Aster › Sumber foto · Aster › Pengaturan |
| `/invoices` · `/search` · `/notifications` (*Segera hadir*) | Aster › Invoice · Aster › Pencarian · Aster › Notifikasi |
| `/profile` | Profil |

Client:

| Route | Trail |
|---|---|
| `/g/[token]` | Beranda |
| `/g/[token]/photos` | Beranda › Semua foto (every project, R-7) |
| `/g/[token]/final` | Beranda › Hasil akhir |
| `/g/[token]/picks/[groupId]` | Beranda › {nama grup} |
| `/g/[token]/picks/[groupId]/review`, group `OPEN` | Beranda › {nama grup} › Tinjau |
| `/g/[token]/picks/[groupId]/review`, group `SUBMITTED` or `LOCKED` | Beranda › {nama grup} › Tinjau, with *{nama grup}* as plain text (R-5 exception; Owner 2026-10-12, OQ-4) |

## Alternative Flows
- **Page-state titles.** When a page changes its title for an in-page state (*2 dipilih* on *Hasil akhir*), the trail keeps the route's label.
- **Read-only review.** A group that is `SUBMITTED` or `LOCKED` shows its picks read-only on the review route (BR-SEL-005). The page title stays the group name; the trail still ends in *Tinjau*, and *{nama grup}* is not a link (R-5 exception).
- **Semua foto for a project without groups.** Only the trail and the phone back button change: the trail becomes *Beranda › Semua foto* and phones get the *Beranda* button. The page title (the project title) and the subtitle for a project without groups stay as today (Owner 2026-10-12).
- **Long trails.** A trail can reach six crumbs. When it doesn't fit the bar, the bar still shows the root and the current page in full. How the middle shrinks is a design decision (OQ-5).
- **Phones.** Phones keep their back button (Compact Bar or *Beranda* button) on sub-pages. Its target is the immediate parent level, the crumb before the current one. Top-level and tab pages have no back button, as today. With R-7, *Semua foto* always has a *Beranda* button.

## Error Cases
- A page whose entity is missing or belongs to another workspace or project returns not-found as today; no trail with that name is rendered (BR-WS-003, C-104).
- If the page's content fails to load and shows its retry state, the trail still renders when its own name lookup succeeds. If the name lookup fails, the route shows its error state; no trail with a guessed name is rendered.

## Business Rules
- BR-WS-003 — the workspace root and every Owner crumb link use the verified URL workspace.
- BR-ACC-003, C-104 — client crumb labels come only from the token's project.
- BR-SEL-001 — a project with zero selection groups still lands on Beranda (R-7).
- BR-SEL-005 — a group that is not `OPEN` is read-only on the review route.
- C-008 — `<nav aria-label="Breadcrumb">`, links reachable by keyboard, the current crumb has `aria-current="page"`.

## Sidebar toggle (scope addition, Owner 2026-10-12)
Moves the sidebar toggle from the Sidebar's logo row and the rail's bottom button to the left of the breadcrumb bar, on desktop (≥ 1280 px) and tablet (768–1279 px). Phones are unchanged.
- **One toggle**, left of the breadcrumb. The Sidebar owns no collapse, expand or close control any more.
- **Desktop:** the toggle collapses the Sidebar to the 72 px rail or expands it. Its icon and label follow the state (*Ciutkan sidebar* / *Buka sidebar*). The choice stays remembered per browser. After a press, focus stays on the toggle.
- **Tablet:** the toggle is always *Buka sidebar* and opens the Sidebar overlay. The scrim covers it while the overlay is open. The overlay has no close control of its own; Esc, a scrim click, or choosing a destination closes it, and focus returns to the toggle.
- The trailing utilities (Cari, Notifikasi) stay on the right of the bar, as in C40.
- F-17 is amended accordingly (spec Desktop and Tablet rows, AC-SHELL-001…003 notes).

## Design
- **Pencil frames are waived** for this feature (Owner 2026-10-12, sidebar toggle; extended to the trail changes on the same date, review fix). The changes add crumbs and move one existing button; they add no new screen state. The code uses the existing tokens and components. The frames and the design notes listed in FC-002 stay stale until the next design pass. This deviates from AGENTS.md (UI from Pencil exports) and is recorded here per C-012.
- Exception: the long-trail overflow (OQ-5) is a new visual state and needs a frame before it is built.

## Dependencies
- F-17 App Shell: Page Header C40 breadcrumb bar, `OwnerShell`, `PageHeadingOverride` (keeps the title, status, meta and phone back target; no longer the trail).
- F-10 client shell: A-26 breadcrumb; the A-31 redirect in `src/app/(client)/g/[token]/page.tsx` to remove.
- Names: picks views already carry `projectTitle`; the gallery page has `page.project.title`; project and service detail have their own names.
- ADR-025: the Owner trail moves to a server-rendered parallel route slot `@crumbs`.
- Tests that pin the old trails change with this feature: `owner-nav.test.tsx`, `owner-shell.test.tsx`, `app-shell.test.tsx`, `page-header.test.tsx`, `sidebar.test.tsx`, the client screens' tests, e2e `app-shell-revamp.spec.ts` (AC-SHELL-001 expects *Aster Wedding › Dasbor*), and the F-10 e2e for landing without groups (AC-SEL-012, AC-SEL-020).

## Out of Scope
- The folder trail inside *Semua foto* (*Semua folder › Rina-Wisuda › Akad*): it follows in-page state, not the route (AC-GAL-028…030).
- Pages without a shell: auth pages, `/onboarding/workspace`, `/workspace` (redirect only), the landing page.
- The page title (`<h1>`), status and meta of detail pages: they keep using `PageHeadingOverride`.
- Phone headers beyond the back target above.
- Visual styling of the breadcrumb bar; tokens and spacing stay as in C40.

## Flagged Concerns

Checked against the constitution (C-001…C-012, C-101…C-106), BR-WS-003, BR-ACC-003, BR-SEL-001, BR-SEL-005, ADR-015 (routes), ADR-018 (free-tier budget), ADR-025, and the coding rules (copy in `*.copy.ts`, React Aria).

| ID | Concern | Conflicting sources | Owner decision | Status |
|---|---|---|---|---|
| FC-001 | The route-level rule replaces the two-level rule and the "workspace › nav label" form. | F-17 spec S-A6 and Main Flow step 2, AC-SHELL-001, F-17 design.md:47 | Owner 2026-10-12: the old spec is wrong; depth follows the route. F-17 S-A6, step 2 and AC-SHELL-001 carry a *superseded by F-22* note. | RESOLVED |
| FC-002 | Per-page trails recorded in feature designs and plans and drawn in Pencil contradict R-1: catalog *Layanan › {service}*, projects *Proyek › {title}* and *Proyek › Proyek baru*, message-templates *Template pesan › Bagikan gallery*, clients *Aster Wedding › Klien* on both tabs. The "design wins over docs on UX" practice would keep them. | catalog/design.md:45–49, projects/design.md:106, projects/plan.md:485, message-templates/design.md:32, clients/design.md:42, clients/plan.md:436, the Pencil frames | Owner 2026-10-12: the route rule wins over recorded designs. Frames are waived for this feature (see *Design*); the frames and those notes are synced in the next design pass, and the code does not wait for them. | RESOLVED |
| FC-003 | R-1 gives *Beranda › Semua foto*, but F-10 A-31 skipped Beranda (redirect) for projects without groups and final delivery, so the crumb would loop back to *Semua foto*. | client-access spec A-31, step 5 and the no-selection alternative flow; AC-SEL-012, AC-SEL-020 | Owner 2026-10-12: Beranda always renders (R-7). A-31 is struck through as withdrawn in the client-access spec, and AC-SEL-012 and AC-SEL-020 carry an amendment note. | RESOLVED |
| FC-004 | The *{nama grup}* crumb on a read-only review links to `/picks/[groupId]`, which redirects a non-`OPEN` group back to the review (F-10 D-2): a loop. | R-5, OQ-4; `src/app/(client)/g/[token]/picks/[groupId]/page.tsx` | Owner 2026-10-12 (review fix): the crumb is plain text in that case (R-5 exception). | RESOLVED |
| FC-005 | `PageHeadingOverride` reports to the shell in `useEffect`, so the first paint shows a shorter trail, which breaks R-6. | R-6, AC-CRUMB-011; F-17 `PageHeadingOverride` | Owner 2026-10-12 (review fix): keep R-6; render the Owner trail on the server through a parallel route slot (ADR-025). | RESOLVED |

## Open Questions / SPEC GAPS
- **OQ-5 (design)** How a long trail shrinks when it doesn't fit: collapse the middle crumbs into *…* or truncate each label. It doesn't change which crumbs exist or where they link. Needs a frame before it is built (see *Design*).
