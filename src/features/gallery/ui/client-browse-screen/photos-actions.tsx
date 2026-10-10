"use client";

import { useState } from "react";

import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { VIEWER_PICK_COPY } from "../viewer-pick-actions/viewer-pick-actions.copy";
import { CLIENT_BROWSE_COPY as COPY } from "./client-browse-screen.copy";
import type {
  DownloadMenuProps,
  GroupPickItemProps,
  PhoneDownloadMenuProps,
  PhotosGroupsProps,
} from "./photos-actions.types";

// The next action runs once the action sheet has finished its exit (as on *Hasil akhir*).
const SHEET_HANDOFF_DELAY_MS = 400;
const ICONS = { COUNT: "images", QUANTITY: "printer" } as const;

/** The page actions outside select mode (F-20, Owner 2026-10-08, option C): *Unduh ▾* and, while a group
 * can still be picked for, *Pilih foto* as the main action; both open the same select mode. @param props -
 * the proof downloads state and the groups @returns the actions */
export function PhotosHeaderActions({ photos, groups }: Readonly<PhotosGroupsProps>) {
  const isMobile = useMobileViewport();
  const canPick = groups.some((group) => group.status === "OPEN");
  return (
    <div className="flex flex-wrap gap-(--space-2) max-md:w-full">
      <PhotosDownloadMenu photos={photos} isSecondary={canPick} />
      {canPick ? (
        <Button
          iconLeading="list-checks"
          size={isMobile ? "lg" : "md"}
          className="max-md:w-full"
          onPress={photos.startSelecting}
        >
          {COPY.pickPhotos}
        </Button>
      ) : null}
    </div>
  );
}

/** *Unduh ▾*: *Unduh semua* and *Pilih beberapa* (F-20, as *Hasil akhir* A-33). */
function PhotosDownloadMenu({ photos, isSecondary }: Readonly<DownloadMenuProps>) {
  const isMobile = useMobileViewport();
  const isBusy = photos.download.progress.phase === "RUNNING" || photos.isListing;
  if (!isMobile) {
    return (
      <MenuTrigger label={COPY.download}>
        <Button
          variant={isSecondary ? "secondary" : "primary"}
          iconLeading="download"
          iconTrailing="chevron-down"
          isPending={photos.isListing}
          isDisabled={isBusy}
        >
          {COPY.download}
        </Button>
        <Menu aria-label={COPY.downloadMenu}>
          <MenuItem label={COPY.downloadAll} icon="download" onSelect={photos.askDownloadAll} />
          <MenuItem label={COPY.pickSeveral} icon="list-checks" onSelect={photos.startSelecting} />
        </Menu>
      </MenuTrigger>
    );
  }
  return <PhoneDownloadMenu photos={photos} isBusy={isBusy} isSecondary={isSecondary} />;
}

function PhoneDownloadMenu({ photos, isBusy, isSecondary }: Readonly<PhoneDownloadMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const later = (next: () => void) => () => {
    setIsOpen(false);
    window.setTimeout(next, SHEET_HANDOFF_DELAY_MS);
  };
  const open = () => {
    setIsOpen(true);
  };
  return (
    <>
      <Button
        variant={isSecondary ? "secondary" : "primary"}
        size="lg"
        className="w-full"
        iconLeading="download"
        iconTrailing="chevron-down"
        isDisabled={isBusy}
        onPress={open}
      >
        {COPY.download}
      </Button>
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={COPY.download} variant="actions">
        <SheetItem
          label={COPY.downloadAll}
          icon="download"
          onPress={later(photos.askDownloadAll)}
        />
        <SheetItem
          label={COPY.pickSeveral}
          icon="list-checks"
          onPress={later(photos.startSelecting)}
        />
      </BottomSheet>
    </>
  );
}

function groupDescription(group: PickGroupView): string {
  return VIEWER_PICK_COPY.usage(group.usage, group.limit, group.unit ?? "");
}

function GroupPickItem({ group, photos }: Readonly<GroupPickItemProps>) {
  const handleSelect = () => {
    photos.pickSelected(group.id, group.name);
  };
  return (
    <MenuItem
      label={group.name}
      description={groupDescription(group)}
      icon={ICONS[group.mode]}
      isDisabled={group.status !== "OPEN"}
      onSelect={handleSelect}
    />
  );
}

/** *Pilih untuk…* on the selection: one entry per group with its usage; closed groups disabled (F-20). */
function BulkPickMenu({ photos, groups }: Readonly<PhotosGroupsProps>) {
  const isDisabled = photos.selectedCount === 0 || photos.isPicking;
  return (
    <MenuTrigger label={COPY.pickFor}>
      <Button
        iconLeading="list-checks"
        className="max-md:flex-1"
        isDisabled={isDisabled}
        isPending={photos.isPicking}
      >
        {COPY.pickFor}
      </Button>
      <Menu aria-label={COPY.pickFor}>
        {groups.map((group) => (
          <GroupPickItem key={group.id} group={group} photos={photos} />
        ))}
      </Menu>
    </MenuTrigger>
  );
}

/** Select mode: *Batal*, *Unduh n foto* and, with groups, *Masukkan ke…* as the main action (F-20, Owner 2026-10-07, option C 2026-10-08). */
export function SelectingActions({ photos, groups }: Readonly<PhotosGroupsProps>) {
  const count = photos.selectedCount;
  return (
    <div className="flex flex-wrap gap-(--space-2) max-md:w-full">
      <Button variant="secondary" className="max-md:flex-1" onPress={photos.stopSelecting}>
        {COPY.cancel}
      </Button>
      <Button
        iconLeading="download"
        variant={groups.length > 0 ? "secondary" : "primary"}
        className="max-md:flex-1"
        isDisabled={count === 0}
        onPress={photos.downloadSelected}
      >
        {COPY.downloadSelected(count)}
      </Button>
      {groups.length > 0 ? <BulkPickMenu photos={photos} groups={groups} /> : null}
    </div>
  );
}
