import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import { GalleryShareDialog } from "./gallery-share-dialog";
import type { GalleryShareDialogProps, GalleryShareLoad } from "./gallery-share-dialog.types";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const WA_URL = "https://wa.me/6281234567890?text=Halo";
const K1: GalleryShareLoad = {
  ok: true,
  recipient: { name: "Rina Wijaya", phone: "+62 812-3456-7890" },
  text: "Halo Rina Wijaya,\nKata sandi: mawar-4821",
  waUrl: WA_URL,
};
const K2: GalleryShareLoad = {
  ok: true,
  recipient: { name: "Rina Wijaya", phone: null },
  text: "Halo Rina Wijaya,\nKata sandi: mawar-4821",
  waUrl: null,
};

function props(
  overrides: Partial<GalleryShareDialogProps> & { load?: GalleryShareLoad } = {},
): GalleryShareDialogProps {
  const load = overrides.load ?? K1;
  return {
    isOpen: true,
    onOpenChange: vi.fn(),
    workspaceId: "w1",
    projectId: "p1",
    loadShare: vi.fn(() => Promise.resolve(load)),
    onAddNumber: vi.fn(),
    ...overrides,
  };
}

function renderDialog(value: GalleryShareDialogProps): ReactElement {
  return <GalleryShareDialog {...value} />;
}

describe("GalleryShareDialog (K1, K2, AC-GFL-021 to 025)", () => {
  it("shows the preparing state while the message loads", () => {
    const loadShare = vi.fn(() => new Promise<GalleryShareLoad>(() => undefined));
    renderInLocale(renderDialog(props({ loadShare })), "en");
    expect(screen.getByText("Preparing the message…")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy message" }).hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("K1: shows the recipient, the rendered text read-only as a message bubble and a new-tab WhatsApp link", async () => {
    renderInLocale(renderDialog(props()), "en");
    expect(await screen.findByText("Rina Wijaya · +62 812-3456-7890")).toBeTruthy();
    expect(screen.getByText(/Kata sandi: mawar-4821/)).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    const link = screen.getByRole("link", { name: "Open WhatsApp" });
    expect(link.getAttribute("href")).toBe(WA_URL);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("K2: alerts the missing number, disables WhatsApp and offers adding a number", async () => {
    const value = props({ load: K2 });
    renderInLocale(renderDialog(value), "en");
    expect(await screen.findByText("Rina Wijaya doesn’t have a WhatsApp number yet")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Open WhatsApp" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open WhatsApp" }).hasAttribute("disabled")).toBe(
      true,
    );
    const user = userEvent.setup();
    const alert = screen
      .getByText("Rina Wijaya doesn’t have a WhatsApp number yet")
      .closest("[data-tone='warning']") as HTMLElement;
    expect(within(alert).getByRole("button", { name: "Add WhatsApp number" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Add WhatsApp number" })).toHaveLength(1);
    await user.click(within(alert).getByRole("button", { name: "Add WhatsApp number" }));
    expect(value.onAddNumber).toHaveBeenCalledTimes(1);
  });

  it("shows the error state with Close for a refused share (AC-GFL-025)", async () => {
    const value = props({ load: { ok: false, code: "NOT_SHAREABLE" } });
    const user = userEvent.setup();
    renderInLocale(renderDialog(value), "en");
    expect(await screen.findByText("The gallery link can’t be sent yet")).toBeTruthy();
    expect(screen.queryByText(/mawar-4821/)).toBeNull();
    // The Modal's header also has a Close button; the footer's one is the last in the tree.
    const closes = screen.getAllByRole("button", { name: "Close" });
    await user.click(closes.at(-1) as HTMLElement);
    expect(value.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("copies the rendered message and confirms with a toast (AC-GFL-023)", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderInLocale(renderDialog(props()), "en");
    await user.click(await screen.findByRole("button", { name: "Copy message" }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(K1.text);
    });
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: "Message copied" }),
    );
  });

  it("shows a danger toast when the clipboard write fails and keeps the dialog open", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.reject(new Error("denied")));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const value = props();
    renderInLocale(renderDialog(value), "en");
    await user.click(await screen.findByRole("button", { name: "Copy message" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        tone: "danger",
        title: "Couldn’t copy the message. Copy it from the message box.",
      });
    });
    expect(value.onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("loads nothing while closed and reloads when the revision changes", async () => {
    const value = props({ isOpen: false });
    const { rerender } = renderInLocale(renderDialog(value), "en");
    expect(value.loadShare).not.toHaveBeenCalled();
    rerender(renderDialog({ ...value, isOpen: true, revision: 0 }));
    await screen.findByText("Rina Wijaya · +62 812-3456-7890");
    expect(value.loadShare).toHaveBeenCalledTimes(1);
    rerender(renderDialog({ ...value, isOpen: true, revision: 1 }));
    await waitFor(() => {
      expect(value.loadShare).toHaveBeenCalledTimes(2);
    });
  });
});
