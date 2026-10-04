import { describe, expect, it } from "vitest";

import { PROJECT_STATUSES } from "../project-status/project-status";
import {
  assignableFor,
  assignmentsBySession,
  avatarGroup,
  firstName,
  hasDuplicateMember,
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

describe("assignmentsBySession", () => {
  it("AC-TEAM-026 groups by session and keeps the order within each", () => {
    const grouped = assignmentsBySession([
      { id: "1", sessionId: "wisuda" },
      { id: "2", sessionId: "akad" },
      { id: "3", sessionId: "wisuda" },
    ]);
    expect(grouped.get("wisuda")?.map((a) => a.id)).toEqual(["1", "3"]);
    expect(grouped.get("akad")?.map((a) => a.id)).toEqual(["2"]);
    expect(grouped.get("none")).toBeUndefined();
  });
});

describe("firstName", () => {
  it("AC-TEAM-014 is the first whitespace-separated word, as the remove confirm draws it", () => {
    expect(firstName("Sari Lestari")).toBe("Sari");
    expect(firstName("  Dimas   Adi Pratama ")).toBe("Dimas");
    expect(firstName("Joko")).toBe("Joko");
  });
});

describe("hasDuplicateMember", () => {
  it("AC-TEAM-028 finds a member picked twice, whatever the role", () => {
    expect(hasDuplicateMember([{ memberId: "a" }, { memberId: "b" }])).toBe(false);
    expect(hasDuplicateMember([{ memberId: "a" }, { memberId: "a" }])).toBe(true);
    expect(hasDuplicateMember([])).toBe(false);
  });
});
