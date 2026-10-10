import { describe, expect, it } from "vitest";

import { findParityProblems } from "@/composition/locale/message-catalog/catalog-parity";

import { COPY_REGISTRY } from "./copy-registry";

describe("copy registry", () => {
  it("AC-L10N-003 the registered catalog has no parity problems", () => {
    expect(findParityProblems(COPY_REGISTRY)).toEqual([]);
  });
});
