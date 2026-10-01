import { beforeEach, describe, expect, it, vi } from "vitest";

const saveMessageTemplate = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@/composition/communications/message-template-flow/message-template-flow", () => ({
  saveMessageTemplate,
}));
vi.mock("next/cache", () => ({ revalidatePath }));

const { saveMessageTemplateAction } = await import("./message-templates");

describe("saveMessageTemplateAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-MSG-007 saves and revalidates the template list", async () => {
    saveMessageTemplate.mockResolvedValue({ ok: true });
    await expect(
      saveMessageTemplateAction("ws-1", "invoice-share", { content: "{{invoiceUrl}}" }),
    ).resolves.toBeUndefined();
    expect(saveMessageTemplate).toHaveBeenCalledWith("ws-1", "invoice-share", {
      content: "{{invoiceUrl}}",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/message-templates", "page");
  });

  it("AC-MSG-009 returns the field error and revalidates nothing", async () => {
    const failure = {
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { content: "UNKNOWN_VARIABLE:invoiceUrl" },
    };
    saveMessageTemplate.mockResolvedValue(failure);
    await expect(
      saveMessageTemplateAction("ws-1", "gallery-share", { content: "{{invoiceUrl}}" }),
    ).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
