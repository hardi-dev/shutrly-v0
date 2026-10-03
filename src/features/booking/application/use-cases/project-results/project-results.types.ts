import type { z } from "zod";

import type { projectFieldErrorKeySchema } from "./project-results.schema";

export type ProjectFieldErrorKey = z.output<typeof projectFieldErrorKeySchema>;
export type ProjectDomainCode =
  "DEAL_LOCKED" | "STALE" | "SESSION_REQUIRED" | "LAST_SESSION" | "PROJECT_CANCELLED";
export interface ProjectValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<Record<string, ProjectFieldErrorKey>>;
}
export type ProjectFailure =
  ProjectValidationFailure | { readonly ok: false; readonly code: ProjectDomainCode };
export type CreateProjectResult =
  { readonly ok: true; readonly projectId: string } | ProjectFailure;
export type ProjectWriteResult = undefined | ProjectFailure;
