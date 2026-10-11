"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { CLIENTS_TABS_BAR_COPY_NAMESPACE } from "./clients-tabs-bar.copy";
import type { ClientsTabsBarProps } from "./clients-tabs-bar.types";

/** Renders the phone-only active/archive route selector. */
export function ClientsTabsBar({ workspaceId, status }: Readonly<ClientsTabsBarProps>) {
  const router = useRouter();
  const isMobile = useMobileViewport();
  const t = useTranslations(CLIENTS_TABS_BAR_COPY_NAMESPACE);
  if (!isMobile) return null;
  function handleChange(next: string): void {
    router.push(
      next === "ACTIVE" ? `/w/${workspaceId}/clients` : `/w/${workspaceId}/clients/archived`,
    );
  }
  return (
    <SegmentedControl
      label={t("tabsLabel")}
      options={[
        { id: "ACTIVE", label: t("active") },
        { id: "ARCHIVED", label: t("archived") },
      ]}
      selectedId={status}
      onChange={handleChange}
      isFullWidth
    />
  );
}
