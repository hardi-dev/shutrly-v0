import { describe, expect, it } from "vitest";

import { picksAsAssignments } from "./team-assignments";

const MEMBERS = [
  { id: "m1", name: "Dimas Pratama", roles: [{ id: "r1", name: "Fotografer" }] },
  { id: "m2", name: "Sari Lestari", roles: [{ id: "r2", name: "Asisten" }] },
];

describe("picksAsAssignments", () => {
  it("AC-TEAM-028 turns picks into records with the member and role names, in order", () => {
    expect(
      picksAsAssignments(
        "0",
        [
          { memberId: "m2", roleId: "r2" },
          { memberId: "m1", roleId: "r1" },
        ],
        MEMBERS,
      ).map((a) => [a.memberName, a.roleName, a.sessionId]),
    ).toEqual([
      ["Sari Lestari", "Asisten", "0"],
      ["Dimas Pratama", "Fotografer", "0"],
    ]);
  });

  it("AC-TEAM-028 leaves out a pick whose member or role no longer exists", () => {
    expect(
      picksAsAssignments(
        "0",
        [
          { memberId: "gone", roleId: "r1" },
          { memberId: "m1", roleId: "r2" },
        ],
        MEMBERS,
      ),
    ).toEqual([]);
  });
});
