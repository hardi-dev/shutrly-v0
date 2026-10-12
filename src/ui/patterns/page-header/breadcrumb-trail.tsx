"use client";

import Link from "next/link";
import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type {
  BreadcrumbTrailItemProps,
  BreadcrumbTrailProps,
  CrumbTextProps,
} from "./page-header.types";

const NAV =
  "flex min-w-0 items-center gap-(--component-page-header-breadcrumb-gap) text-(length:--font-size-body-sm) font-medium text-(--component-page-header-breadcrumb-text)";
const LINK =
  "truncate outline-none hover:text-(--component-page-header-breadcrumb-current) focus-visible:rounded-(--radius-xs) focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]";

function CrumbText({ label, isCurrent, fit, title }: Readonly<CrumbTextProps>) {
  return (
    <span
      aria-current={isCurrent ? "page" : undefined}
      title={title}
      className={cn(
        "truncate",
        fit,
        isCurrent && "font-semibold text-(--component-page-header-breadcrumb-current)",
      )}
    >
      {label}
    </span>
  );
}

function BreadcrumbTrailItem({
  item,
  isCurrent,
  showSeparator,
  isEdge,
}: Readonly<BreadcrumbTrailItemProps>) {
  // F-22 OQ-5: the root and the current page stay whole; the crumbs between them shrink with "…".
  const fit = isEdge ? "shrink-0" : "min-w-0";
  const title = isEdge ? undefined : item.label;
  let content;
  if (item.href && !isCurrent) {
    content = (
      <Link href={item.href} className={cn(LINK, fit)} title={title}>
        {item.label}
      </Link>
    );
  } else if (item.onPress && !isCurrent) {
    content = (
      <AriaButton
        onPress={item.onPress}
        className={cn(
          LINK,
          fit,
          "cursor-pointer data-focus-visible:rounded-(--radius-xs) data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
        )}
      >
        {item.label}
      </AriaButton>
    );
  } else {
    content = <CrumbText label={item.label} isCurrent={isCurrent} fit={fit} title={title} />;
  }
  return (
    <>
      {showSeparator ? (
        <Icon name="chevron-right" size="sm" aria-hidden="true" className="shrink-0" />
      ) : null}
      {content}
    </>
  );
}

/** The breadcrumb trail of the Page Header, reusable in page content (e.g. the folders of *Semua foto*); items link by `href` or act by `onPress`, the last one is current.
 * @param props - label, items, optional trailing text and class
 * @returns the breadcrumb navigation
 */
export function BreadcrumbTrail({
  label,
  items,
  trailing,
  className,
}: Readonly<BreadcrumbTrailProps>) {
  return (
    <nav aria-label={label} className={cn(NAV, className)}>
      {items.map((item, index) => (
        <BreadcrumbTrailItem
          key={`${item.label}-${String(index)}`}
          item={item}
          isCurrent={index === items.length - 1}
          showSeparator={index > 0}
          isEdge={index === 0 || index === items.length - 1}
        />
      ))}
      {trailing ? <span className="shrink-0 font-normal">{trailing}</span> : null}
    </nav>
  );
}
