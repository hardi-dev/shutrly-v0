# Handoff — Shutrly

Last updated: 2026-10-05 (F-00–F-03, F-06, F-07, F-17 DONE; F-04, F-05 merged, verification owed; F-09 Gallery DONE, pending acceptance) · Read this first when resuming work, then [docs/README.md](README.md).
Branch: `feat/gallery-free-tier` (F-09 free-tier rework, worktree `.claude/worktrees/gallery-free-tier`). F-07 is on `feat/projects`; F-08 Team designed on `feat/team-sessions`.

History (previous handoffs, early status table, component-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — F-09 free-tier rework PLANNED (2026-10-05)

- **Done:** R1–R4 and the checks of R5 (see [plan.md](features/gallery/plan.md)). **Next:** mark PR #8 ready (verified 2026-10-05, [report](features/gallery/verification-report.md)), then `/sdv:ship`. The CPU measurement (ADR-018 › Measurement) found every path far over the documented 10 ms but no request refused on a Workers Free account; the Owner decided on 2026-10-05 to go on with Workers Free and watch for CPU errors (upgrade trigger in ADR-018 point 4). `SYNC_STEP_MAX_ENTRIES` is now 1,000, derived from the measurements (gallery technical design, R-6). The Owner accepted ADR-018 and ADR-019 and the media trade-off (constitution v1.2, BR-ACC-005, BR-SRC-003, AC-GAL-015 amended; new AC-GAL-032…036). **Owner allowed (2026-10-05):** the CPU check on a free Cloudflare preview (R5; new Workers project, or an existing one); done 2026-10-05 and failed on the first path (see above). The `last_seen_at` drop is done (`0014`).
- **F-09 before the rework:** the block below, still true for `main`.

### F-09 Gallery DONE on `main`, pending Owner acceptance

- **State:** F-09 Gallery `DONE` (pending Owner acceptance). Branch `claude/new-feature-skill-start-a92e1b` (worktree), `origin/main` (F-08) merged, not pushed, no PR. Only the generated `docs/design-system/pencil-variables.json` is untracked.
- **Done:** Slices 0–8 of the [plan](features/gallery/plan.md), each with an implementation record. Slice 0 spike on the Owner's public folder closed R-1/R-2 ([technical design › Risks](features/gallery/technical-design.md)). Slice 8: isolation test, browser pass with axe, copy audit of all 100 exports, and the real-Drive smoke E2E (`gallery-drive-smoke.spec.ts`, axe and keyboard on every surface). Migration `0012_gallery` applied to the non-production DB.
- **Checks (last run):** typecheck, lint, unit/dom (1493), integration (160) and build pass. Full E2E: 73 passed, 2 flaky (pass on retry), 1 stale workspace test fixed and passing; the gallery specs and the real-Drive smoke pass.
- **Owner actions:**
  - Accept F-09 or report changes; the smoke spec runs with `pnpm e2e tests/e2e/gallery` when `GALLERY_SMOKE_FOLDER_URL` is set in the shell or in `.env.test`.
  - Check the Workers Paid plan before ship; provision the Drive and password keys for production; commit the `guard.py` change on `feat/team-sessions` if still pending.
  - Optionally measure a 1,000–2,000 photo folder to settle A-T1 (sync size limit).
- **Open items:**
  - A-T1 stays an assumption (only 113 photos measured).
  - Small deviations are listed in the plan's records (no *Ganti password* button in the *Akses klien* header, *Galeri dibuka lagi* toast not wired).
  - Flaky E2E: catalog phone axe (timeout) and AC-SRC-015, both pass on retry.
- **Next:** `/sdv:verify-feature gallery` for the independent review, then `/sdv:ship`.

- **Local test account:** `scripts/dev/show-test-owner.sh [--reveal]` prints the named test Owner kept in the git-ignored `.env.test` (`TEST_OWNER_EMAIL`, `TEST_OWNER_PASSWORD`). It has a workspace, a client, a service and a booked project with a gallery of the Owner's 113-photo folder.

## Key decisions (Owner)

- Design-system decisions from sessions 1–4 (2026-09-26) are in the [archive](HANDOFF-archive.md); the approved values live in `docs/design-system/`.
- **F-08 scope (Owner 2026-10-03):** no money in F-08; fees moved to F-18 *Team fees*; members are edited in a dialog, no detail page.
- **F-09 (2026-10-04):** gallery passwords are generated, stored encrypted and visible to the Owner ([ADR-017](architecture/decisions/ADR-017-gallery-password-encrypted-owner-visible.md)); sharing a gallery is out of scope for now.

## Open gaps (deferred)

- **Free hosting (Owner 2026-10-05):** [ADR-018](architecture/decisions/ADR-018-free-tier-runtime-budget.md) and [ADR-019](architecture/decisions/ADR-019-gallery-media-and-sync-on-free-tier.md) are `Accepted`; the F-09 rework is planned (slices R1–R5). The CPU check ran and failed: a new ADR must choose Workers Paid, another host, or a lighter start-up.
- **Open findings** live in [findings/](findings/README.md), not here (the handoff is archived per feature).
- **Pricing (draft):** [product/pricing-and-costs.md](product/pricing-and-costs.md) lists costs, the Fastpik comparison and open business questions to discuss.
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
