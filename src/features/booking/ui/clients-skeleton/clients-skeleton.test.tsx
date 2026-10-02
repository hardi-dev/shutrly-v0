import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { ClientsSkeleton } = await import("./clients-skeleton");

describe("ClientsSkeleton", () => {
  it("renders five table placeholders on desktop without a count", () => {
    useMobileViewport.mockReturnValue(false);
    render(<ClientsSkeleton />);
    expect(screen.getAllByTestId("data-table-skeleton-row")).toHaveLength(5);
    expect(screen.queryByText(/klien aktif/)).not.toBeInTheDocument();
  });

  it("renders five list placeholders on phones", () => {
    useMobileViewport.mockReturnValue(true);
    render(<ClientsSkeleton />);
    expect(screen.getAllByRole("listitem", { hidden: true })).toHaveLength(5);
  });
});
