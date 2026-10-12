import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { serverFormDom, submitButton } from "@tests/support/forms/server-form";
import { describe, expect, it, vi } from "vitest";

import { ProfileForm } from "./profile-form";

const props = { email: "alya@studio.com", name: "Alya", action: vi.fn() };

describe("ProfileForm copy", () => {
  it("AC-L10N-002 labels the profile fields in English", () => {
    renderInLocale(<ProfileForm {...props} />, "en");
    expect(screen.getByLabelText("Email address")).toHaveValue("alya@studio.com");
    expect(screen.getByLabelText("Display name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("AC-L10N-002 labels the profile fields in Indonesian", () => {
    renderInLocale(<ProfileForm {...props} />, "id");
    expect(screen.getByLabelText("Alamat email")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama tampilan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan perubahan" })).toBeInTheDocument();
  });
});

describe("ProfileForm before and after the page is interactive (AC-SFX-001, AC-SFX-002)", () => {
  it("posts natively and keeps submit disabled until ready", () => {
    const dom = serverFormDom(<ProfileForm email="a@b.co" name="Alya" action={vi.fn()} />);
    expect(dom.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(dom)).toBeDisabled();
  });

  it("enables submit once the page is interactive", () => {
    const { container } = renderInLocale(
      <ProfileForm email="a@b.co" name="Alya" action={vi.fn()} />,
      "id",
    );
    expect(container.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(container)).toBeEnabled();
  });
});
