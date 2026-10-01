import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SegmentedControl } from "./segmented-control";
import { SEGMENTED_CONTROL_STORY_COPY as COPY } from "./segmented-control.stories.copy";

const OPTIONS = [
  { id: "edit", label: COPY.edit },
  { id: "preview", label: COPY.preview },
];

function Interactive() {
  const [selectedId, setSelectedId] = useState("edit");
  return (
    <SegmentedControl
      label={COPY.label}
      options={OPTIONS}
      selectedId={selectedId}
      onChange={setSelectedId}
    />
  );
}

const meta = {
  title: "Patterns/Segmented control",
  component: Interactive,
} satisfies Meta<typeof Interactive>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
