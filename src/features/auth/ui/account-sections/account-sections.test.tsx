import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CHANGE_PASSWORD_FORM_COPY } from "../change-password-form/change-password-form.copy";
import { PROFILE_FORM_COPY } from "../profile-form/profile-form.copy";
import { AccountSections } from "./account-sections";
import { ACCOUNT_SECTIONS_COPY } from "./account-sections.copy";

const base = { email: "alya@asterwedding.id", name: "Alya Pratama" };

function renderSections(hasPassword: boolean) {
  render(
    <AccountSections
      account={{ ...base, hasPassword }}
      updateName={vi.fn()}
      changePassword={vi.fn()}
    />,
  );
}

describe("AccountSections (t7CXVK / TInkk)", () => {
  it("AC-AUTH-020 shows the email read-only and the name editable", () => {
    renderSections(true);
    expect(screen.getByLabelText(PROFILE_FORM_COPY.email)).toHaveAttribute("readonly");
    expect(screen.getByLabelText(PROFILE_FORM_COPY.name)).toHaveValue("Alya Pratama");
  });

  it("AC-AUTH-019 shows the password section for password accounts", () => {
    renderSections(true);
    expect(screen.getByLabelText(CHANGE_PASSWORD_FORM_COPY.current)).toBeInTheDocument();
  });

  it("AC-AUTH-030 BR-AUTH-008 hides it for Google-only accounts", () => {
    renderSections(false);
    expect(screen.queryByLabelText(CHANGE_PASSWORD_FORM_COPY.current)).toBeNull();
    expect(screen.getByText(ACCOUNT_SECTIONS_COPY.googleOnlyTitle)).toBeInTheDocument();
  });
});
