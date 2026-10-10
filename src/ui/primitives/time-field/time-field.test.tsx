import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { I18nProvider } from "react-aria-components";
import { describe, expect, it, vi } from "vitest";

import { TimeField } from "./time-field";

function renderInEnglish(ui: ReactElement) {
  return render(<I18nProvider locale="en-US">{ui}</I18nProvider>);
}

function renderInIndonesian(ui: ReactElement) {
  return render(<I18nProvider locale="id-ID">{ui}</I18nProvider>);
}

describe("TimeField", () => {
  it("AC-PRJ-029 shows a 24-hour time with a dot, like 07.30", () => {
    renderInIndonesian(<TimeField label="Jam mulai" value="07:30" onChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: "Jam mulai" })).toHaveTextContent("07.30");
  });

  it("AC-PRJ-029 reports HH:MM when the hour or the minute is changed", async () => {
    const onChange = vi.fn();
    renderInIndonesian(<TimeField label="Jam mulai" value="07:30" onChange={onChange} />);
    const [hour, minute] = screen.getAllByRole("spinbutton");
    await userEvent.click(hour);
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenLastCalledWith("08:30");
    await userEvent.click(minute);
    await userEvent.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith("07:29");
  });

  it("AC-PRJ-029 shows empty segments for an empty value", () => {
    renderInIndonesian(<TimeField label="Jam mulai" value={null} onChange={vi.fn()} />);
    expect(screen.getAllByRole("spinbutton")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Jam mulai" })).not.toHaveTextContent("07");
  });

  it("AC-PRJ-029 shows the optional suffix and the error", () => {
    renderInIndonesian(
      <TimeField
        label="Jam selesai"
        value={null}
        onChange={vi.fn()}
        isOptional
        errorMessage="Jam selesai harus setelah jam mulai."
      />,
    );
    expect(screen.getByText("(opsional)")).toBeInTheDocument();
    expect(screen.getByText("Jam selesai harus setelah jam mulai.")).toBeInTheDocument();
  });

  it("D-23 the time field shows 24-hour time in en-US", () => {
    renderInEnglish(<TimeField label="Start time" value="07:30" onChange={vi.fn()} />);
    expect(screen.queryByText(/AM|PM/)).toBeNull();
  });
});
