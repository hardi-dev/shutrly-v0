import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OnboardingScreen } from "./onboarding-screen";

describe("OnboardingScreen", () => {
  it("renders the signed-in row with a logout control", () => {
    const action = async () => {};
    render(
      <OnboardingScreen
        accountName="Rina"
        accountEmail="rina@example.com"
        action={action}
        signOutAction={action}
      />,
    );

    expect(screen.getByText("Rina · rina@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
  });

  it("renders benefit checks as the exported lime circles", () => {
    const action = async () => {};
    render(
      <OnboardingScreen
        accountName="Rina"
        accountEmail="rina@example.com"
        action={action}
        signOutAction={action}
      />,
    );

    const checks = screen.getAllByTestId("onboarding-benefit-check");
    expect(checks).toHaveLength(3);
    expect(checks[0]).toHaveClass(
      "size-(--size-mark-md)",
      "rounded-full",
      "bg-(--color-semantic-accent-soft)",
    );
    expect(screen.getByText("Ruang terpisah")).toHaveClass("text-[13px]");
  });
});
