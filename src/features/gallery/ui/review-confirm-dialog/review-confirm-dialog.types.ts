import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

export interface ReviewConfirmDialogProps {
  readonly group: PickGroupView;
  readonly usage: number;
  /** Places left, as the server counted them. */
  readonly remaining: number;
  readonly sendLabel: string;
  /** *Pilih lagi* goes back to Pilih. */
  readonly pickHref: string;
  readonly isPending: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export type ConfirmBodyProps = Pick<ReviewConfirmDialogProps, "group" | "usage" | "remaining">;
