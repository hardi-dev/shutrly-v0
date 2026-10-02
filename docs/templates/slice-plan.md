# Slice plan template (vertical slices by screen)

Use this template to write `docs/features/<slug>/plan.md` (or `plan-2.md` beside a layered plan) as **vertical slices by screen**. Each slice delivers one screen end to end and can be tried in the browser when it is done.

**Goal of the template:** a model that has never seen the conversation can build the whole feature in one session, without guessing and without revisions. Everything it would otherwise have to invent (types, SQL, copy, file paths, the pattern to copy, what each state shows) is written in the plan.

**Worked example:** [features/projects/plan-2.md](../features/projects/plan-2.md) (F-07 Projects). When an instruction below is unclear, open the same section there.

---

## Instructions for the plan author

> ✎ **Delete this whole section, and every `> ✎` block below, when the plan is finished.** Find leftovers with:
> ```bash
> grep -n '✎\|{[a-zA-Z]' docs/features/<slug>/plan.md
> ```

### 1. Check the inputs first

Don't start the plan until all of these exist and are approved. If one is missing, run the sdv stage that makes it.

| Input | Must contain | Made by |
|---|---|---|
| `spec.md` | flows, business-rule refs, out of scope, assumptions (`A-n`) | `/sdv:discover-feature` |
| `acceptance-criteria.md` | stable `AC-<AREA>-NNN` IDs and the shared test fixture | `/sdv:discover-feature` |
| `design.md` | frame table (state → frame ID per device), Copy, rule exceptions, APPROVED | `/sdv:design-feature` |
| `exports/*.html` | **one frame per file**, named `<state>-<desktop\|mobile>-<frameId>.html` | Pencil `Export` |
| `technical-design.md` | decisions `D-1…D-n`, DB tables, API table, AC → test map | `/sdv:plan-feature` |

**Check the exports before you rely on them.** Open a few files and make sure each holds only its own frame. Frames that touch or overlap on the canvas leak into each other's export. Keep at least 40 px between frames, and re-export if needed.

### 2. Gather facts, don't recall them

Every path, prop, function name and limit in the plan must come from reading the repo **today**, not from memory or from another plan.
- Open each file you will list in *Existing code to follow*, and write what it does now, including what it can't do yet (for example "`CompactBar` takes `actions`, but `AppShell` doesn't pass any"). Each limit becomes an *extend* row in Slice 0 and an additive step in a later slice.
- For a base feature that is only planned (not built), take its unit names from its plan, say so in **Base**, and let Slice 0 check them.
- Look for routing traps: a new folder can stop a catch-all route (`[section]`) from matching, and a shell button may still point to an old URL. Give each trap a step.
- List the existing domain helpers (money, quantity, dates, formatting) by name in Global Constraints, so the builder reuses them.

### 3. Decide the slices

- **One screen per slice**, built end to end (domain → application → repository → action → UI → tests).
- **Order:** start with the screen that **creates** the data, then the screen that shows one record, then the list. Each slice then has real data to show.
- **Split a big screen** into a main-path slice early and a "the rest" slice later (F-07: Slice 1 *Proyek baru* main path, Slice 7 the rest). The later slice can reuse dialogs built in between.
- **Overlays belong to the page they open on** (S1a, S2b…). An overlay used on two pages is built in the first slice that needs it and reused later.
- **Schema:** put all tables in Slice 1 (one migration), unless a table is clearly independent.
- **Placeholders:** if a slice links to a page that a later slice builds, it adds a temporary page so the app still works, and names the slice that replaces it.
- **Slice 0** always checks the base and writes the component inventory. **The last slice** always closes: E2E, accessibility, fidelity, gate and record.

### 4. Level of detail

Write until the builder has nothing left to decide. The test: could a model with only this file, the exports and the repo write the code with no question? If not, add the missing fact.

| Write out in full | Point to instead |
|---|---|
| TypeScript types for every record, input and result | JSX: point to the export and name the behaviour to test |
| Rule code: status tables, validation schemas, sorting / selection rules, menu builders | Styling: the export plus the token rules |
| SQL with paging, locking, `LATERAL` or escaping | Simple CRUD queries: name the table, filter and order |
| Every user-facing string, per breakpoint when they differ | Patterns that exist: the file to copy from |
| Exact fixture values and expected outputs in tests | |

