import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/ui/primitives/button/button";

import { AppPanel, PageContent } from "./app-panel";
import { APP_PANEL_STORY_COPY } from "./app-panel.stories.copy";

const meta = {
  title: "Patterns/App Panel",
  component: AppPanel,
  args: {
    title: APP_PANEL_STORY_COPY.title,
    actions: <Button>{APP_PANEL_STORY_COPY.action}</Button>,
    children: (
      <PageContent>
        <p>{APP_PANEL_STORY_COPY.body}</p>
      </PageContent>
    ),
  },
  parameters: { designSystemSpec: "docs/design-system/components/app-panel.md" },
} satisfies Meta<typeof AppPanel>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
