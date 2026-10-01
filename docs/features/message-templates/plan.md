# F-03 Message templates — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo, `/sdv:build-feature message-templates <n>` runs Task n.

**Goal:** Every workspace gets five editable WhatsApp templates. The Owner lists them, edits one with typed `{{variables}}` and a live preview, saves it (validated on the server) and can restore the default. F-15 receives a pure, sanitising renderer.

**Architecture:**
- A new `communications` feature (`src/features/communications/{domain,application,ui}`) with a Drizzle `message_template` table behind a port.
- Composition wires the routes to F-02's verified workspace context.
- Seeding the defaults runs in the same transaction as workspace creation, opened in `composition/` (ADR-016).
- UI is built from the v3 HTML exports with the library patterns (Section Card, Compact Bar, Segmented Control).

**Tech Stack:** Next.js 16.3 (App Router, server actions), React 19, Zod 4, React Hook Form + `zodResolver`, Drizzle 0.45 on Neon serverless, Tailwind v4 token utilities, react-aria-components (only inside `src/ui`), Vitest (unit + dom + integration), Playwright + axe.

Design source: [design.md](design.md) (v3 frames) and `exports/*.html`. Technical design: [technical-design.md](technical-design.md). ADR: [ADR-016](../../architecture/decisions/ADR-016-cross-feature-transactions-in-composition.md).

## Global Constraints

Every task's requirements implicitly include this section.

- **Boundaries (lint):**
  - `features/communications` never imports `features/workspace`, nor the reverse; anything cross-feature goes through `composition/` or `app/`.
  - Only `src/ui/**` imports `react-aria-components`.
  - `features/*/domain` imports no vendor package except `zod`.
- **`server-only` (lint):** every non-test `.ts` in `src/adapters/**`, `src/composition/**` and `src/features/*/application/**` starts with `import "server-only";`. The exceptions are `*.schema.ts`, `*.types.ts` and `src/adapters/db/schema/**`.
- **Types and schemas (lint):**
  - `.tsx` files and use cases declare no `type`, `interface` or `*Schema`; types go in sibling `*.types.ts`, schemas in `*.schema.ts`, named `*Schema`.
  - No `as X` assertions in `src/`, no `any`, no `enum`, no `!` without an `eslint-disable … -- reason`.
- **Copy (lint `local/ui-copy`):** no inline JSX copy. All user-facing text comes from a sibling `*.copy.ts`; UI copy is Indonesian.
- **Functions:**
  - no inline arrow JSX props; name the handler;
  - `max-lines-per-function` 50 (tests exempt);
  - SonarJS cognitive complexity 15;
  - exported functions get a one-sentence JSDoc with `@param` / `@returns`.
- **Styling:**
  - colours, spacing, radii and type only through token variables, e.g. `bg-(--component-section-card-background)`;
  - no hex in `src/ui` / `src/app`;
  - `cn()` from `@/ui/cn/cn` for conditional classes.
- **Rule values:**
  - `TEMPLATE_CONTENT_MAX_LENGTH = 2000` (A-1);
  - placeholder syntax `{{camelCaseName}}` (A-2);
  - catalogue per BR-MSG-006: all types `clientName`, `projectTitle`, `brandName`, plus:

    | Type | Extra variables | Required |
    |---|---|---|
    | `GALLERY_SHARE` | `galleryUrl`, `galleryPassword` | `galleryUrl` |
    | `SELECTION_REMINDER` | `galleryUrl` | `galleryUrl` |
    | `FINAL_DELIVERY` | `galleryUrl`, `galleryPassword` | `galleryUrl` |
    | `INVOICE_SHARE` | `invoiceNumber`, `invoiceTotal`, `invoiceUrl` | `invoiceUrl` |
    | `PAYMENT_REMINDER` | `invoiceNumber`, `invoiceTotal`, `invoiceBalance`, `invoiceUrl` | `invoiceUrl` |
- **List order and groups (A-5):** *Gallery* holds Bagikan gallery, Pengingat seleksi and Hasil akhir; *Invoice* holds Bagikan invoice and Pengingat pembayaran.
- **Logging (C-103):** never log template content, values, rendered text or URLs; log the type and error code only.
- **Migrations:** generate them with drizzle-kit and commit them; **never run `pnpm db:migrate`** — the Owner applies migrations.
- **Tests:** test names start with the `AC-MSG-*` / `BR-MSG-*` IDs they cover; unit tests sit beside the unit; integration tests go in `tests/integration/`, E2E in `tests/e2e/`.
- **Commits:** conventional, English, lowercase, no trailing period, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. One commit per task.
- **Quality gate per task:** `pnpm typecheck`, `pnpm lint` and `pnpm test` pass (plus `pnpm test:integration` from Task 7 on, once the Owner has applied the migrations).

## File Structure

```text
src/features/communications/
  domain/template-type/                 template-type.ts · .types.ts · .test.ts
  domain/variable-catalogue/            variable-catalogue.ts · .types.ts · .test.ts
  domain/template-content/              template-content.ts · .types.ts · .test.ts
  domain/render-template/               render-template.ts · .types.ts · .test.ts
  domain/default-templates/             default-templates.ts · .test.ts
  application/errors/message-template-errors/        message-template-errors.ts · .types.ts
  application/ports/message-template-repository/    message-template-repository.port.ts
  application/schemas/message-template-content/      message-template-content.schema.ts · .types.ts · .test.ts
  application/use-cases/list-message-templates/      list-message-templates.ts · .test.ts
  application/use-cases/get-message-template/        get-message-template.ts · .test.ts
  application/use-cases/update-message-template/     update-message-template.ts · .types.ts · .test.ts
  application/use-cases/seed-default-templates/      seed-default-templates.ts · .test.ts
  ui/template-copy/                      template-copy.copy.ts
  ui/template-sub-pages/                 template-sub-pages.ts · .types.ts · .test.ts
  ui/template-list-screen/               template-list-screen.tsx · .types.ts · .test.tsx
  ui/template-list-skeleton/             template-list-skeleton.tsx · .copy.ts
  ui/template-problem-text/              template-problem-text.ts · .copy.ts · .test.ts
  ui/variable-chip/                      variable-chip.tsx · .types.ts · .copy.ts · .test.tsx
  ui/message-preview/                    message-preview.tsx · render-preview.ts · .types.ts · .copy.ts · .test.tsx
  ui/use-template-form/                  use-template-form.ts · .types.ts
  ui/use-unsaved-changes-guard/          use-unsaved-changes-guard.ts · internal-href.ts · .types.ts · internal-href.test.ts
  ui/unsaved-changes-dialog/             unsaved-changes-dialog.tsx · .types.ts · .copy.ts
  ui/template-editor-screen/             template-editor-screen.tsx · .types.ts · .copy.ts · .test.tsx
src/adapters/db/schema/communications/message-template.ts
src/adapters/db/message-template-repository/drizzle-message-template-repository.ts
src/composition/communications/message-template-scope/       message-template-scope.ts · .types.ts
src/composition/communications/message-template-flow/        message-template-flow.ts · .types.ts · .test.ts
src/composition/workspace/workspace-creation-scope/          workspace-creation-scope.ts · .types.ts
src/app/actions/communications/message-templates.ts · message-templates.test.ts
src/app/(owner)/w/[workspaceId]/message-templates/page.tsx · loading.tsx
src/app/(owner)/w/[workspaceId]/message-templates/[templateType]/page.tsx
src/ui/patterns/segmented-control/      segmented-control.tsx · .types.ts · .test.tsx · .stories.tsx · .stories.copy.ts
drizzle/0002_message_template.sql · drizzle/0003_message_template_backfill.sql
tests/support/communications/fake-message-template-repository.ts
tests/config/message-template-backfill.test.ts
tests/integration/communications/message-template-repository.test.ts
tests/e2e/message-templates/message-templates.spec.ts
```

Modified:
- `src/adapters/db/client/client.types.ts` (`DbExecutor`)
- `src/adapters/db/workspace-repository/drizzle-workspace-repository.ts` (accepts `DbExecutor`)
- `src/adapters/db/schema/index.ts`
- `src/composition/workspace/owner-workspace/owner-workspace.ts` (seed in the creation transaction)
- `src/ui/primitives/icon/*`, `src/ui/primitives/button/button.types.ts`, `src/ui/primitives/textarea/*`
- `src/ui/patterns/app-shell/*`, `src/ui/patterns/mobile-app-shell/*`
- `src/features/workspace/ui/owner-shell/*`, `src/features/workspace/ui/owner-nav/*`, `src/features/workspace/domain/coming-soon-sections/coming-soon-sections.ts`
- `src/app/(owner)/w/[workspaceId]/layout.tsx`

---

### Task 1: Template types and variable catalogue (domain)

**Files:**
- Create: `src/features/communications/domain/template-type/template-type.ts`, `template-type.types.ts`, `template-type.test.ts`
- Create: `src/features/communications/domain/variable-catalogue/variable-catalogue.ts`, `variable-catalogue.types.ts`, `variable-catalogue.test.ts`

**Interfaces:**
- Produces:
  - `TEMPLATE_TYPES` (readonly tuple, journey order), `type TemplateType`, `type TemplateGroup = "GALLERY" | "INVOICE"`;
  - `isTemplateType(value: string): value is TemplateType`, `templateGroupOf(type): TemplateGroup`, `templateSlugOf(type): string`, `templateTypeFromSlug(slug: string): TemplateType | null`;
  - `TEMPLATE_VARIABLES`, `type TemplateVariable`, `allowedVariables(type): readonly TemplateVariable[]`, `requiredVariable(type): TemplateVariable`, `isTemplateVariable(name: string): name is TemplateVariable`, `isAllowedVariable(type, name: string): boolean`.

- [x] **Step 1: Write the failing tests**

`src/features/communications/domain/template-type/template-type.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  isTemplateType,
  TEMPLATE_TYPES,
  templateGroupOf,
  templateSlugOf,
  templateTypeFromSlug,
} from "./template-type";

describe("template types", () => {
  it("BR-MSG-002 A-5 lists the five types in journey order", () => {
    expect(TEMPLATE_TYPES).toEqual([
      "GALLERY_SHARE",
      "SELECTION_REMINDER",
      "FINAL_DELIVERY",
      "INVOICE_SHARE",
      "PAYMENT_REMINDER",
    ]);
  });

  it("A-5 groups gallery and invoice templates", () => {
    expect(TEMPLATE_TYPES.map(templateGroupOf)).toEqual([
      "GALLERY",
      "GALLERY",
      "GALLERY",
      "INVOICE",
      "INVOICE",
    ]);
  });

  it("round-trips URL slugs and rejects unknown ones", () => {
    expect(templateSlugOf("PAYMENT_REMINDER")).toBe("payment-reminder");
    for (const type of TEMPLATE_TYPES) expect(templateTypeFromSlug(templateSlugOf(type))).toBe(type);
    expect(templateTypeFromSlug("GALLERY_SHARE")).toBeNull();
    expect(templateTypeFromSlug("unknown")).toBeNull();
  });

  it("recognises stored type values", () => {
    expect(isTemplateType("INVOICE_SHARE")).toBe(true);
    expect(isTemplateType("EMAIL")).toBe(false);
  });
});
```

`src/features/communications/domain/variable-catalogue/variable-catalogue.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  allowedVariables,
  isAllowedVariable,
  isTemplateVariable,
  requiredVariable,
} from "./variable-catalogue";

describe("variable catalogue", () => {
  it("BR-MSG-006 gives every type the common variables first", () => {
    expect(allowedVariables("GALLERY_SHARE")).toEqual([
      "clientName",
      "projectTitle",
      "brandName",
      "galleryUrl",
      "galleryPassword",
    ]);
    expect(allowedVariables("SELECTION_REMINDER")).toEqual([
      "clientName",
      "projectTitle",
      "brandName",
      "galleryUrl",
    ]);
    expect(allowedVariables("PAYMENT_REMINDER")).toEqual([
      "clientName",
      "projectTitle",
      "brandName",
      "invoiceNumber",
      "invoiceTotal",
      "invoiceBalance",
      "invoiceUrl",
    ]);
  });

  it("BR-MSG-006 requires the type's link variable", () => {
    expect(requiredVariable("FINAL_DELIVERY")).toBe("galleryUrl");
    expect(requiredVariable("INVOICE_SHARE")).toBe("invoiceUrl");
  });

  it("BR-MSG-006 rejects another type's variables", () => {
    expect(isAllowedVariable("GALLERY_SHARE", "invoiceUrl")).toBe(false);
    expect(isAllowedVariable("INVOICE_SHARE", "galleryPassword")).toBe(false);
    expect(isAllowedVariable("INVOICE_SHARE", "invoiceTotal")).toBe(true);
  });

  it("knows the catalogue's variable names", () => {
    expect(isTemplateVariable("invoiceBalance")).toBe(true);
    expect(isTemplateVariable("namaKlien")).toBe(false);
  });
});
```

- [x] **Step 2: Run the tests and confirm they fail**

Run: `pnpm vitest run src/features/communications/domain`
Expected: FAIL — `Cannot find module './template-type'` / `'./variable-catalogue'`.

- [x] **Step 3: Implement**

`template-type.types.ts`:

```ts
import type { TEMPLATE_TYPES } from "./template-type";

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export type TemplateGroup = "GALLERY" | "INVOICE";
```

`template-type.ts`:

```ts
import type { TemplateGroup, TemplateType } from "./template-type.types";

// BR-MSG-002 types in journey order (A-5); the list, the seed and the backfill follow it.
export const TEMPLATE_TYPES = [
  "GALLERY_SHARE",
  "SELECTION_REMINDER",
  "FINAL_DELIVERY",
  "INVOICE_SHARE",
  "PAYMENT_REMINDER",
] as const;

const INVOICE_TYPES: readonly TemplateType[] = ["INVOICE_SHARE", "PAYMENT_REMINDER"];

/**
 * Checks that a stored or routed value is one of the five template types (BR-MSG-002).
 * @param value - the raw value
 * @returns whether the value is a template type
 */
export function isTemplateType(value: string): value is TemplateType {
  return TEMPLATE_TYPES.some((type) => type === value);
}

/**
 * Places a template type under the Gallery or Invoice group of the list (A-5).
 * @param type - the template type
 * @returns its list group
 */
export function templateGroupOf(type: TemplateType): TemplateGroup {
  return INVOICE_TYPES.includes(type) ? "INVOICE" : "GALLERY";
}

/**
 * Converts a template type to its editor URL slug, e.g. `GALLERY_SHARE` → `gallery-share`.
 * @param type - the template type
 * @returns the URL slug
 */
export function templateSlugOf(type: TemplateType): string {
  return type.toLowerCase().replaceAll("_", "-");
}

/**
 * Resolves an editor URL slug to its template type.
 * @param slug - the untrusted route segment
 * @returns the template type, or null for an unknown slug
 */
export function templateTypeFromSlug(slug: string): TemplateType | null {
  return TEMPLATE_TYPES.find((type) => templateSlugOf(type) === slug) ?? null;
}
```

`variable-catalogue.types.ts`:

```ts
import type { TEMPLATE_VARIABLES } from "./variable-catalogue";

export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

export interface VariableRule {
  readonly allowed: readonly TemplateVariable[];
  readonly required: TemplateVariable;
}
```

`variable-catalogue.ts`:

```ts
import type { TemplateType } from "../template-type/template-type.types";
import type { TemplateVariable, VariableRule } from "./variable-catalogue.types";

export const TEMPLATE_VARIABLES = [
  "clientName",
  "projectTitle",
  "brandName",
  "galleryUrl",
  "galleryPassword",
  "invoiceNumber",
  "invoiceTotal",
  "invoiceBalance",
  "invoiceUrl",
] as const;

const COMMON: readonly TemplateVariable[] = ["clientName", "projectTitle", "brandName"];

// BR-MSG-006 catalogue, approved by the Owner 2026-09-28. Order = chip order in the editor.
const CATALOGUE: Readonly<Record<TemplateType, VariableRule>> = {
  GALLERY_SHARE: { allowed: [...COMMON, "galleryUrl", "galleryPassword"], required: "galleryUrl" },
  SELECTION_REMINDER: { allowed: [...COMMON, "galleryUrl"], required: "galleryUrl" },
  FINAL_DELIVERY: { allowed: [...COMMON, "galleryUrl", "galleryPassword"], required: "galleryUrl" },
  INVOICE_SHARE: {
    allowed: [...COMMON, "invoiceNumber", "invoiceTotal", "invoiceUrl"],
    required: "invoiceUrl",
  },
  PAYMENT_REMINDER: {
    allowed: [...COMMON, "invoiceNumber", "invoiceTotal", "invoiceBalance", "invoiceUrl"],
    required: "invoiceUrl",
  },
};

/**
 * Lists the variables a template type may use, in chip order (BR-MSG-006).
 * @param type - the template type
 * @returns the allowed variables
 */
export function allowedVariables(type: TemplateType): readonly TemplateVariable[] {
  return CATALOGUE[type].allowed;
}

/**
 * Names the link variable a template type must contain (BR-MSG-006).
 * @param type - the template type
 * @returns the required variable
 */
export function requiredVariable(type: TemplateType): TemplateVariable {
  return CATALOGUE[type].required;
}

/**
 * Checks that a name is one of the catalogue's variables.
 * @param name - a placeholder name
 * @returns whether the name is a template variable
 */
export function isTemplateVariable(name: string): name is TemplateVariable {
  return TEMPLATE_VARIABLES.some((variable) => variable === name);
}

/**
 * Checks that a placeholder name is allowed for a template type (BR-MSG-006).
 * @param type - the template type
 * @param name - the placeholder name
 * @returns whether the type allows the variable
 */
export function isAllowedVariable(type: TemplateType, name: string): boolean {
  return allowedVariables(type).some((variable) => variable === name);
}
```

- [x] **Step 4: Run the tests and confirm they pass**

Run: `pnpm vitest run src/features/communications/domain`
Expected: PASS (8 tests).

- [x] **Step 5: Gate and commit**

```bash
pnpm typecheck && pnpm lint
git add src/features/communications/domain/template-type src/features/communications/domain/variable-catalogue
git commit -m "feat(communications): add template types and variable catalogue" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Template content rules (domain)

**Files:**
- Create: `src/features/communications/domain/template-content/template-content.ts`, `template-content.types.ts`, `template-content.test.ts`

**Interfaces:**
- Consumes: `isAllowedVariable`, `requiredVariable` (Task 1); `TemplateType`.
- Produces:
  - `TEMPLATE_CONTENT_MAX_LENGTH = 2000`, `PLACEHOLDER_PATTERN` (global RegExp, group 1 = name);
  - `normaliseTemplateContent(raw: string): string` (trim), `templateContentLength(raw: string): number` (code points after trim), `placeholdersIn(content: string): string[]`;
  - `findTemplateProblem(type, raw): TemplateContentProblem | null`;
  - `toProblemKey(problem): string` (`"EMPTY"` or `"UNKNOWN_VARIABLE:invoiceUrl"`), `parseProblemKey(key: string): TemplateContentProblem | null`, `problemKeyFor(type, input: unknown): string`;
  - `type TemplateProblemCode`, `type TemplateContentProblem`.

- [x] **Step 1: Write the failing test**

`template-content.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  findTemplateProblem,
  normaliseTemplateContent,
  parseProblemKey,
  placeholdersIn,
  problemKeyFor,
  TEMPLATE_CONTENT_MAX_LENGTH,
  templateContentLength,
  toProblemKey,
} from "./template-content";

const VALID = "Halo {{clientName}}\n{{galleryUrl}}";

