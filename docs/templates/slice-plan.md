# Slice plan template (vertical slices by screen)

Use this template to write `docs/features/<slug>/plan.md` (or `plan-2.md` beside a layered plan) as **vertical slices by screen**. Each slice delivers one screen end to end and can be tried in the browser when it is done.

**Goal of the template:** a model that has never seen the conversation can build the whole feature in one session, without guessing and without revisions. Everything it would otherwise have to invent (types, SQL, copy, file paths, the pattern to copy, what each state shows) is written in the plan.

**Worked example:** [features/projects/plan-2.md](../features/projects/plan-2.md) (F-07 Projects).

**Before writing the plan, these must exist and be approved:**
- `spec.md` and `acceptance-criteria.md`, with stable `AC-<AREA>-NNN` IDs;
- `design.md` with the Pencil frames, and `exports/` with **one frame per HTML file** (frames at least 40 px apart on the canvas, or exports leak into each other);
- `technical-design.md` with numbered decisions (D-1…D-n) and the AC → test map.

**How to use it:**
- Copy everything below the line into the feature folder and replace each `{placeholder}`.
- Delete a section only when it has nothing to say for this feature. Never leave a placeholder or an empty table.
- Text in `> Guidance:` blocks is for the plan author. Delete it from the finished plan.

---

# F-{nn} {Feature name} — Implementation Plan (vertical slices by screen)

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. In this repo, `/sdv:build-feature {slug} <slice>` runs one slice; each **step** inside it is one commit.

**Goal:** {one sentence: who does what}.
- **{Screen A}:** {what it does}.
- **{Screen B}:** {what it does}.

**Approach:** each slice delivers one screen end to end:
- domain → application → repository → action → UI → tests;
- it can be tried in the browser when it is done;
- it produces the data the next slice shows.

The slice order is {Screen A} → {Screen B} → … Each step inside a slice is one commit.

> Guidance: start with the screen that **creates** the data. Later screens (detail, list) then have real data to show. Put all tables in Slice 1 (one migration) unless a table is clearly independent.

**Architecture:**
- {bounded context and folders, e.g. `src/features/<context>/{domain,application,ui}`}.
- {tables and ports, and the migration number}.
- {the concurrency / consistency rule from the technical design, with its D-number}.
- Composition verifies the workspace and wires the routes and actions.

**Tech Stack:** {copy from `docs/architecture/tech-stack.md`, only what this feature uses}.

**Sources:**
- design: [design.md](design.md) and `exports/*.html` ({n} frames, one per file);
- technical design: [technical-design.md](technical-design.md) (D-1…D-{n}, the AC → test map);
- spec: [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md) (AC-{AREA}-001…{nnn});
- component specs in `docs/design-system/components/`.

**Base:** {earlier features that must be built and merged first, and the exact units this plan uses from them by name: tables, migrations, ports, use cases, components, helpers}. If a base feature is only planned, say so; Slice 0 checks it.

## Global Constraints

Every step's requirements implicitly include this section.

- **Reuse first.** Before building any UI unit, the agent:
  1. searches `src/ui/primitives`, `src/ui/patterns`, `src/features/<context>/ui` and the Storybook stories;
  2. lists in the step what it found;
  3. uses the existing unit, or extends it with an additive prop.

  The agent creates a new unit only when nothing fits, and says why in the commit message. The same applies to domain helpers: {list the existing helpers by name}.
- **Boundaries (lint):** {which imports are allowed and which are not}.
- **Rule values (named constants, never literals):**

  | Constant | Value | Rule |
  |---|---|---|
  | `{NAME}` | {value} | {BR / AC / D id} |

- **Money / dates / time zone:** {format and type rules, with the ADR, e.g. whole IDR strings; *Rp 750.000* with a space}.
- **Secrets and logging:** {what is never selected, returned, logged or rendered; the exact log event name and its allowed keys}.
- **Copy:** from the frames and design.md › Copy, in `{slug}-copy`. Strings not drawn carry `// not in Pencil`.
- **Copy differs by breakpoint** where the exports differ. Keep both variants (`…Desktop` / `…Mobile`):

  | Key | Desktop | Phone |
  |---|---|---|
  | `{key}` | {text} | {text} |

- **Date display:** {which surface shows which format, taken from the exports}.
- **UI steps:**
  - build from the slice's exports, and stop if one is missing;
  - map every raw value to a token; a value with no token is a DESIGN TOKEN GAP: report it and never hard-code it;
  - compare the screen with its exports at 1440 and 390 and record the deviations.
