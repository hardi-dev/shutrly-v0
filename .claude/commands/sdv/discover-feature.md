---
description: Specify one feature — spec, business-rule refs, acceptance criteria, open questions
argument-hint: "<feature-slug>"
---

Use the `spec-driven-vibe-coding` skill and run its **discover-feature** workflow for feature: **$ARGUMENTS**

If no slug was given, propose the next feature from `docs/product/feature-map.md` and ask before continuing.

1. Load only relevant context: feature-map entry, related journeys, related `BR-*` rules, constitution, relevant ADRs. Do not read the whole docs tree.
2. Resolve `SPEC GAP`s already recorded against this feature's rules. Ask focused questions only where the answer changes behavior; label low-risk reversible assumptions explicitly.
3. Write `docs/features/<slug>/spec.md`: status, goal, user story, preconditions, inputs, main / alternative / error flows, business-rule references (reference IDs, do not duplicate rules), dependencies, out of scope, open questions.
4. Write `docs/features/<slug>/acceptance-criteria.md` with stable `AC-<AREA>-NNN` IDs in Given/When/Then form, each listing the `BR-*` it covers.
5. If discovery changes a business rule or scope, update the owning artifact (`docs/domain/` or `docs/product/`) first — never only the feature spec.
6. Set the feature's status in `feature-map.md` to `SPECIFIED` (or `DISCOVERY` if gaps remain).

Finish with the completion report and recommend `/sdv:model-feature` or `/sdv:design-feature`.
