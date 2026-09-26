import type { AppEnv } from "@/shared/env/app-env.types";

export interface RequestContext {
  env: AppEnv;
  waitUntil(promise: Promise<unknown>): void;
  ip: string;
  requestId: string;
  headers: Headers;
}
