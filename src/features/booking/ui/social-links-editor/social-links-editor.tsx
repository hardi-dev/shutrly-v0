"use client";

import { useController, useFieldArray } from "react-hook-form";

import {
  SOCIAL_LINK_MAX_COUNT,
  SOCIAL_PLATFORMS,
} from "@/features/booking/domain/social-link/social-link";
import { cn } from "@/ui/cn/cn";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CLIENT_COPY, PLATFORM_COPY } from "../client-copy/client-copy.copy";
import { clientFieldErrorText } from "../client-field-error/client-field-error";
import type { SocialLinkRowProps, SocialLinksEditorProps } from "./social-links-editor.types";

const PLATFORM_OPTIONS = SOCIAL_PLATFORMS.map((platform) => ({
  id: platform,
  label: PLATFORM_COPY[platform],
}));
const DEFAULT_PLATFORM = SOCIAL_PLATFORMS[0];
const EMPTY_SOCIAL_LINK_VALUE = "";

/** Edits the bounded, ordered social-link rows inside the client form. */
export function SocialLinksEditor({
  control,
  isPending,
  isMobile,
  setFocus,
}: Readonly<SocialLinksEditorProps>) {
  const { fields, append, remove } = useFieldArray({ control, name: "socialLinks" });
  function addRow(): void {
    append({ platform: DEFAULT_PLATFORM, value: EMPTY_SOCIAL_LINK_VALUE });
  }
  function focusAfterRemove(index: number, rowCount: number): void {
    const nextIndex = index < rowCount - 1 ? index : index - 1;
    queueMicrotask(() => {
      if (nextIndex >= 0) {
        setFocus(socialValuePath(nextIndex));
        return;
      }
      document.getElementById("add-social-link")?.focus();
    });
  }
  return (
    <fieldset className="flex flex-col gap-(--space-3)">
      <legend className="text-(length:--font-size-label) font-semibold text-(--color-semantic-text-primary)">
        {CLIENT_COPY.socialLinksLabel}
      </legend>
      {fields.map((field, index) => (
        <SocialLinkRow
          key={field.id}
          index={index}
          control={control}
          isPending={isPending}
          isMobile={isMobile}
          onRemove={remove}
          onFocusAfterRemove={focusAfterRemove}
          rowCount={fields.length}
        />
      ))}
      <Button
        variant="secondary"
        iconLeading="plus"
        id="add-social-link"
        onPress={addRow}
        isDisabled={isPending || fields.length >= SOCIAL_LINK_MAX_COUNT}
      >
        {CLIENT_COPY.addSocialLink}
      </Button>
    </fieldset>
  );
}

function SocialLinkRow(props: Readonly<SocialLinkRowProps>) {
  const { index, control, isPending, isMobile, onRemove, onFocusAfterRemove, rowCount } = props;
  const fields = useSocialLinkFields(control, index);
  function removeRow(): void {
    onRemove(index);
    onFocusAfterRemove(index, rowCount);
  }
  const valueField = (
    <SocialValueField fields={fields} index={index} isPending={isPending} isMobile={isMobile} />
  );
  const removeButton = (
    <IconButton
      icon="x"
      aria-label={CLIENT_COPY.removeSocialLinkField(
        PLATFORM_COPY[fields.platform.value],
        index + 1,
      )}
      onPress={removeRow}
      isDisabled={isPending}
    />
  );
  // Phone: platform and remove share the first line and the value spans the next (design).
  return (
    <div
      className={cn(
        "grid gap-(--space-2)",
        isMobile ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-[148px_minmax(0,1fr)_auto]",
      )}
    >
      <Select
        aria-label={CLIENT_COPY.socialPlatformField(index + 1)}
        value={fields.platform.value}
        options={PLATFORM_OPTIONS}
        onChange={fields.platform.onChange}
        isDisabled={isPending}
        errorMessage={fields.platform.error}
      />
      {isMobile ? removeButton : valueField}
      {isMobile ? valueField : removeButton}
    </div>
  );
}

function useSocialLinkFields(control: SocialLinksEditorProps["control"], index: number) {
  const platform = useController({ control, name: socialPlatformPath(index) });
  const value = useController({ control, name: socialValuePath(index) });
  return {
    platform: {
      value: platform.field.value,
      onChange: platform.field.onChange,
      error: platform.fieldState.error?.message
        ? clientFieldErrorText(platform.fieldState.error.message)
        : undefined,
    },
    value: {
      name: value.field.name,
      value: value.field.value,
      onChange: value.field.onChange,
      onBlur: value.field.onBlur,
      ref: value.field.ref,
      error: value.fieldState.error?.message
        ? valueErrorText(value.fieldState.error.message)
        : undefined,
    },
  };
}

function socialPlatformPath(index: number): `socialLinks.${number}.platform` {
  const path = `socialLinks.${String(index)}.platform`;
  if (!isSocialPlatformPath(path)) throw new Error("Invalid social platform path");
  return path;
}

function socialValuePath(index: number): `socialLinks.${number}.value` {
  const path = `socialLinks.${String(index)}.value`;
  if (!isSocialValuePath(path)) throw new Error("Invalid social value path");
  return path;
}

function isSocialPlatformPath(path: string): path is `socialLinks.${number}.platform` {
  return /^socialLinks\.\d+\.platform$/.test(path);
}

function isSocialValuePath(path: string): path is `socialLinks.${number}.value` {
  return /^socialLinks\.\d+\.value$/.test(path);
}

function valueErrorText(error: string): string {
  return error === "EMPTY" ? CLIENT_COPY.emptySocialValue : clientFieldErrorText(error);
}

function SocialValueField({
  fields,
  index,
  isPending,
  isMobile,
}: Readonly<{
  fields: ReturnType<typeof useSocialLinkFields>;
  index: number;
  isPending: boolean;
  isMobile: boolean;
}>) {
  return (
    <div className={isMobile ? "col-span-2" : "col-span-1"}>
      <TextField
        aria-label={CLIENT_COPY.socialValueField(PLATFORM_COPY[fields.platform.value], index + 1)}
        name={fields.value.name}
        value={fields.value.value}
        onChange={fields.value.onChange}
        onBlur={fields.value.onBlur}
        inputRef={fields.value.ref}
        placeholder={
          isMobile
            ? CLIENT_COPY.socialValuePlaceholderMobile
            : CLIENT_COPY.socialValuePlaceholderDesktop
        }
        isDisabled={isPending}
        errorMessage={fields.value.error}
      />
    </div>
  );
}
