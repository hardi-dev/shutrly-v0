import { showToast } from "@/ui/patterns/toast/toast";

import type { CatalogSaveFailureArgs } from "./catalog-save-feedback.types";

export function showCatalogSaveFailure({
  setError,
  retry,
  t,
}: Readonly<CatalogSaveFailureArgs>): void {
  setError("SAVE_FAILED");
  showToast({
    tone: "danger",
    title: t("serverErrorTitle"),
    body: t("serverErrorBody"),
    action: { label: t("retry"), onAction: retry },
  });
}
