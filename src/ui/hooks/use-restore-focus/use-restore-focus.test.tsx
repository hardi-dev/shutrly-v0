import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { useRestoreFocus } from "./use-restore-focus";

function Overlay({ onClose }: Readonly<{ onClose: () => void }>) {
  return (
    <button type="button" autoFocus onClick={onClose}>
      Tutup
    </button>
  );
}

function Harness({ remountTrigger = false }: Readonly<{ remountTrigger?: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [closeCount, setCloseCount] = useState(0);
  useRestoreFocus(isOpen);
  function open(): void {
    setIsOpen(true);
  }
  function close(): void {
    setIsOpen(false);
    setCloseCount((count) => count + 1);
  }
  return (
    <>
      <button
        key={remountTrigger ? closeCount : 0}
        id="overlay-trigger"
        type="button"
        onClick={open}
      >
        Buka
      </button>
      {isOpen ? <Overlay onClose={close} /> : null}
    </>
  );
}

describe("useRestoreFocus", () => {
  it("returns focus to the trigger after the overlay closes", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Buka" }));
    expect(screen.getByRole("button", { name: "Tutup" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Tutup" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Buka" })).toHaveFocus();
    });
  });

  it("finds a re-rendered trigger by its id", async () => {
    const user = userEvent.setup();
    render(<Harness remountTrigger />);

    await user.click(screen.getByRole("button", { name: "Buka" }));
    await user.click(screen.getByRole("button", { name: "Tutup" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Buka" })).toHaveFocus();
    });
  });
});
