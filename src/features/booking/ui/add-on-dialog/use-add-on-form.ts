"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { createAddOnSchema } from "@/features/booking/application/use-cases/create-add-on/create-add-on.schema";
import type {
  CreateAddOnFields,
  CreateAddOnInput,
} from "@/features/booking/application/use-cases/create-add-on/create-add-on.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { ADD_ON_COPY as COPY } from "../add-on-copy/add-on.copy";
import type { AddOnDialogProps } from "./add-on-dialog.types";

const FIELDS = ["description", "selectionGroupId", "quantity", "unitPrice"] as const;

function defaults(firstTargetId: string): CreateAddOnInput {
  return {
    description: "",
    selectionGroupId: firstTargetId,
    quantity: "",
    unitPrice: "",
  };
}

/**
 * Drives *Tambah add-on*: client validation with the shared schema, the create write, and server
 * field errors (AC-ADD-006); the server recomputes everything (C-004).
 * @param props - the dialog props
 * @returns the form, the pending flag and the submit handler
 */
export function useAddOnForm(props: Readonly<AddOnDialogProps>) {
  const firstTargetId = props.targets.at(0)?.id ?? "";
  const form = useForm<CreateAddOnInput, unknown, CreateAddOnFields>({
    resolver: zodResolver(createAddOnSchema),
    defaultValues: defaults(firstTargetId),
    shouldFocusError: true,
  });
  const [isPending, setIsPending] = useState(false);
  const { isOpen } = props;
  useEffect(() => {
    if (isOpen) form.reset(defaults(firstTargetId));
  }, [form, isOpen, firstTargetId]);

  async function submit(): Promise<void> {
    setIsPending(true);
    try {
      const result = await props.createAction(props.workspaceId, props.projectId, form.getValues());
      if (result.ok) {
        showToast({ tone: "success", title: COPY.draftSavedTitle });
        props.onOpenChange(false);
      } else if (result.code === "VALIDATION_FAILED") {
        for (const field of FIELDS) {
          if (field in result.fieldErrors) {
            form.setError(field, { type: "server", message: result.fieldErrors[field] });
          }
        }
      } else {
        showToast({ tone: "danger", title: COPY.projectStatusTitle });
      }
    } catch {
      showToast({ tone: "danger", title: COPY.failedTitle });
    } finally {
      setIsPending(false);
    }
  }
  // handleSubmit (not trigger) marks the form submitted, so errors clear as the Owner types.
  const validated = form.handleSubmit(submit);
  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    void validated(event);
  }
  return { form, isPending, handleSubmit };
}
