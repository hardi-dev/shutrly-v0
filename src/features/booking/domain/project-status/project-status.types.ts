export type ProjectStatus =
  "DRAFT" | "BOOKED" | "SHOOTING" | "POST_PROCESSING" | "DELIVERED" | "COMPLETED" | "CANCELLED";
export type ProjectTab = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type ProjectStep = "CONFIRM_BOOKING" | "START_SHOOTING" | "FINISH_SHOOTING";
export interface StepTransition {
  readonly from: ProjectStatus;
  readonly to: ProjectStatus;
}
