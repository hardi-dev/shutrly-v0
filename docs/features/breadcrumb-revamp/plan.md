# Breadcrumb revamp (F-23) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Written for Claude Haiku 5.5.** Every step is literal. Copy the code exactly. Do not redesign, rename, or "improve" anything. If an `old` block in a step is not found exactly, **stop and report**; do not guess.

**Goal:** Every desktop breadcrumb shows one crumb per route level, the Owner trail is complete on first paint, Beranda always exists for clients, and the sidebar toggle sits left of the breadcrumb.

**Architecture:** A pure builder (`src/features/workspace/ui/owner-trail/`) makes the Owner crumbs. A Next.js parallel route slot `@crumbs` under `src/app/(owner)/w/[workspaceId]/` renders them on the server (ADR-025). Shared loaders are wrapped in React `cache()` so the slot and the page share one query. Client trails are plain composition changes. The toggle is a `leading` slot in the Page Header.

**Tech Stack:** Next.js 16 (App Router, parallel routes), React 19 (`cache`), TypeScript, Tailwind v4 tokens, React Aria, Vitest + Testing Library, Playwright.

**Read before starting:** [spec.md](spec.md), [acceptance-criteria.md](acceptance-criteria.md), [technical-design.md](technical-design.md), [ADR-025](../../architecture/decisions/ADR-025-owner-breadcrumb-parallel-route.md).

## Global Constraints

