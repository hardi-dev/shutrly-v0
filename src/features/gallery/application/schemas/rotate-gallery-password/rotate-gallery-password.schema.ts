import { z } from "zod";

import { galleryPasswordSchema } from "../gallery-password/gallery-password.schema";

export const rotateGalleryPasswordSchema = z.object({ password: galleryPasswordSchema });
