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

const noop = () => undefined;

export const Selectable: StoryObj<typeof meta> = {
  args: { selection: { isSelected: false, onChange: noop } },
};

export const Selected: StoryObj<typeof meta> = {
  args: { selection: { isSelected: true, onChange: noop } },
};

export const SelectedWithQuantity: StoryObj<typeof meta> = {
  args: {
    selection: { isSelected: true, onChange: noop },
    badge: { label: COPY.quantity, tone: "info" },
  },
};

export const SelectedWithNote: StoryObj<typeof meta> = {
  args: {
    selection: { isSelected: true, onChange: noop },
    note: { hasNote: true, label: COPY.note, accessibleLabel: COPY.note, onPress: noop },
  },
};

export const OtherGroupMarker: StoryObj<typeof meta> = {
  args: {
    selection: { isSelected: false, onChange: noop },
    badge: { label: COPY.otherGroup, tone: "neutral" },
  },
};

export const LimitReached: StoryObj<typeof meta> = {
  args: { selection: { isSelected: false, isDisabled: true, onChange: noop } },
};

export const SelectedMissing: StoryObj<typeof meta> = {
  args: { isMissing: true, selection: { isSelected: true, onChange: noop } },
};
