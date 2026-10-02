import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { CatalogFieldErrorProps } from "./catalog-field-error.types";

export function CatalogFieldError({ errorKey }: Readonly<CatalogFieldErrorProps>) {
  if (!errorKey) return null;
  if (!isCatalogErrorKey(errorKey)) return null;
  return <p role="alert">{CATALOG_COPY.errors[errorKey]}</p>;
}

function isCatalogErrorKey(key: string): key is keyof typeof CATALOG_COPY.errors {
  return Object.hasOwn(CATALOG_COPY.errors, key);
}
