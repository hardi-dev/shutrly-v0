# Technical design — F-17 App Shell revamp

Status: **IMPLEMENTED** (2026-09-29) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) (AC-SHELL-001…014) · Design: [design.md](design.md) (APPROVED; library promoted) · Exports: [`exports/`](exports/) (31 frames, `html-tailwind`, 2026-09-29)

## Context

F-02 built the shell in code: `src/ui/patterns/{app-shell,sidebar,nav-item,bottom-nav,mobile-app-shell,bottom-sheet,menu,toast,app-panel}` and the owner composition `src/features/workspace/ui/{owner-shell,owner-nav,workspace-switcher}`. F-17 changes that shell to Shell v3 and rules v3.1. **No new domain behaviour, no schema change, no new server authority.**

What changes, by area:

| Area | Today (code) | F-17 target |
|---|---|---|
| Tokens | `tokens.css`, 527 tokens | 531 tokens: `font.size.heading`, `font.letter-spacing.heading`, `nav.item.icon-hover`, `sheet.item.check`; nav active/hover and `badge.danger.padding-x` retargeted |
| Desktop / tablet header | Legacy App Panel title row | **Page Header** (C40): breadcrumb (workspace › page) + Utilities (Cari, Notifikasi) + hero (h1, subtitle, one action) |
| Nav active / hover | `surface.panel` pill / invisible hover | `action.primary` pill with a semibold label; hover = the `surface.panel` pill (N1) |
| Desktop collapse | `useState` only | Remembered per browser (F-02 A-8, AC-SHELL-002) |
| Tablet rail | Camera workspace mark | `chevrons-up-down` control; root `surface.muted`; Toast bottom-right |
| Switcher | Menu with item icons, *Buat workspace* as a menu item | **Menu/List** (dividers, no icons) + primary CTA; same content in the phone sheet; switching state; failed switch → **Toast/Danger** with *Coba lagi* |
| Phone header | App-bar title, search and **info** icons | **Mobile Header**: workspace pill, Cari · Notifikasi · **Menu**, title `heading` 26, subtitle; content sheet |
| Phone Bottom Nav | Dasbor · Proyek · + · Klien · *Lainnya*; the CTA opens the menu | Dasbor · Proyek · + · Klien · **Invoice**; CTA → Proyek *Segera hadir*; the Menu button opens the menu sheet (no switcher, no Invoice) |
| Phone sub-page | none | **Compact Bar** + Mobile Shell variant (Back to the parent, optional Actions slot, Bottom Nav stays) |
| Toast | Tone + title + body | + an optional **action** (label + handler) |
| Search / Notifications | hidden | Visible and linked to *Segera hadir* sections `search` / `notifications`; `IconButton` gains a count badge (Count Badge/Danger) |

## Business rules and constitution

- BR-WS-002, BR-WS-003: every page and action still verifies the workspace in the URL (F-02 resolver, ADR-015). The new sections `search` and `notifications` go through the same `[section]` route, which calls `isComingSoonSection` before rendering.
- BR-WS-006: the switch still uses F-02's POST (`switchWorkspaceAction` → `enterWorkspace` → redirect).
- BR-WS-007: no archive or delete control anywhere in the shell.
- C-004 (server authority), C-007 (states), C-008 (a11y, including the v3.1 N1 dark-contrast mitigation), C-101.

## Database

None.

## Server / API interface

- **No new server actions.** `switchWorkspaceAction(workspaceId)` is unchanged. The client handles failure: a rejected call that is **not** a Next.js redirect shows Toast/Danger. Redirect errors must be re-thrown; use the framework's redirect-error check, confirmed in `node_modules/next/dist/docs/` before coding (AGENTS.md).
- Coming-soon sections: add `search` and `notifications` to `src/features/workspace/domain/coming-soon-sections/coming-soon-sections.ts`, with Indonesian labels *Pencarian* / *Notifikasi*. No nav item becomes active for them.

## Domain / application logic

Pure helpers with unit tests:

