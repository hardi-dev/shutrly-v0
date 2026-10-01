import { describe, expect, it } from "vitest";

import { findSourceNameProblem } from "../source-name/source-name";
import { DEFAULT_SOURCE } from "./default-source";

describe("default source (BR-SRC-005/006)", () => {
  it("AC-SRC-002 uses Google Drive as the seeded source", () => {
    expect(DEFAULT_SOURCE).toEqual({ provider: "GOOGLE_DRIVE", displayName: "Google Drive" });
    expect(findSourceNameProblem(DEFAULT_SOURCE.displayName)).toBeNull();
  });
});
