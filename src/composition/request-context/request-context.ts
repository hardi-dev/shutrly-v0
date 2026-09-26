import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

import { parseAppEnv } from "@/shared/env/app-env";

import type { RequestContext } from "./request-context.types";

// The part of the Worker ExecutionContext we use; typed here so no generated Workers types are needed.
interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
}

/**
 * Build the per-request context from the Cloudflare Worker context and the request headers.
 * @returns the validated env, `waitUntil`, client IP, request ID and headers
 */
export async function getRequestContext(): Promise<RequestContext> {
  const { env, ctx } = await getCloudflareContext<Record<string, unknown>, WorkerContext>({
    async: true,
  });
  const requestHeaders = await headers();
  return {
    env: parseAppEnv(env),
    waitUntil: ctx.waitUntil.bind(ctx),
    ip: clientIp(requestHeaders),
    requestId: requestHeaders.get("cf-ray") ?? crypto.randomUUID(),
    headers: requestHeaders,
  };
}

function clientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return requestHeaders.get("cf-connecting-ip") ?? (forwarded || "unknown");
}
