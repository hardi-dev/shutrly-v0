"use client";

import { type ReactNode, useId, useLayoutEffect, useRef } from "react";
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { BOTTOM_SHEET_COPY } from "./bottom-sheet.copy";
import type { BottomSheetProps, SheetContentProps, SheetHeaderProps } from "./bottom-sheet.types";

const HEADER_ALIGNMENT = {
  actions: "items-center text-center",
  form: "items-start text-left",
  menu: "items-start text-left",
} as const;

/** Renders a docked, focus-trapped mobile sheet with Actions, Form and Menu variants (C32). */
export function BottomSheet({
  isOpen,
  onOpenChange,
  title,
  variant = "actions",
  meta,
  description,
  children,
  actions,
}: Readonly<BottomSheetProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (isOpen) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialogRef.current?.setAttribute("aria-modal", "true");
      return;
    }

    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, [isOpen]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 flex items-end justify-center bg-(--component-sheet-scrim)"
    >
      <SheetContent
        dialogRef={dialogRef}
        titleId={titleId}
        descriptionId={descriptionId}
        title={title}
        variant={variant}
        meta={meta}
        description={description}
        actions={actions}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        {children}
      </SheetContent>
    </ModalOverlay>
  );
}

function SheetContent({
  dialogRef,
  titleId,
  descriptionId,
  title,
  variant = "actions",
  meta,
  description,
  children,
  actions,
  onOpenChange,
}: Readonly<SheetContentProps>) {
  const hasClose = variant !== "actions";

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <AriaModal className="max-h-[90dvh] w-full max-w-[560px] overflow-hidden rounded-t-(--component-sheet-radius) bg-(--component-sheet-background) shadow-[0_-8px_40px_var(--color-semantic-elevation-2-color)]">
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="flex max-h-[90dvh] flex-col outline-none"
      >
        <SheetGrabber />
        <SheetHeader
          titleId={titleId}
          descriptionId={descriptionId}
          title={title}
          variant={variant}
          meta={meta}
          description={description}
          hasClose={hasClose}
          onClose={handleClose}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {actions ? <SheetFooter>{actions}</SheetFooter> : null}
        <div className="h-[max(env(safe-area-inset-bottom),_34px)] shrink-0" aria-hidden="true" />
      </Dialog>
    </AriaModal>
  );
}

function SheetGrabber() {
  return (
    <div aria-hidden="true" className="flex h-[12px] shrink-0 items-start justify-center pt-[8px]">
      <div className="h-[4px] w-[36px] rounded-full bg-(--component-sheet-grabber)" />
    </div>
  );
}

function SheetHeader({
  titleId,
  descriptionId,
  title,
  variant,
  meta,
  description,
  hasClose,
  onClose,
}: Readonly<SheetHeaderProps>) {
  return (
    <header
      className={cn(
        "flex shrink-0 gap-(--component-sheet-header-gap) px-(--component-sheet-header-padding-x) py-(--component-sheet-header-padding-y)",
        HEADER_ALIGNMENT[variant],
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className="text-(--component-sheet-title) text-[18px] font-bold">
          {title}
        </h2>
        {description ? (
          <p
            id={descriptionId}
            className="mt-(--component-sheet-header-text-gap) text-(length:--font-size-body-sm) leading-[20px] text-(--component-sheet-description)"
          >
            {description}
          </p>
        ) : null}
        {meta ? (
          <p className="mt-(--component-sheet-header-text-gap) text-(length:--font-size-label) text-(--component-sheet-meta)">
            {meta}
          </p>
        ) : null}
      </div>
      {hasClose ? (
        <IconButton
          icon="x"
          size="sm"
          aria-label={BOTTOM_SHEET_COPY.close}
          onPress={onClose}
          className="rounded-full bg-(--component-sheet-close-background)"
        />
      ) : null}
    </header>
  );
}

function SheetFooter({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <footer className="flex shrink-0 flex-col gap-(--component-sheet-body-gap) border-t border-(--component-sheet-footer-border) bg-(--component-sheet-footer-background) px-(--component-sheet-footer-padding-x) py-(--component-sheet-footer-padding-y)">
      {children}
    </footer>
  );
}
