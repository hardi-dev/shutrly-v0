export type ServiceDetailRowActionKind = "item" | "field";

export interface ServiceDetailRowActionsProps {
  readonly kind: ServiceDetailRowActionKind;
  readonly name: string;
  readonly meta?: string;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly onEdit: () => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onDelete: () => void;
}

export interface DetailActionHandlers {
  readonly editLabel: string;
  readonly deleteLabel: string;
  readonly onEdit: () => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onDelete: () => void;
}

export interface DetailActionSurfaceProps {
  readonly props: Readonly<ServiceDetailRowActionsProps>;
  readonly handlers: DetailActionHandlers;
}

export interface MobileDetailActionsProps extends DetailActionSurfaceProps {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
  readonly triggerId: string;
}
