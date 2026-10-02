# F-05 Service catalog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo, `/sdv:build-feature catalog <n>` runs Task n.

**Goal:** The Owner manages their catalog on *Layanan*: three tabs (Layanan · Kategori · Item paket), services grouped by category, a service detail page with package items and booking fields, archive/unarchive and guarded delete. Every workspace starts with four item definitions.

**Architecture:**
- A new `booking` feature (`src/features/booking/{domain,application,ui}`) with five Drizzle tables behind three ports.
- Composition verifies the workspace (F-02) and wires routes and actions; seeding the default item definitions joins the workspace-creation transaction (ADR-016).
- Shared UI comes first: Switch, Select (rich options + phone picker), Tabs + Page Header tabs, Segmented Control full width, Empty State in card. They were promoted in the library on 2026-10-02 and don't exist in code yet.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), Hugeicons, Vitest (unit, dom, integration), Playwright + axe, Storybook.

Design source: [design.md](design.md) and `exports/*.html` (40 frames). Technical design: [technical-design.md](technical-design.md). Component specs: `docs/design-system/components/{tabs,page-header,segmented-control,empty-state,menu-item,menu,list-card,select,switch}.md`.

## Global Constraints

Every task's requirements implicitly include this section. They are the same as F-04's (`docs/features/source-config/plan.md` › Global Constraints) plus:

- **Boundaries (lint):** `features/booking` never imports another feature, nor the reverse. Cross-feature work goes through `composition/` or `app/`.
- **Rule values (named constants, never literals):**
  - `CATALOG_NAME_MAX_LENGTH = 60` (code points, after trim); names unique per workspace per kind, ignoring case, archived included (BR-CAT-009);
  - `UNIT_MAX_LENGTH = 20`; `SELECTION_TYPES = ["EDIT", "PRINT"]` (BR-CAT-007);
  - quantities: ≤ 2 decimals, `QUANTITY_MAX = "999999.99"` (TD-A-1); selection values whole numbers (BR-CAT-002);
  - `IDR_MAX = "999999999999"`, whole rupiah (A-7, BR-CUR-001);
  - booking fields: key `^[a-z][a-z0-9_]{0,49}$`, `OPTION_MAX_COUNT = 50`, `OPTION_MAX_LENGTH = 60` (A-3);
  - default definitions: *Foto edit* (NUMBER, foto, EDIT), *Foto cetak* (NUMBER, lembar, PRINT), *Jumlah orang* (RANGE, orang), *Durasi pemotretan* (NUMBER, jam) (BR-CAT-011).
- **Money (ADR-007, C-105):** amounts are digit strings; never `Number()` arithmetic on money. Display through `formatIdr`.
- **Copy:** Indonesian strings in this plan come from the frames; strings not drawn carry `// not in Pencil`.
- **Logging:** `catalog.save_failed` with `{ workspaceId, entity, entityId?, operation }` only, never names or values.
- **Migrations:** generated with drizzle-kit, reviewed and committed, then applied by the agent with `pnpm db:migrate` against the shared non-production database (`.dev.vars`), per `docs/architecture/tech-stack.md` › Deployment (Owner 2026-10-02). Report each run.
- **Tests:** names start with the `AC-CAT-*` / `BR-CAT-*` IDs they cover.
- **Quality gate per task:** `pnpm typecheck`, `pnpm lint` and `pnpm test` pass. From Task 9 on, `pnpm test:integration` also passes, once migrations 0006/0007 are applied.
- **Commits:** one per task; conventional, lowercase, with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```text
src/ui/primitives/icon/                       registry + types: 14 icons
src/ui/primitives/switch/                     switch.tsx · .types.ts · .test.tsx · .stories.tsx
src/ui/patterns/select/                       select.tsx · select-option.tsx · .types.ts · .test.tsx · .stories.tsx
src/ui/patterns/tabs/                         tabs.tsx · .types.ts · .test.tsx · .stories.tsx
src/ui/patterns/page-header/                  + tabs prop
src/ui/patterns/app-shell/                    + panelTabs pass-through
src/ui/patterns/segmented-control/            + isFullWidth
src/ui/patterns/empty-state/                  + placement="in-card"
src/features/workspace/domain/coming-soon-sections/   − "services"
src/features/workspace/ui/owner-nav/          + services tabs in resolvePageHeading
src/features/workspace/ui/owner-shell/        + PageHeadingOverride context
src/features/booking/
  domain/catalog-name/                        catalog-name.ts · .types.ts · .test.ts
  domain/item-definition-type/                item-definition-type.ts · .types.ts · .test.ts
  domain/package-value/                       package-value.ts · .types.ts · .test.ts
  domain/idr-amount/                          idr-amount.ts · .types.ts · .test.ts
  domain/booking-field/                       booking-field.ts · .types.ts · .test.ts
  domain/default-item-definitions/            default-item-definitions.ts · .test.ts
  domain/catalog-order/                       catalog-order.ts · .test.ts
  domain/item-summary/                        item-summary.ts · .types.ts · .test.ts
  application/errors/catalog-errors/          catalog-errors.ts · .types.ts
  application/ports/category-repository/     category-repository.port.ts
  application/ports/item-definition-repository/  item-definition-repository.port.ts
  application/ports/service-repository/      service-repository.port.ts
  application/schemas/{catalog-name,item-definition,service-info,package-value-input,booking-field,catalog-id,move-direction}/
  application/use-cases/<one folder per use case, see Tasks 7–8>
  ui/catalog-copy/ · catalog-tabs-bar/ · services-screen/ · service-row/ · categories-screen/ · category-row/
  ui/item-definitions-screen/ · item-definition-row/ · catalog-row-actions/ · category-dialog/
  ui/item-definition-dialog/ · add-service-dialog/ · delete-catalog-dialog/ · service-detail-screen/
  ui/service-info-card/ · service-items-card/ · booking-fields-card/ · service-info-dialog/
  ui/service-item-dialog/ · booking-field-dialog/ · option-list-editor/ · catalog-skeletons/
  ui/use-catalog-mutations/ · catalog-field-error/ · definition-icon/
src/adapters/db/schema/booking/catalog.ts
src/adapters/db/catalog-repository/           drizzle-category-repository.ts · drizzle-item-definition-repository.ts · drizzle-service-repository.ts · pg-error.ts
src/composition/booking/catalog-scope/        catalog-scope.ts · .types.ts
src/composition/booking/catalog-flow/         catalog-flow.ts · .types.ts · .test.ts
src/app/actions/booking/catalog.ts
src/app/(owner)/w/[workspaceId]/services/     page.tsx · loading.tsx · categories/{page,loading}.tsx · items/{page,loading}.tsx · [serviceId]/{page,loading}.tsx
drizzle/0006_service_catalog.sql · drizzle/0007_item_definition_backfill.sql
tests/support/booking/                        fake-category-repository.ts · fake-item-definition-repository.ts · fake-service-repository.ts
tests/config/item-definition-backfill.test.ts
tests/integration/booking/                    catalog-repositories.test.ts · catalog-isolation.test.ts
tests/e2e/catalog/catalog.spec.ts
```

---

### Task 1: Icons and Switch

**Files:** `src/ui/primitives/icon/icon.{types,registry}.ts` + `icon.test.tsx`; create `src/ui/primitives/switch/*`.

