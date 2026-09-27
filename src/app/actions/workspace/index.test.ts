import { describe, expect, it } from "vitest";

import * as createActions from "./create";
import * as actions from "./onboarding";
import * as switchActions from "./switch";

describe("workspace server actions", () => {
  it("AC-WS-020 exposes create and switch actions without delete/archive operations", () => {
    expect(Object.keys(actions)).toContain("createFirstWorkspaceAction");
    expect(Object.keys(createActions)).toContain("createWorkspaceAction");
    expect(Object.keys(switchActions)).toContain("switchWorkspaceAction");
    expect(Object.keys({ ...actions, ...createActions, ...switchActions })).not.toContain(
      "deleteWorkspaceAction",
    );
  });
});