- `resolveActiveNav(pathname, sections)` in `features/workspace/ui/owner-nav` (or its domain helper). It returns the desktop nav key and the phone tab (`dashboard | projects | clients | invoices | null`). Menu destinations and Profile return `null` for the tab (S-A4), and search/notifications return no active nav.
- `resolveSubPageParent(route)` is the contract for later features: the compact bar's Back target is the parent's href, never history (AC-SHELL-005). F-17 ships only the helper type plus the pattern.
- `sidebarCollapsePreference`: a `get` / `set` wrapper over `localStorage` key `shutrly.sidebar.collapsed`. It wraps every access in try/catch and falls back to expanded (spec *Error cases*). This is a UI concern in `ui/patterns/app-shell`.

## UI components

Follow the HTML exports (AGENTS.md: build from exports; the fidelity pass may change only class names and nesting). Units live in their own folder with a co-located test, `.types.ts`, and `.copy.ts` where copy is needed (coding rules).

| Unit | Folder | Notes / exports |
|---|---|---|
| Tokens | `src/ui/theme/tokens.css` | `pnpm tokens:css`, then `pnpm tokens:check` (531) |
| `IconButton` badge | `ui/primitives/icon-button` | `badgeCount?: number` renders `CountBadge variant="danger"` at the MD offset (x 20 / y 4). The count is added to `aria-label` (*Notifikasi, 3 belum dibaca*). |
| `NavItem` | `ui/patterns/nav-item` | Active = `nav-item-background-active` + semibold; hover = `background-hover` + `icon-hover`; `aria-current="page"` |
| `NavRailItem` / `SidebarRail` | `ui/patterns/nav-rail-item`, `ui/patterns/sidebar-rail` (existing empty folders) | Extract the rail from `app-shell.tsx`. The workspace control uses `chevrons-up-down` |
| `PageHeader` | `ui/patterns/page-header` (new) | `nav[aria-label=Breadcrumb]` with Parent › Current (`aria-current`); `utilities` slot; hero with `h1`, optional subtitle, optional `action` · exports `dashboard-A4o4CS`, `notifications-badge-AjndX` |
| `AppPanel` | `ui/patterns/app-panel` | Hosts `PageHeader` instead of the legacy title row |
| `AppShell` | `ui/patterns/app-shell` | Collapse preference; tablet `surface.muted` root; breakpoint-change cleanup (overlays close, focus stays in the page) · exports `sidebar-collapsed-yUUWI`, `tablet-sidebar-overlay-M2y0m` |
| `MenuList` | `ui/patterns/menu` | `variant="list"`: horizontal padding 0, `MenuDivider` between items, optional footer |
| `Toast` | `ui/patterns/toast` | `ToastContent.action?: { label; onAction }` rendered through Alert's Action slot; a danger tone specimen · export `switch-failed-CyFKd` |
| `WorkspacePill` | `ui/patterns/workspace-pill` (new) | Button with `aria-haspopup`; Sidebar switcher tokens |
| `MobileHeader` | `ui/patterns/mobile-header` (new) | Pill, utilities (Cari, Notifikasi, Menu), `h1` title (heading), subtitle · export `dashboard-KqWRQ` |
| `MobileAppShell` | `ui/patterns/mobile-app-shell` | `surface.muted` root; header; content sheet (`surface.canvas`, top radius `panel-app-radius`); Bottom Nav; separate Sheet and Toast layers |
| `CompactBar` + `MobileShell` | `ui/patterns/compact-bar`, `ui/patterns/mobile-shell` (new) | Back (`aria-label` *Kembali*, href = parent), Title `h1`, Parent caption, `actions` slot; Bottom Nav stays · exports `sub-page-CPIWh`, `sub-page-no-action-b7VW9` |
| `BottomNav` items | `features/workspace/ui/owner-shell` | Invoice tab; the CTA links to `/w/<id>/projects` (*Segera hadir*) |
| Owner composition | `features/workspace/ui/{owner-shell,owner-nav,workspace-switcher}` | Wires the header Menu → menu sheet (KATALOG Layanan, Tim; Template pesan, Sumber klien, Pengaturan; account + Keluar), pill → switcher sheet, and the utilities → coming-soon routes. The switcher has the same content everywhere, with pending and failed states · exports `switcher-*`, `switching-*`, `menu-sheet-z2gaQ` |

