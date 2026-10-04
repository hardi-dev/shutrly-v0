import type { GalleryPageActions } from "@/features/gallery/ui/gallery-actions/gallery-actions.types";

import {
  checkFolderInUseAction,
  linkGallerySourceAction,
  proposeGalleryPasswordAction,
  syncGallerySourceAction,
} from "./galleries";

/** The server actions behind the gallery page, handed from the route to the client screens. */
export const GALLERY_PAGE_ACTIONS: GalleryPageActions = {
  proposeAction: proposeGalleryPasswordAction,
  checkFolderAction: checkFolderInUseAction,
  linkSourceAction: linkGallerySourceAction,
  syncSourceAction: syncGallerySourceAction,
};
