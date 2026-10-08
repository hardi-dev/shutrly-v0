import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";

export interface AddOnMenuProps {
  readonly row: AddOnRowView;
  readonly onApprove: () => void;
  readonly onDeleteDraft: () => void;
  readonly onCancel: () => void;
}
