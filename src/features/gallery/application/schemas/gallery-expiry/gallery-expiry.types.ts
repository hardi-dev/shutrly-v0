import type { z } from "zod";

import type { galleryExpirySchema } from "./gallery-expiry.schema";

export type GalleryExpiryInput = z.input<typeof galleryExpirySchema>;
