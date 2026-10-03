import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { ListCardItem } from "./list-card-item";
import { LIST_CARD_ITEM_STORY_COPY as COPY } from "./list-card-item.stories.copy";
import { ListCardItemSkeleton } from "./list-card-item-skeleton";

const meta = {
  title: "Patterns/List Card Item",
  component: ListCardItem,
  parameters: { designSystemSpec: "docs/design-system/components/list-card.md" },
  decorators: [
    (Story) => (
      <ul className="max-w-(--size-content-narrow) overflow-hidden rounded-(--radius-lg) border border-(--component-list-card-item-border)">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof ListCardItem>;

export default meta;

export const TwoLine: StoryObj<typeof meta> = {
  args: { icon: "hard-drive", title: COPY.title, meta: COPY.meta, isLast: true },
};

export const WithStatusAndMenu: StoryObj<typeof meta> = {
  args: {
    icon: "hard-drive",
    title: COPY.title,
    meta: COPY.meta,
    trailing: <StatusChip tone="success" label={COPY.active} />,
  },
};

export const Link: StoryObj<typeof meta> = {
  args: { icon: "folder-open", title: COPY.galleryTitle, meta: COPY.galleryMeta, href: "/gallery" },
};

export const Client: StoryObj<typeof meta> = {
  args: { avatarInitials: "RI", title: COPY.clientTitle, meta: COPY.clientMeta, isLast: true },
};

export const Skeleton: StoryObj<typeof meta> = {
  args: { icon: "hard-drive", title: COPY.title, meta: COPY.meta },
  render: () => <ListCardItemSkeleton />,
};
