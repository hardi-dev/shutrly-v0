# Agent instructions — Shutrly

Start with [docs/HANDOFF.md](docs/HANDOFF.md) › _Current handoff_. It says what to work on and when to stop and ask the Owner.

- **Authority order (highest first):** `docs/constitution.md`, then product/domain rules, then architecture + ADRs (`docs/architecture/`), then `docs/coding-rules.md`, then the feature intent, spec and acceptance criteria, then the technical design, then code. Never resolve a conflict by changing a higher-authority document; report it.
- **Architecture:** the folder architecture in `docs/architecture/overview.md` is fixed. Every unit gets its own folder with a co-located test.
- **Plans:** implementation plans live in `docs/features/<slug>/plan.md`. Execute them task by task, test-first, with one commit per task. Copy their code verbatim.
- **UI tasks:** build from the HTML exports of the Pencil frames (`docs/features/<slug>/exports/`). Read them through `exports/_compact/INDEX.md` (a stripped base per screen plus a diff per state, made by `python3 scripts/sdv/compact-exports.py <slug>`), not the raw files, which are 100+ KB each. If an export is missing, stop and ask the Owner for it. The fidelity pass after the code may change only class names and element nesting.
- **Commits:** conventional commits in English, lowercase, no trailing period.
- **Hard stops:**
  - Never commit secrets. `.dev.vars` and `.env.test` are git-ignored and non-production only.
  - `pnpm db:migrate` runs only against the shared **non-production** database from `.dev.vars`, and only for a migration you generated, reviewed and committed (Owner 2026-10-02, see `docs/architecture/tech-stack.md` › Deployment). Keep migrations safe for other branches on that database (no drops or renames of columns they use), and report each run. Never run migrations against production.
  - Never read or edit `.pen` files directly; they're edited only through the Pencil tool.
- **Machine note:** `head` on this machine isn't coreutils; use `sed -n '1,20p'`.
- **Workflow commands (`sdv`, local copy, edit freely):**
  - Skills live in `.claude/skills/` (`spec-driven-vibe-coding`, `sdv-design-tokens-system`); commands in `.claude/commands/sdv/`, so `/sdv:<command>` works directly and edits apply on the fly. The plugin is disabled in `.claude/settings.json` to avoid duplicates.
  - Codex finds the two skills in `.agents/skills/` (symlinks into `.claude/skills/`). It has no `/sdv:*` commands, so each command is a generated Codex skill: `$sdv-<command> <args>` does what `/sdv:<command> <args>` does.
  - The commands in `.claude/commands/sdv/` are the source of truth. After editing one, run `python3 scripts/sdv/sync-codex-skills.py` and commit the regenerated `.agents/skills/sdv-*` folders (`--check` exits 1 when they are out of date). Never edit those folders by hand.
  - Each command's model, effort and fork setting live in its frontmatter (`model`, `effort`, `context`). Change them there; Codex ignores them and uses its own default model.
  - The hooks in `.claude/hooks/` only run in Claude Code. In Codex the hard stops below are instructions you must follow yourself.
  - `plugins/sdv/` is the untouched upstream release, kept only to diff against when upgrading; don't edit it.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
