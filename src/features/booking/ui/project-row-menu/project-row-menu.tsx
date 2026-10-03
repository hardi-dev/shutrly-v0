"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import type { RowMenuEntry } from "./project-row-menu.types";

/** A small ⋯ menu for one row: a menu on desktop, an Actions sheet on phones. */
export function ProjectRowMenu({
  label,
  title,
  entries,
}: Readonly<{ label: string; title: string; entries: readonly RowMenuEntry[] }>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(true);
  };
  if (isMobile) {
    return (
      <>
        <IconButton icon="more-horizontal" size="sm" aria-label={label} onPress={handleOpen} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={title} variant="actions">
          {entries.map((entry) => (
            <MobileEntry key={entry.label} entry={entry} onDone={setIsOpen} />
          ))}
        </BottomSheet>
      </>
    );
  }
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        {entries.map((entry) => (
          <MenuItem
            key={entry.label}
            label={entry.label}
            icon={entry.icon}
            variant={entry.isDestructive ? "destructive" : "default"}
            onSelect={entry.onSelect}
          />
        ))}
      </Menu>
    </MenuTrigger>
  );
}

function MobileEntry({
  entry,
  onDone,
}: Readonly<{ entry: RowMenuEntry; onDone: (isOpen: boolean) => void }>) {
  const handlePress = () => {
    onDone(false);
    entry.onSelect();
  };
  return (
    <SheetItem
      label={entry.label}
      icon={entry.icon}
      variant={entry.isDestructive ? "destructive" : "default"}
      onPress={handlePress}
    />
  );
}
