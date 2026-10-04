# Handoff — Shutrly

Last updated: 2026-10-04 (F-00–F-03, F-06, F-07, F-17 DONE; F-04, F-05 merged, verification owed; F-09 Gallery PLANNED) · Read this first when resuming work, then [docs/README.md](README.md).
Branch: `claude/new-feature-skill-start-a92e1b` (F-09 gallery design, worktree). F-07 is on `feat/projects`; F-08 Team designed on `feat/team-sessions`.

History (previous handoffs, early status table, component-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — F-09 Gallery PLANNED (2026-10-04)

- **State:** F-09 Gallery `PLANNED` (design approved: "1 approve"). Branch `claude/new-feature-skill-start-a92e1b` (worktree), not pushed, no PR. Only `docs/design-system/pencil-variables.json` is untracked (generated, never committed).
- **Done this session:**
  - Intent accepted, spec + AC-GAL-001…031 written, FC-001…008 all resolved: [intent](features/gallery/intent.md), [spec](features/gallery/spec.md), [AC](features/gallery/acceptance-criteria.md).
  - Gallery password stored encrypted, generated (e.g. *mawar-4821*), Owner-visible and auto-filled into WhatsApp: [ADR-017](architecture/decisions/ADR-017-gallery-password-encrypted-owner-visible.md), constitution v1.1 (C-103), BR-GAL-002/003, BR-MSG-003.
  - Whole Drive folder tree is synced; edited/print decided by the nearest ancestor at any depth (BR-GAL-007, ADR-005 amended). Browse = kind tabs + Drive-like folders + filename search + infinite scroll inside a *Semua foto* modal; immersive photo preview.
  - Design: [design.md](features/gallery/design.md) (frame IDs, states, exceptions), 100 HTML exports + [`exports/INDEX.md`](features/gallery/exports/INDEX.md); [technical design](features/gallery/technical-design.md) and [plan](features/gallery/plan.md) written (F-09 `PLANNED`).
  - Library: new components C46 Photo Tile, C47 Folder Tile, C48 Media Viewer (+ specs in `design-system/components/`); 623 tokens, checksum `c2c0a40b`; `token-usage.md` amended (`surface.inverse` may back a media viewer).
  - Hook: `guard.py` allows copying bundled `.pen` templates into `docs/`.
- **Checks:** token validator + checksum match; export index `--check` OK; sample export content checked. No code yet, so no typecheck/tests ran.
- **Owner actions:**
  - Provision the Drive API key and the gallery-password encryption key (non-production now, production before ship).
  - Commit the `guard.py` TEMPLATE_COPY change in the main checkout (uncommitted on `feat/team-sessions`).
  - Merge this branch before any other `design-system.lib.pen` change (`.lib.pen` can't be merged by git); re-run `tokens_to_pencil.py` if token files conflict.
- **Open items** (tracked in [design.md](features/gallery/design.md)): library board 07 doesn't show the `surface.inverse` amendment yet; Modal `size="xl"` built in code; F-07 cancel-dialog copy and F-03 preview copy changes land with the F-09 build; sharing deferred.
- **Next:** `/sdv:build-feature gallery 0` once the Owner has put `GOOGLE_DRIVE_API_KEY` and `GALLERY_PASSWORD_KEY` in `.dev.vars` / `.env.test`. Slice 0 spikes Drive listing and thumbnails (plan R-1/R-2; sync size limit A-T1 awaits the Owner).

## Key decisions (Owner)

- Design-system decisions from sessions 1–4 (2026-09-26) are in the [archive](HANDOFF-archive.md); the approved values live in `docs/design-system/`.
- **F-08 scope (Owner 2026-10-03):** no money in F-08; fees moved to F-18 *Team fees*; members are edited in a dialog, no detail page.
- **F-09 (2026-10-04):** gallery passwords are generated, stored encrypted and visible to the Owner ([ADR-017](architecture/decisions/ADR-017-gallery-password-encrypted-owner-visible.md)); sharing a gallery is out of scope for now.

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
- **Design exports:** builds read the raw exports through `exports/INDEX.md` (`scripts/sdv/index-exports.py`). The compact exports were dropped on 2026-10-04 because their stripped bases didn't render the real UI (Owner).
- **Pen library import in a worktree** can point at the main checkout's library; verify and never remove a used import (see `CLAUDE.md` › Mistakes to avoid).
- **CLI save isn't possible:** `osascript` keystrokes are blocked (no Accessibility permission), so the Owner presses ⌘S.
