import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { I18nProvider } from "react-aria-components";
import { describe, expect, it, vi } from "vitest";

import { DateField } from "./date-field";

function renderInIndonesian(ui: ReactElement) {
  return render(<I18nProvider locale="id-ID">{ui}</I18nProvider>);
}

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => true,
}));

describe("DateField on phones", () => {
  it("AC-PRJ-029 opens the calendar in a bottom sheet and picks a date", async () => {
    const onChange = vi.fn();
    renderInIndonesian(
      <DateField label="Tanggal" value="2026-11-10" onChange={onChange} display="date" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Tanggal/ }));
    const sheet = screen.getByRole("dialog", { name: "Tanggal" });
    await userEvent.click(within(sheet).getByRole("button", { name: /12 November 2026/ }));
    expect(onChange).toHaveBeenCalledWith("2026-11-12");
  });
});
