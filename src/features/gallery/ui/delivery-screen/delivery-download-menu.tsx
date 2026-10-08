"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { DELIVERY_SCREEN_COPY as COPY } from "./delivery-screen.copy";
import type { DeliveryPartProps } from "./delivery-screen.types";

// The next dialog opens once the action sheet has finished its exit (catalog row actions).
const SHEET_HANDOFF_DELAY_MS = 400;

/** *Unduh ▾*: *Unduh semua (n)* and *Pilih beberapa*; a Menu on desktop, an action sheet on phones (hasilakhir-menu-unduh). @param props - the screen state @returns the button with its menu */
export function DeliveryDownloadMenu({ screen }: Readonly<DeliveryPartProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const isBusy = screen.download.progress.phase === "RUNNING" || screen.shown.length === 0;
  const all = COPY.downloadAll(screen.shown.length);
  if (!isMobile) {
    return (
      <MenuTrigger label={COPY.download}>
        <Button iconLeading="download" iconTrailing="chevron-down" isDisabled={isBusy}>
          {COPY.download}
        </Button>
        <Menu aria-label={COPY.downloadMenu}>
          <MenuItem label={all} icon="download" onSelect={screen.askDownloadAll} />
          <MenuItem label={COPY.pickSeveral} icon="list-checks" onSelect={screen.startSelecting} />
        </Menu>
      </MenuTrigger>
    );
  }
  const later = (next: () => void) => () => {
    setIsOpen(false);
    window.setTimeout(next, SHEET_HANDOFF_DELAY_MS);
  };
  const open = () => {
    setIsOpen(true);
  };
  return (
    <>
      <Button
        size="lg"
        className="w-full"
        iconLeading="download"
        iconTrailing="chevron-down"
        isDisabled={isBusy}
        onPress={open}
      >
        {COPY.download}
      </Button>
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={COPY.download} variant="actions">
        <SheetItem label={all} icon="download" onPress={later(screen.askDownloadAll)} />
        <SheetItem
          label={COPY.pickSeveral}
          icon="list-checks"
          onPress={later(screen.startSelecting)}
        />
      </BottomSheet>
    </>
  );
}
