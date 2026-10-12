import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { TEAM_COPY_NAMESPACE } from "../team-copy/team-copy.copy";
import { teamMemberErrorText, teamRoleErrorText } from "./team-field-error";

const en = copyTranslator(TEAM_COPY_NAMESPACE, "en");
const id = copyTranslator(TEAM_COPY_NAMESPACE, "id");

describe("teamRoleErrorText", () => {
  it.each([
    ["EMPTY", "Enter a role name."],
    ["TOO_LONG", "Use no more than 50 characters."],
    ["DUPLICATE", "This role already exists."],
  ])("AC-TEAM-009 maps %s", (key, text) => {
    expect(teamRoleErrorText(en, key)).toBe(text);
  });

  it("maps a role name in Indonesian", () => {
    expect(teamRoleErrorText(id, "DUPLICATE")).toBe("Peran ini sudah ada.");
  });
});

describe("teamMemberErrorText", () => {
  it.each([
    ["name", "EMPTY", "Enter the member’s name."],
    ["name", "TOO_LONG", "Use no more than 100 characters."],
    ["whatsappNumber", "REQUIRED", "Enter a WhatsApp number."],
    ["whatsappNumber", "INVALID", "Enter a valid WhatsApp number."],
    ["email", "INVALID", "Enter a valid email address."],
    ["roleIds", "REQUIRED", "Choose at least one role."],
  ] as const)("AC-TEAM-005 maps %s %s", (field, key, text) => {
    expect(teamMemberErrorText(en, field, key)).toBe(text);
  });

  it("AC-TEAM-006 names the holder and marks an archived one", () => {
    expect(
      teamMemberErrorText(en, "whatsappNumber", "TAKEN", { name: "Dimas", isArchived: false }),
    ).toBe("This number is used by Dimas.");
    expect(
      teamMemberErrorText(id, "whatsappNumber", "TAKEN", {
        name: "Budi Hartono",
        isArchived: true,
      }),
    ).toBe("Nomor ini dipakai Budi Hartono (diarsipkan).");
  });
});
