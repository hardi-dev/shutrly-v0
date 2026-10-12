"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BreadcrumbTrail } from "@/ui/patterns/page-header/breadcrumb-trail";
import { Input } from "@/ui/primitives/input/input";

import { BROWSE_TOOLBAR_COPY_NAMESPACE } from "./browse-toolbar.copy";
import type { BrowseToolbarProps, BrowseTrailProps } from "./browse-toolbar.types";

function BrowseTrail({ location, page, crumbs, onNavigate }: Readonly<BrowseTrailProps>) {
  const t = useTranslations(BROWSE_TOOLBAR_COPY_NAMESPACE);
  if (location.search !== "") {
    return (
      <p className="text-(length:--font-size-body-sm) font-medium text-(--component-page-header-breadcrumb-text)">
        {t("searchSummary", { count: page?.summary?.photoCount ?? 0, text: location.search })}
      </p>
    );
  }
  const summary = page?.summary;
  const items = crumbs.map((crumb) => {
    const target = crumb.target;
    return target === null
      ? { label: crumb.label }
      : {
          label: crumb.label,
          onPress: () => {
            onNavigate(target);
          },
        };
  });
  return (
    <BreadcrumbTrail
      label={t("breadcrumbLabel")}
      items={items}
      trailing={
        summary
          ? t("crumbFolders", { folders: summary.folderCount, photos: summary.photoCount })
          : undefined
      }
      className="flex-wrap"
    />
  );
}

/** *Semua foto*'s toolbar: the breadcrumb (or the search summary) and *Cari nama file*; phones put the search first (AC-GAL-028, 029). */
export function BrowseToolbar(props: Readonly<BrowseToolbarProps>) {
  const t = useTranslations(BROWSE_TOOLBAR_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const { searchText, onSearch } = props;
  const handleClear = () => {
    onSearch("");
  };
  const search = (
    <div className="w-full md:w-[280px]">
      <Input
        variant="search"
        aria-label={t("searchLabel")}
        placeholder={t("searchLabel")}
        iconLeading="search"
        iconTrailing={searchText ? "x" : undefined}
        iconTrailingAction={
          searchText ? { label: t("clearSearch"), onPress: handleClear } : undefined
        }
        value={searchText}
        onChange={onSearch}
      />
    </div>
  );
  return (
    <div className="flex flex-col gap-(--space-3) md:flex-row md:items-center md:justify-between">
      {isMobile ? search : null}
      <BrowseTrail
        location={props.location}
        page={props.page}
        crumbs={props.crumbs}
        onNavigate={props.onNavigate}
      />
      {isMobile ? null : search}
    </div>
  );
}
