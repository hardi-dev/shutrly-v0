# Handoff — Shutrly

Last updated: 2026-10-12 (F-24 setup-flow-fixes DONE; F-22 merged to `staging`, not verified; F-25 setup-checklist intent DRAFT) · Read this first when resuming work, then [docs/README.md](README.md). Feature status lives in [feature-map.md](product/feature-map.md), not here.
Branch: `staging`, local, 44 commits ahead of `origin/staging` (nothing pushed). Other work sits in worktrees under `.claude/worktrees/` (`git worktree list`).

History (previous handoffs, early status table, Pencil and design-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — F-24 setup-flow-fixes DONE (2026-10-12)

- **State:** `DONE` (verified 2026-10-12, pass with non-blocking deviations: [verification-report.md](features/setup-flow-fixes/verification-report.md), run without E2E at the Owner's request). Branch `staging`; no PR, no deploy. **Uncommitted:** `docs/product/feature-map.md` (F-24 row), `verification-report.md` and this handoff.
- **Done this session:** a new-workspace walkthrough found the defects → [intent](features/setup-flow-fixes/intent.md), [spec](features/setup-flow-fixes/spec.md), [plan](features/setup-flow-fixes/plan.md), [build notes](features/setup-flow-fixes/build-notes.md). Built: forms post and wait for hydration (D1), catalog dialogs submit on Enter (D3), page-not-found inside a workspace (D4), folder-mapping guidance (D5), English-only catalog screens (D6). D2/D7 withdrawn (did not reproduce: dev-mode first compile).
- **Also:** skeleton and loading titles translated (`5d39543`); `local/ui-copy` now catches copy held in a constant, [FND-003](findings/FND-003-ui-copy-lint-misses-copy-in-constants.md) FIXED (`0046817`); breadcrumb ADR renumbered to [ADR-026](architecture/decisions/ADR-026-owner-breadcrumb-parallel-route.md); F-22 docs corrected (merged by PR #14); [F-25 intent](features/setup-checklist/intent.md) captured, DRAFT.
- **Checks:** typecheck, lint on 83 files, `tokens:check`, `pnpm build` pass; 210 related unit tests in 54 files pass. Last recorded E2E (build time): no-JS forms 10/10, page-not-found 2/2. Not run: the full suite; E2E at verification.
- **Owner actions:** commit the uncommitted docs; decide push and PR. Update the Photo sources frames in Pencil (DV-2: they still say to add `edited`/`print`). Accept or correct the F-25 intent in its own session (discovery prompt was given in chat). At ship, say that the waitlist change reaches production with the next landing deploy (ADR-021). The exploration login is in the git-ignored `.env.seed.explore` (dev database; workspace *Explore Studio*).
- **Open items:**
  - F-24 follow-ups, in the verification report §6: DV-3 remove the stacked padding on the page-not-found screen (one line); DV-1 native-POST test for the client gallery; DV-4/5/6 partial coverage and a button inside a link (C-008).
  - F-22 bilingual copy: implemented and merged 2026-10-11, **not verified**. Read [coverage-report.md](features/bilingual-copy-revamp/coverage-report.md). Journey, build-smoke and `gallery-owner-locale` E2E are blocked by the Neon websocket flake; 42 `DECK GAP` strings show the same text in EN and ID; the copy deck is still `DRAFT`.
  - Carried from the F-10 handoff, unverified since: Netlify stops a stream at 60 s / 20 MB, so a large Print download can fail on staging; the staging *Wisuda Rina* group sent 5/10 before the partial-submission change is still `SUBMITTED`; R-6 (iOS Safari bulk download) needs a real phone.
- **Next:** `/sdv:discover-feature setup-checklist` in its own worktree once the Owner accepts the F-25 intent; F-24 needs `/sdv:ship` only when the Owner wants it deployed. Copy work: draft with the Codex CLI, Owner approves, then update the copy deck.

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
- **Design exports:** builds read the raw exports through `exports/INDEX.md` (`scripts/sdv/index-exports.py`). The compact exports were dropped on 2026-10-04 because their stripped bases didn't render the real UI (Owner).
- **Pen library import in a worktree** can point at the main checkout's library; verify and never remove a used import (see `CLAUDE.md` › Mistakes to avoid).
- **CLI save isn't possible:** `osascript` keystrokes are blocked (no Accessibility permission), so the Owner presses ⌘S.
- **Local test account:** `scripts/dev/show-test-owner.sh [--reveal]` prints the named test Owner kept in the git-ignored `.env.test` (`TEST_OWNER_EMAIL`, `TEST_OWNER_PASSWORD`). It has a workspace, a client, a service and a booked project with a gallery of the Owner's 113-photo folder.
- **F-10 browser passes:** the Owner pages need a signed-in Owner. The test Owner can be made owner of the throwaway studio's workspace for a pass by updating `workspace.owner_user_id` on the non-production database, then restoring it. `.claude/launch.json` entry `dev-client-access` runs this worktree's server.
- **Machine:** `head` and `timeout` are not available (macOS); `head` is also listed in `CLAUDE.md` › Mistakes to avoid and was typed again this session. A bare `cat > file` waits for input.
- **UI gotchas (F-10):** the destructive `Modal` drops its body text, so use a standard dialog when the export has a body; a `size-*` class needs a block or flex parent (`PhotoThumb` is `block`); `Button` only takes icons from its allow-list in `button.types.ts`.
- Pencil limits, slot and token-change notes, and the library-stability history: [archive](HANDOFF-archive.md#pencil-and-design-library-working-notes-moved-from-handoffmd-2026-10-12).
