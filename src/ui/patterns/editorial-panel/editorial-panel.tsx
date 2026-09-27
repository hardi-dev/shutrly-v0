import Image from "next/image";
import type { PropsWithChildren } from "react";

import { EDITORIAL_PANEL_COPY } from "./editorial-panel.copy";

const MOSAIC_SRC = "/auth/editorial/mosaic.webp";

/** The decorative desktop editorial panel shared by auth layouts. */
export function EditorialPanel({ children }: Readonly<PropsWithChildren>) {
  return (
    <aside
      aria-hidden="true"
      className="relative h-full min-h-dvh overflow-hidden bg-(--color-semantic-surface-inverse)"
    >
      <Image src={MOSAIC_SRC} alt="" fill sizes="100vw" unoptimized className="object-cover" />
      <div className="absolute inset-x-(--space-16) bottom-(--space-16) flex flex-col gap-(--space-4)">
        <p className="text-(length:--font-size-hero) leading-(--font-line-height-tight) font-bold whitespace-pre-line text-(--color-semantic-text-inverse)">
          {children}
        </p>
        <p className="text-(length:--font-size-body) text-(--color-semantic-text-muted)">
          {EDITORIAL_PANEL_COPY.body}
        </p>
      </div>
    </aside>
  );
}
