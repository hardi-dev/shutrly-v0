import type { ProposePasswordAction } from "../use-create-gallery-form/use-create-gallery-form.types";

export interface UseCreateGalleryLauncherInput {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly proposeAction: ProposePasswordAction;
}
