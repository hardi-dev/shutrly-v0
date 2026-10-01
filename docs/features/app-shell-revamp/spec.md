# Feature: App Shell revamp — desktop, tablet and mobile navigation

ID: F-17 · Slug: `app-shell-revamp`
Status: DONE (2026-10-01) · Design: [design.md](design.md) · Plan: [technical-design.md](technical-design.md)
Journey: [J-01 Owner onboarding](../../product/user-journeys.md) · Builds on: F-02 `workspace` (DONE)

## Goal
Every owner screen runs in the revised Shell v3, on desktop, tablet and phone. The shell covers the sidebar and workspace switcher, active navigation, the new Page Header, the content canvas, the mobile header, the menu sheet and bottom navigation, and the transitions between breakpoints. Workspace isolation and the navigation contract from F-02 stay unchanged.

## User Story
As a photographer (Owner), I want the same navigation and page context on every screen and device, so that I always know which workspace and page I'm in and can move between them quickly.

## Design source
Frames in `docs/design-system/exploration.pen`. Only the **shell** is in scope; the content drawn inside them (greeting, metrics, agenda, tables, template list, editor) is not.

| Frame | What it defines |
|---|---|
| `tpgiY` H4d · LIGHT / `G2eLt` H4d · DARK | Desktop: Sidebar (logo row + collapse, switcher without mark, Nav, Nav bottom, Account), App Panel with Page Header (breadcrumb bar + hero: title, subtitle, actions) and the content canvas. |
| `Bsc1w` Phones / `u6jBqs` Phones · DARK | Phone: G1/G2 **top-level header** (workspace switcher pill, page title, subtitle, content sheet, Bottom Nav with CTA). G3 **sub-page compact bar** (Back, title, parent label, one action; Bottom Nav stays). |

Library contracts: App Shell C30, Sidebar C29, Nav Rail / App Shell Tablet C37, Mobile App Shell C35, Bottom Nav C34, Bottom Sheet/Menu C32, Page Header C40, App Panel C28, Menu C10, Toast C39.

The feature design is [`app-shell-revamp.pen`](app-shell-revamp.pen). Its frames, local proposal components and library promotions are recorded in [design.md](design.md). Visual decisions such as colours, tokens and component variants live there, not in this spec.

## Preconditions
- F-02 DONE: URL-scoped workspace routes `/w/<id>/...` (ADR-015), the verified `WorkspaceContext` resolver, the switch POST (verify + touch, then redirect to the Dashboard), the create-workspace dialog, the *Segera hadir* placeholder route, and the Profile page shell.
- Actor: a signed-in, verified, `ACTIVE` Owner with ≥1 workspace. F-01/F-02 gates run first (BR-AUTH-003/004/005).
- Shell v3 design-system tokens and components are saved (527 variables, checksum `99143acb`).

## Inputs
| Control | Input |
|---|---|
| Nav item / Bottom Nav tab / menu-sheet item | a destination |
| Workspace switcher (Sidebar, rail, mobile header pill) | one owned workspace · the primary "Buat workspace" button |
| Header utilities (breadcrumb bar; phone top-level header) | Cari · Notifikasi · Menu (Menu on phones only) |
| Toast action | *Coba lagi* after a failed switch |
| Sidebar collapse / expand | a per-browser layout preference |
| Mobile sub-page Back | return to the page's hierarchical parent |

No new server data. The only persisted preference is the per-browser collapse state.

## Layouts and breakpoints
| Width | Layout |
|---|---|
| ≥ 1280 px (desktop) | Sidebar 252, expanded by default; the collapse button switches to the 72 px rail inline and the panel grows. The choice is remembered per browser (F-02 A-8). App Panel with the Page Header and the content canvas (Container max 1096, centred). |
| 768–1279 px (tablet) | **Owner 2026-09-29: keep the F-02 rail in v3 styling.** The 72 px rail is the default. Its logo/expand control opens the full Sidebar as a dismissible overlay above the panel, never pushing it. The panel uses the same Page Header as desktop; the Container fills the width. The collapse preference doesn't apply. |
| < 768 px (phone) | Mobile shell: top-level header or sub-page compact bar, the content sheet, and a Bottom Nav fixed at the bottom. |

