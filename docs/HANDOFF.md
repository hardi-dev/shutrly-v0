# Handoff — Shutrly

Last updated: 2026-10-07 (F-10 client-access DONE pending verification, Slices 0–12 built incl. the Owner 7 revision; F-00–F-03, F-06, F-07, F-17 DONE; F-04, F-05 merged, verification owed; F-09 Gallery DONE, pending Owner acceptance) · Read this first when resuming work, then [docs/README.md](README.md).
Branch: `feat/client-access` (F-10, worktree `.claude/worktrees/pull-branch-main-21161f`). F-09 free-tier rework is on `feat/gallery-free-tier`, F-07 on `feat/projects`, F-08 Team designed on `feat/team-sessions`.

History (previous handoffs, early status table, component-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — F-10 client-access, Owner 7 revision built, pending verification (2026-10-07)

- **State:** feature map `DONE, pending verification` (Slices 0–12). Branch `feat/client-access` (worktree `.claude/worktrees/pull-branch-main-21161f`), ahead of origin, **not pushed** (Owner: don't push yet), no PR. Every slice has an implementation record in [technical-design.md](features/client-access/technical-design.md); [plan.md](features/client-access/plan.md) is fully ticked.
- **Slice 12 (Owner 7, built 2026-10-07):** *Akses klien*, *Pilihan klien* and *Hasil akhir* are on the gallery page (720 column, *Foto* 6 photos in 3 columns); the project page keeps *Add-on*, its *Galeri* card has the *Pilihan klien* / *Hasil akhir* summary rows and no password, and *Tandai selesai* is the header action of a `DELIVERED` project (phone action bar) with the meta *Hasil akhir dipublikasikan {date}*. The picks pages moved to `/projects/[id]/gallery/pilihan[/groupId]`; the old URLs are 404 (Owner: no redirect). *Salin* on *Akses klien* shows the whole value selected when the browser refuses the clipboard (Owner chose this over a deprecated `execCommand` fallback).
- **Checks (last run):** typecheck, lint on changed files, the touched dom/unit tests, `gallery-sync` integration and `tests/e2e/client-access/journeys.spec.ts` pass; Slices 0–11 checks as recorded. Screenshots at 1440/390 matched `HT8V6`, `iGwTx`, `r71J5`, `QUSVb`. Not run: the full suite (project rule), `gate.spec.ts` (real Drive), R-6 (real phone).
- **Resume at:** (1) verify the React key warning on the gallery page is gone in dev (fix `8dd3737`, unverified; see the Slice 12 record), then delete the two untracked throwaway specs `tests/e2e/client-access/zz-owner7-*.spec.ts`; (2) `/sdv:verify-feature client-access`; (3) `/sdv:ship` (Owner decision).
- **Staging (Netlify, ADR-020):** `dae28de` is deployed to `staging--shutrly.netlify.app` (`/api/health`, `/login` 200). `CLIENT_SESSION_KEY` is a Netlify secret; all three databases (dev, Netlify staging us-east-2, old staging) record migrations `0000`–`0017`. Seed: `pnpm db:seed` ([tech-stack › Seed data](architecture/tech-stack.md#seed-data)), Owner `owner@shutrly.test`, passwords and client link in the git-ignored `.env.seed.dev`, `.env.seed.staging`, `.env.seed.staging-old` of this worktree (never in chat). *Wisuda Rina* (BOOKED, 113 photos, published); no final delivery because the example Drive folder has no `edited`/`print` subfolder, so *Tandai selesai* can't be seen on staging. Deploy from a checkout outside `.claude/` (see `CLAUDE.md`); the scratch checkout `…/92dd845c-…/scratchpad/deploy-src` can be reused (`git checkout --detach <sha>`, `NETLIFY_SITE_ID` from the main checkout's `.netlify/state.json`, `scripts/deploy/netlify-deploy.sh staging`).
- **Owner actions:** push and open the PR; stop the dev server of the main checkout that holds port 3000 (started from this session's browser pane; it fails with missing env keys and blocks Playwright, whose base URL is fixed to 3000); provision `CLIENT_SESSION_KEY` for production if it isn't this Netlify site; run `0015`–`0017` on production at ship; promote *Photo Tile/Selectable* in `design-system.lib.pen`; fix two Pencil drifts (the add-on dialog's target field label/helper; the publish confirm says *Dikirim* where the status is *Terkirim*); decide whether F-09's now-unused `AccessCard` and `CopyPasswordButton` may be deleted.
- **Open items:**
  - Netlify streams stop at 60 s / 20 MB, so a large Print download from `/g/[token]/unduh/[photoId]` can fail on staging; test needs a `print` subfolder with a file over 20 MB in the example Drive folder (`1yyis5Mp…`), then sync, publish final delivery and download from the client link.
  - The two staging Owners were seeded with the older seed (direct inserts); compatibility is proven on dev only.
  - Seen once: *Only plain objects … Client Components* on the client *Tinjau* route during a failed throwaway run; not reproduced.
  - The client *Dibuka lagi* chip is not built; R-6 (iOS Safari bulk download) needs a real phone; tablet and dark mode are not drawn (GAP-01, GAP-04).
  - Fixture-Drive E2E needs `E2E_FAKE_DRIVE=1` in this worktree's `.dev.vars` for the run (restore after; `retries: 2`).

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
- **Local test account:** `scripts/dev/show-test-owner.sh [--reveal]` prints the named test Owner kept in the git-ignored `.env.test` (`TEST_OWNER_EMAIL`, `TEST_OWNER_PASSWORD`). It has a workspace, a client, a service and a booked project with a gallery of the Owner's 113-photo folder.
- **F-10 browser passes:** the Owner pages need a signed-in Owner. The test Owner can be made owner of the throwaway studio's workspace for a pass by updating `workspace.owner_user_id` on the non-production database, then restoring it. `.claude/launch.json` entry `dev-client-access` runs this worktree's server.
- **Machine:** `head` and `timeout` are not available (macOS); `head` is also listed in `CLAUDE.md` › Mistakes to avoid and was typed again this session. A bare `cat > file` waits for input.
- **UI gotchas (F-10):** the destructive `Modal` drops its body text, so use a standard dialog when the export has a body; a `size-*` class needs a block or flex parent (`PhotoThumb` is `block`); `Button` only takes icons from its allow-list in `button.types.ts`.
