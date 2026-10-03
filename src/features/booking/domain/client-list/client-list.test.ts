import { describe, expect, it } from "vitest";

import { CLIENT_PAGE_SIZE } from "./client-list";
import { clientStatusSchema } from "./client-list.schema";

describe("client list", () => {
  it("AC-CLI-005 pages 30 clients at a time (A-5)", () => {
    expect(CLIENT_PAGE_SIZE).toBe(30);
  });

  it("AC-CLI-002 accepts only the two list statuses", () => {
    expect(clientStatusSchema.safeParse("ACTIVE").success).toBe(true);
    expect(clientStatusSchema.safeParse("ARCHIVED").success).toBe(true);
    expect(clientStatusSchema.safeParse("DELETED").success).toBe(false);
  });
});
