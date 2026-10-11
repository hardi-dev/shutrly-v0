import { describe, expect, it } from "vitest";

import { memberRolesLabel } from "./team-member-roles";

describe("memberRolesLabel", () => {
  it("AC-TEAM-001 joins the role names with a comma", () => {
    expect(
      memberRolesLabel(
        [
          { id: "1", name: "Fotografer", defaultKey: null },
          { id: "2", name: "Videografer", defaultKey: null },
        ],
        "en",
      ),
    ).toBe("Fotografer, Videografer");
  });

  it("AC-TEAM-001 shows a single role as is", () => {
    expect(memberRolesLabel([{ id: "1", name: "Asisten", defaultKey: null }], "en")).toBe(
      "Asisten",
    );
  });
});
