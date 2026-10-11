// Names the GALLERY_COPY_NAMESPACE namespace for this folder's components (the local ui-copy rule reads a sibling copy import).
import { GALLERY_COPY_NAMESPACE } from "../gallery-copy/gallery-copy.copy";

export const GALLERY_CARD_COPY_NAMESPACE = GALLERY_COPY_NAMESPACE;

import { DELIVERY_COPY_NAMESPACE } from "../delivery-copy/delivery.copy";
import { GALLERY_SUMMARY_COPY_NAMESPACE } from "../gallery-summary-text/gallery-summary.copy";
import { SELECTION_OWNER_COPY_NAMESPACE } from "../selection-owner-text/selection-owner.copy";

export const GALLERY_CARD_SUMMARY_NAMESPACE = GALLERY_SUMMARY_COPY_NAMESPACE;
export const GALLERY_CARD_SELECTION_NAMESPACE = SELECTION_OWNER_COPY_NAMESPACE;
export const GALLERY_CARD_DELIVERY_NAMESPACE = DELIVERY_COPY_NAMESPACE;
