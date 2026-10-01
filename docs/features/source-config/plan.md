# F-04 Source configuration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo, `/sdv:build-feature source-config <n>` runs Task n.

**Goal:** Every workspace has a list of photo sources, seeded with *Google Drive*. On *Sumber foto* the Owner adds a Google Drive source (other providers show *Segera hadir*), renames, deactivates/reactivates and deletes sources, and sees the Drive setup guide and the public-link warning.

**Architecture:**
- A new `gallery` feature (`src/features/gallery/{domain,application,ui}`) with a Drizzle `workspace_source_config` table behind a port.
- Composition verifies the workspace (F-02) and wires the routes and actions.
- Seeding the default source joins the existing workspace-creation transaction (ADR-016).
- Four shared UI units come first: StatusChip, ListCardItem (+ Skeleton), OptionCardGroup (+ Radio) and a page-actions slot. They are promoted in the library on 2026-10-01 but don't exist in code yet.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), Hugeicons, Vitest (unit, dom, integration), Playwright + axe, Storybook.

Design source: [design.md](design.md) and `exports/*.html` (24 frames). Technical design: [technical-design.md](technical-design.md). Component specs: `docs/design-system/components/{status-chip,list-card,option-card}.md`.

## Global Constraints

Every task's requirements implicitly include this section. They are the same as F-03's (see `docs/features/message-templates/plan.md` › Global Constraints) plus:

- **Boundaries (lint):** `features/gallery` never imports `features/workspace` or `features/communications`, nor the reverse. Cross-feature work goes through `composition/` or `app/`.
- **Rule values:**
  - `SOURCE_NAME_MAX_LENGTH = 60` (code points, after trim);
  - names are unique per workspace, ignoring case;
  - available providers: `GOOGLE_DRIVE` only;
  - coming soon, in order: `DROPBOX`, `ONEDRIVE`, `AMAZON_S3`, `CUSTOM_URL`;
  - seeded source: `GOOGLE_DRIVE` / *Google Drive* / active / `{}`.
- **Copy:** the Indonesian strings in this plan are final unless a test says otherwise. They come from the frames.
- **Logging (C-103):** log `source_config.save_failed` with `{ workspaceId, sourceId?, operation }` only, never names.
- **Migrations:** generate them with drizzle-kit and commit them. The agent runs `pnpm db:migrate` only after the Owner approves that specific run.
- **Tests:** test names start with the `AC-SRC-*` / `BR-SRC-*` IDs they cover.
- **Quality gate per task:** `pnpm typecheck`, `pnpm lint` and `pnpm test` pass. From Task 8 on, `pnpm test:integration` also passes, once migrations 0004/0005 are applied.
- **Commits:** one per task; conventional, lowercase, with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```text
src/ui/primitives/icon/                      registry + types: 9 icons
src/ui/primitives/status-chip/               status-chip.tsx · .types.ts · .test.tsx · .stories.tsx
src/ui/patterns/list-card-item/              list-card-item.tsx · list-card-item-skeleton.tsx · .types.ts · .test.tsx · .stories.tsx
src/ui/patterns/option-card/                 option-card-group.tsx · .types.ts · .test.tsx · .stories.tsx
src/ui/patterns/page-actions/                page-actions.tsx · .types.ts · .test.tsx
src/features/workspace/ui/owner-shell/       panelActions slot (PAGE_ACTIONS_ID)
src/features/gallery/
  domain/source-provider/                    source-provider.ts · .types.ts · .test.ts
  domain/source-name/                        source-name.ts · .types.ts · .test.ts
  domain/default-source/                     default-source.ts · .test.ts
  domain/source-order/                       source-order.ts · .test.ts
  application/errors/source-config-errors/   source-config-errors.ts · .types.ts
  application/ports/workspace-source-repository/  workspace-source-repository.port.ts
  application/schemas/source-name/           source-name.schema.ts · .types.ts · .test.ts
  application/schemas/add-source/            add-source.schema.ts · .types.ts · .test.ts
  application/schemas/source-id/             source-id.schema.ts
  application/use-cases/list-workspace-sources/   list-workspace-sources.ts · .test.ts
  application/use-cases/add-workspace-source/     add-workspace-source.ts · .types.ts · .test.ts
  application/use-cases/rename-workspace-source/  rename-workspace-source.ts · .types.ts · .test.ts
  application/use-cases/set-workspace-source-active/  set-workspace-source-active.ts · .test.ts
  application/use-cases/delete-workspace-source/  delete-workspace-source.ts · .types.ts · .test.ts
  application/use-cases/seed-default-source/      seed-default-source.ts · .test.ts
  ui/source-copy/                            source-copy.copy.ts
  ui/source-name-error/                      source-name-error.ts · .test.ts
  ui/photo-sources-screen/                   photo-sources-screen.tsx · .types.ts · .test.tsx
  ui/source-row/                             source-row.tsx · .types.ts · .test.tsx
  ui/source-row-actions/                     source-row-actions.tsx · .types.ts · .test.tsx
  ui/setup-guide-card/                       setup-guide-card.tsx · .test.tsx
  ui/photo-sources-skeleton/                 photo-sources-skeleton.tsx
  ui/add-source-dialog/                      add-source-dialog.tsx · .types.ts · .test.tsx
  ui/rename-source-dialog/                   rename-source-dialog.tsx · .types.ts · .test.tsx
  ui/delete-source-dialog/                   delete-source-dialog.tsx · .types.ts · .test.tsx
  ui/use-source-mutations/                   use-source-mutations.ts · .types.ts · .test.tsx
src/adapters/db/schema/gallery/workspace-source-config.ts
src/adapters/db/workspace-source-repository/drizzle-workspace-source-repository.ts
src/composition/gallery/source-config-scope/      source-config-scope.ts · .types.ts
src/composition/gallery/source-config-flow/       source-config-flow.ts · .types.ts · .test.ts
src/app/actions/gallery/photo-sources.ts
src/app/(owner)/w/[workspaceId]/photo-sources/    page.tsx · loading.tsx
drizzle/0004_workspace_source_config.sql · drizzle/0005_workspace_source_config_backfill.sql
tests/support/gallery/fake-workspace-source-repository.ts
tests/config/workspace-source-backfill.test.ts
tests/integration/gallery/workspace-source-repository.test.ts
tests/e2e/photo-sources/photo-sources.spec.ts
```

---

### Task 1: Icons and StatusChip

**Files:** `src/ui/primitives/icon/icon.{types,registry}.ts`, `icon.test.tsx`; create `src/ui/primitives/status-chip/*`.

- [ ] **Step 1: Failing tests.** Add the nine names to the list in `icon.test.tsx`, then create `status-chip.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusChip } from "./status-chip";

describe("StatusChip (C12)", () => {
  it("AC-SRC-003 shows the label with the tone's tokens and a dot", () => {
    const { container } = render(<StatusChip tone="success" label="Aktif" />);
    expect(screen.getByText("Aktif").parentElement).toHaveClass(
      "bg-(--component-chip-status-success-background)",
      "text-(--component-chip-status-success-text)",
    );
    expect(container.querySelector("[data-slot=dot]")).not.toBeNull();
  });

  it("AC-SRC-007 hides the dot for availability labels", () => {
    const { container } = render(<StatusChip tone="neutral" label="Segera hadir" hasDot={false} />);
    expect(container.querySelector("[data-slot=dot]")).toBeNull();
  });
});
```

