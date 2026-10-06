import { EmptyState } from "@/ui/patterns/empty-state/empty-state";

import { CLIENT_UNAVAILABLE_COPY as COPY } from "./client-unavailable.copy";

/** The one neutral page for every unavailable link: no brand, title or hint of the case (D-7, AC-ACC-004). @returns the page */
export function ClientUnavailable() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-(--color-semantic-surface-canvas) p-(--space-6)">
      <EmptyState icon="image-off" iconTone="accent" title={COPY.title} body={COPY.body} />
    </main>
  );
}
