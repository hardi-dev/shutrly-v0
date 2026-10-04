"use client";

import Link from "next/link";
import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { TabItemProps, TabsProps } from "./tabs.types";

const TAB = [
  "block rounded-none py-(--component-tabs-item-padding-y)",
  "text-(--component-tabs-item-text) text-(length:--font-size-body) font-medium",
  "hover:text-(--component-tabs-item-text-hover)",
  "outline-none focus-visible:outline-2 focus-visible:outline-(--component-tabs-item-focus)",
];
const ACTIVE =
  "border-b-2 border-(--component-tabs-item-indicator) font-bold text-(--component-tabs-item-text-active)";

function TabItem({ tab }: Readonly<TabItemProps>) {
  const className = cn(TAB, tab.isActive && ACTIVE);
  const current = tab.isActive ? "page" : undefined;
  if (tab.href !== undefined) {
    return (
      <Link href={tab.href} aria-current={current} className={className}>
        {tab.label}
      </Link>
    );
  }
  return (
    <AriaButton
      onPress={tab.onPress}
      aria-current={tab.isActive ? "true" : undefined}
      className={cn(
        className,
        "cursor-pointer data-focus-visible:outline-2 data-focus-visible:outline-(--component-tabs-item-focus)",
      )}
    >
      {tab.label}
    </AriaButton>
  );
}

/** Renders underline tabs: route links, or buttons for in-page state, with an accessible current marker.
 * @param props - navigation label, tabs and track preference
 * @returns the tab navigation
 */
export function Tabs({ label, tabs, hasTrack = true }: Readonly<TabsProps>) {
  return (
    <nav aria-label={label} className={cn(hasTrack && "border-b border-(--component-tabs-track)")}>
      <ul className="flex gap-(--component-tabs-gap)">
        {tabs.map((tab) => (
          <li key={tab.href ?? tab.label}>
            <TabItem tab={tab} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
