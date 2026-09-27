"use client";

import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";
import { Input } from "@/ui/primitives/input/input";

import { CREATE_WORKSPACE_COPY } from "./create-workspace-dialog.copy";
import type { CreateWorkspaceDialogProps } from "./create-workspace-dialog.types";

/** Renders the create-workspace modal form used by the switcher. @param props - dialog state and server action @returns the modal or null */
export function CreateWorkspaceDialog({
  isOpen,
  onOpenChange,
  action,
}: Readonly<CreateWorkspaceDialogProps>) {
  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={CREATE_WORKSPACE_COPY.title}
      description={CREATE_WORKSPACE_COPY.description}
      size="sm"
      actions={
        <Button variant="secondary" onPress={handleCancel}>
          {CREATE_WORKSPACE_COPY.cancel}
        </Button>
      }
    >
      <form action={action} className="flex flex-col gap-(--space-3)">
        <label className="flex flex-col gap-(--space-2) text-(length:--font-size-label) font-semibold">
          {CREATE_WORKSPACE_COPY.label}
          <Input name="name" placeholder={CREATE_WORKSPACE_COPY.placeholder} />
        </label>
        <Button type="submit">{CREATE_WORKSPACE_COPY.submit}</Button>
      </form>
    </Modal>
  );
}
