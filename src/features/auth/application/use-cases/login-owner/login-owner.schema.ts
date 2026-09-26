import { z } from "zod";

import {
  currentPasswordFieldSchema,
  emailFieldSchema,
} from "../../schemas/auth-fields/auth-fields.schema";

export const loginOwnerSchema = z.object({
  email: emailFieldSchema,
  password: currentPasswordFieldSchema,
});