- [x] **Step 1: Failing tests.** Add the new names to the list in `icon.test.tsx`. Create `switch.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./switch";

describe("Switch (C07)", () => {
  it("AC-CAT-007 toggles and reports the new value", async () => {
    const onChange = vi.fn();
    render(<Switch label="Dipakai untuk pilihan foto klien" isSelected={false} onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "Dipakai untuk pilihan foto klien" });
    expect(control).not.toBeChecked();
    await userEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AC-CAT-008 a disabled switch cannot change", async () => {
    const onChange = vi.fn();
    render(<Switch label="Dipakai untuk pilihan foto klien" isSelected isDisabled onChange={onChange} />);
    expect(screen.getByRole("switch")).toBeDisabled();
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [x] **Step 2:** `pnpm test src/ui/primitives` → FAIL.
- [x] **Step 3: Icons.** Add to `IconName` and the registry:

| Name | Hugeicons export |
|---|---|
| `printer` | `PrinterIcon` |
| `clock` | `Clock01Icon` |
| `book-open` | `BookOpen01Icon` |
| `hash` | `HashtagIcon` |
| `move-horizontal` | `ArrowHorizontalIcon` |
| `arrow-up` | `ArrowUp01Icon` |
| `arrow-down` | `ArrowDown01Icon` |
| `archive` | `Archive01Icon` |
| `archive-restore` | `ArchiveRestoreIcon` |
| `lock` | `LockIcon` |
| `type` | `TextIcon` |
| `align-left` | `TextAlignLeftIcon` |
| `toggle-left` | `ToggleOffIcon` |
| `list` | `LeftToRightListBulletIcon` |

If an export name differs in `@hugeicons/core-free-icons` 4.3.5, pick the closest glyph and note it in the implementation record.

- [x] **Step 4: Switch** with React Aria `Switch`, per `switch.md`: label left (`flex-1`, body, medium, `text-(--component-switch-label)`), track 36×20 (`rounded-full`, `bg-(--component-switch-track-off)`, `data-selected:bg-(--component-switch-track-on)`), knob 16 px (`bg-(--component-switch-knob)`, translates on select), focus ring `data-focus-visible:outline-(--color-semantic-focus-ring)`, disabled `data-disabled:opacity-(--opacity-disabled)`. Props: `label`, `isSelected`, `onChange`, `isDisabled?`, `description?`, `className?`.
- [x] **Step 5: Story** `Primitives/Switch`: Off, On, Disabled On (strings in `switch.stories.copy.ts`).
- [x] **Step 6:** gate → PASS. Commit `feat(ui): add switch and catalog icons`.

### Task 2: Select with rich options

**Files:** create `src/ui/patterns/select/*`.

- [x] **Step 1: Failing test** `select.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport: () => false }));

const OPTIONS = [
  { id: "NUMBER", label: "Angka", description: "Satu nilai, mis. 25 foto atau 2 jam.", icon: "hash" as const },
  { id: "RANGE", label: "Rentang", description: "Nilai minimum–maksimum, mis. 1–2 orang.", icon: "move-horizontal" as const },
];

describe("Select (C19 + Menu Item/Rich)", () => {
  it("AC-CAT-006 shows the chosen option with its icon and changes value", async () => {
    const onChange = vi.fn();
    render(<Select label="Tipe nilai" options={OPTIONS} value="NUMBER" onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: /Tipe nilai/ });
    expect(trigger).toHaveTextContent("Angka");
    await userEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByRole("option", { name: /Angka.*Satu nilai/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(listbox).getByRole("option", { name: /Rentang/ }));
    expect(onChange).toHaveBeenCalledWith("RANGE");
  });

  it("AC-CAT-008 a disabled select shows its value and does not open", async () => {
    render(<Select label="Tipe nilai" options={OPTIONS} value="NUMBER" onChange={vi.fn()} isDisabled />);
    expect(screen.getByRole("button", { name: /Tipe nilai/ })).toBeDisabled();
  });

  it("shows a field error", () => {
    render(<Select label="Kategori" options={[]} value={null} placeholder="Pilih kategori" onChange={vi.fn()} errorMessage="Pilih kategori." />);
    expect(screen.getByText("Pilih kategori.")).toBeInTheDocument();
  });
});
```

- [x] **Step 2:** run → FAIL.
- [x] **Step 3: Implement** with React Aria `Select`, `Button`, `SelectValue`, `Popover`, `ListBox`, `ListBoxItem`, styled per `select.md` and `menu-item.md`:
  - Field: Label (`text-(length:--font-size-label) font-semibold text-(--component-input-label)`), trigger shaped like Input (border, radius, padding tokens; focus `border-(--component-input-border-focus)` + glow; invalid `border-(--component-input-border-error)`), leading icon of the selected option (`text-(--component-input-text)`), `chevron-down`, helper/error message like `TextField`.
  - Options (`select-option.tsx`): Menu Item/Rich when `description` or `icon` is set (icon 16, label body medium, description label size `text-(--component-menu-item-description)`, check on selected with semibold label), otherwise Menu Item/Default. Hover/focus `data-focused:bg-(--component-menu-item-background-hover)`.
  - Desktop: `Popover` (menu tokens, `elevation/1`), width = trigger width.
  - Phone (`useMobileViewport()`): the trigger opens `BottomSheet variant="form"` titled with the label (and `pickerDescription`), whose body is the same `ListBox`, plus a full-width *Pilih* button that commits the highlighted option (`select.copy.ts`: `pick: "Pilih"`).
  - Types: `SelectOption { id: string; label: string; description?: string; icon?: IconName; isDisabled?: boolean }`; `SelectProps { label: string; options: readonly SelectOption[]; value: string | null; onChange: (id: string) => void; placeholder?: string; description?: string; errorMessage?: string; isDisabled?: boolean; isOptional?: boolean; pickerDescription?: string; name?: string }`.
- [x] **Step 4: Story** `Patterns/Select`: `Default`, `RichOptions` (Tipe nilai), `Disabled`, `Error`.
- [x] **Step 5:** gate → PASS. Commit `feat(ui): add select with rich options`.

### Task 3: Tabs, header tabs, full-width segmented control, in-card empty state

**Files:** create `src/ui/patterns/tabs/*`; modify `page-header`, `app-shell`, `segmented-control`, `empty-state` (+ tests, stories).

- [x] **Step 1: Failing tests.**

```tsx
// tabs.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs } from "./tabs";

const TABS = [
  { href: "/w/ws/services", label: "Layanan", isActive: true },
  { href: "/w/ws/services/categories", label: "Kategori", isActive: false },
  { href: "/w/ws/services/items", label: "Item paket", isActive: false },
];

describe("Tabs (C45)", () => {
  it("AC-CAT-003 renders link tabs and marks the current one", () => {
    render(<Tabs label="Bagian layanan" tabs={TABS} />);
    const nav = screen.getByRole("navigation", { name: "Bagian layanan" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Layanan" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Kategori" })).not.toHaveAttribute("aria-current");
  });
});
```

  - `page-header.test.tsx`: with `tabs`, the header renders the `Tabs` under the hero and keeps one bottom border.
  - `segmented-control.test.tsx`: with `isFullWidth`, the root and every item have `w-full` / `flex-1` and labels are centred.
  - `empty-state.test.tsx`: `placement="in-card"` drops the surface and border classes and makes the body full width.
- [x] **Step 2:** run → FAIL.
- [x] **Step 3: Implement.**
  - **`Tabs`** (`tabs.md`): `<nav aria-label>` + `<ul class="flex gap-(--component-tabs-gap)">`; each item a Next `Link`, `py-(--component-tabs-item-padding-y)`, label body; inactive `text-(--component-tabs-item-text) font-medium hover:text-(--component-tabs-item-text-hover)`; active `aria-current="page"`, `text-(--component-tabs-item-text-active) font-bold`, `border-b-2 border-(--component-tabs-item-indicator)`; focus-visible outline `(--component-tabs-item-focus)` with `rounded-(--component-tabs-item-radius)`. Variant `hasTrack` adds the standalone `border-b border-(--component-tabs-track)` (default true; Page Header passes false). Types: `TabLink { href; label; isActive }`, `TabsProps { label; tabs: readonly TabLink[]; hasTrack?: boolean }`.
  - **`PageHeader`:** new optional `tabs?: { label: string; tabs: readonly TabLink[] }`. Render below the hero in a row padded `px-(--component-page-header-tabs-padding-x)`, `Tabs hasTrack={false}`; the header's existing bottom border is the track (Page Header/Tabs `NPQ7d`).
  - **`AppShell`:** pass a new `panelTabs` prop to `PageHeader` (desktop tree only).
  - **`SegmentedControl`:** `isFullWidth?: boolean` → root `w-full`, items `flex-1 justify-center text-center` (Segmented Control/Full width `iIcai`).
  - **`EmptyState`:** `placement?: "standalone" | "in-card"`; `in-card` → no `bg`/`border`, padding `py-(--component-empty-state-in-card-padding-y) px-0`, body `w-full` (Empty State/In card `E9A74J`).
- [x] **Step 4: Stories:** `Patterns/Tabs` (`Standalone`, `InHeader` via PageHeader), Segmented `FullWidth`, Empty State `InCard` inside a Section Card.
- [x] **Step 5:** gate → PASS. Commit `feat(ui): add tabs, header tabs, full-width segmented control and in-card empty state`.

### Task 4: Owner shell for the catalog

**Files:** modify `coming-soon-sections.ts`, `owner-nav.tsx` (+ `.types.ts`, `.copy.ts`), `owner-shell.tsx` (+ `.types.ts`), their tests; create `features/workspace/ui/page-heading-override/*`.

- [ ] **Step 1: Failing tests.**
  - `coming-soon-sections.test.ts`: AC-CAT-003 `isComingSoonSection("services") === false`.
  - `owner-nav.test.tsx`:
    - `resolvePageHeading("/w/ws/services", "ws", …)` → title *Layanan*, subtitle *Paket yang kamu jual. Proyek baru menyalin isi paket saat dibuat.*, tabs Layanan (active) · Kategori · Item paket with hrefs `/w/ws/services`, `/services/categories`, `/services/items`;
    - `/w/ws/services/items` → Item paket active;
    - `/w/ws/services/<uuid>` → no tabs (the detail page overrides the heading);
    - the sidebar *Layanan* item stays active on every `/services/**` path.
  - `owner-shell.test.tsx`: a child rendering `<PageHeadingOverride title="Wisuda Basic" parent={{ label: "Layanan", href: "/w/ws/services" }} />` replaces the header title and shows the Compact Bar parent on phones.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - Remove `"services"` from `COMING_SOON_SECTIONS` (a static `services/` route now exists, ADR-015).
  - `PageHeading` gains `tabs?: { label: string; tabs: readonly TabLink[] }`. Copy: `servicesSubtitle`, `servicesTabsLabel: "Bagian layanan"`, `serviceTabs: { services: "Layanan", categories: "Kategori", items: "Item paket" }` (from frames; the label is `// not in Pencil`).
  - `resolvePageHeading`: for section `services`, return tabs only when the rest of the path is `""`, `"categories"` or `"items"`.
  - `PageHeadingOverride` (client): a context provider in `OwnerShell` (`useState<OwnerSubPage | null>`), a child component that sets it in `useEffect` and clears it on unmount. `OwnerShell` resolves `override ?? subPage ?? resolvePageHeading(...)`; tabs go to `AppShell panelTabs`.
- [ ] **Step 4:** gate → PASS. Commit `feat(workspace): route catalog tabs and dynamic headings through the owner shell`.

### Task 5: Domain

**Files:** create the eight `features/booking/domain/*` units.

- [ ] **Step 1: Failing tests.**

```ts
// catalog-name.test.ts
import { describe, expect, it } from "vitest";

import { catalogNameKey, findCatalogNameProblem, normaliseCatalogName } from "./catalog-name";

describe("catalog names (BR-CAT-009)", () => {
  it.each([
    ["", "EMPTY"],
    ["   ", "EMPTY"],
    ["a".repeat(61), "TOO_LONG"],
    [`  ${"a".repeat(60)} `, null],
    ["Wisuda Basic", null],
  ])("AC-CAT-019 %j → %s", (raw, problem) => {
    expect(findCatalogNameProblem(raw)).toBe(problem);
  });

  it("AC-CAT-019 trims and keys names case-insensitively", () => {
    expect(normaliseCatalogName("  Wisuda Basic ")).toBe("Wisuda Basic");
    expect(catalogNameKey("WISUDA basic")).toBe(catalogNameKey(" wisuda Basic"));
  });
});
```

```ts
// item-definition-type.test.ts
import { describe, expect, it } from "vitest";

import { findDefinitionTypeProblem, isTypeChange } from "./item-definition-type";

describe("item definition types (BR-CAT-001, BR-CAT-002, BR-CAT-007, BR-CAT-010)", () => {
  it.each([
    [{ valueType: "NUMBER", selectionRequired: false, selectionType: null }, null],
    [{ valueType: "RANGE", selectionRequired: false, selectionType: null }, null],
    [{ valueType: "NUMBER", selectionRequired: true, selectionType: "EDIT" }, null],
    [{ valueType: "RANGE", selectionRequired: true, selectionType: "EDIT" }, "SELECTION_NEEDS_NUMBER"],
    [{ valueType: "NUMBER", selectionRequired: true, selectionType: null }, "SELECTION_TYPE_REQUIRED"],
    [{ valueType: "NUMBER", selectionRequired: false, selectionType: "PRINT" }, "SELECTION_TYPE_UNEXPECTED"],
  ] as const)("AC-CAT-007 %j → %s", (input, problem) => {
    expect(findDefinitionTypeProblem(input)).toBe(problem);
  });

  it("AC-CAT-008 renaming or changing the unit is not a type change", () => {
    const before = { valueType: "NUMBER", selectionRequired: true, selectionType: "EDIT" } as const;
    expect(isTypeChange(before, before)).toBe(false);
    expect(isTypeChange(before, { ...before, selectionType: "PRINT" })).toBe(true);
  });
});
```

```ts
// package-value.test.ts
import { describe, expect, it } from "vitest";

import { compareDecimal, findPackageValueProblem, formatQuantity, parseQuantity } from "./package-value";

describe("package values (BR-CAT-001, BR-CAT-002)", () => {
  it.each([
    ["25", "25"],
    ["1,5", "1.5"],
    ["1.50", "1.5"],
    [" 0 ", "0"],
  ])("AC-CAT-011 parses %j as %s", (raw, value) => {
    expect(parseQuantity(raw)).toEqual({ ok: true, value });
  });

  it.each([
    ["", "INVALID"],
    ["abc", "INVALID"],
    ["-1", "NEGATIVE"],
    ["1,234", "TOO_MANY_DECIMALS"],
    ["1000000", "TOO_LARGE"],
  ])("AC-CAT-012 rejects %j with %s", (raw, problem) => {
    expect(parseQuantity(raw)).toEqual({ ok: false, problem });
  });

  it("AC-CAT-012 a selection value must be whole and a range must be ordered", () => {
    const selection = { valueType: "NUMBER", selectionRequired: true } as const;
    const range = { valueType: "RANGE", selectionRequired: false } as const;
    expect(findPackageValueProblem(selection, { type: "NUMBER", value: "2.5" })).toEqual({ field: "value", problem: "NOT_WHOLE" });
    expect(findPackageValueProblem(range, { type: "RANGE", min: "3", max: "2" })).toEqual({ field: "max", problem: "MIN_GREATER_THAN_MAX" });
    expect(findPackageValueProblem(range, { type: "RANGE", min: "1", max: "2" })).toBeNull();
  });

  it("compares and formats decimals without floats", () => {
    expect(compareDecimal("10", "9.99")).toBe(1);
    expect(compareDecimal("2", "2.00")).toBe(0);
    expect(formatQuantity("1.5")).toBe("1,5");
  });
});
```

```ts
// idr-amount.test.ts
import { describe, expect, it } from "vitest";

import { formatIdr, parseIdrAmount } from "./idr-amount";

describe("IDR amounts (BR-CUR-001, BR-CUR-003, ADR-007)", () => {
  it.each([
    ["750000", "750000"],
    ["750.000", "750000"],
    ["Rp 750.000", "750000"],
    ["0", "0"],
    ["999.999.999.999", "999999999999"],
  ])("AC-CAT-010 parses %j as %s", (raw, amount) => {
    expect(parseIdrAmount(raw)).toEqual({ ok: true, amount });
  });

  it.each([
    ["", "EMPTY"],
    ["7,5", "NOT_WHOLE"],
    ["-5", "INVALID"],
    ["1.000.000.000.000", "TOO_LARGE"],
  ])("AC-CAT-010 rejects %j with %s", (raw, problem) => {
    expect(parseIdrAmount(raw)).toEqual({ ok: false, problem });
  });

  it("AC-CAT-005 formats whole rupiah", () => {
    expect(formatIdr("750000")).toBe("Rp 750.000");
    expect(formatIdr("12000000")).toBe("Rp 12.000.000");
  });
});
```

```ts
// booking-field.test.ts
import { describe, expect, it } from "vitest";

import { fieldKeyFromName, findOptionsProblem, uniqueFieldKey } from "./booking-field";

describe("booking fields (BR-CAT-006, A-3)", () => {
  it("AC-CAT-014 derives stable keys", () => {
    expect(fieldKeyFromName("Nama kampus")).toBe("nama_kampus");
    expect(fieldKeyFromName("Tanggal  wisuda!")).toBe("tanggal_wisuda");
    expect(fieldKeyFromName("Ãlamat Rumah")).toBe("alamat_rumah");
    expect(fieldKeyFromName("123")).toBe("field_123");
    expect(fieldKeyFromName("!!!")).toBe("field");
    expect(uniqueFieldKey("nama_kampus", ["nama_kampus", "nama_kampus_2"])).toBe("nama_kampus_3");
  });

  it.each([
    [[], { problem: "OPTIONS_REQUIRED" }],
    [["S", " "], { problem: "OPTION_EMPTY", index: 1 }],
    [["S", "M", "s"], { problem: "OPTION_DUPLICATE", index: 2 }],
    [["a".repeat(61)], { problem: "OPTION_TOO_LONG", index: 0 }],
    [Array.from({ length: 51 }, (_, i) => `o${i}`), { problem: "TOO_MANY_OPTIONS" }],
    [["S", "M", "L"], null],
  ])("AC-CAT-015 options %j → %j", (options, problem) => {
    expect(findOptionsProblem(options)).toEqual(problem);
  });
});
```

  - `default-item-definitions.test.ts`: AC-CAT-001 the four definitions in order; each passes `findCatalogNameProblem` and `findDefinitionTypeProblem`.
  - `catalog-order.test.ts`: AC-CAT-005 *Wisuda Basic*, *Wisuda Plus*, then archived *Wisuda Lama*.
  - `item-summary.test.ts`: AC-CAT-005 `summariseServiceItems` of Foto edit 25 foto, Foto cetak 5 lembar, Jumlah orang 1–2 orang, Durasi 4 jam → `25 foto · 5 lembar · 1–2 orang` (max 3); an item with no unit uses the lower-cased definition name (`2 album`).
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**

```ts
// catalog-name.ts
import type { CatalogNameProblem } from "./catalog-name.types";

export const CATALOG_NAME_MAX_LENGTH = 60;

/** Trims a catalog name (category, definition, service, booking field). @param raw - untrusted name @returns the stored form */
export function normaliseCatalogName(raw: string): string {
  return raw.trim();
}

