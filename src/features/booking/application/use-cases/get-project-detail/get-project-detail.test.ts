import { describe, expect, it } from "vitest";

import {
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { getProjectDetail } from "./get-project-detail";

describe("get project detail (AC-PRJ-025)", () => {
  it("throws NOT_FOUND when the project is missing", async () => {
    await expect(
      getProjectDetail(projectFixture(), projectContext, "missing"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
