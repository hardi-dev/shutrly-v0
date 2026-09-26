import { z } from "zod";

// Trimmed and lower-cased, so one address maps to one identity (BR-AUTH-002).
export const normalisedEmailSchema = z.string().trim().toLowerCase().brand<"NormalisedEmail">();
