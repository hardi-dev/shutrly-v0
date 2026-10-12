import type { ClientHomeView } from "@/features/gallery/application/use-cases/get-client-home/get-client-home.types";

import type { ClientTranslate } from "../client-copy/client-copy.types";

/** The line under *Halo, Rina* for each greeting kind (beranda exports). @param t - the home translate function @param home - the Beranda view @returns the subtitle */
export function clientHomeSubtitle(t: ClientTranslate, home: ClientHomeView): string {
  const { greeting } = home;
  if (greeting.kind === "DELIVERED") return t("subtitleDelivered");
  if (greeting.kind === "ALL_SENT") return t("subtitleAllSent");
  if (greeting.kind === "PARTLY_SENT") {
    return t("subtitlePartly", {
      sent: greeting.sent.join(t("listJoin")),
      open: greeting.open.join(t("listJoin")),
    });
  }
  return home.groups.length === 0 ? t("subtitleNoGroups") : t("subtitleStart");
}
