import { describe, expect, it } from "vitest";

import { ruleIds } from "./helpers/lint-source";

describe("coding rules enforced by lint", () => {
  it("AC-FND-009 requires server-only", async () => {
    expect(await ruleIds("src/composition/x.ts", "export const a = 1;")).toContain(
      "local/require-server-only",
    );
  });

  it("AC-FND-009 rejects process.env in src", async () => {
    expect(await ruleIds("src/shared/x.ts", "export const a = process.env.X;")).toContain(
      "no-restricted-properties",
    );
  });

  it("AC-FND-009 rejects inline JSX copy and handlers", async () => {
    const ids = await ruleIds(
      "src/app/x.tsx",
      "export const A = () => <button onClick={() => 1}>Halo</button>;",
    );
    expect(ids).toContain("local/ui-copy");
    expect(ids).toContain("no-restricted-syntax");
  });

  it("AC-L10N-002 accepts t(key) with a namespace imported from a sibling copy module", async () => {
    const ids = await ruleIds(
      "src/ui/x.tsx",
      [
        'import { X_COPY_NAMESPACE } from "./x.copy";',
        'export const A = () => { const t = useTranslations(X_COPY_NAMESPACE); return <p>{t("a")}</p>; };',
      ].join("\n"),
    );
    expect(ids).not.toContain("local/ui-copy");
  });

  it("AC-L10N-002 rejects a string-literal namespace", async () => {
    expect(
      await ruleIds(
        "src/ui/x.tsx",
        'export const A = () => { const t = useTranslations("landing"); return <p>{t("a")}</p>; };',
      ),
    ).toContain("local/ui-copy");
  });
});
