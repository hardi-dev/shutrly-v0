import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";
import { NOT_FOUND_COPY as COPY } from "./not-found.copy";

describe("NotFound", () => {
  it("AC-LND-013 says the page isn't available, in English, with a way back to the landing page", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(COPY.title);
    expect(screen.getByRole("main")).toHaveAttribute("lang", "en");
    expect(screen.getByRole("link", { name: COPY.home })).toHaveAttribute("href", "/");
  });
});
