# Artifact Authority and Change Routing

## Authority

1. Constitution
2. Product / Domain
3. Architecture / Tech Stack / ADR
4. Coding Rules
5. Feature Intent / Feature Spec / Acceptance Criteria
6. Technical Design
7. Code

## Route changes to the owner

- Product goal or MVP change → `docs/product/`
- Business invariant change → `docs/domain/`
- Technology or service-boundary change → `docs/architecture/`
- Implementation convention change → `docs/coding-rules.md`
- Why a feature exists, its constraints or scope → feature `intent.md`, then the spec
- Feature behavior change → feature `spec.md` + acceptance criteria + affected UML
- Visual-only change → Pencil + `design.md`
- Implementation-only change with same behavior → technical design/ADR if meaningful + code

Then propagate downstream.
