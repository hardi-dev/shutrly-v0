# Project Folder Architecture Design

Status: APPROVED (2026-09-26)

## Decision

Shutrly uses a modular monolith organized around product-facing features with explicit Ports & Adapters boundaries:

```text
src/
  app/                         # Next.js routing and thin entry points
  features/                    # product-facing bounded contexts
    auth/
    workspace/
    booking/
    gallery/
    finance/
    communications/
  adapters/                    # vendor implementations of ports
    auth/
    db/
    email/
    storage/
    queue/
    source/
  composition/                 # dependency wiring / composition root
  ui/                          # shared design-system primitives and patterns
  shared/                      # genuinely cross-feature code only
```

Each feature owns its business capability and is internally divided into `domain/`, `application/`, and `ui/`.

## Why features instead of modules

`features/` matches Shutrly's product language and feature-map IDs (`F-01 Auth`, `F-02 Workspace`, and so on). It keeps each capability discoverable and prevents generic technical buckets from becoming dumping grounds. The internal layers still make the architectural boundary explicit; `features/auth` is both a product feature and a bounded context.

## Dependency rules

```text
app → composition → features/*/application → features/*/domain
                         ↓
                       ports
                         ↑
                      adapters
```

- `features/*/domain` is framework-free and vendor-free.
- `features/*/application` owns use cases, policies, DTOs, runtime schemas, and ports.
- `adapters/*` may import Neon, Drizzle, Better Auth, Resend, Cloudflare, R2, Queues, or provider SDKs, but implements ports rather than product policy.
- `composition/` is the only place that wires concrete adapters to feature ports.
- `app/` contains routes, pages, server actions, and route handlers; these remain thin.
- `ui/` contains reusable visual primitives and patterns. Feature UI imports these wrappers rather than vendor UI libraries directly.
- `shared/` is reserved for code genuinely used across features. A feature-specific helper stays inside that feature.

## Co-located TDD convention

Every meaningful unit gets a subfolder. The implementation and its TDD test are siblings; types and runtime schemas are also siblings when applicable:

```text
src/features/auth/application/use-cases/register-owner/
  register-owner.ts
  register-owner.test.ts
  register-owner.types.ts
  register-owner.schema.ts

src/features/auth/ui/register-form/
  register-form.tsx
  register-form.test.tsx
  register-form.types.ts
  register-form.schema.ts

src/adapters/email/auth-email-sender/
  resend-auth-email-sender.ts
  resend-auth-email-sender.test.ts
```

Canonical business-input schemas live beside their use case and are reused by server actions and forms. A UI-specific schema may live beside the component when it describes presentation-only state. No schema is duplicated merely to satisfy folder locality.

Unit tests are co-located. Integration tests remain in `tests/integration/` and browser journeys in `tests/e2e/` because they exercise multiple units and real composition.

## Auth application

F-01 uses `features/auth` for identity policy, use cases, ports, and auth UI. Better Auth, Neon/Drizzle, Resend, and rate-limiting implementations live under `adapters/` and are wired in `composition/`. This keeps identity policy independent from Better Auth while still allowing Better Auth to own credentials, sessions, verification, and reset records as required by ADR-002.

## Alternatives rejected

- **Horizontal layers only** (`app`, `modules`, `domain`, `infrastructure`): clear at first, but spreads one product capability across large technical buckets.
- **Unstructured feature folders**: good locality, but weak dependency rules and easy vendor leakage.
- **Direct vendor imports from application code**: simpler initially, but violates the hard portability principle and makes provider changes expensive.

## Migration impact

The current repository has no `src/` implementation scaffold, so this is a forward architecture decision rather than a code migration. Existing docs that referenced `modules/`, `domain/`, or `infrastructure/` are updated to use `features/`, `adapters/`, and `composition/`. Historical `_source/` documents remain unchanged and non-authoritative.

## Open constraints

- The F-00 foundation must create the initial `src/` scaffold and enforce import boundaries through lint/type checks.
- Feature names follow the product feature map; the first implementation folder is `features/auth`, not `features/identity`.
- Final UI and email copy remains owned by `/sdv:design-feature auth`.
