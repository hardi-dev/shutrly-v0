# F-02 Workspace — Visual design

Status: APPROVED (Owner 2026-09-27) · Pencil source: [workspace.pen](workspace.pen) (saved 2026-09-27 23:16, 455,029 bytes) · Rules: [token-usage.md](../../design-system/token-usage.md), APPROVED 2026-09-26, so they are binding.

## Direction

- **Exploration:** `docs/design-system/exploration.pen` › board **08 — F-02 Onboarding exploration** (`Etl3k`). There were three directions (A `kwqGb`, B `B4k3kL`, C `OI2bw`). The Owner chose the **D mix** (`bEbHx`): the left panel from C (form plus the "what you get" list) and the right panel from A (a live sidebar preview). It was then aligned to `auth.pen`: 24 gap, MD button, signed-in row inside the form, © footer. The right panel became the auth mosaic with a sidebar-preview card in place of the headline (Owner 2026-09-27).
- **Pre-workspace screen** (onboarding): the auth split layout, i.e. a 600 form column, a 420 form, and the editorial panel from `lg` up. Mobile has one column, and the editorial panel is omitted.
- **In-workspace screens** (dashboard, switcher, create, coming soon, settings, not found): direct instances of the library **App Shell** (desktop), **App Shell/Tablet** (rail) and **Mobile App Shell** (Bottom Nav plus sheets).
- **Canvas layout:** the same as `auth.pen`. Desktop frames are at x 0 and mobile at x 1520, with one state per row, ordered downwards (Owner 2026-09-27). A desktop-only state leaves the mobile column empty, and vice versa.

## Library link

- `workspace.pen` imports `design-system.lib.pen` with the prefix **`G:`**: 219 reusable components, 479 variables, theme axis `G:mode` light/dark. Verified through MCP on 2026-09-27.
- Every field, button, alert, menu, nav item, modal, sheet and shell is a **linked instance**. Nothing is detached. States are expressed with variant refs (e.g. Text Field Default/Focus/Error/Disabled, Button Primary Default/Disabled) and `descendants` overrides.
- There is one local reusable component: **Workspace / Editorial preview** (`UTew4`, 840 × 900, at x 2080). It contains the auth mosaic (`public/auth/editorial/mosaic@2x.webp`, including the scrim) plus a sidebar-preview card built from `component/sidebar/*` tokens and Nav Item instances. Every onboarding desktop frame uses an instance of it.

## Screen and state map

| Row y | State | Desktop | Mobile | Notes |
|---|---|---|---|---|
| 0 | Onboarding: typing (field focus) | `BbSnR` | `z0GB3` | "Siapkan workspace pertamamu", the "what you get" list (separate space, prefix AW, IDR), signed-in row with "Keluar" |
| 1060 | Onboarding: duplicate name | `ffqh6` | `lFOKQ` | Text Field/Error, AC-WS-004 |
| 2120 | Onboarding: processing | `EoCGL` | `y1C8M` | Button Disabled "Membuat workspace…" |
| 3180 | Onboarding: server error | `JCHet` | `x0AxCg` | Alert Danger above the field; the value is kept (AC-WS-024) |
| 4240 | Dashboard: empty state | `gCkJa` | `K6WCRa` | Greeting, empty state, Secondary "Lengkapi branding" (A-6) |
| 5360 | Dashboard: tablet rail | `DUUnI` | — | App Shell/Tablet, 1024 × 768 |
| 6288 | Switcher open | `Y20OZ` | `D1sDCL` | Desktop: Menu "PINDAH WORKSPACE" with the current workspace as Menu Item/Selected. Mobile: sheet "Pindah workspace" with the current workspace marked by an "Aktif" badge. Both end with "+ Buat workspace". |
| 7408 | "Lainnya" menu (mobile entry to the switcher) | — | `R5Wwrk` | Bottom Sheet/Menu: switcher, nav items, account |
| 8528 | Create workspace: default | `uuZRc` | `eyWYY` | Modal/SM (desktop), Bottom Sheet/Form (mobile) |
| 9648 | Create workspace: duplicate name | `IZXw3` | `qe9tC` | |
| 10768 | Create workspace: processing | `VPvsS` | `vUYBV` | "Membuat workspace…", helper "Prefiks invoice: AF" |
| 11888 | "Segera hadir" (Proyek as the example) | `B9WOJ` | `PlBRK` | SPEC GAP-F02-1 option (c), AC-WS-025 |
| 13008 | Settings: filled | `lEtZt` | `P1z3XX` | Sections Identitas brand · Kontak · Invoice in the 720 column; currency shown as a disabled field (IDR) |
| 14488 | Settings: field errors | `RCZ3C` | `a944D` | Invalid email, prefix "A" |
| 15968 | Settings: saved | `V3HqRv` | `hTxoz` | Alert Success "Perubahan tersimpan" |
| 17448 | Settings: server error | `Qbg5K` | `HRSHO` | Alert Danger; the values are kept |
| 18928 | Workspace not found | `JJ8Ex` | `QUMXc` | Same response for "not yours" and "doesn't exist" (A-9) |

