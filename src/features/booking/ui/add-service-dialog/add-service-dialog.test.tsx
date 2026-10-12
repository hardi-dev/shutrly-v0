// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { pressEnterInField } from "@tests/support/forms/implicit-submit";

import { AddServiceDialog } from "./add-service-dialog";

describe("AddServiceDialog", () => {
  it("shows the category placeholder and resets it after closing", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const categories = [
      { id: "cat-1", name: "Graduation", isActive: true, serviceCount: 0, archivedServiceCount: 0 },
    ];
    const props = {
      isOpen: true,
      workspaceId: "ws-1",
      categories,
      onOpenChange,
      action: vi.fn().mockResolvedValue({ ok: true, serviceId: "service-1" }),
    } as const;
    const { rerender } = render(<AddServiceDialog {...props} />);

    expect(screen.getByRole("textbox", { name: "Nama layanan" })).toHaveAttribute(
      "placeholder",
      "Contoh: Wisuda Dasar",
    );
    expect(screen.getByRole("textbox", { name: "Harga dasar" })).toHaveAttribute(
      "placeholder",
      "0",
    );
    expect(screen.getByTestId("input-adornment-leading")).toHaveTextContent("Rp");
    const categoryTrigger = screen.getByRole("button", { name: /Kategori/ });
    expect(categoryTrigger).toHaveTextContent("Pilih kategori");

    await user.click(categoryTrigger);
    await user.click(screen.getByRole("option", { name: "Graduation" }));
    expect(screen.getByRole("button", { name: /Kategori/ })).toHaveTextContent("Graduation");

    await user.click(screen.getByRole("button", { name: "Tutup" }));
    rerender(<AddServiceDialog {...props} isOpen={false} />);
    rerender(<AddServiceDialog {...props} />);

    expect(screen.getByRole("button", { name: /Kategori/ })).toHaveTextContent("Pilih kategori");
  });

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

    await userEvent.click(screen.getByRole("button", { name: "Kategori baru" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Nama kategori" }), "Wisuda");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

    expect(addCategoryAction).toHaveBeenCalledWith("ws-1", { name: "Wisuda" });
    const categoryTriggers = await screen.findAllByRole("button", { name: /Kategori/ });
    expect(categoryTriggers[0]).toHaveTextContent("Wisuda");
  });
});

describe("AddServiceDialog submits on Enter (AC-SFX-009, AC-SFX-010)", () => {
  const props = {
    isOpen: true,
    workspaceId: "ws-1",
    categories: [],
    onOpenChange: vi.fn(),
  } as const;

  it("AC-SFX-009 Enter in the name field saves once with the same input as Save", async () => {
    const action = vi.fn().mockResolvedValue({ ok: true, serviceId: "service-1" });
    render(<AddServiceDialog {...props} action={action} />);
    const name = screen.getByRole("textbox", { name: "Nama layanan" });
    await userEvent.type(name, "Wisuda Dasar");
    pressEnterInField(name, screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });
    expect(action).toHaveBeenCalledWith("ws-1", {
      name: "Wisuda Dasar",
      categoryId: null,
      basePrice: "",
    });
  });

  it("AC-SFX-010 a second Enter while saving sends no second save", async () => {
    const action = vi.fn(() => new Promise<never>(() => undefined));
    render(<AddServiceDialog {...props} action={action} />);
    const name = screen.getByRole("textbox", { name: "Nama layanan" });
    await userEvent.type(name, "Wisuda Dasar");
    const primary = screen.getByRole("button", { name: "Simpan" });
    pressEnterInField(name, primary);
    pressEnterInField(name, primary);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("AC-SFX-009 Enter shows the same server field error as Save", async () => {
    const action = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
    render(<AddServiceDialog {...props} action={action} />);
    const name = screen.getByRole("textbox", { name: "Nama layanan" });
    await userEvent.type(name, "Wisuda Dasar");
    pressEnterInField(name, screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Nama ini sudah dipakai.")).toBeInTheDocument();
  });
});
