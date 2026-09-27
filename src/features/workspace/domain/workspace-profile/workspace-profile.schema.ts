import { z } from "zod";

const optionalTextSchema = (max: number) =>
  z
    .union([z.literal(""), z.string().trim().max(max)])
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

export const workspaceProfileSchema = z.object({
  name: z.string().trim().min(1).max(60),
  brandName: optionalTextSchema(80),
  contactEmail: z
    .union([z.literal(""), z.string().trim().max(254).pipe(z.email())])
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
  phone: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(/^[0-9 +()\-]{8,20}$/),
    ])
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
  address: optionalTextSchema(300),
});
