import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageHeadingOverride, PageHeadingOverrideProvider } from "./page-heading-override";

describe("PageHeadingOverride", () => {
  it("publishes the detail heading and clears it when the page unmounts", () => {
    const onChange = vi.fn();
    const view = render(
      <PageHeadingOverrideProvider onChange={onChange}>
        <PageHeadingOverride
          title="Wisuda Basic"
          subtitle="Paket foto wisuda."
          parent={{ label: "Layanan", href: "/w/ws/services" }}
        />
      </PageHeadingOverrideProvider>,
    );

    expect(onChange).toHaveBeenLastCalledWith({
      title: "Wisuda Basic",
      subtitle: "Paket foto wisuda.",
      parent: { label: "Layanan", href: "/w/ws/services" },
    });

    view.unmount();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("AC-PRJ-015 publishes the status chip and meta for a detail header", () => {
    const onChange = vi.fn();
    render(
      <PageHeadingOverrideProvider onChange={onChange}>
        <PageHeadingOverride
          title="Wisuda Basic — Rina"
          status={{ label: "Dibooking", tone: "info", hasDot: true }}
          meta="Rina · Belum ada jadwal"
          parent={{ label: "Proyek", href: "/w/ws/projects" }}
        />
      </PageHeadingOverrideProvider>,
    );

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: { label: "Dibooking", tone: "info", hasDot: true },
        meta: "Rina · Belum ada jadwal",
      }),
    );
  });
});
