# Spec-Driven Vibe Coding Workflow

> A practical workflow for building software with AI while keeping
> product decisions, UML, UI design, implementation, and verification
> synchronized.

## 1. Purpose

This workflow is designed for AI-assisted or "vibe coding" projects
where speed is important, but the project still needs a reliable source
of truth.

The core principle is:

**Conversation creates decisions. Documentation records decisions.
Design visualizes decisions. Code implements decisions. Verification
checks that they remain synchronized.**

Documentation should evolve progressively. Do not create every possible
document at the start of a project.

------------------------------------------------------------------------

## 2. High-Level Workflow

``` text
IDEA
  ↓
PRODUCT DISCOVERY
  ├── Product Overview
  ├── MVP Scope
  └── User Journey
  ↓
DOMAIN DISCOVERY
  ├── Business Rules
  ├── Domain Model
  └── Domain UML
  ↓
FEATURE MAP
  └── Epics / Features
  ↓
TECH STACK DECISION
  ├── Framework
  ├── Database
  ├── UI Stack
  ├── Testing
  └── Architecture Principles
  ↓
SELECT FEATURE
  ↓
FEATURE DISCOVERY
  ├── Feature Spec
  └── Acceptance Criteria
  ↓
FEATURE UML / FLOW
  ├── Activity / Flow Diagram
  ├── Sequence Diagram
  └── State Diagram (when needed)
  ↓
PENCIL UI DESIGN
  ↓
DESIGN ITERATION
  ├── Review
  ├── Detect Spec Gaps
  └── Update Spec / UML when needed
  ↓
READY FOR DEVELOPMENT
  ↓
TECHNICAL DESIGN
  ├── Database Changes
  ├── API / Server Actions
  ├── Domain / Application Logic
  ├── Components
  └── Implementation Plan
  ↓
DEVELOPMENT ITERATION
  ↓
VERIFY
  ├── Spec
  ├── Business Rules
  ├── UML
  ├── Pencil
  └── Acceptance Criteria
  ↓
SHIP
  ↓
FEEDBACK
  └── Return to Discovery when requirements change
```

This is not intended to be waterfall. Each feature moves through a small
feedback loop.

------------------------------------------------------------------------

## 3. Source of Truth

Each artifact answers a different question.

  -----------------------------------------------------------------------
  Question                            Source of Truth
  ----------------------------------- -----------------------------------
  Why does the product exist?         `docs/product/`

  What is included in the MVP?        `docs/product/scope.md`

  How does the user achieve their     `docs/product/user-journeys.md`
  goal?                               

  What business rules must always be  `docs/domain/business-rules.md`
  true?                               

  What are the core business          `docs/domain/domain-model.md`
  concepts?                           

  What technology is used?            `docs/architecture/tech-stack.md`

  Why was an important technical      `docs/architecture/decisions/`
  decision made?                      

  What should a feature do?           `docs/features/<feature>/spec.md`

  How does the feature behave?        Feature UML / diagrams

  What counts as correct?             `acceptance-criteria.md`

  What should the UI look like?       Pencil approved design

  How will the feature be             `technical-design.md`
  implemented?                        

  What actually runs?                 Source code
  -----------------------------------------------------------------------

A lower-level artifact must not silently override a higher-level
decision.

For example, implementation must not change a business rule just because
it is easier to code.

------------------------------------------------------------------------

## 4. Recommended Documentation Structure

``` text
docs/
├── README.md
├── constitution.md
├── coding-rules.md
│
├── product/
│   ├── overview.md
│   ├── scope.md
│   ├── user-journeys.md
│   └── glossary.md
│
├── domain/
│   ├── domain-model.md
│   ├── business-rules.md
│   └── diagrams/
│       └── domain-model.md
│
├── architecture/
│   ├── tech-stack.md
│   ├── overview.md
│   └── decisions/
│       ├── ADR-001-example.md
│       └── ADR-002-example.md
│
├── features/
│   └── <feature-name>/
│       ├── spec.md
│       ├── acceptance-criteria.md
│       ├── diagrams/
│       │   ├── activity.md
│       │   ├── sequence.md
│       │   └── state.md
│       ├── design.md
│       └── technical-design.md
│
└── releases/
    └── v1.md
```

Do not create every file immediately. Create documents when the project
has enough information for them to be useful.

------------------------------------------------------------------------

# 5. Project Constitution and Coding Rules

