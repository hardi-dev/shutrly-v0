import { z } from "zod";

export const invoicePrefixSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{2,6}$/)
  .brand<"InvoicePrefix">();
