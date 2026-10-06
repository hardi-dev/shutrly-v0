import { describe, expect, it } from "vitest";

import { accessCardState, maskedClientLink } from "./access-card";

describe("access card (aksesklien-kartu)", () => {
  it("A: a published or expired gallery is active", () => {
    expect(accessCardState("PUBLISHED", "DELIVERED")).toBe("ACTIVE");
    expect(accessCardState("EXPIRED", "POST_PROCESSING")).toBe("ACTIVE");
  });

  it("B: a draft gallery", () => {
    expect(accessCardState("DRAFT", "BOOKED")).toBe("DRAFT");
  });

  it("C: an archived gallery or a cancelled project", () => {
    expect(accessCardState("ARCHIVED", "COMPLETED")).toBe("INACTIVE");
    expect(accessCardState("PUBLISHED", "CANCELLED")).toBe("INACTIVE");
  });

  it("masks the token but its last 4 characters", () => {
    expect(maskedClientLink("shutrly.app", "abcdefghijklmnopqrstuvwxyz0123456789ABC3kQ9")).toBe(
      "shutrly.app/g/••••••••3kQ9",
    );
  });
});
