# F-17 App Shell revamp — Visual design

Status: **APPROVED** (Owner 2026-09-29: "approved") · **Library promoted and rebound 2026-09-29** · Pencil source: [app-shell-revamp.pen](app-shell-revamp.pen) (118,213 bytes, saved 2026-09-29 02:13) · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) (AC-SHELL-001…014) · Rules: [token-usage.md](../../design-system/token-usage.md) **v3.1, APPROVED 2026-09-29** and binding.

## Direction

- **Source:** the shell only (not the content) of `docs/design-system/exploration.pen`:
  - `tpgiY` H4d LIGHT and `G2eLt` H4d DARK (desktop);
  - `Bsc1w` Phones and `u6jBqs` Phones DARK (phone).

  Page content in every frame is a neutral placeholder (`Placeholder/Page content`), because Dashboard content is out of scope.
- **Canvas work:** the design was first built with local proposal components. After approval, those were promoted into `design-system.lib.pen` by `/sdv:save-design-system` (2026-09-29), and every frame was **rebound to the library components**. The file now holds no local proposals, only the canvas helper `Placeholder/Page content` (`zAnx4`, board `Iq83I`).
- **Canvas layout:** columns are desktop 1440 at x 0, tablet 1024 at x 1560, and phone 390 at x 2680 (extra phone variants at x 3170 / 3660). There is one state per row, and rows step 1100 px down.

## Library link

- `app-shell-revamp.pen` imports `design-system.lib.pen` with prefix **`A:`** and theme axis `A:mode` light/dark. The library has **531 variables**, checksum `594f560b`. The prefix is local to each file (`workspace.pen` uses `G:`, `auth.pen` uses `a:`).
- The file still has 2 unused local variables (`font/size/heading`, `font/letter-spacing/heading`) left from before promotion; nothing binds to them. They can be removed in a later cleanup, and the library versions `A:font/size/heading` / `A:font/letter-spacing/heading` are the ones in use.
- The consumer was created from the SDV `feature-consumer.pen` template (2026-09-29). The Owner added the import in the Pen UI, and the refreshed library was confirmed in the file after promotion (Mobile Header, Compact Bar, Toast/Danger and Menu/List resolve).
- Integrity check after the rebind (2026-09-29): 32 top-level frames, 0 serialisation errors, 0 raw colours, 0 local-proposal nodes.

## Screen and state map

| Row y | State | Desktop | Tablet | Phone | AC |
|---|---|---|---|---|---|
| 0 | Dasbor — default, light | `A4o4CS` | `M2wNUK` | `KqWRQ` | 001, 003, 004, 006 |
| 1100 | Dasbor — default, **dark** | `E6Sff` | `MPQNe` | `ZReSP` | 001, 003, 004, 012 |
| 2200 | Collapsed sidebar (desktop) · Sidebar overlay (tablet) · Pengaturan, a menu destination with no tab active (phone) | `yUUWI` | `M2y0m` | `hab2s` | 002, 003, 006 |
| 3300 | Switcher open | `cLGAL` (Menu/List) | `dCizw` (Menu/List from rail) | `m9ZcCs` (sheet from pill) | 009 |
| 4400 | Switching — list and CTA disabled | `BpGfx` | — | `LJtJd` | 009 |
| 5500 | Switch failed — Toast/Danger with *Coba lagi* | `CyFKd` | `S32Sbc` | `jc8OC` | 009, 014 |
| 6600 | Pengaturan active (desktop) · Menu sheet open: no switcher, no Invoice (phone) | `E9mZiW` | — | `z2gaQ` | 006, 007 |
| 7700 | *Segera hadir* (Proyek); phone via the **+** CTA | `BwkFF` | — | `MkXOo` | 006, 008 |
| 8800 | Profil — no active nav | `gypgM` | — | `Ezws1` | 006 |
| 9900 | Sub-page (C33 Mobile Shell) with the *Simpan* action, light and dark, and **without** an action (Detail klien) | — | — | `CPIWh`, `jLxYm` (dark), `b7VW9` | 005 |
| 11000 | Notifications with unread badge (3) | `AjndX` | — | `U3O586` | 013 |
| 12100 | Modal layer: *Buat workspace* (same content as F-02 `uuZRc` / `eyWYY`) | `V8au9F` | `BfARN` | `XqPGA` (Sheet layer) | 014 |

The sub-page frames were rebuilt from C33 during the rebind, so their IDs changed (previously `NCcwq`, `sQMVb`, `fug7S`). AC-SHELL-010 (not found) and AC-SHELL-011 (responsive transitions) are behavioural and have no dedicated frame. The not-found screen is F-02's `JJ8Ex` / `QUMXc`, unchanged.

## Library components used

Every screen is a linked instance. Overrides are text, visibility (`enabled`), slot fills, variant swaps and nested-instance replacements. Nothing is detached. The component specs in `docs/design-system/components/` carry an *F-17 update — PROMOTED 2026-09-29* section with the node IDs.

