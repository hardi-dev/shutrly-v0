"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { ADD_ON_STATUS_MESSAGE_KEY } from "../add-on-copy/add-on.copy";
import { ADD_ON_MENU_COPY_NAMESPACE } from "./add-on-menu.copy";
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
  const t = useTranslations(ADD_ON_MENU_COPY_NAMESPACE);
  const label = t("actionsLabel", { description: row.description });
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        {row.status === "DRAFT" ? (
          <>
            <MenuItem label={t("approve")} icon="check" onSelect={onApprove} />
            <MenuItem
              label={t("deleteDraft")}
              icon="trash-2"
              variant="destructive"
              onSelect={onDeleteDraft}
            />
          </>
        ) : (
          <MenuItem label={t("cancelAddOn")} icon="x" variant="destructive" onSelect={onCancel} />
        )}
      </Menu>
    </MenuTrigger>
  );
}

/** Sheet open state; an action closes the sheet first, then runs after the hand-off delay. */
function useSheetHandoff() {
  const [isOpen, setIsOpen] = useState(false);
  const closeThen = (next: () => void) => () => {
    setIsOpen(false);
    window.setTimeout(next, SHEET_HANDOFF_DELAY_MS);
  };
  const handleOpen = () => {
    setIsOpen(true);
  };
  return { isOpen, setIsOpen, closeThen, handleOpen };
}

function MobileAddOnMenu({ row, onApprove, onDeleteDraft, onCancel }: Readonly<AddOnMenuProps>) {
  const t = useTranslations(ADD_ON_MENU_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const { isOpen, setIsOpen, closeThen, handleOpen } = useSheetHandoff();
  return (
    <>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={t("actionsLabel", { description: row.description })}
        onPress={handleOpen}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={row.description}
        meta={t("sheetMeta", {
          status: t(ADD_ON_STATUS_MESSAGE_KEY[row.status]),
          total: formatIdr(row.totalAmount, locale),
        })}
        variant="actions"
      >
        {row.status === "DRAFT" ? (
          <>
            <SheetItem label={t("approve")} icon="check" onPress={closeThen(onApprove)} />
            <SheetItem
              label={t("deleteDraft")}
              icon="trash-2"
              variant="destructive"
              onPress={closeThen(onDeleteDraft)}
            />
          </>
        ) : (
          <SheetItem
            label={t("cancelAddOn")}
            icon="x"
            variant="destructive"
            onPress={closeThen(onCancel)}
          />
        )}
      </BottomSheet>
    </>
  );
}
