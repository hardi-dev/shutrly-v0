export interface CatalogRowActionsProps {
  readonly workspaceId: string;
  readonly kind: "category" | "service" | "definition";
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly meta?: string;
  readonly onEdit?: () => void;
  readonly onRename?: () => void;
  readonly onDelete?: () => void;
  readonly setActiveAction: (
    workspaceId: string,
    kind: "category" | "service" | "definition",
    id: string,
    isActive: boolean,
  ) => Promise<void>;
}

export interface RowActionHandlers {
  readonly actionLabel: string;
  readonly onEdit: () => void;
  readonly onRename: () => void;
  readonly onActive: () => void;
  readonly onDelete: () => void;
}

export interface CatalogActionSurfaceProps {
  readonly props: Readonly<CatalogRowActionsProps>;
  readonly handlers: RowActionHandlers;
}

export interface MobileCatalogActionsProps extends CatalogActionSurfaceProps {
  readonly isOpen: boolean;
  readonly setIsOpen: (isOpen: boolean) => void;
}

export interface CatalogSheetItemsProps {
  readonly kind: CatalogRowActionsProps["kind"];
  readonly handlers: RowActionHandlers;
}
