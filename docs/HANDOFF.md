# Handoff — Shutrly

Last updated: 2026-09-26 (F-01 Auth PLANNED + detailed plan) · Read this first when resuming work, then [docs/README.md](README.md).
Branch: `main`. This handoff is committed together with the F-01 plan.

## Current handoff — resume here

- **F-01 Auth is PLANNED.** The design was approved on 2026-09-26, and `technical-design.md` was replanned the same day (status DRAFT, 9 iterations). The plan proposes **ADR-013** (Neon-backed auth rate limits, status Proposed).
- **Detailed plan:** `docs/features/auth/plan.md` has 30 TDD tasks (0–29) in superpowers format, kept in the feature folder by Owner request. `docs/superpowers/plans/2026-09-26-auth.md` is superseded.
  - It was checked against the **published Better Auth 1.7.6 source**.
  - **Verification and reset links:** Better Auth's verification JWTs are reusable, and older reset tokens stay valid. The plan adds an `auth_latest_link` table so links are single-use and a newer link supersedes older ones.
  - **Google:** Google is kept **out** of `trustedProviders`, and the takeover guard for BR-AUTH-007 runs in `mapProfileToUser`. This matches ADR-012's intent but not its wording; the Owner is asked to amend the wording.
  - **Copy:** screen text is copied verbatim from `auth.pen`. Strings not drawn in Pencil are marked `// not in Pencil` for review.
  - **Not run:** none of the plan's code has been compiled or executed, because there is no `src/` yet.
- **Task 0 is the gate.** It needs Owner answers to CONFLICT-1 (UI language), SPEC GAP-2 (F-02 destination), SPEC GAP-3 (pending-email cookie), SPEC GAP-4 (email failure only on resend), ADR-013, the ADR-012 wording, and R-6 (who builds the App Shell before Task 25). It also needs F-00 Foundation to exist with the contracts listed in plan.md › *F-00 contracts*.
- **Canvas:** `docs/features/auth/auth.pen` saved at **2026-09-26 22:35:21** (415,829 bytes), committed in `703ca6d`. 15 desktop/mobile state pairs.
  - **Notices:** all 12 inline notices are linked library **Alerts** (Info for pending/sent, Danger for invalid links, account unavailable and invalid credentials), width fill, Close off. IDs are in the design.md *Inline notices (Alert)* table.
  - **Editorial panel:** the Owner chose **R5.1b · Tilted mosaic**. It is the local reusable component `Z5xhk` "Auth / Editorial panel" (840×900: mosaic rotated −15°, Unsplash photo tiles, 2 lime aperture tiles, scrim + headline). All 13 desktop screens with an editorial side use a ref of it; Profile screens use the App Shell instead.
  - **Kept explorations (Owner: do not delete):** `M3WMS` (R2 Product showcase), `umFqj` (R2.3 Desktop + client phone), `u6hvV` (R5.1b Tilted mosaic), at y ≈ 11672.
