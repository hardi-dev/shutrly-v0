import type {
  ProjectMenuGroups,
  ProjectMenuItem,
} from "@/features/booking/domain/project-menu/project-menu.types";
import type { ManualStep } from "@/features/booking/domain/project-status/project-status.types";
import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface ProjectMenuHandlers {
  readonly onStep: (step: ManualStep) => void;
  readonly onEditInfo: () => void;
  readonly onCancel: () => void;
  readonly onDeleteDraft: () => void;
  readonly onAddNumber: () => void;
  readonly onShareGallery: () => void;
  readonly onMarkDelivered: () => void;
}

export interface ProjectMenuProps {
  readonly title: string;
  /** The phone sheet's second line: client · date · status. */
  readonly meta: string;
  readonly groups: ProjectMenuGroups;
  readonly whatsappNumber: string | null;
  readonly variant: "row" | "detail";
  readonly handlers: ProjectMenuHandlers;
}

export interface ResolvedMenuItem {
  readonly key: string;
  readonly item: ProjectMenuItem;
  readonly label: string;
  readonly icon: IconName;
  readonly isDestructive: boolean;
  readonly isDisabled?: boolean;
  readonly description?: string;
  readonly href?: string;
  readonly run?: () => void;
}
