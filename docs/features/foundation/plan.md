# F-00 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the repository a runnable, testable Next.js scaffold that provides exactly the contracts F-01 Auth consumes, plus the tenant-isolation building blocks, behind a green local quality gate.

**Architecture:**
- The folder layout follows the approved folder architecture: `app → composition → features/*/application → features/*/domain`, with vendors in `adapters/`, shared visuals in `ui/`, and cross-feature code in `shared/`.
- Cloudflare Workers is reached through OpenNext. A request context wraps `getCloudflareContext()`.
- Every request gets its own Neon `Pool` + Drizzle instance, and the pool is closed with `waitUntil` after the work.
- Design tokens are generated into CSS variables and consumed by React Aria wrappers styled with Tailwind v4.

**Tech Stack:** Next.js 16.3.6 (App Router, Turbopack) · React 19.3 · TypeScript 6.0.3 strict · @opennextjs/cloudflare 1.20.6 + Wrangler 4.141 · Drizzle ORM 0.45.3 / drizzle-kit 0.31.11 · @neondatabase/serverless 1.1.0 · Zod 4.6.5 · React Aria Components 1.21.1 · Tailwind CSS 4.3.3 · Vitest 5.0.2 (+ Vite 8.3.1, jsdom 30.1.1, Testing Library) · Playwright 1.63.0 · ESLint 9.39.5 + eslint-config-next 16.3.6 + typescript-eslint 8.70.1 (`strictTypeChecked`) + boundaries / SonarJS / simple-import-sort / eslint-comments · Prettier 3.9.9 · clsx + tailwind-merge · pnpm 10.

**Source documents (read before starting any task):** [spec.md](spec.md) · [acceptance-criteria.md](acceptance-criteria.md) · [technical-design.md](technical-design.md) · [constitution](../../constitution.md) · [coding rules v2.0](../../coding-rules.md) · [architecture overview](../../architecture/overview.md) · [auth/plan.md › F-00 contracts](../auth/plan.md).

## Global Constraints

- **Pins:** every dependency is pinned exactly (`pnpm add -E`) to the versions in technical-design.md › *Verified versions*.
  - TypeScript stays on **6.0.3**, because `typescript-eslint` needs `<6.1.0`.
  - ESLint stays on **9.39.5**, because the Next plugins peer on `eslint ^9`.
- **Package manager:** pnpm 10, Node 22. `pnpm.onlyBuiltDependencies` must allow `esbuild`, `sharp`, `workerd` and `@tailwindcss/oxide`.
- **Database connections:** one Neon `Pool` per request, created only in `src/adapters/db/client/client.ts`. It's closed with `waitUntil(pool.end())` **after** the work, in `finally`. Never create a module-level pool (ADR-009).
- **Env files:**
  - `.dev.vars` is for `next dev`, `pnpm preview` and `drizzle-kit`. It holds `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `APP_STAGE=development`.
  - `.env.test` is for integration tests. It holds `DATABASE_URL` and `APP_STAGE=test`.
  - Both are git-ignored and use **non-production values only**.
- **Migrations:** Drizzle generates them into `drizzle/`, where they're reviewed and committed. Only the Owner applies them, by hand, from a clean `main` (tech-stack interim rule). Never edit an applied migration.
- **No secrets in output:** env errors name the key, never the value. The logger redacts by key and scrubs URLs out of errors (C-103).
- **Coding rules v2.0 apply to every line** ([coding-rules.md](../../coding-rules.md)). The ESLint config from Task 2 enforces most of them. The code in this plan was checked against that config in a scratch project on 2026-09-27: `eslint .`, `tsc` and all unit tests passed. If a rule still flags plan code, fix the code, not the rule; only a test-file override may be added, with a reason. The rules that shape this plan are:
  - **`server-only`:** every non-test module in `src/adapters/**` and `src/composition/**` starts with `import "server-only";`. The exceptions are `*.types.ts`, `*.schema.ts` and the Drizzle schema folder, which drizzle-kit loads outside Next. Vitest aliases `server-only` to `tests/setup/server-only.ts`.
  - **File composition:** exported types live in a sibling `x.types.ts`, and Zod schemas in `x.schema.ts` (named `*Schema`). Components (`*.tsx`) declare no types.
  - **Assertions:** no `as` in `src/`. `as const` is fine, and tests may assert for mocks.
  - **Named handlers:** no inline arrow functions as JSX props, in tests too (`vi.fn()` instead of `() => {}`).
  - **JSDoc:** every exported function gets one specific sentence plus `@param`/`@returns`. Route entry points are exempt.
  - **Copy:** user-facing copy lives in a sibling `*.copy.ts`, never inline JSX.
  - **Classes:** merge `className` with `cn()`.
  - **Imports:** sorted in the groups side-effect → `node:` → packages → `@/` → relative. `eslint --fix` sorts them.
- **Boundaries:**
  - A feature never imports another feature, `adapters/` or `composition/`.
  - `app/` never imports `adapters/`.
  - `features/*/domain` imports no framework or vendor code.
  - Only `src/ui/**` imports `react-aria-components`.
  - Only `adapters/` imports vendor backend SDKs, and `composition/` may use `@opennextjs/cloudflare`.
  - `process.env` is banned in `src/`.
- **Styling:** colours, spacing, radii and type sizes come only from token CSS variables (`var(--…)` / Tailwind `(--…)` utilities). No hex literals in `src/ui` or `src/app`.
- **Copy:** the UI locale is `id-ID` (`<html lang="id">`). Copy files not drawn in Pencil start with `// not in Pencil`.
- **Folders:** follow the folder architecture exactly ([overview.md](../../architecture/overview.md) › *Unit folder and test convention*). Files use `kebab-case`, and every unit gets its own folder with its sibling test, `.types.ts`, `.schema.ts` and `.copy.ts`, e.g. `src/composition/request-db/request-db.ts`. There are only three exceptions: `src/instrumentation.ts` and the `src/app` route files, whose locations Next fixes, and the Drizzle schema barrel `src/adapters/db/schema/index.ts`. Test titles start with the `AC-FND-*` ID they cover.
- **Formatting:** Prettier with `printWidth: 100`. The pre-commit hook (simple-git-hooks + lint-staged) formats and lint-fixes staged files, and `pnpm lint` fails on unformatted source.
- **Commits:** use conventional commits, and end each one with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```text
package.json  pnpm-lock.yaml  tsconfig.json  next.config.ts  postcss.config.mjs
eslint.config.mjs  eslint/local-rules.mjs  .prettierrc.json  .prettierignore  .gitignore  .env.example
vitest.config.ts  vitest.integration.config.ts  playwright.config.ts
drizzle.config.ts  open-next.config.ts  wrangler.jsonc
scripts/tokens/build-tokens-css/build-tokens-css.ts(+test)
scripts/tokens/tokens-css.ts
src/instrumentation.ts(+test)
src/app/{layout.tsx,page.tsx,page.copy.ts,globals.css,error.tsx,error.copy.ts,error.types.ts,error.test.tsx}
src/app/api/health/route.ts
src/composition/request-context/request-context.ts(+.types,+test)
src/composition/request-db/request-db.ts(+test)
src/composition/health/health.ts
src/adapters/db/client/client.ts(+.types,+test)
src/adapters/db/ping-database/ping-database.ts
src/adapters/db/schema/index.ts
src/adapters/db/schema/_conventions/tenant.ts(+.types,+test)
src/shared/env/app-env.ts(+.schema,+.types,+test)
src/shared/errors/domain-error.ts(+test)
src/shared/logging/logger.ts(+test)
src/shared/workspace-context/workspace-context.ts(+.schema,+.types,+test)
src/ui/theme/tokens.css                       (generated)
src/ui/cn/cn.ts(+test)
src/ui/providers/app-providers.tsx
src/ui/primitives/button/button.tsx(+.types,+test)
src/ui/primitives/text-field/text-field.tsx(+.types,+test)
tests/setup/{jsdom.ts,server-only.ts}
tests/config/drizzle-config.test.ts
tests/lint/{helpers/lint-source.ts,boundaries.test.ts,coding-rules.test.ts,fixtures/src/**}
tests/integration/{setup-env.ts,helpers/test-db.ts,foundation/db-smoke.test.ts}
tests/e2e/smoke.spec.ts
```

---

# Iteration 1 — Scaffold and local gate

## Task 1: Next.js scaffold with pinned dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/page.copy.ts`, `src/app/globals.css`, `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: the `@/*` → `src/*` alias; scripts `dev`, `build`, `start`, `typecheck`; the placeholder home page with an `<h1>`.

- [ ] **Step 1: Write `package.json`.**

```json
{
  "name": "shutrly",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@10.14.0",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "next typegen && tsc --noEmit"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "sharp", "workerd", "@tailwindcss/oxide"]
  }
}
```

- [ ] **Step 2: Install the pinned dependencies.**

```bash
pnpm add -E next@16.3.6 react@19.3.0 react-dom@19.3.0 zod@4.6.5 react-aria-components@1.21.1 react-hook-form@7.89.0 @hookform/resolvers@5.9.1 drizzle-orm@0.45.3 @neondatabase/serverless@1.1.0 @opennextjs/cloudflare@1.20.6 server-only@0.0.1 clsx@2.1.1 tailwind-merge@3.7.0
```

```bash
pnpm add -D -E typescript@6.0.3 @types/node@22.20.4 @types/react@19.3.0 @types/react-dom@19.3.0 tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 eslint@9.39.5 eslint-config-next@16.3.6 prettier@3.9.9 vitest@5.0.2 vite@8.3.1 @vitejs/plugin-react@6.1.1 jsdom@30.1.1 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/user-event@14.6.7 @testing-library/jest-dom@7.0.1 @playwright/test@1.63.0 drizzle-kit@0.31.11 wrangler@4.141.0 tsx@4.23.15 dotenv@18.0.4
```

Expected: both installs finish with no `ERR_PNPM_PEER_DEP_ISSUES`, and `package.json` lists exact versions (no `^`). If pnpm warns "Ignored build scripts", check that the package is in `onlyBuiltDependencies` and run `pnpm rebuild`.

- [ ] **Step 3: Write `tsconfig.json`.** TypeScript 6 defaults `types` to `[]`, so `node` is listed explicitly.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "types": ["node"],
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules", ".open-next", ".wrangler", "docs"]
}
```

- [ ] **Step 4: Write the Next and PostCSS config.**

```ts
// next.config.ts
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Exposes .dev.vars bindings to getCloudflareContext() under `next dev`.
void initOpenNextCloudflareForDev();
```

```js
// postcss.config.mjs
const config = { plugins: { "@tailwindcss/postcss": {} } };

export default config;
```

- [ ] **Step 5: Write the placeholder app.** Its copy lives in `page.copy.ts` (coding rules › Copy); the lint rule that enforces this arrives in Task 2.

```css
/* src/app/globals.css */
@import "tailwindcss";
```

```tsx
// src/app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { PropsWithChildren } from "react";

import { AppProviders } from "@/ui/providers/app-providers";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
});

export const metadata: Metadata = { title: "Shutrly" };

