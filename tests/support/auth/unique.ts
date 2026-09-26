/** A fresh address per call, so tests on the shared database never collide (ADR-009). */
export function uniqueEmail(tag = "owner"): string {
  return `${tag}+${crypto.randomUUID()}@test.shutrly.dev`;
}

/** A random private-range IP, so rate-limit counters never leak between tests. */
export function uniqueIp(): string {
  const [a = 0, b = 0, c = 0] = crypto.getRandomValues(new Uint8Array(3));
  return ["10", a, b, c].join(".");
}
