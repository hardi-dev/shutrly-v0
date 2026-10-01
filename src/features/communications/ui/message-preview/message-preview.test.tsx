import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MessagePreview } from "./message-preview";
import { previewHasPasswordNote, renderPreview } from "./render-preview";

describe("renderPreview", () => {
  it("AC-MSG-005 A-6 renders sample data, the real brand name and a masked password", () => {
    const text = renderPreview(
      "GALLERY_SHARE",
      "Halo {{clientName}} dari {{brandName}} {{galleryUrl}} {{galleryPassword}}",
      "Aster Wedding",
    );
    expect(text).toBe("Halo Rina & Dimas dari Aster Wedding https://shutrly.app/g/k7Qm… ••••••");
  });

  it("returns null for content that cannot be rendered", () => {
    expect(renderPreview("GALLERY_SHARE", "{{invoiceUrl}}", "Aster")).toBeNull();
  });

  it("BR-MSG-003 notes the password only where it can appear", () => {
    expect(previewHasPasswordNote("GALLERY_SHARE")).toBe(true);
    expect(previewHasPasswordNote("INVOICE_SHARE")).toBe(false);
  });
});

describe("MessagePreview", () => {
  it("AC-MSG-020 announces itself as a preview and shows the message", () => {
    render(<MessagePreview text={"Halo\nKak"} showsPasswordNote />);

    const region = screen.getByRole("region", { name: "Pratinjau pesan" });
    expect(region).toHaveTextContent("Halo");
    expect(region).toHaveTextContent("Password gallery diisi saat kamu membagikan pesan.");
  });

  it("shows the error state instead of a partial render", () => {
    render(<MessagePreview text={null} showsPasswordNote />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Pratinjau muncul lagi setelah isi template diperbaiki.",
    );
    expect(screen.queryByText(/Password gallery/)).not.toBeInTheDocument();
  });
});
