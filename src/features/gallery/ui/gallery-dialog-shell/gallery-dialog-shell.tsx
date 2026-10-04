"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryDialogShellProps } from "./gallery-dialog-shell.types";

/** The gallery dialogs' frame: a Modal with *Batal* on desktop, a Bottom Sheet on phones (design.md › Dialogs). */
export function GalleryDialogShell(props: Readonly<GalleryDialogShellProps>) {
  const isMobile = useMobileViewport();
  const handleCancel = () => {
    props.onOpenChange(false);
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={props.title}
        description={props.description}
        variant={props.isDestructive ? "actions" : "form"}
        actions={props.renderPrimary(true)}
      >
        {props.children}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={props.title}
      description={props.description}
      size={props.size}
      isDestructive={props.isDestructive}
      actions={
        <>
          <Button variant="secondary" isDisabled={props.isPending} onPress={handleCancel}>
            {GALLERY_COPY.cancel}
          </Button>
          {props.renderPrimary(false)}
        </>
      }
    >
      {props.children}
    </Modal>
  );
}
