import { z } from "zod";

import { galleryExpirySchema } from "../gallery-expiry/gallery-expiry.schema";
import { galleryPasswordSchema } from "../gallery-password/gallery-password.schema";

export const createGallerySchema = z.object({
  password: galleryPasswordSchema,
  expiry: galleryExpirySchema,
});