Storybook stories are added or updated for every changed pattern (ADR-014), in light and dark.

## Validation

No new user input. The workspace ID in a switch is still verified server-side (AC-SHELL-010).

## Error handling (C-007)

- **Switch failure:** the workspace stays active; the menu or sheet closes; Toast/Danger *Gagal pindah workspace* with *Coba lagi* re-invokes the same action; the switcher stays usable.
- **Storage unavailable:** the sidebar starts expanded, and the app keeps working.
- **Unknown section:** `notFound()` (unchanged).

## Concurrency / consistency

A double click on a workspace item is prevented by the pending state (items and CTA disabled). Last-opened is touched only by the server switch (unchanged).

## Security

No new data exposure. The shell renders only the verified workspace's name. The Toast *Coba lagi* re-sends only the ID the Owner chose; the server re-verifies it. Nothing is logged.

## Accessibility

- A skip link comes first.
- Landmarks: `nav` "Utama", `nav` "Breadcrumb", `main`, `header` (phone).
- Menus and sheets are keyboard-operable, `inert` while open, and return focus to their trigger.
- Indonesian `aria-label`s: *Ciutkan sidebar*, *Buka sidebar*, *Keluar*, *Kembali*, *Tutup*, *Cari*, *Notifikasi*, *Menu*.
- Targets are at least 24 px.
- Rules v3.1 N1: the active label is semibold and the icon changes colour (dark-mode mitigation).

## Testing strategy

| AC | Unit / component (Vitest + Testing Library) | E2E (Playwright + axe) |
|---|---|---|
| 001 Desktop shell | `PageHeader`, `AppPanel`, `AppShell` render (breadcrumb, utilities, h1) | Desktop 1440: breadcrumb and utilities visible; export fidelity |
| 002 Collapse remembered | preference wrapper (storage throws → expanded) | Collapse, reload, and still collapsed |
| 003 Tablet rail & overlay | `SidebarRail`, overlay close (Esc, scrim, destination) with focus return | Width 1024 |
| 004 Phone top-level | `MobileHeader`, `MobileAppShell` | Width 390: pill, three utilities, Invoice tab |
| 005 Sub-page | `CompactBar` (Back href = parent; empty Actions) | Story-level only (no route yet) |
| 006 Active nav | `resolveActiveNav` table test | Menu destination has no active tab; Profile has none |
| 007 Menu sheet | owner-shell sheet contents, inert, focus return | Open from the Menu button |
| 008 CTA | CTA href | CTA → Proyek *Segera hadir* |
| 009 Switcher | `WorkspaceSwitcher` list, pending, failure toast + retry (mocked action) | Switch A → B lands on B's Dashboard |
| 010 Foreign workspace | existing F-02 resolver tests stay green | Existing F-02 journey |
| 011 Responsive transitions | `AppShell` breakpoint cleanup (mocked `matchMedia`) | Resize 1440 → 900 → 390 with overlays open |
| 012 Accessibility | labels and landmarks | axe at 3 widths × 2 themes |
| 013 Search / Notifications | `IconButton` badge (0 hidden, `99+` cap, label) and section labels | Utilities → *Segera hadir* |
| 014 Layers | Toast renders while the Modal/Sheet stays open | Create workspace + toast |

Gate per iteration: `pnpm typecheck && pnpm lint && pnpm test`. From iteration 5 on, add `pnpm e2e` (shell journeys) and `pnpm tokens:check`. `pnpm build` runs at the end. The 12 accepted Auth/Foundation failures and the mosaic build blocker remain known and accepted (HANDOFF).

## Iterations

Each iteration goes through plan → test first → implement → verify (gate + fidelity against exports) → one commit per task (conventional commits).

