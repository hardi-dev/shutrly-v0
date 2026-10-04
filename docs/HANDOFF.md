# Handoff — Shutrly

Last updated: 2026-10-04 (F-08 PLANNED; F-00, F-01, F-02, F-03, F-06, F-07 and F-17 DONE; F-04 and F-05 merged, not yet verified) · Read this first when resuming work, then [docs/README.md](README.md).
Branch: `feat/team-sessions` (F-08 planned; from `feat/projects`, `main` merged in).

History (previous handoffs, early status table, component-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — F-08 Team PLANNED (2026-10-04)

- **State:** `feat/team-sessions` (from `feat/projects`, `main` merged). Status PLANNED. The planning docs (`technical-design.md`, `plan.md`, `exports/_compact/`, spec and feature-map edits) are **uncommitted**. Nothing is built, pushed or in a PR.
- **Done this session:**
  - [technical-design.md](features/team-sessions/technical-design.md): 17 decisions (D-1…D-17), two migrations (`0010_team`, custom `0011_team_role_backfill`). No new ADR.
  - [plan.md](features/team-sessions/plan.md): six slices, one commit per step, each with a *Read first* list. 1 Peran + schema, 2 Anggota, 3 member row menu, 4 Jadwal staffing, 5 Atur tim and team-aware deletes, 6 close (isolation, E2E, axe, fidelity).
  - Compact design exports generated (`exports/_compact/INDEX.md`). Spec and feature map set to PLANNED.
- **Checks:** prettier on the new docs passes. No build or tests run (planning only). No SPEC GAP or CONFLICT.
- **Owner actions:**
  - Review the copy marked `// not in Pencil` in plan.md › Copy (Penugasan errors, toasts, delete confirmations).
  - Confirm the role usage count (members holding the role **or** with an assignment in it) for BR-TEAM-005.
  - Commit the planning docs, e.g. `docs(team-sessions): plan f-08 team`.
- **Open items:** F-07 is DONE but its follow-ups remain open (92-export fidelity pass, remaining dialogs in both themes, keyboard a11y tests, six flaky E2E tests, `pnpm install` once). F-04 and F-05 still await `/sdv:verify-feature`. F-08 changes five F-07 units by addition only; each step re-runs F-07's tests.
- **Next:** `/sdv:build-feature team-sessions 1` (Slice 1: *Peran*, schema, migrations, role seeding).

## Key decisions (Owner)

- **Design-system decisions (2026-09-26, sessions 1–4)** are in [HANDOFF-archive.md](HANDOFF-archive.md#key-decisions-owner-sessions-14-moved-2026-10-04): tokens, component method, whole-step spacing, tiers 1–4, shells, tablet rail.
- **F-08 scope (Owner 2026-10-03):** no money in F-08; fees moved to F-18 *Team fees*; members are edited in a dialog, no detail page.
- **Pen library import** resolves as `m:`, not `H:`.
- **Migrations** may run against the shared non-production database for a reviewed, committed migration (Owner 2026-10-02, see AGENTS.md).

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
