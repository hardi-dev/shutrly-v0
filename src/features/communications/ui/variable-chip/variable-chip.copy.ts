export const VARIABLE_CHIP_COPY = {
  required: "wajib",
  // not in Pencil: the chip's accessible name.
  insert: (name: string, isRequired: boolean) =>
    `Sisipkan {{${name}}}${isRequired ? ", wajib" : ""}`,
} as const;
