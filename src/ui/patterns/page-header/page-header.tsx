import { cn } from "@/ui/cn/cn";

import { PAGE_HEADER_COPY } from "./page-header.copy";
import type { PageHeaderProps } from "./page-header.types";

/** Renders the breadcrumb, utility actions and hero title for an app page. */
export function PageHeader({
  parent,
  current,
  title,
  subtitle,
  action,
  utilities,
}: Readonly<PageHeaderProps>) {
  return (
    <header className="border-b border-(--component-page-header-border) bg-(--component-page-header-background)">
      <div className="flex items-center gap-(--component-page-header-breadcrumb-gap) px-(--component-page-header-breadcrumb-padding-x) py-(--space-3)">
        <nav
          aria-label={PAGE_HEADER_COPY.breadcrumb}
          className="flex min-w-0 flex-1 items-center gap-(--component-page-header-breadcrumb-gap) text-(--component-page-header-breadcrumb-text)"
        >
          <span>{parent}</span>
          <span aria-hidden="true">{PAGE_HEADER_COPY.separator}</span>
          <span aria-current="page" className="text-(--component-page-header-breadcrumb-current)">
            {current}
          </span>
        </nav>
        {utilities ? <div className="flex items-center gap-(--space-2)">{utilities}</div> : null}
      </div>
      <div className="flex items-end justify-between gap-(--component-page-header-hero-gap) px-(--component-page-header-hero-padding-x) pb-(--component-page-header-hero-padding-bottom) pt-(--component-page-header-hero-padding-top)">
        <div className="min-w-0">
          <h1 className="text-(--component-page-header-title) text-(length:--font-size-heading) font-bold">
            {title}
          </h1>
          {subtitle ? <p className="text-(--component-page-header-subtitle)">{subtitle}</p> : null}
        </div>
        {action ? <div className={cn("shrink-0")}>{action}</div> : null}
      </div>
    </header>
  );
}
