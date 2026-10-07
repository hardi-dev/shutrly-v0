"use client";

import { cn } from "@/ui/cn/cn";
import { PhotoTile } from "@/ui/patterns/photo-tile/photo-tile";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CLIENT_GRID } from "../client-browse-grid/client-browse-grid";
import { DELIVERY_SCREEN_COPY as COPY } from "./delivery-screen.copy";
import type { DeliveryFileTileProps, DeliveryPartProps } from "./delivery-screen.types";
import { groupMeta } from "./delivery-screen-text";

const CORNER = "absolute top-(--component-photo-tile-badge-inset)";

function FileTile({ file, index, screen }: Readonly<DeliveryFileTileProps>) {
  const hasFailed = screen.download.progress.failedIds.includes(file.id);
  const open = () => {
    screen.setViewerIndex(index);
  };
  const change = (isSelected: boolean) => {
    screen.toggle(file.id, isSelected);
  };
  return (
    <li className="relative min-w-0">
      <PhotoTile
        fileName={file.fileName}
        meta={hasFailed ? COPY.failedMeta : undefined}
        imageSrc={file.thumb.src}
        fallbackSrc={file.thumb.fallbackSrc}
        onPress={open}
        selection={
          screen.isSelecting
            ? { isSelected: screen.selectedIds.has(file.id), onChange: change }
            : undefined
        }
      />
      {hasFailed ? (
        <span className={cn(CORNER, "left-(--component-photo-tile-badge-inset)")}>
          <StatusChip tone="warning" label={COPY.failedBadge} hasDot />
        </span>
      ) : null}
      {screen.isSelecting ? null : (
        <span className={cn(CORNER, "right-(--component-photo-tile-badge-inset)")}>
          <IconButton
            icon="download"
            size="sm"
            href={file.downloadUrl}
            className="size-(--space-8) rounded-(--radius-full) border-2 border-(--color-semantic-border-control) bg-(--color-semantic-surface-panel)"
            aria-label={COPY.tileDownload(file.fileName)}
          />
        </span>
      )}
    </li>
  );
}

/** *Foto hasil akhir*: one tab per package item (F-20; was *Edited / Print*) and the grid with a download on each tile, or ticks in *Pilih beberapa* (hasilakhir-siap / -print / -pilih-beberapa, AC-DEL-003, -004). @param props - the screen state @returns the card */
export function DeliveryFilesCard({ screen }: Readonly<DeliveryPartProps>) {
  const options = screen.files.groups.map((group) => ({
    id: group.id,
    label: COPY.groupTab(group.name, group.files.length),
  }));
  return (
    <SectionCard
      title={COPY.cardTitle}
      description={groupMeta(screen.groupName, screen.shown.length)}
      actions={
        options.length > 1 ? (
          <SegmentedControl
            label={COPY.kindLabel}
            options={options}
            selectedId={screen.groupId}
            onChange={screen.setGroupId}
          />
        ) : undefined
      }
    >
      {screen.shown.length === 0 ? (
        <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {COPY.emptyKind}
        </p>
      ) : (
        <ul className={CLIENT_GRID}>
          {screen.shown.map((file, index) => (
            <FileTile key={file.id} file={file} index={index} screen={screen} />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
