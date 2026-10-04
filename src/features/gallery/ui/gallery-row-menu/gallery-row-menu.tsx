"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import type { GalleryRowMenuProps, MobileEntryProps } from "./gallery-row-menu.types";

/** The gallery and folder ⋯ menus: Action Menu on desktop, Bottom Sheet/Actions on phones (design.md › Menus). */
export function GalleryRowMenu({
  label,
  title,
  entries,
  size = "sm",
}: Readonly<GalleryRowMenuProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(true);
  };
  if (isMobile) {
    return (
      <>
        <IconButton icon="more-horizontal" size={size} aria-label={label} onPress={handleOpen} />
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
      <IconButton icon="more-horizontal" size={size} aria-label={label} />
      <Menu aria-label={label}>
        {entries.map((entry) => (
          <MenuItem
            key={entry.label}
            label={entry.label}
            icon={entry.icon}
            description={entry.isDisabled ? entry.description : undefined}
            isDisabled={entry.isDisabled}
            variant={entry.isDestructive ? "destructive" : "default"}
            onSelect={entry.onSelect}
          />
        ))}
      </Menu>
    </MenuTrigger>
  );
}

function MobileEntry({ entry, onDone }: Readonly<MobileEntryProps>) {
  const handlePress = () => {
    onDone(false);
    entry.onSelect();
  };
  return (
    <SheetItem
      label={entry.label}
      icon={entry.icon}
      description={entry.isDisabled ? entry.description : undefined}
      isDisabled={entry.isDisabled}
      variant={entry.isDestructive ? "destructive" : "default"}
      onPress={handlePress}
    />
  );
}
