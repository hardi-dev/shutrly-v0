import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar } from "./avatar";
import { AVATAR_STORY_COPY } from "./avatar.stories.copy";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { initials: AVATAR_STORY_COPY.name, "aria-label": AVATAR_STORY_COPY.name },
  argTypes: { size: { control: "select", options: ["sm", "md", "lg"] } },
  parameters: { designSystemSpec: "docs/design-system/components/avatar.md" },
} satisfies Meta<typeof Avatar>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div className="flex items-center gap-(--space-4)">
      <Avatar initials="DS" size="sm" aria-label={AVATAR_STORY_COPY.name} />
      <Avatar initials="DS" size="md" aria-label={AVATAR_STORY_COPY.name} />
      <Avatar initials="DS" size="lg" aria-label={AVATAR_STORY_COPY.name} />
    </div>
  ),
};
