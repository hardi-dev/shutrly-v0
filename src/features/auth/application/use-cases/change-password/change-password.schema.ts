import { z } from "zod";

import {
  currentPasswordFieldSchema,
  newPasswordFieldSchema,
} from "../../schemas/auth-fields/auth-fields.schema";

export const changePasswordSchema = z
  .object({
    currentPassword: currentPasswordFieldSchema,
    newPassword: newPasswordFieldSchema,
    confirm: z.string(),
  })
  .refine((values) => values.newPassword === values.confirm, {
    path: ["confirm"],
    message: "password.mismatch",
  });
