import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: vi.fn(),
}));

const { useMobileViewport } = await import("@/ui/hooks/use-mobile-viewport/use-mobile-viewport");
const { PhotoSourcesScreen } = await import("./photo-sources-screen");

const sources = [
  { id: "1", displayName: "Google Drive Utama", provider: "GOOGLE_DRIVE", isActive: true },
  { id: "2", displayName: "Google Drive Arsip", provider: "GOOGLE_DRIVE", isActive: true },
  { id: "3", displayName: "Google Drive Lama", provider: "GOOGLE_DRIVE", isActive: false },
] as const;

describe("PhotoSourcesScreen", () => {
  beforeEach(() => {
    vi.mocked(useMobileViewport).mockReturnValue(false);
  });

  it("AC-SRC-003 renders ordered rows, status chips, actions and the setup guide", () => {
    render(<PhotoSourcesScreen workspaceId="ws-1" sources={sources} />);
    const list = screen.getByRole("list", { name: "Daftar sumber" });
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      expect.stringContaining("Google Drive Utama"),
      expect.stringContaining("Google Drive Arsip"),
      expect.stringContaining("Google Drive Lama"),
    ]);
    expect(within(list).getAllByText("Aktif")).toHaveLength(2);
    expect(within(list).getByText("Nonaktif")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Aksi untuk Google Drive Utama" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Menyiapkan folder Google Drive" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole("figure", { name: "Contoh struktur folder" })).toBeInTheDocument();
    expect(screen.getByText("Tautan Drive bisa melewati password gallery")).toBeInTheDocument();
  });

  it("AC-SRC-005 renders the empty state and add action", () => {
    render(<PhotoSourcesScreen workspaceId="ws-1" sources={[]} />);
    expect(screen.getByText("Belum ada sumber foto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah sumber" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Menyiapkan folder Google Drive" }),
    ).toBeInTheDocument();
  });

  it("renders the compact add action in the card header on phones", () => {
    vi.mocked(useMobileViewport).mockReturnValue(true);
    render(<PhotoSourcesScreen workspaceId="ws-1" sources={[]} />);
    expect(screen.getByRole("button", { name: "Tambah" })).toBeInTheDocument();
  });
});
