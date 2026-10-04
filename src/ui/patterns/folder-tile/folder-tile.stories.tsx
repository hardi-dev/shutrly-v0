import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FolderTile } from "./folder-tile";
import { FOLDER_TILE_STORY_COPY as COPY } from "./folder-tile.stories.copy";

const meta = {
  title: "Patterns/Folder Tile",
  component: FolderTile,
  args: { name: COPY.name, countLabel: COPY.countLabel, onPress: () => undefined },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-[240px]">{Story()}</div>],
} satisfies Meta<typeof FolderTile>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
