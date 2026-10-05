# Implementation prompt — F-17 App Shell revamp (for GPT Luna 5.6)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Copy everything below the line into the implementing agent.

---

You are implementing feature **F-17 `app-shell-revamp`** in the Shutrly repository:

```
/Users/hardiansa/Documents/work/personal/Coding/shutrly-v01
branch: codex/message-templates-shell-v3
```

## Read first, in this order (don't skip)

1. `AGENTS.md`: authority order, hard stops, and the Next.js warning.
2. `docs/HANDOFF.md` › *Current handoff — build F-17 App Shell revamp*.
3. `docs/constitution.md` and `docs/coding-rules.md` (v2.0).
4. `docs/architecture/overview.md`: the folder architecture is fixed. Every unit gets its own folder with co-located `*.test.tsx`, `*.types.ts`, `*.copy.ts` (Indonesian UI copy) and `*.stories.tsx`.
5. `docs/features/app-shell-revamp/plan.md`: **your execution checklist**. It has 14 TDD tasks written in **pseudo code**. Turn the pseudo code into real code that follows the coding rules; don't paste it literally.
6. `docs/features/app-shell-revamp/technical-design.md`: components, error handling, AC → test mapping.
7. `docs/features/app-shell-revamp/spec.md` and `acceptance-criteria.md` (AC-SHELL-001…014).
8. `docs/features/app-shell-revamp/design.md` and **`docs/features/app-shell-revamp/exports/*.html`** (31 frames, named `<state>-<frameId>.html`). The UI must match these exports. After the code works, a fidelity pass may change **only class names and element nesting**.
9. `docs/design-system/token-usage.md` (rules **v3.1**, APPROVED) and the component specs in `docs/design-system/components/`. Read the *F-17 update — PROMOTED* sections.

Before writing any code that touches server actions, redirects or navigation, read the relevant guide in `node_modules/next/dist/docs/`. This Next.js version differs from your training data.

## How to work

- Execute `plan.md` **one task at a time, in order (Task 1 → Task 14)**, for each task:
  1. write the failing test;
  2. run it and see it fail;
  3. implement the minimum;
  4. run it and see it pass;
  5. run the gate;
  6. make **one commit**.
- **Gate per task:** `pnpm typecheck && pnpm lint && pnpm test`. Add `pnpm tokens:check` when tokens or CSS change, and `pnpm e2e` for Task 13. Run `pnpm build` at the end.
- **Commits:** conventional commits in English, lowercase, no trailing period. Use the message given in the plan. Stage only the files of that task; the tree already has about 120 unrelated dirty files, which you must **never** revert, reformat or commit.
- **Tokens only.** No hex values, no `color.primitive.*`, no off-scale px. Use the generated CSS variables (`--component-*`, `--color-semantic-*`, `--space-*`, `--font-size-heading`, and so on). Pick tokens by meaning (G1–G8).
- **Copy:** Indonesian, in `*.copy.ts`. Accessible names: *Langsung ke konten*, *Utama*, *Ciutkan sidebar*, *Buka sidebar*, *Keluar*, *Kembali*, *Tutup*, *Cari*, *Notifikasi*, *Menu*; badge label *Notifikasi, N belum dibaca*.
- **Security and tenancy:** routes stay `/w/<workspaceId>/…`. Never trust a client-side workspace ID. `switchWorkspaceAction` (verify + touch + redirect) is unchanged.

## Key behaviour (from the approved spec — don't redesign)

- **Desktop ≥1280:**
  - Sidebar 252 px; collapses to a 72 px rail inline, and the choice is **remembered per browser**. Use `localStorage` key `shutrly.sidebar.collapsed`, wrapped in try/catch; if storage fails, start expanded.
  - The **Page Header** has a breadcrumb (workspace › page) with Cari and Notifikasi at the end, then a hero with the `h1`, an optional subtitle and at most one action.
- **Tablet 768–1279:** 72 px rail; its workspace control uses the `chevrons-up-down` icon. The logo/expand control opens the full Sidebar as an overlay, which Esc, a scrim click or choosing a destination closes, with focus returning to the trigger. The Toast sits bottom-right.
- **Phone <768:**
  - The **Mobile Header** has the workspace pill, Cari · Notifikasi · **Menu**, and the `h1` in `font.size.heading` (26), plus an optional subtitle.
  - Content sits in a sheet on `surface.canvas`.
  - The **Bottom Nav** is Dasbor · Proyek · **+** · Klien · **Invoice**. The **+** CTA goes to the Proyek *Segera hadir* page.
  - **Menu** opens the menu sheet: KATALOG (Layanan, Tim), Template pesan, Sumber klien, Pengaturan, then account and Keluar. It has **no** switcher and **no** Invoice.
  - The pill opens the workspace switcher sheet.
  - No tab is active on menu destinations or Profile.
- **Sub-page (pattern only, no route yet):** Compact Bar with Back to the **hierarchical parent** (a link, not history), an `h1` title, the parent caption, and an optional Actions slot. The Bottom Nav stays.
- **Nav active (rules v3.1 N1):** `--component-nav-item-background-active` (`action.primary`) with a semibold label and `on-primary` icon and label; `aria-current="page"`. Hover uses `--component-nav-item-background-hover` (`surface.panel`) and `--component-nav-item-icon-hover`.
- **Workspace switcher (every layout):**
  - Content: *Pindah workspace*, workspaces sorted alphabetically, dividers, no icons, a check on the current one, and a **primary** *Buat workspace* button (opens F-02's create form in the Modal/Sheet layer).
  - Pending: the items and the CTA are disabled.
  - Failure: when the action rejects with anything other than a redirect, show Toast/Danger *Gagal pindah workspace* with the action **Coba lagi**, which retries the same ID. Re-throw redirect errors.
- **Search / Notifications:** add the coming-soon sections `search` (*Pencarian*) and `notifications` (*Notifikasi*). `IconButton` gains `badgeCount`, rendered with `CountBadge variant="danger"`: hidden at 0, capped at `99+`, placed at x 20 / y 4 on MD.
- **Toast:** add an optional `action { label, onAction }`. Keep the Modal/Sheet overlay and the Toast stack on separate layers; a Toast never makes the page inert.
- **Responsive transitions:** when a breakpoint is crossed, close the overlays and sheets that belong to the old layout, keep the URL and workspace, and keep focus inside `main`.

## Hard stops — stop and ask the Owner

- Never run `pnpm db:migrate` (F-17 has no migrations).
- Never read or edit any `.pen` file. Design lives in Pencil; use the HTML exports.
- An export is missing or contradicts the spec → report a `SPEC GAP`; don't invent.
- A test or command fails in a way the plan doesn't explain → stop and report. Don't loosen lint rules or tests.
- Known, accepted failures you should **not** fix: the 12 Auth/Foundation test failures and the build blocker for the missing `public/auth/editorial/mosaic@2x.webp`.
- Don't touch `workspace.pen`, `auth.pen` or `message-templates.pen`, and don't change F-03 code.

## When done

1. Complete plan Task 14:
   - tick the iterations in `technical-design.md`;
   - list every deviation;
   - set F-17 to `IMPLEMENTED` in `docs/product/feature-map.md`;
   - update `docs/HANDOFF.md`.
2. Report the tasks and commits, test and E2E results (with the axe summary), any deviations and `SPEC GAP`s, and the next step: `/sdv:verify-feature app-shell-revamp`.
