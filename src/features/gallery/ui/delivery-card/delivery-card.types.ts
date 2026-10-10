import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { FinalDeliveryWriteResult } from "@/features/gallery/application/use-cases/publish-final-delivery/publish-final-delivery.types";
import type { FinalDeliveryReason } from "@/features/gallery/domain/final-delivery/final-delivery.types";

/** *Tandai selesai*'s answer, mirrored from booking's completion result (features never import each other). */
export type CompleteProjectResult =
  undefined | { readonly ok: false; readonly code: "PROJECT_STATUS" };

export interface DeliveryCardActions {
  readonly publishAction: (
    workspaceId: string,
    projectId: string,
  ) => Promise<FinalDeliveryWriteResult>;
  readonly completeAction: (
    workspaceId: string,
    projectId: string,
  ) => Promise<CompleteProjectResult>;
}

export interface DeliveryCardProps {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly card: DeliveryCardView;
  readonly actions: DeliveryCardActions;
}

/** Which dialog is open: the publish confirm, the completion confirm, or the refusal with its reasons. */
export type DeliveryDialogState =
  | { readonly kind: "PUBLISH" }
  | { readonly kind: "COMPLETE" }
  | { readonly kind: "REFUSED"; readonly reasons: readonly FinalDeliveryReason[] };

/** The card's flows (useDeliveryActions). */
export interface DeliveryFlows {
  readonly dialog: DeliveryDialogState | null;
  readonly isPending: boolean;
  /** Ready: opens the confirm. A and E: asks the server, which answers with the reasons. */
  readonly startPublish: () => void;
  readonly startComplete: () => void;
  readonly confirm: () => void;
  readonly close: () => void;
}

export interface DeliveryCardButtonProps extends DeliveryCardProps {
  readonly flows: DeliveryFlows;
  readonly isMobile: boolean;
}
