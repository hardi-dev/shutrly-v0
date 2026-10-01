import { cn } from "@/ui/cn/cn";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { TEMPLATE_GROUP_COPY } from "../template-copy/template-copy.copy";
import { TEMPLATE_LIST_SKELETON_COPY as COPY } from "./template-list-skeleton.copy";

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
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6) md:gap-(--component-panel-app-content-gap)"
    >
      <span className="sr-only">{COPY.loading}</span>
      <SectionCard
        title={TEMPLATE_GROUP_COPY.GALLERY.title}
        description={TEMPLATE_GROUP_COPY.GALLERY.description}
        content="flush"
      >
        <SkeletonRows count={3} />
      </SectionCard>
      <SectionCard
        title={TEMPLATE_GROUP_COPY.INVOICE.title}
        description={TEMPLATE_GROUP_COPY.INVOICE.description}
        content="flush"
      >
        <SkeletonRows count={2} />
      </SectionCard>
    </div>
  );
}
