// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SetPickNoteInput } from "@/features/gallery/application/schemas/set-pick/set-pick.types";

import { PickNoteSheet } from "./pick-note-sheet";
import type { PickNoteSheetProps } from "./pick-note-sheet.types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const PHOTO = {
  id: "p-5",
  fileName: "IMG_005.jpg",
  folderPath: "",
  thumb: { src: "/g/T1/media/p-5/thumb" },
  preview: { src: "/g/T1/media/p-5/preview" },
  missing: false,
};

function props(patch: Partial<PickNoteSheetProps> = {}): PickNoteSheetProps {
  return {
    target: {
      groupId: "g-edit",
      groupName: "Foto edit",
      photo: PHOTO,
      note: "Tolong rapikan rambut",
    },
    saveNote: vi.fn((input: SetPickNoteInput) =>
      Promise.resolve({ ok: true as const, note: input.note.trim() || null }),
    ),
    onClose: vi.fn(),
    onSaved: vi.fn(),
    onStale: vi.fn(),
    ...patch,
  };
}

describe("PickNoteSheet (pilih-tulis-catatan)", () => {
  it("AC-SEL-021 shows the photo, the group and the counter, and saves the note", async () => {
    const p = props();
    render(<PickNoteSheet {...p} />);
    expect(screen.getByText("Catatan untuk IMG_005.jpg")).toBeTruthy();
    expect(screen.getByText("Dipilih untuk Foto edit")).toBeTruthy();
    expect(screen.getByText("Opsional · 21/500")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Simpan catatan" }));
    await waitFor(() => {
      expect(p.onSaved).toHaveBeenCalledWith("p-5", "Tolong rapikan rambut");
    });
    expect(p.onClose).toHaveBeenCalled();
  });

  it("AC-SEL-021 refuses 501 characters before sending", () => {
    const p = props({ target: { ...props().target, note: "a".repeat(501) } });
    render(<PickNoteSheet {...p} />);
    expect(screen.getByText("Catatan paling banyak 500 karakter.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Simpan catatan" }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(p.saveNote).not.toHaveBeenCalled();
  });

  it("BR-SEL-005 closes and asks for a re-read when the group closed meanwhile", async () => {
    const p = props({
      saveNote: vi.fn(() =>
        Promise.resolve({ ok: false as const, code: "GROUP_NOT_OPEN" as const }),
      ),
    });
    render(<PickNoteSheet {...p} />);
    await userEvent.click(screen.getByRole("button", { name: "Simpan catatan" }));
    await waitFor(() => {
      expect(p.onStale).toHaveBeenCalled();
    });
    expect(p.onSaved).not.toHaveBeenCalled();
  });
});
