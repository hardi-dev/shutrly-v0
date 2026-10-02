import Link from "next/link";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { ListCardItemProps } from "./list-card-item.types";

export const LIST_CARD_ROW = [
  "flex items-center gap-(--component-list-card-item-gap)",
  "px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y)",
];

function ListCardBody({ icon, title, meta, trailing, href }: Readonly<ListCardItemProps>) {
  const linkIndicator = href ? (
    <Icon
      name="chevron-right"
      size="sm"
      aria-hidden="true"
      className="text-(--component-list-card-item-meta)"
    />
  ) : null;
  const rowActions =
    !href && trailing ? (
      <span className="flex shrink-0 items-center gap-(--space-2)">{trailing}</span>
    ) : null;

  return (
    <>
      <span className="flex size-(--space-9) shrink-0 items-center justify-center rounded-(--component-list-card-item-icon-radius) bg-(--component-list-card-item-icon-background) text-(--component-list-card-item-icon)">
        <Icon name={icon} size="md" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-(--component-list-card-item-text-gap)">
        <span className="truncate text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)">
          {title}
        </span>
        <span className="text-(length:--font-size-body-sm) text-(--component-list-card-item-meta)">
          {meta}
        </span>
      </span>
      {linkIndicator ?? rowActions}
    </>
  );
}

/**
 * Renders a two-line List Card row: icon, title, meta and a trailing slot, or a whole-row link
 * with a chevron (C42 Two-line).
 * @param props - row content, link and position
 * @returns the list item
 */
export function ListCardItem({
  icon,
  title,
  meta,
  trailing,
  href,
  isLast = false,
}: Readonly<ListCardItemProps>) {
  return (
    <li className={cn(!isLast && "border-b border-(--component-list-card-item-border)")}>
      {href ? (
        <Link
          href={href}
          className={cn(
            LIST_CARD_ROW,
            "outline-none focus-visible:bg-(--component-list-card-item-icon-background)",
          )}
        >
          <ListCardBody icon={icon} title={title} meta={meta} trailing={trailing} href={href} />
        </Link>
      ) : (
        <div className={cn(LIST_CARD_ROW)}>
          <ListCardBody icon={icon} title={title} meta={meta} trailing={trailing} />
        </div>
      )}
    </li>
  );
}
