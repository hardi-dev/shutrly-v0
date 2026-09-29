# F-17 App Shell revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Format note (Owner 2026-09-29):** this plan uses **pseudo code** only, to keep it short. The implementer writes real code that follows the pseudo code, `docs/coding-rules.md` and the HTML exports. It is not copied verbatim.

**Goal:** Ship the Shell v3 app shell (F-17) in code: Page Header, nav v3.1, collapse memory, tablet rail, workspace switcher with a failure toast, phone Mobile Header + Invoice tab + menu sheet, the sub-page Compact Bar, and the responsive/a11y behaviour.

**Architecture:** This is UI-only work on the F-02 shell. Patterns live in `src/ui/{primitives,patterns}`; owner wiring lives in `src/features/workspace/ui/*`. There are no schema or server-action changes. The switch still goes through `switchWorkspaceAction` (verify + touch + redirect), and the client only adds failure handling.

**Tech stack:** Next.js App Router (read `node_modules/next/dist/docs/` before touching server-action/redirect handling) · React Aria Components · Tailwind v4 theme variables from `tokens.css` · Vitest + Testing Library · Playwright + axe · Storybook.

**Sources:** [spec.md](spec.md) · [acceptance-criteria.md](acceptance-criteria.md) (AC-SHELL-001…014) · [technical-design.md](technical-design.md) · [design.md](design.md) · [exports/](exports/) (31 frames).

## Global constraints

- Folder architecture is fixed (`docs/architecture/overview.md`). Each unit gets its own folder with co-located `*.test.tsx`, `*.types.ts`, `*.copy.ts` (Indonesian copy) and `*.stories.tsx`.
- UI follows the HTML exports. The fidelity pass may change only class names and nesting (AGENTS.md).
- Tokens only (G1–G8, rules v3.1). No hex, no primitives, no off-scale px. Use CSS vars `--component-*` / `--color-semantic-*`.
- Workspace URL is `/w/<id>/…`; slugs are English, copy is Indonesian. Never trust a client workspace ID; the server re-verifies.
- Do not change the navigation list. New sections are only `search` and `notifications` (*Segera hadir*).
- Commits are conventional, English, lowercase, no trailing period, one per task. Never run `pnpm db:migrate`. Never edit `.pen` files.
- Gate per task: `pnpm typecheck && pnpm lint && pnpm test`. Tasks that touch tokens also run `pnpm tokens:check`; E2E tasks also run `pnpm e2e`. Known accepted failures: the 12 Auth/Foundation tests and the mosaic build blocker (HANDOFF).

## File map

| Path | Responsibility |
|---|---|
| `src/ui/theme/tokens.css` | Generated. 531 tokens |
| `src/ui/primitives/icon-button/*` | `badgeCount` → CountBadge danger |
| `src/ui/patterns/nav-item/*`, `nav-rail-item/*`, `sidebar-rail/*` | v3.1 active/hover; rail extracted from app-shell |
| `src/ui/patterns/toast/*` | Optional `action` |
| `src/ui/patterns/menu/*` | `MenuList` variant |
| `src/ui/patterns/page-header/*` (new) | Breadcrumb + utilities + hero |
| `src/ui/patterns/app-panel/*`, `app-shell/*` | Uses PageHeader; collapse memory; breakpoint cleanup |
| `src/ui/patterns/workspace-pill/*`, `mobile-header/*`, `compact-bar/*`, `mobile-shell/*` (new) | Phone shell parts |
| `src/ui/patterns/mobile-app-shell/*` | v3 layout (header, content sheet, layers) |
| `src/features/workspace/domain/coming-soon-sections/*` | + `search`, `notifications` |
| `src/features/workspace/ui/owner-nav/*` | `resolveActiveNav` |
| `src/features/workspace/ui/workspace-switcher/*`, `owner-shell/*` | Switcher v3, failure toast, phone wiring |
| `e2e/app-shell-revamp.spec.ts` (new) | AC journeys + axe |

---

### Task 1: Tokens CSS (531)

**Files:** Modify `src/ui/theme/tokens.css` (generated) · Test: `pnpm tokens:check`
**Produces:** CSS vars `--font-size-heading`, `--font-letter-spacing-heading`, `--component-nav-item-icon-hover`, `--component-sheet-item-check`, plus the retargeted nav and badge vars.

