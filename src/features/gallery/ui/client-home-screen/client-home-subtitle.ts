import type { ClientHomeView } from "@/features/gallery/application/use-cases/get-client-home/get-client-home.types";

import { CLIENT_HOME_COPY as COPY } from "./client-home-screen.copy";

/** The line under *Halo, Rina* for each greeting kind (beranda exports). @param home - the Beranda view @returns the subtitle */
export function clientHomeSubtitle(home: ClientHomeView): string {
  const { greeting } = home;
  if (greeting.kind === "DELIVERED") return COPY.subtitleDelivered;
  if (greeting.kind === "ALL_SENT") return COPY.subtitleAllSent;
  if (greeting.kind === "PARTLY_SENT") {
    return COPY.subtitlePartly(
      greeting.sent.join(COPY.listJoin),
      greeting.open.join(COPY.listJoin),
    );
  }
  return home.groups.length === 0 ? COPY.subtitleNoGroups : COPY.subtitleStart;
}
