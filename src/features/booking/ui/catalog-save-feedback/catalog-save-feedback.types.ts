import type { CatalogTranslate } from "../catalog-copy/catalog-copy.types";

export interface CatalogSaveFailureArgs {
  readonly setError: (error: string) => void;
  readonly retry: () => void;
  readonly t: CatalogTranslate;
}
