import type { ProjectValidationFailure } from "../project-results/project-results.types";

/**
 * PROJECT_STATUS: the project doesn't take add-ons (A-11). ADD_ON_STATUS: the action doesn't fit
 * the add-on's status, e.g. deleting an approved one (BR-ADD-003, AC-ADD-004).
 */
export type AddOnDomainCode = "PROJECT_STATUS" | "ADD_ON_STATUS";

export type AddOnFailure =
  ProjectValidationFailure | { readonly ok: false; readonly code: AddOnDomainCode };

export type CreateAddOnResult = { readonly ok: true; readonly addOnId: string } | AddOnFailure;

/** The group-limit change an approval or cancellation asks of the gallery (BR-SEL-002). */
export interface LimitEffect {
  readonly groupId: string;
  readonly delta: number;
}

/** A status change; `effect` is null when nothing changes on a group (no target, a draft, a repeat). */
export type AddOnStatusResult =
  | { readonly ok: true; readonly effect: LimitEffect | null }
  | { readonly ok: false; readonly code: "ADD_ON_STATUS" };

/** The target group refused the change (D-16, AC-ADD-002, AC-ADD-005). */
export type AddOnTargetFailure =
  | { readonly ok: false; readonly code: "TARGET_LOCKED" | "TARGET_OTHER_PROJECT" }
  | {
      readonly ok: false;
      readonly code: "CANCEL_BELOW_USAGE";
      readonly usage: number;
      readonly limit: number;
    };

/** What an Owner add-on action returns: undefined on success. */
export type AddOnWriteResult = undefined | AddOnFailure | AddOnTargetFailure;
