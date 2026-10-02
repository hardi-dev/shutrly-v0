import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { SourceRowActions } from "./source-row-actions";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const source = {
  id: "source-1",
  displayName: "Google Drive Utama",
  provider: "GOOGLE_DRIVE" as const,
  isActive: true,
};

function stubViewport(matches: boolean): void {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    media: "(max-width: 767px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("SourceRowActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubViewport(false);
  });

  it("opens the desktop menu with rename, deactivate and delete actions", async () => {
    const user = userEvent.setup();
    render(
      <SourceRowActions
        workspaceId="ws-1"
        source={source}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        setActiveAction={vi.fn(() => Promise.resolve())}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: SOURCE_COPY.rowActions(source.displayName) }),
    );
    expect(screen.getByRole("menuitem", { name: SOURCE_COPY.rename })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: SOURCE_COPY.deactivate })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: SOURCE_COPY.delete })).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("shows activate for an inactive source", async () => {
    const user = userEvent.setup();
    stubViewport(false);
    render(
      <SourceRowActions
        workspaceId="ws-1"
        source={{ ...source, isActive: false }}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        setActiveAction={vi.fn(() => Promise.resolve())}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: SOURCE_COPY.rowActions(source.displayName) }),
    );
    expect(screen.getByRole("menuitem", { name: SOURCE_COPY.activate })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: SOURCE_COPY.deactivate })).toBeNull();
  });

  it("uses an actions sheet on phones with source context", async () => {
    const user = userEvent.setup();
    stubViewport(true);
    render(
      <SourceRowActions
        workspaceId="ws-1"
        source={source}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        setActiveAction={vi.fn(() => Promise.resolve())}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: SOURCE_COPY.rowActions(source.displayName) }),
    );
    expect(screen.getByRole("dialog", { name: source.displayName })).toBeInTheDocument();
    expect(screen.getByText("Google Drive · Aktif")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: SOURCE_COPY.rename })).toBeInTheDocument();
  });

  it("AC-SRC-011 deactivates without confirmation and offers undo", async () => {
    const user = userEvent.setup();
    const setActiveAction = vi.fn(() => Promise.resolve());
    render(
      <SourceRowActions
        workspaceId="ws-1"
        source={source}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        setActiveAction={setActiveAction}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: SOURCE_COPY.rowActions(source.displayName) }),
    );
    await user.click(screen.getByRole("menuitem", { name: SOURCE_COPY.deactivate }));
    await waitFor(() => {
      expect(setActiveAction).toHaveBeenCalledWith("ws-1", "source-1", false);
    });
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: SOURCE_COPY.deactivatedTitle }),
    );
    const toast = vi.mocked(showToast).mock.calls.at(-1)?.[0];
    toast?.action?.onAction();
    expect(setActiveAction).toHaveBeenLastCalledWith("ws-1", "source-1", true);
  });
});
