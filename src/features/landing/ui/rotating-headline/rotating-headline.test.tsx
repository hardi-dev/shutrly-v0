import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { RotatingHeadline } from "./rotating-headline";

describe("RotatingHeadline copy", () => {
  it("AC-LND-001 names the page with one stable heading in English, whatever word is showing", () => {
    renderInLocale(<RotatingHeadline />, "en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Less busywork. More photography.",
    );
  });

  it("starts on the first English word and keeps the others out of sight", () => {
    renderInLocale(<RotatingHeadline />, "en");
    const shown = (word: string) =>
      screen.getAllByText(word).some((element) => element.classList.contains("opacity-100"));
    expect(shown("busywork.")).toBe(true);
    expect(shown("paperwork.")).toBe(false);
    expect(shown("back-and-forth.")).toBe(false);
    expect(screen.getByText("More photography.")).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the headline in Indonesian", () => {
    renderInLocale(<RotatingHeadline />, "id");
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi.",
    );
    expect(screen.getByText("Lebih banyak waktu untuk fotografi.")).toBeInTheDocument();
    expect(screen.getAllByText("kerja admin.").length).toBeGreaterThan(0);
  });
});
