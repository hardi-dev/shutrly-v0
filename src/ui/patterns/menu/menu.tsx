"use client";

import { Menu as AriaMenu } from "react-aria-components";

import type { MenuProps } from "./menu.types";

/** Renders the token-backed floating menu panel (C10). */
export function Menu({
  children,
  "aria-label": ariaLabel,
  variant = "default",
  footer,
}: Readonly<MenuProps>) {
  return (
    <AriaMenu
      aria-label={ariaLabel}
      className={[
        "rounded-(--component-menu-radius)",
        "border border-(--component-menu-border) bg-(--component-menu-background)",
        variant === "list" ? "py-(--component-menu-padding)" : "p-(--component-menu-padding)",
        "shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]",
        "outline-none",
      ].join(" ")}
    >
      {children}
      {footer ? (
        <div className="border-t border-(--component-menu-divider) p-(--component-menu-padding)">
          {footer}
        </div>
      ) : null}
    </AriaMenu>
  );
}
