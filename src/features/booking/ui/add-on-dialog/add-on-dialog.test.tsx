// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { useLocale } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddOnDialog } from "./add-on-dialog";
import type { AddOnDialogProps } from "./add-on-dialog.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const PROPS: AddOnDialogProps = {
  isOpen: true,
  onOpenChange: vi.fn(),
  workspaceId: "w1",
  projectId: "p1",
  targets: [],
  createAction: vi.fn(),
};

function priceInput(): HTMLInputElement {
  return screen.getByLabelText("Harga satuan");
}

describe("AddOnDialog locale reformat (AC-L10N-004)", () => {
  beforeEach(() => {
    vi.mocked(useLocale).mockReturnValue("id");
  });

  it("AC-L10N-004 a typed unit price is rewritten when the language changes", () => {
    const { rerender } = render(<AddOnDialog {...PROPS} />);
    fireEvent.change(priceInput(), { target: { value: "1.500" } });
    expect(priceInput().value).toBe("1.500");
    vi.mocked(useLocale).mockReturnValue("en");
    rerender(<AddOnDialog {...PROPS} />);
    expect(priceInput().value).toBe("1,500");
  });
});
