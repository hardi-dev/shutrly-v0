"use client";

import { type ReactNode, useId, useLayoutEffect, useRef } from "react";
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { useRestoreFocus } from "@/ui/hooks/use-restore-focus/use-restore-focus";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { BOTTOM_SHEET_COPY } from "./bottom-sheet.copy";
import type { BottomSheetProps, SheetContentProps, SheetHeaderProps } from "./bottom-sheet.types";

// The sheet spans the phone/tablet viewport; its content keeps the desktop Modal `md` width.
const SHEET_CONTENT_WIDTH = "mx-auto w-full max-w-[560px]";

const HEADER_ALIGNMENT = {
  actions: "items-center text-center",
  form: "items-start text-left",
  menu: "items-start text-left",
} as const;
// Refocus the trigger only after the 300ms exit motion has unmounted the sheet.
const FOCUS_RESTORE_DELAY_MS = 350;

/** Renders a docked, focus-trapped mobile sheet with Actions, Form and Menu variants (C32). */
export function BottomSheet({
  isOpen,
  onOpenChange,
  title,
  headerLeading,
  variant = "actions",
  meta,
  description,
  children,
  actions,
}: Readonly<BottomSheetProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  useRestoreFocus(isOpen, FOCUS_RESTORE_DELAY_MS);

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-(--component-sheet-scrim) data-[entering]:animate-[bottom-sheet-scrim-in_300ms_ease-out] data-[exiting]:animate-[bottom-sheet-scrim-out_300ms_ease-in] motion-reduce:animate-none"
    >
      <SheetContent
        dialogRef={dialogRef}
        titleId={titleId}
        descriptionId={descriptionId}
        title={title}
        headerLeading={headerLeading}
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

// eslint-disable-next-line max-lines-per-function -- coordinates the sheet structure and body spacing
function SheetContent({
  dialogRef,
  titleId,
  descriptionId,
  title,
  headerLeading,
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
    <AriaModal className="max-h-[90dvh] w-full overflow-hidden rounded-t-(--component-sheet-radius) bg-(--component-sheet-background) shadow-[0_-8px_40px_var(--color-semantic-elevation-2-color)] data-[entering]:animate-[bottom-sheet-in_300ms_ease-out] data-[exiting]:animate-[bottom-sheet-out_300ms_ease-in] motion-reduce:animate-none">
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
          headerLeading={headerLeading}
          variant={variant}
          meta={meta}
          description={description}
          hasClose={hasClose}
          onClose={handleClose}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div
            className={cn(
              SHEET_CONTENT_WIDTH,
              variant === "form" &&
                "px-(--component-sheet-body-padding-x) py-(--component-sheet-body-padding-y)",
            )}
          >
            {children}
          </div>
        </div>
        {actions ? <SheetFooter>{actions}</SheetFooter> : null}
        <div
          className={cn(
            "h-[env(safe-area-inset-bottom)] shrink-0",
            actions && "bg-(--component-sheet-footer-background)",
          )}
          aria-hidden="true"
        />
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

// eslint-disable-next-line max-lines-per-function -- coordinates the shared sheet header anatomy
function SheetHeader({
  titleId,
  descriptionId,
  title,
  headerLeading,
  variant,
  meta,
  description,
  hasClose,
  onClose,
}: Readonly<SheetHeaderProps>) {
  return (
    <header
      className={cn(
        SHEET_CONTENT_WIDTH,
        "flex shrink-0 gap-(--component-sheet-header-gap) px-(--component-sheet-header-padding-x) py-(--component-sheet-header-padding-y)",
        HEADER_ALIGNMENT[variant],
      )}
    >
      <div className="min-w-0 flex-1">
        {headerLeading}
        <h2
          id={titleId}
          className={cn(
            "text-(--color-semantic-text-primary) text-[18px] font-bold",
            headerLeading && "sr-only",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            id={descriptionId}
            className="mt-(--component-sheet-header-text-gap) text-(length:--font-size-body-sm) leading-[20px] text-(--color-semantic-text-secondary)"
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
    <footer className="shrink-0 border-t border-(--component-sheet-footer-border) bg-(--component-sheet-footer-background) py-(--component-sheet-footer-padding-y)">
      <div
        className={cn(
          SHEET_CONTENT_WIDTH,
          "flex flex-col gap-(--component-sheet-body-gap) px-(--component-sheet-footer-padding-x)",
        )}
      >
        {children}
      </div>
    </footer>
  );
}
