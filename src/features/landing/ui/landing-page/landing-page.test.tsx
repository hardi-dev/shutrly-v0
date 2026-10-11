import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { useLocale } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingPage } from "./landing-page";

afterEach(() => {
  vi.mocked(useLocale).mockReturnValue("id");
});

describe("LandingPage copy", () => {
  it("AC-LND-001 renders the hero, the heading and the waitlist form in English", () => {
    vi.mocked(useLocale).mockReturnValue("en");
    const { container } = renderInLocale(<LandingPage />, "en");
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("YOUR STUDIO, IN ONE PLACE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Less busywork. More photography.",
    );
    expect(
      screen.getByText(
        "A workspace to manage your projects, photo selections, and invoices. All in one workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("lang", "en");
  });

  it("AC-L10N-002 renders the hero, the heading and the waitlist form in Indonesian", () => {
    const { container } = renderInLocale(<LandingPage />, "id");
    expect(screen.getByText("STUDIO-MU, DI SATU TEMPAT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi.",
    );
    expect(screen.getByLabelText("Alamat email")).toBeInTheDocument();
    expect(screen.getByAltText("Daftar proyek Shutrly di laptop")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("lang", "id");
  });
});
