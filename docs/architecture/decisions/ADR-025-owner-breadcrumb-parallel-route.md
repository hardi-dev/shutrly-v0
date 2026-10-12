# ADR-025: The Owner breadcrumb is rendered on the server by a parallel route slot

Status: Accepted (Owner, 2026-10-12: "fix semua sesuai rekomendasi kamu", review of F-23)
Date: 2026-10-12
Feature: [F-23 breadcrumb-revamp](../../features/breadcrumb-revamp/spec.md) (R-6, AC-CRUMB-011)

## Context
F-23 R-6 requires the breadcrumb to be complete on the first render. The Owner trail needs names that only the page's data knows: the project title, the service name, the group name.

Today the Owner shell (`OwnerShell`, a client component rendered by `src/app/(owner)/w/[workspaceId]/layout.tsx`) builds the trail from the pathname. A detail page corrects it with `PageHeadingOverride`, which reports to the shell in a `useEffect`. Effects run only after the page has mounted. So the server HTML and the first client render always show a shorter fallback trail, and then it grows. This is the "flash" R-6 forbids.

In React, a parent's output cannot be changed by a child during the same render. The layout renders the header before the page renders, so the names have to reach the layout through its own props. Next.js 16 does this with **parallel routes**: a slot folder `@name` beside `page.tsx` is rendered by its own route segments, in the same request, and handed to the layout as a prop (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md`). On soft navigation the slot is re-rendered with the page; on a hard load its matching page renders, or `default.tsx` when nothing matches. Next 16 requires a `default.tsx` in every slot (`upgrading/version-16.md` › *Parallel Routes `default.js` requirement*).

## Decision
1. **A slot `@crumbs` under `src/app/(owner)/w/[workspaceId]/`** renders the Owner trail on the server. The workspace layout receives it as the `crumbs` prop and passes it to `OwnerShell`, which places it in the Page Header breadcrumb bar.
2. **Slot routes:**
   - `@crumbs/page.tsx`: the Dashboard (`Dasbor`, F-23 R-2);
   - `@crumbs/[...segments]/page.tsx`: every route whose crumbs are fixed labels (sections, tabs, `projects/new`, *Segera hadir* sections). It maps segments to labels and returns `null` for an unknown section, so the main route's `notFound()` decides;
   - one slot page per route with a dynamic name: `projects/[projectId]`, `projects/[projectId]/gallery`, `.../gallery/picks`, `.../gallery/picks/[groupId]`, `services/[serviceId]`, `message-templates/[templateType]`;
   - **every static sibling of a dynamic slot segment is mirrored** in the slot (`projects/new`, `projects/completed`, `projects/cancelled`, `services/categories`, `services/items`), because a dynamic slot segment would otherwise capture it (`projects/[projectId]` would match `new`);
   - `@crumbs/default.tsx` returns `null` (Next 16 requirement).
3. **Names come from the existing scoped loaders**, wrapped in React `cache()`: `verifyOwnerWorkspace`, `loadProjectDetail`, `loadServiceDetail`, `loadGalleryPage`, `loadSelectionGroups`, `loadSelectionGroupDetail`. They already verify the workspace (BR-WS-003, C-101). A slot and its page call them with the same arguments in the same request, so the query runs once.
4. **`PageHeadingOverride` stays** for the title, status, meta and the phone Compact Bar parent. It no longer touches the trail.
5. **The trail items are built by one pure unit** (`src/features/workspace/ui/owner-trail/`; in `ui/` because it reads the nav copy), used by every slot page, so the root, ancestors and current crumb follow one rule.
6. **Out of scope:** the client area. Its pages already render their own header on the server (`ClientShell`), so they have no flash.

## Alternatives considered
- **Keep `PageHeadingOverride` with `useEffect`, or switch to `useLayoutEffect`.** Both run after the server HTML and after hydration, so the shorter trail is still painted. This doesn't meet R-6.
- **Each page renders its own Page Header** (no header in the shell). This gives a full trail on first paint, but it moves the header out of the shell on every Owner page. F-17 put it in the shell so that it stays mounted across navigations (focus, utilities, tabs). It is too large a change for F-23.
- **Relax R-6** (accept the flash). The Owner chose to keep R-6.
- **Portal from the page into the header**, like `PAGE_ACTIONS_ID`. A portal needs the target DOM node, so it renders only after mount. Same flash as the effect.

## Consequences
- Every Owner route under `/w/[workspaceId]` has a matching slot route. A new Owner route with a dynamic name needs a slot page, and every new static sibling of a dynamic segment needs a mirror. The catch-all covers the rest. Missing one shows the wrong trail, so the slot has a test per route (F-23 technical design).
- Because the slot reuses the page's cached loader, a page with a dynamic name runs no extra query. A future slot whose page does not call the same loader with the same arguments would run it twice; that counts against the free-tier budget (ADR-018).
- A foreign or missing entity makes the slot loader throw `notFound()`, the same as the page. The route returns 404 and no foreign name is rendered (AC-CRUMB-012).
- The profile page is outside `/w/[workspaceId]`. Its layout passes the static trail *Profil* directly.
- The trail logic leaves `owner-nav.tsx` (`resolvePageHeading` keeps the title, subtitle and tabs only) and `owner-shell.tsx` (no `panelBreadcrumbs` assembly).

## Related
- F-23 [spec](../../features/breadcrumb-revamp/spec.md) R-1…R-6, [technical design](../../features/breadcrumb-revamp/technical-design.md); F-17 `PageHeadingOverride`; ADR-015 (URL-scoped workspace), ADR-018 (free-tier budget).
