import type { z } from "zod";

import type { clientSignInSchema } from "./client-sign-in.schema";

export type ClientSignInInput = z.input<typeof clientSignInSchema>;
export type ClientSignInValues = z.output<typeof clientSignInSchema>;