These two documents provide project-wide guardrails for humans and AI agents.

## 5.1 Authority Order

When documents conflict, use this authority order:

```text
PROJECT CONSTITUTION
        ↓
PRODUCT / DOMAIN RULES
        ↓
ARCHITECTURE + TECH STACK + ADR
        ↓
CODING RULES
        ↓
FEATURE SPEC + ACCEPTANCE CRITERIA
        ↓
TECHNICAL DESIGN
        ↓
IMPLEMENTATION
```

A lower-level artifact must not silently override a higher-level artifact.

If an implementation request conflicts with the constitution or a domain rule, the agent must stop that part of the implementation, report the conflict, and request or propose an explicit decision.

## 5.2 `constitution.md`

The constitution contains stable, non-negotiable engineering principles.

It should be short enough that an AI agent can read it before every planning, implementation, and verification task.

Recommended template:

```md
# Project Constitution

Version: 1.0

## C-001 — Product Intent Is Authoritative

Implementation must preserve approved product intent, domain rules,
feature behavior, and acceptance criteria.

Code must not redefine product behavior.

## C-002 — No Invented Requirements

When requirements are missing, ambiguous, or contradictory,
report a SPEC GAP.

Do not silently invent business rules, prices, states, permissions,
validation rules, or user flows.

## C-003 — Domain Integrity

Business rules must be enforced at the authoritative layer,
not only in the UI.

Client-side validation may improve UX but must not be the final
authority for critical business rules.

## C-004 — Server Authority

Security-sensitive and integrity-sensitive operations must be
validated server-side.

Examples:
- authentication
- authorization
- final price calculation
- booking availability
- ownership
- critical state transitions

## C-005 — Data Consistency

Operations that can create inconsistent business state must use
appropriate transactional, constraint, locking, or concurrency
controls.

## C-006 — Security by Default

Never expose secrets to the client.

Validate untrusted input.

Apply least-privilege authorization.

Do not bypass security controls to simplify implementation.

## C-007 — Explicit State Handling

Relevant loading, empty, error, disabled, success, and retry states
must be handled explicitly.

## C-008 — Accessibility

User-facing interfaces should use semantic HTML, keyboard-accessible
interaction, appropriate labels, and accessible feedback.

## C-009 — Test Critical Behavior

Critical domain rules and acceptance criteria must be verifiable.

Tests should prioritize business behavior over implementation details.

## C-010 — No Silent Scope Expansion

Implement only the approved feature and current development iteration.

Do not add unrelated features, abstractions, dependencies, or
refactors without explicit justification.

## C-011 — Preserve Source-of-Truth Alignment

When approved behavior changes, update the owning specification and
affected downstream artifacts.

Do not allow code to become the accidental specification.

## C-012 — Report Deviations

If implementation cannot match the approved spec, UML, architecture,
or Pencil design, report the deviation explicitly.

Do not silently accept drift.
```

Constitution rules should use stable IDs such as `C-001` so technical designs, reviews, and verification reports can reference them.

## 5.3 `coding-rules.md`

Coding rules describe implementation conventions. They may evolve more frequently than the constitution.

Recommended template:

```md
# Coding Rules

Version: 1.0

## General

- Use TypeScript.
- Prefer explicit, readable code over clever abstractions.
- Keep functions focused on one responsibility.
- Avoid premature abstraction.
- Remove dead code.
- Do not leave unexplained TODOs in completed feature work.

## Naming

- Components: PascalCase.
- Functions and variables: camelCase.
- Constants: UPPER_SNAKE_CASE when appropriate.
- Files/components follow the project's selected naming convention.
- Domain terminology must match the project glossary/specification.

## Types

- Avoid `any`.
- Prefer domain-specific types over primitive duplication.
- Validate data at trust boundaries.
- Do not use type assertions to hide invalid states unless justified.

## Components

- Prefer server-rendered components when interaction does not require
  client state.
- Keep client boundaries as small as practical.
- Keep business logic out of presentation components.
- Extract reusable components only when reuse or complexity justifies it.

## Validation

- Validate user input with the project's approved validation library.
- Client validation is UX support.
- Server validation is authoritative.

## Data Access

- Keep database access behind the selected application/data-access
  boundary.
- Do not query sensitive data directly from client code unless the
  architecture explicitly permits it.
- Select only required fields when practical.

## Error Handling

- Do not swallow errors.
- Return or map expected domain errors explicitly.
- Log unexpected server errors with useful context.
- Do not expose sensitive internal error details to users.

## UI States

Every asynchronous user-facing operation must consider:

- idle
- loading
- success
- empty, when applicable
- validation error
- server/domain error
- retry, when applicable
- disabled state, when applicable

## Testing

- Map critical tests to business-rule or acceptance-criteria IDs when
  useful.
- Unit-test domain logic.
- Integration-test important application/database boundaries.
- Use E2E tests for critical user journeys.
- Avoid tests that only reproduce implementation details.

## Security

- Never hard-code secrets.
- Never trust client-provided ownership, role, price, or authorization
  information.
- Sanitize or validate untrusted input where required.
- Follow project authorization and RLS policies.

## Changes

- Keep changes within the current feature/iteration scope.
- Avoid unrelated refactors.
- New dependencies require a clear reason.
- Architecture-impacting decisions require an ADR when appropriate.

## Quality Gate

Before an iteration is complete:

- typecheck passes
- lint passes
- relevant tests pass
- build passes when applicable
- constitution compliance checked
- coding-rules compliance checked
- acceptance criteria verified
```

