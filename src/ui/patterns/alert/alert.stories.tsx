import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Alert } from "./alert";

const meta = {
  title: "Patterns/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: { tone: "info", title: "Periksa email Anda" },
  argTypes: {
    tone: { control: "select", options: ["success", "info", "warning", "danger", "highlight"] },
  },
  parameters: { designSystemSpec: "docs/design-system/components/alert.md" },
} satisfies Meta<typeof Alert>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Success: StoryObj<typeof meta> = {
  args: { tone: "success", title: "Tersimpan", body: "Perubahan berhasil disimpan." },
};
export const Danger: StoryObj<typeof meta> = {
  args: { tone: "danger", title: "Terjadi kesalahan", live: true },
};
export const Warning: StoryObj<typeof meta> = {
  args: { tone: "warning", title: "Perlu perhatian", live: true },
};
export const Highlight: StoryObj<typeof meta> = {
  args: { tone: "highlight", title: "Info pilihan" },
};