Select workspace was designed and then **removed** after research: sign-in always opens the most recently opened workspace (BR-WS-006 amended, AC-WS-010 deprecated, Owner 2026-09-27).

## Component usage

Every entry is a linked instance of `design-system.lib.pen` (prefix `G:`), except the one local component. The component specs are in [components/](../../design-system/components/). The overrides listed are the only ones applied; there are no padding overrides (SP5). The *In code?* column was checked against `src/ui` and `src/features` on 2026-09-27 (after F-01). Components marked ❌ or ⚠️ are built or extended in F-02's plan before the screens that use them.

| Library component (spec) | Variant(s) and ID | Used in | Overrides | In code? |
|---|---|---|---|---|
| **App Shell** ([app-shell.md](../../design-system/components/app-shell.md), C30) | `G:y9uBJl` | Dashboard, switcher, create workspace, coming soon, settings and not found (desktop) | Page Content › Container slot filled with the screen content. Panel title set per page. Header Actions (Search, Notifications) off. Overlay on for the modal. Settings frames are resized to 1040 in height. | ❌ No: not built yet (auth R-6: F-02 builds it) |
| **Sidebar** ([sidebar.md](../../design-system/components/sidebar.md), C29), nested in App Shell | — | All desktop in-workspace frames | Workspace name "Aster Wedding". Account: Rina Saputri, rina@asterstudio.id, initials RS. Nav count badges off. The active item is swapped per page. | ❌ No (also needs Avatar and Icon Button) |
| **App Shell/Tablet** (C37) | `G:lQnS8` | Dashboard tablet `DUUnI` | Rail badges off, title "Dasbor", header actions off, Container slot filled | ❌ No (also needs Nav Rail Item and Tooltip) |
| **Mobile App Shell** ([mobile-app-shell.md](../../design-system/components/mobile-app-shell.md), C35) | `G:c6qPz7` | Every in-workspace mobile frame | Resized to 390 × 844 (settings 390 × 1320). App-bar title set per page. Search and Notifications off. Content slot filled. The Overlay is turned on and resized to 390 × 844 when a sheet is open (see Library findings). | ❌ No |
| **Bottom Nav** ([bottom-nav.md](../../design-system/components/bottom-nav.md), C34), nested | Bottom Nav Item/Default `G:x1Mgr3`, /Active `G:bKADv` | Mobile shell frames | Proyek badge off. The active tab is swapped: Proyek on *Segera hadir*, Lainnya on settings. | ❌ No |
| **Nav Item** ([nav-item.md](../../design-system/components/nav-item.md), C22) | /Active `G:CInVy`, /Default `G:K0UQ06` | Sidebar active swap (Proyek, Pengaturan); editorial preview card | Icon and label; Count off | ❌ No |
| **Text Field** ([text-field.md](../../design-system/components/text-field.md), C18) | /Default `G:HHNPk`, /Focus `G:mZcc4`, /Error `G:AVpMa`, /Disabled `G:Q64HTj` | Onboarding, create workspace, settings (name, brand name, email, phone, prefix, currency) | Label, value or placeholder, "(opsional)", helper or error text. The leading icon, prefix and shortcut are off. | ✅ Yes: `src/ui/primitives/text-field` (Default, Focus, Error, Disabled/read-only, helper, optional). Missing: the trailing error icon (F-00 D-1 / F-4). |
| **Textarea** ([textarea.md](../../design-system/components/textarea.md), C04) | /Default `G:t7L0yL` | Settings address | Value on, placeholder off, height 96. The label is a separate text row using the `component/input/label` and `input/helper` tokens, because the Textarea has no label. | ❌ No |
| **Button** ([button.md](../../design-system/components/button.md), C01) | Primary/MD/Default `G:Q49yf7`, Primary/MD/Disabled `G:lBKcT`, Primary/LG/Default `G:aBT7T`, Primary/LG/Disabled `G:V8sGx`, Secondary/MD/Default `G:JmfmZ` | Primary MD: onboarding, desktop save and create. Primary LG: mobile sheet and settings actions. Secondary: "Lengkapi branding", "Kembali ke Dasbor". | Label; Disabled = processing ("Membuat workspace…") | ✅ Yes: `src/ui/primitives/button` (primary/secondary/danger × md/lg; Disabled through `isDisabled`) |
| **Alert** ([alert.md](../../design-system/components/alert.md), C24) | /Danger `G:F3GrC5`, /Success `G:E4PkTw` | Onboarding server error, settings saved and server error | Title and body. Action off; Close off. | ⚠️ Partial: `src/ui/patterns/alert` has only the `info` and `danger` tones. **Success must be added** for settings saved. |
| **Menu** ([menu.md](../../design-system/components/menu.md), C10) | `G:g6dKmz` | Desktop switcher `Y20OZ` | Items slot filled | ❌ No |
| **Menu Item** ([menu-item.md](../../design-system/components/menu-item.md), C09) | /Default `G:iSqRB`, /Selected `G:qKcfI` | Desktop switcher | Icon camera or plus; label. Selected = current workspace. | ❌ No |
| **Menu Group Label** / **Menu Divider** (C10) | `G:yNxME` / `G:z7QON` | Desktop switcher | "PINDAH WORKSPACE" | ❌ No |
| **Modal** ([modal.md](../../design-system/components/modal.md), C31) | /SM `G:cdSbf` | Create workspace (desktop) | Title and description. Body slot = the name field, with `component/modal/body/*` insets. Cancel "Batal"; Confirm swapped to Default or Disabled. | ❌ No |
| **Bottom Sheet** ([bottom-sheet.md](../../design-system/components/bottom-sheet.md), C32) | /Form `G:vSBbR`, /Actions `G:U0wHw`, /Menu (default in Mobile App Shell) | Create workspace (mobile); switcher sheet `D1sDCL`; Lainnya `R5Wwrk` | Form: body slot with `component/sheet/body/*` insets; Confirm LG. Actions: header "Pindah workspace · 3 workspace". Menu: unbuilt items kept visible per A-7; Invoice count off; account set. | ❌ No |
| **Sheet Item** (C32) | /Default `G:FRtU1` | Mobile switcher sheet | Icon and label; Count used as the "Aktif" badge (no selected variant, see Library findings) | ❌ No |
| **Icon** ([icon.md](../../design-system/components/icon.md)) | lucide | Every screen | — | ✅ Yes: `src/ui/primitives/icon`. The registry must add the new icons: camera, chevrons-up-down, layout-grid, folder-kanban, users, receipt, package, user-round-cog, message-square-text, share-2, settings, menu, plus, check, chevron-right, search-x, panel-left, log-out, x. |
| **Workspace / Editorial preview** (local) | `UTew4` | Onboarding desktop, 4 frames | Instance with no overrides | ⚠️ Partial: `src/features/auth/ui/editorial-panel` renders the mosaic and headline. It needs a slot to replace the headline with the sidebar-preview card, and the card itself is new. |

