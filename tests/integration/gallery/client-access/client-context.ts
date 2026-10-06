import type { ClientContext } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

/** A signed-in client context for a seeded project, as the gate would build it (D-4). */
export function clientContextOf(target: {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly galleryId: string;
  readonly token: string;
  readonly finalDeliveryPublished?: boolean;
}): ClientContext {
  return {
    workspaceId: asWorkspaceId(target.workspaceId),
    projectId: target.projectId,
    galleryId: target.galleryId,
    sessionId: "0123456789abcdef0123456789abcdef",
    token: target.token,
    contentVersion: 1,
    finalDeliveryPublished: target.finalDeliveryPublished ?? false,
  };
}
