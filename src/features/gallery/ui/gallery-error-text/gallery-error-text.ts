import { galleryFieldErrorKeySchema } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.schema";

import {
  GALLERY_ERROR_MESSAGE_KEY,
  GALLERY_FIELD_TOO_LONG_MESSAGE_KEY,
} from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";

/** Turns a field-error key (from the shared schema or the server) into its message. @param key - the error key, or undefined @param field - the folder form field, for its own length message @returns the message or undefined */
export function galleryErrorText(
  t: GalleryTranslate,
  key: string | undefined,
  field?: "label" | "link",
): string | undefined {
  if (key === undefined || key === "") return undefined;
  const parsed = galleryFieldErrorKeySchema.parse(key);
  if (parsed === "TOO_LONG" && field !== undefined)
    return t(GALLERY_FIELD_TOO_LONG_MESSAGE_KEY[field]);
  return t(GALLERY_ERROR_MESSAGE_KEY[parsed]);
}
