import Image from "next/image";

import { EDITORIAL_PANEL_COPY } from "./editorial-panel.copy";

// The tilted mosaic (auth.pen Z5xhk) is a decorative image exported from Pencil with its scrim
// (Owner 2026-09-27): licensed photos only (R-5). The headline stays live text.
const MOSAIC_SRC = "/auth/editorial/mosaic.webp";

/**
 * The desktop editorial panel beside every auth form. Decorative: hidden from assistive
 * technology and free of controls (design.md › Copy and behavior).
 * @returns the panel
 */
export function EditorialPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative h-full min-h-dvh overflow-hidden bg-(--color-semantic-surface-inverse)"
    >
      <Image src={MOSAIC_SRC} alt="" fill sizes="100vw" unoptimized className="object-cover" />
      <div className="absolute inset-x-(--space-16) bottom-(--space-16) flex flex-col gap-(--space-4)">
        <p className="text-(length:--font-size-hero) leading-(--font-line-height-tight) font-bold whitespace-pre-line text-(--color-semantic-text-inverse)">
          {EDITORIAL_PANEL_COPY.headline}
        </p>
        <p className="text-(length:--font-size-body) text-(--color-semantic-text-muted)">
          {EDITORIAL_PANEL_COPY.body}
        </p>
      </div>
    </aside>
  );
}
