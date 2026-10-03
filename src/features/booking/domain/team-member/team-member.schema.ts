import { z } from "zod";

import { optionalWhatsappValue } from "../whatsapp-number/whatsapp-number";
import { whatsappNumberSchema } from "../whatsapp-number/whatsapp-number.schema";
import {
  fitsTeamMemberNameLength,
  TEAM_MEMBER_EMAIL_MAX_LENGTH,
  TEAM_MEMBER_ROLES_MAX,
  TEAM_MEMBER_STATUSES,
} from "./team-member";

/** BR-TEAM-004: a trimmed member name, or the issue `EMPTY` / `TOO_LONG`. */
export const teamMemberNameSchema = z
  .string()
  .trim()
  .min(1, { error: "EMPTY" })
  .refine(fitsTeamMemberNameLength, { error: "TOO_LONG" });

/** BR-TEAM-004: required; a blank number (after separators) is `REQUIRED`, otherwise BR-CLI-002 (`INVALID`). */
export const requiredWhatsappNumberSchema = z
  .string()
  .transform(optionalWhatsappValue)
  .pipe(z.string({ error: "REQUIRED" }).pipe(whatsappNumberSchema));

/** BR-TEAM-004: an optional email, stored lower-case; blank means none. */
export const optionalEmailSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value.toLowerCase()))
  .pipe(
    z
      .email({ error: "INVALID" })
      .max(TEAM_MEMBER_EMAIL_MAX_LENGTH, { error: "TOO_LONG" })
      .nullable(),
  );

/** BR-TEAM-004: one or more role IDs, deduplicated; none is `REQUIRED`. */
export const roleIdsSchema = z
  .array(z.uuid())
  .max(TEAM_MEMBER_ROLES_MAX)
  .transform((ids) => [...new Set(ids)])
  .refine((ids) => ids.length > 0, { error: "REQUIRED" });

/** BR-TEAM-004: an untrusted list status. */
export const teamMemberStatusSchema = z.enum(TEAM_MEMBER_STATUSES);
