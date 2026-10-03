import { z } from "zod";

import {
  addDuplicateSocialLinkIssues,
  dropBlankSocialLinkRows,
  fitsSocialValueLength,
  isHandleOrHttps,
  normaliseSocialValue,
  SOCIAL_LINK_MAX_COUNT,
  SOCIAL_PLATFORMS,
} from "./social-link";

/** BR-CLI-001: a handle (stored without `@`) or an https URL, 1–200 characters. */
export const socialValueSchema = z
  .string()
  .transform(normaliseSocialValue)
  .pipe(
    z
      .string()
      .min(1, { error: "EMPTY" })
      .refine(isHandleOrHttps, { error: "INVALID_URL" })
      .refine(fitsSocialValueLength, { error: "TOO_LONG" }),
  );

/** A-2: one of the six platforms. */
export const socialPlatformSchema = z.enum(SOCIAL_PLATFORMS, { error: "UNKNOWN_PLATFORM" });

/** One stored link. */
export const socialLinkSchema = z.object({
  platform: socialPlatformSchema,
  value: socialValueSchema,
});

/** BR-CLI-001: the stored links; it also validates the JSONB column on read (D-2). */
export const socialLinksSchema = z
  .array(socialLinkSchema)
  .max(SOCIAL_LINK_MAX_COUNT, { error: "TOO_MANY" });

/** A form row. A blank value is a row the Owner left empty, and it is dropped. */
const socialLinkRowSchema = z.object({
  platform: socialPlatformSchema,
  value: z
    .string()
    .transform((raw) => (raw.trim() === "" ? null : raw))
    .pipe(socialValueSchema.nullable()),
});

/** BR-CLI-001: the form's rows, at most ten, no duplicates, blank rows dropped, order kept. */
export const socialLinkRowsSchema = z
  .array(socialLinkRowSchema)
  .max(SOCIAL_LINK_MAX_COUNT, { error: "TOO_MANY" })
  .superRefine(addDuplicateSocialLinkIssues)
  .transform(dropBlankSocialLinkRows);
