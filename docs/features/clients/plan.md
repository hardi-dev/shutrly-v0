# F-06 Clients — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo, `/sdv:build-feature clients <n>` runs Task n.

**Goal:** On *Klien*, the Owner manages the workspace's clients:
- *Aktif* and *Arsip* tabs, a count in the list title, search by name or WhatsApp number, and 30 rows per page with *Muat lebih banyak*;
- add and edit dialogs with a normalized, unique WhatsApp number and 0–10 social links;
- archive with undo, restore, and a guarded delete.

**Architecture:**
- Clients join the `booking` feature (`src/features/booking/{domain,application,ui}`), added by F-05.
- One Drizzle table, `client`, sits behind `ClientRepositoryPort`; social links are a schema-validated JSONB array.
- Composition verifies the workspace (F-02) and wires the routes and actions. The tabs are routes (`/clients`, `/clients/archived`) shown through F-05's owner-shell section tabs.
- A new shared `DataTable` pattern (C27, React Aria `Table`) renders the desktop list; phones use Section Card + List Card Item rows.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), Hugeicons, Vitest (unit, dom, integration), Playwright + axe, Storybook.

**Sources:**
- design: [design.md](design.md) and `exports/*.html` (37 frames);
- technical design: [technical-design.md](technical-design.md) (decisions D-1…D-8);
- component specs: `docs/design-system/components/{table,tabs,page-header,segmented-control,section-card,list-card,select,empty-state,menu,modal,bottom-sheet}.md`.

**Base (Owner 2026-10-02):** F-05 (`feat/catalog`) is merged to `main` before Task 1. The plan uses F-05's code by name: `features/booking`, `adapters/db/catalog-repository/pg-error`, `Tabs`, `PageHeader` `tabs`, owner-nav section tabs, `SegmentedControl isFullWidth`, `Select`, `EmptyState placement="in-card"`, and the `archive` / `archive-restore` icons. The migration is `0008`.

## Global Constraints

Every task's requirements implicitly include this section. They are the same as F-05's (`docs/features/catalog/plan.md` › Global Constraints) plus:

- **Boundaries (lint):** `features/booking` never imports another feature, nor the reverse. The client code never imports catalog modules except shared booking files named in this plan (`pg-error`).
- **Rule values (named constants, never literals):**
  - `CLIENT_NAME_MAX_LENGTH = 100` (code points, after trim); names are not unique (BR-CLI-001);
  - `WHATSAPP_DIGITS_MIN = 10`, `WHATSAPP_DIGITS_MAX = 15`; no leading `0`, no `620…` (BR-CLI-002);
  - `SOCIAL_PLATFORMS = ["INSTAGRAM", "TIKTOK", "FACEBOOK", "YOUTUBE", "X", "OTHER"]` (A-2 order), `SOCIAL_LINK_MAX_COUNT = 10`, `SOCIAL_VALUE_MAX_LENGTH = 200` (BR-CLI-001);
  - `CLIENT_PAGE_SIZE = 30` (A-5); `CLIENT_SEARCH_MAX_LENGTH = 100` (TD-A-1).
- **Copy:** the Indonesian strings come from the frames and design.md › Copy. Strings not drawn carry `// not in Pencil`.
- **Logging (C-103, AC-CLI-019):** log `client.save_failed` with `{ workspaceId, clientId?, operation }` only. Never log a name, number, social link, search query or `wa.me` URL.
- **Migrations:** generate 0008 with drizzle-kit, review it, commit it, then apply it with `pnpm db:migrate` against the shared non-production database (`.dev.vars`), per AGENTS.md and `docs/architecture/tech-stack.md` › Deployment. Report the run.
- **Tests:** names start with the `AC-CLI-*` / `BR-CLI-*` IDs they cover.
- **Quality gate per task:** `pnpm typecheck`, `pnpm lint` and `pnpm test` pass. From Task 6 on, `pnpm test:integration` also passes.
- **Commits:** one per task; conventional, lowercase, with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```text
src/ui/primitives/icon/                        registry + types: message-circle, user
src/ui/primitives/input/                       InputIconName + "x"
src/ui/patterns/data-table/                    data-table.tsx · data-table-skeleton.tsx · .types.ts · .test.tsx · .stories.tsx (+ .stories.copy.ts)
src/ui/patterns/app-shell/                     + mobileSubtitle
src/features/workspace/domain/coming-soon-sections/   − "clients"
src/features/workspace/ui/owner-nav/           + clients heading, subtitles and Aktif · Arsip tabs
src/features/workspace/ui/owner-shell/         passes mobileSubtitle
src/features/booking/
  domain/client-name/                          client-name.ts · .types.ts · .test.ts
  domain/whatsapp-number/                      whatsapp-number.ts · .types.ts · .test.ts
  domain/social-link/                          social-link.ts · .types.ts · .test.ts
  domain/client-input/                         client-input.ts · .types.ts · .test.ts
  domain/client-search/                        client-search.ts · .types.ts · .test.ts
  domain/client-list/                          client-list.ts · .types.ts · .test.ts
  application/errors/client-errors/            client-errors.ts · .types.ts
  application/ports/client-repository/         client-repository.port.ts
  application/schemas/client-input/            client-input.schema.ts · .types.ts
  application/schemas/client-id/               client-id.schema.ts
  application/schemas/client-list-query/       client-list-query.schema.ts · .types.ts
  application/schemas/social-links/            social-links.schema.ts
  application/schemas/client-schemas.test.ts
  application/use-cases/client-results/        client-results.ts · .types.ts
  application/use-cases/{list-clients,count-clients,add-client,update-client,set-client-archived,delete-client}/
  ui/client-copy/ · client-initials/ · client-field-error/ · clients-screen/ · clients-table/ · client-list/
  ui/client-search-field/ · clients-tabs-bar/ · clients-empty-state/ · client-row-actions/ · client-dialog/
  ui/social-links-editor/ · delete-client-dialog/ · clients-skeleton/ · use-client-mutations/ · use-load-more-clients/
src/adapters/db/schema/booking/client.ts       (+ export in schema/index.ts)
src/adapters/db/client-repository/             drizzle-client-repository.ts · .test.ts
src/composition/booking/client-scope/          client-scope.ts · .types.ts
src/composition/booking/client-flow/           client-flow.ts · .types.ts · .test.ts
src/app/actions/booking/clients.ts             (+ clients.test.ts)
src/app/(owner)/w/[workspaceId]/clients/       page.tsx · loading.tsx · archived/{page,loading}.tsx
drizzle/0008_client.sql
tests/support/booking/fake-client-repository.ts
tests/integration/booking/client-repository.test.ts
tests/e2e/clients/clients.spec.ts
```

---

### Task 1: Sync base, icons and the clear-search icon

**Files:** `src/ui/primitives/icon/icon.{types,registry}.ts` + `icon.test.tsx`; `src/ui/primitives/input/input.types.ts` + `input.test.tsx`.

- [ ] **Step 1: Check the base.** Confirm F-05 is merged: `git log --oneline main | grep -i "catalog"` shows the F-05 merge, and `main` contains `src/ui/patterns/tabs/tabs.tsx` and `drizzle/0007_item_definition_backfill.sql`. **If not, stop and tell the Owner** (technical-design › Risks). Otherwise sync `feat/clients` from `main` with the ccd_host `sync_with_base_branch` tool (or `git merge main` outside an app worktree). Resolve conflicts:
  - in `docs/HANDOFF.md` and `docs/product/feature-map.md`, keep both features' text;
  - in `design-system.lib.pen`, keep this branch's file (it already has F-05's promotion plus `surface.panel-subtle`). Verify the result with `pnpm tokens:check` → 597 tokens.
- [ ] **Step 2: Failing tests.** Add `message-circle` and `user` to the icon list in `icon.test.tsx`. In `input.test.tsx`:

```tsx
it("AC-CLI-004 renders a trailing x action that clears the search", async () => {
  const onClear = vi.fn();
  render(
    <Input
      variant="search"
      aria-label="Cari klien"
      value="zzz"
      iconLeading="search"
      iconTrailing="x"
      iconTrailingAction={{ label: "Hapus pencarian", onPress: onClear }}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Hapus pencarian" }));
  expect(onClear).toHaveBeenCalledOnce();
});
```

- [ ] **Step 3:** `pnpm test src/ui/primitives` → FAIL.
- [ ] **Step 4: Implement.**
  - Icons: `message-circle` → `MessageCircleIcon` and `user` → `UserIcon` from `@hugeicons/core-free-icons`.
  - Input: add `"x"` to `InputIconName`. The existing adornment already renders an action as a labelled button; no other change.
- [ ] **Step 5:** gate → PASS. Commit `feat(ui): add client icons and a clear action for search inputs`.

### Task 2: DataTable pattern (C27)

