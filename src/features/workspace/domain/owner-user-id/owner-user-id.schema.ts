import { z } from "zod";

export const ownerUserIdSchema = z.string().min(1).brand<"OwnerUserId">();
