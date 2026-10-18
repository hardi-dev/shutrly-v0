export type ProjectStatus =
  "DRAFT" | "BOOKED" | "SHOOTING" | "POST_PROCESSING" | "DELIVERED" | "COMPLETED" | "CANCELLED";
export type ProjectTab = "ACTIVE" | "COMPLETED" | "CANCELLED";
/** The status steps the Owner moves a project through one at a time (BR-PRJ-004). */
export type ManualStep = "CONFIRM_BOOKING" | "START_SHOOTING" | "FINISH_SHOOTING";
/** Every step the header and the menu can offer; MARK_DELIVERED is routed to the delivery transaction, never moved by status (BR-DEL-003). */
export type ProjectStep = ManualStep | "MARK_DELIVERED";
export interface StepTransition {
  readonly from: ProjectStatus;
  readonly to: ProjectStatus;
}
