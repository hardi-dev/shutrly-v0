import type { ControllerRenderProps } from "react-hook-form";

import type { CreateGalleryInput } from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";

import type { UseCreateGalleryFormInput } from "../use-create-gallery-form/use-create-gallery-form.types";

export interface CreateGalleryDialogProps extends UseCreateGalleryFormInput {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
}

export interface CreateGalleryFormProps extends UseCreateGalleryFormInput {
  readonly formId: string;
  readonly onPendingChange: (isPending: boolean) => void;
}

export interface PasswordRowProps {
  readonly field: ControllerRenderProps<CreateGalleryInput, "password">;
  readonly error: string | undefined;
  readonly isRegenerating: boolean;
  readonly onRegenerate: () => void;
}
