import type { AccessCardView } from "@/features/gallery/application/use-cases/get-access-card/get-access-card.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

/** *Ganti link*'s answer, mirrored from booking's rotation result (features never import each other). */
export type RotateLinkResult =
  | { readonly ok: true; readonly token: string }
  | { readonly ok: false; readonly code: "PROJECT_CANCELLED" };

export interface ProjectAccessActions {
  readonly rotateLinkAction: (workspaceId: string, projectId: string) => Promise<RotateLinkResult>;
  readonly proposeAction: GalleryPageActions["proposeAction"];
  readonly rotatePasswordAction: GalleryPageActions["rotatePasswordAction"];
}

export interface ProjectAccessCardProps {
  readonly workspaceId: string;
  readonly card: AccessCardView;
  readonly actions: ProjectAccessActions;
}

export interface AccessRowProps {
  readonly label: string;
  readonly value: string;
  /** The text *Salin* copies, and its accessible name. */
  readonly copy?: { readonly text: string; readonly label: string };
  readonly isMuted?: boolean;
}

export interface RotateLinkDialogProps {
  readonly isOpen: boolean;
  readonly isPending: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export interface AccessButtonsProps {
  readonly onRotateLink: () => void;
  readonly onRotatePassword: () => void;
}
