import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.hoisted(() => vi.fn(() => false));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { ServicePicker } = await import("./service-picker");

const SERVICE = {
  id: "s1",
  name: "Wisuda Basic",
  categoryName: "Wisuda",
  basePrice: "750000",
  isActive: true,
  items: [],
  fields: [],
};
const GROUPS = [{ categoryId: "c1", categoryName: "Wisuda", services: [SERVICE] }];

describe("ServicePicker (AC-PRJ-006)", () => {
  it("AC-PRJ-006 groups the services by category and picks one", async () => {
    const onChange = vi.fn();
    render(<ServicePicker serviceGroups={GROUPS} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Layanan/ }));
    expect(screen.getByRole("group", { name: "Wisuda" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "Wisuda Basic" }));
    expect(onChange).toHaveBeenCalledWith("s1");
  });

  it("AC-PRJ-007 shows the category and base price as the helper once chosen", () => {
    render(<ServicePicker serviceGroups={GROUPS} value="s1" onChange={vi.fn()} />);
    expect(screen.getByText("Wisuda · harga dasar Rp 750.000")).toBeInTheDocument();
  });

  it("AC-PRJ-012 shows the inactive-service error", () => {
    render(
      <ServicePicker
        serviceGroups={GROUPS}
        value="s1"
        onChange={vi.fn()}
        errorMessage="Layanan ini sudah tidak aktif. Pilih layanan lain."
      />,
    );
    expect(
      screen.getByText("Layanan ini sudah tidak aktif. Pilih layanan lain."),
    ).toBeInTheDocument();
  });
});
