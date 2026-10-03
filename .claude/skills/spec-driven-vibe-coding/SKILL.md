---
name: spec-driven-vibe-coding
description: Guide a software project from idea to shipped feature using progressive specs, project constitution, coding rules, UML/flows, Pencil UI iteration, technical design, small development iterations, and verification. Use for project bootstrap, feature discovery/modeling/design/planning/building/reviewing, or when keeping AI coding aligned with product and domain intent.
---

# Spec-Driven Vibe Coding

Use this skill to keep AI-assisted development fast without allowing product intent, domain rules, design, and code to drift apart.

## Core principle

Conversation creates decisions. Documentation records decisions. UML models behavior. Pencil owns visual truth. Technical design explains implementation. Code implements approved behavior. Verification checks alignment.

Do not generate all documentation up front. Use progressive specification.

## Authority order

When artifacts conflict, use this order:

1. Project Constitution
2. Product and Domain Rules
3. Architecture, Tech Stack, and accepted ADRs
4. Coding Rules
5. Feature Intent, Feature Spec and Acceptance Criteria
6. Technical Design
7. Implementation

Never silently resolve a conflict by changing a higher-authority rule. Report the conflict or a `SPEC GAP`.

## Workflow

1. **Discover product**
   - Clarify user, problem, MVP, out-of-scope items, and main journey.
   - Create/update product docs from `assets/templates/`.

2. **Discover domain**
   - Ask only questions needed to remove material ambiguity.
   - Record stable business rules with IDs such as `BR-BOOK-001`.
   - Model business concepts without framework/database details.

3. **Map features**
   - Split MVP into epics/features.
   - Detail only the feature currently being worked on.

4. **Choose/record stack**
   - If stack is already constrained by the user/repo, record it; do not reopen the decision.
   - Otherwise choose it from product/domain constraints.
   - Record architecture-impacting decisions as ADRs.

5. **Establish guardrails**
   - Maintain `docs/constitution.md` for non-negotiable principles.
   - Maintain `docs/coding-rules.md` for implementation conventions.
   - Use the templates in `assets/templates/`.

6. **Capture intent** (optional for small features)
   - Brainstorm the idea, ticket, bug or incident into `docs/features/<slug>/intent.md`: problem, outcome, users and systems, constraints, out of scope, open questions.
   - The Owner reviews and accepts it before discovery starts.

6b. **Discover selected feature**
   - Define goal, story, preconditions, inputs, main/alternative/error flows, dependencies, business-rule references, and out-of-scope behavior.
   - Write acceptance criteria with stable IDs such as `AC-BOOK-001`.

7. **Model feature**
   - Create an activity/flow diagram when process ambiguity exists.
   - Create a sequence diagram when interaction/order matters.
   - Create a state diagram when lifecycle transitions matter.
   - Do not create UML merely to satisfy a checklist.

8. **Design in Pencil**
   - Derive required screens and UI states from spec + UML.
   - Treat the approved Pencil design as visual source of truth.
   - If design exposes undefined behavior, report `SPEC GAP`; update the owning spec/rule before continuing.
   - Record design IDs/version/reference in `design.md`; do not duplicate pixel specs in Markdown.

9. **Plan technical implementation**
   - Read only relevant docs for the task.
   - Define database/API/application logic/components/security/testing/concurrency as needed.
   - Break work into small verifiable iterations.

10. **Build one iteration at a time**
    - Keep scope bounded.
    - Do not invent requirements or unrelated abstractions.
    - Test relevant domain behavior and acceptance criteria.

11. **Verify**
    - Check constitution, coding rules, business rules, feature spec, acceptance criteria, UML behavior, Pencil fidelity, and technical quality.
    - Make every deviation explicit.

12. **Ship**
    - Run project quality gates.
    - Preview/stage when available.
    - Smoke-test the critical journey.
    - Ensure docs describe shipped behavior.

13. **Learn**
    - Route feedback to the artifact that owns the changed decision before modifying downstream artifacts/code.

## Context-loading rule

Do not force-read the entire docs tree for every edit. Load context proportionally:

- Product/scope changes → product docs.
- Business behavior changes → domain rules/model.
- Schema/service-boundary changes → architecture + relevant ADRs.
- Feature behavior → feature spec + acceptance criteria + relevant UML.
- UI work → feature spec/states + approved Pencil reference.
- Implementation → constitution + relevant coding rules + feature/technical design.
- Verification → all artifacts relevant to the behavior being verified.

## Required behaviors

- Ask focused discovery questions only when missing information materially changes behavior.
- Prefer explicit assumptions only for low-risk reversible details; label them.
- Use `SPEC GAP` for undefined product/domain behavior.
- Use `CONFLICT` when two authoritative artifacts disagree.
- Never let client-side validation be the only authority for integrity/security-sensitive rules.
- Do not let code become the accidental specification.
- Keep diagrams and docs concise enough to remain maintainable.
- Prefer Mermaid for textual UML/flow diagrams unless the project uses another format.
- Preserve existing project conventions when they do not conflict with higher-authority rules.

## Modes / commands

Each mode is a workflow. In Claude Code the plugin (`sdv`) exposes them as namespaced slash commands; elsewhere, run the same workflow when the user names it in plain words (e.g. "discover feature booking").

| Command | Workflow |
|---|---|
| `/sdv:init-project [idea]` | product discovery → domain discovery → feature map → stack → constitution/coding rules (adopt existing docs instead of re-deciding) |
| `/sdv:capture-intent <slug> [idea]` | brainstorm → `intent.md` (problem, outcome, constraints, open questions) → Owner accepts |
| `/sdv:discover-feature <slug>` | spec + business-rule refs + acceptance criteria + open questions |
| `/sdv:model-feature <slug>` | activity + sequence + state diagrams only where useful |
| `/sdv:design-feature <slug>` | screen/state inventory → Pencil iteration → spec-gap loop → approval record |
| `/sdv:plan-feature <slug>` | technical design + implementation iterations |
| `/sdv:build-feature <slug> [n]` | implement one approved iteration → tests → deviation report |
| `/sdv:verify-feature <slug>` | cross-check implementation against authoritative artifacts |
| `/sdv:handoff [notes]` | end-of-session `HANDOFF.md` refresh within a 12 KB budget; old handoff summarised into the archive. `/sdv:handoff wip` is the cheap resume note for an unfinished session |
| `/sdv:ship [name]` | quality gates → preview/staging → smoke test → release notes |

When recommending a next step to the user, name the exact command above (with the `sdv:` prefix), never a bare `/discover-feature`-style name.

In Codex there are no slash commands: each command is a generated skill named `sdv-<command>`, run as `$sdv-<command> <args>` (for example `$sdv-capture-intent clients`). When the host is Codex, name the next step as `$sdv-<command>` instead of `/sdv:<command>`.

## Templates and examples

Use files in `assets/templates/` as starting points. Do not preserve unused sections just because the template contains them.

For a concrete worked example, consult `assets/examples/hotel-booking/`.

For the full workflow rationale, consult `references/workflow.md`.

## Completion report

For planning/build/verification tasks, finish with a compact report containing only relevant items:

- Scope completed
- Artifacts created/updated
- Tests/checks run and result
- `SPEC GAP` / `CONFLICT` / deviation, if any
- Next recommended workflow stage
