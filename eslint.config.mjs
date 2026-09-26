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
    types: { anyOf: ["app", "composition", "feature-application", "feature-ui", "ui"] },
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
      parserOptions: {
        projectService: { allowDefaultProject: [".storybook/*.ts", ".storybook/*.tsx"] },
        tsconfigRootDir: import.meta.dirname,
      },
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
