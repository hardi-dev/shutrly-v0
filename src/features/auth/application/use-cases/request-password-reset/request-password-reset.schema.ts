import { z } from "zod";

import { emailFieldSchema } from "../../schemas/auth-fields/auth-fields.schema";

export const requestPasswordResetSchema = z.object({ email: emailFieldSchema });
