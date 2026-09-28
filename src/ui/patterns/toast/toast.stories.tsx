import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/ui/primitives/button/button";

import { showToast, ToastRegion } from "./toast";
import { TOAST_STORY_COPY as COPY } from "./toast.stories.copy";

const meta = {
  title: "Patterns/Toast",
  component: ToastRegion,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ToastRegion>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => {
    function handleShowToast() {
      showToast({ tone: "success", title: COPY.title, body: COPY.body });
    }

    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Button onPress={handleShowToast}>{COPY.trigger}</Button>
        <ToastRegion />
      </div>
    );
  },
};
