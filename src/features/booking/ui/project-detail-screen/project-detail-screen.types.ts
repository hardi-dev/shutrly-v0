import type { ReactNode } from "react";

import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";

import type { DefinitionOption, ProjectEditActions } from "../project-edit/project-edit.types";
import type { ProjectMenuActions } from "../project-menu-host/project-menu-host.types";

export interface ProjectDetailScreenProps {
  readonly workspaceId: string;
  readonly project: ProjectDetailView;
  readonly menuActions: ProjectMenuActions;
  readonly editActions: ProjectEditActions;
  readonly definitions: readonly DefinitionOption[];
  /** The F-09 Galeri card, rendered right after *Info* (gallery TD D-16). */
  readonly galleryCard?: ReactNode;
}

export interface ProjectDetailCardProps {
  readonly project: ProjectDetailView;
  readonly isMobile: boolean;
}

export interface DetailEditHandlers {
  readonly onAddItem: () => void;
  readonly onEditItem: (item: ProjectDetailView["items"][number]) => void;
  readonly onRemoveItem: (item: ProjectDetailView["items"][number]) => void;
  readonly onEditFields: () => void;
  readonly onAddSession: () => void;
  readonly onEditSession: (session: ProjectDetailView["sessions"][number]) => void;
  readonly onDeleteSession: (session: ProjectDetailView["sessions"][number]) => void;
}

export type EditItem = ProjectDetailView["items"][number];
export type EditSession = ProjectDetailView["sessions"][number];
export type EditOpen =
  | { readonly kind: "addItem" }
  | { readonly kind: "editItem"; readonly item: EditItem }
  | { readonly kind: "removeItem"; readonly item: EditItem }
  | { readonly kind: "fields" }
  | { readonly kind: "addSession" }
  | { readonly kind: "editSession"; readonly session: EditSession }
  | { readonly kind: "deleteSession"; readonly session: EditSession }
  | null;
