import { z } from "zod";

// Messages are stable field-error keys (A-1…A-4); the UI maps them to Indonesian copy.
export const workspaceNameFieldSchema = z
  .string()
  .trim()
  .min(1, "name.required")
  .max(60, "name.tooLong");
export const workspaceBrandNameFieldSchema = z.string().trim().max(80, "brandName.tooLong");
export const workspaceEmailFieldSchema = z
  .string()
  .trim()
  .max(254, "email.invalid")
  .refine((value) => value === "" || z.email().safeParse(value).success, "email.invalid");
export const workspacePhoneFieldSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^[0-9 +()-]{8,20}$/.test(value), "phone.invalid");
export const workspaceAddressFieldSchema = z.string().trim().max(300, "address.tooLong");
export const invoicePrefixFieldSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{2,6}$/, "prefix.invalid");

export const createWorkspaceFieldsSchema = z.object({
  name: workspaceNameFieldSchema,
});

export const updateWorkspaceProfileFieldsSchema = z.object({
  name: workspaceNameFieldSchema,
  brandName: workspaceBrandNameFieldSchema,
  contactEmail: workspaceEmailFieldSchema,
  phone: workspacePhoneFieldSchema,
  address: workspaceAddressFieldSchema,
  invoicePrefix: invoicePrefixFieldSchema,
});