Project-specific rules should be added here rather than repeatedly embedded in prompts.

## 5.4 Constitution vs Coding Rules

Use this distinction:

| Constitution | Coding Rules |
|---|---|
| Non-negotiable principles | Implementation conventions |
| Changes rarely | Can evolve |
| Technology-independent when possible | Often stack-specific |
| Protects product/system integrity | Protects code consistency |
| Example: critical rules are server-authoritative | Example: use Zod for validation |
| Example: no silent requirement invention | Example: prefer Server Components |

## 5.5 AI Agent Precedence Rule

Every planning or coding agent should receive this instruction:

```text
Before planning or modifying code:

1. Read constitution.md.
2. Read coding-rules.md.
3. Read relevant product/domain rules.
4. Read architecture/tech-stack.md and relevant ADRs.
5. Read the selected feature specification and acceptance criteria.
6. Read relevant UML/flow diagrams.
7. Read the approved design reference.
8. Read technical-design.md when it exists.

If instructions conflict, follow project authority order.

Do not resolve product or domain conflicts by silently changing code.
Report the conflict or SPEC GAP.
```

---

# 6. Project Bootstrap

## 5.1 Start With an Idea

A new project can start with a very small description.

Example:

> Build a hotel booking application where travelers can search hotels,
> view rooms, check availability, and make a reservation.

At this stage:

-   Do not design the database.
-   Do not create React components.
-   Do not decide API endpoints.
-   Do not generate detailed feature specs.
-   Do not create every documentation file.

Start with product discovery.

------------------------------------------------------------------------

# 7. Product Discovery

## Goal

Understand what is being built and define the initial boundaries.

The AI acts as a product analyst and asks questions to remove important
ambiguity.

Typical questions include:

-   Who is the primary user?
-   What problem are they solving?
-   What is the primary journey?
-   What must be included in the MVP?
-   What is explicitly out of scope?
-   Does the user need an account?
-   Is payment required?
-   What represents a successful outcome?

## Output

``` text
docs/product/
├── overview.md
├── scope.md
└── user-journeys.md
```

## Example Product Journey

``` mermaid
flowchart LR
    A[Search Hotel] --> B[Search Results]
    B --> C[Hotel Detail]
    C --> D[Select Room]
    D --> E[Select Dates & Guests]
    E --> F[Check Availability]
    F --> G[Booking Review]
    G --> H[Confirm Booking]
    H --> I[Booking Confirmation]
```

## Exit Criteria

Product Discovery is sufficiently complete when:

-   Primary user is known.
-   Primary problem is known.
-   MVP boundary is defined.
-   Main user journey is understandable.
-   Major out-of-scope items are recorded.

It does not need to answer every future product question.

------------------------------------------------------------------------

# 8. Domain Discovery

## Goal

Discover rules that must remain true regardless of UI or technology.

The AI acts as a domain analyst.

Example questions for hotel booking:

-   Can two bookings overlap?
-   Can checkout and another booking's check-in occur on the same date?
-   When is a room considered reserved?
-   When is availability rechecked?
-   How is final price determined?
-   What happens when availability changes during checkout?
-   What states can a booking have?

## Business Rule IDs

