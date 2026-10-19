import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

/** The heading of a detail page, rendered on the server by the Owner `@heading` slot. */
export interface OwnerPageHeadingProps {
  title: string;
  /** Shown under the title on desktop when there is no meta line. */
  subtitle?: string;
  /** One line under the title on desktop (detail pages). */
  meta?: string;
  /** Shown as a Status Chip after the title on desktop. */
  status?: Pick<StatusChipProps, "label" | "tone" | "hasDot">;
  /** The back link target and its caption on phones. */
  parent: { label: string; href: string };
  /** The phone back link's accessible name, from the compact bar copy. */
  backLabel: string;
}
