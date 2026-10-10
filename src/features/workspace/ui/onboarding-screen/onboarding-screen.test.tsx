import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { OnboardingScreen } from "./onboarding-screen";

const action = async () => {};

function renderScreen(locale: "en" | "id") {
  renderInLocale(
    <OnboardingScreen
      accountName="Rina"
      accountEmail="rina@example.com"
      action={action}
      signOutAction={action}
    />,
    locale,
  );
}

describe("OnboardingScreen copy", () => {
  it("AC-L10N-002 renders the first-workspace onboarding in English", () => {
    renderScreen("en");
    expect(
      screen.getByRole("heading", { name: "Set up your first workspace" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Workspace name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create workspace" })).toBeInTheDocument();
    expect(screen.getByText("Rina · rina@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByText("Invoice prefix: AW")).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the first-workspace onboarding in Indonesian", () => {
    renderScreen("id");
    expect(
      screen.getByRole("heading", { name: "Siapkan ruang kerja pertamamu" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nama ruang kerja")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat ruang kerja" })).toBeInTheDocument();
    expect(screen.getByText("Rina · rina@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
    expect(screen.getByText("Awalan nomor tagihan: AW")).toBeInTheDocument();
  });

  it("renders the preview wordmark and the © footer from the shared panel", () => {
    renderScreen("id");
    expect(screen.getAllByText("shutrly.")).toHaveLength(2);
    expect(screen.getByText("© 2026 Shutrly")).toBeInTheDocument();
    expect(screen.getByText("Aster Wedding")).toBeInTheDocument();
  });

  it("renders benefit checks as the exported lime circles", () => {
    renderScreen("id");
    const checks = screen.getAllByTestId("onboarding-benefit-check");
    expect(checks).toHaveLength(3);
    expect(checks[0]).toHaveClass(
      "size-(--size-mark-md)",
      "rounded-full",
      "bg-(--color-semantic-accent-soft)",
    );
    expect(screen.getByText("Catatan terpisah untuk tiap merek")).toHaveClass("text-[13px]");
  });
});
