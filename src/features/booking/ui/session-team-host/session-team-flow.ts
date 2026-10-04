import type { SessionTeamState } from "./session-team-host.types";

/** Nothing is open. */
export const SESSION_TEAM_CLOSED: SessionTeamState = {
  view: "closed",
  sessionId: null,
  returnTo: "closed",
};

/**
 * `user-plus` or ⋯ › *Tambah tim*: opens the Penugasan form; saving closes it (D-15).
 * @param sessionId - the session being staffed
 * @returns the next state
 */
export function openAssign(sessionId: string): SessionTeamState {
  return { view: "assign", sessionId, returnTo: "closed" };
}

/**
 * Avatar group or ⋯ › *Atur tim*: opens the team view.
 * @param sessionId - the session whose team is shown
 * @returns the next state
 */
export function openTeam(sessionId: string): SessionTeamState {
  return { view: "team", sessionId, returnTo: "closed" };
}

/**
 * *Tambah anggota* inside *Atur tim*: opens the form, and saving returns to the team view.
 * @param state - the current state, which must be the team view
 * @returns the next state
 */
export function addFromTeam(state: SessionTeamState): SessionTeamState {
  if (state.view !== "team" || state.sessionId === null) return state;
  return { view: "assign", sessionId: state.sessionId, returnTo: "team" };
}

/**
 * A saved assignment goes back to where the form was opened from.
 * @param state - the current state
 * @returns the team view when the form came from it, otherwise closed
 */
export function afterSave(state: SessionTeamState): SessionTeamState {
  if (state.returnTo === "team" && state.sessionId !== null) {
    return { view: "team", sessionId: state.sessionId, returnTo: "closed" };
  }
  return SESSION_TEAM_CLOSED;
}

/**
 * Cancelling the form goes back to the team view when it came from there; the team view closes.
 * @param state - the current state
 * @returns the next state
 */
export function dismiss(state: SessionTeamState): SessionTeamState {
  return state.view === "assign" ? afterSave(state) : SESSION_TEAM_CLOSED;
}

/**
 * The team view closes when the refreshed session has no assignments left (AC-TEAM-014).
 * @param state - the current state
 * @param assignmentCount - how many assignments the session has now
 * @returns closed when the team view has nothing to show, otherwise the same state
 */
export function syncTeam(state: SessionTeamState, assignmentCount: number): SessionTeamState {
  return state.view === "team" && assignmentCount === 0 ? SESSION_TEAM_CLOSED : state;
}
