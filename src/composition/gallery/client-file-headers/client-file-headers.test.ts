import { describe, expect, it } from "vitest";

import { clientFileHeaders } from "./client-file-headers";

const FILE = {
  ok: true as const,
  body: new ReadableStream<Uint8Array>(),
  contentType: "image/jpeg",
  contentLength: "8500000",
  fileName: "E_001.jpg",
};

describe("clientFileHeaders (D-18)", () => {
  it("AC-DEL-003 names the original file, keeps its type and is never cached", () => {
    expect(clientFileHeaders(FILE)).toEqual({
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="E_001.jpg"; filename*=UTF-8''E_001.jpg`,
      "Content-Length": "8500000",
    });
  });

  it("keeps a non-ASCII name exact and gives an ASCII fallback", () => {
    const headers = clientFileHeaders({
      ...FILE,
      fileName: 'Rina "wisuda" é.jpg',
      contentLength: null,
    });
    expect(headers["Content-Disposition"]).toBe(
      `attachment; filename="Rina _wisuda_ _.jpg"; filename*=UTF-8''Rina%20%22wisuda%22%20%C3%A9.jpg`,
    );
    expect(headers).not.toHaveProperty("Content-Length");
  });
});
