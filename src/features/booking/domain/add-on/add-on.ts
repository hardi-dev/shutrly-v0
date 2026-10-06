import { IDR_MAX } from "../idr-amount/idr-amount";
import type { ProjectStatus } from "../project-status/project-status.types";
import type { AddOnAction, AddOnStatus, AddOnTransition } from "./add-on.types";

export const ADD_ON_DESCRIPTION_MAX = 100; // A-10
// A-10 sets no upper bound; these keep the int column and numeric(18,3) total in range.
export const ADD_ON_QUANTITY_MAX = 9999;
const ADD_ON_PROJECT_STATUSES: readonly ProjectStatus[] = [
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
];
const MOVES: Readonly<Record<AddOnStatus, Partial<Record<AddOnAction, AddOnTransition>>>> = {
  DRAFT: {
    APPROVE: { kind: "MOVE", to: "APPROVED" },
    CANCEL: { kind: "MOVE", to: "CANCELLED" },
    DELETE: { kind: "DELETE" },
  },
  APPROVED: { APPROVE: { kind: "SAME" }, CANCEL: { kind: "MOVE", to: "CANCELLED" } },
  CANCELLED: { CANCEL: { kind: "SAME" } },
};

/**
 * Total of an add-on in whole rupiah, multiplied as integers so no floating point is involved
 * (BR-ADD-006, BR-CUR-003, ADR-007).
 * @param quantity - whole number ≥ 1
 * @param unitPrice - whole-rupiah digit string
 * @returns the total as a digit string
 */
export function addOnTotal(quantity: number, unitPrice: string): string {
  return (BigInt(quantity) * BigInt(unitPrice)).toString();
}

/** Whether a total stays within the largest whole-rupiah amount the app stores (IDR_MAX). @param total - digit string @returns true when it fits */
export function isAddOnTotalInRange(total: string): boolean {
  return BigInt(total) <= BigInt(IDR_MAX);
}

/**
 * What an Owner action does to an add-on in a given status (BR-ADD-003, A-35). A repeated approve
 * or cancel is a no-op, so a double click never errors (TD › Concurrency › Idempotency).
 * @param status - the add-on's stored status
 * @param action - approve, cancel or delete
 * @returns the transition, or REFUSED
 */
export function addOnTransition(status: AddOnStatus, action: AddOnAction): AddOnTransition {
  return MOVES[status][action] ?? { kind: "REFUSED" };
}

/** Whether target, quantity or price may still change: only on a draft (BR-ADD-003, AC-ADD-004). @param status - stored status @returns true for DRAFT */
export function isAddOnEditable(status: AddOnStatus): boolean {
  return status === "DRAFT";
}

/**
 * How much the target group's `extra_limit` changes when an add-on moves between statuses: up on
 * approval, down when an approved add-on is cancelled, nothing for a draft (BR-SEL-002, BR-ADD-004/005).
 * @param from - status before
 * @param to - status after
 * @param quantity - the add-on's quantity
 * @returns the signed change
 */
export function limitDelta(from: AddOnStatus, to: AddOnStatus, quantity: number): number {
  if (from === "DRAFT" && to === "APPROVED") return quantity;
  if (from === "APPROVED" && to === "CANCELLED") return -quantity;
  return 0;
}

/** Whether a project in this status takes new add-ons (A-11). @param status - the project's stored status @returns true from BOOKED to DELIVERED */
export function canCreateAddOn(status: ProjectStatus): boolean {
  return ADD_ON_PROJECT_STATUSES.includes(status);
}
