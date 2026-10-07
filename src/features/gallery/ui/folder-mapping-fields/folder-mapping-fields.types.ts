import type { MappableItem } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";

import type { FolderMappingState } from "../use-folder-mapping/use-folder-mapping.types";

export interface FolderMappingFieldsProps {
  readonly mapping: FolderMappingState;
  /** The project page, where *Isi paket* is edited. */
  readonly packageHref: string;
}

export interface ItemRowProps {
  readonly item: MappableItem;
  readonly mapping: FolderMappingState;
}
