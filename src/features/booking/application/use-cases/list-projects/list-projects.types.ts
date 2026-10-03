import type { ProjectListRow } from "../../ports/project-list-reader/project-list-reader.port";

export interface ProjectPage {
  readonly items: readonly ProjectListRow[];
  readonly nextCursor: string | null;
}
