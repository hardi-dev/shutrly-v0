import { cn } from "@/ui/cn/cn";

import type { GalleryFactsProps } from "./gallery-facts.types";

/** Label/value facts in one row on desktop, stacked on phones (Galeri card, *Akses klien*). */
export function GalleryFacts({ facts, isFlush = false }: Readonly<GalleryFactsProps>) {
  return (
    <dl
      className={cn(
        "flex flex-col gap-(--space-4) md:flex-row md:flex-wrap md:gap-(--space-8)",
        !isFlush && "p-(--space-4) md:p-(--space-6)",
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col gap-(--space-1)">
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {fact.label}
          </dt>
          <dd
            className={cn(
              "flex items-center gap-(--space-1) text-(length:--font-size-body)",
              fact.isMuted ? "text-(--component-input-placeholder)" : "font-semibold",
            )}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
