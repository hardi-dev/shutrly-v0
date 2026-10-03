"use client";

import { useRouter } from "next/navigation";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { ClientsTabsBarProps } from "./clients-tabs-bar.types";

/** Renders the phone-only active/archive route selector. */
export function ClientsTabsBar({ workspaceId, status }: Readonly<ClientsTabsBarProps>) {
  const router = useRouter();
  const isMobile = useMobileViewport();
  if (!isMobile) return null;
  function handleChange(next: string): void {
    router.push(
      next === "ACTIVE" ? `/w/${workspaceId}/clients` : `/w/${workspaceId}/clients/archived`,
    );
  }
  return (
    <SegmentedControl
      label={CLIENT_COPY.tabsLabel}
      options={[
        { id: "ACTIVE", label: CLIENT_COPY.active },
        { id: "ARCHIVED", label: CLIENT_COPY.archived },
      ]}
      selectedId={status}
      onChange={handleChange}
      isFullWidth
    />
  );
}
