import { describe, expect, it } from "vitest";

import { isSessionValid } from "./client-session";
import type { SessionCheckInput } from "./client-session.types";

const valid: SessionCheckInput = {
  payload: { v: 1, sid: "s", projectId: "p1", galleryId: "g1", pv: 2, th: "h1", exp: 1000 },
  projectId: "p1",
  galleryId: "g1",
  passwordVersion: 2,
  tokenHash: "h1",
  nowSeconds: 999,
};

describe("client session (ADR-021, A-1)", () => {
  it("AC-ACC-001 accepts a matching, unexpired session", () => {
    expect(isSessionValid(valid)).toBe(true);
  });

  it.each([
    ["AC-ACC-008 a rotated password", { passwordVersion: 3 }],
    ["AC-ACC-009 a rotated link", { tokenHash: "h2" }],
    ["AC-ACC-006 another project", { projectId: "p2" }],
    ["AC-ACC-006 another gallery", { galleryId: "g2" }],
    ["A-1 the expiry second itself", { nowSeconds: 1000 }],
  ])("refuses %s", (_case, change) => {
    expect(isSessionValid({ ...valid, ...change })).toBe(false);
  });
});
