import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import type { DeliveryFlows } from "../delivery-card/delivery-card.types";

export interface DeliveryDialogProps {
  readonly card: DeliveryCardView;
  readonly flows: DeliveryFlows;
}
