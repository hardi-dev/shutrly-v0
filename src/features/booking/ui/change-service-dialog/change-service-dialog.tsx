"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { CHANGE_SERVICE_DIALOG_COPY_NAMESPACE } from "./change-service-dialog.copy";

/** Ganti layanan?: confirms replacing an edited package with the new service's items (spec › Main Flow 3). */
export function ChangeServiceDialog({
  serviceName,
  onConfirm,
  onCancel,
}: Readonly<{ serviceName: string | null; onConfirm: () => void; onCancel: () => void }>) {
  const t = useTranslations(CHANGE_SERVICE_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  if (serviceName === null) return null;
  const body = t("changeServiceBody", { serviceName });
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onCancel();
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen
        onOpenChange={handleOpenChange}
        title={t("changeServiceTitle")}
        description={body}
        variant="actions"
      >
        <SheetItem label={t("changeServiceConfirm")} icon="refresh-cw" onPress={onConfirm} />
        <SheetItem label={t("itemCancel")} icon="x" onPress={onCancel} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen
      onOpenChange={handleOpenChange}
      title={t("changeServiceTitle")}
      description={body}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={onCancel}>
            {t("itemCancel")}
          </Button>
          <Button onPress={onConfirm}>{t("changeServiceConfirm")}</Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