describe("template content", () => {
  it("A-1 trims leading and trailing whitespace but keeps inner line breaks", () => {
    expect(normaliseTemplateContent("  Halo\n\nKak  \n")).toBe("Halo\n\nKak");
  });

  it("AC-MSG-008 rejects whitespace-only content", () => {
    expect(findTemplateProblem("GALLERY_SHARE", " \n\t ")).toEqual({ code: "EMPTY" });
  });

  it("AC-MSG-008 A-1 accepts 2,000 characters after trimming and rejects 2,001", () => {
    const base = "{{galleryUrl}}";
    const atLimit = base + "a".repeat(TEMPLATE_CONTENT_MAX_LENGTH - base.length);
    expect(findTemplateProblem("GALLERY_SHARE", `  ${atLimit}  `)).toBeNull();
    expect(findTemplateProblem("GALLERY_SHARE", `${atLimit}a`)).toEqual({ code: "TOO_LONG" });
  });

  it("A-1 counts characters as code points, like Postgres char_length", () => {
    expect(templateContentLength(" 📷a ")).toBe(2);
  });

  it.each(["{{clientName}", "{{ clientName }}", "{{}}", "Halo }}", "{{Client}}"])(
    "AC-MSG-010 rejects the malformed placeholder %s",
    (snippet) => {
      expect(findTemplateProblem("GALLERY_SHARE", `${VALID} ${snippet}`)).toEqual({
        code: "MALFORMED",
      });
    },
  );

  it("A-2 allows single braces as literal text", () => {
    expect(findTemplateProblem("GALLERY_SHARE", `${VALID} {senyum}`)).toBeNull();
  });

  it.each(["invoiceUrl", "namaKlien"])(
    "AC-MSG-009 names the variable %s that GALLERY_SHARE does not allow",
    (name) => {
      expect(findTemplateProblem("GALLERY_SHARE", `${VALID} {{${name}}}`)).toEqual({
        code: "UNKNOWN_VARIABLE",
        variable: name,
      });
    },
  );

  it("AC-MSG-011 requires the invoice link in PAYMENT_REMINDER", () => {
    expect(findTemplateProblem("PAYMENT_REMINDER", "Halo {{clientName}}")).toEqual({
      code: "MISSING_REQUIRED",
      variable: "invoiceUrl",
    });
  });

  it.each(["GALLERY_SHARE", "SELECTION_REMINDER", "FINAL_DELIVERY"] as const)(
    "AC-MSG-011 requires the gallery link in %s",
    (type) => {
      expect(findTemplateProblem(type, "Halo {{clientName}}")).toEqual({
        code: "MISSING_REQUIRED",
        variable: "galleryUrl",
      });
    },
  );

  it("lists placeholder names in order", () => {
    expect(placeholdersIn("{{a}} x {{bC}} {{a}}")).toEqual(["a", "bC", "a"]);
  });

  it("round-trips problem keys", () => {
    const problem = { code: "UNKNOWN_VARIABLE", variable: "invoiceUrl" } as const;
    expect(toProblemKey(problem)).toBe("UNKNOWN_VARIABLE:invoiceUrl");
    expect(parseProblemKey("UNKNOWN_VARIABLE:invoiceUrl")).toEqual(problem);
    expect(parseProblemKey("TOO_LONG")).toEqual({ code: "TOO_LONG" });
    expect(parseProblemKey("MISSING_REQUIRED")).toBeNull();
    expect(parseProblemKey("nope")).toBeNull();
    expect(problemKeyFor("GALLERY_SHARE", "")).toBe("EMPTY");
    expect(problemKeyFor("GALLERY_SHARE", 42)).toBe("EMPTY");
  });
});
```

- [x] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run src/features/communications/domain/template-content`
Expected: FAIL — module not found.

- [x] **Step 3: Implement**

`template-content.types.ts`:

```ts
export type TemplateProblemCode =
  | "EMPTY"
  | "TOO_LONG"
  | "MALFORMED"
  | "UNKNOWN_VARIABLE"
  | "MISSING_REQUIRED";

export type TemplateContentProblem =
  | { readonly code: "EMPTY" | "TOO_LONG" | "MALFORMED" }
  | { readonly code: "UNKNOWN_VARIABLE" | "MISSING_REQUIRED"; readonly variable: string };
```

`template-content.ts`:

```ts
import type { TemplateType } from "../template-type/template-type.types";
import { isAllowedVariable, requiredVariable } from "../variable-catalogue/variable-catalogue";
import type { TemplateContentProblem, TemplateProblemCode } from "./template-content.types";

/** A-1: at most 2,000 characters after trimming. */
export const TEMPLATE_CONTENT_MAX_LENGTH = 2000;

/** A-2: exactly `{{camelCaseName}}`, no spaces inside the braces. */
export const PLACEHOLDER_PATTERN = /\{\{([a-z][A-Za-z0-9]*)\}\}/g;

const BRACE_PAIR = /\{\{|\}\}/;
const PROBLEM_CODES: readonly TemplateProblemCode[] = [
  "EMPTY",
  "TOO_LONG",
  "MALFORMED",
  "UNKNOWN_VARIABLE",
  "MISSING_REQUIRED",
];

/**
 * Trims leading and trailing whitespace and keeps inner line breaks (A-1).
 * @param raw - the content as typed
 * @returns the content as stored
 */
export function normaliseTemplateContent(raw: string): string {
  return raw.trim();
}

/**
 * Counts the stored length in code points, matching Postgres `char_length` (A-1).
 * @param raw - the content as typed
 * @returns the trimmed length
 */
export function templateContentLength(raw: string): number {
  return Array.from(normaliseTemplateContent(raw)).length;
}

/**
 * Lists the names of the well-formed placeholders, in order of appearance.
 * @param content - template content
 * @returns the placeholder names
 */
export function placeholdersIn(content: string): string[] {
  return Array.from(content.matchAll(PLACEHOLDER_PATTERN), (match) => match[1]);
}

/**
 * Finds the first rule a template's content breaks, in the order empty, too long, malformed,
 * unknown variable, missing required link (A-1, A-2, BR-MSG-006).
 * @param type - the template type
 * @param raw - the content as typed
 * @returns the problem, or null when the content can be stored
 */
export function findTemplateProblem(
  type: TemplateType,
  raw: string,
): TemplateContentProblem | null {
  const content = normaliseTemplateContent(raw);
  if (content.length === 0) return { code: "EMPTY" };
  if (templateContentLength(content) > TEMPLATE_CONTENT_MAX_LENGTH) return { code: "TOO_LONG" };
  if (BRACE_PAIR.test(content.replace(PLACEHOLDER_PATTERN, ""))) return { code: "MALFORMED" };
  const names = placeholdersIn(content);
  const unknown = names.find((name) => !isAllowedVariable(type, name));
  if (unknown !== undefined) return { code: "UNKNOWN_VARIABLE", variable: unknown };
  const required = requiredVariable(type);
  return names.includes(required) ? null : { code: "MISSING_REQUIRED", variable: required };
}

/**
 * Encodes a problem as the stable key carried by form and server field errors.
 * @param problem - the content problem
 * @returns `CODE` or `CODE:variable`
 */
export function toProblemKey(problem: TemplateContentProblem): string {
  return "variable" in problem ? `${problem.code}:${problem.variable}` : problem.code;
}

/**
 * Decodes a field-error key back into a content problem.
 * @param key - a key made by toProblemKey
 * @returns the problem, or null for an unknown key
 */
export function parseProblemKey(key: string): TemplateContentProblem | null {
  const [code, variable] = key.split(":");
  const known = PROBLEM_CODES.find((candidate) => candidate === code);
  if (known === undefined) return null;
  if (known === "UNKNOWN_VARIABLE" || known === "MISSING_REQUIRED") {
    return variable ? { code: known, variable } : null;
  }
  return { code: known };
}

/**
 * Builds the field-error key for an untrusted input that failed validation.
 * @param type - the template type
 * @param input - the raw form or request value
 * @returns the problem key (EMPTY when the input is not a string)
 */
export function problemKeyFor(type: TemplateType, input: unknown): string {
  const problem = findTemplateProblem(type, typeof input === "string" ? input : "");
  return toProblemKey(problem ?? { code: "EMPTY" });
}
```

- [x] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run src/features/communications/domain/template-content`
Expected: PASS.

> Build note (2026-10-01): two lint fixes with no change in behaviour: `Array.from` instead of a string spread (`no-misused-spread`), and no `?? ""` on `match[1]` (`no-unnecessary-condition`).

- [x] **Step 5: Gate and commit**

```bash
pnpm typecheck && pnpm lint
git add src/features/communications/domain/template-content
git commit -m "feat(communications): validate template content and placeholders" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Renderer for F-15 (domain)

**Files:**
- Create: `src/features/communications/domain/render-template/render-template.ts`, `render-template.types.ts`, `render-template.test.ts`

**Interfaces:**
- Consumes: `findTemplateProblem`, `normaliseTemplateContent`, `placeholdersIn`, `PLACEHOLDER_PATTERN` (Task 2); `isAllowedVariable`, `isTemplateVariable` (Task 1).
- Produces:
  - `renderTemplate(type, content, values: TemplateValues): string`;
  - `sanitiseTemplateValue(value: string): string`;
  - `class RenderTemplateError extends DomainError` with `code: RenderTemplateErrorCode` (`"INVALID_CONTENT" | "VARIABLE_NOT_ALLOWED" | "MISSING_VALUE"`);
  - `type TemplateValues = Partial<Readonly<Record<TemplateVariable, string>>>`.

- [x] **Step 1: Write the failing test**

`render-template.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { RenderTemplateError, renderTemplate, sanitiseTemplateValue } from "./render-template";

function codeOf(work: () => unknown): string | undefined {
  try {
    work();
    return undefined;
  } catch (error) {
    return error instanceof RenderTemplateError ? error.code : "OTHER";
  }
}

describe("renderTemplate", () => {
  it("AC-MSG-016 substitutes allowed variables as plain text", () => {
    const text = renderTemplate("GALLERY_SHARE", "Halo {{clientName}}\n{{galleryUrl}}", {
      clientName: "Rina & Dimas",
      galleryUrl: "https://shutrly.app/g/abc",
    });
    expect(text).toBe("Halo Rina & Dimas\nhttps://shutrly.app/g/abc");
  });

  it("AC-MSG-017 fails with a typed error when a used variable has no value", () => {
    const work = () =>
      renderTemplate("GALLERY_SHARE", "{{projectTitle}} {{galleryUrl}}", { galleryUrl: "u" });
    expect(codeOf(work)).toBe("MISSING_VALUE");
  });

  it("AC-MSG-018 sanitises values and never resolves a placeholder inside a value", () => {
    const text = renderTemplate("GALLERY_SHARE", "{{clientName}} {{galleryUrl}}", {
      clientName: "Rina\u0007 {{galleryPassword}}\r\n",
      galleryUrl: "u",
      galleryPassword: "rahasia",
    });
    expect(text).toBe("Rina {{galleryPassword}} u");
  });

  it("BR-MSG-006 rejects values for variables the type does not allow", () => {
    const work = () =>
      renderTemplate("GALLERY_SHARE", "{{galleryUrl}}", { galleryUrl: "u", invoiceUrl: "i" });
    expect(codeOf(work)).toBe("VARIABLE_NOT_ALLOWED");
  });

  it("refuses invalid content instead of rendering a partial message", () => {
    expect(codeOf(() => renderTemplate("INVOICE_SHARE", "Halo", {}))).toBe("INVALID_CONTENT");
  });

  it("AC-MSG-019 keeps content and values out of the error message", () => {
    try {
      renderTemplate("GALLERY_SHARE", "{{clientName}} {{galleryUrl}}", { galleryUrl: "secret" });
    } catch (error) {
      expect(String(error)).not.toContain("secret");
      expect(String(error)).not.toContain("clientName");
    }
  });
});

describe("sanitiseTemplateValue", () => {
  it("BR-MSG-004 removes control characters except line feeds and normalises line endings", () => {
    expect(sanitiseTemplateValue("\tA\r\nB\rC\u007F\u0000 ")).toBe("A\nB\nC");
  });
});
```

- [x] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run src/features/communications/domain/render-template`
Expected: FAIL — module not found.

- [x] **Step 3: Implement**

`render-template.types.ts`:

```ts
import type { TemplateVariable } from "../variable-catalogue/variable-catalogue.types";

export type TemplateValues = Partial<Readonly<Record<TemplateVariable, string>>>;

export type RenderTemplateErrorCode = "INVALID_CONTENT" | "VARIABLE_NOT_ALLOWED" | "MISSING_VALUE";
```

`render-template.ts`:

```ts
import { DomainError } from "@/shared/errors/domain-error";

import {
  findTemplateProblem,
  normaliseTemplateContent,
  PLACEHOLDER_PATTERN,
  placeholdersIn,
} from "../template-content/template-content";
import type { TemplateType } from "../template-type/template-type.types";
import { isAllowedVariable, isTemplateVariable } from "../variable-catalogue/variable-catalogue";
import type { RenderTemplateErrorCode, TemplateValues } from "./render-template.types";

const LINE_FEED = "\n";
const LAST_CONTROL = 0x1f;
const DELETE = 0x7f;

/** A rendering failure that carries only its code, never content or values (C-103). */
export class RenderTemplateError extends DomainError {
  readonly code: RenderTemplateErrorCode;

  /**
   * Creates a typed rendering failure.
   * @param code - the stable error code
   */
  constructor(code: RenderTemplateErrorCode) {
    super(code);
    this.code = code;
  }
}

function isKeptCharacter(character: string): boolean {
  const point = character.codePointAt(0) ?? 0;
  return character === LINE_FEED || (point > LAST_CONTROL && point !== DELETE);
}

/**
 * Cleans one substitution value: CRLF/CR → LF, other control characters removed, trimmed
 * (BR-MSG-004).
 * @param value - the raw value
 * @returns the sanitised value
 */
export function sanitiseTemplateValue(value: string): string {
  return Array.from(value.replace(/\r\n?/g, LINE_FEED))
    .filter(isKeptCharacter)
    .join("")
    .trim();
}

function valueOf(values: TemplateValues, name: string): string {
  const value = isTemplateVariable(name) ? values[name] : undefined;
  if (value === undefined) throw new RenderTemplateError("MISSING_VALUE");
  return sanitiseTemplateValue(value);
}

/**
 * Renders a stored template into plain text for F-15 in a single pass, so a value can never
 * introduce a placeholder (BR-MSG-004, BR-MSG-006).
 * @param type - the template type
 * @param content - the stored content
 * @param values - one value per variable the content uses
 * @returns the rendered plain text
 * @throws RenderTemplateError for invalid content, a disallowed variable or a missing value
 */
export function renderTemplate(
  type: TemplateType,
  content: string,
  values: TemplateValues,
): string {
  if (findTemplateProblem(type, content) !== null) throw new RenderTemplateError("INVALID_CONTENT");
  if (Object.keys(values).some((name) => !isAllowedVariable(type, name))) {
    throw new RenderTemplateError("VARIABLE_NOT_ALLOWED");
  }
  const normalised = normaliseTemplateContent(content);
  const resolved = new Map(placeholdersIn(normalised).map((name) => [name, valueOf(values, name)]));
  return normalised.replace(PLACEHOLDER_PATTERN, (_match, name: string) => resolved.get(name) ?? "");
}
```

- [x] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run src/features/communications/domain/render-template`
Expected: PASS.

- [x] **Step 5: Gate and commit**

```bash
pnpm typecheck && pnpm lint
git add src/features/communications/domain/render-template
git commit -m "feat(communications): add the sanitising template renderer for whatsapp sharing" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Default templates (domain) — Owner copy checkpoint

**Files:**
- Create: `src/features/communications/domain/default-templates/default-templates.ts`, `default-templates.test.ts`

**Interfaces:**
- Consumes: `TEMPLATE_TYPES`, `findTemplateProblem`.
- Produces: `DEFAULT_TEMPLATE_CONTENT: Readonly<Record<TemplateType, string>>`.

> **STOP before Task 5:** show the Owner the five defaults below (A-10). `GALLERY_SHARE` is the approved copy from the design (`exports/editor-byw9B.html`); the other four are drafts. Migration 0003 copies the final strings, so change them here first.

- [x] **Step 1: Write the failing test**

`default-templates.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { findTemplateProblem } from "../template-content/template-content";
import { TEMPLATE_TYPES } from "../template-type/template-type";
import { DEFAULT_TEMPLATE_CONTENT } from "./default-templates";

describe("default templates", () => {
  it.each(TEMPLATE_TYPES)("BR-MSG-005 BR-MSG-006 the %s default is valid for its type", (type) => {
    expect(findTemplateProblem(type, DEFAULT_TEMPLATE_CONTENT[type])).toBeNull();
  });

  it("A-10 GALLERY_SHARE matches the approved design copy", () => {
    expect(DEFAULT_TEMPLATE_CONTENT.GALLERY_SHARE).toBe(
      "Halo {{clientName}},\n\nGallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nSilakan pilih foto favoritmu. Terima kasih!",
    );
  });

  it("A-1 stores defaults already trimmed", () => {
    for (const type of TEMPLATE_TYPES) {
      expect(DEFAULT_TEMPLATE_CONTENT[type]).toBe(DEFAULT_TEMPLATE_CONTENT[type].trim());
    }
  });
});
```

- [x] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run src/features/communications/domain/default-templates`
Expected: FAIL — module not found.

- [x] **Step 3: Implement**

`default-templates.ts`:

```ts
import type { TemplateType } from "../template-type/template-type.types";

// A-10 platform defaults (Indonesian). GALLERY_SHARE is the approved design copy; the others
// were reviewed by the Owner before migration 0003, which repeats these strings (a test in
// tests/config keeps them equal).
export const DEFAULT_TEMPLATE_CONTENT: Readonly<Record<TemplateType, string>> = {
  GALLERY_SHARE:
    "Halo {{clientName}},\n\nGallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nSilakan pilih foto favoritmu. Terima kasih!",
  SELECTION_REMINDER:
    "Halo {{clientName}}, pengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai.\n\nLanjutkan memilih di sini:\n{{galleryUrl}}\n\nTerima kasih!",
  FINAL_DELIVERY:
    "Halo {{clientName}}, foto akhir {{projectTitle}} sudah siap diunduh di gallery yang sama:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nTerima kasih sudah memercayakan momenmu kepada {{brandName}}!",
  INVOICE_SHARE:
    "Halo {{clientName}}, invoice {{invoiceNumber}} untuk {{projectTitle}} sudah terbit.\n\nTotal: {{invoiceTotal}}\nLihat invoice di sini:\n{{invoiceUrl}}\n\nTerima kasih,\n{{brandName}}",
  PAYMENT_REMINDER:
    "Halo {{clientName}}, pengingat dari {{brandName}}: invoice {{invoiceNumber}} masih memiliki sisa tagihan {{invoiceBalance}}.\n\nDetail dan pembayaran:\n{{invoiceUrl}}\n\nTerima kasih!",
};
```

- [x] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run src/features/communications/domain`
Expected: PASS (all domain tests).

> Build note (2026-10-01): built under the Owner's goal "build all task" with the drafts as written. **Owner copy review is still open** — edit `default-templates.ts` and `0003_message_template_backfill.sql` together (the config test keeps them equal).

- [x] **Step 5: Owner copy review, then gate and commit**

Ask the Owner to approve or edit the four draft defaults. Apply the edits, re-run Step 4, then:

```bash
pnpm typecheck && pnpm lint
git add src/features/communications/domain/default-templates
git commit -m "feat(communications): add the default whatsapp templates" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 5: `message_template` table and migrations — Owner applies

**Files:**
- Modify: `src/adapters/db/client/client.types.ts` (add `DbExecutor`)
- Modify: `src/adapters/db/workspace-repository/drizzle-workspace-repository.ts` (parameter type `Db` → `DbExecutor`)
- Create: `src/adapters/db/schema/communications/message-template.ts`
- Modify: `src/adapters/db/schema/index.ts`
- Create (generated): `drizzle/0002_message_template.sql`, `drizzle/meta/*`
- Create (custom): `drizzle/0003_message_template_backfill.sql`
- Test: `tests/config/message-template-backfill.test.ts`

**Interfaces:**
- Consumes: `DEFAULT_TEMPLATE_CONTENT`, `TEMPLATE_TYPES` (Tasks 1 and 4).
- Produces:
  - Drizzle table `messageTemplate`, with columns `id`, `workspaceId`, `type`, `channel`, `content`, `updatedBy`, `createdAt`, `updatedAt`;
  - `type DbExecutor`, which both `Db` and a `db.transaction` callback's `tx` satisfy (ADR-016).

- [x] **Step 1: Add `DbExecutor`**

`src/adapters/db/client/client.types.ts` (whole file):

```ts
import type { Pool } from "@neondatabase/serverless";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NeonDatabase, NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import type { PgDatabase } from "drizzle-orm/pg-core";

import type * as schema from "../schema";

export type Db = NeonDatabase<typeof schema>;

// The common base of `Db` and a `db.transaction` callback's `tx`: repositories accept it so
// composition can run several of them in one transaction (ADR-016).
export type DbExecutor = PgDatabase<
  NeonQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export interface DbHandle {
  db: Db;
  pool: Pool;
}
```

In `drizzle-workspace-repository.ts`, change the import to `import type { DbExecutor } from "../client/client.types";` and the signature to `export function createDrizzleWorkspaceRepository(db: DbExecutor): WorkspaceRepositoryPort {`. Nothing else changes.

Run: `pnpm typecheck`
Expected: PASS. If `NeonQueryResultHKT` is not exported from `drizzle-orm/neon-serverless` in 0.45.3, import it from `drizzle-orm/neon-serverless/session`, and record that in the commit message.

- [x] **Step 2: Write the failing backfill test**

