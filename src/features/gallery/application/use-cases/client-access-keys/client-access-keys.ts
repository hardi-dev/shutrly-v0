import "server-only";

import { sha256Hex } from "@/shared/crypto/sha256-hex/sha256-hex";

const TOKEN_HASH_LENGTH = 32;

/** The token fingerprint stored in the session cookie and in counter keys (D-3, C-103). @param token - the client access token @returns the first 32 hex chars of its SHA-256 */
export async function tokenHashOf(token: string): Promise<string> {
  return (await sha256Hex(token)).slice(0, TOKEN_HASH_LENGTH);
}

/** Counter key for unknown tokens per address; never holds the address in clear (D-6). @param ip - the client address @returns the hashed key */
export async function unknownTokenKey(ip: string): Promise<string> {
  return `client:unknown:${await sha256Hex(ip)}`;
}

/** Counter keys for password attempts per token and address, and per token (D-5, D-6). @param tokenHash - the token fingerprint @param ip - the client address @returns both hashed keys */
export async function passwordKeys(
  tokenHash: string,
  ip: string,
): Promise<readonly [string, string]> {
  return [`client:pw:${tokenHash}:${await sha256Hex(ip)}`, `client:pw:${tokenHash}`];
}
