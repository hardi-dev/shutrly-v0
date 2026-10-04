import { galleryFieldErrorKeySchema } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.schema";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";

/** Turns a field-error key (from the shared schema or the server) into its message. @param key - the error key, or undefined @returns the message or undefined */
export function galleryErrorText(key: string | undefined): string | undefined {
  if (key === undefined || key === "") return undefined;
  return GALLERY_COPY.errors[galleryFieldErrorKeySchema.parse(key)];
}
