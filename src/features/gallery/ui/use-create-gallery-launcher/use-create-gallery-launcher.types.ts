import type { ProposePasswordAction } from "../gallery-actions/gallery-actions.types";

export interface UseCreateGalleryLauncherInput {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly proposeAction: ProposePasswordAction;
}
