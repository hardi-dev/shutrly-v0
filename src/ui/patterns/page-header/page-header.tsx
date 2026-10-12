import { useTranslations } from "next-intl";

import { cn } from "@/ui/cn/cn";

import { Tabs } from "../tabs/tabs";
import { BreadcrumbTrail } from "./breadcrumb-trail";
import { PAGE_HEADER_COPY_NAMESPACE } from "./page-header.copy";
import type {
  BreadcrumbRowProps,
  HeaderTabsProps,
  HeaderTitleProps,
  PageHeaderProps,
  PageHeaderTrailProps,
} from "./page-header.types";

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
  trail,
  leading,
  tabs,
  isFlush = false,
}: Readonly<PageHeaderProps>) {
  const breadcrumbItems = breadcrumbs ?? [{ label: parent }, { label: current }];
  const breadcrumbTrail = trail ?? <PageHeaderBreadcrumb items={breadcrumbItems} />;

  return (
    <header
      className={cn(
        "shrink-0 bg-(--component-page-header-background)",
        !isFlush && "border-b border-(--component-page-header-border)",
      )}
    >
      <BreadcrumbRow
        trail={breadcrumbTrail}
        utilities={utilities}
        leading={leading}
        isFlush={isFlush}
      />
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
      {tabs ? <HeaderTabs tabs={tabs} isFlush={isFlush} /> : null}
    </header>
  );
}

/** The client-side Page Header trail, labelled by the page-header translation. @param props - the crumbs; the last one is current @returns the trail */
function PageHeaderBreadcrumb({ items }: Readonly<Pick<PageHeaderTrailProps, "items">>) {
  const t = useTranslations(PAGE_HEADER_COPY_NAMESPACE);
  return <PageHeaderTrail items={items} label={t("breadcrumb")} />;
}

/** The Page Header breadcrumb, also rendered on the server by the Owner `@crumbs` slot (ADR-026). The label comes from the caller, so the server slot can pass its own translation. @param props - the crumbs and the trail label; the last one is current @returns the trail */
export function PageHeaderTrail({ items, label }: Readonly<PageHeaderTrailProps>) {
  return <BreadcrumbTrail label={label} items={items} className="min-h-(--space-10) flex-1" />;
}

// F-23: the sidebar toggle's 8 px inner padding puts its icon on the title's edge, so the leading row starts 8 px left of it (space-8, not space-10).
function BreadcrumbRow({ trail, utilities, leading, isFlush }: Readonly<BreadcrumbRowProps>) {
  const paddingLeft = leading
    ? "pl-(--space-8)"
    : "pl-(--component-page-header-breadcrumb-padding-x)";
  return (
    <div
      className={cn(
        "flex items-center gap-(--component-page-header-breadcrumb-gap) border-b border-(--component-page-header-border) py-(--space-1-5)",
        isFlush ? "px-0" : cn("pr-(--space-7)", paddingLeft),
      )}
    >
      {leading ? (
        <div className="flex w-(--space-8) shrink-0 items-center justify-center">{leading}</div>
      ) : null}
      {trail}
      {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
    </div>
  );
}

function HeaderTabs({ tabs, isFlush }: Readonly<HeaderTabsProps>) {
  return (
    <div className={isFlush ? "px-0" : "px-(--component-page-header-tabs-padding-x)"}>
      <Tabs label={tabs.label} tabs={tabs.tabs} hasTrack={false} />
    </div>
  );
}

function HeaderTitle({ title, adornment }: Readonly<HeaderTitleProps>) {
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
