import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompactBar } from "./compact-bar";

describe("CompactBar", () => {
  it("uses the hierarchical parent href for Back", () => {
    render(<CompactBar title="Detail" parent={{ label: "Proyek", href: "/w/A/projects" }} />);
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute("href", "/w/A/projects");
    expect(screen.getByRole("heading", { name: "Detail" })).toBeInTheDocument();
  });
});
