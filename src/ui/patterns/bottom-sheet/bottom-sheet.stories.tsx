import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "@/ui/primitives/button/button";

import { SheetItem } from "../sheet-item/sheet-item";
import { BottomSheet } from "./bottom-sheet";
import { BOTTOM_SHEET_COPY } from "./bottom-sheet.copy";

function handleNoop() {
  return undefined;
}

const meta = {
  title: "Patterns/Bottom Sheet",
  component: BottomSheet,
  args: {
    isOpen: false,
    onOpenChange: handleNoop,
    title: BOTTOM_SHEET_COPY.actions.title,
    children: null,
  },
  parameters: { designSystemSpec: "docs/design-system/components/bottom-sheet.md" },
} satisfies Meta<typeof BottomSheet>;

export default meta;

function useSheetState() {
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, setIsOpen };
}

function ActionSheetStory() {
  const { isOpen, setIsOpen } = useSheetState();
  function handleOpen() {
    setIsOpen(true);
  }
  function handleClose() {
    setIsOpen(false);
  }
  return (
    <>
      <Button onPress={handleOpen}>{BOTTOM_SHEET_COPY.actions.title}</Button>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={BOTTOM_SHEET_COPY.actions.title}
        meta={BOTTOM_SHEET_COPY.actions.meta}
      >
        <SheetItem label={BOTTOM_SHEET_COPY.actions.download} icon="send" onPress={handleClose} />
        <SheetItem label={BOTTOM_SHEET_COPY.actions.share} icon="share-2" onPress={handleClose} />
        <SheetItem
          label={BOTTOM_SHEET_COPY.actions.delete}
          icon="trash-2"
          variant="destructive"
          onPress={handleClose}
        />
      </BottomSheet>
    </>
  );
}

function FormSheetStory() {
  const { isOpen, setIsOpen } = useSheetState();
  function handleOpen() {
    setIsOpen(true);
  }
  function handleClose() {
    setIsOpen(false);
  }
  return (
    <>
      <Button onPress={handleOpen}>{BOTTOM_SHEET_COPY.form.title}</Button>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={BOTTOM_SHEET_COPY.form.title}
        description={BOTTOM_SHEET_COPY.form.description}
        variant="form"
        actions={
          <>
            <Button variant="secondary" size="lg" onPress={handleClose}>
              {BOTTOM_SHEET_COPY.form.cancel}
            </Button>
            <Button size="lg" onPress={handleClose}>
              {BOTTOM_SHEET_COPY.form.confirm}
            </Button>
          </>
        }
      >
        <p>{BOTTOM_SHEET_COPY.form.body}</p>
      </BottomSheet>
    </>
  );
}

function MenuSheetStory() {
  const { isOpen, setIsOpen } = useSheetState();
  function handleOpen() {
    setIsOpen(true);
  }
  function handleClose() {
    setIsOpen(false);
  }
  return (
    <>
      <Button onPress={handleOpen}>{BOTTOM_SHEET_COPY.menu.title}</Button>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={BOTTOM_SHEET_COPY.menu.title}
        variant="menu"
      >
        <SheetItem
          label={BOTTOM_SHEET_COPY.menu.workspace}
          icon="chevrons-up-down"
          onPress={handleClose}
        />
        <SheetItem label={BOTTOM_SHEET_COPY.menu.settings} icon="settings" onPress={handleClose} />
        <SheetItem label={BOTTOM_SHEET_COPY.menu.logout} icon="log-out" onPress={handleClose} />
      </BottomSheet>
    </>
  );
}

export const Actions: StoryObj<typeof meta> = { render: () => <ActionSheetStory /> };
export const Form: StoryObj<typeof meta> = { render: () => <FormSheetStory /> };
export const Menu: StoryObj<typeof meta> = { render: () => <MenuSheetStory /> };