## Navigation (A-7 as changed by the Owner)

- The App Shell shows the **library's full navigation**. Desktop and tablet: Dasbor, Proyek, Klien, Invoice, KATALOG (Layanan, Tim), Template pesan, Sumber klien, Pengaturan. Mobile: the Bottom Nav with Dasbor, Proyek, CTA, Klien and Lainnya.
- The library's sample count badges are **off**, because a new workspace has no data.
- Header Search and Notifications are **hidden**. They aren't navigation, and no feature provides them yet.
- **Pengaturan** opens Workspace settings. Unbuilt destinations open *Segera hadir* (SPEC GAP-F02-1, decided (c)).
- The active item is set by swapping the variant ref: Nav Item/Active and Bottom Nav Item/Active.

## Copy

All UI text is Indonesian and identical on desktop and mobile (checked 2026-09-27). The deliberate differences come from the component patterns: the desktop modal has "Batal" while the mobile sheet closes with × or a swipe, and the current workspace is marked with a check (Menu Item) on desktop but an "Aktif" badge (Sheet Item) on mobile. Strings not drawn here, such as the validation messages for the empty name and phone, come from `spec.md` A-1 to A-4 and are reviewed during the build.

## Token-usage compliance and exceptions

| Rule | Status |
|---|---|
| G1–G3: tokens chosen by meaning; component tokens in components, semantic and scale tokens in layouts | Pass. Every added layout uses `$G:` semantic, space and radius variables. The preview card uses `component/sidebar/*`. |
| G2: no primitives | Pass |
| **G4: no hard-coded values** | **Exceptions:** (1) The onboarding widths 600/420 and the editorial padding 64 are literal because `size/auth-panel`, `size/auth-form` and `space/16` are in `tokens.json` but not yet in the Pencil variables. This is drift F-6 from the F-01 verification, and `auth.pen` has the same exception. (2) In the preview card: the shadow colour `#00000059`, the card width 360, and the logo mark 14 and workspace mark 20 sizes, all literal. (3) Mobile frames override the Overlay to 390 × 844 (see Library findings). |
| G5: foreground/background pairing | Pass (library components; `accent/soft` with `accent/soft-fg`) |
| SP1–SP11: spacing and insets | Pass after the 2026-09-27 fix: the modal and sheet bodies use `component/modal/body/*` and `component/sheet/body/*`; mobile content uses gap `space/4` as the library slot does; the settings column follows the centered 720 layout (`size/content-narrow`). |
| SP5: no padding overrides on linked instances | Pass. Only content slots are filled, and sizes are only resized to fit the frame. |

