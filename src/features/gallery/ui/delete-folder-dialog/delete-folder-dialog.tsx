"use client";

import { GalleryConfirmDialog } from "../gallery-confirm-dialog/gallery-confirm-dialog";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { useLifecycleRunner } from "../use-lifecycle-runner/use-lifecycle-runner";
import type { DeleteFolderDialogProps } from "./delete-folder-dialog.types";

/** *Hapus {folder}?*: the folder and its photos are deleted; a client pick or the last active folder of a live gallery refuses it (BR-GAL-009, AC-GAL-013). */
export function DeleteFolderDialog({
  workspaceId,
  source,
  deleteSourceAction,
  onClose,
}: Readonly<DeleteFolderDialogProps>) {
  const runner = useLifecycleRunner();
  const name = source.name ?? GALLERY_COPY.sourceFallbackName;
  const photos = source.proofCount + source.editedCount + source.printCount;
  const handleConfirm = async () => {
    const result = await runner.run(() => deleteSourceAction(workspaceId, source.id), {
      title: GALLERY_COPY.folderDeletedTitle,
    });
    if (result?.ok) onClose();
  };
  const handlePress = () => {
    void handleConfirm();
  };
  return (
    <GalleryConfirmDialog
      title={GALLERY_COPY.deleteFolderTitle(name)}
      description={GALLERY_COPY.deleteFolderBody(photos)}
      confirmLabel={GALLERY_COPY.deleteFolder}
      isDestructive
      isPending={runner.isPending}
      onConfirm={handlePress}
      onClose={onClose}
    />
  );
}