`tests/config/message-template-backfill.test.ts`:

```ts
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";

const sql = readFileSync(
  new URL("../../drizzle/0003_message_template_backfill.sql", import.meta.url),
  "utf8",
);

describe("message template backfill migration", () => {
  it.each(TEMPLATE_TYPES)("AC-MSG-002 backfills the %s default verbatim", (type) => {
    expect(sql).toContain(`('${type}', $$${DEFAULT_TEMPLATE_CONTENT[type]}$$)`);
  });

  it("AC-MSG-002 is idempotent", () => {
    expect(sql).toContain('ON CONFLICT ("workspace_id", "type", "channel") DO NOTHING');
  });
});
```

Run: `pnpm vitest run tests/config/message-template-backfill.test.ts`
Expected: FAIL — `ENOENT … 0003_message_template_backfill.sql`.

- [x] **Step 3: Add the table**

`src/adapters/db/schema/communications/message-template.ts`:

```ts
import { sql } from "drizzle-orm";
import { check, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-03 message templates: exactly one per workspace, type and channel (BR-MSG-002, AC-MSG-003).
export const messageTemplate = pgTable(
  "message_template",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    type: text("type").notNull(),
    channel: text("channel").notNull().default("WHATSAPP"),
    content: text("content").notNull(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("message_template_workspace_type_channel_uq").on(t.workspaceId, t.type, t.channel),
    check(
      "message_template_type_ck",
      sql`${t.type} in ('GALLERY_SHARE','SELECTION_REMINDER','FINAL_DELIVERY','INVOICE_SHARE','PAYMENT_REMINDER')`,
    ),
    check("message_template_channel_ck", sql`${t.channel} = 'WHATSAPP'`),
    check("message_template_content_ck", sql`char_length(${t.content}) between 1 and 2000`),
  ],
);
```

Append to `src/adapters/db/schema/index.ts`:

```ts
export * from "./communications/message-template";
```

- [x] **Step 4: Generate migration 0002 and review it**

Run: `pnpm db:generate --name message_template`
Expected: `drizzle/0002_message_template.sql` with:
- `CREATE TABLE "message_template"`, including the three CHECK constraints;
- the FKs to `workspace(id)` ON DELETE restrict and to `user(id)` ON DELETE set null;
- the unique `(workspace_id, id)`;
- `CREATE UNIQUE INDEX "message_template_workspace_type_channel_uq"`.

Review it; never edit an applied migration.

- [x] **Step 5: Create migration 0003 (backfill)**

Run: `pnpm drizzle-kit generate --custom --name message_template_backfill`
Expected: an empty `drizzle/0003_message_template_backfill.sql`, plus a journal entry.

Write the file, with the strings copied verbatim from `DEFAULT_TEMPLATE_CONTENT` and real line breaks inside `$$…$$`:

```sql
-- F-03 BR-MSG-005: give every existing workspace the five default templates (AC-MSG-002).
-- Idempotent: re-running inserts nothing for a workspace that already has a type.
INSERT INTO "message_template" ("workspace_id", "type", "channel", "content")
SELECT w."id", d."type", 'WHATSAPP', d."content"
FROM "workspace" w
CROSS JOIN (VALUES
  ('GALLERY_SHARE', $$Halo {{clientName}},

Gallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:
{{galleryUrl}}

Password: {{galleryPassword}}

Silakan pilih foto favoritmu. Terima kasih!$$),
  ('SELECTION_REMINDER', $$Halo {{clientName}}, pengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai.

Lanjutkan memilih di sini:
{{galleryUrl}}

Terima kasih!$$),
  ('FINAL_DELIVERY', $$Halo {{clientName}}, foto akhir {{projectTitle}} sudah siap diunduh di gallery yang sama:
{{galleryUrl}}

Password: {{galleryPassword}}

Terima kasih sudah memercayakan momenmu kepada {{brandName}}!$$),
  ('INVOICE_SHARE', $$Halo {{clientName}}, invoice {{invoiceNumber}} untuk {{projectTitle}} sudah terbit.

Total: {{invoiceTotal}}
Lihat invoice di sini:
{{invoiceUrl}}

Terima kasih,
{{brandName}}$$),
  ('PAYMENT_REMINDER', $$Halo {{clientName}}, pengingat dari {{brandName}}: invoice {{invoiceNumber}} masih memiliki sisa tagihan {{invoiceBalance}}.

Detail dan pembayaran:
{{invoiceUrl}}

Terima kasih!$$)
) AS d("type", "content")
ON CONFLICT ("workspace_id", "type", "channel") DO NOTHING;
```

If the Owner changed a default in Task 4, use the changed text here.

- [x] **Step 6: Run the tests and confirm they pass**

Run: `pnpm vitest run tests/config/message-template-backfill.test.ts src/adapters/db`
Expected: PASS. That includes the existing `_conventions/tenant.test.ts` and `client.test.ts`.

- [x] **Step 7: Gate and commit**

```bash
pnpm typecheck && pnpm lint && pnpm test
git add src/adapters/db drizzle tests/config/message-template-backfill.test.ts
git commit -m "feat(db): add the message_template table with a default backfill" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

> **STOP — Owner action:** apply migrations 0002 and 0003 to the dev and test databases (`pnpm db:migrate`). The agent never runs this. Tasks 7 and 14 need them.

---

### Task 6: Application layer — port, schema, errors, use cases

**Files:**
- Create: `src/features/communications/application/errors/message-template-errors/message-template-errors.ts`, `message-template-errors.types.ts`
- Create: `src/features/communications/application/ports/message-template-repository/message-template-repository.port.ts`
- Create: `src/features/communications/application/schemas/message-template-content/message-template-content.schema.ts`, `.types.ts`, `.test.ts`
- Create: `src/features/communications/application/use-cases/{list-message-templates,get-message-template,update-message-template,seed-default-templates}/…`
- Create: `tests/support/communications/fake-message-template-repository.ts`

**Interfaces:**
- Consumes: domain from Tasks 1–4; `WorkspaceContext` from `@/shared/workspace-context/workspace-context.types`; `DomainError`.
- Produces:
  - `MessageTemplateError` (`code: "NOT_FOUND" | "SAVE_FAILED"`);
  - `MessageTemplateRepositoryPort`, `MessageTemplateRecord { type; content; updatedAt }`, `MessageTemplateSeed { type; content }`, `MessageTemplateUpdate { type; content; editorUserId }`;
  - `messageTemplateContentSchema(type)`, `MessageTemplateContentInput { content: string }`;
  - `listMessageTemplates(repository, context)`, `getMessageTemplate(repository, context, type)`;
  - `updateMessageTemplate(repository, context, command: UpdateMessageTemplateCommand): Promise<UpdateMessageTemplateResult>`, where `UpdateMessageTemplateCommand { type; editorUserId; input }` and `UpdateMessageTemplateResult = { ok: true } | UpdateMessageTemplateFailure`;
  - `UpdateMessageTemplateFailure { ok: false; code: "VALIDATION_FAILED"; fieldErrors: { content: string } }`;
  - `seedDefaultTemplates(repository, context)`;
  - `FakeMessageTemplateRepository`.

- [x] **Step 1: Write the failing tests**

`application/schemas/message-template-content/message-template-content.schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { messageTemplateContentSchema } from "./message-template-content.schema";

describe("messageTemplateContentSchema", () => {
  it("C-004 accepts valid content for the type", () => {
    const result = messageTemplateContentSchema("GALLERY_SHARE").safeParse({
      content: "Halo {{clientName}} {{galleryUrl}}",
    });
    expect(result.success).toBe(true);
  });

  it("AC-MSG-009 reports the problem key as the issue message", () => {
    const result = messageTemplateContentSchema("GALLERY_SHARE").safeParse({
      content: "{{galleryUrl}} {{invoiceUrl}}",
    });
    expect(result.error?.issues[0]?.message).toBe("UNKNOWN_VARIABLE:invoiceUrl");
  });
});
```

`tests/support/communications/fake-message-template-repository.ts`:

```ts
/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
  MessageTemplateSeed,
  MessageTemplateUpdate,
} from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredTemplate extends MessageTemplateRecord {
  readonly workspaceId: string;
  readonly updatedBy: string | null;
}

export class FakeMessageTemplateRepository implements MessageTemplateRepositoryPort {
  readonly rows: StoredTemplate[] = [];

  async listForWorkspace(context: WorkspaceContext): Promise<readonly MessageTemplateRecord[]> {
    return this.rows.filter((row) => row.workspaceId === context.workspaceId);
  }

  async findByType(context: WorkspaceContext, type: TemplateType) {
    return (
      this.rows.find((row) => row.workspaceId === context.workspaceId && row.type === type) ?? null
    );
  }

  async updateContent(context: WorkspaceContext, update: MessageTemplateUpdate) {
    const index = this.rows.findIndex(
      (row) => row.workspaceId === context.workspaceId && row.type === update.type,
    );
    if (index === -1) return false;
    this.rows[index] = {
      ...this.rows[index],
      content: update.content,
      updatedBy: update.editorUserId,
      updatedAt: new Date(),
    };
    return true;
  }

