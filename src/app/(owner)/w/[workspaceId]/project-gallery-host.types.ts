import type { ReactNode } from "react";

import type { ProjectMenuActions } from "@/features/booking/ui/project-menu-host/project-menu-host.types";
import type { GalleryShareLoader } from "@/features/gallery/ui/gallery-share-dialog/gallery-share-dialog.types";
import type { MarkDeliveredActions } from "@/features/gallery/ui/mark-delivered-button/mark-delivered-button.types";
import type { MarkDeliveredTarget } from "@/ui/hooks/use-project-gallery-actions/use-project-gallery-actions.types";

/** The server actions the workspace host needs: the share message, Tandai terkirim and the client's number. */
export interface ProjectGalleryHostActions {
  readonly loadShare: GalleryShareLoader;
  readonly markDeliveredAction: MarkDeliveredActions["markDeliveredAction"];
  readonly loadDetailAction: ProjectMenuActions["loadDetailAction"];
  readonly loadClientAction: ProjectMenuActions["loadClientAction"];
  readonly updateClientAction: ProjectMenuActions["updateClientAction"];
}

export interface ProjectGalleryHostProps {
  readonly workspaceId: string;
  readonly actions: ProjectGalleryHostActions;
  readonly children: ReactNode;
}

export interface MarkDeliveredLayerProps {
  readonly workspaceId: string;
  readonly target: MarkDeliveredTarget;
  readonly markDeliveredAction: ProjectGalleryHostActions["markDeliveredAction"];
  readonly onDone: () => void;
}

export interface ClientNumberFlowInput {
  readonly workspaceId: string;
  readonly projectId: string | null;
  readonly actions: ProjectGalleryHostActions;
  readonly onSaved: () => void;
}

export interface ShareLayerProps {
  readonly workspaceId: string;
  readonly projectId: string | null;
  readonly actions: ProjectGalleryHostActions;
  readonly onOpenChange: (isOpen: boolean) => void;
}
