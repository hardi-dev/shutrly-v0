export type CatalogSkeletonVariant = "services" | "categories" | "items" | "detail" | "project";

export interface CatalogSkeletonProps {
  readonly variant: CatalogSkeletonVariant;
}
