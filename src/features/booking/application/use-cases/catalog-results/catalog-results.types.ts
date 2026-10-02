export interface CatalogValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<Partial<Record<string, string>>>;
}

export type CatalogWriteResult =
  { readonly ok: true; readonly categoryId?: string } | CatalogValidationFailure;
export type CatalogDeleteResult =
  { readonly ok: true } | { readonly ok: false; readonly code: "IN_USE" };
