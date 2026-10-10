"use client";

import { useState } from "react";

import type { FolderTileView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Icon } from "@/ui/primitives/icon/icon";
import { Input } from "@/ui/primitives/input/input";

import { ClientBrowseGrid } from "../client-browse-grid/client-browse-grid";
import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { ClientShell } from "../client-shell/client-shell";
import type { ClientPageHeader } from "../client-shell/client-shell.types";
import { CLIENT_BROWSE_START, useClientBrowse } from "../use-client-browse/use-client-browse";
import { usePickTargets } from "../use-pick-targets/use-pick-targets";
import { useProofDownloads } from "../use-proof-downloads/use-proof-downloads";
import type { ProofDownloads } from "../use-proof-downloads/use-proof-downloads.types";
import { BrowseViewer } from "./browse-viewer";
import { CLIENT_BROWSE_COPY as COPY } from "./client-browse-screen.copy";
import type {
  BrowseCardProps,
  ClientBrowseCardProps,
  ClientBrowseScreenProps,
  SearchFieldProps,
} from "./client-browse-screen.types";
import { browseCardMeta, browseSummary } from "./client-browse-text";
import { PhotosHeaderActions, SelectingActions } from "./photos-actions";
import type { PhotosGroupsProps } from "./photos-actions.types";
import { DownloadAllConfirm, PhotosDownloadStatus } from "./photos-status";

function SearchField({ searchText, onSearch, className }: Readonly<SearchFieldProps>) {
  return (
    <div className={className}>
      <Input
        variant="search"
        iconLeading="search"
        aria-label={COPY.searchLabel}
        placeholder={COPY.searchPlaceholder}
        value={searchText}
        onChange={onSearch}
      />
    </div>
  );
}

function Trail({ state, onRoot }: Readonly<Pick<ClientBrowseCardProps, "state" | "onRoot">>) {
  const summary = browseSummary(state);
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
        {COPY.rootLabel}
      </button>
      <Icon name="chevron-right" size="sm" aria-hidden="true" />
      <span className="text-(--color-semantic-text-primary)">{browseCardMeta(state)}</span>
    </p>
  );
}

function baseHeader(
  gate: ClientBrowseScreenProps["gate"],
  token: string,
  hasHome: boolean,
): ClientPageHeader {
  if (!hasHome) {
    return {
      title: gate.projectTitle,
      subtitle: COPY.subtitleNoGroups,
      breadcrumbs: [{ label: CLIENT_COPY.allPhotos }],
    };
  }
  return {
    title: CLIENT_COPY.allPhotos,
    subtitle: COPY.subtitle,
    breadcrumbs: [
      { label: CLIENT_COPY.home, href: `/g/${token}` },
      { label: CLIENT_COPY.allPhotos },
    ],
    back: { href: `/g/${token}`, label: CLIENT_COPY.home },
  };
}

// F-20: *Unduh ▾* and *Pilih foto* in the header, or the select-mode title and actions.
function browseHeader(
  base: ClientPageHeader,
  photos: ProofDownloads,
  groups: readonly PickGroupView[],
): ClientPageHeader {
  if (!photos.isSelecting)
    return { ...base, action: <PhotosHeaderActions photos={photos} groups={groups} /> };
  return {
    ...base,
    title: COPY.selectedTitle(photos.selectedCount),
    subtitle: undefined,
    action: <SelectingActions photos={photos} groups={groups} />,
  };
}

function BrowseCard({ browse, onOpenPhoto, downloads }: Readonly<BrowseCardProps>) {
  const { state } = browse;
  const openFolder = (folder: FolderTileView) => {
    const name = folder.name || COPY.folderFallbackName;
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
      title={COPY.cardTitle}
      description={browseCardMeta(state)}
      actions={<SearchField {...search} className="hidden md:block md:w-[260px]" />}
    >
      <SearchField {...search} className="md:hidden" />
      <Trail state={state} onRoot={toRoot} />
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
function PhotosTop({ photos, groups }: Readonly<PhotosGroupsProps>) {
  const isMobile = useMobileViewport();
  let phone = null;
  if (isMobile) {
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

/** The client's *Semua foto* page: search, folders, the photo grid and the read-only viewer (klien-3, pratinjau NxnKv, AC-ACC-011/013, A-26, A-31). @param props - gate names, token, whether Beranda exists, the first page and the browse action @returns the page */
export function ClientBrowseScreen({
  gate,
  token,
  hasHome,
  initialPage,
  browseAction,
  targets,
  pickActions,
  photosActions,
}: Readonly<ClientBrowseScreenProps>) {
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
  return (
    <ClientShell
      gate={gate}
      width="wide"
      header={browseHeader(baseHeader(gate, token, hasHome), photos, handle.targets.groups)}
    >
      <PhotosTop photos={photos} groups={handle.targets.groups} />
      {browse.state.hasFailed ? (
        <Alert
          tone="danger"
          title={COPY.failedTitle}
          body={COPY.failedBody}
          action={{ label: COPY.retry, onAction: retry }}
        />
      ) : null}
      <BrowseCard browse={browse} onOpenPhoto={setOpen} downloads={photos} />
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
