import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ToastContent } from "@/ui/patterns/toast/toast.types";

const push = vi.fn();
const showToast = vi.fn<(content: ToastContent) => void>();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { TemplateEditorScreen } = await import("./template-editor-screen");

const STORED = "Halo {{clientName}},\n{{galleryUrl}}";
const DEFAULT = "Default {{galleryUrl}}";
const editor = {
  type: "GALLERY_SHARE",
  content: STORED,
  defaultContent: DEFAULT,
  brandName: "Aster Wedding",
} as const;

function renderEditor(action = vi.fn().mockResolvedValue(undefined)) {
  render(<TemplateEditorScreen editor={editor} action={action} />);
  return { action, textbox: screen.getByRole("textbox", { name: "Isi pesan" }) };
}

describe("TemplateEditorScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-MSG-005 shows the stored content, the variables (required marked) and a preview", () => {
    const { textbox } = renderEditor();

    expect(textbox).toHaveValue(STORED);
    expect(screen.getByRole("button", { name: "Sisipkan {{galleryUrl}}, wajib" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Sisipkan {{galleryPassword}}" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Pratinjau pesan" })).toHaveTextContent(
      "Halo Rina & Dimas,",
    );
    expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
  });

  it("AC-MSG-006 inserts a variable at the caret and updates the preview", async () => {
    const user = userEvent.setup();
    const { textbox } = renderEditor();
    await user.click(textbox);
    await user.keyboard("{Control>}{End}{/Control} ");
    await user.click(screen.getByRole("button", { name: "Sisipkan {{projectTitle}}" }));

    expect(textbox).toHaveValue(`${STORED} {{projectTitle}}`);
    expect(screen.getByRole("region", { name: "Pratinjau pesan" })).toHaveTextContent(
      "Wedding Rina & Dimas",
    );
  });

  it("AC-MSG-007 saves and confirms with a success toast", async () => {
    const user = userEvent.setup();
    const { textbox, action } = renderEditor();
    await user.type(textbox, "!");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(action).toHaveBeenCalledWith({ content: `${STORED}!` });
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: "Template tersimpan" }),
    );
  });

  it("AC-MSG-009 shows the server field error on the content and focuses it", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { content: "UNKNOWN_VARIABLE:invoiceUrl" },
    });
    const { textbox } = renderEditor(action);
    await user.type(textbox, "!");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(await screen.findByText(/tidak bisa dipakai di Bagikan gallery/)).toBeVisible();
    expect(textbox).toHaveFocus();
  });

  it("AC-MSG-010 validates on the client before calling the server", async () => {
    const user = userEvent.setup();
    const { textbox, action } = renderEditor();
    await user.type(textbox, " {{ x }}");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(await screen.findByText(/tanpa spasi/)).toBeVisible();
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Pratinjau muncul lagi");
  });

  it("AC-MSG-012 keeps the text and offers a retry toast when the server fails", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockRejectedValue(new Error("SAVE_FAILED"));
    const { textbox } = renderEditor(action);
    await user.type(textbox, "!");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(showToast.mock.calls.at(0)?.[0]).toMatchObject({
      tone: "danger",
      title: "Template belum tersimpan",
      action: { label: "Coba lagi" },
    });
    expect(textbox).toHaveValue(`${STORED}!`);
  });

  it("AC-MSG-013 restoring the default is a draft change until saved", async () => {
    const user = userEvent.setup();
    const { textbox, action } = renderEditor();
    await user.click(screen.getByRole("button", { name: "Kembalikan ke default" }));

    expect(textbox).toHaveValue(DEFAULT);
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled();
  });

  it("AC-MSG-014 asks before leaving with unsaved changes and stays on cancel", async () => {
    const user = userEvent.setup();
    const { textbox } = renderEditor();
    const link = document.createElement("a");
    link.href = "/w/A/settings";
    link.textContent = "Pengaturan";
    document.body.append(link);
    await user.type(textbox, "!");
    await act(async () => {
      await user.click(link);
    });

    expect(await screen.findByRole("alertdialog", { name: "Buang perubahan?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Lanjut mengedit" }));
    expect(push).not.toHaveBeenCalled();
    expect(textbox).toHaveValue(`${STORED}!`);
  });
});
