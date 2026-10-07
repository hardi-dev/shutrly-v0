"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";

import { renameGallerySourceSchema } from "@/features/gallery/application/schemas/rename-gallery-source/rename-gallery-source.schema";
import type {
  RenameGallerySourceInput,
  RenameGallerySourceValues,
} from "@/features/gallery/application/schemas/rename-gallery-source/rename-gallery-source.types";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { FolderMappingState } from "../use-folder-mapping/use-folder-mapping.types";
import { useLifecycleRunner } from "../use-lifecycle-runner/use-lifecycle-runner";
import type { UseRenameFolderFormInput } from "./use-rename-folder-form.types";

/** Owns *Edit folder*: the label, empty for the Drive folder name (AC-GAL-037), and the save of the subfolder mapping (F-20). @param input - ids, the folder, the actions and the close handler @param mapping - the subfolder mapping state @returns the label field, its error, submit and the pending flag */
export function useRenameFolderForm(
  input: Readonly<UseRenameFolderFormInput>,
  mapping: FolderMappingState,
) {
  const runner = useLifecycleRunner();
  const form = useForm<RenameGallerySourceInput, unknown, RenameGallerySourceValues>({
    resolver: zodResolver(renameGallerySourceSchema),
    defaultValues: { label: input.source.label ?? "" },
  });
  const label = useController({ control: form.control, name: "label" });
  const submit = form.handleSubmit(async (values) => {
    // F-20: one *Simpan* saves the name, then the subfolder mapping when it changed.
    const result = await runner.run(
      async () => {
        const renamed = await input.renameSourceAction(input.workspaceId, input.source.id, values);
        if (!renamed.ok || !mapping.isDirty) return renamed;
        return input.setFolderMappingAction(input.workspaceId, input.source.id, {
          mappings: mapping.entries(),
        });
      },
      { title: GALLERY_COPY.renamedTitle },
    );
    if (result?.ok) input.onClose();
    else if (result && "fieldErrors" in result)
      form.setError("label", { type: "server", message: result.fieldErrors.label });
  });
  return {
    field: label.field,
    error: label.fieldState.error?.message,
    submit,
    isPending: runner.isPending,
  };
}
