import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "./textarea";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { label: "Catatan", placeholder: "Tulis catatan untuk klien" },
  parameters: { designSystemSpec: "docs/design-system/components/textarea.md" },
} satisfies Meta<typeof Textarea>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Optional: StoryObj<typeof meta> = { args: { optional: true } };
export const WithHelper: StoryObj<typeof meta> = { args: { helperText: "Maksimal 500 karakter" } };
export const ErrorState: StoryObj<typeof meta> = { args: { errorMessage: "Wajib diisi" } };
export const Disabled: StoryObj<typeof meta> = { args: { isDisabled: true } };
