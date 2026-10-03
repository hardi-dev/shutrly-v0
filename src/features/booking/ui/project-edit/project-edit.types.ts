import type { ProjectFieldErrorKey } from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";

export type EditResult = Promise<ProjectWriteResult>;

export interface ProjectEditActions {
  readonly addItemAction: (ws: string, id: string, values: unknown) => EditResult;
  readonly updateItemAction: (
    ws: string,
    id: string,
    itemId: string,
    values: unknown,
  ) => EditResult;
  readonly removeItemAction: (ws: string, id: string, itemId: string) => EditResult;
  readonly updateFieldsAction: (ws: string, id: string, values: unknown) => EditResult;
  readonly addSessionAction: (ws: string, id: string, values: unknown) => EditResult;
  readonly updateSessionAction: (
    ws: string,
    id: string,
    sessionId: string,
    values: unknown,
  ) => EditResult;
  readonly deleteSessionAction: (ws: string, id: string, sessionId: string) => EditResult;
}

export interface DefinitionOption {
  readonly id: string;
  readonly name: string;
  readonly unit: string | null;
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
}

/** What a dialog's submit returns: field errors to show, or null to close. */
export type SubmitErrors = Readonly<Record<string, ProjectFieldErrorKey>> | null;
