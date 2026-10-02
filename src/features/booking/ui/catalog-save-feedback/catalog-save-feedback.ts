import { showToast } from "@/ui/patterns/toast/toast";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { CatalogSaveFailureArgs } from "./catalog-save-feedback.types";

export function showCatalogSaveFailure({
  setError,
  retry,
}: Readonly<CatalogSaveFailureArgs>): void {
  setError("SAVE_FAILED");
  showToast({
    tone: "danger",
    title: CATALOG_COPY.serverErrorTitle,
    body: CATALOG_COPY.serverErrorBody,
    action: { label: CATALOG_COPY.retry, onAction: retry },
  });
}
