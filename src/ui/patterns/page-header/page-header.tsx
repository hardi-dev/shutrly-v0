import { cn } from "@/ui/cn/cn";

import { Tabs } from "../tabs/tabs";
import { BreadcrumbTrail } from "./breadcrumb-trail";
import { PAGE_HEADER_COPY } from "./page-header.copy";
import type { BreadcrumbItem, PageHeaderProps } from "./page-header.types";

/** Renders the breadcrumb, utility actions and hero title for an app page. */
export function PageHeader({
  parent,
  current,
  title,
  breadcrumbs,
  subtitle,
  titleAdornment,
  meta,
  action,
  utilities,
  tabs,
  isFlush = false,
}: Readonly<PageHeaderProps>) {
  const breadcrumbItems = breadcrumbs ?? [{ label: parent }, { label: current }];

  return (
    <header
      className={cn(
        "shrink-0 bg-(--component-page-header-background)",
        !isFlush && "border-b border-(--component-page-header-border)",
      )}
    >
      <BreadcrumbRow items={breadcrumbItems} utilities={utilities} isFlush={isFlush} />
      <div
        className={cn(
          "flex items-center justify-between gap-(--component-page-header-hero-gap) pb-(--component-page-header-hero-padding-bottom) pt-(--component-page-header-hero-padding-top)",
          isFlush ? "px-0" : "px-(--component-page-header-hero-padding-x)",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-(--space-1-5)">
          <HeaderTitle title={title} adornment={titleAdornment} />
          {(meta ?? subtitle) ? (
            <p className="text-(length:--font-size-body) text-(--component-page-header-subtitle)">
              {meta ?? subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-(--space-2)">{action}</div> : null}
      </div>
      {tabs ? (
        <div className={isFlush ? "px-0" : "px-(--component-page-header-tabs-padding-x)"}>
          <Tabs label={tabs.label} tabs={tabs.tabs} hasTrack={false} />
        </div>
      ) : null}
    </header>
  );
}

function BreadcrumbRow({
  items,
  utilities,
  isFlush,
}: Readonly<{
  items: readonly BreadcrumbItem[];
  utilities: PageHeaderProps["utilities"];
  isFlush: boolean;
}>) {
  return (
    <div
      className={cn(
        "flex items-center gap-(--component-page-header-breadcrumb-gap) border-b border-(--component-page-header-border) py-(--space-1-5)",
        isFlush ? "px-0" : "pr-(--space-7) pl-(--component-page-header-breadcrumb-padding-x)",
      )}
    >
      <BreadcrumbTrail
        label={PAGE_HEADER_COPY.breadcrumb}
        items={items}
        className="min-h-(--space-10) flex-1"
      />
      {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
    </div>
  );
}

function HeaderTitle({
  title,
  adornment,
}: Readonly<{ title: string; adornment: PageHeaderProps["titleAdornment"] }>) {
  const heading = (
    <h1 className="text-(length:--font-size-display) font-bold tracking-(--font-letter-spacing-display) text-(--component-page-header-title)">
      {title}
    </h1>
  );
  if (!adornment) return heading;
  return (
    <div className="flex min-w-0 items-center gap-(--space-3)">
      {heading}
      {adornment}
    </div>
  );
}
