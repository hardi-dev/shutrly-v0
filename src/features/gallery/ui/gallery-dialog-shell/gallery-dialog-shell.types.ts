import type { ReactNode } from "react";

import type { ModalSize } from "@/ui/patterns/modal/modal.types";

export interface GalleryDialogShellProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly title: string;
  readonly description?: string;
  /** Modal size on desktop; phones use a Bottom Sheet. */
  readonly size: ModalSize;
  /** Destructive confirms use Bottom Sheet/Actions on phones, forms use Bottom Sheet/Form. */
  readonly isDestructive?: boolean;
  /** The primary action; `renderPrimary(isMobile)` sizes it for the shell. */
  readonly renderPrimary: (isMobile: boolean) => ReactNode;
  /** Disables *Batal* while the primary action runs. */
  readonly isPending?: boolean;
  readonly children: ReactNode;
}
