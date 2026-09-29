"use client";

import { Button } from "react-aria-components";

import { Icon } from "@/ui/primitives/icon/icon";

import type { WorkspacePillProps } from "./workspace-pill.types";

/** Renders the compact workspace switcher trigger used by the phone header. */
export function WorkspacePill({ name, onPress }: Readonly<WorkspacePillProps>) {
  return (
    <Button
      type="button"
      aria-haspopup="dialog"
      onPress={onPress}
      className="flex items-center gap-(--space-2) rounded-(--component-sidebar-workspace-radius) border border-(--component-sidebar-workspace-border) bg-(--component-sidebar-workspace-background) px-(--space-3) py-(--space-2) text-(length:--font-size-body) font-medium text-(--color-semantic-text-primary) outline-none data-hovered:bg-(--color-semantic-surface-sunken) data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
    >
      <span className="max-w-[160px] truncate">{name}</span>
      <Icon
        name="chevrons-up-down"
        size="sm"
        aria-hidden="true"
        className="text-(--color-semantic-text-muted)"
      />
    </Button>
  );
}