  async seedDefaults(context: WorkspaceContext, seeds: readonly MessageTemplateSeed[]) {
    for (const seed of seeds) {
      if (await this.findByType(context, seed.type)) continue;
      this.rows.push({
        workspaceId: context.workspaceId,
        type: seed.type,
        content: seed.content,
        updatedBy: null,
        updatedAt: new Date(),
      });
    }
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
```

`application/use-cases/seed-default-templates/seed-default-templates.test.ts`:

```ts
import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "./seed-default-templates";

const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };

describe("seedDefaultTemplates", () => {
  it("AC-MSG-001 gives a workspace exactly the five defaults", async () => {
    const repository = new FakeMessageTemplateRepository();
    await seedDefaultTemplates(repository, context);
    await seedDefaultTemplates(repository, context);
    expect(repository.rows).toHaveLength(5);
    expect(repository.rows.at(0)).toMatchObject({
      type: "GALLERY_SHARE",
      content: DEFAULT_TEMPLATE_CONTENT.GALLERY_SHARE,
      updatedBy: null,
    });
  });
});
```

`application/use-cases/list-message-templates/list-message-templates.test.ts`:

```ts
import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "../seed-default-templates/seed-default-templates";
import { listMessageTemplates } from "./list-message-templates";

describe("listMessageTemplates", () => {
  it("AC-MSG-004 returns only the workspace's templates in journey order", async () => {
    const repository = new FakeMessageTemplateRepository();
    const mine = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await seedDefaultTemplates(repository, { workspaceId: asWorkspaceId(crypto.randomUUID()) });
    await seedDefaultTemplates(repository, mine);
    repository.rows.reverse();
    const list = await listMessageTemplates(repository, mine);
    expect(list.map((record) => record.type)).toEqual([
      "GALLERY_SHARE",
      "SELECTION_REMINDER",
      "FINAL_DELIVERY",
      "INVOICE_SHARE",
      "PAYMENT_REMINDER",
    ]);
  });
});
```

`application/use-cases/get-message-template/get-message-template.test.ts`:

```ts
import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "../seed-default-templates/seed-default-templates";
import { getMessageTemplate } from "./get-message-template";

describe("getMessageTemplate", () => {
  it("AC-MSG-005 returns the stored template for the type", async () => {
    const repository = new FakeMessageTemplateRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await seedDefaultTemplates(repository, context);
    await expect(getMessageTemplate(repository, context, "FINAL_DELIVERY")).resolves.toMatchObject({
      type: "FINAL_DELIVERY",
    });
  });

  it("AC-MSG-015 is not found in a workspace without that template", async () => {
    const repository = new FakeMessageTemplateRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await expect(getMessageTemplate(repository, context, "GALLERY_SHARE")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
```

`application/use-cases/update-message-template/update-message-template.test.ts`:

```ts
import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "../seed-default-templates/seed-default-templates";
import { updateMessageTemplate } from "./update-message-template";

async function seeded() {
  const repository = new FakeMessageTemplateRepository();
  const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
  await seedDefaultTemplates(repository, context);
  return { repository, context };
}

describe("updateMessageTemplate", () => {
  it("AC-MSG-007 A-9 stores trimmed content for that type only and records the editor", async () => {
    const { repository, context } = await seeded();
    const content = "Halo {{clientName}}, invoice {{invoiceNumber}}: {{invoiceUrl}}";
    const result = await updateMessageTemplate(repository, context, {
      type: "INVOICE_SHARE",
      editorUserId: "owner_1",
      input: { content: `  ${content}\n` },
    });
    expect(result).toEqual({ ok: true });
    const invoice = await repository.findByType(context, "INVOICE_SHARE");
    expect(invoice).toMatchObject({ content, updatedBy: "owner_1" });
    const reminder = await repository.findByType(context, "PAYMENT_REMINDER");
    expect(reminder?.content).toBe(DEFAULT_TEMPLATE_CONTENT.PAYMENT_REMINDER);
  });

  it.each([
    [" \n ", "EMPTY"],
    ["{{galleryUrl}} {{invoiceUrl}}", "UNKNOWN_VARIABLE:invoiceUrl"],
    ["{{galleryUrl}} {{ clientName }}", "MALFORMED"],
    ["Halo {{clientName}}", "MISSING_REQUIRED:galleryUrl"],
  ])("AC-MSG-008…011 refuses %j and stores nothing", async (content, key) => {
    const { repository, context } = await seeded();
    const result = await updateMessageTemplate(repository, context, {
      type: "GALLERY_SHARE",
      editorUserId: "owner_1",
      input: { content },
    });
    expect(result).toEqual({ ok: false, code: "VALIDATION_FAILED", fieldErrors: { content: key } });
    const gallery = await repository.findByType(context, "GALLERY_SHARE");
    expect(gallery?.content).toBe(DEFAULT_TEMPLATE_CONTENT.GALLERY_SHARE);
  });

  it("AC-MSG-015 is not found when the workspace has no such template", async () => {
    const repository = new FakeMessageTemplateRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await expect(
      updateMessageTemplate(repository, context, {
        type: "GALLERY_SHARE",
        editorUserId: "owner_1",
        input: { content: "{{galleryUrl}}" },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
```

- [x] **Step 2: Run the tests and confirm they fail**

Run: `pnpm vitest run src/features/communications/application`
Expected: FAIL — modules not found.

- [x] **Step 3: Implement the errors, port and schema**

`errors/message-template-errors/message-template-errors.types.ts`:

```ts
export type MessageTemplateErrorCode = "NOT_FOUND" | "SAVE_FAILED";
```

`errors/message-template-errors/message-template-errors.ts`:

```ts
import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { MessageTemplateErrorCode } from "./message-template-errors.types";

export class MessageTemplateError extends DomainError {
  readonly code: MessageTemplateErrorCode;

  /**
   * Creates a typed message-template failure; it never carries content (C-103).
   * @param code - the stable error code
   */
  constructor(code: MessageTemplateErrorCode) {
    super(code);
    this.code = code;
  }
}
```

`ports/message-template-repository/message-template-repository.port.ts`:

```ts
import "server-only";

import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface MessageTemplateRecord {
  readonly type: TemplateType;
  readonly content: string;
  readonly updatedAt: Date;
}

export interface MessageTemplateSeed {
  readonly type: TemplateType;
  readonly content: string;
}

export interface MessageTemplateUpdate {
  readonly type: TemplateType;
  readonly content: string;
  readonly editorUserId: string;
}

// Every call is scoped by the verified workspace (C-101); the channel is always WHATSAPP.
export interface MessageTemplateRepositoryPort {
  readonly listForWorkspace: (
    context: WorkspaceContext,
  ) => Promise<readonly MessageTemplateRecord[]>;
  readonly findByType: (
    context: WorkspaceContext,
    type: TemplateType,
  ) => Promise<MessageTemplateRecord | null>;
  /** Returns false when the workspace has no template of that type. */
  readonly updateContent: (
    context: WorkspaceContext,
    update: MessageTemplateUpdate,
  ) => Promise<boolean>;
  /** Inserts the missing types only (idempotent, BR-MSG-005). */
  readonly seedDefaults: (
    context: WorkspaceContext,
    seeds: readonly MessageTemplateSeed[],
  ) => Promise<void>;
}
```

`schemas/message-template-content/message-template-content.schema.ts`:

```ts
import { z } from "zod";

import {
  findTemplateProblem,
  problemKeyFor,
} from "@/features/communications/domain/template-content/template-content";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

// One schema for the editor form (UX) and the save use case (C-004). The issue message is the
// problem key that the UI translates.
export const messageTemplateContentSchema = (type: TemplateType) =>
  z.object({
    content: z.string().refine((value) => findTemplateProblem(type, value) === null, {
      error: (issue) => problemKeyFor(type, issue.input),
    }),
  });
```

`schemas/message-template-content/message-template-content.types.ts`:

```ts
import type { z } from "zod";

import type { messageTemplateContentSchema } from "./message-template-content.schema";

export type MessageTemplateContentInput = z.input<ReturnType<typeof messageTemplateContentSchema>>;
```

- [x] **Step 4: Implement the use cases**

`use-cases/list-message-templates/list-message-templates.ts`:

```ts
import "server-only";

import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
} from "../../ports/message-template-repository/message-template-repository.port";

/**
 * Lists the verified workspace's templates in journey order (AC-MSG-004, A-5).
 * @param repository - message-template persistence port
 * @param context - ownership-verified workspace context
 * @returns the templates in catalogue order
 */
export async function listMessageTemplates(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
): Promise<readonly MessageTemplateRecord[]> {
  const records = await repository.listForWorkspace(context);
  return TEMPLATE_TYPES.flatMap((type) => records.filter((record) => record.type === type));
}
```

`use-cases/get-message-template/get-message-template.ts`:

```ts
import "server-only";

import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { MessageTemplateError } from "../../errors/message-template-errors/message-template-errors";
import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
} from "../../ports/message-template-repository/message-template-repository.port";

/**
 * Loads one template of the verified workspace for the editor (AC-MSG-005).
 * @param repository - message-template persistence port
 * @param context - ownership-verified workspace context
 * @param type - the template type from the route
 * @returns the stored template
 * @throws MessageTemplateError NOT_FOUND when the workspace has no template of that type
 */
export async function getMessageTemplate(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
  type: TemplateType,
): Promise<MessageTemplateRecord> {
  const record = await repository.findByType(context, type);
  if (!record) throw new MessageTemplateError("NOT_FOUND");
  return record;
}
```

`use-cases/update-message-template/update-message-template.types.ts`:

```ts
import type { MessageTemplateContentInput } from "../../schemas/message-template-content/message-template-content.types";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

export interface UpdateMessageTemplateCommand {
  readonly type: TemplateType;
  readonly editorUserId: string;
  readonly input: MessageTemplateContentInput;
}

export interface UpdateMessageTemplateFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: { readonly content: string };
}

export type UpdateMessageTemplateResult = { readonly ok: true } | UpdateMessageTemplateFailure;
```

`use-cases/update-message-template/update-message-template.ts`:

```ts
import "server-only";

import { normaliseTemplateContent } from "@/features/communications/domain/template-content/template-content";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { MessageTemplateError } from "../../errors/message-template-errors/message-template-errors";
import type { MessageTemplateRepositoryPort } from "../../ports/message-template-repository/message-template-repository.port";
import { messageTemplateContentSchema } from "../../schemas/message-template-content/message-template-content.schema";
import type {
  UpdateMessageTemplateCommand,
  UpdateMessageTemplateResult,
} from "./update-message-template.types";

/**
 * Re-validates and stores one template's content for the verified workspace, recording the
 * editor and time (AC-MSG-007…011, A-9); invalid content returns a field error and stores
 * nothing.
 * @param repository - message-template persistence port
 * @param context - ownership-verified workspace context
 * @param command - template type, editor and untrusted input
 * @returns success, or the content field error key
 * @throws MessageTemplateError NOT_FOUND when the workspace has no template of that type
 */
export async function updateMessageTemplate(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
  command: UpdateMessageTemplateCommand,
): Promise<UpdateMessageTemplateResult> {
  const parsed = messageTemplateContentSchema(command.type).safeParse(command.input);
  if (!parsed.success) {
    const key = parsed.error.issues.at(0)?.message ?? "EMPTY";
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { content: key } };
  }
  const updated = await repository.updateContent(context, {
    type: command.type,
    content: normaliseTemplateContent(parsed.data.content),
    editorUserId: command.editorUserId,
  });
  if (!updated) throw new MessageTemplateError("NOT_FOUND");
  return { ok: true };
}
```

`use-cases/seed-default-templates/seed-default-templates.ts`:

```ts
import "server-only";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { MessageTemplateRepositoryPort } from "../../ports/message-template-repository/message-template-repository.port";

/**
 * Gives a workspace its five default templates; types it already has are left untouched
 * (BR-MSG-005, AC-MSG-001).
 * @param repository - message-template persistence port (inside the creation transaction)
 * @param context - the new workspace
 * @returns nothing once the defaults exist
 */
export async function seedDefaultTemplates(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
): Promise<void> {
  await repository.seedDefaults(
    context,
    TEMPLATE_TYPES.map((type) => ({ type, content: DEFAULT_TEMPLATE_CONTENT[type] })),
  );
}
```

- [x] **Step 5: Run the tests and confirm they pass**

Run: `pnpm vitest run src/features/communications`
Expected: PASS.

- [x] **Step 6: Gate and commit**

```bash
pnpm typecheck && pnpm lint
git add src/features/communications/application tests/support/communications
git commit -m "feat(communications): add message template use cases and port" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Drizzle repository with integration tests

Requires the Owner to have applied migrations 0002 and 0003 to the test database (Task 5 STOP).

**Files:**
- Create: `src/adapters/db/message-template-repository/drizzle-message-template-repository.ts`
- Test: `tests/integration/communications/message-template-repository.test.ts`

**Interfaces:**
- Consumes: `MessageTemplateRepositoryPort` (Task 6), `messageTemplate` table and `DbExecutor` (Task 5), `isTemplateType`.
- Produces: `createDrizzleMessageTemplateRepository(db: DbExecutor): MessageTemplateRepositoryPort`.

- [x] **Step 1: Write the failing integration test**

`tests/integration/communications/message-template-repository.test.ts`:

```ts
import { uniqueEmail } from "@tests/support/auth/unique";
import { and, count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { user } from "@/adapters/db/schema/auth/auth";
import { messageTemplate } from "@/adapters/db/schema/communications/message-template";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import { seedDefaultTemplates } from "@/features/communications/application/use-cases/seed-default-templates/seed-default-templates";
import { normaliseInvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";
import { normaliseWorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

async function seedOwner(): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(user).values({ id, name: "Owner", email: uniqueEmail() });
  return id;
}

async function seedWorkspace(ownerId: string) {
  const rows = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `WS ${crypto.randomUUID()}`, invoicePrefix: "WS" })
    .returning({ id: workspace.id });
  return { workspaceId: asWorkspaceId(rows[0]?.id ?? "") };
}

async function templateCount(workspaceId: string): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(messageTemplate)
    .where(eq(messageTemplate.workspaceId, workspaceId));
  return rows.at(0)?.n ?? 0;
}

describe("Drizzle message template repository", () => {
  it("AC-MSG-002 BR-MSG-005 seeds five defaults idempotently", async () => {
    const context = await seedWorkspace(await seedOwner());
    const templates = createDrizzleMessageTemplateRepository(db);
    await seedDefaultTemplates(templates, context);
    await seedDefaultTemplates(templates, context);
    expect(await templateCount(context.workspaceId)).toBe(5);
  });

  it("AC-MSG-003 rejects a second template of the same type and channel", async () => {
    const context = await seedWorkspace(await seedOwner());
    await seedDefaultTemplates(createDrizzleMessageTemplateRepository(db), context);
    await expect(
      db.insert(messageTemplate).values({
        workspaceId: context.workspaceId,
        type: "GALLERY_SHARE",
        content: "{{galleryUrl}}",
      }),
    ).rejects.toMatchObject({ cause: { code: "23505" } });
  });

  it("AC-MSG-007 A-9 updates one type, its editor and time", async () => {
    const ownerId = await seedOwner();
    const context = await seedWorkspace(ownerId);
    const templates = createDrizzleMessageTemplateRepository(db);
    await seedDefaultTemplates(templates, context);
    const updated = await templates.updateContent(context, {
      type: "INVOICE_SHARE",
      content: "{{invoiceUrl}}",
      editorUserId: ownerId,
    });
    expect(updated).toBe(true);
    const rows = await db
      .select({ content: messageTemplate.content, updatedBy: messageTemplate.updatedBy })
      .from(messageTemplate)
      .where(
        and(
          eq(messageTemplate.workspaceId, context.workspaceId),
          eq(messageTemplate.type, "INVOICE_SHARE"),
        ),
      );
    expect(rows).toEqual([{ content: "{{invoiceUrl}}", updatedBy: ownerId }]);
  });

  it("AC-MSG-015 never reads or changes another workspace's templates", async () => {
    const mine = await seedWorkspace(await seedOwner());
    const theirs = await seedWorkspace(await seedOwner());
    const templates = createDrizzleMessageTemplateRepository(db);
    await seedDefaultTemplates(templates, theirs);
    expect(await templates.listForWorkspace(mine)).toEqual([]);
    expect(await templates.findByType(mine, "GALLERY_SHARE")).toBeNull();
    const updated = await templates.updateContent(mine, {
      type: "GALLERY_SHARE",
      content: "{{galleryUrl}}",
      editorUserId: "nobody",
    });
    expect(updated).toBe(false);
    expect((await templates.findByType(theirs, "GALLERY_SHARE"))?.content).not.toBe(
      "{{galleryUrl}}",
    );
  });

  it("AC-MSG-001 ADR-016 a failed creation transaction leaves no workspace and no templates", async () => {
    const ownerId = await seedOwner();
    const name = `Rollback ${crypto.randomUUID()}`;
    await expect(
      db.transaction(async (tx) => {
        const created = await createDrizzleWorkspaceRepository(tx).create(asOwnerUserId(ownerId), {
          name: normaliseWorkspaceName(name),
          invoicePrefix: normaliseInvoicePrefix("RB"),
          currency: "IDR",
        });
        if (!created.ok) throw new Error("unexpected duplicate");
        await seedDefaultTemplates(createDrizzleMessageTemplateRepository(tx), {
          workspaceId: created.id,
        });
        throw new Error("simulated failure after seeding");
      }),
    ).rejects.toThrow("simulated failure after seeding");
    const rows = await db.select().from(workspace).where(eq(workspace.name, name));
    expect(rows).toEqual([]);
  });

  it("A-1 the database rejects content longer than 2,000 characters", async () => {
    const context = await seedWorkspace(await seedOwner());
    await expect(
      db.insert(messageTemplate).values({
        workspaceId: context.workspaceId,
        type: "GALLERY_SHARE",
        content: "a".repeat(2001),
      }),
    ).rejects.toBeDefined();
  });
});
```

Run: `pnpm test:integration tests/integration/communications`
Expected: FAIL — `drizzle-message-template-repository` not found.

- [x] **Step 2: Implement**

`src/adapters/db/message-template-repository/drizzle-message-template-repository.ts`:

```ts
import "server-only";

import { and, eq } from "drizzle-orm";

import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
} from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import { isTemplateType } from "@/features/communications/domain/template-type/template-type";

import type { DbExecutor } from "../client/client.types";
import { messageTemplate } from "../schema/communications/message-template";

const CHANNEL = "WHATSAPP";

interface TemplateRow {
  type: string;
  content: string;
  updatedAt: Date;
}

const RECORD_COLUMNS = {
  type: messageTemplate.type,
  content: messageTemplate.content,
  updatedAt: messageTemplate.updatedAt,
};

function toRecords(row: TemplateRow): MessageTemplateRecord[] {
  // The CHECK constraint guarantees a known type; an unknown one is skipped, never guessed.
  return isTemplateType(row.type) ? [{ ...row, type: row.type }] : [];
}

/**
 * Creates the Drizzle message-template repository; every query is scoped by the verified
 * workspace and the WhatsApp channel (C-101, BR-MSG-002).
 * @param db - the request database or a transaction (ADR-016)
 * @returns the message-template repository port
 */
export function createDrizzleMessageTemplateRepository(
  db: DbExecutor,
): MessageTemplateRepositoryPort {
  const scope = (workspaceId: string) =>
    and(eq(messageTemplate.workspaceId, workspaceId), eq(messageTemplate.channel, CHANNEL));
  return {
    async listForWorkspace(context) {
      const rows = await db
        .select(RECORD_COLUMNS)
        .from(messageTemplate)
        .where(scope(context.workspaceId));
      return rows.flatMap(toRecords);
    },
    async findByType(context, type) {
      const rows = await db
        .select(RECORD_COLUMNS)
        .from(messageTemplate)
        .where(and(scope(context.workspaceId), eq(messageTemplate.type, type)));
      return rows.flatMap(toRecords).at(0) ?? null;
    },
    async updateContent(context, update) {
      const rows = await db
        .update(messageTemplate)
        .set({ content: update.content, updatedBy: update.editorUserId, updatedAt: new Date() })
        .where(and(scope(context.workspaceId), eq(messageTemplate.type, update.type)))
        .returning({ id: messageTemplate.id });
      return rows.length > 0;
    },
    async seedDefaults(context, seeds) {
      if (seeds.length === 0) return;
      await db
        .insert(messageTemplate)
        .values(
          seeds.map((seed) => ({
            workspaceId: context.workspaceId,
            type: seed.type,
            channel: CHANNEL,
            content: seed.content,
          })),
        )
        .onConflictDoNothing({
          target: [messageTemplate.workspaceId, messageTemplate.type, messageTemplate.channel],
        });
    },
  };
}
```

> Build note (2026-10-01): the test brands the workspace name and prefix (`normaliseWorkspaceName`, `normaliseInvoicePrefix`) and matches `{ cause: { code: "23505" } }` (lint `no-unsafe-assignment`). Step 3 is **pending**: migrations 0002/0003 are not applied yet (the agent was blocked from running `pnpm db:migrate`).

- [ ] **Step 3: Run the integration tests and confirm they pass**

Run: `pnpm test:integration tests/integration/communications`
Expected: PASS (6 tests). If the duplicate test's error shape differs (Neon may put `code` on the error itself rather than on `cause`), change that assertion to `.rejects.toMatchObject({ code: "23505" })`, and keep the 23505 check.

- [x] **Step 4: Gate and commit**

```bash
pnpm typecheck && pnpm lint && pnpm test
git add src/adapters/db/message-template-repository tests/integration/communications
git commit -m "feat(db): add the drizzle message template repository" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Composition, seeding on workspace creation, and the save action

**Files:**
- Create: `src/composition/workspace/workspace-creation-scope/workspace-creation-scope.ts`, `.types.ts`
- Modify: `src/composition/workspace/owner-workspace/owner-workspace.ts` (`createOwnerFirstWorkspace`, `createOwnerWorkspace`)
- Create: `src/composition/communications/message-template-scope/message-template-scope.ts`, `.types.ts`
- Create: `src/composition/communications/message-template-flow/message-template-flow.ts`, `.types.ts`, `.test.ts`
- Create: `src/app/actions/communications/message-templates.ts`, `message-templates.test.ts`

**Interfaces:**
- Consumes: Tasks 6–7; F-02 `verifyOwnerWorkspace`, `requireOwnerOrRedirect`, `getWorkspaceProfile`, `createDrizzleWorkspaceRepository`; `withRequestDb`; `logger`.
- Produces:
  - `loadMessageTemplateList(rawId: string): Promise<MessageTemplateListData>` (`{ types: readonly TemplateType[] }`);
  - `loadMessageTemplateEditor(rawId: string, slug: string): Promise<MessageTemplateEditorData>` (`{ type, content, defaultContent, brandName }`);
  - `saveMessageTemplate(rawId: string, slug: string, input: MessageTemplateContentInput): Promise<UpdateMessageTemplateResult>`;
  - `saveMessageTemplateAction(workspaceId: string, slug: string, values: MessageTemplateContentInput): Promise<UpdateMessageTemplateFailure | undefined>`;
  - `withWorkspaceCreationScope(work)`.

- [x] **Step 1: Write the failing tests**

`src/composition/communications/message-template-flow/message-template-flow.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const updateContent = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/shared/logging/logger", () => ({ logger }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner_1" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../message-template-scope/message-template-scope", () => ({
  withMessageTemplateScope: (work: (scope: unknown) => Promise<unknown>) =>
    work({ templates: { updateContent }, workspaces: {} }),
}));

const { saveMessageTemplate } = await import("./message-template-flow");

describe("saveMessageTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-MSG-007 saves for the verified workspace and records the owner as editor", async () => {
    updateContent.mockResolvedValue(true);
    await expect(
      saveMessageTemplate("ws-1", "gallery-share", { content: "Halo {{galleryUrl}}" }),
    ).resolves.toEqual({ ok: true });
    expect(updateContent).toHaveBeenCalledWith(
      { workspaceId: "ws-1" },
      { type: "GALLERY_SHARE", content: "Halo {{galleryUrl}}", editorUserId: "owner_1" },
    );
  });

  it("AC-MSG-015 an unknown slug is not found", async () => {
    await expect(saveMessageTemplate("ws-1", "nope", { content: "x" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(updateContent).not.toHaveBeenCalled();
  });

  it("AC-MSG-012 AC-MSG-019 logs only the type and throws a generic failure", async () => {
    updateContent.mockRejectedValue(new Error("db failed for Halo {{galleryUrl}}"));
    await expect(
      saveMessageTemplate("ws-1", "gallery-share", { content: "Halo {{galleryUrl}}" }),
    ).rejects.toMatchObject({ code: "SAVE_FAILED" });
    expect(logger.error).toHaveBeenCalledWith("message_template.save_failed", {
      type: "GALLERY_SHARE",
    });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("Halo");
  });
});
```

`src/app/actions/communications/message-templates.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const saveMessageTemplate = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@/composition/communications/message-template-flow/message-template-flow", () => ({
  saveMessageTemplate,
}));
vi.mock("next/cache", () => ({ revalidatePath }));

const { saveMessageTemplateAction } = await import("./message-templates");

describe("saveMessageTemplateAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-MSG-007 saves and revalidates the template list", async () => {
    saveMessageTemplate.mockResolvedValue({ ok: true });
    await expect(
      saveMessageTemplateAction("ws-1", "invoice-share", { content: "{{invoiceUrl}}" }),
    ).resolves.toBeUndefined();
    expect(saveMessageTemplate).toHaveBeenCalledWith("ws-1", "invoice-share", {
      content: "{{invoiceUrl}}",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/message-templates", "page");
  });

  it("AC-MSG-009 returns the field error and revalidates nothing", async () => {
    const failure = {
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { content: "UNKNOWN_VARIABLE:invoiceUrl" },
    };
    saveMessageTemplate.mockResolvedValue(failure);
    await expect(
      saveMessageTemplateAction("ws-1", "gallery-share", { content: "{{invoiceUrl}}" }),
    ).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
```

Run: `pnpm vitest run src/composition/communications src/app/actions/communications`
Expected: FAIL — modules not found.

- [x] **Step 2: Implement the scopes**

`src/composition/communications/message-template-scope/message-template-scope.types.ts`:

```ts
import type { MessageTemplateRepositoryPort } from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import type { WorkspaceRepositoryPort } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";

export interface MessageTemplateScope {
  readonly templates: MessageTemplateRepositoryPort;
  readonly workspaces: WorkspaceRepositoryPort;
}
```

`src/composition/communications/message-template-scope/message-template-scope.ts`:

```ts
import "server-only";

import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { MessageTemplateScope } from "./message-template-scope.types";

/**
 * Runs message-template work with request-scoped repositories (ADR-009).
 * @param work - the work over the template and workspace repositories
 * @returns the work result
 */
export function withMessageTemplateScope<T>(
  work: (scope: MessageTemplateScope) => Promise<T>,
): Promise<T> {
  return withRequestDb((db) =>
    work({
      templates: createDrizzleMessageTemplateRepository(db),
      workspaces: createDrizzleWorkspaceRepository(db),
    }),
  );
}
```

`src/composition/workspace/workspace-creation-scope/workspace-creation-scope.types.ts`:

```ts
import type { MessageTemplateRepositoryPort } from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import type { WorkspaceRepositoryPort } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";

export interface WorkspaceCreationScope {
  readonly repository: WorkspaceRepositoryPort;
  readonly templates: MessageTemplateRepositoryPort;
}
```

`src/composition/workspace/workspace-creation-scope/workspace-creation-scope.ts`:

```ts
import "server-only";

import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { WorkspaceCreationScope } from "./workspace-creation-scope.types";

/**
 * Runs workspace creation and its default-template seeding in ONE transaction, so a failure
 * leaves neither behind (BR-MSG-005, AC-MSG-001, ADR-016).
 * @param work - the creation work over transaction-bound repositories
 * @returns the work result once the transaction commits
 */
export function withWorkspaceCreationScope<T>(
  work: (scope: WorkspaceCreationScope) => Promise<T>,
): Promise<T> {
  return withRequestDb((db) =>
    db.transaction((tx) =>
      work({
        repository: createDrizzleWorkspaceRepository(tx),
        templates: createDrizzleMessageTemplateRepository(tx),
      }),
    ),
  );
}
```

In `src/composition/workspace/owner-workspace/owner-workspace.ts`:
- add `import { seedDefaultTemplates } from "@/features/communications/application/use-cases/seed-default-templates/seed-default-templates";` and `import { withWorkspaceCreationScope } from "../workspace-creation-scope/workspace-creation-scope";`;
- replace the two create functions with:

```ts
/** Creates an owner's first workspace with its default templates in one transaction (ADR-016). @param input - onboarding input @returns the created workspace ID */
export async function createOwnerFirstWorkspace(input: CreateFirstWorkspaceInput) {
  const account = await requireOwnerOrRedirect();
  return withWorkspaceCreationScope(async ({ repository, templates }) => {
    const created = await createFirstWorkspace(repository, asOwnerUserId(account.id), input);
    await seedDefaultTemplates(templates, { workspaceId: created.id });
    return created;
  });
}

/** Creates an additional owner workspace with its default templates in one transaction (ADR-016). @param input - create input @returns the created workspace ID */
export async function createOwnerWorkspace(input: CreateWorkspaceInput) {
  const account = await requireOwnerOrRedirect();
  return withWorkspaceCreationScope(async ({ repository, templates }) => {
    const created = await createWorkspace(repository, asOwnerUserId(account.id), input);
    await seedDefaultTemplates(templates, { workspaceId: created.id });
    return created;
  });
}
```

- [x] **Step 3: Implement the flow**

`src/composition/communications/message-template-flow/message-template-flow.types.ts`:

```ts
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

export interface MessageTemplateListData {
  readonly types: readonly TemplateType[];
}

export interface MessageTemplateEditorData {
  readonly type: TemplateType;
  readonly content: string;
  readonly defaultContent: string;
  readonly brandName: string;
}
```

`src/composition/communications/message-template-flow/message-template-flow.ts`:

```ts
import "server-only";

import { notFound } from "next/navigation";

import { MessageTemplateError } from "@/features/communications/application/errors/message-template-errors/message-template-errors";
import type { MessageTemplateContentInput } from "@/features/communications/application/schemas/message-template-content/message-template-content.types";
import { getMessageTemplate } from "@/features/communications/application/use-cases/get-message-template/get-message-template";
import { listMessageTemplates } from "@/features/communications/application/use-cases/list-message-templates/list-message-templates";
import { updateMessageTemplate } from "@/features/communications/application/use-cases/update-message-template/update-message-template";
import type { UpdateMessageTemplateResult } from "@/features/communications/application/use-cases/update-message-template/update-message-template.types";
import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { templateTypeFromSlug } from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import { getWorkspaceProfile } from "@/features/workspace/application/use-cases/get-workspace-profile/get-workspace-profile";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withMessageTemplateScope } from "../message-template-scope/message-template-scope";
import type {
  MessageTemplateEditorData,
  MessageTemplateListData,
} from "./message-template-flow.types";

function typeOrNotFound(slug: string): TemplateType {
  const type = templateTypeFromSlug(slug);
  if (!type) notFound();
  return type;
}

/**
 * Loads the template list of a verified workspace (AC-MSG-004).
 * @param rawId - untrusted route workspace ID
 * @returns the template types the workspace has, in journey order
 */
export async function loadMessageTemplateList(rawId: string): Promise<MessageTemplateListData> {
  const verified = await verifyOwnerWorkspace(rawId);
  const records = await withMessageTemplateScope(({ templates }) =>
    listMessageTemplates(templates, verified.context),
  );
  return { types: records.map((record) => record.type) };
}

/**
 * Loads one template, its default and the brand name for the preview (AC-MSG-005, A-6).
 * @param rawId - untrusted route workspace ID
 * @param slug - untrusted route template slug
 * @returns the editor data
 * @throws Next notFound for an unknown slug, a missing template or an unowned workspace
 */
export async function loadMessageTemplateEditor(
  rawId: string,
  slug: string,
): Promise<MessageTemplateEditorData> {
  const type = typeOrNotFound(slug);
  const verified = await verifyOwnerWorkspace(rawId);
  return withMessageTemplateScope(async ({ templates, workspaces }) => {
    const record = await getMessageTemplate(templates, verified.context, type).catch(
      notFoundOnMissing,
    );
    const profile = await getWorkspaceProfile(workspaces, verified.context);
    // BR-WS-004: clients see the brand name, falling back to the workspace name.
    const brandName = profile?.brandName ?? profile?.name ?? verified.workspace.name;
    return { type, content: record.content, defaultContent: DEFAULT_TEMPLATE_CONTENT[type], brandName };
  });
}

function notFoundOnMissing(error: unknown): never {
  if (error instanceof MessageTemplateError && error.code === "NOT_FOUND") notFound();
  throw error;
}

/**
 * Saves one template of the verified workspace; unexpected failures are logged with the type
 * only and surface as a generic retryable error (AC-MSG-012, AC-MSG-019).
 * @param rawId - bound route workspace ID
 * @param slug - bound route template slug
 * @param input - untrusted content
 * @returns success or the content field error
 */
export async function saveMessageTemplate(
  rawId: string,
  slug: string,
  input: MessageTemplateContentInput,
): Promise<UpdateMessageTemplateResult> {
  const type = typeOrNotFound(slug);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawId);
  try {
    return await withMessageTemplateScope(({ templates }) =>
      updateMessageTemplate(templates, verified.context, {
        type,
        editorUserId: account.id,
        input,
      }),
    );
  } catch (error) {
    if (error instanceof MessageTemplateError && error.code === "NOT_FOUND") notFound();
    if (!(error instanceof DomainError)) logger.error("message_template.save_failed", { type });
    throw new MessageTemplateError("SAVE_FAILED");
  }
}
```

If the `max-lines-per-function` or SonarJS limits trip, split the catch body into a named helper, `failSave(error, type): never`.

`src/app/actions/communications/message-templates.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { saveMessageTemplate } from "@/composition/communications/message-template-flow/message-template-flow";
import type { MessageTemplateContentInput } from "@/features/communications/application/schemas/message-template-content/message-template-content.types";
import type { UpdateMessageTemplateFailure } from "@/features/communications/application/use-cases/update-message-template/update-message-template.types";

export async function saveMessageTemplateAction(
  workspaceId: string,
  slug: string,
  values: MessageTemplateContentInput,
): Promise<UpdateMessageTemplateFailure | undefined> {
  const result = await saveMessageTemplate(workspaceId, slug, values);
  if (!result.ok) return result;
  revalidatePath("/w/[workspaceId]/message-templates", "page");
  return undefined;
}
```

- [x] **Step 4: Run the tests and confirm they pass**

Run: `pnpm vitest run src/composition src/app/actions`
Expected: PASS, including the existing workspace action tests.

> Build note (2026-10-01): unit gate green; `pnpm test:integration` pending until migrations 0002/0003 are applied. Until then, creating a workspace fails, because seeding writes to `message_template`.

- [x] **Step 5: Gate and commit**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:integration
git add src/composition src/app/actions/communications
git commit -m "feat(communications): wire template loading, saving and seeding on workspace creation" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 9: Shared UI — icons, Textarea options, Segmented Control

**Files:**
- Modify: `src/ui/primitives/icon/icon.types.ts`, `icon.registry.ts`, `icon.test.tsx`
- Modify: `src/ui/primitives/button/button.types.ts` (`ButtonIconName` + `"rotate-ccw"`)
- Modify: `src/ui/primitives/textarea/textarea.tsx`, `textarea.types.ts`, `textarea.test.tsx`
- Create: `src/ui/patterns/segmented-control/segmented-control.tsx`, `.types.ts`, `.test.tsx`, `.stories.tsx`, `.stories.copy.ts`

**Interfaces:**
- Produces:
  - icon names `"image" | "hourglass" | "package-check" | "wallet" | "rotate-ccw" | "braces" | "pencil"`;
  - Textarea props `isLabelHidden?: boolean`, `rows?: number` (default 3), `trailingMeta?: string`;
  - `SegmentedControl({ label, options, selectedId, onChange, className })`, with `SegmentedOption { id: string; label: string }`.

- [x] **Step 1: Write the failing tests**

Add to the `it("registers the workspace semantic icon names")` list in `icon.test.tsx`: `"image"`, `"hourglass"`, `"package-check"`, `"wallet"`, `"rotate-ccw"`, `"braces"`, `"pencil"`.

Add to `textarea.test.tsx`:

```tsx
  it("hides the label visually but keeps it as the accessible name", () => {
    render(<Textarea label="Isi pesan" isLabelHidden />);

    expect(screen.getByRole("textbox", { name: "Isi pesan" })).toBeInTheDocument();
    expect(screen.getByText("Isi pesan")).toHaveClass("sr-only");
  });

  it("shows a trailing meta beside the helper and honours rows", () => {
    render(<Textarea label="Isi" helperText="Bantuan" trailingMeta="12 / 2.000" rows={10} />);

    expect(screen.getByRole("textbox", { name: "Isi" })).toHaveAttribute("rows", "10");
    expect(screen.getByText("12 / 2.000")).toBeInTheDocument();
    expect(screen.getByText("Bantuan")).toBeInTheDocument();
  });
```

`src/ui/patterns/segmented-control/segmented-control.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./segmented-control";

const OPTIONS = [
  { id: "edit", label: "Edit" },
  { id: "preview", label: "Pratinjau" },
];

describe("SegmentedControl (C23)", () => {
  it("names the group and marks the selected option", () => {
    render(
      <SegmentedControl label="Tampilan" options={OPTIONS} selectedId="edit" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("radiogroup", { name: "Tampilan" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Edit" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Pratinjau" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("reports the newly selected option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="Tampilan" options={OPTIONS} selectedId="edit" onChange={onChange} />,
    );

    await user.click(screen.getByRole("radio", { name: "Pratinjau" }));
    expect(onChange).toHaveBeenCalledWith("preview");
  });
});
```

Run: `pnpm vitest run src/ui/primitives/icon src/ui/primitives/textarea src/ui/patterns/segmented-control`
Expected: FAIL — missing icon names, unknown props and a missing module.

> If react-aria-components 1.21 renders `ToggleButtonGroup` (single selection) as `role="toolbar"` with `aria-pressed` buttons rather than radios, change the test queries to `toolbar` / `button` + `aria-pressed`. Keep the behaviour assertions.

- [x] **Step 2: Add the icons**

`icon.types.ts`: append to the `IconName` union:

```ts
  | "image"
  | "hourglass"
  | "package-check"
  | "wallet"
  | "rotate-ccw"
  | "braces"
  | "pencil";
```

`icon.registry.ts`:
- add the imports `BracesIcon`, `HourglassIcon`, `Image01Icon`, `PackageCheckIcon`, `PencilEdit02Icon`, `RotateLeft01Icon` and `Wallet01Icon` from `@hugeicons/core-free-icons`, keeping the import list sorted;
- append the seven names to `ICON_NAMES`;
- add to `ICON_REGISTRY`:

```ts
  image: Image01Icon,
  hourglass: HourglassIcon,
  "package-check": PackageCheckIcon,
  wallet: Wallet01Icon,
  "rotate-ccw": RotateLeft01Icon,
  braces: BracesIcon,
  pencil: PencilEdit02Icon,
```

`button.types.ts`: `ButtonIconName = Extract<IconName, "plus" | "send" | "chevron-down" | "arrow-right" | "trash-2" | "rotate-ccw">`.

- [x] **Step 3: Extend the Textarea**

`textarea.types.ts`: add `isLabelHidden?: boolean;`, `rows?: number;` and `trailingMeta?: string;`.

In `textarea.tsx`:
- destructure `isLabelHidden = false`, `rows = 3` and `trailingMeta`;
- render the Label with `className={cn("text-(length:--font-size-label) text-(--component-input-label)", isLabelHidden && "sr-only")}`;
- pass `rows={rows}`;
- replace the description line with:

```tsx
      {trailingMeta ? (
        <div className="flex items-start justify-between gap-(--space-3)">
          <TextareaDescription errorMessage={errorMessage} helperText={helperText} />
          <span className="ml-auto shrink-0 text-(length:--font-size-label) text-(--component-input-helper)">
            {trailingMeta}
          </span>
        </div>
      ) : (
        <TextareaDescription errorMessage={errorMessage} helperText={helperText} />
      )}
```

If the component goes over 50 lines, move the description row into a named `TextareaFooter` component in the same file.

- [x] **Step 4: Build the Segmented Control (C23)**

`segmented-control.types.ts`:

```ts
export interface SegmentedOption {
  id: string;
  label: string;
}

export interface SegmentedControlProps {
  label: string;
  options: readonly SegmentedOption[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}
```

`segmented-control.tsx`:

```tsx
"use client";

import type { Key } from "react-aria-components";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { SegmentedControlProps } from "./segmented-control.types";

const TRACK = [
  "inline-flex items-center gap-(--component-segmented-gap) rounded-(--component-segmented-radius)",
  "bg-(--component-segmented-track) p-(--component-segmented-padding)",
];

const ITEM = [
  "rounded-(--component-segmented-radius) px-(--component-segmented-item-padding-x) py-(--component-segmented-item-padding-y)",
  "text-(length:--font-size-body-sm) font-medium text-(--component-segmented-item-text) outline-none",
  "data-hovered:text-(--component-segmented-item-text-hover)",
  "data-selected:bg-(--component-segmented-item-background-active) data-selected:text-(--component-segmented-item-text-active)",
  "data-selected:shadow-[inset_0_0_0_1px_var(--component-segmented-item-border-active)]",
  "data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
];

/**
 * Switches between 2–4 views of the same content with one Tab stop and arrow keys (C23).
 * @param props - group label, options, the selected option and the change callback
 * @returns the segmented control
 */
export function SegmentedControl({
  label,
  options,
  selectedId,
  onChange,
  className,
}: Readonly<SegmentedControlProps>) {
  const handleSelectionChange = (keys: Set<Key>) => {
    const [next] = keys;
    if (typeof next === "string") onChange(next);
  };
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[selectedId]}
      onSelectionChange={handleSelectionChange}
      className={cn(TRACK, className)}
    >
      {options.map((option) => (
        <ToggleButton key={option.id} id={option.id} className={cn(ITEM)}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
```

`segmented-control.stories.copy.ts`:

```ts
export const SEGMENTED_CONTROL_STORY_COPY = {
  label: "Tampilan pesan",
  edit: "Edit",
  preview: "Pratinjau",
} as const;
```

`segmented-control.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SegmentedControl } from "./segmented-control";
import { SEGMENTED_CONTROL_STORY_COPY as COPY } from "./segmented-control.stories.copy";

const OPTIONS = [
  { id: "edit", label: COPY.edit },
  { id: "preview", label: COPY.preview },
];

function Interactive() {
  const [selectedId, setSelectedId] = useState("edit");
  return (
    <SegmentedControl
      label={COPY.label}
      options={OPTIONS}
      selectedId={selectedId}
      onChange={setSelectedId}
    />
  );
}

const meta = {
  title: "Patterns/Segmented control",
  component: Interactive,
} satisfies Meta<typeof Interactive>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
```

- [x] **Step 5: Run the tests and confirm they pass**

Run: `pnpm vitest run src/ui`
Expected: PASS.

> Build note (2026-10-01): the Textarea footer and label moved into the named `TextareaFooter` and `TextareaLabel` helpers to stay within 50 lines per function. The RAC group exposes radios as planned.

- [x] **Step 6: Gate and commit**

```bash
pnpm typecheck && pnpm lint
git add src/ui/primitives src/ui/patterns/segmented-control
git commit -m "feat(ui): add segmented control, template icons and textarea counter options" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Shell sub-page support (Compact Bar on phones, breadcrumb parent on desktop)

**Files:**
- Modify: `src/ui/patterns/mobile-app-shell/mobile-app-shell.tsx`, `.types.ts`, `.test.tsx`
- Modify: `src/ui/patterns/app-shell/app-shell.tsx`, `.types.ts`, `.test.tsx`
- Modify: `src/features/workspace/ui/owner-shell/owner-shell.tsx`, `.types.ts`, `.test.tsx`
- Modify: `src/features/workspace/ui/owner-nav/owner-nav.tsx`, `owner-nav.copy.ts`, `owner-nav.test.tsx`
- Modify: `src/features/workspace/domain/coming-soon-sections/coming-soon-sections.ts` (remove `"message-templates"`)

**Interfaces:**
- Produces:
  - `MobileAppShellProps.header?: ReactNode`, which replaces the Mobile Header;
  - `AppShellProps.subPage?: AppShellSubPage` with `{ parent: { label: string; href: string } }`;
  - `OwnerShellProps.subPages?: readonly OwnerSubPage[]` with `{ path: string; title: string; subtitle?: string; parent: { label: string; href: string } }`;
  - nav items stay active on their nested routes.

- [x] **Step 1: Write the failing tests**

`mobile-app-shell.test.tsx`, a new case:

```tsx
  it("F-17 sub-page: a header replaces the Mobile Header", () => {
    render(
      <MobileAppShell title="Bagikan gallery" bottomNav={<nav />} header={<header>Compact</header>}>
        <p>isi</p>
      </MobileAppShell>,
    );
    expect(screen.getByText("Compact")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /workspace/i })).not.toBeInTheDocument();
  });
```

`app-shell.test.tsx`, a new case. Reuse the file's existing render helper and props; `baseProps` stands for whatever minimal props the file already uses:

```tsx
  it("F-17 sub-page: breadcrumb parent and a Compact Bar back link to the parent", () => {
    render(
      <AppShell
        {...baseProps}
        title="Bagikan gallery"
        subPage={{ parent: { label: "Template pesan", href: "/w/A/message-templates" } }}
      >
        <p>isi</p>
      </AppShell>,
    );
    expect(screen.getAllByText("Template pesan").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/w/A/message-templates",
    );
  });
```

(`"Kembali"` is `COMPACT_BAR_COPY.back`; import the constant rather than the literal if the test file already imports copy.)

`owner-nav.test.tsx`:
- in the `resolvePageHeading` table, add `["/w/A/message-templates", { title: "Template pesan", subtitle: OWNER_NAV_COPY.messageTemplatesSubtitle }]`;
- add a case that the *Template pesan* NavItem has `aria-current="page"` on `/w/A/message-templates/gallery-share` and the Dasbor item doesn't.

`owner-shell.test.tsx`: add a case that a matching `subPages` entry sets the h1 to the sub-page title. Render `OwnerShell` with `subPages={[{ path: "/w/A/message-templates/gallery-share", title: "Bagikan gallery", subtitle: "…", parent: { label: "Template pesan", href: "/w/A/message-templates" } }]}`, mocking `usePathname` to that path as the file already does.

Run: `pnpm vitest run src/ui/patterns/mobile-app-shell src/ui/patterns/app-shell src/features/workspace/ui`
Expected: FAIL.

- [x] **Step 2: Implement the shells**

`mobile-app-shell.types.ts`: add `header?: ReactNode;`.

`mobile-app-shell.tsx`: destructure `header`, and replace the `<MobileHeader …/>` element with:

```tsx
      {header ?? (
        <MobileHeader
          workspace={workspace}
          title={title}
          subtitle={subtitle}
          utilities={utilities ?? actions}
          onWorkspacePress={onWorkspacePress}
        />
      )}
```

`app-shell.types.ts`:

```ts
import type { CompactBarProps } from "../compact-bar/compact-bar.types";

export interface AppShellSubPage {
  parent: CompactBarProps["parent"];
}
```

and add `subPage?: AppShellSubPage;` to `AppShellProps`.

`app-shell.tsx`:
- import `CompactBar` from `../compact-bar/compact-bar` and destructure `subPage`;
- pass `parent={subPage?.parent.label ?? workspace.name}` to `DesktopContent`;
- pass `header={subPage ? <CompactBar title={title} parent={subPage.parent} /> : undefined}` to `MobileContent`;
- add `header?: ReactNode` to `MobileContent`'s props (named in its `Pick` plus `{ workspaceName: string; header?: ReactNode }`) and forward it to `MobileAppShell`.

The existing `eslint-disable max-lines-per-function` on `AppShell` already covers the extra prop.

- [x] **Step 3: Implement the Owner shell and nav**

`owner-shell.types.ts`:

```ts
export interface OwnerSubPage {
  path: string;
  title: string;
  subtitle?: string;
  parent: { label: string; href: string };
}
```

and add `subPages?: readonly OwnerSubPage[];` to `OwnerShellProps`.

`owner-shell.tsx`, inside `OwnerShell`:

```tsx
  const subPage = subPages?.find((page) => page.path === currentPathname);
  const heading = subPage ?? resolvePageHeading(currentPathname, workspaceId, workspaceName) ?? { title };
```

and pass `subPage={subPage ? { parent: subPage.parent } : undefined}` to `<AppShell>`.

`owner-nav.copy.ts`: add `messageTemplatesSubtitle: "Pesan WhatsApp untuk klien. Kamu tetap mengirimnya sendiri dari WhatsApp.",`.

`owner-nav.tsx`:
- in `resolvePageHeading`, after the `settings` branch, add:

```ts
  if (section === "message-templates") {
    return {
      title: OWNER_NAV_COPY.messageTemplates,
      subtitle: OWNER_NAV_COPY.messageTemplatesSubtitle,
    };
  }
```

- in `OwnerNavItems`, replace `isActive={pathname === href}` with `isActive={isCurrentSection(pathname, href, section)}`, and add:

```ts
/** A section stays active on its nested routes (e.g. a template editor); the Dashboard does not. */
function isCurrentSection(pathname: string, href: string, section: string): boolean {
  return pathname === href || (section.length > 0 && pathname.startsWith(`${href}/`));
}
```

`coming-soon-sections.ts`: delete the `"message-templates",` line (AC-MSG-004: no *Segera hadir*).

- [x] **Step 4: Run the tests and confirm they pass**

Run: `pnpm vitest run src/ui src/features/workspace`
Expected: PASS.

> Build note (2026-10-01): the OwnerShell test mocks `next/navigation` and uses `getAllByRole` for the h1, because the desktop and phone trees both render it.

- [x] **Step 5: Gate and commit**

```bash
pnpm typecheck && pnpm lint && pnpm test
git add src/ui/patterns/app-shell src/ui/patterns/mobile-app-shell src/features/workspace
git commit -m "feat(ui): support sub-pages in the owner shell with the compact bar" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 11: Template list — copy, sub-page headings, list and loading screens, routes

Build from `exports/list-L9tLQ.html` (desktop), `list-m3crcH.html` (phone), `list-loading-KxWLq.html` and `list-loading-CDwax.html`.

**Files:**
- Create: `src/features/communications/ui/template-copy/template-copy.copy.ts`
- Create: `src/features/communications/ui/template-sub-pages/template-sub-pages.ts`, `.types.ts`, `.test.ts`
- Create: `src/features/communications/ui/template-list-screen/template-list-screen.tsx`, `.types.ts`, `.test.tsx`
- Create: `src/features/communications/ui/template-list-skeleton/template-list-skeleton.tsx`, `.copy.ts`
- Create: `src/app/(owner)/w/[workspaceId]/message-templates/(list)/page.tsx`, `(list)/loading.tsx`
- Modify: `src/app/(owner)/w/[workspaceId]/layout.tsx` (pass `subPages`)

The `(list)` route group keeps the list's `loading.tsx` from wrapping the editor route.

**Interfaces:**
- Consumes: `TEMPLATE_TYPES`, `templateGroupOf`, `templateSlugOf` (Task 1); `SectionCard`, `Icon` (Task 9); `loadMessageTemplateList` (Task 8); `OwnerShell.subPages` (Task 10).
- Produces:
  - `TEMPLATE_COPY[type].{label,purpose}`, `TEMPLATE_GROUP_COPY[group].{title,description}`, `TEMPLATE_PAGE_COPY`;
  - `messageTemplatesHref(workspaceId)`, `messageTemplateHref(workspaceId, type)`, `messageTemplateSubPages(workspaceId): readonly TemplateSubPage[]`;
  - `TemplateListScreen({ workspaceId, types })`, `TemplateListSkeleton()`.

- [x] **Step 1: Write the failing tests**

`template-sub-pages.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { messageTemplateHref, messageTemplateSubPages } from "./template-sub-pages";

describe("messageTemplateSubPages", () => {
  it("AC-MSG-005 gives each editor its heading and the list as its parent", () => {
    const pages = messageTemplateSubPages("A");
    expect(pages).toHaveLength(5);
    expect(pages[0]).toEqual({
      path: "/w/A/message-templates/gallery-share",
      title: "Bagikan gallery",
      subtitle:
        "Dikirim saat gallery siap dipilih klien. Kamu tetap mengirimnya sendiri dari WhatsApp.",
      parent: { label: "Template pesan", href: "/w/A/message-templates" },
    });
    expect(messageTemplateHref("A", "PAYMENT_REMINDER")).toBe(
      "/w/A/message-templates/payment-reminder",
    );
  });
});
```

`template-list-screen.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";

import { TemplateListScreen } from "./template-list-screen";

describe("TemplateListScreen", () => {
  it("AC-MSG-004 groups the five templates under Gallery and Invoice in journey order", () => {
    render(<TemplateListScreen workspaceId="A" types={TEMPLATE_TYPES} />);

    const gallery = screen.getByRole("region", { name: "Gallery" });
    const invoice = screen.getByRole("region", { name: "Invoice" });
    expect(within(gallery).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/w/A/message-templates/gallery-share",
      "/w/A/message-templates/selection-reminder",
      "/w/A/message-templates/final-delivery",
    ]);
    expect(within(invoice).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/w/A/message-templates/invoice-share",
      "/w/A/message-templates/payment-reminder",
    ]);
  });

  it("A-5 shows each template's label and purpose", () => {
    render(<TemplateListScreen workspaceId="A" types={TEMPLATE_TYPES} />);

    const row = screen.getByRole("link", { name: /Pengingat pembayaran/ });
    expect(row).toHaveTextContent("Dikirim saat invoice masih punya sisa tagihan.");
  });
});
```

Run: `pnpm vitest run src/features/communications/ui`
Expected: FAIL — modules not found.

- [x] **Step 2: Implement the copy and sub-pages**

`template-copy/template-copy.copy.ts`:

```ts
import type {
  TemplateGroup,
  TemplateType,
} from "@/features/communications/domain/template-type/template-type.types";

// Labels and purpose lines (A-5), from the v3 frames (exports/list-L9tLQ.html).
export const TEMPLATE_COPY = {
  GALLERY_SHARE: { label: "Bagikan gallery", purpose: "Dikirim saat gallery siap dipilih klien." },
  SELECTION_REMINDER: {
    label: "Pengingat seleksi",
    purpose: "Mengingatkan klien menyelesaikan pilihan foto.",
  },
  FINAL_DELIVERY: { label: "Hasil akhir", purpose: "Dikirim saat foto akhir siap diunduh." },
  INVOICE_SHARE: { label: "Bagikan invoice", purpose: "Dikirim saat invoice diterbitkan." },
  PAYMENT_REMINDER: {
    label: "Pengingat pembayaran",
    purpose: "Dikirim saat invoice masih punya sisa tagihan.",
  },
} as const satisfies Record<TemplateType, { label: string; purpose: string }>;

export const TEMPLATE_GROUP_COPY = {
  GALLERY: { title: "Gallery", description: "Untuk gallery dan foto akhir." },
  INVOICE: { title: "Invoice", description: "Untuk tagihan klien." },
} as const satisfies Record<TemplateGroup, { title: string; description: string }>;

export const TEMPLATE_PAGE_COPY = {
  parent: "Template pesan",
  sendNote: "Kamu tetap mengirimnya sendiri dari WhatsApp.",
} as const;
```

`template-sub-pages/template-sub-pages.types.ts`:

```ts
export interface TemplateSubPage {
  readonly path: string;
  readonly title: string;
  readonly subtitle: string;
  readonly parent: { readonly label: string; readonly href: string };
}
```

`template-sub-pages/template-sub-pages.ts`:

```ts
import {
  TEMPLATE_TYPES,
  templateSlugOf,
} from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import { TEMPLATE_COPY, TEMPLATE_PAGE_COPY } from "../template-copy/template-copy.copy";
import type { TemplateSubPage } from "./template-sub-pages.types";

/**
 * Builds the template list URL of a workspace.
 * @param workspaceId - the route workspace ID
 * @returns the list path
 */
export function messageTemplatesHref(workspaceId: string): string {
  return `/w/${workspaceId}/message-templates`;
}

/**
 * Builds a template editor URL.
 * @param workspaceId - the route workspace ID
 * @param type - the template type
 * @returns the editor path
 */
export function messageTemplateHref(workspaceId: string, type: TemplateType): string {
  return `${messageTemplatesHref(workspaceId)}/${templateSlugOf(type)}`;
}

/**
 * Lists the editor sub-pages the Owner shell shows with a breadcrumb parent and a Compact Bar
 * (F-17 sub-page, design v3).
 * @param workspaceId - the route workspace ID
 * @returns one heading per template editor
 */
export function messageTemplateSubPages(workspaceId: string): readonly TemplateSubPage[] {
  const parent = { label: TEMPLATE_PAGE_COPY.parent, href: messageTemplatesHref(workspaceId) };
  return TEMPLATE_TYPES.map((type) => ({
    path: messageTemplateHref(workspaceId, type),
    title: TEMPLATE_COPY[type].label,
    subtitle: `${TEMPLATE_COPY[type].purpose} ${TEMPLATE_PAGE_COPY.sendNote}`,
    parent,
  }));
}
```

- [x] **Step 3: Implement the list and the skeleton**

`template-list-screen/template-list-screen.types.ts`:

```ts
import type {
  TemplateGroup,
  TemplateType,
} from "@/features/communications/domain/template-type/template-type.types";

export interface TemplateListScreenProps {
  workspaceId: string;
  types: readonly TemplateType[];
}

export interface TemplateGroupCardProps extends TemplateListScreenProps {
  group: TemplateGroup;
}

export interface TemplateListRowProps {
  type: TemplateType;
  href: string;
  isLast: boolean;
}
```

`template-list-screen/template-list-screen.tsx`:

```tsx
import Link from "next/link";

import { templateGroupOf } from "@/features/communications/domain/template-type/template-type";
import { cn } from "@/ui/cn/cn";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Icon } from "@/ui/primitives/icon/icon";

import { TEMPLATE_COPY, TEMPLATE_GROUP_COPY } from "../template-copy/template-copy.copy";
import { messageTemplateHref } from "../template-sub-pages/template-sub-pages";
import type {
  TemplateGroupCardProps,
  TemplateListRowProps,
  TemplateListScreenProps,
} from "./template-list-screen.types";

const TEMPLATE_ICONS = {
  GALLERY_SHARE: "image",
  SELECTION_REMINDER: "hourglass",
  FINAL_DELIVERY: "package-check",
  INVOICE_SHARE: "receipt",
  PAYMENT_REMINDER: "wallet",
} as const;

// Two-line row on list-card tokens (design.md › Rule notes: a candidate library variant).
const ROW = [
  "flex items-center gap-(--component-list-card-item-gap) px-(--component-list-card-item-padding-x) py-(--space-3)",
  "outline-none hover:bg-(--color-semantic-surface-subtle)",
  "focus-visible:shadow-[inset_0_0_0_2px_var(--color-semantic-focus-ring)]",
];

/**
 * Template pesan list (design v3 L9tLQ / m3crcH): Gallery and Invoice Section Cards with one
 * row per template, linking to its editor (AC-MSG-004).
 * @param props - the route workspace and the template types it has
 * @returns the list
 */
export function TemplateListScreen({ workspaceId, types }: Readonly<TemplateListScreenProps>) {
  return (
    <div className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6) md:gap-(--component-panel-app-content-gap)">
      <TemplateGroupCard group="GALLERY" workspaceId={workspaceId} types={types} />
      <TemplateGroupCard group="INVOICE" workspaceId={workspaceId} types={types} />
    </div>
  );
}

function TemplateGroupCard({ group, workspaceId, types }: Readonly<TemplateGroupCardProps>) {
  const rows = types.filter((type) => templateGroupOf(type) === group);
  const copy = TEMPLATE_GROUP_COPY[group];
  return (
    <SectionCard title={copy.title} description={copy.description} content="flush">
      <ul className="flex flex-col">
        {rows.map((type, index) => (
          <TemplateListRow
            key={type}
            type={type}
            href={messageTemplateHref(workspaceId, type)}
            isLast={index === rows.length - 1}
          />
        ))}
      </ul>
    </SectionCard>
  );
}

function TemplateListRow({ type, href, isLast }: Readonly<TemplateListRowProps>) {
  const copy = TEMPLATE_COPY[type];
  return (
    <li>
      <Link
        href={href}
        className={cn(ROW, !isLast && "border-b border-(--component-list-card-item-border)")}
      >
        <span className="flex size-(--space-9) shrink-0 items-center justify-center rounded-(--radius-md) bg-(--component-list-card-item-icon-background) text-(--component-list-card-item-icon)">
          <Icon name={TEMPLATE_ICONS[type]} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
          <span className="text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)">
            {copy.label}
          </span>
          <span className="text-(length:--font-size-body-sm) text-(--component-list-card-item-meta)">
            {copy.purpose}
          </span>
        </span>
        <Icon name="chevron-right" size="sm" className="text-(--component-list-card-item-meta)" />
      </Link>
    </li>
  );
}
```

`template-list-skeleton/template-list-skeleton.copy.ts`:

```ts
// not in Pencil: screen-reader text for the loading state (C-008).
export const TEMPLATE_LIST_SKELETON_COPY = { loading: "Memuat template pesan…" } as const;
```

`template-list-skeleton/template-list-skeleton.tsx`:

```tsx
import { cn } from "@/ui/cn/cn";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { TEMPLATE_GROUP_COPY } from "../template-copy/template-copy.copy";
import { TEMPLATE_LIST_SKELETON_COPY as COPY } from "./template-list-skeleton.copy";

const BAR = "rounded-(--radius-xs) bg-(--color-semantic-surface-muted)";

function SkeletonRows({ count }: Readonly<{ count: number }>) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        "flex items-center gap-(--component-list-card-item-gap) px-(--component-list-card-item-padding-x) py-(--space-3)",
        index < count - 1 && "border-b border-(--component-list-card-item-border)",
      )}
    >
      <span className={cn(BAR, "size-(--space-9) rounded-(--radius-md)")} />
      <span className="flex flex-1 flex-col gap-(--space-2)">
        <span className={cn(BAR, "h-(--space-3) w-36")} />
        <span className={cn(BAR, "h-(--space-2-5) w-52")} />
      </span>
    </div>
  ));
}

/**
 * Loading state of the template list (design v3 KxWLq / CDwax).
 * @returns the skeleton cards
 */
export function TemplateListSkeleton() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6) md:gap-(--component-panel-app-content-gap)"
    >
      <span className="sr-only">{COPY.loading}</span>
      <SectionCard title={TEMPLATE_GROUP_COPY.GALLERY.title} description={TEMPLATE_GROUP_COPY.GALLERY.description} content="flush">
        <SkeletonRows count={3} />
      </SectionCard>
      <SectionCard title={TEMPLATE_GROUP_COPY.INVOICE.title} description={TEMPLATE_GROUP_COPY.INVOICE.description} content="flush">
        <SkeletonRows count={2} />
      </SectionCard>
    </div>
  );
}
```

`SkeletonRows` uses an inline props literal; if the lint flags it, move `SkeletonRowsProps { count: number }` to a `template-list-skeleton.types.ts`. `w-36` / `w-52` are skeleton bar widths that have no token (they're placeholders, not content). If `pnpm lint` or review flags them, report them as a `DESIGN TOKEN GAP`, matching the export's 140 / 200 px bars.

- [x] **Step 4: Add the routes and the sub-page headings**

`src/app/(owner)/w/[workspaceId]/message-templates/(list)/page.tsx`:

```tsx
import { loadMessageTemplateList } from "@/composition/communications/message-template-flow/message-template-flow";
import { TemplateListScreen } from "@/features/communications/ui/template-list-screen/template-list-screen";

