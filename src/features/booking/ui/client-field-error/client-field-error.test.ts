import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { CLIENT_COPY_NAMESPACE } from "../client-copy/client-copy.copy";
import { clientFieldErrorText } from "./client-field-error";

const en = copyTranslator(CLIENT_COPY_NAMESPACE, "en");
const id = copyTranslator(CLIENT_COPY_NAMESPACE, "id");

describe("clientFieldErrorText", () => {
  it.each([
    ["EMPTY", "Enter the client’s name."],
    ["TOO_LONG", "Use no more than 100 characters."],
    ["INVALID", "Check this field and try again."],
    ["INVALID_URL", "Start the link with https://."],
    ["DUPLICATE", "This account is already listed."],
    ["UNKNOWN_PLATFORM", "Choose a platform from the list."],
    ["TOO_MANY", "Add no more than 10 social accounts."],
  ] as const)("maps %s in English", (key, expected) => {
    expect(clientFieldErrorText(en, key)).toBe(expected);
  });

  it("maps EMPTY in Indonesian", () => {
    expect(clientFieldErrorText(id, "EMPTY")).toBe("Isi nama klien.");
  });

  it("names an active number holder", () => {
    expect(clientFieldErrorText(en, "TAKEN", { name: "Rina", isArchived: false })).toBe(
      "This number is used by Rina.",
    );
  });

  it("names an archived number holder in Indonesian", () => {
    expect(clientFieldErrorText(id, "TAKEN", { name: "Budi", isArchived: true })).toBe(
      "Nomor ini dipakai Budi (diarsipkan).",
    );
  });
});
