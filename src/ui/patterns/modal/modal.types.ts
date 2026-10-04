import type { ReactNode, RefObject } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: ModalSize;
  isDestructive?: boolean;
}

export interface ModalContentProps extends Omit<ModalProps, "isOpen"> {
  dialogRef: RefObject<HTMLElement | null>;
  titleId: string;
  descriptionId: string;
}

export interface ModalHeaderProps {
  titleId: string;
  descriptionId: string;
  title: string;
  description?: string;
  onClose: () => void;
}

export interface ModalStoryCopy {
  title: string;
  body: string;
  description?: string;
  cancel?: string;
  confirm?: string;
  form?: {
    nameLabel: string;
    namePlaceholder: string;
    nameDescription: string;
    prefixLabel: string;
    prefixPlaceholder: string;
    prefixDescription: string;
  };
}
