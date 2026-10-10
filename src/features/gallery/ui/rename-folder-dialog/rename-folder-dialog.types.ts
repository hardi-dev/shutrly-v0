import type { FolderMappingState } from "../use-folder-mapping/use-folder-mapping.types";
import type { useRenameFolderForm } from "../use-rename-folder-form/use-rename-folder-form";
import type { UseRenameFolderFormInput } from "../use-rename-folder-form/use-rename-folder-form.types";

export type RenameFolderDialogProps = UseRenameFolderFormInput;

export interface EditFolderFormProps extends RenameFolderDialogProps {
  readonly state: ReturnType<typeof useRenameFolderForm>;
  readonly mapping: FolderMappingState;
}
