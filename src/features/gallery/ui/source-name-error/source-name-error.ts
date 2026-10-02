import { SOURCE_COPY } from "../source-copy/source-copy.copy";

export type SourceNameErrorKey = keyof typeof SOURCE_COPY.nameErrors;

export const SOURCE_NAME_ERROR_KEYS: ReadonlyArray<SourceNameErrorKey> = [
  "EMPTY",
  "TOO_LONG",
  "NAME_TAKEN",
  "PROVIDER_UNAVAILABLE",
];

function isSourceNameErrorKey(key: string): key is SourceNameErrorKey {
  return SOURCE_NAME_ERROR_KEYS.some((candidate) => candidate === key);
}

export function sourceNameErrorText(key: string): string | undefined {
  if (!isSourceNameErrorKey(key)) return undefined;
  return SOURCE_COPY.nameErrors[key];
}
