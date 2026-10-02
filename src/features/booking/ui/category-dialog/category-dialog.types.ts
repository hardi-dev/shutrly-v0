import type { CatalogMutationActions } from "../use-catalog-mutations/use-catalog-mutations";

export interface CategoryDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly category?: { readonly id: string; readonly name: string };
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: CatalogMutationActions["addCategory"];
  readonly renameAction?: NonNullable<CatalogMutationActions["renameCategory"]>;
}
