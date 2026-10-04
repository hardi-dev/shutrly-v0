import "server-only";

import type { RandomIntPort } from "@/features/gallery/application/ports/random-int/random-int.port";

const UINT32_RANGE = 2 ** 32;

/** Creates an unbiased CSPRNG integer source by rejection sampling (D-4). @returns the integer source */
export function createWebCryptoRandomInt(): RandomIntPort {
  return (maxExclusive) => {
    // Values above the largest multiple of maxExclusive would bias the low results.
    const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
    const buffer = new Uint32Array(1);
    do crypto.getRandomValues(buffer);
    while (buffer[0] >= limit);
    return buffer[0] % maxExclusive;
  };
}
