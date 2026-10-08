import { afterEach, describe, expect, it, vi } from "vitest";

import { postWaitlist } from "./post-waitlist";

const input = { email: "rina@example.com", website: "" };

function respond(body: unknown, status = 200) {
  const fetch = vi.fn(() => Promise.resolve(Response.json(body, { status })));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

describe("postWaitlist", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("AC-LND-005 posts the form as JSON and returns the endpoint's answer", async () => {
    const fetch = respond({ status: "JOINED" });
    expect(await postWaitlist(input)).toEqual({ status: "JOINED" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/waitlist",
      expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
    );
  });

  it("AC-LND-008 turns the edge's HTTP 429 into RATE_LIMITED", async () => {
    respond("Too Many Requests", 429);
    expect(await postWaitlist(input)).toEqual({ status: "RATE_LIMITED" });
  });

  it("AC-LND-010 answers FAILED to a server error or an unexpected body", async () => {
    respond({ status: "JOINED" }, 502);
    expect(await postWaitlist(input)).toEqual({ status: "FAILED" });
    respond({ surprise: true });
    expect(await postWaitlist(input)).toEqual({ status: "FAILED" });
  });
});
