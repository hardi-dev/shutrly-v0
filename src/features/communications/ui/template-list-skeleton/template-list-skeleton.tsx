import { useTranslations } from "next-intl";

import { cn } from "@/ui/cn/cn";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { TEMPLATE_GROUP_MESSAGE_KEY } from "../template-copy/template-copy.copy";
import { TEMPLATE_LIST_SKELETON_COPY_NAMESPACE } from "./template-list-skeleton.copy";

const BAR = "rounded-(--radius-xs) bg-(--color-semantic-surface-muted)";

function SkeletonRows({ count }: Readonly<{ count: number }>) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        "flex items-center gap-(--component-list-card-item-gap) px-(--component-list-card-item-padding-x) py-(--space-3)",
        index < count - 1 && "border-b border-(--component-list-card-item-border)",
      )}
    >
      <span className={cn(BAR, "size-(--space-9) rounded-(--radius-md)")} />
      <span className="flex flex-1 flex-col gap-(--space-2)">
        <span className={cn(BAR, "h-(--space-3) w-36")} />
        <span className={cn(BAR, "h-(--space-2-5) w-52")} />
      </span>
    </div>
  ));
}

/**
 * Loading state of the template list (design v3 KxWLq / CDwax).
 * @returns the skeleton cards
 */
export function TemplateListSkeleton() {
  const t = useTranslations(TEMPLATE_LIST_SKELETON_COPY_NAMESPACE);
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6) md:gap-(--component-panel-app-content-gap)"
    >
      <span className="sr-only">{t("listLoading")}</span>
      <SectionCard
        title={t(TEMPLATE_GROUP_MESSAGE_KEY.GALLERY.title)}
        description={t(TEMPLATE_GROUP_MESSAGE_KEY.GALLERY.description)}
        content="flush"
      >
        <SkeletonRows count={3} />
      </SectionCard>
      <SectionCard
        title={t(TEMPLATE_GROUP_MESSAGE_KEY.INVOICE.title)}
        description={t(TEMPLATE_GROUP_MESSAGE_KEY.INVOICE.description)}
        content="flush"
      >
        <SkeletonRows count={2} />
      </SectionCard>
    </div>
  );
}
