import type { ProjectStatus, ProjectStep } from "../project-status/project-status.types";

export type ProjectMenuItem =
  | { readonly kind: "STEP"; readonly step: ProjectStep }
  | { readonly kind: "EDIT_INFO" }
  | { readonly kind: "CHAT_WHATSAPP" }
  | { readonly kind: "ADD_WHATSAPP_NUMBER" }
  | { readonly kind: "CANCEL" }
  | { readonly kind: "DELETE_DRAFT" };

export interface ProjectMenuGroups {
  readonly project: readonly ProjectMenuItem[];
  readonly sendToClient: readonly ProjectMenuItem[];
  readonly destructive: readonly ProjectMenuItem[];
}

export interface ProjectMenuInput {
  readonly status: ProjectStatus;
  readonly hasWhatsappNumber: boolean;
}
