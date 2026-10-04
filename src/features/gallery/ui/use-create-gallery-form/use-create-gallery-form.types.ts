import type { CreateGalleryInput } from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";
import type { CreateGalleryResult } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";

export type CreateGalleryAction = (
  workspaceId: string,
  projectId: string,
  values: CreateGalleryInput,
) => Promise<CreateGalleryResult>;
export type ProposePasswordAction = (workspaceId: string, projectId: string) => Promise<string>;

export interface UseCreateGalleryFormInput {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly initialPassword: string;
  readonly createAction: CreateGalleryAction;
  readonly proposeAction: ProposePasswordAction;
  readonly onCreated: (galleryId: string) => void;
}
