import type { BrowseQuery } from "@/features/gallery/application/schemas/browse-query/browse-query.types";
import type { SetFolderMappingInput } from "@/features/gallery/application/schemas/folder-mapping/folder-mapping.types";
import type { LinkGallerySourceInput } from "@/features/gallery/application/schemas/link-gallery-source/link-gallery-source.types";
import type { RenameGallerySourceInput } from "@/features/gallery/application/schemas/rename-gallery-source/rename-gallery-source.types";
import type { RotateGalleryPasswordInput } from "@/features/gallery/application/schemas/rotate-gallery-password/rotate-gallery-password.types";
import type { SetGalleryExpiryInput } from "@/features/gallery/application/schemas/set-gallery-expiry/set-gallery-expiry.types";
import type { BrowsePageView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { FolderUseResult } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use.types";
import type { FolderMappingView } from "@/features/gallery/application/use-cases/folder-mapping/folder-mapping.types";
import type {
  ExpiryResult,
  GalleryWriteResult,
  PublishResult,
} from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import type { LinkGallerySourceResult } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source.types";
import type { SyncStepOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step.types";

import type { ProposePasswordAction } from "../use-create-gallery-form/use-create-gallery-form.types";

// The server actions the gallery page's client screens call, handed down from the route.
export interface GalleryPageActions {
  readonly proposeAction: ProposePasswordAction;
  readonly checkFolderAction: (
    workspaceId: string,
    galleryId: string,
    link: string,
  ) => Promise<FolderUseResult>;
  readonly linkSourceAction: (
    workspaceId: string,
    galleryId: string,
    values: LinkGallerySourceInput,
  ) => Promise<LinkGallerySourceResult>;
  readonly syncSourceAction: (workspaceId: string, sourceId: string) => Promise<SyncStepOutcome>;
  readonly publishAction: (workspaceId: string, galleryId: string) => Promise<PublishResult>;
  readonly setExpiryAction: (
    workspaceId: string,
    galleryId: string,
    values: SetGalleryExpiryInput,
  ) => Promise<ExpiryResult>;
  readonly rotatePasswordAction: (
    workspaceId: string,
    galleryId: string,
    values: RotateGalleryPasswordInput,
  ) => Promise<GalleryWriteResult>;
  readonly deleteSourceAction: (
    workspaceId: string,
    sourceId: string,
  ) => Promise<GalleryWriteResult>;
  readonly renameSourceAction: (
    workspaceId: string,
    sourceId: string,
    values: RenameGallerySourceInput,
  ) => Promise<GalleryWriteResult>;
  /** F-20: the folder *Edit*'s subfolder mapping. */
  readonly folderMappingAction: (
    workspaceId: string,
    sourceId: string,
  ) => Promise<FolderMappingView>;
  readonly setFolderMappingAction: (
    workspaceId: string,
    sourceId: string,
    values: SetFolderMappingInput,
  ) => Promise<GalleryWriteResult>;
  readonly archiveAction: (workspaceId: string, galleryId: string) => Promise<GalleryWriteResult>;
  readonly deleteDraftAction: (
    workspaceId: string,
    galleryId: string,
  ) => Promise<GalleryWriteResult>;
  readonly browseAction: (
    workspaceId: string,
    galleryId: string,
    query: BrowseQuery,
  ) => Promise<BrowsePageView>;
}
