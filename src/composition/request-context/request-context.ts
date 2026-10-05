import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { after } from "next/server";

import { parseAppEnv } from "@/shared/env/app-env";

import type { RequestContext } from "./request-context.types";

// The part of the Worker ExecutionContext we use; typed here so no generated Workers types are needed.
interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
}

/**
 * Whether bindings come from the process environment (a production Node build, e.g. Netlify)
 * instead of the Cloudflare context. Workers and `next dev` (`.dev.vars`) keep the Cloudflare path.
 */
function usesProcessEnv(): boolean {
  const onWorkers = globalThis.navigator.userAgent === "Cloudflare-Workers";
  return process.env.NODE_ENV === "production" && !onWorkers;
}

async function getBindings(): Promise<{ env: unknown; waitUntil: WorkerContext["waitUntil"] }> {
  if (usesProcessEnv()) {
    return {
      env: process.env,
      waitUntil: (promise) => {
        after(() => promise);
      },
    };
  }
  const { env, ctx } = await getCloudflareContext<Record<string, unknown>, WorkerContext>({
    async: true,
  });
  return { env, waitUntil: ctx.waitUntil.bind(ctx) };
}

/**
 * Build the per-request context from the host bindings (Cloudflare context or process env)
 * and the request headers.
 * @returns the validated env, `waitUntil`, client IP, request ID and headers
 */
export async function getRequestContext(): Promise<RequestContext> {
  const { env, waitUntil } = await getBindings();
  const requestHeaders = await headers();
  return {
    env: parseAppEnv(env),
    waitUntil,
    ip: clientIp(requestHeaders),
    requestId:
      requestHeaders.get("cf-ray") ?? requestHeaders.get("x-nf-request-id") ?? crypto.randomUUID(),
    headers: requestHeaders,
  };
}

function clientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const netlify = requestHeaders.get("x-nf-client-connection-ip");
  return requestHeaders.get("cf-connecting-ip") ?? netlify ?? (forwarded || "unknown");
}
