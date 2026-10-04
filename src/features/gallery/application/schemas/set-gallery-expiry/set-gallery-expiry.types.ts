import type { z } from "zod";

import type { setGalleryExpirySchema } from "./set-gallery-expiry.schema";

export type SetGalleryExpiryInput = z.input<typeof setGalleryExpirySchema>;
export type SetGalleryExpiryValues = z.output<typeof setGalleryExpirySchema>;