/** Finds the first rule a catalog name breaks (BR-CAT-009). @param raw - untrusted name @returns the problem or null */
export function findCatalogNameProblem(raw: string): CatalogNameProblem | null {
  const name = normaliseCatalogName(raw);
  if (name.length === 0) return "EMPTY";
  if (Array.from(name).length > CATALOG_NAME_MAX_LENGTH) return "TOO_LONG";
  return null;
}

/** The case-insensitive identity of a name, as the DB index compares it. @param raw - a name @returns the key */
export function catalogNameKey(raw: string): string {
  return normaliseCatalogName(raw).toLowerCase();
}
```

```ts
// item-definition-type.types.ts
export type ValueType = "NUMBER" | "RANGE";
export type SelectionType = "EDIT" | "PRINT";
export interface DefinitionType {
  readonly valueType: ValueType;
  readonly selectionRequired: boolean;
  readonly selectionType: SelectionType | null;
}
export type DefinitionTypeProblem = "SELECTION_NEEDS_NUMBER" | "SELECTION_TYPE_REQUIRED" | "SELECTION_TYPE_UNEXPECTED";
```

```ts
// item-definition-type.ts
import type { DefinitionType, DefinitionTypeProblem, SelectionType, ValueType } from "./item-definition-type.types";

export const VALUE_TYPES: readonly ValueType[] = ["NUMBER", "RANGE"];
export const SELECTION_TYPES: readonly SelectionType[] = ["EDIT", "PRINT"];
export const UNIT_MAX_LENGTH = 20;

/** Finds the first selection rule a definition breaks (BR-CAT-002, BR-CAT-007). @param type - the definition's type settings @returns the problem or null */
export function findDefinitionTypeProblem(type: DefinitionType): DefinitionTypeProblem | null {
  if (!type.selectionRequired) return type.selectionType === null ? null : "SELECTION_TYPE_UNEXPECTED";
  if (type.valueType !== "NUMBER") return "SELECTION_NEEDS_NUMBER";
  return type.selectionType === null ? "SELECTION_TYPE_REQUIRED" : null;
}

/** Tells whether an edit changes what BR-CAT-010 locks once a definition is used. @param before - stored settings @param after - requested settings @returns whether the type changes */
export function isTypeChange(before: DefinitionType, after: DefinitionType): boolean {
  return (
    before.valueType !== after.valueType ||
    before.selectionRequired !== after.selectionRequired ||
    before.selectionType !== after.selectionType
  );
}
```

```ts
// package-value.types.ts
export type PackageValue =
  | { readonly type: "NUMBER"; readonly value: string }
  | { readonly type: "RANGE"; readonly min: string; readonly max: string };
export type QuantityProblem = "INVALID" | "NEGATIVE" | "TOO_MANY_DECIMALS" | "TOO_LARGE";
export type QuantityResult = { readonly ok: true; readonly value: string } | { readonly ok: false; readonly problem: QuantityProblem };
export type PackageValueProblem = QuantityProblem | "NOT_WHOLE" | "MIN_GREATER_THAN_MAX";
export interface PackageValueIssue {
  readonly field: "value" | "min" | "max";
  readonly problem: PackageValueProblem;
}
export interface ValueRules {
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
}
```

```ts
// package-value.ts
import type { PackageValue, PackageValueIssue, QuantityResult, ValueRules } from "./package-value.types";

export const QUANTITY_MAX = "999999.99";
const QUANTITY_PATTERN = /^(\d+)(?:[.,](\d+))?$/;

/** Parses a non-negative quantity typed with a comma or dot decimal separator (BR-CAT-001). @param raw - untrusted input @returns the canonical decimal string or a problem */
export function parseQuantity(raw: string): QuantityResult {
  const text = raw.trim();
  if (text.startsWith("-")) return { ok: false, problem: "NEGATIVE" };
  const match = QUANTITY_PATTERN.exec(text);
  if (!match) return { ok: false, problem: "INVALID" };
  const whole = (match[1] ?? "0").replace(/^0+(?=\d)/, "");
  const fraction = (match[2] ?? "").replace(/0+$/, "");
  if (fraction.length > 2) return { ok: false, problem: "TOO_MANY_DECIMALS" };
  const value = fraction.length > 0 ? `${whole}.${fraction}` : whole;
  if (compareDecimal(value, QUANTITY_MAX) > 0) return { ok: false, problem: "TOO_LARGE" };
  return { ok: true, value };
}

/** Compares two canonical non-negative decimal strings without floats. @param a - left @param b - right @returns -1, 0 or 1 */
export function compareDecimal(a: string, b: string): -1 | 0 | 1 {
  const [aw = "0", af = ""] = a.split(".");
  const [bw = "0", bf = ""] = b.split(".");
  if (aw.length !== bw.length) return aw.length > bw.length ? 1 : -1;
  const width = Math.max(af.length, bf.length);
  const left = aw + af.padEnd(width, "0");
  const right = bw + bf.padEnd(width, "0");
  if (left === right) return 0;
  return left > right ? 1 : -1;
}

/** Checks a package value against its definition (BR-CAT-001, BR-CAT-002). @param rules - the definition's value rules @param value - parsed value @returns the first issue or null */
export function findPackageValueProblem(rules: ValueRules, value: PackageValue): PackageValueIssue | null {
  if (value.type !== rules.valueType) return { field: "value", problem: "INVALID" };
  if (value.type === "NUMBER") {
    return rules.selectionRequired && value.value.includes(".") ? { field: "value", problem: "NOT_WHOLE" } : null;
  }
  return compareDecimal(value.min, value.max) > 0 ? { field: "max", problem: "MIN_GREATER_THAN_MAX" } : null;
}

