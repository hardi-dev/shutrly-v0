# Storybook Component Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only Storybook explorer for Shutrly's implemented UI components, themes, and canonical design tokens.

**Architecture:** Storybook runs beside the Next.js application through `@storybook/nextjs-vite`. Stories are colocated with React UI units, while a dedicated token explorer reads `docs/design-system/tokens.json` without duplicating token values. Existing Markdown specs and the token generator remain authoritative.

**Tech Stack:** Next.js 16.3.6, React 19.3.0, TypeScript 6.0.3, Vite 8.3.1, Vitest 5.0.2, Tailwind CSS 4.3.3, React Aria Components 1.21.1, Storybook 10.6.0 with the Next.js Vite framework, Storybook Controls and a11y.

## Global Constraints

- Storybook is local-only; do not add a production route or deployment configuration.
- `docs/design-system/tokens.json` remains the token source of truth; do not copy token values into stories or explorer data.
- `docs/design-system/components/*.md` remains normative for component anatomy, usage, and accessibility guidance.
- Run the relevant Next.js agent guide from `node_modules/next/dist/docs/` before changing Next.js-related configuration.
- Preserve the fixed folder architecture and colocate tests with units.
- Use `pnpm`, pin newly added package versions exactly, and do not run `pnpm db:migrate`.
- UI copy in `.tsx` belongs in a `.copy.ts` sibling when it is user-facing; story-only labels and test fixtures are permitted in story/test files.
- Every task ends with a conventional English lowercase commit without a trailing period.
- Do not edit `.pen` files directly.

---

## File map

### Storybook configuration

- Create: `.storybook/main.ts` — Storybook framework, story globs, addons, and static configuration.
- Create: `.storybook/preview.tsx` — global styles, providers, theme toolbar, and decorators.
- Modify: `package.json` — local Storybook scripts and exact dev dependencies.
- Modify: `pnpm-lock.yaml` — generated lockfile changes.

### Shared Storybook support

- Create: `src/ui/storybook/theme.types.ts` — theme union used by the preview decorator.
- Create: `src/ui/storybook/theme.tsx` — pure theme wrapper used by stories.
- Create: `src/ui/storybook/theme.test.tsx` — theme wrapper behavior test.

### Component stories

- Create: `src/ui/primitives/button/button.stories.tsx` — Button examples and states.
- Create: `src/ui/primitives/button/button.stories.copy.ts` — story-only Button labels.
- Create: `src/ui/primitives/text-field/text-field.stories.tsx` — TextField examples and states.
- Create: `src/ui/primitives/text-field/text-field.stories.copy.ts` — story-only TextField labels and messages.

### Token explorer

- Create: `src/ui/explorer/tokens/token-explorer.types.ts` — flattened token view types.
- Create: `src/ui/explorer/tokens/token-data.ts` — canonical JSON flattening and CSS variable naming.
- Create: `src/ui/explorer/tokens/token-data.test.ts` — token flattening tests against fixtures and the real payload.
- Create: `src/ui/explorer/tokens/token-explorer.tsx` — searchable/filterable token display.
- Create: `src/ui/explorer/tokens/token-explorer.copy.ts` — token explorer labels and empty-state copy.
- Create: `src/ui/explorer/tokens/token-explorer.test.tsx` — token explorer rendering and filtering tests.
- Create: `src/ui/explorer/tokens/token-explorer.stories.tsx` — Storybook entry for the explorer.

### Documentation

- Modify: `docs/design-system/components/button.md` — add the Storybook story reference after implementation.
- Modify: `docs/design-system/components/text-field.md` — add the Storybook story reference after implementation.
- Modify: `docs/design-system/token-usage.md` — add the local explorer command and explain that token data is generated from the canonical JSON.

---

### Task 1: Install and configure local Storybook

**Files:**
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces `pnpm storybook` for local development and `pnpm storybook:build` for local artifact verification.
- Produces a Storybook configuration using `@storybook/nextjs-vite` and story discovery under `src/**/*.stories.@(ts|tsx|mdx)`.

- [ ] **Step 1: Read the current Next.js agent guide and inspect the existing gates**

Run:

