"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import {
  BROWSE_SHARED_NAMESPACE,
  BROWSE_VIEWER_PICK_NAMESPACE,
  CLIENT_BROWSE_COPY_NAMESPACE,
} from "./client-browse-screen.copy";
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
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
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
          {t("pickPhotos")}
        </Button>
      ) : null}
    </div>
  );
}

/** *Unduh ▾*: *Unduh semua* and *Pilih beberapa* (F-20, as *Hasil akhir* A-33). */
function PhotosDownloadMenu({ photos, isSecondary }: Readonly<DownloadMenuProps>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const isBusy = photos.download.progress.phase === "RUNNING" || photos.isListing;
  if (!isMobile) {
    return (
      <MenuTrigger label={t("download")}>
        <Button
          variant={isSecondary ? "secondary" : "primary"}
          iconLeading="download"
          iconTrailing="chevron-down"
          isPending={photos.isListing}
          isDisabled={isBusy}
        >
          {t("download")}
        </Button>
        <Menu aria-label={t("downloadMenu")}>
          <MenuItem label={t("downloadAll")} icon="download" onSelect={photos.askDownloadAll} />
          <MenuItem label={t("pickSeveral")} icon="list-checks" onSelect={photos.startSelecting} />
        </Menu>
      </MenuTrigger>
    );
  }
  return <PhoneDownloadMenu photos={photos} isBusy={isBusy} isSecondary={isSecondary} />;
}

function PhoneDownloadMenu({ photos, isBusy, isSecondary }: Readonly<PhoneDownloadMenuProps>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
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
        {t("download")}
      </Button>
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={t("download")} variant="actions">
        <SheetItem
          label={t("downloadAll")}
          icon="download"
          onPress={later(photos.askDownloadAll)}
        />
        <SheetItem
          label={t("pickSeveral")}
          icon="list-checks"
          onPress={later(photos.startSelecting)}
        />
      </BottomSheet>
    </>
  );
}

function GroupPickItem({ group, photos }: Readonly<GroupPickItemProps>) {
  const viewer = useTranslations(BROWSE_VIEWER_PICK_NAMESPACE);
  const shared = useTranslations(BROWSE_SHARED_NAMESPACE);
  const handleSelect = () => {
    photos.pickSelected(group.id, group.name);
  };
  return (
    <MenuItem
      label={group.name}
      description={viewer("usage", {
        usage: group.usage,
        limit: group.limit,
        unit: group.unit ?? shared("defaultUnit"),
      })}
      icon={ICONS[group.mode]}
      isDisabled={group.status !== "OPEN"}
      onSelect={handleSelect}
    />
  );
}

/** *Pilih untuk…* on the selection: one entry per group with its usage; closed groups disabled (F-20). */
function BulkPickMenu({ photos, groups }: Readonly<PhotosGroupsProps>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  const isDisabled = photos.selectedCount === 0 || photos.isPicking;
  return (
    <MenuTrigger label={t("pickFor")}>
      <Button
        iconLeading="list-checks"
        className="max-md:flex-1"
        isDisabled={isDisabled}
        isPending={photos.isPicking}
      >
        {t("pickFor")}
      </Button>
      <Menu aria-label={t("pickFor")}>
        {groups.map((group) => (
          <GroupPickItem key={group.id} group={group} photos={photos} />
        ))}
      </Menu>
    </MenuTrigger>
  );
}

/** Select mode: *Batal*, *Unduh n foto* and, with groups, *Masukkan ke…* as the main action (F-20, Owner 2026-10-07, option C 2026-10-08). */
export function SelectingActions({ photos, groups }: Readonly<PhotosGroupsProps>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  const count = photos.selectedCount;
  return (
    <div className="flex flex-wrap gap-(--space-2) max-md:w-full">
      <Button variant="secondary" className="max-md:flex-1" onPress={photos.stopSelecting}>
        {t("cancel")}
      </Button>
      <Button
        iconLeading="download"
        variant={groups.length > 0 ? "secondary" : "primary"}
        className="max-md:flex-1"
        isDisabled={count === 0}
        onPress={photos.downloadSelected}
      >
        {t("downloadSelected", { count })}
      </Button>
      {groups.length > 0 ? <BulkPickMenu photos={photos} groups={groups} /> : null}
    </div>
  );
}