## Library findings (for `/sdv:verify-design-system`)

1. **Mobile App Shell** (C35) is 375 × 812, and its **Overlay has a fixed 375 × 812 size**. In the 390 × 844 frames used by the auth and workspace screens, the Overlay has to be resized per instance, or it leaves a strip and floats the sheet. The Overlay should be `fill_container` in the master.
2. Tokens T1–T4 aren't synced to Pencil yet (F-6). Run `/sdv:sync-pencil`.
3. Sheet Item has no selected or check variant, so the current workspace on mobile uses the Count badge ("Aktif").

## HTML exports for implementation

Before each UI task in `plan.md`, the Owner exports the frames above to `docs/features/workspace/exports/<state>-<frameId>.html`, desktop and mobile (AGENTS.md). For example: `onboarding-BbSnR`, `onboarding-z0GB3`, `dashboard-gCkJa`, `dashboard-tablet-DUUnI`, `switcher-Y20OZ`, `switcher-D1sDCL`, `more-menu-R5Wwrk`, `create-workspace-uuZRc`, `create-workspace-eyWYY`, `coming-soon-B9WOJ`, `settings-lEtZt`, `settings-P1z3XX`, `not-found-JJ8Ex`, plus every state row. The editorial image already exists (`public/auth/editorial/mosaic*.webp`).

## Approval

- **APPROVED**: Owner, 2026-09-27 ("design approved & saved"). The feature is `DESIGNED`.
