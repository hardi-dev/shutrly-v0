import { z } from "zod";

import { clientNameSchema } from "@/features/booking/domain/client-name/client-name.schema";
import { socialLinkRowsSchema } from "@/features/booking/domain/social-link/social-link.schema";
import { optionalWhatsappNumberSchema } from "@/features/booking/domain/whatsapp-number/whatsapp-number.schema";

export const clientInputSchema = z.object({
  name: clientNameSchema,
  whatsappNumber: optionalWhatsappNumberSchema,
  socialLinks: socialLinkRowsSchema,
});
