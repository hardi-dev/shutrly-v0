"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useController, useForm } from "react-hook-form";

import { createGalleryFormSchema } from "@/features/gallery/application/schemas/create-gallery/create-gallery.schema";
import type {
  CreateGalleryFormInput,
  CreateGalleryFormValues,
  CreateGalleryInput,
} from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";
import type { CreateGalleryResult } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { PendingCreate, UseCreateGalleryFormInput } from "./use-create-gallery-form.types";

type CreateForm = UseFormReturn<CreateGalleryFormInput, unknown, CreateGalleryFormValues>;
type FieldPath =
  | "password"
  | "expiry.date"
  | "expiry.days"
  | "folder.link"
  | "folder.workspaceSourceId"
  | "folder.label";
const FIELD_PATHS: readonly FieldPath[] = [
  "password",
  "expiry.date",
  "expiry.days",
  "folder.link",
  "folder.workspaceSourceId",
  "folder.label",
];

function isFieldPath(path: string): path is FieldPath {
  return FIELD_PATHS.some((candidate) => candidate === path);
}

function setFieldErrors(form: CreateForm, errors: Readonly<Record<string, string>>, prefix = "") {
  for (const [path, key] of Object.entries(errors)) {
    const full = `${prefix}${path}`;
    if (isFieldPath(full)) form.setError(full, { type: "server", message: key });
  }
}

/** The payload: an empty folder link sends no folder (Revision OT #3). @param values - the parsed form @returns the create input */
function toCreateInput(values: CreateGalleryFormValues): CreateGalleryInput {
  const { folder, ...rest } = values;
  return folder.link === "" ? rest : { ...rest, folder };
}

function applyCreateResult(
  result: CreateGalleryResult,
  form: CreateForm,
  onCreated: UseCreateGalleryFormInput["onCreated"],
): void {
  if (result.ok) {
    showToast({
      tone: "success",
      title: GALLERY_COPY.createdTitle,
      body: GALLERY_COPY.createdBody,
    });
    onCreated(result.galleryId, result.sourceId);
  } else if (result.code === "VALIDATION_FAILED") setFieldErrors(form, result.fieldErrors);
  else showToast({ tone: "danger", title: GALLERY_COPY.refused[result.code] });
}

function showSaveFailed(): void {
  showToast({
    tone: "danger",
    title: GALLERY_COPY.saveFailedTitle,
    body: GALLERY_COPY.saveFailedBody,
  });
}

/** Sends the create and applies its result. @param input - ids and actions @param form - the form @param payload - what to create */
async function sendCreate(
  input: Readonly<UseCreateGalleryFormInput>,
  form: CreateForm,
  payload: CreateGalleryInput,
): Promise<void> {
  try {
    const result = await input.createAction(input.workspaceId, input.projectId, payload);
    applyCreateResult(result, form, input.onCreated);
  } catch {
    showSaveFailed();
  }
}

/** Checks a folder against other projects first (AC-GAL-010); returns the titles, or null when the link is refused. */
async function folderUse(
  input: Readonly<UseCreateGalleryFormInput>,
  form: CreateForm,
  link: string,
): Promise<readonly string[] | null> {
  const use = await input.checkFolderAction(input.workspaceId, link);
  if (use.ok) return use.projectTitles;
  setFieldErrors(form, use.fieldErrors, "folder.");
  return null;
}

/** Owns the *Buat galeri* form: the proposed password, *Buat ulang*, the expiry, the optional first folder with the in-use warning, and submit (AC-GAL-001, 002, 010). @param input - ids, the first proposal, the active sources and the actions @returns the form and handlers */
export function useCreateGalleryForm(input: Readonly<UseCreateGalleryFormInput>) {
  const form = useForm<CreateGalleryFormInput, unknown, CreateGalleryFormValues>({
    resolver: zodResolver(createGalleryFormSchema),
    defaultValues: {
      password: input.initialPassword,
      expiry: { type: "NONE" },
      folder: { workspaceSourceId: input.linkableSources.at(0)?.id ?? "", link: "", label: "" },
    },
  });
  const [isPending, setIsPending] = useState(false);
  const [inUse, setInUse] = useState<PendingCreate | null>(null);
  const create = async (payload: CreateGalleryInput) => {
    setInUse(null);
    setIsPending(true);
    await sendCreate(input, form, payload);
    setIsPending(false);
  };
  const submit = form.handleSubmit(async (values) => {
    const payload = toCreateInput(values);
    if (!payload.folder) return create(payload);
    setIsPending(true);
    const titles = await folderUse(input, form, payload.folder.link).catch(() => {
      showSaveFailed();
      return null;
    });
    setIsPending(false);
    if (titles === null) return;
    if (titles.length > 0) setInUse({ projects: titles.join(", "), payload });
    else await create(payload);
  });
  const confirmInUse = () => {
    if (inUse) void create(inUse.payload);
  };
  const cancelInUse = () => {
    setInUse(null);
  };
  return {
    submit,
    isPending,
    ...useRegenerate(input, form),
    inUse,
    confirmInUse,
    cancelInUse,
    ...useCreateFields(form),
  };
}

/** *Buat ulang*: a new server-side proposal (D-5). */
function useRegenerate(input: Readonly<UseCreateGalleryFormInput>, form: CreateForm) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const regenerate = async () => {
    setIsRegenerating(true);
    try {
      const proposal = await input.proposeAction(input.workspaceId, input.projectId);
      form.setValue("password", proposal, { shouldValidate: true });
    } finally {
      setIsRegenerating(false);
    }
  };
  return { regenerate, isRegenerating };
}

function useCreateFields(form: CreateForm) {
  const password = useController({ control: form.control, name: "password" });
  const expiry = useController({ control: form.control, name: "expiry" });
  const folder = {
    source: useController({ control: form.control, name: "folder.workspaceSourceId" }),
    link: useController({ control: form.control, name: "folder.link" }),
    label: useController({ control: form.control, name: "folder.label" }),
  };
  const errors = {
    password: password.fieldState.error?.message,
    date: form.getFieldState("expiry.date", form.formState).error?.message,
    days: form.getFieldState("expiry.days", form.formState).error?.message,
  };
  return { password, expiry, folder, errors };
}
