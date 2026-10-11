import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { SOURCE_COPY_NAMESPACE } from "../source-copy/source-copy.copy";
import { SOURCE_NAME_ERROR_KEYS, sourceNameErrorText } from "./source-name-error";

const APPROVED_ID = {
  EMPTY: "Isi nama sumber.",
  TOO_LONG: "Gunakan maksimal 60 karakter.",
  NAME_TAKEN: "Nama ini sudah dipakai di ruang kerja ini.",
  PROVIDER_UNAVAILABLE: "Penyedia ini belum tersedia.",
} as const;

describe("sourceNameErrorText", () => {
  it.each(SOURCE_NAME_ERROR_KEYS)("maps %s to the approved Indonesian copy", (key) => {
    const t = copyTranslator(SOURCE_COPY_NAMESPACE, "id");
    expect(sourceNameErrorText(t, key)).toBe(APPROVED_ID[key]);
  });

  it("reads the English message for an error code", () => {
    const t = copyTranslator(SOURCE_COPY_NAMESPACE, "en");
    expect(sourceNameErrorText(t, "NAME_TAKEN")).toBe(
      "This name is already used in this workspace.",
    );
  });

  it("returns undefined for an unknown code", () => {
    expect(
      sourceNameErrorText(copyTranslator(SOURCE_COPY_NAMESPACE, "id"), "NOPE"),
    ).toBeUndefined();
  });
});
