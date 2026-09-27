import type { ReactNode, RefObject } from "react";

export type BottomSheetVariant = "actions" | "form" | "menu";

export interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  variant?: BottomSheetVariant;
  meta?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export interface SheetContentProps extends BottomSheetProps {
  dialogRef: RefObject<HTMLElement | null>;
  titleId: string;
  descriptionId: string;
}

export interface SheetHeaderProps {
  titleId: string;
  descriptionId: string;
  title: string;
  variant: BottomSheetVariant;
  meta?: string;
  description?: string;
  hasClose: boolean;
  onClose: () => void;
}
