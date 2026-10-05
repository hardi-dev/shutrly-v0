# Implementation prompt — F-04 Source configuration (for Codex)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Copy everything below the line into the implementing agent.

---

**Goal:** implement feature **F-04 `source-config`** (*Sumber foto*) in the Shutrly repository by executing `docs/features/source-config/plan.md`, Tasks 1–14, test-first, one commit per task. Stop at the Owner checkpoint in Task 6.

```
repo:   /Users/hardiansa/Documents/work/personal/Coding/shutrly-v01
branch: main (create feat/source-config from it before the first commit)
```

## Read first, in this order

1. `AGENTS.md`: the authority order, the hard stops and the Next.js warning. Before touching server actions, redirects, `revalidatePath`, portals or routing, read the matching guide in `node_modules/next/dist/docs/`.
2. `docs/HANDOFF.md` › *Current handoff — F-04 Source configuration PLANNED*.
3. `docs/constitution.md`, `docs/coding-rules.md` (v2.0), `docs/architecture/overview.md`. The folder architecture is fixed: every unit has its own folder with co-located `*.test.ts(x)`, `*.types.ts`, `*.schema.ts`, `*.copy.ts` and, for shared UI, `*.stories.tsx`.
4. `docs/features/source-config/plan.md`: **your checklist**. Its code was written from the F-03 code but never run. Treat it as the intended design: if a snippet fails typecheck, lint or tests, fix the snippet to meet the same intent and rules. Never loosen a lint rule or a test.
5. `docs/features/source-config/technical-design.md`, `spec.md`, `acceptance-criteria.md` (AC-SRC-001…017).
6. `docs/features/source-config/design.md` and **`docs/features/source-config/exports/*.html`** (24 frames, `<state>-<frameId>.html`). The UI must match them. The fidelity pass after the code works may change only class names and element nesting.
7. `docs/design-system/token-usage.md` (v3.1) and the specs `docs/design-system/components/status-chip.md`, `list-card.md` (Two-line / Skeleton) and `option-card.md`.
8. The reference implementation to mirror: F-03 `src/features/communications/**`, `src/composition/communications/**`, `src/adapters/db/message-template-repository/**`, `tests/support/communications/**` and `tests/integration/communications/**`.

## How to work

- **Order:** one task at a time, in order. For each task:
  1. write the failing test(s) named with their `AC-SRC-*` / `BR-SRC-*` IDs;
  2. run them and see them fail;
  3. implement;
  4. run them and see them pass;
  5. run the gate;
  6. make **one commit** with the plan's message plus the trailer `Co-Authored-By: <your agent identity>`.
- **Gate per task:** `pnpm typecheck && pnpm lint && pnpm test`.
  - From Task 8 on, also `pnpm test:integration` (only after the Owner has applied the migrations).
  - When tokens or CSS change, also `pnpm tokens:check`.
  - Task 14 adds `pnpm e2e` and `pnpm build`.
- **Staging:** stage only the files of the task. Never commit, revert or reformat `docs/features/auth/auth.pen` or `docs/features/auth/fonts/` (the Owner's).
- **Boundaries:**
  - `src/features/gallery` never imports another feature; cross-feature work goes through `src/composition/`.
  - `react-aria-components` only inside `src/ui/**`.
  - Add `import "server-only"` where the lint requires it.
  - No `as`, `any`, `enum` or non-null `!`.
- **Styling:** token CSS variables only (`--component-*`, `--color-semantic-*`, `--space-*`, `--font-size-*`). No hex, no primitive colours.
- **Copy:** UI copy is Indonesian, lives only in `*.copy.ts`, and comes from the plan's `SOURCE_COPY` / `PROVIDER_COPY` (from the frames).
- **Double render:** the shell renders every page in a desktop tree and a phone tree. Use `useMobileViewport` to pick a layout, and in E2E scope selectors to the visible tree (`#app-shell-content` / `#mobile-app-content`), as in F-03.
- **Logging (C-103):** `source_config.save_failed` with `{ workspaceId, sourceId?, operation }` only, never names.

## Hard stops: stop and report to the Owner

- **Task 6, after generating migrations 0004/0005:**
  - **Never run `pnpm db:migrate`.** Report the generated SQL and wait until the Owner says the migrations are applied.
  - Then continue with Task 7. Task 7 doesn't need the DB; Task 8 does.
- **Higher authority:** anything that would require changing the constitution, business rules, ADRs or coding rules, or a contradiction between them, is a `CONFLICT` or `SPEC GAP`. Report it; don't resolve it yourself.
- **Uncovered failures:** a failure the plan's notes don't cover and you can't fix without bending a rule.
- **Secrets:** never print or commit `.dev.vars` / `.env.test` values.

## Done when

- [ ] Tasks 1–14 are ticked in `plan.md`, each with its own commit.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm e2e` (full) and `pnpm build` all pass.
- [ ] *Sumber foto* at 1440 and 390 px, light and dark, matches the exports. The nav shows *Sumber foto* (`folder-open`) and `/w/<id>/client-sources` is not found.
- [ ] `technical-design.md` has an **Implementation record** (commits, deviations, AC → test map). `HANDOFF.md` and `docs/product/feature-map.md` say F-04 is built and ready for `/sdv:verify-feature source-config`.
- [ ] Final report: the commits, the checks with results, the deviations / `SPEC GAP` / `CONFLICT`, and anything left for the Owner.
