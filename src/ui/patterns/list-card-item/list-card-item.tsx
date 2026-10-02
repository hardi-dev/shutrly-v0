import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { ListCardItemProps } from "./list-card-item.types";

export const LIST_CARD_ROW = [
  "flex items-center gap-(--component-list-card-item-gap)",
  "px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y)",
];

function ListCardBody({ icon, title, meta, trailing, href }: Readonly<ListCardItemProps>) {
  const linkIndicator =
    href && !trailing ? (
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

function LinkedListCardRow({
  href,
  title,
  body,
  trailing,
}: Readonly<{ href: string; title: string; body: ReactNode; trailing: ReactNode }>) {
  return (
    <div className={cn(LIST_CARD_ROW, "relative")}>
      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0 z-0 outline-none focus-visible:bg-(--component-list-card-item-icon-background)"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none relative z-0 flex min-w-0 flex-1 items-center gap-(--component-list-card-item-gap)"
      >
        {body}
      </span>
      <span className="relative z-10 flex shrink-0 items-center gap-(--space-2)">{trailing}</span>
    </div>
  );
}

/**
 * Renders a two-line List Card row: icon, title, meta and a trailing slot, or a whole-row link
 * with an optional chevron (C42 Two-line).
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
  const body = (
    <ListCardBody icon={icon} title={title} meta={meta} trailing={trailing} href={href} />
  );

  if (href && trailing) {
    return (
      <li className={cn(!isLast && "border-b border-(--component-list-card-item-border)")}>
        <LinkedListCardRow href={href} title={title} body={body} trailing={trailing} />
      </li>
    );
  }

  if (href) {
    return (
      <li className={cn(!isLast && "border-b border-(--component-list-card-item-border)")}>
        <Link
          href={href}
          className={cn(
            LIST_CARD_ROW,
            "outline-none focus-visible:bg-(--component-list-card-item-icon-background)",
          )}
        >
          {body}
        </Link>
      </li>
    );
  }

  return (
    <li className={cn(!isLast && "border-b border-(--component-list-card-item-border)")}>
      <div className={cn(LIST_CARD_ROW)}>{body}</div>
    </li>
  );
}
