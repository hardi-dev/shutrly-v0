import { SOURCE_NAME_ERROR_MESSAGE_KEY } from "../source-copy/source-copy.copy";
import type { SourceTranslate } from "../source-copy/source-copy.types";

export type SourceNameErrorKey = keyof typeof SOURCE_NAME_ERROR_MESSAGE_KEY;

export const SOURCE_NAME_ERROR_KEYS: ReadonlyArray<SourceNameErrorKey> = [
  "EMPTY",
  "TOO_LONG",
  "NAME_TAKEN",
  "PROVIDER_UNAVAILABLE",
];

function isSourceNameErrorKey(key: string): key is SourceNameErrorKey {
  return SOURCE_NAME_ERROR_KEYS.some((candidate) => candidate === key);
}

/**
 * The approved message for a name-field error code.
 * @param t - the photo sources translator
 * @param key - the server's error code
 * @returns the message, or undefined for an unknown code
 */
export function sourceNameErrorText(t: SourceTranslate, key: string): string | undefined {
  if (!isSourceNameErrorKey(key)) return undefined;
  return t(SOURCE_NAME_ERROR_MESSAGE_KEY[key]);
}
