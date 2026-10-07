"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import type { DeliveryCardProps } from "../delivery-card/delivery-card.types";
import { DELIVERY_COPY as COPY } from "../delivery-copy/delivery.copy";
import { DeliveryDialog } from "../delivery-dialog/delivery-dialog";
import { useDeliveryActions } from "../use-delivery-actions/use-delivery-actions";

/** *Tandai selesai*, the project header's main action on a DELIVERED project (the phone action bar), with *Tandai proyek selesai?* (owner-7 `r71J5`, `QUSVb`, A-34, AC-DEL-007). @param props - workspace, project, the *Hasil akhir* view and the server actions @returns the button and its dialog */
export function CompleteProjectButton(props: Readonly<DeliveryCardProps>) {
  const isMobile = useMobileViewport();
  const flows = useDeliveryActions(props);
  return (
    <>
      <Button
        size={isMobile ? "lg" : "md"}
        iconLeading="circle-check-big"
        className="max-md:w-full"
        onPress={flows.startComplete}
      >
        {COPY.complete}
      </Button>
      <DeliveryDialog card={props.card} flows={flows} />
    </>
  );
}
