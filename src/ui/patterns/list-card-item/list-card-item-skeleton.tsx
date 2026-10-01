import { cn } from "@/ui/cn/cn";

import { LIST_CARD_ROW } from "./list-card-item";
import type { ListCardItemSkeletonProps } from "./list-card-item.types";

/**
 * Renders a non-interactive loading placeholder for a List Card row (C42 Skeleton).
 * @param props - row position and trailing-slot visibility
 * @returns the hidden skeleton list item
 */
export function ListCardItemSkeleton({
  isLast = false,
  hasTrailing = false,
}: Readonly<ListCardItemSkeletonProps>) {
  return (
    <li
      aria-hidden="true"
      className={cn(!isLast && "border-b border-(--component-list-card-item-border)")}
    >
      <div className={cn(LIST_CARD_ROW)}>
        <span className="size-(--space-9) shrink-0 rounded-(--component-list-card-item-icon-radius) bg-(--component-list-card-item-skeleton)" />
        <span className="flex min-w-0 flex-1 flex-col gap-(--component-list-card-item-text-gap)">
          <span className="h-3 w-40 rounded-(--component-list-card-item-skeleton-radius) bg-(--component-list-card-item-skeleton)" />
          <span className="h-2.5 w-24 rounded-(--component-list-card-item-skeleton-radius) bg-(--component-list-card-item-skeleton)" />
        </span>
        {hasTrailing ? (
          <span className="h-5 w-14 shrink-0 rounded-(--component-list-card-item-skeleton-radius) bg-(--component-list-card-item-skeleton)" />
        ) : null}
      </div>
    </li>
  );
}
