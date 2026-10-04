"use client";

import { type ReactNode, useId, useLayoutEffect, useRef } from "react";
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { useRestoreFocus } from "@/ui/hooks/use-restore-focus/use-restore-focus";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { MODAL_COPY } from "./modal.copy";
import type { ModalContentProps, ModalHeaderProps, ModalProps, ModalSize } from "./modal.types";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-[min(calc(100%_-_32px),_400px)]",
  md: "max-w-[min(calc(100%_-_32px),_560px)]",
  lg: "max-w-[min(calc(100%_-_32px),_720px)]",
  // *Semua foto* (F-09): the content width, at a fixed height of the viewport minus 40 per side.
  xl: "h-[calc(100dvh_-_80px)] max-w-[min(calc(100%_-_32px),var(--size-content-max))]",
};

const DIALOG_CLASS = "flex max-h-[calc(100dvh_-_32px)] flex-col outline-none";

/** Renders a token-backed dialog overlay with structured header, body and footer (C31). */
export function Modal({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  actions,
  size = "md",
  isDestructive = false,
}: Readonly<ModalProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  useRestoreFocus(isOpen);

  useLayoutEffect(() => {
    if (isOpen) {
      dialogRef.current?.setAttribute("aria-modal", "true");
    }
  }, [isOpen]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--component-modal-scrim) p-(--space-4)"
    >
      <ModalContent
        dialogRef={dialogRef}
        titleId={titleId}
        descriptionId={descriptionId}
        title={title}
        description={description}
        size={size}
        isDestructive={isDestructive}
        onOpenChange={onOpenChange}
        actions={actions}
      >
        {children}
      </ModalContent>
    </ModalOverlay>
  );
}

function ModalContent({
  dialogRef,
  titleId,
  descriptionId,
  title,
  description,
  children,
  actions,
  size = "md",
  isDestructive = false,
  onOpenChange,
}: Readonly<ModalContentProps>) {
  function handleClose() {
    onOpenChange(false);
  }

  return (
    <AriaModal
      className={cn(
        "max-h-[calc(100dvh_-_32px)] w-full overflow-hidden",
        "rounded-(--component-modal-radius) border border-(--component-modal-border)",
        "bg-(--component-modal-background) shadow-[0_var(--elevation-2-offset-y)_var(--elevation-2-blur)_var(--color-semantic-elevation-2-color)]",
        SIZE_CLASSES[size],
      )}
    >
      <Dialog
        ref={dialogRef}
        role={isDestructive ? "alertdialog" : "dialog"}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(DIALOG_CLASS, size === "xl" && "h-full")}
      >
        <ModalHeader
          titleId={titleId}
          descriptionId={descriptionId}
          title={title}
          description={description}
          onClose={handleClose}
        />
        {!isDestructive ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-(--component-modal-body-padding)">
            <div className="flex flex-col gap-(--component-modal-body-gap)">{children}</div>
          </div>
        ) : null}
        {actions ? <ModalFooter>{actions}</ModalFooter> : null}
      </Dialog>
    </AriaModal>
  );
}

function ModalHeader({
  titleId,
  descriptionId,
  title,
  description,
  onClose,
}: Readonly<ModalHeaderProps>) {
  return (
    <header className="flex shrink-0 items-start gap-(--component-modal-header-gap) border-b border-(--component-modal-header-border) px-(--component-modal-header-padding-x) py-(--component-modal-header-padding-y)">
      <div className="flex min-w-0 flex-1 flex-col gap-(--component-modal-header-text-gap)">
        <h2
          id={titleId}
          className="text-(--color-semantic-text-primary) text-[18px] font-bold tracking-[-0.4px]"
        >
          {title}
        </h2>
        {description ? (
          <p
            id={descriptionId}
            className="text-(length:--font-size-body-sm) leading-[20px] text-(--color-semantic-text-secondary)"
          >
            {description}
          </p>
        ) : null}
      </div>
      <IconButton icon="x" size="sm" aria-label={MODAL_COPY.close} onPress={onClose} />
    </header>
  );
}

function ModalFooter({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <footer className="flex shrink-0 justify-end gap-(--component-modal-footer-gap) border-t border-(--component-modal-footer-border) bg-(--component-modal-footer-background) px-(--component-modal-footer-padding-x) py-(--component-modal-footer-padding-y)">
      {children}
    </footer>
  );
}
