---
name: sdv-build-feature
description: "Implement exactly one planned iteration of a feature, with tests and a deviation report. Explicit use only: run when the user mentions $sdv-build-feature."
---

<!-- generated from .claude/commands/sdv/build-feature.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->

Arguments: whatever the user wrote after `$sdv-build-feature` (expected: `<feature-slug> [iteration-number]`). Wherever the steps below say `$ARGUMENTS`, use that text.

Use the `spec-driven-vibe-coding` skill and run its **build-feature** workflow for: **$ARGUMENTS**

If no iteration number is given, pick the first unfinished iteration in `technical-design.md` and state which one.

1. Read: constitution, relevant coding rules, the feature's technical design, spec, acceptance criteria, and design reference.
2. Implement only that iteration. Do not invent requirements, add unrelated abstractions, or expand scope.
3. Enforce business rules server-side; client validation is UX only.
4. Add tests mapped to the `AC-*` / `BR-*` IDs covered, test-first. Delegate test writing to subagents so it runs on cheaper models, and implement the iteration yourself in this session:
   - Unit and integration tests: the `sdv-test-writer` subagent (Sonnet 5.5).
   - E2E tests, only when a user flow changed: the `sdv-e2e-test-writer` subagent (Sonnet 5.5).
   - Give each one the feature slug, the iteration, the exact `AC-*` / `BR-*` IDs and the units or flow involved; it does not see this conversation. Launch independent ones in parallel.
   - Check what comes back: tests name their IDs, cover the criteria, and fail for the right reason before the code exists. Send back or fix anything that does not.
   - If subagents are unavailable (for example in Codex), write the tests yourself under the same rules.
5. Verify your own work before reporting, and fix what fails until it passes. Run the checks that apply to what changed:
   - `pnpm typecheck`, `pnpm lint`, `pnpm test`; add `pnpm test:integration` for server or database changes.
   - `pnpm e2e` when a user flow changed. For UI work, also compare the running page against the Pencil HTML export (screenshot) and fix visible drift.
   - `pnpm build` when routing, config or server/client boundaries changed.
   Do not edit or delete a test to make it pass unless the test itself is wrong; say so in the report. Never report an iteration done with a failing or unrun check; list any check you could not run and why.
6. Tick the iteration checklist in `technical-design.md`; set feature status to `IN PROGRESS`.

Finish with the completion report: scope completed, files changed, checks run with results, deviations / `SPEC GAP` / `CONFLICT`, next iteration.
