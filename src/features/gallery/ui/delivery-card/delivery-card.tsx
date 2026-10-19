"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/ui/cn/cn";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { deliveryNote, deliveryRows } from "../delivery-text/delivery-text";
import { DELIVERY_CARD_COPY_NAMESPACE } from "./delivery-card.copy";
import type { DeliveryCardProps } from "./delivery-card.types";

const MUTED = "text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)";

/** The gallery page's *Hasil akhir* card (design `galeri-ada-foto`, F-27): the synced finished files or the delivery date, with no publish action; the client can download once files are synced (AC-GFL-006, 019). @param props - the card view @returns the card */
export function DeliveryCard({ card }: Readonly<DeliveryCardProps>) {
  const t = useTranslations(DELIVERY_CARD_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const note = deliveryNote(t, card);
  return (
    <SectionCard title={t("cardTitle")} description={t("cardDescription")} content="flush">
      {note ? (
        <p className={cn("p-(--space-4) md:p-(--space-6)", MUTED)}>{note}</p>
      ) : (
        <ul className="flex flex-col gap-(--space-3) p-(--space-4) md:p-(--space-6)">
          {deliveryRows(t, card, locale).map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-(--space-3)">
              <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
                <span className="text-(length:--font-size-body) font-medium text-(--color-semantic-text-primary)">
                  {row.title}
                </span>
                <span className={MUTED}>{row.meta}</span>
              </span>
              <StatusChip {...row.chip} hasDot />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
