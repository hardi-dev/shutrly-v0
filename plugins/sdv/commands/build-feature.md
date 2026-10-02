---
description: Implement exactly one planned iteration of a feature, with tests and a deviation report
argument-hint: "<feature-slug> [iteration-number]"
---

Use the `spec-driven-vibe-coding` skill and run its **build-feature** workflow for: **$ARGUMENTS**

If no iteration number is given, pick the first unfinished iteration in `technical-design.md` and state which one.

1. Read: constitution, relevant coding rules, the feature's technical design, spec, acceptance criteria, and design reference.
2. Implement only that iteration. Do not invent requirements, add unrelated abstractions, or expand scope.
3. Enforce business rules server-side; client validation is UX only.
4. Add tests mapped to the `AC-*` / `BR-*` IDs covered.
5. Run the project quality gate (typecheck, lint, tests, build as applicable).
6. Tick the iteration checklist in `technical-design.md`; set feature status to `IN PROGRESS`.

Finish with the completion report: scope completed, files changed, checks run with results, deviations / `SPEC GAP` / `CONFLICT`, next iteration.