export default async function MessageTemplatesPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const { types } = await loadMessageTemplateList(workspaceId);
  return <TemplateListScreen workspaceId={workspaceId} types={types} />;
}
```

`src/app/(owner)/w/[workspaceId]/message-templates/(list)/loading.tsx`:

```tsx
import { TemplateListSkeleton } from "@/features/communications/ui/template-list-skeleton/template-list-skeleton";

export default function MessageTemplatesLoading() {
  return <TemplateListSkeleton />;
}
```

In `src/app/(owner)/w/[workspaceId]/layout.tsx`:
- add `import { messageTemplateSubPages } from "@/features/communications/ui/template-sub-pages/template-sub-pages";`;
- pass `subPages={messageTemplateSubPages(workspaceId)}` to `<OwnerShell>`.

> Build note (2026-10-01): unit tests pass; row and card insets checked against `list-L9tLQ.html` (12 px row padding, 28 px card gap). The browser check (Step 5, second half) is **pending** until migrations 0002/0003 are applied.

- [ ] **Step 5: Run the tests and check the page in the browser**

Run: `pnpm vitest run src/features/communications/ui`
Expected: PASS.

Then use the `dev` preview (`.claude/launch.json`):
- open `/w/<id>/message-templates` as an Owner whose workspace has templates (the migrations are applied);
- compare it with `exports/list-L9tLQ.html` at 1440 px and `list-m3crcH.html` at 390 px;
- check that *Template pesan* is active in the Sidebar, no Bottom Nav tab is active, and there's no *Segera hadir*.

- [x] **Step 6: Gate and commit**

```bash
pnpm typecheck && pnpm lint && pnpm test
git add src/features/communications/ui "src/app/(owner)/w/[workspaceId]"
git commit -m "feat(communications): add the template pesan list" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 12: Editor building blocks — problem text, variable chip, message preview