- [ ] **Step 2:** `pnpm test src/ui/primitives` → FAIL.
- [ ] **Step 3: Icons.** Add to `IconName` and the registry (Hugeicons exports):

| Name | Hugeicons export |
|---|---|
| `hard-drive` | `HardDriveIcon` |
| `folder-open` | `FolderOpenIcon` |
| `folder` | `Folder01Icon` |
| `power` | `PowerIcon` |
| `dropbox` | `DropboxIcon` |
| `cloud` | `CloudIcon` |
| `database` | `Database01Icon` |
| `link` | `Link01Icon` |
| `more-horizontal` | `MoreHorizontalIcon` |

- [ ] **Step 4: StatusChip.**

```ts
// status-chip.types.ts
export type StatusChipTone = "success" | "info" | "warning" | "danger" | "accent" | "neutral";

export interface StatusChipProps {
  tone: StatusChipTone;
  label: string;
  hasDot?: boolean;
  className?: string;
}
```

```tsx
// status-chip.tsx
import { cn } from "@/ui/cn/cn";

import type { StatusChipProps, StatusChipTone } from "./status-chip.types";

const TONE: Record<StatusChipTone, string> = {
  success: "bg-(--component-chip-status-success-background) text-(--component-chip-status-success-text)",
  info: "bg-(--component-chip-status-info-background) text-(--component-chip-status-info-text)",
  warning: "bg-(--component-chip-status-warning-background) text-(--component-chip-status-warning-text)",
  danger: "bg-(--component-chip-status-danger-background) text-(--component-chip-status-danger-text)",
  accent: "bg-(--component-chip-status-accent-background) text-(--component-chip-status-accent-text)",
  neutral: "bg-(--component-chip-status-neutral-background) text-(--component-chip-status-neutral-text)",
};

/**
 * Renders a short, non-interactive status label with a tone and an optional dot (C12).
 * @param props - tone, label and dot visibility
 * @returns the status chip
 */
export function StatusChip({ tone, label, hasDot = true, className }: Readonly<StatusChipProps>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-(--component-chip-status-gap) rounded-(--component-chip-status-radius)",
        "px-(--component-chip-status-padding-x) py-(--component-chip-status-padding-y)",
        "text-(length:--font-size-caption) font-semibold whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {hasDot ? (
        <span data-slot="dot" aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      <span>{label}</span>
    </span>
  );
}
```

The dot is 6 px (`size-1.5`). Sizes can't bind in Pencil; record a DESIGN TOKEN GAP note in the implementation record if lint flags it.

- [ ] **Step 5: Story** `status-chip.stories.tsx`: title `Primitives/Status Chip`, `designSystemSpec: "docs/design-system/components/status-chip.md"`, one story per tone plus `NoDot` (*Segera hadir*). Story strings come from `status-chip.stories.copy.ts`.
- [ ] **Step 6:** `pnpm typecheck && pnpm lint && pnpm test` → PASS.
- [ ] **Step 7:** Commit `feat(ui): add status chip and source icons`.

### Task 2: ListCardItem and ListCardItemSkeleton

**Files:** create `src/ui/patterns/list-card-item/*`.

- [ ] **Step 1: Failing test** `list-card-item.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListCardItem } from "./list-card-item";
import { ListCardItemSkeleton } from "./list-card-item-skeleton";

describe("ListCardItem (C42 two-line)", () => {
  it("AC-SRC-003 renders title, meta and the trailing slot with a separator", () => {
    render(
      <ul>
        <ListCardItem icon="hard-drive" title="Google Drive Utama" meta="Google Drive" trailing={<span>Aktif</span>} />
      </ul>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("Google Drive Utama");
    expect(item).toHaveTextContent("Google Drive");
    expect(item).toHaveTextContent("Aktif");
    expect(item).toHaveClass("border-b");
  });

  it("drops the separator on the last row", () => {
    render(<ul><ListCardItem icon="hard-drive" title="A" meta="B" isLast /></ul>);
    expect(screen.getByRole("listitem")).not.toHaveClass("border-b");
  });

  it("renders a whole-row link with a chevron when href is set", () => {
    render(<ul><ListCardItem icon="image" title="Bagikan gallery" meta="…" href="/x" /></ul>);
    expect(screen.getByRole("link", { name: /Bagikan gallery/ })).toHaveAttribute("href", "/x");
  });

  it("AC-SRC-017 the skeleton is hidden from assistive technology", () => {
    render(<ul><ListCardItemSkeleton /></ul>);
    expect(screen.getByRole("listitem", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**

```ts
// list-card-item.types.ts
import type { ReactNode } from "react";

import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface ListCardItemProps {
  icon: IconName;
  title: string;
  meta: string;
  /** Status Chip and/or a row-actions button. Not allowed together with href (list-card.md). */
  trailing?: ReactNode;
  href?: string;
  isLast?: boolean;
}

export interface ListCardItemSkeletonProps {
  isLast?: boolean;
  hasTrailing?: boolean;
}
```

```tsx
// list-card-item.tsx
import Link from "next/link";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { ListCardItemProps } from "./list-card-item.types";

export const LIST_CARD_ROW = [
  "flex items-center gap-(--component-list-card-item-gap)",
  "px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y)",
];

/**
 * Renders a two-line List Card row: icon, title, meta and a trailing slot, or a whole-row link
 * with a chevron (C42 Two-line).
 * @param props - row content, link and position
 * @returns the list item
 */
