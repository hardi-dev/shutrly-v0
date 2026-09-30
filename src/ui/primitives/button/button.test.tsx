import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SubmitEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders every approved variant and size with token-backed metadata", () => {
    render(
      <>
        <Button variant="primary" size="md">
          Primary MD
        </Button>
        <Button variant="primary" size="lg">
          Primary LG
        </Button>
        <Button variant="secondary" size="md">
          Secondary MD
        </Button>
        <Button variant="secondary" size="lg">
          Secondary LG
        </Button>
        <Button variant="danger" size="md">
          Danger MD
        </Button>
        <Button variant="danger" size="lg">
          Danger LG
        </Button>
      </>,
    );

    expect(screen.getByRole("button", { name: "Primary MD" })).toHaveAttribute(
      "data-variant",
      "primary",
    );
    expect(screen.getByRole("button", { name: "Primary MD" })).toHaveAttribute("data-size", "md");
    expect(screen.getByRole("button", { name: "Danger LG" })).toHaveAttribute(
      "data-variant",
      "danger",
    );
    expect(screen.getByRole("button", { name: "Danger LG" })).toHaveAttribute("data-size", "lg");
  });

  it("renders named leading and trailing icons without requiring icon-only usage", () => {
    render(
      <Button iconLeading="plus" iconTrailing="chevron-down">
        Proyek baru
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Proyek baru" })).toHaveAccessibleName("Proyek baru");
    expect(screen.getByTestId("button-icon-leading")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("button-icon-trailing")).toHaveAttribute("aria-hidden", "true");
  });

  it("AC-FND-013 fires onPress once per click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Simpan</Button>);
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(2);
    await user.keyboard(" ");
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it("AC-FND-013 does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Simpan
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Simpan" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders a pending state with the loading icon and blocks press events", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isPending onPress={onPress}>
        Simpan
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Simpan" });
    expect(button).toHaveAttribute("data-pending");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveClass("data-pending:opacity-(--opacity-disabled)");
    expect(screen.getByTestId("button-icon-loading")).toBeInTheDocument();

    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("AC-FND-013 marks keyboard focus for the visible focus ring", async () => {
    const user = userEvent.setup();
    render(<Button>Simpan</Button>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Simpan" })).toHaveAttribute("data-focus-visible");
  });

  it("AC-FND-013 defaults to type=button and submits its form with type=submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Button>Batal</Button>
        <Button type="submit">Kirim</Button>
      </form>,
    );
    expect(screen.getByRole("button", { name: "Batal" })).toHaveAttribute("type", "button");
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("AC-FND-013 styles each variant only through token variables", () => {
    render(
      <>
        <Button>Utama</Button>
        <Button variant="secondary" className="w-full">
          Kedua
        </Button>
      </>,
    );
    const primary = screen.getByRole("button", { name: "Utama" }).className;
    const secondary = screen.getByRole("button", { name: "Kedua" }).className;
    expect(primary).toContain("--component-button-primary-background");
    expect(secondary).toContain("--component-button-secondary-background");
    expect(secondary).toContain("w-full");
    expect(primary + secondary).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
