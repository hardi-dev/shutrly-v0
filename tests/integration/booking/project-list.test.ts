import { uniqueEmail } from "@tests/support/auth/unique";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleProjectListReader } from "@/adapters/db/project-repository/drizzle-project-list-reader";
import { user } from "@/adapters/db/schema/auth/auth";
import { service, serviceCategory } from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project, projectSession } from "@/adapters/db/schema/booking/project";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
const TODAY = "2026-10-02";

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

async function seedBase() {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "List Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `List ${crypto.randomUUID()}`, invoicePrefix: "LST" })
    .returning({ id: workspace.id });
  const workspaceId = ws.id;
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId, name: "Wisuda", updatedBy: ownerId })
    .returning({ id: serviceCategory.id });
  const [svc] = await db
    .insert(service)
    .values({ workspaceId, categoryId: category.id, name: "Wisuda Basic", basePrice: "750000" })
    .returning({ id: service.id });
  const [rina, sari] = await db
    .insert(client)
    .values([
      { workspaceId, name: "Rina" },
      { workspaceId, name: "Sari" },
    ])
    .returning({ id: client.id });
  return {
    context: { workspaceId: asWorkspaceId(workspaceId) },
    workspaceId,
    ownerId,
    serviceId: svc.id,
    rina: rina.id,
    sari: sari.id,
  };
}

type Base = Awaited<ReturnType<typeof seedBase>>;

async function addProject(
  base: Base,
  title: string,
  status: ProjectStatus,
  sessions: readonly { date: string; start?: string }[],
  clientId = base.rina,
  createdAt = new Date(),
) {
  const [row] = await db
    .insert(project)
    .values({
      workspaceId: base.workspaceId,
      clientId,
      serviceId: base.serviceId,
      title,
      agreedPrice: "750000",
      status,
      clientAccessToken: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
        "base64url",
      ),
      createdAt,
      ...(status === "CANCELLED" ? { cancelledAt: new Date(), cancelledBy: base.ownerId } : {}),
    })
    .returning({ id: project.id });
  if (sessions.length > 0) {
    await db.insert(projectSession).values(
      sessions.map((session, index) => ({
        workspaceId: base.workspaceId,
        projectId: row.id,
        name: `Sesi ${String(index + 1)}`,
        sessionDate: session.date,
        startTime: session.start ?? null,
      })),
    );
  }
  return row.id;
}

async function seedFive(base: Base) {
  await addProject(base, "Wisuda Rina", "BOOKED", [{ date: "2026-11-10", start: "07:30" }]);
  await addProject(base, "Prewed Dewi", "SHOOTING", [
    { date: "2026-10-20" },
    { date: "2026-10-01" },
  ]);
  await addProject(base, "Wisuda Sari", "BOOKED", [], base.sari);
  await addProject(base, "Selesai Rina", "COMPLETED", [{ date: "2026-09-01" }]);
  await addProject(base, "Batal Rina", "CANCELLED", [{ date: "2026-09-15" }]);
}

const query = (overrides: object = {}) => ({
  tab: "ACTIVE" as const,
  search: null,
  filter: null,
  afterId: null,
  limit: 31,
  today: TODAY,
  ...overrides,
});

