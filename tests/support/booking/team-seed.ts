import { uniqueEmail } from "@tests/support/auth/unique";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { service, serviceCategory } from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project, projectSession } from "@/adapters/db/schema/booking/project";
import { sessionAssignment } from "@/adapters/db/schema/booking/team";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

export interface TeamSeedBase {
  readonly workspaceId: ReturnType<typeof asWorkspaceId>;
  readonly ownerId: string;
}

/** Inserts a user and a workspace with unique names (ADR-009); the roles are not seeded. */
export async function seedTeamWorkspace(db: Db): Promise<TeamSeedBase> {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Team Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Team ${crypto.randomUUID()}`, invoicePrefix: "TMS" })
    .returning({ id: workspace.id });
  return { workspaceId: asWorkspaceId(ws.id), ownerId };
}

/** Creates the named roles through the repository and returns their IDs by name. */
export async function seedTeamRoles(
  db: Db,
  base: TeamSeedBase,
  names: readonly string[],
): Promise<Record<string, string>> {
  const roles = createDrizzleTeamRoleRepository(db);
  const ids: Record<string, string> = {};
  for (const name of names) {
    const created = await roles.create(base, name, base.ownerId);
    if (created.status !== "CREATED") throw new Error("role fixture");
    ids[name] = created.id;
  }
  return ids;
}

export interface SeededSession {
  readonly projectId: string;
  readonly sessionId: string;
}

/** Inserts an active client and an active service without items or fields, with unique names. */
export async function seedClientAndService(
  db: Db,
  base: TeamSeedBase,
): Promise<{ clientId: string; serviceId: string }> {
  const suffix = crypto.randomUUID();
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId: base.workspaceId, name: `Cat ${suffix}`, updatedBy: base.ownerId })
    .returning({ id: serviceCategory.id });
  const [svc] = await db
    .insert(service)
    .values({
      workspaceId: base.workspaceId,
      categoryId: category.id,
      name: `Svc ${suffix}`,
      basePrice: "750000",
    })
    .returning({ id: service.id });
  const [rina] = await db
    .insert(client)
    .values({ workspaceId: base.workspaceId, name: `Rina ${suffix}` })
    .returning({ id: client.id });
  return { clientId: rina.id, serviceId: svc.id };
}

/** Inserts a client, service, BOOKED project and one session, all with unique names. */
export async function seedProjectWithSession(
  db: Db,
  base: TeamSeedBase,
  status = "BOOKED",
): Promise<SeededSession> {
  const { clientId, serviceId } = await seedClientAndService(db, base);
  const [row] = await db
    .insert(project)
    .values({
      workspaceId: base.workspaceId,
      clientId,
      serviceId,
      title: "Wisuda Rina",
      agreedPrice: "750000",
      status,
      ...(status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
      clientAccessToken: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
        "base64url",
      ),
    })
    .returning({ id: project.id });
  const [session] = await db
    .insert(projectSession)
    .values({
      workspaceId: base.workspaceId,
      projectId: row.id,
      name: "Akad",
      sessionDate: "2026-11-01",
    })
    .returning({ id: projectSession.id });
  return { projectId: row.id, sessionId: session.id };
}

/** Inserts an assignment directly, bypassing the repository. */
export async function seedAssignment(
  db: Db,
  base: TeamSeedBase,
  target: SeededSession,
  memberId: string,
  roleId: string,
): Promise<string> {
  const [row] = await db
    .insert(sessionAssignment)
    .values({ workspaceId: base.workspaceId, ...target, memberId, roleId })
    .returning({ id: sessionAssignment.id });
  return row.id;
}