/** Formats a canonical decimal for Indonesian display (comma decimals). @param value - canonical decimal @returns the display string */
export function formatQuantity(value: string): string {
  return value.replace(".", ",");
}
```

```ts
// idr-amount.ts
import type { IdrAmountResult } from "./idr-amount.types";

export const IDR_MAX = "999999999999";
const IDR_FORMAT = new Intl.NumberFormat("id-ID");

/** Parses whole rupiah typed with optional "Rp" and dot thousands separators (BR-CUR-001, A-7). @param raw - untrusted input @returns the digit string or a problem */
export function parseIdrAmount(raw: string): IdrAmountResult {
  const text = raw.replace(/^\s*Rp\s*/i, "").replaceAll(".", "").replaceAll(" ", "");
  if (text.length === 0) return { ok: false, problem: "EMPTY" };
  if (text.includes(",")) return { ok: false, problem: "NOT_WHOLE" };
  if (!/^\d+$/.test(text)) return { ok: false, problem: "INVALID" };
  const amount = text.replace(/^0+(?=\d)/, "");
  if (amount.length > IDR_MAX.length) return { ok: false, problem: "TOO_LARGE" };
  return { ok: true, amount };
}

/** Formats a whole-rupiah digit string, never through floating point (ADR-007). @param amount - digit string @returns e.g. "Rp 750.000" */
export function formatIdr(amount: string): string {
  return `Rp ${IDR_FORMAT.format(BigInt(amount))}`;
}
```

`idr-amount.types.ts`: `IdrAmountProblem = "EMPTY" | "INVALID" | "NOT_WHOLE" | "TOO_LARGE"`; `IdrAmountResult = { ok: true; amount: string } | { ok: false; problem: IdrAmountProblem }`. The DB stores `numeric(18,3)`; the repository maps `"750000.000"` ↔ `"750000"` with a string split, not `Number`.

```ts
// booking-field.ts
import type { FieldType, OptionsProblem } from "./booking-field.types";

export const FIELD_TYPES: readonly FieldType[] = ["TEXT", "TEXTAREA", "NUMBER", "DATE", "BOOLEAN", "SELECT"];
export const FIELD_KEY_MAX_LENGTH = 50;
export const OPTION_MAX_COUNT = 50;
export const OPTION_MAX_LENGTH = 60;

/** Derives a stable snake_case key from a field name; renames never change it (A-3). @param name - the field name @returns the base key */
export function fieldKeyFromName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, FIELD_KEY_MAX_LENGTH);
  if (slug.length === 0) return "field";
  return /^[a-z]/.test(slug) ? slug : `field_${slug}`.slice(0, FIELD_KEY_MAX_LENGTH);
}

/** Makes a key unique among a service's keys by suffixing _2, _3, … (BR-CAT-006). @param base - the derived key @param existing - the service's keys @returns a free key */
export function uniqueFieldKey(base: string, existing: readonly string[]): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}_${suffix}`)) suffix += 1;
  return `${base}_${suffix}`;
}

/** Finds the first problem in a SELECT field's options (A-3). @param options - option labels @returns the problem (with index) or null */
export function findOptionsProblem(options: readonly string[]): OptionsProblem | null {
  if (options.length === 0) return { problem: "OPTIONS_REQUIRED" };
  if (options.length > OPTION_MAX_COUNT) return { problem: "TOO_MANY_OPTIONS" };
  const seen = new Set<string>();
  for (const [index, raw] of options.entries()) {
    const option = raw.trim();
    if (option.length === 0) return { problem: "OPTION_EMPTY", index };
    if (Array.from(option).length > OPTION_MAX_LENGTH) return { problem: "OPTION_TOO_LONG", index };
    if (seen.has(option.toLowerCase())) return { problem: "OPTION_DUPLICATE", index };
    seen.add(option.toLowerCase());
  }
  return null;
}
```

`booking-field.types.ts`: `FieldType = "TEXT" | "TEXTAREA" | "NUMBER" | "DATE" | "BOOLEAN" | "SELECT"`; `OptionsProblem = { problem: "OPTIONS_REQUIRED" | "TOO_MANY_OPTIONS" } | { problem: "OPTION_EMPTY" | "OPTION_TOO_LONG" | "OPTION_DUPLICATE"; index: number }`.

```ts
// default-item-definitions.ts
import type { DefinitionType } from "../item-definition-type/item-definition-type.types";

interface DefaultItemDefinition extends DefinitionType {
  readonly name: string;
  readonly unit: string | null;
}

// Seeded per workspace and backfilled by migration 0007 (BR-CAT-011).
export const DEFAULT_ITEM_DEFINITIONS: readonly DefaultItemDefinition[] = [
  { name: "Foto edit", valueType: "NUMBER", unit: "foto", selectionRequired: true, selectionType: "EDIT" },
  { name: "Foto cetak", valueType: "NUMBER", unit: "lembar", selectionRequired: true, selectionType: "PRINT" },
  { name: "Jumlah orang", valueType: "RANGE", unit: "orang", selectionRequired: false, selectionType: null },
  { name: "Durasi pemotretan", valueType: "NUMBER", unit: "jam", selectionRequired: false, selectionType: null },
];
```

(If the lint rule on inline types in domain files objects to the local interface, move it to `default-item-definitions.types.ts`.)

```ts
// catalog-order.ts
/** Orders catalog entries: active first, then by name ignoring case (AC-CAT-005). @param entries - entries to sort @returns a new sorted array */
export function sortCatalogEntries<T extends { readonly name: string; readonly isActive: boolean }>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) =>
    a.isActive === b.isActive
      ? a.name.localeCompare(b.name, "id", { sensitivity: "base" })
      : a.isActive ? -1 : 1,
  );
}
```

`item-summary.ts`: `summariseServiceItems(items: readonly SummaryItem[], max = 3): string` joins `"<formatted value> <unit ?? name.toLowerCase()>"` with ` · `, where a range renders `min–max` (en dash) and values go through `formatQuantity`. `SummaryItem = { name; unit: string | null; value: PackageValue }` in `.types.ts`.

- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add catalog domain rules`.

### Task 6: Schema and migrations

**Files:** create `src/adapters/db/schema/booking/catalog.ts`; modify `schema/index.ts`; generate `drizzle/0006_*`, `0007_*`; create `tests/config/item-definition-backfill.test.ts`.

- [ ] **Step 1: Tables.**

```ts
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, numeric, pgTable, text, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, tenantRef, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-05 service catalog (BR-CAT-001…011, ADR-003, ADR-007). Templates only: F-07 snapshots them.
const nameCheck = (column: unknown) => sql`char_length(${column}) between 1 and 60 and ${column} = btrim(${column})`;
const updatedBy = () => text("updated_by").references(() => user.id, { onDelete: "set null" });

export const serviceCategory = pgTable(
  "service_category",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("service_category_workspace_name_uq").on(t.workspaceId, sql`lower(${t.name})`),
    check("service_category_name_ck", nameCheck(t.name)),
  ],
);

export const serviceItemDefinition = pgTable(
  "service_item_definition",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    valueType: text("value_type").notNull(),
    unit: text("unit"),
    selectionRequired: boolean("selection_required").notNull().default(false),
    selectionType: text("selection_type"),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("service_item_definition_workspace_name_uq").on(t.workspaceId, sql`lower(${t.name})`),
    check("service_item_definition_name_ck", nameCheck(t.name)),
    check("service_item_definition_value_type_ck", sql`${t.valueType} in ('NUMBER','RANGE')`),
    check("service_item_definition_unit_ck", sql`${t.unit} is null or (char_length(${t.unit}) between 1 and 20 and ${t.unit} = btrim(${t.unit}))`),
    check("service_item_definition_selection_type_ck", sql`${t.selectionType} is null or ${t.selectionType} in ('EDIT','PRINT')`),
    check("service_item_definition_selection_ck", sql`${t.selectionRequired} = (${t.selectionType} is not null)`),
    check("service_item_definition_selection_number_ck", sql`not ${t.selectionRequired} or ${t.valueType} = 'NUMBER'`),
  ],
);

export const service = pgTable(
  "service",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id").notNull(),
    name: text("name").notNull(),
    basePrice: numeric("base_price", { precision: 18, scale: 3 }).notNull(),
    currency: text("currency").notNull().default("IDR"),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    tenantRef({ workspaceId: t.workspaceId, column: t.categoryId }, { workspaceId: serviceCategory.workspaceId, id: serviceCategory.id }).onDelete("restrict"),
    uniqueIndex("service_workspace_name_uq").on(t.workspaceId, sql`lower(${t.name})`),
    index("service_workspace_category_ix").on(t.workspaceId, t.categoryId),
    check("service_name_ck", nameCheck(t.name)),
    check("service_base_price_ck", sql`${t.basePrice} >= 0 and ${t.basePrice} = trunc(${t.basePrice}) and ${t.basePrice} <= 999999999999`),
    check("service_currency_ck", sql`${t.currency} = 'IDR'`),
  ],
);

export const serviceItem = pgTable(
  "service_item",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    serviceId: uuid("service_id").notNull(),
    definitionId: uuid("definition_id").notNull(),
    value: jsonb("value").notNull(),
    sortOrder: integer("sort_order").notNull(),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantRef({ workspaceId: t.workspaceId, column: t.serviceId }, { workspaceId: service.workspaceId, id: service.id }).onDelete("cascade"),
    tenantRef({ workspaceId: t.workspaceId, column: t.definitionId }, { workspaceId: serviceItemDefinition.workspaceId, id: serviceItemDefinition.id }).onDelete("restrict"),
    unique("service_item_definition_uq").on(t.workspaceId, t.serviceId, t.definitionId),
    index("service_item_order_ix").on(t.serviceId, t.sortOrder),
    check("service_item_value_ck", sql`jsonb_typeof(${t.value}) = 'object'`),
  ],
);

