import { describe, expect, it } from "vitest";

import {
  addFromTeam,
  afterSave,
  dismiss,
  openAssign,
  openTeam,
  SESSION_TEAM_CLOSED,
  syncTeam,
} from "./session-team-flow";

describe("sessionTeamFlow", () => {
  it("AC-TEAM-011 user-plus opens the form and saving closes everything", () => {
    const state = openAssign("resepsi");
    expect(state).toEqual({ view: "assign", sessionId: "resepsi", returnTo: "closed" });
    expect(afterSave(state)).toEqual(SESSION_TEAM_CLOSED);
  });

  it("AC-TEAM-014 team → Tambah anggota → save returns to the team view", () => {
    const team = openTeam("resepsi");
    const form = addFromTeam(team);
    expect(form).toEqual({ view: "assign", sessionId: "resepsi", returnTo: "team" });
    expect(afterSave(form)).toEqual({ view: "team", sessionId: "resepsi", returnTo: "closed" });
  });

  it("AC-TEAM-014 cancelling the form goes back to the team view, cancelling the team closes it", () => {
    const form = addFromTeam(openTeam("resepsi"));
    expect(dismiss(form).view).toBe("team");
    expect(dismiss(openTeam("resepsi"))).toEqual(SESSION_TEAM_CLOSED);
    expect(dismiss(openAssign("resepsi"))).toEqual(SESSION_TEAM_CLOSED);
  });

  it("AC-TEAM-014 the team view closes when the last assignment is removed", () => {
    expect(syncTeam(openTeam("resepsi"), 0)).toEqual(SESSION_TEAM_CLOSED);
    expect(syncTeam(openTeam("resepsi"), 2).view).toBe("team");
    expect(syncTeam(openAssign("resepsi"), 0).view).toBe("assign");
  });

  it("D-15 Tambah anggota only applies to the team view", () => {
    expect(addFromTeam(SESSION_TEAM_CLOSED)).toEqual(SESSION_TEAM_CLOSED);
    expect(addFromTeam(openAssign("resepsi")).returnTo).toBe("closed");
  });
});
