import { describe, expect, it } from "vitest";

import { memberRolesLabel } from "./team-member-roles";

describe("memberRolesLabel", () => {
  it("AC-TEAM-001 joins the role names with a comma", () => {
    expect(
      memberRolesLabel([
        { id: "1", name: "Fotografer" },
        { id: "2", name: "Videografer" },
      ]),
    ).toBe("Fotografer, Videografer");
  });

  it("AC-TEAM-001 shows a single role as is", () => {
    expect(memberRolesLabel([{ id: "1", name: "Asisten" }])).toBe("Asisten");
  });
});
