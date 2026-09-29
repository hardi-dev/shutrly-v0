import { z } from "zod";

export const workspaceNameFieldSchema = z
  .string()
  .trim()
  .min(1, "Nama workspace wajib diisi.")
  .max(60, "Nama workspace maksimal 60 karakter.");
export const workspaceBrandNameFieldSchema = z
  .string()
  .trim()
  .max(80, "Nama brand maksimal 80 karakter.");
export const workspaceEmailFieldSchema = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .max(254, "Email maksimal 254 karakter.")
    .pipe(z.email("Masukkan email yang valid, mis. halo@studio.id")),
]);
export const workspacePhoneFieldSchema = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .regex(/^[0-9 +()\-]{8,20}$/, "Nomor telepon tidak valid."),
]);
export const workspaceAddressFieldSchema = z
  .string()
  .trim()
  .max(300, "Alamat maksimal 300 karakter.");
export const invoicePrefixFieldSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{2,6}$/, "Prefiks harus 2–6 huruf atau angka.");

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
