// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ServiceDetailView } from "@/features/booking/application/use-cases/service-results/service-results.types";

import { ServiceDetailScreen } from "./service-detail-screen";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const SERVICE: ServiceDetailView = {
  id: "service-1",
  name: "Wisuda Basic",
  categoryId: "category-1",
  categoryName: "Wisuda",
  basePrice: "750000",
  currency: "IDR",
  isActive: true,
  items: [],
  fields: [],
  priceLabel: "Rp 750.000",
  summary: "",
};

describe("ServiceDetailScreen", () => {
  it("matches the empty detail export by placing edit and add actions in their card headers", () => {
    render(
      <ServiceDetailScreen
        service={SERVICE}
        workspaceId="workspace-1"
        setActiveAction={vi.fn().mockResolvedValue(undefined)}
        updateServiceInfoAction={vi.fn().mockResolvedValue({ ok: true })}
        addItemAction={vi.fn().mockResolvedValue({ ok: true })}
        addFieldAction={vi.fn().mockResolvedValue({ ok: true })}
      />,
    );

    const infoCard = screen.getByRole("region", { name: "Info layanan" });
    const itemsCard = screen.getByRole("region", { name: "Item paket" });
    const fieldsCard = screen.getByRole("region", { name: "Field booking" });

    expect(within(infoCard).getByRole("button", { name: "Ubah" })).toBeInTheDocument();
    expect(infoCard).toHaveTextContent("Status");
    expect(infoCard).toHaveTextContent("Aktif");
    expect(within(itemsCard).getByRole("button", { name: "Tambah item" })).toBeInTheDocument();
    expect(within(fieldsCard).getByRole("button", { name: "Tambah field" })).toBeInTheDocument();
    expect(screen.getAllByTestId("button-icon-leading")).toHaveLength(3);
  });
});
