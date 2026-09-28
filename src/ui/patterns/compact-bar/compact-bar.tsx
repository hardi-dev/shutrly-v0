import Link from "next/link";

import { Icon } from "@/ui/primitives/icon/icon";

import { COMPACT_BAR_COPY } from "./compact-bar.copy";
import type { CompactBarProps } from "./compact-bar.types";

/** Renders the mobile sub-page back link, title and optional actions. */
export function CompactBar({ title, parent, actions }: Readonly<CompactBarProps>) {
  return (
    <header className="flex items-center gap-(--space-3) border-b border-(--color-semantic-border-subtle) px-(--space-4) py-(--space-3)">
      <Link
        href={parent.href}
        aria-label={COMPACT_BAR_COPY.back}
        className="flex size-(--space-10) items-center justify-center"
      >
        <Icon name="arrow-right" aria-hidden="true" className="rotate-180" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-(length:--font-size-heading) font-bold">{title}</h1>
        <p className="text-(--color-semantic-text-secondary)">{parent.label}</p>
      </div>
      {actions}
    </header>
  );
}
