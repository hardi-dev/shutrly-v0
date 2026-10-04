import type { ReactNode, RefObject } from "react";

export type BottomSheetVariant = "actions" | "form" | "menu";

export interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  headerLeading?: ReactNode;
  variant?: BottomSheetVariant;
  meta?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  /** Fills the viewport below a 44 px top gap, for a browsing sheet like *Semua foto* (F-09). */
  isFullHeight?: boolean;
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
  headerLeading?: ReactNode;
  variant: BottomSheetVariant;
  meta?: string;
  description?: string;
  hasClose: boolean;
  onClose: () => void;
}
