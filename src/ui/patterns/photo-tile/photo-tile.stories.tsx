import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoTile, PhotoTileSkeleton } from "./photo-tile";
import { PHOTO_TILE_STORY_COPY as COPY } from "./photo-tile.stories.copy";

// A local placeholder image; stories never call the media endpoint.
const IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='3'><rect width='4' height='3' fill='gray'/></svg>";

const meta = {
  title: "Patterns/Photo Tile",
  component: PhotoTile,
  args: { fileName: COPY.fileName, imageSrc: IMAGE },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-[240px]">{Story()}</div>],
} satisfies Meta<typeof PhotoTile>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const Missing: StoryObj<typeof meta> = { args: { isMissing: true } };

export const WithMeta: StoryObj<typeof meta> = { args: { meta: COPY.meta } };

export const Skeleton: StoryObj<typeof meta> = { render: () => <PhotoTileSkeleton /> };
