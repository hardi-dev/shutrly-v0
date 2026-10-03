import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();
const useMobileViewport = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { ClientsTabsBar } = await import("./clients-tabs-bar");

describe("ClientsTabsBar", () => {
  it("AC-CLI-002 navigates to the selected status route on phones", async () => {
    useMobileViewport.mockReturnValue(true);
    render(<ClientsTabsBar workspaceId="x" status="ACTIVE" />);
    await userEvent.click(screen.getByRole("radio", { name: "Arsip" }));
    expect(push).toHaveBeenCalledWith("/w/x/clients/archived");
  });

  it("renders nothing outside the phone breakpoint", () => {
    useMobileViewport.mockReturnValue(false);
    render(<ClientsTabsBar workspaceId="x" status="ACTIVE" />);
    expect(screen.queryByRole("radiogroup", { name: "Status klien" })).not.toBeInTheDocument();
  });
});
