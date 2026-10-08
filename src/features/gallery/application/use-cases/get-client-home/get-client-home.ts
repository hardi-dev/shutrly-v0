import "server-only";

import {
  clientLanding,
  homeGreeting,
  homeGroupCards,
} from "@/features/gallery/domain/client-home/client-home";
import { effectiveLimit } from "@/features/gallery/domain/selection-usage/selection-usage";

import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ClientHomeDeps, ClientHomeView } from "./get-client-home.types";

/**
 * Loads Beranda for a signed-in client: where to land, the greeting, photo counts and the
 * group cards with effective limits and usage (A-24, A-31, BR-SEL-002/007, AC-SEL-001).
 * @param deps - selection repository and the client browse reader
 * @param client - the signed-in client context
 * @returns the Beranda view
 */
export async function getClientHome(
  deps: ClientHomeDeps,
  client: ClientContext,
): Promise<ClientHomeView> {
  const context = { workspaceId: client.workspaceId };
  const [groups, totals] = await Promise.all([
    deps.selections.listGroups(context, client.projectId),
    deps.browse.kindTotals(context, client.galleryId),
  ]);
  const inputs = groups.map((group) => ({
    id: group.id,
    name: group.name,
    status: group.status,
    limit: effectiveLimit(group.baseLimit, group.extraLimit),
    usage: group.usage,
  }));
  const delivered = client.finalDeliveryPublished;
  return {
    landing: clientLanding(groups.length, delivered),
    greeting: homeGreeting(inputs, delivered),
    finalDeliveryPublished: delivered,
    proofCount: totals.proof,
    editedCount: delivered ? totals.edited : 0,
    printCount: delivered ? totals.print : 0,
    groups: homeGroupCards(inputs).map((card, index) => ({ ...card, unit: groups[index].unit })),
  };
}
