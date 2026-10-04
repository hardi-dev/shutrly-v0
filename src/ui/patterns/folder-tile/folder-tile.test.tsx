import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
});
