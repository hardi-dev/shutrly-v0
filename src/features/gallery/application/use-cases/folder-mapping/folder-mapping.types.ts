import type {
  FolderMapEntry,
  MappableItem,
} from "../../ports/gallery-source-repository/gallery-source-repository.port";

/** The folder *Edit*'s mapping section (F-20). */
export interface FolderMappingView {
  readonly folders: readonly string[];
  /** The project's selection items; empty shows the *Isi paket* hint (Owner 2026-10-07). */
  readonly items: readonly MappableItem[];
  readonly mappings: readonly FolderMapEntry[];
}