- [ ] Run `pnpm tokens:check`. Expected: FAIL (drift: 527 vs 531).
- [ ] Run `pnpm tokens:css`, then `pnpm tokens:check`. Expected: PASS (531).
- [ ] Commit `chore(tokens): regenerate css for shell v3.1 tokens`.

### Task 2: IconButton count badge

**Files:** Modify `src/ui/primitives/icon-button/{icon-button.tsx,.types.ts,.test.tsx,.stories.tsx}`
**Consumes:** `CountBadge({count, variant:"danger"})`
**Produces:** `IconButtonProps.badgeCount?: number`

- [ ] Write the failing tests:
  ```
  render IconButton(icon=bell, aria-label="Notifikasi", badgeCount=3)
    expect badge text "3"; expect accessible name "Notifikasi, 3 belum dibaca"
  render badgeCount=0  → no badge; name "Notifikasi"
  render badgeCount=120 → badge "99+"
  ```
- [ ] Run `pnpm test icon-button`. Expected: FAIL.
- [ ] Implement:
  ```
  label = badgeCount>0 ? `${aria-label}, ${badgeCount} ${COPY.unread}` : aria-label
  <Button aria-label=label relative>
    <Icon/>
    {badgeCount>0 && <CountBadge variant=danger count=badgeCount
        className="absolute left-5 top-1" (MD offset x20/y4)/>}
  ```
- [ ] Run tests. Expected: PASS. Add a story with badge in light and dark.
- [ ] Commit `feat(ui): add count badge to icon button`.

### Task 3: Nav item and rail item v3.1 (N1)

**Files:** Modify `src/ui/patterns/nav-item/*` · Create `src/ui/patterns/nav-rail-item/*` (move the rail item out of `app-shell.tsx`)
**Produces:** `NavItem({href,label,icon,isActive,count?})`, `NavRailItem({href,label,icon,isActive,badge?})`

- [ ] Write the failing tests:
  ```
  active → aria-current="page"; class uses --component-nav-item-background-active; label font-semibold
  inactive → hover class uses --component-nav-item-background-hover and icon --component-nav-item-icon-hover
  rail item → aria-label=label, tooltip on focus
  ```
- [ ] Run. Expected: FAIL. Implement the token classes and semibold on active. Run. Expected: PASS.
- [ ] Check the stories against `exports/dashboard-A4o4CS.html` and `exports/dashboard-tablet-M2wNUK.html`.
- [ ] Commit `feat(ui): apply v3.1 nav active and hover styles`.

### Task 4: Toast action

**Files:** Modify `src/ui/patterns/toast/{toast.tsx,.types.ts,.test.tsx,.stories.tsx}`
**Produces:** `ToastContent.action?: { label: string; onAction: () => void }`

- [ ] Write the failing test:
  ```
  showToast({tone:"danger", title:"Gagal pindah workspace", body:"…", action:{label:"Coba lagi", onAction:spy}})
  click "Coba lagi" → spy called once; toast closes
  ```
- [ ] Run. Expected: FAIL. Implement: pass `action` through to Alert's Action link/button inside the toast item, keeping the React Aria toast semantics. Run. Expected: PASS.
- [ ] Commit `feat(ui): support an action in toast`.

### Task 5: MenuList variant

**Files:** Modify `src/ui/patterns/menu/{menu.tsx,menu.types.ts,menu.test.tsx,menu.stories.tsx}`
**Produces:** `Menu({variant?: "default" | "list", footer?: ReactNode})`

- [ ] Failing test: `variant="list"` gives no horizontal padding, `MenuDivider` renders between items, and the footer renders after the items.
- [ ] Implement, then run. Expected: PASS.
- [ ] Commit `feat(ui): add list variant to menu`.

### Task 6: Coming-soon sections search and notifications

**Files:** Modify `src/features/workspace/domain/coming-soon-sections/{coming-soon-sections.ts,.test.ts}` and its copy
- [ ] Failing test: `isComingSoonSection("search")` and `isComingSoonSection("notifications")` are true; the labels are *Pencarian* / *Notifikasi*.
- [ ] Implement by adding both to the list. Run. Expected: PASS.
- [ ] Commit `feat(workspace): add search and notifications coming soon sections`.