export function ListCardItem({ icon, title, meta, trailing, href, isLast = false }: Readonly<ListCardItemProps>) {
  const body = (
    <>
      <span className="flex size-(--space-9) shrink-0 items-center justify-center rounded-(--component-list-card-item-icon-radius) bg-(--component-list-card-item-icon-background) text-(--component-list-card-item-icon)">
        <Icon name={icon} size="md" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-(--component-list-card-item-text-gap)">
        <span className="truncate text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)">{title}</span>
        <span className="text-(length:--font-size-body-sm) text-(--component-list-card-item-meta)">{meta}</span>
      </span>
      {href ? (
        <Icon name="chevron-right" size="sm" aria-hidden="true" className="text-(--component-list-card-item-meta)" />
      ) : (
        trailing ? <span className="flex shrink-0 items-center gap-(--space-2)">{trailing}</span> : null
      )}
    </>
  );
  return (
    <li className={cn(!isLast && "border-b border-(--component-list-card-item-border)")}>
      {href ? (
        <Link href={href} className={cn(LIST_CARD_ROW, "outline-none focus-visible:bg-(--component-list-card-item-icon-background)")}>
          {body}
        </Link>
      ) : (
        <div className={cn(LIST_CARD_ROW)}>{body}</div>
      )}
    </li>
  );
}
```

`list-card-item-skeleton.tsx` uses the same `LIST_CARD_ROW`, with `aria-hidden="true"` on the `<li>`:
- an icon block: `size-(--space-9)`, `rounded-(--component-list-card-item-icon-radius)`, `bg-(--component-list-card-item-skeleton)`;
- two bars, `w-40 h-3` and `w-24 h-2.5`, with `bg-(--component-list-card-item-skeleton)` and `rounded-(--component-list-card-item-skeleton-radius)`;
- an optional `w-14 h-5` trailing bar.

Bar sizes are literals, the same DESIGN TOKEN GAP as F-03's skeleton.

- [ ] **Step 4: Stories** `Patterns/List Card Item`: `TwoLine`, `WithStatusAndMenu`, `Link`, `Skeleton`, each inside a `<ul>` list card frame.
- [ ] **Step 5:** gate → PASS. Commit `feat(ui): add two-line list card item and skeleton`.

### Task 3: Radio and OptionCardGroup

**Files:** create `src/ui/patterns/option-card/*`. The Radio is part of the group; C06 has no standalone code consumer yet.

- [ ] **Step 1: Failing test** `option-card-group.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OptionCardGroup } from "./option-card-group";

const OPTIONS = [
  { value: "GOOGLE_DRIVE", title: "Google Drive", description: "Folder…", icon: "hard-drive" as const },
  { value: "DROPBOX", title: "Dropbox", icon: "dropbox" as const, isDisabled: true, badge: "Segera hadir" },
];

describe("OptionCardGroup (C44)", () => {
  it("AC-SRC-007 selects available options and announces disabled ones", async () => {
    const onChange = vi.fn();
    render(<OptionCardGroup label="Provider" options={OPTIONS} value="GOOGLE_DRIVE" onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "Provider" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Google Drive/ })).toBeChecked();
    const dropbox = screen.getByRole("radio", { name: /Dropbox.*Segera hadir/ });
    expect(dropbox).toBeDisabled();
    await userEvent.click(screen.getByText("Dropbox"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** with `RadioGroup` and `Radio` from `react-aria-components`. Each `Radio` renders the card. The class map follows `option-card.md`:

| State | Classes |
|---|---|
| base | `flex items-center gap-(--component-option-card-gap) p-(--component-option-card-padding) rounded-(--component-option-card-radius) border bg-(--component-option-card-background) border-(--component-option-card-border)` |
| hovered | `data-hovered:border-(--component-option-card-border-hover)` |
| selected | `data-selected:border-2 data-selected:border-(--component-option-card-border-selected)` |
| focus-visible | `data-focus-visible:shadow-[0_0_0_4px_var(--color-semantic-focus-glow)]` |
| disabled | `data-disabled:bg-(--component-option-card-background-disabled) data-disabled:border-(--component-option-card-border-disabled)` |

Inside each card:
- a radio dot (16 px circle, `border-(--color-semantic-border-control)`, selected fill `bg-(--color-semantic-action-primary)` with an inner white dot, as in C06);
- the icon (`text-(--component-option-card-icon)`, disabled `text-(--component-option-card-icon-disabled)`);
- title and description;
- the badge as `<StatusChip tone="neutral" label={badge} hasDot={false} />`.

To keep the badge in the accessible name, put it inside the `Radio`'s content.

Types: `OptionCardOption { value: string; title: string; description?: string; icon: IconName; isDisabled?: boolean; badge?: string }` and `OptionCardGroupProps { label: string; options: readonly OptionCardOption[]; value: string; onChange: (value: string) => void; isLabelVisible?: boolean }`.

- [ ] **Step 4: Story** `Patterns/Option Card`: `ProviderChoice` (the F-04 list) and `AllEnabled`.
- [ ] **Step 5:** gate → PASS. Commit `feat(ui): add option card group`.

### Task 4: Page-actions slot

**Files:** create `src/ui/patterns/page-actions/*`; modify `src/features/workspace/ui/owner-shell/owner-shell.tsx` (+ test).

- [ ] **Step 1: Failing tests.**
  - `page-actions.test.tsx`: renders `<div id={PAGE_ACTIONS_ID} />` and `<PageActions><button>Tambah sumber</button></PageActions>`, then expects the button inside that div after mount.
  - `owner-shell.test.tsx`: the desktop panel contains `#owner-page-actions`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**

```tsx
// page-actions.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { PageActionsProps } from "./page-actions.types";

export const PAGE_ACTIONS_ID = "owner-page-actions";

/**
 * Renders a page's primary actions into the desktop Page Header actions slot (C40), after mount.
 * @param props - the actions
 * @returns a portal, or nothing before mount or when the slot is absent
 */
export function PageActions({ children }: Readonly<PageActionsProps>) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTarget(document.getElementById(PAGE_ACTIONS_ID));
  }, []);
  return target ? createPortal(children, target) : null;
}
```

In `OwnerShell`, pass `panelActions={<div id={PAGE_ACTIONS_ID} className="flex items-center gap-(--space-2)" />}` to `AppShell`.

- [ ] **Step 4:** gate → PASS. Commit `feat(ui): add a page actions slot to the owner shell`.

### Task 5: Domain

**Files:** create the four `features/gallery/domain/*` units.

- [ ] **Step 1: Failing tests.**

```ts
// source-name.test.ts
import { describe, expect, it } from "vitest";

import { findSourceNameProblem, normaliseSourceName, sourceNameKey } from "./source-name";

describe("source name (BR-SRC-005)", () => {
  it.each([
    ["", "EMPTY"],
    ["   ", "EMPTY"],
    ["a".repeat(61), "TOO_LONG"],
    [`  ${"a".repeat(60)}  `, null],
    ["Google Drive Arsip", null],
  ])("AC-SRC-008 %j → %s", (raw, problem) => {
    expect(findSourceNameProblem(raw)).toBe(problem);
  });

  it("AC-SRC-010 trims and keys names case-insensitively", () => {
    expect(normaliseSourceName("  Google Drive Utama ")).toBe("Google Drive Utama");
    expect(sourceNameKey(" google DRIVE utama")).toBe(sourceNameKey("Google Drive Utama"));
  });
});
```

```ts
// source-provider.test.ts
import { describe, expect, it } from "vitest";

import { AVAILABLE_SOURCE_PROVIDERS, emptyProviderConfig, isAvailableSourceProvider, SOURCE_PROVIDERS } from "./source-provider";

describe("source providers (BR-SRC-001, BR-SRC-005)", () => {
  it("AC-SRC-007 lists Google Drive first and only it as available", () => {
    expect(SOURCE_PROVIDERS).toEqual(["GOOGLE_DRIVE", "DROPBOX", "ONEDRIVE", "AMAZON_S3", "CUSTOM_URL"]);
    expect(AVAILABLE_SOURCE_PROVIDERS).toEqual(["GOOGLE_DRIVE"]);
    expect(isAvailableSourceProvider("DROPBOX")).toBe(false);
  });

  it("AC-SRC-016 BR-SRC-003 the Google Drive config is empty", () => {
    expect(emptyProviderConfig("GOOGLE_DRIVE")).toEqual({});
  });
});
```

```ts
// source-order.test.ts
import { describe, expect, it } from "vitest";

import { sortSources } from "./source-order";

describe("sortSources (A-3)", () => {
  it("AC-SRC-003 puts active first, then names case-insensitively", () => {
    const sorted = sortSources([
      { displayName: "Arsip 2024", isActive: false },
      { displayName: "Google Drive Utama", isActive: true },
      { displayName: "google drive arsip", isActive: true },
    ]);
    expect(sorted.map((s) => s.displayName)).toEqual(["google drive arsip", "Google Drive Utama", "Arsip 2024"]);
  });
});
```

`default-source.test.ts` expects `DEFAULT_SOURCE` to equal `{ provider: "GOOGLE_DRIVE", displayName: "Google Drive" }`, and `findSourceNameProblem(DEFAULT_SOURCE.displayName)` to be null.

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**

```ts
// source-provider.types.ts
export type SourceProvider = "GOOGLE_DRIVE" | "DROPBOX" | "ONEDRIVE" | "AMAZON_S3" | "CUSTOM_URL";
export type AvailableSourceProvider = "GOOGLE_DRIVE";
export type ProviderConfig = Readonly<Record<string, never>>;
```

```ts
// source-provider.ts
import type { AvailableSourceProvider, ProviderConfig, SourceProvider } from "./source-provider.types";

export const SOURCE_PROVIDERS: readonly SourceProvider[] = ["GOOGLE_DRIVE", "DROPBOX", "ONEDRIVE", "AMAZON_S3", "CUSTOM_URL"];
export const AVAILABLE_SOURCE_PROVIDERS: readonly AvailableSourceProvider[] = ["GOOGLE_DRIVE"];

/** Checks a value against the provider catalogue. @param value - untrusted value @returns whether it names a provider */
export function isSourceProvider(value: string): value is SourceProvider {
  return SOURCE_PROVIDERS.some((provider) => provider === value);
}