Give important rules stable identifiers.

Example:

``` text
BR-BOOK-001
Check-out must occur after check-in.

BR-BOOK-002
Guest count must not exceed room capacity.

BR-BOOK-003
Confirmed bookings for the same room must not overlap.

BR-BOOK-004
Availability must be revalidated when the booking is created.

BR-BOOK-005
Final booking price must be calculated by the server.
```

Rule IDs create traceability:

``` text
Business Rule
      ↓
Feature Spec
      ↓
Acceptance Criteria
      ↓
Implementation
      ↓
Test
```

## Domain UML

Domain diagrams describe business concepts, not database tables.

Example:

``` mermaid
classDiagram
    Hotel "1" --> "*" Room
    Room "1" --> "*" Booking
    Guest "1" --> "*" Booking

    class Hotel {
        id
        name
        address
    }

    class Room {
        id
        hotelId
        name
        capacity
        nightlyPrice
    }

    class Booking {
        id
        roomId
        guestId
        checkIn
        checkOut
        guestCount
        totalPrice
        status
    }
```

Do not add framework-specific implementation details to the domain
model.

------------------------------------------------------------------------

# 9. Feature Map

Once the main product and domain are understandable, split the MVP into
features.

Example:

``` text
EPIC-01 Hotel Discovery

F-001 Search Hotel
F-002 Search Results
F-003 Hotel Detail

EPIC-02 Room

F-004 Room Detail
F-005 Room Availability

EPIC-03 Booking

F-006 Booking Review
F-007 Create Booking
F-008 Booking Confirmation

EPIC-04 Account

F-009 My Bookings
F-010 Booking Detail
```

The feature map is a planning tool. Features that are not being
developed yet do not need detailed specifications.

------------------------------------------------------------------------

# 10. Tech Stack Decision

## When

Choose the stack after the initial product/domain constraints are
understood and before implementation-specific technical design.

If the stack is already a project constraint, record it immediately
rather than asking the AI to reconsider it.

## Output

`docs/architecture/tech-stack.md`

## Example

``` text
Application Framework: Next.js
Language: TypeScript

UI:
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js server-side application layer
- Supabase

Database:
- PostgreSQL

Authentication:
- Supabase Auth

Validation:
- Zod

Testing:
- Vitest
- Playwright

Deployment:
- Vercel
- Supabase
```

## Stack Decision vs Technical Design

Stack Decision answers:

> What technologies are we building with?

Technical Design answers:

> How will this specific feature be implemented using those
> technologies?

Keep these decisions separate.

------------------------------------------------------------------------

# 11. Feature Discovery

Select one feature or one small vertical slice.

Example:

``` text
Feature: Create Hotel Booking
```

The AI now narrows its questions to this feature.

Possible questions:

-   What inputs are required?
-   Must the user be authenticated?
-   When is availability checked?
-   What happens when availability changes?
-   Is the displayed price authoritative?
-   What errors must the UI handle?
-   What is explicitly out of scope?

## Feature Spec

Create:

`docs/features/booking/spec.md`

Recommended sections:

``` md
# Feature: Hotel Booking

## Status

DRAFT | READY FOR DESIGN | READY FOR DEVELOPMENT | IMPLEMENTED

## Goal

## User Story

## Preconditions

## Inputs

## Main Flow

## Alternative Flows

## Error Cases

## Business Rules

## Dependencies

## Out of Scope
```

Feature specs should reference business rule IDs instead of duplicating
domain rules.

------------------------------------------------------------------------

# 12. Acceptance Criteria

Acceptance criteria define observable correctness.

Use stable IDs.

Example:

``` text
AC-BOOK-001
Covers: BR-BOOK-001

Given check-in is 10 October
When check-out is also 10 October
Then booking cannot continue.
```

Another example:

``` text
AC-BOOK-004
Covers: BR-BOOK-004

Given the room was available during booking review
When another booking reserves it before confirmation
Then booking creation fails with ROOM_NOT_AVAILABLE.
```

Acceptance criteria should later map naturally to automated or manual
tests.

------------------------------------------------------------------------

# 13. Feature UML and Flow

UML is created to reduce ambiguity, not because every feature is
required to have every diagram.

## 12.1 Activity / Flow Diagram

Answers:

> What is the business flow?

Example:

``` mermaid
flowchart TD
    A[Select Room] --> B[Select Dates]
    B --> C[Select Guests]
    C --> D[Check Availability]
    D --> E{Available?}

    E -->|No| F[Show Unavailable]
    E -->|Yes| G[Calculate Price]

    G --> H[Booking Review]
    H --> I[Confirm Booking]
    I --> J[Recheck Availability]
    J --> K{Still Available?}

    K -->|No| L[Show Availability Changed]
    K -->|Yes| M[Calculate Final Price]

    M --> N[Create Booking]
    N --> O[Booking Confirmation]
```

## 12.2 Sequence Diagram

Answers:

> Who interacts with whom and in what order?

Example:

``` mermaid
sequenceDiagram
    actor Guest
    participant UI
    participant BookingService
    participant Repository
    participant DB

    Guest->>UI: Confirm Booking
    UI->>BookingService: createBooking()
    BookingService->>Repository: checkAvailability()
    Repository->>DB: Query overlapping bookings
    DB-->>Repository: Availability
    Repository-->>BookingService: Availability

    BookingService->>BookingService: Calculate final price
    BookingService->>Repository: createBooking()
    Repository->>DB: Insert booking
    DB-->>Repository: Booking
    Repository-->>BookingService: Booking
    BookingService-->>UI: Booking confirmed
    UI-->>Guest: Show confirmation
```

## 12.3 State Diagram

Use when the entity has meaningful lifecycle transitions.

Example:

``` mermaid
stateDiagram-v2
    [*] --> PENDING

    PENDING --> CONFIRMED
    PENDING --> FAILED
    CONFIRMED --> CANCELLED

    FAILED --> [*]
    CANCELLED --> [*]
```

## UML Rule

Do not require all diagrams for all features.

Use a diagram only when it meaningfully reduces ambiguity.

A simple profile-name update may need no UML. Booking, payment,
approval, scheduling, and other stateful workflows often benefit from
it.

------------------------------------------------------------------------

# 14. Pencil UI Design

Once feature behavior is sufficiently clear, move into UI design.

Pencil becomes the visual source of truth.

## Input to Design

The designer or AI should use:

``` text
Product Journey
+
Feature Spec
+
Business Rules
+
Activity Flow
+
Relevant States
```

## Design Output

Example screens:

``` text
SCR-001 Hotel Search
SCR-002 Search Results
SCR-003 Hotel Detail
SCR-004 Room Detail
SCR-005 Booking Review
SCR-006 Booking Confirmation
```

Record design references in:

`docs/features/booking/design.md`

Example:

``` text
Design Tool: Pencil
Project: Hotel Booking
Approved Design Version: v1.6

Screens:
SCR-004 Room Detail
SCR-005 Booking Review
SCR-006 Booking Confirmation
```

Do not duplicate pixel-level visual specifications in Markdown when
Pencil already owns them.

------------------------------------------------------------------------

# 15. Design Iteration

Design is part of discovery.

While creating the UI, previously hidden requirements may appear.

Example:

``` text
Booking Review shows:

Room Price
Tax
Total
```

But the specification never defined tax.

This is a **SPEC GAP**.

Do not allow the designer or coding agent to invent a tax rule.

Use this loop:

``` text
Spec
  ↓
Pencil V1
  ↓
Review
  ↓
Spec Gap?
  ├── Yes → Product/Domain Decision
  │          ↓
  │       Update Docs
  │          ↓
  │       Update UML
  │          ↓
  │       Continue Design
  │
  └── No → Continue Design
```

Once approved:

``` text
Feature Spec: READY FOR DEVELOPMENT
Pencil: APPROVED
```

------------------------------------------------------------------------

# 16. Technical Design

Technical design starts after feature behavior and the relevant design
are sufficiently stable.

Create:

`docs/features/<feature>/technical-design.md`

Recommended sections:

``` md
# Technical Design

## Context

## Relevant Business Rules

## Architecture

## Database Changes

## Server/API Interface

## Domain/Application Logic

## UI Components

## Validation

## Error Handling

## Concurrency / Consistency

## Security

## Testing Strategy

## Implementation Plan

## Risks / Open Questions
```

For booking, the technical flow may become:

``` text
Confirm Booking
      ↓
Server Action / API
      ↓
Validate Input
      ↓
Authenticate User
      ↓
Recheck Availability
      ↓
Calculate Final Price
      ↓
Create Booking Atomically
      ↓
Return Booking
      ↓
Confirmation UI
```

