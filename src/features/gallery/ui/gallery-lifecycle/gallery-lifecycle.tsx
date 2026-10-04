"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { PublishSourceFailure } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import type { GalleryAction } from "@/features/gallery/domain/gallery-status/gallery-header-actions";
import { galleryHeaderActions } from "@/features/gallery/domain/gallery-status/gallery-header-actions";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { CompactBarActions } from "@/ui/patterns/compact-bar/compact-bar-actions";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { ExpiryDialog } from "../expiry-dialog/expiry-dialog";
import { GalleryConfirmDialog } from "../gallery-confirm-dialog/gallery-confirm-dialog";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryRowMenu } from "../gallery-row-menu/gallery-row-menu";
import type { GalleryMenuEntry } from "../gallery-row-menu/gallery-row-menu.types";
import { galleryExpiryFact } from "../gallery-text/gallery-text";
import { PublishRefusedDialog } from "../publish-refused-dialog/publish-refused-dialog";
import { RotatePasswordDialog } from "../rotate-password-dialog/rotate-password-dialog";
import { useCreateGalleryLauncher } from "../use-create-gallery-launcher/use-create-gallery-launcher";
import { useLifecycleRunner } from "../use-lifecycle-runner/use-lifecycle-runner";
import type {
  GalleryDialogsProps,
  GalleryHeaderControlsProps,
  GalleryLifecycleProps,
  PrimaryButtonProps,
} from "./gallery-lifecycle.types";

const LABELS: Readonly<Record<GalleryAction, string>> = {
  PUBLISH: GALLERY_COPY.publish,
  CHANGE_EXPIRY: GALLERY_COPY.changeExpiry,
  ROTATE_PASSWORD: GALLERY_COPY.rotatePassword,
  ARCHIVE: GALLERY_COPY.archive,
  DELETE: GALLERY_COPY.deleteGallery,
};
const ICONS = {
  PUBLISH: "send",
  CHANGE_EXPIRY: "calendar-check",
  ROTATE_PASSWORD: "lock",
  ARCHIVE: "archive",
  DELETE: "trash-2",
} as const;

function menuEntries(
  menu: readonly GalleryAction[],
  onChoose: (action: GalleryAction) => void,
): GalleryMenuEntry[] {
  return menu.map((action) => ({
    label: LABELS[action],
    icon: ICONS[action],
    isDestructive: action === "DELETE",
    onSelect: () => {
      onChoose(action);
    },
  }));
}

function PrimaryButton({ primary, hasSources, onChoose }: Readonly<PrimaryButtonProps>) {
  const isMobile = useMobileViewport();
  const handlePress = () => {
    onChoose(primary);
  };
  return (
    <Button
      variant={primary === "PUBLISH" ? "primary" : "secondary"}
      size={isMobile ? "lg" : "md"}
      isDisabled={primary === "PUBLISH" && !hasSources}
      onPress={handlePress}
      className="max-md:w-full"
    >
      {LABELS[primary]}
    </Button>
  );
}

function HeaderControls({
  primary,
  menu,
  hasSources,
  onChoose,
}: Readonly<GalleryHeaderControlsProps>) {
  const isMobile = useMobileViewport();
  const entries = menuEntries(menu, onChoose);
  const button =
    primary === null ? null : (
      <PrimaryButton primary={primary} hasSources={hasSources} onChoose={onChoose} />
    );
  const menuButton =
    entries.length === 0 ? null : (
      <GalleryRowMenu
        label={GALLERY_COPY.galleryMenu}
        title={GALLERY_COPY.galleryMenuTitle}
        entries={entries}
        size="md"
      />
    );
  if (!isMobile) {
    return (
      <PageActions>
        {button}
        {menuButton}
      </PageActions>
    );
  }
  return (
    <>
      <CompactBarActions>{menuButton}</CompactBarActions>
      {button ? (
        <div className="sticky bottom-0 z-10 border-t border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-4) max-md:-mx-(--space-4) max-md:-mb-(--space-5)">
          {button}
        </div>
      ) : null}
    </>
  );
}

function PublishConfirm({
  workspaceId,
  page,
  actions,
  onClose,
  onRefused,
}: Readonly<GalleryDialogsProps>) {
  const runner = useLifecycleRunner();
  const expiry = galleryExpiryFact(page.gallery);
  const handleConfirm = async () => {
    const result = await runner.run(() => actions.publishAction(workspaceId, page.gallery.id), {
      title: GALLERY_COPY.publishedTitle,
      body: GALLERY_COPY.publishedBody,
    });
    if (result?.ok) onClose();
    else if (result && "failures" in result) onRefused(result.failures);
  };
  const handlePress = () => {
    void handleConfirm();
  };
  return (
    <GalleryConfirmDialog
      title={GALLERY_COPY.publishDialogTitle}
      description={GALLERY_COPY.publishDescription(
        GALLERY_COPY.publishDialogBody,
        GALLERY_COPY.publishExpiry(expiry.text.toLowerCase()),
      )}
      confirmLabel={GALLERY_COPY.publish}
      isPending={runner.isPending}
      onConfirm={handlePress}
      onClose={onClose}
    />
  );
}

