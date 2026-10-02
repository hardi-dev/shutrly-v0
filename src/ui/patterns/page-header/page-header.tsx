import { Icon } from "@/ui/primitives/icon/icon";

import { Tabs } from "../tabs/tabs";
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
  tabs,
}: Readonly<PageHeaderProps>) {
  return (
    <header className="shrink-0 border-b border-(--component-page-header-border) bg-(--component-page-header-background)">
      <div className="flex items-center gap-(--component-page-header-breadcrumb-gap) border-b border-(--component-page-header-border) py-(--space-1-5) pr-(--space-7) pl-(--component-page-header-breadcrumb-padding-x)">
        <nav
          aria-label={PAGE_HEADER_COPY.breadcrumb}
          className="flex min-h-(--space-10) min-w-0 flex-1 items-center gap-(--component-page-header-breadcrumb-gap) text-(length:--font-size-body-sm) font-medium text-(--component-page-header-breadcrumb-text)"
        >
          <span className="truncate">{parent}</span>
          <Icon name="chevron-right" size="sm" aria-hidden="true" className="shrink-0" />
          <span
            aria-current="page"
            className="truncate font-semibold text-(--component-page-header-breadcrumb-current)"
          >
            {current}
          </span>
        </nav>
        {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
      </div>
      <div className="flex items-center justify-between gap-(--component-page-header-hero-gap) px-(--component-page-header-hero-padding-x) pb-(--component-page-header-hero-padding-bottom) pt-(--component-page-header-hero-padding-top)">
        <div className="flex min-w-0 flex-1 flex-col gap-(--space-1-5)">
          <h1 className="text-(length:--font-size-display) font-bold tracking-(--font-letter-spacing-display) text-(--component-page-header-title)">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-(length:--font-size-body) text-(--component-page-header-subtitle)">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-(--space-2)">{action}</div> : null}
      </div>
      {tabs ? (
        <div className="px-(--component-page-header-tabs-padding-x)">
          <Tabs label={tabs.label} tabs={tabs.tabs} hasTrack={false} />
        </div>
      ) : null}
    </header>
  );
}
