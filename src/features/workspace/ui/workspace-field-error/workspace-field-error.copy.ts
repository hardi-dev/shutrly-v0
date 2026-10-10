// Source: copy-deck.md §4.5 "Workspace field validation". Copied verbatim.
// next-intl reads dots as nesting, so WORKSPACE_FIELD_ERROR_MESSAGE_KEY maps the stable
// field-error keys to camel-case message keys.
import type { WorkspaceFieldErrorKey } from "@/features/workspace/application/schemas/workspace-fields/workspace-fields.types";

export const WORKSPACE_FIELD_ERROR_COPY_NAMESPACE = "workspaceFieldError";

export const WORKSPACE_FIELD_ERROR_COPY = {
  namespace: WORKSPACE_FIELD_ERROR_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      nameRequired: "Enter a workspace name.",
      nameTooLong: "Use no more than 60 characters.",
      nameDuplicate: "You already have a workspace with this name.",
      brandNameTooLong: "Use no more than 80 characters.",
      emailInvalid: "Enter a valid email, such as hello@studio.com.",
      phoneInvalid: "Use 8–20 digits, spaces, +, - or parentheses.",
      addressTooLong: "Use no more than 300 characters.",
      prefixInvalid: "Use 2–6 letters or numbers.",
    },
    id: {
      nameRequired: "Isi nama ruang kerja.",
      nameTooLong: "Gunakan maksimal 60 karakter.",
      nameDuplicate: "Kamu sudah punya ruang kerja dengan nama ini.",
      brandNameTooLong: "Gunakan maksimal 80 karakter.",
      emailInvalid: "Masukkan email yang valid, misalnya halo@studio.id.",
      phoneInvalid: "Gunakan 8–20 angka, spasi, +, -, atau tanda kurung.",
      addressTooLong: "Gunakan maksimal 300 karakter.",
      prefixInvalid: "Gunakan 2–6 huruf atau angka.",
    },
  },
} as const;

/** The stable field-error keys mapped to their message keys. */
export const WORKSPACE_FIELD_ERROR_MESSAGE_KEY = {
  "name.required": "nameRequired",
  "name.tooLong": "nameTooLong",
  "name.duplicate": "nameDuplicate",
  "brandName.tooLong": "brandNameTooLong",
  "email.invalid": "emailInvalid",
  "phone.invalid": "phoneInvalid",
  "address.tooLong": "addressTooLong",
  "prefix.invalid": "prefixInvalid",
} as const satisfies Record<WorkspaceFieldErrorKey, string>;