- Code you write must pass the repo's lint as written: no `as` casts, no disabled rules, named constants instead of literals.
- Give every rule a source ID (`BR-*`, `AC-*`, `D-*`, `A-*`) next to it.
- Never decide a product question in the plan. If the spec doesn't say, stop and report a `SPEC GAP` to the Owner, then record the answer in the owning document first.

### 5. Copy

- Take every string from the export first, then design.md › Copy, then the spec.
- A string that isn't drawn anywhere (an error that has no frame, a pending label, a toast for a path that has no frame) is written in the plan with `// not in Pencil`. List these for the Owner to review when you hand the plan over.
- When desktop and phone exports show different text, write both variants.
- Use the exact formats from the exports (dates, money, phone numbers), and write one example of each.

### 6. Fill the sections

Each section below carries its own `> ✎` instructions. Fill them top to bottom; the later sections (slices) refer back to the shared ones (contracts, fixtures, copy).

### 7. Check, then hand over

- Run *Checks before committing the plan* at the end of this file, and fix every miss.
- Delete this section and every `> ✎` block.
- Commit `docs(<slug>): plan f-<nn> <slug> as slices`, then report to the Owner: the slice list, the `// not in Pencil` strings, and anything taken from an unbuilt base feature.

---

# F-{nn} {Feature name} — Implementation Plan (vertical slices by screen)

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. In this repo, `/sdv:build-feature {slug} <slice>` runs one slice; each **step** inside it is one commit.

> ✎ If this plan sits beside a layered `plan.md`, add one line: "This is an alternative to plan.md … Build from **one** of them, not both."

**Goal:** {one sentence: who does what}.
- **{Screen A}:** {what it does}.
- **{Screen B}:** {what it does}.

> ✎ One bullet per page, in plain words, with the key behaviour (for example "saved in one transaction as a draft or as booked"). Take it from spec › Goal and Main Flow.

**Approach:** each slice delivers one screen end to end:
- domain → application → repository → action → UI → tests;
- it can be tried in the browser when it is done;
- it produces the data the next slice shows.

The slice order is {Screen A} → {Screen B} → … Each step inside a slice is one commit.

**Architecture:**
- {bounded context and folders, e.g. `src/features/<context>/{domain,application,ui}`}.
- {tables and ports, and the migration number}.
- {the concurrency / consistency rule from the technical design, with its D-number}.
- Composition verifies the workspace and wires the routes and actions.

