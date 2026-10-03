"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

/** Ganti layanan?: confirms replacing an edited package with the new service's items (spec › Main Flow 3). */
export function ChangeServiceDialog({
  serviceName,
  onConfirm,
  onCancel,
}: Readonly<{ serviceName: string | null; onConfirm: () => void; onCancel: () => void }>) {
  const isMobile = useMobileViewport();
  if (serviceName === null) return null;
  const body = PROJECT_COPY.changeServiceBody(serviceName);
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onCancel();
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen
        onOpenChange={handleOpenChange}
        title={PROJECT_COPY.changeServiceTitle}
        description={body}
        variant="actions"
      >
        <SheetItem
          label={PROJECT_COPY.changeServiceConfirm}
          icon="refresh-cw"
          onPress={onConfirm}
        />
        <SheetItem label={PROJECT_COPY.itemCancel} icon="x" onPress={onCancel} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen
      onOpenChange={handleOpenChange}
      title={PROJECT_COPY.changeServiceTitle}
      description={body}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={onCancel}>
            {PROJECT_COPY.itemCancel}
          </Button>
          <Button onPress={onConfirm}>{PROJECT_COPY.changeServiceConfirm}</Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
