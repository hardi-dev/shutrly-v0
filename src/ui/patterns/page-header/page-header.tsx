import { Tabs } from "../tabs/tabs";
import { BreadcrumbTrail } from "./breadcrumb-trail";
import { PAGE_HEADER_COPY } from "./page-header.copy";
import type { PageHeaderProps } from "./page-header.types";

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
}: Readonly<PageHeaderProps>) {
  const breadcrumbItems = breadcrumbs ?? [{ label: parent }, { label: current }];

  return (
    <header className="shrink-0 border-b border-(--component-page-header-border) bg-(--component-page-header-background)">
      <div className="flex items-center gap-(--component-page-header-breadcrumb-gap) border-b border-(--component-page-header-border) py-(--space-1-5) pr-(--space-7) pl-(--component-page-header-breadcrumb-padding-x)">
        <BreadcrumbTrail
          label={PAGE_HEADER_COPY.breadcrumb}
          items={breadcrumbItems}
          className="min-h-(--space-10) flex-1"
        />
        {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
      </div>
      <div className="flex items-center justify-between gap-(--component-page-header-hero-gap) px-(--component-page-header-hero-padding-x) pb-(--component-page-header-hero-padding-bottom) pt-(--component-page-header-hero-padding-top)">
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
        <div className="px-(--component-page-header-tabs-padding-x)">
          <Tabs label={tabs.label} tabs={tabs.tabs} hasTrack={false} />
        </div>
      ) : null}
    </header>
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
