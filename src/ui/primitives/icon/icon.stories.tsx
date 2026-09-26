import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Icon } from "./icon";
import { ICON_NAMES } from "./icon.registry";

const meta = {
  title: "Primitives/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    size: { control: "select", options: ["sm", "md"] },
  },
  parameters: {
    designSystemSpec: "docs/design-system/components/icon.md",
  },
} satisfies Meta<typeof Icon>;

export default meta;

export const Registry: StoryObj<typeof meta> = {
  args: { name: "search" },
  render: () => (
    <div className="grid grid-cols-2 gap-(--space-4) sm:grid-cols-4">
      {ICON_NAMES.map((name) => (
        <div className="flex items-center gap-(--space-2)" key={name}>
          <Icon name={name} />
          <span className="text-(length:--font-size-label)">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Default: StoryObj<typeof meta> = {
  args: { name: "search" },
};