Technical design may introduce architecture decisions that require an
ADR.

------------------------------------------------------------------------

# 17. Architecture Decision Records

Use ADRs only for important decisions with meaningful consequences.

Examples:

``` text
ADR-001 Prevent Double Booking
ADR-002 Store Booking Price Snapshot
ADR-003 Booking Transaction Strategy
```

Recommended ADR structure:

``` md
# ADR-XXX: Decision

## Status

Accepted

## Context

## Decision

## Alternatives Considered

## Consequences
```

Do not create ADRs for trivial package choices.

------------------------------------------------------------------------

# 18. Development Iteration

Avoid asking an AI coding agent to implement a large feature in one
uncontrolled step.

Split work into small, verifiable iterations.

Example:

``` text
Iteration 1 — Data / Domain

[ ] Booking schema
[ ] Booking types
[ ] Availability logic
[ ] Overlap validation
[ ] Unit tests


Iteration 2 — Booking UI

[ ] Date selector
[ ] Guest selector
[ ] Availability states
[ ] Price summary


Iteration 3 — Booking Creation

[ ] Booking review
[ ] Revalidate availability
[ ] Calculate final price
[ ] Create booking
[ ] Error handling


Iteration 4 — Confirmation

[ ] Confirmation screen
[ ] Booking detail
[ ] Integration tests
```

Each iteration should have:

``` text
Plan
  ↓
Implement
  ↓
Test
  ↓
Verify
  ↓
Commit
```

------------------------------------------------------------------------

# 19. AI Coding Agent Contract

The coding agent should treat project documentation as constraints.

Example instruction:

``` text
Implement the selected feature using the project documentation.

Read:
- `docs/constitution.md`
- `docs/coding-rules.md`
- relevant product context
- domain business rules
- feature spec
- feature diagrams
- approved Pencil design
- technical design
- relevant ADRs

Rules:

1. Follow the project constitution and report any conflict.
2. Follow coding rules unless an approved higher-authority document requires otherwise.
3. Do not invent business rules.
4. Do not silently change feature scope.
5. Do not change approved behavior because implementation is easier.
6. Report specification gaps before making product decisions.
7. Keep implementation inside the requested iteration.
8. Add loading, error, empty, and success states when defined.
9. Add tests that map to relevant acceptance criteria.
10. Report deviations from spec or design.
```

------------------------------------------------------------------------

# 20. Verification

A successful build is not enough.

Verification compares implementation against the sources of truth.

## Functional Verification

Check:

``` text
[ ] Constitution compliance checked
[ ] Coding-rules compliance checked
[ ] Feature spec implemented
[ ] Business rules preserved
[ ] Acceptance criteria satisfied
[ ] Error cases handled
[ ] State transitions valid
```

## Technical Verification

Check:

``` text
[ ] Typecheck
[ ] Lint
[ ] Unit tests
[ ] Integration tests
[ ] E2E tests when applicable
[ ] Production build
```

## Visual Verification

Compare:

``` text
Approved Pencil
       ↕
Implementation
```

Review:

-   Layout
-   Typography
-   Spacing
-   Components
-   Responsive behavior
-   Loading state
-   Empty state
-   Error state
-   Success state
-   Disabled state

If implementation differs from design, make the deviation explicit.

Choose one:

``` text
A. Fix implementation to match approved design.

B. Accept the new implementation and update the approved design/spec.
```

Never allow silent design drift.

------------------------------------------------------------------------

# 21. Ship

A typical shipping flow is:

``` text
Feature Complete
      ↓
Verification Passed
      ↓
Code Review
      ↓
Preview / Staging
      ↓
Smoke Test
      ↓
Production
      ↓
Monitor / Feedback
```

Example booking smoke test:

``` text
Search Hotel
→ Open Hotel
→ Select Room
→ Select Dates
→ Select Guests
→ Check Availability
→ Review Booking
→ Confirm Booking
→ Booking Created
→ Confirmation Displayed
```

------------------------------------------------------------------------

# 22. Feedback After Shipping

Production feedback does not go directly into random code changes.

Use:

``` text
Feedback
   ↓
Is behavior changing?
   │
   ├── No → Bug Fix
   │
   └── Yes
         ↓
     Update Product / Domain / Feature Spec
         ↓
     Update UML when behavior changes
         ↓
     Update Pencil when UI changes
         ↓
     Technical Design
         ↓
     Development
         ↓
     Verify
         ↓
     Ship
```

