"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { DELIVERY_SCREEN_COPY_NAMESPACE } from "./delivery-screen.copy";
import type { DeliveryPartProps } from "./delivery-screen.types";

// The next dialog opens once the action sheet has finished its exit (catalog row actions).
const SHEET_HANDOFF_DELAY_MS = 400;

/** *Unduh ▾*: *Unduh semua (n)* and *Pilih beberapa*; a Menu on desktop, an action sheet on phones (hasilakhir-menu-unduh). @param props - the screen state @returns the button with its menu */
export function DeliveryDownloadMenu({ screen }: Readonly<DeliveryPartProps>) {
  const t = useTranslations(DELIVERY_SCREEN_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const isBusy = screen.download.progress.phase === "RUNNING" || screen.shown.length === 0;
  const all = t("downloadAll", { count: screen.shown.length });
  if (!isMobile) {
    return (
      <MenuTrigger label={t("download")}>
        <Button iconLeading="download" iconTrailing="chevron-down" isDisabled={isBusy}>
          {t("download")}
        </Button>
        <Menu aria-label={t("downloadMenu")}>
          <MenuItem label={all} icon="download" onSelect={screen.askDownloadAll} />
          <MenuItem label={t("pickSeveral")} icon="list-checks" onSelect={screen.startSelecting} />
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
        {t("download")}
      </Button>
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={t("download")} variant="actions">
        <SheetItem label={all} icon="download" onPress={later(screen.askDownloadAll)} />
        <SheetItem
          label={t("pickSeveral")}
          icon="list-checks"
          onPress={later(screen.startSelecting)}
        />
      </BottomSheet>
    </>
  );
}
