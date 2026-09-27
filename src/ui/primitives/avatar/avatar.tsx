import { cn } from "@/ui/cn/cn";

import type { AvatarProps } from "./avatar.types";

const SIZE_CLASSES = {
  sm: "size-(--space-6) text-(length:--font-size-overline)",
  md: "size-(--space-8) text-(length:--font-size-caption)",
  lg: "size-(--space-10) text-(length:--font-size-label)",
} as const;

function getInitials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return (words[0] ?? "").slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/** Renders an initials-only avatar with a semantic accessible name when supplied.
 * @param props - initials source, size and accessibility properties
 * @returns the circular initials avatar
 */
export function Avatar({ size = "md", initials, className, ...props }: Readonly<AvatarProps>) {
  return (
    <span
      {...props}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-(--component-avatar-radius)",
        "bg-(--component-avatar-background) font-bold text-(--component-avatar-text)",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {getInitials(initials)}
    </span>
  );
}
