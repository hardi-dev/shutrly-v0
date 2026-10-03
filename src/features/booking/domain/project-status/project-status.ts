import type {
  ProjectStatus,
  ProjectStep,
  ProjectTab,
  StepTransition,
} from "./project-status.types";

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "DRAFT",
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];
const TRANSITIONS: Readonly<Record<ProjectStep, StepTransition>> = {
  CONFIRM_BOOKING: { from: "DRAFT", to: "BOOKED" },
  START_SHOOTING: { from: "BOOKED", to: "SHOOTING" },
  FINISH_SHOOTING: { from: "SHOOTING", to: "POST_PROCESSING" },
};
const NEXT_STEP: Readonly<Record<ProjectStatus, ProjectStep | null>> = {
  DRAFT: "CONFIRM_BOOKING",
  BOOKED: "START_SHOOTING",
  SHOOTING: "FINISH_SHOOTING",
  POST_PROCESSING: null,
  DELIVERED: null,
  COMPLETED: null,
  CANCELLED: null,
};
const TABS: Readonly<Record<ProjectTab, readonly ProjectStatus[]>> = {
  ACTIVE: ["DRAFT", "BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};
const NEEDS_SESSION: readonly ProjectStatus[] = [
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
  "COMPLETED",
];

/** Returns the one manual forward move a step performs (BR-PRJ-004, D-3). @param step - the requested step @returns its from and to status */
export function stepTransition(step: ProjectStep): StepTransition {
  return TRANSITIONS[step];
}
/** Finds the manual step offered for a status, or null when F-07 offers none (BR-PRJ-004). @param status - stored status @returns the step or null */
export function nextStep(status: ProjectStatus): ProjectStep | null {
  return NEXT_STEP[status];
}
/** Lists the statuses shown under a list tab (A-4). @param tab - the tab @returns its statuses */
export function tabStatuses(tab: ProjectTab): readonly ProjectStatus[] {
  return TABS[tab];
}
/** Tells whether the deal (price, items, booking values) may change (BR-PRJ-009). @param status - stored status @returns true while DRAFT or BOOKED */
export function isDealEditable(status: ProjectStatus): boolean {
  return status === "DRAFT" || status === "BOOKED";
}
/** Tells whether title, notes and sessions may change (A-6, BR-TEAM-003). @param status - stored status @returns false only when CANCELLED */
export function isScheduleEditable(status: ProjectStatus): boolean {
  return status !== "CANCELLED";
}
/** Tells whether F-07 offers cancelling (BR-PRJ-010, A-10). @param status - stored status @returns true for BOOKED and SHOOTING */
export function canCancel(status: ProjectStatus): boolean {
  return status === "BOOKED" || status === "SHOOTING";
}
/** Tells whether a cancel needs a reason (BR-PRJ-004). @param status - stored status @returns true from SHOOTING */
export function cancelReasonRequired(status: ProjectStatus): boolean {
  return status === "SHOOTING";
}
/** Tells whether the project may be deleted (BR-PRJ-010). @param status - stored status @returns true only for DRAFT */
export function canDeleteDraft(status: ProjectStatus): boolean {
  return status === "DRAFT";
}
/** Tells whether the status needs at least one session (BR-TEAM-003). @param status - stored status @returns true from BOOKED on */
export function needsSession(status: ProjectStatus): boolean {
  return NEEDS_SESSION.includes(status);
}
