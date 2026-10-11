"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useController, useForm } from "react-hook-form";

import { linkGallerySourceSchema } from "@/features/gallery/application/schemas/link-gallery-source/link-gallery-source.schema";
import type {
  LinkGallerySourceInput,
  LinkGallerySourceValues,
} from "@/features/gallery/application/schemas/link-gallery-source/link-gallery-source.types";
import type { LinkGallerySourceResult } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_REFUSED_MESSAGE_KEY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import { USE_LINK_SOURCE_FORM_COPY_NAMESPACE } from "./use-link-source-form.copy";
import type { PendingInUse, UseLinkSourceFormInput } from "./use-link-source-form.types";

type LinkForm = UseFormReturn<LinkGallerySourceInput, unknown, LinkGallerySourceValues>;
type LinkField = "workspaceSourceId" | "link" | "label";
const FIELDS: readonly LinkField[] = ["workspaceSourceId", "link", "label"];

function setFieldErrors(form: LinkForm, fieldErrors: Readonly<Record<string, string>>): void {
  for (const [path, key] of Object.entries(fieldErrors)) {
    const field = FIELDS.find((candidate) => candidate === path);
    if (field) form.setError(field, { type: "server", message: key });
  }
}

function applyLinkResult(
  t: GalleryTranslate,
  form: LinkForm,
  result: LinkGallerySourceResult,
  onLinked: (sourceId: string) => void,
): void {
  if (result.ok) {
    showToast({ tone: "success", title: t("linkedTitle") });
    onLinked(result.sourceId);
  } else if (result.code === "VALIDATION_FAILED") setFieldErrors(form, result.fieldErrors);
  else showToast({ tone: "danger", title: t(GALLERY_REFUSED_MESSAGE_KEY[result.code]) });
}

function useLinkFields(form: LinkForm) {
  return {
    source: useController({ control: form.control, name: "workspaceSourceId" }),
    link: useController({ control: form.control, name: "link" }),
    label: useController({ control: form.control, name: "label" }),
  };
}

async function sendLink(
  t: GalleryTranslate,
  form: LinkForm,
  input: Readonly<UseLinkSourceFormInput>,
  values: LinkGallerySourceValues,
): Promise<void> {
  try {
    const result = await input.linkSourceAction(input.workspaceId, input.galleryId, values);
    applyLinkResult(t, form, result, input.onLinked);
  } catch {
    showToast({
      tone: "danger",
      title: t("saveFailedTitle"),
      body: t("saveFailedBody"),
    });
  }
}

/** Owns *Tambah folder*: validate, warn when another project uses the folder, then link and sync it (AC-GAL-005, 009, 010, 011). @param input - ids, active sources and the actions @returns the form, the in-use warning and handlers */
export function useLinkSourceForm(input: Readonly<UseLinkSourceFormInput>) {
  const t = useTranslations(USE_LINK_SOURCE_FORM_COPY_NAMESPACE);
  const form = useForm<LinkGallerySourceInput, unknown, LinkGallerySourceValues>({
    resolver: zodResolver(linkGallerySourceSchema),
    defaultValues: {
      workspaceSourceId: input.linkableSources.at(0)?.id ?? "",
      link: "",
      label: "",
    },
  });
  const [isPending, setIsPending] = useState(false);
  const [inUse, setInUse] = useState<PendingInUse | null>(null);
  const link = async (values: LinkGallerySourceValues) => {
    setInUse(null);
    setIsPending(true);
    await sendLink(t, form, input, values);
    setIsPending(false);
  };
  const submit = form.handleSubmit(async (values) => {
    setIsPending(true);
    const use = await input
      .checkFolderAction(input.workspaceId, input.galleryId, values.link)
      .finally(() => {
        setIsPending(false);
      });
    if (!use.ok) setFieldErrors(form, use.fieldErrors);
    else if (use.projectTitles.length > 0)
      setInUse({ projects: use.projectTitles.join(", "), values });
    else await link(values);
  });
  const confirmInUse = () => {
    if (inUse) void link(inUse.values);
  };
  const cancelInUse = () => {
    setInUse(null);
  };
  return { fields: useLinkFields(form), submit, isPending, inUse, confirmInUse, cancelInUse };
}