**Files:** create `src/ui/patterns/data-table/{data-table.tsx,data-table-skeleton.tsx,data-table.types.ts,data-table.test.tsx,data-table.stories.tsx,data-table.stories.copy.ts}`.

The table is a card built on React Aria `Table` (ADR-010). Tokens come from `component.table.*`: background, border, radius, header background (`panel-subtle`), header text, row padding, row border, toolbar padding and footer link. Read `docs/design-system/components/table.md` and the table in `docs/features/clients/exports/list-populated-desktop-UiKLP.html`.

- [ ] **Step 1: Types.**

```ts
import type { ReactNode } from "react";

export interface DataTableColumn {
  readonly id: string;
  readonly label: string;
  /** Fixed width in px from the frame; omit for the column that fills the rest. */
  readonly width?: number;
  readonly isLabelHidden?: boolean;
}

export interface DataTableToolbar {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
}

export interface DataTableProps<Row extends { readonly id: string }> {
  readonly label: string;
  readonly toolbar: DataTableToolbar;
  readonly columns: readonly DataTableColumn[];
  readonly rows: readonly Row[];
  readonly renderCell: (row: Row, columnId: string) => ReactNode;
  readonly onRowAction?: (row: Row) => void;
  /** Replaces header and rows when there are no rows (Table Empty State). */
  readonly emptyState?: ReactNode;
  readonly footer?: ReactNode;
}

export interface DataTableSkeletonProps {
  readonly toolbar: DataTableToolbar;
  readonly columns: readonly DataTableColumn[];
  readonly rowCount: number;
}
```

- [ ] **Step 2: Failing tests** (`data-table.test.tsx`):

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "./data-table";
import { DataTableSkeleton } from "./data-table-skeleton";

const columns = [
  { id: "name", label: "KLIEN" },
  { id: "phone", label: "WHATSAPP", width: 184 },
  { id: "actions", label: "Aksi", width: 32, isLabelHidden: true },
] as const;
const rows = [
  { id: "a", name: "Anisa Putri", phone: "+62 813-2200-4512" },
  { id: "b", name: "Rina", phone: "+62 812-3456-7890" },
];

function renderCell(row: (typeof rows)[number], columnId: string) {
  return columnId === "actions" ? null : row[columnId === "name" ? "name" : "phone"];
}

describe("DataTable (C27)", () => {
  it("AC-CLI-001 renders the toolbar, column headers and one row per item", () => {
    render(
      <DataTable
        label="Daftar klien"
        toolbar={{ title: "Daftar klien", subtitle: "38 klien aktif", actions: <input aria-label="Cari" /> }}
        columns={columns}
        rows={rows}
        renderCell={renderCell}
      />,
    );
    const table = screen.getByRole("grid", { name: "Daftar klien" });
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["KLIEN", "WHATSAPP", "Aksi"]);
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("38 klien aktif")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Cari" })).toBeVisible();
  });

  it("AC-CLI-012 runs the row action on click and Enter", async () => {
    const onRowAction = vi.fn();
    render(
      <DataTable label="Daftar klien" toolbar={{ title: "Daftar klien" }} columns={columns} rows={rows} renderCell={renderCell} onRowAction={onRowAction} />,
    );
    await userEvent.click(screen.getByText("Rina"));
    expect(onRowAction).toHaveBeenLastCalledWith(rows[1]);
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(onRowAction).toHaveBeenLastCalledWith(rows[0]);
  });

  it("AC-CLI-003 shows the empty state instead of header and rows", () => {
    render(
      <DataTable label="Daftar klien" toolbar={{ title: "Daftar klien" }} columns={columns} rows={[]} renderCell={renderCell} emptyState={<p>Belum ada klien</p>} />,
    );
    expect(screen.getByText("Belum ada klien")).toBeVisible();
    expect(screen.queryByRole("columnheader")).toBeNull();
  });

  it("renders skeleton rows with the header for the loading state", () => {
    render(<DataTableSkeleton toolbar={{ title: "Daftar klien" }} columns={columns} rowCount={5} />);
    expect(screen.getAllByTestId("data-table-skeleton-row")).toHaveLength(5);
    expect(screen.getByText("KLIEN")).toBeVisible();
  });
});
```

- [ ] **Step 3:** `pnpm test src/ui/patterns/data-table` → FAIL.
- [ ] **Step 4: Implement.**
  - **Structure:** `<section>` card (Table card tokens). Inside: the toolbar row (the Title group on the left, `toolbar.actions` on the right, `justify-between`), then the React Aria `Table` (`aria-label={label}`, `onRowAction` mapped by key), then the optional footer (centred, top border `table.border`).
  - **Columns:** a fixed `width` becomes an inline `style={{ width }}` (literal sizes, design.md); the fill column gets `flex-1`. `isLabelHidden` keeps the header accessible and renders it visually empty.
  - **Rows:** padding `table.row.padding-*`, bottom border `table.row.border` except on the last row; row hover only when `onRowAction` is set.
  - **Empty:** when `rows` is empty and `emptyState` is given, render it in the card body and skip the header (design.md › Layout).
  - **Skeleton:** `DataTableSkeleton` renders the same card, the header row and `rowCount` rows of skeleton bars (`surface.sunken` bars, the export's shape).
  - Copy comes from props only, so no `.copy.ts` is needed. The story copy lives in `.stories.copy.ts`.
- [ ] **Step 5: Story** `Patterns/DataTable` with *Populated*, *Empty* and *Loading*, using the client rows from the export.
- [ ] **Step 6:** gate → PASS. Commit `feat(ui): add the data table pattern`.

### Task 3: Domain

**Files:** create the six domain units under `src/features/booking/domain/`.

- [ ] **Step 1: Failing tests.**

```ts
// client-name/client-name.test.ts
import { describe, expect, it } from "vitest";

import { CLIENT_NAME_MAX_LENGTH, findClientNameProblem, normaliseClientName } from "./client-name";

