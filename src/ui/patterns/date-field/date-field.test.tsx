import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale } from "next-intl";
import { I18nProvider } from "react-aria-components";
import { describe, expect, it, vi } from "vitest";

import { DateField } from "./date-field";

describe("DateField (C25 calendar)", () => {
  it("AC-PRJ-029 shows the date without the weekday", () => {
    render(<DateField label="Tanggal" value="2026-11-10" onChange={vi.fn()} display="date" />);
    expect(screen.getByRole("button", { name: /Tanggal/ })).toHaveTextContent("10 Nov 2026");
  });

  it("AC-PRJ-029 shows the date with the weekday", () => {
    render(<DateField label="Tanggal" value="2026-11-10" onChange={vi.fn()} display="weekday" />);
    expect(screen.getByRole("button", { name: /Tanggal/ })).toHaveTextContent("Sel, 10 Nov 2026");
  });

  it("AC-GAL-019 shows a helper that the error replaces", () => {
    const { rerender } = render(
      <DateField
        label="Tanggal kedaluwarsa"
        value="2026-12-31"
        onChange={vi.fn()}
        display="weekday"
        description="Galeri kedaluwarsa di akhir hari itu."
      />,
    );
    expect(screen.getByText("Galeri kedaluwarsa di akhir hari itu.")).toBeInTheDocument();
    rerender(
      <DateField
        label="Tanggal kedaluwarsa"
        value="2026-12-31"
        onChange={vi.fn()}
        display="weekday"
        description="Galeri kedaluwarsa di akhir hari itu."
        errorMessage="Pilih tanggal hari ini atau sesudahnya."
      />,
    );
    expect(screen.queryByText("Galeri kedaluwarsa di akhir hari itu.")).not.toBeInTheDocument();
  });

  it("AC-PRJ-029 shows the placeholder while empty", () => {
    render(
      <DateField
        label="Tanggal"
        value={null}
        onChange={vi.fn()}
        display="date"
        placeholder="Pilih tanggal"
      />,
    );
    expect(screen.getByRole("button", { name: /Tanggal/ })).toHaveTextContent("Pilih tanggal");
  });

  it("AC-PRJ-029 picking a day reports an ISO string and closes the calendar", async () => {
    const onChange = vi.fn();
    render(<DateField label="Tanggal" value="2026-11-10" onChange={onChange} display="date" />);
    await userEvent.click(screen.getByRole("button", { name: /Tanggal/ }));
    const grid = screen.getByRole("grid");
    await userEvent.click(within(grid).getByText("15"));
    expect(onChange).toHaveBeenCalledWith("2026-11-15");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("AC-PRJ-029 shows the error instead of the optional suffix state", () => {
    render(
      <DateField
        label="Tanggal"
        value={null}
        onChange={vi.fn()}
        display="date"
        errorMessage="Pilih tanggal sesi."
        isOptional
      />,
    );
    expect(screen.getByText("Pilih tanggal sesi.")).toBeInTheDocument();
    expect(screen.getByText("(opsional)")).toBeInTheDocument();
  });

  it("AC-L10N-005 the date field follows the app provider locale", () => {
    vi.mocked(useLocale).mockReturnValue("en");
    const { unmount } = render(
      <I18nProvider locale="en-US">
        <DateField label="Date" value="2026-11-10" onChange={vi.fn()} display="date" />
      </I18nProvider>,
    );
    expect(screen.getByText("Nov 10, 2026")).toBeInTheDocument();
    unmount();
    vi.mocked(useLocale).mockReturnValue("id");
    render(
      <I18nProvider locale="id-ID">
        <DateField label="Tanggal" value="2026-11-10" onChange={vi.fn()} display="date" />
      </I18nProvider>,
    );
    expect(screen.getByText("10 Nov 2026")).toBeInTheDocument();
  });
});