export const serviceFieldDefinition = pgTable(
  "service_field_definition",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    serviceId: uuid("service_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    fieldType: text("field_type").notNull(),
    isRequired: boolean("is_required").notNull().default(false),
    options: jsonb("options"),
    sortOrder: integer("sort_order").notNull(),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantRef({ workspaceId: t.workspaceId, column: t.serviceId }, { workspaceId: service.workspaceId, id: service.id }).onDelete("cascade"),
    unique("service_field_key_uq").on(t.workspaceId, t.serviceId, t.key),
    uniqueIndex("service_field_name_uq").on(t.serviceId, sql`lower(${t.name})`),
    index("service_field_order_ix").on(t.serviceId, t.sortOrder),
    check("service_field_key_ck", sql`${t.key} ~ '^[a-z][a-z0-9_]{0,49}$'`),
    check("service_field_name_ck", nameCheck(t.name)),
    check("service_field_type_ck", sql`${t.fieldType} in ('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT')`),
    check("service_field_options_ck", sql`(${t.fieldType} = 'SELECT') = (${t.options} is not null) and (${t.options} is null or jsonb_typeof(${t.options}) = 'array')`),
  ],
);
```

`tenantRef` returns a `foreignKey(...)` builder; if `.onDelete` isn't chainable on it in drizzle 0.45, add an `onDelete` parameter to `tenantRef` (default `"restrict"`, backwards compatible) in this task. Export the five tables from `schema/index.ts`.

- [ ] **Step 2:** `pnpm db:generate --name service_catalog`. Review the SQL: five tables, composite FKs with the right ON DELETE, unique keys, expression indexes and all CHECKs.
- [ ] **Step 3:** `pnpm drizzle-kit generate --custom --name item_definition_backfill`, then paste the backfill from [technical-design.md](technical-design.md#database-changes).
- [ ] **Step 4: Config test** `tests/config/item-definition-backfill.test.ts` (same shape as `workspace-source-backfill.test.ts`):
  - AC-CAT-002 BR-CAT-011: for each `DEFAULT_ITEM_DEFINITIONS` entry the SQL contains `('<name>','<valueType>',<'unit'>,<true|false>,<'TYPE'|NULL>)`;
  - AC-CAT-002 idempotent: contains `WHERE NOT EXISTS`, `lower(s."name") = lower(d.name)` and `ON CONFLICT DO NOTHING`.
- [ ] **Step 5:** gate → PASS. Commit `feat(booking): add service catalog tables and definition backfill`.
- [ ] **Step 6: Apply.** After the commit, run `pnpm db:migrate` (non-production database from `.dev.vars`). Confirm with a quick check that the five tables exist and that every existing workspace has the four default definitions; report the output. 0006/0007 only add tables and rows, so other branches on the shared database are unaffected.

### Task 7: Application — categories and item definitions

**Files:** create the errors, the two ports, schemas `catalog-name`, `item-definition`, `catalog-id`, use cases below, and `tests/support/booking/fake-{category,item-definition}-repository.ts`.

- [ ] **Step 1: Ports.**

```ts
// category-repository.port.ts
import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface CategoryRecord {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly serviceCount: number;
  readonly archivedServiceCount: number;
}

export interface CategoryChange {
  readonly id: string;
  readonly name: string;
  readonly editorUserId: string;
}

export interface ActiveChange {
  readonly id: string;
  readonly isActive: boolean;
  readonly editorUserId: string;
}

// Every call is scoped by the verified workspace (C-101).
export interface CategoryRepositoryPort {
  readonly list: (context: WorkspaceContext) => Promise<readonly CategoryRecord[]>;
  readonly create: (context: WorkspaceContext, name: string, editorUserId: string) => Promise<{ readonly status: "CREATED"; readonly id: string } | { readonly status: "NAME_TAKEN" }>;
  readonly rename: (context: WorkspaceContext, change: CategoryChange) => Promise<"UPDATED" | "NAME_TAKEN" | "NOT_FOUND">;
  readonly setActive: (context: WorkspaceContext, change: ActiveChange) => Promise<boolean>;
  readonly delete: (context: WorkspaceContext, id: string) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
}
```

```ts
// item-definition-repository.port.ts
import "server-only";

import type { DefinitionType } from "@/features/booking/domain/item-definition-type/item-definition-type.types";
import type { ActiveChange } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface ItemDefinitionRecord extends DefinitionType {
  readonly id: string;
  readonly name: string;
  readonly unit: string | null;
  readonly isActive: boolean;
  readonly usageCount: number;
}

export interface ItemDefinitionInput extends DefinitionType {
  readonly name: string;
  readonly unit: string | null;
  readonly editorUserId: string | null;
}

export interface ItemDefinitionRepositoryPort {
  readonly list: (context: WorkspaceContext) => Promise<readonly ItemDefinitionRecord[]>;
  readonly findById: (context: WorkspaceContext, id: string) => Promise<ItemDefinitionRecord | null>;
  readonly create: (context: WorkspaceContext, input: ItemDefinitionInput) => Promise<"CREATED" | "NAME_TAKEN">;
  /** Changes the type only while no service item uses the definition (BR-CAT-010), in one statement. */
  readonly update: (context: WorkspaceContext, id: string, input: ItemDefinitionInput) => Promise<"UPDATED" | "NAME_TAKEN" | "LOCKED" | "NOT_FOUND">;
  readonly setActive: (context: WorkspaceContext, change: ActiveChange) => Promise<boolean>;
  readonly delete: (context: WorkspaceContext, id: string) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
  /** Inserts each default whose name the workspace doesn't have yet (BR-CAT-011). */
  readonly seedDefaults: (context: WorkspaceContext, defaults: readonly ItemDefinitionInput[]) => Promise<void>;
}
```

(Move shared contract types such as `ActiveChange` to `ports/catalog-shared/catalog-shared.port.ts` if the boundaries lint prefers it.)

- [ ] **Step 2: Schemas** (`*.schema.ts`, no `server-only`):
  - `catalogNameSchema = z.object({ name: z.string().refine(…findCatalogNameProblem…) })` (error message = the problem key, same pattern as `sourceNameSchema`);
  - `itemDefinitionSchema = catalogNameSchema.extend({ valueType: z.enum(VALUE_TYPES), unit: z.string().transform(trim → null when empty).refine(≤ UNIT_MAX_LENGTH, "UNIT_TOO_LONG"), selectionRequired: z.boolean(), selectionType: z.enum(SELECTION_TYPES).nullable() }).superRefine(findDefinitionTypeProblem → issue on "selectionType" or "valueType")`;
  - `catalogIdSchema = z.uuid()`.
  Schema tests: AC-CAT-007 RANGE + selection → `valueType: SELECTION_NEEDS_NUMBER`; selection without type → `selectionType: SELECTION_TYPE_REQUIRED`; AC-CAT-019 empty name.
- [ ] **Step 3: Errors.** `CatalogError extends DomainError`, codes `NOT_FOUND` \| `SAVE_FAILED` (same shape as `SourceConfigError`).
- [ ] **Step 4: Fakes.** Mirror `fake-workspace-source-repository.ts`: in-memory rows per workspace; `NAME_TAKEN` by `catalogNameKey`; categories carry a public `servicesByCategory: Map<string, { active: number; archived: number }>`; definitions carry `usage: Map<string, number>` that drives `usageCount`, `LOCKED` (type change with usage > 0) and `IN_USE` (delete with usage > 0); `seedDefaults` skips existing names.
- [ ] **Step 5: Failing use-case tests** (one file per use case):
  - `list-categories`: AC-CAT-009 sorted, counts passed through.
  - `add-category` / `rename-category`: AC-CAT-009 trimmed; AC-CAT-019 duplicate → `fieldErrors.name = "NAME_TAKEN"`; unknown ID → throws `NOT_FOUND`.
  - `set-category-active`: AC-CAT-017 archive then unarchive; unknown → `NOT_FOUND`.
  - `delete-category`: AC-CAT-018 unused → `{ ok:true }`; with services → `{ ok:false, code:"IN_USE" }`.
  - `list-item-definitions`: AC-CAT-006 groups `selection` (selectionRequired) and `other`, each sorted.
  - `add-item-definition`: AC-CAT-006 *Album* NUMBER `buah` no selection; AC-CAT-007 bypassed rules → field errors; AC-CAT-019 duplicate.
  - `update-item-definition`: AC-CAT-008 rename + unit change allowed while used; type change while used → `fieldErrors.valueType = "LOCKED"`; unused type change allowed.
  - `set-item-definition-active`, `delete-item-definition`: AC-CAT-017 / AC-CAT-018 (`IN_USE` when used).
  - `seed-default-item-definitions`: AC-CAT-001 four rows; AC-CAT-002 twice → still four, and an existing *foto edit* is kept.
- [ ] **Step 6:** run → FAIL. **Step 7: Implement.** Result types (in `.types.ts`):

```ts
export interface CatalogValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<Partial<Record<string, string>>>;
}
export type CatalogWriteResult = { readonly ok: true } | CatalogValidationFailure;
export type CatalogDeleteResult = { readonly ok: true } | { readonly ok: false; readonly code: "IN_USE" };
```

Use cases parse with the schema, map the first issue per path to `fieldErrors`, call the port, and map `NAME_TAKEN` / `LOCKED` to field errors and `NOT_FOUND` to `CatalogError("NOT_FOUND")`.

- [ ] **Step 8:** gate → PASS. Commit `feat(booking): add category and item definition use cases`.

### Task 8: Application — services, service items, booking fields

**Files:** create `service-repository.port.ts`, schemas `service-info`, `package-value-input`, `booking-field`, `move-direction`, the use cases below and `fake-service-repository.ts`.

- [ ] **Step 1: Port.**

```ts
// service-repository.port.ts
import "server-only";

import type { FieldType } from "@/features/booking/domain/booking-field/booking-field.types";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import type { ActiveChange } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface ServiceItemRecord {
  readonly id: string;
  readonly definitionId: string;
  readonly definitionName: string;
  readonly unit: string | null;
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
  readonly selectionType: "EDIT" | "PRINT" | null;
  readonly value: PackageValue;
}

export interface BookingFieldRecord {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly fieldType: FieldType;
  readonly isRequired: boolean;
  readonly options: readonly string[] | null;
}

export interface ServiceSummaryRecord {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  readonly basePrice: string;
  readonly isActive: boolean;
  readonly items: readonly ServiceItemRecord[];
}

export interface ServiceDetailRecord extends ServiceSummaryRecord {
  readonly categoryName: string;
  readonly currency: "IDR";
  readonly fields: readonly BookingFieldRecord[];
}

export interface ServiceInfo {
  readonly name: string;
  readonly categoryId: string;
  readonly basePrice: string;
  readonly editorUserId: string;
}

export interface BookingFieldInput {
  readonly name: string;
  readonly fieldType: FieldType;
  readonly isRequired: boolean;
  readonly options: readonly string[] | null;
  readonly editorUserId: string;
}

export type MoveDirection = "UP" | "DOWN";

