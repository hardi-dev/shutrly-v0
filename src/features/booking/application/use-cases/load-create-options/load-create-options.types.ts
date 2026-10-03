import type {
  ActiveDefinition,
  ServiceOptionGroup,
} from "../../ports/project-repository/project-repository.port";

export interface CreateOptions {
  readonly serviceGroups: readonly ServiceOptionGroup[];
  /** False when every service is archived: Proyek baru then cannot be submitted (AC-PRJ-014). */
  readonly hasActiveService: boolean;
  /** Active item definitions for Tambah item. */
  readonly definitions: readonly ActiveDefinition[];
}
