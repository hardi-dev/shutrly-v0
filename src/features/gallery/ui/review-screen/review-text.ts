import type { useTranslations } from "next-intl";

import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import type { ClientTranslate } from "../client-copy/client-copy.types";
import type { ClientPageHeader } from "../client-shell/client-shell.types";

/** The review translate function, passed into helpers that run outside a component. */
export type ReviewTranslate = ReturnType<typeof useTranslations>;

/** The unit word a group counts in, *foto* when the item names none. @param shared - the shared client translate function @param group - the group @returns the unit */
export const unitOf = (shared: ClientTranslate, group: PickGroupView): string =>
  group.unit ?? shared("defaultUnit");

/** The page header of Tinjau (breadcrumb Beranda › group › Tinjau, phone *Kembali memilih*) or of the read-only view (Beranda › group, not linked › Tinjau, phone *Beranda*; F-23) (tinjau, lihatpilihan exports, A-26, A-29). @param t - the review translate function @param shared - the shared client translate function @param group - the group @param token - the client access token @param isEditable - whether the group is `OPEN` @returns the header */
export function reviewHeader(
  t: ReviewTranslate,
  shared: ClientTranslate,
  group: PickGroupView,
  token: string,
  isEditable: boolean,
): ClientPageHeader {
  const home = `/g/${token}`;
  const pick = `${home}/picks/${group.id}`;
  if (isEditable) {
    return {
      title: t("title", { name: group.name }),
      subtitle: t("subtitle"),
      breadcrumbs: [
        { label: shared("home"), href: home },
        { label: group.name, href: pick },
        { label: t("breadcrumbCurrent") },
      ],
      back: { href: pick, label: t("backToPick") },
    };
  }
  return {
    title: group.name,
    subtitle: group.status === "LOCKED" ? t("subtitleLocked") : t("subtitleSubmitted"),
    // F-23 R-5: the group's Pilih page redirects a non-OPEN group back here, so its crumb is plain text.
    breadcrumbs: [
      { label: shared("home"), href: home },
      { label: group.name },
      { label: t("breadcrumbCurrent") },
    ],
    back: { href: home, label: shared("home") },
  };
}

/** The *Pilihan Anda* card line: the photo count, and for print groups the sheets and the stepper hint (tinjau exports). @param t - the review translate function @param shared - the shared client translate function @param group - the group @param picks - number of picked photos @param usage - the usage @param isEditable - whether the group is `OPEN` @returns the line */
export function cardMeta(
  t: ReviewTranslate,
  shared: ClientTranslate,
  group: PickGroupView,
  picks: number,
  usage: number,
  isEditable: boolean,
): string {
  if (group.mode === "COUNT") return t("cardMetaCount", { picks });
  const unit = unitOf(shared, group);
  return isEditable
    ? t("cardMetaQuantity", { picks, usage, unit })
    : t("cardMetaQuantityReadOnly", { picks, usage, unit });
}

/** The *Kirim* button's label: *Mengirim…* while sending, *Kirim n foto* with picks, *Kirim* without (tinjau exports). @param t - the review translate function @param shared - the shared client translate function @param group - the group @param picks - number of picked photos @param usage - the usage @param isSubmitting - whether a send is running @returns the label */
export function sendLabelOf(
  t: ReviewTranslate,
  shared: ClientTranslate,
  group: PickGroupView,
  picks: number,
  usage: number,
  isSubmitting: boolean,
): string {
  if (isSubmitting) return t("sending");
  return picks > 0 ? t("send", { usage, unit: unitOf(shared, group) }) : t("sendEmpty");
}
