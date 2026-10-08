import { z } from "zod";

export const galleryIdSchema = z.uuid();
export const galleryProjectIdSchema = z.uuid();
// F-10: a selection group id from a client route or action (D-12).
export const selectionGroupIdSchema = z.uuid();