describe("Drizzle project list reader", () => {
  it("AC-PRJ-001 AC-PRJ-002 lists the Aktif tab by next session with undated last", async () => {
    const base = await seedBase();
    await seedFive(base);
    const reader = createDrizzleProjectListReader(db);
    const rows = await reader.listPage(base.context, query());
    expect(rows.map((row) => row.title)).toEqual(["Prewed Dewi", "Wisuda Rina", "Wisuda Sari"]);
    expect(rows[0]).toMatchObject({
      sessionCount: 2,
      clientName: "Rina",
      serviceName: "Wisuda Basic",
    });
    expect(rows[0].shownSession).toMatchObject({ date: "2026-10-20", startTime: null });
    expect(rows[1].shownSession).toMatchObject({ date: "2026-11-10", startTime: "07:30" });
    expect(rows[2].shownSession).toBeNull();
  });

  it("AC-PRJ-002 shows the last session for past projects and orders the other tabs newest first", async () => {
    const base = await seedBase();
    await seedFive(base);
    await addProject(base, "Selesai Lama", "COMPLETED", [{ date: "2026-08-01" }]);
    await addProject(base, "Selesai Tanpa Sesi", "COMPLETED", []);
    const reader = createDrizzleProjectListReader(db);
    const completed = await reader.listPage(base.context, query({ tab: "COMPLETED" }));
    expect(completed.map((row) => row.title)).toEqual([
      "Selesai Rina",
      "Selesai Lama",
      "Selesai Tanpa Sesi",
    ]);
    const cancelled = await reader.listPage(base.context, query({ tab: "CANCELLED" }));
    expect(cancelled.map((row) => row.title)).toEqual(["Batal Rina"]);
  });

  it("AC-PRJ-003 counts each tab and ignores the search", async () => {
    const base = await seedBase();
    await seedFive(base);
    const reader = createDrizzleProjectListReader(db);
    expect(await reader.count(base.context, "ACTIVE")).toBe(3);
    expect(await reader.count(base.context, "COMPLETED")).toBe(1);
    expect(await reader.count(base.context, "CANCELLED")).toBe(1);
  });

  it("AC-PRJ-004 searches title or client name and treats % as text", async () => {
    const base = await seedBase();
    await seedFive(base);
    const reader = createDrizzleProjectListReader(db);
    const byClient = await reader.listPage(base.context, query({ search: "sari" }));
    expect(byClient.map((row) => row.title)).toEqual(["Wisuda Sari"]);
    const byTitle = await reader.listPage(base.context, query({ search: "prewed" }));
    expect(byTitle.map((row) => row.title)).toEqual(["Prewed Dewi"]);
    expect(await reader.listPage(base.context, query({ search: "%" }))).toEqual([]);
    expect(
      await reader.listPage(base.context, query({ tab: "COMPLETED", search: "Wisuda" })),
    ).toEqual([]);
  });

  it("AC-PRJ-005 pages 65 projects as 30, 30 and 5 without duplicates", async () => {
    const base = await seedBase();
    for (let index = 0; index < 65; index += 1) {
      await addProject(
        base,
        `Proyek ${String(index).padStart(2, "0")}`,
        "BOOKED",
        index % 7 === 0 ? [] : [{ date: `2026-11-${String((index % 27) + 1).padStart(2, "0")}` }],
        base.rina,
        new Date(Date.UTC(2026, 9, 1, 0, 0, index)),
      );
    }
    const reader = createDrizzleProjectListReader(db);
    const seen: string[] = [];
    const sizes: number[] = [];
    let afterId: string | null = null;
    for (let page = 0; page < 3; page += 1) {
      const rows = await reader.listPage(base.context, query({ afterId, limit: 30 }));
      sizes.push(rows.length);
      seen.push(...rows.map((row) => row.id));
      afterId = rows.at(-1)?.id ?? null;
    }
    expect(sizes).toEqual([30, 30, 5]);
    expect(new Set(seen).size).toBe(65);
  });

  it("AC-PRJ-025 never lists another workspace's projects", async () => {
    const base = await seedBase();
    const other = await seedBase();
    await seedFive(base);
    const reader = createDrizzleProjectListReader(db);
    expect(await reader.listPage(other.context, query())).toEqual([]);
    expect(await reader.count(other.context, "ACTIVE")).toBe(0);
  });

  it("AC-PRJ-028 filters by status, session dates, no-schedule, service and client", async () => {
    const base = await seedBase();
    await seedFive(base);
    const reader = createDrizzleProjectListReader(db);
    const empty = {
      statuses: [],
      from: null,
      to: null,
      includeNoSchedule: false,
      serviceIds: [],
      clientId: null,
    };
    const titles = async (filter: object) =>
      (await reader.listPage(base.context, query({ filter: { ...empty, ...filter } }))).map(
        (row) => row.title,
      );
    expect(
      await titles({ statuses: ["BOOKED", "SHOOTING"], from: "2026-10-01", to: "2026-11-30" }),
    ).toEqual(["Prewed Dewi", "Wisuda Rina"]);
    expect(
      await titles({
        statuses: ["BOOKED", "SHOOTING"],
        from: "2026-10-01",
        to: "2026-11-30",
        includeNoSchedule: true,
      }),
    ).toEqual(["Prewed Dewi", "Wisuda Rina", "Wisuda Sari"]);
    expect(await titles({ from: "2026-11-01" })).toEqual(["Wisuda Rina"]);
    expect(await titles({ to: "2026-10-05" })).toEqual(["Prewed Dewi"]);
    expect(await titles({ clientId: base.sari })).toEqual(["Wisuda Sari"]);
    expect(await titles({ serviceIds: [base.serviceId] })).toHaveLength(3);
    expect(await titles({ serviceIds: [crypto.randomUUID()] })).toEqual([]);
    expect(await reader.count(base.context, "ACTIVE")).toBe(3);
  });
});
