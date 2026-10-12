import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import type { AddOnStatus } from "@/features/booking/domain/add-on/add-on.types";
import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { PROJECT_SCHEDULE_TIME_ZONE } from "@/features/booking/domain/schedule-clock/schedule-clock";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import {
  ADD_ON_FIELD_ERROR_MESSAGE_KEY,
  ADD_ON_STATUS_MESSAGE_KEY,
} from "../add-on-copy/add-on.copy";
import type { AddOnTranslate } from "../add-on-copy/add-on-copy.types";

// Per formatting locale (D-20), in the project schedule zone. Frozen lookup (§5.6).
const SHORT_DATE: Readonly<Record<FormattingLocale, Intl.DateTimeFormat>> = Object.freeze({
  "id-ID": new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: PROJECT_SCHEDULE_TIME_ZONE,
  }),
  "en-US": new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: PROJECT_SCHEDULE_TIME_ZONE,
  }),
});
const TONES = { DRAFT: "neutral", APPROVED: "success", CANCELLED: "danger" } as const;

/** The status chip of an add-on row (addon-kartu state B). @param status - stored status @param t - the add-on translator @returns label and tone */
export function addOnStatusChip(
  status: AddOnStatus,
  t: AddOnTranslate,
): Pick<StatusChipProps, "label" | "tone"> {
  return { label: t(ADD_ON_STATUS_MESSAGE_KEY[status]), tone: TONES[status] };
}

/** A row's second line, e.g. "Foto edit · 5 × Rp 20.000 = Rp 100.000" (addon-kartu state B). @param row - the add-on @param locale - the formatting locale @param t - the add-on translator @returns the line */
export function addOnMeta(row: AddOnRowView, locale: FormattingLocale, t: AddOnTranslate): string {
  const group = row.group?.name ?? (row.selectionGroupId ? "" : t("noGroup"));
  return t("meta", {
    group,
    quantity: String(row.quantity),
    unitPrice: formatIdr(row.unitPrice, locale),
    total: formatIdr(row.totalAmount, locale),
  });
}

/** The approve confirm's body: the new limit, the reopen note for a sent group, and no invoice yet (addon-dialog-setujui, A-22, FC-001). @param row - the draft add-on @param t - the add-on translator @returns the body text */
export function approveBody(row: AddOnRowView, t: AddOnTranslate): string {
  const { group } = row;
  if (!group) return t("approveNoInvoice");
  const parts = [
    t("approveLimit", {
      group: group.name,
      from: String(group.limit),
      to: String(group.limit + row.quantity),
    }),
  ];
  if (group.status === "SUBMITTED") parts.push(t("approveReopen"));
  parts.push(t("approveNoInvoice"));
  return parts.join(" ");
}

/** The cancel confirm's body: the lowered limit and the refusal rule (addon-dialog-batalkan, BR-ADD-005). @param row - the approved add-on @param t - the add-on translator @returns the body text */
export function cancelBody(row: AddOnRowView, t: AddOnTranslate): string {
  const { group } = row;
  if (!group) return t("cancelNoGroup");
  return t("cancelLimit", {
    group: group.name,
    from: String(group.limit),
    to: String(group.limit - row.quantity),
    unit: group.unit ?? t("defaultUnit"),
  });
}

/** The cancel confirm's description, e.g. "Tambahan 5 foto edit · disetujui 5 Okt 2026". @param row - the approved add-on @param locale - the formatting locale @param t - the add-on translator @returns the line */
export function cancelDescription(
  row: AddOnRowView,
  locale: FormattingLocale,
  t: AddOnTranslate,
): string {
  const approvedAt = row.approvedAt ?? row.createdAt;
  return t("cancelDescription", {
    description: row.description,
    date: SHORT_DATE[locale].format(new Date(approvedAt)),
  });
}

/** Maps a field-error key from the server to the add-on form's message (AC-ADD-006). @param field - the field path @param key - stable validation key @param t - the add-on translator @returns the message */
export function addOnFieldError(field: string, key: string, t: AddOnTranslate): string {
  const messageKey = ADD_ON_FIELD_ERROR_MESSAGE_KEY[field]?.[key];
  return messageKey ? t(messageKey) : t("fieldGeneric");
}
