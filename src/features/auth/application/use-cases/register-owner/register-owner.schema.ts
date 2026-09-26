import { z } from "zod";

import {
  displayNameFieldSchema,
  emailFieldSchema,
  newPasswordFieldSchema,
} from "../../schemas/auth-fields/auth-fields.schema";

// Shared by the Register form (UX) and the use case (authority, C-004).
export const registerOwnerSchema = z.object({
  name: displayNameFieldSchema,
  email: emailFieldSchema,
  password: newPasswordFieldSchema,
});
