import { render, screen, within } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";

import { TemplateListScreen } from "./template-list-screen";

describe("TemplateListScreen", () => {
  it("AC-MSG-004 groups the five templates under Gallery and Invoice in journey order", () => {
    render(<TemplateListScreen workspaceId="A" types={TEMPLATE_TYPES} />);

    const gallery = screen.getByRole("region", { name: "Galeri" });
    const invoice = screen.getByRole("region", { name: "Tagihan" });
    expect(
      within(gallery)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/w/A/message-templates/gallery-share",
      "/w/A/message-templates/selection-reminder",
      "/w/A/message-templates/final-delivery",
    ]);
    expect(
      within(invoice)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/w/A/message-templates/invoice-share", "/w/A/message-templates/payment-reminder"]);
  });

  it("A-5 shows each template's label and purpose", () => {
    render(<TemplateListScreen workspaceId="A" types={TEMPLATE_TYPES} />);

    const row = screen.getByRole("link", { name: /Pengingat pembayaran/ });
    expect(row).toHaveTextContent("Untuk tagihan yang belum lunas.");
  });

  it("renders the list in English with the deck's group and row wording", () => {
    renderInLocale(<TemplateListScreen workspaceId="A" types={TEMPLATE_TYPES} />, "en");

    expect(screen.getByRole("region", { name: "Galleries" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Payment reminder/ })).toHaveTextContent(
      "For invoices with an outstanding balance.",
    );
  });
});
