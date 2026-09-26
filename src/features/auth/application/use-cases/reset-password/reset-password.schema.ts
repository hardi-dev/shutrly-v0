import { z } from "zod";

import { newPasswordFieldSchema } from "../../schemas/auth-fields/auth-fields.schema";

export const resetPasswordSchema = z
  .object({ token: z.string().max(512), password: newPasswordFieldSchema, confirm: z.string() })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "password.mismatch",
  });
