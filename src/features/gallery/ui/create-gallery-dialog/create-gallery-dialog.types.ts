import type { UseCreateGalleryFormInput } from "../use-create-gallery-form/use-create-gallery-form.types";

export interface CreateGalleryDialogProps extends UseCreateGalleryFormInput {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
}

export interface CreateGalleryFormProps extends UseCreateGalleryFormInput {
  readonly formId: string;
  readonly onPendingChange: (isPending: boolean) => void;
}
