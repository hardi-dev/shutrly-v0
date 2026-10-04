import { uniqueEmail } from "@tests/support/auth/unique";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { service, serviceCategory } from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project } from "@/adapters/db/schema/booking/project";
import { workspaceSourceConfig } from "@/adapters/db/schema/gallery/workspace-source-config";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface GallerySeed {
  readonly context: WorkspaceContext;
  readonly ownerId: string;
  readonly bookedProjectId: string;
  readonly draftProjectId: string;
  readonly sourceConfigId: string;
}

function accessToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

/** Seeds a fresh workspace with a booked and a draft project and an active Drive source (ADR-009: own rows only). */
export async function seedGalleryWorkspace(db: Db): Promise<GallerySeed> {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Gallery Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Gallery ${crypto.randomUUID()}`, invoicePrefix: "GAL" })
    .returning({ id: workspace.id });
  const workspaceId = ws.id;
  const [rina] = await db
    .insert(client)
    .values({ workspaceId, name: "Rina Saputri" })
    .returning({ id: client.id });
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId, name: "Wisuda" })
    .returning({ id: serviceCategory.id });
  const [basic] = await db
    .insert(service)
    .values({ workspaceId, categoryId: category.id, name: "Wisuda Basic", basePrice: "700000" })
    .returning({ id: service.id });
  const base = { workspaceId, clientId: rina.id, serviceId: basic.id, agreedPrice: "700000" };
  const [booked, draft] = await db
    .insert(project)
    .values([
      { ...base, title: "Wisuda Rina", status: "BOOKED", clientAccessToken: accessToken() },
      { ...base, title: "Wisuda Sari", status: "DRAFT", clientAccessToken: accessToken() },
    ])
    .returning({ id: project.id });
  const [source] = await db
    .insert(workspaceSourceConfig)
    .values({ workspaceId, provider: "GOOGLE_DRIVE", displayName: "Google Drive" })
    .returning({ id: workspaceSourceConfig.id });
  return {
    context: { workspaceId: asWorkspaceId(workspaceId) },
    ownerId,
    bookedProjectId: booked.id,
    draftProjectId: draft.id,
    sourceConfigId: source.id,
  };
}
