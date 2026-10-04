import { z } from "zod";

export const assignmentInputSchema = z.object({ memberId: z.uuid(), roleId: z.uuid() });
