import { describe, expect, it } from "vitest";

import { accessCardState, maskedClientLink } from "./access-card";

describe("access card (aksesklien-kartu)", () => {
  it("A: an open or expired gallery is active", () => {
    expect(accessCardState("OPEN")).toBe("ACTIVE");
    expect(accessCardState("EXPIRED")).toBe("ACTIVE");
  });

  it("C: a closed gallery, which is the cancelled project's, is inactive", () => {
    expect(accessCardState("CLOSED")).toBe("INACTIVE");
  });

  it("masks the token but its last 4 characters", () => {
    expect(maskedClientLink("shutrly.app", "abcdefghijklmnopqrstuvwxyz0123456789ABC3kQ9")).toBe(
      "shutrly.app/g/••••••••3kQ9",
    );
  });
});
