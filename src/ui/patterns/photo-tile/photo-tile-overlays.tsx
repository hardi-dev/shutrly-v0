"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type {
  PhotoTileNoteButtonProps,
  SelectIndicatorProps,
  TileBadgeProps,
} from "./photo-tile.types";

const INSET = "var(--component-photo-tile-badge-inset)";

/** The round select control in the image's top-right corner (Pick Tile j1xyVG). @param selection - the selection state @returns the indicator */
export function SelectIndicator({ selection }: Readonly<SelectIndicatorProps>) {
  const { isSelected, isDisabled } = selection;
  return (
    <span
      aria-hidden="true"
      style={{ top: INSET, right: INSET }}
      className={cn(
        "absolute flex size-(--space-8) items-center justify-center rounded-(--radius-full) border-2",
        isSelected
          ? "border-(--color-semantic-action-primary) bg-(--color-semantic-action-primary) text-(--color-semantic-action-on-primary)"
          : "border-(--color-semantic-border-control) bg-(--color-semantic-surface-panel)",
        isDisabled && !isSelected && "opacity-(--opacity-disabled)",
      )}
    >
      {isSelected ? <Icon name="check" size="md" /> : null}
    </span>
  );
}

/** The quantity or other-group chip in the image's bottom-left corner (Pick Tile, A-25). @param badge - label and tone @returns the chip */
export function TileBadge({ badge }: Readonly<TileBadgeProps>) {
  return (
    <span
      style={{ bottom: INSET, left: INSET, maxWidth: `calc(100% - 2 * ${INSET})` }}
      className={cn(
        "absolute truncate rounded-(--radius-full) px-(--space-2) py-(--space-0-5) text-(length:--font-size-caption) font-semibold",
        badge.tone === "info"
          ? "bg-(--color-semantic-status-info-bg) text-(--color-semantic-status-info-fg)"
          : "bg-(--color-semantic-surface-panel) text-(--color-semantic-text-secondary)",
      )}
    >
      {badge.label}
    </span>
  );
}

/** The *Catatan* button over a picked photo: ＋ when empty, a note icon when filled (A-32). @param props - the note state and handler @returns the button */
export function NoteButton({ note }: Readonly<PhotoTileNoteButtonProps>) {
  return (
    <AriaButton
      aria-label={note.accessibleLabel}
      onPress={note.onPress}
      style={{ top: INSET, left: INSET }}
      className="absolute flex h-(--space-7) items-center gap-(--space-1) rounded-(--radius-full) bg-(--color-semantic-surface-on-media) px-(--space-2) text-(length:--font-size-caption) font-medium text-(--color-semantic-text-primary) outline-none data-focus-visible:outline-2 data-focus-visible:outline-(--color-semantic-focus-ring)"
    >
      <Icon name={note.hasNote ? "message-square-text" : "plus"} size="sm" aria-hidden="true" />
      {note.label}
    </AriaButton>
  );
}