## Main Flow — desktop / tablet page
1. The Owner opens an owner page. The server verifies the workspace in the URL (BR-WS-003), and every page and action repeats this check.
2. The shell renders:
   - the Sidebar, or the rail on tablet, with the active workspace name in the switcher;
   - the full F-02 navigation, with the current destination active;
   - the Account block;
   - the App Panel. Its Page Header has a breadcrumb bar (Parent = workspace name, Current = the page's nav label) and a hero (the page `<h1>` title, an optional one-line subtitle, and at most one primary action).
3. The page content renders in the content canvas below the Page Header.

## Main Flow — phone, top-level page
1. As above, the workspace is verified.
2. The top-level header shows:
   - the **workspace switcher pill** (active workspace name + chevrons) on the left;
   - the utilities **Cari · Notifikasi · Menu** on the right;
   - the page title (`<h1>`) and an optional subtitle.

   Content follows in the content sheet.
3. **Owner 2026-09-29, option A:** the Bottom Nav shows Dasbor · Proyek · **+** (CTA) · Klien · **Invoice**, with the current destination's tab active. The former *Lainnya* tab is removed; the header **Menu** button opens the menu sheet instead.

## Main Flow — phone, sub-page (Owner 2026-09-29: in scope as a shell variant)
1. A page that sits below a top-level destination (e.g. a detail or editor page in a later feature) uses the **compact bar**: Back, the title, its parent's label as a caption, and an **optional Actions slot** that is empty by default and holds at most one action (e.g. *Simpan*).
2. Back goes to the page's **hierarchical parent**, not to browser history.
3. The Bottom Nav stays visible, with the parent destination's tab active (none when the parent is a menu-sheet destination, S-A4). The compact bar has no Menu button; the Owner reaches the menu from a top-level page.
4. F-17 defines the variant only. No sub-page exists yet; later features (e.g. F-03) are its first consumers.

## Alternative Flows
- **Switch workspace (desktop/tablet):** the switcher opens a Menu with the same content on every layout (Owner 2026-09-29):
  - the label *Pindah workspace*;
  - owned workspaces sorted alphabetically and separated by full-width dividers, with no decorative icon; the current one is marked with a check;
  - a **primary *Buat workspace* button** at the bottom, which replaces the former menu item.

  Choosing another workspace runs F-02's switch: a POST that verifies and touches it, then a redirect to its Dashboard.
- **Switch workspace (phone). Owner 2026-09-29: the header pill only.** The pill opens a bottom sheet with the same list and actions. The menu sheet **no longer** contains the switcher. Sub-pages have no pill; to switch, the Owner returns to a top-level page.
- **Create workspace:** *Buat workspace* opens F-02's create-workspace form, unchanged, in the shell's Modal layer. That is Modal/SM on desktop and tablet, and Bottom Sheet/Form in the Sheet layer on phones. On success the new workspace's Dashboard opens.
- **Menu sheet (phone), opened by the header Menu button (formerly *Lainnya*):**
  - header: logo row with a round Close;
  - navigation: the KATALOG group (Layanan, Tim); then Template pesan, Sumber klien, Pengaturan. Invoice is now a Bottom Nav tab;

    *Changed by F-04 (Owner 2026-10-01): *Sumber klien* is renamed *Sumber foto*, route `photo-sources`; see [source-config spec A-1](../source-config/spec.md).*
  - footer: Account (links to Profile) and Keluar.

  Choosing an item navigates and closes the sheet.
- **Bottom Nav CTA (+):** opens the new-project destination. Until F-05 exists, that is the Proyek *Segera hadir* page (F-02 AC-WS-025). It doesn't open a menu.
- **Search / Notifications:** open their *Segera hadir* page (S-A2).
- **Unbuilt destination:** the *Segera hadir* page inside the shell, with the destination's nav item active (F-02 SPEC GAP-F02-1). The Page Header shows its name.
- **Profile (outside `/w/`):** it renders in the shell of the last-opened workspace (F-02 behaviour). No nav item or Bottom Nav tab is active; the breadcrumb is workspace › *Profil*.
- **Tablet overlay:** it closes with Esc, a click on the scrim or choosing a destination. Focus returns to the control that opened it.
- **Responsive transition:** when the viewport crosses a breakpoint, the layout switches with no reload, no loss of route, and no loss of workspace. An overlay, menu or sheet that belongs to the layout being left closes, and focus stays inside the page.

## Error Cases
- The workspace in the URL isn't owned or doesn't exist → F-02's *not found*, the same for both (BR-WS-003, ADR-015 A-9). The shell renders no data from that workspace.
- The switch target isn't owned or doesn't exist → *not found*; last opened is unchanged (F-02 AC-WS-012).
- The switch request fails → the current workspace stays active, the switcher closes and stays usable, and a **danger Toast** shows *Gagal pindah workspace* with a **Coba lagi** action that re-sends the same switch (C-007; Owner 2026-09-29). Placement follows the Toast pattern: bottom-right on desktop and tablet; top-centre, full width with side margins below the status bar on phones. The Toast needs an optional action, which the code Toast doesn't support yet.
- The create request fails → F-02's create-workspace dialog handles it (unchanged).
- Local storage is unavailable → the collapse preference falls back to expanded, and nothing breaks.

## UI States (C-007)
- Switcher list: loading, populated (never empty for an Owner who reaches it), switching (list disabled), and failed (danger Toast with *Coba lagi*).
- Shell layers: each layout keeps the Modal/Sheet overlay and the Toast stack on separate layers, and the Toast never makes the page inert. The tablet shell gains a Toast layer, bottom-right, like desktop.
- Nav item: default, hover, focus, active.
- Sidebar: expanded or collapsed (desktop); rail, or rail with the overlay open (tablet).
- Phone: menu sheet closed or open; switcher sheet closed or open.
- Page Header: with or without the subtitle, with or without an action.
- Light and dark themes via tokens, as in the four frames.

## Business Rules
- BR-WS-002 — tenant isolation
- BR-WS-003 — workspace context is verified
- BR-WS-006 — last-opened workspace, no selection step (the switch touches it)
- BR-WS-007 — no archive/delete: the shell offers neither
- BR-AUTH-003, BR-AUTH-004, BR-AUTH-005 — gates before the shell (relied on)
- Constitution: C-004, C-007, C-008, C-101
- ADR-003, ADR-015 — URL-scoped, verified workspace context; switch by POST

## Assumptions (low-risk, reversible)
- **S-A1 Copy:** UI copy is Indonesian, following the coding rules, so the design's English strings ("Dashboard", "Good morning", "New project") become their Indonesian labels. The breadcrumb Current label is the nav label (e.g. *Dasbor*).
- **S-A2 Header utilities — DECIDED (Owner 2026-09-29), replaces F-02 A-7 for the shell.** Search and Notifications are visible:
  - on desktop and tablet, in the right end of the Page Header breadcrumb bar;
  - on phones, in the top-level header, but not in the sub-page compact bar.

  Until their features exist, each opens the *Segera hadir* page inside the shell (sections `search` and `notifications`; breadcrumb Current *Pencarian* / *Notifikasi*; no nav item active).

  **Unread count (Owner 2026-09-29):** the Notifications button carries the danger count-badge variant, shown only when the unread count is > 0 and hidden at 0. Until a notification feature supplies a count, it is always 0, so the badge is hidden. The count is part of the button's accessible name (*Notifikasi, 3 belum dibaca*).
- **S-A3 Scrolling:** the desktop Sidebar stays at viewport height while the panel scrolls. On phones the top-level header scrolls with the content, and the sub-page compact bar and the Bottom Nav stay fixed.
- **S-A4 Menu destinations:** on a phone, when the current page is a menu-sheet destination (Layanan, Tim, Template pesan, Sumber klien, Pengaturan), no Bottom Nav tab is active. The Menu button stays in its default state, and the page title identifies the location.
- **S-A5 Page Header content:** title, subtitle and action come from the page. The Dashboard keeps its current F-02 content; its greeting, badges and metrics are out of scope.
- **S-A6 Breadcrumb depth:** one Parent and one Current item (C40 rule). Sub-pages on desktop use workspace › parent destination › page only when a later feature needs it. F-17 ships the two-level form.

## Dependencies
- F-02 Workspace (routes, resolver, switch/create actions, *Segera hadir*, Profile shell).
- Design-system Shell v3 (C28–C30, C32, C34, C35, C37, C40).
- `/sdv:design-feature app-shell-revamp` must produce approved frames and HTML exports for:
  - desktop, tablet (rail and overlay), phone top-level, phone sub-page, the switcher sheet and the menu sheet without the switcher or Invoice;
  - each in light and dark.

  It also proposes the library promotions (C35 mapping and header, C33/compact bar, C37 Toast layer, C39 Toast/Danger with action, C40 utilities, Nav Item active/hover, the `font.size.heading` token). They are promoted through `/sdv:save-design-system` after design approval; see design.md.
- Later consumers: F-03 and every later owner page (the Page Header and the sub-page variant).

## Out of Scope
- Dashboard content: the greeting, status badge, metrics, agenda, "this week", tables and widgets.
- Search and notification functionality, and count badges with real data (the entry points exist; see S-A2).
- New navigation destinations or changes to the navigation list. The only new routes are the two *Segera hadir* sections for Search and Notifications (S-A2). On phones the Bottom Nav placement changes (Invoice becomes a tab; option A), but the destinations stay the same.
- Changes to the workspace domain, switching or creation rules.
- Changes to the design library before the design-approval gate.

## Supersedes (on F-17 delivery)
- F-02 AC-WS-011, mobile part: the switcher lives in the header pill, not in the menu sheet.
- F-02 A-7 and the C35 mapping, phone part: Invoice is a Bottom Nav tab and *Lainnya* becomes the header Menu button (option A, Owner 2026-09-29).
- F-02 AC-WS-021: shell layout details, now AC-SHELL-001…014.
- F-02 A-7, header part: Search and Notifications are visible and open *Segera hadir* (S-A2).

F-02's isolation, switch and *Segera hadir* behaviour stays as it is.

## Open Questions / SPEC GAPS
- None blocking. The code drift noted at discovery and design is an input for planning:
  - the collapse preference isn't persisted;
  - the mobile header uses an app-bar title with a search and an **info** icon; it needs the workspace pill, Cari · Notifikasi (bell) · Menu, and the page title;
  - the Bottom Nav still has *Lainnya* instead of Invoice, and its CTA opens a menu;
  - the menu sheet still lists the switcher and Invoice;
  - desktop and tablet still use the legacy App Panel header, with no breadcrumb utilities;
  - `Toast` has no action and no Danger specimen; the tablet shell has no Toast layer;
  - `CountBadge` merges the neutral and danger badges, while the library keeps C13 and C14 separate and uses different type, padding and cap (see design.md).
