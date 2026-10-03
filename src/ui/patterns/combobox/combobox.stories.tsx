import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Combobox } from "./combobox";
import { COMBOBOX_STORY_COPY as COPY } from "./combobox.stories.copy";

const CLIENTS = [
  { id: "c1", name: "Rina", note: COPY.rinaNote },
  { id: "c2", name: "Rina Kartika", note: COPY.noNumberNote },
];

const renderClient = (client: (typeof CLIENTS)[number]) => ({
  label: client.name,
  description: client.note,
});

const meta = {
  title: "Patterns/Combobox",
  component: Combobox<(typeof CLIENTS)[number]>,
  tags: ["autodocs"],
  parameters: { designSystemSpec: "docs/design-system/components/combobox.md" },
  args: {
    label: COPY.label,
    placeholder: COPY.placeholder,
    items: CLIENTS,
    selectedId: null,
    inputValue: "Rin",
    onInputChange: () => undefined,
    onSelect: () => undefined,
    renderItem: renderClient,
    groupLabel: COPY.groupLabel,
    createLabel: COPY.createLabel,
    onCreate: () => undefined,
    description: COPY.description,
  },
} satisfies Meta<typeof Combobox<(typeof CLIENTS)[number]>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
