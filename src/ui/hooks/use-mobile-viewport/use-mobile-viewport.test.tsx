import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMobileViewport } from "./use-mobile-viewport";

function ViewportProbe() {
  const isMobile = useMobileViewport();
  return <output>{String(isMobile)}</output>;
}

describe("useMobileViewport", () => {
  it("tracks the shared mobile breakpoint", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "(max-width: 767px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ViewportProbe />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("true");
    });
  });

  it("stays desktop when matchMedia is unavailable", async () => {
    vi.stubGlobal("matchMedia", undefined);

    render(<ViewportProbe />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("false");
    });
  });
});
