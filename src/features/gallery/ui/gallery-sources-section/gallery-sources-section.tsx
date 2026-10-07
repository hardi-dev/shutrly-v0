"use client";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { canEditSources } from "@/features/gallery/domain/gallery-status/gallery-status";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { DeleteFolderDialog } from "../delete-folder-dialog/delete-folder-dialog";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryMenuEntry } from "../gallery-row-menu/gallery-row-menu.types";
import { GallerySourceRow } from "../gallery-source-row/gallery-source-row";
import { LinkSourceDialog } from "../link-source-dialog/link-source-dialog";
import { RenameFolderDialog } from "../rename-folder-dialog/rename-folder-dialog";
import { SourcesCard } from "../sources-card/sources-card";
import { useGallerySync } from "../use-gallery-sync/use-gallery-sync";
import { useSourceDialogs } from "../use-source-dialogs/use-source-dialogs";
import type {
  AddFolderButtonProps,
  GallerySourcesSectionProps,
  SourceDialogsProps,
  SourceListProps,
  SourcesHeaderActionsProps,
} from "./gallery-sources-section.types";

/** *Sumber foto* with its rows, *Sinkronkan* / *Sinkronkan semua* and *Tambah folder* (AC-GAL-005…012). */
export function GallerySourcesSection({
  workspaceId,
  page,
  actions,
}: Readonly<GallerySourcesSectionProps>) {
  const dialogs = useSourceDialogs();
  const sync = useGallerySync({ workspaceId, syncSourceAction: actions.syncSourceAction });
  const handleLinked = (sourceId: string) => {
    dialogs.handleLinked();
    sync.syncNew(sourceId);
  };
  const isEditable = canEditSources(page.gallery.status, page.project.status);
  const isLive = page.gallery.status === "PUBLISHED" || page.gallery.status === "EXPIRED";
  const isLastLocked = isLive && page.gallery.activeSourceCount <= 1;
  return (
    <>
      <SourcesCard
        sources={page.sources}
        actions={
          isEditable ? (
            <SourcesHeaderActions sync={sync} page={page} onAdd={dialogs.openLinking} />
          ) : undefined
        }
        emptyAction={isEditable ? <AddFolderButton onAdd={dialogs.openLinking} /> : undefined}
      >
        <SourceList
          sources={page.sources}
          sync={sync}
          isEditable={isEditable}
          isArchived={page.gallery.status === "ARCHIVED"}
          isLastLocked={isLastLocked}
          onDelete={dialogs.setDeleting}
          onRename={dialogs.setRenaming}
        />
      </SourcesCard>
      <SourceDialogs
        workspaceId={workspaceId}
        page={page}
        actions={actions}
        isLinking={dialogs.isLinking}
        deleting={dialogs.deleting}
        renaming={dialogs.renaming}
        onLinkingChange={dialogs.setIsLinking}
        onLinked={handleLinked}
        onCloseDelete={dialogs.closeDeleting}
        onCloseRename={dialogs.closeRenaming}
      />
    </>
  );
}

function SourceDialogs(props: Readonly<SourceDialogsProps>) {
  const { workspaceId, page, actions } = props;
  return (
    <>
      {props.deleting ? (
        <DeleteFolderDialog
          workspaceId={workspaceId}
          source={props.deleting}
          deleteSourceAction={actions.deleteSourceAction}
          onClose={props.onCloseDelete}
        />
      ) : null}
      {props.renaming ? (
        <RenameFolderDialog
          workspaceId={workspaceId}
          source={props.renaming}
          renameSourceAction={actions.renameSourceAction}
          onClose={props.onCloseRename}
        />
      ) : null}
      {props.isLinking ? (
        <LinkSourceDialog
          isOpen
          onOpenChange={props.onLinkingChange}
          workspaceId={workspaceId}
          galleryId={page.gallery.id}
          linkableSources={page.linkableSources}
          checkFolderAction={actions.checkFolderAction}
          linkSourceAction={actions.linkSourceAction}
          onLinked={props.onLinked}
        />
      ) : null}
    </>
  );
}

/** The ⋯ entries of one folder row: *Sinkronkan*, *Ganti nama* and *Hapus* (AC-GAL-007, AC-GAL-013, AC-GAL-037). @param source - the row @param list - the list's state and handlers @returns the entries, none when read-only */
function folderMenuEntries(
  source: GallerySourceView,
  { sync, isEditable, isLastLocked, onDelete, onRename }: Readonly<SourceListProps>,
): GalleryMenuEntry[] {
  if (!isEditable || source.removed) return [];
  const handleSync = () => {
    sync.syncOne(source);
  };
  const handleRename = () => {
    onRename(source);
  };
  const handleDelete = () => {
    onDelete(source);
  };
  return [
    {
      label: GALLERY_COPY.sync,
      icon: "refresh-cw",
      isDisabled: sync.isRunning,
      onSelect: handleSync,
    },
    { label: GALLERY_COPY.renameFolder, icon: "pencil", onSelect: handleRename },
    {
      label: GALLERY_COPY.deleteFolder,
      icon: "trash-2",
      isDestructive: true,
      isDisabled: isLastLocked,
      description: GALLERY_COPY.deleteLastHint,
      onSelect: handleDelete,
    },
  ];
}

function SourceList(props: Readonly<SourceListProps>) {
  const { sources, sync, isEditable, isArchived } = props;
  return (
    <ul aria-label={GALLERY_COPY.sourcesTitle} className="px-(--space-1) md:px-(--space-3)">
      {sources.map((source, index) => (
        <GallerySourceRow
          key={source.id}
          source={source}
          phase={sync.phaseOf(source.id)}
          progress={sync.progressOf(source.id)}
          isArchived={isArchived}
          isReadOnly={!isEditable}
          menuEntries={folderMenuEntries(source, props)}
          isLast={index === sources.length - 1}
        />
      ))}
    </ul>
  );
}

function AddFolderButton({ onAdd }: Readonly<AddFolderButtonProps>) {
  const isMobile = useMobileViewport();
  return (
    <Button variant="secondary" iconLeading="plus" onPress={onAdd}>
      {isMobile ? GALLERY_COPY.addFolderMobile : GALLERY_COPY.addFolder}
    </Button>
  );
}

function SourcesHeaderActions({ sync, page, onAdd }: Readonly<SourcesHeaderActionsProps>) {
  const isMobile = useMobileViewport();
  const active = page.sources.filter((source) => !source.removed);
  const handleSyncAll = () => {
    sync.syncAll(active);
  };
  const syncAll = isMobile ? (
    <IconButton
      icon="refresh-cw"
      aria-label={GALLERY_COPY.syncAll}
      isDisabled={sync.isRunning}
      onPress={handleSyncAll}
    />
  ) : (
    <Button
      variant="secondary"
      iconLeading="refresh-cw"
      isPending={sync.isRunning}
      isDisabled={active.length === 0}
      onPress={handleSyncAll}
    >
      {sync.isRunning ? GALLERY_COPY.syncAllRunning : GALLERY_COPY.syncAll}
    </Button>
  );
  return (
    <>
      {syncAll}
      <AddFolderButton onAdd={onAdd} />
    </>
  );
}
