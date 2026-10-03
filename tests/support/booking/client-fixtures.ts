import { whatsappNumberSchema } from "@/features/booking/domain/whatsapp-number/whatsapp-number.schema";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeClientRepository } from "./fake-client-repository";

export const clientContext = { workspaceId: "clients-workspace" } as unknown as WorkspaceContext;

/** Builds the shared AC-CLI-001 client fixture. @returns the scoped fake client repository */
export async function clientFixture(): Promise<FakeClientRepository> {
  const clients = new FakeClientRepository();
  await clients.create(clientContext, {
    name: "Rina",
    whatsappNumber: whatsappNumberSchema.parse("6281234567890"),
    socialLinks: [
      { platform: "INSTAGRAM", value: "rina.wed" },
      { platform: "TIKTOK", value: "rina" },
    ],
    editorUserId: "owner",
  });
  await clients.create(clientContext, {
    name: "ade",
    whatsappNumber: null,
    socialLinks: [],
    editorUserId: "owner",
  });
  await clients.create(clientContext, {
    name: "Budi",
    whatsappNumber: whatsappNumberSchema.parse("6289876543210"),
    socialLinks: [{ platform: "INSTAGRAM", value: "budi.foto" }],
    editorUserId: "owner",
  });
  const budi = clients.rows.find((row) => row.name === "Budi");
  if (!budi) throw new Error("fixture");
  const index = clients.rows.indexOf(budi);
  clients.rows[index] = { ...budi, isArchived: true };
  return clients;
}
