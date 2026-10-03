import { tabStatuses } from "../project-status/project-status";
import type { ProjectStatus, ProjectTab } from "../project-status/project-status.types";
import { isRealIsoDate } from "../session/calendar-date";
import type { ProjectFilter, ProjectListParams } from "./project-list-filter.types";
import { projectSearchSchema } from "./project-list-query.schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIVE_STATUSES = tabStatuses("ACTIVE");

export const EMPTY_PROJECT_FILTER: ProjectFilter = {
  statuses: [],
  from: null,
  to: null,
  includeNoSchedule: false,
  serviceIds: [],
  clientId: null,
};

type ParamValue = string | string[] | undefined;

function first(value: ParamValue): string | undefined {
  return Array.isArray(value) ? value.at(0) : value;
}

function csv(value: ParamValue): string[] {
  return (first(value) ?? "").split(",").filter((part) => part !== "");
}

function isoDate(value: ParamValue): string | null {
  const text = first(value);
  return text !== undefined && isRealIsoDate(text) ? text : null;
}

function statusFrom(text: string): ProjectStatus[] {
  const found = ACTIVE_STATUSES.find((status) => status === text);
  return found === undefined ? [] : [found];
}

/** Reads the list's URL params (A-11): unknown parts are dropped silently, `status` counts only on Aktif, and `to < from` drops both dates. @param params - the page search params @param tab - the selected tab @returns the search text (or null) and the parsed filter */
export function parseProjectListParams(
  params: ProjectListParams,
  tab: ProjectTab,
): { q: string | null; filter: ProjectFilter } {
  let from = isoDate(params.from);
  let to = isoDate(params.to);
  if (from !== null && to !== null && to < from) {
    from = null;
    to = null;
  }
  const clientText = first(params.client);
  return {
    q: projectSearchSchema.safeParse(first(params.q)).data ?? null,
    filter: {
      statuses: tab === "ACTIVE" ? [...new Set(csv(params.status).flatMap(statusFrom))] : [],
      from,
      to,
      includeNoSchedule: first(params.noSchedule) === "1" && (from !== null || to !== null),
      serviceIds: [...new Set(csv(params.service).filter((id) => UUID.test(id)))],
      clientId: clientText !== undefined && UUID.test(clientText) ? clientText : null,
    },
  };
}

/** Writes a filter back to URL params in the grammar's order; empty parts are left out. @param filter - the filter @returns the params as pairs */
export function filterToParams(filter: ProjectFilter): [string, string][] {
  const pairs: [string, string][] = [];
  if (filter.statuses.length > 0) pairs.push(["status", filter.statuses.join(",")]);
  if (filter.from !== null) pairs.push(["from", filter.from]);
  if (filter.to !== null) pairs.push(["to", filter.to]);
  if (filter.includeNoSchedule && (filter.from !== null || filter.to !== null)) {
    pairs.push(["noSchedule", "1"]);
  }
  if (filter.serviceIds.length > 0) pairs.push(["service", filter.serviceIds.join(",")]);
  if (filter.clientId !== null) pairs.push(["client", filter.clientId]);
  return pairs;
}

/** Counts the active filter groups shown on the red badge: Status, Jadwal, Layanan, Klien (A-11). @param filter - parsed filter @param tab - the selected tab @returns 0–4 */
export function activeFilterGroupCount(filter: ProjectFilter, tab: ProjectTab): number {
  const status = tab === "ACTIVE" && filter.statuses.length > 0;
  const schedule = filter.from !== null || filter.to !== null;
  return [status, schedule, filter.serviceIds.length > 0, filter.clientId !== null].filter(Boolean)
    .length;
}
