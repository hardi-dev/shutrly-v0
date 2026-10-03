import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PackageItemsCard } from "./package-items-card";

const FOTO_EDIT = {
  id: "i1",
  definitionId: "d1",
  definitionName: "Foto edit",
  unit: "foto",
  valueType: "NUMBER" as const,
  selectionRequired: true,
  selectionType: "EDIT" as const,
  value: { type: "NUMBER" as const, value: "25" },
};
const JUMLAH = {
  id: "i2",
  definitionId: "d2",
  definitionName: "Jumlah orang",
  unit: "orang",
  valueType: "RANGE" as const,
  selectionRequired: false,
  selectionType: null,
  value: { type: "RANGE" as const, min: "1", max: "3" },
};

describe("PackageItemsCard (AC-PRJ-007)", () => {
  it("AC-PRJ-007 lists the copied items with their summary", () => {
    render(
      <PackageItemsCard serviceName="Wisuda Basic" items={[FOTO_EDIT, JUMLAH]} isMobile={false} />,
    );
    expect(screen.getByText("25 foto · pilihan edit")).toBeInTheDocument();
    expect(screen.getByText("1–3 orang")).toBeInTheDocument();
    expect(
      screen.getByText("Disalin dari Wisuda Basic. Perubahan hanya berlaku untuk proyek ini."),
    ).toBeInTheDocument();
  });

  it("AC-PRJ-007 uses the short description on phones", () => {
    render(<PackageItemsCard serviceName="Wisuda Basic" items={[FOTO_EDIT]} isMobile />);
    expect(screen.getByText("Dari Wisuda Basic. Hanya untuk proyek ini.")).toBeInTheDocument();
  });

  it("AC-PRJ-007 shows the empty state when the service has no items", () => {
    render(<PackageItemsCard serviceName="Wisuda Basic" items={[]} isMobile={false} />);
    expect(screen.getByText("Layanan ini belum punya item paket")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
