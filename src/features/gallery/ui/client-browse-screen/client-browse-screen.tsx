"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { FolderTileView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Icon } from "@/ui/primitives/icon/icon";
import { Input } from "@/ui/primitives/input/input";

import { ClientBrowseGrid } from "../client-browse-grid/client-browse-grid";
import type { ClientTranslate } from "../client-copy/client-copy.types";
import { ClientShell } from "../client-shell/client-shell";
import type { ClientPageHeader } from "../client-shell/client-shell.types";
import { CLIENT_BROWSE_START, useClientBrowse } from "../use-client-browse/use-client-browse";
import { usePickTargets } from "../use-pick-targets/use-pick-targets";
import { useProofDownloads } from "../use-proof-downloads/use-proof-downloads";
import type { ProofDownloads } from "../use-proof-downloads/use-proof-downloads.types";
import { BrowseViewer } from "./browse-viewer";
import { BROWSE_SHARED_NAMESPACE, CLIENT_BROWSE_COPY_NAMESPACE } from "./client-browse-screen.copy";
import type {
  BrowseCardProps,
  ClientBrowseCardProps,
  ClientBrowseScreenProps,
  PhotosTopProps,
  SearchFieldProps,
} from "./client-browse-screen.types";
import {
  browseCardMeta,
  browseSummary,
  type BrowseTranslate,
  isBrowseEmpty,
} from "./client-browse-text";
import { PhotosHeaderActions, SelectingActions } from "./photos-actions";
import { DownloadAllConfirm, PhotosDownloadStatus } from "./photos-status";

function SearchField({ searchText, onSearch, className }: Readonly<SearchFieldProps>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  return (
    <div className={className}>
      <Input
        variant="search"
        iconLeading="search"
        aria-label={t("searchLabel")}
        placeholder={t("searchPlaceholder")}
        value={searchText}
        onChange={onSearch}
      />
    </div>
  );
}