> ✎ Four or five bullets, each naming a decision from technical-design.md with its D-number. Check the next free migration number in `drizzle/` (and in any base feature's plan).

**Tech Stack:** {copy from `docs/architecture/tech-stack.md`, only what this feature uses}.

**Sources:**
- design: [design.md](design.md) and `exports/*.html` ({n} frames, one per file);
- technical design: [technical-design.md](technical-design.md) (D-1…D-{n}, the AC → test map);
- spec: [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md) (AC-{AREA}-001…{nnn});
- component specs in `docs/design-system/components/`.

**Base:** {earlier features that must be built and merged first, and the exact units this plan uses from them by name: tables, migrations, ports, use cases, components, helpers}.

> ✎ List every unit from another feature that a slice uses, by its exact name. If the base feature is only planned, write "Its plan is ready but not implemented yet". Slice 0.1 checks each of these names.

## Global Constraints

Every step's requirements implicitly include this section.

> ✎ Keep the generic bullets as they are. Fill the feature-specific ones (constants, money, secrets, copy variants, dates). Anything a builder must apply in more than one slice goes here, not in a slice.

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

  > ✎ Every number a rule uses: max lengths, page sizes, limits, time zones. Take them from the spec, BRs and technical design. The builder imports these constants; tests use them too.

- **Money / dates / time zone:** {format and type rules, with the ADR, e.g. whole IDR strings; *Rp 750.000* with a space}.
- **Secrets and logging:** {what is never selected, returned, logged or rendered; the exact log event name and its allowed keys}.
- **Copy:** from the frames and design.md › Copy, in `{slug}-copy`. Strings not drawn carry `// not in Pencil`.
- **Copy differs by breakpoint** where the exports differ. Keep both variants (`…Desktop` / `…Mobile`):

  | Key | Desktop | Phone |
  |---|---|---|
  | `{key}` | {text} | {text} |

  > ✎ Find these by comparing each desktop export with its phone export (button labels like *Proyek baru* / *Baru*, shortened subtitles, *Tambah item* / *Tambah*).

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

> ✎ List every file to create or change, grouped by layer (domain, application, adapters, composition, app, ui, tests), with one line on its job. Follow the folder rules in `docs/architecture/overview.md`: one folder per unit with a co-located test. Each slice then lists the subset it creates. If a layered plan already has this list, link to it instead.

## Screens

{Feature} has {n} pages plus the overlays that open on them. Each overlay belongs to the page it opens on. Every state is one export per device (`exports/<state>-<desktop|mobile>-<id>.html`).

> ✎ How to fill the table:
> - **One row per page (S1, S2…) and one per overlay (S1a, S1b…).** An overlay is any modal, sheet, menu or dialog. Number overlays under the page they open on.
> - **Route / where it opens:** the URL for pages; for overlays, the trigger (`S1 › filter button`) and the component variant on each device (`Modal MD / Bottom Sheet Form`).
> - **Layout:** desktop and phone shells, header, content column, which bars show or hide. Read it from the export, not the spec.
> - **States:** the export file names, with `*` for the device pair (`new-sesi-form-*`).
> - **Built in:** link to the slice, using the heading's anchor. A row built in two slices lists both.
> - After the table, write the navigation between screens, then the frames that are in the `.pen` but are not screens (boards, notes) and why they aren't built.

| # | Screen | Route / where it opens | Layout | States (exports) | Built in |
|---|---|---|---|---|---|
| S1 | **{Page}** | `{route}` | Desktop: {shell, header, column}. Phone: {shell, bars} | `{export}`, … | Slice [n](#slice-n-…) |
| S1a | {Overlay} | S1 › {trigger} ({Modal size / Bottom Sheet type}) | | `{export}`, … | Slice [n](#slice-n-…) |

**Navigation between screens:**
- **Shell:** {entry points} → S{n}.
- **S1:** {action} → S{n}.
- **S2:** {action} → S{n} with a toast.

**Not a screen of its own:** {boards or frames in the `.pen` that are not built or exported, and why}.

## How to run this plan in one session

> ✎ Keep this section as it is. Change only the document names if the feature has others to read first.

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

> ✎ How to fill the table:
> - Find the closest feature that already does the same thing (F-05 catalog was the model for F-07) and list one row per pattern the builder will repeat.
> - **Open every file** before you list it, and confirm the path with `ls`. Write the exact shape in *Notes*: function names, arguments, what is returned, what is revalidated.
> - Write limits too ("today it pushes `/projects`; Slice 1 changes it"). Each limit needs a step that fixes it.
> - Add rows for the shell pieces the feature touches (nav, coming-soon lists, create buttons).

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

## Shared contracts

Each slice creates the types it needs, with exactly these shapes. Exported types go in sibling `.types.ts` files (coding rules). {ID, date, time and money conventions.}

> ✎ How to fill:
> - Write every type that crosses a layer: domain value types, port records and inputs, use-case results, error keys and codes. Mark each with its file and the slice that creates it ("Slice 1; grows in 2, 5").
> - Use `readonly` fields and string unions, and comment each field whose format isn't obvious (`// YYYY-MM-DD`).
> - Then write the tables every slice shares: field error copy (every path × key, with exact copy), status labels and tones, action buttons. Mark copy not drawn with `// not in Pencil`.
> - If two slices would otherwise each define the same thing, it belongs here.

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

> ✎ Copy the shared fixture from acceptance-criteria.md and add the exact values a test needs (IDs, dates, prices, phone numbers, the expected order). Fix "today" to one date so date rules are testable. Use the same names as the exports where possible (*Rina*, *Wisuda Basic*), so screenshots and tests match.

## AC index

| AC | Slice.step |
|---|---|
| {001, 002} | {1.1, 1.3} |

> ✎ Every AC in acceptance-criteria.md appears here at least once. When an AC is split across slices, list every step and say which half each covers ("1.3 (draft), 2.1 (confirm)"). Fill this after the slices are written, then check it against the steps' AC references.

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

> ✎ Fill 0.1 with one check per unit listed in **Base** (file exists, function exported). Fill 0.3 with every component the exports use, and with the limits you found in *Existing code to follow* as "expected results".

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

> ✎ Repeat this block once per slice. Name the slice after its screen ("*Proyek baru* — the main path", "Detail — read and status steps"). Under **Requires**, name the units from earlier slices by their exact names.

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

> ✎ How to fill the state table:
> - **One row per export pair.** Open both HTML files and write what they show: the component and its variant (*Modal MD*, *Select/Error*, *Button Primary Loading*), and **every visible string in italics**: labels, placeholders, helpers, empty states, button text, toasts.
> - Write the differences between desktop and phone in the same cell.
> - States the spec needs but nobody drew (an error with no frame, a race condition) get a row with `—` and the exact behaviour and copy, marked `// not in Pencil`.
> - Name the pending state of every button that submits (*Membuat proyek…*), and what is disabled meanwhile.
> - After the table, write the page heading: breadcrumb, title, subtitle on desktop, and title and parent in the phone bar.

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

> ✎ One row per file this slice creates or changes, in layer order. Write the signature (arguments and return type, using the Shared contracts names), not a description. For each validation, list the error keys it returns and when. Name the lock and the transaction for every write. For each action, say what it revalidates and what it returns on success and failure. For changes to a base feature, say "additive" and which existing tests change.

### Rule code

> ✎ Write out code only where a rule could be read two ways: status tables, validation schemas, selection and sorting rules, menu builders, SQL with paging or locking, migration-critical schema, algorithms with ordered steps. Each block names its file and the AC / BR / D it implements. Code must pass lint as written (no `as` casts, no disabled rules). For an algorithm, numbered steps in prose are fine; say which error code each step returns.

```ts
// {path}/{unit}.ts ({AC / BR / D ids})
```

### Components

- **Reuse (inventory first):** {existing units, and the additive props to add, each with its type and what it does; say that the existing use stays unchanged}.
- **Feature units:**
  - `{unit}`: {props with types, what it renders, callbacks};
  - `{unit}`: ….

> ✎ Under **Reuse**, name every existing unit the exports use, and for each extension the exact prop, its type, and a test that the old use is unchanged. Under **Feature units**, give each new unit its props with types and its callbacks. A dialog reused by a later slice gets a callback-only contract (no actions inside), so the later slice can wire it differently.

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

> ✎ How to cut steps:
> - The usual order is domain → schema → use case + repository → action + page → UI. Each step is one commit that passes the gate on its own.
> - **Tests first** lists every test file and the cases in it, with exact inputs and outputs: a table row, a fixture value, a copy string. "Test the validation" is not enough; "101-char name → `TOO_LONG`" is.
> - Each step names the ACs it covers, which must match the AC index.
> - A step that touches the DB says so, so the builder adds `pnpm test:integration`. The schema step says to run and report `pnpm db:migrate`.
> - The **Done check** is something a person can do in the browser, with the exact text that must appear.

---

## Slice {last}: Close

Screens: all, end to end.

> ✎ Fill the journey table with one row per AC group that crosses screens. List every surface and open overlay for axe, and the keyboard-only paths (pickers, date fields, menus, dialog focus return).

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

> ✎ Run these, fix every miss, then delete this section too.

- **Exports:** every `exports/*.html` file appears in a slice's state table, and every export ID in the plan exists as a file.
  ```bash
  cd docs/features/{slug} && for f in exports/*.html; do name=$(basename "$f" .html); id=${name##*-}; grep -q "$id" plan.md || echo "unused: $name"; done
  ```
- **ACs:** every `AC-{AREA}-*` in `acceptance-criteria.md` appears in the AC index, and every step's AC references match the index.
- **Paths:** every path in *Existing code to follow* exists today (or belongs to a base feature that Slice 0 checks).
- **Copy:** every user-facing string is in an export, design.md › Copy, or marked `// not in Pencil`. List the `// not in Pencil` strings for the Owner to review.
- **Placeholders:** no `{…}` and no `> ✎` block is left.
- **Code:** the rule code passes the repo's lint rules as written.
- **One-session test:** read one slice as if you were the builder, with only this file, the exports and the repo. Every question you would ask is a missing fact; add it.
