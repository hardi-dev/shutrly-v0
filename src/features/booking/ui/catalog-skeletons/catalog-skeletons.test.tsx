import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CatalogSkeleton } from "./catalog-skeletons";

describe("CatalogSkeleton", () => {
  it("renders the matching loading surface for each catalog route", () => {
    render(<CatalogSkeleton variant="services" />);
    expect(screen.getByTestId("catalog-services-skeleton")).toHaveAttribute("aria-busy", "true");
  });
});
