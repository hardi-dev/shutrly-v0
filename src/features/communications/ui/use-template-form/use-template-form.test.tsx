import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";

import { useTemplateForm } from "./use-template-form";

function setup() {
  const action = vi.fn().mockResolvedValue(undefined);
  const options = {
    type: "GALLERY_SHARE" as const,
    content: "Halo {{galleryUrl}} custom",
    defaultContent: DEFAULT_TEMPLATE_CONTENT.id.GALLERY_SHARE,
    action,
    onSaved: vi.fn(),
    onFailed: vi.fn(),
  };
  return { action, ...renderHook(() => useTemplateForm(options)) };
}

describe("useTemplateForm save mode", () => {
  it("AC-L10N-008 saves a restored platform default as mode default", async () => {
    const { action, result } = setup();
    act(() => {
      result.current.restoreDefault();
    });
    act(() => {
      result.current.onSubmit();
    });
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith(
        { content: DEFAULT_TEMPLATE_CONTENT.id.GALLERY_SHARE },
        "default",
      );
    });
  });

  it("AC-L10N-008 an edit after restoring the default saves as custom", async () => {
    const { action, result } = setup();
    act(() => {
      result.current.restoreDefault();
    });
    act(() => {
      result.current.insertVariable("clientName");
    });
    act(() => {
      result.current.onSubmit();
    });
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith(expect.any(Object), "custom");
    });
  });

  it("AC-L10N-008 text never restored saves as custom", async () => {
    const { action, result } = setup();
    act(() => {
      result.current.onSubmit();
    });
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith(expect.any(Object), "custom");
    });
  });
});
