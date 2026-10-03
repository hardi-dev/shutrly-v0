import { describe, expect, it } from "vitest";

import { PROJECT_STATUSES } from "../project-status/project-status";
import {
  assignableFor,
  avatarGroup,
  isTeamEditable,
  SESSION_AVATAR_MAX,
} from "./session-assignment";

describe("isTeamEditable", () => {
  it("BR-TEAM-006 allows a team change in every status except CANCELLED", () => {
    for (const status of PROJECT_STATUSES) {
      expect(isTeamEditable(status)).toBe(status !== "CANCELLED");
    }
  });
});

describe("avatarGroup", () => {
  it("AC-TEAM-026 shows three avatars and +1 for four members, in order", () => {
    const group = avatarGroup(["Dimas", "Sari", "Joko", "Ayu"]);
    expect(group.shown).toEqual(["Dimas", "Sari", "Joko"]);
    expect(group.overflow).toBe(1);
    expect(SESSION_AVATAR_MAX).toBe(3);
  });

  it("AC-TEAM-026 shows every avatar and no chip up to three members", () => {
    expect(avatarGroup(["Dimas", "Sari"])).toEqual({ shown: ["Dimas", "Sari"], overflow: 0 });
    expect(avatarGroup([])).toEqual({ shown: [], overflow: 0 });
  });
});

describe("assignableFor", () => {
  const members = [{ id: "dimas" }, { id: "sari" }, { id: "joko" }];

  it("AC-TEAM-013 hides the members already on the session", () => {
    const assignments = [
      { sessionId: "resepsi", memberId: "dimas" },
      { sessionId: "akad", memberId: "sari" },
    ];
    expect(assignableFor(members, "resepsi", assignments)).toEqual([
      { id: "sari" },
      { id: "joko" },
    ]);
  });

  it("AC-TEAM-013 offers everyone when the session has no team", () => {
    expect(assignableFor(members, "resepsi", [])).toEqual(members);
  });
});
