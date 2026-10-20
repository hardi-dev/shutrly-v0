import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrivacyPolicy } from "./privacy-policy";

describe("PrivacyPolicy", () => {
  it("renders the English policy with its sections and contact", () => {
    render(<PrivacyPolicy locale="en" />);
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2. Photos and Google Drive" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hello@shutrly.space" })).toHaveAttribute(
      "href",
      "mailto:hello@shutrly.space",
    );
  });

  it("renders the Indonesian policy when the locale is id", () => {
    render(<PrivacyPolicy locale="id" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Kebijakan Privasi" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "10. Hak Anda" })).toBeInTheDocument();
  });

  it("states that photos are not stored on our servers", () => {
    render(<PrivacyPolicy locale="en" />);
    expect(
      screen.getByText(/We do not copy or store your photos on our servers/),
    ).toBeInTheDocument();
  });
});
