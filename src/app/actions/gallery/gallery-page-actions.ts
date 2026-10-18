import type { GalleryPageActions } from "@/features/gallery/ui/gallery-actions/gallery-actions.types";

import {
  browseGalleryPhotosAction,
  checkFolderInUseAction,
  deleteGallerySourceAction,
  getFolderMappingAction,
  linkGallerySourceAction,
  proposeGalleryPasswordAction,
  renameGallerySourceAction,
  rotateGalleryPasswordAction,
  setFolderMappingAction,
  setGalleryExpiryAction,
  syncGallerySourceAction,
} from "./galleries";

/** The server actions behind the gallery page, handed from the route to the client screens. */
export const GALLERY_PAGE_ACTIONS: GalleryPageActions = {
  proposeAction: proposeGalleryPasswordAction,
  checkFolderAction: checkFolderInUseAction,
  linkSourceAction: linkGallerySourceAction,
  syncSourceAction: syncGallerySourceAction,
  browseAction: browseGalleryPhotosAction,
  setExpiryAction: setGalleryExpiryAction,
  rotatePasswordAction: rotateGalleryPasswordAction,
  deleteSourceAction: deleteGallerySourceAction,
  renameSourceAction: renameGallerySourceAction,
  folderMappingAction: getFolderMappingAction,
  setFolderMappingAction,
};
