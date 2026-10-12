import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { TEAM_COPY_NAMESPACE } from "./team-copy.copy";

describe("TEAM_COPY", () => {
  it("BR-L10N-002 shows the load-more pending label in each language", () => {
    expect(copyTranslator(TEAM_COPY_NAMESPACE, "en")("loadingMore")).toBe("Loading…");
    expect(copyTranslator(TEAM_COPY_NAMESPACE, "id")("loadingMore")).toBe("Memuat…");
  });
});