| Library component | Use in this file |
|---|---|
| **App Shell** C30 `A:y9uBJl` | Desktop frames. Page Header is a fresh `A:ImEDW` instance per frame (breadcrumb Parent = workspace, Current = page). The hero action is off. The Container is filled (width 1096). Overlay `fwm7P` holds the Modal and the Toast layer `VJpuD` holds Toast/Danger; they are separate layers. |
| **App Shell/Tablet** C37 `A:lQnS8` | Tablet frames. The library root is now `surface.muted`; the rail workspace control is `chevrons-up-down`; the Toast layer is `z9osf8` (enabled on `S32Sbc`). Overlay `bbU0M` holds the Modal. |
| **Page Header** C40 `A:ImEDW` | Breadcrumb bar with the **Utilities** slot `u6PNZ` (Cari, Notifikasi). On `AjndX` the Notifications badge is on, with a count of 3. |
| **Sidebar** C29 / **Sidebar/Rail** C37 | Desktop sidebar, the tablet overlay (with `elevation.2` over `component/modal/scrim`), and inline collapsed (`yUUWI`). Nav counts off. Active = **Nav Item/Active** `A:CInVy` / **Nav Rail Item/Active** `A:OKf00`: `action.primary` pill, semibold label (rules v3.1 N1). Hover = the `surface.panel` pill with `nav.item.icon-hover`. |
| **Mobile App Shell** C35 `A:c6qPz7` | Top-level phone frames, 390 × 844. The library **Mobile Header** `A:n0MP5` (`o8T8zb`) carries the Workspace Pill, Cari · Notifikasi · Menu, the page title (`font.size.heading` 26) and the subtitle. The legacy app bar is off. Content is the canvas sheet. Overlay `Ey5pi` and the Toast layer `U4sG8K` are resized to 390 × 844 (canvas only). |
| **Mobile Shell** C33 `A:XHlWT` | Sub-pages. **Compact Bar** `A:GaeSf` (`J3Ppgp`) with Back, Title, Parent, and the Actions slot (filled with Button Secondary MD *Simpan* on `CPIWh` / `jLxYm`; empty on `b7VW9`). It includes the Bottom Nav; the active tab is the parent's (none for menu destinations). |
| **Bottom Nav** C34 | Dasbor · Proyek · **+** · Klien · **Invoice** (library default). Active tab swapped per page; none on menu destinations and Profil. Badges off. |
| **Menu/List** C10 `A:I3q8f` + Menu Item / Group Label / Divider | Switcher Menu:<br>- *PINDAH WORKSPACE*;<br>- Menu Item/Selected and /Default with no icon;<br>- full-width **Menu Divider** between items;<br>- a footer with **Button Primary MD** *Buat workspace* (+).<br><br>Pending state: Menu Item/Disabled and Button Primary MD/Disabled. |
| **Bottom Sheet/Actions** C32 + Sheet Item | Switcher sheet:<br>- *Pindah workspace* / *3 workspace*;<br>- Sheet Items with no icon;<br>- the current item is **Sheet Item/Selected** `A:E7RrIj` (library: semibold label and a `sheet.item.check` check);<br>- a footer with **Button Primary LG** *Buat workspace*.<br><br>Pending state: other items at `opacity.disabled` and Button Primary LG/Disabled. |
| **Bottom Sheet/Menu** C32 | The menu sheet opened by the header Menu button. The library now omits the workspace row and Invoice. |
| **Modal/SM** C31 / **Bottom Sheet/Form** C32 + **Text Field** | *Buat workspace*, identical to F-02 `uuZRc` / `eyWYY`. |
| **Toast/Danger** C39 `A:C3PCyx` | Failed switch, with Action *Coba lagi* and Close. |
| **Icon Button** Ghost MD C02 + **Count Badge/Danger** `A:HoAYC` | Header utilities. The MD badge offset is x 20 / y 4 in the library. |

## Navigation and behaviour notes

Behaviour lives in [spec.md](spec.md). These notes only map it to the canvas.

- **Phone option A (Owner 2026-09-29):** Invoice is a Bottom Nav tab, and the header **Menu** button opens the menu sheet. The alternatives B (menu on the left) and C (avatar) were explored and then deleted from the canvas at the Owner's request.
- **Switcher:** the same content on every layout. Only the container (Menu/List vs Bottom Sheet) and the button size (MD vs LG for touch) differ.
- **Layers:** Modal/Sheet and Toast are always separate layers. A Toast never replaces or closes a Modal/Sheet.
- **Toast placement:** bottom-right on desktop and tablet; top-centre, full width with `space.4` side margins below the status bar on phones.

## Token-usage compliance and exceptions

Audit after the rebind (2026-09-29): **0 raw colours and 0 primitive tokens** in the file's own nodes. Every colour is a semantic or component token chosen by meaning (G1–G3), and rules v3.1 N1 · H1 · C1 apply.

