import type {
  ClientLanding,
  HomeGreeting,
  HomeGroupAction,
  HomeGroupCard,
  HomeGroupInput,
} from "./client-home.types";

/** Whether Beranda holds only the *Semua foto* card (A-24). Since F-23 R-7 the client still lands on Beranda; *Semua foto* uses this for its title and subtitle. @param groupCount - selection groups of the project @param hasFinishedFiles - whether a synced finished file is visible (AC-GFL-019) @returns `ALL_PHOTOS` when Beranda would hold one card, else `HOME` */
export function clientLanding(groupCount: number, hasFinishedFiles: boolean): ClientLanding {
  return groupCount === 0 && !hasFinishedFiles ? "ALL_PHOTOS" : "HOME";
}

function actionOf(group: HomeGroupInput): HomeGroupAction {
  if (group.status !== "OPEN") return "VIEW";
  if (group.limit === 0) return "NONE";
  return group.usage > 0 ? "CONTINUE" : "START";
}

/** Beranda's group cards in project-item order, with the action and bar of each (A-24, BR-SEL-007). A pick action is disabled while no photo is visible (AC-GFL-009). @param groups - the project's groups in item order @param hasPhotos - whether a proof is visible @returns the cards; the first open group with places is primary */
export function homeGroupCards(
  groups: readonly HomeGroupInput[],
  hasPhotos = true,
): readonly HomeGroupCard[] {
  const primaryId = groups.find(
    (group) => actionOf(group) !== "NONE" && group.status === "OPEN",
  )?.id;
  return groups.map((group) => {
    const action = actionOf(group);
    return {
      ...group,
      action,
      isPrimary: group.id === primaryId,
      isDisabled: !hasPhotos && action !== "VIEW" && action !== "NONE",
      progress: progressOf(group),
    };
  });
}

function progressOf(group: HomeGroupInput): number {
  if (group.status !== "OPEN") return 1;
  return group.limit === 0 ? 0 : Math.min(1, group.usage / group.limit);
}

/** The line under *Halo, Rina* (beranda awal / setelah kirim / hasil akhir). @param groups - the project's groups in item order @param finalDeliveryPublished - whether the project is marked delivered @returns the greeting kind and the group names it names */
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