```bash
find node_modules/next/dist/docs -type f -maxdepth 3 -print | sort
rg -n "Storybook|Vite|App Router|CSS" node_modules/next/dist/docs
sed -n '1,220p' package.json
```

Expected: the applicable Next.js guide is identified; no existing Storybook configuration is present.

- [ ] **Step 2: Add the exact Storybook packages and scripts**

Use the Storybook 10.6.0 CLI's Next.js Vite setup, then pin all Storybook packages at 10.6.0 in `package.json` and the lockfile:

```bash
pnpm create storybook@10.6.0 --type nextjs --builder vite
pnpm add -DE storybook@10.6.0 @storybook/nextjs-vite@10.6.0 @storybook/addon-a11y@10.6.0 @storybook/addon-docs@10.6.0
```

The final scripts must be equivalent to:

```json
{
  "storybook": "storybook dev -p 6006",
  "storybook:build": "storybook build"
}
```

Remove generated example stories and any configuration not needed for this project. Keep only the exact Storybook packages required by the generated config, docs, controls, and a11y.

- [ ] **Step 3: Write the minimal Storybook configuration**

`.storybook/main.ts` must have this shape, with the installed framework version determining the imported type:

```ts
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  docs: { autodocs: "tag" },
};

export default config;
```

Storybook 10 is ESM-only, so keep `.storybook/main.ts` and `.storybook/preview.tsx` as ESM-compatible TypeScript modules. Do not add unrelated addons.

- [ ] **Step 4: Add a temporary smoke story and start Storybook**

Create a temporary story under `src/ui/storybook/storybook-smoke.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = { title: "Internal/Storybook smoke" } satisfies Meta;
export default meta;

export const Ready: StoryObj<typeof meta> = {
  render: () => <p>Storybook ready</p>,
};
```

Run:

```bash
pnpm storybook --ci
```

Expected: Storybook starts or builds without configuration errors and discovers the smoke story. Remove the temporary story after the configuration is proven.

- [ ] **Step 5: Run formatting and type checks**

Run:

```bash
pnpm exec prettier --check .storybook package.json
pnpm typecheck
```

Expected: PASS. If the Storybook config is not included in the existing typecheck glob, run the Storybook type validation command supplied by the installed version and record the command in the plan worklog.

- [ ] **Step 6: Commit**

```bash
git add .storybook package.json pnpm-lock.yaml
git commit -m "chore(ui): add local storybook explorer"
```

---

### Task 2: Add shared theme and provider setup

**Files:**
- Create: `src/ui/storybook/theme.types.ts`
- Create: `src/ui/storybook/theme.tsx`
- Create: `src/ui/storybook/theme.test.tsx`
- Modify: `.storybook/preview.tsx`

**Interfaces:**
- `ThemeMode = "light" | "dark"`.
- `ThemeFrame({ mode, children }: { mode: ThemeMode; children: ReactNode }): JSX.Element` renders a wrapper with `data-theme={mode}` and the approved canvas/text tokens.

- [ ] **Step 1: Write the failing unit test**

Add tests covering both theme values:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeFrame } from "./theme";

describe("ThemeFrame", () => {
  it.each(["light", "dark"] as const)("sets the %s theme", (mode) => {
    render(
      <ThemeFrame mode={mode}>
        <span>content</span>
      </ThemeFrame>,
    );

    expect(screen.getByText("content").parentElement).toHaveAttribute("data-theme", mode);
  });
});
```

Run:

```bash
pnpm vitest run src/ui/storybook/theme.test.tsx
```

Expected: FAIL because `ThemeFrame` does not exist.

- [ ] **Step 2: Implement the minimal theme wrapper**

`theme.types.ts`:

```ts
import type { ReactNode } from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeFrameProps {
  mode: ThemeMode;
  children: ReactNode;
}
```

`theme.tsx`:

```tsx
import type { ThemeFrameProps } from "./theme.types";

