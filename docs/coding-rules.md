# Coding Rules

Version: 2.0 · Adopted: 2026-09-25 · Revised: 2026-09-26. v2.0 merges the Owner's coding standard from the earlier shutrly repo, adapted to this architecture ([architecture/overview.md](architecture/overview.md)) and stack ([architecture/tech-stack.md](architecture/tech-stack.md)).

These are conventions. You may break one with a written reason in a code comment or the commit message. The exception is anything marked **(lint)**: the quality gate enforces it and blocks the commit. The [constitution](constitution.md) has no exceptions.

## Tooling

| Tool | Role |
|---|---|
| ESLint 9 flat config: `eslint-config-next` + `typescript-eslint` `strictTypeChecked` | Linting with type information |
| Prettier (`printWidth: 100`) | Formatting. `pnpm lint` runs `prettier --check` first, so unformatted source is an error. Fix it with `pnpm format`. |
| `eslint-plugin-boundaries` | Import boundaries from [Structure and boundaries](#structure-and-boundaries), including one feature importing another |
| `eslint-plugin-simple-import-sort` | Import groups and order |
| `eslint-plugin-sonarjs` (`recommended`, **error**) | Code smells and duplication; cognitive complexity **15** per function |
| ESLint core `max-lines-per-function` | **50** lines per function, not counting comments or blank lines. Test files are exempt. |
| ESLint core `max-len` | 100 columns. Strings, template literals, URLs, regexes and comments are exempt. |
| `@eslint-community/eslint-plugin-eslint-comments` | Every `eslint-disable` needs a `-- reason`. Disabling `sonarjs/*` is forbidden. |
| Local rules in `eslint/local-rules.mjs` | `local/require-server-only` and `local/ui-copy` (see below) |
| `clsx` + `tailwind-merge` | `cn()` in `src/ui/cn/cn.ts` for conditional classes and Tailwind conflicts |
| `simple-git-hooks` + `lint-staged` | Pre-commit hook: runs Prettier and ESLint `--fix` on staged files |

If a SonarJS rule is wrong for this project, turn it off in `eslint.config.mjs`, either for the whole workspace or for a file glob such as tests. Put the reason in a comment beside it and in this file. Never turn it off case by case with a comment **(lint)**.

Turned off for test files only (`TESTS` glob in `eslint.config.mjs`): `sonarjs/no-hardcoded-passwords` and `sonarjs/no-hardcoded-ip`. Tests use fixed non-production credentials and private-range IPs, which are not secrets.

## General
- Explicit, readable code; small focused units.
- No premature abstractions or unrelated refactors (C-010).
- No dead code or commented-out blocks. **(lint)** No `TODO`/`FIXME` comments (`sonarjs/todo-tag`): record follow-ups in the feature's docs under its ID.
- Rule values (limits, quotas, durations, expiries) come from configuration or a named constant tied to its `BR-*`, never an inline literal.

## Structure and boundaries

### Folders
The folder architecture is set by [architecture/overview.md](architecture/overview.md) and the [folder-architecture design](superpowers/specs/2026-09-26-project-folder-architecture-design.md). These rules follow it and never add folder conventions of their own. In summary:
- The dependency direction is `app/` → `composition/` → `features/*/application` → `features/*/domain`.
- `features/<f>/application` owns use cases, policies, DTOs, runtime schemas and ports. `adapters/` implements those ports, and `composition/` is the only place that wires them together.
- Reusable visual primitives and patterns live in `ui/`, and code genuinely used across features lives in `shared/`. A feature-specific helper stays inside its feature.

### Import boundaries (lint, `eslint-plugin-boundaries`)

| From | May import |
|---|---|
| `features/<f>/domain` | its own `domain`, `shared` |
| `features/<f>/application` | its own `domain` and `application`, `shared` |
| `features/<f>/ui` | its own `domain`, `application` and `ui`, plus `src/ui`, `shared` |
| `composition` | `features/*/application`, `features/*/domain`, `adapters`, `composition`, `shared` |
| `adapters/<x>` | the same `adapters/<x>`, `features/*/application` (ports) and `features/*/domain` (types), `shared` |
| `app` | `app`, `composition`, `features/*/ui`, `features/*/application` (runtime schemas and types only), `src/ui`, `shared` |
| `ui` | `ui`, `shared` |
| `shared` | `shared` |

`app/` and feature `ui/` may import a feature's `application` layer only for its runtime schemas and types (`*.schema.ts`, `*.types.ts`), e.g. so a form and its server action share one schema. Behaviour is always reached through `composition/`. Any other application module starts with `import "server-only"`, so pulling one into client code fails the build.

Additional import restrictions:
- A feature never imports another feature. Cross-feature needs go through `shared/` or `composition/`.
- An adapter never imports another adapter.
- `features/*/domain` imports no framework or vendor packages: no `react`, `next`, `drizzle-orm`, `@neondatabase/*`, `better-auth`, `@opennextjs/*` or `resend`.
- Only `src/ui/**` may import `react-aria-components` (ADR-010).
- Only `adapters/` may import vendor backend SDKs (`drizzle-orm`, `@neondatabase/*`, `better-auth`, `resend`). The one exception is that `composition/` may import `@opennextjs/cloudflare` for the request context.

### Security-relevant rules
- **(lint)** `process.env` is forbidden in `src/**`. Runtime configuration reaches code only as the `AppEnv` from `getRequestContext()`, which comes from Worker bindings. Tooling outside `src/` (drizzle config, test helpers) may read `process.env`.
- DB connections come only from `adapters/db/client/client.ts`: one Neon `Pool` per request, closed via `waitUntil(pool.end())` after the work, never a module-level pool (ADR-009). A unit test enforces this.
- The Drizzle schema in `adapters/db/schema` is the database source of truth.

### Next.js
- **(lint)** Every non-test module in `src/adapters/**`, `src/composition/**` and `src/features/*/application/**` starts with `import "server-only";`. The exceptions are `*.schema.ts` and `*.types.ts`, which forms may import, and the Drizzle schema folder `src/adapters/db/schema/**`, which drizzle-kit loads outside Next. Rule: `local/require-server-only`. Vitest aliases `server-only` to an empty module.
- Server actions and route handlers are thin: parse the input, call the composition entry point, map the result. Auth, business rules and DB access live behind ports.
- `app/` holds only routes, pages, layouts, server actions and route handlers, and each one stays thin: load, render, map the result. A route file's own `.types.ts` / `.copy.ts` may sit beside it (e.g. `error.copy.ts`); Next only treats the reserved file names as routes.
- Where UI goes:
  - a feature's screens and components → `features/<f>/ui/<unit>/`;
  - a reusable visual primitive or pattern → `src/ui/primitives/<unit>/` or `src/ui/patterns/<unit>/`.
- Route groups separate audiences (owner vs public client) and may have their own root layout.

### Files
- Every meaningful unit gets its own folder with its implementation and a co-located TDD test. Add `.types.ts`, `.schema.ts` and, for UI with user-facing text, `.copy.ts` beside it when applicable. The folder is named for the unit; the file inside may add a vendor prefix (`adapters/email/auth-email-sender/resend-auth-email-sender.ts`).
- No nested `index.ts` barrels: import each file explicitly. The one exception is the Drizzle schema barrel `src/adapters/db/schema/index.ts`, which Drizzle needs as a single schema object.
- About 300 SLOC in one file (not counting comments or blank lines) suggests it holds two responsibilities. This is guidance, not linted. Data-heavy files (seeds, fixtures, column lists) may exceed it; say why in a comment at the top of the file.
- One use case per unit folder: `features/<f>/application/use-cases/<verb-noun>/<verb-noun>.ts`. The exception is a per-consumer aggregate, such as one route loader that loads data that depends on itself.

### Where types and schemas live
- Exported types go in a sibling `x.types.ts`, which contains only `type`/`interface` declarations. Internal (non-exported) types stay in their file. The exception is a port file (`application/ports/<name>/<name>.port.ts`): it may declare and export its port interface together with the contract types that go with it.
- **(lint)** Component and route implementations (`src/**/*.tsx`) and use cases (`features/*/application/use-cases/**`) declare no `type`, `interface` or `*Schema`. `x.types.ts` must hold only type declarations, and `x.schema.ts` only runtime schemas named `*Schema`. Test files are exempt.
- A boundary with a schema, types and an implementation is split into three files: `x.ts`, `x.schema.ts` and `x.types.ts`.
- Type the result of `z.infer` in `x.types.ts`, never in `x.schema.ts`.
- A schema of five lines or fewer that no other file uses may stay inline, but not in the files covered by the lint rule above.
- In `src/`, inline object type literals in parameters or return types are not allowed; extract a named interface. The exceptions are a single primitive parameter and framework props helpers (`PropsWithChildren`, `LayoutProps<"/">`, `PageProps<…>`). Tests and test helpers are exempt.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files and folders | `kebab-case`, including component files | `register-form.tsx` contains `RegisterForm` |
| React components | `PascalCase` | `RegisterForm` |
| Types and interfaces | `PascalCase` | `WorkspaceContext` |
| Functions and variables | `camelCase`; use cases are verbs | `createProjectFromService`, `submitSelectionGroup`, `approveAddOn` |
| Module constants | `UPPER_SNAKE_CASE` | `MAX_SELECTION` |
| Enum-like values | `UPPER_SNAKE_CASE`, matching the business rules | `'DRAFT'`, `'SUBMITTED'` |
| DB tables and columns | `snake_case`, singular tables | `project_item`, `workspace_id` |
| Ports | interface with suffix `Port`, in `features/<f>/application/ports/<name>/<name>.port.ts` | `ProjectRepositoryPort` in `ports/project-repository/project-repository.port.ts` |
| Adapters | `adapters/<infra>/<unit>/`, the file named for the vendor | `adapters/email/auth-email-sender/resend-auth-email-sender.ts` |
| Zod schemas | suffix `Schema` | `registerOwnerSchema` |
| URL path segments (route folders) | English `kebab-case`, even where the page's copy is Indonesian (Owner 2026-10-07) | `/g/[token]/photos`, `…/picks/[groupId]/review` |
| UI copy | `*.copy.ts` sibling, `UPPER_SNAKE_CASE` or `camelCase` object `as const` | `REGISTER_FORM_COPY` |

- Use glossary terms ([domain/glossary.md](domain/glossary.md)): `Workspace`, `Project`, `SelectionGroup`, `ProjectAddOn`, not synonyms.
- All identifiers are English, even where the UI copy is Indonesian.

## TypeScript
- `strict: true`. **(lint)** No `any`: use `unknown`, then narrow it.
- **(lint)** No TS `enum`; use union literals, or checked strings in the DB.
- **(lint)** No type assertions (`as X`) in `src/`. `as const` is allowed. If an assertion is unavoidable, use `// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- <why it is safe>`. Tests may assert for mocks.
- **(lint)** No non-null `!` without an `eslint-disable … -- <guarantee>` comment.
- Derive types rather than restating them: `z.infer<typeof schema>`, and Drizzle's `$inferSelect`/`$inferInsert`.
- Brand IDs (`WorkspaceId`, `ProjectId`, `AuthUserId`) so they can't be mixed. Prefer Zod `.brand<"X">()`, which brands without an assertion.
- Use discriminated unions for package values (`{type:'NUMBER', value}` | `{type:'RANGE', min, max}`) and statuses.
- Money uses a decimal type, never JS `number` arithmetic (ADR-007).

## Functions and comments
- **(lint)** No inline arrow functions as JSX props. Name the handler: `const handleRemove = () => remove(id);` then `onPress={handleRemove}`. For lists, make each row its own component.
- No anonymous function with a block body. A single-expression arrow is fine (`items.map((i) => i.id)`); a block body gets a name, so it can be read and tested. Exceptions: React hook callbacks (`useEffect`, `useMemo`, …) and test-framework callbacks (`describe`, `it`, `beforeEach`, `vi.mock`).
- Exported functions, and every domain or use-case function, get JSDoc: one *specific* sentence, then `@param` and `@returns`. Route entry points (`page`, `layout`, `error`, route handlers) and single-expression arrows are exempt.
- Inline comments explain **why**, never what. Write them in English.

## Validation
- Zod schemas at every trust boundary: form input, server actions, route handlers, JSONB reads/writes, Drive API responses. Never a pass-through schema.
- Client validation is UX only; the server re-validates everything (C-004).
- Forms use React Hook Form with `zodResolver`, and the form and the server action share one schema:
  - UI-only schemas live beside the form.
  - Canonical business-input schemas live beside their feature use case (`x.schema.ts`), and both the form and the server action import them. Never duplicate them.
- React Aria inputs bind through `Controller` inside the `src/ui` wrappers. Server-action field errors are applied with `setError`; domain errors are shown as form-level messages.

## Data Access
- All DB access goes through feature application use cases and ports; never from components, route files or domain code.
- Every owner query takes a verified `WorkspaceContext` and filters by `workspaceId` (C-101). A repository function without workspace scope must be named `*Unscoped` and justified (e.g. client-token resolution).
- Read by a unique key **together with** `workspace_id`. A missing row is a `NotFoundError`, never a silent fallback. Don't query non-unique field combinations whose result depends on row order.
- Multi-row invariants run in a single transaction; use `SELECT … FOR UPDATE` on the aggregate row (selection group, invoice) where concurrent writes are possible.
- Select only needed columns for client-facing responses; never return `passwordHash`, tokens of other projects, source URLs, or API keys.
- Migrations are generated by Drizzle, reviewed, and committed; never edit an applied migration.

## Pure domain + orchestration
Keep heavily tested logic (selection limits, invoice totals, lifecycle transitions) in pure functions in `features/*/domain`:
- no I/O, no Drizzle, no framework;
- data in, data out;
- dozens of scenarios run in milliseconds, without a DB.

`features/*/application` orchestrates each use case:
- It loads data through ports, builds the domain input, calls the domain function, and persists the result inside the workspace scope.
- It receives `WorkspaceContext` and the actor ID as parameters. Domain code never reads the session.

`composition/` only wires ports to adapters. It holds no business rules.

## Errors and Logging
- Expected failures are typed domain errors (`class SelectionLimitExceededError extends DomainError`) carrying a stable `code`; never throw a bare `Error` for an expected case. Map them to user messages at the edge.
- **One operation fails → throw.** When checking many items (an import, bulk validation), collect every problem and return `{ valid, problems }`, rather than stopping at the first.
- A violated hard invariant is a bug, not a recoverable error: assert it at the state transition.
- Never swallow unexpected errors; log with request ID, workspace ID, project ID.
- Redaction: never log passwords, tokens, cookies, WhatsApp URLs, Drive URLs, API keys, client phone/email (C-103).

## UI / Components

### React
- Function components only. Type props explicitly as `Readonly<XProps>` (**(lint)** SonarJS `prefer-read-only-props`); don't use `React.FC`.
- **(lint)** Declare callback props as properties (`onChange: (value: string) => void`), not methods, so destructuring them passes `unbound-method`.
- Use `export default` only where Next.js requires it (route files); everywhere else, use named exports.
- Business logic stays out of components. A component with many branches hides a pure function; extract and test it.
- A custom hook lives in its own file, never inside a component or route file. A component with more than five `useState` calls is a smell: extract a hook.
- Keep `"use client"` boundaries as small as practical; default to server components.

### State
- Server data comes from React Server Components and server actions. Fetch on the client only when interactivity needs it.
- Local UI state uses `useState` or `useReducer`. Server data is never copied into client state. A client store library isn't in the stack: add one to tech-stack.md first if a feature needs one.

### Styling and React Aria
- Tailwind CSS v4 is CSS-first (`@import "tailwindcss"`) and has no `tailwind.config.*`.
- `src/ui/theme/tokens.css` is generated from `docs/design-system/tokens.json` by `pnpm tokens:css`. Never edit it by hand; `pnpm tokens:check` fails on drift.
- Colours, spacing, radii, type sizes and opacity come only from token variables (`var(--…)` or Tailwind `(--…)` utilities).
  - Primitives use semantic or component tokens.
  - A new raw value needs a token change first.
  - No hex literals in `src/ui` or `src/app`, and no hard-coded brand colours (workspace branding overrides tokens).
- Merge `className` with `cn()`; never `[…].join(" ")` for Tailwind classes.
- Behaviour and accessibility come from `react-aria-components`, wrapped in `src/ui/primitives/*` and `src/ui/patterns/*` (ADR-010).
  - Features never hand-roll dialogs, menus, selects or grids.
  - React Aria's default styles are never a visual source.
  - Style states through React Aria `data-*` attributes.
- The pointer cursor on an enabled control (buttons, menu items, tabs, options, switches, radios, checkboxes) comes from one base rule in `src/app/globals.css`, because Tailwind v4 resets buttons to the default cursor. Don't add `cursor-pointer` per component; a component that needs another cursor sets it with a utility, which wins. A new kind of pressable element must have a matching `role` or be a `button`.
- Focus rings use `color.semantic.focus.ring` (+ `focus.glow`). Modals and toasts render only through the App Shell's overlay slot (F-02).
- Pixel/visual truth is the approved Pencil design referenced in the feature's `design.md`.
- UI is built from **HTML exports** of the approved frames (Owner, 2026-09-27):
  - Before implementing a screen, ask the Owner to export its frames to `docs/features/<slug>/exports/`. Stop if an export is missing.
  - Follow the export's structure, copy and spacing, and map every raw value to a token. A value with no token is a `DESIGN TOKEN GAP`: report it and never hard-code it.
  - Compare the finished screen with its export at the desktop and mobile widths.

### Copy
- **(lint)** User-facing copy is never inline in JSX. JSX text and copy props (`label`, `description`, `errorMessage`, `placeholder`, `title`, `alt`, `aria-label`, `message`) take a constant from a sibling `*.copy.ts`. Copy not drawn in Pencil carries `// not in Pencil`. Rule: `local/ui-copy`, applied to `src/**/*.tsx` except tests.
- Copy follows the workspace language. The MVP UI language is Indonesian (Owner decision, auth CONFLICT-1, 2026-09-27). Frames drawn in another language are translated in `*.copy.ts` and in Pencil before export. Exception: the public landing page (F-19) is English (Owner, 2026-10-07); it is pre-signup marketing, not workspace UI.

## UI States
Cover idle, loading, empty, success, validation error, domain/server error, retry, and disabled states where applicable (C-007).

## Security
- No hard-coded secrets; read from environment/secret bindings.
- Public endpoints (`/g/*`, `/i/*`, media proxy): rate-limited, `Cache-Control: private, no-store`, token + status + expiry checked on every request.
- Hash gallery passwords with a slow password hash (Argon2id or scrypt, whichever runs on the selected runtime).
- Generate tokens with a CSPRNG, ≥128 bits of entropy, URL-safe encoding.

## Easy to break without noticing
- Rule numbers written as literals (quota, deposit, duration, expiry).
- A query without `workspaceId`.
- Drizzle or a vendor SDK imported into `features/*/domain`.
- `process.env` or a secret read inside `src/`.
- A material action (send, approve, charge) triggered by opening a screen or drawer. It must always be an explicit action with an audit record.

## Testing
- Unit tests sit beside the unit they test (`x.ts` ↔ `x.test.ts`). Integration tests go in `tests/integration/` and E2E in `tests/e2e/`.
- Test names describe **behaviour**, in English, prefixed with the `AC-*`/`BR-*` IDs they cover.
- Every hard invariant should have one test that deliberately tries to break it and expects the failure.
- Unit-test domain logic; `features/*/domain` tests never touch the DB. If one needs a DB, the logic is in the wrong layer.
- Integration-test use cases against real Postgres, including cross-workspace isolation and concurrency (selection submit, payment record).
- The integration database is shared (ADR-009): every test seeds its own workspace/user with unique IDs, asserts only on its own data, and never truncates or deletes other data. Never point tests at production.
- E2E-test critical journeys J-01, J-04, J-06, J-07.
- Test behavior, not implementation details.

## Language

| What | Language |
|---|---|
| Project docs (`docs/`) | English |
| Code, identifiers, DB names, comments, JSDoc, commit messages, developer error messages | English |
| UI copy | Indonesian (MVP; auth CONFLICT-1 resolved 2026-09-27); lives in `*.copy.ts` |

## Git
- [Conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `test:`; a scope is optional, e.g. `feat(auth):`), in English, lowercase, with no trailing period.
- One commit is one complete change; a commit that breaks the build isn't complete. Small commits per iteration.
- Docs change in the same commit as the behavior they describe (C-011).

## Quality Gate
An iteration is complete only when:
- typecheck, lint (including format and token checks), and relevant tests pass; build passes
- migrations reviewed
- constitution and coding-rules compliance checked
- acceptance criteria verified and mapped to tests
- deviations / `SPEC GAP`s reported

## Not adopted from the source standard
These parts of the earlier repo's standard were not adopted, and the reasons are recorded here so they aren't re-added by accident:
- **Top-level `src/domain/<module>` layout:** this project uses `src/features/<f>/{domain,application,ui}` (architecture overview).
- **Folder conventions from the old repo:** route-private `_components/` / `_lib/`, flat `<verb>-<noun>.ts` use-case files, the `*-port.ts` / `*-adapter.ts` suffixes, and orchestration inside `composition/`. The folder architecture already covers each of these: feature UI in `features/<f>/ui`, use cases and ports in unit folders under `application/`, vendor-named adapter files, and a `composition/` that only wires.
- **`scripts/verify.py`:** its checks became ESLint rules (`process.env`, `server-only`, boundaries), the `new Pool(` unit test, and the `WorkspaceContext` type plus isolation integration tests.
- **`eslint-plugin-project-structure`:** file composition is enforced with core `no-restricted-syntax`, so no extra plugin is needed.
- **Zustand:** not in the tech stack (see State).
- **A living `/design-system` route:** no feature has specified it. Propose it through the design-system workflow if it's wanted.
- **Indonesian narrative docs:** this repo's docs are English.
