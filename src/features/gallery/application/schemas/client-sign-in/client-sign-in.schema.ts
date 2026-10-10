import { z } from "zod";

// The password form and the sign-in action share this schema (coding rules › Validation).
export const clientSignInSchema = z.object({
  password: z.string().trim().min(1, { error: "EMPTY" }).max(200, { error: "EMPTY" }),
});
