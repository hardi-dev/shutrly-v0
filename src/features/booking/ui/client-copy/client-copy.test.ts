import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { CLIENT_COPY_NAMESPACE, CLIENT_COUNT_MESSAGE_KEY } from "./client-copy.copy";

describe("CLIENT_COPY", () => {
  const en = copyTranslator(CLIENT_COPY_NAMESPACE, "en");
  const id = copyTranslator(CLIENT_COPY_NAMESPACE, "id");

  it.each([
    ["ACTIVE", 38, "38 klien aktif"],
    ["ARCHIVED", 1, "1 klien diarsipkan"],
    ["ACTIVE", 0, "0 klien aktif"],
  ] as const)("formats the %s count in Indonesian", (status, count, expected) => {
    expect(id(CLIENT_COUNT_MESSAGE_KEY[status], { count })).toBe(expected);
  });

  it("pluralises the active count in English", () => {
    expect(en(CLIENT_COUNT_MESSAGE_KEY.ACTIVE, { count: 1 })).toBe("1 active client");
    expect(en(CLIENT_COUNT_MESSAGE_KEY.ACTIVE, { count: 3 })).toBe("3 active clients");
  });

  it("BR-L10N-002 shows the load-more pending label in each language", () => {
    expect(en("loadingMore")).toBe("Loading…");
    expect(id("loadingMore")).toBe("Memuat…");
  });
});
