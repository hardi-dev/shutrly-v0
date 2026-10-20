import "server-only";

import { headers } from "next/headers";
import { after } from "next/server";
import type { z } from "zod";

import { parseAppEnv } from "@/shared/env/app-env";

import type { RequestContext, ScopedRequestContext } from "./request-context.types";

/**
 * Build the per-request context from the process environment and the request headers. The app runs
 * as a Node server (Coolify, Netlify); `next dev` loads `.dev.vars` into the environment in next.config.ts.
 * @returns the validated env, `waitUntil`, client IP, request ID and headers
 */
export async function getRequestContext(): Promise<RequestContext> {
  const requestHeaders = await headers();
  return {
    env: parseAppEnv(process.env),
    waitUntil: waitUntilAfterResponse,
    ip: clientIp(requestHeaders),
    requestId: requestIdOf(requestHeaders),
    headers: requestHeaders,
  };
}

/**
 * A narrow request context for a public endpoint that needs only a few bindings: it checks just
 * those, so it works where the full AppEnv doesn't exist (the landing-only production, ADR-021,
 * ADR-022).
 * @param schema - the endpoint's own bindings schema
 * @returns the endpoint's bindings and the request ID; throws when the bindings don't match
 */
export async function getScopedRequestContext<T>(
  schema: z.ZodType<T>,
): Promise<ScopedRequestContext<T>> {
  const env = await getScopedBindings(schema);
  const requestHeaders = await headers();
  return { env, requestId: requestIdOf(requestHeaders) };
}

/**
 * Only the given bindings, without request headers, for code that runs before a route does
 * (the proxy's production gate, ADR-021).
 * @param schema - the bindings to read
 * @returns the parsed bindings; throws when they don't match
 */
// eslint-disable-next-line @typescript-eslint/require-await -- async keeps the contract callers await and catch
export async function getScopedBindings<T>(schema: z.ZodType<T>): Promise<T> {
  return schema.parse(process.env);
}

function waitUntilAfterResponse(promise: Promise<unknown>): void {
  after(() => promise);
}

function requestIdOf(requestHeaders: Headers): string {
  return requestHeaders.get("x-nf-request-id") ?? crypto.randomUUID();
}

function clientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const netlify = requestHeaders.get("x-nf-client-connection-ip");
  return netlify ?? (forwarded || "unknown");
}