export function ThemeFrame({ mode, children }: Readonly<ThemeFrameProps>) {
  return (
    <div data-theme={mode} className="min-h-screen bg-(--color-semantic-surface-canvas) p-(--space-6) text-(--color-semantic-text-primary)">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Make the test pass and wire the preview**

Run the focused test, then configure `.storybook/preview.tsx` with the generated CSS, `AppProviders`, and a light/dark toolbar. The decorator must pass `context.globals.theme` to `ThemeFrame`; default to `light`.

```tsx
import "../src/app/globals.css";

import type { Decorator, Preview } from "@storybook/nextjs-vite";

import { AppProviders } from "../src/ui/providers/app-providers";
import { ThemeFrame } from "../src/ui/storybook/theme";

const withTheme: Decorator = (Story, context) => {
  const mode = context.globals.theme === "dark" ? "dark" : "light";
  return (
    <AppProviders>
      <ThemeFrame mode={mode}>
        <Story />
      </ThemeFrame>
    </AppProviders>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for the Shutrly design system",
      defaultValue: "light",
      toolbar: { icon: "paintbrush", items: ["light", "dark"] },
    },
  },
  decorators: [withTheme],
  parameters: { layout: "fullscreen" },
};

export default preview;
```

Adjust only import syntax required by the installed Storybook major. Do not add another theme implementation.

- [ ] **Step 4: Run focused and project gates**

```bash
pnpm vitest run src/ui/storybook/theme.test.tsx
pnpm typecheck
pnpm lint
```

Expected: all PASS, including `pnpm tokens:check` through lint.

- [ ] **Step 5: Commit**

```bash
git add .storybook/preview.tsx src/ui/storybook
git commit -m "feat(ui): add storybook theme frame"
```

---

### Task 3: Add Button and TextField stories

**Files:**
- Create: `src/ui/primitives/button/button.stories.tsx`
- Create: `src/ui/primitives/text-field/text-field.stories.tsx`

**Interfaces:**
- Stories import the production `Button` and `TextField`; they must not reimplement their styles.
- Stories expose controls inferred from the component props and use stable named render handlers where the lint rules require them.

- [ ] **Step 1: Add Button stories**

Create `src/ui/primitives/button/button.stories.copy.ts` with named story labels, then use those constants from the story file so the existing `local/ui-copy` lint rule remains satisfied:

```ts
export const BUTTON_STORY_COPY = {
  cancel: "Batal",
  disabled: "Tidak tersedia",
  save: "Simpan",
} as const;
```

Create stories with the following coverage:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";

import { BUTTON_STORY_COPY } from "./button.stories.copy";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary"] },
    isDisabled: { control: "boolean" },
  },
  parameters: {
    designSystemSpec: "docs/design-system/components/button.md",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: BUTTON_STORY_COPY.save, variant: "primary" } };
export const Secondary: Story = { args: { children: BUTTON_STORY_COPY.cancel, variant: "secondary" } };
export const Disabled: Story = {
  args: { children: BUTTON_STORY_COPY.disabled, variant: "primary", isDisabled: true },
};
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-4)">
      <Button variant="primary">{BUTTON_STORY_COPY.save}</Button>
      <Button variant="secondary">{BUTTON_STORY_COPY.cancel}</Button>
    </div>
  ),
};
```

If the installed Storybook type rejects `designSystemSpec`, keep it as an untyped custom parameter only when the framework's type permits custom parameters; otherwise omit that parameter and add the link in the generated docs block.

- [ ] **Step 2: Add TextField stories**

Create `src/ui/primitives/text-field/text-field.stories.copy.ts` first:

```ts
export const TEXT_FIELD_STORY_COPY = {
  email: "Email",
  emailError: "Masukkan email yang valid.",
  emailHelper: "Gunakan email yang aktif.",
  name: "Nama proyek",
  password: "Password",
  project: "Prewedding Adit & Naya",
  workspace: "Workspace",
  workspaceValue: "Shutrly Studio",
} as const;
```

Then create `src/ui/primitives/text-field/text-field.stories.tsx` with controlled state in named render functions. Use the production `TextField` API exactly as defined in `text-field.types.ts`:

```tsx
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TextField } from "./text-field";

import { TEXT_FIELD_STORY_COPY } from "./text-field.stories.copy";

const meta = {
  title: "Primitives/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    designSystemSpec: "docs/design-system/components/text-field.md",
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

function EmptyRender() {
  const [value, setValue] = useState("");
  return <TextField label={TEXT_FIELD_STORY_COPY.name} value={value} onChange={setValue} />;
}

function HelperRender() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label={TEXT_FIELD_STORY_COPY.email}
      type="email"
      value={value}
      onChange={setValue}
      description={TEXT_FIELD_STORY_COPY.emailHelper}
    />
  );
}

