import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { copyMessages } from "@tests/support/copy/copy-messages";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ pathname: "/w/A/message-templates/gallery-share" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ push }),
}));

const { MobileWorkspaceSheet, MobileWorkspaceSwitcherSheet, OwnerShell } =
  await import("./owner-shell");
const { OwnerPageHeading } = await import("../owner-page-heading/owner-page-heading");

afterEach(() => {
  route.pathname = "/w/A/message-templates/gallery-share";
});

const workspaces = [
  { id: "workspace-1", name: "Studio Lime", isCurrent: true },
  { id: "workspace-2", name: "Aster Wedding", isCurrent: false },
] as const;

describe("MobileWorkspaceSwitcherSheet", () => {
  it("shows workspace choices and the create workspace CTA", async () => {
    const user = userEvent.setup();
    const onSwitch = vi.fn(() => Promise.resolve());

    render(
      <MobileWorkspaceSwitcherSheet
        isOpen
        onOpenChange={vi.fn()}
        currentName="Studio Lime"
        workspaces={workspaces}
        onSwitch={onSwitch}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Pindah ruang kerja" })).toBeInTheDocument();
    expect(screen.getByText("2 ruang kerja")).toBeInTheDocument();
    const names = screen
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"))
      .filter((name) => name === "Studio Lime" || name === "Aster Wedding");
    expect(names).toEqual(["Aster Wedding", "Studio Lime"]);
    const createButton = screen.getByRole("button", { name: "Buat ruang kerja" });
    expect(createButton).toHaveAttribute("data-variant", "primary");
    expect(createButton.closest("footer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aster Wedding" }));
    expect(onSwitch).toHaveBeenCalledWith("workspace-2");
  });
});

describe("MobileWorkspaceSheet", () => {
  it("renders the menu destinations without switcher or invoice", () => {
    render(
      <MobileWorkspaceSheet
        isOpen
        onOpenChange={vi.fn()}
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("Katalog")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"))
        .filter(Boolean),
    ).toEqual(
      expect.arrayContaining(["Layanan", "Tim", "Templat pesan", "Sumber foto", "Pengaturan"]),
    );
    const labels = screen.getAllByRole("button").map((button) => button.textContent);
    expect(labels.indexOf("Layanan")).toBeLessThan(labels.indexOf("Tim"));
    expect(labels.indexOf("Tim")).toBeLessThan(labels.indexOf("Templat pesan"));
    expect(screen.queryByRole("button", { name: "Studio Lime" })).toBeNull();
    expect(screen.queryByText("Invoice")).toBeNull();
    expect(screen.queryByRole("button", { name: "Buat ruang kerja" })).toBeNull();
  });
});