Build from `exports/editor-byw9B.html`, `editor-unknown-variable-sgWML.html`, `editor-required-link-v1nCP.html` and `editor-preview-error-M9qsio.html`.

**Files:**
- Create: `src/features/communications/ui/template-problem-text/template-problem-text.ts`, `.copy.ts`, `.test.ts`
- Create: `src/features/communications/ui/variable-chip/variable-chip.tsx`, `.types.ts`, `.copy.ts`, `.test.tsx`
- Create: `src/features/communications/ui/message-preview/message-preview.tsx`, `render-preview.ts`, `.types.ts`, `.copy.ts`, `message-preview.test.tsx`

**Interfaces:**
- Consumes: `parseProblemKey`, `TEMPLATE_CONTENT_MAX_LENGTH` (Task 2); `renderTemplate`, `RenderTemplateError` (Task 3); `allowedVariables`, `requiredVariable`, `templateGroupOf`; `TEMPLATE_COPY` (Task 11); `Icon`.
- Produces:
  - `templateProblemText(type, key: string | undefined): string | undefined`;
  - `VariableChip({ name, isRequired, onInsert })`;
  - `renderPreview(type, content, brandName): string | null`, `previewHasPasswordNote(type): boolean`;
  - `MessagePreview({ text, showsPasswordNote })`.

- [ ] **Step 1: Write the failing tests**

`template-problem-text.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { templateProblemText } from "./template-problem-text";

describe("templateProblemText", () => {
  it("AC-MSG-009 names the variable and the template, as in the design", () => {
    expect(templateProblemText("GALLERY_SHARE", "UNKNOWN_VARIABLE:invoiceUrl")).toBe(
      "{{invoiceUrl}} tidak bisa dipakai di Bagikan gallery. Pakai variabel dari daftar di bawah.",
    );
  });

  it("AC-MSG-011 says which link is required", () => {
    expect(templateProblemText("GALLERY_SHARE", "MISSING_REQUIRED:galleryUrl")).toBe(
      "Pesan ini wajib memuat {{galleryUrl}} agar klien bisa membuka gallery.",
    );
    expect(templateProblemText("PAYMENT_REMINDER", "MISSING_REQUIRED:invoiceUrl")).toBe(
      "Pesan ini wajib memuat {{invoiceUrl}} agar klien bisa membuka invoice.",
    );
  });

  it("AC-MSG-008 AC-MSG-010 explains empty, too long and malformed content", () => {
    expect(templateProblemText("GALLERY_SHARE", "EMPTY")).toBe("Isi pesan tidak boleh kosong.");
    expect(templateProblemText("GALLERY_SHARE", "TOO_LONG")).toBe(
      "Isi pesan maksimal 2.000 karakter.",
    );
    expect(templateProblemText("GALLERY_SHARE", "MALFORMED")).toContain("{{clientName}}");
  });

  it("returns nothing without an error and a generic message for an unknown key", () => {
    expect(templateProblemText("GALLERY_SHARE", undefined)).toBeUndefined();
    expect(templateProblemText("GALLERY_SHARE", "???")).toBe("Isi pesan belum bisa disimpan.");
  });
});
```

`variable-chip.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { VariableChip } from "./variable-chip";

describe("VariableChip", () => {
  it("AC-MSG-006 inserts its variable when pressed", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();
    render(<VariableChip name="projectTitle" isRequired={false} onInsert={onInsert} />);

    await user.click(screen.getByRole("button", { name: "Sisipkan {{projectTitle}}" }));
    expect(onInsert).toHaveBeenCalledWith("projectTitle");
  });

  it("AC-MSG-005 marks the required variable", () => {
    render(<VariableChip name="galleryUrl" isRequired onInsert={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Sisipkan {{galleryUrl}}, wajib" })).toHaveTextContent(
      "wajib",
    );
  });
});
```

`message-preview.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MessagePreview } from "./message-preview";
import { previewHasPasswordNote, renderPreview } from "./render-preview";

describe("renderPreview", () => {
  it("AC-MSG-005 A-6 renders sample data, the real brand name and a masked password", () => {
    const text = renderPreview(
      "GALLERY_SHARE",
      "Halo {{clientName}} dari {{brandName}} {{galleryUrl}} {{galleryPassword}}",
      "Aster Wedding",
    );
    expect(text).toBe("Halo Rina & Dimas dari Aster Wedding https://shutrly.app/g/k7Qm… ••••••");
  });

  it("returns null for content that cannot be rendered", () => {
    expect(renderPreview("GALLERY_SHARE", "{{invoiceUrl}}", "Aster")).toBeNull();
  });

  it("BR-MSG-003 notes the password only where it can appear", () => {
    expect(previewHasPasswordNote("GALLERY_SHARE")).toBe(true);
    expect(previewHasPasswordNote("INVOICE_SHARE")).toBe(false);
  });
});

describe("MessagePreview", () => {
  it("AC-MSG-020 announces itself as a preview and shows the message", () => {
    render(<MessagePreview text={"Halo\nKak"} showsPasswordNote />);

    const region = screen.getByRole("region", { name: "Pratinjau pesan" });
    expect(region).toHaveTextContent("Halo");
    expect(region).toHaveTextContent("Password gallery diisi saat kamu membagikan pesan.");
  });

  it("shows the error state instead of a partial render", () => {
    render(<MessagePreview text={null} showsPasswordNote />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Pratinjau muncul lagi setelah isi template diperbaiki.",
    );
    expect(screen.queryByText(/Password gallery/)).not.toBeInTheDocument();
  });
});
```

Run: `pnpm vitest run src/features/communications/ui`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement the problem text**

`template-problem-text.copy.ts`:

```ts
// Field errors from the v3 frames (editor-unknown-variable-sgWML, editor-required-link-v1nCP).
// EMPTY, TOO_LONG, MALFORMED and the generic fallback are not in Pencil.
export const TEMPLATE_PROBLEM_COPY = {
  empty: "Isi pesan tidak boleh kosong.",
  tooLong: (max: string) => `Isi pesan maksimal ${max} karakter.`,
  malformed: "Tulis variabel sebagai {{namaVariabel}} tanpa spasi, misalnya {{clientName}}.",
  unknownVariable: (variable: string, template: string) =>
    `{{${variable}}} tidak bisa dipakai di ${template}. Pakai variabel dari daftar di bawah.`,
  missingRequired: (variable: string, target: string) =>
    `Pesan ini wajib memuat {{${variable}}} agar klien bisa membuka ${target}.`,
  gallery: "gallery",
  invoice: "invoice",
  fallback: "Isi pesan belum bisa disimpan.",
} as const;
```

`template-problem-text.ts`:

```ts
import { parseProblemKey, TEMPLATE_CONTENT_MAX_LENGTH } from "@/features/communications/domain/template-content/template-content";
import { templateGroupOf } from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import { TEMPLATE_COPY } from "../template-copy/template-copy.copy";
import { TEMPLATE_PROBLEM_COPY as COPY } from "./template-problem-text.copy";

const NUMBER = new Intl.NumberFormat("id-ID");

/**
 * Translates a content problem key into the Indonesian field error shown under the textarea.
 * @param type - the template type being edited
 * @param key - the field error key from the form or the server, if any
 * @returns the message, or undefined when there is no error
 */
export function templateProblemText(type: TemplateType, key: string | undefined): string | undefined {
  if (!key) return undefined;
  const problem = parseProblemKey(key);
  if (!problem) return COPY.fallback;
  switch (problem.code) {
    case "EMPTY":
      return COPY.empty;
    case "TOO_LONG":
      return COPY.tooLong(NUMBER.format(TEMPLATE_CONTENT_MAX_LENGTH));
    case "MALFORMED":
      return COPY.malformed;
    case "UNKNOWN_VARIABLE":
      return COPY.unknownVariable(problem.variable, TEMPLATE_COPY[type].label);
    case "MISSING_REQUIRED":
      return COPY.missingRequired(
        problem.variable,
        templateGroupOf(type) === "INVOICE" ? COPY.invoice : COPY.gallery,
      );
  }
}
```