function InvalidRender() {
  const [value, setValue] = useState("not-an-email");
  return (
    <TextField
      label={TEXT_FIELD_STORY_COPY.email}
      type="email"
      value={value}
      onChange={setValue}
      errorMessage={TEXT_FIELD_STORY_COPY.emailError}
    />
  );
}

function ReadOnlyRender() {
  return (
    <TextField
      label={TEXT_FIELD_STORY_COPY.workspace}
      value={TEXT_FIELD_STORY_COPY.workspaceValue}
      isReadOnly
      onChange={handleStoryChange}
    />
  );
}

function handleStoryChange() {
  return undefined;
}

export const Empty: Story = { render: EmptyRender };
export const Filled: Story = {
  args: {
    label: TEXT_FIELD_STORY_COPY.name,
    value: TEXT_FIELD_STORY_COPY.project,
    onChange: handleStoryChange,
  },
};
export const WithHelper: Story = { render: HelperRender };
export const Invalid: Story = { render: InvalidRender };
export const ReadOnly: Story = { render: ReadOnlyRender };
export const Password: Story = {
  args: {
    label: TEXT_FIELD_STORY_COPY.password,
    type: "password",
    value: "secret",
    onChange: handleStoryChange,
  },
};
```

The story-only no-op handlers are intentional fixtures for controlled examples. If the project's lint rejects inline no-op handlers, replace them with a module-level `handleStoryChange` function. If the installed Storybook type rejects `designSystemSpec`, omit that custom parameter and place the Markdown path in the generated docs description instead.

- [ ] **Step 3: Run the story typecheck and existing component tests**

```bash
pnpm typecheck
pnpm vitest run src/ui/primitives/button/button.test.tsx src/ui/primitives/text-field/text-field.test.tsx
pnpm lint
```

Expected: PASS. Story files must not introduce copy-rule, import-boundary, or inline-handler violations.

- [ ] **Step 4: Start Storybook and inspect the initial stories**

```bash
pnpm storybook
```

Inspect `Primitives/Button` and `Primitives/TextField` in both toolbar themes. Verify the controls render, the focus ring is visible, and invalid TextField state shows the existing error treatment.

- [ ] **Step 5: Commit**

```bash
git add src/ui/primitives/button/button.stories.tsx src/ui/primitives/text-field/text-field.stories.tsx
git commit -m "feat(ui): document primitive stories"
```

---

### Task 4: Build the canonical token data adapter

**Files:**
- Create: `src/ui/explorer/tokens/token-explorer.types.ts`
- Create: `src/ui/explorer/tokens/token-data.ts`
- Create: `src/ui/explorer/tokens/token-data.test.ts`

**Interfaces:**
- `TokenMode = "light" | "dark"`.
- `TokenRecord = { path: string; cssName: string; type: string | undefined; light: string | number | undefined; dark: string | number | undefined; alias: string | undefined; description: string | undefined }`.
- `flattenTokens(payload: unknown): readonly TokenRecord[]` recursively reads DTCG groups and token objects.
- `toCssVariableName(path: string): string` converts `color.semantic.surface.canvas` to `--color-semantic-surface-canvas`.

- [ ] **Step 1: Write failing tests for flattening and CSS names**

Use a small fixture plus the real token file:

```ts
import { describe, expect, it } from "vitest";

import tokens from "../../../../../docs/design-system/tokens.json";

import { flattenTokens, toCssVariableName } from "./token-data";

describe("toCssVariableName", () => {
  it("uses the token path format used by tokens.css", () => {
    expect(toCssVariableName("color.semantic.surface.canvas")).toBe(
      "--color-semantic-surface-canvas",
    );
    expect(toCssVariableName("space.0-5")).toBe("--space-0-5");
  });
});