- Work on the current branch. Do not push. Do not open a PR.
- **Never type `head`** (this machine's `head` is not coreutils). Use `sed -n '1,20p' <file>`.
- **Never run the full test suite** (`pnpm test`, the full e2e, the full integration). Run only the commands each step gives.
- Never read or edit `.pen` files. Never run `pnpm db:migrate`. This plan has no migration.
- Paths with `(` `)` `[` `]` must be quoted in the shell, e.g. `"src/app/(owner)/w/[workspaceId]/layout.tsx"`.
- UI copy is Indonesian and lives in `*.copy.ts`. Never put a new string literal in JSX.
- Import boundaries: `features/<f>/ui` may import its own feature, `src/ui`, `shared`. `app/` may import `composition`, `features/*/ui`, `src/ui`, `shared`. A feature never imports another feature.
- After editing files, run on exactly those files: `npx prettier --write <files>` then `npx eslint <files>`. Fix every eslint error before committing.
- Typecheck once per task before the commit: `pnpm typecheck`. Expected: exits 0.
- One commit per task. Stage only the files the task lists (`git add <paths>`). The repo has unrelated dirty files; never use `git add -A` or `git add .`.
- Commit message: the exact first line given, then a blank line, then the session's `Co-Authored-By:` line.
- If a test fails for a reason the step does not predict, retry once after re-reading the step. If it fails again, stop and report the output.

---

## File map

| File | Task | Responsibility |
|---|---|---|
| `src/features/workspace/ui/owner-trail/owner-trail.ts` (create) | 1 | Pure Owner crumb builder |
| `src/features/workspace/ui/owner-trail/owner-trail.test.ts` (create) | 1 | Its tests |
| `src/composition/workspace/owner-workspace/owner-workspace.ts` | 2 | `verifyOwnerWorkspace` cached |
| `src/composition/booking/project-flow/project-flow.ts` | 2 | `loadProjectDetail` cached |
| `src/composition/booking/catalog-flow/catalog-flow.ts` | 2 | `loadServiceDetail` cached |
| `src/composition/gallery/gallery-flow/gallery-flow.ts` | 2 | `loadGalleryPage` cached |
| `src/composition/gallery/selection-owner-flow/selection-owner-flow.ts` | 2 | `loadSelectionGroups`, `loadSelectionGroupDetail` cached |
| `src/ui/patterns/page-header/page-header.tsx`, `.types.ts`, `.test.tsx` | 3, 7 | `PageHeaderTrail`, `trail` prop; `leading` prop |
| `src/ui/patterns/app-panel/app-panel.tsx`, `.types.ts` | 3, 7 | pass `trail`, `leading` |
| `src/ui/patterns/app-shell/app-shell.tsx`, `.types.ts`, `.test.tsx` | 3, 7 | `panelTrail`; toggle |
| `src/app/(owner)/w/[workspaceId]/@crumbs/**` (create) | 4 | Server slot routes |
| `src/app/(owner)/w/[workspaceId]/layout.tsx`, `src/app/(owner)/profile/layout.tsx` | 5 | Pass the trail |
| `src/features/workspace/ui/owner-shell/owner-shell.tsx`, `.types.ts`, `.test.tsx` | 5 | Use `trail`; drop old assembly |
| `src/features/workspace/ui/owner-nav/owner-nav.tsx`, `.types.ts`, `.test.tsx` | 5 | Drop `breadcrumbs` |
| `src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx` | 5 | Copy constant instead of `"Layanan"` |
| `src/features/gallery/ui/review-screen/review-text.ts`, `review-text.test.ts` (create) | 6 | Read-only review trail |
| `src/app/(client)/g/[token]/page.tsx` | 6 | Remove A-31 redirect |
| `src/features/gallery/ui/client-browse-screen/client-browse-screen.tsx`, `.types.ts`, `.test.tsx` | 6 | Always Beranda trail |
| `src/app/(client)/g/[token]/photos/page.tsx` | 6 | New prop name |
| `src/features/gallery/domain/client-home/client-home.ts` | 6 | Doc comment only |
| `src/ui/patterns/sidebar/sidebar.tsx`, `.types.ts`, `.test.tsx` | 7 | Remove toggles |

---

### Task 1: Owner trail builder

**Covers:** groundwork for AC-CRUMB-001…007.

**Files:**
- Create: `src/features/workspace/ui/owner-trail/owner-trail.ts`
- Create: `src/features/workspace/ui/owner-trail/owner-trail.test.ts`

**Interfaces:**
- Consumes: `BreadcrumbItem` from `@/ui/patterns/page-header/page-header.types` (`{ label: string; href?: string; onPress?: () => void }`), `OWNER_NAV_COPY` from `../owner-nav/owner-nav.copy`.
- Produces (used by Tasks 4 and 5):
  - `type OwnerSection = "projects" | "clients" | "team" | "services" | "message-templates" | "photo-sources" | "settings" | "invoices" | "search" | "notifications"`
  - `ownerTrail(input: { workspaceId: string; workspaceName: string; ancestors: readonly BreadcrumbItem[]; current: string }): readonly BreadcrumbItem[]`
  - `dashboardTrail(): readonly BreadcrumbItem[]`
  - `sectionCrumb(workspaceId: string, section: OwnerSection): BreadcrumbItem`
  - `projectCrumb(workspaceId: string, projectId: string, title: string): BreadcrumbItem`
  - `staticOwnerTrail(segments: readonly string[], workspaceId: string, workspaceName: string): readonly BreadcrumbItem[] | null`

- [ ] **Step 1: Write the failing test**

Create `src/features/workspace/ui/owner-trail/owner-trail.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  dashboardTrail,
  ownerTrail,
  projectCrumb,
  sectionCrumb,
  staticOwnerTrail,
} from "./owner-trail";

describe("owner trail (F-23 R-1…R-5)", () => {
  it("AC-CRUMB-001 the Dashboard is the single crumb Dasbor", () => {
    expect(dashboardTrail()).toEqual([{ label: "Dasbor" }]);
  });

  it("puts the workspace root first, then the ancestors, then the current page", () => {
    expect(
      ownerTrail({
        workspaceId: "A",
        workspaceName: "Aster",
        ancestors: [sectionCrumb("A", "projects"), projectCrumb("A", "p1", "Rina & Dimas")],
        current: "Galeri",
      }),
    ).toEqual([
      { label: "Aster", href: "/w/A" },
      { label: "Proyek", href: "/w/A/projects" },
      { label: "Rina & Dimas", href: "/w/A/projects/p1" },
      { label: "Galeri" },
    ]);
  });

  it("AC-CRUMB-002 gives each section Aster › section", () => {
    const cases: [string, string][] = [
      ["projects", "Proyek"],
      ["clients", "Klien"],
      ["team", "Tim"],
      ["services", "Layanan"],
      ["message-templates", "Template pesan"],
      ["photo-sources", "Sumber foto"],
      ["settings", "Pengaturan"],
      ["invoices", "Invoice"],
      ["search", "Pencarian"],
      ["notifications", "Notifikasi"],
    ];
    for (const [segment, label] of cases) {
      expect(staticOwnerTrail([segment], "A", "Aster")).toEqual([
        { label: "Aster", href: "/w/A" },
        { label },
      ]);
    }
  });

  it("AC-CRUMB-003 adds one crumb for a tab route and for Proyek baru", () => {
    const cases: [string, string, string, string][] = [
      ["projects", "completed", "Proyek", "Selesai"],
      ["projects", "cancelled", "Proyek", "Dibatalkan"],
      ["projects", "new", "Proyek", "Proyek baru"],
      ["clients", "archived", "Klien", "Arsip"],
      ["team", "archived", "Tim", "Arsip"],
      ["team", "roles", "Tim", "Peran"],
      ["services", "categories", "Layanan", "Kategori"],
      ["services", "items", "Layanan", "Item paket"],
    ];
    for (const [section, sub, sectionLabel, label] of cases) {
      expect(staticOwnerTrail([section, sub], "A", "Aster")).toEqual([
        { label: "Aster", href: "/w/A" },
        { label: sectionLabel, href: `/w/A/${section}` },
        { label },
      ]);
    }
  });

  it("returns null for a path it does not know, so the route's notFound decides", () => {
    expect(staticOwnerTrail(["unknown"], "A", "Aster")).toBeNull();
    expect(staticOwnerTrail(["projects", "p1"], "A", "Aster")).toBeNull();
    expect(staticOwnerTrail(["constructor"], "A", "Aster")).toBeNull();
    expect(staticOwnerTrail([], "A", "Aster")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/workspace/ui/owner-trail`
Expected: FAIL, the import of `./owner-trail` cannot be resolved.

- [ ] **Step 3: Write the implementation**

Create `src/features/workspace/ui/owner-trail/owner-trail.ts`:

```ts
import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";

import { OWNER_NAV_COPY } from "../owner-nav/owner-nav.copy";

export type OwnerSection =
  | "projects"
  | "clients"
  | "team"
  | "services"
  | "message-templates"
  | "photo-sources"
  | "settings"
  | "invoices"
  | "search"
  | "notifications";

const SECTION_LABELS = new Map<string, string>([
  ["projects", OWNER_NAV_COPY.projects],
  ["clients", OWNER_NAV_COPY.clients],
  ["team", OWNER_NAV_COPY.team],
  ["services", OWNER_NAV_COPY.services],
  ["message-templates", OWNER_NAV_COPY.messageTemplates],
  ["photo-sources", OWNER_NAV_COPY.photoSources],
  ["settings", OWNER_NAV_COPY.settings],
  ["invoices", OWNER_NAV_COPY.invoices],
  ["search", OWNER_NAV_COPY.search],
  ["notifications", OWNER_NAV_COPY.notifications],
]);

const SUB_PAGE_LABELS = new Map<string, string>([
  ["projects/completed", OWNER_NAV_COPY.projectTabs.completed],
  ["projects/cancelled", OWNER_NAV_COPY.projectTabs.cancelled],
  ["projects/new", OWNER_NAV_COPY.create],
  ["clients/archived", OWNER_NAV_COPY.clientTabs.archived],
  ["team/archived", OWNER_NAV_COPY.teamTabs.archived],
  ["team/roles", OWNER_NAV_COPY.teamTabs.roles],
  ["services/categories", OWNER_NAV_COPY.serviceTabs.categories],
  ["services/items", OWNER_NAV_COPY.serviceTabs.items],
]);

/** Builds an Owner breadcrumb: the workspace root, the ancestors, then the current page as plain text (F-23 R-1, R-2, R-5). @param input - workspace, ancestors and the current label @returns the crumbs */
export function ownerTrail(input: {
  workspaceId: string;
  workspaceName: string;
  ancestors: readonly BreadcrumbItem[];
  current: string;
}): readonly BreadcrumbItem[] {
  return [
    { label: input.workspaceName, href: `/w/${input.workspaceId}` },
    ...input.ancestors,
    { label: input.current },
  ];
}

/** The Dashboard is the Owner root, so its trail is the single crumb *Dasbor* (F-23 R-2). @returns the crumbs */
export function dashboardTrail(): readonly BreadcrumbItem[] {
  return [{ label: OWNER_NAV_COPY.dashboard }];
}

/** A linked crumb for a workspace section, e.g. *Proyek*. @param workspaceId - the verified route workspace @param section - the section segment @returns the crumb */
export function sectionCrumb(workspaceId: string, section: OwnerSection): BreadcrumbItem {
  return { label: SECTION_LABELS.get(section) ?? section, href: `/w/${workspaceId}/${section}` };
}

/** A linked crumb for a project's detail page. @param workspaceId - the verified route workspace @param projectId - the project id @param title - the project title @returns the crumb */
export function projectCrumb(workspaceId: string, projectId: string, title: string): BreadcrumbItem {
  return { label: title, href: `/w/${workspaceId}/projects/${projectId}` };
}

/** The trail of a route whose labels are fixed: a section, a section tab, or *Proyek baru* (F-23 R-4). @param segments - the path below `/w/[id]` @param workspaceId - the verified route workspace @param workspaceName - its name @returns the crumbs, or null for an unknown path */
export function staticOwnerTrail(
  segments: readonly string[],
  workspaceId: string,
  workspaceName: string,
): readonly BreadcrumbItem[] | null {
  const [section, sub] = segments;
  if (section === undefined || !SECTION_LABELS.has(section) || segments.length > 2) return null;
  if (sub === undefined) {
    const current = SECTION_LABELS.get(section) ?? section;
    return ownerTrail({ workspaceId, workspaceName, ancestors: [], current });
  }
  const current = SUB_PAGE_LABELS.get(`${section}/${sub}`);
  if (current === undefined) return null;
  const ancestors = [sectionCrumb(workspaceId, section as OwnerSection)];
  return ownerTrail({ workspaceId, workspaceName, ancestors, current });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/features/workspace/ui/owner-trail`
Expected: PASS, 5 tests.

- [ ] **Step 5: Format, lint, typecheck**

```bash
npx prettier --write src/features/workspace/ui/owner-trail/owner-trail.ts src/features/workspace/ui/owner-trail/owner-trail.test.ts
```
```bash
npx eslint src/features/workspace/ui/owner-trail/owner-trail.ts src/features/workspace/ui/owner-trail/owner-trail.test.ts
```
```bash
pnpm typecheck
```
Expected: no eslint errors; typecheck exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/features/workspace/ui/owner-trail/owner-trail.ts src/features/workspace/ui/owner-trail/owner-trail.test.ts
git commit -m "feat(workspace): add owner breadcrumb builder" -m "Co-Authored-By: <the session's attribution line>"
```

---

### Task 2: Cache the shared loaders

**Covers:** ADR-025 point 3 (the slot and the page share one query); AC-CRUMB-012 stays enforced by the same loaders.

**Files:**
- Modify: `src/composition/workspace/owner-workspace/owner-workspace.ts`
- Modify: `src/composition/booking/project-flow/project-flow.ts`
- Modify: `src/composition/booking/catalog-flow/catalog-flow.ts`
- Modify: `src/composition/gallery/gallery-flow/gallery-flow.ts`
- Modify: `src/composition/gallery/selection-owner-flow/selection-owner-flow.ts`

**Interfaces:**
- Produces: the same exported names with the same parameters and return types, now wrapped in React `cache()`: `verifyOwnerWorkspace`, `loadProjectDetail`, `loadServiceDetail`, `loadGalleryPage`, `loadSelectionGroups`, `loadSelectionGroupDetail`. Callers do not change.

Why: `cache()` makes two calls with the same arguments in one server request run once. Outside a server render (tests, server actions) it simply calls the function. These modules start with `import "server-only"` and are not `"use server"` files, so exporting a `const` is allowed.

The pattern for every loader is the same three edits:
1. add `import { cache } from "react";` after the existing `import "server-only";` line and its blank line;
2. rename `export async function X(` to `async function XUncached(`;
3. add `export const X = cache(XUncached);` right after that function's closing `}`.

- [ ] **Step 1: `owner-workspace.ts`**

Edit 1: replace
```ts
import "server-only";

import { notFound, redirect } from "next/navigation";
```
with
```ts
import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";
```

Edit 2: replace
```ts
export async function verifyOwnerWorkspace(rawId: string): Promise<VerifiedWorkspace> {
```
with
```ts
async function verifyOwnerWorkspaceUncached(rawId: string): Promise<VerifiedWorkspace> {
```

Edit 3: replace
```ts
/** Verifies a workspace and conditionally records it as opened for a normal workspace page. @param rawId - untrusted route ID @returns the verified workspace context and summary */
export async function enterWorkspace(rawId: string): Promise<VerifiedWorkspace> {
```
with
```ts
/** Verifies a workspace for an owner without writing last-opened state; one lookup per request (ADR-025). */
export const verifyOwnerWorkspace = cache(verifyOwnerWorkspaceUncached);

/** Verifies a workspace and conditionally records it as opened for a normal workspace page. @param rawId - untrusted route ID @returns the verified workspace context and summary */
export async function enterWorkspace(rawId: string): Promise<VerifiedWorkspace> {
```

- [ ] **Step 2: `project-flow.ts`**

Edit 1: replace
```ts
import "server-only";

import { notFound } from "next/navigation";
```
with
```ts
import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";
```

Edit 2: replace
```ts
export async function loadProjectDetail(rawWorkspaceId: string, rawProjectId: string) {
```
with
```ts
async function loadProjectDetailUncached(rawWorkspaceId: string, rawProjectId: string) {
```

Edit 3: replace
```ts
    return saveError(error, verified.context.workspaceId, "detail");
  }
}
```
with
```ts
    return saveError(error, verified.context.workspaceId, "detail");
  }
}

/** Loads a project's detail; one lookup per request (ADR-025). */
export const loadProjectDetail = cache(loadProjectDetailUncached);
```
Before Edit 3, run `grep -n '"detail");' src/composition/booking/project-flow/project-flow.ts` and check it prints exactly one line. If it prints more than one, stop and report.

- [ ] **Step 3: `catalog-flow.ts`**

Edit 1: replace
```ts
import "server-only";

import { notFound } from "next/navigation";
```
with
```ts
import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";
```

Edit 2: replace
```ts
export async function loadServiceDetail(
  rawWorkspaceId: string,
  rawServiceId: string,
): Promise<ServiceDetailData> {
```
with
```ts
async function loadServiceDetailUncached(
  rawWorkspaceId: string,
  rawServiceId: string,
): Promise<ServiceDetailData> {
```

Edit 3: run `sed -n '/async function loadServiceDetailUncached/,/^}/p' src/composition/booking/catalog-flow/catalog-flow.ts` to see the whole function. Right after its closing `}` line (the first line that is exactly `}` after the function start), insert:
```ts

/** Loads a service's detail; one lookup per request (ADR-025). */
export const loadServiceDetail = cache(loadServiceDetailUncached);
```

- [ ] **Step 4: `gallery-flow.ts`**

Edit 1: replace
```ts
import "server-only";

import { createGallery }
```
with
```ts
import "server-only";

import { cache } from "react";

import { createGallery }
```

Edit 2: replace
```ts
export async function loadGalleryPage(rawWorkspaceId: string, rawProjectId: string) {
```
with
```ts
async function loadGalleryPageUncached(rawWorkspaceId: string, rawProjectId: string) {
```

Edit 3: run `sed -n '/async function loadGalleryPageUncached/,/^}/p' src/composition/gallery/gallery-flow/gallery-flow.ts`. Right after its closing `}` line, insert:
```ts

/** Loads the gallery page of a project; one lookup per request (ADR-025). */
export const loadGalleryPage = cache(loadGalleryPageUncached);
```

- [ ] **Step 5: `selection-owner-flow.ts`**

Edit 1: replace
```ts
import "server-only";

import { createDrizzleSelectionOwnerReader }
```
with
```ts
import "server-only";

import { cache } from "react";

import { createDrizzleSelectionOwnerReader }
```

Edit 2: replace
```ts
export async function loadSelectionGroups(rawWorkspaceId: string, rawProjectId: string) {
```
with
```ts
async function loadSelectionGroupsUncached(rawWorkspaceId: string, rawProjectId: string) {
```

Edit 3: replace
```ts
    return gallerySaveError(error, verified.context.workspaceId, "selection-groups");
  }
}
```
with
```ts
    return gallerySaveError(error, verified.context.workspaceId, "selection-groups");
  }
}

/** Loads the *Pilihan klien* page; one lookup per request (ADR-025). */
export const loadSelectionGroups = cache(loadSelectionGroupsUncached);
```

Edit 4: replace
```ts
export async function loadSelectionGroupDetail(
  rawWorkspaceId: string,
  rawProjectId: string,
  rawGroupId: string,
) {
```
with
```ts
async function loadSelectionGroupDetailUncached(
  rawWorkspaceId: string,
  rawProjectId: string,
  rawGroupId: string,
) {
```

Edit 5: replace
```ts
    return gallerySaveError(error, verified.context.workspaceId, "selection-detail");
  }
}
```
with
```ts
    return gallerySaveError(error, verified.context.workspaceId, "selection-detail");
  }
}

/** Loads one group with its picks for the Owner; one lookup per request (ADR-025). */
export const loadSelectionGroupDetail = cache(loadSelectionGroupDetailUncached);
```

- [ ] **Step 6: Run the composition tests that cover these files**

```bash
npx vitest run src/composition/workspace src/composition/booking/project-flow src/composition/booking/catalog-flow src/composition/gallery/gallery-flow src/composition/gallery/selection-owner-flow
```
Expected: PASS (same count as before the change). If a folder has no tests, vitest prints "No test files found" for it; that is fine.

- [ ] **Step 7: Format, lint, typecheck**

```bash
npx prettier --write src/composition/workspace/owner-workspace/owner-workspace.ts src/composition/booking/project-flow/project-flow.ts src/composition/booking/catalog-flow/catalog-flow.ts src/composition/gallery/gallery-flow/gallery-flow.ts src/composition/gallery/selection-owner-flow/selection-owner-flow.ts
```
```bash
npx eslint src/composition/workspace/owner-workspace/owner-workspace.ts src/composition/booking/project-flow/project-flow.ts src/composition/booking/catalog-flow/catalog-flow.ts src/composition/gallery/gallery-flow/gallery-flow.ts src/composition/gallery/selection-owner-flow/selection-owner-flow.ts
```
```bash
pnpm typecheck
```
Expected: no errors. If eslint reports `import/order` for the new `react` import, run `npx eslint --fix` on that file and re-run eslint.

- [ ] **Step 8: Commit**

```bash
git add src/composition/workspace/owner-workspace/owner-workspace.ts src/composition/booking/project-flow/project-flow.ts src/composition/booking/catalog-flow/catalog-flow.ts src/composition/gallery/gallery-flow/gallery-flow.ts src/composition/gallery/selection-owner-flow/selection-owner-flow.ts
git commit -m "perf(composition): cache owner loaders per request" -m "Co-Authored-By: <the session's attribution line>"
```

---

### Task 3: Page Header accepts a rendered trail

**Covers:** plumbing for R-6; AC-CRUMB-010 (owner).

**Files:**
- Modify: `src/ui/patterns/page-header/page-header.tsx`
- Modify: `src/ui/patterns/page-header/page-header.types.ts`
- Modify: `src/ui/patterns/page-header/page-header.test.tsx`
- Modify: `src/ui/patterns/app-panel/app-panel.tsx`
- Modify: `src/ui/patterns/app-panel/app-panel.types.ts`
- Modify: `src/ui/patterns/app-shell/app-shell.tsx`
- Modify: `src/ui/patterns/app-shell/app-shell.types.ts`
- Modify: `src/ui/patterns/app-shell/app-shell.test.tsx`

**Interfaces:**
- Produces:
  - `PageHeaderTrail({ items }: { items: readonly BreadcrumbItem[] })` exported from `src/ui/patterns/page-header/page-header.tsx` (used by Tasks 4 and 5);
  - `PageHeaderProps.trail?: ReactNode`, `AppPanelProps.trail?: ReactNode`, `AppShellProps.panelTrail?: ReactNode` (used by Task 5).

- [ ] **Step 1: Write the failing tests**

In `src/ui/patterns/page-header/page-header.test.tsx`, replace
```tsx
import { PageHeader } from "./page-header";
```
with
```tsx
import { PageHeader, PageHeaderTrail } from "./page-header";
```

Then, in the same file, replace
```tsx
  it("AC-PRJ-015 puts the adornment after the title and the meta in place of the subtitle", () => {
```
with
```tsx
  it("F-23 renders a trail made elsewhere in place of the generated one", () => {
    render(
      <PageHeader
        parent="Aster"
        current="Galeri"
        title="Galeri"
        trail={
          <PageHeaderTrail
            items={[
              { label: "Aster", href: "/w/A" },
              { label: "Proyek", href: "/w/A/projects" },
              { label: "Galeri" },
            ]}
          />
        }
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveTextContent("AsterProyekGaleri");
    expect(screen.getByRole("link", { name: "Proyek" })).toHaveAttribute("href", "/w/A/projects");
    expect(screen.getAllByRole("navigation", { name: "Breadcrumb" })).toHaveLength(1);
  });

  it("AC-CRUMB-010 a crumb without href is plain text and not focusable", () => {
    render(
      <PageHeader
        parent="Beranda"
        current="Tinjau"
        title="Foto cetak"
        breadcrumbs={[
          { label: "Beranda", href: "/g/T" },
          { label: "Foto cetak" },
          { label: "Tinjau" },
        ]}
      />,
    );

    expect(screen.queryByRole("link", { name: "Foto cetak" })).toBeNull();
    expect(screen.getByText("Foto cetak", { selector: "span" })).not.toHaveAttribute("tabindex");
    expect(screen.getByText("Tinjau")).toHaveAttribute("aria-current", "page");
  });

  it("AC-PRJ-015 puts the adornment after the title and the meta in place of the subtitle", () => {
```

In `src/ui/patterns/app-shell/app-shell.test.tsx`, replace
```tsx
  it("uses mobileSubtitle for the mobile header and falls back to subtitle", () => {
```
with
```tsx
  it("F-23 passes a server-rendered trail to the desktop page header", () => {
    render(
      <AppShell {...props} title="Galeri" panelTrail={<span>Jejak server</span>}>
        <p>isi</p>
      </AppShell>,
    );

    expect(screen.getByText("Jejak server")).toBeInTheDocument();
  });

  it("uses mobileSubtitle for the mobile header and falls back to subtitle", () => {
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/ui/patterns/page-header src/ui/patterns/app-shell`
Expected: FAIL. `PageHeaderTrail` is not exported, and `panelTrail` is not a known prop (the type error shows in typecheck; at runtime "Jejak server" is not found).

- [ ] **Step 3: `page-header.types.ts`**

Replace
```ts
  utilities?: ReactNode;
  tabs?: { readonly label: string; readonly tabs: readonly TabLink[] };
```
with
```ts
  utilities?: ReactNode;
  /** A trail rendered elsewhere (the Owner `@crumbs` slot, ADR-025); replaces the one built from `breadcrumbs`. */
  trail?: ReactNode;
  tabs?: { readonly label: string; readonly tabs: readonly TabLink[] };
```

- [ ] **Step 4: `page-header.tsx`**

Edit 1: replace
```tsx
  utilities,
  tabs,
  isFlush = false,
}: Readonly<PageHeaderProps>) {
```
with
```tsx
  utilities,
  trail,
  tabs,
  isFlush = false,
}: Readonly<PageHeaderProps>) {
```

Edit 2: replace
```tsx
      <BreadcrumbRow items={breadcrumbItems} utilities={utilities} isFlush={isFlush} />
```
with
```tsx
      <BreadcrumbRow
        trail={trail ?? <PageHeaderTrail items={breadcrumbItems} />}
        utilities={utilities}
        isFlush={isFlush}
      />
```

Edit 3: replace
```tsx
function BreadcrumbRow({
  items,
  utilities,
  isFlush,
}: Readonly<{
  items: readonly BreadcrumbItem[];
  utilities: PageHeaderProps["utilities"];
  isFlush: boolean;
}>) {
```
with
```tsx
/** The Page Header breadcrumb, also rendered on the server by the Owner `@crumbs` slot (ADR-025). @param props - the crumbs; the last one is current @returns the trail */
export function PageHeaderTrail({ items }: Readonly<{ items: readonly BreadcrumbItem[] }>) {
  return (
    <BreadcrumbTrail
      label={PAGE_HEADER_COPY.breadcrumb}
      items={items}
      className="min-h-(--space-10) flex-1"
    />
  );
}

function BreadcrumbRow({
  trail,
  utilities,
  isFlush,
}: Readonly<{
  trail: ReactNode;
  utilities: PageHeaderProps["utilities"];
  isFlush: boolean;
}>) {
```

Edit 4: replace
```tsx
      <BreadcrumbTrail
        label={PAGE_HEADER_COPY.breadcrumb}
        items={items}
        className="min-h-(--space-10) flex-1"
      />
      {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
```
with
```tsx
      {trail}
      {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
```

Edit 5: replace
```tsx
import { cn } from "@/ui/cn/cn";
```
with
```tsx
import type { ReactNode } from "react";

import { cn } from "@/ui/cn/cn";
```

- [ ] **Step 5: `app-panel.types.ts` and `app-panel.tsx`**

In `app-panel.types.ts`, replace
```ts
  tabs?: NonNullable<PageHeaderProps["tabs"]>;
  children: ReactNode;
```
with
```ts
  tabs?: NonNullable<PageHeaderProps["tabs"]>;
  trail?: ReactNode;
  children: ReactNode;
```

In `app-panel.tsx`, replace
```tsx
  tabs,
  children,
}: Readonly<AppPanelProps>) {
```
with
```tsx
  tabs,
  trail,
  children,
}: Readonly<AppPanelProps>) {
```
and replace
```tsx
        action={actions}
        tabs={tabs}
      />
```
with
```tsx
        action={actions}
        tabs={tabs}
        trail={trail}
      />
```

- [ ] **Step 6: `app-shell.types.ts` and `app-shell.tsx`**

In `app-shell.types.ts`, replace
```ts
  panelBreadcrumbs?: NonNullable<PageHeaderProps["breadcrumbs"]>;
```
with
```ts
  panelBreadcrumbs?: NonNullable<PageHeaderProps["breadcrumbs"]>;
  /** A trail rendered on the server (ADR-025); wins over `panelBreadcrumbs`. */
  panelTrail?: ReactNode;
```

In `app-shell.tsx`:

Edit 1: replace
```tsx
  panelBreadcrumbs,
  mobileBottomNav,
```
with
```tsx
  panelBreadcrumbs,
  panelTrail,
  mobileBottomNav,
```

Edit 2: replace
```tsx
        panelBreadcrumbs={panelBreadcrumbs}
      >
        {children}
      </DesktopContent>
```
with
```tsx
        panelBreadcrumbs={panelBreadcrumbs}
        panelTrail={panelTrail}
      >
        {children}
      </DesktopContent>
```

Edit 3: replace
```tsx
  panelBreadcrumbs,
  children,
}: Readonly<{
```
with
```tsx
  panelBreadcrumbs,
  panelTrail,
  children,
}: Readonly<{
```

Edit 4: replace
```tsx
  panelBreadcrumbs: AppShellProps["panelBreadcrumbs"];
  children: AppShellProps["children"];
```
with
```tsx
  panelBreadcrumbs: AppShellProps["panelBreadcrumbs"];
  panelTrail: AppShellProps["panelTrail"];
  children: AppShellProps["children"];
```

Edit 5: replace
```tsx
        breadcrumbs={panelBreadcrumbs}
      >
        <PageContent>{children}</PageContent>
```
with
```tsx
        breadcrumbs={panelBreadcrumbs}
        trail={panelTrail}
      >
        <PageContent>{children}</PageContent>
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/ui/patterns/page-header src/ui/patterns/app-panel src/ui/patterns/app-shell`
Expected: PASS.

- [ ] **Step 8: Format, lint, typecheck**

```bash
npx prettier --write src/ui/patterns/page-header/page-header.tsx src/ui/patterns/page-header/page-header.types.ts src/ui/patterns/page-header/page-header.test.tsx src/ui/patterns/app-panel/app-panel.tsx src/ui/patterns/app-panel/app-panel.types.ts src/ui/patterns/app-shell/app-shell.tsx src/ui/patterns/app-shell/app-shell.types.ts src/ui/patterns/app-shell/app-shell.test.tsx
```
```bash
npx eslint src/ui/patterns/page-header/page-header.tsx src/ui/patterns/page-header/page-header.types.ts src/ui/patterns/page-header/page-header.test.tsx src/ui/patterns/app-panel/app-panel.tsx src/ui/patterns/app-panel/app-panel.types.ts src/ui/patterns/app-shell/app-shell.tsx src/ui/patterns/app-shell/app-shell.types.ts src/ui/patterns/app-shell/app-shell.test.tsx
```
```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/ui/patterns/page-header/page-header.tsx src/ui/patterns/page-header/page-header.types.ts src/ui/patterns/page-header/page-header.test.tsx src/ui/patterns/app-panel/app-panel.tsx src/ui/patterns/app-panel/app-panel.types.ts src/ui/patterns/app-shell/app-shell.tsx src/ui/patterns/app-shell/app-shell.types.ts src/ui/patterns/app-shell/app-shell.test.tsx
git commit -m "feat(ui): let the page header take a server-rendered trail" -m "Co-Authored-By: <the session's attribution line>"
```

---

### Task 4: The `@crumbs` slot routes

**Covers:** AC-CRUMB-001…006 (trails exist on the server; the layout does not show them until Task 5).

**Files (all new):** under `src/app/(owner)/w/[workspaceId]/@crumbs/`:
- `default.tsx`
- `page.tsx`
- `[...segments]/page.tsx`
- `projects/new/page.tsx`, `projects/completed/page.tsx`, `projects/cancelled/page.tsx`
- `services/categories/page.tsx`, `services/items/page.tsx`
- `projects/[projectId]/page.tsx`
- `projects/[projectId]/gallery/page.tsx`
- `projects/[projectId]/gallery/picks/page.tsx`
- `projects/[projectId]/gallery/picks/[groupId]/page.tsx`
- `services/[serviceId]/page.tsx`
- `message-templates/[templateType]/page.tsx`

**Interfaces:**
- Consumes: Task 1 builder; Task 2 cached loaders; Task 3 `PageHeaderTrail`; `GALLERY_COPY.pageTitle` (`@/features/gallery/ui/gallery-copy/gallery-copy.copy`), `SELECTION_OWNER_COPY.cardTitle` (`@/features/gallery/ui/selection-owner-text/selection-owner.copy`), `messageTemplateSubPages(workspaceId)` (`@/features/communications/ui/template-sub-pages/template-sub-pages`, returns `{ path, title, … }[]`).
- Produces: the layout prop `crumbs` (Next passes it to `layout.tsx`; Task 5 uses it).

Background (read once): a folder named `@crumbs` is a Next.js **parallel route slot**. It mirrors the URLs under `/w/[workspaceId]`, and Next renders the matching slot page next to the real page and hands it to the layout as the `crumbs` prop. Next 16 requires `default.tsx` in every slot. A static folder (`projects/new`) wins over a dynamic one (`projects/[projectId]`), and both win over the catch-all `[...segments]`. That is why the mirrors exist: without `projects/new`, the slot `projects/[projectId]` would treat `new` as a project id.

- [ ] **Step 1: Create `default.tsx`**

`src/app/(owner)/w/[workspaceId]/@crumbs/default.tsx`:
```tsx
// Next 16 requires a default for every parallel route slot; no trail when nothing matches.
export default function CrumbsDefault() {
  return null;
}
```

- [ ] **Step 2: Create the Dashboard slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/page.tsx`:
```tsx
import { dashboardTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default function DashboardCrumbs() {
  return <PageHeaderTrail items={dashboardTrail()} />;
}
```

- [ ] **Step 3: Create the catch-all slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/[...segments]/page.tsx`:
```tsx
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { staticOwnerTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function StaticCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; segments: string[] }> }>) {
  const { workspaceId, segments } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const items = staticOwnerTrail(segments, workspaceId, verified.workspace.name);
  return items ? <PageHeaderTrail items={items} /> : null;
}
```

- [ ] **Step 4: Create the five static mirrors**

Each mirror is the catch-all with fixed segments. Create these five files. They differ only in the function name and the two strings in `segments`.

`src/app/(owner)/w/[workspaceId]/@crumbs/projects/new/page.tsx`:
```tsx
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { staticOwnerTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

// Mirror: without it the dynamic slot `projects/[projectId]` would capture `new`.
export default async function NewProjectCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const items = staticOwnerTrail(["projects", "new"], workspaceId, verified.workspace.name);
  return items ? <PageHeaderTrail items={items} /> : null;
}
```

`src/app/(owner)/w/[workspaceId]/@crumbs/projects/completed/page.tsx`: same code, with function name `CompletedProjectsCrumbs` and `["projects", "completed"]`.

`src/app/(owner)/w/[workspaceId]/@crumbs/projects/cancelled/page.tsx`: same code, with function name `CancelledProjectsCrumbs` and `["projects", "cancelled"]`.

`src/app/(owner)/w/[workspaceId]/@crumbs/services/categories/page.tsx`: same code, with function name `ServiceCategoriesCrumbs`, `["services", "categories"]`, and the comment `// Mirror: without it the dynamic slot \`services/[serviceId]\` would capture \`categories\`.`

`src/app/(owner)/w/[workspaceId]/@crumbs/services/items/page.tsx`: same code, with function name `ServiceItemsCrumbs`, `["services", "items"]`, and the comment `// Mirror: without it the dynamic slot \`services/[serviceId]\` would capture \`items\`.`

Write each file out in full. Do not import one mirror from another.

- [ ] **Step 5: Create the project detail slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/projects/[projectId]/page.tsx`:
```tsx
import { loadProjectDetail } from "@/composition/booking/project-flow/project-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { ownerTrail, sectionCrumb } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function ProjectCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, project] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadProjectDetail(workspaceId, projectId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [sectionCrumb(workspaceId, "projects")],
    current: project.title,
  });
  return <PageHeaderTrail items={items} />;
}
```

- [ ] **Step 6: Create the gallery slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/projects/[projectId]/gallery/page.tsx`:
```tsx
import { loadGalleryPage } from "@/composition/gallery/gallery-flow/gallery-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import {
  ownerTrail,
  projectCrumb,
  sectionCrumb,
} from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function GalleryCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, page] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadGalleryPage(workspaceId, projectId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects"),
      projectCrumb(workspaceId, projectId, page.project.title),
    ],
    current: GALLERY_COPY.pageTitle,
  });
  return <PageHeaderTrail items={items} />;
}
```

- [ ] **Step 7: Create the picks slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/projects/[projectId]/gallery/picks/page.tsx`:
```tsx
import { loadSelectionGroups } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { SELECTION_OWNER_COPY } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";
import {
  ownerTrail,
  projectCrumb,
  sectionCrumb,
} from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function PicksCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, page] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadSelectionGroups(workspaceId, projectId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects"),
      projectCrumb(workspaceId, projectId, page.projectTitle),
      {
        label: GALLERY_COPY.pageTitle,
        href: `/w/${workspaceId}/projects/${projectId}/gallery`,
      },
    ],
    current: SELECTION_OWNER_COPY.cardTitle,
  });
  return <PageHeaderTrail items={items} />;
}
```

- [ ] **Step 8: Create the picks group slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/projects/[projectId]/gallery/picks/[groupId]/page.tsx`:
```tsx
import { loadSelectionGroupDetail } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { SELECTION_OWNER_COPY } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";
import {
  ownerTrail,
  projectCrumb,
  sectionCrumb,
} from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function PicksGroupCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string; groupId: string }> }>) {
  const { workspaceId, projectId, groupId } = await params;
  const [verified, detail] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadSelectionGroupDetail(workspaceId, projectId, groupId),
  ]);
  const gallery = `/w/${workspaceId}/projects/${projectId}/gallery`;
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects"),
      projectCrumb(workspaceId, projectId, detail.projectTitle),
      { label: GALLERY_COPY.pageTitle, href: gallery },
      { label: SELECTION_OWNER_COPY.cardTitle, href: `${gallery}/picks` },
    ],
    current: detail.group.name,
  });
  return <PageHeaderTrail items={items} />;
}
```

- [ ] **Step 9: Create the service detail slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/services/[serviceId]/page.tsx`:
```tsx
import { loadServiceDetail } from "@/composition/booking/catalog-flow/catalog-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { ownerTrail, sectionCrumb } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function ServiceCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; serviceId: string }> }>) {
  const { workspaceId, serviceId } = await params;
  const [verified, service] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadServiceDetail(workspaceId, serviceId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [sectionCrumb(workspaceId, "services")],
    current: service.name,
  });
  return <PageHeaderTrail items={items} />;
}
```

- [ ] **Step 10: Create the template editor slot page**

`src/app/(owner)/w/[workspaceId]/@crumbs/message-templates/[templateType]/page.tsx`:
```tsx
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { messageTemplateSubPages } from "@/features/communications/ui/template-sub-pages/template-sub-pages";
import { ownerTrail, sectionCrumb } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function TemplateCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; templateType: string }> }>) {
  const { workspaceId, templateType } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const path = `/w/${workspaceId}/message-templates/${templateType}`;
  const page = messageTemplateSubPages(workspaceId).find((subPage) => subPage.path === path);
  if (!page) return null;
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [sectionCrumb(workspaceId, "message-templates")],
    current: page.title,
  });
  return <PageHeaderTrail items={items} />;
}
```

- [ ] **Step 11: Check the project title field**

Run: `grep -n "title" src/features/booking/application/use-cases/get-project-detail/get-project-detail.types.ts`
Expected: a `title` field on the returned project view. If the file name differs, run `grep -rn "export async function getProjectDetail" src/features/booking` and open its `.types.ts`. If there is no `title`, stop and report (Step 5 uses `project.title`, the same field the project page uses).

- [ ] **Step 12: Format, lint, typecheck**

```bash
npx prettier --write "src/app/(owner)/w/[workspaceId]/@crumbs"
```
```bash
npx eslint "src/app/(owner)/w/[workspaceId]/@crumbs"
```
```bash
pnpm typecheck
```
Expected: no errors. `next typegen` (part of `pnpm typecheck`) now also knows the `crumbs` slot.

- [ ] **Step 13: Commit**

```bash
git add "src/app/(owner)/w/[workspaceId]/@crumbs"
git commit -m "feat(shell): add the server-rendered owner breadcrumb slot" -m "Co-Authored-By: <the session's attribution line>"
```

---

### Task 5: Switch the Owner shell to the slot

**Covers:** AC-CRUMB-001…007, 011, 012; AC-CRUMB-014 (owner, unchanged mechanism).

**Files:**
- Modify: `src/app/(owner)/w/[workspaceId]/layout.tsx`
- Modify: `src/app/(owner)/profile/layout.tsx`
- Modify: `src/features/workspace/ui/owner-shell/owner-shell.tsx`
- Modify: `src/features/workspace/ui/owner-shell/owner-shell.types.ts`
- Modify: `src/features/workspace/ui/owner-shell/owner-shell.test.tsx`
- Modify: `src/features/workspace/ui/owner-nav/owner-nav.tsx`
- Modify: `src/features/workspace/ui/owner-nav/owner-nav.types.ts`
- Modify: `src/features/workspace/ui/owner-nav/owner-nav.test.tsx`
- Modify: `src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx`
- Modify: `tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts`

**Interfaces:**
- Consumes: `crumbs` slot prop (Task 4), `AppShellProps.panelTrail` (Task 3), `PageHeaderTrail` (Task 3).
- Produces: `OwnerShellProps.trail?: ReactNode`.

- [ ] **Step 1: Write the failing test**

In `src/features/workspace/ui/owner-shell/owner-shell.test.tsx`, replace
```tsx
  it("AC-PRJ-007 the phone create action opens Proyek baru", async () => {
```
with
```tsx
  it("F-23 shows the trail it is given, not one built in the browser", () => {
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
        trail={<span>Aster Wedding › Template pesan › Bagikan gallery</span>}
      >
        <PageHeadingOverride
          title="Wisuda Basic"
          parent={{ label: "Layanan", href: "/w/A/services" }}
        />
        <p>isi</p>
      </OwnerShell>,
    );

    expect(screen.getByText("Aster Wedding › Template pesan › Bagikan gallery")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute("href", "/w/A/services");
  });

  it("AC-PRJ-007 the phone create action opens Proyek baru", async () => {
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/workspace/ui/owner-shell`
Expected: FAIL, the trail text is not found (`trail` is not used yet).

- [ ] **Step 3: `owner-shell.types.ts`**

Replace
```ts
  subPages?: readonly OwnerSubPage[];
}
```
with
```ts
  subPages?: readonly OwnerSubPage[];
  /** The breadcrumb rendered on the server (`@crumbs` slot or the profile layout, ADR-025). */
  trail?: ReactNode;
}
```

- [ ] **Step 4: `owner-shell.tsx`**

Edit 1: replace
```tsx
  logoutAction,
  subPages,
}: Readonly<OwnerShellProps>) {
```
with
```tsx
  logoutAction,
  subPages,
  trail,
}: Readonly<OwnerShellProps>) {
```

Edit 2: replace
```tsx
  let shellSubPage: AppShellSubPage | undefined;
  let panelBreadcrumbs: readonly BreadcrumbItem[] | undefined;
  if (headingOverride) {
    shellSubPage = {
      parent: headingOverride.parent,
      hidesBottomNav: headingOverride.hidesBottomNav,
    };
  } else if (subPage) shellSubPage = { parent: subPage.parent };
  if (headingOverride) {
    panelBreadcrumbs = [headingOverride.parent, { label: headingOverride.title }];
  } else if (subPage) {
    panelBreadcrumbs = [subPage.parent, { label: subPage.title }];
  } else if ("breadcrumbs" in heading) {
    panelBreadcrumbs = heading.breadcrumbs;
  }
  const panelTabs
```
with
```tsx
  let shellSubPage: AppShellSubPage | undefined;
  if (headingOverride) {
    shellSubPage = {
      parent: headingOverride.parent,
      hidesBottomNav: headingOverride.hidesBottomNav,
    };
  } else if (subPage) shellSubPage = { parent: subPage.parent };
  const panelTabs
```

Edit 3: replace
```tsx
          panelBreadcrumbs={panelBreadcrumbs}
          panelTabs={panelTabs}
```
with
```tsx
          panelTrail={trail}
          panelTabs={panelTabs}
```

Edit 4: replace
```tsx
import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";
```
with nothing (delete the line).

- [ ] **Step 5: `owner-nav.types.ts` and `owner-nav.tsx`**

In `owner-nav.types.ts`:

Replace
```ts
import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";
import type { TabLink } from "@/ui/patterns/tabs/tabs.types";
```
with
```ts
import type { TabLink } from "@/ui/patterns/tabs/tabs.types";
```
and replace
```ts
  mobileSubtitle?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  tabs?: {
```
with
```ts
  mobileSubtitle?: string;
  tabs?: {
```

In `owner-nav.tsx`:

Edit 1: replace
```tsx
  if (section === "services") return resolveServicesHeading(pathname, prefix, workspaceName);
```
with
```tsx
  if (section === "services") return resolveServicesHeading(pathname, prefix);
```

Edit 2: replace
```tsx
function resolveServicesHeading(
  pathname: string,
  prefix: string,
  workspaceName: string,
): PageHeading {
```
with
```tsx
function resolveServicesHeading(pathname: string, prefix: string): PageHeading {
```

Edit 3: replace
```tsx
  return {
    title: activeTab.label,
    subtitle: OWNER_NAV_COPY.servicesSubtitle,
    breadcrumbs: [
      { label: workspaceName, href: prefix },
      ...(rest === "" ? [] : [{ label: OWNER_NAV_COPY.services, href: servicesPrefix }]),
      { label: activeTab.label },
    ],
    tabs: { label: OWNER_NAV_COPY.servicesTabsLabel, tabs },
  };
```
with
```tsx
  return {
    title: activeTab.label,
    subtitle: OWNER_NAV_COPY.servicesSubtitle,
    tabs: { label: OWNER_NAV_COPY.servicesTabsLabel, tabs },
  };
```

- [ ] **Step 6: `owner-nav.test.tsx`**

Edit 1: replace
```tsx
        subtitle: OWNER_NAV_COPY.servicesSubtitle,
        breadcrumbs: [{ label: "Aster", href: "/w/A" }, { label: "Layanan" }],
        tabs: {
```
with
```tsx
        subtitle: OWNER_NAV_COPY.servicesSubtitle,
        tabs: {
```

Edit 2: replace
```tsx
        subtitle: OWNER_NAV_COPY.servicesSubtitle,
        breadcrumbs: [
          { label: "Aster", href: "/w/A" },
          { label: "Layanan", href: "/w/A/services" },
          { label: "Item paket" },
        ],
        tabs: {
```
with
```tsx
        subtitle: OWNER_NAV_COPY.servicesSubtitle,
        tabs: {
```

Edit 3: delete these two tests (the builder tests in Task 1 replace them). Replace
```tsx
  it("builds the catalog hierarchy for service categories", () => {
    expect(resolvePageHeading("/w/A/services/categories", "A", "Aster")).toMatchObject({
      breadcrumbs: [
        { label: "Aster", href: "/w/A" },
        { label: "Layanan", href: "/w/A/services" },
        { label: "Kategori" },
      ],
    });
  });

  it("builds the catalog hierarchy for service items", () => {
    expect(resolvePageHeading("/w/A/services/items", "A", "Aster")).toMatchObject({
      breadcrumbs: [
        { label: "Aster", href: "/w/A" },
        { label: "Layanan", href: "/w/A/services" },
        { label: "Item paket" },
      ],
    });
  });
});
```
with
```tsx
});
```

- [ ] **Step 7: The two layouts**

`src/app/(owner)/w/[workspaceId]/layout.tsx`:

Edit 1: replace
```tsx
export default async function WorkspaceLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ workspaceId: string }> }>) {
```
with
```tsx
export default async function WorkspaceLayout({
  children,
  crumbs,
  params,
}: Readonly<{ children: ReactNode; crumbs: ReactNode; params: Promise<{ workspaceId: string }> }>) {
```

Edit 2: replace
```tsx
      subPages={messageTemplateSubPages(workspaceId)}
    >
```
with
```tsx
      subPages={messageTemplateSubPages(workspaceId)}
      trail={crumbs}
    >
```

`src/app/(owner)/profile/layout.tsx`:

Edit 1: replace
```tsx
import { OwnerShell } from "@/features/workspace/ui/owner-shell/owner-shell";
```
with
```tsx
import { OwnerShell } from "@/features/workspace/ui/owner-shell/owner-shell";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";
```

Edit 2: replace
```tsx
      logoutAction={logoutAction}
    >
```
with
```tsx
      logoutAction={logoutAction}
      trail={<PageHeaderTrail items={[{ label: PROFILE_LAYOUT_COPY.title }]} />}
    >
```

- [ ] **Step 8: Service detail page copy**

In `src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx`:

Replace
```tsx
        parent={{ label: "Layanan", href: `/w/${workspaceId}/services` }}
```
with
```tsx
        parent={{ label: OWNER_NAV_COPY.services, href: `/w/${workspaceId}/services` }}
```
and add this import line directly after the line that imports `PageHeadingOverride`:
```tsx
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
```

- [ ] **Step 9: e2e expectation for the Dashboard**

In `tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts`, replace
```ts
        await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText(
          /Aster Wedding\s*Dasbor/,
        );
```
with
```ts
        await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText(/^\s*Dasbor\s*$/);
```

Then check the two other breadcrumb expectations in the same file still hold:
- line near 39 (`toContainText(name)` after creating a workspace): the dashboard trail is now *Dasbor* only, so the workspace name is no longer in the breadcrumb. Replace
```ts
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(name);
```
with
```ts
  await expect(page.getByRole("button", { name }).first()).toBeVisible();
```
- line near 120 (`toContainText("Aster Wedding")`): run `sed -n '110,125p' tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts`. If that check runs on the Dashboard, replace its `page.getByRole("navigation", { name: "Breadcrumb" })` with `page.getByRole("button", { name: "Aster Wedding" }).first()` and `toContainText("Aster Wedding")` with `toBeVisible()`. If it runs on another page (for example `/clients`), leave it: that trail still starts with *Aster Wedding*.

- [ ] **Step 10: Run the related unit tests**

Run: `npx vitest run src/features/workspace/ui/owner-shell src/features/workspace/ui/owner-nav src/features/workspace/ui/owner-trail src/ui/patterns/page-header src/ui/patterns/app-shell`
Expected: PASS.

- [ ] **Step 11: Format, lint, typecheck**

```bash
npx prettier --write "src/app/(owner)/w/[workspaceId]/layout.tsx" "src/app/(owner)/profile/layout.tsx" src/features/workspace/ui/owner-shell/owner-shell.tsx src/features/workspace/ui/owner-shell/owner-shell.types.ts src/features/workspace/ui/owner-shell/owner-shell.test.tsx src/features/workspace/ui/owner-nav/owner-nav.tsx src/features/workspace/ui/owner-nav/owner-nav.types.ts src/features/workspace/ui/owner-nav/owner-nav.test.tsx "src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx" tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts
```
```bash
npx eslint "src/app/(owner)/w/[workspaceId]/layout.tsx" "src/app/(owner)/profile/layout.tsx" src/features/workspace/ui/owner-shell src/features/workspace/ui/owner-nav "src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx" tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts
```
```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 12: Run the shell e2e spec**

Run: `npx playwright test tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts`
Expected: PASS. Playwright starts `pnpm dev` itself (it reuses a running server). If the server cannot start or the database is unreachable, stop and report the error; do not change the tests to make them pass.

- [ ] **Step 13: Check the server HTML (AC-CRUMB-011)**

With the dev server running (Playwright leaves none running; start it in the Browser pane with `preview_start` if the session has it, or skip this step and say so in the report): open a project's gallery URL directly, then use `get_page_text` and check that the breadcrumb reads `{workspace} › Proyek › {project} › Galeri` on the first load.

- [ ] **Step 14: Commit**

```bash
git add "src/app/(owner)/w/[workspaceId]/layout.tsx" "src/app/(owner)/profile/layout.tsx" src/features/workspace/ui/owner-shell/owner-shell.tsx src/features/workspace/ui/owner-shell/owner-shell.types.ts src/features/workspace/ui/owner-shell/owner-shell.test.tsx src/features/workspace/ui/owner-nav/owner-nav.tsx src/features/workspace/ui/owner-nav/owner-nav.types.ts src/features/workspace/ui/owner-nav/owner-nav.test.tsx "src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx" tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts
git commit -m "feat(shell): render the owner breadcrumb from the server slot" -m "Co-Authored-By: <the session's attribution line>"
```

---

### Task 6: Client trails and Beranda always present

**Covers:** AC-CRUMB-008, 009, 010 (client), 014 (client).

**Files:**
- Modify: `src/features/gallery/ui/review-screen/review-text.ts`
- Create: `src/features/gallery/ui/review-screen/review-text.test.ts`
- Modify: `src/app/(client)/g/[token]/page.tsx`
- Modify: `src/features/gallery/ui/client-browse-screen/client-browse-screen.tsx`
- Modify: `src/features/gallery/ui/client-browse-screen/client-browse-screen.types.ts`
- Modify: `src/features/gallery/ui/client-browse-screen/client-browse-screen.test.tsx`
- Modify: `src/app/(client)/g/[token]/photos/page.tsx`
- Modify: `src/features/gallery/domain/client-home/client-home.ts`

**Interfaces:**
- Produces: `ClientBrowseScreenProps.isPhotosOnly: boolean` (replaces `hasHome`; true when Beranda holds only the *Semua foto* card).

- [ ] **Step 1: Write the failing review-text test**

Create `src/features/gallery/ui/review-screen/review-text.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import { reviewHeader } from "./review-text";

const group: PickGroupView = {
  id: "g1",
  name: "Foto cetak",
  unit: "lembar",
  mode: "QUANTITY",
  allowsPickNotes: false,
  limit: 4,
  usage: 4,
  status: "OPEN",
};

describe("reviewHeader (F-23 R-5)", () => {
  it("AC-CRUMB-008 links the group crumb while the group is OPEN", () => {
    expect(reviewHeader(group, "T", true).breadcrumbs).toEqual([
      { label: "Beranda", href: "/g/T" },
      { label: "Foto cetak", href: "/g/T/picks/g1" },
      { label: "Tinjau" },
    ]);
  });

  it("AC-CRUMB-008 keeps Tinjau and drops the group link when read-only", () => {
    const header = reviewHeader({ ...group, status: "LOCKED" }, "T", false);
    expect(header.title).toBe("Foto cetak");
    expect(header.breadcrumbs).toEqual([
      { label: "Beranda", href: "/g/T" },
      { label: "Foto cetak" },
      { label: "Tinjau" },
    ]);
    expect(header.back).toEqual({ href: "/g/T", label: "Beranda" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/gallery/ui/review-screen/review-text.test.ts`
Expected: FAIL in the second test (the read-only trail has 2 crumbs today).

- [ ] **Step 3: `review-text.ts`**

Replace
```ts
    breadcrumbs: [{ label: CLIENT_COPY.home, href: home }, { label: group.name }],
    back: { href: home, label: CLIENT_COPY.home },
  };
}
```
with
```ts
    // F-23 R-5: the group's Pilih page redirects a non-OPEN group back here, so its crumb is plain text.
    breadcrumbs: [
      { label: CLIENT_COPY.home, href: home },
      { label: group.name },
      { label: COPY.breadcrumbCurrent },
    ],
    back: { href: home, label: CLIENT_COPY.home },
  };
}
```

Then replace the start of the doc comment
```ts
/** The page header of Tinjau (breadcrumb Beranda › group › Tinjau, phone *Kembali memilih*) or of the read-only view (Beranda › group, phone *Beranda*)
```
with
```ts
/** The page header of Tinjau (breadcrumb Beranda › group › Tinjau, phone *Kembali memilih*) or of the read-only view (Beranda › group, not linked › Tinjau, phone *Beranda*; F-23)
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/gallery/ui/review-screen`
Expected: PASS (the new file and the existing `review-screen.test.tsx`).

- [ ] **Step 5: Write the failing browse test**

In `src/features/gallery/ui/client-browse-screen/client-browse-screen.test.tsx`:

Edit 1: replace
```tsx
function renderScreen(
  action: ClientBrowseAction,
  initialPage: ClientBrowsePageView | null = ROOT,
  photosActions: Partial<PhotosActions> = {},
) {
```
with
```tsx
function renderScreen(
  action: ClientBrowseAction,
  initialPage: ClientBrowsePageView | null = ROOT,
  photosActions: Partial<PhotosActions> = {},
  isPhotosOnly = false,
) {
```

Edit 2: replace
```tsx
      token="T1"
      hasHome
      initialPage={initialPage}
```
with
```tsx
      token="T1"
      isPhotosOnly={isPhotosOnly}
      initialPage={initialPage}
```

Edit 3: replace
```tsx
  it("opens a folder through the action and shows its trail", async () => {
```
with
```tsx
  it("AC-CRUMB-009 keeps Beranda in the trail for a project without groups, with its own title", () => {
    renderScreen(vi.fn(), ROOT, {}, true);
    expect(screen.getAllByRole("heading", { level: 1, name: "Wisuda Rina" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lihat semua foto Anda.").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Beranda" })[0]).toHaveAttribute("href", "/g/T1");
  });

  it("opens a folder through the action and shows its trail", async () => {
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/features/gallery/ui/client-browse-screen/client-browse-screen.test.tsx`
Expected: FAIL (the prop is still `hasHome`; the new test finds no *Beranda* link).

- [ ] **Step 7: `client-browse-screen.types.ts`**

Replace
```ts
  /** False when the project skips Beranda (A-31): no breadcrumb parent, no back button. */
  readonly hasHome: boolean;
```
with
```ts
  /** True when Beranda holds only the *Semua foto* card (no groups, no final delivery): the page keeps the project title and the no-groups subtitle; the trail still starts at Beranda (F-23 R-7). */
  readonly isPhotosOnly: boolean;
```

- [ ] **Step 8: `client-browse-screen.tsx`**

Edit 1: replace
```tsx
function baseHeader(
  gate: ClientBrowseScreenProps["gate"],
  token: string,
  hasHome: boolean,
): ClientPageHeader {
  if (!hasHome) {
    return {
      title: gate.projectTitle,
      subtitle: COPY.subtitleNoGroups,
      breadcrumbs: [{ label: CLIENT_COPY.allPhotos }],
    };
  }
  return {
    title: CLIENT_COPY.allPhotos,
    subtitle: COPY.subtitle,
    breadcrumbs: [
```
with
```tsx
function baseHeader(
  gate: ClientBrowseScreenProps["gate"],
  token: string,
  isPhotosOnly: boolean,
): ClientPageHeader {
  return {
    title: isPhotosOnly ? gate.projectTitle : CLIENT_COPY.allPhotos,
    subtitle: isPhotosOnly ? COPY.subtitleNoGroups : COPY.subtitle,
    breadcrumbs: [
```

Edit 2: replace
```tsx
  token,
  hasHome,
  initialPage,
```
with
```tsx
  token,
  isPhotosOnly,
  initialPage,
```

Edit 3: replace
```tsx
      header={browseHeader(baseHeader(gate, token, hasHome), photos, handle.targets.groups)}
```
with
```tsx
      header={browseHeader(baseHeader(gate, token, isPhotosOnly), photos, handle.targets.groups)}
```

Edit 4: in the doc comment above `export function ClientBrowseScreen`, replace `whether Beranda exists` with `whether Beranda holds only this page`.

- [ ] **Step 9: `photos/page.tsx`**

In `src/app/(client)/g/[token]/photos/page.tsx`, replace
```tsx
      hasHome={result.value.home.landing === "HOME"}
```
with
```tsx
      isPhotosOnly={result.value.home.landing === "ALL_PHOTOS"}
```

- [ ] **Step 10: Remove the A-31 redirect**

In `src/app/(client)/g/[token]/page.tsx`:

Replace
```tsx
import { notFound, redirect } from "next/navigation";
```
with
```tsx
import { notFound } from "next/navigation";
```
and replace
```tsx
  // A-31: without groups and final delivery, Beranda would hold one card.
  if (result.value.landing === "ALL_PHOTOS") redirect(`/g/${token}/photos`);
  return <ClientHomeScreen
```
with
```tsx
  // F-23 R-7: Beranda always renders, even with only the Semua foto card (A-31 withdrawn).
  return <ClientHomeScreen
```

- [ ] **Step 11: Update the domain doc comment**

In `src/features/gallery/domain/client-home/client-home.ts`, replace
```ts
/** Where the client lands after the password (A-24, A-31). @param groupCount - selection groups of the project @param finalDeliveryPublished - whether final delivery is published @returns Beranda, or *Semua foto* when Beranda would hold one card */
```
with
```ts
/** Whether Beranda holds only the *Semua foto* card (A-24). Since F-23 R-7 the client still lands on Beranda; *Semua foto* uses this for its title and subtitle. @param groupCount - selection groups of the project @param finalDeliveryPublished - whether final delivery is published @returns `ALL_PHOTOS` when Beranda would hold one card, else `HOME` */
```
Do not change the function body or its test.

- [ ] **Step 12: Run the related tests**

Run: `npx vitest run src/features/gallery/ui/review-screen src/features/gallery/ui/client-browse-screen src/features/gallery/ui/client-home-screen src/features/gallery/domain/client-home`
Expected: PASS.

- [ ] **Step 13: Format, lint, typecheck**

```bash
npx prettier --write src/features/gallery/ui/review-screen/review-text.ts src/features/gallery/ui/review-screen/review-text.test.ts "src/app/(client)/g/[token]/page.tsx" "src/app/(client)/g/[token]/photos/page.tsx" src/features/gallery/ui/client-browse-screen/client-browse-screen.tsx src/features/gallery/ui/client-browse-screen/client-browse-screen.types.ts src/features/gallery/ui/client-browse-screen/client-browse-screen.test.tsx src/features/gallery/domain/client-home/client-home.ts
```
```bash
npx eslint src/features/gallery/ui/review-screen src/features/gallery/ui/client-browse-screen "src/app/(client)/g/[token]/page.tsx" "src/app/(client)/g/[token]/photos/page.tsx" src/features/gallery/domain/client-home/client-home.ts
```
```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 14: Run the client home integration test**

Run: `npx vitest run --config vitest.integration.config.ts tests/integration/gallery/client-access/home.test.ts`
Expected: PASS. It checks the `landing` value, which did not change. If it cannot reach the database, stop and report; do not edit it.

- [ ] **Step 15: Commit**

```bash
git add src/features/gallery/ui/review-screen/review-text.ts src/features/gallery/ui/review-screen/review-text.test.ts "src/app/(client)/g/[token]/page.tsx" "src/app/(client)/g/[token]/photos/page.tsx" src/features/gallery/ui/client-browse-screen/client-browse-screen.tsx src/features/gallery/ui/client-browse-screen/client-browse-screen.types.ts src/features/gallery/ui/client-browse-screen/client-browse-screen.test.tsx src/features/gallery/domain/client-home/client-home.ts
git commit -m "feat(gallery): keep beranda in the client trail and show tinjau on read-only reviews" -m "Co-Authored-By: <the session's attribution line>"
```

---

### Task 7: Sidebar toggle beside the breadcrumb

**Covers:** AC-CRUMB-015, AC-CRUMB-016.

**Files:**
- Modify: `src/ui/patterns/sidebar/sidebar.tsx`
- Modify: `src/ui/patterns/sidebar/sidebar.types.ts`
- Modify: `src/ui/patterns/sidebar/sidebar.test.tsx`
- Modify: `src/ui/patterns/page-header/page-header.tsx`
- Modify: `src/ui/patterns/page-header/page-header.types.ts`
- Modify: `src/ui/patterns/page-header/page-header.test.tsx`
- Modify: `src/ui/patterns/app-panel/app-panel.tsx`
- Modify: `src/ui/patterns/app-panel/app-panel.types.ts`
- Modify: `src/ui/patterns/app-shell/app-shell.tsx`
- Modify: `src/ui/patterns/app-shell/app-shell.test.tsx`

**Interfaces:**
- Produces: `PageHeaderProps.leading?: ReactNode`, `AppPanelProps.leading?: ReactNode`. `SidebarProps` loses `onCollapse` and `onExpand`.

- [ ] **Step 1: Write the failing tests**

In `src/ui/patterns/sidebar/sidebar.test.tsx`:

Edit 1: replace
```tsx
  it("exposes collapse and logout actions", () => {
    const onCollapse = vi.fn();
    const onLogout = vi.fn();
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        onCollapse={onCollapse}
        onLogout={onLogout}
      >
        <span>Nav</span>
      </Sidebar>,
    );

    screen.getByRole("button", { name: "Ciutkan sidebar" }).click();
    screen.getByRole("button", { name: "Keluar" }).click();
    expect(onCollapse).toHaveBeenCalledOnce();
    expect(onLogout).toHaveBeenCalledOnce();
  });
```
with
```tsx
  it("exposes the logout action and owns no sidebar toggle (F-23)", () => {
    const onLogout = vi.fn();
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        onLogout={onLogout}
      >
        <span>Nav</span>
      </Sidebar>,
    );

    screen.getByRole("button", { name: "Keluar" }).click();
    expect(onLogout).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Ciutkan sidebar" })).toBeNull();
  });
```

Edit 2: replace
```tsx
  it("renders the compact rail mode with a grouped nav and an expand control", () => {
    const onExpand = vi.fn();
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        isCompact
        onExpand={onExpand}
      >
```
with
```tsx
  it("renders the compact rail mode with a grouped nav and no expand control (F-23)", () => {
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        isCompact
      >
```

Edit 3: replace
```tsx
    expect(screen.getAllByTestId("sidebar-divider")[0]).toHaveClass("w-(--space-8)");
    screen.getByRole("button", { name: "Buka sidebar" }).click();
    expect(onExpand).toHaveBeenCalledOnce();
  });
```
with
```tsx
    expect(screen.getAllByTestId("sidebar-divider")[0]).toHaveClass("w-(--space-8)");
    expect(screen.queryByRole("button", { name: "Buka sidebar" })).toBeNull();
  });
```

In `src/ui/patterns/page-header/page-header.test.tsx`, replace
```tsx
  it("AC-PRJ-015 puts the adornment after the title and the meta in place of the subtitle", () => {
```
with
```tsx
  it("AC-CRUMB-015 renders the leading control before the trail", () => {
    render(
      <PageHeader
        parent="Aster"
        current="Dasbor"
        title="Dasbor"
        leading={<button type="button">Toggle</button>}
      />,
    );

    const toggle = screen.getByRole("button", { name: "Toggle" });
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(toggle.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("AC-PRJ-015 puts the adornment after the title and the meta in place of the subtitle", () => {
```

In `src/ui/patterns/app-shell/app-shell.test.tsx`, replace
```tsx
  it("opens the tablet sidebar as a dismissible navigation dialog", async () => {
    const user = userEvent.setup();
    const { getAllByRole, queryByRole } = render(
      <AppShell {...props}>
        <p>Konten workspace</p>
      </AppShell>,
    );

    await user.click(getAllByRole("button", { name: "Buka sidebar" })[0]);
    expect(screen.getByRole("dialog", { name: "Navigasi utama" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ciutkan sidebar" }));
    expect(queryByRole("dialog", { name: "Navigasi utama" })).toBeNull();
  });
```
with
```tsx
  it("AC-CRUMB-016 the breadcrumb toggle opens the tablet overlay, which has no close button", async () => {
    const user = userEvent.setup();
    const { queryByRole } = render(
      <AppShell {...props}>
        <p>Konten workspace</p>
      </AppShell>,
    );

    const toggles = screen.getAllByRole("button", { name: "Buka sidebar" });
    expect(toggles).toHaveLength(1);
    await user.click(toggles[0]);
    const dialog = screen.getByRole("dialog", { name: "Navigasi utama" });
    expect(dialog.querySelector("[data-sidebar-toggle]")).toBeNull();

    await user.keyboard("{Escape}");
    expect(queryByRole("dialog", { name: "Navigasi utama" })).toBeNull();
  });

  it("AC-CRUMB-015 the breadcrumb toggle collapses and expands the desktop sidebar", async () => {
    const user = userEvent.setup();
    render(
      <AppShell {...props}>
        <p>Konten workspace</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Ciutkan sidebar" }));
    expect(screen.queryByRole("button", { name: "Ciutkan sidebar" })).toBeNull();
    expect(window.localStorage.getItem("shutrly.sidebar.collapsed")).toBe("true");

    const expand = screen
      .getAllByRole("button", { name: "Buka sidebar" })
      .find((button) => button.closest(".xl\\:flex"));
    expect(expand).toBeDefined();
    if (expand) await user.click(expand);
    expect(screen.getByRole("button", { name: "Ciutkan sidebar" })).toBeInTheDocument();
    expect(window.localStorage.getItem("shutrly.sidebar.collapsed")).toBe("false");
  });
```

Before Step 2, run `sed -n '1,25p' src/ui/patterns/app-shell/sidebar-collapse-preference.ts` and check that `writeCollapsed` stores the strings `"true"` / `"false"` under `shutrly.sidebar.collapsed`. If it stores something else, change the two `toBe(...)` values in the new test to what it stores, and note it in the report.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/ui/patterns/sidebar src/ui/patterns/page-header src/ui/patterns/app-shell`
Expected: FAIL. The sidebar still has its buttons, `leading` is unknown, and the shell has no breadcrumb toggle.

- [ ] **Step 3: `sidebar.types.ts`**

Replace
```ts
  isCompact?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
  onLogout?: () => void;
```
with
```ts
  isCompact?: boolean;
  onLogout?: () => void;
```

- [ ] **Step 4: `sidebar.tsx`**

Edit 1: replace
```tsx
  isCompact = false,
  onCollapse,
  onExpand,
  onLogout,
  workspaceSwitcher,
}: Readonly<SidebarProps>) {
```
with
```tsx
  isCompact = false,
  onLogout,
  workspaceSwitcher,
}: Readonly<SidebarProps>) {
```

Edit 2: replace
```tsx
        <SidebarLogo isCompact={isCompact} onCollapse={onCollapse} />
```
with
```tsx
        <SidebarLogo isCompact={isCompact} />
```

Edit 3: replace
```tsx
        <SidebarDivider isCompact={isCompact} />
        {isCompact && onExpand ? (
          <IconButton
            icon="panel-left-open"
            aria-label={SIDEBAR_COPY.expand}
            data-sidebar-toggle=""
            onPress={onExpand}
          />
        ) : null}
        <SidebarAccount
```
with
```tsx
        <SidebarDivider isCompact={isCompact} />
        <SidebarAccount
```

Edit 4: replace
```tsx
function SidebarLogo({
  isCompact,
  onCollapse,
}: Readonly<{ isCompact: boolean; onCollapse?: () => void }>) {
```
with
```tsx
function SidebarLogo({ isCompact }: Readonly<{ isCompact: boolean }>) {
```

Edit 5: replace
```tsx
      <SidebarBrandLogo className="flex-1" />
      <IconButton
        icon="panel-left"
        size="sm"
        aria-label={SIDEBAR_COPY.collapse}
        data-sidebar-toggle=""
        onPress={onCollapse}
      />
    </div>
```
with
```tsx
      <SidebarBrandLogo className="flex-1" />
    </div>
```

Then run `grep -n "IconButton" src/ui/patterns/sidebar/sidebar.tsx`. If it prints only the import line, delete that import line (`import { IconButton } from "@/ui/primitives/icon-button/icon-button";`). If it prints other uses, keep the import.

- [ ] **Step 5: `page-header.types.ts` and `page-header.tsx`**

In `page-header.types.ts`, replace
```ts
  trail?: ReactNode;
  tabs?: { readonly label: string; readonly tabs: readonly TabLink[] };
```
with
```ts
  trail?: ReactNode;
  /** Sits left of the breadcrumb, e.g. the sidebar toggle (F-23). */
  leading?: ReactNode;
  tabs?: { readonly label: string; readonly tabs: readonly TabLink[] };
```

In `page-header.tsx`:

Edit 1: replace
```tsx
  utilities,
  trail,
  tabs,
  isFlush = false,
}: Readonly<PageHeaderProps>) {
```
with
```tsx
  utilities,
  trail,
  leading,
  tabs,
  isFlush = false,
}: Readonly<PageHeaderProps>) {
```

Edit 2: replace
```tsx
        trail={trail ?? <PageHeaderTrail items={breadcrumbItems} />}
        utilities={utilities}
        isFlush={isFlush}
      />
```
with
```tsx
        trail={trail ?? <PageHeaderTrail items={breadcrumbItems} />}
        utilities={utilities}
        leading={leading}
        isFlush={isFlush}
      />
```

Edit 3: replace
```tsx
function BreadcrumbRow({
  trail,
  utilities,
  isFlush,
}: Readonly<{
  trail: ReactNode;
  utilities: PageHeaderProps["utilities"];
  isFlush: boolean;
}>) {
```
with
```tsx
function BreadcrumbRow({
  trail,
  utilities,
  leading,
  isFlush,
}: Readonly<{
  trail: ReactNode;
  utilities: PageHeaderProps["utilities"];
  leading: PageHeaderProps["leading"];
  isFlush: boolean;
}>) {
```

Edit 4: replace
```tsx
      {trail}
      {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
```
with
```tsx
      {leading ? <div className="flex shrink-0 items-center">{leading}</div> : null}
      {trail}
      {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
```

- [ ] **Step 6: `app-panel.types.ts` and `app-panel.tsx`**

In `app-panel.types.ts`, replace
```ts
  trail?: ReactNode;
  children: ReactNode;
```
with
```ts
  trail?: ReactNode;
  /** Sits left of the breadcrumb, e.g. the sidebar toggle (F-23). */
  leading?: ReactNode;
  children: ReactNode;
```

In `app-panel.tsx`, replace
```tsx
  trail,
  children,
}: Readonly<AppPanelProps>) {
```
with
```tsx
  trail,
  leading,
  children,
}: Readonly<AppPanelProps>) {
```
and replace
```tsx
        trail={trail}
      />
```
with
```tsx
        trail={trail}
        leading={leading}
      />
```

- [ ] **Step 7: `app-shell.tsx`**

Edit 1: replace
```tsx
import { Sidebar } from "../sidebar/sidebar";
import { APP_SHELL_COPY } from "./app-shell.copy";
```
with
```tsx
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { Sidebar } from "../sidebar/sidebar";
import { SIDEBAR_COPY } from "../sidebar/sidebar.copy";
import { APP_SHELL_COPY } from "./app-shell.copy";
```
Then run `npx eslint --fix src/ui/patterns/app-shell/app-shell.tsx` so the import order matches the project's rule.

Edit 2: replace
```tsx
  function handleCloseTabletSidebar() {
    setIsTabletSidebarOpen(false);
  }

```
with nothing (delete these 4 lines and the blank line after them).

Edit 3: replace
```tsx
    requestAnimationFrame(focusSidebarToggle);
  }

  return (
```
with
```tsx
    requestAnimationFrame(focusSidebarToggle);
  }

  // F-23: one toggle left of the breadcrumb; it collapses or expands the desktop Sidebar and opens the tablet overlay.
  const sidebarToggle = (
    <>
      <div className="hidden xl:flex">
        <IconButton
          icon={isDesktopSidebarCollapsed ? "panel-left-open" : "panel-left"}
          size="sm"
          aria-label={isDesktopSidebarCollapsed ? SIDEBAR_COPY.expand : SIDEBAR_COPY.collapse}
          data-sidebar-toggle=""
          onPress={
            isDesktopSidebarCollapsed ? handleExpandDesktopSidebar : handleCollapseDesktopSidebar
          }
        />
      </div>
      <div className="hidden md:flex xl:hidden">
        <IconButton
          icon="panel-left-open"
          size="sm"
          aria-label={SIDEBAR_COPY.expand}
          data-sidebar-toggle=""
          onPress={handleOpenTabletSidebar}
        />
      </div>
    </>
  );

  return (
```
Before this edit, run `grep -n "requestAnimationFrame(focusSidebarToggle);" src/ui/patterns/app-shell/app-shell.tsx`. It must print exactly two lines (collapse and expand handlers). The `old` block above matches the **second** one, which is followed by `return (`. If the edit tool reports more than one match, include the line `    writeCollapsed(false);` above `requestAnimationFrame` in the `old` block to make it unique.

Edit 4: replace
```tsx
        isCompact={isDesktopSidebarCollapsed}
        onCollapse={handleCollapseDesktopSidebar}
        onExpand={handleExpandDesktopSidebar}
        workspaceSwitcher={workspaceSwitcher}
```
with
```tsx
        isCompact={isDesktopSidebarCollapsed}
        workspaceSwitcher={workspaceSwitcher}
```

Edit 5: replace
```tsx
        navBottom={navBottom}
        onExpand={handleOpenTabletSidebar}
        workspaceSwitcher={workspaceSwitcher}
      />
```
with
```tsx
        navBottom={navBottom}
        workspaceSwitcher={workspaceSwitcher}
      />
```

Edit 6: replace
```tsx
        panelTrail={panelTrail}
      >
        {children}
      </DesktopContent>
```
with
```tsx
        panelTrail={panelTrail}
        sidebarToggle={sidebarToggle}
      >
        {children}
      </DesktopContent>
```

Edit 7: replace
```tsx
        navBottom={navBottom}
        onCollapse={handleCloseTabletSidebar}
        workspaceSwitcher={workspaceSwitcher}
        onLogout={onLogout}
      />
    </div>
  );
}
```
with
```tsx
        navBottom={navBottom}
        workspaceSwitcher={workspaceSwitcher}
        onLogout={onLogout}
      />
    </div>
  );
}
```

Edit 8 (`DesktopSidebar`): replace
```tsx
  isCompact,
  onCollapse,
  onExpand,
  workspaceSwitcher,
  onLogout,
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  isCompact: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
```
with
```tsx
  isCompact,
  workspaceSwitcher,
  onLogout,
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  isCompact: boolean;
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
```
and replace
```tsx
        isCompact={isCompact}
        onExpand={onExpand}
        onCollapse={onCollapse}
        workspaceSwitcher={workspaceSwitcher}
```
with
```tsx
        isCompact={isCompact}
        workspaceSwitcher={workspaceSwitcher}
```

Edit 9 (`TabletRail`): replace
```tsx
  navBottom,
  onExpand,
  workspaceSwitcher,
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  onExpand: () => void;
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
}) {
```
with
```tsx
  navBottom,
  workspaceSwitcher,
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
}) {
```
and replace
```tsx
        isCompact
        onExpand={onExpand}
        navBottom={navBottom}
```
with
```tsx
        isCompact
        navBottom={navBottom}
```

Edit 10 (`DesktopContent`): replace
```tsx
  panelTrail,
  children,
}: Readonly<{
```
with
```tsx
  panelTrail,
  sidebarToggle,
  children,
}: Readonly<{
```
then replace
```tsx
  panelTrail: AppShellProps["panelTrail"];
  children: AppShellProps["children"];
```
with
```tsx
  panelTrail: AppShellProps["panelTrail"];
  sidebarToggle: ReactNode;
  children: AppShellProps["children"];
```
then replace
```tsx
        trail={panelTrail}
      >
        <PageContent>{children}</PageContent>
```
with
```tsx
        trail={panelTrail}
        leading={sidebarToggle}
      >
        <PageContent>{children}</PageContent>
```

Edit 11 (`TabletSidebarOverlay`): replace
```tsx
  navBottom,
  onCollapse,
  workspaceSwitcher,
  onLogout,
}: Readonly<{
```
with
```tsx
  navBottom,
  workspaceSwitcher,
  onLogout,
}: Readonly<{
```
then replace
```tsx
  navBottom: AppShellProps["navBottom"];
  onCollapse: () => void;
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
```
with
```tsx
  navBottom: AppShellProps["navBottom"];
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
```
then replace
```tsx
            account={account}
            onCollapse={onCollapse}
            navBottom={navBottom}
```
with
```tsx
            account={account}
            navBottom={navBottom}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run src/ui/patterns/sidebar src/ui/patterns/page-header src/ui/patterns/app-panel src/ui/patterns/app-shell src/features/workspace/ui/owner-shell`
Expected: PASS.

- [ ] **Step 9: Format, lint, typecheck**

```bash
npx prettier --write src/ui/patterns/sidebar/sidebar.tsx src/ui/patterns/sidebar/sidebar.types.ts src/ui/patterns/sidebar/sidebar.test.tsx src/ui/patterns/page-header/page-header.tsx src/ui/patterns/page-header/page-header.types.ts src/ui/patterns/page-header/page-header.test.tsx src/ui/patterns/app-panel/app-panel.tsx src/ui/patterns/app-panel/app-panel.types.ts src/ui/patterns/app-shell/app-shell.tsx src/ui/patterns/app-shell/app-shell.test.tsx
```
```bash
npx eslint src/ui/patterns/sidebar src/ui/patterns/page-header src/ui/patterns/app-panel src/ui/patterns/app-shell
```
```bash
pnpm typecheck
```
Expected: no errors. If typecheck reports a story (`*.stories.tsx`) passing `onCollapse` or `onExpand`, remove that prop from the story and add the story file to the commit.

- [ ] **Step 10: Run the shell e2e spec**

Run: `npx playwright test tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts`
Expected: PASS without editing the toggle tests. AC-SHELL-002 and the tablet test find the toggles by the same labels (*Ciutkan sidebar*, *Buka sidebar*), and only one toggle is visible per width. If a toggle test fails, stop and report the output.

- [ ] **Step 11: Commit**

```bash
git add src/ui/patterns/sidebar/sidebar.tsx src/ui/patterns/sidebar/sidebar.types.ts src/ui/patterns/sidebar/sidebar.test.tsx src/ui/patterns/page-header/page-header.tsx src/ui/patterns/page-header/page-header.types.ts src/ui/patterns/page-header/page-header.test.tsx src/ui/patterns/app-panel/app-panel.tsx src/ui/patterns/app-panel/app-panel.types.ts src/ui/patterns/app-shell/app-shell.tsx src/ui/patterns/app-shell/app-shell.test.tsx
git commit -m "feat(shell): move the sidebar toggle beside the breadcrumb" -m "Co-Authored-By: <the session's attribution line>"
```

---

### Task 8: Long trail overflow

**Covers:** AC-CRUMB-013 (OQ-5 resolved by the Owner 2026-10-12: the root and the current page stay whole; the crumbs between them shrink with an ellipsis and carry their full label as a tooltip; frames waived).

**Files:**
- Modify: `src/ui/patterns/page-header/breadcrumb-trail.tsx`
- Modify: `src/ui/patterns/page-header/page-header.types.ts`
- Create: `src/ui/patterns/page-header/breadcrumb-trail.test.tsx`

**Interfaces:**
- Produces: `BreadcrumbTrailItemProps.isEdge: boolean` (true for the first and the last crumb). No public API change: `BreadcrumbTrail` and `PageHeaderTrail` keep their props.

Why it works: each crumb is a flex item. A flex item does not shrink below its content unless it has `min-w-0`; the crumbs already carry `truncate`. So the middle crumbs get `min-w-0` (they shrink and end in "…") and the edge crumbs get `shrink-0` (they never shrink).

- [ ] **Step 1: Write the failing test**

Create `src/ui/patterns/page-header/breadcrumb-trail.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BreadcrumbTrail } from "./breadcrumb-trail";

const LONG_TITLE = "Pernikahan Rina dan Dimas di Gedung Serbaguna Kota Lama Semarang";

const ITEMS = [
  { label: "Aster", href: "/w/A" },
  { label: "Proyek", href: "/w/A/projects" },
  { label: LONG_TITLE, href: "/w/A/projects/p1" },
  { label: "Galeri", href: "/w/A/projects/p1/gallery" },
  { label: "Pilihan klien", href: "/w/A/projects/p1/gallery/picks" },
  { label: "Foto album keluarga besar" },
];

describe("BreadcrumbTrail (F-23 OQ-5)", () => {
  it("AC-CRUMB-013 keeps the root and the current page whole", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={ITEMS} />);

    const root = screen.getByRole("link", { name: "Aster" });
    expect(root).toHaveClass("shrink-0");
    expect(root).not.toHaveAttribute("title");
    const current = screen.getByText("Foto album keluarga besar");
    expect(current).toHaveClass("shrink-0");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("AC-CRUMB-013 lets the middle crumbs shrink with their full label as a tooltip", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={ITEMS} />);

    const middle = screen.getByRole("link", { name: LONG_TITLE });
    expect(middle).toHaveClass("min-w-0", "truncate");
    expect(middle).not.toHaveClass("shrink-0");
    expect(middle).toHaveAttribute("title", LONG_TITLE);
    expect(middle).toHaveAttribute("href", "/w/A/projects/p1");
  });

  it("AC-CRUMB-013 keeps every ancestor a keyboard-reachable link", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={ITEMS} />);

    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("treats a single crumb as both edges", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={[{ label: "Dasbor" }]} />);

    expect(screen.getByText("Dasbor")).toHaveClass("shrink-0");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/ui/patterns/page-header/breadcrumb-trail.test.tsx`
Expected: FAIL (no `shrink-0`, no `min-w-0`, no `title` yet).

- [ ] **Step 3: `page-header.types.ts`**

Replace
```ts
export interface BreadcrumbTrailItemProps {
  readonly item: BreadcrumbItem;
  readonly isCurrent: boolean;
  readonly showSeparator: boolean;
}
```
with
```ts
export interface BreadcrumbTrailItemProps {
  readonly item: BreadcrumbItem;
  readonly isCurrent: boolean;
  readonly showSeparator: boolean;
  /** The first or the last crumb: it never shrinks (F-23 OQ-5). */
  readonly isEdge: boolean;
}
```

- [ ] **Step 4: `breadcrumb-trail.tsx`**

Edit 1: replace
```tsx
function BreadcrumbTrailItem({
  item,
  isCurrent,
  showSeparator,
}: Readonly<BreadcrumbTrailItemProps>) {
  let content;
  if (item.href && !isCurrent) {
    content = (
      <Link href={item.href} className={LINK}>
        {item.label}
      </Link>
    );
  } else if (item.onPress && !isCurrent) {
    content = (
      <AriaButton
        onPress={item.onPress}
        className={cn(
          LINK,
          "cursor-pointer data-focus-visible:rounded-(--radius-xs) data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
        )}
      >
        {item.label}
      </AriaButton>
    );
  } else {
    content = (
      <span
        aria-current={isCurrent ? "page" : undefined}
        className={
          isCurrent
            ? "truncate font-semibold text-(--component-page-header-breadcrumb-current)"
            : "truncate"
        }
      >
        {item.label}
      </span>
    );
  }
```
with
```tsx
function BreadcrumbTrailItem({
  item,
  isCurrent,
  showSeparator,
  isEdge,
}: Readonly<BreadcrumbTrailItemProps>) {
  // F-23 OQ-5: the root and the current page stay whole; the crumbs between them shrink with "…".
  const fit = isEdge ? "shrink-0" : "min-w-0";
  const title = isEdge ? undefined : item.label;
  let content;
  if (item.href && !isCurrent) {
    content = (
      <Link href={item.href} className={cn(LINK, fit)} title={title}>
        {item.label}
      </Link>
    );
  } else if (item.onPress && !isCurrent) {
    content = (
      <AriaButton
        onPress={item.onPress}
        className={cn(
          LINK,
          fit,
          "cursor-pointer data-focus-visible:rounded-(--radius-xs) data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
        )}
      >
        {item.label}
      </AriaButton>
    );
  } else {
    content = (
      <span
        aria-current={isCurrent ? "page" : undefined}
        title={title}
        className={cn(
          "truncate",
          fit,
          isCurrent && "font-semibold text-(--component-page-header-breadcrumb-current)",
        )}
      >
        {item.label}
      </span>
    );
  }
```

Edit 2: replace
```tsx
          isCurrent={index === items.length - 1}
          showSeparator={index > 0}
```
with
```tsx
          isCurrent={index === items.length - 1}
          showSeparator={index > 0}
          isEdge={index === 0 || index === items.length - 1}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/ui/patterns/page-header src/features/gallery/ui/browse-toolbar src/features/gallery/ui/all-photos-modal`
Expected: PASS. The last two folders use `BreadcrumbTrail` for the in-page folder trail; they must still pass.

- [ ] **Step 6: Format, lint, typecheck**

```bash
npx prettier --write src/ui/patterns/page-header/breadcrumb-trail.tsx src/ui/patterns/page-header/page-header.types.ts src/ui/patterns/page-header/breadcrumb-trail.test.tsx
```
```bash
npx eslint src/ui/patterns/page-header
```
```bash
pnpm typecheck
```
Expected: no errors. If `max-lines-per-function` fails on `BreadcrumbTrailItem`, move the `else` branch into a small `CrumbText` component with the same markup and report it.

- [ ] **Step 7: Commit**

```bash
git add src/ui/patterns/page-header/breadcrumb-trail.tsx src/ui/patterns/page-header/page-header.types.ts src/ui/patterns/page-header/breadcrumb-trail.test.tsx
git commit -m "feat(ui): keep the breadcrumb ends whole and shrink the middle" -m "Co-Authored-By: <the session's attribution line>"
```

---

## Final report (after Task 8)

Report, in this order:
1. The commits made (`git log --oneline -8`).
2. For each task: the test commands run and their result lines (pass counts).
3. Anything skipped (for example Task 5 Step 13 without a browser) and why.
4. Any step whose `old` text did not match and what you did (you should have stopped).
5. `git status --short` at the end. Only the files that were dirty before you started may remain modified.
