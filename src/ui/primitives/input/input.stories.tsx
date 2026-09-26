import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Input } from "./input";
import { INPUT_STORY_COPY } from "./input.stories.copy";

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  args: { "aria-label": "Nama proyek", placeholder: INPUT_STORY_COPY.value },
  argTypes: {
    variant: { control: "select", options: ["default", "search"] },
    iconLeading: { control: "select", options: [undefined, "search"] },
    iconTrailing: {
      control: "select",
      options: [undefined, "chevron-down", "calendar", "eye", "eye-off", "circle-alert"],
    },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  parameters: {
    designSystemSpec: "docs/design-system/components/input.md",
  },
} satisfies Meta<typeof Input>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Search: StoryObj<typeof meta> = {
  args: {
    variant: "search",
    "aria-label": INPUT_STORY_COPY.search,
    iconLeading: "search",
    shortcut: INPUT_STORY_COPY.shortcut,
  },
};
export const Filled: StoryObj<typeof meta> = {
  args: { value: INPUT_STORY_COPY.value, "aria-label": "Nama proyek terisi" },
};
export const Prefix: StoryObj<typeof meta> = {
  args: {
    value: INPUT_STORY_COPY.price,
    prefix: INPUT_STORY_COPY.pricePrefix,
    "aria-label": "Harga",
  },
};

function PasswordRender() {
  const [isVisible, setIsVisible] = useState(false);
  const handleToggleVisibility = () => {
    setIsVisible((visible) => !visible);
  };
  return (
    <Input
      type={isVisible ? "text" : "password"}
      value="password"
      iconTrailing={isVisible ? "eye-off" : "eye"}
      iconTrailingAction={{
        label: isVisible ? INPUT_STORY_COPY.passwordHide : INPUT_STORY_COPY.passwordShow,
        onPress: handleToggleVisibility,
      }}
      aria-label={INPUT_STORY_COPY.passwordLabel}
    />
  );
}

export const Password: StoryObj<typeof meta> = { render: PasswordRender };
export const Select: StoryObj<typeof meta> = {
  args: { placeholder: "Layanan", iconTrailing: "chevron-down", "aria-label": "Layanan" },
};
export const DateField: StoryObj<typeof meta> = {
  args: {
    placeholder: INPUT_STORY_COPY.date,
    iconTrailing: "calendar",
    "aria-label": "Tanggal sesi",
  },
};
export const Invalid: StoryObj<typeof meta> = {
  args: {
    value: "not-an-email",
    isInvalid: true,
    iconTrailing: "circle-alert",
    "aria-label": "Email",
  },
};
export const Disabled: StoryObj<typeof meta> = {
  args: { value: INPUT_STORY_COPY.value, isDisabled: true, "aria-label": "Nama proyek nonaktif" },
};
