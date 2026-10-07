import { z } from "zod";

import { galleryExpirySchema } from "../gallery-expiry/gallery-expiry.schema";
import { galleryPasswordSchema } from "../gallery-password/gallery-password.schema";
import { linkGallerySourceSchema } from "../link-gallery-source/link-gallery-source.schema";

// Revision OT #3: the first folder is optional and validated like *Tambah folder*.
export const createGallerySchema = z.object({
  password: galleryPasswordSchema,
  expiry: galleryExpirySchema,
  folder: linkGallerySourceSchema.optional(),
});
