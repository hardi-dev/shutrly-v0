# Agent instructions — Shutrly

Start with [docs/HANDOFF.md](docs/HANDOFF.md) › _Current handoff_. It says what to work on and when to stop and ask the Owner.

- **Authority order (highest first):** `docs/constitution.md`, then product/domain rules, then architecture + ADRs (`docs/architecture/`), then `docs/coding-rules.md`, then the feature spec and acceptance criteria, then the technical design, then code. Never resolve a conflict by changing a higher-authority document; report it.
- **Architecture:** the folder architecture in `docs/architecture/overview.md` is fixed. Every unit gets its own folder with a co-located test.
- **Plans:** implementation plans live in `docs/features/<slug>/plan.md`. Execute them task by task, test-first, with one commit per task. Copy their code verbatim.
- **Commits:** conventional commits in English, lowercase, no trailing period.
- **Hard stops:**
  - Never commit secrets. `.dev.vars` and `.env.test` are git-ignored and non-production only.
  - Never run `pnpm db:migrate`; only the Owner applies migrations.
  - Never read or edit `.pen` files directly; they're edited only through the Pencil tool.
- **Machine note:** `head` on this machine isn't coreutils; use `sed -n '1,20p'`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
