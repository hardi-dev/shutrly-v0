import { ESLint } from "eslint";
import tseslint from "typescript-eslint";

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
  return results.flatMap((result) =>
    result.messages.map((message) => message.ruleId ?? "parse-error"),
  );
}
