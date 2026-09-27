import { z } from "zod";

export const workspaceNameFieldSchema = z.string().trim();
export const workspaceBrandNameFieldSchema = z.string().trim();
export const workspaceEmailFieldSchema = z.string().trim();
export const workspacePhoneFieldSchema = z.string().trim();
export const workspaceAddressFieldSchema = z.string().trim();
export const invoicePrefixFieldSchema = z.string().trim();

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
