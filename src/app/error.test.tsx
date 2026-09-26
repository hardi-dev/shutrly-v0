import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe("error boundary page", () => {
  it("AC-FND-010 shows a generic message without the error details", () => {
    const error = Object.assign(new Error("connect failed postgresql://user:pw@host/db"), {
      digest: "123",
    });
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Terjadi kesalahan");
    expect(document.body.textContent).not.toContain("postgresql");
    expect(document.body.textContent).not.toContain("connect failed");
  });

  it("AC-FND-010 retries with reset", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorPage error={new Error("x")} reset={reset} />);
    await user.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
