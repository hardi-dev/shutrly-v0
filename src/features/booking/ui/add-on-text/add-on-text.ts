import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import type { AddOnStatus } from "@/features/booking/domain/add-on/add-on.types";
import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { PROJECT_SCHEDULE_TIME_ZONE } from "@/features/booking/domain/schedule-clock/schedule-clock";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import { ADD_ON_COPY as COPY, ADD_ON_FIELD_ERRORS } from "../add-on-copy/add-on.copy";

const SHORT_DATE = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: PROJECT_SCHEDULE_TIME_ZONE,
});
const TONES = { DRAFT: "neutral", APPROVED: "success", CANCELLED: "danger" } as const;
const GENERIC_ERROR = "Isi nilai yang valid.";

/** The status chip of an add-on row (addon-kartu state B). @param status - stored status @returns label and tone */
export function addOnStatusChip(status: AddOnStatus): Pick<StatusChipProps, "label" | "tone"> {
  return { label: COPY.status[status], tone: TONES[status] };
}

/** A row's second line, e.g. "Foto edit · 5 × Rp 20.000 = Rp 100.000" (addon-kartu state B). @param row - the add-on @returns the line */
export function addOnMeta(row: AddOnRowView, locale: FormattingLocale): string {
  const group = row.group?.name ?? (row.selectionGroupId ? "" : COPY.noGroup);
  return COPY.meta(
    group,
    row.quantity,
    formatIdr(row.unitPrice, locale),
    formatIdr(row.totalAmount, locale),
  );
}

/** The approve confirm's body: the new limit, the reopen note for a sent group, and no invoice yet (addon-dialog-setujui, A-22, FC-001). @param row - the draft add-on @returns the body text */
export function approveBody(row: AddOnRowView): string {
  const { group } = row;
  if (!group) return COPY.approveNoInvoice;
  const parts = [COPY.approveLimit(group.name, group.limit, group.limit + row.quantity)];
  if (group.status === "SUBMITTED") parts.push(COPY.approveReopen(group.name));
  parts.push(COPY.approveNoInvoice);
  return parts.join(" ");
}

/** The cancel confirm's body: the lowered limit and the refusal rule (addon-dialog-batalkan, BR-ADD-005). @param row - the approved add-on @returns the body text */
export function cancelBody(row: AddOnRowView): string {
  const { group } = row;
  if (!group) return COPY.cancelNoGroup;
  const unit = group.unit ?? COPY.defaultUnit;
  return COPY.cancelLimit(group.name, group.limit, group.limit - row.quantity, unit);
}

/** The cancel confirm's description, e.g. "Tambahan 5 foto edit · disetujui 5 Okt 2026". @param row - the approved add-on @returns the line */
export function cancelDescription(row: AddOnRowView): string {
  const approvedAt = row.approvedAt ?? row.createdAt;
  return COPY.cancelDescription(row.description, SHORT_DATE.format(new Date(approvedAt)));
}

/** Maps a field-error key from the server to the add-on form's message (AC-ADD-006). @param field - the field path @param key - stable validation key @returns the message */
export function addOnFieldError(field: string, key: string): string {
  return ADD_ON_FIELD_ERRORS[field]?.[key] ?? GENERIC_ERROR;
}