- **Migration:** Slice 1 generates `{nnnn}` with drizzle-kit, reviews it, commits it, then runs `pnpm db:migrate` against the non-production database from `.dev.vars` (AGENTS.md). Report the run.
- **Tests:** names start with the `AC-*` / `BR-*` IDs they cover. Domain tests never touch the DB. Integration tests seed their own workspace.
- **Quality gate per step:**
  - `pnpm typecheck`, `pnpm lint` and `pnpm test` pass;
  - steps that touch the repository add `pnpm test:integration`;
  - the slice's last step adds `pnpm build`, and from the first slice with E2E specs on, those specs.
- **Commits:** one per step; conventional, lowercase, English, with the attribution line.
- **Code in this plan:** written out for rules only (statuses, menus, validation, schema, SQL shape, tokens). UI steps point to their exports and name the behaviour to test. They don't paste JSX.

## File Structure

> Guidance: list every file to create or change, grouped by layer, with one line on its job. Each slice then lists the subset it creates. If a layered plan already has this list, link to it instead.

## Screens

{Feature} has {n} pages plus the overlays that open on them. Each overlay belongs to the page it opens on. Every state is one export per device (`exports/<state>-<desktop|mobile>-<id>.html`).

| # | Screen | Route / where it opens | Layout | States (exports) | Built in |
|---|---|---|---|---|---|
| S1 | **{Page}** | `{route}` | Desktop: {shell, header, column}. Phone: {shell, bars} | `{export}`, … | Slice [n](#slice-n-…) |
| S1a | {Overlay} | S1 › {trigger} ({Modal size / Bottom Sheet type}) | | `{export}`, … | Slice [n](#slice-n-…) |

**Navigation between screens:**
- **Shell:** {entry points} → S{n}.
- **S1:** {action} → S{n}.
- **S2:** {action} → S{n} with a toast.

**Not a screen of its own:** {boards or frames in the `.pen` that are not built or exported, and why}.

> Guidance: every export file must appear in exactly one slice's state table. Check it with a script before committing (see *Checks before committing the plan*).

## How to run this plan in one session

- **Before the first slice:**
  - read this file whole, then [technical-design.md](technical-design.md) › Decisions, [design.md](design.md) › Frames and Copy, and `docs/coding-rules.md`;
  - use the spec and AC only to look up a rule ID.
- **For each step, in this order:**
  1. **Precondition:** open every export the step names, `exports/<name>.html`. If one is missing, STOP and ask.
  2. **Reuse check:** look the unit up in `component-inventory.md` (Slice 0).
  3. **Failing tests:** write the tests the step lists, using the names, paths and copy given here, and run them; they must fail.
  4. **Implement:** follow *Existing code to follow* below, which names the file to copy each pattern from.
  5. **Gate:** run the step's gate.
  6. **Commit:** use the step's commit message.
- **Never invent copy:**
  - every user-facing string is in this plan, in design.md › Copy, or in an export;
  - anything not drawn is marked `// not in Pencil` here, so use it as written;
  - if a string is in none of these places, STOP and report a `SPEC GAP`.
- **Never change a higher-authority document to make a step pass.** That means the constitution, business rules, ADRs, coding rules, spec and AC. Report the conflict instead.
- **On failure:** if the gate fails for a reason outside the step (for example a shared service is down), record it in the step's report and continue only with work that doesn't need that check.

## Existing code to follow

Copy these patterns instead of inventing new ones. The paths exist on `{branch}` today{, except the {base feature} ones, which exist after Slice 0}.

| Need | Follow | Notes |
|---|---|---|
| Server actions | `{path}` | {the exact shape: directive, revalidate call, return value} |
| Composition flow | `{path}` | {workspace verification, actor, ID parsing} |
| Repository + transactions | `{path}` | {transaction and DB error helpers} |
| Tenant schema helpers | `{path}` | {helper names} |
| Sub-page heading | `{path}` | {component and what it can set} |
| Page actions | `{path}` | {component} |
| Toast after a client action | `{path}` | {function and its arguments} |
| Toast after a redirect | `{path}` | {query parameter + component} |
| Desktop vs phone tree | `{path}` | {hook} |
| Fakes for use-case tests | `{path}` | {shape} |
| Integration seeding | `{path}` | {helper names} |
| E2E setup + axe | `{path}` | {helper names} |

> Guidance: open each file before listing it. Write what the code does **today**, including its limits (for example "takes `actions`, but the shell doesn't pass any"). These limits become *extend* rows in Slice 0 and additive steps in later slices.

## Shared contracts

Each slice creates the types it needs, with exactly these shapes. Exported types go in sibling `.types.ts` files (coding rules). {ID, date, time and money conventions.}

```ts
// {path}/{unit}.types.ts (Slice {n})
export type {Status} = "{A}" | "{B}";

// {path}/{port}.port.ts (Slice {n}; grows in {n}, {n})
export interface {Record} {
  readonly id: string;
  // …
}

// {path}/{results}.types.ts (Slice {n}; codes grow per slice)
export type {FieldErrorKey} = "EMPTY" | "TOO_LONG" | …;
export type {DomainCode} = "NOT_FOUND" | …;
export type {Failure} =
  | { readonly ok: false; readonly code: "VALIDATION"; readonly fieldErrors: Readonly<Record<string, {FieldErrorKey}>> }
  | { readonly ok: false; readonly code: {DomainCode} };
```

**Field error copy** (`{path}`, `{fn}(path, key)`):

| Path | Key | Copy |
|---|---|---|
| `{field}` | `{KEY}` | *{copy}* {`// not in Pencil` when not drawn} |

**{Status} labels and tones:**

| Status | Label | Tone | Notes |
|---|---|---|---|
| `{A}` | *{label}* | `{tone}` | |

**{Action} buttons** (when the feature has state-changing actions):

| Action | Label | Pending label | Icon | Toast (title / body) |
|---|---|---|---|---|
| `{ACTION}` | *{label}* | *{label}…* | `{lucide-name}` | *{title}* / *{body}* |

## Test fixtures

`{tests/support/<context>/<slug>-fixtures.ts}` (Slice 1) builds the AC shared fixture on the fakes. Integration tests build the same data with Drizzle inserts. Use these exact values everywhere:
- **{Entity}:** {names, states, values};
- **{Entity}:** …;
- **{Scenario} ({AC id})**, with `today = "{YYYY-MM-DD}"`: {rows and the expected order}.

## AC index

| AC | Slice.step |
|---|---|
| {001, 002} | {1.1, 1.3} |

> Guidance: every AC in `acceptance-criteria.md` appears here at least once. An AC that is only verified manually still points to the step that records it.

## Slice template

Every slice below has the same parts:
1. **Screen overview:** the screens, the route, the ACs, what is out of scope, then one row per state with both export IDs and what the export shows.
2. **Backend:** each file to create or change, with its signature.
3. **Rule code:** written out where a rule could be read two ways.
4. **Components:** shared units (reuse check first) and feature units with their props.
5. **Steps:** one commit each, test-first, naming the test files.
6. **Done check:** what must work in the browser, and the gate.

---

## Slice 0: Check the base

Screens: none. This slice checks the base and inventories the components.

- [ ] **0.1 Check that {base feature} is in this branch.** All of these must hold:
  - `{file}` exists;
  - `{file}` exports `{name}`;
  - `pnpm typecheck && pnpm lint && pnpm test` pass.

  If any is missing, **STOP** and report: *{base feature} must be built and merged into `{branch}` first.* Change nothing.
- [ ] **0.2 Sync.** If `main` moved, use the ccd_host `sync_with_base_branch` tool (or `git merge main` outside an app worktree). Keep both features' text in `docs/HANDOFF.md` and `docs/product/feature-map.md`. Commit the merge if there was one.
- [ ] **0.3 Component inventory.** Write `docs/features/{slug}/component-inventory.md` with the columns *Component · Spec · Status (exists / extend / new) · Path · Needed change · First used in*.
  - **Fill each row by reading the code, not by memory:** open the file, and for *extend* name the exact prop to add.
  - **Rows, at least:** {every component the exports use}.
  - **Expected results** (confirm them): {the limits found while writing *Existing code to follow*}.
  - Commit `docs({slug}): inventory reusable components for f-{nn}`.

**Done check:** the gate passes on the synced branch, and the inventory is committed with no empty cells.

---

## Slice {n}: {Screen} — {part}

{One paragraph: what this slice adds.}

**Requires:** {earlier slices and the units it reuses from them}.

### Screen overview

| | |
|---|---|
| Screens | S{n} ({which states}), S{n}a |
| Route | `{route}`: {page type, shell bars shown or hidden} |
| ACs | AC-{AREA}-{nnn}, … ({half} when only part of an AC is covered) |
| Out of this slice | {states and behaviour left for later slices, with the slice number}. {Placeholders this slice adds so the app still works, e.g. a temporary page.} |

| State | Desktop | Phone | What the export shows |
|---|---|---|---|
| {State} | `{export-desktop-id}` | `{export-mobile-id}` | {components with their variants, every visible string in *italics*, placeholders, helpers, disabled and pending states} |
| {Not drawn state} | — | — | Not drawn ({why}). {Exact behaviour and copy} `// not in Pencil` |

{Page heading on desktop and the phone bar: breadcrumb, title, subtitle, parent.}

### Backend

| File | Content |
|---|---|
| `domain/{unit}/*` | {functions with signatures and error keys, or "Rule code below"} |
| `application/ports/{port}/{port}.port.ts` | {method signatures and return types} |
| `application/use-cases/{use-case}/*` | {input → output, the algorithm in short, or "Algorithm below"} |
| `adapters/db/{repo}/*` | {queries, locks, transactions} |
| `composition/{context}/{flow}/*` | {verification and wiring} |
| `app/actions/{context}/{slug}.ts` | {action names, what they revalidate, what they return} |
| `app/(owner)/…/page.tsx` | {what the page loads and renders} |

### Rule code

> Guidance: write out code only where a rule could be read two ways: status tables, validation schemas, selection/sorting rules, menu builders, SQL with paging or locking, migration-critical schema. Each block names its file and the AC / BR / D it implements. Code must pass lint as written (no `as` casts, no disabled rules).

```ts
// {path}/{unit}.ts ({AC / BR / D ids})
```

### Components

- **Reuse (inventory first):** {existing units, and the additive props to add, each with its type and what it does; say that the existing use stays unchanged}.
- **Feature units:**
  - `{unit}`: {props with types, what it renders, callbacks};
  - `{unit}`: ….

### Steps

- [ ] **{n}.1 {Step name} ({screens}, {AC ids}).**
  - **Tests first:**
    - `{file}.test.ts`: {exact inputs → exact outputs, using the fixtures};
    - `{file}.test.tsx`: {user action → what is shown, with exact copy}.
  - **Implement:** {units, in order, pointing to Rule code and Existing code to follow}.
  - **Compare** with `{export prefix}-*` (UI steps only).
  - Commit `{type}({slug}): {message}`.
- [ ] **{n}.2 …**

**Done check:** {what to do in the browser and what must appear, with exact copy}; the gate passes.

---

## Slice {last}: Close

Screens: all, end to end.

- [ ] **{n}.1 E2E journeys.** Complete `tests/e2e/{slug}/{slug}.spec.ts`. Every journey is one `test(...)` named with its AC IDs:

  | Journey | Checks |
  |---|---|
  | {AC ids} | {steps → expected result} |

  Commit `test({slug}): complete {slug} journeys`.
- [ ] **{n}.2 Accessibility.** Run axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) on each surface at 1440×900 and 390×844, in light and dark: {list the surfaces and open overlays}. Check the keyboard-only paths: {list}. Commit `test({slug}): check {slug} screens for accessibility`.
- [ ] **{n}.3 Fidelity.** Start the dev server with `preview_start`. For each export, open the export and the matching app state at the same width, screenshot both, and compare structure, copy, spacing and tokens. Fix every deviation that is a bug; record the intentional ones. Commit fixes as `fix({slug}): match {screen} to the design`.
- [ ] **{n}.4 Full gate and record.**
  - Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm build` and the E2E suite; all pass.
  - Append *Implementation record* to `technical-design.md`: date and commits; the migration run output; deviations (each with its reason); the AC → test-file map; open follow-ups.
  - Set F-{nn} to `IN PROGRESS` in `docs/product/feature-map.md`, with verification pending (`/sdv:verify-feature {slug}`), and update `docs/HANDOFF.md`.
  - Commit `docs({slug}): record the f-{nn} implementation`.

**Done check:** every AC maps to a passing test or a recorded verification, and the full gate passes.

---

## Checks before committing the plan

> Guidance: run these before you commit the plan, and fix every miss.

- **Exports:** every `exports/*.html` file appears in exactly one slice's state table, and every export ID in the plan exists as a file.
  ```bash
  cd docs/features/{slug} && for f in exports/*.html; do name=$(basename "$f" .html); id=${name##*-}; grep -q "$id" plan.md || echo "unused: $name"; done
  ```
- **ACs:** every `AC-{AREA}-*` in `acceptance-criteria.md` appears in the AC index.
- **Paths:** every path in *Existing code to follow* exists today (or belongs to a base feature that Slice 0 checks).
- **Copy:** every user-facing string is in an export, design.md › Copy, or marked `// not in Pencil`. List the `// not in Pencil` strings for the Owner to review.
- **Placeholders:** no `{…}` and no `> Guidance:` block is left.
- **Code:** the rule code passes the repo's lint rules as written.
