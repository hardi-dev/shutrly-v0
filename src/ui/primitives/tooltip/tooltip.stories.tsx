import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tooltip } from "./tooltip";
import { TOOLTIP_COPY } from "./tooltip.copy";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  args: {
    label: TOOLTIP_COPY.label,
    children: <button type="button">{TOOLTIP_COPY.trigger}</button>,
  },
  parameters: { designSystemSpec: "docs/design-system/components/nav-rail.md" },
} satisfies Meta<typeof Tooltip>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
