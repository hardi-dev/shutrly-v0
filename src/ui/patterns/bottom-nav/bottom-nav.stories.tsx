import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomNav } from "./bottom-nav";

const meta = {
  title: "Patterns/Bottom Nav",
  component: BottomNav,
  args: {
    items: [
      { href: "/", label: "Dasbor", icon: "layout-grid", isActive: true },
      { href: "/projects", label: "Proyek", icon: "folder-kanban", count: 12 },
      { href: "/clients", label: "Klien", icon: "users" },
      { href: "/more", label: "Lainnya", icon: "menu" },
    ],
    ctaLabel: "Proyek baru",
    onCtaPress: () => undefined,
  },
  parameters: { designSystemSpec: "docs/design-system/components/bottom-nav.md" },
} satisfies Meta<typeof BottomNav>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