export interface ServiceRepositoryPort {
  readonly listWithItems: (context: WorkspaceContext) => Promise<readonly ServiceSummaryRecord[]>;
  readonly findDetail: (context: WorkspaceContext, id: string) => Promise<ServiceDetailRecord | null>;
  readonly create: (context: WorkspaceContext, info: ServiceInfo) => Promise<{ readonly status: "CREATED"; readonly id: string } | { readonly status: "NAME_TAKEN" | "INACTIVE_REFERENCE" }>;
  readonly updateInfo: (context: WorkspaceContext, id: string, info: ServiceInfo) => Promise<"UPDATED" | "NAME_TAKEN" | "INACTIVE_REFERENCE" | "NOT_FOUND">;
  readonly setActive: (context: WorkspaceContext, change: ActiveChange) => Promise<boolean>;
  readonly delete: (context: WorkspaceContext, id: string) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
  /** Locks the definition FOR SHARE, checks it is active, appends at the end (BR-CAT-005, BR-CAT-010). */
  readonly addItem: (context: WorkspaceContext, serviceId: string, definitionId: string, value: PackageValue, editorUserId: string) => Promise<"ADDED" | "DUPLICATE_DEFINITION" | "INACTIVE_REFERENCE" | "NOT_FOUND">;
  readonly updateItemValue: (context: WorkspaceContext, serviceId: string, itemId: string, value: PackageValue, editorUserId: string) => Promise<"UPDATED" | "NOT_FOUND">;
  readonly removeItem: (context: WorkspaceContext, serviceId: string, itemId: string) => Promise<boolean>;
  readonly moveItem: (context: WorkspaceContext, serviceId: string, itemId: string, direction: MoveDirection) => Promise<boolean>;
  /** Derives a unique key from the name inside the transaction (A-3). */
  readonly addField: (context: WorkspaceContext, serviceId: string, input: BookingFieldInput) => Promise<"ADDED" | "NAME_TAKEN" | "NOT_FOUND">;
  /** Never changes the key (A-3). */
  readonly updateField: (context: WorkspaceContext, serviceId: string, fieldId: string, input: BookingFieldInput) => Promise<"UPDATED" | "NAME_TAKEN" | "NOT_FOUND">;
  readonly removeField: (context: WorkspaceContext, serviceId: string, fieldId: string) => Promise<boolean>;
  readonly moveField: (context: WorkspaceContext, serviceId: string, fieldId: string, direction: MoveDirection) => Promise<boolean>;
}
```

- [ ] **Step 2: Schemas.**
  - `serviceInfoSchema = catalogNameSchema.extend({ categoryId: z.uuid({ error: "CATEGORY_REQUIRED" }), basePrice: z.string().transform/refine via parseIdrAmount → amount, error = problem })`.
  - `packageValueInputSchema = z.discriminatedUnion("type", [ { type: "NUMBER", value: string }, { type: "RANGE", min: string, max: string } ])`; the use case parses each string with `parseQuantity`, then `findPackageValueProblem` against the definition.
  - `bookingFieldSchema = catalogNameSchema.extend({ fieldType: z.enum(FIELD_TYPES), isRequired: z.boolean(), options: z.array(z.string()).nullable() }).superRefine` (SELECT → `findOptionsProblem`, issue path `["options", index]`; non-SELECT → options must be null).
  - `moveDirectionSchema = z.enum(["UP", "DOWN"])`.
- [ ] **Step 3: Fake** `fake-service-repository.ts`: services with items and fields in arrays; enforces name uniqueness, one item per definition, active-category/definition checks via injected fakes from Task 7, `uniqueFieldKey` for keys, keeps keys on rename, reorders by swapping neighbours; `delete` → `IN_USE` for IDs in `public projectsByService: Set<string>`.
- [ ] **Step 4: Failing use-case tests:**
  - `list-services`: AC-CAT-005 grouped by category in category order, services via `sortCatalogEntries`, each with `priceLabel` (`formatIdr`) and `summary` (`summariseServiceItems`).
  - `get-service-detail`: AC-CAT-010/011/014 items and fields in `sort_order`; unknown → `NOT_FOUND`.
  - `add-service`: AC-CAT-010 *Wisuda Basic*, category, `"750.000"` → stored `"750000"`, returns `{ ok:true, serviceId }`; archived category → `fieldErrors.categoryId = "INACTIVE_REFERENCE"`; AC-CAT-019 duplicate.
  - `update-service-info`: AC-CAT-020 only the service changes; same errors.
  - `set-service-active`, `delete-service`: AC-CAT-017, AC-CAT-018 (`IN_USE` for services with projects).
  - `add-service-item`: AC-CAT-011 *Foto edit* 25, *Jumlah orang* 1–2; AC-CAT-012 `2.5` on a selection item → `value: NOT_WHOLE`, `3`/`2` range → `max: MIN_GREATER_THAN_MAX`, `-1` → `NEGATIVE`; AC-CAT-013 second add of the same definition → `fieldErrors.definitionId = "DUPLICATE_DEFINITION"`; AC-CAT-017 archived definition → `INACTIVE_REFERENCE`.
  - `update-service-item-value`, `remove-service-item`, `move-service-item`: AC-CAT-016.
  - `add-booking-field` / `update-booking-field`: AC-CAT-014 keys `nama_kampus`, `tanggal_wisuda`, `ukuran_toga`; renaming keeps the key; AC-CAT-015 duplicate name (any case) → `name: NAME_TAKEN`; SELECT with `[]` → `options: OPTIONS_REQUIRED`; `["S","M","s"]` → `options.2: OPTION_DUPLICATE`.
  - `remove-booking-field`, `move-booking-field`: AC-CAT-016.
- [ ] **Step 5:** run → FAIL. **Step 6: Implement.** Use cases re-read the definition (`ItemDefinitionRepositoryPort.findById`) to validate a value; unknown definition in this workspace → `fieldErrors.definitionId = "NOT_FOUND"`.
- [ ] **Step 7:** gate → PASS. Commit `feat(booking): add service, item and booking field use cases`.

### Task 9: Drizzle repositories and integration tests

**Files:** create `src/adapters/db/catalog-repository/*` and `tests/integration/booking/*`.

- [ ] **Step 1: Failing integration tests** (`openTestDb`, own owner/workspace per test, as in `workspace-source-repository.test.ts`):
  - `catalog-repositories.test.ts`:
    - AC-CAT-001/002: `seedDefaults` twice → 4 rows; with an existing *foto edit* → 4 rows, the existing one kept; a `db.transaction` that seeds then throws → no rows.
    - AC-CAT-019: duplicate names per kind (any case, archived included) → `NAME_TAKEN`; *Album* as a category, definition and service all succeed.
    - AC-CAT-010: `basePrice "750000"` reads back `"750000"` (repository strips `.000`).
    - AC-CAT-011/012: item values round-trip as `{"value":"25"}` / `{"min":"1","max":"2"}`.
    - AC-CAT-013: two concurrent `addItem` for the same definition (`Promise.all`) → one `ADDED`, one `DUPLICATE_DEFINITION`; one row.
    - AC-CAT-008: `update` changing `valueType` on a used definition → `LOCKED`; the row is unchanged; rename succeeds.
    - AC-CAT-014/015: field keys unique per service; `updateField` keeps the key; duplicate name → `NAME_TAKEN`.
    - AC-CAT-016: `moveItem`/`moveField` up/down persist the order; moving the first item up is a no-op that returns true.
    - AC-CAT-017: `setActive` on each kind.
    - AC-CAT-018: delete an unused category → `DELETED`; a category with a service → `IN_USE`; a used definition → `IN_USE`; deleting a service cascades its items and fields.
    - AC-CAT-020: updating a service changes only `service` (row counts of the other tables unchanged).
  - `catalog-isolation.test.ts`, AC-CAT-021: every read and write with workspace B's context on workspace A's IDs returns `NOT_FOUND`/false/empty and changes nothing; a direct insert of a `service` pointing at another workspace's category fails on the composite FK.
- [ ] **Step 2:** `pnpm test:integration tests/integration/booking` → FAIL.
- [ ] **Step 3: Implement** three factories over `DbExecutor` (`createDrizzleCategoryRepository(db)`, `createDrizzleItemDefinitionRepository(db)`, `createDrizzleServiceRepository(db)`), mirroring `createDrizzleWorkspaceSourceRepository`:
  - Every statement filters `workspaceId = context.workspaceId` (and the parent ID where relevant).
  - `pg-error.ts` exports `pgCode(error)` (read `code` or `cause.code`), shared by the three files: 23505 → name/duplicate results; 23503 → `IN_USE`.
  - Counts: `list` for categories uses grouped counts of active/archived services; definitions use `count(service_item)`.
  - `update` (definition): one `UPDATE … SET … WHERE id AND workspace_id AND (type unchanged OR NOT EXISTS (SELECT 1 FROM service_item WHERE definition_id = id AND workspace_id = …)) RETURNING id`; when it returns nothing, a follow-up `SELECT` tells `NOT_FOUND` from `LOCKED`.
  - `addItem`: `db.transaction`: `SELECT … FROM service_item_definition WHERE id AND workspace_id FOR SHARE`; inactive → `INACTIVE_REFERENCE`; `SELECT coalesce(max(sort_order), -1) + 1`; insert; map 23505.
  - `moveItem` / `moveField`: `db.transaction`: lock the service row `FOR UPDATE`, read the ordered siblings, swap the two `sort_order` values.
  - `addField`: `db.transaction`: read the service's keys, `uniqueFieldKey(fieldKeyFromName(name), keys)`, insert; map 23505 on the name index to `NAME_TAKEN` (retry once on a key collision).
  - Reads parse JSONB with the domain shapes (`packageValueSchema` / options array) and skip rows that fail, never guessing.
- [ ] **Step 4:** unit test `drizzle-service-repository.test.ts` with a stub executor rejecting `{ cause: { code: "23503" } }` on delete → `IN_USE` (F-07 projects).
- [ ] **Step 5:** gate + `pnpm test:integration` → PASS. Commit `feat(booking): add drizzle catalog repositories`.

### Task 10: Composition, creation seeding and server actions

**Files:** create `composition/booking/catalog-scope/*`, `composition/booking/catalog-flow/*`, `app/actions/booking/catalog.ts`; modify `workspace-creation-scope.{ts,types.ts}` and `owner-workspace.ts`.

- [ ] **Step 1: Failing flow test** `catalog-flow.test.ts` (mock the logger, `next/navigation`, `owner-guard`, `verifyOwnerWorkspace` and the scope, as in `source-config-flow.test.ts`):
  - AC-CAT-010: `addCatalogService("ws-1", { name:"Wisuda Basic", categoryId, basePrice:"750.000" })` calls `create` with the verified context, amount `"750000"` and editor `owner_1`;
  - AC-CAT-021: a malformed service ID → `notFound`; the port's `NOT_FOUND` → `notFound`;
  - AC-CAT-022: the port throws `Error("db down")` → `CatalogError("SAVE_FAILED")`, logger called with exactly `("catalog.save_failed", { workspaceId:"ws-1", entity:"service", entityId:<id>, operation:"update_info" })`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - `withCatalogScope(work)` → `withRequestDb((db) => work({ categories, itemDefinitions, services }))`.
  - `catalog-flow.ts` exports the four loaders (`loadServices`, `loadCategories`, `loadItemDefinitions`, `loadServiceDetail`) returning view models (IDs, names, `isActive`, labels already formatted: `priceLabel`, `summary`, `metaLabel`, usage/count labels are built in the UI from numbers), plus one entry per action, all following `source-config-flow.ts`.
  - `WorkspaceCreationScope` gains `itemDefinitions` (`createDrizzleItemDefinitionRepository(tx)`); both create flows call `seedDefaultItemDefinitions(itemDefinitions, { workspaceId: created.id })` after `seedDefaultSource`.
  - `app/actions/booking/catalog.ts` (`"use server"`): thin actions listed in the technical design; each calls its flow entry, returns field errors as-is, and `revalidatePath("/w/[workspaceId]/services", "layout")` on success (covers the three tabs and the detail).
- [ ] **Step 4:** extend `catalog-repositories.test.ts` AC-CAT-001 to run through `withWorkspaceCreationScope` if the harness allows; otherwise keep the `db.transaction` version.
- [ ] **Step 5:** gate + integration → PASS. Commit `feat(booking): wire the catalog and seed default item definitions`.

### Task 11: Routes, loaders, copy, skeletons and phone tabs

**Files:** create the `services/**` route files, `ui/catalog-copy/catalog-copy.copy.ts`, `ui/catalog-tabs-bar/*`, `ui/catalog-skeletons/*`, `ui/definition-icon/*`, `ui/catalog-field-error/*`.

- [ ] **Step 1: Failing tests.**
  - `catalog-tabs-bar.test.tsx`: on phones (mock `useMobileViewport` → true) a full-width Segmented Control *Bagian layanan* with Layanan · Kategori · Item paket; selecting *Kategori* pushes `/w/ws/services/categories`; on desktop it renders nothing.
  - `definition-icon.test.ts`: EDIT → `image`, PRINT → `printer`, RANGE → `move-horizontal`, otherwise `hash` (TD-D-1).
  - `catalog-field-error.test.ts`: every field-error key used by Tasks 7–8 maps to a `CATALOG_COPY.errors` string.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - Pages: `services/page.tsx` → `loadServices` → `<ServicesScreen …/>`; `categories/page.tsx`, `items/page.tsx`, `[serviceId]/page.tsx` likewise. Until Tasks 12–14 land, the screens may be minimal lists. `loading.tsx` per route renders the matching skeleton (`layanan-loading-m603dh`).
  - `catalog-copy.copy.ts` — strings from the frames:

```ts
export const CATALOG_COPY = {
  tabsLabel: "Bagian layanan", // not in Pencil
  addService: "Tambah layanan",
  addCategory: "Tambah kategori",
  addItem: "Tambah item",
  addField: "Tambah field",
  add: "Tambah",
  edit: "Ubah",
  rename: "Ganti nama",
  archive: "Arsipkan",
  unarchive: "Aktifkan",
  delete: "Hapus",
  archived: "Diarsipkan",
  active: "Aktif",
  rowActions: (name: string) => `Aksi untuk ${name}`,
  moveUp: "Naikkan",
  moveDown: "Turunkan",
  categoryCount: (active: number, archived: number) =>
    archived > 0 ? `${active + archived} layanan · ${archived} diarsipkan` : active > 0 ? `${active} layanan` : "Belum ada layanan",
  servicesEmptyTitle: "Belum ada layanan",
  servicesEmptyBody: "Buat kategori dulu, misalnya Wisuda atau Wedding, lalu tambahkan layanan dengan harga dan isi paketnya.",
  categoriesTitle: "Kategori",
  categoriesDescription: "Mengelompokkan layanan di tab Layanan.",
  selectionGroupTitle: "Dipilih klien",
  selectionGroupDescription: "Jadi jatah pilihan foto klien di gallery. Selalu angka bulat.",
  otherGroupTitle: "Item lainnya",
  otherGroupDescription: "Keterangan paket yang tidak dipilih klien.",
  valueTypes: { NUMBER: "Angka", RANGE: "Rentang" },
  valueTypeDescriptions: { NUMBER: "Satu nilai, mis. 25 foto atau 2 jam.", RANGE: "Nilai minimum–maksimum, mis. 1–2 orang." },
  selectionTypes: { EDIT: "Foto edit", PRINT: "Foto cetak" },
  selectionTypeDescriptions: { EDIT: "Klien memilih foto untuk diedit. Dihitung per foto.", PRINT: "Klien memilih foto dan jumlah cetaknya." },
  definitionMeta: (valueType: string, unit: string | null, usage: number) =>
    [valueType, unit, usage > 0 ? `dipakai di ${usage} layanan` : "belum dipakai"].filter(Boolean).join(" · "),
  definitionDialogAddTitle: "Tambah item paket",
  definitionDialogEditTitle: "Ubah item paket",
  definitionDialogDescription: "Dipakai ulang di semua layanan workspace ini.",
  definitionEditDescription: "Perubahan nama dan satuan berlaku di semua layanan.",
  nameItem: "Nama item",
  valueType: "Tipe nilai",
  unit: "Satuan",
  unitHelp: "Ditulis setelah nilai, mis. 2 buah.",
  selectionSwitch: "Dipakai untuk pilihan foto klien",
  selectionType: "Jenis pilihan",
  selectionLockedNumber: "Pilihan klien selalu angka bulat.",
  lockedTitle: (usage: number) => `Dipakai di ${usage} layanan`,
  lockedBody: "Tipe nilai dan pilihan klien terkunci supaya nilai di layanan tetap valid.",
  categoryDialogAddTitle: "Tambah kategori",
  categoryDialogRenameTitle: "Ganti nama kategori", // not in Pencil
  categoryDialogDescription: "Mis. Wisuda, Wedding, Keluarga.",
  nameCategory: "Nama kategori",
  nameCategoryPlaceholder: "Contoh: Prewedding",
  addServiceTitle: "Tambah layanan",
  addServiceDescription: "Isi paket dan field booking diatur setelah layanan dibuat.",
  nameService: "Nama layanan",
  nameServicePlaceholder: "Contoh: Wisuda Basic",
  category: "Kategori",
  categoryPlaceholder: "Pilih kategori",
  newCategoryOption: "+ Kategori baru",
  categoryHelp: "Belum ada kategorinya? Pilih “+ Kategori baru” di daftar.",
  basePrice: "Harga dasar",
  basePriceHelp: "Dalam rupiah, tanpa desimal.",
  adding: "Menambahkan…",
  saving: "Menyimpan…",
  save: "Simpan",
  cancel: "Batal",
  pick: "Pilih",
  detailSubtitle: "Perubahan hanya berlaku untuk proyek yang dibuat setelahnya.",
  infoTitle: "Info layanan",
  infoDescription: "Nama, kategori dan harga dasar.",
  status: "Status",
  itemsTitle: "Item paket",
  itemsDescription: "Disalin ke proyek dalam urutan ini.",
  itemsEmpty: "Belum ada item paket. Tambahkan isi paket, misalnya Foto edit 25 atau Jumlah orang 1–2.",
  fieldsTitle: "Field booking",
  fieldsDescription: "Diisi saat membuat proyek dari layanan ini.",
  fieldsEmpty: "Belum ada field booking. Tambahkan kalau proyek butuh info tambahan, misalnya Nama kampus.",
  archivedBannerTitle: "Layanan ini diarsipkan",
  archivedBannerBody: "Tidak bisa dipilih untuk proyek baru. Proyek yang sudah dibuat tidak berubah.",
  selectedByClient: "Dipilih klien",
  rangeLabel: "Rentang",
  fieldTypes: { TEXT: "Teks", TEXTAREA: "Teks panjang", NUMBER: "Angka", DATE: "Tanggal", BOOLEAN: "Ya/Tidak", SELECT: "Pilihan" },
  required: "Wajib",
  optional: "Opsional",
  fieldMeta: (type: string, isRequired: boolean, options: readonly string[] | null) =>
    options ? `${type}: ${options.join(", ")} · ${isRequired ? "Wajib" : "Opsional"}` : `${type} · ${isRequired ? "Wajib" : "Opsional"}`,
  addItemTitle: "Tambah item paket",
  addItemDescription: (service: string) => `Ke layanan ${service}.`,
  editItemTitle: "Ubah item paket",
  itemPicker: "Item paket",
  itemPickerHelp: "Item yang sudah ada di layanan ini dan yang diarsipkan tidak ditampilkan.",
  value: "Nilai",
  minimum: "Minimum",
  maximum: "Maksimum",
  addFieldTitle: "Tambah field booking",
  editFieldTitle: "Ubah field booking", // not in Pencil
  fieldDialogDescription: (service: string) => `Diisi saat membuat proyek dari ${service}.`,
  fieldName: "Nama field",
  fieldType: "Tipe",
  options: "Pilihan",
  addOption: "Tambah pilihan",
  removeOption: (option: string) => `Hapus pilihan ${option}`, // not in Pencil
  requiredSwitch: "Wajib diisi",
  deleteTitle: (name: string) => `Hapus “${name}”?`,
  deleteCategoryTitle: (name: string) => `Hapus kategori “${name}”?`,
  deleteAllowedBody: "Belum dipakai di mana pun. Tindakan ini tidak bisa dibatalkan.",
  deleteBlockedTitle: "Tidak bisa dihapus",
  deleteBlockedBody: (name: string, usage: string) => `“${name}” masih dipakai ${usage}. Arsipkan supaya tidak bisa dipilih untuk yang baru.`,
  deleteConfirm: "Hapus",
  savedToast: "Perubahan tersimpan",
  archivedToast: (kind: string) => `${kind} diarsipkan`,
  archivedToastBody: (name: string) => `${name} tidak bisa dipilih untuk yang baru.`,
  undo: "Batalkan",
  unarchivedToast: "Diaktifkan lagi", // not in Pencil
  deletedToast: "Dihapus", // not in Pencil
  serverErrorTitle: "Perubahan belum tersimpan",
  serverErrorBody: "Periksa koneksi lalu coba lagi.",
  retry: "Coba lagi",
  errors: {
    EMPTY: "Isi nama.",
    TOO_LONG: "Maksimal 60 karakter.",
    NAME_TAKEN: "Nama ini sudah dipakai.",
    UNIT_TOO_LONG: "Satuan maksimal 20 karakter.",
    SELECTION_NEEDS_NUMBER: "Pilihan klien hanya untuk tipe Angka.",
    SELECTION_TYPE_REQUIRED: "Pilih jenis pilihan.",
    SELECTION_TYPE_UNEXPECTED: "Jenis pilihan hanya untuk item yang dipilih klien.",
    LOCKED: "Tipe nilai tidak bisa diubah karena sudah dipakai layanan.",
    CATEGORY_REQUIRED: "Pilih kategori.",
    INACTIVE_REFERENCE: "Pilihan ini sudah diarsipkan.",
    INVALID: "Isi angka yang valid.",
    NEGATIVE: "Tidak boleh negatif.",
    TOO_MANY_DECIMALS: "Maksimal 2 angka di belakang koma.",
    TOO_LARGE: "Angkanya terlalu besar.",
    NOT_WHOLE: "Harus angka bulat.",
    MIN_GREATER_THAN_MAX: "Maksimum harus sama atau lebih dari minimum.",
    DUPLICATE_DEFINITION: "Item ini sudah ada di layanan.",
    NOT_FOUND: "Item tidak ditemukan.",
    OPTIONS_REQUIRED: "Tambahkan minimal satu pilihan.",
    OPTION_EMPTY: "Isi pilihan.",
    OPTION_TOO_LONG: "Maksimal 60 karakter.",
    OPTION_DUPLICATE: "Pilihan ini sudah ada.",
    TOO_MANY_OPTIONS: "Maksimal 50 pilihan.",
  },
} as const;
```

  Where a frame wording differs from a string above, the frame wins; record any change in the implementation record.
  - `CatalogTabsBar`: `useMobileViewport()`; on phones `<SegmentedControl isFullWidth label={CATALOG_COPY.tabsLabel} … onChange={router.push(...)} />`.
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add the catalog routes, copy and skeletons`.

### Task 12: Layanan and Kategori tabs

**Files:** create `services-screen`, `service-row`, `categories-screen`, `category-row`, `catalog-row-actions`, `category-dialog`, `add-service-dialog`, `delete-catalog-dialog`, `use-catalog-mutations` (+ tests).

- [ ] **Step 1: Failing tests** (render inside `ToastRegion`, as F-04's screen test):
  - `services-screen.test.tsx`: AC-CAT-005 categories as Section Cards (*Wisuda*, *3 layanan · 1 diarsipkan*), rows with summary, *Rp 750.000*, archived *Wisuda 2024* last with *Diarsipkan*; AC-CAT-004 no services → Empty State in card *Belum ada layanan* with *Tambah layanan*; desktop *Tambah layanan* renders through `PageActions`, phone as a full-width primary button under the tabs bar.
  - `catalog-row-actions.test.tsx`: desktop ⋯ (*Aksi untuk Wisuda Basic*) → *Ubah*/*Ganti nama*, *Arsipkan* (or *Aktifkan* when archived), divider, *Hapus*; phone → Bottom Sheet/Actions with name and meta; AC-CAT-017 *Arsipkan* calls `setCatalogActiveAction(ws, "service", id, false)` without confirmation and the toast offers *Batalkan*, which reactivates.
  - `delete-catalog-dialog.test.tsx`: AC-CAT-018 allowed → *Hapus kategori “Prewedding”?* → confirm calls delete → toast; `IN_USE` → the blocked state (*Tidak bisa dihapus* + *Arsipkan*), whose action archives.
  - `category-dialog.test.tsx`: AC-CAT-009 add *Wisuda* and rename; `NAME_TAKEN` → field error.
  - `add-service-dialog.test.tsx`: AC-CAT-010 name, category Select (active categories + *+ Kategori baru*, which opens the category dialog and then selects the new category), price `750.000` → action called with the raw string; success navigates to `/w/ws/services/<id>`; field errors for `NAME_TAKEN`, `CATEGORY_REQUIRED`, `TOO_LARGE`; AC-CAT-022 rejection → danger toast with *Coba lagi*, dialog keeps input; saving → *Menambahkan…*.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** from `exports/layanan-*`, `kategori-*`, `tambah-layanan-*`, `delete-*`, `toast-*`, following F-04's screen, row-actions, dialogs and `useSourceMutations` (`useCatalogMutations(workspaceId, actions)` with `add*`, `rename*`, `setActive(kind, …)`, `remove(kind, …)`; success, archived with undo, server error with retry). Centred 720 column; Section Card `content="flush"`; `ListCardItem` rows with trailing `StatusChip tone="neutral" hasDot={false}` (archived), price text (`text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)`), and `CatalogRowActions`.
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add the layanan and kategori tabs`.

### Task 13: Item paket tab and item-definition dialog

**Files:** create `item-definitions-screen`, `item-definition-row`, `item-definition-dialog` (+ tests); extend `use-catalog-mutations`.

- [ ] **Step 1: Failing tests.**
  - `item-definitions-screen.test.tsx`: AC-CAT-001/006 *Dipilih klien* (Foto edit, Foto cetak with Status Chip/Info *Foto edit*/*Foto cetak*) and *Item lainnya*; meta *Angka · foto · dipakai di 5 layanan* / *belum dipakai*; archived *Album* last.
  - `item-definition-dialog.test.tsx`:
    - AC-CAT-006: add *Album*, Tipe nilai *Angka*, satuan *buah*, switch off → action called with `{ name:"Album", valueType:"NUMBER", unit:"buah", selectionRequired:false, selectionType:null }`;
    - AC-CAT-007: turning the switch on shows *Jenis pilihan* (Select with rich options) and sets *Tipe nilai* disabled to *Angka*; RANGE becomes unavailable;
    - AC-CAT-008: editing a used definition shows Alert/Info *Dipakai di 5 layanan*, the type and selection controls disabled with the `lock` icon; a server `LOCKED` maps to the field error;
    - AC-CAT-019: `NAME_TAKEN` field error; AC-CAT-022 retry toast.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** from `exports/item-paket-*`, `item-form-*` (including `item-form-jenis-pilihan-open-*`, `item-form-tipe-nilai-open-*`): Modal MD / Bottom Sheet Form; TextField *Nama item*; `Select` *Tipe nilai* (rich options, `definitionIcon` icons); TextField *Satuan* (optional, helper); `Switch`; `Select` *Jenis pilihan*. The locked state uses a read-only Text Field with `lock` per frame `l9hNq`.
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add the item paket tab and definition dialog`.

