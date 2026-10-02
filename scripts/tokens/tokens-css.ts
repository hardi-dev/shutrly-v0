import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { buildTokensCss } from "./build-tokens-css/build-tokens-css";
import { findUnknownCssVariables } from "./validate-css-usage/validate-css-usage";
const SOURCE = "docs/design-system/tokens.json";
const TARGET = "src/ui/theme/tokens.css";
const CSS_SOURCE_EXTENSIONS = /\.(?:css|scss|sass|less|ts|tsx|js|jsx|mjs|cjs|html|astro|vue)$/;
const CSS_SOURCE_ROOTS = ["src/", ".storybook/", "docs/design-system/exports/"];
const TEST_FILE = /(?:\.test|\.spec)\.[^.]+$/;
// These custom properties are supplied by runtime integrations rather than the
// design-token stylesheet: Next/font injects the font flag and React Aria
// supplies the trigger width for popovers.
const EXTERNAL_CSS_VARIABLES = new Set(["--font-sans-loaded", "--trigger-width"]);
const { css, count } = buildTokensCss(JSON.parse(readFileSync(SOURCE, "utf8")));
const knownVariables = new Set([
  ...[...css.matchAll(/^[ \t]*(--[a-z0-9-]+):/gim)].map((match) => match[1]),
  ...EXTERNAL_CSS_VARIABLES,
]);

function checkCssVariableUsage(): void {
  const collectFiles = (directory: string): { path: string; contents: string }[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(fullPath);
      const path = relative(process.cwd(), fullPath);
      return CSS_SOURCE_EXTENSIONS.test(path) && !TEST_FILE.test(path)
        ? [{ path, contents: readFileSync(fullPath, "utf8") }]
        : [];
    });
  const files = CSS_SOURCE_ROOTS.flatMap(collectFiles);
  const issues = findUnknownCssVariables(files, knownVariables);
  if (issues.length > 0) {
    console.error("Unknown CSS variables:");
    for (const issue of issues)
      console.error(`- ${issue.path}:${String(issue.line)} ${issue.variable}`);
    process.exit(1);
  }
  console.log(`CSS variable usage is valid (${String(files.length)} files checked).`);
}

if (process.argv.includes("--check")) {
  const current = existsSync(TARGET) ? readFileSync(TARGET, "utf8") : "";
  if (current !== css) {
    console.error(`${TARGET} is stale. Run: pnpm tokens:css`);
    process.exit(1);
  }
  console.log(`${TARGET} is up to date (${String(count)} tokens).`);
  checkCssVariableUsage();
} else {
  writeFileSync(TARGET, css);
  console.log(`Wrote ${TARGET} (${String(count)} tokens).`);
  checkCssVariableUsage();
}
