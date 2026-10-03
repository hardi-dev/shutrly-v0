import "server-only";

/** Produces a fresh URL-safe client access token (BR-PRJ-003). */
export type AccessTokenGeneratorPort = () => string;
