import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { OptionCardGroup } from "./option-card-group";
import { OPTION_CARD_GROUP_STORY_COPY as COPY } from "./option-card-group.stories.copy";
import type { OptionCardGroupProps, OptionCardOption } from "./option-card-group.types";

const PROVIDER_OPTIONS: readonly OptionCardOption[] = [
  { ...COPY.googleDrive, icon: "hard-drive" },
  { ...COPY.dropbox, icon: "dropbox", isDisabled: true },
  { ...COPY.onedrive, icon: "cloud", isDisabled: true, badge: "Segera hadir" },
  { ...COPY.amazonS3, icon: "database", isDisabled: true, badge: "Segera hadir" },
  { ...COPY.customUrl, icon: "link", isDisabled: true, badge: "Segera hadir" },
];

const ALL_ENABLED_OPTIONS: readonly OptionCardOption[] = [
  { ...COPY.googleDrive, icon: "hard-drive" },
  { ...COPY.dropbox, icon: "dropbox", badge: "Direkomendasikan" },
  { ...COPY.onedrive, icon: "cloud" },
];

function ControlledOptionCardGroup({ options }: Readonly<Pick<OptionCardGroupProps, "options">>) {
  const [value, setValue] = useState(options[0]?.value ?? "");
  return <OptionCardGroup label={COPY.label} options={options} value={value} onChange={setValue} />;
}

function ignoreChange(): void {
  // Story args keep the controlled component contract explicit.
}

const meta = {
  title: "Patterns/Option Card",
  component: OptionCardGroup,
  parameters: { designSystemSpec: "docs/design-system/components/option-card.md" },
  decorators: [
    (Story) => (
      <div className="max-w-(--size-content-narrow)">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptionCardGroup>;

export default meta;

export const ProviderChoice: StoryObj<typeof meta> = {
  args: {
    label: COPY.label,
    options: PROVIDER_OPTIONS,
    value: "GOOGLE_DRIVE",
    onChange: ignoreChange,
  },
  render: () => <ControlledOptionCardGroup options={PROVIDER_OPTIONS} />,
};

export const AllEnabled: StoryObj<typeof meta> = {
  args: {
    label: COPY.label,
    options: ALL_ENABLED_OPTIONS,
    value: "GOOGLE_DRIVE",
    onChange: ignoreChange,
  },
  render: () => <ControlledOptionCardGroup options={ALL_ENABLED_OPTIONS} />,
};