// Light theme by default; dark is opt-in with data-theme="dark" (no feature specifies a switch yet).
export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="id" className={sans.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

```ts
// src/app/page.copy.ts
// not in Pencil — placeholder home page; F-01/F-02 replace it.
export const HOME_PAGE_COPY = {
  wordmark: "shutrly.",
  status: "Fondasi siap. Fitur berikutnya: F-01 Auth.",
} as const;
```

```tsx
// src/app/page.tsx
import { HOME_PAGE_COPY } from "./page.copy";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-(--space-2) p-(--space-6)">
      <p className="flex items-center gap-(--space-2)">
        <span
          aria-hidden="true"
          className="size-4 rounded-(--radius-xs) bg-(--color-semantic-accent-highlight)"
        />
        <span className="text-(length:--font-size-title) font-bold">{HOME_PAGE_COPY.wordmark}</span>
      </p>
      <h1 className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {HOME_PAGE_COPY.status}
      </h1>
    </main>
  );
}
```

- [ ] **Step 6: Ignore the generated files, and document the env keys.** Append to `.gitignore`:

```text
.dev.vars*
next-env.d.ts
*.tsbuildinfo
playwright-report/
test-results/
```

Create `.env.example`:

```bash
# Copy the keys you need into .dev.vars (next dev, pnpm preview, drizzle-kit)
# and .env.test (integration tests). Never commit real values. Non-production only.
DATABASE_URL=            # Neon non-prod, POOLED connection string
DATABASE_URL_UNPOOLED=   # Neon non-prod, DIRECT connection string (migrations only, .dev.vars)
APP_STAGE=               # development in .dev.vars, test in .env.test
```

- [ ] **Step 7: Verify it runs, type-checks and builds.**

Run: `pnpm dev`, open `http://localhost:3000`, then stop it.
Expected: the page shows "shutrly." and the h1 (unstyled, since the tokens come in Task 13).

Run: `pnpm typecheck && pnpm build`
Expected: both exit 0, and `next build` lists the route `/` (○ static).

- [ ] **Step 8: Commit.**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs src/app .gitignore .env.example
git commit -m "chore(foundation): scaffold Next.js 16 app with pinned dependencies

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 2: Lint, format and unit-test tooling

**Files:**
- Create: `eslint.config.mjs`, `eslint/local-rules.mjs`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `tests/setup/jsdom.ts`, `tests/setup/server-only.ts`
- Modify: `package.json` (dev dependencies, scripts, git hook)

**Interfaces:**
- Consumes: Task 1 scaffold.
- Produces: the complete coding-rules lint config (every rule in [coding-rules.md](../../coding-rules.md) marked **(lint)**; Task 11 proves it with tests), a pre-commit hook, and scripts `lint`, `format`, `test`. It also sets up Vitest projects: `unit` (node) for `src/**/*.test.ts`, `scripts/**/*.test.ts`, `tests/lint/**/*.test.ts` and `tests/config/**/*.test.ts`, and `dom` (jsdom + jest-dom) for `src/**/*.test.tsx`.

- [ ] **Step 1: Install the lint tooling.**

```bash
pnpm add -D -E typescript-eslint@8.70.1 eslint-plugin-boundaries@7.2.0 eslint-plugin-sonarjs@4.2.1 eslint-plugin-simple-import-sort@14.0.0 @eslint-community/eslint-plugin-eslint-comments@4.8.1 eslint-config-prettier@10.1.8 simple-git-hooks@2.14.0 lint-staged@17.6.0
```

Expected: no `ERR_PNPM_PEER_DEP_ISSUES`. `typescript-eslint@8.70.1` is the same version `eslint-config-next` resolves, so only one `@typescript-eslint` plugin instance loads. If ESLint later says `Cannot redefine plugin "@typescript-eslint"`, run `pnpm why typescript-eslint` and dedupe to one version.

- [ ] **Step 2: Write the ESLint config and the local rules.** This is the full coding-rules config:
  - the Next 16 core-web-vitals config;
  - `typescript-eslint` `strictTypeChecked`;
  - SonarJS `recommended` (cognitive complexity 15), eslint-comments, and import sorting;
  - `max-lines-per-function` 50 and `max-len` 100;
  - architecture boundaries (`eslint-plugin-boundaries` for layers and features, `no-restricted-imports` for package bans);
  - `process.env` banned in `src/`;
  - `local/require-server-only`, `local/ui-copy`, and file-composition rules for `*.tsx`, `*.types.ts` and `*.schema.ts`;
  - test-file overrides.

```js
// eslint/local-rules.mjs
// Project-specific lint rules (docs/coding-rules.md). Tested by tests/lint/local-rules.test.ts.

const COPY_PROPS = new Set([
  "alt",
  "aria-label",
  "description",
  "errorMessage",
  "label",
  "message",
  "placeholder",
  "title",
]);

function isNonEmptyString(node) {
  return node?.type === "Literal" && typeof node.value === "string" && node.value.trim() !== "";
}

/** Server modules must start with `import "server-only"` so a client import fails the build. */
const requireServerOnly = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      missing: 'Start this server module with `import "server-only";` (coding-rules.md).',
    },
  },
  create(context) {
    return {
      Program(program) {
        const first = program.body.find(
          (node) => !(node.type === "ExpressionStatement" && node.directive),
        );
        const ok = first?.type === "ImportDeclaration" && first.source.value === "server-only";
        if (!ok) context.report({ node: program, messageId: "missing" });
      },
    };
  },
};

/** User-facing copy comes from a sibling *.copy.ts constant, never inline JSX. */
const uiCopy = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      inline: "Move user-facing copy to a sibling *.copy.ts constant (coding-rules.md › Copy).",
    },
  },
  create(context) {
    return {
      JSXText(node) {
        if (node.value.trim() !== "") context.report({ node, messageId: "inline" });
      },
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || !COPY_PROPS.has(node.name.name)) return;
        const value =
          node.value?.type === "JSXExpressionContainer" ? node.value.expression : node.value;
        if (isNonEmptyString(value) || value?.type === "TemplateLiteral") {
          context.report({ node, messageId: "inline" });
        }
      },
    };
  },
};

export const localRules = {
  rules: { "require-server-only": requireServerOnly, "ui-copy": uiCopy },
};
```

```js
// eslint.config.mjs
// ESLint flat config. Rules and their reasons: docs/coding-rules.md.
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

import { localRules } from "./eslint/local-rules.mjs";

const TESTS = ["**/*.test.{ts,tsx}", "tests/**", "**/*.spec.ts"];

// --- Package bans (no-restricted-imports). Flat config replaces a rule's options, so file sets are disjoint.
const VENDOR_BACKEND = [
  "drizzle-orm",
  "drizzle-orm/*",
  "@neondatabase/*",
  "better-auth",
  "better-auth/*",
  "resend",
];
const RUNTIME = ["@opennextjs/*"];
const RAC = ["react-aria-components"];
const FRAMEWORK = ["react", "react-dom", "react/*", "next", "next/*"];

function banPackages(files, group, ignores = []) {
  const message =
    "This layer may not import this package (docs/coding-rules.md › Import boundaries).";
  return {
    files,
    ignores,
    rules: { "no-restricted-imports": ["error", { patterns: [{ group, message }] }] },
  };
}

// --- Syntax bans (no-restricted-syntax). Same replace-not-merge caveat: each block repeats BASE_SYNTAX.
const BASE_SYNTAX = [
  { selector: "TSEnumDeclaration", message: "Use a union literal, not a TS enum." },
  {
    selector:
      "JSXAttribute > JSXExpressionContainer > :matches(ArrowFunctionExpression, FunctionExpression)",
    message: "Name the handler instead of an inline function prop.",
  },
];
const NO_TYPES_OR_SCHEMAS = [
  { selector: "TSInterfaceDeclaration", message: "Move interfaces to a sibling .types.ts file." },
  { selector: "TSTypeAliasDeclaration", message: "Move type aliases to a sibling .types.ts file." },
  {
    selector: "VariableDeclarator[id.name=/Schema$/]",
    message: "Move schemas to a sibling .schema.ts file.",
  },
];
const TYPES_FILE_ONLY = [
  {
    selector:
      "Program > :not(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration)",
    message: "A .types.ts file contains only type and interface declarations.",
  },
  {
    selector:
      "ExportNamedDeclaration > :matches(VariableDeclaration, FunctionDeclaration, ClassDeclaration)",
    message: "A .types.ts file contains only type and interface declarations.",
  },
];
const SCHEMA_FILE_ONLY = [
  {
    selector: "TSInterfaceDeclaration, TSTypeAliasDeclaration",
    message: "Put types in the sibling .types.ts file.",
  },
  {
    selector:
      ":matches(Program, ExportNamedDeclaration) > :matches(FunctionDeclaration, ClassDeclaration)",
    message: "A .schema.ts file contains only runtime schemas.",
  },
  {
    selector:
      ":matches(Program, Program > ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator[id.name!=/Schema$/]",
    message: "Name every schema constant *Schema.",
  },
];

// --- Architecture elements (eslint-plugin-boundaries). Patterns match the end of the path.
const ELEMENTS = [
  { type: "feature-domain", pattern: "src/features/*/domain", capture: ["feature"] },
  { type: "feature-application", pattern: "src/features/*/application", capture: ["feature"] },
  { type: "feature-ui", pattern: "src/features/*/ui", capture: ["feature"] },
  { type: "adapter", pattern: "src/adapters/*", capture: ["adapter"] },
  { type: "composition", pattern: "src/composition" },
  { type: "app", pattern: "src/app" },
  { type: "ui", pattern: "src/ui" },
  { type: "shared", pattern: "src/shared" },
];

const SAME_FEATURE = { feature: "{{ from.element.captured.feature }}" };

function allow(fromType, to) {
  return { from: { element: { type: fromType } }, allow: { to: { element: to } } };
}

const POLICIES = [
  allow("feature-domain", { type: "feature-domain", captured: SAME_FEATURE }),
  allow("feature-application", {
    types: { anyOf: ["feature-domain", "feature-application"] },
    captured: SAME_FEATURE,
  }),
  allow("feature-ui", {
    types: { anyOf: ["feature-domain", "feature-application", "feature-ui"] },
    captured: SAME_FEATURE,
  }),
  allow("feature-ui", { type: "ui" }),
  allow("adapter", {
    type: "adapter",
    captured: { adapter: "{{ from.element.captured.adapter }}" },
  }),
  allow("adapter", { types: { anyOf: ["feature-domain", "feature-application"] } }),
  allow("composition", {
    types: { anyOf: ["feature-domain", "feature-application", "adapter", "composition"] },
  }),
  allow("app", {
    types: {
      anyOf: ["app", "composition", "feature-application", "feature-ui", "ui"],
    },
  }),
  allow("ui", { type: "ui" }),
  { allow: { to: { element: { type: "shared" } } } },
];

export default defineConfig([
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/**",
    "playwright-report/**",
    "test-results/**",
    "docs/**",
    ".gstack/**",
  ]),
  ...nextVitals,
  ...tseslint.configs.strictTypeChecked,
  sonarjs.configs.recommended,
  comments.recommended,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { boundaries, "simple-import-sort": simpleImportSort, local: localRules },
    settings: { "boundaries/elements": ELEMENTS },
    rules: {
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@eslint-community/eslint-comments/require-description": "error",
      "@eslint-community/eslint-comments/no-restricted-disable": ["error", "sonarjs/*"],
      "simple-import-sort/imports": [
        "error",
        { groups: [["^\\u0000"], ["^node:"], ["^@?\\w"], ["^@/"], ["^\\."]] },
      ],
      "simple-import-sort/exports": "error",
      "max-lines-per-function": ["error", { max: 50, skipComments: true, skipBlankLines: true }],
      "no-restricted-syntax": ["error", ...BASE_SYNTAX],
      "boundaries/dependencies": ["error", { default: "disallow", policies: POLICIES }],
    },
  },
  {
    files: ["src/**"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Read config from getRequestContext().env, never process.env, in src/.",
        },
      ],
    },
  },
  banPackages(["src/features/*/domain/**"], [...FRAMEWORK, ...RAC, ...VENDOR_BACKEND, ...RUNTIME]),
  banPackages(
    ["src/features/**", "src/app/**", "src/shared/**"],
    [...RAC, ...VENDOR_BACKEND, ...RUNTIME],
    ["src/features/*/domain/**"],
  ),
  banPackages(["src/ui/**"], [...VENDOR_BACKEND, ...RUNTIME]),
  banPackages(["src/composition/**"], [...RAC, ...VENDOR_BACKEND]),
  banPackages(["src/adapters/**"], [...RAC, ...RUNTIME]),
  {
    files: [
      "src/adapters/**/*.ts",
      "src/composition/**/*.ts",
      "src/features/*/application/**/*.ts",
    ],
    ignores: [...TESTS, "**/*.types.ts", "**/*.schema.ts", "src/adapters/db/schema/**"],
    rules: { "local/require-server-only": "error" },
  },
  {
    files: ["src/**/*.tsx", "src/features/*/application/use-cases/**/*.ts"],
    ignores: [...TESTS, "**/*.types.ts", "**/*.schema.ts"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...NO_TYPES_OR_SCHEMAS] },
  },
  {
    files: ["**/*.types.ts"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...TYPES_FILE_ONLY] },
  },
  {
    files: ["**/*.schema.ts"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...SCHEMA_FILE_ONLY] },
  },
  { files: ["src/**/*.tsx"], ignores: TESTS, rules: { "local/ui-copy": "error" } },
  {
    // Tests: mocks need assertions and unbound spies; long scenario functions are fine.
    files: TESTS,
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/unbound-method": "off",
      "max-lines-per-function": "off",
    },
  },
  { files: ["**/*.{js,mjs,cjs}"], ...tseslint.configs.disableTypeChecked },
  prettier,
  {
    rules: {
      "max-len": [
        "error",
        {
          code: 100,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },
]);
```

- [ ] **Step 3: Write the Prettier config.**

```json
{ "printWidth": 100 }
```

```text
# .prettierignore
docs/
drizzle/
pnpm-lock.yaml
src/ui/theme/tokens.css
```

- [ ] **Step 4: Write the Vitest config and the test setup.** `server-only` throws outside React Server Components, so Vitest aliases it to an empty module.

```ts
// vitest.config.ts
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/setup/server-only.ts", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: [
            "src/**/*.test.ts",
            "scripts/**/*.test.ts",
            "tests/lint/**/*.test.ts",
            "tests/config/**/*.test.ts",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["tests/setup/jsdom.ts"],
        },
      },
    ],
  },
});
```

```ts
// tests/setup/jsdom.ts
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
```

```ts
// tests/setup/server-only.ts
// Vitest stand-in for the `server-only` package, whose default export throws outside React Server
// Components. Next's build still enforces the real guard.
export {};
```

- [ ] **Step 5: Add the scripts and the pre-commit hook, and run each tool once.** Add to `package.json`:

```json
"scripts": {
  "prepare": "simple-git-hooks",
  "lint": "prettier --check . && eslint .",
  "format": "prettier --write . && eslint --fix .",
  "test": "vitest run"
},
"simple-git-hooks": { "pre-commit": "pnpm exec lint-staged" },
"lint-staged": {
  "*.{ts,tsx,mjs}": ["prettier --write", "eslint --fix"],
  "*.{json,css,jsonc}": "prettier --write"
}
```

Merge `scripts` into the existing object; keep `dev`, `build`, `start` and `typecheck`.

Run: `pnpm exec simple-git-hooks`
Expected: "[INFO] Successfully set the pre-commit with command: pnpm exec lint-staged".

Run: `pnpm format && pnpm lint`
Expected: exit 0. `eslint --fix` sorts the imports in the Task 1 files. Any other error in `src/app/*` means the Task 1 code drifted from this plan: fix the code.

Run: `pnpm vitest run --passWithNoTests`
Expected: exit 0 with "No test files found". This proves the config loads.

**If Vitest rejects `test.projects`** (R-3), look up the Vitest 5 multi-project key with `pnpm vitest --help` or in the docs, and change only this config.

- [ ] **Step 6: Commit.**

```bash
git add eslint.config.mjs eslint .prettierrc.json .prettierignore vitest.config.ts tests/setup package.json pnpm-lock.yaml src
git commit -m "chore(foundation): add coding-rules lint, Prettier, pre-commit hook and Vitest projects

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

# Iteration 2 — Runtime basics

## Task 3: Environment schema

**Files:**
- Create: `src/shared/env/app-env.schema.ts`, `src/shared/env/app-env.types.ts`, `src/shared/env/app-env.ts`
- Test: `src/shared/env/app-env.test.ts`

**Interfaces:**
- Consumes: `zod`.
- Produces (schema, types and implementation are split into three files, per coding rules › Where types and schemas live):
  - `appEnvSchema` in `app-env.schema.ts`, a Zod object that F-01 Task 4 extends
  - `type AppEnv = z.infer<typeof appEnvSchema>` in `app-env.types.ts`
  - `parseAppEnv(raw: unknown): AppEnv` in `app-env.ts`, which throws `Error("Invalid environment: KEY[, KEY]")`

- [ ] **Step 1: Write the failing test.**

```ts
// src/shared/env/app-env.test.ts
import { describe, expect, it } from "vitest";

import { parseAppEnv } from "./app-env";

const valid = {
  DATABASE_URL: "postgresql://user:pw@db.example.neon.tech/app?sslmode=require",
  APP_STAGE: "test",
};

describe("parseAppEnv", () => {
  it("AC-FND-004 accepts a valid environment and drops unknown bindings", () => {
    expect(parseAppEnv({ ...valid, ASSETS: {} })).toEqual(valid);
  });

  it("AC-FND-004 names a missing key", () => {
    expect(() => parseAppEnv({ APP_STAGE: "test" })).toThrow("Invalid environment: DATABASE_URL");
  });

  it("AC-FND-004 names every invalid key", () => {
    expect(() => parseAppEnv({ DATABASE_URL: "nope", APP_STAGE: "staging" })).toThrow(
      "Invalid environment: DATABASE_URL, APP_STAGE",
    );
  });

  it("AC-FND-004 never echoes a value", () => {
    let message = "";
    try {
      parseAppEnv({ DATABASE_URL: "not-a-url-supersecret123", APP_STAGE: "test" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe("Invalid environment: DATABASE_URL");
    expect(message).not.toContain("supersecret123");
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run src/shared/env`
Expected: FAIL, "Cannot find module './app-env'".

- [ ] **Step 3: Implement.**

```ts
// src/shared/env/app-env.schema.ts
import { z } from "zod";

// Worker bindings read per request. Features extend this object with their own keys.
export const appEnvSchema = z.object({
  DATABASE_URL: z.url(),
  APP_STAGE: z.enum(["development", "test", "production"]),
});
```

```ts
// src/shared/env/app-env.types.ts
import type { z } from "zod";

import type { appEnvSchema } from "./app-env.schema";

export type AppEnv = z.infer<typeof appEnvSchema>;
```

```ts
// src/shared/env/app-env.ts
import { appEnvSchema } from "./app-env.schema";
import type { AppEnv } from "./app-env.types";

/**
 * Parse Worker bindings into the typed app environment, naming invalid keys but never their values.
 * @param raw - the bindings object from the Cloudflare context
 * @returns the validated environment, without unknown bindings
 */
export function parseAppEnv(raw: unknown): AppEnv {
  const result = appEnvSchema.safeParse(raw);
  if (!result.success) {
    // Key names only: issue messages or inputs could contain secret values (C-103).
    const keys = [...new Set(result.error.issues.map((issue) => issue.path.join(".") || "(root)"))];
    throw new Error(`Invalid environment: ${keys.join(", ")}`);
  }
  return result.data;
}
```

- [ ] **Step 4: Run it and check that it passes.**

Run: `pnpm vitest run src/shared/env`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit.**

```bash
git add src/shared/env
git commit -m "feat(foundation): validate the app environment without leaking values

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 4: Domain error base and redacting logger

**Files:**
- Create: `src/shared/errors/domain-error.ts`, `src/shared/logging/logger.ts`
- Test: `src/shared/errors/domain-error.test.ts`, `src/shared/logging/logger.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `abstract class DomainError extends Error { abstract readonly code: string }`. Its constructor is `(message?: string, options?: ErrorOptions)`, and `name` is set to the subclass name.
  - `logger: { info(event: string, fields?: Record<string, unknown>): void; warn(...): void; error(...): void }`, which writes one JSON line per call. The methods are declared with method syntax, because arrow shorthands that return `void` trip `no-confusing-void-expression`.
  - `REDACTED = "[REDACTED]"`.

- [ ] **Step 1: Write the failing tests.**

```ts
// src/shared/errors/domain-error.test.ts
import { describe, expect, it } from "vitest";

import { DomainError } from "./domain-error";

class ExampleError extends DomainError {
  readonly code = "EXAMPLE_ERROR";
}

describe("DomainError", () => {
  it("AC-FND-010 gives subclasses a stable code, their own name and the cause", () => {
    const cause = new Error("root");
    const error = new ExampleError("Example failed", { cause });
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("EXAMPLE_ERROR");
    expect(error.name).toBe("ExampleError");
    expect(error.message).toBe("Example failed");
    expect(error.cause).toBe(cause);
  });
});
```

```ts
// src/shared/logging/logger.test.ts
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

import { logger, REDACTED } from "./logger";

type ConsoleSpy = MockInstance<typeof console.log>;

let log: ConsoleSpy;
let warn: ConsoleSpy;
let error: ConsoleSpy;

beforeEach(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => {});
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function lastLine(spy: ConsoleSpy): Record<string, unknown> {
  const call = spy.mock.calls.at(-1);
  expect(call).toHaveLength(1);
  return JSON.parse(String(call?.[0])) as Record<string, unknown>;
}

describe("logger", () => {
  it("AC-FND-011 writes one JSON line with level, event and time", () => {
    logger.info("project.created", { workspaceId: "w1", requestId: "r1" });
    const line = lastLine(log);
    expect(line).toMatchObject({
      level: "info",
      event: "project.created",
      workspaceId: "w1",
      requestId: "r1",
    });
    expect(typeof line.time).toBe("string");
  });

  it("AC-FND-011 routes warn and error to the matching console method", () => {
    logger.warn("a.warn");
    logger.error("a.error");
    expect(lastLine(warn)).toMatchObject({ level: "warn", event: "a.warn" });
    expect(lastLine(error)).toMatchObject({ level: "error", event: "a.error" });
  });

  it("AC-FND-011 redacts secret and PII keys", () => {
    logger.info("x", {
      password: "p",
      newPassword: "p",
      sessionToken: "t",
      cookie: "c",
      clientSecret: "s",
      apiKey: "k",
      api_key: "k",
      authorization: "Bearer x",
      email: "a@b.id",
      clientPhone: "0812",
      driveUrl: "https://drive.google.com/x",
      whatsappURL: "https://wa.me/1",
      callback_url: "https://x",
      projectId: "p1",
    });
    const line = lastLine(log);
    for (const key of [
      "password",
      "newPassword",
      "sessionToken",
      "cookie",
      "clientSecret",
      "apiKey",
      "api_key",
      "authorization",
      "email",
      "clientPhone",
      "driveUrl",
      "whatsappURL",
      "callback_url",
    ]) {
      expect(line[key], key).toBe(REDACTED);
    }
    expect(line.projectId).toBe("p1");
  });

  it("AC-FND-011 redacts nested objects and arrays and survives cycles", () => {
    const cyclic: Record<string, unknown> = { name: "loop" };
    cyclic.self = cyclic;
    logger.info("x", {
      user: { email: "a@b.id", id: "u1" },
      links: [{ url: "https://x" }],
      cyclic,
    });
    const line = lastLine(log);
    expect(line.user).toEqual({ email: REDACTED, id: "u1" });
    expect(line.links).toEqual([{ url: REDACTED }]);
    expect(line.cyclic).toEqual({ name: "loop", self: "[Circular]" });
  });

  it("AC-FND-011 serialises errors and scrubs URLs from them", () => {
    logger.error("db.failed", {
      error: new Error("connect failed for postgresql://user:pw@host/db"),
    });
    const serialised = lastLine(error).error as { name: string; message: string; stack?: string };
    expect(serialised.name).toBe("Error");
    expect(serialised.message).toBe("connect failed for [REDACTED_URL]");
    expect(serialised.stack ?? "").not.toContain("pw@host");
  });

  it("AC-FND-011 keeps level and event authoritative over fields", () => {
    logger.info("real.event", { event: "spoofed", level: "error" });
    expect(lastLine(log)).toMatchObject({ level: "info", event: "real.event" });
  });
});
```

- [ ] **Step 2: Run them and check that they fail.**

Run: `pnpm vitest run src/shared`
Expected: FAIL, the modules are not found.

- [ ] **Step 3: Implement.**

```ts
// src/shared/errors/domain-error.ts
/**
 * Base class for expected, typed failures. Subclasses set a stable `code` that the edge maps to
 * a user message.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  /**
   * @param message - developer-facing description, in English
   * @param options - standard error options, e.g. the `cause`
   */
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}
```

```ts
// src/shared/logging/logger.ts
type Fields = Record<string, unknown>;
type Level = "info" | "warn" | "error";

export const REDACTED = "[REDACTED]";

// Never log passwords, tokens, cookies, secrets, API keys, contact PII or any URL (C-103).
const SENSITIVE_KEY_PARTS = [
  "password",
  "token",
  "secret",
  "cookie",
  "apikey",
  "authorization",
  "email",
  "phone",
];
const URL_PATTERN = /\b[a-z][\w+.-]*:\/\/[^\s"'<>]+/gi;

function isSensitiveKey(key: string): boolean {
  const normalised = key.toLowerCase().replace(/[-_]/g, "");
  return (
    normalised.endsWith("url") || SENSITIVE_KEY_PARTS.some((part) => normalised.includes(part))
  );
}

function scrubUrls(text: string): string {
  return text.replace(URL_PATTERN, "[REDACTED_URL]");
}

function serialiseError(error: Error): Fields {
  return {
    name: error.name,
    message: scrubUrls(error.message),
    stack: error.stack === undefined ? undefined : scrubUrls(error.stack),
  };
}

function sanitiseObject(value: object, seen: WeakSet<object>): Fields {
  seen.add(value);
  const out: Fields = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = isSensitiveKey(key) ? REDACTED : sanitise(item, seen);
  }
  return out;
}

function sanitise(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) return serialiseError(value);
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return "[Circular]";
  if (!Array.isArray(value)) return sanitiseObject(value, seen);
  seen.add(value);
  return value.map((item: unknown) => sanitise(item, seen));
}

function write(level: Level, event: string, fields: Fields = {}): void {
  const safe = sanitiseObject(fields, new WeakSet());
  const line = JSON.stringify({ ...safe, level, event, time: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Structured JSON logger: one line per event, with secret and PII fields redacted by key. */
export const logger = {
  /** Log a routine event. */
  info(event: string, fields?: Fields): void {
    write("info", event, fields);
  },
  /** Log a recoverable problem. */
  warn(event: string, fields?: Fields): void {
    write("warn", event, fields);
  },
  /** Log a failure, e.g. an unexpected error. */
  error(event: string, fields?: Fields): void {
    write("error", event, fields);
  },
};
```

- [ ] **Step 4: Run them and check that they pass.**

Run: `pnpm vitest run src/shared`
Expected: PASS (1 + 6 tests, plus Task 3's 4).

- [ ] **Step 5: Commit.**

```bash
git add src/shared/errors src/shared/logging
git commit -m "feat(foundation): add DomainError and a redacting JSON logger

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 5: Workers runtime config and request context

**Files:**
- Create: `open-next.config.ts`, `wrangler.jsonc`, `src/composition/request-context/request-context.types.ts`, `src/composition/request-context/request-context.ts`, `.dev.vars` (local only, git-ignored)
- Modify: `next.config.ts`, `package.json` (script `preview`)
- Test: `src/composition/request-context/request-context.test.ts`

**Interfaces:**
- Consumes: `parseAppEnv` (`@/shared/env/app-env`), `AppEnv` (`@/shared/env/app-env.types`).
- Produces:
  - `interface RequestContext { env: AppEnv; waitUntil(promise: Promise<unknown>): void; ip: string; requestId: string; headers: Headers }` in `request-context.types.ts`
  - `getRequestContext(): Promise<RequestContext>` in `request-context/request-context.ts`
  - `getCloudflareContext` gets an explicit generic for the one method we use, so no generated Workers types are needed; without it, the `ExecutionContext` type is unresolved and strict typed lint fails.

- [ ] **Step 1: Write the failing test.**

```ts
// src/composition/request-context/request-context.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

import { getRequestContext } from "./request-context";

const waitUntil = vi.fn();
const env = { DATABASE_URL: "postgresql://user:pw@db.example/app", APP_STAGE: "test", ASSETS: {} };

function givenRequest(
  requestHeaders: Record<string, string>,
  bindings: Record<string, unknown> = env,
) {
  vi.mocked(getCloudflareContext).mockResolvedValue({
    env: bindings,
    ctx: { waitUntil },
    cf: undefined,
  });
  vi.mocked(headers).mockResolvedValue(new Headers(requestHeaders));
}

beforeEach(() => vi.clearAllMocks());

describe("getRequestContext", () => {
  it("AC-FND-004 parses the Worker bindings into AppEnv", async () => {
    givenRequest({});
    const rc = await getRequestContext();
    expect(rc.env).toEqual({ DATABASE_URL: env.DATABASE_URL, APP_STAGE: "test" });
  });

  it("AC-FND-004 fails fast on invalid bindings", async () => {
    givenRequest({}, { APP_STAGE: "test" });
    await expect(getRequestContext()).rejects.toThrow("Invalid environment: DATABASE_URL");
  });

  it("uses cf-connecting-ip, then the first x-forwarded-for hop, then unknown", async () => {
    givenRequest({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" });
    expect((await getRequestContext()).ip).toBe("203.0.113.7");
    givenRequest({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" });
    expect((await getRequestContext()).ip).toBe("198.51.100.1");
    givenRequest({});
    expect((await getRequestContext()).ip).toBe("unknown");
  });

  it("uses cf-ray as the request ID, else a random UUID", async () => {
    givenRequest({ "cf-ray": "8f1c2d3e4f5a6b7c-SIN" });
    expect((await getRequestContext()).requestId).toBe("8f1c2d3e4f5a6b7c-SIN");
    givenRequest({});
    expect((await getRequestContext()).requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("AC-FND-005 delegates waitUntil to the Worker execution context", async () => {
    givenRequest({});
    const promise = Promise.resolve();
    (await getRequestContext()).waitUntil(promise);
    expect(waitUntil).toHaveBeenCalledWith(promise);
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run src/composition`
Expected: FAIL, "Cannot find module './request-context'".

- [ ] **Step 3: Implement the request context.** It's a server module, so it starts with `import "server-only";`.

```ts
// src/composition/request-context/request-context.types.ts
import type { AppEnv } from "@/shared/env/app-env.types";

export interface RequestContext {
  env: AppEnv;
  waitUntil(promise: Promise<unknown>): void;
  ip: string;
  requestId: string;
  headers: Headers;
}
```

```ts
// src/composition/request-context/request-context.ts
import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

import { parseAppEnv } from "@/shared/env/app-env";

import type { RequestContext } from "./request-context.types";

// The part of the Worker ExecutionContext we use; typed here so no generated Workers types are needed.
interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
}

/**
 * Build the per-request context from the Cloudflare Worker context and the request headers.
 * @returns the validated env, `waitUntil`, client IP, request ID and headers
 */
export async function getRequestContext(): Promise<RequestContext> {
  const { env, ctx } = await getCloudflareContext<Record<string, unknown>, WorkerContext>({
    async: true,
  });
  const requestHeaders = await headers();
  return {
    env: parseAppEnv(env),
    waitUntil: ctx.waitUntil.bind(ctx),
    ip: clientIp(requestHeaders),
    requestId: requestHeaders.get("cf-ray") ?? crypto.randomUUID(),
    headers: requestHeaders,
  };
}

function clientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return requestHeaders.get("cf-connecting-ip") ?? (forwarded || "unknown");
}
```

- [ ] **Step 4: Run it and check that it passes.**

Run: `pnpm vitest run src/composition`
Expected: PASS, 5 tests.

- [ ] **Step 5: Add the OpenNext / Wrangler config and the dev bindings.** `wrangler.jsonc` isn't linted; Prettier formats it.

```ts
// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache: F-00 has no ISR. Revisit when a feature needs cached pages.
export default defineCloudflareConfig({});
```

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "shutrly",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" }
}
```

```ts
// next.config.ts
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Exposes .dev.vars bindings to getCloudflareContext() under `next dev`.
void initOpenNextCloudflareForDev();
```

Add to `package.json › scripts`:

```json
"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"
```

Create `.dev.vars` (git-ignored). The Owner fills in the non-prod Neon values:

```bash
DATABASE_URL=<neon non-prod pooled connection string>
DATABASE_URL_UNPOOLED=<neon non-prod direct connection string>
APP_STAGE=development
```

Run: `git check-ignore .dev.vars`
Expected: it prints `.dev.vars`.

- [ ] **Step 6: Verify the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all exit 0.

- [ ] **Step 7: Commit.**

```bash
git add open-next.config.ts wrangler.jsonc next.config.ts package.json src/composition
git commit -m "feat(foundation): add OpenNext Cloudflare config and request context

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 6: Log unexpected server errors

**Files:**
- Create: `src/instrumentation.ts`
- Test: `src/instrumentation.test.ts`

**Interfaces:**
- Consumes: `logger` (Task 4).
- Produces: the Next `onRequestError` hook. It logs the event `request.unhandled_error` with `{ requestId, method, routePath, routeType, error }` and never the raw path.

- [ ] **Step 1: Write the failing test.**

```ts
// src/instrumentation.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/logging/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from "@/shared/logging/logger";

import { onRequestError } from "./instrumentation";

beforeEach(() => vi.clearAllMocks());

describe("onRequestError", () => {
  it("AC-FND-010 logs the route pattern with the request ID, never the raw path", async () => {
    const error = new Error("boom");
    await onRequestError(
      error,
      { path: "/g/secret-token-123?pw=1", method: "GET", headers: { "cf-ray": "ray-1" } },
      {
        routerKind: "App Router",
        routePath: "/g/[token]",
        routeType: "render",
        revalidateReason: undefined,
      } as never,
    );
    expect(logger.error).toHaveBeenCalledWith("request.unhandled_error", {
      requestId: "ray-1",
      method: "GET",
      routePath: "/g/[token]",
      routeType: "render",
      error,
    });
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain("secret-token-123");
  });

  it("AC-FND-010 falls back to an unknown request ID", async () => {
    await onRequestError(new Error("x"), { path: "/", method: "POST", headers: {} }, {
      routerKind: "App Router",
      routePath: "/",
      routeType: "action",
      revalidateReason: undefined,
    } as never);
    expect(vi.mocked(logger.error).mock.calls[0]?.[1]).toMatchObject({ requestId: "unknown" });
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run src/instrumentation.test.ts`
Expected: FAIL, "Cannot find module './instrumentation'".

- [ ] **Step 3: Implement.**

```ts
// src/instrumentation.ts
import type { Instrumentation } from "next";

import { logger } from "@/shared/logging/logger";

/**
 * Next.js hook for unhandled server errors. Logs the route pattern, never the path: public
 * paths will carry client tokens (C-103).
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const ray = request.headers["cf-ray"];
  logger.error("request.unhandled_error", {
    requestId: (Array.isArray(ray) ? ray[0] : ray) ?? "unknown",
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    error,
  });
};
```

- [ ] **Step 4: Run it and check that it passes, then run the gate.**

Run: `pnpm vitest run src/instrumentation.test.ts && pnpm typecheck && pnpm lint`
Expected: PASS, 2 tests; the gate exits 0.

- [ ] **Step 5: Commit.**

```bash
git add src/instrumentation.ts src/instrumentation.test.ts
git commit -m "feat(foundation): log unhandled request errors with the route pattern

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

# Iteration 3 — Database

## Task 7: Drizzle client over a per-call Neon pool

**Files:**
- Create: `src/adapters/db/client/client.types.ts`, `src/adapters/db/client/client.ts`, `src/adapters/db/schema/index.ts`
- Test: `src/adapters/db/client/client.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - in `client.types.ts`: `type Db = NeonDatabase<typeof schema>` and `interface DbHandle { db: Db; pool: Pool }`
  - in `client.ts` (server-only): `createDb(databaseUrl: string): DbHandle`
  - the schema barrel `src/adapters/db/schema/index.ts`, where features add `export * from "./<table-file>"`

- [ ] **Step 1: Write the failing test.**

```ts
// src/adapters/db/client/client.test.ts
import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

import { Pool } from "@neondatabase/serverless";
import { describe, expect, it } from "vitest";

import { createDb } from "./client";

const URL = "postgresql://user:pw@localhost:5432/app";

describe("createDb", () => {
  it("AC-FND-005 returns a Drizzle db over a new Pool on every call", async () => {
    const first = createDb(URL);
    const second = createDb(URL);
    expect(first.pool).toBeInstanceOf(Pool);
    expect(first.pool).not.toBe(second.pool);
    expect(typeof first.db.select).toBe("function");
    await Promise.all([first.pool.end(), second.pool.end()]);
  });

  it("AC-FND-005 constructs a Pool only in adapters/db/client/client.ts", () => {
    const offenders = readdirSync("src", { recursive: true, encoding: "utf8" })
      .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
      .filter((file) => readFileSync(join("src", file), "utf8").includes("new Pool("))
      .map((file) => file.split(sep).join("/"));
    expect(offenders).toEqual(["adapters/db/client/client.ts"]);
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run src/adapters/db`
Expected: FAIL, "Cannot find module './client'".

- [ ] **Step 3: Implement.**

```ts
// src/adapters/db/schema/index.ts
// Schema barrel: each feature re-exports its table file here, e.g. `export * from "./auth";`.
export {};
```

```ts
// src/adapters/db/client/client.types.ts
import type { Pool } from "@neondatabase/serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

import type * as schema from "../schema";

export type Db = NeonDatabase<typeof schema>;

export interface DbHandle {
  db: Db;
  pool: Pool;
}
```

```ts
// src/adapters/db/client/client.ts
import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../schema";
import type { DbHandle } from "./client.types";

/**
 * Open a Drizzle database over a new Neon Pool. Workers can't share sockets across requests
 * (ADR-009), so the caller ends the pool with `waitUntil(pool.end())` after its work.
 * @param databaseUrl - the pooled Neon connection string
 * @returns the Drizzle `db` and the `pool` the caller must end
 */
export function createDb(databaseUrl: string): DbHandle {
  const pool = new Pool({ connectionString: databaseUrl });
  return { db: drizzle({ client: pool, schema }), pool };
}
```

- [ ] **Step 4: Run it and check that it passes.**

Run: `pnpm vitest run src/adapters/db`
Expected: PASS, 2 tests. No network is used: `Pool` connects lazily.

- [ ] **Step 5: Commit.**

```bash
git add src/adapters/db
git commit -m "feat(foundation): add createDb over a per-call Neon Pool

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 8: Request-scoped database and health route

**Files:**
- Create: `src/composition/request-db/request-db.ts`, `src/adapters/db/ping-database/ping-database.ts`, `src/composition/health/health.ts`, `src/app/api/health/route.ts`
- Test: `src/composition/request-db/request-db.test.ts`

**Interfaces:**
- Consumes: `getRequestContext`, `RequestContext` (Task 5); `createDb`, `Db` (Task 7).
- Note: `composition/` may not import `drizzle-orm` (coding rules › Import boundaries), so the `select 1` lives in an adapter, `pingDatabase`.
- Produces:
  - `withRequestDb<T>(work: (db: Db, rc: RequestContext) => Promise<T>): Promise<T>`
  - `pingDatabase(db: Db): Promise<void>` in `src/adapters/db/ping-database/ping-database.ts`
  - `checkDatabase(): Promise<void>`, which is `withRequestDb(pingDatabase)`
  - `GET /api/health` → `200 {"ok":true}`, `Cache-Control: private, no-store`

- [ ] **Step 1: Write the failing test.**

```ts
// src/composition/request-db/request-db.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../request-context/request-context", () => ({ getRequestContext: vi.fn() }));
vi.mock("@/adapters/db/client/client", () => ({ createDb: vi.fn() }));

import { createDb } from "@/adapters/db/client/client";

import { getRequestContext } from "../request-context/request-context";
import { withRequestDb } from "./request-db";

const events: string[] = [];
const endPromise = Promise.resolve();
const end = vi.fn(() => {
  events.push("end");
  return endPromise;
});
const waitUntil = vi.fn();
const fakeDb = { fake: true };
const rc = {
  env: { DATABASE_URL: "postgresql://user:pw@db.example/app", APP_STAGE: "test" as const },
  waitUntil,
  ip: "203.0.113.7",
  requestId: "r1",
  headers: new Headers(),
};

beforeEach(() => {
  vi.clearAllMocks();
  events.length = 0;
  vi.mocked(getRequestContext).mockResolvedValue(rc);
  vi.mocked(createDb).mockReturnValue({ db: fakeDb, pool: { end } } as never);
});

describe("withRequestDb", () => {
  it("AC-FND-005 opens a db from the request env and returns the result", async () => {
    const result = await withRequestDb((db, context) => {
      expect(db).toBe(fakeDb);
      expect(context).toBe(rc);
      return Promise.resolve(42);
    });
    expect(result).toBe(42);
    expect(createDb).toHaveBeenCalledWith(rc.env.DATABASE_URL);
  });

  it("AC-FND-005 ends the pool after the work and hands it to waitUntil", async () => {
    await withRequestDb(() => {
      events.push("work");
      return Promise.resolve();
    });
    expect(events).toEqual(["work", "end"]);
    expect(waitUntil).toHaveBeenCalledWith(endPromise);
  });

  it("AC-FND-005 still ends the pool when the work throws", async () => {
    await expect(withRequestDb(() => Promise.reject(new Error("query failed")))).rejects.toThrow(
      "query failed",
    );
    expect(end).toHaveBeenCalledTimes(1);
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run src/composition/request-db/request-db.test.ts`
Expected: FAIL, "Cannot find module './request-db'".

- [ ] **Step 3: Implement.**

```ts
// src/composition/request-db/request-db.ts
import "server-only";

import { createDb } from "@/adapters/db/client/client";
import type { Db } from "@/adapters/db/client/client.types";

import { getRequestContext } from "../request-context/request-context";
import type { RequestContext } from "../request-context/request-context.types";

/**
 * Run `work` with a request-scoped database. The pool is ended only after the work settles,
 * even when it throws (ADR-009).
 * @param work - the database work for this request
 * @returns whatever `work` resolves to
 */
export async function withRequestDb<T>(
  work: (db: Db, rc: RequestContext) => Promise<T>,
): Promise<T> {
  const rc = await getRequestContext();
  const { db, pool } = createDb(rc.env.DATABASE_URL);
  try {
    return await work(db, rc);
  } finally {
    rc.waitUntil(pool.end());
  }
}
```

```ts
// src/adapters/db/ping-database/ping-database.ts
import "server-only";

import { sql } from "drizzle-orm";

import type { Db } from "../client/client.types";

/**
 * Run `select 1` to prove the connection works in this runtime. Returns no data.
 * @param db - a request-scoped Drizzle database
 */
export async function pingDatabase(db: Db): Promise<void> {
  await db.execute(sql`select 1`);
}
```

```ts
// src/composition/health/health.ts
import "server-only";

import { pingDatabase } from "@/adapters/db/ping-database/ping-database";

import { withRequestDb } from "../request-db/request-db";

/**
 * Prove Neon over WebSocket works in this runtime (`next dev` and workerd).
 * @returns nothing; throws when the database can't be reached
 */
export async function checkDatabase(): Promise<void> {
  await withRequestDb(pingDatabase);
}
```

```ts
// src/app/api/health/route.ts
import { checkDatabase } from "@/composition/health/health";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  await checkDatabase();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
```

- [ ] **Step 4: Run the test and the dev server.**

Run: `pnpm vitest run src/composition`
Expected: PASS (3 + 5 tests).

Run: `pnpm dev` and, in another shell, `curl -si http://localhost:3000/api/health`. Then stop the server.
Expected: `HTTP/1.1 200`, a `cache-control` header containing `no-store`, and the body `{"ok":true}`. This proves Neon's WebSocket `Pool` works under `next dev` with the `.dev.vars` bindings.

- [ ] **Step 5: Commit.**

```bash
git add src/composition src/adapters/db/ping-database src/app/api
git commit -m "feat(foundation): add request-scoped db and health check

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 9: Tenant schema conventions and workspace context

**Files:**
- Create: `src/adapters/db/schema/_conventions/tenant.types.ts`, `src/adapters/db/schema/_conventions/tenant.ts`, `src/shared/workspace-context/workspace-context.schema.ts`, `src/shared/workspace-context/workspace-context.types.ts`, `src/shared/workspace-context/workspace-context.ts`
- Test: `src/adapters/db/schema/_conventions/tenant.test.ts`, `src/shared/workspace-context/workspace-context.test.ts`

**Interfaces:**
- Consumes: `drizzle-orm/pg-core`, `drizzle-kit/api`, `zod`.
- Produces:
  - `idColumn()`, `workspaceIdColumn()`, `auditColumns()`
  - `interface TenantKeyColumns { workspaceId; id }` and `interface TenantRefColumns { workspaceId; column }` (both `AnyPgColumn`), in `tenant.types.ts`
  - `tenantKey(table: TenantKeyColumns)`, `tenantRef(child: TenantRefColumns, parent: TenantKeyColumns)`
  - `workspaceIdSchema = z.uuid().brand<"WorkspaceId">()`: the Zod brand makes the ID nominal with no `as` assertion
  - `type WorkspaceId` and `interface WorkspaceContext { readonly workspaceId: WorkspaceId }` in `workspace-context.types.ts`
  - `asWorkspaceId(raw: string): WorkspaceId`

- [ ] **Step 1: Write the failing tests.**

```ts
// src/adapters/db/schema/_conventions/tenant.test.ts
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { auditColumns, idColumn, tenantKey, tenantRef, workspaceIdColumn } from "./tenant";

const fixtureParent = pgTable(
  "fixture_parent",
  { id: idColumn(), workspaceId: workspaceIdColumn(), ...auditColumns() },
  (t) => [tenantKey(t)],
);

const fixtureChild = pgTable(
  "fixture_child",
  { id: idColumn(), workspaceId: workspaceIdColumn(), parentId: uuid("parent_id").notNull() },
  (t) => [
    tenantKey(t),
    tenantRef({ workspaceId: t.workspaceId, column: t.parentId }, fixtureParent),
  ],
);

describe("tenant conventions", () => {
  it("AC-FND-007 generates workspace_id, unique (workspace_id, id) and the composite FK", async () => {
    const statements = await generateMigration(
      generateDrizzleJson({}),
      generateDrizzleJson({ fixtureParent, fixtureChild }),
    );
    const sql = statements.join("\n");
    expect(sql).toContain('"workspace_id" uuid NOT NULL');
    expect(sql).toMatch(/"id" uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/);
    expect(sql).toMatch(/UNIQUE\s*\("workspace_id",\s*"id"\)/);
    expect(sql).toMatch(
      /FOREIGN KEY \("workspace_id",\s*"parent_id"\) REFERENCES "(public"\.")?fixture_parent"\("workspace_id",\s*"id"\)/,
    );
    expect(sql).toContain('"created_at" timestamp with time zone DEFAULT now() NOT NULL');
    expect(sql).toContain('"updated_at" timestamp with time zone DEFAULT now() NOT NULL');
  });
});
```

```ts
// src/shared/workspace-context/workspace-context.test.ts
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "./workspace-context";
import type { WorkspaceContext, WorkspaceId } from "./workspace-context.types";

type ProjectId = string & { readonly __brand: "ProjectId" };
const RAW = "3f2b8c1e-5d4a-4e6b-9c7d-2a1b0c9d8e7f";

// Stands in for an owner-scoped repository function.
function fixtureScopedQuery(ctx: WorkspaceContext): WorkspaceId {
  return ctx.workspaceId;
}

// Checked by `pnpm typecheck`; never called.
export function typeOnlyChecks(): void {
  // @ts-expect-error a plain string is not a WorkspaceId
  fixtureScopedQuery({ workspaceId: RAW });
  // @ts-expect-error another branded ID is not a WorkspaceId
  fixtureScopedQuery({ workspaceId: RAW as ProjectId });
  // @ts-expect-error owner-scoped functions require a WorkspaceContext
  fixtureScopedQuery();
}

describe("WorkspaceId / WorkspaceContext", () => {
  it("accepts a UUID and rejects anything else", () => {
    expect(asWorkspaceId(RAW)).toBe(RAW);
    expect(() => asWorkspaceId("not-a-uuid")).toThrow("Invalid WorkspaceId");
  });

  it("AC-FND-008 owner-scoped code only accepts a verified WorkspaceContext", () => {
    const id = asWorkspaceId(RAW);
    expect(fixtureScopedQuery({ workspaceId: id })).toBe(id);
    expect(typeof typeOnlyChecks).toBe("function");
  });
});
```

- [ ] **Step 2: Run them and check that they fail.**

Run: `pnpm vitest run src/adapters/db/schema src/shared/workspace-context`
Expected: FAIL, the modules are not found.

- [ ] **Step 3: Implement.**

```ts
// src/adapters/db/schema/_conventions/tenant.types.ts
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export interface TenantKeyColumns {
  workspaceId: AnyPgColumn;
  id: AnyPgColumn;
}

export interface TenantRefColumns {
  workspaceId: AnyPgColumn;
  column: AnyPgColumn;
}
```

```ts
// src/adapters/db/schema/_conventions/tenant.ts
import { foreignKey, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import type { TenantKeyColumns, TenantRefColumns } from "./tenant.types";

// Tenant-table conventions (BR-WS-002, ADR-003). F-02 adds the `workspace` table and the
// workspace_id → workspace(id) FK on every tenant parent.

/** UUID primary key generated by Postgres. */
export const idColumn = () => uuid("id").primaryKey().defaultRandom();

/** The owning workspace; required on every tenant table, children included. */
export const workspaceIdColumn = () => uuid("workspace_id").notNull();

/** `created_at` / `updated_at` as `timestamptz NOT NULL DEFAULT now()`. */
export const auditColumns = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Unique `(workspace_id, id)` on a tenant parent, so children can reference both columns.
 * @param table - the parent's `workspaceId` and `id` columns
 * @returns the unique constraint for the table's extra config
 */
export function tenantKey(table: TenantKeyColumns) {
  return unique().on(table.workspaceId, table.id);
}

/**
 * Composite FK `(workspace_id, <parent>_id) → parent(workspace_id, id)`: a child can't point
 * at another workspace's row.
 * @param child - the child's `workspaceId` and referencing column
 * @param parent - the parent's `workspaceId` and `id` columns
 * @returns the foreign key for the child's extra config
 */
export function tenantRef(child: TenantRefColumns, parent: TenantKeyColumns) {
  return foreignKey({
    columns: [child.workspaceId, child.column],
    foreignColumns: [parent.workspaceId, parent.id],
  });
}
```

```ts
// src/shared/workspace-context/workspace-context.schema.ts
import { z } from "zod";

export const workspaceIdSchema = z.uuid().brand<"WorkspaceId">();
```

```ts
// src/shared/workspace-context/workspace-context.types.ts
import type { z } from "zod";

import type { workspaceIdSchema } from "./workspace-context.schema";

export type WorkspaceId = z.infer<typeof workspaceIdSchema>;

// Produced only by F-02's workspace resolver after verifying ownership (BR-WS-003).
// Every owner-scoped repository function takes one (coding rules › Data Access).
export interface WorkspaceContext {
  readonly workspaceId: WorkspaceId;
}
```

```ts
// src/shared/workspace-context/workspace-context.ts
import { workspaceIdSchema } from "./workspace-context.schema";
import type { WorkspaceId } from "./workspace-context.types";

/**
 * Brand a raw UUID as a `WorkspaceId`. This checks the format only, not ownership.
 * @param raw - a UUID string
 * @returns the branded ID; throws `Invalid WorkspaceId` for anything else
 */
export function asWorkspaceId(raw: string): WorkspaceId {
  const result = workspaceIdSchema.safeParse(raw);
  if (!result.success) throw new Error("Invalid WorkspaceId");
  return result.data;
}
```

- [ ] **Step 4: Run them, and type-check.**

Run: `pnpm vitest run src/adapters/db/schema src/shared/workspace-context && pnpm typecheck`
Expected: PASS (1 + 2 tests), and typecheck exits 0.

A failing `@ts-expect-error` ("Unused '@ts-expect-error' directive") means the brand leaks. Fix the type, not the test.

If the SQL assertions in `tenant.test.ts` fail only because drizzle-kit formats the SQL differently, print `statements` and adjust the regex. The constraint **content** must stay exactly as asserted.

- [ ] **Step 5: Commit.**

```bash
git add src/adapters/db/schema/_conventions src/shared/workspace-context
git commit -m "feat(foundation): add tenant schema conventions and WorkspaceContext

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 10: Drizzle config and integration harness

**Files:**
- Create: `drizzle.config.ts`, `vitest.integration.config.ts`, `tests/integration/setup-env.ts`, `tests/integration/helpers/test-db.ts`, `tests/integration/foundation/db-smoke.test.ts`, `.env.test` (local only, git-ignored)
- Modify: `package.json` (scripts `test:integration`, `db:generate`, `db:migrate`)
- Test: `tests/config/drizzle-config.test.ts`

**Interfaces:**
- Consumes: `createDb` (`@/adapters/db/client/client`), `Db` (`@/adapters/db/client/client.types`).
- Produces:
  - `openTestDb(): Promise<{ db: Db; close(): Promise<void> }>`, which rejects unless `APP_STAGE === "test"`. It returns promises directly rather than being `async`, because `require-await` flags an async function with no `await`. The integration config aliases `server-only` like the unit config does, since `createDb` imports it.
  - scripts `test:integration`, `db:generate`, `db:migrate`

- [ ] **Step 1: Write the failing config test.**

```ts
// tests/config/drizzle-config.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("drizzle.config", () => {
  it("AC-FND-016 migrations use the unpooled (direct) URL, never the pooled one", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://pooled.example/app");
    vi.stubEnv("DATABASE_URL_UNPOOLED", "postgresql://direct.example/app");
    const { default: config } = await import("../../drizzle.config");
    expect(config).toMatchObject({
      dialect: "postgresql",
      out: "./drizzle",
      dbCredentials: { url: "postgresql://direct.example/app" },
    });
  });

  it("AC-FND-016 refuses to run without DATABASE_URL_UNPOOLED", async () => {
    vi.stubEnv("DATABASE_URL_UNPOOLED", "");
    await expect(import("../../drizzle.config")).rejects.toThrow(/DATABASE_URL_UNPOOLED/);
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run tests/config`
Expected: FAIL, "Cannot find module '../../drizzle.config'".

- [ ] **Step 3: Implement the Drizzle config.**

```ts
// drizzle.config.ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Does not override variables that are already set (tests stub them).
config({ path: ".dev.vars", quiet: true });

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is missing (.dev.vars). Migrations use Neon's direct connection (ADR-009).",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/adapters/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
```

Run: `pnpm vitest run tests/config`
Expected: PASS, 2 tests.

- [ ] **Step 4: Write the integration harness and its smoke test.**

```ts
// tests/integration/setup-env.ts
import { config } from "dotenv";

config({ path: ".env.test", quiet: true });
```

```ts
// tests/integration/helpers/test-db.ts
import { createDb } from "@/adapters/db/client/client";
import type { Db } from "@/adapters/db/client/client.types";

/**
 * Open the shared non-prod database for an integration test (ADR-009): seed unique rows, assert
 * only on them, never truncate. Refuses to connect unless `APP_STAGE` is `test`.
 * @returns the Drizzle `db` and `close()`, which ends the pool
 */
export function openTestDb(): Promise<{ db: Db; close(): Promise<void> }> {
  if (process.env.APP_STAGE !== "test") {
    return Promise.reject(
      new Error('openTestDb: APP_STAGE must be "test" (set it in .env.test); refusing to connect.'),
    );
  }
  const url = process.env.DATABASE_URL;
  if (!url) return Promise.reject(new Error("openTestDb: DATABASE_URL is missing in .env.test."));
  const { db, pool } = createDb(url);
  return Promise.resolve({ db, close: () => pool.end() });
}
```

```ts
// tests/integration/foundation/db-smoke.test.ts
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

import { openTestDb } from "../helpers/test-db";

afterEach(() => vi.unstubAllEnvs());

describe("integration database", () => {
  it("AC-FND-006 connects to the shared non-prod database", async () => {
    const { db, close } = await openTestDb();
    try {
      const result = await db.execute(sql`select 1 as one`);
      expect(result.rows[0]).toEqual({ one: 1 });
    } finally {
      await close();
    }
  });

  it("AC-FND-006 refuses to connect unless APP_STAGE=test", async () => {
    vi.stubEnv("APP_STAGE", "production");
    await expect(openTestDb()).rejects.toThrow(/APP_STAGE must be "test"/);
  });
});
```

```ts
// vitest.integration.config.ts
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/setup/server-only.ts", import.meta.url)),
    },
  },
  test: {
    name: "integration",
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/setup-env.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
```

Create `.env.test` (git-ignored). It uses the same non-prod **pooled** URL as `.dev.vars`:

```bash
DATABASE_URL=<neon non-prod pooled connection string>
APP_STAGE=test
```

Add to `package.json › scripts`:

```json
"test:integration": "vitest run --config vitest.integration.config.ts",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 5: Run the integration suite and the generator.**

Run: `pnpm test:integration`
Expected: PASS, 2 tests. Node 22's global `WebSocket` is what the Neon `Pool` uses. If it fails with a WebSocket error, stop and report it: don't add `ws` without the Owner's approval.

Run: `pnpm db:generate`
Expected: "No schema changes, nothing to migrate", and exit 0. Don't run `db:migrate` now; the first migration arrives with F-01 and the Owner applies it from `main`.

- [ ] **Step 6: Commit.**

```bash
git add drizzle.config.ts vitest.integration.config.ts tests/config tests/integration package.json
git commit -m "feat(foundation): add drizzle config and integration test harness

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

# Iteration 4 — Boundaries

## Task 11: Prove the lint rules with tests

**Files:**
- Create: `tests/lint/helpers/lint-source.ts`, `tests/lint/fixtures/src/**` (9 one-line fixture files)
- Test: `tests/lint/boundaries.test.ts`, `tests/lint/coding-rules.test.ts`

**Interfaces:**
- Consumes: the Task 2 ESLint config.
- Produces: `ruleIds(filePath: string, source: string): Promise<string[]>`, which lints a virtual file with type-aware rules switched off. It also produces the regression tests for every **(lint)** rule in the coding rules (AC-FND-009).

These tests characterise a config that already exists, so they are expected to pass on the first run. A failing case means the config and the coding rules disagree. Fix the config, unless the coding rules are wrong; in that case, stop and report it.

- [ ] **Step 1: Write the lint helper.** Virtual files aren't in the TypeScript project, so type-aware rules are switched off. Every rule tested here is syntactic or resolves imports on disk.

```ts
// tests/lint/helpers/lint-source.ts
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";

// Virtual files aren't in the TypeScript project, so type-aware rules are switched off here.
// Every rule these tests cover is syntactic or resolves imports on disk.
const eslint = new ESLint({
  overrideConfig: [{ files: ["**/*.{ts,tsx}"], ...tseslint.configs.disableTypeChecked }],
});

/**
 * Lint `source` as if it lived at `filePath` and list the IDs of the rules it breaks.
 * @param filePath - a repo-relative path; it doesn't need to exist
 * @param source - the file contents
 * @returns one rule ID per reported problem
 */
export async function ruleIds(filePath: string, source: string): Promise<string[]> {
  const results = await eslint.lintText(source, { filePath });
  return results.flatMap((result) => result.messages.map((m) => m.ruleId ?? "parse-error"));
}
```

- [ ] **Step 2: Create the boundary fixtures.** `eslint-plugin-boundaries` only classifies an import whose target exists on disk; an unresolved import is silently allowed, and TypeScript reports it anyway. Its element patterns match the end of a path, so `tests/lint/fixtures/src/features/alpha/domain/rule.ts` counts as feature `alpha`'s domain. Create these nine files, each with the same two lines, replacing `<path>` with the file's path under `fixtures/src`:

```text
tests/lint/fixtures/src/features/alpha/domain/rule.ts
tests/lint/fixtures/src/features/alpha/application/use-case.ts
tests/lint/fixtures/src/features/alpha/ui/form.ts
tests/lint/fixtures/src/features/beta/domain/rule.ts
tests/lint/fixtures/src/adapters/alpha/store.ts
tests/lint/fixtures/src/adapters/beta/store.ts
tests/lint/fixtures/src/ui/widget/widget.ts
tests/lint/fixtures/src/composition/wire.ts
tests/lint/fixtures/src/shared/util/util.ts
```

```ts
// Lint-test fixture: an import target for tests/lint/boundaries.test.ts.
export const fixture = "<path>";
```

- [ ] **Step 3: Write the boundary test.**

```ts
// tests/lint/boundaries.test.ts
import { describe, expect, it } from "vitest";

import { ruleIds } from "./helpers/lint-source";

// Boundary checks resolve import targets on disk, so element-to-element cases import the committed
// fixtures under tests/lint/fixtures/src. Package bans need no target file.
const FX = "tests/lint/fixtures/src";

const cases: [file: string, source: string, rule: string | null][] = [
  // layers and features (eslint-plugin-boundaries)
  [
    `${FX}/features/alpha/domain/x.ts`,
    'import "../../beta/domain/rule";',
    "boundaries/dependencies",
  ],
  [
    `${FX}/features/alpha/domain/x.ts`,
    'import "../application/use-case";',
    "boundaries/dependencies",
  ],
  [
    `${FX}/features/alpha/domain/x.ts`,
    'import "../../../adapters/alpha/store";',
    "boundaries/dependencies",
  ],
  [
    `${FX}/features/alpha/application/x.ts`,
    'import "../../../composition/wire";',
    "boundaries/dependencies",
  ],
  [`${FX}/features/alpha/ui/x.ts`, 'import "../../beta/domain/rule";', "boundaries/dependencies"],
  [`${FX}/adapters/alpha/x.ts`, 'import "../beta/store";', "boundaries/dependencies"],
  [`${FX}/ui/widget/x.ts`, 'import "../../features/alpha/ui/form";', "boundaries/dependencies"],
  [`${FX}/shared/util/x.ts`, 'import "../../composition/wire";', "boundaries/dependencies"],
  ["src/app/x.ts", 'import "@/adapters/db/client/client";', "boundaries/dependencies"],
  [`${FX}/app/x.ts`, 'import "../features/alpha/domain/rule";', "boundaries/dependencies"],
  [`${FX}/features/alpha/domain/x.ts`, 'import "./rule";', null],
  [`${FX}/features/alpha/domain/x.ts`, 'import "../../../shared/util/util";', null],
  [`${FX}/features/alpha/application/x.ts`, 'import "../domain/rule";', null],
  [`${FX}/features/alpha/ui/x.ts`, 'import "../../../ui/widget/widget";', null],
  [`${FX}/composition/x.ts`, 'import "../adapters/alpha/store";', null],
  [`${FX}/composition/x.ts`, 'import "../features/alpha/application/use-case";', null],
  [`${FX}/adapters/alpha/x.ts`, 'import "../../features/alpha/application/use-case";', null],
  ["src/app/x.ts", 'import "@/composition/request-db/request-db";', null],
  [`${FX}/app/x.ts`, 'import "../features/alpha/ui/form";', null],
  [`${FX}/app/x.ts`, 'import "../features/alpha/application/use-case";', null],
  // package bans (no-restricted-imports)
  ["src/features/demo/domain/x.ts", 'import "drizzle-orm";', "no-restricted-imports"],
  ["src/features/demo/domain/x.ts", 'import "next/link";', "no-restricted-imports"],
  ["src/features/demo/domain/x.ts", 'import "react";', "no-restricted-imports"],
  ["src/features/demo/domain/x.ts", 'import "better-auth";', "no-restricted-imports"],
  ["src/features/demo/ui/x.tsx", 'import "react-aria-components";', "no-restricted-imports"],
  ["src/features/demo/application/x.ts", 'import "drizzle-orm";', "no-restricted-imports"],
  ["src/app/x.tsx", 'import "react-aria-components";', "no-restricted-imports"],
  ["src/composition/x.ts", 'import "drizzle-orm";', "no-restricted-imports"],
  ["src/features/demo/domain/x.ts", 'import "zod";', null],
  ["src/features/demo/ui/x.tsx", 'import "next/link";', null],
  ["src/ui/primitives/x/x.tsx", 'import "react-aria-components";', null],
  ["src/adapters/db/x.ts", 'import "server-only"; import "drizzle-orm";', null],
  ["src/composition/x.ts", 'import "server-only"; import "@opennextjs/cloudflare";', null],
];

describe("architecture boundaries", () => {
  it.each(cases)(
    "AC-FND-009 %s ← %s → %s",
    async (file, source, rule) => {
      const ids = (await ruleIds(file, source)).filter(
        (id) => id === "boundaries/dependencies" || id === "no-restricted-imports",
      );
      expect(ids).toEqual(rule ? [rule] : []);
    },
    30_000,
  );
});
```

- [ ] **Step 4: Write the coding-rules test.**

```ts
// tests/lint/coding-rules.test.ts
import { describe, expect, it } from "vitest";

import { ruleIds } from "./helpers/lint-source";

const cases: [name: string, file: string, source: string, rule: string | null][] = [
  [
    "server module without server-only",
    "src/composition/x.ts",
    "export const a = 1;",
    "local/require-server-only",
  ],
  [
    "server module with server-only",
    "src/composition/x.ts",
    'import "server-only";\nexport const a = 1;',
    null,
  ],
  [
    "schema file may skip server-only",
    "src/features/demo/application/x.schema.ts",
    "export const aSchema = 1;",
    null,
  ],
  [
    "Drizzle schema file skips server-only",
    "src/adapters/db/schema/x.ts",
    "export const a = 1;",
    null,
  ],
  [
    "process.env in src",
    "src/shared/x.ts",
    "export const a = process.env.X;",
    "no-restricted-properties",
  ],
  ["inline JSX text", "src/app/x.tsx", "export const A = () => <p>Halo</p>;", "local/ui-copy"],
  [
    "inline copy prop",
    "src/app/x.tsx",
    'export const A = () => <input placeholder="Email" />;',
    "local/ui-copy",
  ],
  [
    "copy from a constant",
    "src/app/x.tsx",
    "const C = { t: 'x' };\nexport const A = () => <p>{C.t}</p>;",
    null,
  ],
  [
    "inline JSX handler",
    "src/app/x.tsx",
    "export const A = () => <button onClick={() => 1} />;",
    "no-restricted-syntax",
  ],
  ["TS enum", "src/shared/x.ts", "export enum A { B }", "no-restricted-syntax"],
  [
    "interface in a component file",
    "src/ui/x/x.tsx",
    "export interface P { a: string }",
    "no-restricted-syntax",
  ],
  [
    "schema in a component file",
    "src/ui/x/x.tsx",
    "export const aSchema = 1;",
    "no-restricted-syntax",
  ],
  [
    "value in a .types.ts file",
    "src/shared/x.types.ts",
    "export const a = 1;",
    "no-restricted-syntax",
  ],
  [
    "types in a .types.ts file",
    "src/shared/x.types.ts",
    'export type A = "x" | "y";\nexport interface B { a: A }',
    null,
  ],
  [
    "type in a .schema.ts file",
    "src/shared/x.schema.ts",
    "export type A = string;",
    "no-restricted-syntax",
  ],
  [
    "non-Schema name in a .schema.ts file",
    "src/shared/x.schema.ts",
    "export const a = 1;",
    "no-restricted-syntax",
  ],
  [
    "type assertion",
    "src/shared/x.ts",
    "export const a = 1 as number;",
    "@typescript-eslint/consistent-type-assertions",
  ],
  ["as const", "src/shared/x.ts", "export const a = [1] as const;", null],
  [
    "disabling a SonarJS rule",
    "src/shared/x.ts",
    "// eslint-disable-next-line sonarjs/no-empty-function -- x\nexport const a = 1;",
    "@eslint-community/eslint-comments/no-restricted-disable",
  ],
];

describe("coding rules enforced by lint", () => {
  it.each(cases)(
    "%s",
    async (_name, file, source, rule) => {
      const ids = await ruleIds(file, source);
      if (rule) expect(ids).toContain(rule);
      else expect(ids.filter((id) => !id.startsWith("simple-import-sort"))).toEqual([]);
    },
    30_000,
  );
});
```

- [ ] **Step 5: Run them, then lint the real tree.**

Run: `pnpm vitest run tests/lint && pnpm lint`
Expected: PASS (33 + 19 cases), and `pnpm lint` exits 0 on the whole repository, fixtures included.

If `src/app/api/health/route.ts` or `src/composition/*` is flagged, the config is wrong: fix it, not the code.

- [ ] **Step 6: Commit.**

```bash
git add tests/lint
git commit -m "test(foundation): prove architecture boundaries and coding-rule lint

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

# Iteration 5 — Design-system base

## Task 12: Generate tokens.css from tokens.json

**Files:**
- Create: `scripts/tokens/build-tokens-css/build-tokens-css.ts`, `scripts/tokens/tokens-css.ts`, `src/ui/theme/tokens.css` (generated)
- Modify: `package.json` (scripts `tokens:css`, `tokens:check`; `lint`)
- Test: `scripts/tokens/build-tokens-css/build-tokens-css.test.ts`

**Interfaces:**
- Consumes: `docs/design-system/tokens.json` (read-only; it's generated by `docs/design-system/scripts/gen_tokens.py`).
- Produces:
  - `buildTokensCss(tokens: unknown): { css: string; count: number }`
  - `cssVarName(path: readonly string[]): string`
  - `src/ui/theme/tokens.css`

- [ ] **Step 1: Write the failing test.**

```ts
// scripts/tokens/build-tokens-css/build-tokens-css.test.ts
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { buildTokensCss, cssVarName } from "./build-tokens-css";

const fixture = {
  $description: "fixture",
  $extensions: { "dev.pen.themes": { mode: ["light", "dark"] } },
  color: {
    $type: "color",
    primitive: {
      neutral: { "0": { $value: "#FFFFFF" }, "950": { $value: "#09090B" } },
    },
    semantic: {
      surface: {
        panel: {
          $value: "{color.primitive.neutral.0}",
          $extensions: { "dev.pen.modes": { dark: "{color.primitive.neutral.950}" } },
        },
      },
    },
  },
  space: { "0-5": { $type: "number", $value: 2 } },
  opacity: { disabled: { $type: "number", $value: 0.4 } },
  font: {
    family: { base: { $type: "string", $value: "Plus Jakarta Sans" } },
    weight: { bold: { $type: "string", $value: "700" } },
    "line-height": { body: { $type: "number", $value: 1.5 } },
    size: { body: { $type: "number", $value: 14 } },
  },
  component: { button: { radius: { $type: "number", $value: "{space.0-5}" } } },
};

describe("buildTokensCss", () => {
  it("AC-FND-012 names variables by path", () => {
    expect(cssVarName(["color", "semantic", "surface", "canvas"])).toBe(
      "--color-semantic-surface-canvas",
    );
    expect(cssVarName(["space", "0-5"])).toBe("--space-0-5");
  });

  it("AC-FND-012 emits light values on :root with the right units", () => {
    const { css, count } = buildTokensCss(fixture);
    expect(count).toBe(10);
    const root = css.slice(css.indexOf(":root {"), css.indexOf('[data-theme="dark"]'));
    expect(root).toContain("--color-primitive-neutral-0: #FFFFFF;");
    expect(root).toContain("--color-semantic-surface-panel: var(--color-primitive-neutral-0);");
    expect(root).toContain("--space-0-5: 2px;");
    expect(root).toContain("--opacity-disabled: 0.4;");
    expect(root).toContain('--font-family-base: "Plus Jakarta Sans";');
    expect(root).toContain("--font-weight-bold: 700;");
    expect(root).toContain("--font-line-height-body: 1.5;");
    expect(root).toContain("--font-size-body: 14px;");
    expect(root).toContain("--component-button-radius: var(--space-0-5);");
  });

  it("AC-FND-012 emits dark overrides only for tokens with a dark mode", () => {
    const { css } = buildTokensCss(fixture);
    const dark = css.slice(css.indexOf('[data-theme="dark"] {'));
    expect(dark).toContain("--color-semantic-surface-panel: var(--color-primitive-neutral-950);");
    expect(dark).not.toContain("--space-0-5");
  });

  it("rejects an alias to a token that does not exist", () => {
    const broken = { a: { b: { $type: "color", $value: "{color.missing}" } } };
    expect(() => buildTokensCss(broken)).toThrow("Unknown alias {color.missing} in a.b");
  });

  it("rejects two tokens that map to the same variable", () => {
    const clash = {
      a: { "b-c": { $type: "number", $value: 1 } },
      "a-b": { c: { $type: "number", $value: 2 } },
    };
    expect(() => buildTokensCss(clash)).toThrow("CSS variable collision --a-b-c");
  });

  it("AC-FND-012 mirrors the approved tokens.json (479 tokens, 58 dark overrides)", () => {
    const tokens: unknown = JSON.parse(readFileSync("docs/design-system/tokens.json", "utf8"));
    const { css, count } = buildTokensCss(tokens);
    expect(count).toBe(479);
    const dark = css.slice(css.indexOf('[data-theme="dark"] {'));
    expect(dark.match(/^ {2}--/gm)).toHaveLength(58);
    expect(css).toContain("--color-semantic-surface-inverse:");
    expect(css).toContain("--component-alert-info-background:");
    expect(css).toContain("--space-4: 16px;");
    expect(css).toContain("--component-button-radius: var(--radius-full);");
    expect(css).toContain("--opacity-disabled: 0.4;");
    expect(css).toContain('--font-family-base: "Plus Jakarta Sans";');
    expect(dark).toContain("--color-semantic-surface-canvas: var(--color-primitive-neutral-950);");
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run scripts/tokens`
Expected: FAIL, "Cannot find module './build-tokens-css'".

- [ ] **Step 3: Implement the builder and the CLI.**

```ts
// scripts/tokens/build-tokens-css/build-tokens-css.ts
type Json = Record<string, unknown>;

interface Leaf {
  path: string[];
  value: unknown;
  dark: unknown;
}

const HEADER =
  "/* Generated by `pnpm tokens:css` from docs/design-system/tokens.json. Do not edit. */";
const ALIAS = /^\{([^}]+)\}$/;
const UNITLESS_PREFIXES = ["opacity.", "font.line-height.", "font.weight."];

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collect(node: Json, path: string[], out: Leaf[]): void {
  if ("$value" in node) {
    const modes = isObject(node.$extensions) ? node.$extensions["dev.pen.modes"] : undefined;
    out.push({ path, value: node.$value, dark: isObject(modes) ? modes.dark : undefined });
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (!key.startsWith("$") && isObject(child)) collect(child, [...path, key], out);
  }
}

export function cssVarName(path: readonly string[]): string {
  return `--${path.join("-")}`;
}

function formatValue(dotted: string, raw: unknown, known: ReadonlySet<string>): string {
  if (typeof raw === "string") {
    const alias = ALIAS.exec(raw);
    if (alias) {
      const target = alias[1];
      if (!known.has(target)) throw new Error(`Unknown alias {${target}} in ${dotted}`);
      return `var(${cssVarName(target.split("."))})`;
    }
    return dotted.startsWith("font.family.") ? `"${raw}"` : raw;
  }
  if (typeof raw === "number") {
    return UNITLESS_PREFIXES.some((prefix) => dotted.startsWith(prefix))
      ? String(raw)
      : `${String(raw)}px`;
  }
  throw new Error(`Unsupported token value in ${dotted}`);
}

export function buildTokensCss(tokens: unknown): { css: string; count: number } {
  if (!isObject(tokens)) throw new Error("tokens.json must contain an object");
  const leaves: Leaf[] = [];
  collect(tokens, [], leaves);

  const known = new Set(leaves.map((leaf) => leaf.path.join(".")));
  const owners = new Map<string, string>();
  for (const leaf of leaves) {
    const name = cssVarName(leaf.path);
    const previous = owners.get(name);
    if (previous)
      throw new Error(`CSS variable collision ${name}: ${previous} and ${leaf.path.join(".")}`);
    owners.set(name, leaf.path.join("."));
  }

  const line = (leaf: Leaf, raw: unknown) =>
    `  ${cssVarName(leaf.path)}: ${formatValue(leaf.path.join("."), raw, known)};`;
  const light = leaves.map((leaf) => line(leaf, leaf.value));
  const dark = leaves
    .filter((leaf) => leaf.dark !== undefined)
    .map((leaf) => line(leaf, leaf.dark));

  const css = [
    HEADER,
    ":root {",
    ...light,
    "}",
    "",
    '[data-theme="dark"] {',
    ...dark,
    "}",
    "",
  ].join("\n");
  return { css, count: leaves.length };
}
```

```ts
// scripts/tokens/tokens-css.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { buildTokensCss } from "./build-tokens-css/build-tokens-css";

const SOURCE = "docs/design-system/tokens.json";
const TARGET = "src/ui/theme/tokens.css";

const { css, count } = buildTokensCss(JSON.parse(readFileSync(SOURCE, "utf8")));

if (process.argv.includes("--check")) {
  const current = existsSync(TARGET) ? readFileSync(TARGET, "utf8") : "";
  if (current !== css) {
    console.error(`${TARGET} is stale. Run: pnpm tokens:css`);
    process.exit(1);
  }
  console.log(`${TARGET} is up to date (${String(count)} tokens).`);
} else {
  writeFileSync(TARGET, css);
  console.log(`Wrote ${TARGET} (${String(count)} tokens).`);
}
```

Update `package.json › scripts`:

```json
"lint": "prettier --check . && eslint . && pnpm tokens:check",
"tokens:css": "tsx scripts/tokens/tokens-css.ts",
"tokens:check": "tsx scripts/tokens/tokens-css.ts --check"
```

- [ ] **Step 4: Run the tests, generate the file, and check for drift.**

Run: `pnpm vitest run scripts/tokens`
Expected: PASS, 6 tests.

Run: `mkdir -p src/ui/theme && pnpm tokens:css && pnpm tokens:check`
Expected: "Wrote src/ui/theme/tokens.css (479 tokens)." and then "… is up to date (479 tokens)."

Run: `echo "/* drift */" >> src/ui/theme/tokens.css && pnpm tokens:check; echo "exit=$?"; pnpm tokens:css`
Expected: "is stale", then `exit=1`, then the file is regenerated.

- [ ] **Step 5: Commit.**

```bash
git add scripts/tokens src/ui/theme/tokens.css package.json
git commit -m "feat(foundation): generate tokens.css from the approved design tokens

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 13: Theme wiring, fonts and the React Aria locale

**Files:**
- Create: `src/ui/providers/app-providers.tsx`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Consumes: `src/ui/theme/tokens.css` (Task 12).
- Produces:
  - `AppProviders({ children }: Readonly<PropsWithChildren>)`, which wraps children in `I18nProvider locale="id-ID"`. Props use `Readonly<…>` (SonarJS `prefer-read-only-props`), and `PropsWithChildren` avoids an inline props type.
  - global base styles: body canvas, text colour, and the Plus Jakarta Sans stack

- [ ] **Step 1: Write the provider.**

```tsx
// src/ui/providers/app-providers.tsx
"use client";

import type { PropsWithChildren } from "react";
import { I18nProvider } from "react-aria-components";

/**
 * Client-side providers for the whole app. React Aria formats dates and numbers for the MVP
 * locale (ADR-010).
 * @param props - the app tree
 * @returns the tree inside `I18nProvider locale="id-ID"`
 */
export function AppProviders({ children }: Readonly<PropsWithChildren>) {
  return <I18nProvider locale="id-ID">{children}</I18nProvider>;
}
```

- [ ] **Step 2: Wire the tokens and the base styles.**

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "../ui/theme/tokens.css";

@layer base {
  body {
    background: var(--color-semantic-surface-canvas);
    color: var(--color-semantic-text-primary);
    font-family: var(--font-sans-loaded), var(--font-family-base), sans-serif;
    font-size: var(--font-size-body);
    line-height: var(--font-line-height-body);
  }
}
```

```tsx
// src/app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { PropsWithChildren } from "react";

import { AppProviders } from "@/ui/providers/app-providers";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
});

export const metadata: Metadata = { title: "Shutrly" };

// Light theme by default; dark is opt-in with data-theme="dark" (no feature specifies a switch yet).
export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="id" className={sans.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Check it visually and run the gate.**

Run: `pnpm dev` and open `http://localhost:3000`. Then stop the server.
Expected: a light grey canvas (`surface.canvas`), a lime 16 px mark, a bold "shutrly." wordmark, and the h1 in secondary text, all in Plus Jakarta Sans.

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all exit 0.

- [ ] **Step 4: Commit.**

```bash
git add src/ui/providers src/app/globals.css src/app/layout.tsx
git commit -m "feat(foundation): wire token theme, Plus Jakarta Sans and id-ID locale

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 14: Button primitive

**Files:**
- Create: `src/ui/cn/cn.ts`, `src/ui/primitives/button/button.types.ts`, `src/ui/primitives/button/button.tsx`
- Test: `src/ui/cn/cn.test.ts`, `src/ui/primitives/button/button.test.tsx`

**Interfaces:**
- Consumes: the token variables from Task 12.
- Produces:
  - `cn(...inputs: ClassValue[]): string` (clsx + tailwind-merge), the only way `src/` merges class names.
  - `ButtonVariant`, `ButtonProps` in `button.types.ts`
  - `Button(props: Readonly<ButtonProps>)`, with `ButtonProps = { type?: "button" | "submit"; variant?: "primary" | "secondary"; isDisabled?: boolean; onPress?: () => void; className?: string; children: ReactNode }`. Defaults: `type="button"`, `variant="primary"`.

- [ ] **Step 1: Test-drive `cn`.** Write the test:

```ts
// src/ui/cn/cn.test.ts
import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins conditional classes and drops falsy ones", () => {
    expect(cn("a", ["b"], { c: true, d: false }, undefined)).toBe("a b c");
  });

  it("lets a later Tailwind utility win a conflict", () => {
    expect(cn("px-(--space-2)", "px-(--space-4)")).toBe("px-(--space-4)");
  });

  it("keeps a font-size and a text colour, which don't conflict", () => {
    expect(cn("text-(length:--font-size-body)", "text-(--color-semantic-text-primary)")).toBe(
      "text-(length:--font-size-body) text-(--color-semantic-text-primary)",
    );
  });
});
```

Run: `pnpm vitest run src/ui/cn`
Expected: FAIL, "Cannot find module './cn'".

Implement:

```ts
// src/ui/cn/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join conditional class names; a later Tailwind utility overrides a conflicting earlier one.
 * @param inputs - class strings, arrays or `{ class: condition }` maps
 * @returns one class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Run: `pnpm vitest run src/ui/cn`
Expected: PASS, 3 tests. The third test proves tailwind-merge keeps a `text-(length:…)` size next to a `text-(--…)` colour.

- [ ] **Step 2: Write the failing Button test.**

```tsx
// src/ui/primitives/button/button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SubmitEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("AC-FND-013 fires onPress once per click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Simpan</Button>);
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(2);
    await user.keyboard(" ");
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it("AC-FND-013 does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Simpan
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Simpan" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("AC-FND-013 marks keyboard focus for the visible focus ring", async () => {
    const user = userEvent.setup();
    render(<Button>Simpan</Button>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Simpan" })).toHaveAttribute("data-focus-visible");
  });

  it("AC-FND-013 defaults to type=button and submits its form with type=submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Button>Batal</Button>
        <Button type="submit">Kirim</Button>
      </form>,
    );
    expect(screen.getByRole("button", { name: "Batal" })).toHaveAttribute("type", "button");
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("AC-FND-013 styles each variant only through token variables", () => {
    render(
      <>
        <Button>Utama</Button>
        <Button variant="secondary" className="w-full">
          Kedua
        </Button>
      </>,
    );
    const primary = screen.getByRole("button", { name: "Utama" }).className;
    const secondary = screen.getByRole("button", { name: "Kedua" }).className;
    expect(primary).toContain("--component-button-primary-background");
    expect(secondary).toContain("--component-button-secondary-background");
    expect(secondary).toContain("w-full");
    expect(primary + secondary).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
```

- [ ] **Step 3: Run it and check that it fails.**

Run: `pnpm vitest run src/ui/primitives/button`
Expected: FAIL, "Cannot find module './button'".

- [ ] **Step 4: Implement** (design-system C01; MD size only, A-4). The class lists are arrays merged by `cn()`, and the props type lives in `button.types.ts`.

```ts
// src/ui/primitives/button/button.types.ts
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps {
  type?: "button" | "submit";
  variant?: ButtonVariant;
  isDisabled?: boolean;
  onPress?: () => void;
  className?: string;
  children: ReactNode;
}
```

```tsx
// src/ui/primitives/button/button.tsx
"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { ButtonProps, ButtonVariant } from "./button.types";

// C01 MD: padding 12/36, 18 px line → 42 px high. Focus: 2 px ring, offset 2, plus the glow halo.
const BASE = [
  "inline-flex items-center justify-center gap-(--component-button-gap) whitespace-nowrap",
  "rounded-(--component-button-radius)",
  "px-(--component-button-md-padding-x) py-(--component-button-md-padding-y)",
  "text-(length:--font-size-body) leading-[18px] font-semibold",
  "outline-none transition-colors",
  "data-focus-visible:outline-2 data-focus-visible:outline-offset-2",
  "data-focus-visible:outline-(--color-semantic-focus-ring)",
  "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
];

// Secondary draws its 1 px border as an inset shadow so both variants stay 42 px high.
const VARIANTS: Record<ButtonVariant, string[]> = {
  primary: [
    "bg-(--component-button-primary-background) text-(--component-button-primary-text)",
    "data-hovered:bg-(--component-button-primary-background-hover)",
    "data-pressed:bg-(--component-button-primary-background-hover)",
    "data-focus-visible:shadow-[0_0_0_4px_var(--color-semantic-focus-glow)]",
  ],
  secondary: [
    "bg-(--component-button-secondary-background) text-(--component-button-secondary-text)",
    "shadow-[inset_0_0_0_1px_var(--component-button-secondary-border)]",
    "data-hovered:bg-(--component-button-secondary-background-hover)",
    "data-pressed:bg-(--component-button-secondary-background-hover)",
    "data-focus-visible:shadow-[inset_0_0_0_1px_var(--component-button-secondary-border),0_0_0_4px_var(--color-semantic-focus-glow)]",
  ],
};

/**
 * Design-system button (C01, MD) on React Aria: press, keyboard and focus-visible handling.
 * @param props - `type` defaults to `"button"` and `variant` to `"primary"`
 * @returns the styled button
 */
export function Button({
  type = "button",
  variant = "primary",
  isDisabled,
  onPress,
  className,
  children,
}: Readonly<ButtonProps>) {
  return (
    <AriaButton
      type={type}
      isDisabled={isDisabled}
      onPress={onPress}
      className={cn(BASE, VARIANTS[variant], className)}
    >
      {children}
    </AriaButton>
  );
}
```

- [ ] **Step 5: Run it and check that it passes.**

Run: `pnpm vitest run src/ui/primitives/button && pnpm typecheck`
Expected: PASS, 5 tests; typecheck exits 0.

- [ ] **Step 6: Commit.**

```bash
git add src/ui/cn src/ui/primitives/button
git commit -m "feat(foundation): add cn() and the Button primitive (C01) on React Aria

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 15: TextField primitive

**Files:**
- Create: `src/ui/primitives/text-field/text-field.types.ts`, `src/ui/primitives/text-field/text-field.tsx`
- Test: `src/ui/primitives/text-field/text-field.test.tsx`

**Interfaces:**
- Consumes: the token variables from Task 12.
- Produces: `TextField(props: Readonly<TextFieldProps>)`, where `TextFieldProps` (in `text-field.types.ts`) = `{ label: string; name: string; type?: string; autoComplete?: string; placeholder?: string; description?: string; errorMessage?: string; isReadOnly?: boolean; value: string; onChange: (value: string) => void; onBlur: () => void; inputRef?: Ref<HTMLInputElement> }`. `onChange` and `onBlur` are property signatures, not methods, so destructuring them passes `unbound-method`. `onBlur` is passed straight through (no inline arrow); React Aria's focus event argument is ignored.

- [ ] **Step 1: Write the failing test.**

```tsx
// src/ui/primitives/text-field/text-field.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type SubmitEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { TextField } from "./text-field";
import type { TextFieldProps } from "./text-field.types";

function renderField(props: Partial<TextFieldProps> = {}) {
  const onChange = vi.fn();
  const onBlur = vi.fn();
  render(
    <TextField
      label="Email"
      name="email"
      type="email"
      value=""
      onChange={onChange}
      onBlur={onBlur}
      {...props}
    />,
  );
  return { input: screen.getByLabelText("Email"), onChange, onBlur };
}

describe("TextField", () => {
  it("AC-FND-014 labels the input and forwards name, type and autoComplete", () => {
    const { input } = renderField({ autoComplete: "email", placeholder: "rina@studio.id" });
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("placeholder", "rina@studio.id");
  });

  it("AC-FND-014 describes the input with the helper text and is not invalid", () => {
    const { input } = renderField({ description: "Kami kirim tautan ke email ini." });
    expect(input).toHaveAccessibleDescription("Kami kirim tautan ke email ini.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("AC-FND-014 replaces the helper with the error and sets aria-invalid", () => {
    const { input } = renderField({
      description: "Kami kirim tautan ke email ini.",
      errorMessage: "Masukkan email yang valid",
    });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Masukkan email yang valid");
    expect(screen.queryByText("Kami kirim tautan ke email ini.")).toBeNull();
  });

  it("AC-FND-014 reports string values and blur", async () => {
    const user = userEvent.setup();
    const { input, onChange, onBlur } = renderField();
    await user.type(input, "a");
    expect(onChange).toHaveBeenCalledWith("a");
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("AC-FND-014 forwards inputRef to the <input>", () => {
    const inputRef = createRef<HTMLInputElement>();
    const { input } = renderField({ inputRef });
    expect(inputRef.current).toBe(input);
  });

  it("AC-FND-014 does not block form submission while invalid (validationBehavior=aria)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <TextField
          label="Email"
          name="email"
          value=""
          onChange={vi.fn()}
          onBlur={vi.fn()}
          errorMessage="Wajib diisi"
        />
        <button type="submit">Kirim</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run src/ui/primitives/text-field`
Expected: FAIL, "Cannot find module './text-field'".

- [ ] **Step 3: Implement** (design-system C18 over C03).

```ts
// src/ui/primitives/text-field/text-field.types.ts
import type { Ref } from "react";

export interface TextFieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  isReadOnly?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef?: Ref<HTMLInputElement>;
}
```

```tsx
// src/ui/primitives/text-field/text-field.tsx
"use client";

import { FieldError, Input, Label, Text, TextField as AriaTextField } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { TextFieldProps } from "./text-field.types";

// C03 Input: 40 px high, 1 px border; focus and error read as 2 px via an inset shadow (no layout shift).
const INPUT = [
  "h-(--component-input-height) w-full rounded-(--component-input-radius)",
  "px-(--component-input-padding-x)",
  "border border-(--component-input-border) bg-(--component-input-background)",
  "text-(length:--font-size-body) text-(--component-input-text)",
  "placeholder:text-(--component-input-placeholder)",
  "outline-none transition-colors",
  "data-hovered:border-(--component-input-border-hover)",
  "data-focused:border-(--component-input-border-focus)",
  "data-focused:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)]",
  "data-invalid:border-(--component-input-border-error)",
  "data-invalid:shadow-[inset_0_0_0_1px_var(--component-input-border-error)]",
];

const MESSAGE = "text-(length:--font-size-label)";

/**
 * Design-system text field (C18 over C03): label, input, helper text, and an error that replaces
 * the helper. Invalid fields don't block submit (`validationBehavior="aria"`), which React Hook
 * Form relies on.
 * @param props - controlled `value` / `onChange`, plus `errorMessage` to mark it invalid
 * @returns the labelled field
 */
export function TextField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  description,
  errorMessage,
  isReadOnly,
  value,
  onChange,
  onBlur,
  inputRef,
}: Readonly<TextFieldProps>) {
  const isInvalid = Boolean(errorMessage);
  return (
    <AriaTextField
      name={name}
      type={type}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      validationBehavior="aria"
      className="flex flex-col gap-(--component-input-gap)"
    >
      <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {label}
      </Label>
      <Input ref={inputRef} placeholder={placeholder} className={cn(INPUT)} />
      {description && !isInvalid ? (
        <Text slot="description" className={cn(MESSAGE, "text-(--component-input-helper)")}>
          {description}
        </Text>
      ) : null}
      <FieldError
        className={cn(
          MESSAGE,
          "flex items-center gap-(--component-input-content-gap) text-(--component-input-error-text)",
        )}
      >
        <CircleAlertIcon />
        {errorMessage}
      </FieldError>
    </AriaTextField>
  );
}

function CircleAlertIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
```

- [ ] **Step 4: Run it and check that it passes.**

Run: `pnpm vitest run src/ui/primitives/text-field && pnpm typecheck`
Expected: PASS, 6 tests; typecheck exits 0.

- [ ] **Step 5: Commit.**

```bash
git add src/ui/primitives/text-field
git commit -m "feat(foundation): add TextField primitive (C18) on React Aria

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 16: Generic error page

**Files:**
- Create: `src/app/error.copy.ts`, `src/app/error.types.ts`, `src/app/error.tsx`
- Test: `src/app/error.test.tsx`

**Interfaces:**
- Consumes: `Button` (Task 14).
- Produces: the App Router error boundary. It shows generic copy (`ERROR_PAGE_COPY` in `error.copy.ts`) and a retry button, and never shows `error.message`. The sibling `error.copy.ts` / `error.types.ts` aren't route files, because Next only treats `error.tsx` as special.

- [ ] **Step 1: Write the failing test.**

```tsx
// src/app/error.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe("error boundary page", () => {
  it("AC-FND-010 shows a generic message without the error details", () => {
    const error = Object.assign(new Error("connect failed postgresql://user:pw@host/db"), {
      digest: "123",
    });
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Terjadi kesalahan");
    expect(document.body.textContent).not.toContain("postgresql");
    expect(document.body.textContent).not.toContain("connect failed");
  });

  it("AC-FND-010 retries with reset", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorPage error={new Error("x")} reset={reset} />);
    await user.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it and check that it fails.**

Run: `pnpm vitest run src/app`
Expected: FAIL, "Cannot find module './error'".

- [ ] **Step 3: Implement.**

```ts
// src/app/error.copy.ts
// not in Pencil — generic copy, pending the UI-language decision (auth CONFLICT-1).
export const ERROR_PAGE_COPY = {
  title: "Terjadi kesalahan",
  body: "Coba lagi sebentar lagi.",
  retry: "Coba lagi",
} as const;
```

```ts
// src/app/error.types.ts
export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}
```

```tsx
// src/app/error.tsx
"use client";

import { Button } from "@/ui/primitives/button/button";

import { ERROR_PAGE_COPY } from "./error.copy";
import type { ErrorPageProps } from "./error.types";

// Never render error.message: server errors can carry internals (C-103). onRequestError logs them.
export default function ErrorPage({ reset }: Readonly<ErrorPageProps>) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-(--space-4) p-(--space-6) text-center">
      <h1 className="text-(length:--font-size-title) font-bold text-(--color-semantic-text-primary)">
        {ERROR_PAGE_COPY.title}
      </h1>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {ERROR_PAGE_COPY.body}
      </p>
      <Button variant="secondary" onPress={reset}>
        {ERROR_PAGE_COPY.retry}
      </Button>
    </main>
  );
}
```

- [ ] **Step 4: Run it, then run the gate.**

Run: `pnpm vitest run src/app && pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: PASS, 2 tests; all commands exit 0.

- [ ] **Step 5: Commit.**

```bash
git add src/app/error.tsx src/app/error.test.tsx
git commit -m "feat(foundation): add a generic error page that hides error details

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

# Iteration 6 — E2E, Workers proof and contract hand-off

## Task 17: Browser smoke test and Workers preview

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (script `e2e`)

**Interfaces:**
- Consumes: the home page (Tasks 1 and 13) and `/api/health` (Task 8).
- Produces: script `e2e`. Playwright's `webServer` runs `pnpm dev` at `http://localhost:3000`, with `baseURL` set to that.

- [ ] **Step 1: Write the config and the smoke test.**

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "pnpm dev", url: baseURL, reuseExistingServer: true, timeout: 120_000 },
});
```

```ts
// tests/e2e/smoke.spec.ts
import { expect, test } from "@playwright/test";

test("AC-FND-015 home page renders with the Indonesian locale and token styles", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const canvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-semantic-surface-canvas")
      .trim(),
  );
  expect(canvas).not.toBe("");
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
});

test("AC-FND-005 health check reaches the database through a per-request pool", async ({
  request,
}) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect(response.headers()["cache-control"]).toContain("no-store");
});
```

Add to `package.json › scripts`:

```json
"e2e": "playwright test"
```

- [ ] **Step 2: Install the browser and run the smoke test.**

Run: `pnpm exec playwright install chromium`
Expected: Chromium downloads, or is already installed.

Run: `pnpm e2e`
Expected: 2 passed.

- [ ] **Step 3: Prove the Workers runtime (AC-FND-003, R-4).**

Run: `pnpm preview`. Wait for Wrangler to print the local URL (default `http://localhost:8787`).

In another shell, run each of these:

```bash
curl -s http://localhost:8787/ | grep -o "shutrly."
```

```bash
curl -si http://localhost:8787/api/health
```

Expected: the first prints `shutrly.`; the second prints `HTTP/1.1 200` and `{"ok":true}`. That second result is Neon over WebSocket inside workerd.

Stop the preview. If `/api/health` fails only under workerd, stop and report it with the Wrangler log. It's the ADR-008/009 risk and needs an Owner decision.

- [ ] **Step 4: Commit.**

```bash
git add playwright.config.ts tests/e2e package.json
git commit -m "test(foundation): add Playwright smoke test and verify the Workers preview

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 18: Contract hand-off and docs

**Files:**
- Modify: `docs/features/auth/plan.md` (the *F-00 contracts* table: the Button variant, and a note on `.dev.vars`), `docs/features/foundation/technical-design.md` (status), `docs/product/feature-map.md` (F-00 status), `docs/HANDOFF.md`

**Interfaces:**
- Consumes: everything above.
- Produces: an F-00 that is ready for `/sdv:verify-feature foundation`, with F-01 Task 0 step 2 passing.

- [ ] **Step 1: Run the contract file check.** These are F-00's unit-folder paths. auth/plan.md Task 0 still lists the old flat paths until the auth revision pass (auth R-9).

```bash
for f in src/adapters/db/client/client.ts src/adapters/db/schema/index.ts src/composition/request-context/request-context.ts src/shared/env/app-env.ts src/shared/errors/domain-error.ts src/shared/logging/logger.ts src/ui/primitives/button/button.tsx src/ui/primitives/text-field/text-field.tsx src/ui/theme/tokens.css tests/integration/helpers/test-db.ts; do test -f "$f" && echo "ok  $f" || echo "MISSING $f"; done
```

Expected: ten `ok` lines.

- [ ] **Step 2: Run the full quality gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:integration && pnpm e2e`
Expected: every command exits 0.

- [ ] **Step 3: Update the docs.**
  - `docs/features/auth/plan.md` › *F-00 contracts*: already updated at planning time. That covers the Button variant `"primary" | "secondary"`, the env-files row, and the coding-rules v2.0 file split (`Db` in `client.types.ts`; `AppEnv` / `appEnvSchema` in `app-env.types.ts` / `app-env.schema.ts`; `RequestContext` in `request-context.types.ts`; `cn()`). Confirm that the shipped code still matches the table, and correct the table if anything drifted.
  - `docs/features/foundation/technical-design.md`: set the status line to `IMPLEMENTED (<date>) — awaiting /sdv:verify-feature foundation`.
  - `docs/product/feature-map.md`: set F-00 to `IN PROGRESS`. `/sdv:verify-feature` moves it to `DONE`.
  - `docs/HANDOFF.md`: in *Current handoff*, record that F-00 is implemented, give the verify command, and list the Next 16 `middleware` → `proxy` risk (R-1) for F-01 Task 0.

- [ ] **Step 4: Commit.**

```bash
git add docs
git commit -m "docs(foundation): record F-00 implementation and update the F-01 contract

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Self-review

- **Spec coverage:** capabilities 1–15 → Tasks 1, 5, 3, 5, 7–8, 10, 9, 9, 4/6/16, 4, 12–13, 14–15, 11, 2/10/17, and 1/2/5/10/12/17. AC-FND-001…016 → see the technical-design testing table.
- **Lint verified:** every `src/`, `tests/` and config block in this plan was linted with the Task 2 config, type-checked with TS 6.0.3, and its unit tests run (102 passing) in a scratch project on 2026-09-27. The integration smoke test needs the real `.env.test`.
- **Placeholders:** the only `<…>` values are the Owner's Neon connection strings in `.dev.vars` / `.env.test`, which must not be written here.
- **Type consistency:** `RequestContext`, `Db`, `DbHandle`, `createDb`, `withRequestDb`, `pingDatabase`, `AppEnv`, `appEnvSchema`, `WorkspaceId`, `WorkspaceContext`, `ButtonProps`, `TextFieldProps`, `cn` and `openTestDb` are the same in every task that uses them, and they match auth/plan.md › *F-00 contracts* except for the recorded Button variant change.
