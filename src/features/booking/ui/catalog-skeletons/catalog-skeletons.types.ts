export type CatalogSkeletonVariant = "services" | "categories" | "items" | "detail";

export interface CatalogSkeletonProps {
  readonly variant: CatalogSkeletonVariant;
}
