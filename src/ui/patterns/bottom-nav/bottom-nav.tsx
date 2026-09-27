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
        "border-t border-(--component-bottom-nav-border)",
        "bg-(--component-bottom-nav-background)",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full items-start justify-between px-(--component-bottom-nav-padding-x)",
          "pt-(--component-bottom-nav-padding-top)",
          "pb-(--component-bottom-nav-padding-bottom)",
        )}
      >
        {items.slice(0, 2).map((item) => (
          <BottomNavItem key={item.href} {...item} />
        ))}
        <div
          data-testid="bottom-nav-cta-slot"
          className="relative flex h-(--space-12) w-(--space-16) shrink-0 items-start justify-center"
        >
          <AriaButton
            aria-label={ctaLabel}
            onPress={onCtaPress}
            className={cn(
              "absolute -top-(--space-8) flex size-(--component-bottom-nav-cta-size) items-center justify-center rounded-full",
              "bg-(--component-bottom-nav-cta-background) text-(--component-bottom-nav-cta-icon)",
              "outline-4 outline-(--component-bottom-nav-cta-ring)",
              "shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]",
              "focus-visible:shadow-[0_0_0_0_var(--component-bottom-nav-cta-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
            )}
          >
            <Icon name="plus" aria-hidden="true" className="size-(--space-6)" />
          </AriaButton>
        </div>
        {items.slice(2).map((item) => (
          <BottomNavItem key={item.href} {...item} />
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] w-full" aria-hidden="true" />
    </nav>
  );
}
