"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import { BOTTOM_NAV_COPY } from "./bottom-nav.copy";
import type { BottomNavProps } from "./bottom-nav.types";
import { BottomNavItem } from "./bottom-nav-item";

/** Renders the four-destination mobile navigation and create CTA (C34). */
export function BottomNav({ items, ctaLabel, onCtaPress, className }: Readonly<BottomNavProps>) {
  return (
    <nav
      aria-label={BOTTOM_NAV_COPY.navLabel}
      className={cn(
        "flex items-end justify-between border-t border-(--component-bottom-nav-border)",
        "bg-(--component-bottom-nav-background) px-(--component-bottom-nav-padding-x)",
        "pt-(--component-bottom-nav-padding-top)",
        "pb-[calc(var(--component-bottom-nav-padding-bottom)+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {items.slice(0, 2).map((item) => (
        <BottomNavItem key={item.href} {...item} />
      ))}
      <AriaButton
        aria-label={ctaLabel}
        onPress={onCtaPress}
        className={cn(
          "flex size-(--component-bottom-nav-cta-size) shrink-0 items-center justify-center rounded-full",
          "bg-(--component-bottom-nav-cta-background) text-(--component-bottom-nav-cta-icon)",
          "ring-(--space-1) ring-(--component-bottom-nav-cta-ring) outline-none",
          "focus-visible:shadow-[0_0_0_0_var(--component-bottom-nav-cta-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
        )}
      >
        <Icon name="plus" aria-hidden="true" />
      </AriaButton>
      {items.slice(2).map((item) => (
        <BottomNavItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
