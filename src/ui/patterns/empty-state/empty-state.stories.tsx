import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/ui/primitives/button/button";

import { EmptyState } from "./empty-state";
import { EMPTY_STATE_STORY_COPY as COPY } from "./empty-state.stories.copy";

const meta = {
  title: "Patterns/Empty State",
  component: EmptyState,
  args: {
    icon: "camera",
    title: COPY.title,
    body: COPY.body,
    action: <Button variant="secondary">{COPY.action}</Button>,
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyState>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const WithoutAction: StoryObj<typeof meta> = {
  args: { action: undefined },
};

export const PrimaryAction: StoryObj<typeof meta> = {
  args: {
    icon: "receipt",
    iconTone: "primary",
    action: <Button variant="primary">{COPY.primaryAction}</Button>,
  },
};

export const DangerAction: StoryObj<typeof meta> = {
  args: {
    icon: "circle-alert",
    iconTone: "danger",
    action: <Button variant="danger">{COPY.dangerAction}</Button>,
  },
};
