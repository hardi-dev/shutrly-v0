import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompactBar } from "./compact-bar";

describe("CompactBar", () => {
  it("uses the hierarchical parent href for Back", () => {
    render(<CompactBar title="Detail" parent={{ label: "Proyek", href: "/w/A/projects" }} />);
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute("href", "/w/A/projects");
    expect(screen.getByRole("heading", { name: "Detail" })).toBeInTheDocument();
  });

  it("renders actions only when the page supplies them", () => {
    const { rerender } = render(
      <CompactBar title="Detail" parent={{ label: "Proyek", href: "/w/A/projects" }} />,
    );
    expect(screen.queryByRole("button")).toBeNull();

    rerender(
      <CompactBar
        title="Detail"
        parent={{ label: "Proyek", href: "/w/A/projects" }}
        actions={<button type="button">Simpan</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
    expect(screen.getByText("Proyek")).toBeInTheDocument();
  });
});
