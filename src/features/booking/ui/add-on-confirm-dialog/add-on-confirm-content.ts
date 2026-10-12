import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { AddOnConfirmState } from "../add-on-card/add-on-card.types";
import type { AddOnTranslate } from "../add-on-copy/add-on-copy.types";
import { approveBody, cancelBody, cancelDescription } from "../add-on-text/add-on-text";
import type { AddOnConfirmContent } from "./add-on-confirm-dialog.types";

/** The texts and buttons of the approve, cancel and refusal confirms (addon-dialog-setujui / -batalkan / -batal-ditolak). @param state - which confirm, for which add-on @param locale - the formatting locale @param t - the add-on translator @returns its content */
export function addOnConfirmContent(
  state: AddOnConfirmState,
  locale: FormattingLocale,
  t: AddOnTranslate,
): AddOnConfirmContent {
  const { row } = state;
  if (state.kind === "APPROVE") {
    return {
      title: t("approveTitle"),
      description: t("approveDescription", {
        description: row.description,
        total: formatIdr(row.totalAmount, locale),
      }),
      body: approveBody(row, t),
      confirmLabel: t("approveConfirm"),
      cancelLabel: t("formCancel"),
      isDanger: false,
    };
  }
  if (state.kind === "CANCEL") {
    return {
      title: t("cancelTitle"),
      description: cancelDescription(row, locale, t),
      body: cancelBody(row, t),
      confirmLabel: t("cancelConfirm"),
      cancelLabel: t("cancelBack"),
      isDanger: true,
    };
  }
  const unit = row.group?.unit ?? t("defaultUnit");
  return {
    title: t("refusedTitle"),
    description: t("refusedDescription"),
    body: t("refusedBody", { usage: state.usage, unit, limit: state.limit }),
    confirmLabel: t("refusedConfirm"),
    cancelLabel: null,
    isDanger: false,
  };
}
