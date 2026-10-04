"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { canEditSources } from "@/features/gallery/domain/gallery-status/gallery-status";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryMenuEntry } from "../gallery-row-menu/gallery-row-menu.types";
import { GallerySourceRow } from "../gallery-source-row/gallery-source-row";
import { LinkSourceDialog } from "../link-source-dialog/link-source-dialog";
import { SourcesCard } from "../sources-card/sources-card";
import { useGallerySync } from "../use-gallery-sync/use-gallery-sync";
import type {
  AddFolderButtonProps,
  GallerySourcesSectionProps,
  SourceListProps,
  SourcesHeaderActionsProps,
} from "./gallery-sources-section.types";

/** *Sumber foto* with its rows, *Sinkronkan* / *Sinkronkan semua* and *Tambah folder* (AC-GAL-005…012). */
export function GallerySourcesSection({
  workspaceId,
  page,
  actions,
}: Readonly<GallerySourcesSectionProps>) {
  const router = useRouter();
  const [isLinking, setIsLinking] = useState(false);
  const sync = useGallerySync({ workspaceId, syncSourceAction: actions.syncSourceAction });
  const isEditable = canEditSources(page.gallery.status, page.project.status);
  const handleAdd = () => {
    setIsLinking(true);
  };
  const handleLinked = () => {
    setIsLinking(false);
    router.refresh();
  };
  return (
    <>
      <SourcesCard
        sources={page.sources}
        actions={
          isEditable ? (
            <SourcesHeaderActions sync={sync} page={page} onAdd={handleAdd} />
          ) : undefined
        }
        emptyAction={isEditable ? <AddFolderButton onAdd={handleAdd} /> : undefined}
      >
        <SourceList
          sources={page.sources}
          sync={sync}
          isEditable={isEditable}
          isArchived={page.gallery.status === "ARCHIVED"}
        />
      </SourcesCard>
      {isLinking ? (
        <LinkSourceDialog
          isOpen
          onOpenChange={setIsLinking}
          workspaceId={workspaceId}
          galleryId={page.gallery.id}
          linkableSources={page.linkableSources}
          checkFolderAction={actions.checkFolderAction}
          linkSourceAction={actions.linkSourceAction}
          onLinked={handleLinked}
        />
      ) : null}
    </>
  );
}

function SourceList({ sources, sync, isEditable, isArchived }: Readonly<SourceListProps>) {
  const entriesFor = (source: GallerySourceView): GalleryMenuEntry[] => {
    if (!isEditable || source.removed) return [];
    const handleSync = () => {
      sync.syncOne(source);
    };
    return [
      {
        label: GALLERY_COPY.sync,
        icon: "refresh-cw",
        isDisabled: sync.isRunning,
        onSelect: handleSync,
      },
    ];
  };
  return (
    <ul aria-label={GALLERY_COPY.sourcesTitle} className="px-(--space-1) md:px-(--space-3)">
      {sources.map((source, index) => (
        <GallerySourceRow
          key={source.id}
          source={source}
          phase={sync.phaseOf(source.id)}
          isArchived={isArchived}
          menuEntries={entriesFor(source)}
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
