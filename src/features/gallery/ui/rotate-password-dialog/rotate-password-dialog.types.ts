import type { SyntheticEvent } from "react";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";
import type { useRotatePasswordForm } from "../use-rotate-password-form/use-rotate-password-form";

export interface RotatePasswordDialogProps {
  readonly workspaceId: string;
  readonly galleryId: string;
  readonly projectId: string;
  readonly initialPassword: string;
  readonly proposeAction: GalleryPageActions["proposeAction"];
  readonly rotatePasswordAction: GalleryPageActions["rotatePasswordAction"];
  readonly onClose: () => void;
}

export interface RotateFormProps {
  readonly state: ReturnType<typeof useRotatePasswordForm>;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly onRegenerate: () => void;
}
