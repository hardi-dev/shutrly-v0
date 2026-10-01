"use client";

import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { UNSAVED_CHANGES_COPY as COPY } from "./unsaved-changes-dialog.copy";
import type { UnsavedChangesDialogProps } from "./unsaved-changes-dialog.types";

/**
 * Confirms leaving the editor with unsaved changes: a Modal on desktop and an Actions sheet on
 * phones (AC-MSG-014). Dismissing it keeps the Owner in the editor.
 * @param props - open state, layout, template label and the stay / leave handlers
 * @returns the confirmation dialog
 */
export function UnsavedChangesDialog({
  isOpen,
  isMobile,
  templateLabel,
  onStay,
  onLeave,
}: Readonly<UnsavedChangesDialogProps>) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onStay();
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        title={COPY.title}
        description={COPY.mobileDescription(templateLabel)}
        variant="actions"
      >
        <SheetItem label={COPY.stay} icon="pencil" onPress={onStay} />
        <SheetItem label={COPY.leave} icon="trash-2" variant="destructive" onPress={onLeave} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={COPY.title}
      description={COPY.description(templateLabel)}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={onStay}>
            {COPY.stay}
          </Button>
          <Button variant="danger" onPress={onLeave}>
            {COPY.leave}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
