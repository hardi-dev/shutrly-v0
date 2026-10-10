import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { AddOnConfirmState } from "../add-on-card/add-on-card.types";
import { ADD_ON_COPY as COPY } from "../add-on-copy/add-on.copy";
import { approveBody, cancelBody, cancelDescription } from "../add-on-text/add-on-text";
import type { AddOnConfirmContent } from "./add-on-confirm-dialog.types";

/** The texts and buttons of the approve, cancel and refusal confirms (addon-dialog-setujui / -batalkan / -batal-ditolak). @param state - which confirm, for which add-on @returns its content */
export function addOnConfirmContent(
  state: AddOnConfirmState,
  locale: FormattingLocale,
): AddOnConfirmContent {
  const { row } = state;
  if (state.kind === "APPROVE") {
    return {
      title: COPY.approveTitle,
      description: COPY.approveDescription(row.description, formatIdr(row.totalAmount, locale)),
      body: approveBody(row),
      confirmLabel: COPY.approveConfirm,
      cancelLabel: COPY.formCancel,
      isDanger: false,
    };
  }
  if (state.kind === "CANCEL") {
    return {
      title: COPY.cancelTitle,
      description: cancelDescription(row, locale),
      body: cancelBody(row),
      confirmLabel: COPY.cancelConfirm,
      cancelLabel: COPY.cancelBack,
      isDanger: true,
    };
  }
  const unit = row.group?.unit ?? COPY.defaultUnit;
  return {
    title: COPY.refusedTitle,
    description: COPY.refusedDescription,
    body: COPY.refusedBody(state.usage, unit, state.limit),
    confirmLabel: COPY.refusedConfirm,
    cancelLabel: null,
    isDanger: false,
  };
}
