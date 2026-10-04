import type { useLinkSourceForm } from "../use-link-source-form/use-link-source-form";
import type { UseLinkSourceFormInput } from "../use-link-source-form/use-link-source-form.types";

export interface LinkSourceDialogProps extends UseLinkSourceFormInput {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
}

export interface LinkSourceFieldsProps {
  readonly formId: string;
  readonly state: ReturnType<typeof useLinkSourceForm>;
  readonly options: UseLinkSourceFormInput["linkableSources"];
}

export interface FolderInUseDialogProps {
  readonly isOpen: boolean;
  readonly state: ReturnType<typeof useLinkSourceForm>;
}
