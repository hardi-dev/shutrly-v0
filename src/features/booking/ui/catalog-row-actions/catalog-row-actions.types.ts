export interface CatalogRowActionsProps {
  readonly workspaceId: string;
  readonly kind: "category" | "service";
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly meta?: string;
  readonly onEdit?: () => void;
  readonly onRename?: () => void;
  readonly onDelete?: () => void;
  readonly setActiveAction: (
    workspaceId: string,
    kind: "category" | "service",
    id: string,
    isActive: boolean,
  ) => Promise<void>;
}
