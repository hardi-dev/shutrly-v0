/** BR-CLI-001: a client name is 1–100 characters after trimming; names are not unique. */
export const CLIENT_NAME_MAX_LENGTH = 100;

/** BR-CLI-001: checks client-name length by Unicode code points so emoji count once. @param name - a trimmed client name @returns whether the name fits the limit */
export function fitsClientNameLength(name: string): boolean {
  return Array.from(name).length <= CLIENT_NAME_MAX_LENGTH;
}
