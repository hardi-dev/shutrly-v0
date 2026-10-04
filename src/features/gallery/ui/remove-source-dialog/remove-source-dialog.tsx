"use client";

import { GalleryConfirmDialog } from "../gallery-confirm-dialog/gallery-confirm-dialog";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { useLifecycleRunner } from "../use-lifecycle-runner/use-lifecycle-runner";
import type { RemoveSourceDialogProps } from "./remove-source-dialog.types";

/** *Lepas {folder}?*: the folder's photos are hidden from the client, nothing is deleted (BR-GAL-009, A-6, AC-GAL-013). */
export function RemoveSourceDialog({
  workspaceId,
  source,
  removeSourceAction,
  onClose,
}: Readonly<RemoveSourceDialogProps>) {
  const runner = useLifecycleRunner();
  const name = source.name ?? GALLERY_COPY.sourceFallbackName;
  const photos = source.proofCount + source.editedCount + source.printCount;
  const handleConfirm = async () => {
    const result = await runner.run(() => removeSourceAction(workspaceId, source.id), {
      title: GALLERY_COPY.removedTitle,
    });
    if (result?.ok) onClose();
  };
  const handlePress = () => {
    void handleConfirm();
  };
  return (
    <GalleryConfirmDialog
      title={GALLERY_COPY.removeDialogTitle(name)}
      description={GALLERY_COPY.removeDialogBody(photos)}
      confirmLabel={GALLERY_COPY.removeSource}
      isDestructive
      isPending={runner.isPending}
      onConfirm={handlePress}
      onClose={onClose}
    />
  );
}
