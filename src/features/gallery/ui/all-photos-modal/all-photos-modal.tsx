"use client";

import { useTranslations } from "next-intl";

import type { FolderTileView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import { PHOTO_KINDS } from "@/features/gallery/domain/photo-classification/photo-classification";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";
import { Tabs } from "@/ui/patterns/tabs/tabs";
import { Icon } from "@/ui/primitives/icon/icon";

import { BrowseGrid } from "../browse-grid/browse-grid";
import { browseCrumbs, kindVisibility } from "../browse-text/browse-text";
import type { BrowseLocation } from "../browse-text/browse-text.types";
import { BrowseToolbar } from "../browse-toolbar/browse-toolbar";
import { GALLERY_KIND_TAB_MESSAGE_KEY } from "../gallery-copy/gallery-copy.copy";
import { ALL_PHOTOS_MODAL_COPY_NAMESPACE } from "./all-photos-modal.copy";
import type {
  AllPhotosBodyProps,
  AllPhotosModalProps,
  KindSwitchProps,
} from "./all-photos-modal.types";

const COUNT_KEY = { PROOF: "proof", EDITED: "edited", PRINT: "print" } as const;

function KindSwitch({ browse }: Readonly<KindSwitchProps>) {
  const t = useTranslations(ALL_PHOTOS_MODAL_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const { location, page } = browse.state;
  const totals = page?.totals ?? { proof: 0, edited: 0, print: 0 };
  const choose = (kind: string) => {
    const next = PHOTO_KINDS.find((candidate) => candidate === kind);
    if (next)
      void browse.go({
        ...location,
        kind: next,
        path: "",
        sourceId: page?.isSingleSource ? location.sourceId : null,
      });
  };
  if (isMobile) {
    const options = PHOTO_KINDS.map((kind) => ({
      id: kind,
      label: t("segmentLabel", {
        kind: t(GALLERY_KIND_TAB_MESSAGE_KEY[kind]),
        count: totals[COUNT_KEY[kind]],
      }),
    }));
    return (
      <SegmentedControl
        label={t("kindsLabel")}
        options={options}
        selectedId={location.kind}
        onChange={choose}
        isFullWidth
      />
    );
  }
  const tabs = PHOTO_KINDS.map((kind) => ({
    label: t("tabLabel", {
      kind: t(GALLERY_KIND_TAB_MESSAGE_KEY[kind]),
      count: totals[COUNT_KEY[kind]],
    }),
    isActive: location.kind === kind,
    onPress: () => {
      choose(kind);
    },
  }));
  return <Tabs label={t("kindsLabel")} tabs={tabs} />;
}

function AllPhotosBody({ workspaceId, page, browse, onOpenPhoto }: Readonly<AllPhotosBodyProps>) {
  const t = useTranslations(ALL_PHOTOS_MODAL_COPY_NAMESPACE);
  const { location } = browse.state;
  const source = page.sources.find((candidate) => candidate.id === location.sourceId);
  const handleOpenFolder = (folder: FolderTileView) => {
    void browse.go({ ...location, sourceId: folder.sourceId, path: folder.path });
  };
  const handleNavigate = (target: BrowseLocation) => {
    void browse.go(target);
  };
  const handleLoadMore = () => {
    void browse.loadMore();
  };
  return (
    <div className="flex flex-col gap-(--space-4)">
      <KindSwitch browse={browse} />
      <BrowseToolbar
        location={location}
        page={browse.state.page}
        crumbs={browseCrumbs(t, location, source?.name ?? null)}
        searchText={browse.searchText}
        onSearch={browse.search}
        onNavigate={handleNavigate}
      />
      {location.search === "" ? (
        <p className="flex items-start gap-(--space-2) text-(length:--font-size-body-sm) text-(--component-photo-tile-meta)">
          <Icon
            name={location.kind === "PROOF" ? "eye" : "eye-off"}
            size="sm"
            aria-hidden="true"
            className="mt-(--space-0-5) shrink-0"
          />
          {kindVisibility(t, location.kind, page.gallery.state)}
        </p>
      ) : null}
      <BrowseGrid
        workspaceId={workspaceId}
        state={browse.state}
        onOpenFolder={handleOpenFolder}
        onOpenPhoto={onOpenPhoto}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}

/** *Semua foto*: tabs by kind, Drive-like folders, search and infinite scroll in a wide modal, full screen on phones (AC-GAL-014, 028–030). */
export function AllPhotosModal(props: Readonly<AllPhotosModalProps>) {
  const t = useTranslations(ALL_PHOTOS_MODAL_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const { counts } = props.page.gallery;
  const totals = t("photoCounts", { proof: counts.proof, finished: counts.edited + counts.print });
  const body = (
    <AllPhotosBody
      workspaceId={props.workspaceId}
      page={props.page}
      browse={props.browse}
      onOpenPhoto={props.onOpenPhoto}
    />
  );
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={t("allPhotosTitle")}
        meta={totals}
        variant="form"
        isFullHeight
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={t("allPhotosTitle")}
      description={t("allPhotosDescription", { project: props.page.project.title, totals: totals })}
      size="xl"
    >
      {body}
    </Modal>
  );
}
