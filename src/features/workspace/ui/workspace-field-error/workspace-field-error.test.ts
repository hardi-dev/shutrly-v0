import { describe, expect, it } from "vitest";

import { workspaceFieldErrorText } from "./workspace-field-error";
import { WORKSPACE_FIELD_ERROR_COPY } from "./workspace-field-error.copy";

describe("workspaceFieldErrorText", () => {
  it("AC-WS-017 maps a schema or server error key to its Indonesian message", () => {
    expect(workspaceFieldErrorText("name.duplicate")).toBe(
      WORKSPACE_FIELD_ERROR_COPY["name.duplicate"],
    );
  });

  it("returns nothing for no error or an unknown message", () => {
    expect(workspaceFieldErrorText(undefined)).toBeUndefined();
    expect(workspaceFieldErrorText("boom")).toBeUndefined();
  });
});
