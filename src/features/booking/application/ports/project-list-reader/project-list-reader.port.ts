import "server-only";

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
}

export interface ProjectListReadQuery {
  readonly tab: ProjectTab;
  readonly search: string | null;
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
