import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ControlledTextField } from "./controlled-text-field";

function PasswordField() {
  const { control } = useForm({ defaultValues: { password: "" } });
  return <ControlledTextField control={control} name="password" label="Password" type="password" />;
}

describe("ControlledTextField copy", () => {
  it("AC-L10N-002 labels the password toggle in English", () => {
    renderInLocale(<PasswordField />, "en");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("AC-L10N-002 labels the password toggle in Indonesian", () => {
    renderInLocale(<PasswordField />, "id");
    expect(screen.getByRole("button", { name: "Tampilkan kata sandi" })).toBeInTheDocument();
  });
});
