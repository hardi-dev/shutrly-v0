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
