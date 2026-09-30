import { beforeEach, describe, expect, it, vi } from "vitest";

const saveWorkspaceProfile = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@/composition/workspace/workspace-flow/workspace-flow", () => ({ saveWorkspaceProfile }));
vi.mock("next/cache", () => ({ revalidatePath }));

const { saveWorkspaceSettingsAction } = await import("./settings");

const values = {
  name: "Aster",
  brandName: "",
  contactEmail: "",
  phone: "",
  address: "",
  invoicePrefix: "AW",
};

describe("saveWorkspaceSettingsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-WS-016 saves and revalidates the workspace so the sidebar shows the new name", async () => {
    saveWorkspaceProfile.mockResolvedValue({ ok: true });
    await expect(saveWorkspaceSettingsAction("ws-1", values)).resolves.toBeUndefined();
    expect(saveWorkspaceProfile).toHaveBeenCalledWith("ws-1", values);
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]", "layout");
  });

  it("AC-WS-017 returns the field errors and revalidates nothing", async () => {
    const failure = {
      ok: false,
      code: "DUPLICATE_NAME",
      fieldErrors: { name: "name.duplicate" },
    };
    saveWorkspaceProfile.mockResolvedValue(failure);
    await expect(saveWorkspaceSettingsAction("ws-1", values)).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
