"use client";

import { useRouter } from "next/navigation";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { CatalogTabsBarProps } from "./catalog-tabs-bar.types";

export function CatalogTabsBar({ workspaceId, activeTab, action }: Readonly<CatalogTabsBarProps>) {
  const router = useRouter();
  const isMobile = useMobileViewport();
  if (!isMobile) return null;

  const options = [
    { id: "services", label: "Layanan" },
    { id: "categories", label: "Kategori" },
    { id: "items", label: "Item paket" },
  ] as const;

  function handleChange(id: string): void {
    const suffix = id === "services" ? "" : `/${id}`;
    router.push(`/w/${workspaceId}/services${suffix}`);
  }

  const tabs = (
    <SegmentedControl
      label={CATALOG_COPY.tabsLabel}
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
