import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/ui/primitives/button/button";

import { Menu } from "./menu";
import { MENU_STORY_COPY } from "./menu.stories.copy";
import { MenuDivider } from "./menu-divider";
import { MenuGroupLabel } from "./menu-group-label";
import { MenuItem } from "./menu-item";
import { MenuTrigger } from "./menu-trigger";

function handleStorySelect() {
  return undefined;
}

const meta = {
  title: "Patterns/Menu",
  component: Menu,
  args: { children: null, "aria-label": "Menu" },
  parameters: { designSystemSpec: "docs/design-system/components/menu.md" },
} satisfies Meta<typeof Menu>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <MenuTrigger label={MENU_STORY_COPY.default.trigger}>
      <Button variant="secondary" iconTrailing="chevron-down">
        {MENU_STORY_COPY.default.trigger}
      </Button>
      <Menu aria-label={MENU_STORY_COPY.default.trigger}>
        <MenuItem label={MENU_STORY_COPY.default.items.prewedding} onSelect={handleStorySelect} />
        <MenuItem
          label={MENU_STORY_COPY.default.items.wedding}
          isSelected
          onSelect={handleStorySelect}
        />
        <MenuItem label={MENU_STORY_COPY.default.items.product} onSelect={handleStorySelect} />
        <MenuItem label={MENU_STORY_COPY.default.items.family} onSelect={handleStorySelect} />
      </Menu>
    </MenuTrigger>
  ),
};

export const ActionMenu: StoryObj<typeof meta> = {
  render: () => (
    <MenuTrigger label={MENU_STORY_COPY.action.trigger}>
      <Button variant="secondary" iconTrailing="chevron-down">
        {MENU_STORY_COPY.action.trigger}
      </Button>
      <Menu aria-label={MENU_STORY_COPY.action.trigger}>
        <MenuItem
          label={MENU_STORY_COPY.action.edit}
          icon="settings"
          onSelect={handleStorySelect}
        />
        <MenuItem
          label={MENU_STORY_COPY.action.duplicate}
          icon="plus"
          onSelect={handleStorySelect}
        />
        <MenuDivider />
        <MenuItem
          label={MENU_STORY_COPY.action.delete}
          icon="trash-2"
          variant="destructive"
          onSelect={handleStorySelect}
        />
      </Menu>
    </MenuTrigger>
  ),
};

export const Grouped: StoryObj<typeof meta> = {
  render: () => (
    <MenuTrigger label={MENU_STORY_COPY.grouped.trigger} defaultOpen>
      <Button variant="secondary" iconTrailing="chevron-down">
        {MENU_STORY_COPY.grouped.trigger}
      </Button>
      <Menu aria-label={MENU_STORY_COPY.grouped.trigger}>
        <MenuGroupLabel>{MENU_STORY_COPY.grouped.label}</MenuGroupLabel>
        <MenuItem label={MENU_STORY_COPY.grouped.services} onSelect={handleStorySelect} />
        <MenuItem label={MENU_STORY_COPY.grouped.team} isDisabled onSelect={handleStorySelect} />
      </Menu>
    </MenuTrigger>
  ),
};
