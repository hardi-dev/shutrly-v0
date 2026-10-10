import type { CreateGalleryInput } from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";
import type { FolderUseResult } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use.types";
import type { CreateGalleryResult } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import type { LinkableSourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

export type CreateGalleryAction = (
  workspaceId: string,
  projectId: string,
  values: CreateGalleryInput,
) => Promise<CreateGalleryResult>;
export type ProposePasswordAction = (workspaceId: string, projectId: string) => Promise<string>;
/** Checks a folder link before the gallery exists (Revision OT #3, AC-GAL-010). */
export type CheckNewGalleryFolderAction = (
  workspaceId: string,
  link: string,
) => Promise<FolderUseResult>;

export interface UseCreateGalleryFormInput {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly initialPassword: string;
  /** Active workspace sources for the optional first folder; empty hides the section. */
  readonly linkableSources: readonly LinkableSourceView[];
  readonly createAction: CreateGalleryAction;
  readonly proposeAction: ProposePasswordAction;
  readonly checkFolderAction: CheckNewGalleryFolderAction;
  /** The new gallery, and its first folder when one was linked (to sync it next). */
  readonly onCreated: (galleryId: string, sourceId: string | null) => void;
}

/** A create waiting for the Owner to confirm a folder another project uses (AC-GAL-010). */
export interface PendingCreate {
  readonly projects: string;
  readonly payload: CreateGalleryInput;
}
