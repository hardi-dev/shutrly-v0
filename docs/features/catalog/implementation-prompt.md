# Implementation prompt — F-05 Service catalog

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Copy everything below the line into the implementing agent.

---

**Goal:** implement feature **F-05 `catalog`** (*Layanan*: Layanan · Kategori · Item paket tabs and the service detail page) in the Shutrly repository by executing `docs/features/catalog/plan.md`, Tasks 1–15, test-first, one commit per task.

```
repo:   /Users/hardiansa/Documents/work/personal/Coding/shutrly-v01-catalog   (git worktree)
branch: feat/catalog   (already checked out; main is merged in, including F-04)
```

Work only in this worktree. The folder `/Users/hardiansa/Documents/work/personal/Coding/shutrly-v01` is a different checkout used by other sessions: don't run commands, stash or switch branches there.

## Read first, in this order

1. `AGENTS.md`: the authority order, the hard stops (including the migration rule) and the Next.js warning. Before touching server actions, redirects, `revalidatePath`, portals, `useRouter` or routing, read the matching guide in `node_modules/next/dist/docs/`.
2. `docs/HANDOFF.md` › *Update 2026-10-02 — F-05 Service catalog PLANNED*.
3. `docs/constitution.md`, `docs/coding-rules.md` (v2.0), `docs/architecture/overview.md`, `docs/architecture/tech-stack.md` (Deployment › migrations during development). The folder architecture is fixed: every unit has its own folder with co-located `*.test.ts(x)`, `*.types.ts`, `*.schema.ts`, `*.copy.ts` and, for shared UI, `*.stories.tsx`.
4. `docs/features/catalog/plan.md`: **your checklist**. Its code was written from the F-04 code but never run. Treat it as the intended design: if a snippet fails typecheck, lint or tests, fix the snippet to meet the same intent and rules. Never loosen a lint rule or a test.
5. `docs/features/catalog/technical-design.md` (including *Decisions* and *Risks*), `spec.md`, `acceptance-criteria.md` (AC-CAT-001…023), and `docs/domain/business-rules.md` › BR-CAT-001…011, BR-CUR-*.
6. `docs/features/catalog/design.md` and **`docs/features/catalog/exports/*.html`** (40 frames, `<state>-<frameId>.html`; desktop and phone pairs share the state name). The UI must match them. The fidelity pass after the code works may change only class names and element nesting. The exports still show local tab/empty-state/dropdown pieces; build them with the **library components** named in the plan (they look the same).
7. `docs/design-system/token-usage.md` (v3.1) and the specs `docs/design-system/components/tabs.md`, `page-header.md`, `segmented-control.md`, `empty-state.md`, `menu-item.md` (Rich), `menu.md`, `list-card.md` (trailing amendment), `select.md`, `switch.md`.
8. The reference implementation to mirror: F-04 `src/features/gallery/**`, `src/composition/gallery/**`, `src/adapters/db/workspace-source-repository/**`, `src/app/actions/gallery/**`, `src/app/(owner)/w/[workspaceId]/photo-sources/**`, `tests/support/gallery/**`, `tests/integration/gallery/**`, `tests/e2e/photo-sources/**`.

## How to work

- **Order:** one task at a time, in order. For each task:
  1. write the failing test(s) named with their `AC-CAT-*` / `BR-CAT-*` IDs;
  2. run them and see them fail;
  3. implement;
  4. run them and see them pass;
  5. run the gate;
  6. tick the task's boxes in `plan.md` and make **one commit** with the plan's message plus the trailer `Co-Authored-By: <your agent identity>`.
- **Gate per task:** `pnpm typecheck && pnpm lint && pnpm test`.
  - From Task 9 on, also `pnpm test:integration`.
  - When tokens or CSS change, also `pnpm tokens:check`.
  - Task 15 adds `pnpm e2e` (full suite) and `pnpm build`.
- **Migrations (Task 6):** generate 0006/0007 with drizzle-kit, review the SQL, commit, then run `pnpm db:migrate` yourself. It targets the shared **non-production** database from `.dev.vars` (already present in this worktree; never print its values). Both migrations are additive. Report the command output in the task report. Never point any command at production.
- **Staging:** stage only the files of the task. Never commit `.dev.vars`, `.env.test`, `docs/features/auth/auth.pen` or `docs/features/auth/fonts/`.
- **Boundaries:**
  - `src/features/booking` never imports another feature; cross-feature work goes through `src/composition/` or `src/app/`.
  - `react-aria-components` only inside `src/ui/**`.
  - Add `import "server-only"` where the lint requires it.
  - No `as`, `any`, `enum` or non-null `!`.
- **Money (ADR-007, C-105):** prices are whole-rupiah digit strings (`parseIdrAmount`, `formatIdr`); never `Number()` arithmetic on money. Package values are decimal strings.
- **Styling:** token CSS variables only (`--component-*`, `--color-semantic-*`, `--space-*`, `--font-size-*`), including the new `--component-tabs-*`, `--component-page-header-tabs-padding-x`, `--component-empty-state-in-card-padding-y`. No hex, no primitive colours.
- **Copy:** UI copy is Indonesian, lives only in `*.copy.ts`, and comes from the plan's `CATALOG_COPY` (from the frames). Where an export's wording differs, the export wins; note it in the implementation record.
- **Double render:** the shell renders every page in a desktop tree and a phone tree. Use `useMobileViewport` to pick a layout, and in E2E scope selectors to the visible tree (`#app-shell-content` / `#mobile-app-content`), as in F-03/F-04.
- **Logging:** `catalog.save_failed` with `{ workspaceId, entity, entityId?, operation }` only, never names or values.

## Stop and report to the Owner

- **TD-D-1 / TD-D-2** (row icons derived from type; item summary = value + unit) are open design decisions. Build them as planned unless the Owner has answered otherwise in `HANDOFF.md`; list them in the final report.
- **Higher authority:** anything that would require changing the constitution, business rules, ADRs or coding rules, or a contradiction between them, is a `CONFLICT` or `SPEC GAP`. Report it; don't resolve it yourself.
- **Migrations:** a migration that would drop or rename something other branches use, or any failure of `pnpm db:migrate`. Don't retry with other credentials.
- **Uncovered failures:** a failure the plan's notes don't cover and you can't fix without bending a rule.
- **Secrets:** never print or commit `.dev.vars` / `.env.test` values.

## Done when

- [ ] Tasks 1–15 are ticked in `plan.md`, each with its own commit.
- [ ] Migrations 0006/0007 are applied to the non-production database (reported).
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm e2e` (full) and `pnpm build` all pass.
- [ ] *Layanan* (three tabs) and the service detail at 1440 and 390 px, light and dark, match the exports; the sidebar *Layanan* item is active on every `/services/**` page and no *Segera hadir* placeholder remains for it.
- [ ] `technical-design.md` has an **Implementation record** (commits, deviations, AC → test map). `HANDOFF.md` and `docs/product/feature-map.md` say F-05 is built and ready for `/sdv:verify-feature catalog`.
- [ ] Final report: the commits, the checks with results, the migration run, the deviations / `SPEC GAP` / `CONFLICT`, TD-D-1/TD-D-2 status, and anything left for the Owner.
