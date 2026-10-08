// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClientUnavailable } from "./client-unavailable";

describe("ClientUnavailable (D-7)", () => {
  it("AC-ACC-004 says only that the gallery is unavailable", () => {
    render(<ClientUnavailable />);
    expect(screen.getByRole("main")).toHaveTextContent(
      "Galeri tidak tersediaLink ini tidak berlaku atau galerinya sedang tidak dibuka.",
    );
  });
});