/** Checks whether a provider can be added in MVP (BR-SRC-005). @param value - untrusted value @returns whether it is available */
export function isAvailableSourceProvider(value: string): value is AvailableSourceProvider {
  return AVAILABLE_SOURCE_PROVIDERS.some((provider) => provider === value);
}

/** The provider configuration stored with a new source: always empty in MVP (BR-SRC-002, BR-SRC-003). @param provider - an available provider @returns the empty config */
export function emptyProviderConfig(provider: AvailableSourceProvider): ProviderConfig {
  void provider;
  return {};
}
```

```ts
// source-name.ts
import type { SourceNameProblem } from "./source-name.types";

export const SOURCE_NAME_MAX_LENGTH = 60;

/** Trims a display name. @param raw - untrusted name @returns the stored form */
export function normaliseSourceName(raw: string): string {
  return raw.trim();
}

/** Counts code points like Postgres char_length. @param name - a name @returns its length */
export function sourceNameLength(name: string): number {
  return Array.from(name).length;
}

/** Finds the first rule a name breaks (BR-SRC-005). @param raw - untrusted name @returns the problem or null */
export function findSourceNameProblem(raw: string): SourceNameProblem | null {
  const name = normaliseSourceName(raw);
  if (name.length === 0) return "EMPTY";
  if (sourceNameLength(name) > SOURCE_NAME_MAX_LENGTH) return "TOO_LONG";
  return null;
}

/** The case-insensitive identity of a name, as the DB index compares it. @param raw - a name @returns the key */
export function sourceNameKey(raw: string): string {
  return normaliseSourceName(raw).toLowerCase();
}
```

`source-name.types.ts` is `export type SourceNameProblem = "EMPTY" | "TOO_LONG";`. The use-case layer adds `NAME_TAKEN`.

```ts
// source-order.ts
/** Orders sources: active first, then by name ignoring case (A-3). @param sources - sources to sort @returns a new sorted array */
export function sortSources<T extends { readonly displayName: string; readonly isActive: boolean }>(sources: readonly T[]): T[] {
  return [...sources].sort((a, b) =>
    a.isActive === b.isActive
      ? a.displayName.localeCompare(b.displayName, "id", { sensitivity: "base" })
      : a.isActive ? -1 : 1,
  );
}
```

`default-source.ts`: `export const DEFAULT_SOURCE = { provider: "GOOGLE_DRIVE", displayName: "Google Drive" } as const satisfies { provider: AvailableSourceProvider; displayName: string };`. If lint forbids `as const`, use a typed `Readonly` object instead.

- [ ] **Step 4:** gate → PASS. Commit `feat(gallery): add source provider and name rules`.

### Task 6: Schema and migrations (Owner checkpoint)

**Files:** create `src/adapters/db/schema/gallery/workspace-source-config.ts`; modify `schema/index.ts`; generate `drizzle/0004_*`, `0005_*`; create `tests/config/workspace-source-backfill.test.ts`.

- [ ] **Step 1: Table.**

```ts
import { sql } from "drizzle-orm";
import { boolean, check, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-04 photo sources (BR-SRC-005/006). F-09's gallery_source references (workspace_id, id) with RESTRICT.
export const workspaceSourceConfig = pgTable(
  "workspace_source_config",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    provider: text("provider").notNull(),
    displayName: text("display_name").notNull(),
    configData: jsonb("config_data").notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("workspace_source_config_workspace_name_uq").on(t.workspaceId, sql`lower(${t.displayName})`),
    check("workspace_source_config_provider_ck", sql`${t.provider} in ('GOOGLE_DRIVE')`),
    check(
      "workspace_source_config_name_ck",
      sql`char_length(${t.displayName}) between 1 and 60 and ${t.displayName} = btrim(${t.displayName})`,
    ),
    check("workspace_source_config_config_ck", sql`jsonb_typeof(${t.configData}) = 'object'`),
  ],
);
```

Export it from `schema/index.ts`.

- [ ] **Step 2:** `pnpm db:generate --name workspace_source_config`. Review the SQL: the table, the four constraints and the expression index.
- [ ] **Step 3:** `pnpm drizzle-kit generate --custom --name workspace_source_config_backfill`, then paste the backfill into the generated file:

```sql
INSERT INTO "workspace_source_config" ("workspace_id", "provider", "display_name")
SELECT w."id", 'GOOGLE_DRIVE', 'Google Drive' FROM "workspace" w
WHERE NOT EXISTS (SELECT 1 FROM "workspace_source_config" s WHERE s."workspace_id" = w."id")
ON CONFLICT DO NOTHING;
```

- [ ] **Step 4: Config test.**

```ts
import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_SOURCE } from "@/features/gallery/domain/default-source/default-source";

const dir = new URL("../../drizzle/", import.meta.url);
const file = readdirSync(dir).find((name) => name.endsWith("_workspace_source_config_backfill.sql"));
const sql = readFileSync(new URL(file ?? "missing.sql", dir), "utf8");

describe("workspace source backfill migration", () => {
  it("AC-SRC-002 BR-SRC-005 seeds the default Google Drive source", () => {
    expect(sql).toContain(`'${DEFAULT_SOURCE.provider}', '${DEFAULT_SOURCE.displayName}'`);
  });

  it("AC-SRC-002 is idempotent", () => {
    expect(sql).toContain("WHERE NOT EXISTS");
    expect(sql).toContain("ON CONFLICT DO NOTHING");
  });
});
```

- [ ] **Step 5:** gate → PASS. Commit `feat(gallery): add workspace source config table and backfill`.
- [ ] **Step 6: STOP — Owner checkpoint.** Ask the Owner to review 0004/0005 and apply them, or to approve this specific `pnpm db:migrate` run. Don't start Task 8 until they are applied.

### Task 7: Application layer

**Files:** create the port, errors, schemas and use cases, plus `tests/support/gallery/fake-workspace-source-repository.ts`.

- [x] **Step 1: Port.**

```ts
import "server-only";

import type { AvailableSourceProvider, SourceProvider } from "@/features/gallery/domain/source-provider/source-provider.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface WorkspaceSourceRecord {
  readonly id: string;
  readonly provider: SourceProvider;
  readonly displayName: string;
  readonly isActive: boolean;
}

