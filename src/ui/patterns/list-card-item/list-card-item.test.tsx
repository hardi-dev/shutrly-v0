import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListCardItem } from "./list-card-item";
import { ListCardItemSkeleton } from "./list-card-item-skeleton";

describe("ListCardItem (C42 two-line)", () => {
  it("AC-SRC-003 renders title, meta and the trailing slot with a separator", () => {
    render(
      <ul>
        <ListCardItem
          icon="hard-drive"
          title="Google Drive Utama"
          meta="Google Drive"
          trailing={<span>Aktif</span>}
        />
      </ul>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("Google Drive Utama");
    expect(item).toHaveTextContent("Google Drive");
    expect(item).toHaveTextContent("Aktif");
    expect(item).toHaveClass("border-b");
  });

  it("drops the separator on the last row", () => {
    render(
      <ul>
        <ListCardItem icon="hard-drive" title="A" meta="B" isLast />
      </ul>,
    );
    expect(screen.getByRole("listitem")).not.toHaveClass("border-b");
  });

  it("renders a whole-row link with a chevron when href is set", () => {
    render(
      <ul>
        <ListCardItem icon="image" title="Bagikan gallery" meta="…" href="/x" />
      </ul>,
    );
    const link = screen.getByRole("link", { name: /Bagikan gallery/ });
    expect(link).toHaveAttribute("href", "/x");
    expect(link).toHaveClass("flex", "items-center");
    expect(link.querySelectorAll("svg")).toHaveLength(2);
  });

  it("omits the chevron when a linked row has trailing content", () => {
    render(
      <ul>
        <ListCardItem
          icon="image"
          title="Bagikan gallery"
          meta="…"
          href="/x"
          trailing={<span>Rp 100.000</span>}
        />
      </ul>,
    );
    const link = screen.getByRole("link", { name: /Bagikan gallery/ });
    expect(link).toHaveClass("absolute", "inset-0");
    expect(link).toHaveAttribute("aria-label", "Bagikan gallery");
    expect(link.querySelectorAll("svg")).toHaveLength(0);
  });

  it("AC-SRC-017 the skeleton is hidden from assistive technology", () => {
    render(
      <ul>
        <ListCardItemSkeleton />
      </ul>,
    );
    expect(screen.getByRole("listitem", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });

  it("renders avatar initials instead of an icon for a client row", () => {
    render(
      <ul>
        <ListCardItem avatarInitials="RI" title="Rina Indah" meta="+62 812-3456-7890" />
      </ul>,
    );

    expect(screen.getByText("RI")).toHaveClass("size-(--space-8)");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("requires exactly one leading icon or avatar", () => {
    expect(() =>
      render(
        <ul>
          <ListCardItem icon="image" avatarInitials="RI" title="Rina" meta="+62 812" />
        </ul>,
      ),
    ).toThrow("exactly one of icon or avatarInitials");
  });

  it("requires a leading icon or avatar", () => {
    expect(() =>
      render(
        <ul>
          <ListCardItem title="Rina" meta="+62 812" />
        </ul>,
      ),
    ).toThrow("exactly one of icon or avatarInitials");
  });
});
