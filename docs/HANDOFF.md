# Handoff — Shutrly

Last updated: 2026-10-13 (F-26 dashboard-overview SPECIFIED; F-25 DONE, merged to `staging`; F-24 DONE; F-22 merged, not verified) · Read this first when resuming work, then [docs/README.md](README.md). Feature status lives in [feature-map.md](product/feature-map.md), not here.
Branch: `docs/dashboard-feature-row` (F-26 docs, pushed, no PR; based on `staging` after F-25's PR #15). Other work sits in worktrees under `.claude/worktrees/` (`git worktree list`).

History (previous handoffs, early status table, Pencil and design-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — F-26 dashboard-overview SPECIFIED (2026-10-13)

- **State:** F-26 `SPECIFIED` (spec status READY FOR DESIGN). Branch `docs/dashboard-feature-row` from `staging` (after the F-25 merge), pushed, **no PR**; nothing uncommitted. Docs only, no code.
- **Done this session:** F-25 merged to `staging` (PR #15). F-26 added to the [feature map](product/feature-map.md) → [intent](features/dashboard-overview/intent.md) ACCEPTED 2026-10-13 → [spec](features/dashboard-overview/spec.md) + [AC-DASH-001..020](features/dashboard-overview/acceptance-criteria.md). After the first project the dashboard shows *Needs you*, *Upcoming sessions* (7 days), *Projects by status*, *Galleries expiring soon*; replaces the F-02 placeholder and drops *Set up branding*. F-25 spec/design carry a "superseded by F-26" note.
- **Owner decisions (in the spec):** status-only attention; fixed 7-day window; ship without invoices (card after F-14); no activity feed; FC-001 time zone `Asia/Jakarta` as F-07/F-09; FC-002 F-25 note.
- **Checks:** none needed (docs only).
- **Owner actions:** decide whether `docs/dashboard-feature-row` gets a PR to `staging` now or carries on into design; import the design library when `/sdv:design-feature` asks.
- **Open items:**
  - F-25: DV-3, DV-4, and DV-5/DV-6/DV-9 re-runs at ship ([verification report](features/setup-checklist/verification-report.md) §6); shared list-card row focus ring (separate task).
  - F-24 follow-ups: [verification report](features/setup-flow-fixes/verification-report.md) §6.
  - F-22 bilingual copy: merged, **not verified** ([coverage-report.md](features/bilingual-copy-revamp/coverage-report.md)); copy deck still `DRAFT`.
  - Carried from F-10: Netlify 60 s / 20 MB stream limit on large Print downloads; staging *Wisuda Rina* group still `SUBMITTED`; R-6 needs a real phone.
  - `/sdv:ship setup-checklist` not run yet (staging deploy of F-24/F-25).
- **Next:** `/sdv:design-feature dashboard-overview` (flows are simple, modelling skipped). New copy goes through Codex + Owner approval into the copy deck.

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
