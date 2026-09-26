import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { TextField } from "./text-field";
import { TEXT_FIELD_STORY_COPY } from "./text-field.stories.copy";

function handleStoryChange() {
  return undefined;
}

function handleStoryBlur() {
  return undefined;
}

const meta = {
  title: "Primitives/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: {
    label: TEXT_FIELD_STORY_COPY.name,
    name: "project-name",
    value: "",
    onChange: handleStoryChange,
    onBlur: handleStoryBlur,
  },
  parameters: {
    designSystemSpec: "docs/design-system/components/text-field.md",
  },
} satisfies Meta<typeof TextField>;

export default meta;

function EmptyRender() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label={TEXT_FIELD_STORY_COPY.name}
      name="project-name"
      value={value}
      onChange={setValue}
      onBlur={handleStoryBlur}
    />
  );
}

function HelperRender() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label={TEXT_FIELD_STORY_COPY.email}
      name="email"
      type="email"
      value={value}
      onChange={setValue}
      onBlur={handleStoryBlur}
      description={TEXT_FIELD_STORY_COPY.emailHelper}
    />
  );
}

function InvalidRender() {
  const [value, setValue] = useState("not-an-email");
  return (
    <TextField
      label={TEXT_FIELD_STORY_COPY.email}
      name="email"
      type="email"
      value={value}
      onChange={setValue}
      onBlur={handleStoryBlur}
      errorMessage={TEXT_FIELD_STORY_COPY.emailError}
    />
  );
}

function ReadOnlyRender() {
  return (
    <TextField
      label={TEXT_FIELD_STORY_COPY.workspace}
      name="workspace"
      value={TEXT_FIELD_STORY_COPY.workspaceValue}
      isReadOnly
      onChange={handleStoryChange}
      onBlur={handleStoryBlur}
    />
  );
}

export const Empty: StoryObj<typeof meta> = { render: EmptyRender };
export const Filled: StoryObj<typeof meta> = {
  args: {
    label: TEXT_FIELD_STORY_COPY.name,
    name: "project-name",
    value: TEXT_FIELD_STORY_COPY.project,
    onChange: handleStoryChange,
    onBlur: handleStoryBlur,
  },
};
export const WithHelper: StoryObj<typeof meta> = { render: HelperRender };
export const Invalid: StoryObj<typeof meta> = { render: InvalidRender };
export const ReadOnly: StoryObj<typeof meta> = { render: ReadOnlyRender };
export const Password: StoryObj<typeof meta> = {
  args: {
    label: TEXT_FIELD_STORY_COPY.password,
    name: "password",
    type: "password",
    value: "secret",
    onChange: handleStoryChange,
    onBlur: handleStoryBlur,
  },
};

export const Matrix: StoryObj<typeof meta> = {
  render: () => (
    <div className="grid max-w-[320px] gap-(--space-4)">
      <EmptyRender />
      <HelperRender />
      <InvalidRender />
      <ReadOnlyRender />
      <TextField
        label={TEXT_FIELD_STORY_COPY.optional}
        name="optional"
        value=""
        isOptional
        onChange={handleStoryChange}
        onBlur={handleStoryBlur}
        placeholder={TEXT_FIELD_STORY_COPY.optionalPlaceholder}
      />
      <TextField
        label={TEXT_FIELD_STORY_COPY.search}
        name="search"
        value=""
        iconLeading="search"
        onChange={handleStoryChange}
        onBlur={handleStoryBlur}
      />
    </div>
  ),
};
