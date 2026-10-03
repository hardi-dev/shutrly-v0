import { describe, expect, it } from "vitest";

import { EMPTY_PROJECT_FILTER } from "@/features/booking/domain/project-list-query/project-list-filter";

import type {
  ProjectListReaderPort,
  ProjectListRow,
} from "../../ports/project-list-reader/project-list-reader.port";
import { listProjects } from "./list-projects";

const context = { workspaceId: "ws" } as never;

function row(index: number): ProjectListRow {
  return {
    id: `p${String(index)}`,
    title: `Proyek ${String(index)}`,
    status: "BOOKED",
    clientId: "c1",
    clientName: "Rina",
    clientWhatsappNumber: null,
    serviceName: "Wisuda",
    shownSession: null,
    sessionCount: 0,
  };
}

function reader(total: number) {
  const calls: unknown[] = [];
  const port: ProjectListReaderPort = {
    listPage: (_context, query) => {
      calls.push(query);
      return Promise.resolve(
        Array.from({ length: Math.min(total, query.limit) }, (_, i) => row(i)),
      );
    },
    count: () => Promise.resolve(total),
  };
  return { port, calls };
}

describe("list projects", () => {
  it("AC-PRJ-005 returns 30 rows and the 30th id as cursor when a 31st exists", async () => {
    const { port, calls } = reader(31);
    const page = await listProjects(
      port,
      context,
      { tab: "ACTIVE", q: "", afterId: null, filter: EMPTY_PROJECT_FILTER },
      "2026-10-02",
    );
    expect(page.items).toHaveLength(30);
    expect(page.nextCursor).toBe("p29");
    expect(calls[0]).toMatchObject({ limit: 31, search: null, today: "2026-10-02" });
  });

  it("AC-PRJ-005 has no cursor on the last page", async () => {
    const { port } = reader(30);
    const page = await listProjects(
      port,
      context,
      { tab: "ACTIVE", q: "", afterId: null, filter: EMPTY_PROJECT_FILTER },
      "2026-10-02",
    );
    expect(page.items).toHaveLength(30);
    expect(page.nextCursor).toBeNull();
  });

  it("AC-PRJ-004 trims the search and lists unfiltered when it is blank or too long", async () => {
    const { port, calls } = reader(1);
    await listProjects(
      port,
      context,
      { tab: "ACTIVE", q: " rina ", afterId: null, filter: EMPTY_PROJECT_FILTER },
      "2026-10-02",
    );
    await listProjects(
      port,
      context,
      { tab: "ACTIVE", q: "   ", afterId: null, filter: EMPTY_PROJECT_FILTER },
      "2026-10-02",
    );
    await listProjects(
      port,
      context,
      { tab: "ACTIVE", q: "a".repeat(101), afterId: null, filter: EMPTY_PROJECT_FILTER },
      "2026-10-02",
    );
    expect(calls.map((call) => (call as { search: string | null }).search)).toEqual([
      "rina",
      null,
      null,
    ]);
  });
});
