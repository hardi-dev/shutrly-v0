# Shutrly — Project Documentation

Shutrly is a management platform for photography businesses: services, projects, private client galleries with photo selection, final delivery, invoicing, and WhatsApp sharing.

## Authority Order

When artifacts conflict, the higher one wins. Never silently resolve a conflict in code — report `CONFLICT` or `SPEC GAP`.

1. [`constitution.md`](constitution.md)
2. Product ([`product/`](product/)) and Domain ([`domain/`](domain/))
3. Architecture, Tech Stack, accepted ADRs ([`architecture/`](architecture/))
4. [`coding-rules.md`](coding-rules.md)
5. Feature Spec + Acceptance Criteria ([`features/<name>/`](features/))
6. Technical Design (`features/<name>/technical-design.md`)
7. Code

## Map

| Area | File | Owns |
|---|---|---|
| Product | [product/overview.md](product/overview.md) | Who, problem, value, success |
| | [product/scope.md](product/scope.md) | MVP in/out, constraints, later |
| | [product/user-journeys.md](product/user-journeys.md) | End-to-end Owner and Client journeys |
| | [product/feature-map.md](product/feature-map.md) | Epics/features with IDs and status |
| Domain | [domain/business-rules.md](domain/business-rules.md) | `BR-*` invariants |
| | [domain/domain-model.md](domain/domain-model.md) | Concepts, relationships, lifecycles |
| | [domain/glossary.md](domain/glossary.md) | Ubiquitous language (EN/ID) |
| Architecture | [architecture/tech-stack.md](architecture/tech-stack.md) | Chosen technologies |
| | [architecture/overview.md](architecture/overview.md) | Layers, boundaries, security, data mapping rules |
| | [architecture/decisions/](architecture/decisions/) | ADRs |
| Status | [HANDOFF.md](HANDOFF.md) | Current progress, decisions, next steps, gotchas |
| Design system | [design-system/](design-system/) | Tokens (`tokens.json`), Pencil library + exploration, usage rules, component specs, and the local Storybook explorer |
| Guardrails | [constitution.md](constitution.md), [coding-rules.md](coding-rules.md) | Non-negotiables, conventions |
| Features | [features/](features/) | Created only for the feature currently in work |
| Templates | [templates/slice-plan.md](templates/slice-plan.md) | Reusable vertical-slice plan (one screen per slice), from F-07 plan-2 |
| Source | [_source/](_source/) | Original UML draft + blueprint (historical reference) |

## About `_source/`

`_source/photographer_management_uml_draft.md` (Indonesian) and `_source/photographer_management_platform_blueprint.md` are the pre-bootstrap discovery documents. Their decisions have been migrated into this tree, which is now authoritative. They remain useful as reference material for per-feature modeling (formal diagrams, table-level constraints). If a `_source` document disagrees with this tree, this tree wins; if something is in `_source` but missing here, treat it as a `SPEC GAP` and migrate it deliberately.

## Context-loading guide

- Product/scope change → `product/`
- Business behavior → `domain/business-rules.md`, `domain/domain-model.md`
- Schema/service boundary → `architecture/` + relevant ADRs
- Feature behavior → `features/<name>/spec.md`, `acceptance-criteria.md`, `diagrams/`
- UI → feature spec/states + Pencil reference in `features/<name>/design.md`
- Implementation → constitution + coding rules + feature technical design
