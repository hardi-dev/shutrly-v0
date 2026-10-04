import { z } from "zod";

import { galleryExpirySchema } from "../gallery-expiry/gallery-expiry.schema";

export const setGalleryExpirySchema = z.object({ expiry: galleryExpirySchema });