### Task 7: PageHeader and AppPanel

**Files:** Create `src/ui/patterns/page-header/*` · Modify `src/ui/patterns/app-panel/*`
**Produces:** `PageHeader({parent, current, title, subtitle?, action?, utilities?})`

- [ ] Write the failing tests:
  ```
  nav[aria-label=Breadcrumb] shows parent › current; current has aria-current=page
  exactly one h1 = title; subtitle optional; action after h1 in DOM
  utilities slot renders at the end of the breadcrumb bar
  AppPanel renders PageHeader (no legacy title row)
  ```
- [ ] Run. Expected: FAIL. Implement with `--component-page-header-*` tokens and the layout from `exports/dashboard-A4o4CS.html`. Run. Expected: PASS.
- [ ] Commit `feat(ui): add page header and use it in app panel`.

### Task 8: AppShell collapse memory, rail and utilities

**Files:** Modify `src/ui/patterns/app-shell/*` · Create `src/ui/patterns/sidebar-rail/*` (rail extracted, chevron workspace control) · Modify `src/features/workspace/ui/owner-shell/*` (utilities → `/w/<id>/search`, `/w/<id>/notifications`)
**Produces:** `readCollapsed(): boolean`, `writeCollapsed(v: boolean): void` (key `shutrly.sidebar.collapsed`)

- [ ] Write the failing tests:
  ```
  collapse → writeCollapsed(true); remount → starts collapsed
  localStorage throws → starts expanded, no crash
  tablet rail workspace control icon = chevrons-up-down; root uses surface-muted
  overlay: Esc / scrim / destination closes; focus returns to trigger
  ```
- [ ] Run. Expected: FAIL. Implement with try/catch around storage and read after mount (no hydration mismatch). Run. Expected: PASS.
- [ ] Commit `feat(ui): remember sidebar collapse and extract tablet rail`.

### Task 9: resolveActiveNav

**Files:** Modify `src/features/workspace/ui/owner-nav/{owner-nav.tsx,owner-nav.test.tsx}`
**Produces:** `resolveActiveNav(pathname, workspaceId) → { nav: NavKey | null; tab: "dashboard" | "projects" | "clients" | "invoices" | null }`

- [ ] Failing table test:
  ```
  /w/A            → nav dashboard, tab dashboard
  /w/A/projects   → projects, projects
  /w/A/invoices   → invoices, invoices
  /w/A/settings   → settings, null   (menu destination, S-A4)
  /w/A/search     → null, null
  /profile        → null, null
  ```
- [ ] Implement and run. Expected: PASS. Use it in OwnerNav.
- [ ] Commit `feat(workspace): resolve active nav and phone tab from path`.

### Task 10: Workspace switcher v3 and failure toast

**Files:** Modify `src/features/workspace/ui/workspace-switcher/*`
**Consumes:** `Menu variant=list` (Task 5), `showToast(... action)` (Task 4), `switchWorkspaceAction`

- [ ] Write the failing tests:
  ```
  lists workspaces alphabetically, no icons, dividers, current has check, footer primary "Buat workspace"
  on select B: items + CTA disabled while pending
  action rejects (non-redirect error) → toast danger "Gagal pindah workspace" with "Coba lagi"; current stays A
  click "Coba lagi" → action called again with B
  redirect error → rethrown (not toasted)
  ```
- [ ] Run. Expected: FAIL. Implement:
  ```
  try { await switchWorkspaceAction(id) }
  catch (e) { if isRedirectError(e) throw e   // confirm API in node_modules/next/dist/docs
              showToast({tone:danger, title, body, action:{label:COPY.retry, onAction:()=>select(id)}}) }
  ```
  Run. Expected: PASS.
- [ ] Commit `feat(workspace): restyle switcher and toast failed switches`.

### Task 11: Phone shell (pill, header, content sheet, Bottom Nav, menu sheet)

**Files:** Create `src/ui/patterns/workspace-pill/*`, `src/ui/patterns/mobile-header/*` · Modify `src/ui/patterns/mobile-app-shell/*`, `src/features/workspace/ui/owner-shell/*`
**Produces:** `WorkspacePill({name, onPress})`, `MobileHeader({workspace, title, subtitle?, utilities})`

