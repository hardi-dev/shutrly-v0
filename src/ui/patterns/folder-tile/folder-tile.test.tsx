import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { FolderTile } from "./folder-tile";

describe("FolderTile (C47)", () => {
  it("AC-GAL-030 is one button named by the folder and its count, opened by keyboard", async () => {
    const onPress = vi.fn();
    render(<FolderTile name="Akad" countLabel="64 foto" onPress={onPress} />);
    const tile = screen.getByRole("button", { name: "Akad, 64 foto" });
    tile.focus();
    await userEvent.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalled();
  });

  it("fills its grid cell so the icon wrap keeps the tile footprint", () => {
    render(<FolderTile name="Akad" countLabel="64 foto" onPress={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Akad, 64 foto" })).toHaveClass("w-full");
  });
});

describe("FolderTile name in both locales (I6.1)", () => {
  it.each([
    ["en", "64 photos", "Akad, 64 photos"],
    ["id", "64 foto", "Akad, 64 foto"],
  ] as const)("%s names the folder with its count", (locale, countLabel, name) => {
    renderInLocale(<FolderTile name="Akad" countLabel={countLabel} onPress={vi.fn()} />, locale);
    expect(screen.getByRole("button", { name })).toBeInTheDocument();
  });
});
