import type { ReviewView } from "@/features/gallery/application/use-cases/get-review/get-review.types";
import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import type {
  ReviewActions,
  ReviewChangesHandle,
  ReviewSubmitHandle,
} from "../use-review-screen/use-review-screen.types";

export interface ReviewScreenProps {
  readonly gate: ClientGateView;
  readonly token: string;
  readonly view: ReviewView;
  readonly actions: ReviewActions;
}

export interface ReviewListProps {
  readonly changes: ReviewChangesHandle;
  readonly isEditable: boolean;
  readonly onNote: (photoId: string) => void;
}

export interface ReviewFooterProps {
  readonly changes: ReviewChangesHandle;
  readonly submit: ReviewSubmitHandle;
  readonly pickHref: string;
}

export interface ReviewOverlaysProps {
  readonly changes: ReviewChangesHandle;
  readonly submit: ReviewSubmitHandle;
  readonly actions: ReviewActions;
  readonly pickHref: string;
  /** The photo whose note sheet is open, or null. */
  readonly noteFor: string | null;
  readonly onCloseNote: () => void;
}
