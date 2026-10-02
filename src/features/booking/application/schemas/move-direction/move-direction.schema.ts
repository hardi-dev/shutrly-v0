import { z } from "zod";

export const moveDirectionSchema = z.enum(["UP", "DOWN"]);
