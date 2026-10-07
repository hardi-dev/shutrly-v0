import type { FolderMappingState } from "../use-folder-mapping/use-folder-mapping.types";

export interface FolderMappingFieldsProps {
  readonly mapping: FolderMappingState;
  /** The project page, where *Isi paket* is edited. */
  readonly packageHref: string;
}

export interface FolderRowProps {
  readonly path: string;
  readonly mapping: FolderMappingState;
}
