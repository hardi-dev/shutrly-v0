import { z } from "zod";

export const teamRoleFieldErrorKeySchema = z.enum(["EMPTY", "TOO_LONG"]).catch("EMPTY");
