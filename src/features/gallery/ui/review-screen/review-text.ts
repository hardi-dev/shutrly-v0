import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { ClientPageHeader } from "../client-shell/client-shell.types";
import { REVIEW_COPY as COPY } from "./review-screen.copy";

/** The unit word a group counts in, *foto* when the item names none. @param group - the group @returns the unit */
export const unitOf = (group: PickGroupView): string => group.unit ?? CLIENT_COPY.defaultUnit;

/** The page header of Tinjau (breadcrumb Beranda › group › Tinjau, phone *Kembali memilih*) or of the read-only view (Beranda › group, phone *Beranda*) (tinjau, lihatpilihan exports, A-26, A-29). @param group - the group @param token - the client access token @param isEditable - whether the group is `OPEN` @returns the header */
export function reviewHeader(
  group: PickGroupView,
  token: string,
  isEditable: boolean,
): ClientPageHeader {
  const home = `/g/${token}`;
  const pick = `${home}/picks/${group.id}`;
  if (isEditable) {
    return {
      title: COPY.title(group.name),
      subtitle: COPY.subtitle,
      breadcrumbs: [
        { label: CLIENT_COPY.home, href: home },
        { label: group.name, href: pick },
        { label: COPY.breadcrumbCurrent },
      ],
      back: { href: pick, label: COPY.backToPick },
    };
  }
  return {
    title: group.name,
    subtitle: group.status === "LOCKED" ? COPY.subtitleLocked : COPY.subtitleSubmitted,
    breadcrumbs: [{ label: CLIENT_COPY.home, href: home }, { label: group.name }],
    back: { href: home, label: CLIENT_COPY.home },
  };
}

/** The *Pilihan Anda* card line: the photo count, and for print groups the sheets and the stepper hint (tinjau exports). @param group - the group @param picks - number of picked photos @param usage - the usage @param isEditable - whether the group is `OPEN` @returns the line */
export function cardMeta(
  group: PickGroupView,
  picks: number,
  usage: number,
  isEditable: boolean,
): string {
  if (group.mode === "COUNT") return COPY.cardMetaCount(picks);
  return isEditable
    ? COPY.cardMetaQuantity(picks, usage, unitOf(group))
    : COPY.cardMetaQuantityReadOnly(picks, usage, unitOf(group));
}

/** The *Kirim* button's label: *Mengirim…* while sending, *Kirim n foto* with picks, *Kirim* without (tinjau exports). @param group - the group @param picks - number of picked photos @param usage - the usage @param isSubmitting - whether a send is running @returns the label */
export function sendLabelOf(
  group: PickGroupView,
  picks: number,
  usage: number,
  isSubmitting: boolean,
): string {
  if (isSubmitting) return COPY.sending;
  return picks > 0 ? COPY.send(usage, unitOf(group)) : COPY.sendEmpty;
}
