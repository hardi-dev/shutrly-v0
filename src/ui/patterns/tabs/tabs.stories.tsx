import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageHeader } from "../page-header/page-header";
import { Tabs } from "./tabs";
import { TABS_STORY_COPY } from "./tabs.stories.copy";

const TABS = [
  { href: "/services", label: TABS_STORY_COPY.services, isActive: true },
  { href: "/services/categories", label: TABS_STORY_COPY.categories, isActive: false },
  { href: "/services/items", label: TABS_STORY_COPY.items, isActive: false },
];

const meta = {
  title: "Patterns/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    designSystemSpec: "docs/design-system/components/tabs.md",
  },
} satisfies Meta<typeof Tabs>;

export default meta;

export const Standalone: StoryObj<typeof meta> = {
  args: { label: TABS_STORY_COPY.label, tabs: TABS },
};

export const InHeader: StoryObj<typeof meta> = {
  args: { label: TABS_STORY_COPY.label, tabs: TABS },
  render: () => (
    <PageHeader
      parent={TABS_STORY_COPY.parent}
      current={TABS_STORY_COPY.services}
      title={TABS_STORY_COPY.services}
      tabs={{ label: TABS_STORY_COPY.label, tabs: TABS }}
    />
  ),
};
