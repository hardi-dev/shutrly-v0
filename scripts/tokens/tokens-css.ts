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
