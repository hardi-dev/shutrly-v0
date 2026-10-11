import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Icon } from "@/ui/primitives/icon/icon";

import { SOURCE_GUIDE_STEP_KEYS } from "../source-copy/source-copy.copy";
import { SETUP_GUIDE_CARD_COPY_NAMESPACE } from "./setup-guide-card.copy";
import type { SetupGuideCardProps } from "./setup-guide-card.types";

export function SetupGuideCard({ isMobile }: Readonly<SetupGuideCardProps>) {
  const t = useTranslations(SETUP_GUIDE_CARD_COPY_NAMESPACE);
  return (
    <SectionCard
      title={t("guideTitle")}
      description={isMobile ? t("guideDescriptionMobile") : t("guideDescription")}
    >
      <ol className="flex flex-col gap-(--space-4)">
        {SOURCE_GUIDE_STEP_KEYS.map((stepKey, index) => (
          <li key={stepKey} className="flex items-start gap-(--space-3)">
            <span className="flex size-(--space-6) shrink-0 items-center justify-center rounded-full bg-(--color-semantic-surface-muted) text-(--color-semantic-text-secondary) text-(length:--font-size-label) font-semibold">
              {index + 1}
            </span>
            <span className="pt-(--space-0-5) text-(length:--font-size-body-sm) text-(--color-semantic-text-primary)">
              {t(stepKey)}
            </span>
          </li>
        ))}
      </ol>
      <figure
        aria-label={t("folderTreeLabel")}
        className="mt-(--space-5) flex flex-col gap-(--space-2) rounded-(--radius-md) bg-(--color-semantic-surface-sunken) p-(--space-4)"
      >
        <div className="flex items-center gap-(--space-2)">
          <Icon name="folder-open" size="sm" aria-hidden="true" />
          <span className="font-semibold">{t("treeRoot")}</span>
        </div>
        <p className="pl-(--space-6) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {t("treeRootMeta")}
        </p>
        <div className="flex items-center gap-(--space-2) pl-(--space-6)">
          <Icon name="folder" size="sm" aria-hidden="true" />
          <span className="text-(length:--font-size-body-sm)">{t("treeEdited")}</span>
        </div>
        <div className="flex items-center gap-(--space-2) pl-(--space-6)">
          <Icon name="folder" size="sm" aria-hidden="true" />
          <span className="text-(length:--font-size-body-sm)">{t("treePrint")}</span>
        </div>
      </figure>
      <Alert
        className="mt-(--space-5)"
        tone="warning"
        title={t("warningTitle")}
        body={t("warningBody")}
        live={false}
      />
    </SectionCard>
  );
}