| Rule | Status |
|---|---|
| G1–G3, G2, G5 | Pass. |
| **G4 no hard-coded values** | **Exceptions:**<br>(1) Compact Bar height 52, the same literal as the library's C33/C35 App bar.<br>(2) Toast top offset 62 = device status bar 54 + `space.2`, in the library C35 layer.<br>(3) Badge offset x 20 / y 4, an optical position (§4.6).<br>(4) Desktop Container width 1096 is a literal, because Pencil can't bind sizes; code uses `size.content-max`.<br>(5) Placeholder heights 160 / 240 are canvas-only. |
| §3 Typography | The phone page title is **heading** 26 (`font.size.heading`, rules v3.1 H1). |
| §Action & focus | Rules v3.1 **N1**. The dark-mode active pill at 2.02:1 is an accepted exception with mitigations (§8). |
| SP1–SP11 | Pass. The former SP5 exception (Menu padding override) is gone: the switcher uses the **Menu/List** variant. |

## CONFLICTs, gaps and library findings — resolution

1. **CONFLICT-F17-1 (nav active colour): RESOLVED** by rules v3.1 N1 and promoted tokens:
   - `nav.item.background-active` → `action.primary`;
   - `text-active` / `icon-active` → `action.on-primary`;
   - `background-hover` → `surface.panel`;
   - new `icon-hover` → `accent.soft-fg`.

   This also fixes the invisible-hover library bug.
2. **CONFLICT-F17-2 (badge): RESOLVED, follow the code.** `HoAYC` is now **Count Badge/Danger** (caption 11 / semibold, padding 2/8 via `badge.danger.padding-x` → `space.2`, cap `99+`). C14 is merged into C13.
3. **Tokens:** `font.size.heading` 26, `font.letter-spacing.heading` −0.6 and `component.sheet.item.check` → `action.primary` were **PERSISTED** (531 tokens, `594f560b`).
4. **Library components PROMOTED** (see design-system component specs):
   - Workspace Pill `K06oq`, Mobile Header `o8T8zb`, Compact Bar `J3Ppgp`, Toast/Danger `C3PCyx`, Menu/List `I3q8f`;
   - C35 / C33 / C34 / C32 / C37 / C30 / C40 / C22 / C02 updates.
5. **Open, outside this file:**
   - `workspace.pen` and `auth.pen` are not rebound yet (Owner 2026-09-29: focus on F-17). Their C35 frames now show the new Mobile Header with the default title, because the old app-bar title overrides no longer apply.
   - `message-templates.pen` is deliberately skipped for now.
   - The *F-17 PROMOTION* entry in the `exploration.pen` decision record needs ⌘S.
   - Run `/sdv:verify-design-system` to re-baseline the verification report.

## HTML exports for implementation

The library is promoted, so the frames above can be exported now. Before each UI task in `plan.md`, the Owner exports them to `docs/features/app-shell-revamp/exports/<state>-<frameId>.html` (AGENTS.md). For example:
- `dashboard-A4o4CS`, `dashboard-tablet-M2wNUK`, `dashboard-KqWRQ`;
- `switcher-cLGAL`, `switcher-m9ZcCs`, `switch-failed-CyFKd`;
- `menu-sheet-z2gaQ`, `sub-page-CPIWh`, `sub-page-b7VW9`;
- `notifications-AjndX`, `create-workspace-V8au9F`, `create-workspace-XqPGA`;
- plus the dark rows.

## Implementation deviations (2026-09-29)

Recorded after browser validation at 1440, 1024 and 390 px; details in [technical-design.md › Deviations](technical-design.md#deviations-from-the-exports-owner-approved-2026-09-29-unless-noted).

- Switcher rows use the phone sheet row anatomy on every layout (Owner request), at `font.size.body` 14 like Sidebar nav items.
- Phone top bar: `space.4` top padding plus the safe-area inset.
- Sidebar group label and account email use `text.secondary` on `surface.muted` (contrast; `text.muted` is 3.8:1). Promote to the library at the next `/sdv:save-design-system`.
- Rail is the Sidebar compact mode in code (no separate rail unit).
- Open: the brand mark (export aperture vs. code lime camera) awaits an Owner decision.

## Approval

- **APPROVED:** Owner, 2026-09-29 ("approved, ikut nilai dari code untuk badge"). The feature is `DESIGNED`.
- Rules v3.1 (N1 · H1 · C1) were APPROVED 2026-09-29 ("ok agree").
- The library promotion was **PERSISTED** 2026-09-29: `design-system.lib.pen` 4,370,422 bytes, 02:07. This file was rebound and saved at 02:13.
- HTML exports: 31 frames in [`exports/`](exports/) (2026-09-29).
- `/sdv:verify-design-system` was skipped by the Owner (token budget).
- The plan is [technical-design.md](technical-design.md).
- Next: `/sdv:build-feature app-shell-revamp 1`.