This prevents code from becoming the accidental product specification.

------------------------------------------------------------------------

# 23. Progressive Documentation Rule

Do not bootstrap a project by generating dozens of empty documents.

Start small.

## At Project Start

``` text
docs/
├── README.md
├── constitution.md
├── coding-rules.md
├── product/
│   ├── overview.md
│   ├── scope.md
│   └── user-journeys.md
└── domain/
    └── business-rules.md
```

## When Domain Complexity Appears

Add:

``` text
domain/
├── domain-model.md
└── diagrams/
    └── domain-model.md
```

## When a Feature Is Selected

Add:

``` text
features/
└── booking/
    ├── spec.md
    └── acceptance-criteria.md
```

## When Behavior Needs Modeling

Add only the useful diagrams:

``` text
features/booking/diagrams/
├── activity.md
├── sequence.md
└── state.md
```

## When Design Starts

Add:

``` text
features/booking/design.md
```

## When Development Is Near

Add:

``` text
features/booking/technical-design.md
```

## When Important Architecture Decisions Appear

Add:

``` text
architecture/decisions/
└── ADR-XXX-*.md
```

The documentation grows with the product.

------------------------------------------------------------------------

# 24. Document Status

Feature documents can use a lightweight lifecycle:

``` text
DRAFT
  ↓
IN DISCOVERY
  ↓
READY FOR DESIGN
  ↓
DESIGN IN PROGRESS
  ↓
READY FOR DEVELOPMENT
  ↓
IN DEVELOPMENT
  ↓
IN VERIFICATION
  ↓
IMPLEMENTED
```

Do not use status as bureaucracy. Its purpose is to tell humans and AI
whether a document is stable enough to use as an implementation
contract.

------------------------------------------------------------------------

# 25. Handling Changes

Changes are normal.

The key question is:

> Which source of truth owns the change?

Examples:

### Business rule changes

``` text
Domain
  ↓
Feature Spec
  ↓
UML
  ↓
Pencil if affected
  ↓
Technical Design
  ↓
Code
```

### UI-only changes

``` text
Pencil
  ↓
design.md
  ↓
Code
```

### Technical implementation changes with identical behavior

``` text
Technical Design / ADR
  ↓
Code
```

### Feature behavior changes

``` text
Feature Spec
  ↓
Acceptance Criteria
  ↓
UML
  ↓
Pencil
  ↓
Technical Design
  ↓
Code
```

------------------------------------------------------------------------

# 26. Recommended AI Commands

These do not need to be literal CLI commands. They can be reusable
prompts or agent workflows.

## `/init-project`

Purpose:

``` text
Idea
→ Product Discovery
→ MVP Scope
→ Initial User Journey
→ Domain Discovery
→ Feature Map
→ Tech Stack
```

The AI asks questions and progressively creates documentation.

## `/discover-feature <feature>`

Purpose:

``` text
Feature Discovery
→ Spec
→ Business Rule References
→ Acceptance Criteria
→ Open Questions
```

## `/model-feature <feature>`

Purpose:

``` text
Spec
→ Activity Flow
→ Sequence Diagram
→ State Diagram when useful
```

## `/design-feature <feature>`

Purpose:

``` text
Spec + UML
→ Required Screens
→ Required UI States
→ Pencil Iteration
→ Design Review
```

## `/plan-feature <feature>`

Purpose:

``` text
Approved Spec
+ UML
+ Pencil
+ Stack
→ Technical Design
→ Implementation Iterations
```

## `/build-feature <feature>`

Purpose:

``` text
Technical Design
→ Implement one iteration
→ Test
→ Report deviations
```

## `/verify-feature <feature>`

Purpose:

``` text
Implementation
↔ Spec
↔ Business Rules
↔ UML
↔ Acceptance Criteria
↔ Pencil
```

## `/ship`

Purpose:

``` text
Verification
→ Build
→ Preview
→ Smoke Test
→ Production
```

------------------------------------------------------------------------

# 27. Example: Hotel Booking Feature End-to-End

