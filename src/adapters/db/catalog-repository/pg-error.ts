import "server-only";

export function pgCode(error: unknown): string | undefined {
  const read = (value: unknown) =>
    typeof value === "object" && value !== null && "code" in value && typeof value.code === "string"
      ? value.code
      : undefined;
  if (read(error)) return read(error);
  if (typeof error === "object" && error !== null && "cause" in error) return read(error.cause);
  return undefined;
}

const FOREIGN_KEY_VIOLATION = "23503";
const RESTRICT_VIOLATION = "23001";

/** Tells whether a delete failed because another row still references it (NO ACTION or RESTRICT). @param error - the thrown database error @returns true for a foreign-key or restrict violation */
export function isReferencedRowError(error: unknown): boolean {
  const code = pgCode(error);
  return code === FOREIGN_KEY_VIOLATION || code === RESTRICT_VIOLATION;
}
