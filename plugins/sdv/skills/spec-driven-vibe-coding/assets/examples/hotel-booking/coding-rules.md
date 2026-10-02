# Coding Rules

Version: 1.0

> Adapt stack-specific details during project bootstrap.

## General
- Prefer explicit, readable code.
- Keep units focused.
- Avoid premature abstractions and unrelated refactors.
- Remove dead code and unexplained temporary artifacts.

## Naming
- Use project/domain terminology consistently.
- Record file/function/component naming conventions here.

## Types
- Avoid unsafe escape hatches such as `any` unless justified.
- Prefer domain-specific types.
- Validate data at trust boundaries.

## UI / Components
- Keep business logic out of presentation components.
- Keep interactive/client boundaries as small as practical.
- Extract abstractions when reuse or complexity justifies them.

## Validation
- Client validation improves UX.
- Server validation is authoritative for critical rules.

## Data Access
- Respect the selected data-access boundary.
- Do not expose sensitive data access from the client unless architecture explicitly allows it.
- Fetch only needed fields when practical.

## Errors and Logging
- Do not swallow unexpected errors.
- Model expected domain errors explicitly.
- Log unexpected server errors with useful non-sensitive context.
- Do not expose internal details to users.

## UI States
Consider idle, loading, success, empty, validation error, domain/server error, retry, and disabled states where applicable.

## Testing
- Prioritize business behavior over implementation details.
- Map critical tests to `BR-*` or `AC-*` IDs when useful.
- Unit-test domain logic.
- Integration-test important boundaries.
- E2E-test critical journeys.

## Security
- Never hard-code secrets.
- Never trust client-provided role, ownership, authorization, or authoritative price.
- Follow project authorization/RLS policies.

## Quality Gate
Before an iteration is complete:
- typecheck passes
- lint passes
- relevant tests pass
- build passes when applicable
- constitution compliance checked
- coding-rules compliance checked
- acceptance criteria verified
