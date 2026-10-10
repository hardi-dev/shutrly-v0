// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileHeader } from "./mobile-header";

describe("MobileHeader", () => {
  it("shows the workspace pill with utilities on owner pages", () => {
    render(<MobileHeader workspace="Aster" title="Proyek" utilities={<span>u</span>} />);
    expect(screen.getByRole("button", { name: /Aster/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Proyek" })).toBeInTheDocument();
  });

  it("F-10 A-26 shows a leading control and no pill on public pages", () => {
    render(<MobileHeader title="Semua foto" leading={<span>Beranda</span>} />);
    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("drops the top row when there is nothing to show in it", () => {
    const { container } = render(<MobileHeader title="Halo, Rina" subtitle="Pilih foto" />);
    expect(container.querySelector("header")?.children).toHaveLength(1);
  });
});