describe("flattenTokens", () => {
  it("keeps aliases and mode values in one record", () => {
    const records = flattenTokens({
      color: {
        $type: "color",
        semantic: {
          canvas: {
            $value: "{color.primitive.neutral.0}",
            $extensions: { "dev.pen.modes": { dark: "{color.primitive.neutral.950}" } },
          },
        },
      },
    });

    expect(records).toEqual([
      expect.objectContaining({
        path: "color.semantic.canvas",
        alias: "color.primitive.neutral.0",
        dark: "{color.primitive.neutral.950}",
      }),
    ]);
  });

  it("flattens the canonical token payload", () => {
    const records = flattenTokens(tokens);
    expect(records.length).toBeGreaterThan(400);
    expect(records.find((record) => record.path === "color.semantic.surface.canvas")).toBeDefined();
  });
});
```

Run:

```bash
pnpm vitest run src/ui/explorer/tokens/token-data.test.ts
```

Expected: FAIL because the adapter is not implemented.

- [ ] **Step 2: Implement the typed adapter without hard-coded token records**

Implement recursive traversal over object entries. Treat an object with `$value` as a leaf; inherit `$type` from the nearest group; read the dark value from `$extensions["dev.pen.modes"].dark`; preserve aliases as the raw reference string without resolving it; and sort records by `path` before returning them.

The CSS name helper must split on `.` only and prefix `--`. It must not transform or rename token segments.

- [ ] **Step 3: Run the adapter tests and token gate**

```bash
pnpm vitest run src/ui/explorer/tokens/token-data.test.ts
pnpm tokens:check
```

Expected: PASS. The adapter must not modify `tokens.json` or `tokens.css`.

- [ ] **Step 4: Commit**

```bash
git add src/ui/explorer/tokens/token-explorer.types.ts src/ui/explorer/tokens/token-data.ts src/ui/explorer/tokens/token-data.test.ts
git commit -m "feat(ui): expose canonical token records"
```

---

### Task 5: Build the token explorer story

**Files:**
- Create: `src/ui/explorer/tokens/token-explorer.tsx`
- Create: `src/ui/explorer/tokens/token-explorer.test.tsx`
- Create: `src/ui/explorer/tokens/token-explorer.stories.tsx`

**Interfaces:**
- `TokenExplorer({ records }: { records: readonly TokenRecord[] }): JSX.Element` renders the explorer.
- The component owns only view/filter state; token records remain immutable input.
- Search matches token path, CSS name, alias, or description case-insensitively.
- Category filters are derived from the first path segment; no category list is hard-coded.

- [ ] **Step 1: Write failing component tests**

Cover initial rendering, search filtering, category filtering, light/dark columns, alias display, and empty results. Use a three-record fixture with one color token, one spacing token, and one dark-mode alias.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TokenExplorer } from "./token-explorer";
import type { TokenRecord } from "./token-explorer.types";

const records: readonly TokenRecord[] = [
  {
    path: "color.semantic.surface.canvas",
    cssName: "--color-semantic-surface-canvas",
    type: "color",
    light: "#ffffff",
    dark: "#09090b",
    alias: undefined,
    description: "Page canvas",
  },
  {
    path: "space.4",
    cssName: "--space-4",
    type: "dimension",
    light: 16,
    dark: undefined,
    alias: undefined,
    description: "Sibling gap",
  },
  {
    path: "color.semantic.text.primary",
    cssName: "--color-semantic-text-primary",
    type: "color",
    light: "{color.primitive.neutral.900}",
    dark: "{color.primitive.neutral.50}",
    alias: "color.primitive.neutral.900",
    description: "Primary text",
  },
];

describe("TokenExplorer", () => {
  it("filters by search text", async () => {
    const user = userEvent.setup();
    render(<TokenExplorer records={records} />);

    await user.type(screen.getByRole("searchbox", { name: /search tokens/i }), "canvas");

    expect(screen.getByText("color.semantic.surface.canvas")).toBeVisible();
    expect(screen.queryByText("space.4")).not.toBeInTheDocument();
  });

  it("shows light, dark, alias, and CSS variable data", () => {
    render(<TokenExplorer records={records} />);

    expect(screen.getByText("Light")).toBeVisible();
    expect(screen.getByText("Dark")).toBeVisible();
    expect(screen.getByText("--color-semantic-surface-canvas")).toBeVisible();
    expect(screen.getByText("color.primitive.neutral.900")).toBeVisible();
  });
});
```

Run:

```bash
pnpm vitest run src/ui/explorer/tokens/token-explorer.test.tsx
```

Expected: FAIL because the explorer is not implemented.

- [ ] **Step 2: Implement the minimal accessible explorer**

Create `token-explorer.copy.ts` with the fixed internal labels and empty-state message, then render a labelled search input, a category select derived from records, and a table with token path, type, light, dark, CSS variable, and alias columns. Use semantic table markup, a visible empty state, and a color swatch only for records whose type is `color` and whose value is a literal color. Import every user-facing label from the copy sibling so `local/ui-copy` remains satisfied.

Do not add pagination, editing, export, or token mutation. Keep the component under the existing token utility boundary and use design-system tokens for its own styling.

- [ ] **Step 3: Add the Storybook entry**

Create `token-explorer.stories.tsx` that imports `tokens.json`, calls `flattenTokens(tokens)`, and passes the result to `TokenExplorer`. The story must not define token records inline:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import tokens from "../../../../docs/design-system/tokens.json";

import { TokenExplorer } from "./token-explorer";
import { flattenTokens } from "./token-data";

const meta = {
  title: "Design System/Tokens",
  component: TokenExplorer,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TokenExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTokens: Story = {
  args: { records: flattenTokens(tokens) },
};
```

- [ ] **Step 4: Run focused tests and inspect the story**

```bash
pnpm vitest run src/ui/explorer/tokens/token-data.test.ts src/ui/explorer/tokens/token-explorer.test.tsx
pnpm typecheck
pnpm lint
```

Start Storybook and verify search, category filtering, light/dark toolbar switching, aliases, and color swatches against the real 479-token payload.

- [ ] **Step 5: Commit**

```bash
git add src/ui/explorer/tokens
git commit -m "feat(ui): add storybook token explorer"
```

---

### Task 6: Link the explorer to design-system documentation and verify the complete setup

**Files:**
- Modify: `docs/design-system/components/button.md`
- Modify: `docs/design-system/components/text-field.md`
- Modify: `docs/design-system/token-usage.md`
- Modify: `docs/HANDOFF.md` only if the active handoff needs a status update after verification.

**Interfaces:**
- Documentation links identify the local Storybook story titles and the command `pnpm storybook`.
- No design-system source-of-truth files are regenerated by this task.

- [ ] **Step 1: Add concise cross-links**

Add to the Button and TextField specs a short “Local explorer” note pointing to their Storybook titles. Add to `token-usage.md` a short “Local explorer” section stating:

```md
## Local explorer

Run `pnpm storybook` to inspect implemented components and the token gallery locally. Storybook reads the real React components and the canonical `docs/design-system/tokens.json`; it is an exploration surface, not a replacement for these usage rules or component specs.
```

- [ ] **Step 2: Run all required verification**

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm storybook:build
```

Expected: all commands PASS. The Storybook build must discover Button, TextField, and Tokens without requiring database variables or a running application server.

- [ ] **Step 3: Review the final diff and check source-of-truth boundaries**

Run:

```bash
git diff --check HEAD~6..HEAD
rg -n '"#|rgba\(|rgb\(|--[a-z-]+:' src/ui/explorer/tokens src/ui/primitives/*.stories.tsx
git status --short
```

Expected: no whitespace errors; no copied token catalog or hard-coded visual token values in the new stories/explorer; only intended files are modified.

- [ ] **Step 4: Commit the documentation links**

```bash
git add docs/design-system/components/button.md docs/design-system/components/text-field.md docs/design-system/token-usage.md
git commit -m "docs(design-system): link local storybook explorer"
```

---

## Plan self-review

- Spec coverage: local-only Storybook, Next.js Vite framework, controls, docs/source, a11y, theme switching, canonical token explorer, Markdown authority, no production route, and verification are covered by Tasks 1–6.
- Placeholder scan: no TBD, TODO, FIXME, or unresolved version placeholders remain; Storybook is pinned to 10.6.0.
- Type consistency: `ThemeMode`, `ThemeFrame`, `TokenRecord`, `flattenTokens`, `toCssVariableName`, and `TokenExplorer` are defined before consumers use them.
- Architecture check: story files are colocated with components; explorer units have a dedicated folder and tests; generated `tokens.css` remains untouched.
