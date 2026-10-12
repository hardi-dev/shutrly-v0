import { useTranslations } from "next-intl";

import { CATALOG_ERROR_MESSAGE_KEY } from "../catalog-copy/catalog-copy.copy";
import { CATALOG_FIELD_ERROR_COPY_NAMESPACE } from "./catalog-field-error.copy";
import type { CatalogFieldErrorProps } from "./catalog-field-error.types";

export function CatalogFieldError({ errorKey }: Readonly<CatalogFieldErrorProps>) {
  const t = useTranslations(CATALOG_FIELD_ERROR_COPY_NAMESPACE);
  if (!errorKey) return null;
  if (!isCatalogErrorKey(errorKey)) return null;
  return <p role="alert">{t(CATALOG_ERROR_MESSAGE_KEY[errorKey])}</p>;
}

/**
 * Whether a server error string is one of the stable catalog error codes.
 * @param key - the error string from a server result
 * @returns true when the code has a message
 */
export function isCatalogErrorKey(key: string): key is keyof typeof CATALOG_ERROR_MESSAGE_KEY {
  return Object.hasOwn(CATALOG_ERROR_MESSAGE_KEY, key);
}