export interface NewWorkspaceSource {
  readonly provider: AvailableSourceProvider;
  readonly displayName: string;
  readonly editorUserId: string | null;
}

// Every call is scoped by the verified workspace (C-101).
export interface WorkspaceSourceRepositoryPort {
  readonly listForWorkspace: (context: WorkspaceContext) => Promise<readonly WorkspaceSourceRecord[]>;
  readonly create: (context: WorkspaceContext, source: NewWorkspaceSource) => Promise<"CREATED" | "NAME_TAKEN">;
  readonly rename: (context: WorkspaceContext, change: { readonly id: string; readonly displayName: string; readonly editorUserId: string }) => Promise<"UPDATED" | "NAME_TAKEN" | "NOT_FOUND">;
  readonly setActive: (context: WorkspaceContext, change: { readonly id: string; readonly isActive: boolean; readonly editorUserId: string }) => Promise<boolean>;
  readonly delete: (context: WorkspaceContext, id: string) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
  /** Inserts the source only when the workspace has none (BR-SRC-005). */
  readonly seedDefault: (context: WorkspaceContext, source: NewWorkspaceSource) => Promise<void>;
}
```

- [x] **Step 2: Schemas** (`*.schema.ts`, no `server-only`):

```ts
// source-name.schema.ts
import { z } from "zod";

import { findSourceNameProblem } from "@/features/gallery/domain/source-name/source-name";

export const sourceNameSchema = z.object({
  displayName: z.string().refine((value) => findSourceNameProblem(value) === null, {
    error: (issue) => (typeof issue.input === "string" ? (findSourceNameProblem(issue.input) ?? "EMPTY") : "EMPTY"),
  }),
});
```

```ts
// add-source.schema.ts
import { z } from "zod";

import { sourceNameSchema } from "../source-name/source-name.schema";

