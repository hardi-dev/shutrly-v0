import type {
  FilterClientOption,
  FilterServiceOption,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

export type SearchFilterClientsCall = (
  workspaceId: string,
  query: unknown,
) => Promise<readonly FilterClientOption[]>;

export interface ProjectFilterDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly workspaceId: string;
  readonly tab: ProjectTab;
  readonly q: string;
  readonly filter: ProjectFilter;
  readonly services: readonly FilterServiceOption[];
  readonly initialClient: FilterClientOption | null;
  readonly searchClientsAction: SearchFilterClientsCall;
}

export interface FilterDraftApi {
  readonly draft: ProjectFilter;
  readonly toError: string | undefined;
  readonly patch: (next: Partial<ProjectFilter>) => void;
  readonly apply: () => boolean;
  readonly reset: () => void;
}
