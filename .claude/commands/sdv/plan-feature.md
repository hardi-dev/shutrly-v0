---
description: Write the technical design and split the feature into small verifiable iterations
argument-hint: "<feature-slug>"
model: claude-opus-5-5
effort: high
---

Use the `spec-driven-vibe-coding` skill and run its **plan-feature** workflow for feature: **$ARGUMENTS**

1. Read: constitution, coding rules, tech stack + relevant ADRs, feature spec, acceptance criteria, diagrams, design reference.
   - If the spec's **Flagged Concerns** has any `OPEN` row, stop and ask the Owner to resolve it. Do not plan around an unresolved concern.
   - Plan against each `RESOLVED` concern's recorded decision.
2. Write `docs/features/<slug>/technical-design.md`: context, relevant BRs, database changes, server/API interface, domain/application logic, UI components, validation, error handling, concurrency/consistency, security, testing strategy (mapped to `AC-*`), risks.
3. Split into small iterations, each with a checklist and a clear "done" check. Each iteration: plan → implement → test → verify → commit.
4. Record any architecture-impacting decision as a new ADR.
5. Set feature status to `PLANNED`.

Finish with the completion report and recommend `/sdv:build-feature <slug> 1`.
