import type { TokenRecord, TokenScalar } from "./token-explorer.types";

const DARK_MODE_EXTENSION = "dev.pen.modes";

export function toCssVariableName(path: string) {
  return `--${path.replaceAll(".", "-")}`;
}

export function flattenTokens(payload: unknown): readonly TokenRecord[] {
  const records: TokenRecord[] = [];
  visitTokenNode(payload, [], undefined, records);
  return records.toSorted((left, right) => left.path.localeCompare(right.path));
}

function visitTokenNode(
  value: unknown,
  path: readonly string[],
  inheritedType: string | undefined,
  records: TokenRecord[],
) {
  if (!isRecord(value)) {
    return;
  }

  const type = getString(value["$type"]) ?? inheritedType;
  const tokenValue = value["$value"];
  if (isTokenScalar(tokenValue)) {
    const tokenPath = path.join(".");
    const dark = getDarkValue(value);
    records.push({
      path: tokenPath,
      cssName: toCssVariableName(tokenPath),
      type,
      light: tokenValue,
      dark,
      alias: getAlias(tokenValue),
      description: getString(value["$description"]),
    });
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith("$")) {
      visitTokenNode(child, [...path, key], type, records);
    }
  }
}

function getDarkValue(value: Record<string, unknown>) {
  const extensions = value["$extensions"];
  if (!isRecord(extensions)) {
    return undefined;
  }

  const modes = extensions[DARK_MODE_EXTENSION];
  if (!isRecord(modes)) {
    return undefined;
  }

  const dark = modes.dark;
  return isTokenScalar(dark) ? dark : undefined;
}

function getAlias(value: TokenScalar) {
  if (typeof value !== "string" || !value.startsWith("{") || !value.endsWith("}")) {
    return undefined;
  }
  return value.slice(1, -1);
}

function isTokenScalar(value: unknown): value is TokenScalar {
  return typeof value === "number" || typeof value === "string";
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
