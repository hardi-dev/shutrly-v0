---
description: Write the technical design and split the feature into small verifiable iterations
argument-hint: "<feature-slug>"
model: claude-opus-5-5
effort: high
---

Use the `spec-driven-vibe-coding` skill and run its **plan-feature** workflow for feature: **$ARGUMENTS**

1. Read: constitution, coding rules, tech stack, the ADR index, feature spec, acceptance criteria, diagrams, design reference. Read ADR bodies only for decisions this feature touches (find them from the titles). Do not read other features' plans or implementation records, except to learn a contract this feature depends on.
   - If the spec's **Flagged Concerns** has any `OPEN` row, stop and ask the Owner to resolve it. Do not plan around an unresolved concern.
   - Plan against each `RESOLVED` concern's recorded decision.
2. Write `docs/features/<slug>/technical-design.md`: context, relevant BRs, database changes, server/API interface, domain/application logic, UI components, validation, error handling, concurrency/consistency, security, testing strategy (mapped to `AC-*`), risks.
3. Split into small iterations, each with a checklist and a clear "done" check. Give each iteration a **Read first** list: the exact `AC-*` / `BR-*` IDs, `technical-design.md` sections, coding-rules sections, existing code to follow and design exports it needs (name the exact screens, devices and states from `exports/_compact/INDEX.md` when it exists), so `/sdv:build-feature` can load only that. Each iteration: plan → implement → test → verify → commit.
4. Record any architecture-impacting decision as a new ADR.
5. Set feature status to `PLANNED`.

Finish with the completion report and recommend `/sdv:build-feature <slug> 1`.
