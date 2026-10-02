import Link from "next/link";

import { cn } from "@/ui/cn/cn";

import type { TabsProps } from "./tabs.types";

/** Renders route-backed underline tabs with an accessible current-page marker.
 * @param props - navigation label, tab links and track preference
 * @returns the tab navigation
 */
export function Tabs({ label, tabs, hasTrack = true }: Readonly<TabsProps>) {
  return (
    <nav aria-label={label} className={cn(hasTrack && "border-b border-(--component-tabs-track)")}>
      <ul className="flex gap-(--component-tabs-gap)">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.isActive ? "page" : undefined}
              className={cn(
                "block rounded-(--component-tabs-item-radius) py-(--component-tabs-item-padding-y)",
                "text-(--component-tabs-item-text) text-(length:--font-size-body) font-medium",
                "hover:text-(--component-tabs-item-text-hover)",
                "focus-visible:outline-2 focus-visible:outline-(--component-tabs-item-focus)",
                tab.isActive &&
                  "border-b-2 border-(--component-tabs-item-indicator) font-bold text-(--component-tabs-item-text-active)",
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
