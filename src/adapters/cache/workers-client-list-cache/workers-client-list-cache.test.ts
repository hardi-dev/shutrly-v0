import { describe, expect, it, vi } from "vitest";

import { createWorkersClientListCache } from "./workers-client-list-cache";

function memoryCache() {
  const store = new Map<string, string>();
  return {
    match: vi.fn((request: Request) => {
      const body = store.get(request.url);
      return Promise.resolve(body === undefined ? undefined : new Response(body));
    }),
    put: vi.fn(async (request: Request, response: Response) => {
      store.set(request.url, await response.text());
    }),
  };
}

describe("workers client-list cache (D-22, R-2)", () => {
  it("stores and returns a page by key", async () => {
    const cache = createWorkersClientListCache(memoryCache());
    expect(await cache.read("g:1:PROOF")).toBeNull();
    await cache.write("g:1:PROOF", '{"a":1}');
    expect(await cache.read("g:1:PROOF")).toBe('{"a":1}');
  });

  it("is a no-op where the runtime has no cache", async () => {
    const cache = createWorkersClientListCache(null);
    await cache.write("k", "v");
    expect(await cache.read("k")).toBeNull();
  });

  it("treats a failing cache as a miss", async () => {
    const broken = {
      match: vi.fn(() => Promise.reject(new Error("down"))),
      put: vi.fn(() => Promise.reject(new Error("down"))),
    };
    const cache = createWorkersClientListCache(broken);
    await expect(cache.write("k", "v")).resolves.toBeUndefined();
    expect(await cache.read("k")).toBeNull();
  });
});
