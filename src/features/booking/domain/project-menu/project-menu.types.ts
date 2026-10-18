import type { ManualStep, ProjectStatus } from "../project-status/project-status.types";

export type ProjectMenuItem =
  | { readonly kind: "STEP"; readonly step: ManualStep }
  /** Tandai terkirim beside the header step on BOOKED and SHOOTING (A-6, BR-DEL-003); disabled until a finished file is synced (AC-GFL-017). */
  | { readonly kind: "MARK_DELIVERED"; readonly hasFinishedFiles: boolean }
  | { readonly kind: "EDIT_INFO" }
  | { readonly kind: "CHAT_WHATSAPP" }
  | { readonly kind: "ADD_WHATSAPP_NUMBER" }
  | { readonly kind: "SHARE_GALLERY" }
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
  /** Whether BR-GAL-010 lets the Owner share the gallery; list and dashboard rows always pass false (A-11). */
  readonly canShareGallery: boolean;
  /** Whether a visible finished file (EDITED or PRINT) is synced; list rows pass false (AC-GFL-017). */
  readonly hasFinishedFiles: boolean;
}
