import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { FinalDeliveryWriteResult } from "@/features/gallery/application/use-cases/record-final-delivery/record-final-delivery.types";

/** The server action that marks the project delivered (MARK_DELIVERED, AC-GFL-017). */
export interface MarkDeliveredActions {
  readonly markDeliveredAction: (
    workspaceId: string,
    projectId: string,
  ) => Promise<FinalDeliveryWriteResult>;
}

export interface MarkDeliveredButtonProps {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly card: DeliveryCardView;
  readonly actions: MarkDeliveredActions;
}

export type UseMarkDeliveredInput = MarkDeliveredButtonProps;

export interface MarkDeliveredDialogProps {
  readonly title: string;
  readonly isPending: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}
