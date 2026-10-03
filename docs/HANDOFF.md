# Handoff — Shutrly

Last updated: 2026-10-04 (F-08 DESIGNED; F-00, F-01, F-02, F-03 and F-17 DONE; F-04 merged, not yet verified; F-05 merged to `main` (PR #3), not yet verified; F-06 DONE and merged to `main`; F-07 DONE, accepted by the Owner 2026-10-04) · Read this first when resuming work, then [docs/README.md](README.md).
Branch: `feat/team-sessions` (F-08 discovery; from `feat/projects`, `main` merged in) (F-04 via PR #1, F-05 via PR #3 and F-06 from `codex/clients` are on `main`).

History (previous handoffs, early status table, component-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — F-08 Team DESIGNED (2026-10-03)

- **Branch:** `feat/team-sessions`, cut from `feat/projects` (assignments need F-07's sessions). Nothing here is built; F-06, then F-07, still come first.
- **Spec:** [spec.md](features/team-sessions/spec.md) and [acceptance-criteria.md](features/team-sessions/acceptance-criteria.md). The live criteria run AC-TEAM-001…027; 012, 016–019, 024 and 025 are removed.
- **Scope cut (Owner 2026-10-03): no money in F-08.**
  - Rates, fees per assignment and paid / unpaid tracking moved to a new TODO, F-18 *Team fees* (`team-fees`). BR-TEAM-007 is deprecated.
  - The member detail page is gone too; members are edited in a dialog, as in F-06.
- **Domain (Owner 2026-10-03):**
  - BR-TEAM-001: assignments are per session, in one role.
  - BR-TEAM-002: sessions and assignments have no stored status.
  - BR-TEAM-004: a member has a name, a required WhatsApp number, an optional email and roles.
  - BR-TEAM-005: workspace roles, three of them seeded.
  - BR-TEAM-006: a member is on a session at most once; deleting a session or a draft deletes its assignments.
- **Design (APPROVED 2026-10-03):** [design.md](features/team-sessions/design.md) holds 48 frames and 48 HTML exports in `features/team-sessions/exports/`.
  - *Jadwal* shows an avatar group per session (at most 3, then *+n*), or an Icon Button/Ghost/SM `user-plus`.
  - A session without a team: `user-plus` and ⋯ › *Tambah tim* open the Penugasan form directly.
  - A session with a team: the avatar group and ⋯ › *Atur tim* open *Atur tim*. It lists the members with a danger `trash-2` per row, with no edit and no empty state; removing the last member closes it.
  - The *Tim* pages follow F-06: tabs *Aktif · Arsip · Peran*, a table on desktop, a list on phones, and the member form with a Multi-select for *Peran* (*Tambah peran baru*).
  - The library import resolves as **`m:`**, not `H:`.
- **Diagrams:** member state, plus the add / remove and delete activities. The sequence diagram was removed with the payment race.
- **Next:** `/sdv:plan-feature team-sessions`. F-06, then F-07, are still built first.

## Previous handoff — F-07 Projects DONE (2026-10-04)

- **Accepted by the Owner 2026-10-04** with open follow-ups: the 92-export fidelity pass (8.3), the remaining dialogs in both themes and keyboard-only a11y tests (8.2), the six flaky E2E tests, and `pnpm install` once. Nothing is pushed and no PR is open.
- The notes below were written mid-build; Slices 0–8 are all built.

- **Built on `feat/projects`:** Slice 0 (base check, `main` merged, [component inventory](features/projects/component-inventory.md)), Slice 1 (*Proyek baru*) and Slice 2 (the read-only project detail page with the *Konfirmasi booking* / *Mulai pemotretan* / *Selesai pemotretan* steps). Slice 1: domain rules, tables and migration `0009`, create backend, shared Combobox / DateField / TimeField / Select sections, and the create screen with sessions and booking fields.
  - **Migration:** `0009_project` is applied to the non-production database.
  - **Gate:** typecheck, lint, 918 unit tests, booking integration (16), build and the projects and app-shell E2E suites pass. See the [implementation records](features/projects/technical-design.md#implementation-record--slice-1-2026-10-03).
- **Try it:** `/w/<id>/projects/new`; *Buat proyek* and *Simpan draf* open `/w/<id>/projects/<projectId>`, which shows the cards and the next step. `/projects` is still the coming-soon page (Slice 3).
- **Owner actions and decisions:**
  - run `pnpm install` once: `@internationalized/date` was added to `package.json` and the lockfile by hand because `pnpm add` refuses here (store mismatch);
  - the exports draw item and session rows without a leading icon, but `ListCardItem` requires one (deviation 5);
  - the phone Bottom Nav is hidden on *Proyek baru* and on the project detail (Slice 1 deviation 4, Slice 2 deviation 1).
- **Fixed on the way:** deleting a client, service, category or definition that a project uses now returns `IN_USE` (a `RESTRICT` violation is `23001`). This closes F-06's AC-CLI-015 real-FK carry-over.
- **Next:** `/sdv:verify-feature projects`. It should also do the design-fidelity pass of the 92 exports (plan step 8.3, not done) and finish the keyboard-only accessibility checks (8.2, partial).

- **Spec:** [spec.md](features/projects/spec.md), [acceptance-criteria.md](features/projects/acceptance-criteria.md) (AC-PRJ-001…026).
- **Domain updates:** BR-PRJ-004's SPEC GAP is resolved (manual steps; no backwards moves; final delivery from `BOOKED`/`SHOOTING`/`POST_PROCESSING`). BR-DEL-003 now names those states. New rules are BR-PRJ-008 (record), BR-PRJ-009 (deal editable while `DRAFT`/`BOOKED`) and BR-PRJ-010 (delete drafts, cancel the rest). The domain-model lifecycle diagram is updated.
- **Feature map:** F-04 and F-05 are marked DONE (merged; verification owed). The *Next up* section was rewritten.
- **Assumptions to confirm in design review:**
  - A-2: default title *{service} — {client}*;
  - A-4: filters *Berjalan*/*Selesai*/*Dibatalkan*, ordered by event date;
  - A-5: status labels;
  - A-1: routes `/projects`, `/projects/new`, `/projects/[id]`.
- **Next:** continue `/sdv:design-feature projects` from the design handoff. F-06 build (`/sdv:build-feature clients 1`) is still pending on `feat/clients`.

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
