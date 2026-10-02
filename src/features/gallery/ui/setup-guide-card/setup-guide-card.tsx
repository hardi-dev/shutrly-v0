import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Icon } from "@/ui/primitives/icon/icon";

import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import type { SetupGuideCardProps } from "./setup-guide-card.types";

export function SetupGuideCard({ isMobile }: Readonly<SetupGuideCardProps>) {
  return (
    <SectionCard
      title={SOURCE_COPY.guideTitle}
      description={isMobile ? SOURCE_COPY.guideDescriptionMobile : SOURCE_COPY.guideDescription}
    >
      <ol className="flex flex-col gap-(--space-4)">
        {SOURCE_COPY.steps.map((step, index) => (
          <li key={step} className="flex items-start gap-(--space-3)">
            <span className="flex size-(--space-6) shrink-0 items-center justify-center rounded-full bg-(--color-semantic-surface-muted) text-(--color-semantic-text-secondary) text-(length:--font-size-label) font-semibold">
              {index + 1}
            </span>
            <span className="pt-(--space-0-5) text-(length:--font-size-body-sm) text-(--color-semantic-text-primary)">
              {step}
            </span>
          </li>
        ))}
      </ol>
      <figure
        aria-label={SOURCE_COPY.folderTreeLabel}
        className="mt-(--space-5) flex flex-col gap-(--space-2) rounded-(--radius-md) bg-(--color-semantic-surface-sunken) p-(--space-4)"
      >
        <div className="flex items-center gap-(--space-2)">
          <Icon name="folder-open" size="sm" aria-hidden="true" />
          <span className="font-semibold">{SOURCE_COPY.treeRoot}</span>
        </div>
        <p className="pl-(--space-6) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {SOURCE_COPY.treeRootMeta}
        </p>
        <div className="flex items-center gap-(--space-2) pl-(--space-6)">
          <Icon name="folder" size="sm" aria-hidden="true" />
          <span className="text-(length:--font-size-body-sm)">{SOURCE_COPY.treeEdited}</span>
        </div>
        <div className="flex items-center gap-(--space-2) pl-(--space-6)">
          <Icon name="folder" size="sm" aria-hidden="true" />
          <span className="text-(length:--font-size-body-sm)">{SOURCE_COPY.treePrint}</span>
        </div>
      </figure>
      <Alert
        className="mt-(--space-5)"
        tone="warning"
        title={SOURCE_COPY.warningTitle}
        body={SOURCE_COPY.warningBody}
        live={false}
      />
    </SectionCard>
  );
}
