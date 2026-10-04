import { describe, expect, it, vi } from "vitest";

import { createGoogleDriveProvider } from "./google-drive-provider";

const KEY = "AIza-test-key-secret";
const FOLDER = { folderId: "1AbCdEfGhIjKlMnOp", resourceKey: "0-rk" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("google drive provider (ADR-005, D-6)", () => {
  it("D-6 lists a folder with the key, the query, the fields and the resource-key header", async () => {
    const fetchFn = vi.fn(() =>
      Promise.resolve(
        json({
          files: [{ id: "f1", name: "IMG_001.jpg", mimeType: "image/jpeg", resourceKey: "0-x" }],
          nextPageToken: "next",
        }),
      ),
    );
    const provider = createGoogleDriveProvider(KEY, fetchFn);
    const result = await provider.listFolder(FOLDER, null);
    expect(result).toEqual({
      ok: true,
      entries: [{ id: "f1", name: "IMG_001.jpg", mimeType: "image/jpeg", resourceKey: "0-x" }],
      nextPageToken: "next",
    });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    const params = new URL(url).searchParams;
    expect(params.get("q")).toBe(`'${FOLDER.folderId}' in parents and trashed=false`);
    expect(params.get("pageSize")).toBe("1000");
    expect(params.get("key")).toBe(KEY);
    expect(init.headers).toEqual({ "X-Goog-Drive-Resource-Keys": `${FOLDER.folderId}/0-rk` });
  });

  it("D-6 maps 403/404 to NOT_PUBLIC, rate reasons and 429 to RATE_LIMITED, 5xx to UNAVAILABLE", async () => {
    const cases: [Response, string][] = [
      [json({ error: { errors: [{ reason: "notFound" }] } }, 404), "NOT_PUBLIC"],
      [json({ error: { errors: [{ reason: "forbidden" }] } }, 403), "NOT_PUBLIC"],
      [json({ error: { errors: [{ reason: "userRateLimitExceeded" }] } }, 403), "RATE_LIMITED"],
      [json({}, 429), "RATE_LIMITED"],
      [json({}, 503), "UNAVAILABLE"],
      [json({ unexpected: true, files: "nope" }), "UNAVAILABLE"],
    ];
    for (const [response, code] of cases) {
      const provider = createGoogleDriveProvider(KEY, () => Promise.resolve(response));
      expect(await provider.listFolder(FOLDER, null)).toEqual({ ok: false, code });
    }
  });

  it("AC-GAL-008 never puts the key or a URL in a failure", async () => {
    const provider = createGoogleDriveProvider(KEY, () =>
      Promise.reject(
        new Error(`fetch failed https://www.googleapis.com/drive/v3/files?key=${KEY}`),
      ),
    );
    const result = await provider.listFolder(FOLDER, null);
    expect(result).toEqual({ ok: false, code: "UNAVAILABLE" });
    expect(JSON.stringify(result)).not.toContain(KEY);
  });

  it("D-6 reads the folder name and refuses a file", async () => {
    const folder = createGoogleDriveProvider(KEY, () =>
      Promise.resolve(
        json({ id: "x", name: "Rina-Wisuda", mimeType: "application/vnd.google-apps.folder" }),
      ),
    );
    expect(await folder.getFolder(FOLDER)).toEqual({ ok: true, name: "Rina-Wisuda" });
    const file = createGoogleDriveProvider(KEY, () =>
      Promise.resolve(json({ id: "x", name: "a.jpg", mimeType: "image/jpeg" })),
    );
    expect(await file.getFolder(FOLDER)).toEqual({ ok: false, code: "NOT_PUBLIC" });
  });

  it("D-10 fetches the sized thumbnail from googleusercontent only", async () => {
    const fetchFn = vi.fn((url: string) =>
      Promise.resolve(
        url.startsWith("https://www.googleapis.com")
          ? json({ thumbnailLink: "https://lh3.googleusercontent.com/abc=s220" })
          : new Response("img", { headers: { "content-type": "image/jpeg" } }),
      ),
    );
    const provider = createGoogleDriveProvider(KEY, fetchFn);
    const result = await provider.thumbnail({ fileId: "f1", resourceKey: null }, "preview");
    expect(result).toMatchObject({ ok: true, contentType: "image/jpeg" });
    expect(fetchFn.mock.calls[1][0]).toBe("https://lh3.googleusercontent.com/abc=s1600");
  });

  it("D-10 refuses another host or a non-image body", async () => {
    const evil = createGoogleDriveProvider(KEY, () =>
      Promise.resolve(json({ thumbnailLink: "https://evil.example.com/abc=s220" })),
    );
    expect(await evil.thumbnail({ fileId: "f1", resourceKey: null }, "thumb")).toEqual({
      ok: false,
    });
    const html = createGoogleDriveProvider(KEY, (url: string) =>
      Promise.resolve(
        url.startsWith("https://www.googleapis.com")
          ? json({ thumbnailLink: "https://lh3.googleusercontent.com/abc=s220" })
          : new Response("<html>", { headers: { "content-type": "text/html" } }),
      ),
    );
    expect(await html.thumbnail({ fileId: "f1", resourceKey: null }, "thumb")).toEqual({
      ok: false,
    });
  });
});
