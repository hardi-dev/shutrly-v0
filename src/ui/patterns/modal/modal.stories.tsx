import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "@/ui/primitives/button/button";

import { Modal } from "./modal";
import { MODAL_COPY } from "./modal.copy";
import type { ModalStoryCopy } from "./modal.types";

function handleNoop() {
  return undefined;
}

function getModalStoryCopy(size: "sm" | "md" | "lg"): ModalStoryCopy {
  if (size === "sm") {
    return MODAL_COPY.small;
  }
  if (size === "lg") {
    return MODAL_COPY.large;
  }
  return MODAL_COPY.medium;
}

const meta = {
  title: "Patterns/Modal",
  component: Modal,
  args: {
    isOpen: false,
    onOpenChange: handleNoop,
    title: MODAL_COPY.medium.title,
    children: null,
  },
  parameters: { designSystemSpec: "docs/design-system/components/modal.md" },
} satisfies Meta<typeof Modal>;

export default meta;

function ModalStory({
  size,
  isDestructive = false,
}: Readonly<{ size: "sm" | "md" | "lg"; isDestructive?: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleOpenChange(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
  }

  const copy = getModalStoryCopy(size);

  function handleClose() {
    setIsOpen(false);
  }

  const actions =
    size === "lg" ? null : (
      <>
        <Button variant="secondary" onPress={handleClose}>
          {copy.cancel}
        </Button>
        <Button variant={isDestructive ? "danger" : "primary"} onPress={handleClose}>
          {copy.confirm}
        </Button>
      </>
    );

  return (
    <>
      <Button onPress={handleOpen}>{copy.title}</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        title={copy.title}
        description={"description" in copy ? copy.description : undefined}
        size={size}
        isDestructive={isDestructive}
        actions={actions}
      >
        <p>{copy.body}</p>
      </Modal>
    </>
  );
}

export const SmallConfirmation: StoryObj<typeof meta> = {
  render: () => <ModalStory size="sm" isDestructive />,
};

export const MediumForm: StoryObj<typeof meta> = {
  render: () => <ModalStory size="md" />,
};

export const LargeDetail: StoryObj<typeof meta> = {
  render: () => <ModalStory size="lg" />,
};
