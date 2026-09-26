type Fields = Record<string, unknown>;
type Level = "info" | "warn" | "error";

export const REDACTED = "[REDACTED]";

// Never log passwords, tokens, cookies, secrets, API keys, contact PII or any URL (C-103).
const SENSITIVE_KEY_PARTS = [
  "password",
  "token",
  "secret",
  "cookie",
  "apikey",
  "authorization",
  "email",
  "phone",
];
const URL_PATTERN = /\b[a-z][\w+.-]*:\/\/[^\s"'<>]+/gi;

function isSensitiveKey(key: string): boolean {
  const normalised = key.toLowerCase().replace(/[-_]/g, "");
  return (
    normalised.endsWith("url") || SENSITIVE_KEY_PARTS.some((part) => normalised.includes(part))
  );
}

function scrubUrls(text: string): string {
  return text.replace(URL_PATTERN, "[REDACTED_URL]");
}

function serialiseError(error: Error): Fields {
  return {
    name: error.name,
    message: scrubUrls(error.message),
    stack: error.stack === undefined ? undefined : scrubUrls(error.stack),
  };
}

function sanitiseObject(value: object, seen: WeakSet<object>): Fields {
  seen.add(value);
  const out: Fields = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = isSensitiveKey(key) ? REDACTED : sanitise(item, seen);
  }
  return out;
}

function sanitise(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) return serialiseError(value);
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return "[Circular]";
  if (!Array.isArray(value)) return sanitiseObject(value, seen);
  seen.add(value);
  return value.map((item: unknown) => sanitise(item, seen));
}

function write(level: Level, event: string, fields: Fields = {}): void {
  const safe = sanitiseObject(fields, new WeakSet());
  const line = JSON.stringify({ ...safe, level, event, time: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Structured JSON logger: one line per event, with secret and PII fields redacted by key. */
export const logger = {
  /** Log a routine event. */
  info(event: string, fields?: Fields): void {
    write("info", event, fields);
  },
  /** Log a recoverable problem. */
  warn(event: string, fields?: Fields): void {
    write("warn", event, fields);
  },
  /** Log a failure, e.g. an unexpected error. */
  error(event: string, fields?: Fields): void {
    write("error", event, fields);
  },
};
