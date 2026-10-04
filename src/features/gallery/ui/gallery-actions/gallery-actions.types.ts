import type { LinkGallerySourceInput } from "@/features/gallery/application/schemas/link-gallery-source/link-gallery-source.types";
import type { FolderUseResult } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use.types";
import type { LinkGallerySourceResult } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source.types";
import type { SyncOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source/sync-gallery-source.types";

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
  readonly syncSourceAction: (workspaceId: string, sourceId: string) => Promise<SyncOutcome>;
}