describe("client name (BR-CLI-001)", () => {
  it("AC-CLI-008 rejects empty and over-long names after trimming", () => {
    expect(findClientNameProblem("   ")).toBe("EMPTY");
    expect(findClientNameProblem("a".repeat(CLIENT_NAME_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(findClientNameProblem(` ${"a".repeat(CLIENT_NAME_MAX_LENGTH)} `)).toBeNull();
    expect(findClientNameProblem("😀".repeat(CLIENT_NAME_MAX_LENGTH))).toBeNull();
  });

  it("AC-CLI-006 trims the stored name", () => {
    expect(normaliseClientName("  Rina Wedding ")).toBe("Rina Wedding");
  });
});
```

```ts
// whatsapp-number/whatsapp-number.test.ts
import { describe, expect, it } from "vitest";

import { formatWhatsappNumber, parseWhatsappNumber, whatsappChatUrl } from "./whatsapp-number";

describe("WhatsApp number (BR-CLI-002)", () => {
  it.each([
    "0812 3456 7890",
    "+62 812-3456-7890",
    "62812.3456.7890",
    "812 3456 7890",
    "(0812) 3456-7890",
  ])("AC-CLI-009 normalizes %s to 6281234567890", (raw) => {
    expect(parseWhatsappNumber(raw)).toEqual({ kind: "VALID", digits: "6281234567890" });
  });

  it("AC-CLI-009 keeps a foreign number with its country code", () => {
    expect(parseWhatsappNumber("+1 415 555 0100")).toEqual({ kind: "VALID", digits: "14155550100" });
  });

  it.each(["0812", "abc", "+62 812 3456 7890 1234 5", "00812345678"])("AC-CLI-009 rejects %s", (raw) => {
    expect(parseWhatsappNumber(raw)).toEqual({ kind: "INVALID" });
  });

  it("AC-CLI-007 treats a blank field as no number", () => {
    expect(parseWhatsappNumber("  ")).toEqual({ kind: "EMPTY" });
  });

  it("AC-CLI-001 formats Indonesian and foreign numbers (A-7)", () => {
    expect(formatWhatsappNumber("6281234567890")).toBe("+62 812-3456-7890");
    expect(formatWhatsappNumber("6281322004512")).toBe("+62 813-2200-4512");
    expect(formatWhatsappNumber("14155550100")).toBe("+14155550100");
  });

  it("AC-CLI-016 builds a plain chat link without text (A-6)", () => {
    expect(whatsappChatUrl("6281234567890")).toBe("https://wa.me/6281234567890");
  });
});
```

```ts
// social-link/social-link.test.ts
import { describe, expect, it } from "vitest";

import {
  findDuplicateSocialRows,
  findSocialValueProblem,
  normaliseSocialValue,
  SOCIAL_VALUE_MAX_LENGTH,
  socialLinkLabel,
} from "./social-link";

describe("social links (BR-CLI-001, A-2)", () => {
  it("AC-CLI-006 drops a leading @ from handles and keeps URLs", () => {
    expect(normaliseSocialValue("  @rina.wed ")).toBe("rina.wed");
    expect(normaliseSocialValue("https://www.tiktok.com/@rina")).toBe("https://www.tiktok.com/@rina");
  });

  it("AC-CLI-011 rejects over-long values, non-https URLs and a bare @", () => {
    expect(findSocialValueProblem("a".repeat(SOCIAL_VALUE_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(findSocialValueProblem("http://instagram.com/rina")).toBe("INVALID_URL");
    expect(findSocialValueProblem("@")).toBe("EMPTY");
    expect(findSocialValueProblem("rina.wed")).toBeNull();
  });

  it("AC-CLI-011 flags later rows with the same platform and value, ignoring case and @", () => {
    const rows = [
      { platform: "INSTAGRAM", value: "@rina.wed" },
      { platform: "TIKTOK", value: "rina.wed" },
      { platform: "INSTAGRAM", value: "RINA.WED" },
      { platform: "INSTAGRAM", value: "" },
      { platform: "INSTAGRAM", value: "" },
    ];
    expect(findDuplicateSocialRows(rows)).toEqual([2]);
  });

  it("AC-CLI-001 labels handles with @ and URLs without the scheme", () => {
    expect(socialLinkLabel({ platform: "INSTAGRAM", value: "anisaputri" })).toBe("@anisaputri");
    expect(socialLinkLabel({ platform: "TIKTOK", value: "https://www.tiktok.com/@bayularas" })).toBe("tiktok.com/@bayularas");
  });
});
```

```ts
// client-input/client-input.test.ts
import { describe, expect, it } from "vitest";

import { findClientInputProblems, normaliseClientInput } from "./client-input";

const base = { name: "Rina", whatsappNumber: "", socialLinks: [] };

describe("client input (BR-CLI-001/002)", () => {
  it("AC-CLI-008 AC-CLI-009 AC-CLI-011 reports every problem with its path", () => {
    expect(
      findClientInputProblems({
        name: " ",
        whatsappNumber: "0812",
        socialLinks: [
          { platform: "INSTAGRAM", value: "@rina.wed" },
          { platform: "INSTAGRAM", value: "RINA.WED" },
          { platform: "MYSPACE", value: "rina" },
        ],
      }),
    ).toEqual([
      { path: ["name"], code: "EMPTY" },
      { path: ["whatsappNumber"], code: "INVALID" },
      { path: ["socialLinks", 1, "value"], code: "DUPLICATE" },
      { path: ["socialLinks", 2, "platform"], code: "UNKNOWN_PLATFORM" },
    ]);
  });

  it("AC-CLI-011 refuses more than ten rows", () => {
    const socialLinks = Array.from({ length: 11 }, (_, i) => ({ platform: "OTHER", value: `akun${i}` }));
    expect(findClientInputProblems({ ...base, socialLinks })).toEqual([{ path: ["socialLinks"], code: "TOO_MANY" }]);
  });

  it("AC-CLI-006 AC-CLI-007 normalizes the record and drops empty rows", () => {
    expect(
      normaliseClientInput({
        name: "  Rina Wedding ",
        whatsappNumber: "0812-3456-7890",
        socialLinks: [
          { platform: "INSTAGRAM", value: "@rina.wed" },
          { platform: "FACEBOOK", value: "  " },
          { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
        ],
      }),
    ).toEqual({
      name: "Rina Wedding",
      whatsappNumber: "6281234567890",
      socialLinks: [
        { platform: "INSTAGRAM", value: "rina.wed" },
        { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
      ],
    });
    expect(normaliseClientInput({ ...base, name: "ade" })).toEqual({ name: "ade", whatsappNumber: null, socialLinks: [] });
  });
});
```

```ts
// client-search/client-search.test.ts
import { describe, expect, it } from "vitest";

import { CLIENT_SEARCH_MAX_LENGTH, parseClientSearch } from "./client-search";

describe("client search (A-4)", () => {
  it("AC-CLI-004 searches names by text", () => {
    expect(parseClientSearch(" RIN ")).toEqual({ text: "RIN", digits: null });
  });

  it.each([
    ["0812 3456", "628123456"],
    ["+62812", "62812"],
    ["812", "812"],
  ])("AC-CLI-004 normalizes the digits in %s", (raw, digits) => {
    expect(parseClientSearch(raw)?.digits).toBe(digits);
  });

  it("ignores blank and over-long queries (TD-A-1)", () => {
    expect(parseClientSearch("  ")).toBeNull();
    expect(parseClientSearch("a".repeat(CLIENT_SEARCH_MAX_LENGTH + 1))).toBeNull();
  });
});
```

```ts
// client-list/client-list.test.ts
import { describe, expect, it } from "vitest";

import { CLIENT_PAGE_SIZE, isClientStatus } from "./client-list";

describe("client list", () => {
  it("AC-CLI-005 pages 30 clients at a time (A-5)", () => {
    expect(CLIENT_PAGE_SIZE).toBe(30);
  });

  it("AC-CLI-002 knows the two list statuses", () => {
    expect(isClientStatus("ACTIVE")).toBe(true);
    expect(isClientStatus("ARCHIVED")).toBe(true);
    expect(isClientStatus("DELETED")).toBe(false);
  });
});
```

- [ ] **Step 2:** `pnpm test src/features/booking/domain` → FAIL.
- [ ] **Step 3: Implement.** Types go in each unit's `.types.ts`; each exported function gets JSDoc naming its rule.

```ts
// client-name/client-name.types.ts
export type ClientNameProblem = "EMPTY" | "TOO_LONG";

// client-name/client-name.ts
import type { ClientNameProblem } from "./client-name.types";

/** BR-CLI-001: a client name is 1–100 characters after trimming. */
export const CLIENT_NAME_MAX_LENGTH = 100;

/**
 * Trims a client name the way it is stored (BR-CLI-001).
 * @param raw - the name as typed
 * @returns the trimmed name
 */
export function normaliseClientName(raw: string): string {
  return raw.trim();
}

/**
 * Finds why a client name breaks BR-CLI-001, counting code points.
 * @param raw - the name as typed
 * @returns the problem, or null when the name is valid
 */
export function findClientNameProblem(raw: string): ClientNameProblem | null {
  const name = normaliseClientName(raw);
  if (name.length === 0) return "EMPTY";
  return [...name].length > CLIENT_NAME_MAX_LENGTH ? "TOO_LONG" : null;
}
```

```ts
// whatsapp-number/whatsapp-number.types.ts
export type WhatsappNumberParse =
  | { readonly kind: "EMPTY" }
  | { readonly kind: "VALID"; readonly digits: string }
  | { readonly kind: "INVALID" };

// whatsapp-number/whatsapp-number.ts
import type { WhatsappNumberParse } from "./whatsapp-number.types";

/** BR-CLI-002: a stored number has 10–15 digits including the country code. */
export const WHATSAPP_DIGITS_MIN = 10;
export const WHATSAPP_DIGITS_MAX = 15;
const INDONESIA = "62";
const SEPARATORS = /[\s\-.()]/g;
const DIGITS_ONLY = /^\d+$/;

function applyPrefixStep(value: string): string {
  if (value.startsWith("+")) return value.slice(1);
  if (value.startsWith("0")) return `${INDONESIA}${value.slice(1)}`;
  if (value.startsWith("8")) return `${INDONESIA}${value}`;
  return value;
}

/**
 * Normalizes a typed WhatsApp number with BR-CLI-002's steps, applying only the first prefix step that matches.
 * @param raw - the number as typed
 * @returns EMPTY for a blank field, VALID with the stored digits, or INVALID
 */
export function parseWhatsappNumber(raw: string): WhatsappNumberParse {
  const stripped = raw.replace(SEPARATORS, "");
  if (stripped.length === 0) return { kind: "EMPTY" };
  const digits = applyPrefixStep(stripped);
  const isValid =
    DIGITS_ONLY.test(digits) &&
    digits.length >= WHATSAPP_DIGITS_MIN &&
    digits.length <= WHATSAPP_DIGITS_MAX &&
    !digits.startsWith("0") &&
    !digits.startsWith(`${INDONESIA}0`);
  return isValid ? { kind: "VALID", digits } : { kind: "INVALID" };
}

/**
 * Shows a stored number as `+62 812-3456-7890` for Indonesia and `+<digits>` otherwise (A-7).
 * @param digits - the stored number
 * @returns the display form
 */
export function formatWhatsappNumber(digits: string): string {
  if (!digits.startsWith(INDONESIA)) return `+${digits}`;
  const rest = digits.slice(INDONESIA.length);
  const groups = [rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter((group) => group.length > 0);
  return `+${INDONESIA} ${groups.join("-")}`;
}

/**
 * Builds the plain WhatsApp chat link for a stored number, with no prefilled text (A-6, ADR-006).
 * @param digits - the stored number
 * @returns the `wa.me` URL
 */
export function whatsappChatUrl(digits: string): string {
  return `https://wa.me/${digits}`;
}
```

```ts
// social-link/social-link.types.ts
import type { SOCIAL_PLATFORMS } from "./social-link";

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export interface SocialLink {
  readonly platform: SocialPlatform;
  readonly value: string;
}
export interface SocialLinkInput {
  readonly platform: string;
  readonly value: string;
}
export type SocialValueProblem = "EMPTY" | "TOO_LONG" | "INVALID_URL";

// social-link/social-link.ts
import type { SocialLink, SocialLinkInput, SocialPlatform, SocialValueProblem } from "./social-link.types";

/** A-2: platforms in display order. */
export const SOCIAL_PLATFORMS = ["INSTAGRAM", "TIKTOK", "FACEBOOK", "YOUTUBE", "X", "OTHER"] as const;
/** BR-CLI-001: at most ten links, each value 1–200 characters. */
export const SOCIAL_LINK_MAX_COUNT = 10;
export const SOCIAL_VALUE_MAX_LENGTH = 200;
const HTTPS = /^https:\/\//i;
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const URL_PREFIX = /^https:\/\/(www\.)?/i;

/** @param value - a platform from untrusted input @returns whether it is one of SOCIAL_PLATFORMS */
export function isSocialPlatform(value: string): value is SocialPlatform {
  return SOCIAL_PLATFORMS.some((platform) => platform === value);
}

/** @param value - a social value @returns whether it is an https URL rather than a handle */
export function isSocialUrl(value: string): boolean {
  return HTTPS.test(value.trim());
}

/**
 * Stores a handle without its leading `@` and keeps URLs as typed (BR-CLI-001).
 * @param raw - the value as typed
 * @returns the stored value
 */
export function normaliseSocialValue(raw: string): string {
  const value = raw.trim();
  return isSocialUrl(value) ? value : value.replace(/^@/, "");
}

/** @param raw - a social value @returns the key used for duplicate checks: normalised, lower case */
export function socialValueKey(raw: string): string {
  return normaliseSocialValue(raw).toLowerCase();
}

/**
 * Finds why a non-blank social value breaks BR-CLI-001.
 * @param raw - the value as typed
 * @returns the problem, or null when valid
 */
export function findSocialValueProblem(raw: string): SocialValueProblem | null {
  const value = normaliseSocialValue(raw);
  if (value.length === 0) return "EMPTY";
  if (ANY_SCHEME.test(value) && !isSocialUrl(value)) return "INVALID_URL";
  return [...value].length > SOCIAL_VALUE_MAX_LENGTH ? "TOO_LONG" : null;
}

/**
 * Finds rows that repeat an earlier row's platform and value, ignoring case and a leading `@`; blank rows never count.
 * @param rows - the rows in the Owner's order
 * @returns the indexes of the later duplicates
 */
export function findDuplicateSocialRows(rows: readonly SocialLinkInput[]): readonly number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];
  for (const [index, row] of rows.entries()) {
    if (row.value.trim() === "") continue;
    const key = `${row.platform}|${socialValueKey(row.value)}`;
    if (seen.has(key)) duplicates.push(index);
    else seen.add(key);
  }
  return duplicates;
}

/**
 * Labels a link for lists: `@handle`, or the URL without `https://` and `www.`.
 * @param link - a stored link
 * @returns the label
 */
export function socialLinkLabel(link: SocialLink): string {
  return isSocialUrl(link.value) ? link.value.replace(URL_PREFIX, "") : `@${link.value}`;
}
```

```ts
// client-input/client-input.types.ts
import type { ClientNameProblem } from "../client-name/client-name.types";
import type { SocialLink, SocialLinkInput, SocialValueProblem } from "../social-link/social-link.types";

export interface ClientInput {
  readonly name: string;
  readonly whatsappNumber: string;
  readonly socialLinks: readonly SocialLinkInput[];
}
export interface ClientFields {
  readonly name: string;
  readonly whatsappNumber: string | null;
  readonly socialLinks: readonly SocialLink[];
}
export type ClientInputProblemCode =
  | ClientNameProblem
  | SocialValueProblem
  | "INVALID"
  | "DUPLICATE"
  | "UNKNOWN_PLATFORM"
  | "TOO_MANY";
export interface ClientInputProblem {
  readonly path: readonly (string | number)[];
  readonly code: ClientInputProblemCode;
}

// client-input/client-input.ts
import { findClientNameProblem, normaliseClientName } from "../client-name/client-name";
import {
  findDuplicateSocialRows,
  findSocialValueProblem,
  isSocialPlatform,
  normaliseSocialValue,
  SOCIAL_LINK_MAX_COUNT,
} from "../social-link/social-link";
import type { SocialLink, SocialLinkInput } from "../social-link/social-link.types";
import { parseWhatsappNumber } from "../whatsapp-number/whatsapp-number";
import type { ClientFields, ClientInput, ClientInputProblem } from "./client-input.types";

function findSocialRowProblems(rows: readonly SocialLinkInput[]): ClientInputProblem[] {
  const problems: ClientInputProblem[] = [];
  const duplicates = new Set(findDuplicateSocialRows(rows));
  for (const [index, row] of rows.entries()) {
    if (!isSocialPlatform(row.platform)) {
      problems.push({ path: ["socialLinks", index, "platform"], code: "UNKNOWN_PLATFORM" });
    }
    if (row.value.trim() === "") continue;
    const valueProblem = duplicates.has(index) ? "DUPLICATE" : findSocialValueProblem(row.value);
    if (valueProblem) problems.push({ path: ["socialLinks", index, "value"], code: valueProblem });
  }
  return problems;
}

/**
 * Collects every BR-CLI-001/002 problem in a client form at once, each with its field path.
 * @param input - the form values, social rows in the Owner's order
 * @returns the problems; empty when the input is valid
 */
export function findClientInputProblems(input: ClientInput): readonly ClientInputProblem[] {
  const problems: ClientInputProblem[] = [];
  const nameProblem = findClientNameProblem(input.name);
  if (nameProblem) problems.push({ path: ["name"], code: nameProblem });
  if (parseWhatsappNumber(input.whatsappNumber).kind === "INVALID") {
    problems.push({ path: ["whatsappNumber"], code: "INVALID" });
  }
  if (input.socialLinks.length > SOCIAL_LINK_MAX_COUNT) {
    problems.push({ path: ["socialLinks"], code: "TOO_MANY" });
  }
  return [...problems, ...findSocialRowProblems(input.socialLinks)];
}

function toSocialLinks(rows: readonly SocialLinkInput[]): readonly SocialLink[] {
  return rows.flatMap((row) =>
    row.value.trim() !== "" && isSocialPlatform(row.platform)
      ? [{ platform: row.platform, value: normaliseSocialValue(row.value) }]
      : [],
  );
}

/**
 * Turns valid form values into the stored client fields: trimmed name, digits or null, links without blank rows.
 * @param input - form values that passed findClientInputProblems
 * @returns the fields to store
 */
export function normaliseClientInput(input: ClientInput): ClientFields {
  const number = parseWhatsappNumber(input.whatsappNumber);
  return {
    name: normaliseClientName(input.name),
    whatsappNumber: number.kind === "VALID" ? number.digits : null,
    socialLinks: toSocialLinks(input.socialLinks),
  };
}
```

```ts
// client-search/client-search.types.ts
export interface ClientSearch {
  readonly text: string;
  readonly digits: string | null;
}

// client-search/client-search.ts
import type { ClientSearch } from "./client-search.types";

/** TD-A-1: longer queries are ignored. */
export const CLIENT_SEARCH_MAX_LENGTH = 100;
const SEPARATORS = /[\s\-.()]/g;
const NUMBER_LIKE = /^\+?\d+$/;

function searchDigits(text: string): string | null {
  const stripped = text.replace(SEPARATORS, "");
  if (!NUMBER_LIKE.test(stripped)) return null;
  const digits = stripped.replace(/^\+/, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

/**
 * Reads a search query: names match the text; number-like queries also match stored numbers after BR-CLI-002's prefix step (A-4).
 * @param raw - the `?q=` value
 * @returns the search, or null when blank or too long
 */
export function parseClientSearch(raw: string): ClientSearch | null {
  const text = raw.trim();
  if (text.length === 0 || [...text].length > CLIENT_SEARCH_MAX_LENGTH) return null;
  return { text, digits: searchDigits(text) };
}
```

```ts
// client-list/client-list.types.ts
import type { CLIENT_STATUSES } from "./client-list";

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

// client-list/client-list.ts
import type { ClientStatus } from "./client-list.types";

/** BR-CLI-003: the list shows active or archived clients. */
export const CLIENT_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
/** A-5: clients load 30 at a time. */
export const CLIENT_PAGE_SIZE = 30;

/** @param value - untrusted status @returns whether it is a ClientStatus */
export function isClientStatus(value: string): value is ClientStatus {
  return CLIENT_STATUSES.some((status) => status === value);
}
```

- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add client domain rules`.

### Task 4: Application layer

**Files:** create the port, errors, schemas, results and use cases, plus `tests/support/booking/fake-client-repository.ts`.

- [ ] **Step 1: Port** (`client-repository.port.ts`):

```ts
import "server-only";

import type { ClientFields } from "@/features/booking/domain/client-input/client-input.types";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";
import type { ClientSearch } from "@/features/booking/domain/client-search/client-search.types";
import type { SocialLink } from "@/features/booking/domain/social-link/social-link.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface ClientRecord {
  readonly id: string;
  readonly name: string;
  readonly whatsappNumber: string | null;
  readonly socialLinks: readonly SocialLink[];
  readonly isArchived: boolean;
}

export interface ClientPageQuery {
  readonly status: ClientStatus;
  readonly search: ClientSearch | null;
  /** Keyset cursor: the last row already shown; null for the first page (D-4). */
  readonly afterId: string | null;
  readonly limit: number;
}

export interface ClientChange extends ClientFields {
  readonly editorUserId: string;
}

export interface NumberHolder {
  readonly name: string;
  readonly isArchived: boolean;
}

export type NumberTaken = { readonly status: "NUMBER_TAKEN"; readonly holder: NumberHolder };

export interface ArchiveChange {
  readonly id: string;
  readonly isArchived: boolean;
  readonly editorUserId: string;
}

// Every call is scoped by the verified workspace (C-101).
export interface ClientRepositoryPort {
  readonly listPage: (context: WorkspaceContext, query: ClientPageQuery) => Promise<readonly ClientRecord[]>;
  readonly count: (context: WorkspaceContext, status: ClientStatus) => Promise<number>;
  readonly create: (context: WorkspaceContext, change: ClientChange) => Promise<{ readonly status: "CREATED" } | NumberTaken>;
  readonly update: (context: WorkspaceContext, id: string, change: ClientChange) => Promise<"UPDATED" | "NOT_FOUND" | NumberTaken>;
  readonly setArchived: (context: WorkspaceContext, change: ArchiveChange) => Promise<boolean>;
  readonly delete: (context: WorkspaceContext, id: string) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
}
```

- [ ] **Step 2: Schemas** (`*.schema.ts`, no `server-only`; input types via `z.input` / `z.output` in `.types.ts`):

```ts
// social-links/social-links.schema.ts — validates JSONB on read (D-2)
import { z } from "zod";

import { SOCIAL_LINK_MAX_COUNT, SOCIAL_PLATFORMS } from "@/features/booking/domain/social-link/social-link";

export const storedSocialLinksSchema = z
  .array(z.object({ platform: z.enum(SOCIAL_PLATFORMS), value: z.string().min(1) }))
  .max(SOCIAL_LINK_MAX_COUNT);
```

```ts
// client-input/client-input.schema.ts
import { z } from "zod";

import { findClientInputProblems, normaliseClientInput } from "@/features/booking/domain/client-input/client-input";

export const clientInputSchema = z
  .object({
    name: z.string(),
    whatsappNumber: z.string(),
    socialLinks: z.array(z.object({ platform: z.string(), value: z.string() })),
  })
  .superRefine((input, context) =>
    findClientInputProblems(input).forEach((problem) =>
      context.addIssue({ code: "custom", path: [...problem.path], message: problem.code }),
    ),
  )
  .transform((input) => normaliseClientInput(input));
```

```ts
// client-id/client-id.schema.ts
import { z } from "zod";

export const clientIdSchema = z.uuid();
```

```ts
// client-list-query/client-list-query.schema.ts
import { z } from "zod";

import { CLIENT_STATUSES } from "@/features/booking/domain/client-list/client-list";
import { CLIENT_SEARCH_MAX_LENGTH } from "@/features/booking/domain/client-search/client-search";

export const clientListQuerySchema = z.object({
  status: z.enum(CLIENT_STATUSES),
  q: z.string().max(CLIENT_SEARCH_MAX_LENGTH).default(""),
  afterId: z.uuid().nullable().default(null),
});
```

`client-schemas.test.ts`:
- AC-CLI-008/009/011: `clientInputSchema.safeParse(...)` reports issues with paths `["name"]`, `["whatsappNumber"]`, `["socialLinks", 1, "value"]` and messages equal to the domain codes;
- AC-CLI-006: a valid parse outputs the normalised fields;
- `clientListQuerySchema` rejects `status: "DELETED"` and a non-uuid `afterId`.

- [ ] **Step 3: Errors.** `ClientError extends DomainError` with `ClientErrorCode = "NOT_FOUND" | "SAVE_FAILED"`, the same shape as `CatalogError`.
- [ ] **Step 4: Results** (`client-results.types.ts` + `client-results.ts`):

```ts
import type { ClientRecord, NumberHolder } from "../../ports/client-repository/client-repository.port";

export type ClientFieldErrorKey =
  | "EMPTY" | "TOO_LONG" | "INVALID" | "TAKEN" | "INVALID_URL" | "DUPLICATE" | "UNKNOWN_PLATFORM" | "TOO_MANY";
export interface ClientValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  /** Keyed by field path: `name`, `whatsappNumber`, `socialLinks`, `socialLinks.N.value`, `socialLinks.N.platform`. */
  readonly fieldErrors: Readonly<Partial<Record<string, ClientFieldErrorKey>>>;
  readonly numberHolder?: NumberHolder;
}
export type ClientWriteResult = { readonly ok: true } | ClientValidationFailure;
export type DeleteClientResult = { readonly ok: true } | { readonly ok: false; readonly code: "IN_USE" };
export interface ClientPage {
  readonly items: readonly ClientRecord[];
  readonly nextCursor: string | null;
}
```

`client-results.ts` (server-only) exports `validationFailure(issues)`, which maps every issue to `fieldErrors[path.join(".")] = message`, and `numberTaken(holder)` → `{ ok:false, code:"VALIDATION_FAILED", fieldErrors:{ whatsappNumber:"TAKEN" }, numberHolder: holder }`.

- [ ] **Step 5: Fake repository** `tests/support/booking/fake-client-repository.ts`, mirroring `FakeCategoryRepository`:
  - public `rows` hold `workspaceId`, `id`, `name`, `whatsappNumber`, `socialLinks`, `archivedAt`, `updatedBy`, `createdAt` (an increasing counter);
  - `listPage` filters by workspace, status and search (name includes text ignoring case, or number includes digits), sorts by `name.toLowerCase()`, `createdAt`, `id`, starts after `afterId`, and takes `limit`;
  - `count` filters by workspace and status;
  - `create` / `update` return `NUMBER_TAKEN` with the holder when another row in the same workspace has the number;
  - `delete` returns `IN_USE` for IDs in a public `inUse: Set<string>`;
  - a public `failNext` flag makes the next call throw (for AC-CLI-017 tests).
- [ ] **Step 6: Failing use-case tests**, one file per use case:
  - `add-client.test.ts`:
    - AC-CLI-006: the AC's input is stored normalised, in row order, with `updatedBy`;
    - AC-CLI-007: only *ade* → no number and no links;
    - AC-CLI-008: `"  "` → `fieldErrors.name: "EMPTY"`; the same name twice is allowed;
    - AC-CLI-009: `0812` → `whatsappNumber: "INVALID"`;
    - AC-CLI-010: a number held by archived *Budi* → `TAKEN` + `numberHolder { name:"Budi", isArchived:true }`, and the same number in another workspace is allowed;
    - AC-CLI-011: platform `MYSPACE` (form bypassed) → `socialLinks.0.platform: "UNKNOWN_PLATFORM"`, and nothing is stored.
  - `update-client.test.ts`:
    - AC-CLI-012: the whole record is replaced, and the client keeps its own number without conflict;
    - AC-CLI-010: another client's number → `TAKEN`;
    - AC-CLI-018: an ID from another workspace → throws `NOT_FOUND`.
  - `set-client-archived.test.ts`: AC-CLI-013 archive then restore; AC-CLI-018 unknown → `NOT_FOUND`.
  - `delete-client.test.ts`: AC-CLI-014 deletes; AC-CLI-015 `inUse` → `{ ok:false, code:"IN_USE" }` and the row stays; AC-CLI-018 unknown → `NOT_FOUND`.
  - `list-clients.test.ts`:
    - AC-CLI-005: 65 rows → 30 + cursor, then 30 + cursor, then 5 + null;
    - AC-CLI-002: the archived status shows only archived rows;
    - AC-CLI-004: the search is passed through and confined to the status.
  - `count-clients.test.ts`: AC-CLI-021 counts per status, ignoring other workspaces.
- [ ] **Step 7:** run → FAIL. **Step 8: Implement:**
  - `addClient(repository, context, editorUserId, input)` and `updateClient(repository, context, id, editorUserId, input)` parse with `clientInputSchema`, return `validationFailure(parsed.error.issues)` on failure, and call the port with `{ ...parsed.data, editorUserId }`. They map `NUMBER_TAKEN` → `numberTaken(holder)` and `NOT_FOUND` → `throw new ClientError("NOT_FOUND")`.
  - `listClients(repository, context, query: ClientListQuery)` builds `{ status, search: parseClientSearch(query.q), afterId: query.afterId, limit: CLIENT_PAGE_SIZE + 1 }`. It returns `{ items: rows.slice(0, CLIENT_PAGE_SIZE), nextCursor: rows.length > CLIENT_PAGE_SIZE ? rows[CLIENT_PAGE_SIZE - 1].id : null }`, reading the cursor with `.at()` (no `!`).
  - `countClients`, `setClientArchived` and `deleteClient` follow the technical design's table.
- [ ] **Step 9:** gate → PASS. Commit `feat(booking): add client use cases`.

### Task 5: Schema and migration 0008

**Files:** create `src/adapters/db/schema/booking/client.ts`; export it from `src/adapters/db/schema/index.ts`; generate `drizzle/0008_client.sql`.

- [ ] **Step 1: Table.**

```ts
import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-06 clients (BR-CLI-001…003, ADR-003). Social links are a Zod-validated JSONB array (TD D-2).
export const client = pgTable(
  "client",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    whatsappNumber: text("whatsapp_number"),
    socialLinks: jsonb("social_links").notNull().default(sql`'[]'::jsonb`),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("client_workspace_whatsapp_uq").on(t.workspaceId, t.whatsappNumber),
    index("client_workspace_list_idx").on(t.workspaceId, sql`lower(${t.name})`, t.createdAt, t.id),
    check("client_name_ck", sql`char_length(${t.name}) between 1 and 100 and ${t.name} = btrim(${t.name})`),
    check(
      "client_whatsapp_number_ck",
      sql`${t.whatsappNumber} is null or (${t.whatsappNumber} ~ '^[1-9][0-9]{9,14}$' and ${t.whatsappNumber} !~ '^620')`,
    ),
    check(
      "client_social_links_ck",
      sql`jsonb_typeof(${t.socialLinks}) = 'array' and jsonb_array_length(${t.socialLinks}) <= 10`,
    ),
  ],
);
```

- [ ] **Step 2:** `pnpm db:generate --name client` → review `drizzle/0008_client.sql`: one `CREATE TABLE "client"`, the FKs to `workspace` (restrict) and `user` (set null), the unique `(workspace_id, id)`, both indexes and the three CHECKs. No other table changes. If drizzle-kit numbers it other than 0008, stop: the base is wrong (Task 1).
- [ ] **Step 3:** `pnpm db:migrate` against `.dev.vars` (non-production). Report the output.
- [ ] **Step 4:** gate → PASS (`tests/config/drizzle-config.test.ts` still passes). Commit `feat(booking): add the client table`.

### Task 6: Drizzle repository and integration tests

**Files:** create `src/adapters/db/client-repository/drizzle-client-repository.ts` + `.test.ts`, and `tests/integration/booking/client-repository.test.ts`.

- [ ] **Step 1: Failing integration tests** (seed owner and workspace as in `tests/integration/gallery/workspace-source-repository.test.ts`; every test uses its own workspace):
  - AC-CLI-006: create → `listPage` returns the normalised record with links in order; `updated_by` is the owner.
  - AC-CLI-005: 65 clients with names `Klien 001…065` → three `listPage` calls of limit 31, chained by the last ID, give 30 / 30 / 5 distinct rows in name order.
  - AC-CLI-004:
    - `RIN` matches *Rina*;
    - a name with `%` or `_` matches literally only;
    - digits `628123456` and `62812` match `6281234567890`.
  - AC-CLI-002 / AC-CLI-021: archive one of three clients → active `count` 2, archived 1; the search doesn't change the count.
  - AC-CLI-010:
    - a duplicate number → `NUMBER_TAKEN` with the holder;
    - an archived holder → `isArchived: true`;
    - `Promise.all` of two creates with one number → exactly one row;
    - another workspace may use it;
    - updating a client with its own number → `UPDATED`.
  - AC-CLI-013: `setArchived` sets then clears `archived_at`.
  - AC-CLI-014: delete → the number can be used again.
  - AC-CLI-018: `update`, `setArchived`, `delete`, `listPage` and `count` with another workspace's context return `NOT_FOUND` / false / nothing, and the holder lookup never names a client from another workspace.
- [ ] **Step 2: Failing unit test** (`drizzle-client-repository.test.ts`): AC-CLI-015 — `delete` maps an executor error with `code: "23503"` (also nested in `cause`) to `IN_USE`, using `pgCode` from `adapters/db/catalog-repository/pg-error`.
- [ ] **Step 3:** `pnpm test:integration tests/integration/booking/client-repository.test.ts` → FAIL.
- [ ] **Step 4: Implement** `createDrizzleClientRepository(db: DbExecutor): ClientRepositoryPort`:
  - **Columns:** select `id, name, whatsappNumber, socialLinks, archivedAt`. Map to `ClientRecord`, parsing `socialLinks` with `storedSocialLinksSchema.parse` (a malformed row throws: it is a bug).
  - **Status:** `ACTIVE` → `isNull(client.archivedAt)`, `ARCHIVED` → `isNotNull(client.archivedAt)`.
  - **Search (D-7):**

```ts
const LIKE_SPECIAL = /[\\%_]/g;
const escapeLike = (value: string) => value.replace(LIKE_SPECIAL, (character) => `\\${character}`);

function searchCondition(search: ClientSearch | null): SQL | undefined {
  if (!search) return undefined;
  const nameMatch = sql`${client.name} ilike ${`%${escapeLike(search.text)}%`} escape '\\'`;
  return search.digits ? or(nameMatch, like(client.whatsappNumber, `%${search.digits}%`)) : nameMatch;
}
```

  - **Keyset (D-4):** the cursor row is read inside the same workspace:

```ts
function afterCondition(context: WorkspaceContext, afterId: string | null): SQL | undefined {
  if (!afterId) return undefined;
  return sql`(lower(${client.name}), ${client.createdAt}, ${client.id}) > (
    select lower(c.name), c.created_at, c.id from client c
    where c.workspace_id = ${context.workspaceId} and c.id = ${afterId}
  )`;
}
```

    Order by `sql\`lower(${client.name})\``, `client.createdAt`, `client.id`, with `.limit(query.limit)`.
  - **count:** `select count(*)::int` with the workspace and status conditions.
  - **create / update:** on `pgCode(error) === "23505"`, read the holder with `select name, archived_at where workspace_id = $1 and whatsapp_number = $2 limit 1`. Return `{ status: "NUMBER_TAKEN", holder: { name, isArchived } }`. `update` sets `updatedAt: new Date()` and is filtered by workspace and id; zero rows → `NOT_FOUND`.
  - **setArchived:** `archivedAt: change.isArchived ? sql\`now()\` : null`, filtered by workspace and id.
  - **delete:** returning id; `23503` → `IN_USE`.
- [ ] **Step 5:** gate + `pnpm test:integration` → PASS. Commit `feat(booking): add the drizzle client repository`.

### Task 7: Composition and server actions

**Files:** create `src/composition/booking/client-scope/*`, `src/composition/booking/client-flow/*` and `src/app/actions/booking/clients.ts` (+ `clients.test.ts`).

- [ ] **Step 1: Failing tests.**
  - `client-flow.test.ts` (mock `verifyOwnerWorkspace`, `requireOwnerOrRedirect`, `withClientScope` and `logger` as `catalog-flow.test.ts` does):
    - AC-CLI-018: a malformed client ID → `notFound()`; a `ClientError("NOT_FOUND")` → `notFound()`;
    - AC-CLI-017 / AC-CLI-019: an unexpected repository error → `logger.error("client.save_failed", { workspaceId, clientId, operation: "update" })`, with exactly those keys, then a thrown `ClientError("SAVE_FAILED")`. The input's name, number and links appear nowhere in the logged arguments;
    - TD-A-1: `loadClients(id, "ACTIVE", "a".repeat(101))` runs as an unfiltered list.
  - `clients.test.ts`: `addClientAction` revalidates `/w/[workspaceId]/clients` (layout) only on success and returns the validation failure unchanged; `deleteClientAction` returns `{ ok:false, code:"IN_USE" }` unchanged.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - **Scope:** `withClientScope(work)` = `withRequestDb((db) => work({ clients: createDrizzleClientRepository(db) }))`.
  - **Flow** entry points, the same pattern as `catalog-flow`:
    - `loadClients(rawWorkspaceId, status, rawQ)` → `{ status, q, page, count }`. An invalid `rawQ` becomes `""` (TD-A-1). It runs `listClients` and `countClients` in one scope.
    - `loadMoreClients(rawWorkspaceId, rawQuery)` parses with `clientListQuerySchema`; a failure → `notFound()`.
    - `addWorkspaceClient`, `updateWorkspaceClient`, `setWorkspaceClientArchived` and `deleteWorkspaceClient` resolve the account with `requireOwnerOrRedirect` (writes only).
  - Errors go through one `saveError(error, { workspaceId, clientId?, operation })` helper, as in `catalog-flow`.
  - **Actions** (`"use server"`): `addClientAction`, `updateClientAction`, `setClientArchivedAction`, `deleteClientAction` and `loadMoreClientsAction`. Writes call `revalidatePath("/w/[workspaceId]/clients", "layout")` on success and return `undefined` or the failure, the same shape as `catalog.ts`.
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): wire client composition and server actions`.

### Task 8: Navigation, routes and mobile subtitle

**Files:** `src/features/workspace/domain/coming-soon-sections/*`, `src/features/workspace/ui/owner-nav/*`, `src/features/workspace/ui/owner-shell/*`, `src/ui/patterns/app-shell/*` (+ the mobile header it renders); create `src/app/(owner)/w/[workspaceId]/clients/{page,loading}.tsx` and `clients/archived/{page,loading}.tsx`.

- [ ] **Step 1: Failing tests.**
  - `coming-soon-sections.test.ts`: AC-CLI-001 `isComingSoonSection("clients")` is false.
  - `owner-nav.test.tsx`:
    - AC-CLI-001: `resolveActiveNav` returns `{ nav: "clients", tab: "clients" }` for `/w/x/clients` and `/w/x/clients/archived`;
    - `resolvePageHeading` for `/w/x/clients` returns title *Klien*, subtitle *Orang yang memesan sesi foto. Pilih mereka saat membuat proyek.*, `mobileSubtitle` *Orang yang memesan sesi foto.*, and tabs `[{ label:"Aktif", href:"/w/x/clients", isActive:true }, { label:"Arsip", href:"/w/x/clients/archived", isActive:false }]`;
    - for `/clients/archived` the tab activity flips and the title stays *Klien* (TD-A-3).
  - `app-shell.test.tsx`: the mobile header shows `mobileSubtitle` when given, otherwise `subtitle`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - **Nav:**
    - remove `"clients"` from `COMING_SOON_SECTIONS`;
    - add `resolveClientsHeading(pathname, prefix)` beside `resolveServicesHeading`, with copy in `OWNER_NAV_COPY`: `clientsSubtitle`, `clientsMobileSubtitle`, `clientTabs.active`, `clientTabs.archived`, `clientsTabsLabel` (*Status klien*, `// not in Pencil`);
    - add `mobileSubtitle?` to `PageHeading`.
  - **Shell:** `OwnerShell` passes `mobileSubtitle={heading.mobileSubtitle}`; `AppShell` adds `mobileSubtitle?: string` and gives the mobile header `mobileSubtitle ?? subtitle`.
  - **Routes:** each page reads `params` and `searchParams` (`q`). It calls `loadClients(workspaceId, "ACTIVE" | "ARCHIVED", q)` and renders `ClientsScreen` with the data and the actions. Until Task 9, `ClientsScreen` is the minimal list it introduces there; build this task with a placeholder that renders the client names, then replace it.
  - **Loading:** each `loading.tsx` renders `ClientsSkeleton` (Task 10). Until then, render `null`.
- [ ] **Step 4:** gate → PASS. Commit `feat(workspace): route the clients section and its tabs`.

### Task 9: Desktop list

**Files:** create `ui/client-copy`, `ui/client-initials`, `ui/client-field-error`, `ui/clients-screen`, `ui/clients-table`, `ui/client-search-field` and `ui/clients-empty-state` (each with `.types.ts` and a test). Build from `exports/list-populated-desktop-UiKLP.html`, `list-archived-desktop-sfgdK.html`, `list-empty-desktop-VRacP.html`, `list-empty-archived-desktop-kdPPO.html` and `list-no-match-desktop-H6dpp3.html`.

- [ ] **Step 1: Copy.** `CLIENT_COPY` holds every string in design.md › Copy and the frames: titles, subtitles, *Daftar klien*, `count(status, n)` (*{n} klien aktif* / *{n} klien diarsipkan*), the column labels, *Belum ada nomor WhatsApp*, the search placeholders (*Cari nama atau nomor WhatsApp* / *Cari nama atau nomor*), *Hapus pencarian*, the empty and no-match titles and bodies, *Muat lebih banyak* / *Memuat…*, the dialog strings, the field errors, the toasts and the row actions. `PLATFORM_COPY` maps each platform to *Instagram*, *TikTok*, *Facebook*, *YouTube*, *X*, *Lainnya*.
- [ ] **Step 2: Failing tests.**
  - `client-initials.test.ts`: the first letters of the first two words (`Bayu & Laras` → `BL`, `Ade Kurnia` → `AK`, `Keluarga Wijaya` → `KW`), otherwise the first two letters of a single word (`Budi` → `BU`), upper case. The frames draw *Rina* as `RN`, but *Budi* follows this rule. Record that as deviation D-1 in Task 14 rather than adding a special case.
  - `client-field-error.test.ts`: each `ClientFieldErrorKey` maps to its copy; `TAKEN` with a holder → *Nomor ini sudah dipakai Rina*, and *Nomor ini sudah dipakai Budi (diarsipkan)* for an archived holder.
  - `clients-table.test.tsx`:
    - AC-CLI-001: rows show the initials avatar, the name, the formatted number or *Belum ada nomor WhatsApp*, and `Instagram · @anisaputri` or `—`;
    - URL links render as `<a target="_blank" rel="noopener noreferrer">` (A-2);
    - AC-CLI-021: the toolbar shows *Daftar klien* and *38 klien aktif*;
    - AC-CLI-003: the empty states.
  - `client-search-field.test.tsx` (fake timers):
    - AC-CLI-004: typing `RIN` calls `router.replace("/w/x/clients?q=RIN")` once after the debounce;
    - clearing calls `router.replace("/w/x/clients")`;
    - the *Hapus pencarian* action appears only with a value;
    - a polite live region announces *{n} klien cocok* when the query is non-empty (AC-CLI-020, `// not in Pencil`).
- [ ] **Step 3:** run → FAIL.
- [ ] **Step 4: Implement.**
  - **`ClientsScreen`** (client component) receives `{ workspaceId, status, q, page, count, actions }`. It owns the dialog state (`add` / `edit` / `delete`) and renders:
    - `PageActions` with *Tambah klien* (Button Primary, `plus`);
    - the 720 column (`max-w-(--size-content-narrow)`);
    - `ClientsTable` on desktop and `ClientList` on phones (Task 10).
  - **`ClientsTable`** uses `DataTable`:
    - columns `KLIEN` (fill), `WHATSAPP` (184), `MEDIA SOSIAL` (240), actions (32, hidden label);
    - toolbar title *Daftar klien*, subtitle the count, actions `ClientSearchField` (320);
    - `onRowAction` → edit;
    - the actions cell holds `ClientRowActions` (Task 13; until then an empty cell).
  - **`ClientsEmptyState`** uses `EmptyState placement="in-card"`:
    - `users` + *Tambah klien* for *Aktif*;
    - `archive` for *Arsip*;
    - `search-x` + *Hapus pencarian* for no match.
  - **`ClientSearchField`** uses `Input variant="search"` with the `x` clear action. It debounces 300 ms and keeps the current tab's path.
- [ ] **Step 5:** gate → PASS. Compare with the five exports at 1440 px. Commit `feat(booking): add the desktop client list`.

### Task 10: Phone list, tabs bar and skeletons

**Files:** create `ui/client-list`, `ui/clients-tabs-bar` and `ui/clients-skeleton` (+ tests); wire `loading.tsx`. Build from `list-*-mobile-*.html` and `list-loading-*.html`.

- [ ] **Step 1: Failing tests.**
  - `client-list.test.tsx`:
    - AC-CLI-001: a Section Card *Daftar klien* with the count as description and *Tambah* in its actions;
    - List Card Item/Two-line rows with the `user` icon, the name, and the meta `+62 813-2200-4512 · @anisaputri` (or *Belum ada nomor WhatsApp* alone);
    - the row action button carries the client's name.
  - `clients-tabs-bar.test.tsx`: AC-CLI-002 renders only on phones (`useMobileViewport` mocked); selecting *Arsip* pushes `/w/x/clients/archived` and drops `q`.
  - `clients-skeleton.test.tsx`: desktop renders `DataTableSkeleton` with five rows and no subtitle (A-10: hidden while loading); phone renders five `ListCardItemSkeleton` rows.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - The phone order is: `ClientsTabsBar` (`SegmentedControl isFullWidth`, label `OWNER_NAV_COPY.clientsTabsLabel`), then `ClientSearchField` (full width), then `ClientList`.
  - `loading.tsx` renders `ClientsSkeleton`.
- [ ] **Step 4:** gate → PASS. Compare with the phone exports at 390 px. Commit `feat(booking): add the phone client list and skeletons`.

### Task 11: Load more

**Files:** create `ui/use-load-more-clients` (+ test); extend `ClientsTable`, `ClientList` and `ClientsScreen`. Build from `list-loading-more-desktop-n8bqd.html` and `list-loading-more-mobile-ztbVD.html`.

- [ ] **Step 1: Failing tests.** `use-load-more-clients.test.ts` (`renderHook`):
  - AC-CLI-005: starting from `{ items: 30, nextCursor: "c1" }`, `loadMore()` calls the action with `{ status, q, afterId: "c1" }` and appends 30, then 5 with `nextCursor: null`;
  - `isLoading` is true while pending;
  - a second call while pending is ignored;
  - a new initial page (another tab, query or revalidation) resets the appended rows;
  - a failure shows the danger toast and keeps the rows.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - The hook keeps `extra` rows and `cursor` in state, keyed by `status + q + initial nextCursor`.
  - The footer button is `Button variant="secondary"`: centred in the table footer, full width below the phone card. It is hidden when `nextCursor` is null, and pending (*Memuat…*) while loading.
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): load more clients`.

### Task 12: Client dialog and social links editor

**Files:** create `ui/client-dialog` and `ui/social-links-editor` (+ tests). Build from `add-default-*`, `edit-several-rows-*`, `add-field-errors-*`, `add-number-taken-*` and `add-saving-*`.

- [ ] **Step 1: Failing tests.**
  - `social-links-editor.test.tsx`:
    - AC-CLI-011: *Tambah media sosial* adds a row (default platform *Instagram*) and is disabled at 10 rows;
    - remove deletes only its row and moves focus to the next row's value, or the previous one, or *Tambah media sosial* when none is left;
    - AC-CLI-020: each row's platform, value and remove control have accessible names with the platform and the row number (*Platform media sosial 2*, *Akun Instagram 2*, *Hapus Instagram 2*, `// not in Pencil`);
    - a row error is rendered under the value and linked with `aria-describedby`.
  - `client-dialog.test.tsx`:
    - AC-CLI-006: an add dialog with one empty Instagram row; filling the AC's values and confirming calls the action with the raw form values; a success toast *Klien ditambahkan* / *{name} siap dipilih saat membuat proyek.*; the dialog closes;
    - AC-CLI-007: an empty Instagram row is sent and accepted;
    - AC-CLI-008/009: client-side errors appear before any action call;
    - AC-CLI-010: a server failure with `TAKEN` + holder sets *Nomor ini sudah dipakai Budi (diarsipkan)* on the number;
    - AC-CLI-012: the edit dialog is prefilled (handles shown with `@`), saves with `updateClientAction`, and toasts *Perubahan disimpan*; cancel calls nothing;
    - AC-CLI-017: a throwing action shows *Perubahan belum tersimpan* with *Coba lagi*, and the input stays;
    - the submit button shows *Menyimpan…* while pending.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - **Form:** `useForm({ resolver: zodResolver(clientInputSchema), defaultValues })`. The default values for add are `{ name:"", whatsappNumber:"", socialLinks:[{ platform:"INSTAGRAM", value:"" }] }`. For edit they are the record with handles prefixed by `@` and the number as `formatWhatsappNumber` (empty when null).
  - **Rows:** `useFieldArray` for `socialLinks`. Each row is a `SocialLinkRow` component (no inline handlers): a `Select` with options from `SOCIAL_PLATFORMS` + `PLATFORM_COPY`, a `TextField` with the label visually hidden, and an `IconButton` ghost `x`.
  - **Server errors:** set them with `form.setError(path, { type:"server", message: key })` for each `fieldErrors` entry; the number message uses the holder.
  - **Layout:**
    - desktop: Modal MD with a one-line row (select 148);
    - phone: a full-height Bottom Sheet/Form with the value under the select. The confirm button is pinned and the Close icon cancels.
    - Titles are *Tambah klien* / *Ubah klien*, the descriptions come from design.md, and the confirm labels are *Tambah klien* / *Simpan*.
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add the client dialog`.

### Task 13: Row actions, archive, restore and delete

**Files:** create `ui/client-row-actions`, `ui/delete-client-dialog` and `ui/use-client-mutations` (+ tests); wire them into `ClientsTable`, `ClientList` and `ClientsScreen`. Build from `list-row-menu-desktop-uTkvt`, `row-actions-sheet-mobile-cVBpx`, `list-archived-*`, `delete-*` and `toast-*`.

- [ ] **Step 1: Failing tests.**
  - `client-row-actions.test.tsx`:
    - AC-CLI-016: with a number, *Buka WhatsApp* is a link to `https://wa.me/6281234567890` with `target="_blank"` and `rel="noopener noreferrer"`; without a number it is absent;
    - AC-CLI-013: *Arsipkan* calls `setClientArchivedAction(…, true)` without a confirmation and toasts *Klien diarsipkan* / *{name} pindah ke Arsip.* with *Batalkan*, which calls it with `false`; under *Arsip* the item is *Pulihkan* (`archive-restore`) and toasts *Klien dipulihkan*;
    - *Hapus* opens the delete dialog;
    - phones show the Bottom Sheet/Actions titled with the name and the meta.
  - `delete-client-dialog.test.tsx`:
    - AC-CLI-014: *Hapus klien "Rina"?* with the description; *Batal* calls nothing; confirm shows *Menghapus…*, then toasts *Klien dihapus* and closes;
    - AC-CLI-015: an `IN_USE` result switches to the blocked state: Alert/Danger *Klien ini punya proyek. Arsipkan saja.*, *Hapus klien* disabled, *Batal* → *Tutup*. On phones the sheet title carries the message and the only action is *Tutup*.
  - `use-client-mutations.test.ts`: AC-CLI-017 every action that throws shows the danger toast with *Coba lagi*, and *Coba lagi* repeats the same call.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement**, mirroring `SourceRowActions` / `DeleteSourceDialog`:
  - The desktop Menu items are *Ubah* (`pencil`), *Buka WhatsApp* (`message-circle`, a React Aria link item with `href`), *Arsipkan* / *Pulihkan*, a divider, then *Hapus* (destructive).
  - The phone sheet repeats them with `SheetItem`.
  - The WhatsApp link is built with `whatsappChatUrl` in the browser and is never passed to an action or logged (C-103).
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add client row actions and delete`.

### Task 14: E2E, fidelity and implementation record

**Files:** create `tests/e2e/clients/clients.spec.ts`; update `technical-design.md`, `spec.md`, `docs/product/feature-map.md`, `docs/HANDOFF.md`.

- [ ] **Step 1: E2E** (helpers as in `tests/e2e/photo-sources/photo-sources.spec.ts`; scope to `#app-shell-content` on desktop):
  - AC-CLI-001 / 003: a new workspace → nav *Klien* active (`aria-current`) → the *Aktif* empty state → *Arsip* tab → the archived empty state.
  - AC-CLI-006 / 010 / 012 / 021:
    - add *Rina Wedding* with `0812-3456-7890`, Instagram `@rina.wed` and a TikTok URL → the row and *1 klien aktif*;
    - add another client with `0812 3456 7890` → *Nomor ini sudah dipakai Rina Wedding*;
    - edit the name → the new name in the list.
  - AC-CLI-013 / 014 / 021: archive → toast *Batalkan* restores → archive again → *Arsip* shows it with *Pulihkan* → restore → delete with confirmation → empty, and the count updates on each step.
  - AC-CLI-004: two clients → search *RIN* → one row; reload keeps `?q=RIN`; `zzz` → *Tidak ada klien yang cocok* → *Hapus pencarian* clears.
  - AC-CLI-016: the row menu's *Buka WhatsApp* `href` is `https://wa.me/6281234567890` (assert the attribute; don't follow it).
  - AC-CLI-018: a second owner opens the first owner's `/clients` URL → not found.
  - AC-CLI-020:
    - axe (wcag2a/2aa/21a/21aa) on the populated list, the add dialog with errors and the delete confirmation, at 1440 and 390 px, light and dark;
    - keyboard: tabs → search → row menu → *Ubah* → social rows → Escape returns focus to the trigger.
- [ ] **Step 2: Fidelity.** Run the app (`preview_start`) and compare every screen with its export at 1440 and 390 px, light and dark. Fix drift in class names and nesting only (AGENTS.md). Record any deviation.
- [ ] **Step 3: Implementation record.** Add *Implementation record* to `technical-design.md`: commits, deviations, the AC → evidence map, and the gate results (typecheck, lint, unit, integration, the full E2E suite and the build).
- [ ] **Step 4: Status.** F-06 → `IN PROGRESS` with the build complete in `spec.md`, `feature-map.md` and `HANDOFF.md`. The next step is `/sdv:verify-feature clients`.
- [ ] **Step 5:** gate (all of it, plus `pnpm build`) → PASS. Commit `test(clients): add client journeys and record the build`.
