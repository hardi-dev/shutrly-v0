import "server-only";

import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type {
  ProjectStatus,
  ProjectTab,
} from "@/features/booking/domain/project-status/project-status.types";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface ProjectListRow {
  readonly id: string;
  readonly title: string;
  readonly status: ProjectStatus;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientWhatsappNumber: string | null;
  readonly serviceName: string;
  readonly shownSession: SessionRecordShape | null;
  readonly sessionCount: number;
  /** True when any session has an assignment; *Hapus draf* then warns (D-14). */
  readonly hasTeam: boolean;
}

export interface ProjectListReadQuery {
  readonly tab: ProjectTab;
  readonly search: string | null;
  readonly filter: ProjectFilter | null;
  readonly afterId: string | null;
  readonly limit: number;
  /** YYYY-MM-DD in the schedule zone; decides the shown session. */
  readonly today: string;
}

/** Read-side port for the project list (D-8). */
export interface ProjectListReaderPort {
  readonly listPage: (
    context: WorkspaceContext,
    query: ProjectListReadQuery,
  ) => Promise<readonly ProjectListRow[]>;
  /** The tab total; it ignores search and filters. */
  readonly count: (context: WorkspaceContext, tab: ProjectTab) => Promise<number>;
}
