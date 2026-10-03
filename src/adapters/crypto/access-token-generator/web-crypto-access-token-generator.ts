import "server-only";

import type { AccessTokenGeneratorPort } from "@/features/booking/application/ports/access-token-generator/access-token-generator.port";

export const ACCESS_TOKEN_BYTES = 32;

/** Creates a 256-bit URL-safe client access token from Web Crypto (BR-PRJ-003, ADR-004). @returns the generator */
export function createWebCryptoAccessTokenGenerator(): AccessTokenGeneratorPort {
  return () => {
    const bytes = crypto.getRandomValues(new Uint8Array(ACCESS_TOKEN_BYTES));
    return btoa(String.fromCharCode(...bytes))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "");
  };
}