``` text
Idea
"User should be able to book a hotel room."

        ↓

Product Discovery

"Traveler searches and books a room."

        ↓

Domain Discovery

"No overlapping confirmed bookings."
"Availability must be rechecked at confirmation."
"Final price is calculated server-side."

        ↓

Feature Spec

"Book selected room for selected dates and guests."

        ↓

Acceptance Criteria

"Overlapping booking is rejected."
"Guest count cannot exceed room capacity."

        ↓

Activity Diagram

Select Room
→ Dates
→ Availability
→ Review
→ Confirm
→ Recheck
→ Create Booking

        ↓

Sequence Diagram

Guest
→ UI
→ Booking Service
→ Repository
→ Database

        ↓

Pencil

Room Detail
→ Booking Review
→ Confirmation

        ↓

Design Review

Find missing pricing/tax rule?
→ Return to discovery if needed.

        ↓

Technical Design

Server validation
→ availability transaction
→ price calculation
→ booking insert

        ↓

Development Iterations

Domain
→ UI
→ Booking creation
→ Confirmation

        ↓

Verification

Spec ✓
Business Rules ✓
Acceptance Criteria ✓
UML ✓
Pencil ✓
Tests ✓

        ↓

Ship
```

------------------------------------------------------------------------

# 28. Core Principles

### 1. Constitution Is the Project Guardrail

Agents and implementations must not silently violate non-negotiable project principles.

### 12. Coding Rules Make Implementation Predictable

Project-wide coding conventions belong in one reusable source rather than repeated prompts.

### 11. Conversation First, Documentation Second

Documentation records decisions discovered through discussion. It is not
a questionnaire that must be completed before useful work begins.

### 2. Progressive Specification

Specify only enough to safely move to the next stage.

### 3. Business Rules Are Above Implementation

Technology must implement domain rules, not redefine them.

### 4. UML Exists to Reduce Ambiguity

Do not create diagrams that provide no additional clarity.

### 5. Pencil Owns Visual Truth

Avoid maintaining duplicate pixel-level design descriptions in Markdown.

### 7. Code Is Not the Product Specification

Code is an implementation of documented behavior.

### 8. AI Must Surface Gaps, Not Invent Decisions

When a requirement is ambiguous, the agent should report a spec gap.

### 9. Small Development Iterations

Prefer small vertical or verifiable slices over one large AI generation.

### 10. Verification Is Multi-Dimensional

Correctness includes behavior, domain rules, tests, and visual fidelity.

### 11. Keep Artifacts Synchronized

When a decision changes, update the artifacts downstream from that
decision.

------------------------------------------------------------------------

# 29. Definition of Ready

A feature is generally ready for development when:

``` text
[ ] Constitution and coding rules are available
[ ] Goal is clear
[ ] Scope is clear
[ ] Relevant business rules are known
[ ] Acceptance criteria exist
[ ] Critical flow is modeled
[ ] Important states are known
[ ] Pencil design is approved
[ ] Major spec gaps are resolved
[ ] Technical design is sufficient for implementation
```

Not every feature needs extensive documentation. The amount should be
proportional to risk and complexity.

------------------------------------------------------------------------

# 30. Definition of Done

A feature is done when:

``` text
[ ] Constitution compliance verified
[ ] Coding-rules compliance verified
[ ] Implementation matches feature spec
[ ] Business rules are preserved
[ ] Acceptance criteria pass
[ ] Relevant automated tests pass
[ ] Error/loading/empty/success states are handled
[ ] Implementation matches approved Pencil design
[ ] Deviations are resolved or documented
[ ] Technical checks pass
[ ] Smoke test passes
[ ] Documentation reflects the shipped behavior
```

------------------------------------------------------------------------

# 31. Final Workflow

The complete workflow can be summarized as:

``` text
DISCOVER
Product → Domain → Feature

        ↓

GUARD
Constitution + Coding Rules

        ↓

DECIDE
Tech Stack + Architecture Principles

        ↓

SPECIFY
Feature Spec + Acceptance Criteria

        ↓

MODEL
Activity + Sequence + State when needed

        ↓

DESIGN
Pencil → Review → Iterate

        ↓

PLAN
Technical Design + Development Iterations

        ↓

BUILD
Small Iteration → Test → Verify

        ↓

VERIFY
Spec + Domain + UML + Pencil + Tests

        ↓

SHIP
Preview → Smoke Test → Production

        ↓

LEARN
Feedback → Update the correct source of truth
```

The goal is not maximum documentation.

The goal is **minimum documentation required to let humans and AI move
quickly without losing product intent, domain correctness, design
consistency, or implementation control.**
