import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type {
  CatalogDeleteResult,
  CatalogWriteResult,
} from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";

export interface CategoriesScreenProps {
  readonly workspaceId: string;
  readonly categories: readonly CategoryRecord[];
  readonly addAction?: (
    workspaceId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly renameAction?: (
    workspaceId: string,
    id: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly setActiveAction?: (
    workspaceId: string,
    kind: "category" | "service" | "definition",
    id: string,
    isActive: boolean,
  ) => Promise<void>;
  readonly removeAction?: (
    workspaceId: string,
    kind: "category" | "service" | "definition",
    id: string,
  ) => Promise<CatalogDeleteResult>;
}

export interface CategoryDialogsProps {
  readonly workspaceId: string;
  readonly isDialogOpen: boolean;
  readonly setIsDialogOpen: (open: boolean) => void;
  readonly editing?: CategoryRecord;
  readonly addAction: CategoriesScreenProps["addAction"];
  readonly renameAction: CategoriesScreenProps["renameAction"];
  readonly deleting?: CategoryRecord;
  readonly removeAction: CategoriesScreenProps["removeAction"];
  readonly setActiveAction: CategoriesScreenProps["setActiveAction"];
  readonly closeDelete: (open: boolean) => void;
}
