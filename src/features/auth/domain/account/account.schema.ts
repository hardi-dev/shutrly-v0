import { z } from "zod";

// Better Auth user IDs are opaque strings (ADR-002); the brand stops them mixing with other IDs.
export const authUserIdSchema = z.string().min(1).brand<"AuthUserId">();

export const accountStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]);
