"use client";

import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/ui/cn/cn";

import { ICON_REGISTRY } from "./icon.registry";
import type { IconProps } from "./icon.types";

const SIZE_CLASSES = {
  sm: "size-(--component-icon-size-sm)",
  md: "size-(--component-icon-size-md)",
  lg: "size-(--space-6)",
} as const;

/**
 * Renders a semantic Hugeicons Free icon with token-backed sizing.
 * @param props - semantic icon name, size and SVG presentation props
 * @returns the registered icon SVG
 */
export function Icon({ name, size = "md", className, ...props }: Readonly<IconProps>) {
  const isDecorative = !props["aria-label"];
  return (
    <HugeiconsIcon
      {...props}
      icon={ICON_REGISTRY[name]}
      aria-hidden={isDecorative ? true : undefined}
      className={cn("block shrink-0", SIZE_CLASSES[size], className)}
    />
  );
}
