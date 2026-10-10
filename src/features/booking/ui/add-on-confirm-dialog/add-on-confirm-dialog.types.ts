import type { ReactNode } from "react";

import type { AddOnConfirmState } from "../add-on-card/add-on-card.types";

export interface AddOnConfirmDialogProps {
  readonly state: AddOnConfirmState | null;
  readonly isPending: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

/** What one confirm shows: texts, the buttons and whether the confirm is destructive. */
export interface AddOnConfirmContent {
  readonly title: string;
  readonly description: string;
  readonly body: string;
  readonly confirmLabel: string;
  /** null: the refusal has only its confirm. */
  readonly cancelLabel: string | null;
  readonly isDanger: boolean;
}

export interface AddOnConfirmSurfaceProps extends AddOnConfirmDialogProps {
  readonly content: AddOnConfirmContent;
  readonly confirm: ReactNode;
  readonly onOpenChange: (isOpen: boolean) => void;
}
