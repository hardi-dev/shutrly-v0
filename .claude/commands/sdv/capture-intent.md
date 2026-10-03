---
description: Capture an idea, ticket, bug or incident as a reviewed intent.md before specifying the feature
argument-hint: "<feature-slug> [idea, ticket, or incident in your own words]"
model: claude-sonnet-5-5
effort: high
---

Use the `spec-driven-vibe-coding` skill and run its **capture-intent** workflow for: **$ARGUMENTS**

The first word is the feature slug. The rest, if any, is the originator's description. If there is no slug, propose one (kebab-case, matching the feature-map naming) and confirm it.

1. Load only what frames the idea: the feature-map entry if it exists, the product overview, and the `BR-*` rules or constitution principles the idea touches. Do not read the whole docs tree. If `docs/features/<slug>/intent.md` exists, read it and revise instead of starting over.
2. Brainstorm briefly in the originator's own terms. Ask only the questions an analyst would ask that change scope: who is affected, what they cannot do today, what better looks like, what is out of scope, which constraints are fixed. One focused round; label low-risk reversible assumptions explicitly.
3. Write `docs/features/<slug>/intent.md` from `assets/templates/intent.md` with `Status: DRAFT`. State the problem and outcome. Do not design a solution, pick a stack, or write acceptance criteria. Reference `BR-*` and constitution IDs instead of copying them.
4. For a bug or incident, set `Source` accordingly and put the evidence (error, metric, reproduction, link) under Problem. Name the failing behavior, not the fix.
5. Flag any collision with the constitution, a business rule or the feature map as `CONFLICT` or `SPEC GAP` under Open questions. Do not change a higher-authority document to make the intent fit.
6. Show the intent to the Owner and apply corrections. Only the Owner sets `Status: ACCEPTED` (or `REJECTED`). Never accept it yourself.
7. If the feature is not in `docs/product/feature-map.md`, add it as `TODO` linking the intent. Leave an existing entry's status alone.
8. Commit `intent.md` on its own (`docs(<slug>): capture intent`) so author and timestamp are on record.

Finish with the completion report and recommend `/sdv:discover-feature <slug>` once the intent is `ACCEPTED`, or the open questions to settle first.