1. **Tokens and primitives**
   - [ ] `pnpm tokens:css` (531); `tokens:check` passes
   - [ ] `IconButton` `badgeCount` (danger CountBadge, MD offset, label)
   - [ ] `NavItem` / `NavRailItem` active (semibold) and hover (`icon-hover`)
   - **Done when:** unit tests pass and Storybook light and dark match the library.
2. **Toast action and Menu/List**
   - [ ] `ToastContent.action`
   - [ ] `MenuList` variant (dividers, footer)
   - **Done when:** tests pass and the stories match `switch-failed-CyFKd` and the `switcher-cLGAL` menu.
3. **Page Header, App Panel and coming-soon sections**
   - [ ] `PageHeader` pattern
   - [ ] `AppPanel` uses it
   - [ ] `search` / `notifications` sections with labels
   - **Done when:** AC-001 and AC-013 unit tests pass and the fidelity check against `dashboard-A4o4CS` passes.
4. **Desktop / tablet shell**
   - [ ] Collapse preference
   - [ ] Extract the rail (`SidebarRail`, `NavRailItem`), with the chevron workspace control and `surface.muted` root
   - [ ] Utilities wired
   - **Done when:** AC-002, 003 and 006 (desktop) pass and the tablet exports match.
5. **Workspace switcher**
   - [ ] Same content on every layout, with the primary CTA
   - [ ] Pending state
   - [ ] Failure Toast with retry
   - [ ] Phone sheet from the pill
   - **Done when:** AC-009 and 014 pass (unit + E2E).
6. **Phone shell**
   - [ ] `WorkspacePill`, `MobileHeader`, `MobileAppShell` (content sheet, layers)
   - [ ] Bottom Nav with Invoice; CTA → Proyek
   - [ ] Menu button → menu sheet (no switcher, no Invoice)
   - [ ] `resolveActiveNav` phone tabs
   - **Done when:** AC-004, 006, 007 and 008 pass and the phone exports match.
7. **Sub-page variant**
   - [ ] `CompactBar` + `MobileShell` patterns, stories and the `resolveSubPageParent` type
   - **Done when:** AC-005 passes at story/unit level.
8. **Responsive transitions and accessibility**
   - [ ] Breakpoint cleanup and focus handling
   - [ ] axe at 3 widths × 2 themes
   - [ ] Playwright shell journeys
   - **Done when:** AC-011 and 012 pass and the full gate plus `pnpm build` pass.
9. **Write-back**
   - [ ] Update `spec.md` if behaviour moved, `design.md` deviations, `feature-map.md` (IMPLEMENTED) and `HANDOFF.md`
   - [ ] Run `/sdv:verify-feature app-shell-revamp`

## Implementation record

- Iterations 1–8 are implemented locally: 531-token CSS, responsive shell patterns, phone navigation, switcher retry feedback, coming-soon utilities, and compact sub-page patterns.
- The HTML exports remain the visual source of truth; no `.pen` files were edited.
- Final Owner verification remains `/sdv:verify-feature app-shell-revamp`.

## Risks / open questions

- **Next.js version:** AGENTS.md warns that APIs differ from training data. Read `node_modules/next/dist/docs/` for redirect-error detection and client-side server-action error handling before iteration 5.
- **React Aria Toast actions:** confirm the queued toast can render an interactive action without breaking toast region semantics (iteration 2).
- **Consumer design drift:** `workspace.pen` and `auth.pen` are not rebound and `message-templates.pen` is skipped. Their mobile frames show the new header with the default title. This isn't a code blocker; F-02 exports stay the historical reference, and F-17 exports win for the shell.
- **Sub-page variant has no consumer yet:** F-03 is its first real route. Until then AC-005 is verified in Storybook and unit tests.
- **`/sdv:verify-design-system` was skipped** at the Owner's request (token budget). The design-system verification report is stale until it runs.
- **No ADR needed:** no architecture, stack or data-boundary change. The collapse preference is per-browser UI state (F-02 A-8).
