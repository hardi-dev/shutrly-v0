"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";

import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";
import { clientInputSchema } from "@/features/booking/application/schemas/client-input/client-input.schema";
import type {
  ClientFields,
  ClientInput,
} from "@/features/booking/application/schemas/client-input/client-input.types";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { clientFieldErrorText } from "../client-field-error/client-field-error";
import { SocialLinksEditor } from "../social-links-editor/social-links-editor";
import type { ClientDialogProps } from "./client-dialog.types";

const FORM_ID = "client-form";
const DEFAULT_VALUES: ClientInput = {
  name: "",
  whatsappNumber: "",
  socialLinks: [{ platform: "INSTAGRAM", value: "" }],
};

/** Presents the add-client form as a desktop modal or a phone form sheet. */
export function ClientDialog(props: Readonly<ClientDialogProps>) {
  const mobile = useMobileViewport();
  const controller = useClientDialogForm(props);
  const content = (
    <ClientForm controller={controller} isMobile={mobile} numberHolder={controller.numberHolder} />
  );
  const isEditing = props.mode === "edit";
  const save = (
    <ClientSaveButton isPending={controller.isPending} mobile={mobile} isEditing={isEditing} />
  );
  const title = isEditing ? CLIENT_COPY.editDialogTitle : CLIENT_COPY.dialogTitle;
  const description = isEditing ? CLIENT_COPY.editDialogDescription : CLIENT_COPY.dialogDescription;
  if (mobile)
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={title}
        description={description}
        variant="form"
        actions={save}
      >
        {content}
      </BottomSheet>
    );
  function close(): void {
    props.onOpenChange(false);
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={title}
      description={description}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={close} isDisabled={controller.isPending}>
            {CLIENT_COPY.cancel}
          </Button>
          {save}
        </>
      }
    >
      {content}
    </Modal>
  );
}

function useClientDialogForm(props: Readonly<ClientDialogProps>) {
  const form = useForm<ClientInput, unknown, ClientFields>({
    resolver: zodResolver(clientInputSchema),
    defaultValues: clientFormValues(props.client),
    shouldFocusError: true,
  });
  const [isPending, setIsPending] = useState(false);
  const [numberHolder, setNumberHolder] = useState<NumberHolder | undefined>();
  useEffect(() => {
    if (props.isOpen) {
      form.reset(clientFormValues(props.client));
      form.clearErrors();
      const clearHolder = window.setTimeout(() => {
        setNumberHolder(undefined);
      });
      return () => {
        window.clearTimeout(clearHolder);
      };
    }
    return undefined;
  }, [form, props.client, props.isOpen]);
  async function submit(): Promise<void> {
    if (!(await form.trigger())) return;
    setIsPending(true);
    try {
      const raw = form.getValues();
      const result = await props.onSubmit(props.workspaceId, raw);
      if (result?.ok === false) {
        setNumberHolder(result.numberHolder);
        setServerErrors(form, result.fieldErrors);
        return;
      }
      props.onOpenChange(false);
    } catch {
      // The mutation hook presents a retryable failure toast and the raw values remain in the form.
    } finally {
      setIsPending(false);
    }
  }
  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    void submit();
  }
  return { form, isPending, handleSubmit, numberHolder };
}

function clientFormValues(client: ClientDialogProps["client"]): ClientInput {
  if (!client) return DEFAULT_VALUES;
  return {
    name: client.name,
    whatsappNumber: client.whatsappNumber ? formatWhatsappNumber(client.whatsappNumber) : "",
    socialLinks:
      client.socialLinks.length > 0
        ? client.socialLinks.map((link) => ({
            platform: link.platform,
            value: link.value.startsWith("https://") ? link.value : `@${link.value}`,
          }))
        : DEFAULT_VALUES.socialLinks.map((link) => ({ ...link })),
  };
}

function setServerErrors(
  form: ReturnType<typeof useForm<ClientInput, unknown, ClientFields>>,
  errors: Readonly<Record<string, string | undefined>>,
): void {
  if (errors.name) form.setError("name", { type: "server", message: errors.name });
  if (errors.whatsappNumber)
    form.setError("whatsappNumber", { type: "server", message: errors.whatsappNumber });
}

function ClientSaveButton({
  isPending,
  mobile,
  isEditing,
}: Readonly<{ isPending: boolean; mobile: boolean; isEditing: boolean }>) {
  return (
    <Button type="submit" form={FORM_ID} isPending={isPending} size={mobile ? "lg" : "md"}>
      {saveLabel(isPending, isEditing)}
    </Button>
  );
}

function saveLabel(isPending: boolean, isEditing: boolean): string {
  if (isPending) return CLIENT_COPY.saving;
  return isEditing ? CLIENT_COPY.saveEdit : CLIENT_COPY.save;
}

function ClientForm({
  controller,
  isMobile,
  numberHolder,
}: Readonly<{
  readonly controller: ReturnType<typeof useClientDialogForm>;
  readonly isMobile: boolean;
  readonly numberHolder: NumberHolder | undefined;
}>) {
  const { form, isPending, handleSubmit } = controller;
  const name = useController({ control: form.control, name: "name" });
  const whatsappNumber = useController({ control: form.control, name: "whatsappNumber" });
  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <TextField
        label={CLIENT_COPY.name}
        name={name.field.name}
        value={name.field.value}
        onChange={name.field.onChange}
        onBlur={name.field.onBlur}
        inputRef={name.field.ref}
        placeholder={CLIENT_COPY.namePlaceholder}
        isDisabled={isPending}
        errorMessage={
          name.fieldState.error?.message
            ? clientFieldErrorText(name.fieldState.error.message)
            : undefined
        }
      />
      <TextField
        label={CLIENT_COPY.whatsappNumber}
        isOptional
        name={whatsappNumber.field.name}
        value={whatsappNumber.field.value}
        onChange={whatsappNumber.field.onChange}
        onBlur={whatsappNumber.field.onBlur}
        inputRef={whatsappNumber.field.ref}
        description={CLIENT_COPY.whatsappDescription}
        isDisabled={isPending}
        errorMessage={
          whatsappNumber.fieldState.error?.message
            ? whatsappErrorText(whatsappNumber.fieldState.error.message, numberHolder)
            : undefined
        }
      />
      <ClientSocialLinks form={form} isPending={isPending} isMobile={isMobile} />
    </form>
  );
}

function ClientSocialLinks({
  form,
  isPending,
  isMobile,
}: Readonly<{
  form: ReturnType<typeof useForm<ClientInput, unknown, ClientFields>>;
  isPending: boolean;
  isMobile: boolean;
}>) {
  return (
    <SocialLinksEditor
      control={form.control}
      isPending={isPending}
      isMobile={isMobile}
      setFocus={form.setFocus}
    />
  );
}

function whatsappErrorText(error: string, holder?: NumberHolder): string {
  if (error === "INVALID") return CLIENT_COPY.invalidWhatsapp;
  return clientFieldErrorText(error, holder);
}
