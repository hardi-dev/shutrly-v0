import { useTranslations } from "next-intl";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";

import { CLIENT_UNAVAILABLE_COPY_NAMESPACE } from "./client-unavailable.copy";

/** The one neutral page for every unavailable link: no brand, title or hint of the case (D-7, AC-ACC-004). @returns the page */
export function ClientUnavailable() {
  const t = useTranslations(CLIENT_UNAVAILABLE_COPY_NAMESPACE);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-(--color-semantic-surface-canvas) p-(--space-6)">
      <EmptyState icon="image-off" iconTone="accent" title={t("title")} body={t("body")} />
    </main>
  );
}
