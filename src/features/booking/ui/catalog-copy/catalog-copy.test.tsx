import { screen } from "@testing-library/react";
import { copyTranslator } from "@tests/support/copy/copy-messages";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { OptionListEditor } from "../option-list-editor/option-list-editor";
import { CATALOG_COPY, CATALOG_COPY_NAMESPACE } from "./catalog-copy.copy";

describe("catalog copy", () => {
  it("pluralises the service count in English and Indonesian", () => {
    const en = copyTranslator(CATALOG_COPY_NAMESPACE, "en");
    const id = copyTranslator(CATALOG_COPY_NAMESPACE, "id");
    expect(en("categoryMeta", { count: 1 })).toBe("1 service");
    expect(en("categoryMeta", { count: 3 })).toBe("3 services");
    expect(id("categoryMeta", { count: 3 })).toBe("3 layanan");
  });

  it("labels the option editor in English", () => {
    renderInLocale(<OptionListEditor options={["S"]} onChange={vi.fn()} />, "en");
    expect(screen.getByRole("button", { name: "Add choice" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Choice 1" })).toHaveAttribute(
      "placeholder",
      "e.g. Campus A",
    );
    expect(screen.getByRole("button", { name: "Remove choice S" })).toBeInTheDocument();
  });

  it("labels the option editor in Indonesian", () => {
    renderInLocale(<OptionListEditor options={["S"]} onChange={vi.fn()} />, "id");
    expect(screen.getByRole("button", { name: "Tambah pilihan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus pilihan S" })).toBeInTheDocument();
  });

  it("renders a catalog field error in English", () => {
    renderInLocale(<CatalogFieldError errorKey="NAME_TAKEN" />, "en");
    expect(screen.getByRole("alert")).toHaveTextContent("This name is already in use.");
  });

  it("uses English for the pick-mode line and the booking field dialog subtitle (F-24 D6, AC-SFX-017)", () => {
    expect(CATALOG_COPY.messages.en.pickModeMeta).toBe("Client choice: {mode}");
    expect(CATALOG_COPY.messages.en.fieldDialogDescription).toBe(
      "Filled in when creating a project from this service.",
    );
    expect(CATALOG_COPY.messages.id.pickModeMeta).toBe("Pilihan klien: {mode}");
    expect(CATALOG_COPY.messages.id.fieldDialogDescription).toBe(
      "Diisi saat membuat proyek dari layanan ini.",
    );
  });
});
