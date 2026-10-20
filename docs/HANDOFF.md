# Handoff — Shutrly

Last updated: 2026-10-21 (production on Coolify, DNS moved, Resend and Google pending). Read this first when resuming work, then [docs/README.md](README.md). Feature status lives in [feature-map.md](product/feature-map.md), not here. Older handoffs, including F-26 (built on `feat/dashboard-overview`, awaiting verification), are in [HANDOFF-archive.md](HANDOFF-archive.md).
Branch: `feat/dashboard-overview` (worktree `.claude/worktrees/dashboard-overview`, from `docs/dashboard-feature-row`, 12 commits on top of the F-26 docs; nothing pushed, no PR). Other work sits in worktrees under `.claude/worktrees/` (`git worktree list`).

History (previous handoffs, early status table, Pencil and design-library notes): [HANDOFF-archive.md](HANDOFF-archive.md). Don't read it unless you need history.

## Current handoff — production live on Coolify, cutover pending checks (2026-10-21)

Read first: [operations/production-runbook.md](operations/production-runbook.md) (IDs, commands, file locations, gotchas, open steps) and [operations/development-log.md](operations/development-log.md) (dated history).

- **State:** production runs on Coolify, server 1 (`168.110.219.5`). Application uuid `paj7d979xt4ubruq6uuskwss`, image `ghcr.io/hardi-dev/shutrly:main-e8d816da` (from `main` at `e8d816da`), port 3000, domains `shutrly.space` and `www.shutrly.space`. Deploy finished; Let's Encrypt cert issued. Namecheap DNS: `@` A → `168.110.219.5`, `www` CNAME → `shutrly.space`. Staging stays on Netlify (`staging` branch, Neon `staging`).
- **Verified:** on server 1 directly, `/` returns 200 and `/login` returns 404 (landing-only gate, [ADR-021](architecture/decisions/ADR-021-production-on-netlify-landing-only.md), intended). Neon `main`: 24 migrations applied, 30 tables, not seeded.
- **Not verified yet:** public DNS on some resolvers (cache still shows Netlify IP `52.74.6.109`); Resend domain `shutrly.space` is **Verified** (2026-10-21), sender `Shutrly <auth@shutrly.space>`, test email Delivered; Google consent screen is **Testing** (only test users can sign in).
- **Next, in order** (full detail in the runbook, section 11):
  1. `dig +short A shutrly.space @8.8.8.8` returns `168.110.219.5`; check `https://shutrly.space` and `https://www.shutrly.space`.
  2. Resend: done. Auth emails send once the login is open.
  3. Google: privacy policy page, Search Console domain verification, authorized domain, **Publish app**.
  4. Owner decision: lift the landing-only gate (ADR-021) before login is public.
  5. Done (2026-10-21): `shutrly.space` and `www` removed from the Netlify site, and the Netlify DNS zone deleted. Netlify now only serves staging (`*.netlify.app`).
  6. Optional: waitlist keys (`RESEND_WAITLIST_*`) are empty in `.env.production`.
  7. Delete GHCR tag `wip-74db37e2`.
- **Deploy production:** `pnpm deploy:prod` (`scripts/deploy/coolify-deploy.sh`) builds `origin/main`, pushes GHCR, updates Coolify and waits. Staging is still `pnpm deploy:staging` (Netlify).
- **Secrets (never print or paste):** `.env.production` (repo root, git-ignored); Coolify token `~/shutrly-secrets/coolify.token` (expires 2026-11-19); GHCR classic token expires about 2027-01-18.
- **Top gotchas:** never use `head` (use `sed -n`); the auto-mode classifier blocks DNS and some Namecheap/Resend clicks, so ask the Owner to click and verify with `dig`; Coolify deploy is `POST …/applications/{uuid}/start` (GET returns 405); Coolify bulk env creates duplicates (delete the extra copy); browser clipboard from web pages is unreliable.

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
