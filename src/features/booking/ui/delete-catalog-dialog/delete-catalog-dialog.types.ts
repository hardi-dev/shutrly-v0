import type { CatalogMutationActions } from "../use-catalog-mutations/use-catalog-mutations";

export interface DeleteCatalogDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly kind: "category" | "service";
  readonly entry: { readonly id: string; readonly name: string };
  readonly isInUse: boolean;
  readonly usage?: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly removeAction: NonNullable<CatalogMutationActions["remove"]>;
  readonly setActiveAction: NonNullable<CatalogMutationActions["setActive"]>;
}
