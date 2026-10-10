"use client";

import { useState } from "react";

import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { ADD_ON_COPY as COPY } from "../add-on-copy/add-on.copy";
import type { AddOnMenuProps } from "./add-on-menu.types";

// The next dialog opens once the action sheet has finished its exit (catalog row actions).
const SHEET_HANDOFF_DELAY_MS = 400;

/** A row's actions: *Setujui* and *Hapus draf* on a draft, *Batalkan add-on* once approved; a menu on desktop, an action sheet on phones (addon-menu-draf / -disetujui, AC-ADD-004). @param props - the row and its handlers @returns the trigger with its menu, or nothing for a cancelled add-on */
export function AddOnMenu(props: Readonly<AddOnMenuProps>) {
  const isMobile = useMobileViewport();
  if (props.row.status === "CANCELLED") return null;
  return isMobile ? <MobileAddOnMenu {...props} /> : <DesktopAddOnMenu {...props} />;
}

function DesktopAddOnMenu({ row, onApprove, onDeleteDraft, onCancel }: Readonly<AddOnMenuProps>) {
  const label = COPY.actionsLabel(row.description);
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        {row.status === "DRAFT" ? (
          <>
            <MenuItem label={COPY.approve} icon="check" onSelect={onApprove} />
            <MenuItem
              label={COPY.deleteDraft}
              icon="trash-2"
              variant="destructive"
              onSelect={onDeleteDraft}
            />
          </>
        ) : (
          <MenuItem label={COPY.cancelAddOn} icon="x" variant="destructive" onSelect={onCancel} />
        )}
      </Menu>
    </MenuTrigger>
  );
}

function MobileAddOnMenu({ row, onApprove, onDeleteDraft, onCancel }: Readonly<AddOnMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const closeThen = (next: () => void) => () => {
    setIsOpen(false);
    window.setTimeout(next, SHEET_HANDOFF_DELAY_MS);
  };
  const handleOpen = () => {
    setIsOpen(true);
  };
  return (
    <>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={COPY.actionsLabel(row.description)}
        onPress={handleOpen}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={row.description}
        meta={COPY.sheetMeta(COPY.status[row.status], formatIdr(row.totalAmount))}
        variant="actions"
      >
        {row.status === "DRAFT" ? (
          <>
            <SheetItem label={COPY.approve} icon="check" onPress={closeThen(onApprove)} />
            <SheetItem
              label={COPY.deleteDraft}
              icon="trash-2"
              variant="destructive"
              onPress={closeThen(onDeleteDraft)}
            />
          </>
        ) : (
          <SheetItem
            label={COPY.cancelAddOn}
            icon="x"
            variant="destructive"
            onPress={closeThen(onCancel)}
          />
        )}
      </BottomSheet>
    </>
  );
}
