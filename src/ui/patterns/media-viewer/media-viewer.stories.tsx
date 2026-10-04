import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MediaViewer } from "./media-viewer";
import { MEDIA_VIEWER_STORY_COPY as COPY } from "./media-viewer.stories.copy";

// A local placeholder image; stories never call the media endpoint.
const IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='3'><rect width='4' height='3' fill='gray'/></svg>";

const meta = {
  title: "Patterns/Media Viewer",
  component: MediaViewer,
  args: {
    items: [
      { id: "a", title: COPY.first, meta: COPY.meta },
      { id: "b", title: COPY.second, meta: COPY.meta, isMissing: true },
    ],
    index: 0,
    onIndexChange: () => undefined,
    onClose: () => undefined,
    imageSrc: () => IMAGE,
    missingText: COPY.missing,
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaViewer>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const Missing: StoryObj<typeof meta> = { args: { index: 1 } };