describe("OwnerShell sub-pages", () => {
  it("renders the desktop page actions slot", () => {
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Dasbor"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
      >
        <p>isi</p>
      </OwnerShell>,
    );

    expect(document.querySelector("#owner-page-actions")).toBeInTheDocument();
  });

  it("F-17 a matching sub-page sets the heading and the parent", () => {
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
        subPages={[
          {
            path: "/w/A/message-templates/gallery-share",
            title: "Bagikan gallery",
            subtitle: "Dikirim saat gallery siap dipilih klien.",
            parent: { label: "Template pesan", href: "/w/A/message-templates" },
          },
        ]}
      >
        <p>isi</p>
      </OwnerShell>,
    );

    // Desktop and phone trees both render the heading.
    expect(
      screen.getAllByRole("heading", { level: 1, name: "Bagikan gallery" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/w/A/message-templates",
    );
  });

  it("AC-CAT-004 lets a service detail page replace the shell heading", () => {
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
        pageHeading={
          <OwnerPageHeading
            title="Wisuda Basic"
            subtitle="Paket foto wisuda."
            parent={{ label: "Layanan", href: "/w/A/services" }}
            backLabel="Kembali"
          />
        }
      >
        <p>isi</p>
      </OwnerShell>,
    );

    expect(
      screen.getAllByRole("heading", { level: 1, name: "Wisuda Basic" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole("link", { name: "Layanan" })
        .find((link) => link.getAttribute("href") === "/w/A/services"),
    ).toHaveAttribute("href", "/w/A/services");
    expect(screen.getAllByRole("link", { name: "Kembali" })[0]).toHaveAttribute(
      "href",
      "/w/A/services",
    );
  });

  it("F-23 shows the trail it is given, not one built in the browser", () => {
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
        trail={<span>Aster Wedding › Template pesan › Bagikan gallery</span>}
        pageHeading={
          <OwnerPageHeading
            title="Wisuda Basic"
            parent={{ label: "Layanan", href: "/w/A/services" }}
            backLabel="Kembali"
          />
        }
      >
        <p>isi</p>
      </OwnerShell>,
    );

    expect(
      screen.getByText("Aster Wedding › Template pesan › Bagikan gallery"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Kembali" })[0]).toHaveAttribute(
      "href",
      "/w/A/services",
    );
  });

  it("AC-PRJ-007 the phone create action opens Proyek baru", async () => {
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
      >
        <p>isi</p>
      </OwnerShell>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Proyek baru" }));
    expect(push).toHaveBeenCalledWith("/w/A/projects/new");
  });

  it("AC-PRJ-007 a page can hide the phone Bottom Nav while its sticky bar is shown", () => {
    route.pathname = "/w/A/projects/new";
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
        pageHeading={
          <OwnerPageHeading
            title="Proyek baru"
            parent={{ label: "Proyek", href: "/w/A/projects" }}
            backLabel="Kembali"
          />
        }
      >
        <p>isi</p>
      </OwnerShell>,
    );

    // The desktop sidebar and the phone menu keep their "Utama" navigations; the Bottom Nav is the third.
    expect(screen.getAllByRole("navigation", { name: "Navigasi utama" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Kembali" })[0]).toHaveAttribute(
      "href",
      "/w/A/projects",
    );
  });

  it("AC-PRJ-007 keeps the phone Bottom Nav on other pages", () => {
    render(
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
      >
        <p>isi</p>
      </OwnerShell>,
    );

    expect(screen.getAllByRole("navigation", { name: "Navigasi utama" })).toHaveLength(3);
  });
});

function renderShellIn(locale: "en" | "id") {
  return render(
    <NextIntlClientProvider locale={locale} messages={copyMessages(locale)}>
      <OwnerShell
        workspaceId="A"
        workspaceName="Aster Wedding"
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        title="Aster Wedding"
        workspaces={workspaces}
        onSwitch={vi.fn()}
        onCreate={vi.fn()}
      >
        <p>isi</p>
      </OwnerShell>
    </NextIntlClientProvider>,
  );
}

describe("OwnerShell copy", () => {
  it("AC-L10N-002 renders the shell navigation in English", () => {
    renderShellIn("en");
    expect(screen.getAllByRole("link", { name: "Projects" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Message templates" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Search" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Proyek" })).toBeNull();
  });

  it("AC-L10N-002 renders the shell navigation in Indonesian", () => {
    renderShellIn("id");
    expect(screen.getAllByRole("link", { name: "Proyek" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Templat pesan" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Cari" }).length).toBeGreaterThan(0);
  });
});

describe("MobileWorkspaceSheet language and sign-out", () => {
  function MenuHarness({
    localeAction,
    onLogout,
  }: Readonly<{ localeAction: () => Promise<unknown>; onLogout: () => void }>) {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <MobileWorkspaceSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        onNavigate={vi.fn()}
        localeAction={localeAction}
        onLogout={onLogout}
      />
    );
  }

  it("AC-L10N-001 the mobile menu opens the language sheet with both languages", async () => {
    const user = userEvent.setup();
    render(<MenuHarness localeAction={vi.fn().mockResolvedValue(undefined)} onLogout={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Bahasa" }));

    const sheet = screen.getByRole("dialog", { name: "Bahasa" });
    expect(within(sheet).getByRole("button", { name: "English" })).toBeInTheDocument();
    const current = within(sheet).getByRole("button", { name: "Bahasa Indonesia" });
    expect(within(current).getByTestId("sheet-item-check")).toBeInTheDocument();
  });

  it("AC-L10N-004 the language sheet shows Changing language… and disables the options while pending", async () => {
    const user = userEvent.setup();
    const localeAction = vi.fn(() => new Promise<unknown>(() => undefined));
    render(<MenuHarness localeAction={localeAction} onLogout={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Bahasa" }));

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(localeAction).toHaveBeenCalledWith({ locale: "en" });
    expect(screen.getByText("Mengganti bahasa…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Bahasa Indonesia" })).toBeDisabled();
  });

  it("signs out from the mobile menu", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<MenuHarness localeAction={vi.fn().mockResolvedValue(undefined)} onLogout={onLogout} />);

    await user.click(screen.getByRole("button", { name: "Keluar" }));

    expect(onLogout).toHaveBeenCalledOnce();
  });
});
