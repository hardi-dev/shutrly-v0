import { z } from "zod";

import {
  optionalEmailSchema,
  requiredWhatsappNumberSchema,
  roleIdsSchema,
  teamMemberNameSchema,
} from "@/features/booking/domain/team-member/team-member.schema";

export const teamMemberInputSchema = z.object({
  name: teamMemberNameSchema,
  whatsappNumber: requiredWhatsappNumberSchema,
  email: optionalEmailSchema,
  roleIds: roleIdsSchema,
});
