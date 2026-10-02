// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { AddServiceDialog } from "./add-service-dialog";

describe("AddServiceDialog", () => {
  it("AC-CAT-004 creates a category inline and selects it", async () => {
    const addCategoryAction = vi.fn().mockResolvedValue({ ok: true, categoryId: "cat-1" });
    render(
      <AddServiceDialog
        isOpen
        workspaceId="ws-1"
        categories={[]}
        onOpenChange={vi.fn()}
        action={vi.fn().mockResolvedValue({ ok: true, serviceId: "service-1" })}
        addCategoryAction={addCategoryAction}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "+ Kategori baru" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Nama kategori" }), "Wisuda");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

    expect(addCategoryAction).toHaveBeenCalledWith("ws-1", { name: "Wisuda" });
    const categoryTriggers = await screen.findAllByRole("button", { name: /Kategori/ });
    expect(categoryTriggers[0]).toHaveTextContent("Wisuda");
  });
});
