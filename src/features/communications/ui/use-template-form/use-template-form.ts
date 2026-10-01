"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";

import { messageTemplateContentSchema } from "@/features/communications/application/schemas/message-template-content/message-template-content.schema";
import { normaliseTemplateContent } from "@/features/communications/domain/template-content/template-content";
import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

import type {
  TemplateForm,
  TemplateFormOptions,
  TemplateFormValues,
} from "./use-template-form.types";

function setContent(form: UseFormReturn<TemplateFormValues>, next: string): void {
  form.setValue("content", next, {
    shouldDirty: true,
    shouldValidate: form.formState.isSubmitted,
  });
}

function insertAtCaret(
  form: UseFormReturn<TemplateFormValues>,
  element: HTMLTextAreaElement | null,
  name: TemplateVariable,
): void {
  const current = form.getValues("content");
  const start = element?.selectionStart ?? current.length;
  const end = element?.selectionEnd ?? current.length;
  const token = `{{${name}}}`;
  setContent(form, `${current.slice(0, start)}${token}${current.slice(end)}`);
  requestAnimationFrame(() => {
    placeCaret(element, start + token.length);
  });
}

function placeCaret(element: HTMLTextAreaElement | null, position: number): void {
  element?.focus();
  element?.setSelectionRange(position, position);
}

/**
 * Editor form state: the shared schema validates as the Owner types (UX only, C-004), server
 * field errors land on the content, a failed request keeps the text and offers a retry
 * (AC-MSG-012), and Restore default is a draft change (A-4).
 * @param options - type, stored and default content, the bound action and feedback callbacks
 * @returns the form, the textarea ref, the live content and the editor actions
 */
export function useTemplateForm(options: TemplateFormOptions): TemplateForm {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(messageTemplateContentSchema(options.type)),
    defaultValues: { content: options.content },
    shouldFocusError: true,
  });
  const content = useWatch({ control: form.control, name: "content" });

  async function submit(values: TemplateFormValues): Promise<void> {
    const failure = await options.action(values);
    if (failure) {
      form.setError(
        "content",
        { type: "server", message: failure.fieldErrors.content },
        { shouldFocus: true },
      );
      return;
    }
    form.reset({ content: normaliseTemplateContent(values.content) });
    options.onSaved();
  }

  const handle = form.handleSubmit(submit);
  function onSubmit(event?: BaseSyntheticEvent): void {
    handle(event).catch(failRequest);
  }
  function failRequest(): void {
    options.onFailed(onSubmit);
  }

  function insertVariable(name: TemplateVariable): void {
    insertAtCaret(form, textareaRef.current, name);
  }
  function setTextarea(element: HTMLTextAreaElement | null): void {
    textareaRef.current = element;
  }

  function restoreDefault(): void {
    setContent(form, options.defaultContent);
  }

  return {
    form,
    setTextarea,
    content,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
    insertVariable,
    restoreDefault,
  };
}
