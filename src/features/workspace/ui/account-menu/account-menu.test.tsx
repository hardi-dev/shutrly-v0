import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SidebarAccountTrigger } from "@/ui/patterns/sidebar/sidebar";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const { AccountMenu } = await import("./account-menu");

function renderMenu(props: Partial<Parameters<typeof AccountMenu>[0]> = {}) {
  return render(
    <AccountMenu workspaceId="A" {...props}>
      <SidebarAccountTrigger
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        isCompact={false}
      />
    </AccountMenu>,
  );
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Menu akun" }));
  return user;
}

describe("AccountMenu", () => {
  it("AC-L10N-001 lists both languages by self-name and checks the current one", async () => {
    renderMenu({ localeAction: vi.fn().mockResolvedValue(undefined), onLogout: vi.fn() });
    await openMenu();

    const english = screen.getByRole("menuitem", { name: "English" });
    const indonesian = screen.getByRole("menuitem", { name: "Bahasa Indonesia" });
    expect(within(indonesian).getByTestId("menu-item-check")).toBeInTheDocument();
    expect(within(english).queryByTestId("menu-item-check")).toBeNull();
  });

  it("AC-L10N-004 disables the language items and shows Changing language… while pending", async () => {
    const localeAction = vi.fn(() => new Promise<unknown>(() => undefined));
    renderMenu({ localeAction, onLogout: vi.fn() });
    const user = await openMenu();

    await user.click(screen.getByRole("menuitem", { name: "English" }));

    expect(localeAction).toHaveBeenCalledWith({ locale: "en" });
    expect(screen.getByText("Mengganti bahasa…")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /^English/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("menuitem", { name: "Bahasa Indonesia" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("signs out from the menu", async () => {
    const onLogout = vi.fn();
    renderMenu({ localeAction: vi.fn().mockResolvedValue(undefined), onLogout });
    const user = await openMenu();

    await user.click(screen.getByRole("menuitem", { name: "Keluar" }));

    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("theme items are shown and do nothing", async () => {
    const onLogout = vi.fn();
    renderMenu({ localeAction: vi.fn().mockResolvedValue(undefined), onLogout });
    const user = await openMenu();

    const system = screen.getByRole("menuitem", { name: "Sistem" });
    expect(within(system).getByTestId("menu-item-check")).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Gelap" }));

    expect(screen.getByRole("menu", { name: "Menu akun" })).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("links to the profile and the workspace settings", async () => {
    renderMenu({ localeAction: vi.fn().mockResolvedValue(undefined), onLogout: vi.fn() });
    await openMenu();

    expect(screen.getByRole("menuitem", { name: "Profil" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("menuitem", { name: "Pengaturan" })).toHaveAttribute(
      "href",
      "/w/A/settings",
    );
  });
});
