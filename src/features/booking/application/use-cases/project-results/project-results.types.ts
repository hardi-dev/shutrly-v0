import type { z } from "zod";

import type { projectFieldErrorKeySchema } from "./project-results.schema";

export type ProjectFieldErrorKey = z.output<typeof projectFieldErrorKeySchema>;
export type ProjectDomainCode =
  | "DEAL_LOCKED"
  | "STALE"
  | "SESSION_REQUIRED"
  | "LAST_SESSION"
  | "PROJECT_CANCELLED"
  // F-10 D-10c: the item's selection group was already sent or locked.
  | "SELECTION_CLOSED";
export interface ProjectValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<Record<string, ProjectFieldErrorKey>>;
}
/** F-10 D-10c, AC-SEL-013: the client already picked more than the edit would leave. */
export interface SelectionInUseFailure {
  readonly ok: false;
  readonly code: "SELECTION_IN_USE";
  readonly usage: number;
  readonly unit: string | null;
}
export type ProjectFailure =
  | ProjectValidationFailure
  | SelectionInUseFailure
  | { readonly ok: false; readonly code: ProjectDomainCode };
export type CreateProjectResult =
  { readonly ok: true; readonly projectId: string } | ProjectFailure;
export type ProjectWriteResult = undefined | ProjectFailure;
