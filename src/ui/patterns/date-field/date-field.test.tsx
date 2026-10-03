import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
});
