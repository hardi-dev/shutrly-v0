"use client";

import { cn } from "@/ui/cn/cn";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { DELIVERY_COPY as COPY } from "../delivery-copy/delivery.copy";
import { DeliveryDialog } from "../delivery-dialog/delivery-dialog";
import { deliveryNote, deliveryRows } from "../delivery-text/delivery-text";
import { useDeliveryActions } from "../use-delivery-actions/use-delivery-actions";
import type { DeliveryCardButtonProps, DeliveryCardProps } from "./delivery-card.types";

const MUTED = "text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)";

/** The gallery page's *Hasil akhir* card: no file yet, ready, published, completed or gallery not active, with *Publikasikan hasil akhir*; *Tandai selesai* lives in the project header (hasilakhirowner-kartu A–E, Owner 7, A-34, AC-DEL-001). @param props - workspace, project, the card view and the server actions @returns the card */
export function DeliveryCard(props: Readonly<DeliveryCardProps>) {
  const isMobile = useMobileViewport();
  const flows = useDeliveryActions(props);
  const { card } = props;
  const button = <CardButton {...props} flows={flows} isMobile={isMobile} />;
  const note = deliveryNote(card);
  return (
    <>
      <SectionCard
        title={COPY.cardTitle}
        description={COPY.cardDescription}
        actions={isMobile ? undefined : button}
        content="flush"
      >
        {note ? (
          <p className={cn("p-(--space-4) md:p-(--space-6)", MUTED)}>{note}</p>
        ) : (
          <ul className="flex flex-col gap-(--space-3) p-(--space-4) md:p-(--space-6)">
            {deliveryRows(card).map((row) => (
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
        {isMobile ? (
          <div className="px-(--space-4) pb-(--space-4) empty:hidden">{button}</div>
        ) : null}
      </SectionCard>
      <DeliveryDialog card={card} flows={flows} />
    </>
  );
}

function CardButton({ card, flows, isMobile }: Readonly<DeliveryCardButtonProps>) {
  const size = isMobile ? "lg" : "md";
  if (card.state === "PUBLISHED" || card.state === "COMPLETED") return null;
  return (
    <Button
      variant={card.state === "READY" ? "primary" : "secondary"}
      size={size}
      className="max-md:w-full"
      onPress={flows.startPublish}
    >
      {COPY.publish}
    </Button>
  );
}