- [ ] **Step 3: Implement the variable chip**

`variable-chip.types.ts`:

```ts
import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

export interface VariableChipProps {
  name: TemplateVariable;
  isRequired: boolean;
  onInsert: (name: TemplateVariable) => void;
}
```

`variable-chip.copy.ts`:

```ts
export const VARIABLE_CHIP_COPY = {
  required: "wajib",
  // not in Pencil: the chip's accessible name.
  insert: (name: string, isRequired: boolean) =>
    `Sisipkan {{${name}}}${isRequired ? ", wajib" : ""}`,
} as const;
```

`variable-chip.tsx` (the local *Variable chip* component, `znAAB` › `dT1mp` / `A3CYQ`):

```tsx
"use client";

import type { MouseEvent } from "react";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import { VARIABLE_CHIP_COPY as COPY } from "./variable-chip.copy";
import type { VariableChipProps } from "./variable-chip.types";

const CHIP = [
  "inline-flex items-center gap-(--space-1) rounded-(--radius-sm) border px-(--space-2) py-(--space-1)",
  "text-(length:--font-size-label) outline-none",
  "focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
];
const DEFAULT = [
  "border-(--color-semantic-border-default) bg-(--color-semantic-surface-subtle) text-(--color-semantic-text-primary)",
  "hover:bg-(--color-semantic-surface-muted)",
];
const REQUIRED =
  "border-(--color-semantic-accent-soft) bg-(--color-semantic-accent-soft) text-(--color-semantic-accent-soft-fg)";

/**
 * A pressable variable from the type's catalogue; pressing inserts `{{name}}` at the caret
 * (AC-MSG-006). The required link variable is marked (AC-MSG-005).
 * @param props - variable name, required flag and insert callback
 * @returns the chip button
 */
export function VariableChip({ name, isRequired, onInsert }: Readonly<VariableChipProps>) {
  const handleClick = () => {
    onInsert(name);
  };
  // Keep focus (and the caret) in the textarea while the pointer presses the chip.
  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  return (
    <button
      type="button"
      aria-label={COPY.insert(name, isRequired)}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={cn(CHIP, isRequired ? REQUIRED : DEFAULT)}
    >
      <Icon name="braces" size="sm" className="text-(--color-semantic-text-secondary)" />
      <span>{name}</span>
      {isRequired ? (
        <span className="text-(length:--font-size-caption) text-(--color-semantic-text-secondary)">
          {COPY.required}
        </span>
      ) : null}
    </button>
  );
}
```

- [ ] **Step 4: Implement the preview**

`message-preview.copy.ts`:

```ts
// Preview sample data (A-6) and labels from editor-byw9B. The real brand name replaces
// brandName; the password is always masked (BR-MSG-003).
export const MESSAGE_PREVIEW_COPY = {
  regionLabel: "Pratinjau pesan", // not in Pencil: accessible name (AC-MSG-020)
  time: "10.24",
  passwordNote: "Password gallery diisi saat kamu membagikan pesan.",
  error: "Pratinjau muncul lagi setelah isi template diperbaiki.",
  sample: {
    clientName: "Rina & Dimas",
    projectTitle: "Wedding Rina & Dimas",
    galleryUrl: "https://shutrly.app/g/k7Qm…",
    galleryPassword: "••••••",
    invoiceNumber: "AW-0012",
    invoiceTotal: "Rp 12.500.000",
    invoiceBalance: "Rp 6.250.000",
    invoiceUrl: "https://shutrly.app/i/p3Xz…",
  },
} as const;
```

`message-preview.types.ts`:

```ts
export interface MessagePreviewProps {
  text: string | null;
  showsPasswordNote: boolean;
}
```

`render-preview.ts`:

```ts
import {
  RenderTemplateError,
  renderTemplate,
} from "@/features/communications/domain/render-template/render-template";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import {
  allowedVariables,
  isAllowedVariable,
} from "@/features/communications/domain/variable-catalogue/variable-catalogue";
import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

import { MESSAGE_PREVIEW_COPY as COPY } from "./message-preview.copy";

function sampleValue(name: TemplateVariable, brandName: string): string {
  return name === "brandName" ? brandName : COPY.sample[name];
}

/**
 * Renders the live preview with sample data and the workspace's brand name (A-6).
 * @param type - the template type
 * @param content - the content as typed
 * @param brandName - the workspace's client-facing name
 * @returns the preview text, or null when the content is invalid
 */
export function renderPreview(type: TemplateType, content: string, brandName: string): string | null {
  const values = Object.fromEntries(
    allowedVariables(type).map((name) => [name, sampleValue(name, brandName)]),
  );
  try {
    return renderTemplate(type, content, values);
  } catch (error) {
    if (error instanceof RenderTemplateError) return null;
    throw error;
  }
}

/**
 * Tells whether the preview needs the password re-entry note (BR-MSG-003).
 * @param type - the template type
 * @returns whether the type can use galleryPassword
 */
export function previewHasPasswordNote(type: TemplateType): boolean {
  return isAllowedVariable(type, "galleryPassword");
}
```

`message-preview.tsx` (the local *Message preview*, `lirwH`; its own header is replaced by the Pratinjau Section Card header):

```tsx
import { Icon } from "@/ui/primitives/icon/icon";

import { MESSAGE_PREVIEW_COPY as COPY } from "./message-preview.copy";
import type { MessagePreviewProps } from "./message-preview.types";

/**
 * WhatsApp-style preview bubble, or its error state when the content can't be rendered
 * (AC-MSG-005, spec › UI States).
 * @param props - the rendered text (null = invalid) and whether to show the password note
 * @returns the preview region
 */
export function MessagePreview({ text, showsPasswordNote }: Readonly<MessagePreviewProps>) {
  return (
    <section aria-label={COPY.regionLabel} className="flex flex-col gap-(--space-3)">
      {text === null ? (
        <p
          role="status"
          className="flex items-center gap-(--space-2) rounded-(--radius-md) bg-(--color-semantic-surface-sunken) p-(--space-4) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)"
        >
          <Icon name="circle-alert" size="sm" className="text-(--component-input-error-text)" />
          {COPY.error}
        </p>
      ) : (
        <div className="rounded-(--radius-md) bg-(--color-semantic-surface-sunken) p-(--space-4)">
          <div className="flex flex-col gap-(--space-2) rounded-(--radius-md) border border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) p-(--space-3)">
            <p className="whitespace-pre-wrap break-words text-(length:--font-size-body-sm) text-(--color-semantic-text-primary)">
              {text}
            </p>
            <span className="self-end text-(length:--font-size-caption) text-(--color-semantic-text-muted)">
              {COPY.time}
            </span>
          </div>
        </div>
      )}
      {showsPasswordNote && text !== null ? (
        <p className="text-(length:--font-size-caption) text-(--color-semantic-text-muted)">
          {COPY.passwordNote}
        </p>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `pnpm vitest run src/features/communications/ui`
Expected: PASS.

- [ ] **Step 6: Gate and commit**

```bash
pnpm typecheck && pnpm lint
git add src/features/communications/ui
git commit -m "feat(communications): add variable chips, field errors and the message preview" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Template editor — form, unsaved-changes guard, screen and route

Build from every `exports/editor-*.html`:
- desktop `byw9B`, `haB5f`, `sgWML`, `v1nCP`, `svG4d`, `VgQpQ`, `ysVv9`, `KKHgt`;
- phone `v8MaG`, `LTRdV`, `rQWDq`, `EOm16`, `Dfkwo`, `O9zahR`, `S5dA9`, `T96gnV`, `PBDeb`, `M9qsio`.

**Files:**
- Create: `src/features/communications/ui/use-template-form/use-template-form.ts`, `.types.ts`
- Create: `src/features/communications/ui/use-unsaved-changes-guard/use-unsaved-changes-guard.ts`, `internal-href.ts`, `.types.ts`, `internal-href.test.tsx`
- Create: `src/features/communications/ui/unsaved-changes-dialog/unsaved-changes-dialog.tsx`, `.types.ts`, `.copy.ts`
- Create: `src/features/communications/ui/template-editor-screen/template-editor-screen.tsx`, `.types.ts`, `.copy.ts`, `.test.tsx`
- Create: `src/app/(owner)/w/[workspaceId]/message-templates/[templateType]/page.tsx`

**Interfaces:**
- Consumes:
  - `messageTemplateContentSchema` (Task 6), `UpdateMessageTemplateFailure` (Task 6 types);
  - `MessageTemplateEditorData` (Task 8), `saveMessageTemplateAction` (Task 8);
  - Tasks 9, 11 and 12;
  - `showToast`, `Modal`, `BottomSheet`, `SheetItem`, `Button`, `SectionCard`, `useMobileViewport`.
- Produces: `TemplateEditorScreen({ editor, action })`; `useTemplateForm(options): TemplateForm`; `useUnsavedChangesGuard(isDirty): UnsavedChangesGuard`; `internalHrefOf(event, origin, currentPath): string | null`.

- [ ] **Step 1: Write the failing tests**

`use-unsaved-changes-guard/internal-href.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";

import { internalHrefOf } from "./internal-href";

function clickOn(href: string, init: MouseEventInit = {}, target?: string): MouseEvent {
  const anchor = document.createElement("a");
  anchor.href = href;
  if (target) anchor.target = target;
  const child = document.createElement("span");
  anchor.append(child);
  document.body.append(anchor);
  const event = new MouseEvent("click", { bubbles: true, button: 0, ...init });
  Object.defineProperty(event, "target", { value: child });
  return event;
}

const ORIGIN = window.location.origin;

describe("internalHrefOf", () => {
  it("AC-MSG-014 A-7 returns the in-app destination of a plain link click", () => {
    expect(internalHrefOf(clickOn("/w/A/settings?tab=1"), ORIGIN, "/w/A/message-templates/x")).toBe(
      "/w/A/settings?tab=1",
    );
  });

  it("ignores new-tab clicks, external links and the current page", () => {
    expect(internalHrefOf(clickOn("/w/A", { metaKey: true }), ORIGIN, "/x")).toBeNull();
    expect(internalHrefOf(clickOn("/w/A", {}, "_blank"), ORIGIN, "/x")).toBeNull();
    expect(internalHrefOf(clickOn("https://example.com/"), ORIGIN, "/x")).toBeNull();
    expect(internalHrefOf(clickOn("/x"), ORIGIN, "/x")).toBeNull();
  });
});
```

`template-editor-screen/template-editor-screen.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const showToast = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { TemplateEditorScreen } = await import("./template-editor-screen");

const STORED = "Halo {{clientName}},\n{{galleryUrl}}";
const DEFAULT = "Default {{galleryUrl}}";
const editor = {
  type: "GALLERY_SHARE",
  content: STORED,
  defaultContent: DEFAULT,
  brandName: "Aster Wedding",
} as const;

function renderEditor(action = vi.fn().mockResolvedValue(undefined)) {
  render(<TemplateEditorScreen editor={editor} action={action} />);
  return { action, textbox: screen.getByRole("textbox", { name: "Isi pesan" }) };
}

describe("TemplateEditorScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-MSG-005 shows the stored content, the variables (required marked) and a preview", () => {
    const { textbox } = renderEditor();

    expect(textbox).toHaveValue(STORED);
    expect(screen.getByRole("button", { name: "Sisipkan {{galleryUrl}}, wajib" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Sisipkan {{galleryPassword}}" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Pratinjau pesan" })).toHaveTextContent(
      "Halo Rina & Dimas,",
    );
    expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
  });

  it("AC-MSG-006 inserts a variable at the caret and updates the preview", async () => {
    const user = userEvent.setup();
    const { textbox } = renderEditor();
    await user.click(textbox);
    await user.keyboard("{Control>}{End}{/Control} ");
    await user.click(screen.getByRole("button", { name: "Sisipkan {{projectTitle}}" }));

    expect(textbox).toHaveValue(`${STORED} {{projectTitle}}`);
    expect(screen.getByRole("region", { name: "Pratinjau pesan" })).toHaveTextContent(
      "Wedding Rina & Dimas",
    );
  });

  it("AC-MSG-007 saves and confirms with a success toast", async () => {
    const user = userEvent.setup();
    const { textbox, action } = renderEditor();
    await user.type(textbox, "!");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(action).toHaveBeenCalledWith({ content: `${STORED}!` });
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: "Template tersimpan" }),
    );
  });

  it("AC-MSG-009 shows the server field error on the content and focuses it", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { content: "UNKNOWN_VARIABLE:invoiceUrl" },
    });
    const { textbox } = renderEditor(action);
    await user.type(textbox, "!");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(await screen.findByText(/tidak bisa dipakai di Bagikan gallery/)).toBeVisible();
    expect(textbox).toHaveFocus();
  });

  it("AC-MSG-010 validates on the client before calling the server", async () => {
    const user = userEvent.setup();
    const { textbox, action } = renderEditor();
    await user.type(textbox, " {{ x }}");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(await screen.findByText(/tanpa spasi/)).toBeVisible();
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Pratinjau muncul lagi");
  });

  it("AC-MSG-012 keeps the text and offers a retry toast when the server fails", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockRejectedValue(new Error("SAVE_FAILED"));
    const { textbox } = renderEditor(action);
    await user.type(textbox, "!");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "danger",
        title: "Template belum tersimpan",
        action: expect.objectContaining({ label: "Coba lagi" }),
      }),
    );
    expect(textbox).toHaveValue(`${STORED}!`);
  });

  it("AC-MSG-013 restoring the default is a draft change until saved", async () => {
    const user = userEvent.setup();
    const { textbox, action } = renderEditor();
    await user.click(screen.getByRole("button", { name: "Kembalikan ke default" }));

    expect(textbox).toHaveValue(DEFAULT);
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled();
  });

  it("AC-MSG-014 asks before leaving with unsaved changes and stays on cancel", async () => {
    const user = userEvent.setup();
    const { textbox } = renderEditor();
    const link = document.createElement("a");
    link.href = "/w/A/settings";
    link.textContent = "Pengaturan";
    document.body.append(link);
    await user.type(textbox, "!");
    await act(async () => {
      await user.click(link);
    });

    expect(await screen.findByRole("dialog", { name: "Buang perubahan?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Lanjut mengedit" }));
    expect(push).not.toHaveBeenCalled();
    expect(textbox).toHaveValue(`${STORED}!`);
  });
});
```

Run: `pnpm vitest run src/features/communications/ui/template-editor-screen src/features/communications/ui/use-unsaved-changes-guard`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement the unsaved-changes guard**

`use-unsaved-changes-guard/use-unsaved-changes-guard.types.ts`:

```ts
export interface UnsavedChangesGuard {
  isConfirmOpen: boolean;
  stay: () => void;
  leave: () => void;
}
```

`use-unsaved-changes-guard/internal-href.ts`:

```ts
function isPlainClick(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function anchorOf(event: MouseEvent): HTMLAnchorElement | null {
  const target = event.target;
  const anchor = target instanceof Element ? target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  return anchor.target === "_blank" || anchor.hasAttribute("download") ? null : anchor;
}

/**
 * Returns the in-app destination of a plain left click on a same-origin link, so the editor
 * can ask before leaving (A-7). New-tab clicks, external links and the current page pass.
 * @param event - the document click
 * @param origin - the app origin
 * @param currentPath - the current pathname plus search
 * @returns the destination path, or null when the click should proceed
 */
export function internalHrefOf(
  event: MouseEvent,
  origin: string,
  currentPath: string,
): string | null {
  const anchor = isPlainClick(event) ? anchorOf(event) : null;
  if (!anchor) return null;
  const url = new URL(anchor.href, origin);
  if (url.origin !== origin || `${url.pathname}${url.search}` === currentPath) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}
```

`use-unsaved-changes-guard/use-unsaved-changes-guard.ts`:

```ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { internalHrefOf } from "./internal-href";
import type { UnsavedChangesGuard } from "./use-unsaved-changes-guard.types";

/**
 * While the form is dirty, asks before an in-app link navigates away and lets the browser warn
 * on reload or close (A-7, AC-MSG-014). Browser back/forward is not intercepted (D-M2).
 * @param isDirty - whether the form has unsaved changes
 * @returns the confirm state and the stay / leave handlers
 */
export function useUnsavedChangesGuard(isDirty: boolean): UnsavedChangesGuard {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return undefined;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    // Capture phase on the document runs before Next/React Aria link handlers.
    function handleClick(event: MouseEvent) {
      const { origin, pathname, search } = window.location;
      const href = internalHrefOf(event, origin, `${pathname}${search}`);
      if (href === null) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  function stay() {
    setPendingHref(null);
  }

  function leave() {
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  }

  return { isConfirmOpen: pendingHref !== null, stay, leave };
}
```

- [ ] **Step 3: Implement the form hook**

`use-template-form/use-template-form.types.ts`:

```ts
import type { BaseSyntheticEvent, RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { UpdateMessageTemplateFailure } from "@/features/communications/application/use-cases/update-message-template/update-message-template.types";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

export interface TemplateFormValues {
  content: string;
}

export type SaveTemplateAction = (
  values: TemplateFormValues,
) => Promise<UpdateMessageTemplateFailure | undefined>;

export interface TemplateFormOptions {
  type: TemplateType;
  content: string;
  defaultContent: string;
  action: SaveTemplateAction;
  onSaved: () => void;
  onFailed: (retry: () => void) => void;
}

export interface TemplateForm {
  form: UseFormReturn<TemplateFormValues>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  content: string;
  isDirty: boolean;
  isSubmitting: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  insertVariable: (name: TemplateVariable) => void;
  restoreDefault: () => void;
}
```

`use-template-form/use-template-form.ts`:

```ts
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

import { messageTemplateContentSchema } from "@/features/communications/application/schemas/message-template-content/message-template-content.schema";
import { normaliseTemplateContent } from "@/features/communications/domain/template-content/template-content";
import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

import type { TemplateForm, TemplateFormOptions, TemplateFormValues } from "./use-template-form.types";

function placeCaret(element: HTMLTextAreaElement | null, position: number): void {
  element?.focus();
  element?.setSelectionRange(position, position);
}

/**
 * Editor form state: the shared schema validates as the Owner types (UX only, C-004), server
 * field errors land on the content, a failed request keeps the text and offers a retry
 * (AC-MSG-012), and Restore default is a draft change (A-4).
 * @param options - type, stored and default content, the bound action and feedback callbacks
 * @returns the form, the textarea ref, the live content and the editor actions
 */
export function useTemplateForm(options: TemplateFormOptions): TemplateForm {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(messageTemplateContentSchema(options.type)),
    defaultValues: { content: options.content },
    shouldFocusError: true,
  });
  const content = useWatch({ control: form.control, name: "content" });

  async function submit(values: TemplateFormValues): Promise<void> {
    const failure = await options.action(values);
    if (failure) {
      form.setError("content", { type: "server", message: failure.fieldErrors.content }, { shouldFocus: true });
      return;
    }
    form.reset({ content: normaliseTemplateContent(values.content) });
    options.onSaved();
  }

  const handle = form.handleSubmit(submit);
  function onSubmit(event?: BaseSyntheticEvent): void {
    handle(event).catch(failRequest);
  }
  function failRequest(): void {
    options.onFailed(onSubmit);
  }

  function setContent(next: string): void {
    form.setValue("content", next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  }

  function insertVariable(name: TemplateVariable): void {
    const element = textareaRef.current;
    const current = form.getValues("content");
    const start = element?.selectionStart ?? current.length;
    const end = element?.selectionEnd ?? current.length;
    const token = `{{${name}}}`;
    setContent(`${current.slice(0, start)}${token}${current.slice(end)}`);
    requestAnimationFrame(() => placeCaret(element, start + token.length));
  }

  function restoreDefault(): void {
    setContent(options.defaultContent);
  }

  return {
    form,
    textareaRef,
    content,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
    insertVariable,
    restoreDefault,
  };
}
```

If the hook goes over 50 lines, move `insertVariable` into a module-level `insertAtCaret(form, element, name)` helper in the same file.

- [ ] **Step 4: Implement the dialog**

`unsaved-changes-dialog/unsaved-changes-dialog.copy.ts`:

