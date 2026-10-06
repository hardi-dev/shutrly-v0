import type {
  ClientLanding,
  HomeGreeting,
  HomeGroupAction,
  HomeGroupCard,
  HomeGroupInput,
} from "./client-home.types";

/** Where the client lands after the password (A-24, A-31). @param groupCount - selection groups of the project @param finalDeliveryPublished - whether final delivery is published @returns Beranda, or *Semua foto* when Beranda would hold one card */
export function clientLanding(groupCount: number, finalDeliveryPublished: boolean): ClientLanding {
  return groupCount === 0 && !finalDeliveryPublished ? "ALL_PHOTOS" : "HOME";
}

function actionOf(group: HomeGroupInput): HomeGroupAction {
  if (group.status !== "OPEN") return "VIEW";
  if (group.limit === 0) return "NONE";
  return group.usage > 0 ? "CONTINUE" : "START";
}

/** Beranda's group cards in project-item order, with the action and bar of each (A-24, BR-SEL-007). @param groups - the project's groups in item order @returns the cards; the first open group with places is primary */
export function homeGroupCards(groups: readonly HomeGroupInput[]): readonly HomeGroupCard[] {
  const primaryId = groups.find(
    (group) => actionOf(group) !== "NONE" && group.status === "OPEN",
  )?.id;
  return groups.map((group) => ({
    ...group,
    action: actionOf(group),
    isPrimary: group.id === primaryId,
    progress: progressOf(group),
  }));
}

function progressOf(group: HomeGroupInput): number {
  if (group.status !== "OPEN") return 1;
  return group.limit === 0 ? 0 : Math.min(1, group.usage / group.limit);
}

/** The line under *Halo, Rina* (beranda awal / setelah kirim / hasil akhir). @param groups - the project's groups in item order @param finalDeliveryPublished - whether final delivery is published @returns the greeting kind and the group names it names */
export function homeGreeting(
  groups: readonly HomeGroupInput[],
  finalDeliveryPublished: boolean,
): HomeGreeting {
  if (finalDeliveryPublished) return { kind: "DELIVERED" };
  const sent = groups.filter((group) => group.status !== "OPEN").map((group) => group.name);
  const open = groups.filter((group) => group.status === "OPEN").map((group) => group.name);
  if (sent.length === 0) return { kind: "START" };
  return open.length === 0 ? { kind: "ALL_SENT" } : { kind: "PARTLY_SENT", sent, open };
}
