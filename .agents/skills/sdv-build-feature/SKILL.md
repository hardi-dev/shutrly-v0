---
name: sdv-build-feature
description: "Implement exactly one planned iteration of a feature, with tests and a deviation report. Explicit use only: run when the user mentions $sdv-build-feature."
---

<!-- generated from .claude/commands/sdv/build-feature.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->

Arguments: whatever the user wrote after `$sdv-build-feature` (expected: `<feature-slug> [iteration-number]`). Wherever the steps below say `$ARGUMENTS`, use that text.

Use the `spec-driven-vibe-coding` skill and run its **build-feature** workflow for: **$ARGUMENTS**

If no iteration number is given, pick the first unfinished iteration in `technical-design.md` and state which one.

1. Read narrowly. Plans and technical designs run to hundreds of lines; read only what this iteration needs, and find it with `grep -n '^## \|^### '` on the file, then read just those line ranges.
   - `docs/constitution.md` in full.
   - `docs/coding-rules.md`: by section. Always Testing, Quality Gate and Easy to break; add Structure and UI / Components for UI work, Data Access, Validation and Errors for server work.
   - The plan (`plan.md`, or the iterations in `technical-design.md`): its global constraints and shared contracts, plus this iteration's slice only. Never read other slices.
   - `technical-design.md`: only the sections the slice cites. Skip the `Implementation record` sections unless the slice names a deviation that affects this one.
   - `spec.md` and `acceptance-criteria.md`: only the `AC-*` / `BR-*` entries this iteration covers (grep the IDs).
   - Design reference: if `exports/_compact/INDEX.md` exists, read it, then the base for each screen and device in this iteration and only the diffs for the states the slice needs; open a raw export only for exact icon paths. Without `_compact/`, read just the raw exports for this iteration's screens, and tell the Owner to run `python3 scripts/sdv/compact-exports.py <slug>`.
   - If the slice cites something you have not read, read it. If you hit a decision the artifacts do not cover, stop and report a `SPEC GAP`; do not guess.
2. Implement only that iteration. Do not invent requirements, add unrelated abstractions, or expand scope.
3. Enforce business rules server-side; client validation is UX only.
4. Add tests mapped to the `AC-*` / `BR-*` IDs covered.
5. Verify your own work before reporting, and fix what fails until it passes. Run the checks that apply to what changed:
   - `pnpm typecheck`, `pnpm lint`, `pnpm test`; add `pnpm test:integration` for server or database changes.
   - `pnpm e2e` when a user flow changed. For UI work, also compare the running page against the Pencil HTML export (screenshot) and fix visible drift.
   - `pnpm build` when routing, config or server/client boundaries changed.
   Do not edit or delete a test to make it pass unless the test itself is wrong; say so in the report. Never report an iteration done with a failing or unrun check; list any check you could not run and why.
6. Tick the iteration checklist in `technical-design.md`; set feature status to `IN PROGRESS`. Record the iteration in at most 15 lines: what was built, the check results, deviations. No code and no restating the plan.

Finish with the completion report: scope completed, files changed, checks run with results, deviations / `SPEC GAP` / `CONFLICT`, next iteration.
