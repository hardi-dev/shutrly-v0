/**
 * Hash a string with SHA-256 through Web Crypto, which Workers and Node 22 both provide.
 * @param value - the text to hash
 * @returns the lower-case hex digest
 */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
