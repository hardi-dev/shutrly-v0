import type { ProjectFailure } from "../project-results/project-results.types";

export type DeleteDraftResult = { readonly ok: true; readonly title: string } | ProjectFailure;