function Trail({ state, onRoot }: Readonly<Pick<ClientBrowseCardProps, "state" | "onRoot">>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  const summary = browseSummary(t, state);
  if (summary !== null) {
    return (
      <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
        {summary}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-(--space-2) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
      <button
        type="button"
        onClick={onRoot}
        className="font-medium underline-offset-2 hover:underline"
      >
        {t("rootLabel")}
      </button>
      <Icon name="chevron-right" size="sm" aria-hidden="true" />
      <span className="text-(--color-semantic-text-primary)">{browseCardMeta(t, state)}</span>
    </p>
  );
}

function baseHeader(
  t: BrowseTranslate,
  shared: ClientTranslate,
  gate: ClientBrowseScreenProps["gate"],
  token: string,
  isPhotosOnly: boolean,
): ClientPageHeader {
  return {
    title: isPhotosOnly ? gate.projectTitle : shared("allPhotos"),
    subtitle: isPhotosOnly ? t("subtitleNoGroups") : t("subtitle"),
    breadcrumbs: [{ label: shared("home"), href: `/g/${token}` }, { label: shared("allPhotos") }],
    back: { href: `/g/${token}`, label: shared("home") },
  };
}

// F-20: *Unduh ▾* and *Pilih foto* in the header, or the select-mode title and actions; none without photos.
function browseHeader(
  t: BrowseTranslate,
  base: ClientPageHeader,
  photos: ProofDownloads,
  groups: readonly PickGroupView[],
  isEmpty: boolean,
): ClientPageHeader {
  if (isEmpty) return base;
  if (!photos.isSelecting)
    return { ...base, action: <PhotosHeaderActions photos={photos} groups={groups} /> };
  return {
    ...base,
    title: t("selectedTitle", { count: photos.selectedCount }),
    subtitle: undefined,
    action: <SelectingActions photos={photos} groups={groups} />,
  };
}

function BrowseCard({ browse, onOpenPhoto, downloads, isEmpty }: Readonly<BrowseCardProps>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  const { state } = browse;
  const openFolder = (folder: FolderTileView) => {
    const name = folder.name || t("folderFallbackName");
    const trail = [...state.location.trail, name];
    void browse.go({ sourceId: folder.sourceId, path: folder.path, search: "", trail });
  };
  const toRoot = () => {
    void browse.go(CLIENT_BROWSE_START);
  };
  const loadMore = () => {
    void browse.loadMore();
  };
  const search = { searchText: browse.searchText, onSearch: browse.search };
  return (
    <SectionCard
      title={t("cardTitle")}
      description={browseCardMeta(t, state)}
      actions={
        isEmpty ? undefined : <SearchField {...search} className="hidden md:block md:w-[260px]" />
      }
    >
      {isEmpty ? null : <SearchField {...search} className="md:hidden" />}
      {isEmpty ? null : <Trail state={state} onRoot={toRoot} />}
      <ClientBrowseGrid
        state={state}
        onOpenFolder={openFolder}
        onOpenPhoto={onOpenPhoto}
        onLoadMore={loadMore}
        downloads={downloads}
      />
    </SectionCard>
  );
}

// Phones: the Mobile Header has no action slot, so the page actions open the content (as *Hasil akhir*);
// then the download progress or failure (F-20).
function PhotosTop({ photos, groups, isEmpty }: Readonly<PhotosTopProps>) {
  const isMobile = useMobileViewport();
  let phone = null;
  if (isMobile && !isEmpty) {
    phone = photos.isSelecting ? (
      <SelectingActions photos={photos} groups={groups} />
    ) : (
      <PhotosHeaderActions photos={photos} groups={groups} />
    );
  }
  return (
    <>
      {phone}
      <PhotosDownloadStatus photos={photos} />
    </>
  );
}

function useBrowseHeader(
  gate: ClientBrowseScreenProps["gate"],
  token: string,
  isPhotosOnly: boolean,
  photos: ProofDownloads,
  groups: readonly PickGroupView[],
  isEmpty: boolean,
): ClientPageHeader {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  const shared = useTranslations(BROWSE_SHARED_NAMESPACE);
  // Without photos the page reads as *Semua foto* (the design), not the project title.
  const base = baseHeader(t, shared, gate, token, isPhotosOnly && !isEmpty);
  return browseHeader(t, base, photos, groups, isEmpty);
}

/** The client's *Semua foto* page: search, folders, the photo grid and the read-only viewer (klien-3, pratinjau NxnKv, AC-ACC-011/013, A-26, A-31). @param props - gate names, token, whether Beranda holds only this page, the first page and the browse action @returns the page */
export function ClientBrowseScreen({
  gate,
  token,
  isPhotosOnly,
  initialPage,
  browseAction,
  targets,
  pickActions,
  photosActions,
}: Readonly<ClientBrowseScreenProps>) {
  const t = useTranslations(CLIENT_BROWSE_COPY_NAMESPACE);
  const browse = useClientBrowse(browseAction, initialPage);
  const handle = usePickTargets(targets, pickActions);
  const photos = useProofDownloads({ token, actions: photosActions, onPicked: handle.reload });
  const [open, setOpen] = useState<number | null>(null);
  const retry = () => {
    void browse.go(browse.state.location);
  };
  const close = () => {
    setOpen(null);
  };
  const isEmpty = isBrowseEmpty(browse.state);
  const header = useBrowseHeader(gate, token, isPhotosOnly, photos, handle.targets.groups, isEmpty);
  return (
    <ClientShell gate={gate} width="wide" header={header}>
      <PhotosTop photos={photos} groups={handle.targets.groups} isEmpty={isEmpty} />
      {browse.state.hasFailed ? (
        <Alert
          tone="danger"
          title={t("failedTitle")}
          body={t("failedBody")}
          action={{ label: t("retry"), onAction: retry }}
        />
      ) : null}
      <BrowseCard browse={browse} onOpenPhoto={setOpen} downloads={photos} isEmpty={isEmpty} />
      <DownloadAllConfirm photos={photos} />
      <BrowseViewer
        photos={browse.state.photos}
        index={open}
        onIndexChange={setOpen}
        onClose={close}
        handle={handle}
        pickActions={pickActions}
        downloadUrlOf={photos.downloadUrlOf}
      />
    </ClientShell>
  );
}
