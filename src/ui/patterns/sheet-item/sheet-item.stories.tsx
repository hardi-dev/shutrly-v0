import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SheetItem } from "./sheet-item";

function handleNoop() {
  return undefined;
}

const meta = {
  title: "Patterns/Sheet Item",
  component: SheetItem,
  args: { label: "Unduh foto", icon: "send", onPress: handleNoop },
  parameters: { designSystemSpec: "docs/design-system/components/bottom-sheet.md" },
} satisfies Meta<typeof SheetItem>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const WithCount: StoryObj<typeof meta> = { args: { count: 3, label: "Invoice" } };
export const Destructive: StoryObj<typeof meta> = {
  args: { label: "Hapus dari pilihan", icon: "trash-2", variant: "destructive" },
};
