import { uniqueEmail } from "@tests/support/auth/unique";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleDashboardOverviewReader } from "@/adapters/db/project-repository/drizzle-dashboard-overview-reader";
import { user } from "@/adapters/db/schema/auth/auth";
import { service, serviceCategory } from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project, projectSession } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import {
  buildMetricTiles,
  metricWindows,
} from "@/features/booking/domain/dashboard-metrics/dashboard-metrics";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { addProjectItems, randomToken } from "../gallery/client-access/fixture";
import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
let reader: ReturnType<typeof createDrizzleDashboardOverviewReader>;

// Jakarta 14 Oct 2026, 10:00 — the clock every test reads from (FC-001).
const NOW = new Date("2026-10-14T03:00:00Z");
const TODAY = "2026-10-14";
const windows = metricWindows(NOW);
const at = (iso: string) => new Date(iso);

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  reader = createDrizzleDashboardOverviewReader(db);
});
afterAll(() => close());

async function seedWorkspace() {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Dashboard Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Dash ${crypto.randomUUID()}`, invoicePrefix: "DSH" })
    .returning({ id: workspace.id });
  const workspaceId = ws.id;
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId, name: "Wisuda" })
    .returning({ id: serviceCategory.id });
  const [svc] = await db
    .insert(service)
    .values({ workspaceId, categoryId: category.id, name: "Wisuda Basic", basePrice: "750000" })
    .returning({ id: service.id });
  const [rina, sari] = await db
    .insert(client)
    .values([
      { workspaceId, name: "Rina Saputri" },
      { workspaceId, name: "Sari" },
    ])
    .returning({ id: client.id });
  return {
    context: { workspaceId: asWorkspaceId(workspaceId) } satisfies WorkspaceContext,
    workspaceId,
    ownerId,
    serviceId: svc.id,
    rina: rina.id,
    sari: sari.id,
  };
}

type Base = Awaited<ReturnType<typeof seedWorkspace>>;

interface ProjectSeed {
  readonly title: string;
  readonly status: ProjectStatus;
  readonly createdAt?: Date;
  readonly clientId?: string;
  readonly sessions?: readonly { readonly date: string; readonly start?: string }[];
}

async function addProject(base: Base, seed: ProjectSeed): Promise<string> {
  const [row] = await db
    .insert(project)
    .values({
      workspaceId: base.workspaceId,
      clientId: seed.clientId ?? base.rina,
      serviceId: base.serviceId,
      title: seed.title,
      agreedPrice: "750000",
      status: seed.status,
      clientAccessToken: randomToken(),
      createdAt: seed.createdAt ?? at("2026-10-14T02:00:00Z"),
      ...(seed.status === "CANCELLED"
        ? { cancelledAt: new Date(), cancelledBy: base.ownerId }
        : {}),
      ...(seed.status === "COMPLETED"
        ? { completedAt: new Date(), completedBy: base.ownerId }
        : {}),
    })
    .returning({ id: project.id });
  if (seed.sessions !== undefined && seed.sessions.length > 0) {
    await db.insert(projectSession).values(
      seed.sessions.map((session, index) => ({
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

/** Adds a published gallery; a final delivery time marks it delivered (AC-DASH-025). */
async function addGallery(base: Base, projectId: string, finalDeliveryAt?: Date): Promise<string> {
  const [row] = await db
    .insert(gallery)
    .values({
      workspaceId: base.workspaceId,
      projectId,
      status: "PUBLISHED",
      publishedAt: new Date(),
      passwordCiphertext: "enc",
      passwordIv: "iv",
      passwordHash: "hash",
      finalDeliveryPublishedAt: finalDeliveryAt,
    })
    .returning({ id: gallery.id });
  return row.id;
}

type GroupStatus = "OPEN" | "SUBMITTED" | "LOCKED";

/** Adds a selection group on its own project item (one group per item, BR-SEL-001). */
async function addGroup(
  base: Base,
  projectId: string,
  galleryId: string,
  group: { readonly status: GroupStatus; readonly submittedAt?: Date },
): Promise<void> {
  const items = await addProjectItems(db, { workspaceId: base.workspaceId, projectId }, [
    { name: "Foto", value: 1, pickMode: "COUNT" },
  ]);
  await db.insert(selectionGroup).values({
    workspaceId: base.workspaceId,
    projectId,
    projectItemId: items.Foto,
    galleryId,
    baseLimit: 5,
    status: group.status,
    submittedAt: group.submittedAt,
    lockedAt: group.status === "LOCKED" ? new Date() : undefined,
  });
}

describe("dashboard metrics (AC-DASH-003, 022…025, 033…035)", () => {
  it("AC-DASH-022 counts projects created this month, cancelled ones included", async () => {
    const base = await seedWorkspace();
    await addProject(base, {
      title: "Sep",
      status: "BOOKED",
      createdAt: at("2026-09-30T03:00:00Z"),
    });
    await addProject(base, {
      title: "Oct 1",
      status: "CANCELLED",
      createdAt: at("2026-10-01T03:00:00Z"),
    });
    await addProject(base, {
      title: "Oct 10",
      status: "BOOKED",
      createdAt: at("2026-10-10T03:00:00Z"),
    });
    await addProject(base, { title: "Oct 14", status: "BOOKED" });

    const facts = await reader.readMetrics(base.context, windows);
    expect(facts.newThisMonth).toBe(3);
  });

  it("AC-DASH-023 counts only submitted or sent-open groups on projects that are not cancelled", async () => {
    const base = await seedWorkspace();
    const shooting = await addProject(base, { title: "Review", status: "SHOOTING" });
    const galleryId = await addGallery(base, shooting);
    await addGroup(base, shooting, galleryId, {
      status: "SUBMITTED",
      submittedAt: at("2026-10-12T03:00:00Z"),
    });
    await addGroup(base, shooting, galleryId, {
      status: "OPEN",
      submittedAt: at("2026-10-13T03:00:00Z"),
    });
    await addGroup(base, shooting, galleryId, { status: "OPEN" });
    await addGroup(base, shooting, galleryId, {
      status: "LOCKED",
      submittedAt: at("2026-10-01T03:00:00Z"),
    });
    const cancelled = await addProject(base, { title: "Cancelled", status: "CANCELLED" });
    await addGroup(base, cancelled, await addGallery(base, cancelled), {
      status: "SUBMITTED",
      submittedAt: at("2026-10-12T03:00:00Z"),
    });

    const facts = await reader.readMetrics(base.context, windows);
    expect(facts.toReview).toBe(2);
  });

  it("AC-DASH-024 counts projects in post-processing only", async () => {
    const base = await seedWorkspace();
    await addProject(base, { title: "Shooting", status: "SHOOTING" });
    await addProject(base, { title: "Edit 1", status: "POST_PROCESSING" });
    await addProject(base, { title: "Edit 2", status: "POST_PROCESSING" });
    await addProject(base, { title: "Done", status: "DELIVERED" });

    const facts = await reader.readMetrics(base.context, windows);
    expect(facts.inEditing).toBe(2);
  });

  it("AC-DASH-025 counts deliveries published this month, with Jakarta midnight at the boundary", async () => {
    const base = await seedWorkspace();
    for (const [title, deliveredAt, status] of [
      ["Late 30 Sep", "2026-09-30T16:30:00Z", "DELIVERED"],
      ["2 Oct", "2026-10-02T03:00:00Z", "DELIVERED"],
      ["13 Oct", "2026-10-13T03:00:00Z", "DELIVERED"],
      ["5 Oct cancelled", "2026-10-05T03:00:00Z", "CANCELLED"],
    ] as const) {
      const projectId = await addProject(base, { title, status });
      await addGallery(base, projectId, at(deliveredAt));
    }

    const facts = await reader.readMetrics(base.context, windows);
    expect(facts.deliveredThisMonth).toBe(2);
    expect(facts.deliveredByMonth).toContainEqual({ month: "2026-09", count: 1 });
  });

  it("AC-DASH-033 compares this month with the same days of last month", async () => {
    const base = await seedWorkspace();
    for (const day of ["01", "03", "10", "14"]) {
      await addProject(base, {
        title: `New Oct ${day}`,
        status: "BOOKED",
        createdAt: at(`2026-10-${day}T03:00:00Z`),
      });
    }
    for (const day of ["02", "08", "14"]) {
      await addProject(base, {
        title: `New Sep ${day}`,
        status: "BOOKED",
        createdAt: at(`2026-09-${day}T03:00:00Z`),
      });
    }
    for (const day of ["15", "18", "20", "25", "30"]) {
      await addProject(base, {
        title: `Late Sep ${day}`,
        status: "BOOKED",
        createdAt: at(`2026-09-${day}T03:00:00Z`),
      });
    }
    // Created in August so only the deliveries count in the windows under test.
    const august = at("2026-08-15T03:00:00Z");
    for (const day of ["03", "07", "12"]) {
      const projectId = await addProject(base, {
        title: `Delivered Sep ${day}`,
        status: "DELIVERED",
        createdAt: august,
      });
      await addGallery(base, projectId, at(`2026-09-${day}T03:00:00Z`));
    }
    const oct = await addProject(base, {
      title: "Delivered Oct",
      status: "DELIVERED",
      createdAt: august,
    });
    await addGallery(base, oct, at("2026-10-05T03:00:00Z"));

    const facts = await reader.readMetrics(base.context, windows);
    expect(facts).toMatchObject({
      newThisMonth: 4,
      newPrev: 3,
      deliveredThisMonth: 1,
      deliveredPrev: 3,
    });
  });

  it("AC-DASH-034 returns a monthly count for each of the seven months", async () => {
    const base = await seedWorkspace();
    for (const month of ["04", "05", "06", "07", "08", "09", "10"]) {
      await addProject(base, {
        title: `Month ${month}`,
        status: "BOOKED",
        createdAt: at(`2026-${month}-10T03:00:00Z`),
      });
    }

    const facts = await reader.readMetrics(base.context, windows);
    const tiles = buildMetricTiles(facts, windows);
    expect(tiles.newProjects.spark).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });

  it("AC-DASH-035 counts the reviews waiting three days and the ready projects", async () => {
    const base = await seedWorkspace();
    const reviewA = await addProject(base, { title: "Review A", status: "SHOOTING" });
    await addGroup(base, reviewA, await addGallery(base, reviewA), {
      status: "SUBMITTED",
      submittedAt: at("2026-10-10T03:00:00Z"),
    });
    const reviewB = await addProject(base, { title: "Review B", status: "SHOOTING" });
    await addGroup(base, reviewB, await addGallery(base, reviewB), {
      status: "SUBMITTED",
      submittedAt: at("2026-10-13T03:00:00Z"),
    });
    for (const title of ["Locked 1", "Locked 2"]) {
      const id = await addProject(base, { title, status: "POST_PROCESSING" });
      await addGroup(base, id, await addGallery(base, id), { status: "LOCKED" });
    }
    await addProject(base, { title: "No group", status: "POST_PROCESSING" });
    const open = await addProject(base, { title: "Open group", status: "POST_PROCESSING" });
    await addGroup(base, open, await addGallery(base, open), { status: "OPEN" });

    const facts = await reader.readMetrics(base.context, windows);
    expect(facts).toMatchObject({
      toReview: 2,
      toReviewWaiting: 1,
      inEditing: 4,
      inEditingReady: 3,
    });
  });
});

describe("active projects table (AC-DASH-003, 026, 027, 036, 037)", () => {
  it("AC-DASH-026 lists ten active projects and the total of twelve", async () => {
    const base = await seedWorkspace();
    const statuses = ["DRAFT", "BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED"] as const;
    for (let index = 0; index < 12; index += 1) {
      await addProject(base, {
        title: `Active ${String(index)}`,
        status: statuses[index % statuses.length],
        createdAt: at(`2026-10-${String(index + 1).padStart(2, "0")}T02:00:00Z`),
      });
    }
    await addProject(base, { title: "Completed", status: "COMPLETED" });
    await addProject(base, { title: "Cancelled", status: "CANCELLED" });

    const page = await reader.listActiveProjects(base.context, {
      search: null,
      filter: null,
      today: TODAY,
      limit: 10,
    });
    expect(page.rows).toHaveLength(10);
    expect(page.total).toBe(12);
  });

  it("AC-DASH-027 orders by next session: untimed first, then time, then projects with none", async () => {
    const base = await seedWorkspace();
    await addProject(base, {
      title: "Untimed today",
      status: "BOOKED",
      sessions: [{ date: TODAY }],
    });
    await addProject(base, {
      title: "Today 09",
      status: "BOOKED",
      sessions: [{ date: TODAY, start: "09:00" }],
    });
    await addProject(base, {
      title: "Next 18",
      status: "BOOKED",
      sessions: [{ date: "2026-10-12" }, { date: "2026-10-18", start: "07:00" }],
    });
    await addProject(base, {
      title: "None older",
      status: "BOOKED",
      createdAt: at("2026-10-01T02:00:00Z"),
    });
    await addProject(base, {
      title: "None newer",
      status: "BOOKED",
      createdAt: at("2026-10-02T02:00:00Z"),
    });

    const page = await reader.listActiveProjects(base.context, {
      search: null,
      filter: null,
      today: TODAY,
      limit: 10,
    });
    expect(page.rows.map((row) => row.title)).toEqual([
      "Untimed today",
      "Today 09",
      "Next 18",
      "None older",
      "None newer",
    ]);
    expect(page.rows[2].shownSession).toMatchObject({ date: "2026-10-18", startTime: "07:00" });
    expect(page.rows[3].shownSession).toBeNull();
  });

  it("AC-DASH-036 searches title and client name ignoring case, and excludes completed projects", async () => {
    const base = await seedWorkspace();
    await addProject(base, { title: "Wisuda Rina", status: "BOOKED" });
    await addProject(base, { title: "Wisuda Sari", status: "BOOKED", clientId: base.sari });
    await addProject(base, { title: "Prewed Dewi", status: "BOOKED" });
    await addProject(base, { title: "Rina lama", status: "COMPLETED" });

    const byTitle = await reader.listActiveProjects(base.context, {
      search: "RINA",
      filter: null,
      today: TODAY,
      limit: 10,
    });
    const titles = byTitle.rows.map((row) => row.title).sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(["Prewed Dewi", "Wisuda Rina"]);
    expect(byTitle.total).toBe(2);

    const byClient = await reader.listActiveProjects(base.context, {
      search: "saputri",
      filter: null,
      today: TODAY,
      limit: 10,
    });
    expect(byClient.total).toBe(2);
  });

  it("AC-DASH-037 applies the status filter and the total follows it", async () => {
    const base = await seedWorkspace();
    await addProject(base, { title: "Booked", status: "BOOKED" });
    await addProject(base, { title: "Shooting A", status: "SHOOTING" });
    await addProject(base, { title: "Shooting B", status: "SHOOTING" });

    const page = await reader.listActiveProjects(base.context, {
      search: null,
      filter: {
        statuses: ["SHOOTING"],
        from: null,
        to: null,
        includeNoSchedule: false,
        serviceIds: [],
        clientId: null,
      },
      today: TODAY,
      limit: 10,
    });
    expect(page.rows.every((row) => row.status === "SHOOTING")).toBe(true);
    expect(page.total).toBe(2);
  });

  it("AC-DASH-003 never reads or counts another workspace's rows", async () => {
    const mine = await seedWorkspace();
    const theirs = await seedWorkspace();
    await addProject(mine, { title: "Mine", status: "BOOKED" });
    for (const title of ["Theirs 1", "Theirs 2", "Theirs 3"]) {
      await addProject(theirs, { title, status: "BOOKED" });
    }

    const facts = await reader.readMetrics(mine.context, windows);
    const page = await reader.listActiveProjects(mine.context, {
      search: null,
      filter: null,
      today: TODAY,
      limit: 10,
    });
    expect(facts.newThisMonth).toBe(1);
    expect(page.total).toBe(1);
    expect(page.rows.map((row) => row.title)).toEqual(["Mine"]);
  });
});
