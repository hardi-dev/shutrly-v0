import "server-only";

import { sql } from "drizzle-orm";

import type {
  ProjectListReaderPort,
  ProjectListRow,
} from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import {
  PROJECT_STATUSES,
  tabStatuses,
} from "@/features/booking/domain/project-status/project-status";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";

import type { DbExecutor } from "../client/client.types";
import { buildProjectListSql } from "./project-list-sql";

const TIME_LENGTH = 5;

type RawRow = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function nullableText(value: unknown): string | null {
  return value === null || value === undefined ? null : text(value);
}

function timeText(value: unknown): string | null {
  return nullableText(value)?.slice(0, TIME_LENGTH) ?? null;
}

function dateText(value: unknown): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : text(value).slice(0, 10);
}

function timestampText(value: unknown): string {
  const date = new Date(text(value));
  return Number.isNaN(date.getTime()) ? text(value) : date.toISOString();
}

function toSession(row: RawRow): SessionRecordShape | null {
  if (row.s_id === null || row.s_id === undefined) return null;
  return {
    id: text(row.s_id),
    name: text(row.s_name),
    date: dateText(row.s_date),
    startTime: timeText(row.s_start),
    endTime: timeText(row.s_end),
    location: nullableText(row.s_location),
    createdAt: timestampText(row.s_created),
  };
}

function toRow(row: RawRow): ProjectListRow | null {
  const status = PROJECT_STATUSES.find((candidate) => candidate === row.status);
  if (status === undefined) return null;
  return {
    id: text(row.id),
    title: text(row.title),
    status,
    clientId: text(row.client_id),
    clientName: text(row.client_name),
    clientWhatsappNumber: nullableText(row.client_whatsapp),
    serviceName: text(row.service_name),
    shownSession: toSession(row),
    sessionCount: Number(row.session_count),
  };
}

/** Builds the Drizzle project list reader on a request database (D-8). @param db - request database @returns the list reader port */
export function createDrizzleProjectListReader(db: DbExecutor): ProjectListReaderPort {
  return {
    async listPage(context, query) {
      const result = await db.execute(buildProjectListSql(context, query));
      return result.rows.flatMap((row) => toRow(row) ?? []);
    },
    async count(context, tab) {
      const statuses = sql.join(
        tabStatuses(tab).map((status) => sql`${status}`),
        sql`, `,
      );
      const result = await db.execute(
        sql`select count(*)::int as total from project where workspace_id = ${context.workspaceId} and status in (${statuses})`,
      );
      return Number(result.rows[0]?.total ?? 0);
    },
  };
}
