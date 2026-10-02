import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";

export interface ItemDefinitionDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly definition?: ItemDefinitionRecord;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (
    workspaceId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly updateAction?: (
    workspaceId: string,
    id: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
}
