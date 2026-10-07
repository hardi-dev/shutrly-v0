import "server-only";

import type { ClientListCachePort } from "@/features/gallery/application/ports/client-list-cache/client-list-cache.port";

// A synthetic, never-fetched origin: the Cache API only takes request URLs as keys (D-22).
const KEY_ORIGIN = "https://client-list.cache.internal/";
// A key changes with content_version, so this only bounds how long a stale page can sit unused.
const MAX_AGE_SECONDS = 3600;

interface EdgeCache {
  readonly match: (request: Request) => Promise<Response | undefined>;
  readonly put: (request: Request, response: Response) => Promise<void>;
}

function isEdgeCache(value: unknown): value is EdgeCache {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "match") === "function" &&
    typeof Reflect.get(value, "put") === "function"
  );
}

/** Cloudflare's `caches.default`, or null where the runtime has none (Netlify, Node, tests; Slice 0 R-2). @returns the cache or null */
function defaultCache(): EdgeCache | null {
  const storage: unknown = Reflect.get(globalThis, "caches");
  if (typeof storage !== "object" || storage === null) return null;
  const cache: unknown = Reflect.get(storage, "default");
  return isEdgeCache(cache) ? cache : null;
}

const keyRequest = (key: string) => new Request(`${KEY_ORIGIN}${encodeURIComponent(key)}`);

/**
 * The client photo-list cache over the Workers Cache API; a no-op without one, and every error is a
 * miss, so behaviour never depends on it (D-22, ADR-019 point 5). Read only after the gate passed.
 * @param cache - injectable for tests; defaults to `caches.default`
 * @returns the cache port
 */
export function createWorkersClientListCache(
  cache: EdgeCache | null = defaultCache(),
): ClientListCachePort {
  return {
    async read(key) {
      if (!cache) return null;
      try {
        const hit = await cache.match(keyRequest(key));
        return hit ? await hit.text() : null;
      } catch {
        return null;
      }
    },
    async write(key, json) {
      if (!cache) return;
      try {
        const headers = {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${String(MAX_AGE_SECONDS)}`,
        };
        await cache.put(keyRequest(key), new Response(json, { headers }));
      } catch {
        // Best effort: a failed write is only a later miss.
      }
    },
  };
}
