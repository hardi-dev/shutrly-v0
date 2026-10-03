import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CLIENT_SEARCH_DEBOUNCE_MS } from "@/features/booking/domain/client-search/client-search";

const replace = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const { ClientSearchField } = await import("./client-search-field");

function renderFields(q: string) {
  return (
    <>
      <ClientSearchField workspaceId="x" status="ACTIVE" q={q} resultCount={1} />
      <ClientSearchField workspaceId="x" status="ACTIVE" q={q} resultCount={1} />
    </>
  );
}

describe("ClientSearchField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replace.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("AC-CLI-004 replaces the URL once after typing stops", () => {
    render(<ClientSearchField workspaceId="x" status="ACTIVE" q="" resultCount={0} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Sabri" } });
    act(() => {
      vi.advanceTimersByTime(CLIENT_SEARCH_DEBOUNCE_MS);
    });
    expect(replace).toHaveBeenCalledExactlyOnceWith("/w/x/clients?q=Sabri");
  });

  it("does not navigate when the query changes elsewhere, so desktop and phone fields agree", () => {
    const { rerender } = render(renderFields(""));
    fireEvent.change(screen.getAllByRole("searchbox")[0], { target: { value: "Sabri" } });
    act(() => {
      vi.advanceTimersByTime(CLIENT_SEARCH_DEBOUNCE_MS);
    });
    rerender(renderFields("Sabri"));
    act(() => {
      vi.advanceTimersByTime(CLIENT_SEARCH_DEBOUNCE_MS * 10);
    });
    expect(replace).toHaveBeenCalledExactlyOnceWith("/w/x/clients?q=Sabri");
    for (const field of screen.getAllByRole("searchbox")) expect(field).toHaveValue("Sabri");
  });
});
