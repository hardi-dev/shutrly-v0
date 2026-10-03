import type { ProjectStatus } from "../project-status/project-status.types";

export interface ProjectFilter {
  readonly statuses: readonly ProjectStatus[];
  readonly from: string | null;
  readonly to: string | null;
  readonly includeNoSchedule: boolean;
  readonly serviceIds: readonly string[];
  readonly clientId: string | null;
}

export type ProjectListParams = Readonly<Record<string, string | string[] | undefined>>;
