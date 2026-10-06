"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { addOnConfirmContent } from "./add-on-confirm-content";
import type {
  AddOnConfirmDialogProps,
  AddOnConfirmSurfaceProps,
} from "./add-on-confirm-dialog.types";

/** The approve, cancel and cancel-refused confirms: a Modal on desktop, a sheet on phones. The cancel is a standard Modal with a danger button, because the destructive Modal drops its body text (handoff › UI gotchas). @param props - which confirm, the pending flag and handlers @returns the dialog, or nothing when closed */
export function AddOnConfirmDialog(props: Readonly<AddOnConfirmDialogProps>) {
  const isMobile = useMobileViewport();
  if (!props.state) return null;
  const content = addOnConfirmContent(props.state);
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) props.onClose();
  };
  const confirm = (
    <Button
      variant={content.isDanger ? "danger" : "primary"}
      size={isMobile ? "lg" : "md"}
      isPending={props.isPending}
      className="max-md:w-full"
      onPress={props.onConfirm}
    >
      {content.confirmLabel}
    </Button>
  );
  const surface = { ...props, content, confirm, onOpenChange: handleOpenChange };
  return isMobile ? <MobileConfirm {...surface} /> : <DesktopConfirm {...surface} />;
}

const BODY_CLASS = "text-(length:--font-size-body) text-(--color-semantic-text-secondary)";

function MobileConfirm({ content, confirm, onOpenChange }: Readonly<AddOnConfirmSurfaceProps>) {
  return (
    <BottomSheet
      isOpen
      onOpenChange={onOpenChange}
      title={content.title}
      description={content.description}
      variant="form"
      actions={confirm}
    >
      <p className={BODY_CLASS}>{content.body}</p>
    </BottomSheet>
  );
}

function DesktopConfirm(props: Readonly<AddOnConfirmSurfaceProps>) {
  const { content, confirm } = props;
  const cancel = content.cancelLabel ? (
    <Button variant="secondary" isDisabled={props.isPending} onPress={props.onClose}>
      {content.cancelLabel}
    </Button>
  ) : null;
  return (
    <Modal
      isOpen
      onOpenChange={props.onOpenChange}
      title={content.title}
      description={content.description}
      size="md"
      actions={
        <>
          {cancel}
          {confirm}
        </>
      }
    >
      <p className={BODY_CLASS}>{content.body}</p>
    </Modal>
  );
}
