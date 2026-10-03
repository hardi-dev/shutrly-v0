import { z } from "zod";

export const projectStepSchema = z.enum(["CONFIRM_BOOKING", "START_SHOOTING", "FINISH_SHOOTING"]);
