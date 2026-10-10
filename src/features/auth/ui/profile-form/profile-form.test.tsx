import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
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
