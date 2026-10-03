import type {
  ProjectMenuGroups,
  ProjectMenuItem,
} from "@/features/booking/domain/project-menu/project-menu.types";
import type { ProjectStep } from "@/features/booking/domain/project-status/project-status.types";
import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface ProjectMenuHandlers {
  readonly onStep: (step: ProjectStep) => void;
  readonly onEditInfo: () => void;
  readonly onCancel: () => void;
  readonly onDeleteDraft: () => void;
  readonly onAddNumber: () => void;
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
  readonly href?: string;
  readonly run?: () => void;
}
