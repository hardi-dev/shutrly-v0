import { useTranslations } from "next-intl";

import { cn } from "@/ui/cn/cn";

import { PROJECT_DETAIL_SCREEN_COPY_NAMESPACE } from "./project-detail-screen.copy";
import type { ProjectFact } from "./project-facts.types";

/** A label/value list for the Info and Field booking cards; an empty value shows a muted dash. */
export function ProjectFacts({ facts }: Readonly<{ facts: readonly ProjectFact[] }>) {
  const t = useTranslations(PROJECT_DETAIL_SCREEN_COPY_NAMESPACE);
  return (
    <dl className="flex flex-col gap-(--space-4) px-(--space-6) py-(--space-6)">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col gap-(--space-1)">
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {fact.label}
          </dt>
          <dd
            className={cn(
              "text-(length:--font-size-body) font-semibold whitespace-pre-line",
              fact.value === null && "text-(--component-input-placeholder)",
            )}
          >
            {fact.value ?? t("emptyValue")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
