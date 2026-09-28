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
});