### Task 14: Service detail

**Files:** create `service-detail-screen`, `service-info-card`, `service-items-card`, `booking-fields-card`, `service-info-dialog`, `service-item-dialog`, `booking-field-dialog`, `option-list-editor` (+ tests).

- [ ] **Step 1: Failing tests.**
  - `service-detail-screen.test.tsx`: AC-CAT-010 a new service shows the facts and both empty lines; AC-CAT-011/014 filled lists in order; `PageHeadingOverride` gets *Wisuda Basic* with parent *Layanan*; desktop page action *Arsipkan* (*Aktifkan* + Alert/Warning banner when archived, AC-CAT-017); phone Compact Bar ⋯ opens the service actions sheet (*Ubah info layanan*, *Arsipkan*, *Hapus layanan*), and a row ⋯ opens *Ubah nilai*, *Naikkan*, *Turunkan*, *Hapus dari layanan*.
  - `service-items-card.test.tsx`: AC-CAT-016 *Naikkan* on *Foto cetak* calls `moveServiceItemAction(ws, svc, id, "UP")`; first row's *Naikkan* and last row's *Turunkan* are disabled; *Hapus* asks for confirmation.
  - `service-item-dialog.test.tsx`: AC-CAT-011 the definition Select lists active definitions not yet in the service; NUMBER shows *Nilai* with the unit helper; RANGE shows *Minimum*/*Maksimum*; AC-CAT-012 server errors map to `value`/`min`/`max`; AC-CAT-013 `DUPLICATE_DEFINITION` maps to the Select.
  - `booking-field-dialog.test.tsx` + `option-list-editor.test.tsx`: AC-CAT-014 *Ukuran toga* (*Pilihan*: S, M, L, optional) → action payload with `options:["S","M","L"]`; changing the type away from *Pilihan* hides and clears options; *Tambah pilihan* appends an empty input and focuses it; the remove button is labelled *Hapus pilihan S*; AC-CAT-015 `options.2: OPTION_DUPLICATE` marks the third input invalid with *Pilihan ini sudah ada.*; `NAME_TAKEN` on the name.
  - `service-info-dialog.test.tsx`: AC-CAT-020 edit name/category/price; errors as in Task 12.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** from `exports/service-detail-*`, `service-item-form-*`, `booking-field-form-*`, `service-actions-sheet-s5M34T`, `item-row-actions-sheet-FO6t9`. Rows use `ListCardItem` with the amended trailing slot (value text → `IconButton` ghost SM `arrow-up`/`arrow-down` on desktop → `CatalogRowActions`); phones drop the arrows and move reordering into the row sheet. Archived detail: Alert `tone="warning"` above the cards; the page action toggles *Arsipkan*/*Aktifkan*.