- **Housekeeping done:** generated Gemini PNGs and `assets/mockup-src/` removed (`9b1cfba`); `exploration.pen` tablet-rail decision committed (`2db7c45`); root `design.pen` and `dont-touch-old-design.zip` moved to macOS Trash (recoverable until the Trash is emptied); `.gstack/` ignored (`b3267a0`).
- **Next step:** the Owner answers the Task 0 decisions. Then run `/sdv:discover-feature foundation` → plan → build F-00, so that it provides every contract plan.md needs. Then run `/sdv:build-feature auth 1`, executing plan.md with superpowers:subagent-driven-development or executing-plans.
- **Follow-ups (non-blocking):**
  - Replace the Unsplash placeholder photos in `Z5xhk` with licensed photos; scrim colours are literal; mark the panel `aria-hidden` in code.
  - The library copy imported into `auth.pen` is stale (Toast names, 478 variables). Reopen `auth.pen` and confirm it refreshes to Alert/* and 479 variables.
  - Full design-system verification is still owed (`/sdv:verify-design-system`; report is stale). Private base `metadata.component` still says `toast`; board 08 lacks the 720 px layout example.

The historical session notes and plans below predate this current handoff; use the section above as the active state.

## Where we are

| Area | Status | Notes |
|---|---|---|
| Project bootstrap (product, domain, architecture, ADR-001…012, constitution, coding rules) | DONE (2026-09-25) | Authoritative tree under `docs/`; `_source/` is historical. Folder architecture finalized 2026-09-26 in `docs/superpowers/specs/2026-09-26-project-folder-architecture-design.md`. |
| F-01 Auth | PLANNED (2026-09-26) | Design approved (`auth.pen`). `technical-design.md` (DRAFT) + `plan.md` (30 tasks). ADR-013 proposed. Blocked on the Owner decisions in Task 0 and on F-00. |
| Design system — exploration | APPROVED (2026-09-26) | Direction **S / Studio Lime**, curated by the Owner from legacy frames. |
| Design system — tokens | PERSISTED (2026-09-26) | **479 tokens** (61 primitive · 54 semantic · 312 component · scales), `mode: light \| dark`. Repository payload checksum `c8b47514`; full Pencil checksum check remains. |
| Design system — token canvas | PARTIAL UPDATE | Cover count and board 06 Alert labels updated; board 08 still needs the approved 720 px layout example. |
| Design system — usage & spacing rules | APPROVED (2026-09-26) + Owner amendments | See *Key decisions*. |
| Design system — primitive components | **APPROVED** — C01–C17 | 17 components (108 reusable nodes) in `design-system.lib.pen`, each with a spec in `components/`. |
| Design system — composite components (tier 2) | **APPROVED** — C18–C26 (2026-09-26) | Text field, Select, Multi-select, Action menu, Nav item (+ Nav Group Label), Segmented control, **Alert** (renamed from Toast), Calendar day, Metric tile. Plus Icon button **SM** (ghost). |
| Design system — composite components (tier 3) | **APPROVED** — C27–C30 (2026-09-26) | Table (+ cells, header cell/row, row), App panel (+ Page Content), Sidebar, App shell template. |
| Design system — overlays (tier 4) | **APPROVED** — C31 Modal, C32 Bottom Sheet (+ Menu), C33 Mobile Shell, C34 Bottom Nav, C35 Mobile App Shell (2026-09-26) | Modal (SM/MD/LG), Button/Danger on C01, App Shell **Overlay** layer (option A *Sectioned*, board 04). Bottom Sheet Actions/Form + Sheet Item (A *Docked* + B header, board 05). Mobile Shell template (375 × 812) hosts the sheets. Owner app on phones: Bottom Nav (B, board 06) + Mobile App Shell; Bottom Sheet/Menu inherits the Sidebar. |
| Code | NONE | No app scaffold yet (F-00 Foundation is TODO). |

## Component library (`design-system.lib.pen`)

**Canvas layout:** token boards 00–08 are on the top row (y = 0). Component pages start at **y = 6800**, 8 per row, ordered by group. Each page is a 1440-wide frame named `Cxx — Name`.

| Row | Pages |
|---|---|
| 1 (y 6800) | **Actions:** C01 Button · C02 Icon button · **Form controls:** C03 Input · C04 Textarea · C05 Checkbox · C06 Radio · C07 Switch · C08 Stepper |
| 2 (y 9359) | **Menus:** C09 Menu item · C10 Menu · **Navigation:** C11 Segmented item · **Status:** C12 Stage chip · C13 Count badge · C14 Notification badge · C15 Metric delta · **Display:** C16 Avatar |
| 3 (y 11983) | **Display:** C17 Kbd · **Tier 2:** C18 Text field · C19 Select · C20 Multi-select · C21 Action menu · C22 Nav item · C23 Segmented control · C24 Toast |
| 4 (y 14801) | C25 Calendar day · C26 Metric tile · **Tier 3:** C27 Table · C28 App panel · C29 Sidebar · C30 App shell (1600 wide page) · **Tier 4:** C31 Modal (x 9440) · C32 Bottom sheet (x 10980) · C33 Mobile shell (x 12520) · C34 Bottom nav (x 14060) · C35 Mobile app shell (x 15600) — row 4 now runs to 11 pages |

**The pattern** (Figma best practice adapted to pen.dev; the Button pilot was approved by the Owner):

- **Structure:**
  - A private base, `_X/Base`, holds the structure.
  - Every variant is a **reusable instance of the base**, named `X/<Type>/<Size>/<State>`.
  - Each variant has a `context` that describes its properties.
- **Properties:**
  - Booleans are optional layers with `enabled`.
  - Text properties are `descendants` content overrides.
  - Instance swaps are icon names or nested refs.
  - Slots are frames with `slot:[ids]` (Menu `Items`).
- **Page exhibits:**
  - Component set
  - Content / Configurations
  - Modes (light and dark)
  - Usage (do / don't)
  - Accessibility
  
  Anatomy, properties, layout and token tables live **only** in the `.md` spec (Owner decision).
- **Specs:** `docs/design-system/components/<name>.md`.
- **Registry:** `components/registry.json`, hand-maintained, with IDs, axes, props, layers and variants. `gen_tokens.py` merges it into `pencil-mapping.json › components`.
- **Rollout so far:**
  - Pilot: C01 Button.
  - Tier 1: C05–C07, C12, C13.
  - Tier 1b: C02–C04, C08, C11, C14–C17.
  - Tier 1c: C09–C10 menus. These have **no legacy evidence** and need a careful review.
  - Tier 2: C18–C26 composites built from nested primitive instances.
  - Tier 3: C27 Table (cells, header cell/row, row, card), C28 App panel (+ Page Content), C29 Sidebar, C30 App shell template. APPROVED.
- **Approval status:** C01–C35 APPROVED · C36 Combobox, C37 Nav rail & tablet shell + this round's additions PROPOSED.
- **Composite pattern (tier 2):** a composite's state variants **don't swap** the nested primitive ref. Replacing the nested ref gives it a new ID per variant and breaks instance override paths. Instead, each variant re-applies the primitive state's token overrides on **one stable nested instance** (for example Text field `c67yIW`, Select `Et1pR/c67yIW`). Floating parts (Select/Action menu Menus) are `layoutPosition: absolute` and off when closed. A composite built on another composite is a ref of its base (`_MultiSelect/Base` is a ref of `_Select/Base` with its Menu slot replaced).

## Design-system artifacts (`docs/design-system/`)

| File | Role |
|---|---|
| `exploration.pen` | Provisional canvas: boards 01–03 and **04 — Modal & overlay study** (options A/B; A picked), **05 — Bottom sheet study** (A/B; A + B header picked), **06 — Mobile app shell study** (A/B; B picked, padding-top 12), **07 — Tablet rail study** (A/B; A picked) (directions, token studies, true-scale case, **decision record**, now including the rules approval) and the Owner's copied legacy frames. |
| `design-system.lib.pen` | Library: 478 Pencil variables, theme axis `mode`, boards 00–08, and component pages C01–C30 (about 3.2 MB; see *Library size / Pen stability*). |
| `tokens.json` | Canonical DTCG tokens. **Generated: edit `scripts/gen_tokens.py`, not this file.** |
| `pencil-mapping.json` | Token ⇄ Pencil variable map, transforms, `library_canvas` (`rules_status` APPROVED), `components` (from the registry), `components_status`. Generated. |
| `token-usage.md` | Usage rules G1–G8 and SP1–SP11. APPROVED 2026-09-26, with the amendments recorded in its status line. |
| `components/*.md`, `components/registry.json` | Component specs and the machine-readable registry. |
| `verification-report.md` | **Stale:** the last `/sdv:verify-design-system` ran before any components existed. |
| `scripts/gen_tokens.py` | Token source of truth and generator. It also merges `components/registry.json`. |
| `scripts/verify_json.py`, `verify_vars.py` | JSON ⇄ mapping ⇄ payload checks, plus the FNV-1a checksum. The current total is `c36593e9` (478 vars). |
| `scripts/pencil-canvas-builders.md` | Pencil MCP snippets for boards 00–08. |

The former root files `design.pen` and `dont-touch-old-design.zip` were moved to the macOS Trash on 2026-09-26 at the Owner's request.

## Key decisions (Owner)

**Earlier (session 1):**
- The Studio Lime pieces were taken from the legacy frames.
- `blue.500 = #2F5BFF` in both modes.
- Slate folded into zinc, and spacing snapped to 4 px.
- Full light and dark themes (dark values inferred, GAP-01).
- Toast style B, and input border Option A (GAP-06 accepted).
- The metric tile follows legacy Frame 4 exactly.

**Session 2 (2026-09-26):**
- **Rules approved** ("approve"). Any later change to an approved rule is recorded as an amendment.
- **Component method:** research Figma best practice first, then adapt it to pen.dev and pilot it on one component. The first flat "Library components" gallery was rejected and deleted.
- **Whole steps only outside SP6's small components:**
  - Button padding: MD **12/36**, LG **16/48** (3:1 squish). **`space.9` = 36** was added to the scale.
  - Checkbox, radio and switch ↔ label gap: 10 → **8**.
  - Segmented: item 6/12 → **8/16**, track padding and gap 2 → **4**.
- **Buttons:** icons are allowed on both sides (`Icon leading` / `Icon trailing`, off by default). Secondary buttons got a hover state (`surface.sunken`).
- **Hover tokens** for checkbox, radio and switch. New semantics: `border.control-hover` and `control.track-off-hover`.
- **Stepper "+"** uses `action.primary` (the same as Button primary), and "−" is neutral.
- **Tier 1b primitives:** Input (plus search, and password/select/date/prefix configurations), Textarea, Segmented item, Metric delta, Stepper, Avatar, Icon button, Notification badge (new semantic `status.danger.on-solid`), and Kbd.
- **Tier 1c:** Menu item and Menu, for dropdown / select / action menu.
- **Canvas:** components sit below the tokens, 8 per row, ordered by group. The C-codes were renumbered to match the canvas order.

**Session 3 (2026-09-26):**
- **Tier 2 tokens approved** ("approve all"): 16 component tokens — `calendar.day.label/number/dot/dot-selected`, `nav.item.background-hover`, `nav.group-label`, `metric.tile.label/value`, `metric.spark.gap/radius`, `toast.<tone>.action` ×5, `icon-button.sm.padding`.
- **SP6 amended:** toast title ↔ body (2) joins the half-step list.
- **Icon button SM** (32 px, ghost only) for the toast close and table-row action menus. MD variants renamed `Icon Button/<Style>/MD/<State>` (IDs unchanged).
- Snaps: spark and dot gap 3 → 4; toast padding 12/14 → 12; calendar date weight 800 → 700; nav group label 11/600 → overline.

**Session 4 (2026-09-26):**
- **C02–C26 approved** (Owner review).
- **Tier 3 tokens approved:** 13 — `table.background/border/radius`, `table.toolbar.padding-y/-x`, `table.header.padding-y/border`, `table.row.background-hover`, `table.cell.text/text-strong`, `table.footer.link` (light `action.primary`, dark `status.info.fg`), `panel.app.title`, `panel.app.header.gap`.
- **SP6 amended:** table cell avatar ↔ name (10) joins the half-step list.
- **Table filter** = Segmented control (legacy dark pills dropped). Scope extended with **Sidebar + App shell**.
- Sidebar binds semantic/scale tokens as a layout region (no `sidebar.*` aliases yet; Owner may promote). Logo mark monochrome, log-out neutral.
- Metric tile label now fills and wraps (collided with the delta in narrow tiles).
- **C27–C30 approved** (Owner review).
- **Page Content + max-width (done).** The App Panel's Content region is its own component, **Page Content** (`B4HAVd`, on C28): outer fill width with padding 28/40, and an inner `Container` **slot** fixed at 1096 and centred. Pen has no `maxWidth`, so the fixed centred container emulates it; code uses `max-width: 1096px; width: 100%`. New tokens: `size.content-max` = 1096 (scale) → `panel.app.content.max-width`. App Panel `C5QYo` now accepts only Page Content and has no padding/gap of its own. The masters show an empty Page Content; the dashboard lives in the C28 Modes examples and the dark App Shell example (`TXZxf`). The C28 Content and Modes exhibits were restacked (notes above the artwork) so the panels are wide enough for the 1096 container.

- **Modal (tier 4):** Owner asked for a Modal + a modal slot in the App Shell, then a mobile Bottom Sheet. Two options were explored first (exploration board 04); the Owner picked **A — Sectioned** (radius 16, header divider + close, footer on `surface.subtle`) and approved its tokens: primitives `red.300`, `alpha.neutral-950-a50`, `alpha.black-a60`; semantics `overlay.scrim`, `status.danger.solid-hover`; 18 `modal.*`; 3 `button.danger.*`. Widths SM 400 · MD 560 · LG 720.
- **Button/Danger** added to C01 (MD/LG × 4 states) for destructive confirms.
- **App Shell Overlay:** boolean layer (off), absolute 1440 × 960 with `modal.scrim`, centring a Modal slot (default Modal/MD). It covers the whole screen, sidebar included.

- **Bottom Sheet (tier 4):** two options explored (board 05). Owner: "A is better, but I like header of B" → docked, full-width sheet (top corners 24, rows with `border.subtle`, footer on `surface.subtle`) with B's header (no divider; centred title + meta for action lists, left title + round close on `surface.sunken` for forms). 25 `sheet.*` tokens approved; no new primitives/semantics. Components: Sheet Item Default/Destructive, Bottom Sheet/Actions, Bottom Sheet/Form. Shown on a phone placeholder (no mobile shell — GAP-04).

- **Sheet spacing + mobile frame (Owner "fix the gap", both):** sheet item icon ↔ label = **10** (`space.2-5`; SP6 list amended), Form body gap stays 12. New **C33 Mobile Shell** template (status bar · app bar back/title/action · Content slot · safe area · Overlay with Sheet slot); C32 examples now sit on it. No new tokens (layout region, G3).

- **Mobile App Shell (Owner):** Bottom Nav = Dasbor · Proyek · [+ CTA] · Klien · Lainnya (Owner). Two options explored (board 06); Owner picked **B** (colour-only active tab, raised 54 px CTA with a `surface.panel` ring) and raised the bar's padding-top 6 → **12**. 12 `bottom-nav.*` tokens (active colour: light `action.primary`, dark `status.info.fg`). *Lainnya* → **Bottom Sheet/Menu**: header = Sidebar logo + round close; list = workspace switcher (Owner: moved from header into the content), Invoice (3), KATALOG (Layanan, Tim), Template pesan · Sumber klien · Pengaturan (unlabelled, as in the Sidebar — Owner: inherit the Sidebar, add nothing it lacks), account + Keluar. Separator line above the switcher. Sheet Item gained an optional Count. C35 Mobile App Shell = status bar · app bar (title, search, notifications) · Content · Bottom Nav · Overlay (default Menu sheet). C33 stays the sub-page / client template (Back + title).

- **C31–C35 approved** (Owner review).

- **Handoff next steps resolved (2026-09-26, Owner picked the recommended defaults):** 1920 App Shell exhibit (`C30 — App shell · 1920`, row 5); rows re-laid out by the Owner (C33–C35 now row 5, y 19863); `sidebar.*` aliases (10, same values; Sidebar + Menu sheet rebound); Calendar Day/Hover (`surface.muted`); toast close aligned to the title line; Segmented Item/LG + Segmented Control/LG; Table states (sorted header, select column, selected row, skeleton, empty state); **C36 Combobox**. Tablet: Owner picked **A — icon rail 72 with tooltips** (board 07) → **C37** Tooltip, Nav Rail Item, Sidebar/Rail, App Shell/Tablet (`size.rail`, `sidebar.rail.*`, `tooltip.*`).

## Open gaps (deferred)

- GAP-01 dark-mode evidence
- GAP-02 loading states (button, switch) and states beyond those drawn
- GAP-03 workspace brand-override rules
- GAP-04 client gallery (mobile) — frame now exists (C33 Mobile Shell); screens, bottom navigation and breakpoints still open
- GAP-05 EN/ID copy mix (id-ID assumed)
- Tabular figures for money and time
- No negative (red) metric delta tone
- Menu components have no legacy evidence
- `nav.count.*` should be renamed to `count-badge.*` if the badge is used outside navigation

## Historical next steps (superseded by current handoff)

The following checklist records an earlier component restructuring idea. Its old warning about a broken Pen window no longer describes the saved library listed at the top of this file.

1. **Restructure approved by the Owner (not done yet):**
   - **Tooltip → primitive C38** (page at x 9888, y 19863) + an optional `Tooltip` layer (off, absolute x 48 y 8) at the **end** of `_IconButton/Base` (`s4zsCg`), so every icon-only button can show it.
   - **Nav Item/Rail/Default·Hover·Active·Focus** rebuilt as refs of `_IconButton/Base` (Ghost MD look, fills/icons from `nav.item.*`, Tooltip on for Hover/Focus), shown as a row in the **C22 Nav item** matrix. Replace the instances in `Sidebar/Rail`, then delete `_NavRailItem/Base` + `Nav Rail Item/*` (`xhCvp`, `odApP`, `GMxFW`, `OKf00`, `vRX3t`).
   - **Sidebar/Rail** (`JRUY0`) moves into the **C29** matrix; rename `Sidebar` (`vB50q`) → `Sidebar/Expanded`.
   - **App Shell/Tablet** (`lQnS8`) + its examples move to **C30**; rename `App Shell` (`y9uBJl`) → `App Shell/Desktop`.
   - Delete page **C37** (`jNOvR`); fold `components/nav-rail.md` into tooltip.md (new), nav-item.md, icon-button.md, sidebar.md, app-shell.md; update the registry.
2. **Known blocker for step 1:** inserting into `_IconButton/Base` fails with `Duplicate node id 'ZnHc4'`. `ZnHc4` is the Table inside the C31 LG modal example `ZUbsF` (rebuilt after the earlier incident). Fix order: after reopening, **delete `ZUbsF` alone**, run the whole-doc check, have the Owner ⌘S, then insert the Tooltip layer alone, check, save. Rebuild the LG example afterwards.
3. Owner review of this round (C36 Combobox, the rail/tablet work after the restructure, Segmented LG, Calendar hover, Table states, sidebar aliases, toast close alignment).
4. Re-run `/sdv:verify-design-system`; the verification report is stale.
5. Resume the feature track: `/sdv:model-feature auth` → `/sdv:design-feature auth` → execute the F-00 foundation gate and the auth implementation plan in `docs/superpowers/plans/2026-09-26-auth.md`; then `/sdv:verify-feature auth`.

## Working notes / gotchas

- Open `.pen` files with `open -a Pen <abs-path>`, and inspect or edit them only via the Pencil MCP.
- **Pen does not autosave MCP edits.** Press ⌘S in each Pen window, and check the file mtime and size before committing.
- **`TakeScreenshot` only renders the file in the frontmost Pen window** (otherwise it's blank). Run `open -a Pen <file>` first. Screenshots of nodes created in the same call can be stale, so take them in a separate call.
- **Pencil limits:**
  - Opacity variables are percent, and binding `opacity:"$opacity/disabled"` resolves to 0.4.
  - `width`/`height` can't bind to variables.
  - There's no `wrap` on frames and no stroke offset or spread (focus = 2 px outer ring + `focus/glow`; the offset is handled in code).
  - `metadata` is dropped on `ref` nodes, so variant axes live in `context` and the registry.
- **Slots:** `Insert(instance+"/slot")` is refused. Use `Replace(instance+"/slotId", {type:"frame",…})`, then Insert into the new frame. A `Get` visitor that walks into an instance with a replaced slot throws, so scans call `ctx.skipChildren()` on non-reusable refs.
- `Get` layout `problems` can be stale right after big inserts, so re-scan in a separate call. Hidden (`enabled:false`) layers in bases show as "clipped"; that's expected.
- **Token change workflow:**
  1. Edit `scripts/gen_tokens.py`.
  2. Run `gen_tokens.py`, then `verify_json.py`.
  3. `SetVariables` with the changed keys from `scripts/pencil-vars.json`.
  4. Compare the checksum (`verify_vars.py` against the FNV JS in Pencil).
  5. Refresh boards 02 and 06 and the cover counts.
  6. Update the registry and specs.
  7. ⌘S.
- **Shell:** `head` on this machine isn't coreutils; use `sed -n`.
- **Library size / Pen stability (2026-09-26):**
  - `design-system.lib.pen` is about 3.2 MB (30 component pages).
  - During session 4, Pen closed the file mid-edit. After reopening, some MCP calls failed with `reading 'id'` on edits that propagate to many instances: inserting into a master slot that instances have `Replace`d, and whole-document `Get`.
  - **Don't ⌘S a window in that state.** Close it without saving, reopen, and verify the variable checksum first.
  - Save (⌘S) after every page, not at the end.
  - **Root cause found:** the failures weren't file size. App Panel `C5QYo` had `slot: []` (an empty allowed-list), and every insert into it threw `reading 'id'`. Listing the allowed components fixed it. Saving works at ~3.25 MB, so no split is needed for now.
- **Slots gotchas:**
  - Never leave `slot: []`. An empty list rejects every insert with `Cannot read properties of undefined (reading 'id')`.
  - Pencil can't `Replace`/`Copy` into a slot of an instance nested **inside another master** (`reading 'parent'`, or "use Update/Replace"). Fill slots only on top-level instances, e.g. `Replace(<shell>/Sw0yD/d2hCuQ/bBehO, …)`.
  - A replaced node keeps its new ID in the instance path: re-replace `KS7sb/XNJJO`, not `KS7sb/C5QYo`.
- **Master edits that break the file (2026-09-26):** `Move`-ing a newly inserted layer inside a deeply nested master (Table Cell / Header Cell) corrupted every existing Table instance in memory and emptied the Table master's row cells; Pen then refused to save ("pen.dev can't save your changes"). Rules: insert new layers at the **end** of a master, never `Move` them; after every master edit run `Get((n,ctx)=>{ctx.skipChildren();return n.name})` (whole-doc check) and test pages one per call (`Get(pageId,{depth:30})`) — errors abort the whole call. Broken instances are fixed by deleting and rebuilding them. An IPC error (`reading 'parent'`) can leave a half-applied change: close without saving and reopen.
- **Pencil targets the frontmost Pen window**, whatever `filePath` says: run `open -a Pen <file>` before switching files, and check `GetVariables` (the library has variables; `exploration.pen` has none).
- **CLI save isn't possible:** `osascript` keystrokes are blocked (no Accessibility permission), so the Owner presses ⌘S.
