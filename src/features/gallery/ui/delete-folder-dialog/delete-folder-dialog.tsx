"use client";

import { useTranslations } from "next-intl";

import { GalleryConfirmDialog } from "../gallery-confirm-dialog/gallery-confirm-dialog";
import { useLifecycleRunner } from "../use-lifecycle-runner/use-lifecycle-runner";
import { DELETE_FOLDER_DIALOG_COPY_NAMESPACE } from "./delete-folder-dialog.copy";
import type { DeleteFolderDialogProps } from "./delete-folder-dialog.types";

/** *Hapus {folder}?*: the folder and its photos are deleted; a client pick or the last active folder of a live gallery refuses it (BR-GAL-009, AC-GAL-013). */
export function DeleteFolderDialog({
  workspaceId,
  source,
  isLast,
  deleteSourceAction,
  onClose,
}: Readonly<DeleteFolderDialogProps>) {
  const t = useTranslations(DELETE_FOLDER_DIALOG_COPY_NAMESPACE);
  const runner = useLifecycleRunner();
  const name = source.name ?? t("sourceFallbackName");
  const photos = source.proofCount + source.editedCount + source.printCount;
  const handleConfirm = async () => {
    const result = await runner.run(() => deleteSourceAction(workspaceId, source.id), {
      title: t("folderDeletedTitle"),
    });
    if (result?.ok) onClose();
  };
  const handlePress = () => {
    void handleConfirm();
  };
  return (
    <GalleryConfirmDialog
      title={t("deleteFolderTitle", { name: name })}
      description={
        isLast
          ? t("deleteLastFolderBody", { count: photos })
          : t("deleteFolderBody", { count: photos })
      }
      confirmLabel={t("deleteFolder")}
      isDestructive
      isPending={runner.isPending}
      onConfirm={handlePress}
      onClose={onClose}
    />
  );
}
