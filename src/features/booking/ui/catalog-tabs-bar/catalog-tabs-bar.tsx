"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { CATALOG_TABS_BAR_COPY_NAMESPACE } from "./catalog-tabs-bar.copy";
import type { CatalogTabsBarProps } from "./catalog-tabs-bar.types";

export function CatalogTabsBar({ workspaceId, activeTab, action }: Readonly<CatalogTabsBarProps>) {
  const router = useRouter();
  const isMobile = useMobileViewport();
  const t = useTranslations(CATALOG_TABS_BAR_COPY_NAMESPACE);
  if (!isMobile) return null;

  const options = [
    { id: "services", label: t("tabServices") },
    { id: "categories", label: t("tabCategories") },
    { id: "items", label: t("tabItems") },
  ] as const;

  function handleChange(id: string): void {
    const suffix = id === "services" ? "" : `/${id}`;
    router.push(`/w/${workspaceId}/services${suffix}`);
  }

  const tabs = (
    <SegmentedControl
      label={t("tabsLabel")}
      options={options}
      selectedId={activeTab}
      onChange={handleChange}
      isFullWidth
    />
  );
  if (!action) return tabs;
  return (
    <div className="flex w-full flex-col gap-(--space-4)">
      {tabs}
      <div className="w-full [&>button]:w-full">{action}</div>
    </div>
  );
}
