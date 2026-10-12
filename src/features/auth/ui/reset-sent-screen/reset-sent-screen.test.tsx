import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { ResetSentScreen } from "./reset-sent-screen";

describe("ResetSentScreen copy", () => {
  it("AC-L10N-002 renders the sent confirmation in English", () => {
    renderInLocale(<ResetSentScreen />, "en");
    expect(screen.getByRole("heading", { name: "Check your inbox" })).toBeInTheDocument();
    expect(screen.getByText("The link is valid for one hour")).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the sent confirmation in Indonesian", () => {
    renderInLocale(<ResetSentScreen />, "id");
    expect(screen.getByRole("heading", { name: "Cek kotak masukmu" })).toBeInTheDocument();
    expect(screen.getByText("Tautan berlaku satu jam")).toBeInTheDocument();
  });
});