- [ ] Write the failing tests:
  ```
  header: pill(aria-haspopup) + buttons Cari, Notifikasi, Menu + h1 title (font-size-heading)
  bottom nav items = Dasbor, Proyek, +, Klien, Invoice; CTA href /w/A/projects
  Menu → sheet with KATALOG(Layanan,Tim), Template pesan, Sumber klien, Pengaturan, account, Keluar
         (no switcher, no Invoice); content + nav inert; close → focus back to Menu
  pill → switcher sheet (Task 10 content, Button LG CTA)
  tab active via resolveActiveNav; none on menu destinations
  ```
- [ ] Run. Expected: FAIL. Implement against `exports/dashboard-KqWRQ.html`, `menu-sheet-z2gaQ.html` and `switcher-m9ZcCs.html`. Remove the old search/info app bar and the *Lainnya* tab. Run. Expected: PASS.
- [ ] Commit `feat(workspace): ship phone shell v3 with invoice tab and header menu`.

### Task 12: Sub-page variant (CompactBar + MobileShell)

**Files:** Create `src/ui/patterns/compact-bar/*`, `src/ui/patterns/mobile-shell/*`
**Produces:** `CompactBar({title, parent:{label, href}, actions?})`, `MobileShell({compactBar, bottomNav, children})`

- [ ] Failing test: Back is a link with `aria-label="Kembali"` and href = parent.href; title is the h1; the parent caption shows; no actions → nothing rendered; Bottom Nav present.
- [ ] Implement per `exports/sub-page-CPIWh.html` and `sub-page-no-action-b7VW9.html`. Run. Expected: PASS. Add stories (light, dark, with and without an action).
- [ ] Commit `feat(ui): add compact bar and mobile shell for sub pages`.

### Task 13: Responsive transitions and accessibility E2E

**Files:** Modify `src/ui/patterns/app-shell/*` (breakpoint cleanup) · Create `e2e/app-shell-revamp.spec.ts`

- [ ] Failing unit test: when `matchMedia` changes, open overlays and sheets close and focus is inside `main`.
- [ ] Implement, then run the unit tests. Expected: PASS.
- [ ] Write the E2E:
  ```
  for width in [1440, 1024, 390] × theme in [light, dark]:
    goto /w/A → skip link first; landmarks; axe 0 violations
  collapse → reload → collapsed (1440)
  switch A→B → B dashboard; route-mock failure → toast + retry
  390: Menu → sheet; CTA → Proyek segera hadir; Notifikasi → segera hadir
  resize 1440→900→390 with overlay open → closed, URL unchanged
  ```
- [ ] Run `pnpm e2e e2e/app-shell-revamp.spec.ts`. Expected: PASS. Then run `pnpm build`.
- [ ] Commit `test(e2e): cover app shell revamp journeys and axe`.

### Task 14: Write-back

**Files:** `docs/features/app-shell-revamp/{technical-design.md,design.md}`, `docs/product/feature-map.md`, `docs/HANDOFF.md`
- [ ] Tick the iterations. Record any deviation from the exports or spec. Set F-17 to IMPLEMENTED. Point HANDOFF to `/sdv:verify-feature app-shell-revamp`.
- [ ] Commit `docs(app-shell-revamp): record implementation and next step`.

---

## Self-review

- **Coverage:**
  - AC-001: T7, T8
  - AC-002: T8
  - AC-003: T3, T8
  - AC-004: T11
  - AC-005: T12
  - AC-006: T3, T9
  - AC-007: T11
  - AC-008: T11
  - AC-009: T5, T10
  - AC-010: existing F-02 tests + T13
  - AC-011: T13
  - AC-012: T13
  - AC-013: T2, T6
  - AC-014: T4, T10, T13
- **Type consistency:** `badgeCount`, `ToastContent.action`, `Menu.variant/footer`, `PageHeader` props, `resolveActiveNav` and the `CompactBar` parent `{label, href}` are defined before use.
- **Iteration mapping (technical-design):**
  - 1 = T1–T3
  - 2 = T4–T5
  - 3 = T6–T7
  - 4 = T8
  - 5 = T10
  - 6 = T9, T11
  - 7 = T12
  - 8 = T13
  - 9 = T14