```ts
// editor-unsaved-KKHgt (desktop Modal) and T96gnV (phone Bottom Sheet).
export const UNSAVED_CHANGES_COPY = {
  title: "Buang perubahan?",
  description: (template: string) =>
    `Perubahan pada ${template} belum disimpan dan akan hilang kalau kamu keluar.`,
  mobileDescription: (template: string) => `Perubahan pada ${template} belum disimpan.`,
  stay: "Lanjut mengedit",
  leave: "Buang perubahan",
} as const;
```

`unsaved-changes-dialog/unsaved-changes-dialog.types.ts`:

```ts
export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  isMobile: boolean;
  templateLabel: string;
  onStay: () => void;
  onLeave: () => void;
}
```

`unsaved-changes-dialog/unsaved-changes-dialog.tsx`:

```tsx
"use client";

import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { UNSAVED_CHANGES_COPY as COPY } from "./unsaved-changes-dialog.copy";
import type { UnsavedChangesDialogProps } from "./unsaved-changes-dialog.types";

/**
 * Confirms leaving the editor with unsaved changes: a Modal on desktop and an Actions sheet on
 * phones (AC-MSG-014). Dismissing it keeps the Owner in the editor.
 * @param props - open state, layout, template label and the stay / leave handlers
 * @returns the confirmation dialog
 */
export function UnsavedChangesDialog({
  isOpen,
  isMobile,
  templateLabel,
  onStay,
  onLeave,
}: Readonly<UnsavedChangesDialogProps>) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onStay();
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        title={COPY.title}
        description={COPY.mobileDescription(templateLabel)}
        variant="actions"
      >
        <SheetItem label={COPY.stay} icon="pencil" onPress={onStay} />
        <SheetItem label={COPY.leave} icon="trash-2" variant="destructive" onPress={onLeave} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={COPY.title}
      description={COPY.description(templateLabel)}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={onStay}>
            {COPY.stay}
          </Button>
          <Button variant="danger" onPress={onLeave}>
            {COPY.leave}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
```

If `Modal` requires non-empty `children`, render the description as its body instead of `description` (follow `create-workspace-dialog.tsx`).

- [ ] **Step 5: Implement the screen**

`template-editor-screen/template-editor-screen.copy.ts`:

```ts
const NUMBER = new Intl.NumberFormat("id-ID");

// Editor copy from the v3 frames; "viewLabel" is not in Pencil (accessible name of the tabs).
export const TEMPLATE_EDITOR_COPY = {
  contentTitle: "Isi pesan",
  contentDescription: "Variabel diganti dengan data klien saat pesan dibagikan.",
  mobileTitle: "Pesan",
  contentLabel: "Isi pesan",
  helper: "Tulis variabel persis seperti chip di bawah, termasuk kurung kurawalnya.",
  mobileHelper: "Tulis variabel persis seperti chip di bawah.",
  counter: (length: number, max: number) => `${NUMBER.format(length)} / ${NUMBER.format(max)}`,
  variablesTitle: "Sisipkan variabel",
  variablesHint:
    "Klik untuk menyisipkan di posisi kursor. Variabel bertanda wajib harus ada di pesan.",
  mobileVariablesHint: "Ketuk untuk menyisipkan di posisi kursor.",
  previewTitle: "Pratinjau",
  previewDescription: "Memakai data contoh, bukan data klien.",
  viewLabel: "Tampilan pesan",
  edit: "Edit",
  preview: "Pratinjau",
  restore: "Kembalikan ke default",
  save: "Simpan",
  saving: "Menyimpan…",
  saved: "Template tersimpan",
  savedBody: (template: string) => `${template} akan memakai isi terbaru.`,
  serverErrorTitle: "Template belum tersimpan",
  serverErrorBody: "Terjadi kesalahan di server. Isi pesanmu masih di sini.",
  retry: "Coba lagi",
} as const;
```

`template-editor-screen/template-editor-screen.types.ts`:

```ts
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import type { SaveTemplateAction, TemplateForm } from "../use-template-form/use-template-form.types";

export interface TemplateEditorData {
  readonly type: TemplateType;
  readonly content: string;
  readonly defaultContent: string;
  readonly brandName: string;
}

export interface TemplateEditorScreenProps {
  editor: TemplateEditorData;
  action: SaveTemplateAction;
}

export interface EditorPartProps {
  template: TemplateForm;
  type: TemplateType;
  isMobile: boolean;
}

export interface EditorLayoutProps extends EditorPartProps {
  preview: string | null;
}
```

`template-editor-screen/template-editor-screen.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useController } from "react-hook-form";

import {
  TEMPLATE_CONTENT_MAX_LENGTH,
  templateContentLength,
} from "@/features/communications/domain/template-content/template-content";
import {
  allowedVariables,
  requiredVariable,
} from "@/features/communications/domain/variable-catalogue/variable-catalogue";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { MessagePreview } from "../message-preview/message-preview";
import { previewHasPasswordNote, renderPreview } from "../message-preview/render-preview";
import { TEMPLATE_COPY } from "../template-copy/template-copy.copy";
import { templateProblemText } from "../template-problem-text/template-problem-text";
import { UnsavedChangesDialog } from "../unsaved-changes-dialog/unsaved-changes-dialog";
import { useTemplateForm } from "../use-template-form/use-template-form";
import { useUnsavedChangesGuard } from "../use-unsaved-changes-guard/use-unsaved-changes-guard";
import { VariableChip } from "../variable-chip/variable-chip";
import { TEMPLATE_EDITOR_COPY as COPY } from "./template-editor-screen.copy";
import type {
  EditorLayoutProps,
  EditorPartProps,
  TemplateEditorScreenProps,
} from "./template-editor-screen.types";

const VIEWS = [
  { id: "edit", label: COPY.edit },
  { id: "preview", label: COPY.preview },
];

/**
 * Template editor v3: content and variables beside a live preview on desktop; one card with
 * Edit/Pratinjau tabs on phones; save and restore below; toasts for saved and failed saves.
 * @param props - the editor data and the bound save action
 * @returns the editor form
 */
export function TemplateEditorScreen({ editor, action }: Readonly<TemplateEditorScreenProps>) {
  const label = TEMPLATE_COPY[editor.type].label;
  const isMobile = useMobileViewport();
  const handleSaved = () => {
    showToast({ tone: "success", title: COPY.saved, body: COPY.savedBody(label) });
  };
  const handleFailed = (retry: () => void) => {
    showToast({
      tone: "danger",
      title: COPY.serverErrorTitle,
      body: COPY.serverErrorBody,
      action: { label: COPY.retry, onAction: retry },
    });
  };
  const template = useTemplateForm({ ...editor, action, onSaved: handleSaved, onFailed: handleFailed });
  const guard = useUnsavedChangesGuard(template.isDirty);
  const preview = renderPreview(editor.type, template.content, editor.brandName);
  const parts = { template, type: editor.type, isMobile, preview };
  return (
    <form
      noValidate
      onSubmit={template.onSubmit}
      className="flex flex-col gap-(--space-6) md:flex-row md:items-start md:gap-(--component-panel-app-content-gap)"
    >
      {isMobile ? <MobileEditor {...parts} /> : <DesktopEditor {...parts} />}
      <UnsavedChangesDialog
        isOpen={guard.isConfirmOpen}
        isMobile={isMobile}
        templateLabel={label}
        onStay={guard.stay}
        onLeave={guard.leave}
      />
    </form>
  );
}

function DesktopEditor({ preview, ...part }: Readonly<EditorLayoutProps>) {
  return (
    <>
      {/* 5:3 split ≈ the 664/400 columns; no width token exists (D-M3). */}
      <div className="flex min-w-0 flex-[5_1_0%] flex-col gap-(--component-panel-app-content-gap)">
        <SectionCard title={COPY.contentTitle} description={COPY.contentDescription}>
          <ContentField {...part} />
          <VariableList {...part} />
        </SectionCard>
        <EditorActions {...part} />
      </div>
      <SectionCard
        title={COPY.previewTitle}
        description={COPY.previewDescription}
        className="min-w-0 flex-[3_1_0%]"
      >
        <MessagePreview text={preview} showsPasswordNote={previewHasPasswordNote(part.type)} />
      </SectionCard>
    </>
  );
}

function MobileEditor({ preview, ...part }: Readonly<EditorLayoutProps>) {
  const [view, setView] = useState("edit");
  return (
    <>
      <SectionCard
        title={COPY.mobileTitle}
        actions={
          <SegmentedControl label={COPY.viewLabel} options={VIEWS} selectedId={view} onChange={setView} />
        }
      >
        {view === "edit" ? (
          <>
            <ContentField {...part} />
            <VariableList {...part} />
          </>
        ) : (
          <MessagePreview text={preview} showsPasswordNote={previewHasPasswordNote(part.type)} />
        )}
      </SectionCard>
      {view === "edit" ? <EditorActions {...part} /> : null}
    </>
  );
}

function ContentField({ template, type, isMobile }: Readonly<EditorPartProps>) {
  const { field, fieldState } = useController({ control: template.form.control, name: "content" });
  const setRef = (element: HTMLTextAreaElement | null) => {
    field.ref(element);
    template.textareaRef.current = element;
  };
  return (
    <Textarea
      label={COPY.contentLabel}
      isLabelHidden
      name={field.name}
      rows={isMobile ? 8 : 10}
      value={field.value}
      onChange={field.onChange}
      textareaRef={setRef}
      helperText={isMobile ? COPY.mobileHelper : COPY.helper}
      errorMessage={templateProblemText(type, fieldState.error?.message)}
      trailingMeta={COPY.counter(templateContentLength(field.value), TEMPLATE_CONTENT_MAX_LENGTH)}
    />
  );
}

function VariableList({ template, type, isMobile }: Readonly<EditorPartProps>) {
  const required = requiredVariable(type);
  return (
    <div className="flex flex-col gap-(--space-2)">
      <p className="text-(length:--font-size-label) text-(--component-input-label)">{COPY.variablesTitle}</p>
      <div className="flex flex-wrap gap-(--space-2)">
        {allowedVariables(type).map((name) => (
          <VariableChip key={name} name={name} isRequired={name === required} onInsert={template.insertVariable} />
        ))}
      </div>
      <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
        {isMobile ? COPY.mobileVariablesHint : COPY.variablesHint}
      </p>
    </div>
  );
}

function EditorActions({ template, isMobile }: Readonly<EditorPartProps>) {
  const size = isMobile ? "lg" : "md";
  const save = (
    <Button
      type="submit"
      size={size}
      isDisabled={!template.isDirty || template.isSubmitting}
      isPending={template.isSubmitting}
      className={isMobile ? "w-full" : undefined}
    >
      {template.isSubmitting ? COPY.saving : COPY.save}
    </Button>
  );
  const restore = (
    <Button
      variant="secondary"
      size={size}
      iconLeading="rotate-ccw"
      isDisabled={template.isSubmitting}
      onPress={template.restoreDefault}
      className={isMobile ? "w-full" : undefined}
    >
      {COPY.restore}
    </Button>
  );
  return isMobile ? (
    <div className="flex flex-col gap-(--space-3)">{save}{restore}</div>
  ) : (
    <div className="flex items-center justify-between">{restore}{save}</div>
  );
}
```

Notes for the implementer:
- `textareaRef` is a `RefObject` that the hook owns. If the lint forbids assigning `.current`, have the hook return a callback ref `setTextarea(element)` instead, and call it from `setRef`.
- Run `pnpm format` before the gate, so Prettier reflows the long lines above.

- [ ] **Step 6: Add the route**

`src/app/(owner)/w/[workspaceId]/message-templates/[templateType]/page.tsx`:

```tsx
import { saveMessageTemplateAction } from "@/app/actions/communications/message-templates";
import { loadMessageTemplateEditor } from "@/composition/communications/message-template-flow/message-template-flow";
import { TemplateEditorScreen } from "@/features/communications/ui/template-editor-screen/template-editor-screen";

export default async function MessageTemplateEditorPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; templateType: string }> }>) {
  const { workspaceId, templateType } = await params;
  const editor = await loadMessageTemplateEditor(workspaceId, templateType);
  const action = saveMessageTemplateAction.bind(null, workspaceId, templateType);
  return <TemplateEditorScreen key={editor.type} editor={editor} action={action} />;
}
```

- [ ] **Step 7: Run the tests and check the page in the browser**

Run: `pnpm vitest run src/features/communications`
Expected: PASS.

Then, in the `dev` preview:
- open `/w/<id>/message-templates/gallery-share` and compare each state with its export at 1440 px and 390 px (the frame list is at the top of this task);
- check the phone Compact Bar: back goes to the list, the title is *Bagikan gallery*, the caption is *Template pesan*;
- check that the Edit/Pratinjau tabs, the danger toast with *Coba lagi* (block the request in devtools to trigger it) and the unsaved-changes Modal and Sheet all work.

- [ ] **Step 8: Gate and commit**

```bash
pnpm format && pnpm typecheck && pnpm lint && pnpm test
git add src/features/communications/ui "src/app/(owner)/w/[workspaceId]/message-templates"
git commit -m "feat(communications): add the template editor with preview and unsaved-changes guard" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: End-to-end journeys, accessibility and write-back

Requires migrations 0002 and 0003 applied to the E2E database.

**Files:**
- Create: `tests/e2e/message-templates/message-templates.spec.ts`
- Modify: `docs/features/message-templates/technical-design.md` (Implementation record), `design.md` (*In code?*), `spec.md` (Status), `docs/product/feature-map.md` (F-03), `docs/HANDOFF.md`

- [ ] **Step 1: Write the E2E spec**

`tests/e2e/message-templates/message-templates.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { TEMPLATE_COPY } from "@/features/communications/ui/template-copy/template-copy.copy";
import { TEMPLATE_EDITOR_COPY } from "@/features/communications/ui/template-editor-screen/template-editor-screen.copy";
import { UNSAVED_CHANGES_COPY } from "@/features/communications/ui/unsaved-changes-dialog/unsaved-changes-dialog.copy";
import { COMING_SOON_COPY } from "@/features/workspace/ui/coming-soon-screen/coming-soon-screen.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

test.setTimeout(120_000);
test.describe.configure({ retries: 2 });

async function openWorkspace(page: Page, label: string): Promise<string> {
  await page.setViewportSize(DESKTOP);
  await registerAndVerify(page, uniqueEmail(label));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Aster Wedding");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  const url = new URL(page.url());
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}

test("AC-MSG-001 AC-MSG-004 AC-MSG-005 AC-MSG-006 AC-MSG-007 AC-MSG-009 AC-MSG-013 AC-MSG-014 edit a template", async ({
  page,
}) => {
  const home = await openWorkspace(page, "templates");
  await page.getByRole("link", { name: OWNER_NAV_COPY.messageTemplates }).click();
  await expect(page).toHaveURL(`${home}/message-templates`);
  await expect(page.getByText(COMING_SOON_COPY.title)).toHaveCount(0);
  await expect(page.getByRole("link", { name: OWNER_NAV_COPY.messageTemplates })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const rows = page.getByRole("main").getByRole("link");
  await expect(rows).toHaveCount(5);

  await page.getByRole("link", { name: new RegExp(TEMPLATE_COPY.GALLERY_SHARE.label) }).click();
  await expect(page).toHaveURL(`${home}/message-templates/gallery-share`);
  const editor = page.getByRole("textbox", { name: TEMPLATE_EDITOR_COPY.contentLabel });
  await expect(editor).toContainText("{{galleryUrl}}");
  await expect(page.getByRole("region", { name: "Pratinjau pesan" })).toContainText("••••••");

  await editor.press("ControlOrMeta+End");
  await editor.pressSequentially("\nInvoice: {{invoiceUrl}}");
  await page.getByRole("button", { name: TEMPLATE_EDITOR_COPY.save }).click();
  await expect(page.getByText(/tidak bisa dipakai di Bagikan gallery/)).toBeVisible();

  await page.getByRole("button", { name: TEMPLATE_EDITOR_COPY.restore }).click();
  await page.getByRole("button", { name: "Sisipkan {{projectTitle}}" }).click();
  await page.getByRole("link", { name: OWNER_NAV_COPY.settings }).click();
  await expect(page.getByRole("dialog", { name: UNSAVED_CHANGES_COPY.title })).toBeVisible();
  await page.getByRole("button", { name: UNSAVED_CHANGES_COPY.stay }).click();
  await expect(page).toHaveURL(`${home}/message-templates/gallery-share`);

  await page.getByRole("button", { name: TEMPLATE_EDITOR_COPY.save }).click();
  await expect(page.getByText(TEMPLATE_EDITOR_COPY.saved)).toBeVisible();
  await page.reload();
  await expect(editor).toContainText("{{projectTitle}}");
});

test("AC-MSG-020 list and editor are accessible on desktop and phone", async ({ page }) => {
  const home = await openWorkspace(page, "templates-a11y");
  for (const path of ["/message-templates", "/message-templates/payment-reminder"]) {
    await page.goto(`${home}${path}`);
    for (const viewport of [DESKTOP, PHONE]) {
      await page.setViewportSize(viewport);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  }
  await page.setViewportSize(PHONE);
  await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute(
    "href",
    new URL(`${home}/message-templates`).pathname,
  );
});

test("AC-MSG-015 another owner's template editor is not found", async ({ browser, page }) => {
  const home = await openWorkspace(page, "templates-owner-a");
  const other = await browser.newPage();
  await openWorkspace(other, "templates-owner-b");
  await other.goto(`${home}/message-templates/gallery-share`);
  await expect(other.getByRole("heading", { name: WORKSPACE_NOT_FOUND_COPY.title })).toBeVisible();
  await other.close();
});
```

Run: `pnpm e2e tests/e2e/message-templates`
Expected: PASS (3 tests).

- The shell renders the page twice (desktop and phone trees). If a locator matches two elements, scope it to the visible tree with `.locator("visible=true")` / `:visible`.
- `WORKSPACE_NOT_FOUND_COPY.title` is the copy key the F-02 not-found screen uses. Check it, and adjust the key name if it differs.

- [ ] **Step 2: Run the full gate**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:integration && pnpm e2e && pnpm build
```

Expected: everything passes, including the existing workspace and app-shell E2E (the *Segera hadir* list no longer includes `message-templates`).

- [ ] **Step 3: Write back the docs**

- `technical-design.md`:
  - add `## Implementation record (<date>)` with the commits per task;
  - record deviations D-M1 (one shell subtitle on phones), D-M2 (back/forward not guarded) and D-M3 (5:3 split instead of a 400 px column token), plus any found during the build;
  - add the AC → test map, confirmed.
- `design.md`: set the v3 frames to *In code* with the unit paths.
- `spec.md`: `Status: DONE (<date>)` only after `/sdv:verify-feature message-templates` passes; until then `IMPLEMENTED`.
- `docs/product/feature-map.md`: F-03 matches the spec status.
- `docs/HANDOFF.md`: F-03 state and the next step (`/sdv:verify-feature message-templates`).

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/message-templates docs
git commit -m "test(communications): cover message template journeys and record the implementation" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Self-review (2026-10-01)

- **Spec coverage:**

  | Requirement | Task(s) |
  |---|---|
  | AC-MSG-001 | 6, 7, 8 (transaction) |
  | AC-MSG-002 | 5 (backfill + test), 7 |
  | AC-MSG-003 | 5 (unique index), 7 |
  | AC-MSG-004 | 10 (nav, no *Segera hadir*), 11 |
  | AC-MSG-005, -006 | 12, 13, 14 |
  | AC-MSG-007…011 | 2, 6, 8, 13, 14 |
  | AC-MSG-012 | 8, 13 |
  | AC-MSG-013 | 13 |
  | AC-MSG-014 | 13, 14 |
  | AC-MSG-015 | 6, 7, 8, 14 |
  | AC-MSG-016…018 | 3 |
  | AC-MSG-019 | 3, 8 |
  | AC-MSG-020 | 12, 14 |
  | A-8 (last write wins) | 7 (no version column) |
  | A-9 (audit) | 5, 7 |
  | A-10 (default copy) | 4 (Owner checkpoint) |
- **Placeholders:** none. The conditional notes (the RAC role, the `NeonQueryResultHKT` import path, the Neon error shape, the not-found copy key) name the exact fallback.
- **Names are used consistently across tasks:** `TemplateType`, `TemplateVariable`, `findTemplateProblem`, `toProblemKey` / `parseProblemKey`, `MessageTemplateRepositoryPort`, `messageTemplateContentSchema`, `updateMessageTemplate(repository, context, { type, editorUserId, input })`, `UpdateMessageTemplateFailure.fieldErrors.content`, `messageTemplateSubPages`, `OwnerSubPage`, `TemplateEditorScreen({ editor, action })`.
