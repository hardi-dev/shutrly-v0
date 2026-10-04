import { galleryFieldErrorKeySchema } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.schema";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";

/** Turns a field-error key (from the shared schema or the server) into its message. @param key - the error key, or undefined @param field - the folder form field, for its own length message @returns the message or undefined */
export function galleryErrorText(
  key: string | undefined,
  field?: "label" | "link",
): string | undefined {
  if (key === undefined || key === "") return undefined;
  const parsed = galleryFieldErrorKeySchema.parse(key);
  if (parsed === "TOO_LONG" && field !== undefined) return GALLERY_COPY.fieldTooLong[field];
  return GALLERY_COPY.errors[parsed];
}
