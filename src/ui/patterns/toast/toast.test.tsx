import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { showToast, ToastOnMount, toastQueue, ToastRegion } from "./toast";

function ToastHarness() {
  return (
    <>
      <ToastOnMount tone="success" title="Tersimpan" body="Perubahan berhasil disimpan." />
      <ToastRegion />
    </>
  );
}

describe("Toast (C24 feedback)", () => {
  afterEach(() => {
    toastQueue.clear();
    window.sessionStorage.clear();
  });

  it("renders queued feedback in a portal region with an accessible close control", async () => {
    const user = userEvent.setup();
    render(<ToastHarness />);

    const region = await screen.findByRole("region", { name: "Notifikasi" });
    expect(region).toBeInTheDocument();
    expect(region).toHaveClass("top-(--space-4)", "md:top-auto", "md:bottom-(--space-4)");
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("Tersimpan");

    await user.click(screen.getByRole("button", { name: "Tutup notifikasi" }));
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });

  it("queues a route-driven toast only once under Strict Mode", async () => {
    render(
      <StrictMode>
        <ToastHarness />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
    });
  });

  it("deduplicates a route-driven toast when the route component remounts", async () => {
    render(
      <>
        <ToastOnMount
          tone="success"
          title="Workspace berhasil dibuat"
          dedupeKey="workspace-created:test"
        />
        <ToastOnMount
          tone="success"
          title="Workspace berhasil dibuat"
          dedupeKey="workspace-created:test"
        />
        <ToastRegion />
      </>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
    });
  });

  it("keeps an actionable toast until it is dismissed", () => {
    showToast({ tone: "info", title: "Tersimpan" });
    showToast({
      tone: "danger",
      title: "Gagal pindah workspace",
      action: { label: "Coba lagi", onAction: () => undefined },
    });

    const timeouts = toastQueue.visibleToasts.map((toast) => [toast.content.title, toast.timeout]);
    expect(timeouts).toEqual(
      expect.arrayContaining([
        ["Tersimpan", 5000],
        ["Gagal pindah workspace", undefined],
      ]),
    );
  });

  it("closes the toast before running its action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<ToastRegion />);

    act(() => {
      showToast({
        tone: "danger",
        title: "Gagal pindah workspace",
        action: { label: "Coba lagi", onAction },
      });
    });
    await user.click(await screen.findByRole("button", { name: "Coba lagi" }));

    expect(onAction).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByText("Gagal pindah workspace")).toBeNull();
    });
  });
});