function SimpleConfirm({
  workspaceId,
  page,
  actions,
  open,
  onClose,
}: Readonly<GalleryDialogsProps>) {
  const router = useRouter();
  const runner = useLifecycleRunner();
  const isDelete = open === "DELETE";
  const folders = page.sources.filter((source) => !source.removed).length;
  const handleConfirm = async () => {
    const work = isDelete
      ? () => actions.deleteDraftAction(workspaceId, page.gallery.id)
      : () => actions.archiveAction(workspaceId, page.gallery.id);
    const result = await runner.run(work, {
      title: isDelete ? GALLERY_COPY.deletedTitle : GALLERY_COPY.archivedTitle,
    });
    if (result?.ok) {
      onClose();
      if (isDelete) router.push(`/w/${workspaceId}/projects/${page.project.id}`);
    }
  };
  const handlePress = () => {
    void handleConfirm();
  };
  return (
    <GalleryConfirmDialog
      title={isDelete ? GALLERY_COPY.deleteDialogTitle : GALLERY_COPY.archiveDialogTitle}
      description={
        isDelete
          ? GALLERY_COPY.deleteDialogBody(
              folders,
              page.gallery.counts.proof + page.gallery.counts.edited + page.gallery.counts.print,
            )
          : GALLERY_COPY.archiveDialogBody
      }
      confirmLabel={isDelete ? GALLERY_COPY.deleteGallery : GALLERY_COPY.archive}
      isDestructive
      isPending={runner.isPending}
      onConfirm={handlePress}
      onClose={onClose}
    />
  );
}

function PasswordDialog({ workspaceId, page, actions, onClose }: Readonly<GalleryDialogsProps>) {
  const launcher = useCreateGalleryLauncher({
    workspaceId,
    projectId: page.project.id,
    proposeAction: actions.proposeAction,
  });
  const { handleOpen } = launcher;
  const started = useRef(false);
  // The proposal is a server action: it must start after mount, never while rendering.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    handleOpen();
  }, [handleOpen]);
  if (launcher.initialPassword === null) return null;
  return (
    <RotatePasswordDialog
      workspaceId={workspaceId}
      galleryId={page.gallery.id}
      projectId={page.project.id}
      initialPassword={launcher.initialPassword}
      proposeAction={actions.proposeAction}
      rotatePasswordAction={actions.rotatePasswordAction}
      onClose={onClose}
    />
  );
}

function GalleryDialogs(props: Readonly<GalleryDialogsProps>) {
  const { open, page, workspaceId, actions, onClose } = props;
  if (open === "PUBLISH") return <PublishConfirm {...props} />;
  if (open === "REFUSED")
    return <PublishRefusedDialog failures={props.failures} onClose={onClose} />;
  if (open === "ARCHIVE" || open === "DELETE") return <SimpleConfirm {...props} />;
  if (open === "ROTATE_PASSWORD") return <PasswordDialog {...props} />;
  if (open === "CHANGE_EXPIRY") {
    return (
      <ExpiryDialog
        workspaceId={workspaceId}
        galleryId={page.gallery.id}
        isDraft={page.gallery.status === "DRAFT"}
        setExpiryAction={actions.setExpiryAction}
        onClose={onClose}
      />
    );
  }
  return null;
}

/** The gallery page's lifecycle controls: header actions by state, the ⋯ menu and every dialog (BR-GAL-003…005, AC-GAL-016…023). */
export function GalleryLifecycle(props: Readonly<GalleryLifecycleProps>) {
  const [open, setOpen] = useState<GalleryDialogsProps["open"]>(null);
  const [failures, setFailures] = useState<readonly PublishSourceFailure[]>([]);
  const { page } = props;
  const header = galleryHeaderActions(page.gallery.status, page.project.status);
  const handleClose = () => {
    setOpen(null);
  };
  const handleRefused = (next: readonly PublishSourceFailure[]) => {
    setFailures(next);
    setOpen("REFUSED");
  };
  return (
    <>
      <HeaderControls
        primary={header.primary}
        menu={header.menu}
        hasSources={page.gallery.activeSourceCount > 0}
        onChoose={setOpen}
      />
      <GalleryDialogs
        {...props}
        open={open}
        failures={failures}
        onClose={handleClose}
        onRefused={handleRefused}
      />
    </>
  );
}