export const addSourceSchema = sourceNameSchema.extend({
  provider: z.literal("GOOGLE_DRIVE", { error: "PROVIDER_UNAVAILABLE" }),
});
```

`source-id.schema.ts`: `export const sourceIdSchema = z.uuid();`. The input types (`SourceNameInput`, `AddSourceInput`) go in sibling `.types.ts` via `z.input<typeof …>`. Schema tests:
- AC-SRC-007: `addSourceSchema` rejects `provider: "DROPBOX"` with `PROVIDER_UNAVAILABLE`;
- AC-SRC-008: empty and 61-character names.

- [x] **Step 3: Errors.** `SourceConfigError extends DomainError` with `SourceConfigErrorCode = "NOT_FOUND" | "SAVE_FAILED"`, the same shape as `MessageTemplateError`.
- [x] **Step 4: Fake repository.** Mirror `FakeMessageTemplateRepository`:
  - rows hold `workspaceId`, `id`, `provider`, `displayName`, `isActive`, `configData`, `updatedBy`;
  - `create` and `rename` return `NAME_TAKEN` when `sourceNameKey` matches another row in the same workspace;
  - `delete` returns `IN_USE` for IDs in a public `inUse: Set<string>`;
  - `seedDefault` inserts only when the workspace has no rows.
- [x] **Step 5: Failing use-case tests.** One test file per use case, named by AC:
  - `add-workspace-source.test.ts`:
    - AC-SRC-006: `"  Google Drive Arsip "` is stored trimmed, active, with `configData` `{}` and `updatedBy` `owner_1`;
    - AC-SRC-007: `provider: "DROPBOX"` → `{ ok:false, code:"VALIDATION_FAILED", fieldErrors:{ provider:"PROVIDER_UNAVAILABLE" } }`;
    - AC-SRC-008: empty → `displayName: "EMPTY"`;
    - AC-SRC-009: `"google drive"` next to the seeded *Google Drive* → `displayName: "NAME_TAKEN"`, and the same name in another workspace is allowed.
  - `rename-workspace-source.test.ts`:
    - AC-SRC-010: trimmed rename with editor;
    - AC-SRC-009: duplicate → `NAME_TAKEN`;
    - AC-SRC-015: an unknown ID throws `NOT_FOUND`.
  - `set-workspace-source-active.test.ts`: AC-SRC-011 deactivate then reactivate; AC-SRC-015 unknown → `NOT_FOUND`.
  - `delete-workspace-source.test.ts`: AC-SRC-012 deletes; AC-SRC-013 `inUse` → `{ ok:false, code:"IN_USE" }` and the row stays; AC-SRC-015 unknown → `NOT_FOUND`.
  - `list-workspace-sources.test.ts`: AC-SRC-003 sorted order.
  - `seed-default-source.test.ts`: AC-SRC-001 one *Google Drive*; calling it twice still gives one row.
- [x] **Step 6:** run → FAIL. **Step 7: Implement** the use cases. Result types:

```ts
export type SourceFieldErrorKey = "EMPTY" | "TOO_LONG" | "NAME_TAKEN" | "PROVIDER_UNAVAILABLE";
export interface SourceValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: { readonly displayName?: SourceFieldErrorKey; readonly provider?: SourceFieldErrorKey };
}
export type SourceWriteResult = { readonly ok: true } | SourceValidationFailure;
export type DeleteSourceResult = { readonly ok: true } | { readonly ok: false; readonly code: "IN_USE" };
```

The use cases:
- parse with the schema;
- map the first issue's path (`displayName` | `provider`) and message to `fieldErrors`;
- call the port with `normaliseSourceName` and `emptyProviderConfig`;
- map port results as in the technical design.

`listWorkspaceSources` returns `sortSources(await repository.listForWorkspace(context))`.

- [x] **Step 8:** gate → PASS. Commit `feat(gallery): add workspace source use cases`.

### Task 8: Drizzle repository and integration tests

**Files:** create `src/adapters/db/workspace-source-repository/drizzle-workspace-source-repository.ts` and `tests/integration/gallery/workspace-source-repository.test.ts`.

- [x] **Step 1: Failing integration tests.** Use the same harness as the F-03 integration test (`openTestDb`, `seedOwner`, `seedWorkspace`):
  - AC-SRC-002: `seedDefaultSource` twice → 1 row, `GOOGLE_DRIVE` / *Google Drive* / active / `config_data = {}`;
  - AC-SRC-009: `create` *GOOGLE DRIVE* after the seed → `NAME_TAKEN`; another workspace may use *Google Drive*;
  - AC-SRC-011: `setActive` false then true;
  - AC-SRC-012: `delete` → `DELETED`, and the row is gone;
  - AC-SRC-015: `rename`, `setActive` and `delete` with another workspace's context → `NOT_FOUND` / false, and nothing changes;
  - AC-SRC-016: a created source has `config_data = '{}'::jsonb`;
  - AC-SRC-001 (ADR-016): a `db.transaction` that seeds templates and the source, then throws, leaves no source row.
- [x] **Step 2:** `pnpm test:integration tests/integration/gallery` → FAIL.
- [x] **Step 3: Implement.** Mirror `createDrizzleMessageTemplateRepository`:
  - **Scope:** every statement filters `eq(workspaceSourceConfig.workspaceId, context.workspaceId)`, and `id` where needed.
  - **Write mapping:** `create` and `rename` catch a unique violation and return `NAME_TAKEN`; `delete` catches an FK violation and returns `IN_USE`. Drizzle wraps driver errors, so read the code from `error.code` or `error.cause.code`:

```ts
function pgCode(error: unknown): string | undefined {
  const read = (value: unknown) =>
    typeof value === "object" && value !== null && "code" in value && typeof value.code === "string" ? value.code : undefined;
  return read(error) ?? (typeof error === "object" && error !== null && "cause" in error ? read(error.cause) : undefined);
}
```

  - **Updates and deletes:** use `.returning({ id })`; an empty result means `NOT_FOUND` / false. `updatedAt: new Date()` is set on rename and setActive.
  - **`seedDefault`:** `insert … select … where not exists` through `sql`, or check-then-insert inside the caller's transaction, with `onConflictDoNothing()`.
  - **Reads:** `listForWorkspace` maps rows with `isSourceProvider` and skips unknown providers, never guessing.
- [x] **Step 4: AC-SRC-013 unit test** `drizzle-workspace-source-repository.test.ts` with a stub executor whose `delete().where().returning()` rejects `{ cause: { code: "23503" } }` → `IN_USE`.
- [x] **Step 5:** gate + `pnpm test:integration` → PASS. Commit `feat(gallery): add drizzle workspace source repository`.

### Task 9: Composition and server actions

**Files:** create `composition/gallery/source-config-scope/*`, `composition/gallery/source-config-flow/*` and `app/actions/gallery/photo-sources.ts`; modify `composition/workspace/workspace-creation-scope/*` and `owner-workspace.ts`.

- [ ] **Step 1: Failing flow test** `source-config-flow.test.ts`. Mock the logger, `next/navigation`, `owner-guard`, `verifyOwnerWorkspace` and the scope, as in `message-template-flow.test.ts`:
  - AC-SRC-006: `addPhotoSource("ws-1", { provider:"GOOGLE_DRIVE", displayName:"Arsip" })` calls `create` with the verified context and editor `owner_1`;
  - AC-SRC-015: `renamePhotoSource("ws-1", "not-a-uuid", …)` → `notFound`;
  - AC-SRC-015: the port's `NOT_FOUND` → `notFound`;
  - AC-SRC-014 / AC-SRC-016: the port throws `Error("db down")` → `SourceConfigError("SAVE_FAILED")`, and the logger was called with exactly `("source_config.save_failed", { workspaceId: "ws-1", sourceId: <id>, operation: "rename" })`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - `withSourceConfigScope(work)` returns `withRequestDb((db) => work({ sources: createDrizzleWorkspaceSourceRepository(db) }))`.
  - `source-config-flow.ts` exports `loadPhotoSources(rawId)` → `{ sources: PhotoSourceView[] }`, where `PhotoSourceView = { id, displayName, provider, isActive }`. It also exports `addPhotoSource`, `renamePhotoSource`, `setPhotoSourceActive` and `deletePhotoSource`, following `saveMessageTemplate`:

    ```text
    account = requireOwnerOrRedirect() → verified = verifyOwnerWorkspace(rawId)
    → id = sourceIdSchema.safeParse(rawSourceId) (fail → notFound())
    → try use case; catch SourceConfigError NOT_FOUND → notFound();
      non-DomainError → logger.error("source_config.save_failed", {...}); throw new SourceConfigError("SAVE_FAILED")
    ```

  - `WorkspaceCreationScope` gains `sources: WorkspaceSourceRepositoryPort` (`createDrizzleWorkspaceSourceRepository(tx)`). `createOwnerFirstWorkspace` and `createOwnerWorkspace` call `await seedDefaultSource(sources, { workspaceId: created.id })` after `seedDefaultTemplates`.
  - Server actions:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { addPhotoSource, deletePhotoSource, renamePhotoSource, setPhotoSourceActive } from "@/composition/gallery/source-config-flow/source-config-flow";
import type { AddSourceInput } from "@/features/gallery/application/schemas/add-source/add-source.types";
import type { SourceNameInput } from "@/features/gallery/application/schemas/source-name/source-name.types";
import type { DeleteSourceResult, SourceValidationFailure } from "@/features/gallery/application/use-cases/add-workspace-source/add-workspace-source.types";

const PAGE = "/w/[workspaceId]/photo-sources";

export async function addSourceAction(workspaceId: string, values: AddSourceInput): Promise<SourceValidationFailure | undefined> {
  const result = await addPhotoSource(workspaceId, values);
  if (!result.ok) return result;
  revalidatePath(PAGE, "page");
  return undefined;
}

export async function renameSourceAction(workspaceId: string, sourceId: string, values: SourceNameInput): Promise<SourceValidationFailure | undefined> {
  const result = await renamePhotoSource(workspaceId, sourceId, values);
  if (!result.ok) return result;
  revalidatePath(PAGE, "page");
  return undefined;
}

export async function setSourceActiveAction(workspaceId: string, sourceId: string, isActive: boolean): Promise<void> {
  await setPhotoSourceActive(workspaceId, sourceId, isActive);
  revalidatePath(PAGE, "page");
}

export async function deleteSourceAction(workspaceId: string, sourceId: string): Promise<DeleteSourceResult> {
  const result = await deletePhotoSource(workspaceId, sourceId);
  if (result.ok) revalidatePath(PAGE, "page");
  return result;
}
```

- [ ] **Step 4:** Extend the creation integration test (Task 8, AC-SRC-001) to go through `withWorkspaceCreationScope` if the harness allows; otherwise keep the `db.transaction` version.
- [ ] **Step 5:** gate + integration → PASS. Commit `feat(gallery): wire photo sources and seed the default source`.

### Task 10: Navigation and route

**Files:**
- modify `owner-nav.copy.ts`, `owner-nav.tsx`, `owner-shell.tsx`, `coming-soon-sections.ts` and their tests;
- modify `tests/e2e/app-shell-revamp/app-shell-revamp.spec.ts`;
- create `app/(owner)/w/[workspaceId]/photo-sources/{page,loading}.tsx` and `features/gallery/ui/source-copy/source-copy.copy.ts`.

- [ ] **Step 1: Failing tests.**
  - `owner-nav.test.tsx`, AC-SRC-004: the bottom nav has *Sumber foto* linking to `/w/ws/photo-sources` with the `folder-open` icon, and active on that path; `resolvePageHeading` for `/w/ws/photo-sources` gives *Sumber foto* and the subtitle below.
  - `owner-shell.test.tsx`: the menu sheet labels contain *Sumber foto*, not *Sumber klien*.
  - `coming-soon-sections.test.ts`: `isComingSoonSection("client-sources") === false`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - **Copy:** `photoSources: "Sumber foto"` replaces `clientSources`, and `photoSourcesSubtitle: "Tempat foto gallery-mu disimpan. Shutrly hanya membaca, tidak pernah mengubah isinya."` is added.
  - **Nav entries:** `["photo-sources", OWNER_NAV_COPY.photoSources, "folder-open"]` replaces the old entry in `OwnerNavBottom` and `MOBILE_MENU_ITEMS`. Update the icon union.
  - **Sections:** remove `client-sources` from `SECTION_TITLES` and `COMING_SOON_SECTIONS`; add a `photo-sources` heading branch like `message-templates`.
  - **E2E:** in the app-shell spec, replace `OWNER_NAV_COPY.clientSources` with `OWNER_NAV_COPY.photoSources`.
  - **`page.tsx`:** `const { sources } = await loadPhotoSources(workspaceId); return <PhotoSourcesScreen workspaceId={workspaceId} sources={sources} />;`. Until Task 11 lands, `PhotoSourcesScreen` may be a minimal list.
  - **`loading.tsx`:** `<PhotoSourcesSkeleton />`.
  - **`source-copy.copy.ts`:** every F-04 string from the frames, with `PROVIDER_COPY` for the provider titles:

```ts
export const PROVIDER_COPY = {
  GOOGLE_DRIVE: { title: "Google Drive", description: "Folder yang dibagikan lewat link, hanya dibaca.", icon: "hard-drive" },
  DROPBOX: { title: "Dropbox", icon: "dropbox" },
  ONEDRIVE: { title: "OneDrive", icon: "cloud" },
  AMAZON_S3: { title: "Amazon S3", icon: "database" },
  CUSTOM_URL: { title: "Custom URL", icon: "link" },
} as const;

export const SOURCE_COPY = {
  listTitle: "Daftar sumber",
  listDescription: "Pilih salah satu saat membuat gallery. Sumber nonaktif tidak bisa dipilih.",
  listDescriptionMobile: "Pilih salah satu saat membuat gallery.",
  add: "Tambah sumber",
  addShort: "Tambah",
  active: "Aktif",
  inactive: "Nonaktif",
  comingSoon: "Segera hadir",
  rowActions: (name: string) => `Aksi untuk ${name}`,
  rename: "Ganti nama",
  deactivate: "Nonaktifkan",
  activate: "Aktifkan",
  delete: "Hapus",
  emptyTitle: "Belum ada sumber foto",
  emptyBody: "Tambahkan Google Drive agar foto bisa ditautkan ke gallery.",
  guideTitle: "Menyiapkan folder Google Drive",
  guideDescription: "Shutrly hanya membaca foto di folder yang kamu bagikan. Tautannya ditempel saat membuat gallery.",
  guideDescriptionMobile: "Tautan folder ditempel saat membuat gallery.",
  steps: [
    "Buat satu folder utama untuk setiap proyek.",
    "Taruh foto proof langsung di folder utama, tidak di dalam subfolder.",
    "Untuk hasil akhir, nanti tambahkan subfolder edited dan print.",
    "Bagikan folder utama: Akses umum → Siapa saja yang memiliki link, peran Pelihat.",
  ],
  treeRoot: "Wedding Rina & Dimas",
  treeRootMeta: "foto proof langsung di sini",
  treeEdited: "hasil edit, ditambahkan nanti",
  treePrint: "file cetak, ditambahkan nanti",
  warningTitle: "Tautan Drive bisa melewati password gallery",
  warningBody: "Siapa pun yang memegang tautan folder Drive bisa membuka fotonya langsung, tanpa link gallery dan password. Ke klien, bagikan hanya link gallery dari Shutrly.",
  warningBodyShort: "Siapa pun yang memegang tautan folder Drive bisa membuka fotonya langsung. Ke klien, bagikan hanya link gallery dari Shutrly.",
  addTitle: "Tambah sumber foto",
  addDescription: "Pilih tempat foto disimpan. Saat ini Shutrly mendukung Google Drive.",
  providerLabel: "Provider",
  nameLabel: "Nama sumber",
  namePlaceholder: "mis. Google Drive Arsip",
  nameHelper: "Muncul saat memilih sumber untuk gallery.",
  cancel: "Batal",
  adding: "Menambahkan…",
  renameTitle: "Ganti nama sumber",
  renameDescription: "Nama baru langsung dipakai di semua tempat.",
  save: "Simpan",
  saving: "Menyimpan…",
  deleteTitle: (name: string) => `Hapus sumber "${name}"?`,
  deleteBody: "Sumber ini hilang dari workspace. Folder dan foto di Google Drive tidak terpengaruh.",
  deleteMeta: "Folder dan foto di Google Drive tidak terpengaruh.",
  deleteConfirm: "Hapus sumber",
  inUse: "Sumber ini dipakai gallery. Nonaktifkan saja.",
  addedTitle: "Sumber ditambahkan",
  addedBody: (name: string) => `${name} siap dipilih saat membuat gallery.`,
  renamedTitle: "Nama sumber diperbarui",
  deactivatedTitle: "Sumber dinonaktifkan",
  deactivatedBody: (name: string) => `${name} tidak bisa dipilih untuk gallery baru.`,
  undo: "Batalkan",
  activatedTitle: "Sumber diaktifkan",
  deletedTitle: "Sumber dihapus",
  serverErrorTitle: "Perubahan belum tersimpan",
  serverErrorBody: "Terjadi kendala di server. Data sumbermu tidak berubah.",
  retry: "Coba lagi",
  nameErrors: {
    EMPTY: "Isi nama sumber.",
    TOO_LONG: "Nama sumber maksimal 60 karakter.",
    NAME_TAKEN: "Nama ini sudah dipakai di workspace ini.",
    PROVIDER_UNAVAILABLE: "Provider ini belum tersedia.",
  },
} as const;
```

The toast bodies for renamed, activated and deleted aren't in the frames; they use the source name: ``${name} sudah diperbarui.`` etc. Record them as "not in Pencil" in the copy file, as F-02 did.

- [ ] **Step 4:** gate → PASS. Commit `feat(gallery): add the sumber foto route and navigation`.

### Task 11: Sumber foto screen

**Files:** create `photo-sources-screen`, `source-row`, `setup-guide-card`, `photo-sources-skeleton`, `source-name-error`.

- [ ] **Step 1: Failing tests** (`photo-sources-screen.test.tsx`, render inside `ToastRegion` like F-03's editor test):
  - AC-SRC-003: with three sources (two active, one inactive), the rows appear in that order. Rows show *Aktif* / *Nonaktif* chips, *Google Drive* meta and a row-actions button named *Aksi untuk Google Drive Utama*. The guide shows four steps and the warning title.
  - AC-SRC-005: with no sources, the empty state *Belum ada sumber foto* has a *Tambah sumber* button, and the guide still renders.
  - The desktop *Tambah sumber* renders through `PageActions` (mock `useMobileViewport` → false). On phones (true), *Tambah* sits in the card header.
  - `source-name-error.test.ts`: every key maps to `SOURCE_COPY.nameErrors`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** from `exports/list-populated-q4btAK.html`, `list-populated-w4uSN.html`, `list-empty-*` and `list-loading-*`:
  - **Card:** `SectionCard content="flush"`, title `SOURCE_COPY.listTitle`, description desktop/mobile. On phones, the `actions` slot holds `<Button variant="secondary" iconLeading="plus">{SOURCE_COPY.addShort}</Button>`.
  - **Rows:** `<ul>` of `SourceRow` → `ListCardItem icon="hard-drive" title meta={PROVIDER_COPY[provider].title} trailing={<><StatusChip …/><SourceRowActions …/></>} isLast`.
  - **Empty:** `EmptyState icon="folder-open"` inside the card's padded content when `sources.length === 0`.
  - **`SetupGuideCard`:** `SectionCard` with the numbered steps (`<ol>`, 24 px number dots in `surface.muted` / `text.secondary`). The folder tree (`surface.sunken`, `radius.md`, `space.4` padding; folder icons `folder-open` / `folder`) is a figure with `aria-label` *Contoh struktur folder*. Then `<Alert tone="warning" title body live={false} />`. Phones use `warningBody`; the desktop guide uses the same.
  - **`PhotoSourcesSkeleton`:** the same cards with three `ListCardItemSkeleton`s (the last with `isLast`) and the guide card shape.
  - **Layout:** a centred `max-w-[720px]` column on desktop, the `gap-(--component-panel-app-content-gap)` stack used by F-03's list.
  - **Dialogs:** the screen owns their state (`useState<{ kind: "add" } | { kind: "rename" | "delete"; source } | null>`), so Tasks 12–13 plug in.
- [ ] **Step 4:** gate → PASS. Commit `feat(gallery): add the sumber foto list screen`.

### Task 12: Add and rename dialogs

**Files:** create `add-source-dialog`, `rename-source-dialog`, `use-source-mutations` (add and rename parts).

- [ ] **Step 1: Failing tests.**
  - `add-source-dialog.test.tsx`:
    - AC-SRC-006: type *Google Drive Arsip*, submit → the action is called with `("ws-1", { provider:"GOOGLE_DRIVE", displayName:"Google Drive Arsip" })`, the dialog closes, and the toast reads *Sumber ditambahkan*;
    - AC-SRC-007: the provider group shows Dropbox, OneDrive, Amazon S3 and Custom URL disabled with *Segera hadir*;
    - AC-SRC-008: an empty submit shows *Isi nama sumber.* and doesn't call the action;
    - AC-SRC-009: the action returns `NAME_TAKEN` → the field shows *Nama ini sudah dipakai di workspace ini.*;
    - AC-SRC-014: the action rejects → Toast/Danger *Perubahan belum tersimpan* with *Coba lagi*; the dialog stays open with the typed name; *Coba lagi* resubmits;
    - while saving, the confirm button is pending, labelled *Menambahkan…*.
  - `rename-source-dialog.test.tsx`: AC-SRC-010 prefilled name, save → action with the trimmed name and toast *Nama sumber diperbarui*; NAME_TAKEN field error; empty error.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** following `CreateWorkspaceDialog` (Modal on desktop, `BottomSheet variant="form"` on phones, `useMobileViewport`) and `exports/add-*`, `rename-*`:
  - **Add:** `size="md"`, title/description from copy. Body: `OptionCardGroup` (label *Provider*; options from `SOURCE_PROVIDERS` × `PROVIDER_COPY`; non-available ones get `isDisabled` and `badge: SOURCE_COPY.comingSoon`), then `TextField` *Nama sumber* (placeholder, helper, `errorMessage`), then `<Alert tone="warning" title={warningTitle} body={warningBodyShort} />`. Actions: *Batal* (secondary) and the submit button (`isPending`, label switches to *Menambahkan…*). On phones, one LG full-width submit.
  - **Rename:** `size="sm"`, one `TextField` prefilled; actions *Batal* and *Simpan* (*Menyimpan…* while pending).
  - **Forms:** RHF + `zodResolver(addSourceSchema | sourceNameSchema)`. A server `fieldErrors` result goes to `form.setError(field, { message: key })` and the field gets focus.
  - **`useSourceMutations(workspaceId)`:** returns `add`, `rename`, `setActive` and `remove`. Each wraps the bound action, shows the success toast, and on rejection shows the danger toast with `action: { label: retry, onAction: retry }` and rethrows nothing (F-03's `handleFailed` pattern).
- [ ] **Step 4:** gate → PASS. Commit `feat(gallery): add source add and rename dialogs`.

### Task 13: Row actions, deactivate and delete

**Files:** create `source-row-actions` and `delete-source-dialog`; extend `use-source-mutations`.

- [ ] **Step 1: Failing tests.**
  - `source-row-actions.test.tsx`:
    - desktop: the ⋯ button (`IconButton icon="more-horizontal" size="sm"`, `aria-label` *Aksi untuk {name}*) opens a `Menu` with *Ganti nama*, *Nonaktifkan*, a divider, and *Hapus* (destructive);
    - an inactive source shows *Aktifkan* instead;
    - phone: the same items in `BottomSheet variant="actions"`, with the title set to the name and the meta *Google Drive · Aktif*;
    - AC-SRC-011: *Nonaktifkan* calls `setSourceActiveAction(ws, id, false)` with no confirmation dialog. The toast *Sumber dinonaktifkan* has *Batalkan*, which calls `setSourceActiveAction(ws, id, true)`.
  - `delete-source-dialog.test.tsx`: AC-SRC-012 *Hapus* opens *Hapus sumber "Arsip 2024"?*; *Batal* closes without a call; *Hapus sumber* calls the action and shows *Sumber dihapus*. AC-SRC-013: an `IN_USE` result shows `SOURCE_COPY.inUse` in a danger toast and keeps the row.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - **Desktop:** `MenuTrigger` + `Menu` + `MenuItem` (existing C10 code), per `exports/list-row-menu-UPlrT.html`.
  - **Phone:** `BottomSheet variant="actions"` + `SheetItem` (`row-actions-sheet-J0kFv`).
  - **Delete confirmation:** `Modal size="sm" isDestructive` with a `Button variant="danger"` (`delete-confirm-YAP3e`), or `BottomSheet variant="actions"` with a destructive `SheetItem` *Hapus sumber* and *Batal* (`delete-confirm-q5h45`).
- [ ] **Step 4:** gate → PASS. Commit `feat(gallery): add source row actions and delete confirmation`.

### Task 14: E2E, fidelity and implementation record

**Files:** create `tests/e2e/photo-sources/photo-sources.spec.ts`; modify `technical-design.md` (implementation record), `spec.md`, `feature-map.md`, `HANDOFF.md`.

- [ ] **Step 1: E2E journeys.** Use F-03's helpers: `registerAndVerify`, onboarding, and scoping to `#app-shell-content` / `#mobile-app-content`.
  1. **AC-SRC-001/003/004:**
     - a new workspace's *Sumber foto* (via the nav, icon item *Sumber foto*) shows *Google Drive · Aktif*, the guide and the warning;
     - the nav item is `aria-current`;
     - `/w/<id>/client-sources` is not found.
  2. **AC-SRC-006/009/010/011/012/005:**
     - add *Google Drive Arsip* → listed;
     - add *google drive arsip* → the duplicate error;
     - rename *Google Drive* → *Google Drive Utama*;
     - deactivate *Google Drive Arsip* → *Nonaktif* chip, the row moves last; *Batalkan* → *Aktif*;
     - delete both → empty state.
  3. **AC-SRC-015:** a second owner opening the first owner's `/w/<id>/photo-sources` sees *Workspace tidak ditemukan*.
  4. **AC-SRC-017:** axe (wcag2a/2aa/21a/21aa) at 1440 and 390 px on the list, the open add dialog, and the delete confirmation → 0 violations; the keyboard reaches ⋯ → menu → *Ganti nama* → dialog → Esc returns focus.
- [ ] **Step 2:** `pnpm e2e tests/e2e/photo-sources` → PASS; full `pnpm e2e` → PASS.
- [ ] **Step 3: Browser fidelity.** Run `pnpm dev` and compare 1440 / 390 px with the 24 exports. Fix class names and nesting only.
- [ ] **Step 4: Implementation record** in `technical-design.md`: commits, deviations (expected: page-action flash, skeleton literals, focus glow), and the AC → test map. Set the feature status to IN PROGRESS → ready for `/sdv:verify-feature source-config`. Update `HANDOFF.md`.
- [ ] **Step 5:** gate → PASS. Commit `test(gallery): add photo sources journeys and record the build`.
