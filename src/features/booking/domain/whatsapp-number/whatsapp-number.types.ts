import type { z } from "zod";

import type { whatsappNumberSchema } from "./whatsapp-number.schema";

export type WhatsappNumber = z.output<typeof whatsappNumberSchema>;