- [ ] **Step 4:** gate → PASS. Commit `feat(booking): add the service detail page`.

### Task 15: E2E, fidelity and implementation record

**Files:** create `tests/e2e/catalog/catalog.spec.ts`; modify `technical-design.md` (implementation record), `spec.md`, `feature-map.md`, `HANDOFF.md`.

- [ ] **Step 1: E2E journeys** (F-04 helpers; scope to the visible tree):
  1. **AC-CAT-001/003/004:** a new workspace → *Layanan* (sidebar active) shows the tabs, the empty state; *Item paket* lists the four seeded definitions.
  2. **AC-CAT-009/010/011/014/016:** add category *Wisuda* → add service *Wisuda Basic* 750.000 → detail opens → add *Foto edit* 25, *Foto cetak* 5, *Jumlah orang* 1–2 → add *Nama kampus* (required), *Ukuran toga* (S, M, L) → move *Foto cetak* up → reload keeps the order → back to *Layanan* shows *Rp 750.000* and the summary.
  3. **AC-CAT-008/012/015/019:** duplicate service name error; `2,5` on *Foto edit* → *Harus angka bulat.*; duplicate option error; changing *Foto edit*'s type is locked.
  4. **AC-CAT-017/018:** archive *Wisuda Basic* → *Diarsipkan* last, *Batalkan* restores; deleting *Wisuda* category is blocked → *Arsipkan*; an unused category deletes.
  5. **AC-CAT-021:** a second owner opening the first owner's `/w/<id>/services/<serviceId>` sees *Workspace tidak ditemukan*.
  6. **AC-CAT-023:** axe (wcag2a/2aa/21a/21aa) at 1440 and 390 px on the three tabs, the detail, the item-definition dialog and the booking-field dialog → 0 violations; keyboard: tabs → row ⋯ → *Ubah* → dialog → Esc returns focus.
- [ ] **Step 2:** `pnpm e2e tests/e2e/catalog` → PASS; full `pnpm e2e` → PASS.
- [ ] **Step 3: Browser fidelity.** `pnpm dev`; compare 1440 / 390 px with the 40 exports. Fix class names and nesting only. Record TD-D-1/TD-D-2 outcomes.
- [ ] **Step 4: Implementation record** in `technical-design.md`: commits, deviations, AC → test map. Set the feature status to IN PROGRESS → ready for `/sdv:verify-feature catalog`. Update `HANDOFF.md`.
- [ ] **Step 5:** gate → PASS. Commit `test(booking): add catalog journeys and record the build`.
